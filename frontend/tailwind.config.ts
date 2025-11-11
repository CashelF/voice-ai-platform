import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'sentiment-positive': '#22c55e',
        'sentiment-neutral': '#facc15',
        'sentiment-negative': '#ef4444'
      }
    }
  },
  plugins: []
} satisfies Config;
