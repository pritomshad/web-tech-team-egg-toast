from fastapi import APIRouter, HTTPException
from ..models import Lesson
from ..database import subjects_collection
from bson import ObjectId
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json

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

# Helper function to convert MongoDB documents to JSON-serializable format
def convert_mongo_document(doc):
    """Convert MongoDB document with ObjectIds and dates to JSON-serializable format"""
    if isinstance(doc, dict):
        result = {}
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                result[key] = str(value)
            elif isinstance(value, datetime):
                result[key] = value.isoformat()
            elif isinstance(value, list):
                result[key] = [convert_mongo_document(item) for item in value]
            elif isinstance(value, dict):
                result[key] = convert_mongo_document(value)
            else:
                result[key] = value
        return result
    elif isinstance(doc, list):
        return [convert_mongo_document(item) for item in doc]
    else:
        return doc

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

    # Process lessons to convert MongoDB-specific types to JSON-serializable format
    processed_lessons = []
    for lesson in subject["lessons"]:
        processed_lesson = convert_mongo_document(lesson)
        # Add the processed lesson to the list
        processed_lessons.append(processed_lesson)

    return {
        "message": "Lessons retrieved successfully",
        "subject_id": subject_id,
        "lessons": processed_lessons,
        "total_lessons": len(processed_lessons)
    }