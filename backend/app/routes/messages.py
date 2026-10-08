from fastapi import APIRouter, HTTPException
from sqlalchemy import delete, insert, select, update
from app.models.message import MessageTable
from app.schemas.message import MessageCreate, Message
from app.database import engine
from sqlalchemy.exc import SQLAlchemyError
router = APIRouter(tags=["messages"])


@router.get('/messages', response_model=list[Message])
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

@router.get('/message/{id}', response_model=Message)
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

@router.post('/message', response_model=Message, status_code=201)
def create_message(m: MessageCreate):
    if engine is None:
        raise HTTPException(status_code=500, detail="DB_PASSWORD is not configured")

    query = insert(MessageTable).values(content=m.content).returning(MessageTable)

    try:
        with engine.begin() as connection:
            message = connection.execute(query).mappings().one()
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Failed to insert message into the database")

    return message

@router.put('/message/{id}', response_model=Message)
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

@router.delete('/message/{id}', response_model=Message)
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
