/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060B18',
          900: '#0B132B',
          850: '#111D3D',
          800: '#1C2541',
          700: '#2A3656',
          600: '#3A4A72',
        },
        violet: {
          950: '#2E1065',
          900: '#4C1D95',
          800: '#5B21B6',
          700: '#6D28D9',
          600: '#7C3AED',
          500: '#8B5CF6',
          400: '#A78BFA',
          300: '#C4B5FD',
          100: '#EDE9FE',
          50: '#F5F3FF',
        },
        softblue: {
          500: '#38BDF8',
          600: '#0284C7',
          700: '#0369A1',
        },
        slate: {
          950: '#020617',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-violet': '0 0 25px rgba(124, 58, 237, 0.25)',
        'glow-blue': '0 0 20px rgba(56, 189, 248, 0.2)',
        'card-soft': '0 2px 12px -2px rgba(11, 19, 43, 0.06), 0 4px 16px -1px rgba(11, 19, 43, 0.04)',
      }
    },
  },
  plugins: [],
}
