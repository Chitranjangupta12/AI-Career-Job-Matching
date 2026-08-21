import json
import os
import re
from typing import Dict, List, Optional, Set, Tuple


class SkillNormalizer:
    def __init__(self, taxonomy_path: Optional[str] = None):
        if not taxonomy_path:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            taxonomy_path = os.path.join(base_dir, 'data', 'skills_taxonomy.json')
        
        self.taxonomy_path = taxonomy_path
        self.alias_to_canonical: Dict[str, str] = {}
        self.skill_categories: Dict[str, str] = {}
        self.all_canonical_skills: Set[str] = set()
        self._load_taxonomy()

    def _load_taxonomy(self):
        try:
            with open(self.taxonomy_path, 'r', encoding='utf-8-sig') as f:
                data = json.load(f)
            
            for item in data.get("skills", []):
                canonical = item["name"]
                category = item.get("category", "Technical")
                self.all_canonical_skills.add(canonical)
                self.skill_categories[canonical] = category

                # Map lowercase canonical name
                self.alias_to_canonical[canonical.lower()] = canonical

                # Map all aliases
                for alias in item.get("aliases", []):
                    self.alias_to_canonical[alias.lower()] = canonical
        except Exception as e:
            print(f"Warning: Could not load skills taxonomy from {self.taxonomy_path}: {e}")

    def normalize_skill(self, skill_text: str) -> str:
        """Returns the canonical skill name if recognized; otherwise returns clean title-cased string."""
        if not skill_text:
            return ""
        clean_input = skill_text.strip().lower()
        if clean_input in self.alias_to_canonical:
            return self.alias_to_canonical[clean_input]
        
        # Handle punctuation-trimmed lookup
        trimmed = re.sub(r'^[^\w+#]+|[^\w+#]+$', '', clean_input)
        if trimmed in self.alias_to_canonical:
            return self.alias_to_canonical[trimmed]

        return skill_text.strip().title()

    def normalize_skill_list(self, raw_skills: List[str]) -> List[str]:
        """Normalizes a list of skills and removes duplicates while preserving canonical order."""
        seen = set()
        normalized = []
        for s in raw_skills:
            norm = self.normalize_skill(s)
            if norm and norm not in seen:
                seen.add(norm)
                normalized.append(norm)
        return normalized

    def get_category(self, skill_name: str) -> str:
        canonical = self.normalize_skill(skill_name)
        return self.skill_categories.get(canonical, "Technical")


# Singleton instance
skill_normalizer = SkillNormalizer()
