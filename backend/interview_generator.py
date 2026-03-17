"""AI Interview Question Generator based on detected skills.

Generates technical interview questions for different skill domains.
Includes rule-based fallback for offline mode.
"""

import random
from typing import Dict, List, Tuple


# Question templates organized by skill category
INTERVIEW_QUESTIONS = {
    "python": [
        {
            "question": "Explain the difference between list and tuple in Python. When would you use each?",
            "example_answer": "Lists are mutable and use square brackets [], while tuples are immutable and use parentheses (). Use lists for data that changes, tuples for fixed data like coordinates.",
            "tips": ["Mention mutability", "Give practical examples", "Discuss performance implications"]
        },
        {
            "question": "What is a Python decorator and how would you implement one?",
            "example_answer": "A decorator modifies or extends function behavior without changing its code. Example: @property, @staticmethod. Implementation uses wrapper functions or classes.",
            "tips": ["Show code example", "Explain use cases", "Mention functools.wraps"]
        },
        {
            "question": "How do you handle exceptions in Python? Explain try-except-finally.",
            "example_answer": "Use try-except blocks to catch exceptions, finally for cleanup code that always runs. Specific exceptions should be caught before general ones.",
            "tips": ["Show exception hierarchy", "Mention logging", "Discuss best practices"]
        }
    ],
    "javascript": [
        {
            "question": "Explain the difference between let, const, and var in JavaScript.",
            "example_answer": "var has function scope and hoisting issues. let has block scope, const is block-scoped and immutable. Use const by default, let when reassignment needed.",
            "tips": ["Discuss hoisting", "Show scope examples", "Mention temporal dead zone"]
        },
        {
            "question": "What is event bubbling and how can you prevent it?",
            "example_answer": "Event bubbling propagates events from child to parent elements. Use event.stopPropagation() to prevent it, or event.preventDefault() to stop default behavior.",
            "tips": ["Draw DOM tree", "Show practical example", "Mention event delegation"]
        },
        {
            "question": "Explain promises and async/await in JavaScript.",
            "example_answer": "Promises handle asynchronous operations with .then()/.catch(). Async/await provides synchronous-looking syntax for promises, making code more readable.",
            "tips": ["Show code comparison", "Discuss error handling", "Mention Promise.all()"]
        }
    ],
    "react": [
        {
            "question": "What are React hooks and why were they introduced?",
            "example_answer": "Hooks let you use state and lifecycle methods in functional components. They solve problems like wrapper hell and complex class components.",
            "tips": ["Compare with class components", "Show useState/useEffect examples", "Mention custom hooks"]
        },
        {
            "question": "Explain the virtual DOM and how React uses it for performance.",
            "example_answer": "Virtual DOM is a JavaScript representation of the real DOM. React compares (diffs) virtual DOM trees and updates only changed elements, improving performance.",
            "tips": ["Draw diagram", "Explain diffing algorithm", "Discuss reconciliation"]
        }
    ],
    "sql": [
        {
            "question": "Explain the difference between INNER JOIN and LEFT JOIN.",
            "example_answer": "INNER JOIN returns only matching records from both tables. LEFT JOIN returns all records from the left table and matching records from the right table.",
            "tips": ["Draw Venn diagrams", "Show practical examples", "Mention performance implications"]
        },
        {
            "question": "What is database normalization and why is it important?",
            "example_answer": "Normalization eliminates data redundancy by organizing data into related tables. It prevents update anomalies and ensures data consistency.",
            "tips": ["Explain 1NF, 2NF, 3NF", "Show examples", "Discuss trade-offs with denormalization"]
        }
    ],
    "aws": [
        {
            "question": "Explain the difference between EC2, Lambda, and ECS.",
            "example_answer": "EC2 provides virtual servers, Lambda runs serverless functions, ECS orchestrates Docker containers. Each serves different compute needs and scaling patterns.",
            "tips": ["Discuss use cases", "Compare pricing models", "Mention scaling characteristics"]
        },
        {
            "question": "How would you design a highly available web application on AWS?",
            "example_answer": "Use multiple AZs, load balancers (ALB), auto-scaling groups, RDS with Multi-AZ, CloudFront CDN, and Route 53 for DNS failover.",
            "tips": ["Draw architecture diagram", "Discuss disaster recovery", "Mention monitoring with CloudWatch"]
        }
    ],
    "docker": [
        {
            "question": "Explain the difference between a Docker image and a container.",
            "example_answer": "An image is a read-only template with application code and dependencies. A container is a running instance of an image with its own filesystem and processes.",
            "tips": ["Use analogy (class vs object)", "Show docker commands", "Discuss layered filesystem"]
        }
    ],
    "kubernetes": [
        {
            "question": "What are Kubernetes pods and why don't we deploy containers directly?",
            "example_answer": "Pods are the smallest deployable units containing one or more containers. They provide shared networking and storage, enabling sidecar patterns and atomic deployment.",
            "tips": ["Explain pod lifecycle", "Show YAML examples", "Discuss multi-container patterns"]
        }
    ],
    "machine learning": [
        {
            "question": "Explain the bias-variance tradeoff in machine learning.",
            "example_answer": "Bias is error from oversimplified assumptions. Variance is error from sensitivity to training data. High bias = underfitting, high variance = overfitting.",
            "tips": ["Draw curve diagrams", "Give model examples", "Discuss regularization"]
        },
        {
            "question": "How would you handle imbalanced datasets?",
            "example_answer": "Techniques include resampling (SMOTE, undersampling), class weights, ensemble methods, and using appropriate metrics like F1-score or AUC-ROC instead of accuracy.",
            "tips": ["Explain why accuracy fails", "Show practical examples", "Mention evaluation metrics"]
        }
    ]
}

# General behavioral questions for any role
BEHAVIORAL_QUESTIONS = [
    {
        "question": "Tell me about a challenging project you worked on and how you overcame obstacles.",
        "example_answer": "Use the STAR method: Situation, Task, Action, Result. Focus on your specific contributions and lessons learned.",
        "tips": ["Be specific with examples", "Quantify the impact", "Show problem-solving skills"]
    },
    {
        "question": "How do you stay updated with new technologies in your field?",
        "example_answer": "I follow tech blogs, contribute to open source, attend conferences, and build side projects to experiment with new technologies.",
        "tips": ["Show continuous learning", "Mention specific resources", "Demonstrate practical application"]
    },
    {
        "question": "Describe a time when you had to work with a difficult team member.",
        "example_answer": "Focus on communication, finding common ground, and maintaining professionalism while achieving project goals.",
        "tips": ["Show emotional intelligence", "Focus on resolution", "Avoid blame or negativity"]
    }
]

# System design questions for senior roles
SYSTEM_DESIGN_QUESTIONS = [
    {
        "question": "Design a URL shortening service like bit.ly.",
        "example_answer": "Key components: URL encoding/decoding, database design, caching layer, load balancing, analytics tracking, and rate limiting.",
        "tips": ["Start with requirements", "Draw high-level architecture", "Discuss scalability and trade-offs"]
    },
    {
        "question": "How would you design a chat application like WhatsApp?",
        "example_answer": "Real-time messaging with WebSockets, message queuing, user presence, push notifications, media storage, and end-to-end encryption.",
        "tips": ["Consider mobile and web clients", "Discuss message delivery guarantees", "Address privacy and security"]
    }
]


def generate_interview_questions(
    detected_skills: List[str], 
    experience_level: str = "mid",
    question_count: int = 5
) -> List[Dict[str, object]]:
    """
    Generate interview questions based on detected skills.
    
    Args:
        detected_skills: List of skills found in resume
        experience_level: "junior", "mid", or "senior"
        question_count: Number of questions to generate
    
    Returns:
        List of question objects with question, example_answer, and tips
    """
    questions = []
    
    # Map skills to question categories
    skill_categories = set()
    for skill in detected_skills:
        skill_lower = skill.lower()
        if skill_lower in INTERVIEW_QUESTIONS:
            skill_categories.add(skill_lower)
        # Map similar skills
        elif any(tech in skill_lower for tech in ['react', 'vue', 'angular']):
            skill_categories.add('react')
        elif any(tech in skill_lower for tech in ['java', 'spring']):
            skill_categories.add('java')
        elif any(tech in skill_lower for tech in ['ml', 'tensorflow', 'pytorch', 'scikit']):
            skill_categories.add('machine learning')
    
    # Add technical questions based on skills
    technical_questions = []
    for category in skill_categories:
        if category in INTERVIEW_QUESTIONS:
            technical_questions.extend(INTERVIEW_QUESTIONS[category])
    
    # Select technical questions
    if technical_questions:
        selected_technical = random.sample(
            technical_questions, 
            min(len(technical_questions), max(1, question_count - 2))
        )
        questions.extend(selected_technical)
    
    # Add behavioral questions
    behavioral_count = min(2, question_count - len(questions))
    if behavioral_count > 0:
        selected_behavioral = random.sample(BEHAVIORAL_QUESTIONS, behavioral_count)
        questions.extend(selected_behavioral)
    
    # Add system design questions for senior levels
    if experience_level == "senior" and len(questions) < question_count:
        system_count = min(1, question_count - len(questions))
        selected_system = random.sample(SYSTEM_DESIGN_QUESTIONS, system_count)
        questions.extend(selected_system)
    
    # Shuffle and limit to requested count
    random.shuffle(questions)
    return questions[:question_count]


def get_skill_specific_tips(skills: List[str]) -> List[str]:
    """
    Generate interview preparation tips based on detected skills.
    """
    tips = []
    
    skill_set = {skill.lower() for skill in skills}
    
    # Programming language tips
    if any(lang in skill_set for lang in ['python', 'javascript', 'java', 'typescript']):
        tips.append("Be prepared to write code on a whiteboard or shared screen")
        tips.append("Review data structures and algorithms fundamentals")
    
    # Frontend tips
    if any(tech in skill_set for tech in ['react', 'vue', 'angular', 'html', 'css']):
        tips.append("Be ready to discuss responsive design and browser compatibility")
        tips.append("Prepare examples of UI/UX decisions you've made")
    
    # Backend tips
    if any(tech in skill_set for tech in ['fastapi', 'express', 'django', 'spring']):
        tips.append("Review API design principles (REST, GraphQL)")
        tips.append("Be prepared to discuss database design and scaling")
    
    # Cloud tips
    if any(cloud in skill_set for cloud in ['aws', 'gcp', 'azure']):
        tips.append("Review cloud architecture patterns and cost optimization")
        tips.append("Prepare to discuss disaster recovery and high availability")
    
    # Data/ML tips
    if any(tech in skill_set for tech in ['pandas', 'tensorflow', 'pytorch', 'sql']):
        tips.append("Review statistical concepts and model evaluation metrics")
        tips.append("Prepare to discuss data pipeline and ETL processes")
    
    # General tips
    tips.extend([
        "Prepare specific examples using the STAR method (Situation, Task, Action, Result)",
        "Research the company's technology stack and recent developments",
        "Prepare thoughtful questions about team culture and technical challenges",
        "Practice explaining technical concepts to non-technical stakeholders"
    ])
    
    return tips


def generate_mock_interview_session(
    skills: List[str],
    role: str = "Software Engineer",
    duration_minutes: int = 45
) -> Dict[str, object]:
    """
    Generate a complete mock interview session with timing.
    """
    # Determine experience level from skills count and complexity
    experience_level = "junior"
    if len(skills) > 15:
        experience_level = "senior"
    elif len(skills) > 8:
        experience_level = "mid"
    
    # Generate questions
    question_count = max(3, min(8, duration_minutes // 8))
    questions = generate_interview_questions(skills, experience_level, question_count)
    
    # Calculate timing
    time_per_question = duration_minutes // len(questions) if questions else 5
    
    return {
        "role": role,
        "experience_level": experience_level,
        "duration_minutes": duration_minutes,
        "question_count": len(questions),
        "time_per_question": time_per_question,
        "questions": questions,
        "preparation_tips": get_skill_specific_tips(skills),
        "interview_structure": {
            "introduction": "2-3 minutes",
            "technical_questions": f"{time_per_question * len([q for q in questions if 'behavioral' not in str(q)])} minutes",
            "behavioral_questions": f"{time_per_question * len([q for q in questions if 'behavioral' in str(q)])} minutes",
            "your_questions": "5-10 minutes"
        }
    }
