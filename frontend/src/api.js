export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

// Resume Analysis
export async function analyzeResume(file, jobDescription) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("job_description", jobDescription || "");

  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Upload failed");
  }

  return res.json();
}

// Skills Dataset
export async function fetchSkills() {
  const res = await fetch(`${API_BASE}/skills`);
  if (!res.ok) throw new Error("Unable to load skills dataset");
  return res.json();
}

// Enhanced Career Coach
export async function careerCoachChat(userMessage, resumeAnalysis) {
  const payload = {
    user_message: userMessage,
    resume_analysis: {
      skills: resumeAnalysis?.skills || [],
      missing_skills: resumeAnalysis?.missing_skills || [],
      ats_score: resumeAnalysis?.ats_score || 0,
      recommended_roles: resumeAnalysis?.recommended_roles || [],
      experience_years: resumeAnalysis?.experience_years ?? null,
    },
  };

  const res = await fetch(`${API_BASE}/career_coach_chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Chat failed" }));
    throw new Error(err.detail || "Chat failed");
  }

  return res.json();
}

// Interview Generation
export async function generateInterviewQuestions(skills, experienceLevel = "mid", questionCount = 5, role = "Software Engineer") {
  const payload = {
    skills,
    experience_level: experienceLevel,
    question_count: questionCount,
    role
  };

  const res = await fetch(`${API_BASE}/generate_interview_questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to generate questions" }));
    throw new Error(err.detail || "Failed to generate questions");
  }

  return res.json();
}

export async function generateMockInterviewSession(skills, role = "Software Engineer") {
  const payload = {
    skills,
    role,
    experience_level: "mid",
    question_count: 6
  };

  const res = await fetch(`${API_BASE}/mock_interview_session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to generate session" }));
    throw new Error(err.detail || "Failed to generate session");
  }

  return res.json();
}

// Portfolio Analysis
export async function analyzePortfolio(githubUrl, portfolioUrl, skills = []) {
  const payload = {
    github_url: githubUrl,
    portfolio_url: portfolioUrl,
    skills
  };

  const res = await fetch(`${API_BASE}/analyze_portfolio`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Portfolio analysis failed" }));
    throw new Error(err.detail || "Portfolio analysis failed");
  }

  return res.json();
}

// Cover Letter Generation
export async function generateCoverLetter({
  companyName,
  jobTitle,
  jobDescription = "",
  applicantName = "[Your Name]",
  skills = [],
  experienceYears = 0,
  numVersions = 1
}) {
  const payload = {
    company_name: companyName,
    job_title: jobTitle,
    job_description: jobDescription,
    applicant_name: applicantName,
    skills,
    experience_years: experienceYears,
    num_versions: numVersions
  };

  const res = await fetch(`${API_BASE}/generate_cover_letter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Cover letter generation failed" }));
    throw new Error(err.detail || "Cover letter generation failed");
  }

  return res.json();
}

// Job Compatibility Analysis
export async function analyzeJobCompatibility(resumeText, jobDescription) {
  const payload = {
    resume_text: resumeText,
    job_description: jobDescription
  };

  const res = await fetch(`${API_BASE}/job_compatibility`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Compatibility analysis failed" }));
    throw new Error(err.detail || "Compatibility analysis failed");
  }

  return res.json();
}

// Career Insights
export async function getCareerInsights() {
  const res = await fetch(`${API_BASE}/career_insights`);
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to load insights" }));
    throw new Error(err.detail || "Failed to load insights");
  }

  return res.json();
}

export async function getWeeklyFocus(skills) {
  const res = await fetch(`${API_BASE}/weekly_focus`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(skills),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to generate weekly focus" }));
    throw new Error(err.detail || "Failed to generate weekly focus");
  }

  return res.json();
}

// Health Check
export async function healthCheck() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Service unavailable");
  return res.json();
}
