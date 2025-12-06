from fastapi import APIRouter, HTTPException
from ..models import Question
from ..database import subjects_collection
from bson import ObjectId
from pydantic import BaseModel
from typing import List

router = APIRouter()

class AddQuestionResponse(BaseModel):
    message: str

class GetQuestionsResponse(BaseModel):
    message: str
    subject_id: str
    lesson_index: int
    questions: List[dict]
    total_questions: int

@router.post("/subjects/{subject_id}/lessons/{lesson_index}/questions", response_model=AddQuestionResponse)
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

@router.get("/subjects/{subject_id}/lessons/{lesson_index}/questions", response_model=GetQuestionsResponse)
async def get_questions(subject_id: str, lesson_index: int):
    subject = await subjects_collection.find_one({"subjectId": subject_id})

    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    if lesson_index < 0 or lesson_index >= len(subject["lessons"]):
        raise HTTPException(status_code=400, detail="Invalid lesson index")

    # Get questions from the specific lesson
    questions = subject["lessons"][lesson_index]["questions"]

    return {
        "message": "Questions retrieved successfully",
        "subject_id": subject_id,
        "lesson_index": lesson_index,
        "questions": questions,
        "total_questions": len(questions)
    }