from uuid import UUID

from app.database import engine
from app.repository.conversation import create as create_conversation
from app.repository.message import create as create_message


def start_conversation(
    user_id: UUID,
    content: str,
    model: str,
):
    with engine.begin() as connection:
        conversation = create_conversation(
            user_id=user_id,
            title=content[:200],
            model=model,
            connection=connection,
        )

        user_message = create_message(
            conversation_id=conversation["id"],
            role="user",
            content=content,
            model=model,
            connection=connection,
        )

        assistant_message = create_message(
            conversation_id=conversation["id"],
            role="assistant",
            content="Some reply from assistant",
            model=model,
            connection=connection,
        )

        return {
            "conversation": conversation,
            "user_message": user_message,
            "assistant_message": assistant_message
        }


def next_message(
    conversation_id: UUID,
    content: str,
    model: str,
):
    with engine.begin() as connection:
        

        user_message = create_message(
            conversation_id=conversation_id,
            role="user",
            content=content,
            model=model,
            connection=connection,
        )

        assistant_message = create_message(
            conversation_id=conversation_id,
            role="assistant",
            content="Some reply from assistant",
            model=model,
            connection=connection,
        )

        return {
            "user_message": user_message,
            "assistant_message": assistant_message
        }