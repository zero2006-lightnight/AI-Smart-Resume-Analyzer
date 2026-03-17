"""ATS scoring heuristics for resumes vs job requirements.

This version avoids heavy NLP dependencies for Python 3.14 compatibility.
"""

import re
from typing import Dict, List, Tuple


SECTION_KEYWORDS = {
    "experience": ["experience", "work history", "employment", "professional experience"],
    "education": ["education", "bachelor", "master", "degree", "phd"],
    "projects": ["projects", "case study", "case studies", "portfolio"],
    "certifications": ["certification", "certifications", "certified", "certificate", "aws certified"],
    "leadership": ["lead", "managed", "mentored", "supervised", "team lead", "leadership"],
}

SOFT_SKILLS = [
    "communication",
    "teamwork",
    "leadership",
    "problem solving",
    "critical thinking",
    "adaptability",
    "collaboration",
    "mentoring",
    "coaching",
    "stakeholder",
    "presentation",
    "conflict resolution",
    "planning",
    "organization",
    "self starter",
]

CERTIFICATION_KEYWORDS = [
    "aws certified",
    "azure fundamentals",
    "gcp professional",
    "professional cloud",
    "pmp",
    "cissp",
    "security+",
    "network+",
    "data+",
    "scrum master",
    "ckad",
    "cka",
    "cka",
    "ocp",
    "salesforce",
    "oracle certified",
    "comptia",
]

LEADERSHIP_KEYWORDS = [
    "led",
    "managed",
    "mentored",
    "coached",
    "supervised",
    "directed",
    "head of",
    "team lead",
    "scrum master",
    "product owner",
    "drove",
    "owned",
]

EDUCATION_LEVELS: List[Tuple[str, List[str]]] = [
    ("PhD", ["phd", "doctor of philosophy", "doctoral"]),
    ("Master's", ["master", "msc", "m.s", "m.s.", "m.tech", "mba"]),
    ("Bachelor's", ["bachelor", "b.sc", "b.s", "b.s.", "b.tech", "b.e", "undergraduate"]),
    ("Associate", ["associate", "community college", "aa degree"]),
]


def _section_presence(text: str, keywords: List[str]) -> float:
    lower = text.lower()
    for word in keywords:
        if word in lower:
            return 1.0
    return 0.3 if len(text) > 400 else 0.2


def _format_score(text: str) -> float:
    bullets = len(re.findall(r"[-•·]", text))
    lines = text.splitlines()
    avg_line = sum(len(line) for line in lines) / max(1, len(lines))

    score = 0.4
    if bullets:
        score += 0.2
    if len(lines) > 12:
        score += 0.2
    if avg_line < 140:
        score += 0.2
    return min(score, 1.0)


def _keyword_alignment(resume_text: str, job_skills: List[str]) -> float:
    """Lightweight keyword overlap between resume text and job skills."""

    if not resume_text or not job_skills:
        return 0.0

    lower_text = resume_text.lower()
    hits = 0
    for skill in job_skills:
        pattern = re.compile(rf"(?<![\w]){re.escape(skill.lower())}(?![\w])")
        if pattern.search(lower_text):
            hits += 1

    return hits / len(job_skills)


def detect_soft_skills(text: str) -> List[str]:
    lower = text.lower()
    detected = [skill for skill in SOFT_SKILLS if skill in lower]
    return sorted(set(detected))


def detect_certifications(text: str) -> List[str]:
    lower = text.lower()
    found: List[str] = []
    for keyword in CERTIFICATION_KEYWORDS:
        if keyword in lower:
            found.append(keyword)
    return sorted(set(found))


def detect_leadership_indicators(text: str) -> List[str]:
    lower = text.lower()
    found = [word for word in LEADERSHIP_KEYWORDS if word in lower]
    return sorted(set(found))


def detect_education_level(text: str) -> str:
    lower = text.lower()
    for level, patterns in EDUCATION_LEVELS:
        if any(pat in lower for pat in patterns):
            return level
    return "Not specified"


def estimate_years_experience(text: str) -> float:
    """Estimate years of experience via numeric cues and year ranges."""

    lower = text.lower()
    explicit = re.findall(r"(\d+)(?:\+)?\s+year", lower)
    numeric_years = max((int(x) for x in explicit), default=0)

    year_tokens = [int(y) for y in re.findall(r"(20\d{2}|19\d{2})", text)]
    span = 0
    if len(year_tokens) >= 2:
        span = max(year_tokens) - min(year_tokens)
        if span < 0:
            span = 0

    estimated = max(numeric_years, span)
    return float(estimated)


def _section_score(text: str, key: str) -> float:
    keywords = SECTION_KEYWORDS.get(key, [])
    if not keywords:
        return 0.0
    return _section_presence(text, keywords)


def _section_completeness(text: str) -> float:
    keys = ["experience", "education", "projects", "certifications", "leadership"]
    scores = [_section_score(text, key) for key in keys]
    return sum(scores) / len(scores)


def compute_advanced_ats(
    resume_text: str,
    resume_skills: List[str],
    job_skills: List[str],
    missing_skills: List[str],
) -> Dict[str, object]:
    """Advanced ATS scoring with section completeness and soft signals."""

    intersection = set(resume_skills) & set(job_skills)
    skill_match_ratio = len(intersection) / max(1, len(job_skills)) if job_skills else min(1.0, len(resume_skills) / 15)

    keyword_similarity = _keyword_alignment(resume_text, job_skills) if job_skills else 0.5

    experience_section = _section_score(resume_text, "experience")
    education_section = _section_score(resume_text, "education")
    projects_component = _section_score(resume_text, "projects")
    certification_component = _section_score(resume_text, "certifications")
    leadership_component = _section_score(resume_text, "leadership")
    formatting_component = _format_score(resume_text)

    years_experience = estimate_years_experience(resume_text)
    experience_relevance = min(1.0, (years_experience / 8)) * 0.7 + experience_section * 0.3

    section_completeness = _section_completeness(resume_text)

    # Weighted score
    score = (
        0.35 * skill_match_ratio
        + 0.20 * keyword_similarity
        + 0.20 * experience_relevance
        + 0.15 * section_completeness
        + 0.10 * formatting_component
    )

    total = round(score * 100, 2)

    breakdown = {
        "skill_coverage": round(skill_match_ratio * 100, 2),
        "keyword_density": round(keyword_similarity * 100, 2),
        "experience_relevance": round(experience_relevance * 100, 2),
        "section_completeness": round(section_completeness * 100, 2),
        "formatting": round(formatting_component * 100, 2),
    }

    suggestions: List[str] = []
    if missing_skills:
        suggestions.append("Add or demonstrate missing role skills: " + ", ".join(sorted(missing_skills)[:8]))
    if experience_section < 0.9:
        suggestions.append("Add a dedicated Experience section with dates, titles, and outcomes.")
    if education_section < 0.9:
        suggestions.append("Include your education with degree, institution, and graduation year.")
    if projects_component < 0.9:
        suggestions.append("Highlight 2-3 projects with impact metrics and tech stack.")
    if certification_component < 0.9:
        suggestions.append("List certifications (cloud, security, PM) if applicable.")
    if leadership_component < 0.6:
        suggestions.append("Mention leadership signals (led, mentored, managed) where relevant.")
    if formatting_component < 0.9:
        suggestions.append("Use bullet points and concise lines to improve readability.")
    if keyword_similarity < 0.6 and job_skills:
        suggestions.append("Mirror the job's terminology to improve keyword alignment.")

    soft_skills = detect_soft_skills(resume_text)
    certifications = detect_certifications(resume_text)
    leadership = detect_leadership_indicators(resume_text)
    education_level = detect_education_level(resume_text)

    return {
        "score": total,
        "breakdown": breakdown,
        "suggestions": suggestions,
        "keyword_density": round(keyword_similarity * 100, 2),
        "experience_years": round(years_experience, 1),
        "education_level": education_level,
        "section_completeness": round(section_completeness * 100, 2),
        "soft_skills": soft_skills,
        "certifications": certifications,
        "leadership_indicators": leadership,
        "skill_coverage_ratio": round(skill_match_ratio, 3),
        "experience_relevance_ratio": round(experience_relevance, 3),
    }


def compute_ats_score(
    resume_text: str,
    resume_skills: List[str],
    job_skills: List[str],
    missing_skills: List[str],
) -> Dict[str, Dict[str, float]]:
    """Compute a weighted ATS score with simple, transparent heuristics."""

    intersection = set(resume_skills) & set(job_skills)

    if job_skills:
        skill_match_ratio = len(intersection) / max(1, len(job_skills))
    else:
        skill_match_ratio = min(1.0, len(resume_skills) / 15)

    keyword_similarity = _keyword_alignment(resume_text, job_skills) if job_skills else 0.5

    experience_component = _section_presence(resume_text, SECTION_KEYWORDS["experience"])
    education_component = _section_presence(resume_text, SECTION_KEYWORDS["education"])
    projects_component = _section_presence(resume_text, SECTION_KEYWORDS["projects"])
    formatting_component = _format_score(resume_text)

    breakdown = {
        "skills_match": round(30 * skill_match_ratio, 2),
        "keyword_density": round(20 * keyword_similarity, 2),
        "experience": round(15 * experience_component, 2),
        "education": round(15 * education_component, 2),
        "projects": round(10 * projects_component, 2),
        "formatting": round(10 * formatting_component, 2),
    }

    total = round(sum(breakdown.values()), 2)

    suggestions: List[str] = []
    if missing_skills:
        suggestions.append(
            "Add or demonstrate missing role skills: " + ", ".join(sorted(missing_skills)[:8])
        )
    if experience_component < 0.9:
        suggestions.append("Add a dedicated Experience section with dates, titles, and outcomes.")
    if education_component < 0.9:
        suggestions.append("Include your education with degree, institution, and graduation year.")
    if projects_component < 0.9:
        suggestions.append("Highlight 2-3 projects with impact metrics and tech stack.")
    if formatting_component < 0.9:
        suggestions.append("Use bullet points and concise lines to improve readability.")
    if keyword_similarity < 0.6 and job_skills:
        suggestions.append("Mirror the job's terminology to improve keyword alignment.")

    return {
        "score": total,
        "breakdown": breakdown,
        "suggestions": suggestions,
        "keyword_density": round(keyword_similarity * 100, 2),
    }
