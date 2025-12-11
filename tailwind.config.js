/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        restaurant: {
          primary: '#3B82F6',    // Azul
          secondary: '#F59E0B',  // Ámbar
          success: '#10B981',    // Verde
          danger: '#EF4444',     // Rojo
          warning: '#F59E0B',    // Naranja
          info: '#3B82F6',       // Azul
          dark: '#1F2937',       // Gris oscuro
          light: '#F3F4F6'       // Gris claro
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}