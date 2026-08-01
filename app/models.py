from sqlalchemy import Column, Integer, String, Float
from app.database import Base

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    cantidad = Column(Integer, default=0)
    precio = Column(Float, default=0.0)
    categoria = Column(String, index=True)
    
