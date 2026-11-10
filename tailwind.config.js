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
          teaGreen: '#c5ebc3',       // #c5ebc3 - Tea Green
          ashGrey: '#b7c8b5',        // #b7c8b5 - Ash Grey
          lilacAsh: '#a790a5',       // #a790a5 - Lilac Ash
          dustyLavender: '#875c74',  // #875c74 - Dusty Lavender
          mauveShadow: '#54414e',    // #54414e - Mauve Shadow
        },
        primary: '#54414e',
        secondary: '#875c74',
        accent: '#c5ebc3',
        ash: '#b7c8b5',
        lilac: '#a790a5',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
