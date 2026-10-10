from contextlib import contextmanager
from math import ceil
from typing import Any, Iterator, Optional, TypedDict

from sqlalchemy import func, select
from sqlalchemy.engine import Connection, Engine
from sqlalchemy.sql import Select

from app.database import engine


class PaginationMetadata(TypedDict):
    page: int
    limit: int
    total: int
    total_pages: int
    has_next: bool
    has_previous: bool


class PaginationResult(TypedDict):
    items: list[Any]
    pagination: PaginationMetadata


@contextmanager
def transaction_scope( connection: Optional[Connection] = None ) -> Iterator[Connection]:
    if connection is not None:
        yield connection
        return

    if engine is None:
        raise RuntimeError("Database engine is not configured")

    with engine.begin() as new_connection:
        yield new_connection


def paginate( engine: Engine, query: Select, page_query: dict[str, int], connection: Optional[Connection] ) -> PaginationResult:
    page = max(int(page_query.get("page", 1)), 1)
    limit = max(int(page_query.get("limit", 20)), 1)
    offset = (page - 1) * limit

    count_query = select(func.count()).select_from(
        query.order_by(None).subquery()
    )
    paginated_query = query.limit(limit).offset(offset)

    with transaction_scope(connection) as active_connection:
        total = active_connection.execute(count_query).scalar_one()
        items = active_connection.execute(paginated_query).mappings().all()

    total_pages = ceil(total / limit) if total else 0

    return {
        "items": items,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_previous": page > 1,
        },
    }
