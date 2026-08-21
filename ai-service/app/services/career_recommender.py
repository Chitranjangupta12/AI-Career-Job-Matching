import json
import os
from typing import List, Dict, Any
from app.services.skill_normalizer import skill_normalizer
from app.models.schemas import CandidateProfileInput, CareerRecommendationItem, CareerRecommendationResponse


class CareerRecommender:
    def __init__(self, roles_path: str = None):
        if not roles_path:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            roles_path = os.path.join(base_dir, 'data', 'career_roles.json')
        
        self.roles_path = roles_path
        self.normalizer = skill_normalizer
        self.roles = self._load_roles()

    def _load_roles(self) -> List[Dict[str, Any]]:
        try:
            with open(self.roles_path, 'r', encoding='utf-8-sig') as f:
                data = json.load(f)
                return data.get("roles", [])
        except Exception as e:
            print(f"Error loading career roles: {e}")
            return []

    def recommend_careers(
        self, candidate: CandidateProfileInput, interests: str = ""
    ) -> CareerRecommendationResponse:
        """Evaluates candidate across all career roles and returns Top 5 ranked recommendations."""
        cand_skills = set(self.normalizer.normalize_skill_list(candidate.skills))
        ranked_items = []

        for role in self.roles:
            core_skills = self.normalizer.normalize_skill_list(role.get("core_skills", []))
            secondary_skills = self.normalizer.normalize_skill_list(role.get("secondary_skills", []))

            matched_core = [s for s in core_skills if s in cand_skills]
            missing_core = [s for s in core_skills if s not in cand_skills]
            matched_sec = [s for s in secondary_skills if s in cand_skills]
            missing_sec = [s for s in secondary_skills if s not in cand_skills]

            # Core skills weight (65%), Secondary skills weight (25%), Interests/Projects weight (10%)
            core_ratio = len(matched_core) / len(core_skills) if core_skills else 0.0
            sec_ratio = len(matched_sec) / len(secondary_skills) if secondary_skills else 0.0

            # Bonus for interests match
            interest_bonus = 0.0
            if interests and (role["title"].lower() in interests.lower() or role.get("category", "").lower() in interests.lower()):
                interest_bonus = 10.0

            score = (core_ratio * 65.0) + (sec_ratio * 25.0) + interest_bonus
            # Base floor for zero matches so student sees clear gaps to work towards
            final_score = round(min(100.0, max(5.0, score)), 1)

            all_matched = sorted(list(set(matched_core + matched_sec)))
            all_missing = sorted(list(set(missing_core + missing_sec)))
            recommended_to_learn = missing_core + missing_sec[:3]

            # Explanation
            if len(matched_core) == len(core_skills) and len(core_skills) > 0:
                explanation = f"Outstanding match! You possess 100% of the core competencies for {role['title']}."
            elif len(matched_core) > 0:
                explanation = f"Strong alignment with {len(matched_core)} of {len(core_skills)} core skills matched ({', '.join(matched_core)}). Acquiring {', '.join(missing_core[:2])} will elevate your readiness."
            else:
                explanation = f"Emerging pathway. Mastering core foundational skills like {', '.join(core_skills[:3])} will unlock this high-growth domain."

            ranked_items.append(CareerRecommendationItem(
                role_id=role.get("id", 1),
                title=role["title"],
                category=role.get("category", "Software Engineering"),
                match_score=final_score,
                avg_salary=role.get("avg_salary", "$90,000 - $130,000"),
                growth_rate=role.get("growth_rate", "High"),
                matched_skills=all_matched,
                missing_skills=all_missing,
                recommended_skills=recommended_to_learn,
                explanation=explanation,
                roadmap=role.get("roadmap", [])
            ))

        # Sort descending by match_score
        ranked_items.sort(key=lambda x: x.match_score, reverse=True)
        top_5 = ranked_items[:5]

        return CareerRecommendationResponse(
            candidate_skills=sorted(list(cand_skills)),
            top_recommendations=top_5
        )


career_recommender = CareerRecommender()
