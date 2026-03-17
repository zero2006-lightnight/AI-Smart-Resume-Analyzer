import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateInterviewQuestions, generateMockInterviewSession } from "../api.js";

export default function InterviewSimulator({ skills = [] }) {
  const [currentView, setCurrentView] = useState("setup"); // "setup", "practice", "session"
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionData, setSessionData] = useState(null);
  const [settings, setSettings] = useState({
    role: "Software Engineer",
    experienceLevel: "mid",
    questionCount: 5,
    focusArea: "technical"
  });

  const handleGenerateQuestions = async () => {
    if (skills.length === 0) {
      setError("Please analyze a resume first to get personalized questions");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await generateInterviewQuestions(
        skills,
        settings.experienceLevel,
        settings.questionCount,
        settings.role
      );
      setQuestions(result.questions || []);
      setCurrentView("practice");
      setCurrentQuestionIndex(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSession = async () => {
    if (skills.length === 0) {
      setError("Please analyze a resume first to get a personalized session");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await generateMockInterviewSession(skills, settings.role);
      setSessionData(result.session);
      setCurrentView("session");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <section className="glass rounded-2xl border border-white/10 p-6 md:p-8 shadow-glow card-hover">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-purple-400 font-semibold">🎯 Interview Simulator</p>
          <h2 className="text-2xl font-semibold text-white">AI-Powered Interview Practice</h2>
          <p className="text-slate-400 text-sm mt-1">
            Practice technical and behavioral questions tailored to your skills and experience
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentView("setup")}
            className={`px-3 py-1 rounded-lg text-sm ${
              currentView === "setup"
                ? "bg-purple-500 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Setup
          </button>
          <button
            onClick={() => currentView !== "setup" && setCurrentView("practice")}
            className={`px-3 py-1 rounded-lg text-sm ${
              currentView === "practice"
                ? "bg-purple-500 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
            disabled={questions.length === 0}
          >
            Practice
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {currentView === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Target Role
                </label>
                <select
                  value={settings.role}
                  onChange={(e) => setSettings({ ...settings, role: e.target.value })}
                  className="w-full rounded-xl bg-slate-900/60 border border-slate-800 p-3 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Product Manager">Product Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Experience Level
                </label>
                <select
                  value={settings.experienceLevel}
                  onChange={(e) => setSettings({ ...settings, experienceLevel: e.target.value })}
                  className="w-full rounded-xl bg-slate-900/60 border border-slate-800 p-3 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  <option value="junior">Junior (0-2 years)</option>
                  <option value="mid">Mid-Level (3-6 years)</option>
                  <option value="senior">Senior (7+ years)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Number of Questions
                </label>
                <select
                  value={settings.questionCount}
                  onChange={(e) => setSettings({ ...settings, questionCount: parseInt(e.target.value) })}
                  className="w-full rounded-xl bg-slate-900/60 border border-slate-800 p-3 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={8}>8 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>
            </div>

            {skills.length > 0 && (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                <h3 className="text-sm font-medium text-slate-200 mb-2">Your Skills (will be used for question generation)</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.slice(0, 10).map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full text-xs bg-purple-500/20 text-purple-200 border border-purple-500/30"
                    >
                      {skill}
                    </span>
                  ))}
                  {skills.length > 10 && (
                    <span className="px-3 py-1 rounded-full text-xs bg-slate-700 text-slate-300">
                      +{skills.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleGenerateQuestions}
                disabled={loading || skills.length === 0}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-lg bg-purple-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600"
              >
                {loading ? "Generating..." : "🎯 Generate Questions"}
              </button>
              <button
                onClick={handleGenerateSession}
                disabled={loading || skills.length === 0}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-lg bg-indigo-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-600"
              >
                {loading ? "Generating..." : "🚀 Full Interview Session"}
              </button>
            </div>
          </motion.div>
        )}

        {currentView === "practice" && questions.length > 0 && (
          <motion.div
            key="practice"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <div className="w-32 bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {questions[currentQuestionIndex]?.question}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-green-400 mb-2">💡 Example Answer:</h4>
                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/50 p-3 rounded-lg">
                      {questions[currentQuestionIndex]?.example_answer}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-blue-400 mb-2">🎯 Interview Tips:</h4>
                    <ul className="space-y-1">
                      {questions[currentQuestionIndex]?.tips?.map((tip, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex gap-2">
                          <span className="text-blue-400">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-purple-500"
              >
                ← Previous
              </button>
              <button
                onClick={nextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-purple-500"
              >
                Next →
              </button>
            </div>
          </motion.div>
        )}

        {currentView === "session" && sessionData && (
          <motion.div
            key="session"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📋 Complete Interview Session</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Role:</span>
                  <p className="text-white font-medium">{sessionData.role}</p>
                </div>
                <div>
                  <span className="text-slate-400">Duration:</span>
                  <p className="text-white font-medium">{sessionData.duration_minutes} minutes</p>
                </div>
                <div>
                  <span className="text-slate-400">Questions:</span>
                  <p className="text-white font-medium">{sessionData.question_count} questions</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-white">🎯 Interview Questions</h4>
                {sessionData.questions?.map((q, idx) => (
                  <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-white mb-2">
                      {idx + 1}. {q.question}
                    </h5>
                    <p className="text-xs text-slate-400 mb-2">{q.example_answer}</p>
                    <div className="flex flex-wrap gap-1">
                      {q.tips?.slice(0, 2).map((tip, tipIdx) => (
                        <span key={tipIdx} className="px-2 py-1 text-xs bg-blue-500/20 text-blue-200 rounded">
                          {tip}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="text-md font-semibold text-white">📚 Preparation Tips</h4>
                <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
                  <ul className="space-y-2">
                    {sessionData.preparation_tips?.slice(0, 6).map((tip, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex gap-2">
                        <span className="text-green-400">✓</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <h4 className="text-md font-semibold text-white">⏱️ Interview Structure</h4>
                <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
                  {sessionData.interview_structure && Object.entries(sessionData.interview_structure).map(([phase, duration]) => (
                    <div key={phase} className="flex justify-between items-center py-1 text-sm">
                      <span className="text-slate-300 capitalize">{phase.replace('_', ' ')}:</span>
                      <span className="text-white font-medium">{duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
