from typing import Optional, List

from pydantic import BaseModel, Field

import settings


class Location(BaseModel):
    latitude: float
    longitude: float


class SearchQuery(BaseModel):
    query: Optional[str] = None
    location: Optional[Location] = None
    positive: Optional[List[str]] = None
    negative: Optional[List[str]] = None
    limit: int = Field(settings.DEFAULT_LIMIT, ge=1, le=settings.MAX_SEARCH_LIMIT)


class Product(BaseModel):
    id: str
    name: str
    description: str
    image_url: str
