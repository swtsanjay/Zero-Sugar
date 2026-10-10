from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator
from app.schemas.conversation import PaginationResponse

class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=500)

    @field_validator("content", mode="before")
    @classmethod
    def validate_content(cls, value):
        if isinstance(value, str):
            value = value.strip()

            if not value:
                raise ValueError("Content cannot be empty or whitespace.")

        return value



class Message(BaseModel):
    id: UUID
    conversation_id: UUID
    role: str
    content: str
    sequence_number: int
    status: str
    model: Optional[str] = None
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    created_at: datetime
    updated_at: datetime


class Conversation(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    model: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class StartConversationResponse(BaseModel):
    conversation: Conversation
    user_message: Message
    assistant_message: Message

class NextMessageResponse(BaseModel):
    user_message: Message
    assistant_message: Message


class MessageListResponse(BaseModel):
    items: list[Message]
    pagination: PaginationResponse
