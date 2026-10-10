from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import ( CheckConstraint, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func )
from sqlalchemy.dialects.postgresql import UUID as PostgreSQLUUID
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class MessageTable(Base):
    __tablename__ = "messages"

    __table_args__ = (
        CheckConstraint(
            "role IN ('system', 'user', 'assistant')",
            name="messages_role_check",
        ),
        CheckConstraint(
            "status IN ('pending', 'streaming', 'completed', 'failed', 'cancelled')",
            name="messages_status_check",
        ),
        UniqueConstraint(
            "conversation_id",
            "sequence_number",
            name="messages_sequence_unique",
        ),
    )

    id: Mapped[UUID] = mapped_column( PostgreSQLUUID(as_uuid=True), primary_key=True, default=uuid4 )
    conversation_id: Mapped[UUID] = mapped_column( PostgreSQLUUID(as_uuid=True), ForeignKey(     "conversations.id",     ondelete="CASCADE", ), nullable=False, index=True )
    role: Mapped[str] = mapped_column( String(20), nullable=False )
    content: Mapped[str] = mapped_column( Text, nullable=False )
    sequence_number: Mapped[int] = mapped_column( Integer, nullable=False )
    status: Mapped[str] = mapped_column( String(20), nullable=False, default="completed" )
    model: Mapped[Optional[str]] = mapped_column( String(100), nullable=True )
    prompt_tokens: Mapped[Optional[int]] = mapped_column( Integer, nullable=True )
    completion_tokens: Mapped[Optional[int]] = mapped_column( Integer, nullable=True )
    created_at: Mapped[datetime] = mapped_column( DateTime(timezone=True), nullable=False, server_default=func.now() )
    updated_at: Mapped[datetime] = mapped_column( DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now() )