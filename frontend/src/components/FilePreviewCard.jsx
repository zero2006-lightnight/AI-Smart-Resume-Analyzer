import { motion } from "framer-motion";
import { useMemo } from "react";

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(fileName) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return { icon: '📄', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' };
    case 'docx':
    case 'doc':
      return { icon: '📝', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' };
    case 'txt':
      return { icon: '📃', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' };
    default:
      return { icon: '📄', color: 'text-slate-400', bg: 'bg-slate-500/20', border: 'border-slate-500/30' };
  }
}

export default function FilePreviewCard({ file, onReplace, onRemove, disabled }) {
  const fileIcon = useMemo(() => getFileIcon(file?.name || ''), [file?.name]);
  const uploadTime = useMemo(() => new Date().toLocaleString(), []);

  if (!file) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass rounded-2xl border border-white/10 p-6 shadow-glow"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            className={`w-12 h-12 rounded-xl ${fileIcon.bg} ${fileIcon.border} border flex items-center justify-center text-xl`}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            {fileIcon.icon}
          </motion.div>
          <div>
            <motion.h3
              className="text-lg font-semibold text-white"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              Resume Uploaded
            </motion.h3>
            <motion.p
              className="text-sm text-slate-400"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              Ready for analysis
            </motion.p>
          </div>
        </div>
        
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          <span className="text-xs text-emerald-400 font-medium">Active</span>
        </motion.div>
      </div>

      {/* File Details */}
      <motion.div
        className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {/* File Name */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">File Name</span>
          <span className="text-sm text-white font-medium truncate max-w-xs ml-2" title={file.name}>
            {file.name}
          </span>
        </div>

        {/* File Size */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">File Size</span>
          <span className="text-sm text-white font-medium">
            {formatFileSize(file.size)}
          </span>
        </div>

        {/* File Type */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">File Type</span>
          <span className={`text-sm font-medium ${fileIcon.color}`}>
            {file.type || 'Unknown'}
          </span>
        </div>

        {/* Upload Time */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Uploaded</span>
          <span className="text-sm text-white font-medium">
            {uploadTime}
          </span>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="flex items-center gap-3 mt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <button
          onClick={onReplace}
          disabled={disabled}
          className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl font-medium text-sm hover:bg-slate-700 hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span className="flex items-center justify-center gap-2">
            <span>🔄</span>
            <span>Replace Resume</span>
          </span>
        </button>
        
        <button
          onClick={onRemove}
          disabled={disabled}
          className="px-4 py-2.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl font-medium text-sm hover:bg-red-500/20 hover:border-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span className="flex items-center justify-center gap-2">
            <span>🗑️</span>
            <span>Remove</span>
          </span>
        </button>
      </motion.div>

      {/* Security Note */}
      <motion.div
        className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <span>🔒</span>
          <span>Your resume is processed locally and securely. No data is stored on our servers.</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
