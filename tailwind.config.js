/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        espresso: '#1a130d',
        'espresso-light': '#241a12',
        cream: '#f4ece0',
        'cream-dim': '#c8bfb0',
        terracotta: '#d4824a',
        gold: '#c79a52',
        'gold-light': '#e8b86d',
      },
      fontFamily: {
        serif: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
