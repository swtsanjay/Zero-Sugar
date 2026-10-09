import logging

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import AppError
from app.core.responses import error_response


logger = logging.getLogger(__name__)


async def app_error_handler( request: Request, error: AppError ):
    return error_response(
        status_code=error.status_code,
        message=error.message,
        code=error.code,
        details=error.details,
    )


async def validation_error_handler( request: Request, error: RequestValidationError ):
    details = [
        {
            "field": ".".join(
                str(part) for part in item["loc"]
            ),
            "message": item["msg"],
            "type": item["type"],
        }
        for item in error.errors()
    ]

    return error_response(
        status_code=422,
        message="Request validation failed",
        code="validation_error",
        details=details,
    )


async def http_error_handler( request: Request, error: StarletteHTTPException ):
    return error_response(
        status_code=error.status_code,
        message=str(error.detail),
        code="http_error",
    )


async def unexpected_error_handler( request: Request, error: Exception ):
    logger.exception(
        "Unhandled application error",
        exc_info=error,
    )

    return error_response(
        status_code=500,
        message="An unexpected error occurred",
        code="internal_error",
    )