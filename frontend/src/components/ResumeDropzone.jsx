import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";

export default function ResumeDropzone({ onFileSelect, disabled, error }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragOver to false if we're leaving the dropzone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file) {
      onFileSelect(file);
    }
  }, [disabled, onFileSelect]);

  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  }, [onFileSelect]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={handleFileInputChange}
        disabled={disabled}
      />
      
      <motion.div
        className={`
          relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer
          ${
            isDragOver
              ? 'border-emerald-400 bg-emerald-500/10 scale-105'
              : error
              ? 'border-red-400/50 bg-red-500/5'
              : 'border-slate-600 bg-slate-900/20 hover:border-slate-500 hover:bg-slate-900/30'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        whileHover={!disabled ? { y: -2 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
      >
        {/* Animated background glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20"
          animate={{
            opacity: isDragOver ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
        
        <div className="relative z-10 text-center space-y-4">
          {/* Upload Icon */}
          <motion.div
            className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center"
            animate={{
              scale: isDragOver ? 1.1 : 1,
              rotate: isDragOver ? 5 : 0,
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <motion.div
              className="text-2xl"
              animate={{
                y: isDragOver ? -2 : 0,
              }}
            >
              {isDragOver ? '📁' : '📄'}
            </motion.div>
          </motion.div>

          {/* Upload Text */}
          <div className="space-y-2">
            <motion.h3
              className="text-lg font-semibold text-white"
              animate={{
                scale: isDragOver ? 1.05 : 1,
              }}
            >
              {isDragOver ? 'Drop your resume here!' : 'Drop your resume here or click to upload'}
            </motion.h3>
            
            <p className="text-sm text-slate-400">
              {isDragOver ? 'Release to upload' : 'Supports PDF, DOCX, DOC, and TXT files'}
            </p>
          </div>

          {/* File Format Icons */}
          {!isDragOver && (
            <motion.div
              className="flex justify-center items-center gap-4 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {[
                { ext: 'PDF', color: 'text-red-400', bg: 'bg-red-500/20' },
                { ext: 'DOCX', color: 'text-blue-400', bg: 'bg-blue-500/20' },
                { ext: 'TXT', color: 'text-green-400', bg: 'bg-green-500/20' },
              ].map((format, index) => (
                <motion.div
                  key={format.ext}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${format.color} ${format.bg} border border-current/20`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  {format.ext}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* File Size Limit */}
          <motion.p
            className="text-xs text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Maximum file size: 5MB
          </motion.p>
        </div>

        {/* Upload Button (Alternative) */}
        {!isDragOver && (
          <motion.div
            className="absolute bottom-4 right-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              type="button"
              className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-colors"
              disabled={disabled}
            >
              Browse Files
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Quick Tips */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
          <span>Secure local processing</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
          <span>No data storage</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
          <span>Instant analysis</span>
        </div>
      </motion.div>
    </div>
  );
}
