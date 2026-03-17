import { useState } from "react";
import { motion } from "framer-motion";

export default function ChatInput({ onSend, loading, suggestions = [] }) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    const message = value.trim();
    if (!message || loading) return;
    onSend(message);
    setValue("");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {suggestions.map((text) => (
          <button
            key={text}
            type="button"
            disabled={loading}
            onClick={() => {
              setValue(text);
              onSend(text);
            }}
            className="px-3 py-1.5 rounded-full text-xs bg-slate-900/70 border border-slate-800 text-slate-200 hover:border-accent-600 disabled:opacity-60"
          >
            {text}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 bg-slate-900/70 border border-slate-800 rounded-2xl px-4 py-3">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={loading ? "Waiting for AI response..." : "Ask for interview prep, resume tweaks, career advice"}
          className="flex-1 bg-transparent text-sm text-slate-100 outline-none"
        />
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          onClick={handleSend}
          className="px-4 py-2 rounded-lg bg-accent-600 text-white text-sm font-semibold disabled:opacity-60"
          type="button"
        >
          {loading ? "Sending..." : "Send"}
        </motion.button>
      </div>
    </div>
  );
}

