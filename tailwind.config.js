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
      keyframes: {
        'confetti-fall': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
      },
      animation: {
        'confetti-fall': 'confetti-fall 2s ease-in forwards',
      },
    },
  },
  plugins: [],
}

