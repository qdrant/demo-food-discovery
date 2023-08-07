import itertools
import numpy as np

from typing import List

from qdrant_client import QdrantClient, models
from qdrant_client.http.exceptions import UnexpectedResponse
from sentence_transformers import SentenceTransformer

import settings

from models import SearchQuery

# Create a client to interact with Qdrant
client = QdrantClient(
    settings.QDRANT_URL,
    api_key=settings.QDRANT_API_KEY,
    timeout=30,
)

# Load the embeddings model
model = SentenceTransformer("clip-ViT-B-32", device="cpu", cache_folder="/models_cache")


def handle_text_search(search_query: SearchQuery):
    query_vector = model.encode(search_query.query).tolist()
    return client.search(
        settings.QDRANT_COLLECTION,
        query_vector=query_vector,
        limit=search_query.limit,
    )


def choose_random_points(search_query: SearchQuery):
    """
    Generate some random points in the vector space and then search for the nearest
    neighbors of these points in the collection. Each random point generated just one
    result, so the diversity of the results is better.
    :param limit: number of items to return
    :return:
    """
    try:
        # Retrieve the collection info to know the dimension of the vectors
        collection_info = client.get_collection(settings.QDRANT_COLLECTION)
        vector_size = collection_info.config.params.vectors.size
    except UnexpectedResponse:
        # If the collection does not exist, return an empty list of points
        return []

    random_points = 2.0 * np.random.random((search_query.limit, vector_size)) - 1.0

    results = client.search_batch(
        settings.QDRANT_COLLECTION,
        requests=[
            models.SearchRequest(vector=point.tolist(), limit=1, with_payload=True)
            for point in random_points
        ],
    )

    points = itertools.chain.from_iterable(results)
    return points


def handle_negative_ids(search_query: SearchQuery):
    disliked_points, _ = client.scroll(
        settings.QDRANT_COLLECTION,
        scroll_filter=models.Filter(
            must=[
                models.HasIdCondition(has_id=search_query.negative),
            ]
        ),
        with_vectors=True,
    )

    disliked_vectors = np.array([point.vector for point in disliked_points])
    mean_vector = np.mean(disliked_vectors, axis=0)
    negated_vector = -mean_vector

    return client.search(
        settings.QDRANT_COLLECTION,
        query_vector=negated_vector.tolist(),
        limit=search_query.limit,
    )


def recommend_by_ids(search_query: SearchQuery):
    return client.recommend(
        settings.QDRANT_COLLECTION,
        positive=search_query.positive,
        negative=search_query.negative,
        limit=search_query.limit,
    )
