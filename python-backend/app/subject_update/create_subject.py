from fastapi import APIRouter, HTTPException
from ..models import Subject
from ..database import subjects_collection
from bson import ObjectId
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import json

router = APIRouter()

class CreateSubjectResponse(BaseModel):
    message: str
    subject_id: Optional[str] = None

class SubjectItemSummary(BaseModel):
    subjectId: str
    title: str
    lesson_count: int  # Just return count instead of full lessons

class GetAllSubjectsResponse(BaseModel):
    message: str
    subjects: List[SubjectItemSummary]
    total_subjects: int

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

@router.post("/subjects", response_model=CreateSubjectResponse)
async def create_subject(subject: Subject):
    # Check if subject with the same subjectId already exists
    existing_subject = await subjects_collection.find_one({"subjectId": subject.subjectId})
    
    if existing_subject:
        raise HTTPException(status_code=400, detail="Subject with this ID already exists")
    
    # Insert the new subject into the database
    subject_dict = subject.dict()
    result = await subjects_collection.insert_one(subject_dict)
    
    if result.inserted_id:
        return {"message": "Subject created successfully", "subject_id": str(result.inserted_id)}
    else:
        raise HTTPException(status_code=500, detail="Failed to create subject")

@router.get("/subjects", response_model=GetAllSubjectsResponse)
async def get_all_subjects():
    # Fetch all subjects from the collection
    subjects = []
    async for subject in subjects_collection.find({}):
        # Get the count of lessons instead of the full lessons to avoid ObjectId serialization issues
        lesson_count = len(subject.get("lessons", []))

        subject_data = {
            "subjectId": subject.get("subjectId", ""),
            "title": subject.get("title", ""),
            "lesson_count": lesson_count
        }
        subjects.append(SubjectItemSummary(**subject_data))

    return {
        "message": "Subjects retrieved successfully",
        "subjects": subjects,
        "total_subjects": len(subjects)
    }