import os
from typing import List

import logging

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from qdrant_client import QdrantClient

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


# Mount the static files directory once the search endpoint is defined
static_dir = os.path.join(settings.BACKEND_DIR, "build")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True))
