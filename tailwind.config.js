/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0D0B2A',
        indigo: {
          DEFAULT: '#4F46E5',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          900: '#1E1B4B',
        },
        lavender: '#818CF8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
