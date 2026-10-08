import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import URL, create_engine
from sqlalchemy.orm import DeclarativeBase

load_dotenv(Path(__file__).parent.parent / ".env")

database_password = os.getenv("DB_PASSWORD")

database_url = URL.create(
    drivername="postgresql+psycopg",
    username=os.getenv("DB_USER", "bityadav"),
    password=database_password,
    host=os.getenv("DB_HOST", "localhost"),
    port=os.getenv("DB_PORT", 5432),
    database=os.getenv("DB_NAME", "bityadav")
)

engine = create_engine(database_url) if database_password else None

class Base(DeclarativeBase):
    pass