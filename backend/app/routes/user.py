from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Cookie, Response, Depends
from app.schemas.user import LoginResponse, PasswordChange, UserCreate, UserUpdate, UserCreateResponse, UserLogin, ProfileResponse
from app.core.responses import ApiResponse, success_response
from app.dependencies.auth import verify_token
from app.services.user import (
    authenticate_user,
    change_user_password,
    get_user_profile,
    issue_access_token,
    register_user,
    update_user_profile as update_user_profile_service,
)


router = APIRouter(tags=["User"], prefix="/user")

@router.post("/create-account", response_model=ApiResponse[UserCreateResponse], status_code=201)
def create_account(data: UserCreate):
    return success_response(
        data=register_user(data.name, data.email, data.password),
        message="Account created successfully"
    )


@router.post("/login", response_model=ApiResponse[LoginResponse])
def login(data: UserLogin, response: Response):
    tokens = authenticate_user(data.email, data.password)

    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
        path="/user/refresh",
    )

    return success_response(
        data=LoginResponse(
            access_token=tokens["access_token"],
            token_type="bearer",
        ),
        message="Login successful",
    )


@router.post("/refresh", response_model=ApiResponse[LoginResponse])
def refresh_access_token(
    refresh_token: Optional[str] = Cookie(default=None),
):
    access_token = issue_access_token(refresh_token)

    return success_response(
        data=LoginResponse(
            access_token=access_token,
            token_type="bearer",
        ),
        message="Access token refreshed",
    )


@router.put("/profile", response_model=ApiResponse[ProfileResponse])
def update_user_profile(data: UserUpdate, user_id: UUID = Depends(verify_token),):
    return success_response(
        data=update_user_profile_service(
            user_id,
            data.name,
            data.email,
            data.username,
        ),
        message="Profile updated",
    )


@router.get("/profile", response_model=ApiResponse[ProfileResponse])
def get_profile(user_id: UUID = Depends(verify_token),):
    return success_response(
        data=get_user_profile(user_id),
        message="Profile data fetched",
    )


@router.put("/change-password", response_model=ApiResponse[None])
def change_password(data: PasswordChange, user_id: UUID = Depends(verify_token)):
    change_user_password(
        user_id,
        data.current_password,
        data.new_password,
    )

    return success_response(
        message="Password changed successfully",
    )
