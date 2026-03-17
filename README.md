# 🚀 AI Smart Resume Analyzer

**AI Smart Resume Analyzer** is an intelligent career platform that analyzes resumes, calculates ATS scores, detects skills, and provides actionable career insights to help job seekers improve their chances of getting hired.

This project simulates how **Applicant Tracking Systems (ATS)** evaluate resumes and provides recommendations to optimize them for modern hiring pipelines.

---

# 🌐 Project Repository

🔗 GitHub:
https://github.com/zero2006-lightnight/AI-Smart-Resume-Analyzer

---

# 📌 Overview

Many companies use **ATS software** to filter resumes before recruiters review them.
This means a resume may get rejected even if the candidate is qualified.

AI Smart Resume Analyzer helps solve this problem by providing:

* ATS score evaluation
* Skill detection using NLP
* Missing skill analysis
* Job recommendations
* AI career coaching
* Resume building tools
* Visual analytics dashboard

The goal is to help candidates understand how their resumes perform in automated screening systems.

---

# ✨ Key Features

## 📄 Resume Upload & Parsing

Upload resumes in:

* PDF
* DOCX
* TXT

The system extracts text and analyzes the content automatically.

---

## 📊 ATS Score Engine

Calculates an **ATS score (0–100)** based on:

* Skill matching
* Keyword density
* Experience presence
* Education information
* Project descriptions
* Resume formatting

---

## 🧠 Skill Detection

Using **Natural Language Processing**, the system detects:

* Programming languages
* Frameworks
* Databases
* DevOps tools
* Machine learning technologies

---

## ⚠️ Missing Skill Detection

Compare your resume with a job description to identify:

* Missing skills
* Keyword gaps
* Skill alignment percentage

---

## 💼 Job Recommendation Engine

Based on detected skills, the system recommends roles such as:

* Backend Developer
* Frontend Developer
* Full Stack Developer
* Data Scientist
* Machine Learning Engineer
* DevOps Engineer

Each recommendation includes a compatibility score.

---

## 🤖 AI Career Coach

An interactive assistant that provides:

* Resume improvement suggestions
* Skill learning recommendations
* Career development advice
* Interview preparation tips

---

## 🧾 Resume Builder

Users can edit resume sections and generate a clean **ATS-friendly resume**.

Editable sections include:

* Profile summary
* Skills
* Experience
* Projects
* Education

The resume can be exported as **PDF**.

---

## 📈 Interactive Dashboard

Visual analytics help users understand their resume performance:

* ATS score gauge
* Skill distribution charts
* Job compatibility metrics
* Missing skill visualization

---

# 🛠️ Tech Stack

## Frontend

* React
* Vite
* TailwindCSS
* Chart.js
* Framer Motion

## Backend

* FastAPI
* Python

## NLP / AI

* spaCy
* Scikit-learn
* Rule-based AI logic

## File Processing

* PyMuPDF (PDF parsing)
* python-docx (DOCX parsing)

---

# 🏗️ Project Structure

```
AI-Smart-Resume-Analyzer
│
├── backend
│   ├── main.py
│   ├── resume_parser.py
│   ├── skill_extractor.py
│   ├── ats_score.py
│   ├── job_matcher.py
│   └── data
│       └── skills_dataset.json
│
├── frontend
│   ├── src
│   ├── components
│   ├── pages
│   └── styles
│
├── requirements.txt
├── README.md
└── .gitignore
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone the repository

```
git clone https://github.com/zero2006-lightnight/AI-Smart-Resume-Analyzer.git
```

```
cd AI-Smart-Resume-Analyzer
```

---

## 2️⃣ Backend Setup

Create virtual environment:

```
python -m venv .venv
```

Activate environment:

Windows

```
.venv\Scripts\activate
```

Install dependencies:

```
pip install -r requirements.txt
```

Run the backend:

```
uvicorn backend.main:app --reload
```

Backend runs at:

```
http://localhost:8000
```

---

## 3️⃣ Frontend Setup

```
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# 📊 How It Works

1️⃣ User uploads resume
2️⃣ Resume text is extracted
3️⃣ NLP detects skills and keywords
4️⃣ ATS scoring algorithm evaluates the resume
5️⃣ Dashboard displays insights and recommendations

---

# 🚀 Future Improvements

Planned features include:

* AI interview simulator
* Resume vs job compatibility scoring
* Portfolio analyzer
* Automated cover letter generator
* LinkedIn job matching
* Advanced AI career assistant

---

# 🤝 Contributing

Contributions are welcome!

Steps:

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Open a pull request

---

# 📜 License

This project is open-source and available under the MIT License.

---

# 👨‍💻 Author

Developed as a full-stack AI project focused on improving career tools using NLP and machine learning.

---

⭐ If you find this project useful, please consider **starring the repository**.
