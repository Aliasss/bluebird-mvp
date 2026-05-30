# Handoff: Project Bluebird — App Redesign (v2, TDS-influenced)

## Overview
Project Bluebird는 한국어 **인지 패턴 분석 PWA**입니다. 사용자가 자동 사고를 기록하면
AI가 인지 왜곡을 분석하고, 소크라테스식 질문 → 전망이론 시각화 → Tiny Habit 행동 확약으로
이어지는 루프를 통해 실존적 자율성(Autonomy)을 회복하도록 돕습니다.

이 핸드오프는 기존 제품을 **Toss Design System(TDS)의 구조 원칙**으로 디벨롭한 **v2 디자인**의
구현을 위한 패키지입니다. 핵심 4단계 루프 + 보조 화면 등 **9개 화면 전체**가 포함됩니다.

> 참고: TDS는 *구조 패턴*(BottomCTA, ListRow, 대형 Top 타이틀, 묵직한 버튼)만 차용했고
> Toss의 컬러·로고·브랜디드 컴포넌트는 사용하지 않았습니다. 블루버드 고유 정체성
> (코발트 블루 · Pretendard · 분석가 톤)을 유지한 오리지널 디자인입니다.

---

## About the Design Files
이 번들의 파일들은 **HTML/JSX로 만든 디자인 레퍼런스**입니다 — 의도한 외형과 동작을 보여주는
프로토타입이며, 그대로 복사해 배포하는 프로덕션 코드가 아닙니다.

작업은 이 디자인을 **타깃 코드베이스의 기존 환경에서 재현**하는 것입니다. 실제 제품은
**Next.js 14 (App Router) + Tailwind CSS + Supabase + Gemini** 스택입니다
(원본 저장소: `github.com/Aliasss/bluebird-mvp`). 따라서 이 디자인은 그 코드베이스의
기존 패턴(`app/` 라우트, `components/ui/*`, Tailwind 토큰)에 맞춰 React 컴포넌트로
재구현하는 것을 권장합니다. 프로토타입의 React/인라인 스타일은 *외형의 명세*일 뿐,
구현 방식은 코드베이스 컨벤션을 따르세요.

- 아이콘: 프로토타입은 Lucide를 CDN으로 썼지만, 코드베이스는 `lucide-react`를 사용합니다.
  동일 세트이므로 `lucide-react`로 구현하세요.
- 스타일: 프로토타입의 인라인 스타일 값 → Tailwind 클래스/토큰으로 옮기세요
  (값 매핑은 아래 Design Tokens 참고. 대부분 기존 `tailwind.config.ts`에 이미 존재).
- 폰트: Pretendard Variable (이미 `layout.tsx`에 jsdelivr CDN으로 로드됨).

## Fidelity
**High-fidelity (hifi).** 최종 컬러·타이포그래피·간격·인터랙션이 모두 확정된 픽셀 단위
목업입니다. 코드베이스의 기존 라이브러리/패턴으로 UI를 **픽셀에 가깝게** 재현하세요.
단, 데이터·AI·인증은 목업이므로 실제 API(`/api/analyze`, `/api/action` 등)와 연결해야 합니다.

---

## Screenshots
각 화면의 상단 캡처(`screenshots/`). 인터랙션·스크롤 하단은 `design/index-v2.html`을 직접 열어 확인하세요.

| # | 화면 | 파일 |
|---|---|---|
| 1 | 랜딩 (`/`) | `screenshots/01-landing.png` |
| 2 | 기록 (`/log`) | `screenshots/02-log.png` |
| 3 | 분석 (`/analyze`) | `screenshots/03-analyze.png` |
| 4 | 시각화 (`/visualize`) | `screenshots/04-visualize.png` |
| 5 | 행동 확약 (`/action`) | `screenshots/05-action.png` |
| 6 | 대시보드 (`/dashboard`) | `screenshots/06-dashboard.png` |
| 7 | 인사이트 (`/insights`) | `screenshots/07-insights.png` |
| 8 | 일지 (`/journal`) | `screenshots/08-journal.png` |
| 9 | 나 (`/me`) | `screenshots/09-me.png` |

> 캡처 상단의 알약 칩(랜딩·대시보드 …)은 프로토타입의 **화면 전환용 데모 UI**이며 제품 일부가 아닙니다.

---

- **모바일 우선.** 본문 컨테이너 최대폭 ≈ 512px(`max-w-lg`), 좌우 패딩 20px.
- **상단 헤더(sticky):** 배경 `--bg`(#F8FAFC), 좌측 워드마크("Project Bluebird", 17px/800,
  `--primary`) 또는 뒤로가기 chevron(`chevron-left`, 26px). 상태바 클리어런스 위해
  `padding-top: 50px`(실기기에서는 `env(safe-area-inset-top)`).
- **하단 탭 바(fixed):** `rgba(255,255,255,0.88)` + `backdrop-blur(12px)`, 상단 1px 보더
  `--bg-tertiary`. 5칸: 홈(`home`) · 일지(`scroll-text`) · 중앙 FAB · 인사이트(`trending-up`) · 나(`user`).
  - 탭 아이콘 22px, active 시 `--primary` + stroke 2.5 + 하단 4px 점, inactive `--text-tertiary` + stroke 1.5.
  - **중앙 FAB:** 54×54 원형, `--primary`, 흰 `plus` 아이콘(26px), `margin-top: -22px`로 떠 있음,
    그림자 `--shadow-elev2`. 탭하면 기록 플로우(`/log`) 진입.
  - 탭 바는 탭 라우트(`/dashboard`, `/journal`, `/insights`, `/me`)에서만 노출.
- **BottomCTA(고정 1차 액션):** 입력/플로우 화면 하단에 고정. 위쪽에 28px 보호 그라데이션
  (`--bg` → 투명), 그 아래 `--bg` 배경 패딩 영역에 풀폭 버튼. 선택적 보조문구(12px, `--text-tertiary`, 중앙).
  하단 패딩 34px(safe-area).

---

## Screens / Views

화면 흐름: **랜딩 → 기록(`/log`) → 분석(`/analyze`) → 시각화(`/visualize`) → 행동 확약(`/action`) → 대시보드(`/dashboard`)**
하단 탭: 대시보드 · 일지(`/journal`) · 인사이트(`/insights`) · 나(`/me`).

### 1. 랜딩 (`/` 미인증)
- **목적:** 무가입 60초 체험으로 핵심 가치 전달.
- **레이아웃:** 세로 중앙 정렬, 상단 Badge → 대형 헤드라인 → 본문 → 시나리오 리스트카드,
  하단 BottomCTA.
- **컴포넌트:**
  - Badge "인지 분석 도구" (`--primary-tint` 배경 / `--primary` 글자, 12px/700, pill).
  - 헤드라인 32px / 800 / line-height 1.28 / letter-spacing -0.035em. 2줄, 2번째 줄 "구조로 봅니다."는 `--primary`.
  - 본문 16px / `--text-secondary` / line-height 1.6.
  - 시나리오 카드: 흰 배경, radius 20, 1px `--bg-tertiary` 보더. 내부에 3개의 ListRow
    (아이콘 `message-circle`/`clock`/`target`, 제목 + 설명), 행 사이 1px 디바이더.
  - BottomCTA: 1차 "60초 체험 시작하기"(`--primary`, 17px 패딩, radius 16), 그 아래 고스트
    "이미 계정이 있어요". 보조문구 "인지행동치료(CBT)·메타인지·전망이론 기반".

### 2. 기록 (`/log`) — 3단계
- **목적:** 트리거 → 자동 사고 → 고통 강도(NRS-11) 입력.
- **레이아웃:** 헤더(뒤로) → 가는 Stepper(3칸 진행 점) → 대형 Top 타이틀 → 입력 영역 → BottomCTA.
- **단계별:**
  1. **트리거:** Top "무슨 일이 있었나요?" + 설명. 카드 안 대형 무테 textarea(19px/500, 최소 5자).
  2. **자동 사고:** 상단에 트리거 요약(Badge "트리거" + 텍스트). 대형 textarea(최소 10자).
  3. **고통 강도:** 카드 안 중앙 대형 숫자(60px/800, `--primary`) + 밴드 라벨(거의 없음/약간/보통/심함/극심).
     아래 `<input type=range 0–10>`(accent `--primary`), 양끝 라벨 "0·전혀 없음 / 10·참을 수 없는".
- **BottomCTA:** "다음"(1·2단계) / "분석 시작하기"(3단계). 유효성 미충족 시 disabled(opacity .5).
- **검증:** 1단계 ≥5자, 2단계 ≥10자, 3단계 항상 가능(0 허용).

### 3. 분석 (`/analyze`)
- **목적:** AI 왜곡 분석 결과 + 이론 해석 + 소크라테스식 질문.
- **로딩 상태:** 중앙 스피너(56px, `--primary` 상단 호 회전 0.9s), "인지 패턴을 맞추고 있어요 /
  보통 10~20초 정도 걸려요." (실제로는 `/api/analyze` + `/api/generate-questions` 호출 대기.)
- **결과 레이아웃(섹션 카드 스택, 각 radius 20, 1px 보더, margin 0 20px):**
  - Top "분석이 완료됐어요 / 2개 왜곡이 동시에 작동하고 있어요."
  - **기록한 생각** 카드: Badge "기록한 생각" + 원문. 왜곡 세그먼트는 `<mark>`로 하이라이트
    (배경 `rgba(217,119,6,0.28)` = warning 28%, padding 0 3px, radius 3).
  - **발견된 생각의 패턴**(ListHeader): 왜곡 카드 N개. 각 카드: 제목(17px/700) + 역할 Badge(우세=primary/보조=neutral),
    우측 강도 %(14px/700 `--primary`), 강도 바(높이 8, `--bg-secondary` 트랙 / `--primary` 채움), 세그먼트 텍스트.
  - **이론 기반 해석**(ListHeader): 2×2 그리드, 셀마다 라벨(12px `--text-tertiary`) + 값(16px/700).
    항목: 현재 프레임 / 추정 확률 / 손실 민감도 / 반추 경향.
  - **생각을 점검하는 질문**(ListHeader): Badge "질문 n/3", 질문(17px/700), 답변 textarea(radius 14),
    하단 이전/다음 질문 버튼. 3번째 질문에서 "세 질문 모두 완료".
  - BottomCTA: "저장하고 시각화 보기" → `/visualize`. 보조문구 "답변은 나중에 이어서 작성할 수 있어요".

### 4. 시각화 (`/visualize`)
- **목적:** 전망이론 가치 함수로 "손실 프레임"의 과대 고통을 시각화.
- **레이아웃:** 헤더(뒤로) → Top "전망이론으로 본 지금 / 같은 사건도 '손실'로 볼 때 …" →
  차트 카드 → 해석 ListRow → tint 강조 박스 → BottomCTA.
- **차트(SVG):** 전망이론 가치 함수 `v(x)=x^0.88`(이득, x≥0), `v(x)=-2.25·(-x)^0.88`(손실, x<0).
  - x 도메인 [-1,1], 곡선 stroke `--primary`(#1E40AF) 3px round.
  - 0축 십자선 `#CBD5E1`. 사용자 현재 위치(손실측 x=-0.5)에 점 r=6 `--distortion`(#E11D48) + 흰 테두리,
    0축까지 점선 연결, "지금" 라벨. 축 라벨 "← 손실 / 이득 →".
  - 범례: 가치 함수(파란 선) · 당신의 현재 위치(로즈 점).
  - **구현 메모:** 실제 코드베이스는 Recharts(`components/charts/prospect-value-chart.tsx`)를 씁니다.
    그 컴포넌트를 재사용하되 위 색·마커 스펙으로 스타일링하세요.
- **해석 ListRow:** 준거점(`anchor`) / 손실 프레임(`trending-down`, tone `--distortion`) / 추정 확률(`percent`, 우측 "25%").
- **강조 박스:** `--primary-tint` 배경, radius 18. "곡선의 왼쪽(손실)이 …, 같은 크기라도 손실을 약 2배 …"
- **BottomCTA:** "행동 하나로 확약하기" → `/action`.

### 5. 행동 확약 (`/action`)
- **목적:** 분석을 측정 가능한 Tiny Habit으로 전환 → 자율성 지수 적립.
- **레이아웃:** 헤더 → Top "작은 행동 하나로 / 확약해볼까요" → 상황 요약 → Tiny Habit 제안 →
  내 행동 계획(3필드) → (완료 후)자율성 카드 → BottomCTA + 완료 시트.
- **상황 요약 카드:** Badge "트리거" + "파국화 72%", 트리거 원문.
- **Tiny Habit 제안:** `--primary-tint` 박스. 우세 왜곡별 제안(코드: `DISTORTION_HABITS`).
  파국화 예: cue "[최악의 시나리오가 머릿속에 떠오르는 순간]", action "확률을 0~100%로 적고
  반대 증거 1가지 찾기 (5분)", reflection "실제 확률이 체감보다 낮았는지 1문장 기록".
- **내 행동 계획:** 3개 텍스트 입력 — ⏰ 언제 / 🎯 무엇을 / ⏱️ 얼마나. (라벨 이모지는 실제 제품에서 사용 중.)
- **완료 시트(bottom sheet):** "행동을 완료했어요" → 전후 변화 3택1(😌 나아졌어요 / 😐 비슷해요 / 😟 더 힘들어요,
  선택 시 2px `--primary` 보더 + tint) → 행동 메모 textarea(+15점, 최대 200자) →
  "메모 기록하고 완료 (+15점 보너스)" 버튼.
- **자율성 micro-feedback 카드(완료 후):** 2px `rgba(217,119,6,0.4)` 보더. "Autonomy · 방금 행사한 자율성",
  "+25점", 누적 지수 "128 → 153점". **카피 주의:** "축하"·"달성" 금지. 자율성은 *행사한 것*.
- **점수 산식(실제):** 검토 답변 개수 ×5점(최대 3개) + 노트 보너스 15점.

### 6. 대시보드 (`/dashboard`)
- **목적:** 홈 — 핵심 지표 + 체크인 + 아키타입.
- **레이아웃:** 헤더(워드마크 + 우측 아바타) → 대형 Top 인사말 → **그라데이션 Hero 스탯** →
  2칸 스탯 → 체크인(ListHeader + 카드) → 아키타입 카드. 하단 탭 노출.
- **Hero 스탯(자율성 지수):** radius 22, 배경 `linear-gradient(160deg,#1E3A8A,#1E40AF 60%,#3B82F6 140%)`,
  흰 글자, 그림자 `0 10px 30px rgba(30,64,175,0.28)`. "자율성 지수" 라벨 + "128점"(40px/800) +
  "관찰자 단계" pill(반투명 흰) + 진행 바(흰) + "다음 단계까지 22점 · …".
- **2칸 스탯:** 연속 기록(7일) / 이번 주 Δ고통(+12점, 탭 시 인사이트). flat 카드 radius 18.
- **체크인:** ListHeader "오늘의 체크인" + 카드(흰, radius 18). ListRow 모닝(`sun-medium`)/이브닝(`moon`),
  완료 시 아이콘 배경 success-tint + 체크, 미완료 시 우측 "체크인".
- **아키타입 카드:** Badge "3회마다 갱신" + 이름(20px/800 "미래 예언가") + 설명 + 진행 바 + "다음 업데이트까지 2회 더".

### 7. 인사이트 (`/insights`)
- **목적:** 트리거 도메인 × 왜곡 유형 교차 패턴 리포트.
- **구성:** Top "당신의 사고 지문" → 요약 불릿 카드(Badge "최근 30일 리포트" + 3개 불릿) →
  주간 Δ고통 바 차트(7개 막대, 마지막 막대만 `--primary`, 나머지 `--primary-tint`) →
  "가장 자주 나타난 패턴" ListRow(카테고리·왜곡, 우측 회수) → "가장 효과적인 패턴" ListRow(우측 평균 Δpain, tone success).

### 8. 일지 (`/journal`)
- **목적:** 과거 기록 목록.
- **구성:** Top "기록 일지" → 세그먼트 컨트롤(전체/왜곡/성공, 선택 시 `--primary` 채움) →
  기록 카드 리스트. 카드: 상단 Badge(왜곡명 또는 "성공 순간"=success) + 날짜, 본문 텍스트,
  (왜곡 기록은)고통 바 + 점수. 성공 기록은 success-tint 보더. 왜곡 카드 탭 시 분석으로.

### 9. 나 (`/me`)
- **목적:** 프로필 + 설정/리소스.
- **구성:** 프로필(60px 아바타 + 이름 + "관찰자 단계 · 분석 22회") → "기록" ListRow 그룹
  (연속 기록/자율성 지수/체크인 알림) → "더 알아보기" ListRow 그룹(기술 매뉴얼/우리의 철학/정신건강 자원).

---

## Interactions & Behavior
- **네비게이션:** 프로토타입은 단일 `screen` state로 라우팅. 실제 구현은 Next.js App Router
  파일 라우트(`app/<route>/page.tsx`)로 매핑. 화면 전환 시 스크롤 top 리셋.
- **press 피드백:** 버튼 `active`에서 `scale(0.96)`, transition 150ms. **색 변화가 아니라 축소**가 기본 press.
- **hover:** 1차 버튼 배경 `--primary` → `--primary-dark`. 카드 hover는 보더 `--primary`.
- **transition:** colors/transform/all 모두 200~300ms, easing `cubic-bezier(0.4,0,0.2,1)`.
  **금지:** 진입 fade-in, shake/bounce, 그라디언트 애니메이션, 패럴랙스/스크롤 트리거.
- **로딩:** 분석 화면 스피너(`animate-spin` 0.9s)만 허용.
- **고통 슬라이더/셀렉터:** 값 변경 시 중앙 대형 숫자 + 밴드 라벨 즉시 갱신.
- **완료 시트:** 하단에서 슬라이드 업, 바깥 탭 시 닫힘, 그림자 `--shadow-elev2`.

## State Management (화면별 로컬 상태 — 실제 데이터는 Supabase/API)
- **기록:** `step(0–2)`, `trigger`, `thought`, `painScore`. 제출 시 `logs` insert → `/analyze/[id]`.
- **분석:** `stage(fetch/analyze/question/done)`, `distortions[]`, `questions[]`, `answers[3]`, `currentQuestion`.
  분석 결과는 DB 캐시(이미 분석된 log는 재호출 방지). 위기 감지 시 `safetyLevel` 분기.
- **행동:** `when/what/howLong`, `phase(plan/committed)`, 완료 시트 `reaction`, `memo`, micro-feedback `{delta,total}`.
- **대시보드:** `streak`, `autonomyScore`, `weeklyDeltaPain`, `archetype`, `todayCheckin`.

## Design Tokens
색·shadow·radius·spacing의 단일 출처는 동봉된 **`colors_and_type.css`** (CSS 변수 + 시맨틱 클래스).
대부분 기존 `tailwind.config.ts`에 이미 정의돼 있습니다.

**Colors**
| 토큰 | 값 | 용도 |
|---|---|---|
| `--primary` | `#1E40AF` | 유일한 액센트(CTA·active·강조) |
| `--primary-dark` / `--primary-light` | `#1E3A8A` / `#3B82F6` | hover / 보조 |
| `--primary-tint` | `#1E40AF` 8% | 강조 배경 |
| `--success` / `--warning` / `--danger` | `#16A34A` / `#D97706` / `#DC2626` | 알림 시점만 |
| `--distortion` | `#E11D48` | 차트 사용자 포인트 |
| `--system2` | `#0891B2` | 철학 페이지 전용 |
| `--bg` / `--bg-secondary` / `--bg-tertiary` | `#F8FAFC` / `#F1F5F9` / `#E2E8F0` | 배경/보더 |
| `--text-primary` / `secondary` / `tertiary` | `#0F172A` / `#475569` / `#64748B` | 텍스트 |

**Typography:** Pretendard Variable. weight 500/600/700/800. letter-spacing 본문 -0.011em,
부제/라벨 -0.02em, 큰 헤딩 -0.03em. `font-feature-settings: 'ss01','tnum'`. 큰 수치는 `tabular-nums`.
주요 크기: Top 26–32px/700–800 · 섹션 헤더 19px/700 · ListRow 제목 16px/600 · 본문 15–16px · 캡션 10–13px.

**Radius:** 카드/패널 18–22px(2xl 계열) · 버튼/입력 12–16px(xl) · 배지/아바타 full.
(v2는 v1보다 radius를 약간 키움: 카드 16→18–20, 버튼 14→16.)

**Shadow:** `--shadow-card` `0 2px 8px rgba(15,23,42,.04), 0 1px 2px rgba(15,23,42,.06)` ·
`--shadow-elev2` `0 8px 24px rgba(15,23,42,.08), 0 2px 6px rgba(15,23,42,.06)`.
Hero 스탯만 예외적 컬러 그림자 `0 10px 30px rgba(30,64,175,.28)`. **금지:** `shadow-md/lg/xl/2xl`.

**Spacing:** 4px 베이스. 컨테이너 좌우 20px, 카드 내부 16–22px, 섹션 간 세로 16px.

## Voice / Microcopy (필수 준수)
**분석가(Analyst) 톤 · 해요체.** TDS의 간결·명료 원칙을 적용하되 위로·응원으로 흐르지 않습니다.
- Top 타이틀은 질문/관찰형, 버튼은 동사로 끝나는 한 가지 행동, 보조문구는 사실 한 줄.
- 점수에 "축하/달성/대단해요" 금지 — 자율성은 *행사한 것*.
- **금지 어휘**(코드의 `scripts/lint-copy.ts`가 강제): 위로·응원(괜찮아요/힘내세요/응원),
  캐릭터 친근체(안녕!/함께해요/친구처럼), 항해 메타포(항해/나침반/안개/별빛/바다/★),
  의료 어휘(교정/진단/치료/병리적/발병), 메타 칭찬("정확히 인식했어요").
  (면책·약관·위기자원·AI 프롬프트는 예외.)

## Assets
- `assets/bluebird-icon.svg` — 브랜드/앱 아이콘(파랑새, 둥근 사각형). PWA maskable 아이콘.
- **아이콘:** Lucide(`lucide-react`). 사용: `home, scroll-text, plus, trending-up, user,
  chevron-left, chevron-right, check, sun-medium, moon, message-circle, clock, target,
  anchor, trending-down, percent, flame, award, bell, book-open, compass, life-buoy, rotate-ccw`.
  line 스타일, round cap, stroke 1.5–1.9.
- **폰트:** Pretendard Variable — jsdelivr CDN
  (`cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/.../pretendardvariable-dynamic-subset.css`).

## Files (이 번들)
- `colors_and_type.css` — 디자인 토큰(CSS 변수) + 시맨틱 클래스. **구현 기준값.**
- `design/index-v2.html` — 진입점. 브라우저로 열면 9개 화면 클릭스루 동작. 상단 칩으로 화면 전환.
- `design/AppShell.jsx` — 공유 프리미티브(`Icon`/`Btn`/`Card`/`AppHeader`/`BottomTab`) + 토큰 객체 `T`.
- `design/TdsKit.jsx` — v2 프리미티브(`Top`/`ListHeader`/`ListRow`/`BottomCTA`/`Badge2`/`Stepper2`).
- `design/ScreensV2A.jsx` — `LandingV2`, `DashboardV2`(+ Hero 스탯, HeaderV2).
- `design/ScreensV2B.jsx` — `LogFlowV2`, `AnalyzeV2`.
- `design/ScreensV2C.jsx` — `InsightsV2`, `JournalV2`.
- `design/ScreensV2D.jsx` — `VisualizeV2`(전망이론 SVG 차트), `MeV2`.
- `design/ScreensV2E.jsx` — `ActionV2`(Tiny Habit 확약 + 완료 시트).
- `design/ios-frame.jsx` — 프리뷰용 iPhone 베젤(구현 불필요, 데모용).
- `assets/bluebird-icon.svg` — 브랜드 아이콘.
- `screenshots/01..09-*.png` — 9개 화면 상단 캡처(위 Screenshots 표 참고).

### 실행 방법(디자인 확인)
`design/index-v2.html`을 브라우저로 엽니다(인터넷 연결 필요 — React/Babel/Lucide/Pretendard CDN).
상단 칩으로 화면을 전환하거나 앱 안에서 흐름을 따라가며 인터랙션을 확인하세요.

### 구현 권장 순서
1. 토큰을 코드베이스 Tailwind/CSS에 정렬(대부분 이미 존재).
2. 공유 프리미티브부터: `Top`, `ListRow`, `ListHeader`, `BottomCTA`, `Badge`, `Button` → 기존 `components/ui/*`와 통합.
3. 화면을 흐름 순서(기록 → 분석 → 시각화 → 행동 → 대시보드)로 구현, 각 화면을 실제 API/Supabase에 연결.
4. 보조 화면(인사이트/일지/나) 구현.
5. 카피는 위 Voice 규칙 + `scripts/lint-copy.ts` 통과 확인.
