import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import resume_router, matching_router, career_router, skill_gap_router
from app.services.skill_normalizer import skill_normalizer
from app.services.career_recommender import career_recommender

app = FastAPI(
    title="AI Career Guidance & Job Matching Engine",
    description="Python FastAPI NLP microservice for resume extraction, skill normalization, explainable job matching (60/20/10/10), career recommendation, and skill gap analysis.",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(resume_router.router)
app.include_router(matching_router.router)
app.include_router(career_router.router)
app.include_router(skill_gap_router.router)


@app.get("/api/ai/health")
async def health_check():
    return {
        "status": "online",
        "service": "AI Career Guidance & Job Matching Engine",
        "skills_in_taxonomy": len(skill_normalizer.all_canonical_skills),
        "career_roles_loaded": len(career_recommender.roles)
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
