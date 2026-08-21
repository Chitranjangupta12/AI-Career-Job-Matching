import re
from typing import List, Dict, Any, Tuple
from app.services.skill_normalizer import skill_normalizer
from app.models.schemas import ParsedEducation, ParsedExperience, ParsedProject, ResumeParseResponse


class NLPExtractor:
    def __init__(self):
        self.normalizer = skill_normalizer
        self._prepare_skill_patterns()

    def _prepare_skill_patterns(self):
        """Compiles regex patterns for skill alias matching with proper boundary handling."""
        self.skill_matchers = []
        # Sort aliases by descending length to match longest tokens first (e.g., 'spring boot' before 'spring')
        sorted_aliases = sorted(self.normalizer.alias_to_canonical.keys(), key=lambda x: len(x), reverse=True)
        
        for alias in sorted_aliases:
            canonical = self.normalizer.alias_to_canonical[alias]
            # Handle special characters in skills like C++, C#, .NET
            escaped = re.escape(alias)
            if re.match(r'^[a-zA-Z0-9]', alias) and re.search(r'[a-zA-Z0-9]$', alias):
                pattern = re.compile(rf'(?<![a-zA-Z0-9]){escaped}(?![a-zA-Z0-9])', re.IGNORECASE)
            elif alias.endswith('++') or alias.endswith('#'):
                pattern = re.compile(rf'(?<![a-zA-Z0-9]){escaped}', re.IGNORECASE)
            else:
                pattern = re.compile(rf'(?:^|[\s,;/:|\(\)\[\]]){escaped}(?:[\s,;/:|\(\)\[\]]|$)', re.IGNORECASE)
            
            self.skill_matchers.append((pattern, canonical))

    def extract_skills(self, text: str) -> Tuple[List[str], List[str], List[str]]:
        """Extracts skills from text, returning (all_skills, technical_skills, soft_skills)."""
        found_skills = set()
        for pattern, canonical in self.skill_matchers:
            if pattern.search(text):
                found_skills.add(canonical)

        tech_skills = []
        soft_skills = []
        for s in found_skills:
            cat = self.normalizer.get_category(s)
            if cat == "Soft Skills":
                soft_skills.append(s)
            else:
                tech_skills.append(s)

        all_sorted = sorted(list(found_skills))
        tech_sorted = sorted(tech_skills)
        soft_sorted = sorted(soft_skills)
        return all_sorted, tech_sorted, soft_sorted

    def extract_education(self, text: str) -> List[ParsedEducation]:
        """Extracts educational qualifications, institutions, and graduation years."""
        education_list = []
        degree_patterns = [
            r'\b(B\.?Tech|B\.?E\.?|Bachelor of Technology|Bachelor of Engineering|B\.?Sc|B\.?S\.?|Bachelor of Science|BCA)\b',
            r'\b(M\.?Tech|M\.?E\.?|Master of Technology|M\.?Sc|M\.?S\.?|Master of Science|MCA|MBA)\b',
            r'\b(Ph\.?D|Doctor of Philosophy|Diploma)\b'
        ]

        lines = text.split('\n')
        for i, line in enumerate(lines):
            for deg_pattern in degree_patterns:
                match = re.search(deg_pattern, line, re.IGNORECASE)
                if match:
                    degree_name = match.group(0).strip()
                    institution = ""
                    # Look ahead/around for university / college name
                    context = " ".join(lines[max(0, i-1):min(len(lines), i+3)])
                    inst_match = re.search(r'(University|Institute|College|Academy|School of [A-Za-z]+|State University)[^,\n.]*', context, re.IGNORECASE)
                    if inst_match:
                        institution = inst_match.group(0).strip()
                    
                    year_match = re.search(r'\b(20[0-2][0-9]|19[8-9][0-9])\b', context)
                    year = year_match.group(0) if year_match else None

                    grade_match = re.search(r'\b(GPA\s*:\s*[0-9.]+|CGPA\s*:\s*[0-9.]+|[0-9.]+\s*CGPA|[0-9.]+\s*GPA|[0-9]{2,3}%)\b', context, re.IGNORECASE)
                    grade = grade_match.group(0) if grade_match else None

                    education_list.append(ParsedEducation(
                        degree=degree_name,
                        institution=institution or "Recognized Institution",
                        year=year,
                        grade=grade
                    ))
                    break

        return education_list

    def extract_experience(self, text: str) -> Tuple[List[ParsedExperience], float]:
        """Extracts work experience items and estimates total years of experience."""
        experience_list = []
        total_exp_years = 0.0

        # Look for experience section headers
        exp_section_match = re.search(r'(?:EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT HISTORY|PROFESSIONAL EXPERIENCE)(.*?)(?:EDUCATION|PROJECTS|SKILLS|CERTIFICATIONS|$)', text, re.DOTALL | re.IGNORECASE)
        section_text = exp_section_match.group(1) if exp_section_match else text

        # Regex for year ranges like 2022 - 2024, 2023 - Present
        date_matches = list(re.finditer(r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[0-9]{1,2}/)?\s*(20[0-2][0-9])\s*(?:-|–|to)\s*(?:(20[0-2][0-9])|Present|Current)', section_text, re.IGNORECASE))
        
        for match in date_matches:
            start_yr = int(match.group(1))
            end_yr_str = match.group(2)
            end_yr = int(end_yr_str) if end_yr_str else 2026
            duration_yrs = max(0.5, end_yr - start_yr)
            total_exp_years += duration_yrs

            # Get surrounding context for title and company
            start_pos = max(0, match.start() - 100)
            end_pos = min(len(section_text), match.end() + 150)
            snippet = section_text[start_pos:end_pos].strip()

            lines = [l.strip() for l in snippet.split('\n') if l.strip()]
            title = lines[0] if lines else "Software Engineer"
            company = lines[1] if len(lines) > 1 else "Tech Company"

            experience_list.append(ParsedExperience(
                title=title[:100],
                company=company[:100],
                duration=f"{start_yr} - {end_yr_str if end_yr_str else 'Present'}",
                description="Contributed to core development and project milestones."
            ))

        # Explicit "X years of experience" pattern
        explicit_match = re.search(r'([0-9]+(?:\.[0-9]+)?)\+?\s*(?:years|yrs)\s+(?:of\s+)?experience', text, re.IGNORECASE)
        if explicit_match:
            total_exp_years = max(total_exp_years, float(explicit_match.group(1)))

        return experience_list, min(total_exp_years, 30.0)

    def extract_projects(self, text: str) -> List[ParsedProject]:
        """Extracts candidate projects and associated technologies."""
        projects = []
        proj_section = re.search(r'(?:PROJECTS|ACADEMIC PROJECTS|PERSONAL PROJECTS)(.*?)(?:EXPERIENCE|EDUCATION|SKILLS|CERTIFICATIONS|$)', text, re.DOTALL | re.IGNORECASE)
        content = proj_section.group(1) if proj_section else text

        lines = [l.strip() for l in content.split('\n') if l.strip()]
        for line in lines:
            if re.match(r'^(?:[-*•]|\d+\.)\s*([A-Za-z0-9\s:-]{3,50})', line) and len(line) < 120:
                p_skills, _, _ = self.extract_skills(line)
                clean_title = re.sub(r'^(?:[-*•]|\d+\.)\s*', '', line).split(':')[0].strip()
                if len(clean_title) > 3 and clean_title.lower() not in ['skills', 'education', 'projects', 'experience']:
                    projects.append(ParsedProject(
                        title=clean_title,
                        technologies=p_skills,
                        description=line
                    ))
            if len(projects) >= 5:
                break

        return projects

    def extract_certifications(self, text: str) -> List[str]:
        """Extracts certifications (AWS, GCP, CKA, Oracle, etc.)."""
        certs = []
        cert_keywords = [
            "AWS Certified", "Solutions Architect", "Google Cloud Certified", "Azure Fundamentals",
            "Azure Administrator", "Certified Kubernetes Administrator", "CKA", "CKAD",
            "Oracle Certified Professional", "TensorFlow Developer", "DeepLearning.AI", "Coursera", "Udemy"
        ]
        for kw in cert_keywords:
            if re.search(rf'\b{re.escape(kw)}\b', text, re.IGNORECASE):
                certs.append(kw)
        return list(set(certs))

    def parse_resume(self, text: str) -> ResumeParseResponse:
        """Runs the complete NLP extraction pipeline on cleaned resume text."""
        all_skills, tech_skills, soft_skills = self.extract_skills(text)
        education = self.extract_education(text)
        experience, exp_years = self.extract_experience(text)
        projects = self.extract_projects(text)
        certifications = self.extract_certifications(text)

        summary = f"Extracted {len(all_skills)} skills ({len(tech_skills)} technical, {len(soft_skills)} soft) with ~{exp_years:.1f} years estimated experience."

        return ResumeParseResponse(
            success=True,
            skills=all_skills,
            technical_skills=tech_skills,
            soft_skills=soft_skills,
            education=education,
            experience=experience,
            projects=projects,
            certifications=certifications,
            experience_years_estimated=round(exp_years, 1),
            raw_text=text[:10000],
            summary=summary
        )


nlp_extractor = NLPExtractor()
