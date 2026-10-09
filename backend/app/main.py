

from fastapi import FastAPI
from app.database import Base, engine
from app.routes.messages import router as message_router
from app.routes.health import router as health_router
from app.routes.user import router as user_router
from fastapi.middleware.cors import CORSMiddleware
from app.core.exception_handlers import app_error_handler, http_error_handler, unexpected_error_handler, validation_error_handler
from app.core.exceptions import AppError
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException


if engine is not None:
    Base.metadata.create_all(engine)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(
    AppError,
    app_error_handler,
)

app.add_exception_handler(
    RequestValidationError,
    validation_error_handler,
)

app.add_exception_handler(
    StarletteHTTPException,
    http_error_handler,
)

app.add_exception_handler(
    Exception,
    unexpected_error_handler,
)


app.include_router(message_router)
app.include_router(health_router)
app.include_router(user_router)

@app.get("/")
def home():
    return {"message": "Hello from FastAPI"}

