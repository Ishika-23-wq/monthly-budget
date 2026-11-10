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
          powderBlue: '#98c1d9',      // #98c1d9 - Powder Blue
          slateBlue: '#6969b3',       // #6969b3 - Slate Blue
          indigoVelvet: '#533a7b',    // #533a7b - Indigo Velvet
          blackberryCream: '#4b244a', // #4b244a - Blackberry Cream
          coffeeBean: '#25171a',      // #25171a - Coffee Bean
        },
        primary: '#25171a',
        secondary: '#533a7b',
        accent: '#98c1d9',
        plum: '#4b244a',
        slate: '#6969b3',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
