import itertools
import numpy as np

from typing import List

from qdrant_client import QdrantClient, models

import settings

# Create a client to interact with Qdrant
client = QdrantClient(
    settings.QDRANT_URL,
    api_key=settings.QDRANT_API_KEY,
)

# Retrieve the collection info to know the dimension of the vectors
collection_info = client.get_collection(settings.QDRANT_COLLECTION)


def choose_random_points(limit: int):
    """
    Generate some random points in the vector space and then search for the nearest
    neighbors of these points in the collection. Each random point generated just one
    result, so the diversity of the results is better.
    :param limit:
    :return:
    """
    vector_size = collection_info.config.params.vectors.size

    random_points = 2.0 * np.random.random((limit, vector_size)) - 1.0

    results = client.search_batch(
        settings.QDRANT_COLLECTION,
        requests=[
            models.SearchRequest(vector=point.tolist(), limit=1, with_payload=True)
            for point in random_points
        ],
    )

    points = itertools.chain.from_iterable(results)
    return points


def handle_negative_ids(negative: List[str], limit: int):
    disliked_points, _ = client.scroll(
        settings.QDRANT_COLLECTION,
        scroll_filter=models.Filter(
            must=[
                models.HasIdCondition(has_id=negative),
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
        limit=limit,
    )


def recommend_by_ids(positive: List[str], negative: List[str], limit: int):
    return client.recommend(
        settings.QDRANT_COLLECTION,
        positive=positive,
        negative=negative,
        limit=limit,
    )
