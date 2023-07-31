from pydantic import BaseModel


class Product(BaseModel):
    id: str
    name: str
    description: str
    image_url: str
