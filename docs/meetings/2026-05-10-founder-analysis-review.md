# All-Hands Topic Review — 파운더 자기분석 → MVP 액션 아이템

**일시**: 2026-05-10 (별도 토픽 리뷰, 주간 all-hands 별건)
**주차**: 2026-W19
**참여**: CEO + CPO(UX Researcher 동석) + CTO(QA Engineer 동석) + CSO(Risk Manager) + PO + strategy-manager + data-analyst (총 9명 dispatch)
**기록**: senior-qa-engineer
**입력**: 파운더 자기분석 → 제품 설계 인사이트 (대화 정리본, §1~7)
**아젠다**: 입력 문서를 바탕으로 MVP 기능 디벨롭 액션 아이템 도출
**연관 문서**: `docs/strategy/pmf-validation-plan.md`, `docs/im1/measurement-tool-research-2026-05-05.md`

---

## 0. 입력 문서 핵심 통찰 (3 줄)

1. 파운더 본인 사례에서 **감정적 추론 + 당위적 사고 + 이분법이 동시 작동** → 사용자 distortion도 단일이 아니라 **복합** 구조일 것
2. **Schema-level (반복되는 사고 운영체계) 종단 추적**이 GPT 래퍼와의 진짜 차별화 포인트
3. **분석 = 진전** 등치 위험 (지성화). 측정은 자기보고가 아니라 **관찰 가능한 행동 변화**에 anchor

---

## 1. Codebase 현황 — 액션 아이템 grounding

| 입력 §4 요구사항 | 현재 상태 | 격차 |
|---|---|---|
| §4.1 복합 distortion 출력 (단일 매핑 금지) | `lib/ai/bluebird-protocol.ts` 출력 schema는 `distortions: Array<{type, intensity, segment, rationale}>` — **이미 multi 구조** | UI/UX 시각화에서 1차 distortion만 강조하지 않는지 검증 필요 |
| §4.2 schema-level 종단 추적 | `user_patterns` 테이블 존재 (distortion 1건당 1 row, pain_score_delta, trigger_category snapshot) + `compute_pattern_stats()` 함수 + RLS 격리 | **UI 노출 0건** — IM.1 데이터 누적 후 격상 결정 (이미 G3 통과 후 분리 트랙 합의) |
| §4.3 PostHog 5~7 events | `lib/analytics/server.ts` + `analytics_events` 테이블 존재. 현재 4 events: `analyze_distortion_zero`, `analyze_retry_fired`, `analyze_parse_failed`, `questions_fallback` (모두 분석 품질 신호, 인지 단계 events 부재) | **인지 단계 events 0건** — 신규 추가 필요 |
| §4.4 회피 패턴 (분석↑ 행동↔) 감지 | `autonomy_score` 누적 (intervention 단위) | "분석 시도 vs 행동 변화" 격차 metric 정의 부재 |
| §4.5 학습된 사용자 메타 회피 | 카피 가드 (`scripts/lint-copy.ts`) 일부 | 메타 회피 행동 신호 탐지 0건 |

→ 인프라 격차는 §4.3·§4.4·§4.5에 집중. §4.1·§4.2는 **노출·시각화·격상** 결정 사항.

---

## 2. 각 조직 인사이트

### 2.1 CPO (UX Researcher 동석)

**핵심 통찰:**
- §4.1 (복합 distortion) — 백엔드 schema는 정합. 문제는 결과 화면(`/analyze/[id]`, `/visualize/[id]`)에서 **사용자가 "이건 ○○왜곡입니다" 1:1 매핑으로 인지하고 있는지**. 검증 미수행
- §4.2 (schema-level) — `compute_pattern_stats` 결과를 IM.1 D14 시점에 **CPO가 직접 1회 살펴보는 것**부터 시작 (UI 노출은 그 후). 운영자 인사이트가 우선
- §4.5 (학습된 사용자 메타회피) — BlueBird 카피 자체가 "당신은 ○○왜곡을 인식했다" 같은 **자기 정당화 자료**로 사용될 위험. 카피·UX 가이드 보강 필요

**제안 액션:**
- A1 [P0] 결과 화면 multi-distortion 시각화 audit (3개 distortion 동시 작동 시 모두 노출되는지)
- A2 [P1] IM.1 D14 schema-level pattern 분석 — `compute_pattern_stats` SQL 1회 실행 + 운영자 회고
- A3 [P0] 메타회피 카피 가드라인 추가 — "당신은 ○○를 정확히 인식했다" 류 칭찬형 카피 금지 룰

### 2.2 CTO (QA Engineer 동석)

**핵심 통찰:**
- §4.3 (인지 단계 events) — 기존 `analytics_events` 테이블에 4 events만. 추가 4~5 events로 §4.3 충족 가능. PostHog 외부 도입 불요 (operating surface ↑)
- §4.4 (회피 metric) — `autonomy_score` 시계열 + `analytics_events.distortion_identified` 빈도 비교 SQL view로 산출 가능. 데이터 모델 변경 0
- §4.1 (multi-distortion) — Gemini 출력 검증 — 같은 자동 사고 입력 시 안정적으로 multi 반환하는지 회귀 테스트 부재

**제안 액션:**
- A4 [P0] `analytics_events`에 인지 단계 events 4건 추가:
  - `distortion_identified` (분석 결과 노출 시)
  - `reframe_attempted` (`/analyze` 답변 시작 시)
  - `reframe_completed` (소크라테스 3개 답변 완료 시)
  - `action_completed` (`/action/[id]` is_completed 트리거 시)
- A5 [P1] avoidance gap view — `analytics_events` 빈도 vs `autonomy_score` 추세 격차 SQL view
- A6 [P1] Gemini multi-distortion 회귀 테스트 — fixture 5건 (복합 distortion 케이스), 단일 매핑 반환 시 fail

### 2.3 Risk Manager

**핵심 통찰:**
- §5.1 (파운더-제품 외화 위험) — 가장 우선. founder 의사결정이 본인 정서 상태에 anchor되는 회로 차단 필요. 입력 §3.3 "통제 불가 환경 정서 내성 부족" schema는 회사 운영 결정에도 그대로 발현 위험
- §5.3 (지성화 방어) — Claude/Gemini 분석 누적이 행동 회피 도구로 기능. **본 회의 자체가 동일 패턴**일 위험 검토 필요 (분석은 했으나 IM.1 모집이 deadline 경과)
- §4.5 (학습된 사용자 메타회피) — 법적 함의: BlueBird 사용 후 사용자가 "분석했으니 충동 결정 정당하다"로 이행 시 **운영자 책임 회피 가능 영역인지** 별도 자문 필요. 약관·면책 보강 후보

**제안 액션:**
- A7 [P0] founder 30일 결정 지연 룰 운영 도입 — 본인이 회사 진로·중대 의사결정 변경 시 30일 보류. CEO 자가 적용. 위반 시 본 회의록에서 점검
- A8 [P0] 분석 1시간당 검증 행동 1개 원칙 — strategy-manager가 주간 운영 KPI에 반영
- A9 [P1] 메타회피 법적 자문 검토 — `app/disclaimer/page.tsx` "BlueBird 사용 결과로 사용자가 충동적 결정을 정당화하는 데 사용한 경우 운영자 책임 범위" 명문화 후보. legal-review 별도 트랙
- A10 [P0] founder 자기 적용 효과 본 비율 메타 트래킹 — 디자인 결정마다 "본인이 직접 BlueBird를 써서 효과를 본 적 있는가" 1줄 self-test (CEO 자가, 결정 commit message 또는 spec footnote)

### 2.4 PO

**핵심 통찰:**
- 입력 §6 Step 1 (CD-Quest Google Form 60~90분) — **deadline 이미 경과**. 우선순위 최상
- 본 분석으로 측정 인프라 요건이 명확해졌으나, **베타 모집이 0명이면 모든 measurement 무용**. 모집 차단 요인 우선 해소
- 입력 §4.4 회피 신호 ("분석 시도 ↑, 행동 변화 ↔")는 IM.1 D14 측정 항목에 즉시 추가 가능

**제안 액션:**
- A11 [P0] CD-Quest 한국어판 → Google Form 이전 — 60~90분, 디자인 0%·자체 문항 0% (입력 §6 Step 1 그대로)
- A12 [P0] IM.1 모집 GO 판정 — `_actions.md` overdue 11번 (DEADLINE PASSED) 즉시 처리
- A13 [P1] 노에시스 자체 5~7문항 초안 — Form 이전 후 1주 내 추가 (입력 §6 Step 2)

### 2.5 strategy-manager / data-analyst

**핵심 통찰 (strategy-manager):**
- 입력 §5 자기치료 외화 위험 모니터링 — 운영 KPI 1개 추가 ("이번 주 분석 N건 중 검증 행동으로 이어진 건수")
- 입력 §4.4 회피 패턴 metric은 사용자뿐 아니라 **회사 운영에도 동일 적용** — 미팅 routine에 자기 점검 포함

**핵심 통찰 (data-analyst):**
- §4.4 avoidance gap SQL view 산출 정의 가능. 데이터 모델 변경 0, view 1개로 가능
- §4.2 schema-level — `compute_pattern_stats` 결과를 D14에 1회 분석 → 데이터 부족 시 instructive failure 보고

**제안 액션:**
- A14 [P0] 운영 KPI 추가 — 주간 "분석 시간 vs 검증 행동 수" 비율 (strategy-manager, weekly all-hands에 포함)
- A15 [P1] `v_avoidance_gap` view 작성 — 사용자별 분석 빈도/autonomy_score 시계열 격차 (data-analyst, 1주)
- A16 [P2] schema-level pattern 인사이트 보고 — IM.1 D14 시점 1회 (data-analyst + CPO)

---

## 3. Cross-functional 합의 — 3 핵심 통찰

| # | 통찰 | 합의 |
|---|---|---|
| 1 | **단일 distortion 매핑은 GPT 래퍼와 동급. 복합 + schema-level이 BlueBird 해자** | 분석 출력 schema는 이미 multi (정합). UI 시각화·종단 노출이 차별화 격차. P0(audit) → P1(metric) → P2(노출) 순으로 진행 |
| 2 | **자기보고 metric만으로 성공 판정 금지. 행동 변화 measurable metric에 anchor** | `autonomy_score` + `action_completed` event 시계열을 IM.1 측정 1차 변수로 채택. CD-Quest는 보조 |
| 3 | **founder 자기치료 효과 ≠ 제품 성공.** founder 사각지대 = 제품 사각지대 위험 | founder 자기 적용 비율 메타 트래킹 + 30일 결정 지연 룰 + 분석/행동 1:1 원칙 — 3중 안전장치 도입 |

---

## 4. 액션 아이템 (P0/P1/P2)

| # | Action | Owner | Due | 출처 §  | P |
|---|---|---|---|---|---|
| **A11** | CD-Quest 한국어판 → Google Form 이전 (60~90분, 0% 디자인) | PO | **2026-05-12** (overdue 처리) | §6 Step1 | P0 |
| **A12** | IM.1 모집 GO 판정 + 게시 시작 | CEO + CPO | **2026-05-12** | §6 Step3 | P0 |
| **A4** | `analytics_events` 인지 단계 4 events 추가 (`distortion_identified`, `reframe_attempted`, `reframe_completed`, `action_completed`) | senior-fullstack-engineer | 2026-05-17 | §4.3 | P0 |
| **A1** | `/analyze`·`/visualize` multi-distortion 시각화 audit | designer + PO | 2026-05-17 | §4.1 | P0 |
| **A3** | 메타회피 카피 가드라인 추가 — "당신은 정확히 인식했다" 류 칭찬 카피 금지 룰 | CPO + UX Researcher | 2026-05-17 | §4.5 | P0 |
| **A7** | founder 30일 결정 지연 룰 운영 도입 (회사 진로·중대 결정 30일 보류) | CEO (Risk Manager 모니터) | 즉시 (운영) | §5.2 | P0 |
| **A8** | "분석 1시간당 검증 행동 1개" 원칙 — 주간 KPI 반영 | strategy-manager | 다음 weekly all-hands부터 | §5.3 | P0 |
| **A10** | founder 자기 적용 효과 본 비율 메타 트래킹 — 디자인 결정마다 self-test 1줄 | CEO (자가) | 즉시 (운영) | §5.1 | P0 |
| **A14** | 주간 KPI: "분석 시간 vs 검증 행동 수" 비율 | strategy-manager | 다음 weekly all-hands | §5.3 | P0 |
| **A13** | 노에시스 자체 5~7문항 초안 → Form 통합 | CPO + UX Researcher | 2026-05-19 | §6 Step2 | P1 |
| **A5** | `v_avoidance_gap` view (분석 빈도/autonomy_score 격차) | data-analyst | 2026-05-24 | §4.4 | P1 |
| **A6** | Gemini multi-distortion 회귀 테스트 (fixture 5건) | senior-qa-engineer | 2026-05-24 | §4.1 | P1 |
| **A9** | 메타회피 법적 자문 — `app/disclaimer/page.tsx` 책임 범위 명문화 후보 | Risk Manager | 2026-05-24 | §4.5 | P1 |
| **A2** | IM.1 D14 schema-level pattern 분석 — `compute_pattern_stats` 1회 실행 + 회고 | CPO + data-analyst | IM.1 D14 시점 | §4.2 | P2 |
| **A16** | schema-level pattern 인사이트 보고 — IM.1 D14 1회 | data-analyst + CPO | IM.1 D14 시점 | §4.2 | P2 |

**총 15 actions: P0 9건 / P1 4건 / P2 2건.**

---

## 5. 결정잠금 (변경 금지 — IM.1 종료 전까지)

본 회의에서 다음 결정은 별도 spec 개정 없이 변경 금지:

- ✅ **분석 출력은 multi-distortion 구조 유지** (1:1 매핑 절대 금지) — `lib/ai/bluebird-protocol.ts` `distortions: Array<>` schema lock
- ✅ **측정 1차 변수 = 행동 metric** (`autonomy_score`, `action_completed` event). CD-Quest·노에시스 척도는 보조
- ✅ **founder 자기치료 효과 ≠ 제품 성공** — 별도 측정. founder 본인 회복이 제품 KPI에 invasion 금지
- ✅ **분석 = 진전 등치 금지** — 산출물의 learning value vs build value 분리 평가
- ✅ **30일 결정 지연 룰** — founder 회사 진로 변경 시 강제. 위반 시 다음 회의록에서 점검
- ✅ **칭찬형 메타회피 카피 금지** — "당신은 ○○를 정확히 인식했다" 등 자기 정당화 자료화 회피

---

## 6. 후속 검토 일정

| 일정 | 검토 항목 |
|---|---|
| 다음 standup (2026-05-12) | A11·A12 진척 (CD-Quest Form + IM.1 모집 GO) |
| 다음 weekly all-hands (2026-05-17) | A1·A3·A4·A7·A8·A10·A14 진척, P0 9건 완료 검증 |
| IM.1 D7 (모집 시작 +7일) | A5·A6·A9 진척, 메타회피 운영 신호 1차 점검 |
| IM.1 D14 (베타 종료) | A2·A16 schema-level 분석 + 본 회의 결정잠금 6항목 재검증 |

---

## 7. Out-of-Scope (본 회의 결의 외)

- PostHog 외부 도입 — 자체 `analytics_events` 테이블로 충분 (operating surface 우선)
- Schema-level 종단 추적 UI 노출 — IM.1 D14 데이터 누적 후 별도 결정 (현재 G3 후 별도 트랙 합의 유지)
- 노에시스 척도 외 추가 자체 척도 — IM.1 데이터로 자체 5~7문항 검증 후 결정
- founder 30일 룰 자동화 — 수동 운영으로 시작, 재발 시 자동화 검토

---

## 8. 회의 종료

본 회의 자체가 입력 §5.3 "분석 누적 = 행동 회피"의 발현 가능성 — **즉시 실행 가능한 P0 9건 중 A11·A12·A7·A10은 회의 종료 24시간 내 시작 권고**. 본 회의록은 분석 산출물이며 이를 행동으로 전환하는 것이 차후 24시간의 우선 과제.

senior-qa-engineer 정합성 확인: 본 회의록의 액션 아이템 15건은 모두 (a) 측정 가능, (b) 명시적 owner, (c) due date 보유. _actions.md seed 후속 처리 필요.
