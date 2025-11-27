# app/api/ai_router.py
from fastapi import APIRouter
from .update_question import router as question_rou

# This `api_router` matches the pattern used in your existing user router
question_router = APIRouter()
# no additional prefix so ai_chat route remains available at /api/ai-chat (main adds /api)
# question_router.include_router(ai_chat_router)
question_router.include_router(question_rou, prefix="/update", tags=["update"])