/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        palette: {
          peach: '#ffcdb2', // #ffcdb2
          melon: '#ffb4a2', // #ffb4a2
          rose: '#e5989b',  // #e5989b
          mauve: '#b5838d', // #b5838d
          deep: '#6d6875',  // #6d6875
        },
        primary: '#6d6875',
        accent: '#b5838d',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
