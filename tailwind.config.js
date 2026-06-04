import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#1e293b",
          light: "#f8fafc",
          border: "#e2e8f0",
        },
        status: {
          success: "#10b981",
          danger: "#ef4444",
          warning: "#f59e0b",
          info: "#3b82f6",
        }
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "Roboto", "sans-serif"],
      }
    },
  },
  plugins: [forms],
};
