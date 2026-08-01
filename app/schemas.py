from pydantic import BaseModel, Field

class ItemBase(BaseModel):
    name: str
    quantity: int = Field(default=0, ge=0)
    price: float = Field(default=0.0, ge=0.0)
    category: str = Field(min_length=1)

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int

    class Config: 
        from_attributes = True