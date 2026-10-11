import time
import json
from uuid import UUID
from collections.abc import Iterator
from fastapi.encoders import jsonable_encoder
from app.database import engine
from app.repository.conversation import create as create_conversation
from app.repository.conversation import get_by_id as get_conversation_by_id
from app.repository.message import change as change_message
from app.repository.message import create as create_message
from app.repository.message import get as get_messages, get_by_id
from app.clients.ollama import generate_chat, stream_chat
from app.core.db import transaction_scope



def create_sse_event(event: str, data: dict) -> str:
    encoded_data = json.dumps(jsonable_encoder(data))

    return (
        f"event: {event}\n"
        f"data: {encoded_data}\n\n"
    )


def start_conversation(
    user_id: UUID,
    content: str,
    model: str,
):
    ass_title_res = generate_chat(
        model=model,
        messages=[
            {
                "role": "user",
                "content": (
                    "Create a short title for the following conversation. "
                    "Return only the title, without Markdown, quotes, labels, "
                    "explanations, or emojis. Keep it under 80 characters.\n\n"
                    f"User message: {content}"
                )
            }
        ]
    )

    # Model output cannot be trusted to follow the requested length, so enforce
    # the database limit before inserting it into conversations.title.
    conversation_title = " ".join(ass_title_res["content"].split()).strip()[:200]

    ass_res = generate_chat(
        model=model,
        messages=[
            {
                "role": "user",
                "content": content
            }
        ]
    )

    with transaction_scope() as connection:
        conversation = create_conversation(
            user_id=user_id,
            title=conversation_title or content[:200],
            model=model,
            connection=connection
        )

        user_message = create_message(
            conversation_id=conversation["id"],
            role="user",
            content=content,
            model=model,
            tokens=ass_res["prompt_tokens"],
            connection=connection
        )

        assistant_message = create_message(
            conversation_id=conversation["id"],
            role="assistant",
            content=ass_res["content"],
            model=model,
            tokens=ass_res["completion_tokens"],
            execution_time=ass_res["execution_time"],
            connection=connection
        )

        return {
            "conversation": conversation,
            "user_message": user_message,
            "assistant_message": assistant_message
        }

def regenerate_message(
    message_id: UUID,
    model: str
):
    message = get_by_id(message_id)

    if message is None:
        raise ValueError("Message not found")

    if message["role"] != "assistant":
        raise ValueError("Only assistant messages can be regenerated")
    
    ass_res = generate_chat(
        model=model,
        messages=[
            {
                "role": "assistant",
                "content": message["content"]
            },
            {
                "role": "user",
                "content": (
                    "Regenerate your previous response with a fresh, clear answer. "
                    "Do not mention the previous response or this instruction."
                )
            }
        ]
    )

    assistant_message = change_message(
        id=message_id,
        content=ass_res["content"],
        model=model,
        tokens=ass_res["completion_tokens"],
        execution_time=ass_res["execution_time"]
    )

    return {
        "assistant_message": assistant_message
    }
    

def next_message(
    conversation_id: UUID,
    content: str,
    model: str,
):
    old_messages=get_messages(conversation_id=conversation_id, page=1, limit=20)["items"]
    messages = [
        {
            "role": message["role"],
            "content": message["content"],
        }
        for message in reversed(old_messages)
    ]
    messages.append({ "role": "user", "content": content })

    ass_res = generate_chat(
        model=model,
        messages=messages
    )

    with transaction_scope() as connection:

        user_message = create_message(
            conversation_id=conversation_id,
            role="user",
            content=content,
            model=model,
            tokens=ass_res["prompt_tokens"],
            connection=connection,
        )

        assistant_message = create_message(
            conversation_id=conversation_id,
            role="assistant",
            content=ass_res["content"],
            model=model,
            tokens=ass_res["completion_tokens"],
            execution_time=ass_res["execution_time"],
            connection=connection,
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

def stream_message(
    conversation_id: UUID,
    content: str,
    model: str,
) -> Iterator[str]:
    old_messages = get_messages(conversation_id=conversation_id, page=1, limit=20)["items"]

    ollama_messages = [
        {
            "role": message["role"],
            "content": message["content"],
        }
        for message in reversed(old_messages)
    ]

    ollama_messages.append({ "role": "user", "content": content })

    with transaction_scope() as connection:
        user_message = create_message(
            conversation_id=conversation_id,
            role="user",
            content=content,
            model=model,
            tokens=0,
            status="completed",
            connection=connection,
        )

        assistant_message = create_message(
            conversation_id=conversation_id,
            role="assistant",
            content="",
            model=model,
            tokens=0,
            status="streaming",
            connection=connection,
        )

    yield create_sse_event(
        event="start",
        data={
            "user_message": user_message,
            "assistant_message": assistant_message,
        },
    )

    complete_content = ""
    prompt_tokens = 0
    completion_tokens = 0
    started_at = time.perf_counter()

    try:
        for chunk in stream_chat(
            model=model,
            messages=ollama_messages,
        ):
            if chunk["type"] == "content":
                chunk_content = chunk["content"]
                complete_content += chunk_content

                yield create_sse_event(
                    event="content",
                    data={
                        "message_id": assistant_message["id"],
                        "content": chunk_content,
                    },
                )

            elif chunk["type"] == "done":
                prompt_tokens = chunk.get("prompt_tokens", 0)
                completion_tokens = chunk.get("completion_tokens", 0)

        execution_time = time.perf_counter() - started_at

        # Update both rows together when generation succeeds.
        with transaction_scope() as connection:
            updated_user_message = change_message(
                id=user_message["id"],
                tokens=prompt_tokens,
                connection=connection,
            )

            updated_assistant_message = change_message(
                id=assistant_message["id"],
                content=complete_content,
                model=model,
                tokens=completion_tokens,
                execution_time=execution_time,
                status="completed",
                connection=connection,
            )

        yield create_sse_event(
            event="done",
            data={
                "user_message": updated_user_message,
                "assistant_message": updated_assistant_message,
            },
        )

    except GeneratorExit:
        # The browser disconnected or stopped generation.
        change_message(
            id=assistant_message["id"],
            content=complete_content,
            status="cancelled",
        )
        raise

    except Exception as error:
        change_message(
            id=assistant_message["id"],
            content=complete_content,
            status="failed",
        )

        yield create_sse_event(
            event="error",
            data={
                "message_id": assistant_message["id"],
                "message": "Assistant response generation failed.",
            },
        )

        raise error