/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mission-critical colour palette
        sonar: {
          50:  "#e8f5ff",
          100: "#b3dfff",
          200: "#66c0ff",
          300: "#00a1ff",
          400: "#0080d0",
          500: "#005fa0",
          600: "#003f70",
          700: "#002040",
        },
        threat: {
          low:  "#22c55e",   // green
          mid:  "#f59e0b",   // amber
          high: "#ef4444",   // red
        },
        panel: "#0a0f1a",
        surface: "#0e1625",
        border:  "#1e2d42",
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        sans: ["'Inter'", "sans-serif"],
      },
      keyframes: {
        sonarSweep: {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0.4" },
        },
      },
      animation: {
        "sonar-sweep": "sonarSweep 2s linear infinite",
        "slow-pulse":  "pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
