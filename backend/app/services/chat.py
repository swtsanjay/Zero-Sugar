from uuid import UUID

from app.database import engine
from app.repository.conversation import create as create_conversation
from app.repository.conversation import get_by_id as get_conversation_by_id
from app.repository.message import create as create_message
from app.repository.message import get as get_messages
from app.clients.ollama import generate_chat



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

    ollamaRes = generate_chat(
        model="qwen3:14b",
        messages=[
            {
                "role": "user",
                "content": content
            }
        ]
    )

    assistant_message = create_message(
        conversation_id=conversation_id,
        role="assistant",
        content=ollamaRes["content"],
        model=model,
        prompt_tokens=ollamaRes["prompt_tokens"],
        completion_tokens=ollamaRes["completion_tokens"],
        execution_time=ollamaRes["execution_time"]
    )

    return {
        "user_message": user_message,
        "assistant_message": assistant_message
    }


def list_messages(
    conversation_id: UUID,
    page: int = 1,
    limit: int = 100,
):
    return get_messages(
        conversation_id=conversation_id,
        page=page,
        limit=limit,
    )
