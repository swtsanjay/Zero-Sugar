from uuid import UUID
from fastapi import APIRouter, Response, Depends
from app.schemas.user import LoginResponse, UserCreate, UserCreateResponse, UserLogin, ProfileResponse
from app.repository.user import create, getbyemail, getbyid
from app.utils.password import verify_password
from app.utils.token import create_access_token, create_refresh_token
from app.core.responses import ApiResponse, success_response
from app.core.exceptions import AuthenticationError
from app.dependencies.auth import verify_token


router = APIRouter(tags=["User"], prefix="/user")

@router.post("/create-account", response_model=ApiResponse[UserCreateResponse], status_code=201)
def create_account(data: UserCreate):
    return success_response(
        data= create(data.name, data.email, data.password),
        message="Account created successfully"
    )


@router.post("/login", response_model=ApiResponse[LoginResponse])
def login(data: UserLogin, response: Response):
    user = getbyemail(data.email)

    if user is None or not verify_password(data.password, user["password_hash"]):
        raise AuthenticationError()

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

    return success_response(
        data=LoginResponse(
            access_token=access_token,
            token_type="bearer",
        ),
        message="Login successful",
    )


@router.get("/profile", response_model=ApiResponse[ProfileResponse])
def get_profile(user_id: UUID = Depends(verify_token),):
    success_response(
        data= getbyid(user_id),
        message="Profile data fetched",
    )