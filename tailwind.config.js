/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', '"Cairo"', "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#14202B",
        brand: {
          50: "#EEF3F6",
          100: "#D6E2EA",
          400: "#5C7F94",
          600: "#2E5468",
          700: "#1F3E4E",
          800: "#16303D",
          900: "#0E2029",
        },
        rust: {
          500: "#C77B3F",
          600: "#B0672E",
        },
        ok: "#3E8763",
        warn: "#C77B3F",
        idle: "#8B97A0",
      },
    },
  },
  plugins: [],
};
