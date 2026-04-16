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
