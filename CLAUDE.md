# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# 개발 서버 (Turbopack)
npm run dev

# 프로덕션 빌드 (webpack — next-pwa와 호환)
npm run build

# 타입 체크 (lint 역할)
npm run lint        # tsc --noEmit
```

> `dev`와 `build`의 번들러가 다름에 주의: 개발은 Turbopack, 빌드는 webpack(`--webpack` 플래그). next-pwa가 Turbopack을 지원하지 않기 때문이다.

## 환경 변수 (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
```

## 아키텍처 개요

### 유저 플로우
`/log` (트리거+자동사고 입력) → `/api/analyze` → `/analyze/[id]` (왜곡 탐지 + 소크라테스 질문) → `/visualize/[id]` (전망이론 그래프) → `/action/[id]` (Tiny Habit 확약) → `/dashboard` (자율성 지수 + 히스토리)

### AI 분석 파이프라인
- **단일 진실원**: `lib/ai/bluebird-protocol.ts` — 5대 왜곡 분류 체계(Taxonomy), Few-shot 예시, 출력 JSON 스키마, 이론 요약이 모두 여기에 정의됨. 프롬프트를 수정할 때는 반드시 이 파일을 기준으로 한다.
- **Gemini 클라이언트**: `lib/openai/gemini.ts` — `analyzeDistortionsWithGemini`와 `generateSocraticQuestionsWithGemini` 두 함수가 외부로 노출됨. 재시도(최대 2회, exponential backoff), JSON 파싱 방어 로직, Zod 검증 후 정규화까지 담당.
- **API 라우트**: `app/api/analyze/route.ts` — 이미 분석된 log에 대해서는 DB 캐시를 반환(재호출 방지). Rate limit은 유저+IP 조합으로 분당 5회.

### 인증 및 라우트 보호
- Next.js middleware 파일명이 `proxy.ts`로 되어 있음 (`middleware.ts`가 아님). 빌드 설정에서 이를 인식하도록 되어 있으니 파일 이름 변경 시 주의.
- 보호 대상 경로: `/dashboard`, `/log`, `/analyze`, `/visualize`, `/action`
- Supabase 클라이언트는 용도별로 분리: 브라우저용 `lib/supabase/client.ts`, Server Component/Route Handler용 `lib/supabase/server.ts` (`createServerSupabaseClient()`).

### 데이터베이스 스키마
마이그레이션 파일: `supabase/migrations/`
- `01_initial_schema.sql`: `logs`, `analysis`, `intervention` 테이블 + RLS 정책
- `02_protocol_fields.sql`: `analysis` 테이블에 Protocol 확장 필드 추가 (`frame_type`, `reference_point`, `probability_estimate`, `loss_aversion_signal`, `cas_rumination`, `cas_worry`, `system2_question_seed`, `decentering_prompt`)

### PWA
- `next-pwa`(@ducanh2912/next-pwa)가 빌드 시에만 Service Worker를 생성. 로컬 개발 시 `layout.tsx`의 인라인 스크립트가 SW를 자동 해제함.
- 오프라인 폴백: `public/offline.html`

### 보안 레이어
- `lib/security/ai-guard.ts`: AI 입력 길이 제한 (`MAX_AI_TEXT_LENGTH`)
- `lib/security/rate-limit.ts`: 인메모리 슬라이딩 윈도우 Rate Limiter
- `next.config.ts`: CSP, X-Frame-Options 등 보안 헤더 전역 적용

## 핵심 타입

`types/index.ts`에 모든 공유 타입이 정의됨:
- `DistortionType` enum: 5대 왜곡 (값은 `snake_case` 문자열, DB에 그대로 저장됨)
- `AIAnalysisResult`: Gemini 분석 결과의 최종 형태
- `Log`, `Analysis`, `Intervention`: DB 테이블 대응 인터페이스

---

## 작업 태도 (Behavioral Guidelines)

> Adapted from `forrestchang/andrej-karpathy-skills`. LLM 코딩에서 자주 발생하는 4 함정(가정 미확인·과복잡·인접 코드 오염·검증 기준 부재)에 대한 가드. 회귀 비용 > 속도 비용인 1인 운영자·베타 단계 맥락에 정합. 사소한 작업엔 판단 적용.

### 1. Think Before Coding — 가정을 명시하라

- 가정은 *암묵적으로* 두지 말고 명시. 불확실하면 묻는다.
- 해석이 둘 이상일 때 *조용히 하나를 고르지 않는다* — 선택지를 surface한다.
- 더 단순한 접근이 있으면 말한다. 정당하면 push back.
- BlueBird-specific: 산식·메트릭 변경(예: pain_score 척도, autonomy_score 산식)은 `docs/external/mvp-overview-2026-05-03.md` §4.2 이론 근거와 정합되는지 *먼저* surface 후 진행.

### 2. Simplicity First — 요청을 푸는 최소 코드만

- 요청 외 기능 추가 금지. 일회성 코드에 추상화 금지. 요청되지 않은 *유연성·설정 가능성* 금지.
- 자기 점검: "시니어 엔지니어가 이걸 보고 *과복잡하다*고 할까?" → 그렇다면 다시 쓴다.
- 200줄로 쓴 게 50줄로 가능했으면 다시 쓴다.
- BlueBird-specific: 신규 메트릭·로직(예: 새로운 강도 지표·새 게임화 카운터)은 PMF 게이트(`docs/strategy/pmf-validation-plan.md` §0) 통과 또는 인터뷰 자발 언급 트리거 *이후*에만. 사전 박지 않음.

### 3. Surgical Changes — 외과적 수정만

- *해야 할 것*만 고친다. 인접 코드·주석·서식을 *개선*하지 않는다.
- 안 깨진 걸 리팩터링하지 않는다. 기존 스타일을 따른다.
- 무관 dead code를 발견해도 *언급*만 하고 삭제하지 않는다.
- 본인 변경이 만든 orphan(import·변수·함수)만 제거한다.
- 테스트: *모든 변경 행이 사용자 요청에 직접 추적 가능한가?*
- BlueBird-specific: 본질 위협 6 시그널(`docs/strategy/positioning-and-vision-v1.md` §2)·항해 메타포 가드(`scripts/lint-copy.ts`) 외의 카피·디자인 sweep는 *사용자 요청 외 변경*. 별도 PR로만 진행.

### 4. Goal-Driven Execution — 검증 가능한 목표 + 루프

- 작업을 검증 가능한 목표로 변환한다:
  - "validation 추가" → "잘못된 입력에 대한 테스트를 작성하고 통과시킨다"
  - "버그 수정" → "재현 테스트를 작성하고 통과시킨다"
  - "X 리팩터링" → "변경 전·후 테스트가 모두 통과함을 확인한다"
- 다단계 작업은 짧은 계획 명시:
  ```
  1. [Step] → verify: [check]
  2. [Step] → verify: [check]
  ```
- BlueBird-specific 회귀 표준 3종: `tsc --noEmit` (lint 역할) · `vitest run` (127/127) · `npm run lint:copy` (카피 가드). 코드 변경 시 *이 3종 모두* `→ verify:` 라인에 명시.
- *카피 자산 PR 추가 게이트*: 머지 전 `rg '\*\*|^>|개정 사유|본 절은' lib/content/ app/manual/` **0건** 확인 필수.

---

**가드 작동 신호**: diff에 무관 변경이 줄고, 과복잡으로 다시 쓰는 일이 줄고, 명료화 질문이 *실수 후가 아니라 구현 전에* 등장한다.
