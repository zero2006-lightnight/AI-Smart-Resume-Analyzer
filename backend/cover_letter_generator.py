"""AI-powered Cover Letter Generator.

Generates professional cover letters based on resume data, company information,
and job descriptions. Includes template-based fallback for offline mode.
"""

import re
from typing import Dict, List, Optional
from datetime import datetime


# Cover letter templates by role type
COVER_LETTER_TEMPLATES = {
    "software_engineer": {
        "opening": [
            "I am writing to express my strong interest in the {job_title} position at {company_name}. With {experience_years} years of experience in software development and expertise in {top_skills}, I am excited about the opportunity to contribute to your team.",
            "I was thrilled to discover the {job_title} opening at {company_name}. As a passionate software engineer with {experience_years} years of experience and proficiency in {top_skills}, I believe I would be a valuable addition to your development team.",
            "Having followed {company_name}'s innovative work in the tech industry, I am excited to apply for the {job_title} position. My background in {top_skills} and {experience_years} years of development experience align perfectly with your team's needs."
        ],
        "body": [
            "In my previous roles, I have successfully developed and deployed applications using {technical_skills}, demonstrating my ability to work with modern technology stacks. My experience includes {specific_achievements}, which has given me valuable insights into scalable software architecture and best practices.",
            "Throughout my career, I have gained extensive experience in {technical_skills}, working on projects that range from {project_types}. I am particularly proud of {specific_achievements}, which showcases my problem-solving abilities and technical expertise.",
            "My technical expertise spans {technical_skills}, and I have applied these skills to deliver {specific_achievements}. I am passionate about writing clean, maintainable code and following industry best practices for software development."
        ],
        "closing": [
            "I am eager to bring my technical skills and passion for software development to {company_name}. I would welcome the opportunity to discuss how my experience with {top_skills} can contribute to your team's success. Thank you for considering my application.",
            "I am excited about the possibility of joining {company_name} and contributing to your innovative projects. I look forward to discussing how my expertise in {top_skills} can help drive your technology initiatives forward.",
            "Thank you for considering my application. I am enthusiastic about the opportunity to contribute to {company_name}'s mission and would love to discuss how my technical background in {top_skills} aligns with your team's goals."
        ]
    },
    "data_scientist": {
        "opening": [
            "I am excited to apply for the {job_title} position at {company_name}. With {experience_years} years of experience in data science and machine learning, along with expertise in {top_skills}, I am eager to help your team derive actionable insights from data.",
            "As a data science professional with {experience_years} years of experience and strong skills in {top_skills}, I am writing to express my interest in the {job_title} role at {company_name}."
        ],
        "body": [
            "My experience includes building predictive models, conducting statistical analysis, and creating data visualizations using {technical_skills}. I have successfully {specific_achievements}, demonstrating my ability to translate complex data into business value.",
            "I have extensive experience working with {technical_skills} to solve complex business problems through data analysis and machine learning. My achievements include {specific_achievements}, which showcase my ability to drive data-driven decision making."
        ],
        "closing": [
            "I am passionate about using data to solve real-world problems and would be thrilled to bring this passion to {company_name}. I look forward to discussing how my expertise in {top_skills} can contribute to your data science initiatives.",
            "Thank you for considering my application. I am excited about the opportunity to leverage my skills in {top_skills} to help {company_name} make data-driven decisions and achieve its business objectives."
        ]
    },
    "product_manager": {
        "opening": [
            "I am writing to apply for the {job_title} position at {company_name}. With {experience_years} years of experience in product management and a strong background in {top_skills}, I am excited about the opportunity to drive product strategy and execution at your company."
        ],
        "body": [
            "In my previous roles, I have successfully managed product lifecycles from conception to launch, working closely with engineering, design, and business stakeholders. My experience with {technical_skills} has enabled me to effectively communicate with technical teams and make informed product decisions."
        ],
        "closing": [
            "I am passionate about building products that solve real user problems and would be thrilled to contribute to {company_name}'s product vision. I look forward to discussing how my experience can help drive your product strategy forward."
        ]
    },
    "marketing_manager": {
        "opening": [
            "I am excited to apply for the {job_title} position at {company_name}. With {experience_years} years of marketing experience and expertise in {top_skills}, I am eager to help drive your marketing initiatives and brand growth."
        ],
        "body": [
            "My experience includes developing and executing marketing campaigns, analyzing performance metrics, and managing cross-functional projects. I have successfully {specific_achievements}, demonstrating my ability to drive measurable business results."
        ],
        "closing": [
            "I am passionate about creating compelling marketing strategies that resonate with target audiences and drive business growth. I would welcome the opportunity to discuss how my skills in {top_skills} can contribute to {company_name}'s marketing success."
        ]
    },
    "generic": {
        "opening": [
            "I am writing to express my strong interest in the {job_title} position at {company_name}. With {experience_years} years of relevant experience and expertise in {top_skills}, I believe I would be a valuable addition to your team.",
            "I was excited to learn about the {job_title} opportunity at {company_name}. My background in {top_skills} and {experience_years} years of professional experience make me well-suited for this role."
        ],
        "body": [
            "Throughout my career, I have developed strong skills in {technical_skills} and have successfully {specific_achievements}. I am passionate about {relevant_passion} and committed to delivering high-quality results.",
            "My professional experience has provided me with expertise in {technical_skills}, and I have consistently demonstrated my ability to {specific_achievements}. I am particularly drawn to {company_name} because of {company_reason}."
        ],
        "closing": [
            "I am enthusiastic about the opportunity to contribute to {company_name} and would welcome the chance to discuss how my skills and experience align with your team's needs. Thank you for your consideration.",
            "Thank you for considering my application. I look forward to the opportunity to discuss how my expertise in {top_skills} can contribute to {company_name}'s continued success."
        ]
    }
}

# Achievement templates based on common accomplishments
ACHIEVEMENT_TEMPLATES = [
    "reducing system response time by 40% through performance optimization",
    "leading a team of {team_size} developers to deliver projects on time",
    "implementing automated testing that reduced bugs by 60%",
    "designing and building scalable systems handling {scale} users",
    "mentoring junior developers and improving team productivity",
    "migrating legacy systems to modern cloud infrastructure",
    "developing RESTful APIs that serve millions of requests daily",
    "creating data pipelines that process terabytes of information",
    "building machine learning models with 95%+ accuracy",
    "establishing CI/CD pipelines that improved deployment speed by 3x"
]


def determine_role_category(job_title: str, job_description: str = "") -> str:
    """
    Determine the role category based on job title and description.
    """
    text = f"{job_title} {job_description}".lower()
    
    if any(term in text for term in ["software engineer", "developer", "programmer", "full stack", "backend", "frontend"]):
        return "software_engineer"
    elif any(term in text for term in ["data scientist", "machine learning", "data analyst", "ml engineer"]):
        return "data_scientist"
    elif any(term in text for term in ["product manager", "product owner", "pm"]):
        return "product_manager"
    elif any(term in text for term in ["marketing", "brand manager", "digital marketing", "growth"]):
        return "marketing_manager"
    else:
        return "generic"


def extract_technical_skills(skills: List[str], limit: int = 5) -> List[str]:
    """
    Extract and prioritize technical skills for cover letter.
    """
    # Prioritize programming languages and frameworks
    priority_skills = []
    other_skills = []
    
    priority_keywords = [
        "python", "javascript", "typescript", "java", "react", "vue", "angular",
        "node.js", "express", "django", "flask", "spring", "aws", "docker",
        "kubernetes", "tensorflow", "pytorch", "sql", "mongodb"
    ]
    
    for skill in skills:
        if any(keyword in skill.lower() for keyword in priority_keywords):
            priority_skills.append(skill)
        else:
            other_skills.append(skill)
    
    # Return top priority skills + other skills up to limit
    result = priority_skills[:limit]
    if len(result) < limit:
        result.extend(other_skills[:limit - len(result)])
    
    return result


def generate_specific_achievements(skills: List[str], experience_years: float) -> List[str]:
    """
    Generate specific achievements based on skills and experience.
    """
    achievements = []
    
    skill_set = {skill.lower() for skill in skills}
    
    # Technical achievements
    if any(skill in skill_set for skill in ["python", "java", "javascript"]):
        achievements.append("developing robust applications with clean, maintainable code")
    
    if any(skill in skill_set for skill in ["react", "vue", "angular"]):
        achievements.append("creating responsive web applications with modern frameworks")
    
    if any(skill in skill_set for skill in ["aws", "docker", "kubernetes"]):
        achievements.append("deploying scalable applications using cloud technologies")
    
    if any(skill in skill_set for skill in ["sql", "mongodb", "postgresql"]):
        achievements.append("designing efficient database schemas and optimizing queries")
    
    if any(skill in skill_set for skill in ["tensorflow", "pytorch", "scikit-learn"]):
        achievements.append("building machine learning models that drive business decisions")
    
    # Experience-based achievements
    if experience_years >= 5:
        achievements.append("mentoring junior team members and leading technical initiatives")
        achievements.append("architecting systems that handle enterprise-scale traffic")
    elif experience_years >= 3:
        achievements.append("delivering complex projects from conception to production")
        achievements.append("collaborating effectively with cross-functional teams")
    else:
        achievements.append("quickly adapting to new technologies and best practices")
        achievements.append("contributing to team success through reliable code delivery")
    
    return achievements


def generate_cover_letter(
    company_name: str,
    job_title: str,
    job_description: str = "",
    resume_skills: List[str] = None,
    experience_years: float = 0,
    applicant_name: str = "[Your Name]",
    use_ai: bool = False
) -> Dict[str, str]:
    """
    Generate a professional cover letter.
    
    Args:
        company_name: Target company name
        job_title: Job position title
        job_description: Job posting description (optional)
        resume_skills: List of skills from resume
        experience_years: Years of experience
        applicant_name: Applicant's name
        use_ai: Whether to use AI enhancement (placeholder for future AI integration)
    
    Returns:
        Dictionary with cover letter content and metadata
    """
    if not resume_skills:
        resume_skills = []
    
    # Determine role category
    role_category = determine_role_category(job_title, job_description)
    
    # Get appropriate template
    template = COVER_LETTER_TEMPLATES.get(role_category, COVER_LETTER_TEMPLATES["generic"])
    
    # Extract top skills
    top_skills = extract_technical_skills(resume_skills, 3)
    technical_skills = extract_technical_skills(resume_skills, 5)
    
    # Generate achievements
    achievements = generate_specific_achievements(resume_skills, experience_years)
    
    # Format experience years
    if experience_years == 0:
        exp_text = "extensive"
    elif experience_years < 1:
        exp_text = "emerging"
    elif experience_years == 1:
        exp_text = "1 year of"
    else:
        exp_text = f"{int(experience_years)} years of"
    
    # Prepare template variables
    variables = {
        "company_name": company_name,
        "job_title": job_title,
        "experience_years": exp_text,
        "top_skills": ", ".join(top_skills) if top_skills else "various technologies",
        "technical_skills": ", ".join(technical_skills) if technical_skills else "modern development tools",
        "specific_achievements": ", ".join(achievements[:2]) if achievements else "delivering high-quality solutions",
        "project_types": "web applications to data analysis tools",
        "relevant_passion": "creating efficient, user-focused solutions",
        "company_reason": "its commitment to innovation and excellence",
        "team_size": "5",
        "scale": "100K+"
    }
    
    # Select random templates
    import random
    opening = random.choice(template["opening"]).format(**variables)
    body = random.choice(template["body"]).format(**variables)
    closing = random.choice(template["closing"]).format(**variables)
    
    # Construct full letter
    date_str = datetime.now().strftime("%B %d, %Y")
    
    cover_letter = f"""{date_str}

Dear Hiring Manager,

{opening}

{body}

{closing}

Sincerely,
{applicant_name}
"""
    
    return {
        "cover_letter": cover_letter,
        "opening": opening,
        "body": body,
        "closing": closing,
        "word_count": len(cover_letter.split()),
        "character_count": len(cover_letter),
        "role_category": role_category,
        "skills_highlighted": top_skills,
        "generated_at": datetime.now().isoformat()
    }


def generate_multiple_versions(
    company_name: str,
    job_title: str,
    job_description: str = "",
    resume_skills: List[str] = None,
    experience_years: float = 0,
    applicant_name: str = "[Your Name]",
    num_versions: int = 3
) -> List[Dict[str, str]]:
    """
    Generate multiple versions of cover letter with different tones.
    """
    versions = []
    
    for i in range(num_versions):
        version = generate_cover_letter(
            company_name=company_name,
            job_title=job_title,
            job_description=job_description,
            resume_skills=resume_skills,
            experience_years=experience_years,
            applicant_name=applicant_name
        )
        version["version"] = i + 1
        version["tone"] = ["Professional", "Enthusiastic", "Confident"][i % 3]
        versions.append(version)
    
    return versions


def get_cover_letter_tips(role_category: str) -> List[str]:
    """
    Get role-specific tips for cover letter writing.
    """
    general_tips = [
        "Keep the letter to one page (250-400 words)",
        "Use a professional tone and active voice",
        "Customize each letter for the specific company and role",
        "Include specific examples and quantifiable achievements",
        "Research the company culture and values",
        "Proofread carefully for grammar and spelling errors",
        "Use the same font and formatting as your resume",
        "Address the hiring manager by name if possible"
    ]
    
    role_specific_tips = {
        "software_engineer": [
            "Mention specific technologies mentioned in the job posting",
            "Include links to your GitHub profile or portfolio",
            "Quantify your impact (e.g., improved performance by 40%)",
            "Show understanding of the company's technical challenges"
        ],
        "data_scientist": [
            "Highlight your experience with relevant data tools and languages",
            "Mention specific types of models or analyses you've built",
            "Show understanding of business impact from data insights",
            "Include relevant certifications or publications"
        ],
        "product_manager": [
            "Demonstrate understanding of the product and market",
            "Show experience working with cross-functional teams",
            "Mention specific metrics or KPIs you've improved",
            "Highlight user research or customer-facing experience"
        ]
    }
    
    tips = general_tips.copy()
    if role_category in role_specific_tips:
        tips.extend(role_specific_tips[role_category])
    
    return tips


def validate_cover_letter_content(content: str) -> Dict[str, object]:
    """
    Validate cover letter content and provide improvement suggestions.
    """
    issues = []
    suggestions = []
    
    # Check length
    word_count = len(content.split())
    if word_count < 200:
        issues.append("Cover letter is too short")
        suggestions.append("Add more specific examples and details about your experience")
    elif word_count > 500:
        issues.append("Cover letter is too long")
        suggestions.append("Condense your content to focus on the most relevant points")
    
    # Check for placeholder text
    if "[Your Name]" in content:
        issues.append("Contains placeholder text")
        suggestions.append("Replace placeholder text with actual information")
    
    # Check for generic language
    generic_phrases = ["to whom it may concern", "dear sir/madam", "i am writing to apply"]
    if any(phrase in content.lower() for phrase in generic_phrases):
        issues.append("Contains generic language")
        suggestions.append("Use more specific and personalized language")
    
    # Check for quantifiable achievements
    numbers = re.findall(r'\b\d+[%$]?\b', content)
    if len(numbers) < 2:
        suggestions.append("Include more quantifiable achievements and metrics")
    
    return {
        "word_count": word_count,
        "character_count": len(content),
        "issues": issues,
        "suggestions": suggestions,
        "score": max(0, 100 - len(issues) * 20)
    }
