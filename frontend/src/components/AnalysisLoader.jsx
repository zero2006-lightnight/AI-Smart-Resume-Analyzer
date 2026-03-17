import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const ANALYSIS_STEPS = [
  {
    id: 'parsing',
    label: 'Parsing Resume',
    description: 'Extracting text and structure',
    icon: '📄',
    duration: 2000
  },
  {
    id: 'skills',
    label: 'Detecting Skills',
    description: 'AI-powered skill recognition',
    icon: '🎯',
    duration: 3000
  },
  {
    id: 'ats',
    label: 'Calculating ATS Score',
    description: 'Analyzing keyword matching',
    icon: '📊',
    duration: 2500
  },
  {
    id: 'matching',
    label: 'Job Matching',
    description: 'Finding relevant opportunities',
    icon: '💼',
    duration: 2000
  },
  {
    id: 'insights',
    label: 'Generating Insights',
    description: 'Creating recommendations',
    icon: '✨',
    duration: 1500
  }
];

const LOADING_MESSAGES = [
  "🔍 Scanning your resume for key information...",
  "🧠 AI is analyzing your professional experience...",
  "📈 Computing your ATS compatibility score...",
  "🎯 Matching you with relevant job opportunities...",
  "💡 Generating personalized career insights...",
  "🚀 Almost done! Finalizing your analysis..."
];

export default function AnalysisLoader({ progress = 0 }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [dots, setDots] = useState("");

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  // Update step based on progress
  useEffect(() => {
    const stepIndex = Math.min(
      Math.floor((progress / 100) * ANALYSIS_STEPS.length),
      ANALYSIS_STEPS.length - 1
    );
    setCurrentStep(stepIndex);
  }, [progress]);

  // Cycle through messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass rounded-2xl border border-white/10 p-6 md:p-8 shadow-glow"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <span className="text-2xl">🤖</span>
        </motion.div>
        
        <motion.h3
          className="text-xl font-semibold text-white mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Analyzing Your Resume{dots}
        </motion.h3>
        
        <AnimatePresence mode="wait">
          <motion.p
            key={currentMessage}
            className="text-sm text-slate-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {LOADING_MESSAGES[currentMessage]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-200">Progress</span>
          <span className="text-sm font-medium text-emerald-400">{Math.round(progress)}%</span>
        </div>
        
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Animated shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Analysis Steps */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-200 mb-4">Analysis Steps</h4>
        
        {ANALYSIS_STEPS.map((step, index) => (
          <motion.div
            key={step.id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              index < currentStep
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : index === currentStep
                ? 'bg-cyan-500/10 border-cyan-500/30'
                : 'bg-slate-800/30 border-slate-700'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Step Icon */}
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                index < currentStep
                  ? 'bg-emerald-500 text-white'
                  : index === currentStep
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-700 text-slate-400'
              }`}
              animate={index === currentStep ? {
                scale: [1, 1.1, 1],
              } : {}}
              transition={{
                duration: 1,
                repeat: index === currentStep ? Infinity : 0,
              }}
            >
              {index < currentStep ? '✓' : index === currentStep ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  {step.icon}
                 </motion.span>
               ) : step.icon}
            </motion.div>
            
            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${
                index <= currentStep ? 'text-white' : 'text-slate-400'
              }`}>
                {step.label}
                {index === currentStep && (
                  <motion.span
                    className="ml-1"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ...
                  </motion.span>
                )}
              </p>
              <p className="text-xs text-slate-500">{step.description}</p>
            </div>
            
            {/* Step Status */}
            {index < currentStep && (
              <motion.div
                className="text-emerald-400 text-xs font-medium"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                Complete
              </motion.div>
            )}
            {index === currentStep && (
              <motion.div
                className="flex items-center gap-1 text-cyan-400 text-xs font-medium"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <span className="w-1 h-1 bg-current rounded-full animate-pulse" />
                Active
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Fun Fact */}
      <motion.div
        className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <div className="flex items-center gap-2 text-sm">
          <motion.span
            className="text-purple-400"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            💡
          </motion.span>
          <div>
            <p className="text-purple-200 font-medium">Did you know?</p>
            <p className="text-slate-400 text-xs mt-1">
              Our AI analyzes over 500+ skill patterns and ATS-friendly formatting rules to give you the most accurate insights.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
