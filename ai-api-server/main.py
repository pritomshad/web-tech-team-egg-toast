import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uvicorn
from dotenv import load_dotenv
import requests
from pypdf import PdfReader
import json
import io

# Load environment variables
load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Option(BaseModel):
    pass

class Question(BaseModel):
    question: str
    options: List[str]
    answer: str

class QuizResponse(BaseModel):
    questions: List[Question]

@app.post("/api/upload-pdf")
async def upload_pdf(pdf: UploadFile = File(...)):
    if not pdf.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")
    if not PERPLEXITY_API_KEY:
        print("Error: PERPLEXITY_API_KEY not found in environment variables")
        raise HTTPException(status_code=500, detail="Server configuration error: API Key missing")

    try:
        # Read PDF content
        content = await pdf.read()
        pdf_file = io.BytesIO(content)
        reader = PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        
        # Limit text length to avoid token limits (approx 30k chars)
        text = text[:30000]

        # Generate questions using Perplexity AI
        url = "https://api.perplexity.ai/chat/completions"
        
        system_prompt = """You are a helpful assistant that generates multiple choice questions from text. 
        Return ONLY a RAW JSON array of objects (no markdown, no code blocks, no explanations).
        Each object must have:
        - "question": The question text
        - "options": An array of 4 possible answers
        - "answer": The correct answer (must be one of the options)"""

        user_prompt = f"Generate 10 multiple choice questions based on the following text: {text}"

        payload = {
            "model": "sonar-pro",
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ]
        }
        
        headers = {
            "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
            "Content-Type": "application/json"
        }

        response = requests.post(url, json=payload, headers=headers)

        if response.status_code != 200:
            print("Perplexity Error Response:", response.text)
            raise HTTPException(status_code=500, detail=f"Perplexity API error: {response.text}")

        
        result = response.json()
        response_text = result['choices'][0]['message']['content']
        
        # Clean up response if it contains markdown formatting
        response_text = response_text.replace("```json", "").replace("```", "").strip()
        
        try:
            questions_data = json.loads(response_text)
            return {"questions": questions_data}
        except json.JSONDecodeError:
            print(f"Failed to parse JSON: {response_text}")
            raise HTTPException(status_code=500, detail="Failed to parse AI response")

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error processing PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
