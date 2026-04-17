export const COLORS = {
  brand: {
    green: '#7c9885',
    greenDark: '#6b8574',
    greenLight: '#9db5a0',
    greenDeep: '#5e7768',
    gold: '#c9a86c',
    goldDark: '#b8975f',
    goldDeep: '#8a7340',
    dark: '#1f2a23',
  },
  whatsapp: {
    base: '#25D366',
    dark: '#128C7E',
  },
  neutral: {
    outlineBorder: '#e7e5e4',
    outlineText: '#78716c',
    darkBg: '#f5f5f4',
    darkText: '#1c1917',
    mutedText: '#44403c',
  },
} as const;

export const EASING = {
  refined: 'cubic-bezier(0.22, 1, 0.36, 1)',
} as const;

export const DURATION = {
  short: 300,
  medium: 500,
  long: 700,
  xlong: 1200,
  carousel: 1400,
} as const;

export const TIMING = {
  heroCarouselIntervalMs: 5000,
  formResetDelayMs: 3000,
  faqStaggerMs: 80,
  packageStaggerMs: 150,
} as const;
