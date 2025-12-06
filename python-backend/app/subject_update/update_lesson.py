from fastapi import APIRouter, HTTPException
from ..models import Lesson
from ..database import subjects_collection
from bson import ObjectId

router = APIRouter()

@router.post("/subjects/{subject_id}/lessons")
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

@router.get("/subjects/{subject_id}/lessons")
async def get_all_lessons(subject_id: str):
    subject = await subjects_collection.find_one({"subjectId": subject_id})

    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    return {
        "message": "Lessons retrieved successfully",
        "subject_id": subject_id,
        "lessons": subject["lessons"],
        "total_lessons": len(subject["lessons"])
    }