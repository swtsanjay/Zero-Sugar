from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, insert, select, update
from app.models.message import MessageTable
from app.schemas.message import MessageCreate, Message, MessageCreateResponse
from app.database import engine
from app.repository.message import create
from app.repository.conversation import create as conversation_create
from app.dependencies.auth import verify_token
from sqlalchemy.exc import SQLAlchemyError
from typing import Annotated
from uuid import UUID

router = APIRouter(
    prefix="/message",
    tags=["Message"],
    dependencies=[Depends(verify_token)],
)

CurrentUserId = Annotated[UUID, Depends(verify_token)]


@router.get('', response_model=list[Message])
def get_messages():
    if engine is None:
        raise HTTPException(status_code=500, detail="DB_PASSWORD is not configured")

    try:
        query = select(MessageTable.id, MessageTable.content)
        with engine.connect() as connection:
            messages = connection.execute(query).mappings().all()
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Failed to retrieve messages")
    return messages

@router.get('/{id}', response_model=Message)
def get_message(id: int):
    if engine is None:
        raise HTTPException(status_code=500, detail="DB_PASSWORD is not configured")

    try:
        query = select(MessageTable.id, MessageTable.content).where(MessageTable.id == id)
        with engine.connect() as connection:
            message = connection.execute(query).mappings().one_or_none()
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Failed to retrieve message")
    if message is None:
        raise HTTPException(status_code=404, detail="Message not found")
    return message

@router.post('', response_model=MessageCreateResponse, status_code=201)
def create_message(data: MessageCreate, user_id: CurrentUserId):
    conversation_data=conversation_create(
        user_id=user_id,
        title=data.content[:200],
        model="qwen3:14b"
    )
    message=create(
        conversation_id=conversation_data["id"],
        role="user",
        content=data.content,
        model="qwen3:14b",
        prompt_tokens=100,
        completion_tokens=200
    )
    return {"conversation": conversation_data, "message": message}

@router.put('/{id}', response_model=Message)
def update_message(id: int, m: MessageCreate):
    if engine is None:
        raise HTTPException(status_code=500, detail="DB_PASSWORD is not configured")

    try:
        query = (
            update(MessageTable)
            .where(MessageTable.id == id)
            .values(content=m.content)
            .returning(MessageTable)
        )
        with engine.begin() as connection:
            message = connection.execute(query).mappings().one_or_none()
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Failed to update message")

    if message is None:
        raise HTTPException(status_code=404, detail="Message not found")

    return message

@router.delete('/{id}', response_model=Message)
def delete_message(id: int):
    if engine is None:
        raise HTTPException(status_code=500, detail="DB_PASSWORD is not configured")

    try:
        query = (
            delete(MessageTable)
            .where(MessageTable.id == id)
            .returning(MessageTable)
        )
        with engine.begin() as connection:
            message = connection.execute(query).mappings().one_or_none()
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Failed to delete message")

    if message is None:
        raise HTTPException(status_code=404, detail="Message not found")

    return message
