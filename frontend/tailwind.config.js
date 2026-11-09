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
        // Master Prompt Premium Palette
        brand: {
          midnight: '#080B1A',
          purple: '#713CFF',
          blue: '#287BFF',
          cyan: '#00E5FF',
          lavender: '#B69CFF',
          light: '#F8FAFF',
        },
        midnight: {
          950: '#050711',
          900: '#080B1A',
          850: '#0D1226',
          800: '#131B38',
          700: '#1C2852',
          600: '#2A3C74',
        },
        navy: {
          950: '#080B1A',
          900: '#0B132B',
          850: '#111D3D',
          800: '#1C2541',
          700: '#2A3656',
          600: '#3A4A72',
        },
        violet: {
          950: '#1B0D3D',
          900: '#2F1668',
          800: '#482098',
          700: '#5C2ECC',
          600: '#713CFF',
          500: '#8B5CF6',
          400: '#A78BFA',
          300: '#B69CFF',
          200: '#DDD2FF',
          100: '#EDE9FE',
          50: '#F8FAFF',
        },
        cyan: {
          400: '#00E5FF',
          500: '#00D0E8',
          600: '#00B4C8',
        },
        electric: {
          500: '#287BFF',
          600: '#1C69E6',
          700: '#1055C4',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Outfit', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-purple': '0 0 35px -5px rgba(113, 60, 255, 0.45)',
        'glow-cyan': '0 0 35px -5px rgba(0, 229, 255, 0.4)',
        'glow-blue': '0 0 35px -5px rgba(40, 123, 255, 0.4)',
        'glow-multi': '0 0 45px -10px rgba(113, 60, 255, 0.35), 0 0 30px -10px rgba(0, 229, 255, 0.25)',
        'glass-card': '0 8px 32px 0 rgba(8, 11, 26, 0.37)',
        'glass-glow': '0 10px 40px -10px rgba(113, 60, 255, 0.25), inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
        'card-soft': '0 4px 20px -2px rgba(8, 11, 26, 0.08), 0 2px 6px -1px rgba(8, 11, 26, 0.04)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'aurora-mesh': 'radial-gradient(at 0% 0%, rgba(113, 60, 255, 0.2) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(40, 123, 255, 0.2) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(0, 229, 255, 0.15) 0px, transparent 50%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
        'glass-gradient-hover': 'linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 7s ease-in-out 2s infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'aurora': 'aurora 15s ease infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        aurora: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        }
      }
    },
  },
  plugins: [],
}
