from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class ConversationUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=200)

    @field_validator("title", mode="before")
    @classmethod
    def validate_title(cls, value):
        if isinstance(value, str):
            value = value.strip()

            if not value:
                raise ValueError("Title cannot be empty or whitespace")

        return value


class ConversationResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    model: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class PaginationResponse(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int
    has_next: bool
    has_previous: bool


class ConversationListResponse(BaseModel):
    items: list[ConversationResponse]
    pagination: PaginationResponse
