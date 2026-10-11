import os
from fastapi import APIRouter
from app.core.responses import ApiResponse, success_response


router = APIRouter(tags=["Public"], prefix="/public")

ALL_LLMS = [
    model.strip()
    for model in os.getenv("OLLAMA_MODELS", "qwen3:14b").split(",")
    if model.strip()
]

@router.get("/get-allmodels", response_model=ApiResponse[list[str]])
def get_all_models():
    return success_response(
        data=ALL_LLMS,
        message="Models fetched successfully",
    )
