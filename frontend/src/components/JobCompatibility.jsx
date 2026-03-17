import { useState } from "react";
import { motion } from "framer-motion";
import { analyzeJobCompatibility } from "../api.js";
import { Doughnut } from "react-chartjs-2";

export default function JobCompatibility({ resumeText = "", detectedSkills = [] }) {
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async (e) => {
    e.preventDefault();
    
    if (!jobDescription.trim()) {
      setError("Please provide a job description");
      return;
    }

    if (!resumeText.trim()) {
      setError("Please upload and analyze a resume first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await analyzeJobCompatibility(resumeText, jobDescription);
      setAnalysis(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return { text: "text-green-400", bg: "bg-green-500/20 border-green-500/30" };
    if (score >= 60) return { text: "text-yellow-400", bg: "bg-yellow-500/20 border-yellow-500/30" };
    if (score >= 40) return { text: "text-orange-400", bg: "bg-orange-500/20 border-orange-500/30" };
    return { text: "text-red-400", bg: "bg-red-500/20 border-red-500/30" };
  };

  const compatibilityChart = analysis ? {
    labels: ['Compatible', 'Gap'],
    datasets: [{
      data: [analysis.compatibility_score, 100 - analysis.compatibility_score],
      backgroundColor: [
        analysis.compatibility_score >= 70 ? '#10B981' : 
        analysis.compatibility_score >= 50 ? '#F59E0B' : '#EF4444',
        '#374151'
      ],
      borderWidth: 0
    }]
  } : null;

  const chartOptions = {
    plugins: {
      legend: { display: false }
    },
    cutout: '70%',
    maintainAspectRatio: false
  };

  return (
    <section className="glass rounded-2xl border border-white/10 p-6 md:p-8 shadow-glow card-hover">
      <div className="mb-6">
        <p className="text-sm text-blue-400 font-semibold">🎯 Job Compatibility</p>
        <h2 className="text-2xl font-semibold text-white">Resume vs Job Description Analysis</h2>
        <p className="text-slate-400 text-sm mt-1">
          Analyze how well your resume matches specific job requirements
        </p>
      </div>

      <form onSubmit={handleAnalyze} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Job Description *
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the complete job description here..."
            rows={8}
            className="w-full rounded-xl bg-slate-900/60 border border-slate-800 p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        {detectedSkills.length > 0 && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-medium text-slate-200 mb-2">Your Resume Skills</h3>
            <div className="flex flex-wrap gap-2">
              {detectedSkills.slice(0, 10).map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-200 border border-blue-500/30"
                >
                  {skill}
                </span>
              ))}
              {detectedSkills.length > 10 && (
                <span className="px-3 py-1 rounded-full text-xs bg-slate-700 text-slate-300">
                  +{detectedSkills.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !resumeText}
          className="w-full md:w-auto px-6 py-3 rounded-lg bg-blue-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
        >
          {loading ? "Analyzing..." : "🎯 Analyze Compatibility"}
        </button>
      </form>

      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Compatibility Score */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`rounded-xl p-6 border ${getScoreColor(analysis.compatibility_score).bg}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Overall Compatibility</h3>
                  <p className="text-slate-400 text-sm">Resume vs Job Match</p>
                </div>
                <div className="w-16 h-16 relative">
                  {compatibilityChart && (
                    <Doughnut data={compatibilityChart} options={chartOptions} />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-lg font-bold ${getScoreColor(analysis.compatibility_score).text}`}>
                      {analysis.compatibility_score}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl p-6 border bg-slate-900/60 border-slate-800">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(analysis.skill_match_ratio || 0).text}`}>
                  {analysis.skill_match_ratio}%
                </div>
                <div className="text-sm text-slate-400 mt-1">Skill Match Ratio</div>
                <div className="text-xs text-slate-500 mt-1">
                  {analysis.matching_skills?.length || 0} of {(analysis.matching_skills?.length || 0) + (analysis.missing_skills?.length || 0)} required skills
                </div>
              </div>
            </div>

            <div className="rounded-xl p-6 border bg-slate-900/60 border-slate-800">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(analysis.ats_analysis?.score || 0).text}`}>
                  {analysis.ats_analysis?.score || 0}
                </div>
                <div className="text-sm text-slate-400 mt-1">ATS Score</div>
                <div className="text-xs text-slate-500 mt-1">
                  Applicant Tracking System compatibility
                </div>
              </div>
            </div>
          </div>

          {/* Skills Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Matching Skills */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-green-400 mb-3">✅ Matching Skills</h3>
              {analysis.matching_skills && analysis.matching_skills.length > 0 ? (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {analysis.matching_skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-block px-2 py-1 text-xs bg-green-500/20 text-green-200 rounded mr-1 mb-1"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No direct skill matches found</p>
              )}
            </div>

            {/* Missing Skills */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-red-400 mb-3">❌ Missing Skills</h3>
              {analysis.missing_skills && analysis.missing_skills.length > 0 ? (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {analysis.missing_skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-block px-2 py-1 text-xs bg-red-500/20 text-red-200 rounded mr-1 mb-1"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No missing skills identified</p>
              )}
            </div>

            {/* Extra Skills */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-blue-400 mb-3">➕ Extra Skills</h3>
              {analysis.extra_skills && analysis.extra_skills.length > 0 ? (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {analysis.extra_skills.slice(0, 8).map((skill) => (
                    <span
                      key={skill}
                      className="inline-block px-2 py-1 text-xs bg-blue-500/20 text-blue-200 rounded mr-1 mb-1"
                    >
                      {skill}
                    </span>
                  ))}
                  {analysis.extra_skills.length > 8 && (
                    <span className="inline-block px-2 py-1 text-xs bg-slate-600 text-slate-300 rounded">
                      +{analysis.extra_skills.length - 8} more
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No additional skills found</p>
              )}
            </div>
          </div>

          {/* Detailed ATS Analysis */}
          {analysis.ats_analysis && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📊 Detailed ATS Analysis</h3>
              
              {analysis.ats_analysis.breakdown && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  {Object.entries(analysis.ats_analysis.breakdown).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className={`text-lg font-bold ${getScoreColor(value).text}`}>
                        {value}%
                      </div>
                      <div className="text-xs text-slate-400 capitalize">
                        {key.replace('_', ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {analysis.ats_analysis.experience_years && (
                <div className="text-sm text-slate-300 mb-2">
                  <span className="text-slate-400">Detected Experience:</span> {analysis.ats_analysis.experience_years} years
                </div>
              )}

              {analysis.ats_analysis.education_level && (
                <div className="text-sm text-slate-300 mb-4">
                  <span className="text-slate-400">Education Level:</span> {analysis.ats_analysis.education_level}
                </div>
              )}
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-purple-400 mb-3">💡 Improvement Recommendations</h3>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex gap-2">
                    <span className="text-purple-400">•</span>
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
