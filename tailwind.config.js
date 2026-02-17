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
    extend: {
      colors: {
        brand: {
          green: '#7c9885',
          'green-dark': '#6b8574',
          'green-light': '#9db5a0',
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
      lineHeight: {
        hero: '4.5rem',
      },
    },
  },
  plugins: [],
};
