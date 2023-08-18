from typing import Optional, List, Union

from pydantic import BaseModel, Field

import settings


ProductId = Union[int, str]


class Location(BaseModel):
    latitude: float
    longitude: float
    radius_km: float


class SearchQuery(BaseModel):
    query: Optional[str] = None
    location: Optional[Location] = None
    positive: Optional[List[ProductId]] = None
    negative: Optional[List[ProductId]] = None
    limit: int = Field(settings.DEFAULT_LIMIT, ge=1, le=settings.MAX_SEARCH_LIMIT)


class Product(BaseModel):
    id: ProductId
    name: str
    description: str
    image_url: str
    payload: dict
