import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#5B3DF5',
        secondary: '#7C5CFF',
        accent: '#A78BFA',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        background: '#FAFBFF',
        card: '#FFFFFF',
      },
      boxShadow: {
        soft: '0 24px 80px rgba(91, 61, 245, 0.12)',
        glow: '0 0 35px rgba(124, 92, 255, 0.16)',
      },
      borderRadius: {
        xl: '20px',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-glass': 'radial-gradient(circle at top left, rgba(123, 82, 255, 0.22), transparent 35%), radial-gradient(circle at bottom right, rgba(91, 61, 245, 0.14), transparent 30%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
