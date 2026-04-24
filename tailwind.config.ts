import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Project Bluebird 브랜드 컬러 시스템 (Digital Stoicism)
        primary: {
          DEFAULT: '#1E40AF', // Electric Cobalt Blue
          dark: '#1E3A8A',
          light: '#3B82F6',
        },
        system2: {
          DEFAULT: '#0891B2', // Lucid Cyan
          dark: '#0E7490',
          light: '#22D3EE',
        },
        distortion: {
          DEFAULT: '#E11D48',
          dark: '#9F1239',
          light: '#F43F5E',
        },
        success: {
          DEFAULT: '#16A34A', // Green-600
          dark: '#15803D',
          light: '#4ADE80',
        },
        warning: {
          DEFAULT: '#D97706', // Amber-600
          dark: '#B45309',
          light: '#FCD34D',
        },
        danger: {
          DEFAULT: '#DC2626', // Red-600
          dark: '#B91C1C',
          light: '#F87171',
        },
        background: {
          DEFAULT: '#F8FAFC',
          secondary: '#F1F5F9',
          tertiary: '#E2E8F0', // Slate-200
        },
        text: {
          primary: '#0F172A',
          secondary: '#475569', // Slate-600
          tertiary: '#94A3B8', // Slate-400
        },
      },
      letterSpacing: {
        tighter: '-0.03em',
        tight: '-0.02em',
        snug: '-0.01em',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
    },
  },
  plugins: [],
};

export default config;
