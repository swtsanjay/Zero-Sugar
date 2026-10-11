from uuid import UUID

from app.database import engine
from app.repository.conversation import create as create_conversation
from app.repository.conversation import get_by_id as get_conversation_by_id
from app.repository.message import change as change_message
from app.repository.message import create as create_message
from app.repository.message import get as get_messages, get_by_id
from app.clients.ollama import generate_chat
from app.core.db import transaction_scope



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
        model="qwen3:14b",
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
        model="qwen3:14b",
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
