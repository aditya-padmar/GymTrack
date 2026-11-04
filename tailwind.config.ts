import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#101310',
        panel: '#171b18',
        lime: '#c8f53a',
        muted: '#8b968e',
        line: '#29322d',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(200,245,58,.18), 0 16px 40px rgba(0,0,0,.18)',
      },
    },
  },
  plugins: [],
} satisfies Config;
