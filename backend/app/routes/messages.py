from fastapi import APIRouter, Depends, Query
from app.schemas.message import MessageCreate, MessageListResponse, MessageRegenerate, StartConversationResponse, NextMessageResponse, RegeneratedMessageResponse
from app.database import engine
from app.dependencies.auth import verify_token
from app.services.chat import list_messages, stream_message, stream_regenerate_message, stream_start_conversation
from app.core.responses import ApiResponse, success_response
from fastapi.responses import StreamingResponse
from typing import Annotated
from uuid import UUID

router = APIRouter(
    prefix="/message",
    tags=["Message"],
    dependencies=[Depends(verify_token)],
)

CurrentUserId = Annotated[UUID, Depends(verify_token)]


@router.post('/start-conversation', status_code=201)
def create_message(data: MessageCreate, user_id: CurrentUserId):
    return StreamingResponse(
        stream_start_conversation(user_id=user_id, content=data.content, model=data.model),
        media_type="text/event-stream",
    )

@router.post('/{conversation_id}', response_model=NextMessageResponse, status_code=201)
def create_next_message(conversation_id: UUID, data: MessageCreate):
    return StreamingResponse(
        stream_message(
            conversation_id=conversation_id,
            content=data.content,
            model=data.model,
        ),
        media_type="text/event-stream",
    )

@router.post('/regenerate/{message_id}', status_code=201)
def regenerate_assistant_message(message_id: UUID, data: MessageRegenerate):
    return StreamingResponse(
        stream_regenerate_message(message_id=message_id, model=data.model),
        media_type="text/event-stream",
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
