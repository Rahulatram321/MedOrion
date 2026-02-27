/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        glass: '0 10px 40px rgba(0, 0, 0, 0.25)',
      },
      colors: {
        panel: 'rgba(14, 22, 36, 0.74)',
      },
    },
  },
  plugins: [],
}
