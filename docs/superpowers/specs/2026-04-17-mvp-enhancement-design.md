# MVP 고도화 설계 문서

**날짜**: 2026-04-17  
**범위**: AI 품질 개선 → 통계 대시보드 → UI 폴리싱 → 온보딩  
**목표**: 개인 사용 수준에서 외부 사용자 공개 가능 수준으로 끌어올리기  
**접근 방식**: Incremental — 독립적 마일스톤으로 단계적 진행

---

## Phase 1: AI 프롬프트 재설계

### 목표
왜곡 유형 오분류 감소 + 소크라테스 질문의 맥락 품질 향상

### 문제 진단

**오분류 원인**  
`lib/openai/gemini.ts`의 분석 프롬프트가 5대 왜곡 유형의 진단 규칙을 나열하지만, 유형 간 경계 케이스(예: "나는 항상 실패해" → 흑백논리 vs 파국화)에서 판단 근거를 명시하지 않아 일관성이 떨어짐.

**뻔한 질문 원인**  
`/api/generate-questions` 프롬프트가 분석 결과의 `reference_point`, `cas_signal`, `frame_type`을 주입하지만, 이 값들이 질문 생성에 충분히 반영되지 않아 일반적인 확률/수치 요구형 질문이 반복 생성됨.

### 개선 내용

**1. 감별 진단 규칙(Differential Diagnosis) 추가**  
`lib/ai/bluebird-protocol.ts`의 `BLUEBIRD_DISTORTION_TAXONOMY`에 각 유형별 `differentialRule` 필드 추가.  
예) 파국화 vs 흑백논리: "결과의 연속적 스펙트럼을 부정하면 흑백논리, 단일 사건에서 장기 재앙으로 확장하면 파국화"

**2. 소크라테스 질문 프롬프트 강화**  
`generateSocraticQuestionsWithGemini`의 프롬프트에 `reference_point`와 `decentering_prompt`를 질문 생성의 필수 맥락으로 주입. 사용자의 구체적 상황이 질문에 반영되도록 constraint 추가: "질문에 사용자의 준거점(`reference_point`)을 직접 언급할 것".

**3. 경계 케이스 평가 데이터 보강**  
`lib/ai/eval-cases.ts`에 경계 케이스 10개 추가 (유형 간 혼동이 잦은 시나리오). 프롬프트 수정 시 회귀 테스트 기준으로 활용.

### 변경 파일
- `lib/ai/bluebird-protocol.ts` — differentialRule 필드 추가
- `lib/openai/gemini.ts` — 분석/질문 생성 프롬프트 수정
- `lib/ai/eval-cases.ts` — 경계 케이스 10개 추가

---

## Phase 2: 통계/인사이트 페이지 (`/insights`)

### 목표
사용자 자신의 왜곡 패턴을 한눈에 파악할 수 있는 전용 페이지 신설

### 페이지 구성 (`app/insights/page.tsx`)

**섹션 1: 요약 카드**
- 전체 분석 횟수
- 가장 자주 나온 왜곡 유형 (1위)
- 평균 자율성 지수

**섹션 2: 왜곡 유형 분포 (Bar Chart)**
- 5대 왜곡 유형별 탐지 빈도
- Recharts `BarChart` 사용 (기존 의존성)
- 최근 30일 기준 필터 옵션

**섹션 3: 자율성 지수 추이 (Line Chart)**
- 날짜별 누적 자율성 지수
- Recharts `LineChart` 사용

**섹션 4: 왜곡 강도 분포 (레이더 차트)**
- 5대 왜곡 유형별 평균 intensity
- Recharts `RadarChart` 사용

**섹션 5: 텍스트 인사이트**
- "최근 30일간 {왜곡유형}이 가장 자주 나타났습니다"
- "평균 완료율: {n}%"

### 데이터 조회
별도 API 없이 클라이언트에서 Supabase 직접 조회. `analysis` + `intervention` 테이블 집계.

### 진입점
- `/dashboard` 헤더에 "인사이트" 버튼 추가
- `/dashboard` 통계 카드 클릭 시 진입

### 변경 파일
- `app/insights/page.tsx` — 신규 생성
- `app/dashboard/page.tsx` — 인사이트 진입 버튼 추가
- `proxy.ts` — `/insights` 경로 보호 추가

---

## Phase 3: UI 폴리싱

### 목표
외부 사용자 기준 "완성된 앱"처럼 느껴지도록 일관성 및 시각적 완성도 향상

### 1순위: 랜딩 + 인증 페이지

**`app/page.tsx`**
- 기능 목록 나열 → 구체적 사용 시나리오 예시로 교체
- 예) "오늘 발표에서 실수한 뒤 '나는 항상 이렇다'는 생각이 들었나요? 그 순간을 기록해보세요."
- CTA 버튼 문구: "시작하기" → "첫 번째 생각 기록하기"

**`app/auth/login/page.tsx`, `app/auth/signup/page.tsx`**
- 입력 필드 포커스 상태, 에러 메시지 스타일 정리
- 로고/브랜드 일관성 확보

### 2순위: 핵심 플로우 4개 페이지

공통 개선 사항:
- 페이지 헤더 스타일 통일 (뒤로가기 버튼, 제목, 진행 단계 표시)
- 카드 컴포넌트 shadow/border 스타일 통일
- 버튼 크기 및 터치 영역 모바일 기준으로 정리 (최소 44px)
- 로딩 스켈레톤 UI 추가 (현재 스피너만 있음)

### 3순위: 대시보드

- 이모지 아이콘 제거 → `lucide-react` 아이콘으로 교체 (신규 의존성 추가: `npm install lucide-react`)
- 환영 메시지 섹션 간소화
- 통계 카드 디자인 일관성 정리

### 변경 파일
- `app/page.tsx`
- `app/auth/login/page.tsx`, `app/auth/signup/page.tsx`
- `app/log/page.tsx`, `app/analyze/[id]/page.tsx`, `app/visualize/[id]/page.tsx`, `app/action/[id]/page.tsx`
- `app/dashboard/page.tsx`
- `components/ui/` — 공통 컴포넌트 추가/수정 가능

---

## Phase 4: 온보딩

### 목표
"인지 왜곡 탐지"가 낯선 신규 사용자가 첫 기록까지 마찰 없이 도달하도록 안내

### 개선 내용 (별도 투어/팝업 없음)

**1. 랜딩 페이지 카피** (Phase 3과 병행)  
구체적 상황 예시로 앱의 용도를 즉시 전달.

**2. 대시보드 Empty State 개선** (`app/dashboard/page.tsx`)  
로그가 0개일 때 기존 "아직 기록이 없습니다" 텍스트 → 3단계 안내 카드로 교체:
- 1단계: 오늘 마음에 걸리는 사건/생각을 적어보세요
- 2단계: AI가 어떤 인지 왜곡인지 분석해드립니다
- 3단계: 소크라테스식 질문으로 사고를 직접 교정해보세요

**3. 로그 입력 Placeholder 개선** (`app/log/page.tsx`)  
트리거/자동사고 입력창에 실제 예시 제공:
- 트리거 placeholder: "예: 팀장이 내 보고서에 피드백을 주지 않았다"
- 자동사고 placeholder: "예: 내가 일을 못하니까 무시하는 거겠지"

### 변경 파일
- `app/dashboard/page.tsx` — Empty state 개선
- `app/log/page.tsx` — Placeholder 개선

---

## 구현 순서 요약

| Phase | 내용 | 핵심 파일 |
|-------|------|-----------|
| 1 | AI 프롬프트 재설계 | `bluebird-protocol.ts`, `gemini.ts`, `eval-cases.ts` |
| 2 | /insights 페이지 신설 | `app/insights/page.tsx`, `proxy.ts` |
| 3 | UI 폴리싱 (랜딩 → 플로우 → 대시보드) | 다수 page.tsx |
| 4 | 온보딩 (Empty state + Placeholder) | `dashboard/page.tsx`, `log/page.tsx` |

각 Phase는 독립적으로 완료 가능. 순서를 지키되, 각 Phase 완료 후 앱을 실행해 체감 가능한 변화 확인 권장.

---

## 범위 외 (이번 작업 제외)

- Push Notifications
- 소셜 로그인 (Google, Apple)
- 다크 모드
- 다국어 지원
- 데이터 내보내기
- Vercel 배포 설정
