/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        night: {
          50: "#f8fafc",
          100: "#e8edf5",
          200: "#cbd5e1",
          300: "#94a3b8",
          400: "#64748b",
          500: "#475569",
          600: "#334155",
          700: "#1e293b",
          800: "#0f172a",
          900: "#020617",
        },
        accent: {
          500: "#7c3aed",
          600: "#6d28d9",
          700: "#5b21b6",
        },
        mint: {
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
        },
      },
      boxShadow: {
        glow: "0 10px 80px -30px rgba(124, 58, 237, 0.35)",
      },
    },
  },
  plugins: [],
};
