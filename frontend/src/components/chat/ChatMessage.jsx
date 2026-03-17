import { motion } from "framer-motion";

export default function ChatMessage({ role, content }) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && <Avatar label="AI" accent />}
      <div
        className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-glow ${
          isUser ? "bg-accent-600 text-white" : "bg-slate-900/80 border border-slate-800 text-slate-100"
        }`}
      >
        {content}
      </div>
      {isUser && <Avatar label="You" />}
    </motion.div>
  );
}

function Avatar({ label, accent = false }) {
  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold border ${
        accent ? "bg-accent-600 text-white border-accent-500" : "bg-slate-800 text-slate-200 border-slate-700"
      }`}
    >
      {label}
    </div>
  );
}

