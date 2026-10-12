/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#020617',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.15)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.15)',
      }
    },
  },
  plugins: [],
}
