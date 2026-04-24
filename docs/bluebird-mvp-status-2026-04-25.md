# BlueBird MVP — 현행 명세 스냅샷

**기준일:** 2026-04-25
**브랜치:** main (origin/main 동기화됨)
**용도:** 전략 검토·외부 AI 공유용 단일 레퍼런스 문서

---

## 1. 제품 정체성

**인지 왜곡 탐지·교정을 통한 실존적 자율성 회복 PWA 앱.** 사용자의 자동 사고(System 1)를 Gemini 2.5 Flash 기반 NLP 분석으로 5대 CBT 왜곡 유형으로 분류한 뒤, 소크라테스식 질문으로 시스템 2(분석적 사고)를 강제 기동한다. 전망이론 S-curve로 주관적 왜곡과 객관 현실의 괴리를 시각화하고, Tiny Habit 형식으로 행동을 설계·확약하게 한다.

**이론적 기반:** Dual Process Theory, Prospect Theory, Metacognitive Therapy(CAS), 실존적 자율성.

**North Star Metric:** 주간 활성 사용자당 **Δpain 합계** (개입 전후 통증 점수 변화).

---

## 2. 핵심 사용자 여정

```
0. 인증 (/auth/login, /auth/signup) — Supabase Auth, 이메일/비밀번호
     ↓
1. 대시보드 (/dashboard)
   - Streak, 인지 아키타입, 통계 카드, 최근 활동
   - [NEW] 재평가 대기 카드(ReviewCard) — 6~48h 조건 시 노출
   - [NEW] 이번 주 줄어든 고통(Δpain) 통계 카드
     ↓
2. 로그 작성 (/log)
   - Step 1: trigger (5자+)
   - Step 2: thought (10자+)
   - Step 3: pain_score 선택 (1~5, emoji scale)
     ↓
3. AI 분석 (/analyze/[id])
   - [NEW] 위기 감지 훅 선행 (§5)
   - POST /api/analyze → Gemini 호출
   - 5대 왜곡 탐지 + frame_type + reference_point + probability +
     loss_aversion + CAS(rumination, worry) + decentering_prompt + system2_question_seed
   - POST /api/generate-questions → 소크라테스식 질문 3개 생성
   - 답변 3개 입력 → intervention 저장
     ↓
4. 시각화 (/visualize/[id])
   - Recharts 전망이론 S-curve + 사용자 데이터점
   - 왜곡 요약, 6지표, 내 답변 요약
     ↓
5. 행동 설계 (/action/[id])
   - Tiny Habit 템플릿 3개 (지배 왜곡별)
   - 행동 계획 입력(8자+) + 완료 체크
   - autonomy_score 산정 (§6)
     ↓
6. [NEW] 6~48h 후 재평가 사이클
   - 대시보드 진입 시 ReviewCard 1건 노출 (FIFO)
   - 클릭 → /review/[id] 전용 페이지
   - 원래 trigger/thought/답변/행동계획 리뷰
     (※원래 pain_score는 숨김 — 앵커링 방지)
   - pain_score 1~5 재입력 → intervention.reevaluated_pain_score 저장
   - Δpain = 초기 − 재평가, 대시보드·Insights 반영
     ↓
7. 부가 플로우
   - 모닝 체크인 (/checkin, KST 5~13시): mood_word
   - 이브닝 체크인 (/checkin, 그 외): system2_moment 한 줄
   - 성공 로그 (/log/success): 긍정 사건 + 대처, autonomy_score=15 고정 (1일 1회)
   - Insights (/insights): 왜곡 빈도, 자율성 시계열, Δpain 시계열, 레이더 차트
   - Manual (/manual): 6섹션 이론 매뉴얼
   - [NEW] /safety/resources: 공개 정신건강 자원 페이지 (1393 외)
   - /our-philosophy: 항해사 메타포 + [NEW] 의료 대체 불가 공시 + Gemini 전송 고지
```

---

## 3. 데이터 모델 (Supabase)

**굵은 글씨 = 2026-04-25 오늘 추가되거나 드리프트가 확인된 스키마 요소.**

| 테이블 | 핵심 컬럼 | RLS 상태 |
|--------|----------|----------|
| `logs` | user_id, trigger, thought, **pain_score(1-5)**, log_type('normal'\|'success') | ✅ 4 policies (SELECT/INSERT/UPDATE/DELETE) |
| `analysis` | log_id, distortion_type(5 enum\|null), intensity(0-1), segment, rationale, frame_type, reference_point, probability_estimate, loss_aversion_signal, cas_rumination, cas_worry, system2_question_seed, decentering_prompt | ⚠️ SELECT+INSERT만. **DELETE 정책 누락 (Known Gap)** |
| `intervention` | log_id, socratic_questions(JSONB[3]), user_answers(JSONB), theory_context, final_action, is_completed, autonomy_score, completed_at, **reevaluated_pain_score(1-5)**, **reevaluated_at**, **review_dismissed_at** | ✅ 3 policies (SELECT/INSERT/UPDATE) |
| `checkins` | user_id, type('morning'\|'evening'), mood_word, system2_moment | ⚠️ **마이그레이션 파일 누락 (Known Drift)** |
| `safety_events` | user_id, log_id, **level**('caution'\|'critical'), detected_by('keyword'\|'llm'\|'llm_fallback'), matched_pattern, llm_reason, user_override | ✅ 3 policies (SELECT/INSERT/UPDATE) |

**마이그레이션 파일:** `01_initial_schema.sql`, `02_protocol_fields.sql`, `03_safety_events.sql`, `04_logs_pain_score.sql`, `05_intervention_reevaluation.sql`

---

## 4. AI 파이프라인

**모델:** Gemini 2.5 Flash (두 용도, 다른 설정)

### A. 분석·질문 생성 (기존 + 오늘 일부 확장)
- `lib/ai/bluebird-protocol.ts`에 정의된 Master Protocol
- **BLUEBIRD_OPERATING_PRINCIPLES (4):** 데이터우선, 감정배제, 자율성지향, 경직성타파
- **BLUEBIRD_THEORY_SUMMARY (4):** 이중처리, 전망이론, 메타인지, 자율성
- **BLUEBIRD_DISTORTION_TAXONOMY (5):** 파국화, 흑백논리, 감정적 추론, 개인화, 임의적 추론 (각 진단·감별 규칙)
- **BLUEBIRD_FEW_SHOT_CASES (6):** input/output 예시 쌍
- JSON `responseSchema`로 출력 강제
- 재시도: 최대 2회, exponential backoff (429/5xx만)
- 파싱 실패 시 `DEFAULT_SOCRATIC_QUESTIONS` fallback
- **[NEW] 분석 입력에 `initial_pain_score` 필드 주입** (context만, 톤 분기 X)
- **[NEW] 모든 user-origin 입력은 `sanitizeForPrompt`로 새니타이즈**

### B. [NEW] 위기 감지 LLM 분류기
- 별도 어댑터 `lib/safety/gemini-adapter.ts`
- temperature=0.0, maxOutputTokens=256
- suspected 키워드 적중 시에만 호출
- 응답: `{ level: 'critical'|'caution'|'none', reason }`
- **Fail-closed**: throw/parse error 시 caution 반환

---

## 5. [NEW] 안전 장치 (Safety Floor)

### 5.1 위기 감지 파이프라인
- `/api/analyze` 진입 시 `detect()` 선행
- **1차 정규식 스크리너** (재현율 우선)
  - Critical 패턴 4개: 자살 직접(`죽고싶/죽어버리고싶`), 자살 단어, 자해 단어, 자해 서술형(`손목을 긋/그었/베`)
  - Suspected 패턴 5개: 사라지고싶, 끝내고싶, 못버티, 포기, 지쳤
- **2차 Gemini 재분류** (suspected 적중 시만)
- **감지 시 동작:** 분석 중단 → safety_events insert → SafetyNotice UI (1393, 1577-0199, 1388, 1366, 생명의전화 문자)
- **사용자 override:** "계속할래요" 2단계 확인 → `review_dismissed_at` 유사 로직으로 영구 우회, safety_events에 기록
- **UI 원칙:** 존재 인정, 판단·위로 금지, 복수 옵션(전화/문자/웹), 자율성 보장

### 5.2 프롬프트 인젝션 방어
- `lib/safety/prompt-sanitize.ts::sanitizeForPrompt(text)`
- **4계층:**
  1. 제어 문자 제거 (C0/C1/zero-width, `\n`·`\t`는 보존)
  2. LLM 토큰 차단 (`<|...|>`, `<s>`, `</s>`)
  3. 프롬프트 델리미터 이스케이프 (`<사용자 입력>`, `<Actual Input>` 등)
  4. 길이(2000자)·개행(3→2) 압축
- 적용처: llm-classifier(위기 분류), gemini analysis prompt, gemini socratic questions prompt, distortions[].segment

### 5.3 기타
- CSP, X-Frame-Options 등 보안 헤더 (기존)
- Supabase 모든 쿼리 anon key + 유저 세션 (service role 사용처 **0건** → RLS가 진짜 보호막)
- 의료 대체 불가 공시 (/our-philosophy)
- 정신건강 자원 공개 페이지 (/safety/resources) — 비로그인 접근 가능

---

## 6. 핵심 지표·계산식

### autonomy_score (행동 완료 시 부여)
```
autonomy_score = 10 + round(avg_intensity × 5) + min(3, answer_count)
                  [+15 if completion_note]
```
- 범위: 10~30 (일반) / 25~45 (completion_note 있음)
- 성공 로그는 **15 고정**

### [NEW] Δpain (Delta Pain)
```
deltaPain = logs.pain_score(초기) − intervention.reevaluated_pain_score(재평가)
```
- 양수 = 고통 감소 (통찰 성공)
- 음수 = 고통 증가
- null = 재평가 안 함 (집계 제외)

**대시보드 "이번 주 줄어든 고통":** 최근 7일 재평가 완료 건 중 **양수만 합산**
**Insights Δpain 시계열:** 일별 평균 (음수 포함 정직 표시, Y축 -4~+4, ReferenceLine y=0)

> **Δpain은 autonomy_score와 완전 분리됨.** Perverse incentive 방지 (점수 얻으려 고통 낮게 보고 유도 차단).

### Streak
- 연속된 분석 완료일 카운트 (`lib/utils/streak.ts`)

### 인지 아키타입
- 최근 기간 내 가장 빈번한 `distortion_type`을 사전 정의 매핑 테이블로 치환 (`lib/utils/archetype.ts`)

---

## 7. 2026-04-25 오늘 추가·변경된 피처 (4건)

1. **Crisis Detection v0** — `/api/analyze` 앞단에 2단계 감지 파이프라인. 자살/자해 의도 감지 시 분석 차단 + 복수 자원 옵션 안내 + safety_events 로깅. 사용자 override 허용.
2. **RLS 정적 감사 리포트 + 런타임 스크립트** — `docs/safety-rls-audit-2026-04-25.md`에 4 Critical + 2 Important 이슈 아카이빙. `scripts/rls-audit.ts`로 두 테스트 유저 생성 후 cross-tenant 접근 시도 자동 검증 가능.
3. **Prompt Injection Defense** — `sanitizeForPrompt` 4계층 방어를 위기 분류기 + 분석 프롬프트 + 소크라테스 질문 프롬프트에 전면 적용.
4. **Δpain Measurement v0** — 완료 6~48h 후 재평가 카드(비모달 FIFO) → 전용 페이지(/review/[id]) → 1~5 재입력 → 대시보드·Insights에 증거로 반영. autonomy_score와 분리된 독립 지표.

---

## 8. 기술 스택 & 테스트

- **Framework:** Next.js 16.2.3 + React 19.2.5 + TypeScript 6.0.2
- **Styling:** Tailwind 3.4.19
- **DB/Auth:** Supabase PostgreSQL + RLS + Auth
- **AI:** `@google/generative-ai` 0.24.1 (Gemini 2.5 Flash)
- **Charts:** Recharts 3.8.1
- **Validation:** Zod 4.3.6
- **Icons:** lucide-react
- **PWA:** `@ducanh2912/next-pwa` 10.2.9
- **Testing:** Vitest 2.1.9 — **58 단위 테스트 통과**
  - keyword-screener: 16
  - llm-classifier: 8
  - detect (파이프라인): 7
  - prompt-sanitize: 14
  - pending-review: 6
  - delta-pain: 7
- **CI:** 없음 (로컬 `npm test` + `npm run build` 기반)
- **호스팅:** Vercel (예상) + Supabase

---

## 9. 알려진 갭 (우선순위 순)

### P0 Safety Floor 잔여 (수동 확인 필요)
- [ ] `analysis` DELETE 정책 Supabase 대시보드 확인·추가 (RLS C4)
- [ ] `checkins` 테이블 DDL 추출 + 저장소 마이그레이션 동기화 (RLS C1)
- [ ] `logs.log_type` 컬럼 드리프트 해소 (RLS C2)
- [ ] `analysis.distortion_type` NOT NULL 드리프트 정리 (RLS C3)
- [ ] 런타임 RLS 감사 실행 (스테이징 프로젝트에서 `scripts/rls-audit.ts`)
- [ ] 임상심리 전문가 1~2명 자문 (크라이시스 키워드·톤 감수)

### P1 Evidence Engine 잔여
- [ ] **재발 감지** (같은 distortion_type 반복 시 과거 로그 제시)
- [ ] **과거 답변 재활용 힌트** (소크라테스 단계에서 "예전에 이렇게 답했어요")
- [ ] **주간 리포트** (템플릿 기반, LLM은 하이라이트 한 줄만)
- [ ] **Push 알림 인프라** (Web Push 기반)

### P2+
- [ ] 음성 입력 (Web Speech API, 한국어 STT)
- [ ] 다크 모드
- [ ] 데이터 내보내기 (GDPR 준수)
- [ ] Δpain 기반 아키타입 진화형 뷰
- [ ] 상관관계 인사이트 (n≥30 임계치, 가설문체)
- [ ] UI/E2E 통합 테스트 (현재 0건)

---

## 10. 의도적으로 **하지 않는** 것 (Design Principles)

| 거부한 제안 | 이유 |
|------------|------|
| 자율성 지수에 Δpain 가산점 결합 | Perverse incentive — 점수 얻으려 고통 낮게 보고 유도 차단 |
| 재평가 시 원래 pain_score 노출 | 앵커링 바이어스 — 자가보고 과학 원칙 위배 |
| 완료 시점 이모지 장식 | YAGNI, 기존 완료 버튼으로 종결감 충분 |
| 모달 패턴으로 재평가 요청 | 사용자 의도 방해, 트리거 리스크 |
| Pain 점수 기반 Gemini 톤 분기 | YAGNI, 효과 불명 |
| 확정문체 인사이트 ("당신은 X입니다") | 가설문체로 ("~경향이 보입니다, 체감되시나요?") — CBT 원칙 |
| 3rd party analytics에 민감 데이터 전송 | 자체 이벤트 테이블 선호 |

---

## 11. 저장소 상태

- **Repo:** github.com/Aliasss/bluebird-mvp
- **브랜치:** main (feature 브랜치 모두 머지 후 삭제)
- **주요 디렉토리:**
  - `app/` — Next.js App Router (pages + api)
  - `lib/safety/` — 위기 감지 + 새니타이저
  - `lib/review/` — Δpain 계산 유틸
  - `lib/ai/bluebird-protocol.ts` — Master Protocol 정의
  - `lib/openai/gemini.ts` — Gemini SDK 래퍼
  - `components/safety/`, `components/review/` — UI 컴포넌트
  - `supabase/migrations/` — 01~05 SQL
  - `docs/superpowers/specs/`, `docs/superpowers/plans/` — 설계·구현 문서
  - `docs/*smoke-checklist.md` — 수동 스모크 체크리스트
  - `scripts/rls-audit.ts` — 런타임 RLS 감사

---

## 12. 다음 합리적 단계 (CPO 관점)

1. **P0 잔여 정리** (사용자 수동 작업) — RLS 대시보드 확인, 스키마 drift 해소, 임상 자문 컨택
2. **P1 시작 — 재발 감지** — 같은 사용자의 과거 logs에서 동일 distortion_type을 벡터 유사도 또는 segment 유사도로 탐색, `/analyze` 결과 페이지에 "3주 전에도 비슷한 파국화가 있었어요. 그때 당신은 이렇게 답했습니다: [q3]" 카드 노출
3. **그 다음 — 주간 리포트** — 템플릿 기반 집계(총 Δpain, 재발 극복 횟수, 자율성 변화), Insight 하이라이트 1줄만 LLM. Push 없이 일요일 저녁 대시보드 인입 시 상단 배너로 1회 노출.

---

*이 문서는 commit `323791b` (main) 기준 스냅샷이며, 이후 커밋으로 상황이 바뀔 수 있음. 주요 기능 추가 시 별도 문서로 갱신 권장.*
