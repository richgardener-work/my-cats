/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        light: {
          bg: '#FFF8F6',
          pink: '#F4A8C7',
          purple: '#C9A0DC',
          text: '#3D2C35',
          card: '#FFFFFF',
        },
        dark: {
          bg: '#12071E',
          purple: '#C77DFF',
          pink: '#E0A7C8',
          text: '#F5EEF8',
          card: '#1E0F33',
        },
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

