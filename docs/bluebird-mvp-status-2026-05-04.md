# BlueBird MVP — 현행 명세 스냅샷

**기준일:** 2026-05-04
**브랜치:** main (origin/main 동기화됨, HEAD = `baa484d`)
**용도:** 전략 검토·외부 AI 공유용 단일 레퍼런스 문서
**이전 버전:** `docs/bluebird-mvp-status-2026-04-25.md`

---

## 0. 직전 버전(2026-04-25) 대비 누적 변화 요약

| 영역 | 변화 |
|---|---|
| **데이터 모델** | 마이그레이션 06~12 추가 (트리거 카테고리·계정 삭제·분석 메트릭·패턴/집계·온보딩·checkins·schema drift 정합화) |
| **온보딩** | Act 3구성 9 슬라이드 + redirect·다시 보기·complete API |
| **리텐션 인프라** | 매뉴얼·통계 데이터 스키마 (미노출, 자발 언급 임계 도달 시 격상) |
| **안전·운영** | PII 마스킹 server-logger 도입 (`app/api/**` 17건 console.error 마이그레이션) |
| **약관·정체성** | "회사" → "운영자" 치환, 1인 운영 사실 명시, 영어식 쉼표·표기 정합 |
| **랜딩** | 모바일 fold 안에 sample CTA 진입, 시나리오 1개 노출 + 토글, 가입 버튼 후순위화 |
| **카피 가드** | 항해 메타포 글리프 4종(✦✧★☆) lint-copy 차단 |
| **조직** | product-owner(CPO 산하), risk-manager(CSO 산하), senior-qa-engineer(CTO 산하) 추가 |
| **P0 Safety Floor 잔여** | 5건 모두 해소 (analysis DELETE, checkins migration, log_type drift, distortion_type NOT NULL, RLS 감사) |

---

## 1. 제품 정체성

**한국어 인지 디버깅 도구 — 1인 운영자가 관리하는 분석 PWA.** 사용자의 자동 사고(System 1)를 Gemini 2.5 Flash 기반 NLP 분석으로 5대 CBT 왜곡 유형으로 분류한 뒤, 소크라테스식 질문으로 시스템 2(분석적 사고)를 강제 기동한다. 전망이론 S-curve로 주관적 왜곡과 객관 현실의 괴리를 시각화하고, Tiny Habit 형식으로 행동을 설계·확약하게 한다.

**이론적 기반:** Dual Process Theory, Prospect Theory, Metacognitive Therapy(CAS), 실존적 자율성.

**North Star Metric:** 주간 활성 사용자당 **Δpain 합계** (개입 전후 통증 점수 변화).

**카테고리 가드레일:** 의료기기·DTx·정서 챗봇·일반 스트레스 관리 앱 X. *분석가형 자기이해 선호자의 1번 도구.*

**약관·표기 정체성 (2026-05-04 정정):** BlueBird = "1인 운영자가 관리하는 분석 도구". `app/terms/page.tsx`·`app/privacy/page.tsx` 도입부에서 명시. 본문 권한·면책 주체는 "운영자".

---

## 2. 핵심 사용자 여정 (현 구현)

```
0. 인증 (/auth/login, /auth/signup, /auth/callback) — Supabase Auth
     ↓
0.5. 무가입 funnel (/sample → /sample/[caseId])
     - 3사례 미리 분석된 결과 캐시 노출 (실제 Gemini 호출 결과 그대로)
     - 가입 전환 CTA → /auth/signup
     - AI 호출 0회 (어뷰징 차단)
     ↓
1. [NEW] 온보딩 (/onboarding/[1-3], 가입 직후 강제)
   - Act 3구성 9 슬라이드 (Bluebird Operating Principles + 이론 요약 + 행동 미리보기)
   - reached_act 진행도 추적 + complete API
     ↓
2. 대시보드 (/dashboard)
   - Streak, 인지 아키타입, 통계 카드, 최근 활동
   - 재평가 대기 카드(ReviewCard) — 6~48h 조건
   - 이번 주 줄어든 고통(Δpain) 통계 카드
     ↓
3. 로그 작성 (/log)
   - Step 1: trigger (5자+, sanitize)
   - Step 2: thought (10자+, sanitize)
   - Step 3: pain_score (1~5)
     ↓
4. AI 분석 (/analyze/[id])
   - 위기 감지 훅 선행 (§5)
   - POST /api/analyze → Gemini 호출
   - 5대 왜곡 + 이론 6지표 + decentering_prompt + system2_question_seed
   - [NEW] trigger_category 자동 분류 (8개 도메인) + 60일 재방문 배너
   - POST /api/generate-questions → 소크라테스 3개
   - 답변 저장 → intervention
     ↓
5. 시각화 (/visualize/[id])
   - Recharts 전망이론 S-curve + 사용자 데이터점
     ↓
6. 행동 설계 (/action/[id])
   - Tiny Habit 템플릿 + 행동 계획 (8자+) + 완료/재평가
   - autonomy_score 산정 (§6)
     ↓
7. 6~48h 후 재평가 (/review/[id])
   - pain_score 재입력 → reevaluated_pain_score
   - Δpain = 초기 − 재평가
     ↓
8. 부가 플로우
   - 모닝/이브닝 체크인 (/checkin, /checkin/history) — KST 시간대 기준
   - 성공 로그 (/log/success) — autonomy_score=15 고정 (1일 1회)
   - Insights (/insights) — 왜곡 빈도·자율성 시계열·Δpain·아키타입·[NEW] 패턴 리포트
   - Journal (/journal) — 최근활동/행동계획 탭
   - Manual (/manual), Our Philosophy (/our-philosophy)
   - Account (/me, /me/delete-account, /account/recover)
   - Safety (/safety/resources) — 비로그인 접근 가능
   - PWA Install (/install)
   - Legal (/terms, /privacy, /disclaimer)
```

**총 사용자 대면 페이지: 28개.** TODO/placeholder/dummy 잔존 0건.

---

## 3. 데이터 모델 (Supabase)

**굵은 글씨 = 2026-05-04 기준 신규·변경.**

| 테이블 | 핵심 컬럼 | RLS 상태 |
|---|---|---|
| `logs` | user_id, trigger, thought, pain_score(1-5), log_type('normal'\|'success'\|null), **trigger_category** (8 enum) | ✅ 4 policies (SELECT/INSERT/UPDATE/DELETE) |
| `analysis` | log_id, distortion_type(5 enum\|**null 허용**), intensity, segment, frame_type, reference_point, probability_estimate, loss_aversion_signal, cas_rumination, cas_worry, system2_question_seed, decentering_prompt | ✅ **4 policies (DELETE 정책 신설 — 본인 log 한정 EXISTS)** |
| `intervention` | log_id, socratic_questions(JSONB[3]), user_answers(JSONB), final_action, is_completed, autonomy_score, completed_at, reevaluated_pain_score, reevaluated_at, review_dismissed_at, **completion_note(≤200)**, **completion_reaction('improved'\|'same'\|'worse')** | ✅ 3 policies (DELETE 의도적 미추가 — 코드 grep 0건) |
| **`checkins`** | user_id, type('morning'\|'evening'), mood_word, system2_moment | ✅ **마이그레이션 11에서 정합화 — RLS SELECT/INSERT 본인만, UPDATE/DELETE 의도적 미추가 (append-only + auth.users CASCADE)** |
| `safety_events` | user_id, log_id, level('caution'\|'critical'), detected_by, matched_pattern, llm_reason, user_override | ✅ 3 policies (SELECT/INSERT/UPDATE) |
| `analytics_events` | event_type, payload, user_id | ✅ INSERT만 (anon SELECT 차단, 운영자 SQL editor 전용) |
| `user_patterns` | anon_user_hash (SHA256), pattern_data (JSONB) | ✅ 2 policies (append-only 설계) |
| `user_aggregates_daily` | aggregate_date, distortion_counts(JSONB), trigger_counts(JSONB) | ✅ SELECT만 (INSERT/UPDATE service_role 전용) |
| `user_onboarding` | user_id, reached_act (1-3), completed_at | ✅ 3 policies (SELECT/INSERT/UPDATE) |

**마이그레이션 파일 (12개):** `01_initial_schema.sql`, `02_protocol_fields.sql`, `03_safety_events.sql`, `04_logs_pain_score.sql`, `05_intervention_reevaluation.sql`, **`06_trigger_category.sql`**, **`07_account_deletion.sql`**, **`08_analytics_events.sql`**, **`09_user_patterns_aggregates.sql`**, **`10_onboarding_completed.sql`**, **`11_checkins.sql`**, **`12_schema_drift_fixes.sql`**

---

## 4. AI 파이프라인

**모델:** Gemini 2.5 Flash (분석·질문 + 위기 분류, 별도 설정)

### A. 분석·질문 생성
- `lib/ai/bluebird-protocol.ts` — Master Protocol 단일 진실원
- BLUEBIRD_OPERATING_PRINCIPLES (4) / THEORY_SUMMARY (4) / DISTORTION_TAXONOMY (5) / FEW_SHOT_CASES (6)
- JSON `responseSchema` 강제, 재시도 최대 2회 exponential backoff
- 파싱 실패 시 `DEFAULT_SOCRATIC_QUESTIONS` fallback
- `initial_pain_score` context 주입 (톤 분기 X)
- 모든 user-origin 입력 `sanitizeForPrompt`로 새니타이즈
- **회귀 보호 인프라**: `scripts/eval-distortion-fix.ts` (분석/질문 라이브 검증), `scripts/generate-sample-cases.ts` (샘플 캐시 갱신)

### B. 위기 감지 LLM 분류기
- `lib/safety/gemini-adapter.ts`, temperature=0.0, maxOutputTokens=256
- suspected 키워드 적중 시에만 호출
- Fail-closed (throw/parse error → caution)

### C. 분석 품질 메트릭 로깅 (운영)
- `lib/analytics/server.ts` → `analytics_events` 테이블
- 4개 이벤트: `analyze_distortion_zero`, `analyze_parse_failed`, `analyze_retry_fired`, `questions_fallback`
- 운영 대시보드는 미구현 (P1 백로그) — 현재는 SQL editor 의존

---

## 5. 안전 장치 (Safety Floor)

### 5.1 위기 감지 파이프라인 (`lib/safety/`)
- `/api/analyze` 진입 시 `detect()` 선행
- 1차 정규식 스크리너 (재현율 우선): critical 4종 + suspected 5종
- 2차 Gemini 재분류 (suspected 적중 시만)
- 감지 시 분석 중단 → safety_events insert → SafetyNotice UI (1393, 1577-0199, 1388, 1366)
- 사용자 override 2단계 확인, safety_events에 기록
- **vitest 30+ 케이스 (keyword/llm/detect/sanitize)**

### 5.2 프롬프트 인젝션 방어 (`lib/security/`, `lib/safety/prompt-sanitize.ts`)
- 4계층: 제어문자 / LLM 토큰 / 델리미터 / 길이·개행
- `MAX_AI_TEXT_LENGTH=1200` 입력 길이 제한
- 적용처: 위기 분류, 분석 프롬프트, 소크라테스 질문, distortions[].segment

### 5.3 [NEW] PII 마스킹 server-logger (`lib/logging/server-logger.ts`)
- `logServerError(scope, err, context)` 시그니처
- 자동 마스킹 (Set 기반 키 매칭, exact + case-sensitive):
  - `userId` / `user_id` / `logId` / `log_id` → SHA256 short hash 8자
  - `email` → `a***@b.com`
  - `text` / `thought` / `trigger` / `content` / `message` / `moodWord` / `system2Moment` / `situation` / `system2Action` / `note` / `completionNote` → length only (`{length: N}`)
- 비PII 키는 그대로 직렬화
- `app/api/**/route.ts` 17건 마이그레이션 완료
- **스코프 외 잔존**: `lib/auth/account-deletion.ts:16` (client-safe logger 분리 필요, P1), `lib/openai/gemini.ts:420,472` (DEBUG_ANALYZE 가드 안, P2), 클라이언트 컴포넌트 8건 (별도 처리 필요)

### 5.4 기타
- CSP, X-Frame-Options 등 보안 헤더
- service_role 사용처 0건 (RLS가 진짜 보호막)
- Rate Limiting: 인메모리 슬라이딩 윈도우 + Supabase 분당 한도 혼합 (단일 region 강제 권고, Upstash 격상은 G1 통과 후)
- 의료 대체 불가 공시 (/our-philosophy, /disclaimer, /safety/resources)

---

## 6. 핵심 지표·계산식 (변경 없음)

### autonomy_score
```
autonomy_score = 10 + round(avg_intensity × 5) + min(3, answer_count)
                  [+15 if completion_note]
```
범위 10~30 / 25~45 (note 포함). 성공 로그 = 15 고정.

### Δpain
```
deltaPain = logs.pain_score(초기) − intervention.reevaluated_pain_score(재평가)
```
양수 = 고통 감소. autonomy_score와 완전 분리(perverse incentive 방지).

### Streak / 인지 아키타입
- `lib/utils/streak.ts`, `lib/utils/archetype.ts`

### [NEW] 트리거 카테고리 매칭
- 8개 도메인 enum 자동 분류 (commit `678325e`)
- 60일 이내 같은 카테고리 + dominant 왜곡 매칭 시 재방문 배너 (`a4f7d26`)

---

## 7. 2026-04-26 ~ 2026-05-04 변경 (커밋 흐름)

### Tier 1 — 결제 가설 A 강화 (4-26)
- `678325e` 트리거 카테고리 자동 분류 (8 도메인)
- `a4f7d26` 트리거 재방문 감지 (60일 이내)
- `7fd0c57` 개인화 패턴 리포트 ("당신의 사고 지문")

### Tier 1.5 — 분석 품질 회귀 보호 인프라
- `8880f18` 한국어 우회 어미 false negative 4겹 방어
- `4619a20` Question 폴백 100% 발동 fix (4096 토큰 한국어 효율)
- `e96ccb7` 무가입 체험 funnel
- `f3c3b4b` 디자인 토큰 토대 (Pretendard variable)

### 본질 위협 #1·#2 해소 + lint-copy 가드
- `0035943` 항해 메타포 글리프 4종(✦✧★☆) lint-copy 차단
- `b481dcf` 시나리오 카피 + 시맨틱 + viewport + touch target
- `dc60d8e` `<ul role="list">` + footer touch target 32px

### 리텐션 인프라 + 온보딩
- `2325f1b` 리텐션 (a)+(c) 데이터 스키마 + 통계 수집 (미노출)
- `5b5d252` 리텐션 메커니즘 v1 strategy 통합
- `bd4fdfa` user_onboarding 테이블 (마이그레이션 10)
- `c2dec63` 온보딩 9 슬라이드 (Act 3구성)
- `12dea40` 온보딩 redirect + 다시 보기 + COMFORT 패턴 격상
- `2d1082f` 카피 존댓말 통일 + "분석가" 셀프 라벨 제거
- `455175b` 9 슬라이드 카피 풀어쓰기
- `9e0c679` 쉼표 sweep 11건 + 카너먼 노벨 표기
- `9bea580` LossCas 라벨 그래프 겹침 해결
- `138b54d` paragraphs 본문 — 13건 제거

### 조직 변화
- `c3d49af` 시니어 PO 정식 합류 (CPO 산하)
- `80d6ca1` risk-manager (변호사 출신 15년차) CSO 산하 추가
- `129cbeb` senior-qa-engineer CTO 산하 추가

### 약관·랜딩·1인 운영자 정체성 (2026-05-04 세션)
- `6dd162a` 랜딩 모바일 fold sample CTA 진입 + 시나리오 토글 + 가입 버튼 후순위화
- `1ee6df4` "회사" → "운영자" 치환 + 1인 운영 사실 명시
- `d158eec` "(개인사업자 미등록)" 표기 삭제 (risk-manager B안 권고)
- `1603d2e` 제5조 영어식 쉼표 1건 제거
- `8c15a12` 제4조 나열 표기 가운뎃점 통일

### P0 Safety Floor 잔여 5건 해소 (2026-05-04 세션)
- `5bee7d5` schema drift 정합화 마이그레이션 (P0-1·P0-2·P0-3): `11_checkins.sql` + `12_schema_drift_fixes.sql` (analysis DELETE RLS, log_type 컬럼, distortion_type NOT NULL 완화, intervention completion_*)
- `69557cd` PII 마스킹 server-logger + console.error 17건 마이그레이션 (P0-6)
- `c72df0c` `.env.local.example` + README 환경변수 섹션 (P0-5)
- `baa484d` server-logger cosmetic fix (QA 발견)
- 운영자 직접: 프로덕션 DB에 11/12 마이그레이션 적용 + `scripts/rls-audit.ts` 1회 실행 (P0-4)

---

## 8. 기술 스택 & 테스트

- **Framework:** Next.js 16.2.3 + React 19.2.5 + TypeScript 6.0.2
- **Styling:** Tailwind 3.4.19, Pretendard variable
- **DB/Auth:** Supabase PostgreSQL + RLS (19+ policies)
- **AI:** `@google/generative-ai` 0.24.1 (Gemini 2.5 Flash)
- **Charts:** Recharts 3.8.1
- **Validation:** Zod 4.3.6
- **PWA:** `@ducanh2912/next-pwa` 10.2.9 (webpack 빌드 전용)
- **Testing:** Vitest 2.1.9 — 60+ 단위 테스트
  - safety: keyword-screener, llm-classifier, detect, prompt-sanitize
  - intervention: action-plan, autonomy-score
  - review: delta-pain, pending-review
  - insights: trigger-revisit
  - utils: archetype
- **CI:** lint-copy 가드(항해 메타포 글리프 차단) + grep 기반. 정식 GitHub Actions workflow는 P1 (`copy-guard.yml` 미구현)
- **호스팅:** Vercel + Supabase
- **Logging:** `lib/logging/server-logger.ts` PII 마스킹 wrapper (server-only, `node:crypto` 의존)

---

## 9. 알려진 갭 (우선순위 순)

### P0 Safety Floor — **모두 해소됨 (2026-05-04)**

### P1 — 베타 시작 직전 1주
- [ ] **IM.1 베타 모집 폼 — 1차 타겟 3축 스크리너** (직무 narrowing 어휘 금지)
- [ ] **S3 카피 가드 grep CI workflow** (`.github/workflows/copy-guard.yml` 정식화)
- [ ] **Crisis Detection 정규식 띄어쓰기 보강 + 합성 테스트 30건** (한글 가변성 `\s*`)
- [ ] **Zod 검증 실패 graceful fallback** (분석 재시도 UI + auto retry)
- [ ] **분석 메트릭 운영 대시보드 v0** (Supabase view 3개 + 보호 라우트, G1 4개 지표 자동 표시)
- [ ] **Rate Limit 단일 region 강제** + README 한계 명시 (Upstash 격상은 G1 통과 후)
- [ ] **임상심리 전문가 1~2명 자문** (Crisis 키워드·톤 감수)
- [ ] `lib/auth/account-deletion.ts` server-only 분리 + `logServerError` 적용

### P2 — 60일 G1 도달 전 (베타 운영 중)
- [ ] 자발 언급 코딩 결과 수집 (5종 트리거: 매뉴얼/통계/톤/신체화/통증 vs 스트레스)
- [ ] M30.1 인터뷰 ≥30명 실행·녹취·코딩
- [ ] 결제 의향 instrument 설계 (가격 노출 없이 ranking 기반)
- [ ] `gemini.ts:420,472` DEBUG_ANALYZE 경로도 `logServerError` 통일
- [ ] 재발 감지 (같은 distortion_type 반복 시 과거 로그 제시)
- [ ] 과거 답변 재활용 힌트
- [ ] 주간 리포트 (템플릿 기반)

### P3 — G1 통과 후
- [ ] 매뉴얼 prototype 격상 (자발 언급 ≥10% 트리거)
- [ ] 통계 prototype 격상 (자발 언급 ≥10% 트리거)
- [ ] 신체화 매핑 모듈 D 노출 (자발 언급 ≥10% 트리거)
- [ ] Push 알림 인프라 (Web Push)
- [ ] 외부 마케팅·결제·환불 인프라 (사업자 등록 시점)
- [ ] Upstash Redis Rate Limit 격상
- [ ] 음성 입력, 다크 모드, 데이터 내보내기, UI/E2E 통합 테스트

---

## 10. 의도적으로 **하지 않는** 것 (Design Principles)

| 거부한 제안 | 이유 |
|---|---|
| 자율성 지수에 Δpain 가산점 결합 | Perverse incentive — 점수 얻으려 고통 낮게 보고 차단 |
| 재평가 시 원래 pain_score 노출 | 앵커링 바이어스 |
| 모달 패턴으로 재평가 요청 | 사용자 의도 방해, 트리거 리스크 |
| Pain 점수 기반 Gemini 톤 분기 | YAGNI |
| 확정문체 인사이트 ("당신은 X입니다") | 가설문체로 — CBT 원칙 |
| 3rd party analytics에 민감 데이터 전송 | 자체 이벤트 테이블 선호 |
| 항해 메타포·자연 이미지·파스텔 톤 | **본질 위협 #1·#2** — lint-copy 가드 + 디자인 정렬 완료 |
| "외롭지 않게"·"함께·치유·회복" 류 카피 | **본질 위협 #6** — 분석가 톤 정체성 침식 |
| "스트레스 관리" 메뉴·카피 | **본질 위협 #3** — 카테고리 침식 |
| "회사" 자기 호칭 (1인 운영 상태에서) | 사실 부정확 + 약관 효력 다툼 빌미 (risk-manager 권고) |
| "(개인사업자 미등록)" 약관 도입부 적극 표기 | 법적 의무 없음, 신뢰 저하 + 라이프사이클 부담 (risk-manager B안) |
| 정기 자기 라벨링 체크인 (분석가 셀프 라벨 등) | 셀프 라벨 카피 제거 (`2d1082f`) |

---

## 11. 저장소·조직

### 저장소
- **Repo:** github.com/Aliasss/bluebird-mvp
- **브랜치 정책:** main 직결 (1인 운영 + 작은 변경). feature 브랜치는 임시
- **주요 디렉토리:**
  - `app/` — Next.js App Router (28 페이지 + 10 API 라우트)
  - `lib/safety/` — 위기 감지 + 새니타이저
  - `lib/security/` — ai-guard, rate-limit
  - `lib/logging/` — **server-logger (PII 마스킹)**
  - `lib/review/` — Δpain 계산
  - `lib/ai/bluebird-protocol.ts` — Master Protocol
  - `lib/openai/gemini.ts` — Gemini SDK 래퍼
  - `lib/analytics/server.ts` — 분석 품질 메트릭 로깅
  - `lib/utils/` — streak·archetype
  - `supabase/migrations/` — 01~12 SQL
  - `scripts/` — `rls-audit.ts`, `eval-distortion-fix.ts`, `generate-sample-cases.ts`
  - `docs/strategy/` — 전략 문서 (positioning, pmf-validation, competitive, retention)
  - `.claude/agents/` — 9개 에이전트 정의

### 조직 (`.claude/agents/`)
```
                    파운더 (1인 운영자)
                          │
        ┌─────────────────┼─────────────────┐
       CPO               CSO               CTO
        │                 │                 │
   ┌────┴────┐    ┌──────┴──────┐    ┌─────┴──────┐
designer  PO    strategy-mgr  risk-mgr  fullstack  QA
                                        (CTO)    (CTO)
```

---

## 12. 다음 합리적 단계

### 권장 안전선 (PO 통합 백로그 v1)
**MVP 베타 테스트 시작: 2026-05-13 (수)** — P0 + P1-1·P1-2·P1-4 처리 후.

### 즉시 착수 후보
1. **P1-2 카피 가드 CI workflow** (S 공수, 회귀 보호 인프라 우선)
2. **P1-4 Zod 검증 graceful fallback** (M 공수, 첫 인상 파괴 방어)
3. **P1-1 베타 모집 폼 + 1차 타겟 3축 스크리너** (M 공수, 파운더 비중 큼)

### 운영 액션 (코드 외)
- 프로덕션 DB에 11/12 마이그레이션 적용 (Supabase 대시보드 SQL editor)
- `scripts/rls-audit.ts` 1회 실행 + 결과 `docs/security/rls-audit-2026-05.md` 커밋
- 임상심리 자문 1~2명 컨택

---

*이 문서는 commit `baa484d` (main) 기준 스냅샷이다. 주요 기능 추가·전략 변경 시 별도 문서로 갱신 권장.*
