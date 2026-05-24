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
          dark: '#1e293b',    // Fondo lateral, cabeceras (Slate 800)
          light: '#f8fafc',   // Fondo general de la app (Slate 50)
          border: '#e2e8f0',  // Bordes de tarjetas (Slate 200)
        },
        status: {
          success: '#10b981', // Verde para Pagado / Ingresos
          danger: '#ef4444',  // Rojo para Deudas / Alertas
          warning: '#f59e0b', // Ámbar para Vehículos / Info externa
          info: '#3b82f6',    // Azul para botones primarios
        }
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Recomendado para los inputs y checkboxes
  ],
}
