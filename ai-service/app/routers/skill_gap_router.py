from fastapi import APIRouter, HTTPException
from app.models.schemas import SkillGapRequest, SkillGapResponse
from app.services.skill_gap_analyzer import skill_gap_analyzer

router = APIRouter(prefix="/api/ai", tags=["Skill Gap Analysis"])


@router.post("/skill-gap", response_model=SkillGapResponse)
async def analyze_skill_gap(payload: SkillGapRequest):
    """Analyzes candidate skills against a target role/job and groups into Strong, Moderate, Missing."""
    try:
        gap_analysis = skill_gap_analyzer.analyze_gap(payload)
        return gap_analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Skill gap analysis failed: {str(e)}")
