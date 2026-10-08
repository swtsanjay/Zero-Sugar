

from fastapi import FastAPI
from app.database import Base, engine
from app.routes.messages import router as message_router
from app.routes.health import router as health_router
from app.routes.user import router as user_router
from fastapi.middleware.cors import CORSMiddleware

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


app.include_router(message_router)
app.include_router(health_router)
app.include_router(user_router)

@app.get("/")
def home():
    return {"message": "Hello from FastAPI"}

