from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# ---------------------------------------------------------
# Resume Parsing Schemas
# ---------------------------------------------------------
class ParsedEducation(BaseModel):
    degree: Optional[str] = None
    institution: Optional[str] = None
    year: Optional[str] = None
    grade: Optional[str] = None

class ParsedExperience(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None

class ParsedProject(BaseModel):
    title: Optional[str] = None
    technologies: List[str] = []
    description: Optional[str] = None

class ResumeParseResponse(BaseModel):
    success: bool
    skills: List[str] = []
    technical_skills: List[str] = []
    soft_skills: List[str] = []
    education: List[ParsedEducation] = []
    experience: List[ParsedExperience] = []
    projects: List[ParsedProject] = []
    certifications: List[str] = []
    experience_years_estimated: float = 0.0
    raw_text: str = ""
    summary: Optional[str] = None


# ---------------------------------------------------------
# Job Matching Schemas (Explainable 60 / 20 / 10 / 10)
# ---------------------------------------------------------
class CandidateProfileInput(BaseModel):
    skills: List[str] = []
    experience_years: float = 0.0
    education_level: Optional[str] = "Bachelor's"
    major: Optional[str] = None
    projects: List[str] = []
    bio: Optional[str] = None

class JobRequirementInput(BaseModel):
    title: str
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    min_exp_years: float = 0.0
    education_required: Optional[str] = "Bachelor's"
    description: Optional[str] = ""

class ScoreBreakdown(BaseModel):
    skill_score: float = Field(..., description="Out of 60%")
    experience_score: float = Field(..., description="Out of 20%")
    education_score: float = Field(..., description="Out of 10%")
    project_score: float = Field(..., description="Out of 10%")
    total_score: float = Field(..., description="Overall match percentage out of 100%")

class JobMatchResponse(BaseModel):
    match_percentage: float
    breakdown: ScoreBreakdown
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    preferred_matched: List[str] = []
    explanation: str
    recommendation_verdict: str


# ---------------------------------------------------------
# Career Recommendation Schemas
# ---------------------------------------------------------
class CareerRecommendationItem(BaseModel):
    role_id: int
    title: str
    category: str
    match_score: float
    avg_salary: str
    growth_rate: str
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    recommended_skills: List[str] = []
    explanation: str
    roadmap: List[str] = []

class CareerRecommendationResponse(BaseModel):
    candidate_skills: List[str]
    top_recommendations: List[CareerRecommendationItem]


# ---------------------------------------------------------
# Skill Gap Analysis Schemas
# ---------------------------------------------------------
class SkillGapRequest(BaseModel):
    candidate_skills: List[str]
    target_role_or_job_title: Optional[str] = None
    target_skills: List[str] = []

class SkillGapResponse(BaseModel):
    target: str
    overall_readiness: float
    strong_skills: List[str] = []
    moderate_skills: List[str] = []
    missing_skills: List[str] = []
    recommended_to_learn: List[str] = []
    action_plan: List[str] = []
