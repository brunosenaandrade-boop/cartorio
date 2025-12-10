/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3182ce',
          600: '#2c5282',
          700: '#1a365d',
          800: '#1e3a5f',
          900: '#0f172a',
        },
        accent: {
          400: '#ecc94b',
          500: '#d69e2e',
        },
      },
    },
  },
  plugins: [],
}
