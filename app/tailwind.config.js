/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#151e2e',
          950: '#020617',
        },
        amber: {
          450: '#fbbf24', // Custom gold
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'breath': 'breath 8s ease-in-out infinite',
        'in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        breath: {
          '0%, 100%': { transform: 'scale(0.85)', opacity: '0.7' },
          '50%': { transform: 'scale(1.15)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}