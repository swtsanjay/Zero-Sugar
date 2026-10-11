from fastapi import APIRouter, Depends, Query
from app.schemas.message import MessageCreate, MessageListResponse, StartConversationResponse, NextMessageResponse
from app.database import engine
from app.dependencies.auth import verify_token
from app.services.chat import list_messages, next_message, start_conversation
from app.core.responses import ApiResponse, success_response
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
def create_next_message(conversation_id: UUID, data: MessageCreate):
    return next_message(
        conversation_id=conversation_id,
        content=data.content,
        model="qwen3:14b",
    )


@router.get('/{conversation_id}', response_model=ApiResponse[MessageListResponse])
def get_conversation_messages(
    conversation_id: UUID,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=100, ge=1, le=100),
):
    return success_response(
        data=list_messages(
            conversation_id=conversation_id,
            page=page,
            limit=limit,
        ),
        message="Messages fetched successfully",
    )
