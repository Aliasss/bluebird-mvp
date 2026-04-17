# 하단탭 네비게이션 설계 문서

**날짜**: 2026-04-17  
**범위**: 하단탭 바 신설 + 플로팅 Manual 버튼 제거 + 헤더 매뉴얼 링크 추가

---

## 목표

- 모바일 앱에서 익숙한 하단탭 UX 제공
- 우측 하단 플로팅 Manual 버튼 제거 (거슬리는 요소 삭제)
- 매뉴얼 링크를 헤더 우측으로 이동
- 기록 시작을 FAB으로 강조해 핵심 액션 가시성 향상

---

## 탭 구성

| 탭 | 아이콘 | 경로 | 비고 |
|----|--------|------|------|
| 홈 | `Home` (lucide) | `/dashboard` | 좌측 탭 |
| 기록 | `PenLine` (lucide) | `/log` | 가운데 FAB — 크고 강조된 원형 버튼 |
| 인사이트 | `BarChart2` (lucide) | `/insights` | 우측 탭 |

---

## 탭바 표시 범위

**표시하는 페이지**: `/dashboard`, `/insights`  
**표시하지 않는 페이지**: `/log`, `/analyze/[id]`, `/visualize/[id]`, `/action/[id]`, `/manual`, `/auth/*`, `/`

로그 입력 → 분석 → 시각화 → 행동은 단계별 플로우이므로 탭바 없이 기존 PageHeader만 유지.

---

## 컴포넌트 설계

### `components/ui/BottomTabBar.tsx`

- `'use client'` 컴포넌트
- `usePathname()`으로 현재 경로를 파악해 active 탭 결정
- 일반 탭 (홈, 인사이트): 아이콘 + 레이블 + active 시 파란 dot 인디케이터
- FAB (기록): `w-14 h-14` 원형 파란 버튼, `shadow-lg`, 탭바 위로 `−24px` 올라옴
- `safe-area-inset-bottom` 적용으로 iPhone 홈 인디케이터 영역 보호

```
┌─────────────────────────────┐
│  🏠        ✏️(FAB)      📊  │  ← 탭바
│  홈        기록         인사이트│
└─────────────────────────────┘
```

**Active 상태 스타일**:
- 아이콘 색상: `text-primary` (#1E40AF)
- 레이블 색상: `text-primary`, `font-semibold`
- 파란 dot: `w-1 h-1 bg-primary rounded-full mx-auto mt-1`

**Inactive 상태 스타일**:
- 아이콘/레이블: `text-text-tertiary`

---

## 레이아웃 변경

### `app/layout.tsx`
- 기존 플로팅 Manual 버튼(`fixed bottom-6 right-6`) **제거**
- `<BottomTabBar />` 추가 — 단, 탭바 표시 여부는 컴포넌트 내부에서 pathname으로 판단

### `app/dashboard/page.tsx` — 헤더 변경
기존: `인사이트 | Manual | 로그아웃`  
변경: `매뉴얼 | 로그아웃`  
(인사이트 버튼 제거 — 탭바로 이동)

### `app/insights/page.tsx` — 헤더 변경
기존: `← 대시보드` 뒤로가기 헤더  
변경: 탭바가 홈 이동을 담당하므로 뒤로가기 버튼 **제거**. 대신 대시보드와 동일한 헤더 구조 사용  
→ `Project Bluebird` 타이틀 (좌측) + `매뉴얼 | 로그아웃` (우측)

### 페이지 하단 여백
탭바가 표시되는 페이지(`/dashboard`, `/insights`)는 탭바 높이(약 64px)만큼 `pb-20` 추가 필요.

---

## 변경 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `components/ui/BottomTabBar.tsx` | 신규 생성 |
| `app/layout.tsx` | 플로팅 버튼 제거, BottomTabBar 추가 |
| `app/dashboard/page.tsx` | 헤더에서 인사이트 버튼 제거, 매뉴얼 링크 유지 |
| `app/insights/page.tsx` | 헤더를 타이틀+매뉴얼+로그아웃 구조로 변경, 하단 여백 추가 |

---

## 범위 외

- `/manual` 페이지 자체 내비게이션 변경 없음 (기존 "대시보드로 돌아가기" 유지)
- 탭 아이콘 커스터마이징 (lucide 아이콘 사용으로 고정)
- 탭 추가/삭제 기능
