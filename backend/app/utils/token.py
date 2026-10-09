import os
from datetime import datetime, timezone, timedelta
import jwt

jwt_secretkey = os.environ["JWT_SECRETKEY"]
algorithm = "HS256"


def create_access_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "type": "access",
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15)
    }

    return jwt.encode(payload, jwt_secretkey, algorithm=algorithm)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "type": "refresh",
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }

    return jwt.encode(payload, jwt_secretkey, algorithm=algorithm)

def decode_token(token: str) -> dict:
    return jwt.decode(token, jwt_secretkey, algorithms=[algorithm], options={"require": ["sub", "type", "exp"]})