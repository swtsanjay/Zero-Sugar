from uuid import UUID

from app.database import engine
from app.repository.conversation import create as create_conversation
from app.repository.message import create as create_message


def start_conversation(
    user_id: UUID,
    content: str,
    model: str,
):
    if engine is None:
        raise RuntimeError("Database engine is not configured")

    with engine.begin() as connection:
        conversation = create_conversation(
            user_id=user_id,
            title=content[:200],
            model=model,
            connection=connection,
        )

        message = create_message(
            conversation_id=conversation["id"],
            role="user",
            content=content,
            model=model,
            connection=connection,
        )

        return {
            "conversation": conversation,
            "message": message,
        }
