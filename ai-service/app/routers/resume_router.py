from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.services.text_extractor import extract_text_from_pdf, extract_text_from_txt, clean_extracted_text
from app.services.nlp_extractor import nlp_extractor
from app.models.schemas import ResumeParseResponse
from pydantic import BaseModel

router = APIRouter(prefix="/api/ai", tags=["Resume Analysis"])


class TextParseRequest(BaseModel):
    text: str


@router.post("/parse-resume", response_model=ResumeParseResponse)
async def parse_resume_file(file: UploadFile = File(...)):
    """Uploads a resume file (PDF or TXT) and performs text extraction and NLP skill parsing."""
    try:
        content = await file.read()
        filename = (file.filename or "").lower()

        if filename.endswith(".pdf"):
            extracted_text = extract_text_from_pdf(content)
        else:
            extracted_text = extract_text_from_txt(content)

        if not extracted_text or len(extracted_text.strip()) < 20:
            raise HTTPException(
                status_code=400,
                detail="Could not extract readable text from the uploaded resume. Please upload a standard PDF or text document."
            )

        parsed_data = nlp_extractor.parse_resume(extracted_text)
        return parsed_data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")


@router.post("/parse-resume-text", response_model=ResumeParseResponse)
async def parse_resume_raw_text(payload: TextParseRequest):
    """Parses raw text directly without file upload."""
    if not payload.text or len(payload.text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Text must contain at least 10 characters.")
    
    cleaned = clean_extracted_text(payload.text)
    return nlp_extractor.parse_resume(cleaned)
