/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#dbe6fe',
          200: '#bdd1fe',
          300: '#8fb1fd',
          400: '#5a89fa',
          500: '#3563f5',
          600: '#2444e8',
          700: '#1e34d1',
          800: '#1f2ea9',
          900: '#1f2c84',
          950: '#171d52',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#b1b8c8',
          400: '#8690a8',
          500: '#67718c',
          600: '#525b74',
          700: '#434a5e',
          800: '#3a3f4f',
          900: '#242730',
          950: '#16181e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
        card: '0 2px 8px -2px rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
      },
    },
  },
  plugins: [],
}
