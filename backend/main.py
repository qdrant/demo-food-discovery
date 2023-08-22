import os
from typing import List

import logging

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles

from qdrant_client.http.exceptions import UnexpectedResponse
from starlette.middleware.cors import CORSMiddleware

from discovery import (
    handle_text_search,
    choose_random_points,
    handle_negative_ids,
    recommend_by_ids,
)
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


@app.post("/api/search")
def search(search_query: SearchQuery) -> List[Product]:
    """
    Search for products by ids of the liked and disliked products.
    :param search_query: search query parameters
    :return:
    """
    positive = search_query.positive or []
    negative = search_query.negative or []

    try:
        if search_query.query:
            # If a text query is provided, search for the products by the query
            points = handle_text_search(search_query)
        elif len(positive) == 0 and len(negative) == 0:
            # If no ids are provided, return random products
            points = choose_random_points(search_query)
        elif len(positive) == 0 and len(negative) > 0:
            # If only disliked products are provided, we cannot use the recommendation
            # API directly, so it has to be handled separately
            points = handle_negative_ids(search_query)
        else:
            # Search for the products similar to the liked ones and dissimilar to the
            # disliked ones
            points = recommend_by_ids(search_query)

        return [
            Product(
                id=point.id,
                name=point.payload["name"],
                description=point.payload["description"],
                image_url=point.payload["image"],
                payload=point.payload,
            )
            for point in points
        ]
    except UnexpectedResponse as e:
        # Handle the case when Qdrant returns an error and convert it to an exception
        # that FastAPI will understand and return to the client
        logger.error("Could not perform search: %s", e)
        raise HTTPException(status_code=500, detail=e.reason_phrase)


# Mount the static files directory once the search endpoint is defined
static_dir = os.path.join(settings.BACKEND_DIR, "build")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True))
