from fastapi import APIRouter, Depends
from app.schemas.message import MessageCreate, StartConversationResponse, NextMessageResponse
from app.database import engine
from app.dependencies.auth import verify_token
from app.services.chat import start_conversation
from typing import Annotated
from uuid import UUID

router = APIRouter(
    prefix="/message",
    tags=["Message"],
    dependencies=[Depends(verify_token)],
)

CurrentUserId = Annotated[UUID, Depends(verify_token)]


@router.post('/start-conversation', response_model=StartConversationResponse, status_code=201)
def create_message(data: MessageCreate, user_id: CurrentUserId):
    return start_conversation(
        user_id=user_id,
        content=data.content,
        model="qwen3:14b",
    )

@router.post('/{conversation_id}', response_model=NextMessageResponse, status_code=201)
def create_message(conversation_id: UUID, data: MessageCreate):
    return start_conversation(
        conversation_id=conversation_id,
        content=data.content,
        model="qwen3:14b",
    )