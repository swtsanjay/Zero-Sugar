from uuid import UUID
from app.database import engine
from sqlalchemy import insert, select, update
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.models.user import User
from app.utils.password import hash_password
from app.core.exceptions import ConflictError


def create(name: str, email: str, password: str):
    try:
        query = insert(User).values(name = name, email = email, password_hash = hash_password(password)).returning(User)
        with engine.begin() as connection:
            return connection.execute(query).mappings().one()

    except IntegrityError as error:
        constraint_name = getattr(error.orig.diag, "constraint_name", "")

        if constraint_name == "users_username_unique":
            raise ConflictError("Username is already taken")

        if constraint_name == "users_email_key":
            raise ConflictError("Email is already registered")

        raise ConflictError("Profile information already exists")

    except SQLAlchemyError as e:
        raise SQLAlchemyError(e)

def update_profile(id: UUID, name: str, email: str, username: str):
    try:
        query = (
            update(User)
            .where(User.id == id)
            .values(name=name, username=username, email=email)
            .returning(User.id, User.name, User.username, User.email, User.is_active)
        )
        with engine.begin() as connection:
            return connection.execute(query).mappings().one_or_none()

    except IntegrityError as error:
        constraint_name = getattr(error.orig.diag, "constraint_name", "")

        if constraint_name == "users_username_unique":
            raise ConflictError("Username is already taken")

        if constraint_name == "users_email_key":
            raise ConflictError("Email is already registered")

        raise ConflictError("Profile information already exists")

    except SQLAlchemyError as e:
        raise SQLAlchemyError(e)

def getbyemail(email: str):
    try:
        query = select(User.id, User.name, User.username, User.email, User.password_hash).where(User.email == email)
        with engine.connect() as connection:
            return connection.execute(query).mappings().one_or_none()
    except SQLAlchemyError as e:
        raise SQLAlchemyError(e)

def getbyid(id: UUID):
    try:
        query = select(User.id, User.name, User.username, User.email, User.is_active).where(User.id == id)
        with engine.connect() as connection:
            return connection.execute(query).mappings().one_or_none()
    except SQLAlchemyError as e:
        raise SQLAlchemyError(e)
