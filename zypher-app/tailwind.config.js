// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        "brand-yellow": "#FCE803",
        "text-primary": "#F0F0F0",
        "text-secondary": "#CCCCCC"
      }
    }
  },
  plugins: []
};
