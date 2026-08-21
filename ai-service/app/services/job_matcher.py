from typing import List, Dict, Any, Tuple
from app.services.skill_normalizer import skill_normalizer
from app.models.schemas import (
    CandidateProfileInput,
    JobRequirementInput,
    JobMatchResponse,
    ScoreBreakdown
)


class ExplainableJobMatcher:
    def __init__(self):
        self.normalizer = skill_normalizer

    def _evaluate_skills(
        self, candidate_skills: List[str], required_skills: List[str], preferred_skills: List[str]
    ) -> Tuple[float, List[str], List[str], List[str]]:
        """Evaluates skill match and computes score out of 60%."""
        norm_candidate = set(self.normalizer.normalize_skill_list(candidate_skills))
        norm_required = self.normalizer.normalize_skill_list(required_skills)
        norm_preferred = self.normalizer.normalize_skill_list(preferred_skills)

        matched_req = [s for s in norm_required if s in norm_candidate]
        missing_req = [s for s in norm_required if s not in norm_candidate]
        matched_pref = [s for s in norm_preferred if s in norm_candidate]

        total_req_count = len(norm_required)
        total_pref_count = len(norm_preferred)

        if total_req_count == 0 and total_pref_count == 0:
            # If no skills listed, default baseline score
            skill_score = 45.0
        elif total_pref_count == 0:
            # All 60% allocated to required skills
            ratio = len(matched_req) / total_req_count if total_req_count > 0 else 1.0
            skill_score = ratio * 60.0
        elif total_req_count == 0:
            # All 60% allocated to preferred skills
            ratio = len(matched_pref) / total_pref_count if total_pref_count > 0 else 1.0
            skill_score = ratio * 60.0
        else:
            # 45% for required skills + 15% for preferred skills
            req_ratio = len(matched_req) / total_req_count
            pref_ratio = len(matched_pref) / total_pref_count
            skill_score = (req_ratio * 45.0) + (pref_ratio * 15.0)

        return round(skill_score, 1), matched_req, missing_req, matched_pref

    def _evaluate_experience(self, candidate_exp: float, min_exp_required: float) -> float:
        """Evaluates experience match out of 20%."""
        if min_exp_required <= 0:
            return 20.0
        if candidate_exp >= min_exp_required:
            return 20.0
        ratio = max(0.0, candidate_exp / min_exp_required)
        return round(ratio * 20.0, 1)

    def _evaluate_education(self, candidate_edu: str, required_edu: str) -> float:
        """Evaluates education match out of 10%."""
        if not required_edu or not candidate_edu:
            return 8.0

        hierarchy = {
            "high school": 1,
            "diploma": 2,
            "associate": 2,
            "bachelor": 3,
            "b.tech": 3,
            "b.e": 3,
            "b.sc": 3,
            "master": 4,
            "m.tech": 4,
            "m.s": 4,
            "phd": 5,
            "doctorate": 5
        }

        def get_rank(edu_str: str) -> int:
            edu_lower = edu_str.lower()
            for key, rank in sorted(hierarchy.items(), key=lambda x: x[1], reverse=True):
                if key in edu_lower:
                    return rank
            return 3  # default bachelor equivalent

        c_rank = get_rank(candidate_edu)
        r_rank = get_rank(required_edu)

        if c_rank >= r_rank:
            return 10.0
        elif c_rank == r_rank - 1:
            return 7.5
        else:
            return 5.0

    def _evaluate_projects(
        self, candidate_projects: List[str], candidate_skills: List[str], job_desc: str, required_skills: List[str]
    ) -> float:
        """Evaluates project relevance out of 10%."""
        if not candidate_projects and not candidate_skills:
            return 3.0
        
        # Check project overlap with required tech
        proj_text = " ".join(candidate_projects).lower()
        req_norm = self.normalizer.normalize_skill_list(required_skills)
        if not req_norm:
            return 8.0

        matched_in_projects = sum(1 for s in req_norm if s.lower() in proj_text)
        ratio = matched_in_projects / len(req_norm) if len(req_norm) > 0 else 0.5
        score = 5.0 + (ratio * 5.0)  # Base 5 for having projects + up to 5 for skill overlap
        return round(min(10.0, score), 1)

    def match(self, candidate: CandidateProfileInput, job: JobRequirementInput) -> JobMatchResponse:
        """Computes transparent, explainable 60/20/10/10 job match score."""
        skill_score, matched_req, missing_req, matched_pref = self._evaluate_skills(
            candidate.skills, job.required_skills, job.preferred_skills
        )
        exp_score = self._evaluate_experience(candidate.experience_years, job.min_exp_years)
        edu_score = self._evaluate_education(candidate.education_level or "", job.education_required or "")
        proj_score = self._evaluate_projects(
            candidate.projects, candidate.skills, job.description or "", job.required_skills
        )

        total_score = round(min(100.0, skill_score + exp_score + edu_score + proj_score), 1)

        # Generate Explainable Text
        req_total = len(job.required_skills)
        req_matched = len(matched_req)
        
        if req_total > 0:
            skills_part = f"The candidate matches {req_matched} of {req_total} required skills ({int(req_matched/req_total*100)}%)."
        else:
            skills_part = "General skill profile aligns well with role requirements."

        if candidate.experience_years >= job.min_exp_years:
            exp_part = f"Experience requirement ({job.min_exp_years} yrs) is fully satisfied with {candidate.experience_years:.1f} yrs."
        else:
            exp_part = f"Experience is {candidate.experience_years:.1f} yrs against {job.min_exp_years} yrs required."

        explanation = f"{skills_part} {exp_part} Education match contributes {edu_score}/10 points and project relevance adds {proj_score}/10 points."

        # Verdict
        if total_score >= 75:
            verdict = "High Match - Highly Recommended"
        elif total_score >= 50:
            verdict = "Moderate Match - Potential Candidate with Skill Gaps"
        else:
            verdict = "Low Match - Significant Skill or Experience Gap"

        all_matched = sorted(list(set(matched_req + matched_pref)))

        return JobMatchResponse(
            match_percentage=total_score,
            breakdown=ScoreBreakdown(
                skill_score=skill_score,
                experience_score=exp_score,
                education_score=edu_score,
                project_score=proj_score,
                total_score=total_score
            ),
            matched_skills=all_matched,
            missing_skills=missing_req,
            preferred_matched=matched_pref,
            explanation=explanation,
            recommendation_verdict=verdict
        )


job_matcher = ExplainableJobMatcher()
