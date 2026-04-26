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
          // 주 액센트 — 모든 강조·CTA·active state. 다른 액센트 색은 절제.
          DEFAULT: '#1E40AF', // Electric Cobalt Blue
          dark: '#1E3A8A',
          light: '#3B82F6',
        },
        // /our-philosophy 페이지의 의도된 액센트.
        // "시스템 2의 가치"를 설명하는 페이지에 그 이름의 색을 일관되게 적용.
        // 다른 페이지에서 사용 금지 — 액센트 dilution 방지.
        system2: {
          DEFAULT: '#0891B2', // Lucid Cyan
          dark: '#0E7490',
          light: '#22D3EE',
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
        // Pretendard 우선 — 한·영 본문/헤딩 통합. 시스템 폰트는 fallback.
        sans: [
          'Pretendard Variable',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // 절제된 elevation 토큰 — refined minimalism.
      // 임의 박힌 shadow-[0_4px_16px_...] 류 대신 이 둘 중 하나를 사용한다.
      // shadow-card: 일반 카드용. 부드러운 두 겹 그림자.
      // shadow-elev2: 떠올라야 할 요소(FAB, 모달, sticky bar)용.
      boxShadow: {
        card: '0 2px 8px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.06)',
        elev2: '0 8px 24px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
