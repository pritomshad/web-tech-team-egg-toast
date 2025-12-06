from fastapi import APIRouter, HTTPException
from ..models import Subject
from ..database import subjects_collection
from bson import ObjectId
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

class CreateSubjectResponse(BaseModel):
    message: str
    subject_id: Optional[str] = None

class SubjectItem(BaseModel):
    subjectId: str
    title: str
    lessons: List[dict]

class GetAllSubjectsResponse(BaseModel):
    message: str
    subjects: List[SubjectItem]
    total_subjects: int

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
        # Remove ObjectId and convert to string if needed
        subject_data = {
            "subjectId": subject.get("subjectId", ""),
            "title": subject.get("title", ""),
            "lessons": subject.get("lessons", [])
        }
        subjects.append(SubjectItem(**subject_data))

    return {
        "message": "Subjects retrieved successfully",
        "subjects": subjects,
        "total_subjects": len(subjects)
    }