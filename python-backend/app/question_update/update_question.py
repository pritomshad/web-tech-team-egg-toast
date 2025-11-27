from fastapi import APIRouter, HTTPException
from ..models import Question
from ..database import subjects_collection
from bson import ObjectId
router = APIRouter()
@router.post("/subjects/{subject_id}/lessons/{lesson_index}/questions")
async def add_question(subject_id: str, lesson_index: int, question: Question):
    subject = await subjects_collection.find_one({"subjectId": subject_id})

    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    if lesson_index < 0 or lesson_index >= len(subject["lessons"]):
        raise HTTPException(status_code=400, detail="Invalid lesson index")

    # Append new question to lesson
    subject["lessons"][lesson_index]["questions"].append(question.dict())

    # Update in DB
    await subjects_collection.update_one(
        {"subjectId": subject_id},
        {"$set": {"lessons": subject["lessons"]}}
    )

    return {"message": "Question added successfully"}
