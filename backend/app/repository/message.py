from __future__ import annotations

from typing import Optional
from uuid import UUID
from app.database import engine
from sqlalchemy import insert, select, update, delete, func
from sqlalchemy.engine import Connection
from sqlalchemy.exc import SQLAlchemyError
from app.models.message import MessageTable
from app.core.db import paginate, transaction_scope


def create(
        conversation_id: UUID, 
        role: str, 
        content: str, 
        model: str, 
        prompt_tokens: int = 0,
        completion_tokens: int = 0,
        connection: Optional[Connection] = None
    ):
    try:
        with transaction_scope(connection) as active_connection:
            next_sequence_query = select(
                func.coalesce(
                    func.max(MessageTable.sequence_number),
                    0,
                ) + 1
            ).where(MessageTable.conversation_id == conversation_id)

            next_sequence_number = active_connection.execute(
                next_sequence_query
            ).scalar_one()

            query = insert(MessageTable).values(
                conversation_id=conversation_id,
                role=role,
                content=content,
                sequence_number=next_sequence_number,
                model=model,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
            ).returning(MessageTable)

            return active_connection.execute(query).mappings().one()

    except SQLAlchemyError as e:
        raise SQLAlchemyError(e)

def change(
        id: UUID, 
        conversation_id: UUID = None, 
        role: str = None, 
        content: str = None, 
        sequence_number: int = None, 
        model: str = None, 
        prompt_tokens: int = None, 
        completion_tokens: int = None ,
        connection: Optional[Connection] = None
    ):
    try:
        query = (
            update(MessageTable)
            .where(MessageTable.id == id)
            .returning(MessageTable)
        )
        if conversation_id is not None:
            query = query.values(conversation_id = conversation_id)
        if role is not None:
            query = query.values(role = role)
        if content is not None:
            query = query.values(content = content)
        if sequence_number is not None:
            query = query.values(sequence_number = sequence_number)
        if model is not None:
            query = query.values(model = model)
        if prompt_tokens is not None:
            query = query.values(prompt_tokens = prompt_tokens)
        if completion_tokens is not None:
            query = query.values(completion_tokens = completion_tokens)

        with transaction_scope(connection) as active_connection:
            return active_connection.execute(query).mappings().one_or_none()

    except SQLAlchemyError as e:
        raise SQLAlchemyError(e)

def get(conversation_id: UUID = None, page: int = 1, limit: int = 20, connection: Optional[Connection] = None):
    try:
        query = (
            select(MessageTable)
            .where(MessageTable.deleted_at.is_(None))
            .order_by(MessageTable.sequence_number.desc())
        )
    
        if conversation_id is not None:
            query = query.where(MessageTable.conversation_id == conversation_id)
    
        return paginate(engine, query, {"page": page, "limit": limit}, connection)
    except SQLAlchemyError as e:
        raise SQLAlchemyError(e)

def remove(id: Optional[UUID] = None, conversation_id: Optional[UUID] = None, connection: Optional[Connection] = None) -> list[UUID]:
    if id is None and conversation_id is None:
        raise ValueError("Either id or conversation_id is required")

    try:
        query = delete(MessageTable).returning(MessageTable.id)

        if id is not None:
            query = query.where(MessageTable.id == id)

        if conversation_id is not None:
            query = query.where(MessageTable.conversation_id == conversation_id)

        with transaction_scope(connection) as active_connection:
            return list(active_connection.execute(query).scalars().all())

    except SQLAlchemyError as e:
        raise SQLAlchemyError(e)
