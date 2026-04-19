# Project Bluebird MVP — 개발 현황 문서

> 최종 업데이트: 2026-04-19

---

## 1. 프로젝트 개요

인지 왜곡(Cognitive Distortion)을 탐지하고 소크라테스식 질문으로 사고를 교정하는 PWA 앱.  
CBT(인지행동치료), CAS(메타인지치료), 전망이론(Prospect Theory)을 이론적 기반으로 한다.

**기술 스택**
- Framework: Next.js 16 (App Router, `'use client'` 기반)
- Styling: Tailwind CSS (커스텀 토큰: `primary`, `system2`, `text-*`, `background-*`)
- DB / Auth: Supabase (PostgreSQL + RLS + 서버사이드 클라이언트)
- AI: Google Gemini 2.5 Flash (JSON Mode, 재시도 로직 포함)
- Charts: Recharts (BarChart, LineChart, RadarChart, custom ProspectValueChart)
- PWA: `@ducanh2912/next-pwa`
- 배포: Vercel

---

## 2. 데이터베이스 스키마

### `logs`
사용자가 입력한 사고 기록.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | auth.users |
| trigger | text | 트리거(사건) |
| thought | text | 자동 사고 |
| created_at | timestamptz | |

### `analysis`
AI가 분석한 인지 왜곡 결과. log당 왜곡 유형 수만큼 row 생성.  
왜곡이 없어도 스트릭 적립을 위해 `distortion_type = null` 마커 row 삽입.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK | |
| log_id | uuid FK | logs |
| distortion_type | text (nullable) | 5대 왜곡 유형 또는 null(마커) |
| intensity | float | 왜곡 강도 0~1 |
| logic_error_segment | text | 왜곡이 발생한 문장 조각 |
| rationale | text | 판단 근거 |
| frame_type | text | loss / gain / mixed |
| reference_point | text | 전망이론 준거점 |
| probability_estimate | float | AI 추정 확률 0~100 |
| loss_aversion_signal | float | 손실 민감도 0~1 |
| cas_rumination | float | CAS 반추 지표 0~1 |
| cas_worry | float | CAS 걱정 지표 0~1 |
| system2_question_seed | text | System 2 기동 핵심 질문 |
| decentering_prompt | text | 탈중심화 안내 |
| created_at | timestamptz | |

### `intervention`
소크라테스식 질문, 사용자 답변, 행동 계획을 저장. log당 1개 row.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK | |
| log_id | uuid FK | logs |
| socratic_questions | jsonb (string[]) | AI 생성 질문 3개 |
| user_answers | jsonb | { q1, q2, q3 } |
| theory_context | jsonb | 이론 메타 데이터 |
| final_action | text | 사용자 작성 행동 계획 |
| is_completed | boolean | 행동 완료 여부 |
| autonomy_score | int | 자율성 지수 (완료 시 산정) |
| created_at | timestamptz | |

---

## 3. 사용자 플로우

```
랜딩(/) → 회원가입(/auth/signup) → 대시보드(/dashboard)
                                         ↓
                                   기록(/log)
                                    [트리거 입력 → 자동 사고 입력 → 저장]
                                         ↓
                                   분석(/analyze/[id])
                                    [AI 분석 → 소크라테스 질문 → 답변 입력]
                                         ↓
                                   시각화(/visualize/[id])
                                    [전망이론 차트 + 왜곡 요약]
                                         ↓
                                   행동 설계(/action/[id])
                                    [행동 계획 작성 → 완료 체크 → 자율성 지수 획득]
```

---

## 4. 구현된 페이지 및 기능

### 공개 페이지 (로그인 불필요)

| 경로 | 기능 |
|---|---|
| `/` | 랜딩 페이지. Pain Point 시나리오 카드, CTA, 이론 신뢰성 문구(CBT/CAS/전망이론), PWA 설치 유도 |
| `/our-philosophy` | 항해사 비유로 인지 왜곡의 중요성 설명. 5개 섹션 + 과학 수치(λ=2.25, R²=.46, 75%) + 참고 문헌 |
| `/install` | PWA 홈 화면 추가 가이드 (iOS Safari, Android Chrome 각 3단계) |
| `/auth/login` | 이메일/비밀번호 로그인 |
| `/auth/signup` | 회원가입 |

### 인증 필요 페이지

#### `/dashboard`
- 사용자 이메일, 연속 기록 배너(StreakBanner), 인지 아키타입 카드(ArchetypeCard)
- 통계 카드: 전체 로그 수, 완료한 행동 수, 자율성 지수 합산
- 최근 활동 (logs 최근 5개), 최근 행동 계획 (intervention 최근 5개)
- 헤더: 철학 / Manual / 로그아웃

#### `/log`
- 2단계 입력: Step 1 트리거(사건, 최소 5자), Step 2 자동 사고(최소 10자)
- 저장 완료 시 `/analyze/[id]`로 이동

#### `/analyze/[id]`
- **Stage 1 (fetch):** 기존 분석 캐시 확인
- **Stage 2 (analyze):** `/api/analyze` 호출 → AI 인지 왜곡 탐지
- **Stage 3 (question):** `/api/generate-questions` 호출 → 소크라테스 질문 3개 생성
- **Stage 4 (done):** 분석 결과 + 이론 기반 해석(6개 지표) + 왜곡 목록 + 질문-답변 UI
- 답변 완료 후 `/visualize/[id]`로 이동

#### `/visualize/[id]`
- 전망이론 커브 차트 (Recharts 기반 커스텀)
- 현재 프레임(손실/이득/혼합), 준거점, 왜곡 강도 기반 주관 손실 가중치 계산
- 왜곡 요약 카드 (유형, 강도, 세그먼트, 판단 근거)
- Bluebird 이론 지표 (확률, CAS-반추, CAS-걱정, 탈중심화 가이드)
- 내가 입력한 답변 요약

#### `/action/[id]`
- Tiny Habit 제안 3개 (지배적 왜곡 유형별 맞춤 템플릿 5종)
- 행동 계획 textarea (최소 8자)
- 저장 / 완료 체크 (완료 시 자율성 지수 산정)

#### `/insights`
- 기간 필터: 7일 / 30일 / 전체
- 왜곡 유형별 빈도 BarChart
- 자율성 지수 시계열 LineChart
- 성장 지표: 왜곡 강도 변화율, 행동 완료율 변화, 가장 개선된 왜곡 유형
- 인지 아키타입 패널 (ArchetypePanel)

#### `/manual`
- 6개 섹션 기술 매뉴얼 (0: 서문, 1: 인지 왜곡, 2: 이중 프로세스, 3: 전망이론, 4: CAS, 5: 행동 설계)
- 각 섹션별 소제목, 핵심 포인트 구조

---

## 5. API 엔드포인트

### `POST /api/analyze`
인지 왜곡 분석. Gemini 2.5 Flash 호출.

- **입력:** `{ logId: string }`
- **출력:** `{ distortions[], frame_type, reference_point, probability_estimate, loss_aversion_signal, cas_signal, system2_question_seed, decentering_prompt, warning }`
- **캐시:** 기존 analysis row 있으면 DB에서 바로 반환
- **제한:** 일 6회(계정당, KST 자정 리셋) + 분당 5회(Supabase 기반)
- **왜곡 0개 시:** `distortion_type = null` 마커 row 삽입 (스트릭 적립용)

### `POST /api/generate-questions`
소크라테스식 질문 3개 생성. Gemini 호출.

- **입력:** `{ logId: string }`
- **출력:** `{ questions: string[3] }`
- **캐시:** 기존 intervention에 질문 있으면 바로 반환
- **제한:** 분당 6회(Supabase 기반)
- **위생처리:** 위로 언어(괜찮아요, 힘내 등) 자동 제거

### `POST /api/intervention/answers`
소크라테스 답변 저장.

- **입력:** `{ logId: string, answers: string[3] }`
- **검증:** 각 답변 최소 1자, 최대 500자 (숫자 포함 강제 없음)
- **제한:** 분당 20회 (in-memory, 저위험)

### `POST /api/action`
행동 계획 저장 및 완료 처리.

- **입력:** `{ logId, finalAction, markCompleted }`
- **완료 시:** `is_completed = true`, 자율성 지수 산정 후 저장
- **중복 방지:** 이미 `is_completed`이면 기존 점수 반환, DB 재업데이트 없음

---

## 6. 자율성 지수 산정 공식

```
autonomyScore = 10 (기본) + round(averageIntensity × 5) + min(3, 답변 수)
```

- `averageIntensity`: 해당 log의 왜곡 강도 평균
- 최소 10점, 최대 18점 (왜곡 강도 1.0, 답변 3개 기준)

---

## 7. 연속 기록 (Streak) 시스템

**파일:** `lib/utils/streak.ts`  
**기준:** KST 기준 날짜별 analysis 완료 여부 (distortion_type IS NULL 포함)

- `current`: 오늘(또는 어제)부터 연속으로 분석한 일수
- `best`: 역대 최고 연속 기록
- `doneToday`: 오늘 분석 완료 여부
- 오늘 미완료 시 어제부터 소급해 스트릭 유지 (당일 자정 전 완료 기회 보장)

---

## 8. 인지 아키타입 시스템

**파일:** `lib/utils/archetype.ts`, `lib/content/archetypes.ts`

- 전체 분석 중 가장 빈번하게 나타난 왜곡 유형이 아키타입 결정
- 5종: 파국화형 시나리오 구축가 / 완벽주의 이분법자 / 감정 기반 항법사 / 책임 과잉 수집가 / 결론 선행 사고가
- 5회 분석마다 재계산 (업데이트 주기 표시)
- placeholder row(`distortion_type = null`)는 아키타입 집계에서 제외

---

## 9. 보안 및 제한

| 항목 | 내용 |
|---|---|
| 인증 | Supabase Auth (이메일/비밀번호) |
| RLS | 모든 테이블에 user_id 기반 Row Level Security |
| 일일 분석 한도 | 계정당 6회 / KST 자정 리셋 / Supabase 쿼리 기반 |
| 분당 분석 한도 | 5회/분 (analyze), 6회/분 (generate-questions) / Supabase 기반 |
| 입력 길이 제한 | trigger + thought 각 최대 1000자 (`lib/security/ai-guard.ts`) |
| 입력 검증 | Zod 스키마 검증 (모든 API) |

---

## 10. 주요 컴포넌트

| 컴포넌트 | 위치 | 역할 |
|---|---|---|
| `BottomTabBar` | `components/ui/` | 홈/FAB(기록)/인사이트 하단 탭. `/dashboard`, `/insights`에서만 렌더 |
| `StreakBanner` | `components/ui/` | 연속 기록 상태 배너. 0일/진행중/오늘 완료 3가지 상태 |
| `ArchetypeCard` | `components/ui/` | 대시보드용 아키타입 요약 카드 (업데이트 진행 바 포함) |
| `ArchetypePanel` | `components/ui/` | 인사이트용 아키타입 상세 패널 |
| `PageHeader` | `components/ui/` | 뒤로가기 + 제목 + 진행 단계 표시 헤더 |
| `SkeletonCard` | `components/ui/` | 로딩 스켈레톤 |
| `ProspectValueChart` | `components/charts/` | 전망이론 커브 + 사용자 위치 점 시각화 |

---

## 11. 미구현 / 백로그

| 항목 | 비고 |
|---|---|
| 푸시 알림 인프라 | 연속 기록 리마인더 등. 인프라 미구축 |
| 다크 모드 | CSS 변수 전환 방식 검토 완료, 미구현 |
| 소셜 로그인 | Google/Apple 미연동 |
| 데이터 내보내기 | CSV/JSON 내보내기 미구현 |
| IF-THEN 플래닝 | 행동 설계 고도화 미구현 |
| 아키타입 조합 시스템 | 복수 왜곡 유형 조합 페르소나 미구현 |
| Vercel Analytics | 트래픽 분석 미연동 |
