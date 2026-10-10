from math import ceil
from typing import Any, TypedDict

from sqlalchemy import func, select
from sqlalchemy.engine import Engine
from sqlalchemy.sql import Select


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


def paginate( engine: Engine, query: Select, page_query: dict[str, int] ) -> PaginationResult:
    page = max(int(page_query.get("page", 1)), 1)
    limit = max(int(page_query.get("limit", 20)), 1)
    offset = (page - 1) * limit

    count_query = select(func.count()).select_from(
        query.order_by(None).subquery()
    )
    paginated_query = query.limit(limit).offset(offset)

    with engine.connect() as connection:
        total = connection.execute(count_query).scalar_one()
        items = connection.execute(paginated_query).mappings().all()

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
