from fastapi import APIRouter, HTTPException
from app.database import engine
from app.schemas.user import UserCreate
from sqlalchemy import insert
from sqlalchemy.exc import SQLAlchemyError
from app.models.user import User


router = APIRouter(tags=["User"])

@router.post("/create-account")
def create_account(data: UserCreate):
    try:
        query = insert(User).values(
            name = data.name,
            email = data.email,
            password_hash = data.password,
            is_active = True,
        )

        with engine.begin() as connection:
            connection.execute(query)


    except SQLAlchemyError:
        raise HTTPException(status_code= 500, detail="Error")