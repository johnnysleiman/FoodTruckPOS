/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B4513', // Saddle Brown - Rusty Lab main
          light: '#A0522D',   // Sienna
          dark: '#6B3410',    // Darker brown
          50: '#FDF8F3',
          100: '#F5E6D3',
          200: '#E8D0B3',
          300: '#D4A574',
          400: '#B8864B',
          500: '#8B4513',
          600: '#6B3410',
          700: '#5C2D0E',
          800: '#4A2409',
          900: '#3D1F08',
        },
        accent: {
          DEFAULT: '#CD853F', // Peru - warm accent
          light: '#DEB887',   // Burlywood
          dark: '#A0522D',    // Sienna
        },
        rust: {
          DEFAULT: '#B7410E', // Rust red
          light: '#CD5C3C',
          dark: '#8B2500',
        },
        surface: {
          DEFAULT: '#FFFAF5', // Warm white
          secondary: '#F5EDE4', // Light tan
          tertiary: '#E8DDD0', // Tan
        },
        cream: '#F5F0E6',
        tan: '#D2B48C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
