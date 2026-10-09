from uuid import UUID
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi import Security
from jwt import ExpiredSignatureError, InvalidTokenError
from app.utils.token import decode_token
from app.core.exceptions import AuthenticationError


bearer_scheme = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(bearer_scheme)):
    token = credentials.credentials
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise AuthenticationError("Invalid access token")

        user_id = payload.get("sub")

        if not user_id:
            raise AuthenticationError("Invalid access token")

        return UUID(user_id)
    
    except ExpiredSignatureError:
        raise AuthenticationError("Access token has expired")
    
    except (InvalidTokenError, ValueError):
        raise AuthenticationError("Invalid access token")