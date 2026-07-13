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
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c084fc',
          400: '#a855f7',
          500: '#8b5cf6', // main indigo/purple accent
          600: '#7c3aed',
          700: '#6d28d9',
          850: '#1e1b4b',
          900: '#0f172a',
          950: '#020617',
        },
        expense: {
          red: '#ef4444',
          green: '#10b981',
          bg: '#1e293b'
        },
        mockup: {
          bg: '#F5F4FA', // light lavender tinted background
          card: '#FFFFFF',
          purple: '#7C3AED', // deep purple accent
          purpleHover: '#6D28D9',
          orange: '#FF6E4E', // orange accent
          orangeHover: '#EA580C',
          bgPurple: '#ECE7FF', // light purple card background
          bgOrange: '#FFEFEA', // light orange card background
          textDark: '#1E1B4B', // dark charcoal/violet text
          textGray: '#64748B', // gray body text
          textLight: '#94A3B8', // subtle text
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'mockup-soft': '0 8px 30px rgba(0, 0, 0, 0.03)',
        'mockup-hover': '0 12px 35px rgba(0, 0, 0, 0.06)',
        'mockup-purple': '0 4px 12px rgba(30, 27, 75, 0.04)',
        'mockup-orange': '0 4px 12px rgba(30, 27, 75, 0.04)',
      }
    },
  },
  plugins: [],
}
