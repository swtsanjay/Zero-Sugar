from typing import Any, Optional


class AppError(Exception):
    def __init__( self, message: str, status_code: int = 500, code: str = "internal_error", details: Optional[Any] = None ):
        self.message = message
        self.status_code = status_code
        self.code = code
        self.details = details

        super().__init__(message)


class NotFoundError(AppError):
    def __init__( self, message: str = "Resource not found" ):
        super().__init__(
            message=message,
            status_code=404,
            code="not_found",
        )


class ConflictError(AppError):
    def __init__( self, message: str = "Resource already exists" ):
        super().__init__(
            message=message,
            status_code=409,
            code="conflict",
        )


class BadRequestError(AppError):
    def __init__( self, message: str = "Invalid request", code: str = "bad_request" ):
        super().__init__(
            message=message,
            status_code=400,
            code=code,
        )


class AuthenticationError(AppError):
    def __init__( self, message: str = "Invalid email or password" ):
        super().__init__(
            message=message,
            status_code=401,
            code="authentication_failed",
        )
