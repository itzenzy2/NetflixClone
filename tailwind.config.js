/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        netflix: {
          red: '#E50914',
          black: '#141414',
          darkGray: '#2F2F2F',
          lightGray: '#B3B3B3',
        }
      },
      backgroundImage: {
        'gradient-to-b': 'linear-gradient(to bottom, rgba(20,20,20,0) 0%, rgba(20,20,20,0.15) 15%, rgba(20,20,20,0.35) 29%, rgba(20,20,20,0.58) 44%, #141414 68%, #141414 100%)',
      }
    },
  },
  plugins: [],
}
