from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query

from app.core.responses import ApiResponse, success_response
from app.dependencies.auth import verify_token
from app.schemas.conversation import (
    ConversationListResponse,
    ConversationResponse,
    ConversationUpdate,
)
from app.services.conversation import (
    delete_conversation,
    list_conversations,
    update_conversation_title,
)


CurrentUserId = Annotated[UUID, Depends(verify_token)]

router = APIRouter(
    prefix="/conversation",
    tags=["Conversation"],
    dependencies=[Depends(verify_token)],
)


@router.get("", response_model=ApiResponse[ConversationListResponse])
def get_conversations(
    user_id: CurrentUserId,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
):
    return success_response(
        data=list_conversations(user_id, page, limit),
        message="Conversations fetched successfully",
    )


@router.patch(
    "/{conversation_id}",
    response_model=ApiResponse[ConversationResponse],
)
def update_conversation(
    conversation_id: UUID,
    data: ConversationUpdate,
    user_id: CurrentUserId,
):
    return success_response(
        data=update_conversation_title(
            conversation_id,
            user_id,
            data.title,
        ),
        message="Conversation title updated successfully",
    )


@router.delete(
    "/{conversation_id}",
    response_model=ApiResponse[None],
)
def remove_conversation(
    conversation_id: UUID,
    user_id: CurrentUserId,
):
    delete_conversation(conversation_id, user_id)

    return success_response(
        message="Conversation deleted successfully",
    )
