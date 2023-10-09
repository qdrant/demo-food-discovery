import abc
import itertools
import logging
import random
import numpy as np
from typing import List

from qdrant_client import QdrantClient, models
from sentence_transformers import SentenceTransformer

import settings
from models import SearchQuery, Location, Product

logger = logging.getLogger(__name__)


class BaseDiscoveryStrategy(abc.ABC):
    """
    A base class for the search strategies. A strategy has to support multiple scenarios
    such as: random sampling, text search, recommendations based on positive and
    negative examples (including edge cases when there are only positives or only
    negatives provided).
    """

    def __init__(
        self, embedding_model: SentenceTransformer, qdrant_client: QdrantClient
    ):
        self.embedding_model = embedding_model
        self.qdrant_client = qdrant_client

    def handle(self, search_query: SearchQuery) -> List[Product]:
        positive = search_query.positive or []
        negative = search_query.negative or []
        queries = search_query.queries or []

        if len(positive) + len(negative) + len(queries) == 0:
            # If no ids are provided, return random products
            points = self._choose_random_points(search_query)
        else:
            # Search for the products similar to the liked ones and dissimilar to the
            # disliked ones
            points = self._recommend(search_query)

        return [Product.from_point(point) for point in points]

    def _choose_random_points(self, search_query: SearchQuery):
        """
        Choose some random points from the vector space and then search for the nearest
        neighbors of these points in the collection. Each random point generated just one
        result, so the diversity of the results is better.
        :param search_query: search query
        :return:
        """
        max_points = 100_000  # We can get points from an actual collection

        random_points = []
        # ToDo: replace with sample API as soon as it is implemented
        while len(random_points) < search_query.limit:
            random_points_ids = [
                random.randint(0, max_points)
                for _ in range(search_query.limit * 2 - len(random_points))
            ]
            # Check that points actually exist in the collection
            random_points += [
                point.id
                for point in random.sample(
                    self.qdrant_client.retrieve(
                        collection_name=settings.QDRANT_COLLECTION,
                        ids=random_points_ids,
                        with_payload=False,
                        with_vectors=False,
                    ),
                    search_query.limit - len(random_points),
                )
            ]

        query_filter = (
            self._create_location_filter(search_query.location)
            if search_query.location is not None
            else None
        )
        results = self.qdrant_client.recommend_batch(
            settings.QDRANT_COLLECTION,
            requests=[
                models.RecommendRequest(
                    positive=[point], filter=query_filter, limit=1, with_payload=True
                )
                for point in random_points
            ],
        )

        points = itertools.chain.from_iterable(results)
        return points

    def _recommend(self, search_query: SearchQuery):
        raise NotImplementedError

    def _create_location_filter(self, location: Location) -> models.Filter:
        """
        Create a Qdrant filter to search for the points within the specified radius from
        the specified location.
        :param location:
        :return:
        """
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
                    ),
                )
            ]
        )


class AverageVectorStrategy(BaseDiscoveryStrategy):
    """
    A basic search strategy that uses the old recommendation API of Qdrant. It is based
    on the average vector of the liked/disliked items.

    See: https://qdrant.tech/documentation/concepts/search/#recommendation-api
    """

    def _recommend(self, search_query: SearchQuery):
        """
        Use Qdrant Recommendation API to find the nearest neighbors of the liked and
        disliked items.

        Internally, this function uses the group recommendation API to find the items coming
        from different restaurants. Records are grouped by `cafe.slug` field, which is a
        unique identifier of the restaurant.

        :param search_query: search query
        :return:
        """
        queries = search_query.queries or []
        query_vectors = self.embedding_model.encode(queries).tolist()
        positive = (search_query.positive or []) + query_vectors
        negative = search_query.negative or []

        if len(positive) == 0 and len(negative) > 0:
            # If only disliked products are provided, we cannot use the recommendation
            # API directly, so it has to be handled separately
            return self._handle_negative_ids(search_query)

        query_filter = (
            self._create_location_filter(search_query.location)
            if search_query.location is not None
            else None
        )
        response = self.qdrant_client.recommend_groups(
            settings.QDRANT_COLLECTION,
            positive=positive,
            negative=negative,
            strategy=search_query.strategy,
            group_by=settings.GROUP_BY_FIELD,
            query_filter=query_filter,
            limit=search_query.limit,
        )
        return list(
            itertools.chain.from_iterable([group.hits for group in response.groups])
        )

    def _handle_negative_ids(self, search_query: SearchQuery):
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
        disliked_points, _ = self.qdrant_client.scroll(
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
            self._create_location_filter(search_query.location)
            if search_query.location is not None
            else None
        )
        response = self.qdrant_client.search_groups(
            settings.QDRANT_COLLECTION,
            query_vector=negated_vector.tolist(),
            group_by=settings.GROUP_BY_FIELD,
            query_filter=query_filter,
            limit=search_query.limit,
        )
        return list(
            itertools.chain.from_iterable([group.hits for group in response.groups])
        )


class BestScoreStrategy(BaseDiscoveryStrategy):
    """
    A strategy based on the new recommendation API of Qdrant. It allows using a single
    negative example as well.
    """

    def _recommend(self, search_query: SearchQuery):
        """
        Use Qdrant Recommendation API to find the nearest neighbors of the liked and
        disliked items. Additionally, converts all the text queries to vectors and adds
        them to the positive examples.
        :param search_query:
        :return:
        """
        queries = search_query.queries or []
        query_vectors = self.embedding_model.encode(queries).tolist()
        query_filter = (
            self._create_location_filter(search_query.location)
            if search_query.location is not None
            else None
        )
        response = self.qdrant_client.recommend_groups(
            settings.QDRANT_COLLECTION,
            positive=(search_query.positive + query_vectors),
            negative=search_query.negative,
            strategy=search_query.strategy,
            group_by=settings.GROUP_BY_FIELD,
            query_filter=query_filter,
            limit=search_query.limit,
        )
        return list(
            itertools.chain.from_iterable([group.hits for group in response.groups])
        )
