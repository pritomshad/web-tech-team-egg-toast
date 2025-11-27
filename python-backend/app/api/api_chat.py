from fastapi import APIRouter, HTTPException, File, UploadFile
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
from perplexity import Perplexity
import anyio
import traceback
import PyPDF2

# --- Initialize Perplexity client ---
client = Perplexity(api_key=os.environ.get("PERPLEXITY_API_KEY"))

router = APIRouter()

# --- Request model for MCQ processing ---
class MCQRequest(BaseModel):
    class_id: str
    subject_id: str

# --- Response model for MCQ question ---
class MCQQuestion(BaseModel):
    question: str
    option1: str
    option2: str
    option3: str
    option4: str

# --- Response model for MCQ processing ---
class MCQResponse(BaseModel):
    success: bool
    questions: List[MCQQuestion] = []
    message: Optional[str] = None

# --- Request model for regular chat ---
class ChatRequest(BaseModel):
    query: str
    age: Optional[int] = None
    context: Optional[str] = None

# --- Response model for regular chat ---
class ChatResponse(BaseModel):
    success: bool
    response: str
    citations: List[Dict[str, Any]] = []
    relatedQuestions: List[Dict[str, Any]] = []

# --- Helper function to extract text from PDF ---
def extract_text_from_pdf(pdf_file) -> str:
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    return text

# --- Main endpoint for regular chat ---
@router.post("", response_model=ChatResponse)
async def ai_chat(payload: ChatRequest):
    query = payload.query.strip()
    age = payload.age
    context = payload.context

    if not query:
        raise HTTPException(status_code=400, detail="Missing 'query'")

    # Build system prompt
    system_prompt = (
        "You are a helpful vaccination assistant for Bangladesh.\n\n"
        "Your responsibilities:\n"
        "- Provide accurate vaccine recommendations based on age and health conditions\n"
        "- Explain the Bangladesh EPI (Expanded Programme on Immunization) schedule\n"
        "- Give information about vaccine safety and side effects\n"
        "- Suggest nearby vaccination centers when asked\n"
        "- Provide health awareness and disease prevention tips\n\n"
        "Guidelines:\n"
        "- Always cite official sources (WHO, Bangladesh DGHS, UNICEF)\n"
        "- Use simple, clear language\n"
        "- Prioritize safety and accuracy\n"
        "- For medical emergencies, advise consulting a healthcare provider\n"
        "- please give the response as html property\n"
        "- please give your answer first in bangla then again in english\n"
    )
    if age is not None:
        system_prompt += f"\nUser's age: {age} years"
    if context:
        system_prompt += f"\nConversation context: {context}"

    # --- Call Perplexity in a thread ---
    def call_perplexity():
        return client.chat.completions.create(
            model="sonar-pro",  # keep sonar-pro as requested
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": query},
            ],
            max_tokens=2000,
            temperature=0.3,
            top_p=0.9,
            search_domain_filter=["dghs.gov.bd", "who.int", "unicef.org", "cdc.gov"],  # added cdc.gov
            return_images=False,
            return_related_questions=True,
            search_recency_filter="month",
            top_k=0,
            stream=False,
            presence_penalty=0,
            frequency_penalty=1,
        )


    try:
        completion = await anyio.to_thread.run_sync(call_perplexity)
    except Exception as e:
        tb = traceback.format_exc()
        print("=== Perplexity call failed ===")
        print(tb)
        return ChatResponse(
            success=False,
            response="Perplexity call failed. See 'error' for details.",
            citations=[],
            relatedQuestions=[]
        )

    # --- Extract response_text safely ---
    response_text = "No response"
    try:
        choice0 = completion.choices[0]

        # First try: if 'message' exists with 'content'
        if getattr(choice0, "message", None):
            response_text = getattr(choice0.message, "content", "No response")

        # Fallback: if 'text' exists
        elif getattr(choice0, "text", None):
            response_text = choice0.text

    except Exception:
        response_text = "No response"

    return ChatResponse(
        success=True,
        response=response_text,
        citations=getattr(completion, "citations", []),
        relatedQuestions=getattr(completion, "related_questions", [])
    )


# --- Helper function to extract MCQ questions from text using Perplexity ---
async def extract_mcq_questions_from_text(text: str) -> List[MCQQuestion]:
    # Prepare a prompt to extract MCQ questions
    system_prompt = (
        "You are an expert educational content analyzer. "
        "Extract multiple-choice questions from the provided text. "
        "Each question should have 4 options (A, B, C, D) formatted as: "
        "question: [question text], option1: [option A text], option2: [option B text], "
        "option3: [option C text], option4: [option D text]. "
        "Return the results as a JSON array of question objects in the exact format required."
    )
    
    user_prompt = f"Please extract all MCQ questions with 4 options from the following text:\n\n{text[:4000]}"  # Limit text to avoid token issues
    
    def call_perplexity():
        return client.chat.completions.create(
            model="sonar-pro",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=4000,
            temperature=0.3,
            top_p=0.9,
            stream=False
        )

    try:
        completion = await anyio.to_thread.run_sync(call_perplexity)
        
        # Extract response text
        response_text = "No response"
        try:
            choice0 = completion.choices[0]
            if getattr(choice0, "message", None):
                response_text = getattr(choice0.message, "content", "No response")
            elif getattr(choice0, "text", None):
                response_text = choice0.text
        except Exception:
            response_text = "No response"

        # Process the response to extract JSON
        import json
        import re
        
        # Try to find JSON in the response
        # Look for JSON array patterns
        json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group()
            try:
                questions_data = json.loads(json_str)
                
                # Convert to MCQQuestion objects
                mcq_questions = []
                for q_data in questions_data:
                    if isinstance(q_data, dict):
                        mcq_questions.append(MCQQuestion(
                            question=q_data.get('question', ''),
                            option1=q_data.get('option1', ''),
                            option2=q_data.get('option2', ''),
                            option3=q_data.get('option3', ''),
                            option4=q_data.get('option4', '')
                        ))
                return mcq_questions
            except json.JSONDecodeError:
                pass  # If JSON parsing fails, continue to alternative processing
        
        # If no JSON found, try to parse as plain text with numbered questions
        questions = []
        lines = response_text.split('\n')
        
        current_question = None
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Check if line starts with a number followed by a question
            if re.match(r'^\d+[.\s].*\?', line):
                # Save previous question if exists
                if current_question and len(current_question) == 5:  # question + 4 options
                    questions.append(MCQQuestion(
                        question=current_question[0],
                        option1=current_question[1],
                        option2=current_question[2],
                        option3=current_question[3],
                        option4=current_question[4]
                    ))
                
                # Start new question
                question_text = re.sub(r'^\d+[.\s]+', '', line).strip()
                current_question = [question_text]  # [question, option1, option2, option3, option4]
                
            elif current_question and len(current_question) < 5:
                # Check if line is an option (A:, B:, C:, D: or 1., 2., 3., 4.)
                option_match = re.match(r'^[A-Da-d][.:)]\s*(.*)', line) or \
                              re.match(r'^[1-4][.:)]\s*(.*)', line)
                if option_match:
                    current_question.append(option_match.group(1).strip())
                elif line.startswith(('a)', 'b)', 'c)', 'd)')):
                    option_text = re.sub(r'^[a-d)]\s*', '', line).strip()
                    current_question.append(option_text)
                elif len(current_question) < 5 and line not in ['A)', 'B)', 'C)', 'D)', 'a)', 'b)', 'c)', 'd)']:
                    # Add as continuation of current option if it's not just a label
                    if len(current_question) > 1:  # We have at least a question
                        current_question[-1] = current_question[-1] + ' ' + line if current_question[-1] else line
        
        # Add last question if it's complete
        if current_question and len(current_question) == 5:
            questions.append(MCQQuestion(
                question=current_question[0],
                option1=current_question[1],
                option2=current_question[2],
                option3=current_question[3],
                option4=current_question[4]
            ))
        
        return questions
    except Exception as e:
        print(f"Error in extracting MCQ from text: {e}")
        return []


# --- New endpoint for MCQ processing ---
@router.post("/mcq", response_model=MCQResponse)
async def process_mcq_pdf(
    class_id: str,
    subject_id: str,
    pdf_file: UploadFile = File(...)
):
    # Validate file type
    if not pdf_file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    try:
        # Extract text from the PDF
        pdf_text = extract_text_from_pdf(pdf_file.file)
        
        # Process the extracted text to identify MCQ questions
        mcq_questions = await extract_mcq_questions_from_text(pdf_text)
        
        return MCQResponse(
            success=True,
            questions=mcq_questions,
            message=f"Successfully processed {len(mcq_questions)} questions from class {class_id}, subject {subject_id}"
        )
        
    except Exception as e:
        tb = traceback.format_exc()
        print("=== MCQ processing failed ===")
        print(tb)
        return MCQResponse(
            success=False,
            questions=[],
            message="MCQ processing failed: " + str(e)
        )