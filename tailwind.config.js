/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Accent — "Upside Purple" (#6806C9) from the brand identity. Used for
        // brand moments; win/loss stay green/rose for semantic clarity.
        brand: {
          50: '#ece6f4', // brand "Background" lavender
          100: '#dcc9f5',
          200: '#c2a1ef',
          300: '#a878e9',
          400: '#8a47df',
          500: '#6806c9', // Upside Purple — primary
          600: '#5705a8',
          700: '#450785',
          800: '#330961',
          900: '#210641',
        },
        // Surface scale — near-black neutrals (black base) so the purple accents
        // pop. Base background is true black; surfaces step up subtly.
        ink: {
          950: '#000000', // true black — base background
          900: '#0a0a0c',
          850: '#0f0f12',
          800: '#151518',
          750: '#1c1c20',
          700: '#26262b',
          600: '#343439',
        },
        // Electric-blue secondary from the brand sheet, for subtle accents.
        electric: '#296ece',
      },
      fontFamily: {
        // Body — Inter. Display — Space Grotesk for a confident, slightly
        // technical/sporty voice (the f1/landonorris reference), Inter as
        // graceful fallback so headings never go unstyled.
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Oversized display tier — the bold hierarchy the references are built on.
        'display-sm': ['2.75rem', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
        display: ['3.5rem', { lineHeight: '1.02', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-lg': ['4.5rem', { lineHeight: '0.98', letterSpacing: '-0.03em', fontWeight: '700' }],
      },
      letterSpacing: {
        tightish: '-0.011em',
        display: '-0.03em',
      },
      boxShadow: {
        // Subtle, single-layer elevation — no heavy drop shadows.
        card: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 1px 2px 0 rgba(0,0,0,0.4)',
        pop: '0 12px 40px -12px rgba(0,0,0,0.6)',
        // Signature Upside-Purple glow for the moments that matter (hero, CTA).
        glow: '0 0 0 1px rgba(104,6,201,0.22), 0 12px 50px -12px rgba(104,6,201,0.5)',
        'glow-sm': '0 6px 24px -8px rgba(104,6,201,0.45)',
      },
      backgroundImage: {
        // Reusable signature gradients — Upside Purple with an electric-blue cast.
        'mesh-brand':
          'radial-gradient(120% 120% at 15% -10%, rgba(104,6,201,0.22), transparent 55%), radial-gradient(100% 120% at 100% 0%, rgba(41,110,206,0.10), transparent 50%)',
        'spotlight-brand':
          'radial-gradient(120% 120% at 50% 0%, rgba(104,6,201,0.18), transparent 60%)',
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
        // In-view reveal with a touch more travel for scroll/stagger entrances.
        rise: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Skeleton / value-highlight sweep.
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        // Animated gradient borders / mesh drift.
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        // Calm breathing orb for the urge-pause interaction.
        breathe: {
          '0%, 100%': { transform: 'scale(0.92)', opacity: '0.55' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        // Subtle brand "alive" pulse for streak / synced chips.
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(104,6,201,0.0)' },
          '50%': { boxShadow: '0 0 0 5px rgba(104,6,201,0.1)' },
        },
        // SVG stroke draw-in for charts.
        draw: {
          '0%': { strokeDashoffset: 'var(--draw-length, 1000)' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
        pop: 'pop 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        rise: 'rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 2.2s linear infinite',
        'gradient-pan': 'gradient-pan 6s ease infinite',
        breathe: 'breathe 8s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2.8s ease-in-out infinite',
        draw: 'draw 1s ease-out forwards',
      },
    },
  },
  plugins: [],
}
