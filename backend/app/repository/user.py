from typing import Optional
from uuid import UUID
from sqlalchemy import insert, select, update
from sqlalchemy.engine import Connection
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.models.user import User
from app.utils.password import hash_password
from app.core.exceptions import ConflictError
from app.core.db import transaction_scope


def create(
    name: str,
    email: str,
    password: str,
    connection: Optional[Connection] = None,
):
    try:
        query = insert(User).values(name = name, email = email, password_hash = hash_password(password)).returning(User)
        with transaction_scope(connection) as active_connection:
            return active_connection.execute(query).mappings().one()

    except IntegrityError as error:
        constraint_name = getattr(error.orig.diag, "constraint_name", "")

        if constraint_name == "users_username_unique":
            raise ConflictError("Username is already taken")

        if constraint_name == "users_email_key":
            raise ConflictError("Email is already registered")

        raise ConflictError("Profile information already exists")

    except SQLAlchemyError as e:
        raise SQLAlchemyError(e)

def update_profile(
    id: UUID,
    name: str,
    email: str,
    username: str,
    connection: Optional[Connection] = None,
):
    try:
        query = (
            update(User)
            .where(User.id == id)
            .values(name=name, username=username, email=email)
            .returning(User.id, User.name, User.username, User.email, User.is_active)
        )
        with transaction_scope(connection) as active_connection:
            return active_connection.execute(query).mappings().one_or_none()

    except IntegrityError as error:
        constraint_name = getattr(error.orig.diag, "constraint_name", "")

        if constraint_name == "users_username_unique":
            raise ConflictError("Username is already taken")

        if constraint_name == "users_email_key":
            raise ConflictError("Email is already registered")

        raise ConflictError("Profile information already exists")

    except SQLAlchemyError as e:
        raise SQLAlchemyError(e)

def getbyemail(
    email: str,
    connection: Optional[Connection] = None,
):
    try:
        query = select(User.id, User.name, User.username, User.email, User.password_hash).where(User.email == email)
        with transaction_scope(connection) as active_connection:
            return active_connection.execute(query).mappings().one_or_none()
    except SQLAlchemyError as e:
        raise SQLAlchemyError(e)

def getbyid(
    id: UUID,
    connection: Optional[Connection] = None,
):
    try:
        query = select(User.id, User.name, User.username, User.email, User.is_active).where(User.id == id)
        with transaction_scope(connection) as active_connection:
            return active_connection.execute(query).mappings().one_or_none()
    except SQLAlchemyError as e:
        raise SQLAlchemyError(e)


def get_password_by_id(
    id: UUID,
    connection: Optional[Connection] = None,
):
    try:
        query = select(User.id, User.password_hash).where(User.id == id)
        with transaction_scope(connection) as active_connection:
            return active_connection.execute(query).mappings().one_or_none()
    except SQLAlchemyError as e:
        raise SQLAlchemyError(e)


def update_password(
    id: UUID,
    password: str,
    connection: Optional[Connection] = None,
):
    try:
        query = (
            update(User)
            .where(User.id == id)
            .values(password_hash=hash_password(password))
            .returning(User.id)
        )
        with transaction_scope(connection) as active_connection:
            return active_connection.execute(query).scalar_one_or_none()
    except SQLAlchemyError as e:
        raise SQLAlchemyError(e)
