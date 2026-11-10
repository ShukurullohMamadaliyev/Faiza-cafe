/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Ibrohim Ota Choyxonasi official branding: Royal Crimson Red & Warm Amber Gold
        brand: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444', // vibrant red
          600: '#dc2626', // rich crimson
          700: '#b91c1c', // deep red
          800: '#991b1b', // Choyxona deep ruby red
          900: '#7f1d1d', // Darkest burgundy
          950: '#450a0a',
        },
        gold: {
          300: '#fef08a',
          400: '#facc15',
          500: '#d4af37', // Logo champagne gold
          600: '#ca8a04',
        },
        accentRed: {
          500: '#ef4444',
          600: '#dc2626',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(13, 59, 46, 0.06)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.04)',
        'float': '0 10px 25px -4px rgba(5, 150, 105, 0.35)',
        'sheet': '0 -10px 40px rgba(9, 39, 30, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-up': 'scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
        }
      }
    },
  },
  plugins: [],
}
