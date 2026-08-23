import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f7f2",
          100: "#dbece1",
          200: "#b8d9c4",
          300: "#8fc0a1",
          400: "#6bab81",
          500: "#4aa366",
          600: "#3a8752",
          700: "#2c6940",
          800: "#1e4a2d",
          900: "#153322",
        },
        risk: {
          low: "#22c55e",
          medium: "#eab308",
          high: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        blob: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(20px, -30px) scale(1.1)" },
          "66%": { transform: "translate(-15px, 15px) scale(0.95)" },
        },
      },
      animation: {
        blob: "blob 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
