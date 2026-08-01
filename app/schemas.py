from pydantic import BaseModel

class ItemBase(BaseModel):
    nombre: str
    cantidad: int
    precio: float
    categoria: str

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int

    class Config: 
        from_attributes = True