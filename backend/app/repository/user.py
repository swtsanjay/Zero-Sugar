from uuid import UUID
from app.database import engine
from sqlalchemy import insert, select
from sqlalchemy.exc import SQLAlchemyError
from app.models.user import User
from app.utils.password import hash_password


def create(name: str, email: str, password: str):
    try:
        query = insert(User).values(name = name, email = email, password_hash = hash_password(password)).returning(User)
        with engine.begin() as connection:
            return connection.execute(query).mappings().one()

    except SQLAlchemyError as e:
        raise SQLAlchemyError(e)

def getbyemail(email: str):
    try:
        query = select(User.id, User.name, User.email, User.password_hash).where(User.email == email)
        with engine.connect() as connection:
            return connection.execute(query).mappings().one_or_none()
    except SQLAlchemyError as e:
        raise SQLAlchemyError(e)

def getbyid(id: UUID):
    try:
        query = select(User.id, User.name, User.email, User.is_active).where(User.email == id)
        with engine.connect() as connection:
            return connection.execute(query).mappings().one_or_none()
    except SQLAlchemyError as e:
        raise SQLAlchemyError(e)