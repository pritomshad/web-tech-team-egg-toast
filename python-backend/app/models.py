from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class Question(BaseModel):
    question: str
    options: List[str]
    answer: str


class Lesson(BaseModel):
    title: str
    questions: List[Question] = []
    createdAt: datetime = datetime.utcnow()


class Subject(BaseModel):
    subjectId: str
    title: str
    classLevel: str
    lessons: List[Lesson] = []
