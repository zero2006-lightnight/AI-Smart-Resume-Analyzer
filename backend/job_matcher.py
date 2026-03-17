"""Recommend job roles based on detected skills using simple similarity scoring."""

from typing import Dict, List, Tuple


ROLE_TEMPLATES: Dict[str, List[str]] = {
    "Frontend Engineer": [
        "react",
        "typescript",
        "javascript",
        "html5",
        "css3",
        "tailwindcss",
        "next.js",
        "redux",
    ],
    "Backend Engineer": [
        "python",
        "java",
        "node.js",
        "express.js",
        "fastapi",
        "postgresql",
        "redis",
        "docker",
    ],
    "Full-Stack Engineer": [
        "javascript",
        "typescript",
        "react",
        "node.js",
        "express.js",
        "postgresql",
        "aws",
        "docker",
    ],
    "Data Scientist": [
        "python",
        "pandas",
        "numpy",
        "scikit-learn",
        "tensorflow",
        "pytorch",
        "sql",
        "matplotlib",
    ],
    "Machine Learning Engineer": [
        "python",
        "scikit-learn",
        "pytorch",
        "tensorflow",
        "mlflow",
        "kubeflow",
        "docker",
        "kubernetes",
    ],
    "DevOps Engineer": [
        "docker",
        "kubernetes",
        "terraform",
        "ansible",
        "aws",
        "gcp",
        "azure",
        "prometheus",
    ],
    "Cloud Engineer": [
        "aws",
        "gcp",
        "azure",
        "terraform",
        "cloudformation",
        "lambda",
        "s3",
        "iam",
    ],
    "Mobile Engineer": [
        "react native",
        "flutter",
        "swift",
        "kotlin",
        "swiftui",
        "android",
        "ios",
        "firebase",
    ],
    "Cybersecurity Analyst": [
        "owasp",
        "nmap",
        "wireshark",
        "siem",
        "splunk",
        "waf",
        "tls",
        "threat modeling",
    ],
    "Data Engineer": [
        "python",
        "sql",
        "airflow",
        "dbt",
        "spark",
        "kafka",
        "aws",
        "gcp",
    ],
}


def recommend_jobs(detected_skills: List[str], limit: int = 5) -> List[Tuple[str, float]]:
    lower_skills = {s.lower() for s in detected_skills}
    scores: List[Tuple[str, float]] = []

    for role, skills in ROLE_TEMPLATES.items():
        overlap = lower_skills.intersection({s.lower() for s in skills})
        if not skills:
            continue
        score = len(overlap) / len(skills)
        scores.append((role, round(score * 100, 2)))

    scores.sort(key=lambda x: x[1], reverse=True)
    return scores[:limit]
