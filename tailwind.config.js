/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // AQUI ESTÃO AS CORES QUE O CSS ESTÁ PROCURANDO
        brand: {
          blue: '#00a8c6',
          pink: '#ff6b81',
          purple: '#a55eea',
          yellow: '#f7b731',
          dark: '#2d3436',
          light: '#fdfbf7',
        }
      },
      boxShadow: {
        'glow-blue': '0 4px 30px -4px rgba(0, 168, 198, 0.4)',
        'glow-pink': '0 4px 30px -4px rgba(255, 107, 129, 0.4)',
        'card-hover': '0 20px 40px -10px rgba(0, 168, 198, 0.15)',
      },
      animation: {
        'border-dance': 'border-dance 4s linear infinite',
      },
      keyframes: {
        'border-dance': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}