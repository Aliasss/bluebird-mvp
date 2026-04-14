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
          DEFAULT: '#06B6D4', // Lucid Cyan
          dark: '#0891B2',
          light: '#67E8F9',
        },
        distortion: {
          DEFAULT: '#E11D48', // Muted Terracotta 계열
          dark: '#9F1239',
          light: '#F43F5E',
        },
        success: {
          DEFAULT: '#06B6D4', // 자율성 지표/성공
          dark: '#0891B2',
          light: '#67E8F9',
        },
        warning: {
          DEFAULT: '#F43F5E',
          dark: '#E11D48',
          light: '#FDA4AF',
        },
        danger: {
          DEFAULT: '#E11D48',
          dark: '#9F1239',
          light: '#F43F5E',
        },
        background: {
          DEFAULT: '#F8FAFC', // Zinc 100
          secondary: '#F1F5F9', // Slate 100
          tertiary: '#CBD5E1', // Slate 300
        },
        text: {
          primary: '#0F172A', // Slate 900
          secondary: '#334155', // Slate 700
          tertiary: '#64748B', // Slate 500
        },
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
