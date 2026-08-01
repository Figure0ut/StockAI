from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# DATABASE URL
SQLALCHEMY_DATABASE_URL = "sqlite:///./stockai.db"

# ENGINE CREATION
engine = create_engine (
    SQLALCHEMY_DATABASE_URL, connect_args = { "check_same_thread": False }
)

# SESSION FOR DATABASE
SessionLocal = sessionmaker(autocommit=False, autoFlush=False, bind=engine)

# DATABASE DECLARATION
Base = declarative_base()