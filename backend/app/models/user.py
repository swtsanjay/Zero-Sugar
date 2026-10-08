import datetime
from app.database import Base, engine
from sqlalchemy import String
from sqlalchemy.dialects.postgresql import UUID, Datetime
from sqlalchemy.orm import Mapped, mapped_column


class User(Base):
    __tablename__ = "users"
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    passsword_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(nullable=False, default=True)
    created_at: Mapped[Datetime] = mapped_column(nullable=False, default=lambda: datetime.utcnow())
    updated_at: Mapped[Datetime] = mapped_column(nullable=False, default=lambda: datetime.utcnow(), onupdate=lambda: datetime.utcnow())
    deleted_at: Mapped[Datetime] = mapped_column(nullable=True)