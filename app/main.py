import os
import google.generativeai as genai
from google.generativeai import types
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import engine, SessionLocal

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("API Key not found. Please check .env file.")
else:
    genai.configure(api_key=api_key)

models.Base.metadata.create_all(bind=engine)

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://stock-ai-phi-beryl.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return { "message" : "STOCKAI API is running" }

@app.post("/items", response_model=schemas.Item)
def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    db_item = models.Item(
        name=item.name,
        quantity=item.quantity,
        price=item.price,
        category=item.category
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# GET All Items
@app.get("/items", response_model=list[schemas.Item])
def read_items(db: Session = Depends(get_db)):
    items = db.query(models.Item).all()
    return items

# GET Through Item ID
@app.get("/items/{item_id}", response_model=schemas.Item)
def read_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

@app.put("/items/{item_id}", response_model=schemas.Item)
def update_item(item_id: int, item: schemas.ItemCreate, db: Session = Depends(get_db)):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db_item.name = item.name
    db_item.quantity = item.quantity
    db_item.price = item.price
    db_item.category = item.category
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/items/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return { "message" : "Item deleted successfully" }

@app.post("/analyze-stock")
def analyze_stock(db: Session = Depends(get_db)):
    items = db.query(models.Item).all()
    if not items:
        raise HTTPException(status_code=404, detail="No items found in the database")

    stock_data = [
        {
            "name": item.name,
            "quantity": item.quantity,
            "price": item.price,
            "category": item.category
        }
        for item in items
    ]

    prompt = f"Act as a supply chain expert. Analyze this inventory data and provide a concise, high-impact strategic summary in maximum 3 bullet points:\n{stock_data}"

    model = genai.GenerativeModel('gemini-flash-latest')
    
    response = model.generate_content(
        prompt, 
    )

    return { "analysis" : response.text }