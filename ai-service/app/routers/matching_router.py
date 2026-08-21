from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models.schemas import CandidateProfileInput, JobRequirementInput, JobMatchResponse
from app.services.job_matcher import job_matcher

router = APIRouter(prefix="/api/ai", tags=["Job Matching"])


class JobMatchPayload(BaseModel):
    candidate: CandidateProfileInput
    job: JobRequirementInput


@router.post("/match-job", response_model=JobMatchResponse)
async def match_candidate_to_job(payload: JobMatchPayload):
    """Calculates explainable 60/20/10/10 job match score between candidate and job requirements."""
    try:
        result = job_matcher.match(payload.candidate, payload.job)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Job matching failed: {str(e)}")
