import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6D28D9',
        secondary: '#8B5CF6',
        accent: '#C084FC',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        background: '#FCFCFD',
        'background-alt': '#F8FAFC',
        'surface': '#F4F6FB',
        card: 'rgba(255,255,255,0.75)',
        dark: '#09090B',
        'dark-2': '#111827',
        'dark-3': '#18181B',
        border: 'rgba(255,255,255,0.18)',
      },
      boxShadow: {
        soft: '0 20px 60px rgba(15, 23, 42, 0.08)',
        glow: '0 25px 70px rgba(109, 40, 217, 0.14)',
        glass: '0 20px 55px rgba(15, 23, 42, 0.06)',
      },
      borderRadius: {
        xl: '28px',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-glass': 'radial-gradient(circle at top left, rgba(109, 40, 217, 0.18), transparent 32%), radial-gradient(circle at bottom right, rgba(139, 92, 246, 0.14), transparent 28%)',
        'soft-glow': 'radial-gradient(circle at top, rgba(139, 92, 246, 0.12), transparent 38%), radial-gradient(circle at bottom, rgba(109, 40, 217, 0.08), transparent 45%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
