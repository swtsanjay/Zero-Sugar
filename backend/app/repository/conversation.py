from __future__ import annotations

from typing import Optional
from uuid import UUID
from app.database import engine
from sqlalchemy import insert, select, update, delete
from sqlalchemy.exc import SQLAlchemyError
from app.models.conversation import ConversationTable
from app.core.db import paginate


def create(user_id: UUID, title: str, model: str):
    try:
        query = insert(ConversationTable).values(user_id = user_id, title = title, model = model).returning(ConversationTable)
        with engine.begin() as connection:
            return connection.execute(query).mappings().one()

    except SQLAlchemyError as e:
        raise SQLAlchemyError(e)

def change(id: UUID, user_id: UUID = None, title: str = None, model: str = None):
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

        with engine.begin() as connection:
            return connection.execute(query).mappings().one_or_none()

    except SQLAlchemyError as e:
        raise SQLAlchemyError(e)

def list(user_id: UUID = None, page: int = 1, limit: int = 20):
    try:
        query = (
            select(ConversationTable)
            .where(ConversationTable.deleted_at.is_(None))
            .order_by(ConversationTable.updated_at.desc())
        )
    
        if user_id is not None:
            query = query.where(ConversationTable.user_id == user_id)
    
        return paginate(engine, query, {"page": page, "limit": limit})
    except SQLAlchemyError as e:
        raise SQLAlchemyError(e)

def remove( id: Optional[UUID] = None, user_id: Optional[UUID] = None ) -> list[UUID]:
    if id is None and user_id is None:
        raise ValueError("Either id or user_id is required")

    try:
        query = delete(ConversationTable).returning(ConversationTable.id)

        if id is not None:
            query = query.where(ConversationTable.id == id)

        if user_id is not None:
            query = query.where(ConversationTable.user_id == user_id)

        with engine.begin() as connection:
            return list(connection.execute(query).scalars().all())

    except SQLAlchemyError as e:
        raise SQLAlchemyError(e)
