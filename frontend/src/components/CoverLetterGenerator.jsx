import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateCoverLetter } from "../api.js";

export default function CoverLetterGenerator({ skills = [], experienceYears = 0 }) {
  const [formData, setFormData] = useState({
    companyName: "",
    jobTitle: "",
    jobDescription: "",
    applicantName: "[Your Name]",
    numVersions: 1
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedVersion, setSelectedVersion] = useState(0);
  const textareaRef = useRef(null);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (!formData.companyName.trim() || !formData.jobTitle.trim()) {
      setError("Please provide company name and job title");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await generateCoverLetter({
        companyName: formData.companyName,
        jobTitle: formData.jobTitle,
        jobDescription: formData.jobDescription,
        applicantName: formData.applicantName,
        skills,
        experienceYears,
        numVersions: formData.numVersions
      });
      
      setResult(response);
      setSelectedVersion(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could show a toast notification here
      console.log('Copied to clipboard');
    });
  };

  const downloadAsPDF = () => {
    // This would require a PDF generation library like jsPDF
    console.log('PDF download functionality would be implemented here');
  };

  const getCurrentLetter = () => {
    if (result?.versions) {
      return result.versions[selectedVersion];
    }
    return result?.letter;
  };

  const getValidationColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <section className="glass rounded-2xl border border-white/10 p-6 md:p-8 shadow-glow card-hover">
      <div className="mb-6">
        <p className="text-sm text-emerald-400 font-semibold">✍️ Cover Letter Generator</p>
        <h2 className="text-2xl font-semibold text-white">AI-Powered Cover Letters</h2>
        <p className="text-slate-400 text-sm mt-1">
          Generate professional cover letters tailored to specific job applications
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={handleChange('companyName')}
                  placeholder="e.g., Google, Microsoft"
                  className="w-full rounded-xl bg-slate-900/60 border border-slate-800 p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={handleChange('jobTitle')}
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full rounded-xl bg-slate-900/60 border border-slate-800 p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={formData.applicantName}
                  onChange={handleChange('applicantName')}
                  placeholder="Your full name"
                  className="w-full rounded-xl bg-slate-900/60 border border-slate-800 p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Number of Versions
                </label>
                <select
                  value={formData.numVersions}
                  onChange={handleChange('numVersions')}
                  className="w-full rounded-xl bg-slate-900/60 border border-slate-800 p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value={1}>1 Version</option>
                  <option value={2}>2 Versions</option>
                  <option value={3}>3 Versions</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Job Description (Optional)
              </label>
              <textarea
                value={formData.jobDescription}
                onChange={handleChange('jobDescription')}
                placeholder="Paste the job description here for better customization..."
                rows={4}
                className="w-full rounded-xl bg-slate-900/60 border border-slate-800 p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {skills.length > 0 && (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                <h3 className="text-sm font-medium text-slate-200 mb-2">Skills from Resume (will be highlighted)</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.slice(0, 8).map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
                    >
                      {skill}
                    </span>
                  ))}
                  {skills.length > 8 && (
                    <span className="px-3 py-1 rounded-full text-xs bg-slate-700 text-slate-300">
                      +{skills.length - 8} more
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
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg bg-emerald-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-600"
            >
              {loading ? "Generating..." : "✍️ Generate Cover Letter"}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {result && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Version Selector */}
              {result.versions && result.versions.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">Version:</span>
                  {result.versions.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedVersion(idx)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        selectedVersion === idx
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              )}

              {/* Validation Score */}
              {result.validation && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-slate-200">Content Analysis</h3>
                    <div className={`text-lg font-bold ${getValidationColor(result.validation.score)}`}>
                      {result.validation.score}/100
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400">Word Count:</span>
                      <span className="text-white ml-2">{result.validation.word_count}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Characters:</span>
                      <span className="text-white ml-2">{result.validation.character_count}</span>
                    </div>
                  </div>
                  {result.validation.suggestions && result.validation.suggestions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-slate-400 mb-1">Suggestions:</p>
                      <ul className="space-y-1">
                        {result.validation.suggestions.slice(0, 3).map((suggestion, idx) => (
                          <li key={idx} className="text-xs text-yellow-300 flex gap-1">
                            <span>•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Cover Letter Display */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Generated Cover Letter</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(getCurrentLetter()?.cover_letter || '')}
                      className="px-3 py-1 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600"
                    >
                      📋 Copy
                    </button>
                    <button
                      onClick={downloadAsPDF}
                      className="px-3 py-1 rounded-lg bg-purple-500 text-white text-sm hover:bg-purple-600"
                    >
                      📄 PDF
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 text-gray-800 text-sm leading-relaxed font-serif max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">
                    {getCurrentLetter()?.cover_letter || ''}
                  </pre>
                </div>
              </div>

              {/* Tips */}
              {(result.tips || getCurrentLetter()?.tips) && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-blue-400 mb-2">💡 Cover Letter Tips</h3>
                  <ul className="space-y-1">
                    {(result.tips || getCurrentLetter()?.tips || []).slice(0, 4).map((tip, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex gap-2">
                        <span className="text-blue-400">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          {!result && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center">
              <div className="text-slate-400 text-sm">
                <div className="text-4xl mb-4">✍️</div>
                <p>Fill out the form to generate your personalized cover letter</p>
                <p className="text-xs mt-2">Professional templates tailored to your experience and skills</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
