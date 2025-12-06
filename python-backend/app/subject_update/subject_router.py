# app/subject_update/subject_router.py
from fastapi import APIRouter
from .create_subject import router as create_subject_router
from .update_lesson import router as update_lesson_router

# This `subject_router` matches the pattern used in your existing routers
subject_router = APIRouter()
# Include the create subject router with prefix
subject_router.include_router(create_subject_router, prefix="/create", tags=["create"])
subject_router.include_router(update_lesson_router, prefix="/update", tags=["update"])