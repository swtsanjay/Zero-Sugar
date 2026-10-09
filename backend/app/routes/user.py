from fastapi import APIRouter, Response
from app.schemas.user import LoginResponse, UserCreate, UserCreateResponse, UserLogin
from app.repository.user import create, getbyemail
from app.utils.password import verify_password
from app.utils.token import create_access_token, create_refresh_token
from app.core.responses import ApiResponse, success_response
from app.core.exceptions import AuthenticationError


router = APIRouter(tags=["User"])

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
