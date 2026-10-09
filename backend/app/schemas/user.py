import re
from pydantic import BaseModel, Field, field_validator
from uuid import UUID

class UserCreate(BaseModel):
    name: str = Field(min_length=3, max_length=50)
    email: str = Field(min_length=5, max_length=100)
    password: str = Field(min_length=8, max_length=100)

    @field_validator("name", mode="before")
    @classmethod
    def validate_name(cls, value):
        if isinstance(value, str):
            value = value.strip()
            if not value:
                raise ValueError("Name can not be empty or white space")

        return value

    @field_validator("email", mode="before")
    @classmethod
    def validate_email(cls, value):
        if value is None:
            raise ValueError("Email is required")

        if not isinstance(value, str):
            raise ValueError("Email must be a string")
        
        value = value.strip()

        if not value:
            raise ValueError("Email cannot be empty or whitespace")

        if len(value) > 254:
            raise ValueError("Email cannot exceed 254 characters")

        email_pattern = re.compile(
            r"^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@"
            r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?"
            r"(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$"
        )

        if not email_pattern.match(value):
            raise ValueError("Invalid email address")

        if ".." in value:
            raise ValueError("Email cannot contain consecutive dots")

        local_part = value.split("@")[0]

        if local_part.startswith(".") or local_part.endswith("."):
            raise ValueError("Invalid email address")

        return value.lower()


    
    @field_validator("password", mode="before")
    @classmethod
    def validate_password(cls, value):
        if value is None:
            raise ValueError("Password is required")

        if not isinstance(value, str):
            raise ValueError("Password must be a string")

        if not value.strip():
            raise ValueError("Password cannot be empty or whitespace")

        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long")

        if len(value) > 128:
            raise ValueError("Password cannot exceed 128 characters")

        if not any(char.isupper() for char in value):
            raise ValueError(
                "Password must contain at least one uppercase letter"
            )

        if not any(char.islower() for char in value):
            raise ValueError(
                "Password must contain at least one lowercase letter"
            )

        if not any(char.isdigit() for char in value):
            raise ValueError(
                "Password must contain at least one number"
            )

        if not any(not char.isalnum() for char in value):
            raise ValueError(
                "Password must contain at least one special character"
            )

        return value


class UserLogin(BaseModel):
    email: str = Field(min_length=5, max_length=100)
    password: str = Field(min_length=8, max_length=100)

    @field_validator("email", mode="before")
    @classmethod
    def validate_email(cls, value):
        if value is None:
            raise ValueError("Email is required")

        if not isinstance(value, str):
            raise ValueError("Email must be a string")
        
        value = value.strip()

        if not value:
            raise ValueError("Email cannot be empty or whitespace")

        if len(value) > 254:
            raise ValueError("Email cannot exceed 254 characters")

        email_pattern = re.compile(
            r"^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@"
            r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?"
            r"(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$"
        )

        if not email_pattern.match(value):
            raise ValueError("Invalid email address")

        if ".." in value:
            raise ValueError("Email cannot contain consecutive dots")

        local_part = value.split("@")[0]

        if local_part.startswith(".") or local_part.endswith("."):
            raise ValueError("Invalid email address")

        return value.lower()

    @field_validator("password", mode="before")
    @classmethod
    def validate_password(cls, value):
        if value is None:
            raise ValueError("Password is required")

        if not isinstance(value, str):
            raise ValueError("Password must be a string")

        if not value:
            raise ValueError("Password cannot be empty")

        return value


class UserCreateResponse(BaseModel):
    id: UUID
    name: str
    email: str
    is_active: bool


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
