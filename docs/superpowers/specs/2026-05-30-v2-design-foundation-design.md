# Spec — v2 디자인 시스템 적용 · Phase 0 (토대)

**문서 버전**: v1.1 (2026-05-30)
**상태**: 구현 착수 (스크린샷 9장 반영, 사용자 "디벨롭 + push" 승인 — CPO·CSO·CTO 합동)

> v1.1 갱신: 핸드오프에 `screenshots/01..09-*.png`(9화면 상단 캡처)이 추가되어 전부 검토함.
> 프리미티브 명세와 일치 확인. 추가 관찰 — `09-me`에서 ListRow들은 **흰 카드 + 1px divider**로
> 묶여 그룹을 이룬다. 이 카드 래핑·divider는 **화면 레벨 조합**(Phase 2)으로 처리하고,
> ListRow 프리미티브 자체는 투명 배경 단일 행으로 유지한다(YAGNI — 별도 ListGroup 부품 미생성).
**디자인 출처**: `docs/design/Project Bluebird Design System.zip` → `design_handoff_bluebird_v2/` (TDS 영향 v2, hifi 9화면)
**상위 기준점**: [`colors_and_type.css`](../../design/design_handoff_bluebird_v2/colors_and_type.css)(토큰 SSOT)·[`README.md`](../../design/design_handoff_bluebird_v2/README.md)(화면·보이스 명세)

---

## 1. 목적·배경

### 1.1 무엇을

Toss Design System(TDS)의 *구조 원칙*(대형 Top 타이틀·ListRow·BottomCTA·묵직한 버튼)을 블루버드 고유 정체성(코발트 블루·Pretendard·분석가 톤)으로 재해석한 **v2 디자인** 전체(9화면)를 실제 코드베이스에 반영한다. 단, Toss 컬러·로고·브랜디드 컴포넌트는 미사용 — 오리지널 디자인.

### 1.2 왜 단계로 쪼개는가

9화면 + 새 부품 키트 + 토큰 추가는 하나의 구현 계획에 담기엔 너무 크다. 지금은 **베타 모집 중인 라이브 제품**(Brunch 모집 글 공개, owl6615 등 실사용자 존재)이라 한 번에 갈아엎으면 회귀 위험이 크다. 따라서 토대 → 화면 단계로 나누고, 각 덩어리를 따로 spec → plan → 구현한다.

### 1.3 전체 단계 (이 spec은 Phase 0만)

| Phase | 내용 | 비고 |
|---|---|---|
| **0 (이 문서)** | 토큰 추가 + 공용 프리미티브 6개 + 공용 셸(PageHeader·BottomTabBar) v2화 | 모든 화면의 토대 |
| 1 | 핵심 루프: 랜딩 → 기록 → 분석 → 시각화 → 행동 | 별도 spec |
| 2 | 탭 화면: 대시보드 · 인사이트 · 일지 · 나 | 별도 spec |

---

## 2. 확정 결정 (사용자 승인 완료)

| # | 항목 | 결정 |
|---|---|---|
| 1 | 롤아웃 전략 | **토대 먼저 + 화면 단계별** (한 번에 전체 ❌) |
| 2 | 적용 범위 | **v2 디자인 전부 반영** (부분 차용 ❌) |
| 3 | Phase 0 범위 | 토큰 + 프리미티브 + **공용 셸(PageHeader·BottomTabBar)까지 포함** |
| 4 | 중앙 FAB 동작 | **현재 2갈래 팝업 유지**(왜곡 기록 / 성공 순간 기록) — 그림자 토큰만 정리. v2의 /log 직행 ❌ (성공 순간 기록 진입점 보존) |

---

## 3. 변경 전 → 변경 후 (구체)

### 3.1 토큰 (`tailwind.config.ts`) — 순수 추가, 기존 무손상

| 토큰 | 기존 | 변경 후 | 용도 |
|---|---|---|---|
| `primary.tint` | 없음 (`primary/30` 등 opacity 유틸 산발 사용) | `#1E40AF14` (8%) → `bg-primary-tint` | 강조 배경(ListRow 아이콘·accent 카드·Badge) |
| `primary.border` | 없음 | `#1E40AF33` (20%) → `border-primary-border` | 강조 카드 테두리 |
| `distortion` | 없음 | `#E11D48` → `text-distortion`/`bg-distortion` | 전망이론 차트 사용자 포인트 전용 |
| `borderRadius.card` | 없음 (`rounded-2xl`=16px 사용) | `20px` → `rounded-card` | v2 카드 반경 상향(16→20) |
| `borderRadius.ctrl` | 없음 (`rounded-xl`=12px 사용) | `14px` → `rounded-ctrl` | v2 버튼/입력 반경(12/14) |

> 반경 토큰은 **새 프리미티브에서만** 사용한다. 기존 화면은 각자의 Phase에서 전환되며, 그 전까지 현재 반경 유지.

### 3.2 공용 셸 — 내부만 v2화, 호출부 API 무변경

| 부품 | 기존 | 변경 후 |
|---|---|---|
| `PageHeader` | "← 뒤로" 텍스트 버튼, 배경 `bg-white`, 진행 = `step` 텍스트 + 가는 progress 바(h-1) | **chevron-left 아이콘**(26px), 배경 `bg-background`, 진행 = 새 **`Stepper`**(분절 막대). props(`title`·`backHref`·`onBack`·`step`·`rightElement`) **동일** |
| `BottomTabBar` | FAB `shadow-lg`, 팝업 버튼 `shadow-xl` (디자인 시스템 **금지** 그림자) | `shadow-elev2`로 교체. 탭·FAB 2갈래 팝업 구조·라우팅 **동일** |

⚠️ **회귀 면적**: `PageHeader`를 쓰는 모든 화면(`/log`·`/analyze`·`/visualize`·`/action`·`/checkin` 등)의 헤더가 즉시 v2 외형으로 바뀐다. "전부 반영" 전제하의 의도된 변화이며, props 시그니처가 동일하므로 화면 코드는 깨지지 않는다.

---

## 4. 새 프리미티브 6개 — API 명세

위치: `components/ui/`. 전부 **상태 없는 표현용(presentational)** 컴포넌트. 아이콘은 `lucide-react`. 프로토타입의 인라인 스타일 값 → Tailwind 클래스/토큰. 프로토타입 이름 `Badge2`/`Stepper2` → `Badge`/`Stepper`(기존 충돌 없음).

### 4.1 `Top.tsx`
- **props**: `{ title: ReactNode; sub?: ReactNode; className?: string }`
- **스펙**: `<h1>` 26px / 700 / line-height 1.32 / tracking `-0.03em` / `text-text-primary`, 패딩 `pt-3 px-5 pb-5`. `sub`는 15px / `text-text-secondary` / line-height 1.55, 위 여백 10px.
- 한 화면 한 메시지(질문/관찰형). `text-wrap: pretty`(가능 시).

### 4.2 `ListHeader.tsx`
- **props**: `{ title: ReactNode; action?: string; onAction?: () => void }`
- **스펙**: 좌측 `<h2>` 19px / 700 / tracking `-0.02em`, 우측 `action` 텍스트 버튼 13px / 600 / `text-text-tertiary`. 패딩 `pt-5 px-5 pb-2`, baseline 정렬.

### 4.3 `ListRow.tsx` — TDS 핵심 단위
- **props**: `{ icon?: LucideIcon; iconBg?: string; title: ReactNode; desc?: string; right?: ReactNode; rightSub?: string; chevron?: boolean; onClick?: () => void; tone?: string }`
- **아이콘 입력 방식**: `icon`은 `lucide-react` 컴포넌트(`LucideIcon`)를 **직접** 받는다(트리 셰이킹·타입 안전). 문자열 이름→아이콘 매핑 테이블은 만들지 않음(YAGNI).
- **스펙**: 가로 flex, gap 14, 패딩 `py-3.5 px-5`. 좌측 아이콘 = 40×40 `rounded-xl`(12px, 프로토타입 일치) 틴트 배경(`iconBg` 기본 `bg-primary-tint`) + lucide 아이콘 20px stroke 1.9 색 `tone ?? primary`. 가운데 제목 16px / 600 / 1줄 ellipsis, `desc` 13px / `text-text-tertiary`. 우측 `right` 값 15px / 700 / `tabular-nums`(+ `rightSub` 11px), `chevron` 시 chevron-right 20px.
- `onClick` 있을 때만 press 시 배경 `bg-background-secondary`(transition .12s) + cursor pointer.
- `iconBg`/`tone`은 Tailwind 클래스 문자열(예: `tone="text-success"`)로 받아 의미색 오버라이드.

### 4.4 `BottomCTA.tsx`
- **props**: `{ children: ReactNode; sub?: string }`
- **스펙**: `fixed`(컨테이너 기준) 하단, z-45. 위 28px 보호 그라데이션(`bg` → 투명), 아래 `bg-background` 패딩 `pt-1.5 px-5 pb-[34px]`(safe-area). `sub`는 버튼 위 12px / `text-text-tertiary` / 중앙. 그라데이션 영역 `pointer-events-none`, 버튼 영역 `pointer-events-auto`.
- 최대폭 `max-w-lg` 컨테이너 정합(좌우 중앙 정렬).

### 4.5 `Badge.tsx`
- **props**: `{ children: ReactNode; tone?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' }`(기본 `primary`)
- **스펙**: inline-flex 알약(`rounded-full`), 12px / 700 / line-height 1, 패딩 `py-1.5 px-2.5`, gap 5. 톤별 배경/글자: primary=`bg-primary-tint`/`text-primary`, success=green 10%/`text-success`, warning=amber 12%/`text-warning`, danger=red 10%/`text-danger`, neutral=`bg-background-secondary`/`text-text-secondary`.

### 4.6 `Stepper.tsx`
- **props**: `{ current: number; total: number }`
- **스펙**: 가로 flex, gap 6, 패딩 `px-5 pb-1`. `total`개 분절 막대(각 `flex-1` h-[3px] `rounded-full`), `i < current`이면 `bg-primary` 아니면 `bg-background-tertiary`. transition .3s.
- `PageHeader`의 `step` 진행 표시가 이걸 사용.

---

## 5. Phase 0가 하지 않는 것 (범위 가드)

- 화면 **본문** 재작성 (랜딩·기록·분석 등 = Phase 1·2).
- 카피 변경 — `scripts/lint-copy.ts` 금지어 규칙에 영향 없음(새 부품은 카피를 props로 받기만 함).
- 데이터·API·인증 로직 변경 0건.
- BottomTabBar의 **동작/라우팅** 변경 0건 (그림자 토큰만 교체).

---

## 6. 검증

- `npx tsc --noEmit` 통과 (lint = tsc).
- `npm test` 177개 통과 (프리미티브는 표현용이라 신규 테스트 불필요. 단 `PageHeader`/`BottomTabBar` 변경이 기존 테스트에 영향 없는지 확인).
- `scripts/lint-copy.ts` 통과(카피 무변경이라 자명하나 확인).
- 육안: 프리미티브는 Phase 1에서 첫 실사용. Phase 0 단독으로는 `PageHeader`(헤더)·`BottomTabBar`(그림자)만 화면에 보임 → 기존 화면 1개(`/log`)에서 헤더 외형만 점검.

---

## 7. 후속 Phase 개요 (참고 — 각각 별도 spec)

- **Phase 1 (핵심 루프)**: `LandingV2`·`LogFlowV2`·`AnalyzeV2`·`VisualizeV2`·`ActionV2`를 프리미티브로 재구현하고 실제 API(`/api/analyze`·`/api/action` 등)·Supabase에 연결. 랜딩의 "60초 체험"은 기존 `/sample` funnel 유지.
- **Phase 2 (탭 화면)**: `DashboardV2`(그라데이션 Hero 스탯)·`InsightsV2`·`JournalV2`·`MeV2`. BottomTabBar는 이미 v2 근접이라 추가 변경 최소.

---

## 8. 위험·가드

| 위험 | 가드 |
|---|---|
| `PageHeader` 변경이 여러 화면 헤더를 동시에 바꿈 | props 시그니처 동일 → 코드 무손상. 변경 직후 `/log` 등에서 육안 점검. 문제 시 즉시 롤백(단일 파일). |
| 반경 토큰 추가가 기존 화면에 의도치 않게 적용 | 새 토큰(`rounded-card`/`rounded-ctrl`)은 **신규 부품만** 사용. 기존 `rounded-2xl`/`rounded-xl`은 그대로 둠 → 기존 화면 무변화. |
| 디자인 시스템 금지 그림자(`shadow-lg/xl`) 잔존 | Phase 0에서 BottomTabBar의 위반분 제거. 신규 부품은 `shadow-card`/`shadow-elev2`만 사용. |
| 분석가 톤·금지어 위반 | 새 부품은 카피를 하드코딩하지 않음(props 주입). 카피는 소비 화면(Phase 1·2)에서 lint-copy로 강제. |

---

## 9. 구현 순서 (plan에서 상세화)

1. 토큰 추가(`tailwind.config.ts`) — 가장 먼저, 나머지가 의존.
2. 프리미티브 6개 신규 파일(`Top`·`ListHeader`·`ListRow`·`BottomCTA`·`Badge`·`Stepper`).
3. 공용 셸 v2화(`PageHeader` 내부·`BottomTabBar` 그림자).
4. 검증(tsc·test·lint-copy·육안).
