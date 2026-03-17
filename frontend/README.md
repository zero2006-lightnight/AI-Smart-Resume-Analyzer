# AI Smart Resume Analyzer (Frontend)

This is the Vite + React + TailwindCSS frontend for the AI Smart Resume Analyzer. It connects to the FastAPI backend to upload a resume PDF, run AI analysis, and visualize the ATS score, skills, and recommendations.

## Getting started

1. Install deps
```bash
cd frontend
npm install
```

2. Run dev server
```bash
npm run dev
```

3. Set API base (optional)

Create `.env` in `frontend/` if your backend is not on `http://localhost:8000`:
```
VITE_API_BASE=http://localhost:8000
```

4. Open the app

Visit the URL shown in the terminal (default `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```
