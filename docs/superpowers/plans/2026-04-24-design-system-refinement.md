# Design System Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Design token을 먼저 정비하고(색상·타이포그래피·여백), 각 페이지에 3단계 카드 계층과 일관된 타이포그래피를 적용해 MVP 완성도를 높인다.

**Architecture:** `tailwind.config.ts`에서 색상·letterSpacing 토큰을 재정의하면 전체 Tailwind 클래스가 자동으로 업데이트된다. 이후 페이지별로 카드 스타일(`border`/`shadow` 조합)과 텍스트 클래스를 수정한다. 로직 변경 없이 클래스명만 바꾸는 작업이므로 각 Task는 독립적으로 커밋 가능하다.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS v3, TypeScript — 검증은 `npx tsc --noEmit`로 타입 오류 확인, 시각적 검증은 `npm run dev` 후 브라우저로 직접 확인.

---

## File Map

| 파일 | 변경 유형 | 설명 |
|---|---|---|
| `tailwind.config.ts` | Modify | 색상 토큰 + letterSpacing 추가 |
| `app/analyze/[id]/page.tsx` | Modify | 버튼 overflow fix + 카드 계층 + 타이포 |
| `app/dashboard/page.tsx` | Modify | 카드 계층 + 타이포그래피 |
| `app/journal/page.tsx` | Modify | 카드 계층 + 타이포 |
| `app/page.tsx` | Modify | 랜딩 타이포그래피 |
| `app/auth/login/page.tsx` | Modify | 버튼·인풋 스타일 통일 |
| `app/auth/signup/page.tsx` | Modify | 버튼·인풋 스타일 통일 |
| `app/me/page.tsx` | Modify | 스탯 카드 계층 |

---

## Task 1: Tailwind Config — Color Tokens + LetterSpacing

**Files:**
- Modify: `tailwind.config.ts`

배경: 현재 `success`와 `system2`가 같은 cyan(`#06B6D4`), `warning`과 `danger`가 같은 핑크 계열. 역할별 색상을 분리한다. `letterSpacing`은 타이포그래피 스케일에서 자간 조정에 쓸 커스텀 값.

- [ ] **Step 1: tailwind.config.ts 열기**

현재 파일 내용을 확인하고 변경할 부분을 파악한다 (`success.DEFAULT: '#06B6D4'`, `warning.DEFAULT: '#F43F5E'` 등).

- [ ] **Step 2: 색상 토큰 업데이트**

`tailwind.config.ts`를 다음으로 교체:

```typescript
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
          DEFAULT: '#0891B2', // Lucid Cyan (분리됨)
          dark: '#0E7490',
          light: '#22D3EE',
        },
        distortion: {
          DEFAULT: '#E11D48',
          dark: '#9F1239',
          light: '#F43F5E',
        },
        success: {
          DEFAULT: '#16A34A', // Green-600 — 완료/성공 (기존 cyan에서 변경)
          dark: '#15803D',
          light: '#4ADE80',
        },
        warning: {
          DEFAULT: '#D97706', // Amber-600 — 경고/중간 (기존 핑크에서 변경)
          dark: '#B45309',
          light: '#FCD34D',
        },
        danger: {
          DEFAULT: '#DC2626', // Red-600 — 위험/오류 (기존 로즈에서 변경)
          dark: '#B91C1C',
          light: '#F87171',
        },
        background: {
          DEFAULT: '#F8FAFC',
          secondary: '#F1F5F9',
          tertiary: '#E2E8F0', // Slate-200 (기존 #CBD5E1 Slate-300에서 밝게)
        },
        text: {
          primary: '#0F172A',   // Slate-950
          secondary: '#475569', // Slate-600 (기존 #334155 Slate-700에서 밝게)
          tertiary: '#94A3B8',  // Slate-400 (기존 #64748B Slate-500에서 밝게)
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
```

- [ ] **Step 3: TypeScript 타입 확인**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npx tsc --noEmit
```

Expected: 오류 없음 (Tailwind config는 타입 검사 범위 밖이므로 앱 코드 오류만 확인).

- [ ] **Step 4: 시각적 변화 확인**

```bash
npm run dev
```

브라우저에서 `/dashboard` 열기 → success 색(체크인 완료 표시)이 cyan→green으로, 자율성 지수 progress bar의 warning이 분홍→amber로 바뀐 것 확인.

- [ ] **Step 5: Commit**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp
git add tailwind.config.ts
git commit -m "design: update color tokens — success green, warning amber, danger red"
```

---

## Task 2: Analyze Page — Button Overflow Fix + Card Hierarchy + Typography

**Files:**
- Modify: `app/analyze/[id]/page.tsx`

배경: "답변 저장 후 시각화 보기" 버튼 텍스트가 두 줄로 넘침. 주요 카드들이 border만 있고 shadow가 없어 평평해 보임. 이론 기반 해석 sub-box들을 Surface 스타일로 변경.

- [ ] **Step 1: 버튼 overflow 수정**

`app/analyze/[id]/page.tsx`에서 질문 섹션 버튼 블록(약 561-587번줄)을 찾는다:

```tsx
<div className="flex gap-3">
  <button
    onClick={goPrevQuestion}
    disabled={savingAnswers || currentQuestion === 0}
    className="flex-1 bg-white border border-background-tertiary text-text-primary font-semibold py-3 rounded-xl disabled:opacity-50"
  >
    이전 질문
  </button>

  {currentQuestion < questions.length - 1 ? (
    <button
      onClick={goNextQuestion}
      disabled={savingAnswers}
      className="flex-1 bg-primary text-white font-semibold py-3 rounded-xl disabled:opacity-50"
    >
      다음 질문
    </button>
  ) : (
    <button
      onClick={handleSaveAnswers}
      disabled={savingAnswers}
      className="flex-1 bg-primary text-white font-semibold py-3 rounded-xl disabled:opacity-50"
    >
      {savingAnswers ? '저장 중...' : '답변 저장 후 시각화 보기'}
    </button>
  )}
</div>
```

다음으로 교체:

```tsx
<div className="flex gap-3">
  <button
    onClick={goPrevQuestion}
    disabled={savingAnswers || currentQuestion === 0}
    className="flex-1 bg-white border border-background-tertiary text-text-primary font-semibold min-h-[44px] h-auto py-3 px-3 rounded-xl text-sm leading-snug disabled:opacity-50"
  >
    이전 질문
  </button>

  {currentQuestion < questions.length - 1 ? (
    <button
      onClick={goNextQuestion}
      disabled={savingAnswers}
      className="flex-1 bg-primary text-white font-semibold min-h-[44px] h-auto py-3 px-3 rounded-xl text-sm leading-snug disabled:opacity-50"
    >
      다음 질문
    </button>
  ) : (
    <button
      onClick={handleSaveAnswers}
      disabled={savingAnswers}
      className="flex-1 bg-primary text-white font-semibold min-h-[44px] h-auto py-3 px-3 rounded-xl text-sm leading-snug text-center disabled:opacity-50"
    >
      {savingAnswers ? '저장 중...' : '답변 저장\n후 시각화 보기'}
    </button>
  )}
</div>
```

참고: `\n`은 JSX에서 동작하지 않으므로 아래처럼 `<br />`을 쓰거나 CSS `whitespace-pre-line`을 활용한다:

```tsx
className="flex-1 bg-primary text-white font-semibold min-h-[44px] h-auto py-3 px-3 rounded-xl text-sm leading-snug text-center whitespace-normal disabled:opacity-50"
```

텍스트는 `'답변 저장 후 시각화 보기'` 유지 — `whitespace-normal text-center`와 `min-h-[44px]`의 조합으로 두 줄이 되어도 레이아웃이 깨지지 않는다.

- [ ] **Step 2: 하단 액션 버튼 row 수정**

약 592-608번줄의 하단 버튼 섹션을 찾는다:

```tsx
<div className="flex justify-center gap-2 sm:gap-3">
  <button
    onClick={() => router.push(`/visualize/${params.id}`)}
    className="bg-white border border-background-tertiary text-text-secondary font-medium py-3 px-6 rounded-xl text-sm"
  >
    답변 없이 시각화 보기
  </button>
  <button
    onClick={() => router.push('/dashboard')}
    className="bg-primary text-white font-semibold py-3 px-8 rounded-xl"
  >
    대시보드로 돌아가기
  </button>
</div>
```

다음으로 교체 (flex-col로 변경해 모바일에서 버튼이 쌓이도록):

```tsx
<div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
  <button
    onClick={() => router.push('/dashboard')}
    className="w-full bg-primary text-white font-semibold min-h-[44px] py-3 px-6 rounded-2xl text-sm"
  >
    대시보드로 돌아가기
  </button>
  <button
    onClick={() => router.push(`/visualize/${params.id}`)}
    className="w-full bg-white border border-background-tertiary text-text-secondary font-medium min-h-[44px] py-3 px-6 rounded-2xl text-sm"
  >
    답변 없이 시각화 보기
  </button>
</div>
```

- [ ] **Step 3: 주요 카드 → Primary 카드 스타일 적용**

`app/analyze/[id]/page.tsx`에는 다음 class를 가진 main section 래퍼 div가 4개 있다 (AI 분석 결과, 이론 기반 해석, 발견된 생각의 패턴, 생각을 점검하는 질문):

```
className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-background-tertiary shadow-none sm:shadow-sm"
```

각각을 수동으로 찾아 다음으로 교체 (border 제거, shadow 강화):

```
className="bg-white rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)]"
```

**주의:** 이 class string은 파일에 4번 등장하므로 모두 교체해야 한다. `replace_all`은 사용 불가 — 이 string은 main card와 distortion card에 동시에 존재하지 않으므로 안전하게 replace 4회 수행.

- [ ] **Step 4: 이론 기반 해석 sub-box → Surface 스타일**

약 407번줄부터의 `grid grid-cols-1 md:grid-cols-2` 안에 있는 sub-box 5개는 다음 class를 공유한다:

```
className="border border-background-tertiary rounded-xl p-4"
```

**주의:** 이 class string은 약 499번줄의 distortion 아이템 카드에도 동일하게 사용되므로 `replace_all` 절대 금지. grid 내부(이론 해석 섹션)의 것만 수동으로 5개 교체:

```
className="bg-background-secondary rounded-xl p-4"
```

- [ ] **Step 5: 왜곡 패턴 아이템 → Secondary 카드 스타일**

약 499번줄의 distortion 아이템 카드 (이전 Step에서 변경하지 않은 것들):

```
className="border border-background-tertiary rounded-xl p-4"
```

다음으로 교체:

```
className="bg-white border border-background-tertiary/80 rounded-xl p-4 shadow-sm"
```

- [ ] **Step 6: 타이포그래피 개선**

"AI 분석 결과" heading (약 395번줄):
```
className="text-xl md:text-2xl font-bold text-text-primary mb-3 sm:mb-4"
```
→
```
className="text-xl font-bold text-text-primary mb-3 tracking-tight"
```

"이론 기반 해석", "발견된 생각의 패턴", "생각을 점검하는 질문" heading들 (약 405, 493, 527번줄):
```
className="text-lg md:text-xl font-bold text-text-primary mb-3 sm:mb-4"
```
→
```
className="text-lg font-bold text-text-primary mb-4 tracking-tight"
```

- [ ] **Step 7: TypeScript 확인**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npx tsc --noEmit
```

Expected: 오류 없음.

- [ ] **Step 8: 시각적 검증**

`npm run dev` 후 `/analyze/<any-id>` 접속 → 버튼 텍스트 두 줄이 자연스럽게 표시되는지, 카드에 그림자가 생겼는지, 이론 해석 sub-box들이 회색 배경으로 바뀐지 확인.

- [ ] **Step 9: Commit**

```bash
git add app/analyze/\[id\]/page.tsx
git commit -m "design: fix analyze page button overflow and apply card hierarchy"
```

---

## Task 3: Dashboard — Card Hierarchy + Typography

**Files:**
- Modify: `app/dashboard/page.tsx`

배경: 스트릭/자율성 stat 카드들이 전부 같은 `border border-background-tertiary` 스타일. Primary 카드(shadow, no border)로 격상해 중요도를 시각화한다.

- [ ] **Step 1: 인사말 타이포그래피 개선**

약 204번줄의 greeting heading:

```tsx
<p className="text-xl font-bold text-text-primary">
  안녕하세요, {greeting?.name} 항해사님 🧭
</p>
```

→

```tsx
<p className="text-xl font-bold text-text-primary tracking-tight">
  안녕하세요, {greeting?.name} 항해사님 🧭
</p>
```

- [ ] **Step 2: Stat 카드 → Primary 카드 스타일**

약 260번줄의 스트릭 카드:

```tsx
<div className="bg-white rounded-2xl p-4 border border-background-tertiary">
```
→
```tsx
<div className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)]">
```

약 267번줄의 자율성 지수 카드도 동일하게:

```tsx
<div className="bg-white rounded-2xl p-4 border border-background-tertiary">
```
→
```tsx
<div className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)]">
```

- [ ] **Step 3: 체크인 카드 → Secondary 카드 스타일**

약 211번줄의 체크인 카드:

```tsx
<div className="bg-white rounded-2xl p-4 border border-background-tertiary">
```
→
```tsx
<div className="bg-white rounded-2xl p-4 border border-background-tertiary shadow-sm">
```

- [ ] **Step 4: 체크인 item 카드 — success 색상 확인**

약 230번줄의 체크인 morning/evening 아이템. `border-success`, `bg-success` 클래스는 이미 토큰 변경으로 green이 됨. 추가 수정 불필요.

- [ ] **Step 5: 성공 순간 섹션 카드 → Secondary 스타일**

약 290번줄의 성공 로그 section wrapper:

```tsx
<div className="bg-white rounded-2xl p-4 border border-success border-opacity-40">
```
→
```tsx
<div className="bg-white rounded-2xl p-4 border border-success/30 shadow-sm">
```

약 294번줄의 각 success log 아이템:

```tsx
<div key={log.id} className="border border-success border-opacity-20 bg-success bg-opacity-5 rounded-xl p-3">
```
→
```tsx
<div key={log.id} className="bg-success/5 border border-success/20 rounded-xl p-3">
```

- [ ] **Step 6: 스탯 수치 타이포그래피**

약 263번줄의 스트릭 수치:

```tsx
<p className="text-2xl font-bold text-primary">{streak.current}일 🔥</p>
```
→
```tsx
<p className="text-2xl font-extrabold text-primary tracking-tight">{streak.current}일 🔥</p>
```

약 270번줄의 자율성 지수 수치:

```tsx
<p className="text-xl font-bold text-warning">{autonomyScore}점</p>
```
→
```tsx
<p className="text-xl font-extrabold text-warning tracking-tight">{autonomyScore}점</p>
```

- [ ] **Step 7: TypeScript 확인**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npx tsc --noEmit
```

- [ ] **Step 8: 시각적 검증**

`/dashboard` 에서 stat 카드에 그림자가 생겼는지, success(체크인/성공 로그)가 green으로 바뀌었는지 확인.

- [ ] **Step 9: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "design: apply card hierarchy and typography to dashboard"
```

---

## Task 4: Journal Page — Card Hierarchy + Typography

**Files:**
- Modify: `app/journal/page.tsx`

배경: 로그 카드와 행동 카드가 모두 동일한 border 스타일. Secondary 카드 스타일(border + shadow-sm)로 통일하고, 완료 상태 색상이 새 success(green)으로 자동 반영되는지 확인.

- [ ] **Step 1: 로그 아이템 카드 → Secondary 스타일**

약 123번줄의 log item div:

```tsx
className="bg-white border border-background-tertiary rounded-xl p-4 hover:border-primary transition-colors cursor-pointer"
```
→
```tsx
className="bg-white border border-background-tertiary/80 rounded-xl p-4 shadow-sm hover:border-primary hover:shadow-md transition-all cursor-pointer"
```

- [ ] **Step 2: 행동 계획 아이템 카드 → Secondary 스타일**

약 158번줄의 action item div:

```tsx
className="bg-white border border-background-tertiary rounded-xl p-4 hover:border-primary transition-colors cursor-pointer"
```
→
```tsx
className="bg-white border border-background-tertiary/80 rounded-xl p-4 shadow-sm hover:border-primary hover:shadow-md transition-all cursor-pointer"
```

- [ ] **Step 3: 더보기 버튼 스타일 통일**

약 136번줄의 "더보기" 버튼:

```tsx
className="w-full py-2 text-sm text-primary font-semibold border border-primary border-opacity-30 rounded-xl"
```
→
```tsx
className="w-full py-2.5 text-sm text-primary font-semibold border border-primary/30 rounded-xl hover:bg-primary/5 transition-colors"
```

행동 계획 탭의 더보기 버튼(약 184번줄)도 동일하게 수정.

- [ ] **Step 4: 헤더 타이포그래피**

약 81번줄:

```tsx
<h1 className="text-lg font-bold text-text-primary">항해 일지</h1>
```
→
```tsx
<h1 className="text-lg font-bold text-text-primary tracking-tight">항해 일지</h1>
```

- [ ] **Step 5: 완료/진행 중 색상 확인**

약 167번줄의 `text-success` / `text-warning` 클래스는 토큰 변경으로 자동으로 green/amber가 됨. 추가 수정 불필요.

- [ ] **Step 6: TypeScript 확인 및 Commit**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npx tsc --noEmit
git add app/journal/page.tsx
git commit -m "design: apply card hierarchy and typography to journal page"
```

---

## Task 5: Landing Page — Typography Improvement

**Files:**
- Modify: `app/page.tsx`

배경: 메인 헤딩에 자간 조정을 추가해 임팩트를 높이고, 시나리오 박스를 Secondary 카드 스타일로 통일.

- [ ] **Step 1: 메인 헤딩 자간 + 크기 조정**

약 15번줄:

```tsx
<h1 className="text-4xl font-bold text-primary">Project Bluebird</h1>
```
→
```tsx
<h1 className="text-4xl font-extrabold text-primary tracking-tighter">Project Bluebird</h1>
```

약 16번줄의 subheading:

```tsx
<p className="text-xl font-semibold text-text-primary leading-snug">
```
→
```tsx
<p className="text-xl font-semibold text-text-primary leading-snug tracking-tight">
```

- [ ] **Step 2: 시나리오 예시 박스 → Secondary 카드 스타일**

약 25번줄:

```tsx
<div className="bg-white border border-background-tertiary rounded-2xl p-6 text-left space-y-4">
```
→
```tsx
<div className="bg-white border border-background-tertiary rounded-2xl p-6 text-left space-y-4 shadow-sm">
```

- [ ] **Step 3: CTA 버튼 스타일 통일**

약 57번줄의 "나의 항해 시작하기" 버튼은 이미 올바른 스타일. 확인만 한다.

약 62번줄의 "이미 계정이 있어요" 버튼:

```tsx
className="w-full bg-white border border-background-tertiary text-text-secondary font-medium py-3 px-6 rounded-2xl touch-manipulation active:scale-95 transition-transform"
```

이미 적절한 스타일. 변경 불필요.

- [ ] **Step 4: TypeScript 확인 및 Commit**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npx tsc --noEmit
git add app/page.tsx
git commit -m "design: improve landing page typography with letter-spacing"
```

---

## Task 6: Auth Pages — Button + Input Style Unification

**Files:**
- Modify: `app/auth/login/page.tsx`
- Modify: `app/auth/signup/page.tsx`

배경: 로그인/회원가입 폼의 버튼과 인풋 스타일을 디자인 토큰에 맞게 통일. 특히 인풋의 포커스 링 색상(primary)과 버튼 `min-h-[44px]` 적용.

- [ ] **Step 1: login/page.tsx — 인풋 스타일 확인**

`app/auth/login/page.tsx`를 열어 인풋 필드의 클래스명을 확인한다.

기존 패턴 (있다면):
```tsx
className="w-full px-4 py-3 rounded-xl border border-background-tertiary bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
```

이 스타일은 이미 적절하다. `border-background-tertiary`가 이제 `#E2E8F0`으로 밝아진 것도 토큰으로 자동 반영됨.

- [ ] **Step 2: login/page.tsx — 버튼에 min-h 추가**

로그인 버튼을 찾아 `min-h-[44px]` 추가:

```tsx
className="w-full bg-primary text-white font-semibold py-4 px-6 rounded-2xl touch-manipulation active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
```
→
```tsx
className="w-full bg-primary text-white font-semibold min-h-[44px] py-4 px-6 rounded-2xl touch-manipulation active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
```

- [ ] **Step 3: signup/page.tsx — 버튼에 min-h 추가**

`app/auth/signup/page.tsx`에서 회원가입 버튼 (약 179번줄):

```tsx
className="w-full bg-primary text-white font-semibold py-4 px-6 rounded-2xl touch-manipulation active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
```
→
```tsx
className="w-full bg-primary text-white font-semibold min-h-[44px] py-4 px-6 rounded-2xl touch-manipulation active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
```

- [ ] **Step 4: TypeScript 확인 및 Commit**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npx tsc --noEmit
git add app/auth/login/page.tsx app/auth/signup/page.tsx
git commit -m "design: unify auth page button and input styles"
```

---

## Task 7: Me Page — Stat Card Hierarchy

**Files:**
- Modify: `app/me/page.tsx`

배경: 프로필 페이지의 스탯 카드들을 Primary 카드 스타일로 격상.

- [ ] **Step 1: 스탯 카드 3개 → Primary 카드 스타일**

`app/me/page.tsx` 약 95, 102, 109번줄에 3개의 stat 카드가 있다:

```tsx
<div className="bg-white rounded-2xl p-4 border border-background-tertiary text-center">
```

3개 모두 교체:

```tsx
<div className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] text-center">
```

- [ ] **Step 2: 프로필 카드 → Secondary 스타일**

약 79번줄의 프로필 카드:

```tsx
<div className="bg-white rounded-2xl p-5 border border-background-tertiary">
```
→
```tsx
<div className="bg-white rounded-2xl p-5 border border-background-tertiary shadow-sm">
```

- [ ] **Step 3: 등급 카드 테두리 색 업데이트**

약 122번줄의 rank card:

```tsx
<div className="bg-white rounded-2xl p-4 border border-warning border-opacity-40">
```
→
```tsx
<div className="bg-white rounded-2xl p-4 border border-warning/30 shadow-sm">
```

- [ ] **Step 4: 프로필 헤더 타이포그래피**

약 85번줄의 유저 이름:

```tsx
<p className="font-semibold text-text-primary">{name} 항해사님</p>
```
→
```tsx
<p className="font-semibold text-text-primary tracking-tight">{name} 항해사님</p>
```

- [ ] **Step 4: TypeScript 확인 및 Commit**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npx tsc --noEmit
git add app/me/page.tsx
git commit -m "design: apply card hierarchy and typography to me page"
```

---

## Task 8: Final Build Verification

**Files:** 없음 (검증만)

- [ ] **Step 1: Full TypeScript 검사**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 2: Production Build**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npm run build
```

Expected: `✓ Compiled successfully` — 빌드 오류 없음.

- [ ] **Step 3: 전체 페이지 시각적 순회**

`npm run dev` 후 다음 경로를 순서대로 확인:
1. `/` — landing: 헤딩 자간 강화, 시나리오 박스 shadow
2. `/auth/signup` — 버튼 최소 높이 44px
3. `/auth/login` — 동일
4. `/dashboard` — stat 카드 shadow, check-in success=green, warning=amber
5. `/journal` — 카드 shadow, 완료=green, 진행중=amber
6. `/analyze/<id>` — 버튼 overflow 해결, main 카드 shadow, sub-box surface 스타일

- [ ] **Step 4: git push**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && git push
```

---

## 빠른 참조

**Primary 카드 클래스:**
```
bg-white rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)]
```

**Secondary 카드 클래스:**
```
bg-white rounded-xl p-4 border border-background-tertiary/80 shadow-sm
```

**Surface 클래스:**
```
bg-background-secondary rounded-xl p-4
```

**버튼 기본 클래스:**
```
min-h-[44px] h-auto py-3 px-6 rounded-2xl text-sm font-semibold leading-snug
```
