# Design System Refinement — Design Spec

## Overview

MVP의 현재 블루 브랜드를 유지하면서 디자인 토큰(색상·타이포그래피·여백)을 먼저 정비한 뒤 각 페이지에 일관되게 적용하는 방향. 극적인 스타일 변경 없이 완성도와 일관성을 높이는 "Refined Current" 접근.

## Selected Direction

**A — 정제된 현재 스타일**: 기존 블루 브랜드(`#1E40AF`) 유지, typography/spacing/card 계층을 세밀하게 다듬음.

## Pain Points to Address

1. 타이포그래피 개성 없음 — 자간·줄간격 조정으로 계층 명확화
2. 카드 계층이 평평함 — 3단계 카드 무게감 도입
3. 컬러 시스템 일관성 부족 — 역할별 색상 체계 재정의
4. 여백과 리듬감 — 전 페이지 spacing 기준 통일
5. 버튼 텍스트 넘침 (분석 페이지) — 버튼 스타일 전반 점검

---

## 1. Design Token System

### 1-1. Color Tokens (`tailwind.config.ts`)

| Token | 현재 | 변경 후 | 비고 |
|---|---|---|---|
| `primary` | `#1E40AF` | `#1E40AF` | 유지 |
| `primary-hover` | — | `#1D3899` | 신규 |
| `success` | `#06B6D4` (cyan) | `#16A34A` | 그린으로 변경 |
| `system2` | `#06B6D4` (cyan) | `#0891B2` | 분리 유지 |
| `warning` | 핑크계열 | `#D97706` | 앰버로 변경 |
| `danger` | 로즈계열 | `#DC2626` | 레드로 명확화 |
| `background` | — | `#F8FAFC` | slate-50 |
| `background-secondary` | — | `#F1F5F9` | slate-100 |
| `background-tertiary` | — | `#E2E8F0` | slate-200 (border용) |
| `text-primary` | — | `#0F172A` | slate-950 |
| `text-secondary` | — | `#475569` | slate-600 |
| `text-tertiary` | — | `#94A3B8` | slate-400 |

### 1-2. Typography Scale

```
Display   : text-3xl (30px) / font-extrabold / tracking: -0.03em / leading-tight
Heading   : text-xl  (20px) / font-bold      / tracking: -0.02em / leading-snug
Subheading: text-base(16px) / font-semibold  / tracking: -0.01em
Body      : text-sm  (14px) / font-normal    / leading-relaxed (1.625)
Label     : text-xs  (12px) / font-semibold  / tracking-wide / uppercase
Caption   : text-xs  (12px) / font-normal    / text-text-tertiary
```

Tailwind config에 `letterSpacing` 커스텀 값 추가:
```js
letterSpacing: {
  tighter: '-0.03em',
  tight:   '-0.02em',
  snug:    '-0.01em',
}
```

### 1-3. Spacing Baseline

| 용도 | Tailwind class | px |
|---|---|---|
| 페이지 측면 여백 | `px-4` | 16 |
| 페이지 상단 여백 (헤더 아래) | `pt-6` | 24 |
| 섹션 간 간격 | `space-y-5` | 20 |
| 카드 내부 패딩 | `p-5` | 20 |
| 카드 내 요소 간격 | `space-y-3` | 12 |
| 인라인 아이콘 간격 | `gap-2` | 8 |

---

## 2. Card Hierarchy (3 Levels)

### Primary Card (중요 정보 — 홈 스탯, 분석 결과 주요 카드)
```
bg-white
rounded-2xl (16px)
shadow: 0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)
border: 없음
padding: p-5
```

### Secondary Card (일반 정보 — 일지 목록, 세부 항목)
```
bg-white
rounded-xl (12px)
border: 1.5px solid #E2E8F0
shadow: 0 1px 4px rgba(0,0,0,0.04)
padding: p-4
```

### Surface (배경 영역 — 설명 블록, 인용구, 보조 정보)
```
bg-slate-50 (#F8FAFC)
rounded-xl (12px)
border: 없음
shadow: 없음
padding: p-4
```

---

## 3. Typography Application

각 텍스트 역할별 클래스 조합:

```
페이지 제목      : text-xl font-bold text-text-primary tracking-tight
섹션 헤더        : text-base font-semibold text-text-primary
카드 소제목      : text-sm font-semibold text-text-primary
본문             : text-sm text-text-secondary leading-relaxed
레이블/태그      : text-xs font-semibold uppercase tracking-wide text-text-tertiary
캡션             : text-xs text-text-tertiary
수치 (강조)      : text-2xl font-extrabold text-text-primary tracking-tighter
```

---

## 4. Button Styles

### Primary Button
```
bg-primary text-white font-semibold
rounded-2xl
min-h-[44px] h-auto py-3 px-6
text-sm leading-snug
w-full (full-width 기본)
active:scale-95 transition-transform
disabled:opacity-50
```

### Secondary Button
```
bg-white text-primary font-semibold
border-2 border-primary
rounded-2xl
min-h-[44px] h-auto py-3 px-6
text-sm leading-snug
```

### Ghost Button (텍스트 링크형)
```
text-primary font-semibold text-sm
underline-offset-2 hover:underline
```

**버튼 텍스트 넘침 수정 포인트 (`analyze/[id]/page.tsx`)**:
- 긴 텍스트 버튼에 `whitespace-normal text-center` 추가
- `py-3 min-h-[44px] h-auto` 적용으로 내용에 따라 높이 자동 확장
- `text-sm` 고정으로 크기 통일

---

## 5. Pages to Update

변경이 필요한 파일 (토큰 변경 후 cascading):

| 파일 | 주요 변경 |
|---|---|
| `tailwind.config.ts` | 색상·letterSpacing 토큰 재정의 |
| `app/dashboard/page.tsx` | 카드 계층, 타이포그래피, 여백 |
| `app/analyze/[id]/page.tsx` | 버튼 fix + 카드 계층 + 타이포 |
| `app/journal/page.tsx` | 카드 계층, 여백 통일 |
| `app/journal/[id]/page.tsx` | 타이포그래피, 여백 |
| `app/visualize/[id]/page.tsx` | 카드, 색상 토큰 |
| `app/profile/page.tsx` | 타이포, 여백 |
| `app/auth/login/page.tsx` | 버튼, 인풋 스타일 |
| `app/auth/signup/page.tsx` | 버튼, 인풋 스타일 |
| `app/(landing)/page.tsx` | 타이포 강화, 버튼 |
| `components/ui/BottomNav.tsx` | active 색상 토큰 참조 |

---

## Implementation Strategy

1. **Step 1**: `tailwind.config.ts` 토큰 재정의 → 빌드 확인
2. **Step 2**: `analyze/[id]/page.tsx` 버튼 fix (즉시 가시적 버그 해결)
3. **Step 3**: `dashboard/page.tsx` — 홈 화면 카드 계층 + 타이포
4. **Step 4**: `journal/` 관련 파일 — 목록/상세 카드 + 타이포
5. **Step 5**: 나머지 페이지 (visualize, profile, auth, landing) 순차 적용

각 Step은 독립적으로 커밋 가능.
