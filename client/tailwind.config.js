/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#131316",
        cream: "#faf9f7",
        accent: "#8a5c3a",
      },
      fontFamily: {
        display: ["'Inter'", "sans-serif"],
        sans: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(19,19,22,0.04), 0 8px 24px -12px rgba(19,19,22,0.12)",
        "card-lg": "0 4px 8px rgba(19,19,22,0.05), 0 24px 48px -16px rgba(19,19,22,0.22)",
        "btn": "0 8px 20px -6px rgba(19,19,22,0.45)",
        "btn-light": "0 8px 24px -6px rgba(255,255,255,0.18)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "translateY(-4px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fadeIn 1s ease-out both",
        float: "float 4.5s ease-in-out infinite",
        "pop-in": "popIn 0.18s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
};
