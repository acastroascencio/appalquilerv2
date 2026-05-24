/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          action: '#2563EB',     // Azul fuerte
          positive: '#16A34A',   // Verde fuerte
          light: '#F9FAFB',      // Fondo claro de alto contraste
          dark: '#000000',       // Texto puro
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
