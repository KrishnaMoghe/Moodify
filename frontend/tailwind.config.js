/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: '#1DB954',
          black: '#191414',
          dark: '#121212',
          gray: '#535353',
        }
      },
      fontFamily: {
        'spotify': ['Circular', 'Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
