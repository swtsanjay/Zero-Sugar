from __future__ import annotations

from typing import Optional
from uuid import UUID
from app.database import engine
from sqlalchemy import insert, select, update, delete
from sqlalchemy.engine import Connection
from sqlalchemy.exc import SQLAlchemyError
from app.models.conversation import ConversationTable
from app.core.db import paginate, transaction_scope


def create(
    user_id: UUID,
    title: str,
    model: str,
    connection: Optional[Connection] = None,
):
    try:
        query = insert(ConversationTable).values(user_id = user_id, title = title, model = model).returning(ConversationTable)
        with transaction_scope(connection) as active_connection:
            return active_connection.execute(query).mappings().one()

    except SQLAlchemyError as e:
        raise SQLAlchemyError(e)

def change(
    id: UUID,
    user_id: Optional[UUID] = None,
    title: Optional[str] = None,
    model: Optional[str] = None,
    connection: Optional[Connection] = None,
):
    try:
        query = (
            update(ConversationTable)
            .where(ConversationTable.id == id)
            .returning(ConversationTable)
        )
        if user_id is not None:
            query = query.values(user_id = user_id)
        if title is not None:
            query = query.values(title = title)
        if model is not None:
            query = query.values(model = model)

        with transaction_scope(connection) as active_connection:
            return active_connection.execute(query).mappings().one_or_none()

    except SQLAlchemyError as e:
        raise SQLAlchemyError(e)

def get(
    user_id: Optional[UUID] = None,
    page: int = 1,
    limit: int = 20,
    connection: Optional[Connection] = None,
):
    try:
        query = (
            select(ConversationTable)
            .where(ConversationTable.deleted_at.is_(None))
            .order_by(ConversationTable.updated_at.desc())
        )
    
        if user_id is not None:
            query = query.where(ConversationTable.user_id == user_id)
    
        return paginate(
            engine,
            query,
            {"page": page, "limit": limit},
            connection,
        )
    except SQLAlchemyError as e:
        raise SQLAlchemyError(e)

def remove(
    id: Optional[UUID] = None,
    user_id: Optional[UUID] = None,
    connection: Optional[Connection] = None,
) -> list[UUID]:
    if id is None and user_id is None:
        raise ValueError("Either id or user_id is required")

    try:
        query = delete(ConversationTable).returning(ConversationTable.id)

        if id is not None:
            query = query.where(ConversationTable.id == id)

        if user_id is not None:
            query = query.where(ConversationTable.user_id == user_id)

        with transaction_scope(connection) as active_connection:
            return active_connection.execute(query).scalars().all()

    except SQLAlchemyError as e:
        raise SQLAlchemyError(e)
