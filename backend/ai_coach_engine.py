"""Enhanced AI Career Coach Engine.

Provides intelligent career advice with rule-based fallbacks.
Includes skill recommendations, career planning, and interview preparation.
"""

import re
from typing import Dict, List, Optional, Tuple
from datetime import datetime


# Career progression paths for different roles
CAREER_PATHS = {
    "software_engineer": {
        "junior": {
            "next_level": "mid_level",
            "required_skills": ["git", "testing", "debugging", "code review"],
            "recommended_skills": ["docker", "ci/cd", "cloud platforms"],
            "timeline": "1-3 years",
            "focus_areas": ["Code quality", "Best practices", "Team collaboration"]
        },
        "mid_level": {
            "next_level": "senior",
            "required_skills": ["system design", "mentoring", "architecture", "leadership"],
            "recommended_skills": ["microservices", "scalability", "performance optimization"],
            "timeline": "3-6 years",
            "focus_areas": ["System architecture", "Technical leadership", "Project ownership"]
        },
        "senior": {
            "next_level": "staff_or_principal",
            "required_skills": ["strategic thinking", "cross-team collaboration", "technical vision"],
            "recommended_skills": ["business acumen", "technical writing", "public speaking"],
            "timeline": "6+ years",
            "focus_areas": ["Technical strategy", "Organization impact", "Industry influence"]
        }
    },
    "data_scientist": {
        "junior": {
            "next_level": "mid_level",
            "required_skills": ["statistics", "python", "sql", "data visualization"],
            "recommended_skills": ["machine learning", "big data tools", "cloud platforms"],
            "timeline": "1-3 years",
            "focus_areas": ["Statistical foundations", "Programming skills", "Domain expertise"]
        },
        "mid_level": {
            "next_level": "senior",
            "required_skills": ["advanced ml", "feature engineering", "model deployment"],
            "recommended_skills": ["mlops", "deep learning", "a/b testing"],
            "timeline": "3-6 years",
            "focus_areas": ["Model complexity", "Business impact", "Technical leadership"]
        }
    }
}

# Skill learning roadmaps
SKILL_ROADMAPS = {
    "web_development": {
        "beginner": ["HTML/CSS", "JavaScript basics", "Git", "Responsive design"],
        "intermediate": ["React/Vue", "Node.js", "APIs", "Databases", "Testing"],
        "advanced": ["TypeScript", "Next.js", "GraphQL", "Docker", "AWS/Cloud"]
    },
    "data_science": {
        "beginner": ["Python", "Statistics", "Pandas", "Matplotlib", "SQL"],
        "intermediate": ["Scikit-learn", "Feature engineering", "Model evaluation", "Jupyter"],
        "advanced": ["TensorFlow/PyTorch", "MLOps", "Big Data tools", "Cloud ML"]
    },
    "devops": {
        "beginner": ["Linux", "Shell scripting", "Git", "Basic networking"],
        "intermediate": ["Docker", "CI/CD", "Monitoring", "Cloud basics"],
        "advanced": ["Kubernetes", "Infrastructure as Code", "Security", "Observability"]
    }
}

# Common questions and rule-based responses
QUESTION_PATTERNS = {
    r"how.*(improve|better|enhance).*(ats|score|resume)": {
        "response_template": "To improve your ATS score, focus on: {ats_suggestions}. Your current score is {ats_score}/100.",
        "context_needed": ["ats_score", "missing_skills"]
    },
    r"what.*(skills|technologies).*(learn|study|focus)": {
        "response_template": "Based on your profile, I recommend focusing on: {skill_recommendations}. These align with current market demands.",
        "context_needed": ["detected_skills", "recommended_roles"]
    },
    r"(interview|preparation|questions)": {
        "response_template": "For interview preparation, focus on: {interview_tips}. Practice coding problems and system design based on your skills: {top_skills}.",
        "context_needed": ["detected_skills"]
    },
    r"career.*(path|growth|next|future)": {
        "response_template": "Given your skills in {top_skills}, potential career paths include: {career_paths}. Focus on {next_steps} for advancement.",
        "context_needed": ["detected_skills", "experience_years"]
    },
    r"salary|compensation|pay": {
        "response_template": "Salary ranges vary by location and experience. With your skills in {top_skills} and {experience_years} years of experience, research market rates for {recommended_roles}.",
        "context_needed": ["detected_skills", "experience_years", "recommended_roles"]
    }
}

# Motivation and encouragement responses
ENCOURAGEMENT_RESPONSES = [
    "Your diverse skill set in {skills} shows great potential for growth!",
    "With {years} years of experience, you're well-positioned for the next step in your career.",
    "Your combination of {technical_skills} and {soft_skills} is exactly what employers are looking for.",
    "The fact that you're actively seeking improvement shows the growth mindset that leads to success."
]


def determine_experience_level(skills_count: int, experience_years: float) -> str:
    """
    Determine experience level based on skills and years.
    """
    if experience_years < 2 or skills_count < 5:
        return "junior"
    elif experience_years < 5 or skills_count < 12:
        return "mid_level"
    else:
        return "senior"


def get_role_category(skills: List[str]) -> str:
    """
    Determine primary role category based on skills.
    """
    skill_set = {skill.lower() for skill in skills}
    
    web_dev_skills = {"react", "javascript", "html", "css", "node.js", "vue", "angular"}
    data_skills = {"python", "pandas", "numpy", "sql", "matplotlib", "scikit-learn", "tensorflow"}
    devops_skills = {"docker", "kubernetes", "aws", "ci/cd", "terraform", "ansible"}
    
    web_score = len(skill_set.intersection(web_dev_skills))
    data_score = len(skill_set.intersection(data_skills))
    devops_score = len(skill_set.intersection(devops_skills))
    
    if data_score >= max(web_score, devops_score):
        return "data_scientist"
    elif devops_score >= web_score:
        return "devops_engineer"
    else:
        return "software_engineer"


def generate_skill_recommendations(
    current_skills: List[str],
    missing_skills: List[str],
    role_category: str,
    experience_level: str
) -> Dict[str, List[str]]:
    """
    Generate personalized skill recommendations.
    """
    recommendations = {
        "immediate": [],
        "short_term": [],
        "long_term": []
    }
    
    # Immediate: Missing skills for current applications
    if missing_skills:
        recommendations["immediate"] = missing_skills[:3]
    
    # Get roadmap for role category
    roadmap_key = "web_development" if role_category == "software_engineer" else role_category.replace("_engineer", "")
    roadmap = SKILL_ROADMAPS.get(roadmap_key, SKILL_ROADMAPS["web_development"])
    
    current_skill_set = {skill.lower() for skill in current_skills}
    
    # Short-term: Next level skills from roadmap
    if experience_level == "junior":
        next_level_skills = roadmap.get("intermediate", [])
    elif experience_level == "mid_level":
        next_level_skills = roadmap.get("advanced", [])
    else:
        next_level_skills = ["system design", "technical leadership", "mentoring"]
    
    recommendations["short_term"] = [
        skill for skill in next_level_skills 
        if skill.lower() not in current_skill_set
    ][:4]
    
    # Long-term: Career advancement skills
    career_path = CAREER_PATHS.get(role_category, {})
    current_level_data = career_path.get(experience_level, {})
    recommended_skills = current_level_data.get("recommended_skills", [])
    
    recommendations["long_term"] = [
        skill for skill in recommended_skills 
        if skill.lower() not in current_skill_set
    ][:3]
    
    return recommendations


def generate_career_advice(
    skills: List[str],
    experience_years: float,
    ats_score: float,
    missing_skills: List[str]
) -> Dict[str, object]:
    """
    Generate comprehensive career advice.
    """
    role_category = get_role_category(skills)
    experience_level = determine_experience_level(len(skills), experience_years)
    
    # Get career path information
    career_path = CAREER_PATHS.get(role_category, {})
    current_level_data = career_path.get(experience_level, {})
    
    # Generate skill recommendations
    skill_recommendations = generate_skill_recommendations(
        skills, missing_skills, role_category, experience_level
    )
    
    # Generate next steps
    next_steps = []
    if ats_score < 70:
        next_steps.append("Focus on improving your resume format and keyword optimization")
    if missing_skills:
        next_steps.append(f"Learn {', '.join(missing_skills[:2])} to better match target roles")
    if len(skills) < 10:
        next_steps.append("Expand your technical skill set with industry-relevant technologies")
    
    next_steps.extend(current_level_data.get("focus_areas", []))
    
    return {
        "role_category": role_category,
        "experience_level": experience_level,
        "next_level": current_level_data.get("next_level", "senior"),
        "timeline": current_level_data.get("timeline", "2-4 years"),
        "skill_recommendations": skill_recommendations,
        "next_steps": next_steps[:5],
        "focus_areas": current_level_data.get("focus_areas", []),
        "career_summary": f"As a {experience_level.replace('_', ' ')} {role_category.replace('_', ' ')}, focus on {', '.join(current_level_data.get('focus_areas', ['technical skills'])[:2])}"
    }


def match_question_pattern(user_message: str) -> Optional[Dict[str, object]]:
    """
    Match user question to predefined patterns.
    """
    message_lower = user_message.lower()
    
    for pattern, response_data in QUESTION_PATTERNS.items():
        if re.search(pattern, message_lower):
            return response_data
    
    return None


def generate_contextual_response(
    user_message: str,
    resume_context: Dict[str, object],
    use_ai: bool = False
) -> str:
    """
    Generate contextual response based on user message and resume analysis.
    """
    # Extract context variables
    skills = resume_context.get("skills", [])
    missing_skills = resume_context.get("missing_skills", [])
    ats_score = resume_context.get("ats_score", 0)
    recommended_roles = resume_context.get("recommended_roles", [])
    experience_years = resume_context.get("experience_years", 0)
    
    # Generate comprehensive career advice
    career_advice = generate_career_advice(skills, experience_years, ats_score, missing_skills)
    
    # Try to match question pattern
    pattern_match = match_question_pattern(user_message)
    
    if pattern_match:
        template = pattern_match["response_template"]
        
        # Prepare context variables for template
        template_vars = {
            "ats_score": int(ats_score),
            "ats_suggestions": ", ".join([
                "Add missing keywords",
                "Improve formatting",
                "Quantify achievements"
            ][:3]),
            "skill_recommendations": ", ".join(
                career_advice["skill_recommendations"]["immediate"][:3] or
                career_advice["skill_recommendations"]["short_term"][:3] or
                ["industry-relevant technologies"]
            ),
            "interview_tips": ", ".join([
                "Review data structures and algorithms",
                "Practice system design questions",
                "Prepare STAR method examples"
            ]),
            "top_skills": ", ".join(skills[:5]) if skills else "your technical skills",
            "career_paths": ", ".join([role[0] for role in recommended_roles[:3]]) if recommended_roles else "related technical roles",
            "next_steps": ", ".join(career_advice["next_steps"][:3]),
            "experience_years": f"{int(experience_years)}" if experience_years >= 1 else "your current",
            "recommended_roles": ", ".join([role[0] for role in recommended_roles[:2]]) if recommended_roles else "software engineering roles"
        }
        
        response = template.format(**template_vars)
        
        # Add specific advice based on career stage
        if career_advice["experience_level"] == "junior":
            response += "\n\n💡 As you're early in your career, focus on building a strong foundation in core technologies and contributing to open source projects."
        elif career_advice["experience_level"] == "mid_level":
            response += "\n\n🚀 With your experience, consider taking on more leadership responsibilities and mentoring junior developers."
        else:
            response += "\n\n🎯 At your level, focus on strategic thinking, technical vision, and expanding your influence across teams."
        
        return response
    
    # Fallback to general advice based on context
    if "motivation" in user_message.lower() or "confidence" in user_message.lower():
        return f"""🌟 Your skill set in {', '.join(skills[:3])} shows great potential! 
        
With {int(experience_years)} years of experience, you're well-positioned for growth. Focus on:
        
• {career_advice['next_steps'][0] if career_advice['next_steps'] else 'Continuing to build your expertise'}
• Networking with other professionals in your field
• Contributing to open source or personal projects
        
Remember, career growth is a marathon, not a sprint. You're making progress!"""
    
    # General advice response
    return f"""Based on your profile analysis:

📊 **Current Status**: {career_advice['experience_level'].replace('_', ' ').title()} {career_advice['role_category'].replace('_', ' ').title()}
📈 **ATS Score**: {int(ats_score)}/100
🎯 **Recommended Focus**: {', '.join(career_advice['focus_areas'][:2])}

**Next Steps**:
{chr(10).join(f'• {step}' for step in career_advice['next_steps'][:3])}

**Skill Development Priority**:
• Immediate: {', '.join(career_advice['skill_recommendations']['immediate'][:2]) or 'Optimize current skills'}
• Short-term: {', '.join(career_advice['skill_recommendations']['short_term'][:2]) or 'Expand technical expertise'}

Would you like specific advice on any of these areas?"""


def get_daily_tip(skills: List[str]) -> str:
    """
    Generate a daily career tip based on user skills.
    """
    tips_by_category = {
        "web_dev": [
            "💡 Practice building projects from scratch to reinforce full-stack understanding",
            "🔧 Set up a personal development environment with Docker for consistency",
            "📱 Always test your applications on multiple devices and browsers",
            "⚡ Learn to optimize your code for performance - users notice speed",
            "🎨 Study design principles to make your applications more user-friendly"
        ],
        "data_science": [
            "📊 Always start with exploratory data analysis before building models",
            "🧪 Document your experiments and model versions for reproducibility",
            "📈 Focus on business impact, not just model accuracy metrics",
            "🔍 Learn to communicate findings to non-technical stakeholders",
            "⚙️ Practice deploying models to production environments"
        ],
        "general": [
            "📚 Dedicate 30 minutes daily to learning something new in your field",
            "🤝 Engage with the developer community through forums and meetups",
            "📝 Write about your learning journey to solidify understanding",
            "🎯 Set specific, measurable goals for your skill development",
            "🔄 Regularly update your resume and LinkedIn profile"
        ]
    }
    
    skill_set = {skill.lower() for skill in skills}
    
    if any(skill in skill_set for skill in ["react", "javascript", "html", "css"]):
        category = "web_dev"
    elif any(skill in skill_set for skill in ["python", "pandas", "sql", "machine learning"]):
        category = "data_science"
    else:
        category = "general"
    
    import random
    return random.choice(tips_by_category[category])


def generate_weekly_focus(career_advice: Dict[str, object]) -> Dict[str, str]:
    """
    Generate a weekly focus plan based on career advice.
    """
    skill_recs = career_advice["skill_recommendations"]
    
    return {
        "monday": "📖 Study: Focus on learning fundamentals",
        "tuesday": "💻 Practice: Work on coding exercises or projects",
        "wednesday": "🏗️ Build: Implement what you've learned in a project",
        "thursday": "🔍 Research: Explore job market and requirements",
        "friday": "📝 Document: Update portfolio and write about your learning",
        "weekend": "🤝 Network: Engage with the community and seek feedback",
        "focus_skill": skill_recs["immediate"][0] if skill_recs["immediate"] else skill_recs["short_term"][0] if skill_recs["short_term"] else "general development"
    }
