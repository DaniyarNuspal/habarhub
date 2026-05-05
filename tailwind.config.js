/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#16A34A',
          100: '#16A34A',
          200: '#16A34A',
          500: '#16A34A',
          600: '#16A34A',
          700: '#16A34A',
          900: '#16A34A'
        },
        accent: '#f97316'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)'
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"SF Pro Display"', 'system-ui', 'sans-serif']
      },
      backgroundImage: {
        hero: 'linear-gradient(135deg, rgba(1, 72, 160, 0.12), rgba(249, 115, 22, 0.14))'
      }
    }
  },
  plugins: []
};
