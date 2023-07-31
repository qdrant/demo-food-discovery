from typing import List

import logging
import uvicorn

from fastapi import FastAPI, HTTPException
from qdrant_client import QdrantClient
from qdrant_client.http.exceptions import UnexpectedResponse
from starlette.middleware.cors import CORSMiddleware

from models import Product

import settings

logger = logging.getLogger(__name__)

# Create a client to interact with Qdrant
client = QdrantClient(
    settings.QDRANT_URL,
    api_key=settings.QDRANT_API_KEY,
)

# Retrieve the collection info to know the dimension of the vectors
collection_info = client.get_collection(settings.QDRANT_COLLECTION)

# Create a FastAPI app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/search")
def search(
    positive: List[str], negative: List[str], limit: int = settings.DEFAULT_LIMIT
) -> List[Product]:
    """
    Search for products by ids of the liked and disliked products.
    :param positive: ids of the liked products
    :param negative: ids of the disliked products
    :param limit: number of products to return
    :return:
    """
    limit = min(limit, settings.MAX_SEARCH_LIMIT)
    try:
        if len(positive) == 0 and len(negative) == 0:
            # TODO: return some random points
            points, _ = client.scroll(
                settings.QDRANT_COLLECTION,
                limit=limit,
            )
        elif len(positive) == 0 and len(negative) > 0:
            # TODO: handle a case when only negative ids are provided
            #       It means we need to negate the negative id vectors and search for
            #       the closest ones
            points = []
        else:
            points = client.recommend(
                settings.QDRANT_COLLECTION,
                positive=positive,
                negative=negative,
                limit=limit,
            )

        return [
            Product(
                id=point.id,
                name=point.payload["name"],
                description=point.payload["description"],
                image_url=point.payload["image"],
            )
            for point in points
        ]
    except UnexpectedResponse as e:
        # Handle the case when Qdrant returns an error and convert it to an exception
        # that FastAPI will understand and return to the client
        raise HTTPException(status_code=500, detail=e.reason_phrase)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
