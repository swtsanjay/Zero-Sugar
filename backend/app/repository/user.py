from app.database import engine
from sqlalchemy import insert
from sqlalchemy.exc import SQLAlchemyError
from app.models.user import User
from app.utils.password import hash_password


def create_user(name: str, email: str, password: str):
    try:
        print('kk')
        query = insert(User).values(name = name, email = email, hash_password = (password)).returning(User)
        print(query)
        with engine.connect() as connection:
            return connection.execute(query).mappings().one()

    except SQLAlchemyError:
        print(repr(SQLAlchemyError))
        raise ValueError(SQLAlchemyError._message)