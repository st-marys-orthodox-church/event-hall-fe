module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '4rem',
    },
    borderRadius: {
      none: '0',
      sm: '2px',
      DEFAULT: '2px',
      md: '3px',
      lg: '4px',
      xl: '6px',
      '2xl': '8px',
      '3xl': '12px',
      full: '9999px',
    },
    extend: {
      colors: {
        brand: {
          green: '#7c9885',
          'green-dark': '#6b8574',
          'green-light': '#9db5a0',
          gold: '#c9a86c',
          'gold-dark': '#b8975f',
        },
        primary: {
          100: '#eef4f0',
          200: '#d4e4d8',
          300: '#b5d1bb',
          400: '#9db5a0',
          500: '#7c9885',
          600: '#6b8574',
          700: '#5a7263',
          800: '#4a5f52',
          900: '#3a4c41',
        },
        gray: {
          100: '#f7fafc',
          200: '#edf2f7',
          300: '#e2e8f0',
          400: '#cbd5e0',
          500: '#a0aec0',
          600: '#718096',
          700: '#4a5568',
          800: '#2d3748',
          900: '#1a202c',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Cormorant Garamond', 'Georgia', 'serif'],
      },
      lineHeight: {
        hero: '4.5rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 23, 23, 0.04), 0 2px 12px rgba(15, 23, 23, 0.05)',
        elevate: '0 10px 30px -12px rgba(15, 23, 23, 0.18)',
        luxe: '0 24px 50px -24px rgba(15, 23, 23, 0.28)',
        hairline: 'inset 0 -1px 0 rgba(15, 23, 23, 0.08)',
      },
      letterSpacing: {
        luxe: '0.12em',
      },
      transitionTimingFunction: {
        refined: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'sweep-in': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
        'sweep-in': 'sweep-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};
