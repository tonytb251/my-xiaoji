/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#fdf6f0',
          100: '#f9e9da',
          200: '#f3d9b8',
          300: '#e8c090',
          400: '#d9a06a',
          500: '#c8844a',
        },
        cozy: {
          50: '#faf3ee',
          100: '#f1ddd2',
          200: '#e5c0ab',
          300: '#d49e7e',
          400: '#c4815b',
          500: '#b06a45',
          600: '#8e5537',
          700: '#6e3e23',
        },
        mood: {
          great: '#f87171',
          good: '#fb923c',
          okay: '#facc15',
          nice: '#a3e635',
          mid: '#94a3b8',
          bad: '#818cf8',
          terrible: '#a78bfa',
          anxious: '#f97316',
          worried: '#6366f1',
        },
        body: {
          energetic: '#34d399',
          normal: '#fbbf24',
          tired: '#f97316',
          sore: '#ef4444',
          sick: '#8b5cf6',
        },
        sleep: {
          deep: '#6366f1',
          good: '#818cf8',
          fair: '#a5b4fc',
          poor: '#fca5a5',
          terrible: '#f87171',
        }
      },
      fontFamily: {
        serif: ['Noto Serif SC', 'serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
