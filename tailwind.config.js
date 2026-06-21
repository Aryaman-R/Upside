/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Accent — emerald, used sparingly. "Upside" leans calm/optimistic
        // (green = growth/savings) rather than high-arousal gambling reds.
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Neutral surface scale — a refined, slightly desaturated slate so the
        // app reads like a professional product, not a default dark template.
        ink: {
          950: '#080a0f',
          900: '#0b0e14',
          850: '#0f131b',
          800: '#141925',
          750: '#1a2030',
          700: '#222a3b',
          600: '#2e3850',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightish: '-0.011em',
      },
      boxShadow: {
        // Subtle, single-layer elevation — no heavy drop shadows.
        card: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 1px 2px 0 rgba(0,0,0,0.4)',
        pop: '0 12px 40px -12px rgba(0,0,0,0.6)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(0.98) translateY(6px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
        pop: 'pop 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
