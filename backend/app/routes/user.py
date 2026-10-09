from fastapi import APIRouter, HTTPException, Response
from app.schemas.user import UserCreate, UserLogin
from app.repository.user import create, getbyemail
from app.utils.password import verify_password
from app.utils.token import create_access_token, create_refresh_token


router = APIRouter(tags=["User"])

@router.post("/create-account")
def create_account(data: UserCreate):
    try:
        return create(data.name, data.email, data.password)
    except Exception:
        raise HTTPException(status_code= 500, detail="Error")

@router.post("/login")
def login(data: UserLogin, response: Response):
    try:
        user = getbyemail(data.email)
        if user is None:
            raise HTTPException( status_code=401, detail="Invalid email or password")
        
        if verify_password(data.password, user["password_hash"]):

            
            access_token = create_access_token(str(user["id"]))
            refresh_token = create_refresh_token(str(user["id"]))

            response.set_cookie(
                key="refresh_token",
                value=refresh_token,
                httponly=True,
                secure=False,
                samesite="lax",
                max_age=7 * 24 * 60 * 60,
                path="/refresh",
            )


            return {
                "access_token": access_token,
                "token_type": "bearer",
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid email or password")

    except Exception as e:
        raise HTTPException(status_code= 500, detail=e)