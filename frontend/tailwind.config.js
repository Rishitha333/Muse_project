export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial'],
        satoshi: ['Satoshi', 'sans-serif'],
        clashdisplay: ['Clash Display', 'sans-serif'],
      },
      colors: {
        light: {
          bg: "#ffffff",
          surface: "#f8f9fa",
          text: "#1f2937",
          textSecondary: "#6b7280",
          border: "#e5e7eb",
        },
        primary: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
          950: "#3f0f5c",
        },
      },
    },
  },
  plugins: [],
};