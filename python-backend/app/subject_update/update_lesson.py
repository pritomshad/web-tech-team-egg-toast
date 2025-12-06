from fastapi import APIRouter, HTTPException
from ..models import Lesson
from ..database import subjects_collection
from bson import ObjectId
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class AddLessonResponse(BaseModel):
    message: str
    lesson_title: str
    lesson_index: int

class LessonResponse(BaseModel):
    message: str
    subject_id: str
    lessons: List[dict]
    total_lessons: int

@router.post("/subjects/{subject_id}/lessons", response_model=AddLessonResponse)
async def add_lesson(subject_id: str, lesson: Lesson):
    subject = await subjects_collection.find_one({"subjectId": subject_id})

    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    # Get the index of the new lesson before adding it
    lesson_index = len(subject["lessons"])

    # Add new lesson to subject
    lesson_dict = lesson.dict()
    subject["lessons"].append(lesson_dict)

    # Update in DB
    await subjects_collection.update_one(
        {"subjectId": subject_id},
        {"$set": {"lessons": subject["lessons"]}}
    )

    return {
        "message": "Lesson added successfully",
        "lesson_title": lesson.title,
        "lesson_index": lesson_index
    }

@router.get("/subjects/{subject_id}/lessons", response_model=LessonResponse)
async def get_all_lessons(subject_id: str):
    subject = await subjects_collection.find_one({"subjectId": subject_id})

    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    # Process lessons to ensure they can be serialized properly
    processed_lessons = []
    for lesson in subject["lessons"]:
        # Handle datetime conversion if needed
        if "createdAt" in lesson and isinstance(lesson["createdAt"], datetime):
            lesson["createdAt"] = lesson["createdAt"].isoformat()
        processed_lessons.append(lesson)

    return {
        "message": "Lessons retrieved successfully",
        "subject_id": subject_id,
        "lessons": processed_lessons,
        "total_lessons": len(processed_lessons)
    }