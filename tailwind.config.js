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
        batflix: {
          red: '#E50914',
          redBright: '#FF2D3A',
          black: '#000000',
          ink: '#000000',
          darkGray: '#131318',
          surface: '#1A1A21',
          surface2: '#23232C',
          lightGray: '#A7A7B2',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(0, 0, 0, 0.45)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.6)',
        'card-hover': '0 24px 60px -16px rgba(0, 0, 0, 0.85)',
        'glow-red': '0 0 40px -8px rgba(229, 9, 20, 0.65)',
        'glow-soft': '0 0 90px -20px rgba(229, 9, 20, 0.4)',
      },
    },
  },
  plugins: [],
}
