import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UploadResume from "./components/UploadResume.jsx";
import Dashboard from "./Dashboard.jsx";
import ResumeBuilder from "./ResumeBuilder.jsx";
import CareerCoach from "./components/chat/CareerCoach.jsx";
import InterviewSimulator from "./components/InterviewSimulator.jsx";
import PortfolioAnalyzer from "./components/PortfolioAnalyzer.jsx";
import CoverLetterGenerator from "./components/CoverLetterGenerator.jsx";
import JobCompatibility from "./components/JobCompatibility.jsx";
import { healthCheck } from "./api.js";

const TABS = [
  { id: "upload", label: "Resume Upload", icon: "📄", description: "Upload & analyze your resume" },
  { id: "dashboard", label: "Dashboard", icon: "📊", description: "View analysis results" },
  { id: "job-match", label: "Job Matching", icon: "🎯", description: "Compare with job descriptions" },
  { id: "interview", label: "Interview Prep", icon: "💼", description: "Practice with AI questions" },
  { id: "portfolio", label: "Portfolio", icon: "🔍", description: "Analyze GitHub & projects" },
  { id: "cover-letter", label: "Cover Letters", icon: "✍️", description: "Generate personalized letters" },
  { id: "resume-builder", label: "Resume Builder", icon: "🛠️", description: "Build & export resumes" },
  { id: "career-coach", label: "AI Coach", icon: "🤖", description: "Get personalized advice" },
];

export default function App() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  const [systemStatus, setSystemStatus] = useState("checking");
  const [resumeText, setResumeText] = useState("");

  // Check system health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await healthCheck();
        setSystemStatus("online");
      } catch {
        setSystemStatus("offline");
      }
    };
    checkHealth();
  }, []);

  // Auto-switch to dashboard when analysis completes
  useEffect(() => {
    if (analysis && activeTab === "upload") {
      setActiveTab("dashboard");
    }
  }, [analysis, activeTab]);

  const handleAnalysisResult = (result, text = "") => {
    setAnalysis(result);
    setResumeText(text);
  };

  const getTabsToShow = () => {
    if (!analysis) {
      return TABS.filter(tab => ["upload", "resume-builder"].includes(tab.id));
    }
    return TABS;
  };

  const renderTabContent = () => {
    const commonProps = {
      analysis,
      skills: analysis?.detected_skills || [],
      experienceYears: analysis?.advanced_ats?.experience_years || 0,
      resumeText
    };

    switch (activeTab) {
      case "upload":
        return (
          <UploadResume
            onResult={handleAnalysisResult}
            onReset={() => {
              setAnalysis(null);
              setResumeText("");
            }}
          />
        );
      case "dashboard":
        return analysis ? <Dashboard data={analysis} /> : <Placeholder tab="Dashboard" />;
      case "job-match":
        return (
          <JobCompatibility
            resumeText={resumeText}
            detectedSkills={analysis?.detected_skills || []}
          />
        );
      case "interview":
        return <InterviewSimulator skills={analysis?.detected_skills || []} />;
      case "portfolio":
        return <PortfolioAnalyzer skills={analysis?.detected_skills || []} />;
      case "cover-letter":
        return (
          <CoverLetterGenerator
            skills={analysis?.detected_skills || []}
            experienceYears={analysis?.advanced_ats?.experience_years || 0}
          />
        );
      case "resume-builder":
        return <ResumeBuilder />;
      case "career-coach":
        return analysis ? <CareerCoach analysis={analysis} /> : <Placeholder tab="AI Coach" />;
      default:
        return <Placeholder tab={activeTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="bg-slate-950/80 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                🚀 AI Career Platform
              </div>
              <div className="hidden md:block">
                <p className="text-sm text-slate-400">
                  Complete AI-powered career assistant • Resume analysis • Interview prep • Portfolio review
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* System Status */}
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`w-2 h-2 rounded-full ${
                    systemStatus === "online" ? "bg-green-400 animate-pulse" :
                    systemStatus === "offline" ? "bg-red-400" : "bg-yellow-400"
                  }`}
                />
                <span className="text-slate-400">
                  {systemStatus === "online" ? "AI Online" :
                   systemStatus === "offline" ? "AI Offline" : "Checking..."}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-200 border border-purple-500/30">
                v2.0 Beta
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <nav className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {getTabsToShow().map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-white border border-purple-500/30 shadow-glow"
                    : "bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-slate-800"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-lg">{tab.icon}</span>
                <div className="text-left">
                  <div>{tab.label}</div>
                  <div className="text-xs opacity-70">{tab.description}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </nav>

        {/* Progress Indicator */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-green-400 text-lg">✅</span>
                <div>
                  <p className="text-sm font-semibold text-green-400">Resume Analysis Complete</p>
                  <p className="text-xs text-slate-400">
                    ATS Score: {Math.round(analysis.ats_score)}% • 
                    Skills: {analysis.detected_skills?.length || 0} • 
                    Recommendations: {analysis.job_recommendations?.length || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getTabsToShow().slice(1).map((tab, idx) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-cyan-500 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                    title={tab.label}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-800">
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center gap-6 text-sm text-slate-400">
              <span>🎯 ATS Optimization</span>
              <span>💼 Interview Preparation</span>
              <span>🔍 Portfolio Analysis</span>
              <span>✍️ Cover Letter Generation</span>
              <span>🤖 AI Career Coaching</span>
            </div>
            <p className="text-xs text-slate-500">
              Powered by Advanced AI • FastAPI • React • TailwindCSS • Chart.js
            </p>
            <p className="text-xs text-slate-600">
              Your data is processed locally and securely. We don't store personal information.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Placeholder component for tabs that require data
function Placeholder({ tab }) {
  return (
    <div className="glass rounded-2xl border border-white/10 p-8 shadow-glow text-center">
      <div className="max-w-md mx-auto space-y-4">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-white">{tab} Ready to Use</h3>
        <p className="text-slate-400 text-sm">
          Please upload and analyze your resume first to access this feature.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm hover:bg-purple-600"
        >
          Start with Resume Upload
        </button>
      </div>
    </div>
  );
}
