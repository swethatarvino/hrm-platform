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
          50: 'var(--brand-50, #fdf4ff)',
          100: 'var(--brand-100, #fae8ff)',
          200: 'var(--brand-200, #f5d0fe)',
          300: 'var(--brand-300, #f0abfc)',
          400: 'var(--brand-400, #e879f9)',
          500: 'var(--brand-500, #d946ef)',
          600: 'var(--brand-600, #c026d3)',
          700: 'var(--brand-700, #9333ea)',
          800: 'var(--brand-800, #7e22ce)',
          900: 'var(--brand-900, #581c87)',
        },
        darkblue: {
          950: '#070a13',
          900: '#0b0f19',
          850: '#0e1526',
          800: '#111b33',
          700: '#1e294b',
        }
      }
    },
  },
  plugins: [],
}
