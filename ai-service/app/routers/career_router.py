from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.models.schemas import CandidateProfileInput, CareerRecommendationResponse
from app.services.career_recommender import career_recommender

router = APIRouter(prefix="/api/ai", tags=["Career Guidance"])


class CareerRecommendPayload(BaseModel):
    candidate: CandidateProfileInput
    interests: Optional[str] = ""


@router.post("/career-recommendation", response_model=CareerRecommendationResponse)
async def get_career_recommendations(payload: CareerRecommendPayload):
    """Evaluates candidate skills & profile to generate top 5 career recommendations."""
    try:
        recommendations = career_recommender.recommend_careers(payload.candidate, payload.interests or "")
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Career recommendation failed: {str(e)}")


@router.get("/career-roles")
async def list_career_roles():
    """Returns knowledge base of all career roles with roadmap and required competencies."""
    return {"roles": career_recommender.roles}
