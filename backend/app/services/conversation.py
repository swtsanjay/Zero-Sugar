from uuid import UUID

from app.core.exceptions import NotFoundError
from app.repository.conversation import change, get, remove


def list_conversations(
    user_id: UUID,
    page: int = 1,
    limit: int = 20,
):
    return get(
        user_id=user_id,
        page=page,
        limit=limit,
    )


def update_conversation_title(
    conversation_id: UUID,
    user_id: UUID,
    title: str,
):
    conversation = change(
        id=conversation_id,
        user_id=user_id,
        title=title,
    )

    if conversation is None:
        raise NotFoundError("Conversation not found")

    return conversation


def delete_conversation(
    conversation_id: UUID,
    user_id: UUID,
) -> None:
    deleted_ids = remove(
        id=conversation_id,
        user_id=user_id,
    )

    if not deleted_ids:
        raise NotFoundError("Conversation not found")
