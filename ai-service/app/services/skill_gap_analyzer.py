from typing import List, Dict, Any, Set
from app.services.skill_normalizer import skill_normalizer
from app.services.career_recommender import career_recommender
from app.models.schemas import SkillGapRequest, SkillGapResponse


class SkillGapAnalyzer:
    def __init__(self):
        self.normalizer = skill_normalizer
        self.career_recommender = career_recommender

    def analyze_gap(self, req: SkillGapRequest) -> SkillGapResponse:
        cand_skills = set(self.normalizer.normalize_skill_list(req.candidate_skills))
        target_skills = req.target_skills

        target_name = req.target_role_or_job_title or "Target Position"

        # If no explicit target skills provided, lookup from career roles
        if not target_skills and req.target_role_or_job_title:
            for role in self.career_recommender.roles:
                if role["title"].lower() == req.target_role_or_job_title.lower():
                    target_skills = role.get("core_skills", []) + role.get("secondary_skills", [])
                    break

        if not target_skills:
            target_skills = ["Python", "JavaScript", "SQL", "Git", "Problem Solving"]

        norm_target_skills = self.normalizer.normalize_skill_list(target_skills)
        target_set = set(norm_target_skills)

        # Categorization logic
        strong_skills = []
        moderate_skills = []
        missing_skills = []

        for skill in norm_target_skills:
            if skill in cand_skills:
                strong_skills.append(skill)
            else:
                # Check for category adjacency or related domain
                cat = self.normalizer.get_category(skill)
                # If candidate has other skills in the same category, mark as Moderate
                has_adjacent = any(
                    self.normalizer.get_category(cs) == cat for cs in cand_skills
                )
                if has_adjacent and cat != "Soft Skills":
                    moderate_skills.append(skill)
                else:
                    missing_skills.append(skill)

        # Readiness score
        total_target = len(norm_target_skills)
        if total_target > 0:
            readiness = ((len(strong_skills) * 1.0) + (len(moderate_skills) * 0.5)) / total_target * 100.0
        else:
            readiness = 100.0

        recommended_to_learn = missing_skills + moderate_skills

        # Action plan
        action_plan = []
        if missing_skills:
            action_plan.append(f"Phase 1 (Foundational): Learn high-priority missing technologies ({', '.join(missing_skills[:3])}).")
        if moderate_skills:
            action_plan.append(f"Phase 2 (Deepening): Expand hands-on proficiency in complementary tools ({', '.join(moderate_skills[:3])}).")
        action_plan.append("Phase 3 (Capstone Project): Build and deploy an end-to-end project integrating these skills.")
        action_plan.append("Phase 4 (Portfolio & Verification): Document project architecture on GitHub and add verified skills to your profile.")

        return SkillGapResponse(
            target=target_name,
            overall_readiness=round(min(100.0, readiness), 1),
            strong_skills=strong_skills,
            moderate_skills=moderate_skills,
            missing_skills=missing_skills,
            recommended_to_learn=recommended_to_learn,
            action_plan=action_plan
        )


skill_gap_analyzer = SkillGapAnalyzer()
