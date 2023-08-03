import os
from typing import List

import logging

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles

from qdrant_client.http.exceptions import UnexpectedResponse
from starlette.middleware.cors import CORSMiddleware

from dicovery import choose_random_points, handle_negative_ids, recommend_by_ids
from models import Product

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

static_dir = os.path.join(settings.BACKEND_DIR, 'build')

if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True))


@app.post("/api/search")
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
    logger.debug(
        "Search request: positive=%s, negative=%s, limit=%d", positive, negative, limit
    )
    try:
        if len(positive) == 0 and len(negative) == 0:
            # If no ids are provided, return random products
            points = choose_random_points(limit)
        elif len(positive) == 0 and len(negative) > 0:
            # If only disliked products are provided, we cannot use the recommendation
            # API directly, so it has to be handled separately
            points = handle_negative_ids(negative, limit)
        else:
            # Search for the products similar to the liked ones and dissimilar to the
            # disliked ones
            points = recommend_by_ids(positive, negative, limit)

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
