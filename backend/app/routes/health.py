from fastapi import APIRouter, HTTPException
from app.database import engine
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/database-health")
def database_health():
    if engine is None:
        raise HTTPException(status_code=500, detail="DB_PASSWORD is not configured")

    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except SQLAlchemyError:
        raise HTTPException(status_code=503, detail="Database connection failed")

    return {"status": "ok", "database": "connected"}