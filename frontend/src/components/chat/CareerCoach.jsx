import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import ChatMessage from "./ChatMessage.jsx";
import ChatInput from "./ChatInput.jsx";
import { careerCoachChat } from "../../api.js";

const ENHANCED_SUGGESTIONS = [
  "How can I improve my ATS score?",
  "What skills should I learn next?",
  "Generate interview questions for my skills",
  "How do I negotiate salary?",
  "What's my career advancement path?",
  "Help me optimize my LinkedIn profile",
  "How do I transition to a senior role?",
  "What certifications should I pursue?",
];

export default function CareerCoach({ analysis }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `🚀 Welcome to your AI Career Coach! I'm here to provide personalized career guidance based on your resume analysis.

${analysis ? `I can see you have ${analysis.detected_skills?.length || 0} skills detected with an ATS score of ${Math.round(analysis.ats_score || 0)}%. Let's work together to advance your career!` : 'Upload your resume first to get personalized advice.'}

What would you like help with today?`,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [dailyTip, setDailyTip] = useState(null);
  const containerRef = useRef(null);

  const context = useMemo(() => {
    if (!analysis) return null;
    const recRoles = (analysis.job_recommendations || []).map(([role]) => role);
    const adv = analysis.advanced_ats || {};
    return {
      skills: analysis.detected_skills || [],
      missing_skills: analysis.missing_skills || [],
      ats_score: analysis.ats_score || 0,
      recommended_roles: recRoles,
      experience_years: adv.experience_years || null,
    };
  }, [analysis]);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);

    setLoading(true);
    try {
      const res = await careerCoachChat(trimmed, context);
      
      // Handle enhanced response format
      const assistantMessage = {
        role: "assistant",
        content: res.reply || res.ai_reply || "I'm here to help with your career!",
        dailyTip: res.daily_tip,
        source: res.source,
        suggestions: res.suggestions
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Update daily tip if provided
      if (res.daily_tip) {
        setDailyTip(res.daily_tip);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: `❌ ${err.message || "Sorry, I couldn't process that request. Please try again or ask a different question."}`
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  return (
    <section className="glass rounded-2xl border border-white/10 p-6 md:p-8 shadow-glow card-hover space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm text-cyan-400 font-semibold">🤖 AI Career Coach</p>
          <h2 className="text-2xl font-semibold text-white">Personalized Career Guidance</h2>
          <p className="text-slate-400 text-sm mt-1">
            Get expert advice on resume improvement, skill development, interview prep, and career planning
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-400">AI Coach Active</span>
          </div>
          {analysis && (
            <div className="ml-4 px-2 py-1 bg-slate-800 rounded text-slate-300">
              ATS: {Math.round(analysis.ats_score)}% • Skills: {analysis.detected_skills?.length || 0}
            </div>
          )}
        </div>
      </div>

      {/* Daily Tip */}
      {dailyTip && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <span className="text-lg">💡</span>
            <div>
              <h3 className="text-sm font-semibold text-cyan-400 mb-1">Daily Career Tip</h3>
              <p className="text-sm text-slate-300">{dailyTip}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Chat Container */}
      <div className="bg-slate-950/60 border border-slate-900 rounded-2xl overflow-hidden flex flex-col" style={{ height: '500px' }}>
        {/* Messages */}
        <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx}>
              <ChatMessage role={msg.role} content={msg.content} />
              {msg.suggestions && msg.role === "assistant" && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {msg.suggestions.slice(0, 3).map((suggestion, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1 text-xs bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && <TypingBubble />}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/80">
          <ChatInput 
            onSend={handleSend} 
            loading={loading} 
            suggestions={ENHANCED_SUGGESTIONS}
            placeholder={analysis ? "Ask about your career development..." : "Upload your resume first for personalized advice..."}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickActionCard
          icon="📈"
          title="ATS Optimization"
          description="Improve resume scoring"
          onClick={() => handleSend("How can I improve my ATS score?")}
          disabled={loading}
        />
        <QuickActionCard
          icon="🎯"
          title="Skill Development"
          description="Learn in-demand skills"
          onClick={() => handleSend("What skills should I learn next?")}
          disabled={loading}
        />
        <QuickActionCard
          icon="💼"
          title="Interview Prep"
          description="Practice questions"
          onClick={() => handleSend("Help me prepare for interviews")}
          disabled={loading}
        />
        <QuickActionCard
          icon="🚀"
          title="Career Planning"
          description="Map your growth"
          onClick={() => handleSend("What's my career advancement path?")}
          disabled={loading}
        />
      </div>

      {/* Context Display */}
      {analysis && (
        <details className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
          <summary className="text-sm font-medium text-slate-200 cursor-pointer hover:text-white">
            📊 Your Profile Context (Click to expand)
          </summary>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Top Skills:</span>
              <p className="text-slate-200">{context?.skills?.slice(0, 5).join(", ") || "None detected"}</p>
            </div>
            <div>
              <span className="text-slate-400">ATS Score:</span>
              <p className="text-slate-200">{Math.round(context?.ats_score || 0)}/100</p>
            </div>
            <div>
              <span className="text-slate-400">Experience:</span>
              <p className="text-slate-200">{context?.experience_years || "Not detected"} years</p>
            </div>
            <div>
              <span className="text-slate-400">Recommended Roles:</span>
              <p className="text-slate-200">{context?.recommended_roles?.slice(0, 2).join(", ") || "None yet"}</p>
            </div>
          </div>
        </details>
      )}
    </section>
  );
}

function TypingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2 text-xs text-slate-400"
    >
      <span className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" />
      <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "80ms" }} />
      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "140ms" }} />
      <span>AI is thinking...</span>
    </motion.div>
  );
}

function QuickActionCard({ icon, title, description, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-cyan-500/50 hover:bg-slate-900/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
    >
      <div className="text-lg mb-1">{icon}</div>
      <div className="text-sm font-medium text-white">{title}</div>
      <div className="text-xs text-slate-400">{description}</div>
    </button>
  );
}
