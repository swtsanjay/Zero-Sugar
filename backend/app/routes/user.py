from fastapi import APIRouter, HTTPException
from app.schemas.user import UserCreate
from app.repository.user import create_user


router = APIRouter(tags=["User"])

@router.post("/create-account")
def create_account(data: UserCreate):
    try:
        return create_user(data.name, data.email, data.password)
    except Exception:
        raise HTTPException(status_code= 500, detail="Error")