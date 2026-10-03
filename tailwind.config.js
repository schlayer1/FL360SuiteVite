/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./js/**/*.{js,ts}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          slate: '#0f172a',
          surface: '#1e293b',
          indigo: '#2563eb',
          cyan: '#0284c7',
          emerald: '#059669',
          amber: '#d97706',
          rose: '#dc2626'
        }
      }
    },
  },
  plugins: [],
}
