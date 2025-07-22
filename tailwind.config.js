/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#a60000',
          'red-secondary': '#dd9999',
          white: '#fff6f7',
          blue: '#cad1d9',
        },
      },
    },
  },
  plugins: [],
}

