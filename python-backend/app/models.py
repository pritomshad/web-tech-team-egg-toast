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
    classLevel: str

class Subject(BaseModel):
    subjectId: str
    title: str
   
    lessons: List[Lesson] = []


# const lessonSchema = new Schema({
#     title: {
#         type: String,
#         required: true,
#         trim: true,
#     },
#     questions: [questionSchema],
#     createdAt: {
#         type: Date,
#         default: Date.now,
#     },
#     classLevel: {
#         type: String,
#         required: true,
#     },
#     subjectId: {
#         type: Schema.Types.ObjectId,
#         ref: 'Subject',
#         required: true,
#     },
# });


# const subjectSchema = new Schema({
#     title: {
#         type: String,
#         required: true,
#         trim: true,
#     },
#     classLevel: {
#         type: String,
#         required: true,
#     },
#     createdAt: {
#         type: Date,
#         default: Date.now,
#     },
# });