from typing import Optional, TypedDict
from uuid import UUID

from app.core.db import transaction_scope
from app.core.exceptions import AuthenticationError, BadRequestError, NotFoundError
from app.repository.user import (
    create,
    get_password_by_id,
    getbyemail,
    getbyid,
    update_password,
    update_profile,
)
from app.utils.password import verify_password
from app.utils.token import (
    create_access_token,
    create_refresh_token,
)
from app.dependencies.auth import verify_refresh_token


class LoginTokens(TypedDict):
    access_token: str
    refresh_token: str


def register_user(name: str, email: str, password: str):
    return create(name, email, password)


def authenticate_user(email: str, password: str) -> LoginTokens:
    user = getbyemail(email)

    if user is None or not verify_password(password, user["password_hash"]):
        raise AuthenticationError()

    user_id = str(user["id"])

    return {
        "access_token": create_access_token(user_id),
        "refresh_token": create_refresh_token(user_id),
    }


def issue_access_token(refresh_token: Optional[str]) -> str:
    if refresh_token is None:
        raise AuthenticationError("Refresh token is missing")

    user_id = verify_refresh_token(refresh_token)
    user = getbyid(user_id)

    if user is None or not user["is_active"]:
        raise AuthenticationError("User account is unavailable")

    return create_access_token(str(user_id))


def update_user_profile(
    user_id: UUID,
    name: str,
    email: str,
    username: str,
):
    return update_profile(user_id, name, email, username)


def get_user_profile(user_id: UUID):
    return getbyid(user_id)


def change_user_password(
    user_id: UUID,
    current_password: str,
    new_password: str,
) -> None:
    with transaction_scope() as connection:
        user = get_password_by_id(user_id, connection=connection)

        if user is None:
            raise NotFoundError("User not found")

        if not verify_password(current_password, user["password_hash"]):
            raise BadRequestError(
                message="Current password is incorrect",
                code="invalid_current_password",
            )

        if verify_password(new_password, user["password_hash"]):
            raise BadRequestError(
                message="New password must be different from the current password",
                code="password_unchanged",
            )

        update_password(
            user_id,
            new_password,
            connection=connection,
        )
