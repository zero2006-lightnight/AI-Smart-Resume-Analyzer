import { useState } from "react";
import { motion } from "framer-motion";
import { analyzePortfolio } from "../api.js";

export default function PortfolioAnalyzer({ skills = [] }) {
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async (e) => {
    e.preventDefault();
    
    if (!githubUrl.trim() && !portfolioUrl.trim()) {
      setError("Please provide at least a GitHub URL or portfolio URL");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await analyzePortfolio(githubUrl, portfolioUrl, skills);
      setAnalysis(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return "bg-green-500/20 border-green-500/30";
    if (score >= 60) return "bg-yellow-500/20 border-yellow-500/30";
    return "bg-red-500/20 border-red-500/30";
  };

  return (
    <section className="glass rounded-2xl border border-white/10 p-6 md:p-8 shadow-glow card-hover">
      <div className="mb-6">
        <p className="text-sm text-cyan-400 font-semibold">🔍 Portfolio Analyzer</p>
        <h2 className="text-2xl font-semibold text-white">GitHub & Portfolio Analysis</h2>
        <p className="text-slate-400 text-sm mt-1">
          Analyze your GitHub repositories and portfolio website for improvement opportunities
        </p>
      </div>

      <form onSubmit={handleAnalyze} className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              GitHub Profile URL
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username"
              className="w-full rounded-xl bg-slate-900/60 border border-slate-800 p-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Portfolio Website URL
            </label>
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://yourportfolio.com"
              className="w-full rounded-xl bg-slate-900/60 border border-slate-800 p-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto px-6 py-3 rounded-lg bg-cyan-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-600"
        >
          {loading ? "Analyzing..." : "🔍 Analyze Portfolio"}
        </button>
      </form>

      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Overall Score */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Portfolio Score</h3>
                <p className="text-slate-400 text-sm">Overall portfolio strength</p>
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(analysis.analysis?.overall_score || 0)}`}>
                {analysis.analysis?.overall_score || 0}/100
              </div>
            </div>
          </div>

          {/* GitHub Analysis */}
          {analysis.analysis?.github_analysis && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📊 GitHub Analysis</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">
                    {analysis.analysis.github_analysis.repository_count}
                  </div>
                  <div className="text-xs text-slate-400">Repositories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {analysis.analysis.github_analysis.total_stars}
                  </div>
                  <div className="text-xs text-slate-400">Total Stars</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {analysis.analysis.github_analysis.total_forks}
                  </div>
                  <div className="text-xs text-slate-400">Total Forks</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(analysis.analysis.github_analysis.scores?.overall || 0)}`}>
                    {analysis.analysis.github_analysis.scores?.overall || 0}
                  </div>
                  <div className="text-xs text-slate-400">GitHub Score</div>
                </div>
              </div>

              {/* Technologies */}
              {analysis.analysis.github_analysis.technologies && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-200">Technologies Found</h4>
                  <div className="space-y-2">
                    {Object.entries(analysis.analysis.github_analysis.technologies).map(([category, techs]) => (
                      <div key={category}>
                        <div className="text-xs text-slate-400 mb-1">{category}</div>
                        <div className="flex flex-wrap gap-1">
                          {techs.map((tech) => (
                            <span key={tech} className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-200 rounded">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Portfolio Website Analysis */}
          {analysis.analysis?.portfolio_analysis && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">🌐 Portfolio Website Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <span className="text-xs text-slate-400">Hosting Platform</span>
                  <p className="text-white font-medium">{analysis.analysis.portfolio_analysis.hosting_platform}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">HTTPS</span>
                  <p className={`font-medium ${
                    analysis.analysis.portfolio_analysis.has_https ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {analysis.analysis.portfolio_analysis.has_https ? '✓ Enabled' : '✗ Not Enabled'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Domain Score</span>
                  <p className={`font-medium ${getScoreColor(analysis.analysis.portfolio_analysis.domain_score)}`}>
                    {analysis.analysis.portfolio_analysis.domain_score}/100
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Improvement Roadmap */}
          {analysis.improvement_roadmap && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">🚀 Improvement Roadmap</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(analysis.improvement_roadmap).map(([timeframe, tasks]) => (
                  <div key={timeframe}>
                    <h4 className="text-sm font-semibold text-slate-200 mb-2 capitalize">
                      {timeframe.replace('_', ' ')}
                      <span className="text-xs text-slate-400 ml-2">
                        {timeframe === 'immediate' && '(1-2 weeks)'}
                        {timeframe === 'short_term' && '(1-3 months)'}
                        {timeframe === 'long_term' && '(3-12 months)'}
                      </span>
                    </h4>
                    <ul className="space-y-1">
                      {tasks.slice(0, 4).map((task, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex gap-2">
                          <span className="text-cyan-400 text-xs">•</span>
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Wins */}
          {analysis.quick_wins && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-green-400 mb-2">⚡ Quick Wins</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {analysis.quick_wins.map((win, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="text-green-400">✓</span>
                    <span>{win}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysis.analysis?.recommendations && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-blue-400 mb-2">💡 Recommendations</h3>
              <ul className="space-y-1">
                {analysis.analysis.recommendations.slice(0, 5).map((rec, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex gap-2">
                    <span className="text-blue-400">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </section>
  );
}
