import itertools
import numpy as np

from qdrant_client import QdrantClient, models
from qdrant_client.http.exceptions import UnexpectedResponse
from sentence_transformers import SentenceTransformer

import settings

from models import SearchQuery, Location

# Create a client to interact with Qdrant
client = QdrantClient(
    settings.QDRANT_URL,
    api_key=settings.QDRANT_API_KEY,
    timeout=60,
)

# Load the embeddings model
model = SentenceTransformer("clip-ViT-B-32", device="cpu", cache_folder="./models_cache")


def create_location_filter(location: Location) -> models.Filter:
    return models.Filter(
        must=[
            models.FieldCondition(
                key="cafe.location",
                geo_radius=models.GeoRadius(
                    center=models.GeoPoint(
                        lon=location.longitude,
                        lat=location.latitude,
                    ),
                    radius=location.radius_km * 1000,
                )
            )
        ]
    )


def handle_text_search(search_query: SearchQuery):
    """
    Perform text search in the collection. Internally it uses the group search API of
    Qdrant and groups the results by the `cafe.slug` field. It allows to retrieve more
    diverse results.
    :param search_query: search query
    :return:
    """
    query_vector = model.encode(search_query.query).tolist()
    query_filter = (
        create_location_filter(search_query.location)
        if search_query.location is not None
        else None
    )
    response = client.search_groups(
        settings.QDRANT_COLLECTION,
        query_vector=query_vector,
        group_by=settings.GROUP_BY_FIELD,
        query_filter=query_filter,
        limit=search_query.limit,
    )
    return list(
        itertools.chain.from_iterable([group.hits for group in response.groups])
    )


def choose_random_points(search_query: SearchQuery):
    """
    Generate some random points in the vector space and then search for the nearest
    neighbors of these points in the collection. Each random point generated just one
    result, so the diversity of the results is better.
    :param search_query: search query
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

    query_filter = (
        create_location_filter(search_query.location)
        if search_query.location is not None
        else None
    )
    results = client.search_batch(
        settings.QDRANT_COLLECTION,
        requests=[
            models.SearchRequest(
                vector=point.tolist(), filter=query_filter, limit=1, with_payload=True
            )
            for point in random_points
        ],
    )

    points = itertools.chain.from_iterable(results)
    return points


def handle_negative_ids(search_query: SearchQuery):
    """
    Search for the nearest neighbors of the negated mean vector of the disliked items.
    This is required since Qdrant Recommendation API needs at least one positive
    example.

    Internally, this function uses the group search API to find the items coming from
    different restaurants. Records are grouped by `cafe.slug` field, which is a unique
    identifier of the restaurant.

    :param search_query: search query
    :return:
    """
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

    query_filter = (
        create_location_filter(search_query.location)
        if search_query.location is not None
        else None
    )
    response = client.search_groups(
        settings.QDRANT_COLLECTION,
        query_vector=negated_vector.tolist(),
        group_by=settings.GROUP_BY_FIELD,
        query_filter=query_filter,
        limit=search_query.limit,
    )
    return list(
        itertools.chain.from_iterable([group.hits for group in response.groups])
    )


def recommend_by_ids(search_query: SearchQuery):
    """
    Use Qdrant Recommendation API to find the nearest neighbors of the liked and
    disliked items.

    Internally, this function uses the group recommendation API to find the items coming
    from different restaurants. Records are grouped by `cafe.slug` field, which is a
    unique identifier of the restaurant.

    :param search_query: search query
    :return:
    """
    query_filter = (
        create_location_filter(search_query.location)
        if search_query.location is not None
        else None
    )
    response = client.recommend_groups(
        settings.QDRANT_COLLECTION,
        positive=search_query.positive,
        negative=search_query.negative,
        group_by=settings.GROUP_BY_FIELD,
        query_filter=query_filter,
        limit=search_query.limit,
    )
    return list(
        itertools.chain.from_iterable([group.hits for group in response.groups])
    )
