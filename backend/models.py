from typing import Optional, List, Union

from pydantic import BaseModel, Field
from qdrant_client.http.models import RecommendStrategy

import settings


ProductId = Union[int, str]


class Location(BaseModel):
    latitude: float
    longitude: float


class LocationFilter(Location):
    radius_km: float


class SearchQuery(BaseModel):
    query: Optional[str] = None
    location: Optional[LocationFilter] = None
    positive: Optional[List[ProductId]] = None
    negative: Optional[List[ProductId]] = None
    limit: int = Field(settings.DEFAULT_LIMIT, ge=1, le=settings.MAX_SEARCH_LIMIT)
    strategy: RecommendStrategy = RecommendStrategy.BEST_SCORE


class Restaurant(BaseModel):
    name: str
    rating: Optional[float]
    location: Location
    slug: Optional[str] = None
    address: Optional[str] = None


class Product(BaseModel):
    id: ProductId
    name: str
    description: str
    image_url: str
    restaurant: Restaurant
    payload: dict

    @classmethod
    def from_point(cls, point) -> "Product":
        location = Location(
            latitude=point.payload["cafe"]["location"]["lat"],
            longitude=point.payload["cafe"]["location"]["lon"],
        )
        restaurant = Restaurant(
            name=point.payload["cafe"]["name"],
            rating=point.payload["cafe"]["rating"],
            location=location,
            slug=point.payload["cafe"]["slug"],
            address=point.payload["cafe"]["address"],
        )
        return Product(
            id=point.id,
            name=point.payload["name"],
            description=point.payload["description"],
            image_url=point.payload["image"],
            restaurant=restaurant,
            payload=point.payload,
        )
