import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        app: {
          bg: 'var(--bg-app)',
        },
        brand: {
          50: 'var(--brand-50)',
          100: 'var(--brand-100)',
          200: 'var(--brand-200)',
          300: 'var(--brand-300)',
          400: 'var(--brand-400)',
          500: 'var(--brand-500)',
          600: 'var(--brand-600)',
          700: 'var(--brand-700)',
          800: 'var(--brand-800)',
          900: 'var(--brand-900)',
        },
        priority: {
          high: {
            bg: 'var(--priority-high-bg)',
            text: 'var(--priority-high-text)',
          },
          medium: {
            bg: 'var(--priority-medium-bg)',
            text: 'var(--priority-medium-text)',
          },
          low: {
            bg: 'var(--priority-low-bg)',
            text: 'var(--priority-low-text)',
          },
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px 0 rgba(0,0,0,0.03)',
      },
    },
  },
  plugins: [],
}

export default config
