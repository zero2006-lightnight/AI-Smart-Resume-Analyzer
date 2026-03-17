import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ResumeDropzone from "./ResumeDropzone.jsx";
import FilePreviewCard from "./FilePreviewCard.jsx";
import SkillTagList from "./SkillTagList.jsx";
import AnalysisLoader from "./AnalysisLoader.jsx";
import { analyzeResume } from "../api.js";

const UPLOAD_STATES = {
  IDLE: 'idle',
  UPLOADING: 'uploading', 
  ANALYZING: 'analyzing',
  COMPLETED: 'completed',
  ERROR: 'error'
};

export default function UploadResume({ onResult, onReset }) {
  const [uploadState, setUploadState] = useState(UPLOAD_STATES.IDLE);
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [detectedSkills, setDetectedSkills] = useState([]);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef(null);

  const resetAnalysis = useCallback(() => {
    setAnalysisResult(null);
    setDetectedSkills([]);
    setUploadState(UPLOAD_STATES.IDLE);
    setError("");
    setProgress(0);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    onReset?.();
  }, [onReset]);

  const handleFileSelect = useCallback((file) => {
    // Validate file
    if (!file) return;
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'application/octet-stream'
    ];

    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx?|txt)$/i)) {
      setError('Please upload a PDF, DOCX, or TXT file');
      return;
    }

    // Reset previous analysis if exists
    if (analysisResult) {
      resetAnalysis();
    }

    setError("");
    setSelectedFile(file);
    setUploadState(UPLOAD_STATES.UPLOADING);

    // Simulate upload progress
    let currentProgress = 0;
    progressInterval.current = setInterval(() => {
      currentProgress += Math.random() * 30;
      if (currentProgress >= 100) {
        setProgress(100);
        setUploadState(UPLOAD_STATES.IDLE);
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      } else {
        setProgress(currentProgress);
      }
    }, 200);
  }, [analysisResult, resetAnalysis]);

  const handleReplaceResume = useCallback(() => {
    resetAnalysis();
    setSelectedFile(null);
  }, [resetAnalysis]);

  const handleRemoveResume = useCallback(() => {
    resetAnalysis();
    setSelectedFile(null);
  }, [resetAnalysis]);

  const handleAnalyzeResume = async () => {
    if (!selectedFile) {
      setError('Please select a resume file first');
      return;
    }

    setError("");
    setUploadState(UPLOAD_STATES.ANALYZING);
    setProgress(0);

    // Simulate analysis progress
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 300);

    try {
      const result = await analyzeResume(selectedFile, jobDescription);
      
      // Clear progress interval
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      
      setProgress(100);
      setAnalysisResult(result);
      setDetectedSkills(result.detected_skills || []);
      setUploadState(UPLOAD_STATES.COMPLETED);
      
      // Pass result to parent with resume text for other components
      const resumeText = selectedFile ? await selectedFile.text().catch(() => '') : '';
      onResult?.(result, resumeText);
      
    } catch (err) {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      setError(err.message || 'Failed to analyze resume');
      setUploadState(UPLOAD_STATES.ERROR);
      setProgress(0);
    }
  };

  return (
    <section className="glass rounded-2xl border border-white/10 p-6 md:p-8 shadow-glow card-hover">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-emerald-400 font-semibold">📄 Resume Upload</p>
            <h2 className="text-2xl font-semibold text-white">Upload & Analyze Your Resume</h2>
            <p className="text-slate-400 text-sm mt-1">
              Professional resume analysis with ATS scoring, skill detection, and job matching
            </p>
          </div>
          
          {/* Upload Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              uploadState === UPLOAD_STATES.IDLE ? 'bg-slate-500' :
              uploadState === UPLOAD_STATES.UPLOADING ? 'bg-blue-400 animate-pulse' :
              uploadState === UPLOAD_STATES.ANALYZING ? 'bg-yellow-400 animate-pulse' :
              uploadState === UPLOAD_STATES.COMPLETED ? 'bg-green-400' :
              'bg-red-400'
            }`} />
            <span className="text-xs text-slate-400 capitalize">
              {uploadState === UPLOAD_STATES.IDLE ? 'Ready' :
               uploadState === UPLOAD_STATES.UPLOADING ? 'Uploading' :
               uploadState === UPLOAD_STATES.ANALYZING ? 'Analyzing' :
               uploadState === UPLOAD_STATES.COMPLETED ? 'Complete' :
               'Error'}
            </span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <AnimatePresence>
          {(uploadState === UPLOAD_STATES.UPLOADING || uploadState === UPLOAD_STATES.ANALYZING) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {uploadState === UPLOAD_STATES.UPLOADING ? 'Uploading file...' : 'Analyzing resume...'} {Math.round(progress)}%
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* File Upload/Preview Area */}
        <AnimatePresence mode="wait">
          {!selectedFile ? (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ResumeDropzone
                onFileSelect={handleFileSelect}
                disabled={uploadState === UPLOAD_STATES.UPLOADING || uploadState === UPLOAD_STATES.ANALYZING}
                error={error}
              />
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <FilePreviewCard
                file={selectedFile}
                onReplace={handleReplaceResume}
                onRemove={handleRemoveResume}
                disabled={uploadState === UPLOAD_STATES.ANALYZING}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Job Description */}
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <label className="text-sm text-slate-200 font-medium">
              Job Description (Optional)
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description to get precise skill matching and keyword alignment..."
              className="w-full min-h-[120px] rounded-xl bg-slate-900/60 border border-slate-800 p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
              disabled={uploadState === UPLOAD_STATES.ANALYZING}
            />
          </motion.div>
        )}

        {/* Analysis Button */}
        {selectedFile && uploadState !== UPLOAD_STATES.ANALYZING && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={handleAnalyzeResume}
              disabled={uploadState === UPLOAD_STATES.ANALYZING}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold shadow-glow-green hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              🚀 Run AI Analysis
            </button>
          </motion.div>
        )}

        {/* Analysis Loader */}
        <AnimatePresence>
          {uploadState === UPLOAD_STATES.ANALYZING && (
            <AnalysisLoader progress={progress} />
          )}
        </AnimatePresence>

        {/* Detected Skills */}
        <AnimatePresence>
          {uploadState === UPLOAD_STATES.COMPLETED && detectedSkills.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <SkillTagList 
                skills={detectedSkills}
                title="Detected Skills"
                subtitle={`Found ${detectedSkills.length} skills in your resume`}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analysis Results Summary */}
        <AnimatePresence>
          {uploadState === UPLOAD_STATES.COMPLETED && analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="text-lg font-semibold text-green-400">Analysis Complete!</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-300 mt-1">
                    <span>ATS Score: <strong className="text-white">{Math.round(analysisResult.ats_score)}%</strong></span>
                    <span>Skills: <strong className="text-white">{analysisResult.detected_skills?.length || 0}</strong></span>
                    <span>Recommendations: <strong className="text-white">{analysisResult.job_recommendations?.length || 0}</strong></span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-red-500/10 border border-red-500/30 text-red-200 p-3 rounded-xl"
            >
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span className="text-sm">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
