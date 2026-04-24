# Δpain Measurement — Design Spec

**작성일:** 2026-04-25
**Phase:** P1 Evidence Engine의 첫 단위
**Status:** Design approved, ready for plan

---

## Why (북스타 직결)

> BlueBird는 사용자에게 자신의 인지 변화를 **증거 기반**으로 돌려주는 기계다.

현재 BlueBird는 분석·질문·행동까지 수행하지만, **개입 이후 실제로 인지가 교정됐는지**를 측정하지 않는다. `pain_score`(1~5)는 입력 시점에만 수집되고, 이후 어디에도 활용되지 않아 사용자에게 "나아지고 있다"는 증거가 되돌아가지 않는다.

이것이 리텐션의 가장 큰 구멍이다. 분석의 정교함과 이론의 깊이만으론 "나한테 효과 있나?" 질문에 답할 수 없다.

**Δpain = 개입 전(log 작성 시) pain_score 와 충분한 시간 경과 후 재평가 pain_score의 차이.**
이 단일 지표가 BlueBird 효능의 가장 직접적인 증거가 된다.

---

## 핵심 설계 결정 (이미 확정)

### 1. 재평가 시점: 다음 세션 진입 시 (C안)

- 완료 후 6~48시간 경과 + 사용자가 대시보드에 재접속 시 노출
- 6시간 미만: "completion buzz effect"로 데이터 유효성 낮음
- 48시간 초과: 맥락 증발 + 기억 감쇠로 재평가 신뢰도 저하

### 2. Δpain ≠ autonomy_score (독립 지표)

- Δpain에 인센티브(보너스 점수, 뱃지 등) **부여 금지**
- Perverse incentive 방지 — 점수 얻기 위해 고통 낮게 보고하는 행동 차단
- autonomy_score는 현재 공식 유지 (`10 + round(intensity×5) + min(3, answers) [+15 if completion_note]`)
- Δpain은 별도 통계만

### 3. UI 패턴: 비침습적 카드 → 전용 페이지

- 대시보드 상단 **비모달 카드** (닫기 가능)
- 클릭 시 `/review/[id]` 전용 페이지로 이동
- 모달 패턴 거부 — 사용자 의도 방해, 트리거 가능성

### 4. 완료 시점 변화 없음

- 이모지 반응 같은 종결 장식 추가 **하지 않음**
- "완료" 버튼 + autonomy_score 가산이 종결감 제공으로 충분

### 5. 원래 pain_score 숨김 (앵커링 방지)

- 재평가 페이지에서 **처음 입력한 점수 노출하지 않음**
- 자가보고 측정의 과학적 원칙 — 앵커가 있으면 비교 편향 발생

### 6. 다수 대기 건은 1건씩 FIFO

- 6~48h 창에 미재평가 log가 여러 개인 경우, 가장 오래된 1건만 카드로 노출
- 완료·해제 시 다음 노출 (압도 방지)

### 7. 해제(닫기)는 영구

- X 버튼 클릭 시 해당 log는 다시 카드로 뜨지 않음
- 사용자 자율성 > 데이터 수집 욕구

### 8. Δpain 음수는 정직하게 표시

- 음수(더 고통): "이 건은 아직 힘드시네요" 중립·공감 톤
- 양수(줄어듦): "고통이 {n}점 줄었어요"
- 0: "이 건은 그대로네요"
- 모두 통계에 포함 (왜곡 금지)

### 9. pain_score를 분석 프롬프트에 주입하되 톤 분기는 없음

- `buildAnalysisPrompt`에 `pain_score` 필드 추가 → Gemini가 맥락으로 활용
- 현재 톤·질문 난이도를 조건부로 바꾸지는 **않음** (YAGNI, 효과 불명)

---

## 데이터 모델

### 기존 (변경 없음)
- `logs.pain_score INT` — 이미 코드에서 사용 중이나 마이그레이션 파일 누락 상태 (RLS 감사 리포트 C2). **이번 작업에서 누락 마이그레이션 파일도 같이 생성**하여 저장소 동기화.

### 신규
- `intervention` 테이블에 2개 컬럼 추가
  - `reevaluated_pain_score INT NULL CHECK (reevaluated_pain_score BETWEEN 1 AND 5)`
  - `reevaluated_at TIMESTAMPTZ NULL`
- `intervention` 테이블에 1개 컬럼 추가 (닫기 상태 기록)
  - `review_dismissed_at TIMESTAMPTZ NULL` — X 버튼으로 영구 해제 시 타임스탬프 기록

**RLS:** `intervention` 테이블의 기존 정책이 자동으로 적용됨 (SELECT/UPDATE via EXISTS join to logs.user_id — 01_initial_schema.sql 참조). 신규 컬럼은 정책 재작성 불필요.

### 마이그레이션 파일

| 파일 | 내용 |
|------|------|
| `supabase/migrations/04_logs_pain_score.sql` | RLS drift 해소: `ALTER TABLE logs ADD COLUMN IF NOT EXISTS pain_score INT`. 대시보드 DDL과 이미 일치할 가능성 높지만 저장소 동기화 목적 |
| `supabase/migrations/05_intervention_reevaluation.sql` | reevaluated_pain_score, reevaluated_at, review_dismissed_at 추가 |

---

## 사용자 플로우

```
[로그 작성] /log
  trigger + thought + pain_score (initial) → logs 테이블
     │
[분석·질문·행동] /analyze → /visualize → /action
  기존과 동일
     │
[완료] /action/[id]
  final_action 저장 + autonomy_score 부여 + completed_at 기록
  변경 없음
     │
     │  ── 6~48h 경과 ──
     ↓
[대시보드 진입] /dashboard
  ├─ 조건 쿼리: intervention 중
  │     is_completed = true
  │     AND completed_at BETWEEN NOW() - 48h AND NOW() - 6h
  │     AND reevaluated_pain_score IS NULL
  │     AND review_dismissed_at IS NULL
  │     AND logs.pain_score IS NOT NULL  -- 초기 pain_score 없으면 Δpain 계산 불가 → 제외
  │  오래된 completed_at 기준 FIFO로 1건
  └─ 그 log 있으면 상단에 카드 렌더링
     │
     ├─ [사용자 카드 X 클릭] → POST /api/review/dismiss → review_dismissed_at 기록 → 카드 사라짐 → 다음 대기 건 있으면 그게 노출
     │
     └─ [사용자 카드 클릭] → /review/[id] 진입
          ├─ 상단: "시간이 조금 지났네요. 이 문제를 지금 돌아보면 어떤가요?"
          ├─ 원래 trigger 전문 + 내 소크라테스 답변 요약 (3개) + 행동 계획 표시
          │   (원래 pain_score 숨김)
          ├─ pain_score 재입력 (1~5 버튼)
          └─ [저장] POST /api/review/pain-score
                ├─ intervention.reevaluated_pain_score, reevaluated_at 저장
                └─ 대시보드 복귀 + toast "돌아보기가 기록됐어요"
     │
[대시보드·Insights 반영]
  ├─ 통계 카드: "이번 주 줄어든 고통" (7일 내 Δpain 양수 합계)
  └─ Insights: Δpain 시계열 라인차트 (별도, autonomy와 분리)
```

---

## 컴포넌트·파일 구조

### 신규 파일

| 파일 | 역할 |
|------|------|
| `supabase/migrations/04_logs_pain_score.sql` | logs.pain_score drift 해소 |
| `supabase/migrations/05_intervention_reevaluation.sql` | reevaluation 컬럼 3개 추가 |
| `app/review/[id]/page.tsx` | 재평가 전용 페이지 |
| `app/api/review/pain-score/route.ts` | reevaluated_pain_score 저장 엔드포인트 |
| `app/api/review/dismiss/route.ts` | review_dismissed_at 기록 엔드포인트 |
| `components/review/ReviewCard.tsx` | 대시보드 상단 비모달 카드 |
| `lib/review/pending-review.ts` | "다음 재평가 대기 log" 조회 유틸 (서버용) |
| `lib/review/delta-pain.ts` | Δpain 계산·집계 유틸 |
| `tests/review/pending-review.test.ts` | FIFO·6-48h 윈도우 로직 단위 테스트 |
| `tests/review/delta-pain.test.ts` | 음수·양수·0 처리 단위 테스트 |

### 수정 파일

| 파일 | 변경 |
|------|------|
| `app/dashboard/page.tsx` | ReviewCard 렌더링, Δpain 통계 카드 추가 |
| `app/insights/page.tsx` | Δpain 시계열 라인차트 섹션 추가 |
| `lib/openai/gemini.ts` | `buildAnalysisPrompt`에 `pain_score` 입력 추가 |
| `app/api/analyze/route.ts` | pain_score를 gemini 호출에 전달 |
| `types/index.ts` | `Intervention` 타입에 reevaluated_pain_score, reevaluated_at, review_dismissed_at 추가 |

---

## API 계약

### `POST /api/review/pain-score`

```json
// Request
{ "logId": "uuid", "painScore": 1|2|3|4|5 }

// Response 200
{ "ok": true, "deltaPain": number }

// Response 400: invalid input
// Response 401: not authenticated
// Response 404: log not found or not owned
// Response 409: already reevaluated or dismissed
```

**Side effects:**
- `intervention.reevaluated_pain_score = painScore`
- `intervention.reevaluated_at = NOW()`
- 응답의 `deltaPain = logs.pain_score - painScore` (양수 = 줄었음)

### `POST /api/review/dismiss`

```json
// Request
{ "logId": "uuid" }

// Response 200
{ "ok": true }

// 401/404/409 동일
```

**Side effects:**
- `intervention.review_dismissed_at = NOW()`

---

## UI 컴포넌트 계약

### `ReviewCard`

```tsx
interface ReviewCardProps {
  logId: string;
  triggerSnippet: string;    // logs.trigger 앞 40자
  daysAgo: number;            // 예: 1 (몇 일 전)
  onDismiss: () => void;      // X 버튼 클릭 시
}
```

- Dashboard에서 조건 충족 시 1개만 렌더링
- 닫기 버튼 클릭 → `/api/review/dismiss` 호출 → 성공 시 `onDismiss()` → 부모가 다음 대기 건 fetch 또는 숨김 처리
- 카드 본문 클릭 → `router.push('/review/' + logId)`

---

## 지표 계산

### Δpain (단일 건)
```
deltaPain = logs.pain_score - intervention.reevaluated_pain_score
```
- 양수 = 고통 감소
- 음수 = 고통 증가
- 0 = 변화 없음
- null (미재평가): 집계 제외

### 이번 주 줄어든 고통 (대시보드 카드)
```
SUM(GREATEST(deltaPain, 0))  -- 양수만 집계
WHERE completed_at >= NOW() - 7 days
  AND reevaluated_pain_score IS NOT NULL
  AND user_id = auth.uid()
```

### Insights 시계열 (일별)
```
각 일별 평균 deltaPain (null 제외)
Recharts LineChart로 렌더
X축: 최근 30일 날짜
Y축: -4 ~ +4 (이론적 범위)
```

---

## 테스트 전략

### 단위 테스트 (Vitest)
- `lib/review/pending-review.ts`
  - 6시간 미만 경과: null 반환
  - 48시간 초과: null 반환
  - 6~48h 내 여러 건: 가장 오래된 1건 반환
  - reevaluated 된 건: 제외
  - dismissed 된 건: 제외
  - is_completed = false: 제외
- `lib/review/delta-pain.ts`
  - 양수 Δpain 집계
  - 음수는 0으로 클램프 후 합산 (양수만 대시보드 노출)
  - null 재평가는 제외
  - 단일 건 계산: `pain_score=5, reevaluated=2 → 3`

### 통합 테스트 (수동 스모크)
- 별도 `docs/delta-pain-smoke-checklist.md`로 정리
- 시나리오: 완료 후 6시간 미만 진입 / 6~48h 내 진입 / 48시간 초과 진입 / 닫기 영구성 / 다수 대기 FIFO

---

## Out of Scope (v1 이후)

- 재발 감지 (같은 distortion_type 반복 추적)
- 과거 답변 재활용 힌트
- 주간 리포트 (별도 Δpain 활용 플랜)
- Push 알림 ("재평가 하실래요?" 외부 트리거)
- Δpain 기반 사용자 세분화·아키타입 진화
- `analysis.distortion_type` NULL 허용 정책 수정 (RLS 감사 C3 — 별도 이슈)
- `analysis` DELETE 정책 추가 (RLS 감사 C4 — 별도 이슈)

---

## 의사결정 로그

- **A(즉시 재평가) vs C(다음 세션):** C 선택. Completion buzz로 데이터 오염 방지.
- **B(Push 알림):** 인프라 없음. 나중에 추가 시 C에서 자연 확장 가능.
- **자율성 가산점:** 거부. Perverse incentive 방지, Δpain 순수 측정 보존.
- **모달:** 거부. 비모달 카드 채택.
- **완료 시 이모지:** 거부. YAGNI.
- **원래 pain_score 노출:** 거부. 앵커링 방지.
- **다수 대기 시 압도:** 거부. FIFO 1건.
- **해제 후 재노출:** 거부. 영구 해제, 사용자 자율성 우선.
- **음수 Δpain:** 정직 표시, 게임화 X.
- **pain_score 톤 분기:** 거부. YAGNI.

---

## 예상 범위

- 5~8 태스크
- ~200 테스트(단위 + 통합 합산)
- Crisis detection v0(14 태스크, 29 테스트)보다 **약간 작음**
- 마이그레이션은 사용자가 Supabase 대시보드에서 실행
