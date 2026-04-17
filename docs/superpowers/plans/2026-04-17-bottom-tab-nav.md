# Bottom Tab Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 하단탭 바(홈 / 기록 FAB / 인사이트)를 추가하고, 플로팅 Manual 버튼을 제거하며, 매뉴얼 링크를 헤더로 이동한다.

**Architecture:** `BottomTabBar` 클라이언트 컴포넌트를 `app/layout.tsx`에 전역 삽입하고, `usePathname()`으로 `/dashboard`와 `/insights`에서만 렌더링. 대시보드 헤더에서 인사이트 버튼 제거(탭으로 이동), 인사이트 페이지 헤더를 대시보드 스타일과 통일.

**Tech Stack:** Next.js 16 App Router, lucide-react(이미 설치), Tailwind CSS

---

## File Map

| 파일 | 변경 |
|------|------|
| `components/ui/BottomTabBar.tsx` | 신규 생성 |
| `app/layout.tsx` | 플로팅 버튼 제거 + BottomTabBar 추가 |
| `app/dashboard/page.tsx` | 헤더에서 인사이트 버튼 제거 + 하단 여백 추가 |
| `app/insights/page.tsx` | 헤더 전면 교체(타이틀+매뉴얼+로그아웃) + 하단 여백 추가 |

---

## Task 1: BottomTabBar 컴포넌트 생성

**Files:**
- Create: `components/ui/BottomTabBar.tsx`

- [ ] **Step 1: 컴포넌트 파일 생성**

`components/ui/BottomTabBar.tsx`를 아래 내용으로 생성:

```typescript
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { BarChart2, Home, PenLine } from 'lucide-react';

const SHOW_ON = ['/dashboard', '/insights'];

export default function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();

  if (!SHOW_ON.includes(pathname)) return null;

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-background-tertiary pb-safe-bottom">
      <div className="flex items-center h-16 max-w-lg mx-auto px-8">

        {/* 홈 탭 */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex-1 flex flex-col items-center gap-0.5 pt-2 touch-manipulation"
        >
          <Home size={22} className={isActive('/dashboard') ? 'text-primary' : 'text-text-tertiary'} />
          <span className={`text-[11px] ${isActive('/dashboard') ? 'text-primary font-semibold' : 'text-text-tertiary'}`}>
            홈
          </span>
          {isActive('/dashboard') && <div className="w-1 h-1 bg-primary rounded-full mt-0.5" />}
        </button>

        {/* FAB — 기록 */}
        <div className="flex-1 flex flex-col items-center relative">
          <button
            onClick={() => router.push('/log')}
            className="absolute -top-7 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform touch-manipulation"
            aria-label="새 기록 시작"
          >
            <PenLine size={24} className="text-white" />
          </button>
          <span className="text-[11px] text-text-tertiary mt-6">기록</span>
        </div>

        {/* 인사이트 탭 */}
        <button
          onClick={() => router.push('/insights')}
          className="flex-1 flex flex-col items-center gap-0.5 pt-2 touch-manipulation"
        >
          <BarChart2 size={22} className={isActive('/insights') ? 'text-primary' : 'text-text-tertiary'} />
          <span className={`text-[11px] ${isActive('/insights') ? 'text-primary font-semibold' : 'text-text-tertiary'}`}>
            인사이트
          </span>
          {isActive('/insights') && <div className="w-1 h-1 bg-primary rounded-full mt-0.5" />}
        </button>

      </div>
    </nav>
  );
}
```

- [ ] **Step 2: 타입 체크**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npm run lint
```

Expected: 에러 없음.

- [ ] **Step 3: Commit**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && git add components/ui/BottomTabBar.tsx && git commit -m "feat(ui): add BottomTabBar component with FAB"
```

---

## Task 2: layout.tsx — 플로팅 버튼 제거 + BottomTabBar 삽입

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: layout.tsx 읽기**

`app/layout.tsx`를 읽어 현재 내용 확인. 플로팅 버튼은 아래 코드임:

```typescript
        <Link
          href="/manual"
          className="fixed bottom-6 right-6 z-50 bg-primary text-white text-sm font-medium px-4 py-3 rounded-full shadow-lg hover:bg-primary-dark transition-colors"
          aria-label="Bluebird Technical Manual 열기"
        >
          Manual
        </Link>
```

- [ ] **Step 2: 플로팅 버튼 제거 + BottomTabBar 추가**

`app/layout.tsx`에서:

1. `import Link from 'next/link';` 줄 **제거** (Link를 더 이상 사용하지 않음)
2. `import Script from 'next/script';` 아래에 추가:
```typescript
import BottomTabBar from '@/components/ui/BottomTabBar';
```

3. `<body>` 안의 플로팅 `<Link href="/manual" ...>Manual</Link>` 블록 전체 **제거**

4. `{children}` 아래에 추가:
```typescript
        <BottomTabBar />
```

최종 `<body>` 내부 구조:
```typescript
      <body className="antialiased" suppressHydrationWarning>
        <Script id="disable-sw-in-local-dev" strategy="afterInteractive">
          {`...`}
        </Script>
        {children}
        <BottomTabBar />
      </body>
```

- [ ] **Step 3: 타입 체크**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npm run lint
```

Expected: 에러 없음.

- [ ] **Step 4: Commit**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && git add app/layout.tsx && git commit -m "feat(ui): wire BottomTabBar into layout, remove floating Manual button"
```

---

## Task 3: dashboard/page.tsx — 헤더 정리 + 하단 여백

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: 헤더에서 인사이트 버튼 제거**

`app/dashboard/page.tsx`에서 아래 버튼 블록 전체 **제거**:

```typescript
            <button
              onClick={() => router.push('/insights')}
              className="text-sm text-primary hover:underline transition-colors"
            >
              인사이트
            </button>
```

결과적으로 헤더 우측은 `Manual | 로그아웃` 만 남음.

- [ ] **Step 2: 페이지 하단 여백 추가**

탭바(고정 높이 64px)에 콘텐츠가 가려지지 않도록 메인 콘텐츠 영역에 하단 패딩 추가.

`app/dashboard/page.tsx`에서 메인 콘텐츠 div:

기존:
```typescript
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
```

교체:
```typescript
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24">
```

- [ ] **Step 3: 타입 체크**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npm run lint
```

Expected: 에러 없음.

- [ ] **Step 4: Commit**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && git add app/dashboard/page.tsx && git commit -m "feat(ui): remove insights header button (moved to tab bar), add bottom padding"
```

---

## Task 4: insights/page.tsx — 헤더 전면 교체 + 하단 여백

**Files:**
- Modify: `app/insights/page.tsx`

- [ ] **Step 1: 필요한 import 추가**

`app/insights/page.tsx` 상단 import 섹션에 추가:

```typescript
import { supabase } from '@/lib/supabase/client';
```

이미 있으면 skip. 그리고 `useRouter`가 이미 import되어 있는지 확인 — 있으면 skip, 없으면 추가.

- [ ] **Step 2: logout 핸들러 추가**

`InsightsPage` 컴포넌트 내부, `useEffect` 위에 추가:

```typescript
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };
```

- [ ] **Step 3: 헤더 교체**

기존 헤더:
```typescript
      <header className="bg-white border-b border-background-tertiary px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-4">
        <button onClick={() => router.push('/dashboard')} className="text-primary font-semibold">
          ← 대시보드
        </button>
        <h1 className="text-lg font-bold text-text-primary">인사이트</h1>
      </header>
```

교체:
```typescript
      <header className="bg-white border-b border-background-tertiary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">Project Bluebird</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/manual')}
              className="text-sm text-text-secondary hover:underline transition-colors"
            >
              Manual
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-text-secondary hover:text-primary transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>
```

- [ ] **Step 4: 하단 여백 추가**

인사이트 페이지 콘텐츠 div:

기존:
```typescript
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
```

교체:
```typescript
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 space-y-6">
```

- [ ] **Step 5: 타입 체크**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npm run lint
```

Expected: 에러 없음.

- [ ] **Step 6: 최종 빌드 확인**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npm run build
```

Expected: 빌드 성공.

- [ ] **Step 7: Commit**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && git add app/insights/page.tsx && git commit -m "feat(ui): unify insights page header with dashboard, add bottom padding"
```
