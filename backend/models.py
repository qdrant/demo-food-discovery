from typing import Optional, List

from pydantic import BaseModel

import settings


class Location(BaseModel):
    latitude: float
    longitude: float


class SearchQuery(BaseModel):
    query: Optional[str] = None
    location: Optional[Location] = None
    positive: Optional[List[str]] = None
    negative: Optional[List[str]] = None
    limit: int = settings.DEFAULT_LIMIT



class Product(BaseModel):
    id: str
    name: str
    description: str
    image_url: str
