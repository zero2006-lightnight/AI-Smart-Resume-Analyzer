# AI Smart Resume Analyzer

Upload a PDF resume, extract text with PyMuPDF, detect skills via simple keyword matching, score ATS alignment, and render insights in a modern React dashboard.

## Stack
- **Backend:** FastAPI, PyMuPDF
- **Frontend:** Vite (React), TailwindCSS, Chart.js

## Structure
```
ai-resume-analyzer
├─ backend
│  ├─ main.py            # FastAPI app & routes
│  ├─ resume_parser.py   # PDF text extraction
│  ├─ skill_extractor.py # Keyword matching over skills dataset
│  ├─ ats_score.py       # ATS scoring formula + suggestions
│  ├─ job_matcher.py     # Simple role recommendations
│  └─ data/skills_dataset.json
├─ frontend
│  ├─ src
│  │  ├─ App.jsx
│  │  ├─ UploadPage.jsx
│  │  ├─ Dashboard.jsx
│  │  ├─ api.js
│  │  └─ main.jsx
│  ├─ index.html
│  ├─ index.css
│  ├─ package.json
│  └─ vite.config.js
└─ requirements.txt
```

## Backend setup
```bash
cd ai-resume-analyzer/backend
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
pip install -r ../requirements.txt

# Run API
python -m uvicorn backend.main:app --reload --port 8000
```

Health check: http://localhost:8000/health

## Frontend setup
```bash
cd ai-resume-analyzer/frontend
npm install
npm run dev
```

If your API runs elsewhere, create `frontend/.env`:
```
VITE_API_BASE=http://localhost:8000
```

## ATS scoring formula
- 30% skills match
- 20% keyword density (keyword overlap)
- 15% experience section
- 15% education section
- 10% projects section
- 10% formatting

Outputs include detected skills, missing job-aligned skills, keyword density, ATS breakdown, job recommendations, and AI suggestions.

## Dataset
`backend/data/skills_dataset.json` holds 200+ tech skills across 10 categories (Programming, Web, Cloud, DevOps, Data Science, ML, Cybersecurity, Mobile, Databases, Tools).

## Run end-to-end in VS Code
1) Start backend: `python -m uvicorn backend.main:app --reload --port 8000`
2) Start frontend: `npm run dev`
3) Open the shown URL (default http://localhost:5173) and ensure API base points to http://localhost:8000.
