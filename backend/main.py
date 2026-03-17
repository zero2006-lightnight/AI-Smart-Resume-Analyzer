"""Enhanced FastAPI backend for AI Career Platform.

Upgraded from AI Smart Resume Analyzer to a complete career assistant platform.
"""

from pathlib import Path
from typing import Any, Dict, List
import google.generativeai as genai

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.resume_parser import extract_text_from_any
from backend.skill_extractor import SkillExtractor
from backend.ats_score import compute_ats_score, compute_advanced_ats
from backend.job_matcher import recommend_jobs
from backend.interview_generator import (
    generate_interview_questions, 
    generate_mock_interview_session,
    get_skill_specific_tips
)
from backend.portfolio_analyzer import (
    generate_comprehensive_portfolio_analysis,
    get_portfolio_improvement_roadmap
)
from backend.cover_letter_generator import (
    generate_cover_letter,
    generate_multiple_versions,
    get_cover_letter_tips,
    validate_cover_letter_content
)
from backend.ai_coach_engine import (
    generate_contextual_response,
    generate_career_advice,
    get_daily_tip,
    generate_weekly_focus
)


# -------------------------------------------------
# GEMINI API CONFIGURATION
# -------------------------------------------------

GEMINI_API_KEY = ""

genai.configure(api_key=GEMINI_API_KEY)

# -------------------------------------------------


BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "skills_dataset.json"
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI(
    title="AI Career Platform", 
    version="2.0.0",
    description="Complete AI-powered career assistant platform with resume analysis, job matching, interview preparation, and portfolio analysis."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

skill_extractor = SkillExtractor(DATA_PATH)


# -------------------------------------------------
# PYDANTIC MODELS
# -------------------------------------------------

class ResumeAnalysisContext(BaseModel):
    skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    ats_score: float = 0.0
    recommended_roles: List[str] = Field(default_factory=list)
    experience_years: float | None = None


class CareerCoachRequest(BaseModel):
    user_message: str
    resume_analysis: ResumeAnalysisContext


class InterviewRequest(BaseModel):
    skills: List[str]
    experience_level: str = "mid"  # "junior", "mid", "senior"
    question_count: int = 5
    role: str = "Software Engineer"


class PortfolioAnalysisRequest(BaseModel):
    github_url: str = ""
    portfolio_url: str = ""
    skills: List[str] = Field(default_factory=list)


class CoverLetterRequest(BaseModel):
    company_name: str
    job_title: str
    job_description: str = ""
    applicant_name: str = "[Your Name]"
    skills: List[str] = Field(default_factory=list)
    experience_years: float = 0
    num_versions: int = 1


class JobMatchRequest(BaseModel):
    resume_text: str
    job_description: str
    

# -------------------------------------------------
# CORE ENDPOINTS (EXISTING FUNCTIONALITY)
# -------------------------------------------------

@app.get("/health")
async def health() -> Dict[str, str]:
    return {"status": "ok", "version": "2.0.0", "platform": "AI Career Platform"}


@app.get("/skills")
async def list_skills() -> Dict[str, Any]:
    return {"skills": skill_extractor.dataset}


@app.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form("")
) -> Dict[str, Any]:
    """Enhanced resume analysis with additional metrics and insights."""
    
    supported_types = {
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "text/plain",
        "application/octet-stream",
    }

    if file.content_type not in supported_types:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Upload PDF, DOCX, or TXT."
        )

    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    try:
        resume_text = extract_text_from_any(str(file_path))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read resume: {str(e)}")

    detected_skills, skill_distribution = skill_extractor.extract_from_text(resume_text)

    job_skills, _ = skill_extractor.extract_from_text(job_description) if job_description else ([], {})

    missing_skills = sorted(set(job_skills) - set(detected_skills)) if job_skills else []

    ats_basic = compute_ats_score(
        resume_text=resume_text,
        resume_skills=detected_skills,
        job_skills=job_skills,
        missing_skills=missing_skills,
    )

    ats_advanced = compute_advanced_ats(
        resume_text=resume_text,
        resume_skills=detected_skills,
        job_skills=job_skills,
        missing_skills=missing_skills,
    )

    recommendations = recommend_jobs(detected_skills)
    
    # Generate career advice
    career_advice = generate_career_advice(
        skills=detected_skills,
        experience_years=ats_advanced.get("experience_years", 0),
        ats_score=ats_basic["score"],
        missing_skills=missing_skills
    )

    return {
        "ats_score": ats_basic["score"],
        "ats_breakdown": ats_basic["breakdown"],
        "detected_skills": detected_skills,
        "skill_distribution": skill_distribution,
        "missing_skills": missing_skills,
        "job_recommendations": recommendations,
        "suggestions": ats_basic["suggestions"],
        "keyword_density": ats_basic["keyword_density"],
        "advanced_ats": ats_advanced,
        "career_advice": career_advice,  # New enhanced career guidance
        "file_info": {
            "filename": file.filename,
            "size_kb": len(resume_text) / 1024,
            "word_count": len(resume_text.split())
        }
    }


# -------------------------------------------------
# ENHANCED CAREER COACH
# -------------------------------------------------

@app.post("/career_coach_chat")
async def career_coach_chat(payload: CareerCoachRequest) -> Dict[str, Any]:
    """Enhanced career coach with rule-based fallbacks and comprehensive guidance."""

    message = (payload.user_message or "").strip()

    if not message:
        raise HTTPException(status_code=400, detail="user_message cannot be empty")

    ctx = payload.resume_analysis
    
    # Prepare context for AI coach engine
    resume_context = {
        "skills": ctx.skills,
        "missing_skills": ctx.missing_skills,
        "ats_score": ctx.ats_score,
        "recommended_roles": [(role, score) for role, score in ctx.recommended_roles] if ctx.recommended_roles else [],
        "experience_years": ctx.experience_years or 0
    }

    # Try Gemini AI first, fallback to rule-based engine
    try:
        prompt = f"""
You are a professional AI career coach helping improve careers in tech.

User Profile:
- ATS Score: {ctx.ats_score}/100
- Skills: {', '.join(ctx.skills[:10])}
- Missing Skills: {', '.join(ctx.missing_skills[:5])}
- Experience: {ctx.experience_years or 0} years
- Target Roles: {', '.join([str(role) for role in ctx.recommended_roles[:3]])}

User Question: {message}

Provide specific, actionable advice for:
- Resume improvement
- Skill development
- Interview preparation  
- Career planning
- Job search strategy

Be encouraging but realistic. Include specific next steps.
"""

        model = genai.GenerativeModel("gemini-1.5-flash-latest")
        response = model.generate_content(prompt)
        ai_reply = response.text
        
        # Add daily tip
        daily_tip = get_daily_tip(ctx.skills)
        
        return {
            "reply": ai_reply,
            "daily_tip": daily_tip,
            "source": "ai",
            "suggestions": [
                "Ask about interview preparation",
                "Get skill learning roadmap", 
                "Career advancement advice",
                "Salary negotiation tips"
            ]
        }

    except Exception as e:
        # Fallback to rule-based response
        rule_based_reply = generate_contextual_response(
            user_message=message,
            resume_context=resume_context,
            use_ai=False
        )
        
        daily_tip = get_daily_tip(ctx.skills)
        
        return {
            "reply": rule_based_reply,
            "daily_tip": daily_tip,
            "source": "rule_based",
            "note": "AI service temporarily unavailable. Using intelligent rule-based responses.",
            "suggestions": [
                "Ask about specific skills to learn",
                "Request interview preparation tips",
                "Get career path guidance",
                "Ask about portfolio improvements"
            ]
        }


# -------------------------------------------------
# INTERVIEW SIMULATION
# -------------------------------------------------

@app.post("/generate_interview_questions")
async def generate_interview_questions_endpoint(request: InterviewRequest) -> Dict[str, Any]:
    """Generate personalized interview questions based on skills and experience."""
    
    questions = generate_interview_questions(
        detected_skills=request.skills,
        experience_level=request.experience_level,
        question_count=request.question_count
    )
    
    tips = get_skill_specific_tips(request.skills)
    
    return {
        "questions": questions,
        "preparation_tips": tips,
        "skill_focus": request.skills[:5],
        "experience_level": request.experience_level,
        "estimated_duration": f"{request.question_count * 8-12} minutes"
    }


@app.post("/mock_interview_session")
async def mock_interview_session(request: InterviewRequest) -> Dict[str, Any]:
    """Generate a complete mock interview session with timing and structure."""
    
    session = generate_mock_interview_session(
        skills=request.skills,
        role=request.role,
        duration_minutes=45
    )
    
    return {
        "session": session,
        "next_steps": [
            "Practice answering each question out loud",
            "Prepare specific examples using STAR method",
            "Research the company's technical stack",
            "Prepare thoughtful questions about the role"
        ]
    }


# -------------------------------------------------
# PORTFOLIO ANALYSIS
# -------------------------------------------------

@app.post("/analyze_portfolio")
async def analyze_portfolio(request: PortfolioAnalysisRequest) -> Dict[str, Any]:
    """Analyze GitHub profile and portfolio website for improvement suggestions."""
    
    if not request.github_url and not request.portfolio_url:
        raise HTTPException(
            status_code=400, 
            detail="Please provide either GitHub URL or portfolio URL"
        )
    
    analysis = generate_comprehensive_portfolio_analysis(
        github_url=request.github_url,
        portfolio_url=request.portfolio_url,
        detected_skills=request.skills
    )
    
    roadmap = get_portfolio_improvement_roadmap(analysis)
    
    return {
        "analysis": analysis,
        "improvement_roadmap": roadmap,
        "quick_wins": [
            "Add README files to all repositories",
            "Include live demo links", 
            "Update repository descriptions",
            "Add portfolio website link to GitHub profile"
        ]
    }


# -------------------------------------------------
# COVER LETTER GENERATION
# -------------------------------------------------

@app.post("/generate_cover_letter")
async def generate_cover_letter_endpoint(request: CoverLetterRequest) -> Dict[str, Any]:
    """Generate professional cover letter based on job requirements and resume data."""
    
    if request.num_versions > 1:
        versions = generate_multiple_versions(
            company_name=request.company_name,
            job_title=request.job_title,
            job_description=request.job_description,
            resume_skills=request.skills,
            experience_years=request.experience_years,
            applicant_name=request.applicant_name,
            num_versions=request.num_versions
        )
        return {
            "versions": versions,
            "tips": get_cover_letter_tips(versions[0]["role_category"]),
            "customization_suggestions": [
                "Research the company's recent news and achievements",
                "Mention specific projects or initiatives you admire",
                "Align your language with the company's values",
                "Include relevant keywords from the job posting"
            ]
        }
    else:
        letter_data = generate_cover_letter(
            company_name=request.company_name,
            job_title=request.job_title,
            job_description=request.job_description,
            resume_skills=request.skills,
            experience_years=request.experience_years,
            applicant_name=request.applicant_name
        )
        
        validation = validate_cover_letter_content(letter_data["cover_letter"])
        
        return {
            "letter": letter_data,
            "validation": validation,
            "tips": get_cover_letter_tips(letter_data["role_category"])
        }


# -------------------------------------------------
# JOB MATCHING & COMPATIBILITY
# -------------------------------------------------

@app.post("/job_compatibility")
async def analyze_job_compatibility(request: JobMatchRequest) -> Dict[str, Any]:
    """Analyze compatibility between resume and job description with detailed matching."""
    
    # Extract skills from both resume and job description
    resume_skills, resume_distribution = skill_extractor.extract_from_text(request.resume_text)
    job_skills, job_distribution = skill_extractor.extract_from_text(request.job_description)
    
    # Calculate compatibility metrics
    matching_skills = list(set(resume_skills) & set(job_skills))
    missing_skills = list(set(job_skills) - set(resume_skills))
    extra_skills = list(set(resume_skills) - set(job_skills))
    
    # Calculate compatibility score
    if job_skills:
        compatibility_score = (len(matching_skills) / len(job_skills)) * 100
    else:
        compatibility_score = min(100, len(resume_skills) * 5)  # Fallback scoring
    
    # Advanced ATS analysis
    ats_analysis = compute_advanced_ats(
        resume_text=request.resume_text,
        resume_skills=resume_skills,
        job_skills=job_skills,
        missing_skills=missing_skills
    )
    
    return {
        "compatibility_score": round(compatibility_score, 1),
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "extra_skills": extra_skills,
        "skill_match_ratio": round(len(matching_skills) / max(1, len(job_skills)) * 100, 1),
        "ats_analysis": ats_analysis,
        "recommendations": [
            f"Highlight these matching skills: {', '.join(matching_skills[:5])}",
            f"Consider learning: {', '.join(missing_skills[:3])}",
            "Tailor your resume keywords to match job requirements",
            "Quantify achievements related to required skills"
        ] if matching_skills else [
            "Focus on transferable skills and learning ability",
            "Emphasize relevant project experience",
            "Consider gaining experience in required technologies"
        ]
    }


# -------------------------------------------------
# CAREER INSIGHTS & ANALYTICS
# -------------------------------------------------

@app.get("/career_insights")
async def get_career_insights() -> Dict[str, Any]:
    """Get general career insights and market trends."""
    
    return {
        "trending_skills": [
            {"skill": "Python", "growth": "+25%", "category": "Programming"},
            {"skill": "React", "growth": "+30%", "category": "Frontend"},
            {"skill": "AWS", "growth": "+40%", "category": "Cloud"},
            {"skill": "Docker", "growth": "+35%", "category": "DevOps"},
            {"skill": "Machine Learning", "growth": "+45%", "category": "AI/ML"}
        ],
        "salary_insights": {
            "junior_range": "$60,000 - $85,000",
            "mid_range": "$85,000 - $130,000", 
            "senior_range": "$130,000 - $200,000+",
            "note": "Ranges vary by location, company size, and specialization"
        },
        "job_market_trends": [
            "Remote work opportunities increased by 300%",
            "Full-stack developers in high demand",
            "AI/ML skills command premium salaries",
            "Cloud expertise essential for most roles",
            "Soft skills increasingly important"
        ]
    }


@app.post("/weekly_focus")
async def get_weekly_focus(skills: List[str]) -> Dict[str, Any]:
    """Generate personalized weekly learning focus based on skills."""
    
    career_advice = generate_career_advice(
        skills=skills,
        experience_years=2,  # Default for weekly planning
        ats_score=75,
        missing_skills=[]
    )
    
    weekly_plan = generate_weekly_focus(career_advice)
    daily_tip = get_daily_tip(skills)
    
    return {
        "weekly_plan": weekly_plan,
        "daily_tip": daily_tip,
        "focus_areas": career_advice["focus_areas"][:3],
        "skill_priorities": career_advice["skill_recommendations"]["immediate"][:3]
    }


# -------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
