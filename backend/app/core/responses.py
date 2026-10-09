from typing import Any, Generic, Optional, TypeVar

from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pydantic import BaseModel


DataType = TypeVar("DataType")


class ErrorInfo(BaseModel):
    code: str
    details: Optional[Any] = None


class ApiResponse(BaseModel, Generic[DataType]):
    success: bool
    message: str
    data: Optional[DataType] = None
    error: Optional[ErrorInfo] = None


def success_response( data: Optional[DataType] = None, message: str = "Request completed successfully") -> ApiResponse[DataType]:
    return ApiResponse[DataType](
        success=True,
        message=message,
        data=data,
        error=None,
    )


def error_response( status_code: int, message: str, code: str, details: Optional[Any] = None ) -> JSONResponse:
    response = ApiResponse[None](
        success=False,
        message=message,
        data=None,
        error=ErrorInfo(
            code=code,
            details=details,
        ),
    )

    return JSONResponse(
        status_code=status_code,
        content=jsonable_encoder(response),
    )