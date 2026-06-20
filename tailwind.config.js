/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#143C3D',
        mint: '#2FC7A8',
        bg: '#F4F6F5',
        'navy-light': '#1a4f51',
        'mint-dark': '#23a88d',
        'mint-light': '#5dd9be',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
