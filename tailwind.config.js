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
          mint: '#5dfdcb',      // Vibrant Aquamarine / Mint
          sky: '#7cc6fe',       // Soft Sky Blue
          ice: '#f4faff',       // Clean Ice Canvas
          lavender: '#8789c0',  // Muted Lavender Slate
          dark: '#08090a',      // Rich Obsidian Black
        },
        primary: '#08090a',
        accent: '#5dfdcb',
        sky: '#7cc6fe',
        lavender: '#8789c0',
        ice: '#f4faff',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
