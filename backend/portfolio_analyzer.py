"""Portfolio and GitHub Profile Analyzer.

Analyzes GitHub repositories, commit activity, and portfolio websites.
Provides scores and improvement suggestions.
"""

import re
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlparse


# Technology keywords to detect in repository descriptions and names
TECH_KEYWORDS = {
    "Frontend": [
        "react", "vue", "angular", "html", "css", "javascript", "typescript",
        "next.js", "nuxt", "svelte", "tailwind", "bootstrap", "sass", "webpack"
    ],
    "Backend": [
        "python", "node.js", "express", "fastapi", "django", "flask", "java",
        "spring", "go", "rust", "php", "laravel", "ruby", "rails"
    ],
    "Database": [
        "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "sqlite",
        "cassandra", "dynamodb", "firebase"
    ],
    "DevOps": [
        "docker", "kubernetes", "aws", "gcp", "azure", "terraform", "ansible",
        "jenkins", "github actions", "ci/cd", "nginx"
    ],
    "Mobile": [
        "react native", "flutter", "swift", "kotlin", "android", "ios",
        "xamarin", "ionic"
    ],
    "Data Science": [
        "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "jupyter",
        "matplotlib", "seaborn", "plotly", "r", "spark"
    ],
    "AI/ML": [
        "machine learning", "deep learning", "neural network", "nlp", "computer vision",
        "tensorflow", "pytorch", "keras", "opencv", "transformers"
    ]
}

# Quality indicators for repositories
QUALITY_INDICATORS = {
    "documentation": ["readme", "docs", "documentation", "wiki"],
    "testing": ["test", "spec", "jest", "pytest", "unittest", "cypress"],
    "ci_cd": [".github/workflows", "jenkins", "travis", "circleci", ".gitlab-ci"],
    "structure": ["package.json", "requirements.txt", "Dockerfile", "makefile"],
    "best_practices": [".gitignore", "license", "contributing", "code_of_conduct"]
}


def extract_github_username(url: str) -> Optional[str]:
    """
    Extract GitHub username from various GitHub URL formats.
    """
    if not url or 'github.com' not in url.lower():
        return None
    
    patterns = [
        r'github\.com/([^/\s]+)',
        r'github\.com/([^/\s]+)/'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url, re.IGNORECASE)
        if match:
            username = match.group(1)
            # Filter out common GitHub paths that aren't usernames
            if username.lower() not in ['login', 'join', 'pricing', 'features', 'search']:
                return username
    
    return None


def analyze_repository_name_and_description(name: str, description: str = "") -> Dict[str, object]:
    """
    Analyze repository name and description to extract technologies and purpose.
    """
    text = f"{name} {description}".lower()
    
    detected_technologies = {}
    for category, keywords in TECH_KEYWORDS.items():
        found_techs = [tech for tech in keywords if tech in text]
        if found_techs:
            detected_technologies[category] = found_techs
    
    # Determine project type
    project_type = "Unknown"
    if any(word in text for word in ["api", "backend", "server"]):
        project_type = "Backend API"
    elif any(word in text for word in ["frontend", "ui", "dashboard", "website"]):
        project_type = "Frontend Application"
    elif any(word in text for word in ["fullstack", "full-stack", "webapp"]):
        project_type = "Full-Stack Application"
    elif any(word in text for word in ["mobile", "app", "android", "ios"]):
        project_type = "Mobile Application"
    elif any(word in text for word in ["ml", "ai", "model", "prediction"]):
        project_type = "AI/ML Project"
    elif any(word in text for word in ["data", "analysis", "visualization"]):
        project_type = "Data Analysis"
    elif any(word in text for word in ["cli", "tool", "utility"]):
        project_type = "CLI Tool"
    elif any(word in text for word in ["library", "package", "sdk"]):
        project_type = "Library/Package"
    
    return {
        "project_type": project_type,
        "technologies": detected_technologies,
        "tech_count": sum(len(techs) for techs in detected_technologies.values())
    }


def analyze_github_profile_simulation(username: str) -> Dict[str, object]:
    """
    Simulate GitHub profile analysis since we can't make real API calls.
    This provides realistic analysis structure for demonstration.
    """
    # Simulated data based on typical developer profiles
    simulated_repos = [
        {"name": "react-dashboard", "description": "Modern dashboard built with React and TypeScript", "stars": 25, "forks": 8, "language": "TypeScript"},
        {"name": "python-api", "description": "RESTful API using FastAPI and PostgreSQL", "stars": 42, "forks": 12, "language": "Python"},
        {"name": "ml-projects", "description": "Machine learning experiments with scikit-learn and TensorFlow", "stars": 18, "forks": 5, "language": "Python"},
        {"name": "portfolio-website", "description": "Personal portfolio built with Next.js and Tailwind CSS", "stars": 8, "forks": 2, "language": "JavaScript"},
        {"name": "mobile-app", "description": "React Native app for task management", "stars": 15, "forks": 4, "language": "JavaScript"}
    ]
    
    # Analyze repositories
    all_technologies = {}
    project_types = []
    total_stars = 0
    total_forks = 0
    languages = {}
    
    for repo in simulated_repos:
        analysis = analyze_repository_name_and_description(repo["name"], repo["description"])
        project_types.append(analysis["project_type"])
        total_stars += repo["stars"]
        total_forks += repo["forks"]
        
        # Count languages
        lang = repo["language"]
        languages[lang] = languages.get(lang, 0) + 1
        
        # Merge technologies
        for category, techs in analysis["technologies"].items():
            if category not in all_technologies:
                all_technologies[category] = set()
            all_technologies[category].update(techs)
    
    # Convert sets back to lists
    for category in all_technologies:
        all_technologies[category] = list(all_technologies[category])
    
    # Calculate scores
    repo_count = len(simulated_repos)
    diversity_score = len(all_technologies) * 10  # 10 points per tech category
    activity_score = min(100, repo_count * 15)  # 15 points per repo, max 100
    popularity_score = min(100, total_stars * 2)  # 2 points per star, max 100
    collaboration_score = min(100, total_forks * 5)  # 5 points per fork, max 100
    
    overall_score = (diversity_score + activity_score + popularity_score + collaboration_score) / 4
    
    return {
        "username": username,
        "repository_count": repo_count,
        "total_stars": total_stars,
        "total_forks": total_forks,
        "languages": languages,
        "technologies": all_technologies,
        "project_types": list(set(project_types)),
        "scores": {
            "overall": round(overall_score, 1),
            "diversity": min(100, diversity_score),
            "activity": activity_score,
            "popularity": popularity_score,
            "collaboration": collaboration_score
        },
        "repositories": simulated_repos
    }


def analyze_portfolio_website(url: str) -> Dict[str, object]:
    """
    Analyze portfolio website URL and structure.
    Since we can't fetch actual content, we'll analyze the URL structure.
    """
    parsed_url = urlparse(url)
    domain = parsed_url.netloc.lower()
    
    # Analyze hosting platform
    hosting_platform = "Custom Domain"
    if "github.io" in domain:
        hosting_platform = "GitHub Pages"
    elif "netlify" in domain:
        hosting_platform = "Netlify"
    elif "vercel" in domain:
        hosting_platform = "Vercel"
    elif "heroku" in domain:
        hosting_platform = "Heroku"
    elif "firebase" in domain:
        hosting_platform = "Firebase Hosting"
    
    # Analyze domain quality
    domain_score = 100
    if ".github.io" in domain or ".netlify" in domain or ".vercel" in domain:
        domain_score = 80
    elif any(free in domain for free in [".tk", ".ml", ".ga", ".cf"]):
        domain_score = 60
    
    # URL structure analysis
    has_https = parsed_url.scheme == "https"
    
    return {
        "url": url,
        "domain": domain,
        "hosting_platform": hosting_platform,
        "has_https": has_https,
        "domain_score": domain_score,
        "suggestions": generate_portfolio_suggestions(hosting_platform, has_https, domain_score)
    }


def generate_portfolio_suggestions(hosting_platform: str, has_https: bool, domain_score: int) -> List[str]:
    """
    Generate improvement suggestions for portfolio websites.
    """
    suggestions = []
    
    if not has_https:
        suggestions.append("Enable HTTPS for security and SEO benefits")
    
    if domain_score < 100:
        suggestions.append("Consider using a custom domain for more professional appearance")
    
    # General portfolio suggestions
    suggestions.extend([
        "Include a clear about section with your background and interests",
        "Showcase 3-5 best projects with live demos and source code links",
        "Add contact information and social media links",
        "Ensure mobile responsiveness across all devices",
        "Include a downloadable resume/CV",
        "Add testimonials or recommendations if available",
        "Implement proper SEO meta tags and descriptions",
        "Use analytics to track visitor engagement"
    ])
    
    return suggestions


def generate_comprehensive_portfolio_analysis(
    github_url: str = "",
    portfolio_url: str = "",
    detected_skills: List[str] = None
) -> Dict[str, object]:
    """
    Generate comprehensive portfolio analysis combining GitHub and website analysis.
    """
    analysis = {
        "github_analysis": None,
        "portfolio_analysis": None,
        "overall_score": 0,
        "recommendations": []
    }
    
    scores = []
    
    # Analyze GitHub profile
    if github_url:
        username = extract_github_username(github_url)
        if username:
            github_analysis = analyze_github_profile_simulation(username)
            analysis["github_analysis"] = github_analysis
            scores.append(github_analysis["scores"]["overall"])
    
    # Analyze portfolio website
    if portfolio_url:
        portfolio_analysis = analyze_portfolio_website(portfolio_url)
        analysis["portfolio_analysis"] = portfolio_analysis
        scores.append(portfolio_analysis["domain_score"])
    
    # Calculate overall score
    if scores:
        analysis["overall_score"] = round(sum(scores) / len(scores), 1)
    
    # Generate recommendations
    recommendations = []
    
    if not github_url:
        recommendations.append("Create a GitHub profile to showcase your coding projects")
    elif analysis["github_analysis"] and analysis["github_analysis"]["repository_count"] < 5:
        recommendations.append("Add more repositories to demonstrate coding consistency")
    
    if not portfolio_url:
        recommendations.append("Create a portfolio website to showcase your work professionally")
    
    # Add general recommendations
    recommendations.extend([
        "Keep repositories updated with recent commits",
        "Add comprehensive README files to all projects",
        "Include live demo links where possible",
        "Write detailed project descriptions highlighting your role",
        "Contribute to open source projects to show collaboration skills"
    ])
    
    analysis["recommendations"] = recommendations
    
    return analysis


def get_portfolio_improvement_roadmap(analysis: Dict[str, object]) -> Dict[str, List[str]]:
    """
    Generate a structured roadmap for portfolio improvement.
    """
    roadmap = {
        "immediate": [],
        "short_term": [],
        "long_term": []
    }
    
    github_analysis = analysis.get("github_analysis")
    portfolio_analysis = analysis.get("portfolio_analysis")
    
    # Immediate actions (1-2 weeks)
    if not portfolio_analysis:
        roadmap["immediate"].append("Create a basic portfolio website using GitHub Pages or Netlify")
    
    if github_analysis and github_analysis["repository_count"] < 3:
        roadmap["immediate"].append("Upload 2-3 existing projects to GitHub with proper README files")
    
    roadmap["immediate"].extend([
        "Update all repository descriptions to clearly explain project purpose",
        "Add live demo links to all web projects",
        "Create a professional GitHub profile README"
    ])
    
    # Short-term actions (1-3 months)
    roadmap["short_term"].extend([
        "Build 1-2 new projects showcasing different technologies",
        "Contribute to 2-3 open source projects",
        "Add comprehensive documentation to existing projects",
        "Implement proper error handling and testing in projects",
        "Create a blog section on your portfolio to share technical insights"
    ])
    
    # Long-term actions (3-12 months)
    roadmap["long_term"].extend([
        "Build a substantial project that showcases full-stack capabilities",
        "Establish yourself as a contributor in relevant open source communities",
        "Write technical articles and tutorials",
        "Speak at meetups or conferences about your projects",
        "Mentor other developers and contribute to the community"
    ])
    
    return roadmap
