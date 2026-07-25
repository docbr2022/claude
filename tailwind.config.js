/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Paleta da marca Café e Criar — amarelo (#D9B607) + dourado (#A78C09) + preto
        brand: {
          50: '#fffbea',
          100: '#fff3c4',
          200: '#ffe985',
          300: '#ffe400', // amarelo vivo da logo (uso em acentos sobre fundo escuro)
          400: '#eac706',
          500: '#e0bd07',
          600: '#d9b607', // amarelo primário da marca
          700: '#a78c09', // dourado (hover / secundário)
          800: '#7a6607',
          900: '#4d4005',
          950: '#282103',
        },
        ink: {
          50: '#f9f8f3',
          100: '#f3f2ec', // off-white quente (tint de fundo)
          200: '#e6e3d8', // borda sutil
          300: '#c9c9c9',
          400: '#a3a3a0',
          500: '#6b6b6b', // texto secundário
          600: '#525250',
          700: '#3a3a3a', // texto de corpo
          800: '#242322',
          900: '#111111', // texto de título
          950: '#000000', // preto puro (seções escuras)
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        display: ['"Baloo 2"', 'Poppins', 'system-ui', 'sans-serif'],
        script: ['Yellowtail', 'cursive'],
      },
      borderRadius: {
        xl: '20px', // radius-lg da marca — usado nos cards
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
        card: '0 10px 30px rgba(0,0,0,.08)',
        'card-hover': '0 16px 40px rgba(0,0,0,.14)',
        btn: '0 6px 18px rgba(217,182,7,.35)',
      },
    },
  },
  plugins: [],
}
