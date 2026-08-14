import os
from collections import defaultdict
from typing import List

import logging

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from qdrant_client import QdrantClient, models

from qdrant_client.http.exceptions import UnexpectedResponse
from qdrant_client.http.models import RecommendStrategy
from sentence_transformers import SentenceTransformer
from starlette.middleware.cors import CORSMiddleware

from discovery import AverageVectorStrategy, BestScoreStrategy
from models import SearchQuery, Product

import settings

logger = logging.getLogger(__name__)


# Create a FastAPI app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a client to interact with Qdrant
client = QdrantClient(
    settings.QDRANT_URL,
    api_key=settings.QDRANT_API_KEY,
    prefer_grpc=True,
)

# Load the embeddings model
model = SentenceTransformer(
    "clip-ViT-B-32", device="cpu", cache_folder="./models_cache"
)

# Map each search strategy to the corresponding class
strategy_mapping = {
    RecommendStrategy.AVERAGE_VECTOR: AverageVectorStrategy,
    RecommendStrategy.BEST_SCORE: BestScoreStrategy,
}


@app.post("/api/search")
def search(search_query: SearchQuery) -> List[Product]:
    """
    Search for products by ids of the liked and disliked products.
    :param search_query: search query parameters
    :return:
    """
    try:
        strategy_cls = strategy_mapping.get(search_query.strategy)
        strategy = strategy_cls(model, client)
        return strategy.handle(search_query)
    except UnexpectedResponse as e:
        # Handle the case when Qdrant returns an error and convert it to an exception
        # that FastAPI will understand and return to the client
        logger.error("Could not perform search: %s", e)
        raise HTTPException(status_code=500, detail=e.reason_phrase)


# Cache the sampled coverage map — it's static-ish and the sample is a bit costly.
_locations_cache = None


@app.get("/api/locations")
def locations(sample: int = 3000):
    """A coarse map of where the dataset actually has dishes: sample random points
    and bucket their restaurant coordinates into a ~0.1 degree grid. Lets the
    frontend draw an honest coverage preview instead of guessing cities."""
    global _locations_cache
    if _locations_cache is not None:
        return _locations_cache
    try:
        res = client.query_points(
            collection_name=settings.QDRANT_COLLECTION,
            query=models.SampleQuery(sample=models.Sample.RANDOM),
            limit=max(100, min(sample, 5000)),
            with_payload=models.PayloadSelectorInclude(include=["cafe.location"]),
            with_vectors=False,
        )
        cells = defaultdict(int)
        for p in res.points:
            loc = ((p.payload or {}).get("cafe") or {}).get("location") or {}
            lat, lon = loc.get("lat"), loc.get("lon")
            if lat is None or lon is None:
                continue
            cells[(round(lat, 1), round(lon, 1))] += 1
        points = [{"lat": k[0], "lon": k[1], "count": v} for k, v in cells.items()]
        _locations_cache = {"points": points, "sampled": len(res.points)}
        return _locations_cache
    except Exception as e:
        logger.error("Could not sample locations: %s", e)
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)[:200]}")


# Mount the static files directory once the search endpoint is defined
static_dir = os.path.join(settings.BACKEND_DIR, "build")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True))
