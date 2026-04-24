# Δpain Measurement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`).

**Goal:** 사용자가 분석·행동을 완료한 뒤 6~48시간 경과 후 재접속 시 비모달 카드 → 전용 페이지에서 pain_score를 재평가하고, 그 차이(Δpain)를 대시보드·Insights에 증거로 돌려주는 시스템.

**Architecture:** Supabase 테이블 `intervention`에 재평가 컬럼 3개 추가. 대시보드 서버 쿼리로 "재평가 대기 중인 가장 오래된 1건"을 FIFO로 조회해 카드 노출. 카드 → `/review/[id]` 전용 페이지에서 사용자가 점수 재입력. Δpain은 autonomy_score와 분리된 독립 지표로 별도 집계·시각화.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Supabase, Vitest, Recharts.

---

## File Structure

**신규 생성:**

| 파일 | 역할 |
|------|------|
| `supabase/migrations/04_logs_pain_score.sql` | RLS 감사 C2 drift 해소: `logs.pain_score` 명시 |
| `supabase/migrations/05_intervention_reevaluation.sql` | `intervention`에 3개 컬럼 추가 |
| `lib/review/pending-review.ts` | 재평가 대기 log 조회 서버 유틸 |
| `lib/review/delta-pain.ts` | Δpain 계산·집계 유틸 |
| `tests/review/pending-review.test.ts` | 6-48h 윈도우·FIFO·제외 조건 테스트 |
| `tests/review/delta-pain.test.ts` | 단일 계산·음수·양수·null 처리 테스트 |
| `components/review/ReviewCard.tsx` | 대시보드 상단 비모달 카드 |
| `app/review/[id]/page.tsx` | 재평가 전용 페이지 |
| `app/api/review/pain-score/route.ts` | 재평가 점수 저장 엔드포인트 |
| `app/api/review/dismiss/route.ts` | 카드 해제 엔드포인트 |
| `docs/delta-pain-smoke-checklist.md` | 수동 스모크 시나리오 |

**수정:**

| 파일 | 변경 범위 |
|------|----------|
| `types/index.ts` | `Intervention` 타입에 3개 필드 추가 |
| `lib/openai/gemini.ts` | `AnalysisInput`에 `pain_score?: number` 추가 + 프롬프트에 한 줄 주입 |
| `app/api/analyze/route.ts` | `pain_score`를 Gemini 호출 인자로 전달 |
| `app/dashboard/page.tsx` | ReviewCard 조건부 렌더링 + 주간 Δpain 통계 카드 |
| `app/insights/page.tsx` | Δpain 시계열 라인차트 섹션 |

---

## Task 0: 데이터베이스 마이그레이션 SQL 작성

**Files:**
- Create: `supabase/migrations/04_logs_pain_score.sql`
- Create: `supabase/migrations/05_intervention_reevaluation.sql`

SQL 파일만 작성한다. 실행은 사용자가 Supabase SQL Editor에서 직접 수행.

- [ ] **Step 1: `04_logs_pain_score.sql` 작성**

```sql
-- RLS 감사(2026-04-25) C2 이슈 해소:
-- app/log/page.tsx, app/api/success-log/route.ts에서 pain_score를 사용하지만
-- 01_initial_schema.sql에 컬럼이 정의돼 있지 않음. 프로덕션 DB에는 대시보드에서
-- 수동 추가돼 있을 것으로 추정. 저장소와 동기화 목적.
-- IF NOT EXISTS 덕분에 이미 컬럼이 있으면 no-op.

ALTER TABLE logs
  ADD COLUMN IF NOT EXISTS pain_score INT
    CHECK (pain_score IS NULL OR (pain_score BETWEEN 1 AND 5));
```

- [ ] **Step 2: `05_intervention_reevaluation.sql` 작성**

```sql
-- Δpain 측정을 위한 재평가 컬럼 추가.
-- reevaluated_pain_score: 사용자가 완료 후 6-48h 시점에 다시 매긴 pain score (1-5)
-- reevaluated_at: 재평가 시점
-- review_dismissed_at: 사용자가 카드 X로 영구 해제한 시점 (이후 카드 안 뜸)

ALTER TABLE intervention
  ADD COLUMN IF NOT EXISTS reevaluated_pain_score INT
    CHECK (reevaluated_pain_score IS NULL OR (reevaluated_pain_score BETWEEN 1 AND 5)),
  ADD COLUMN IF NOT EXISTS reevaluated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_dismissed_at TIMESTAMPTZ;

-- 대시보드 쿼리 성능용 인덱스. completed_at 범위 + NULL 필터 조합이 잦음.
CREATE INDEX IF NOT EXISTS idx_intervention_pending_review
  ON intervention(completed_at DESC)
  WHERE is_completed = TRUE
    AND reevaluated_pain_score IS NULL
    AND review_dismissed_at IS NULL;
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/04_logs_pain_score.sql supabase/migrations/05_intervention_reevaluation.sql
git commit -m "feat(delta-pain): add migrations for logs.pain_score sync and intervention reevaluation columns"
```

- [ ] **Step 4: 사용자 안내 메모**

마이그레이션 파일만 작성했을 뿐 **실행은 사용자가 Supabase 대시보드 SQL Editor에서 직접** 수행해야 한다. 플랜 실행 중 Task 8까지 진행해도 DB에 컬럼이 없으면 런타임 에러. 스모크 테스트 전까지 사용자가 마이그레이션 실행했는지 확인할 것.

---

## Task 1: 타입 확장

**Files:**
- Modify: `types/index.ts`

- [ ] **Step 1: `Intervention` 인터페이스에 필드 추가**

현재 `types/index.ts`의 `Intervention` 선언(대략 40-53 라인)을 확인하고, 아래 3개 필드를 `completed_at` 뒤에 추가한다:

```ts
  reevaluated_pain_score?: number | null;
  reevaluated_at?: string | null;
  review_dismissed_at?: string | null;
```

수정 후 `Intervention` 전체 모양은 다음과 같아야 한다:

```ts
export interface Intervention {
  id: string;
  log_id: string;
  socratic_questions: string[];
  user_answers: Record<string, string>;
  theory_context?: Record<string, unknown>;
  final_action: string | null;
  is_completed: boolean;
  autonomy_score: number | null;
  created_at: string;
  completed_at?: string | null;
  reevaluated_pain_score?: number | null;
  reevaluated_at?: string | null;
  review_dismissed_at?: string | null;
}
```

- [ ] **Step 2: `Log` 인터페이스에 `pain_score` 추가 (이미 있으면 스킵)**

`Log` 인터페이스에 `pain_score?: number | null`이 없다면 `thought` 뒤에 추가:

```ts
export interface Log {
  id: string;
  user_id: string;
  trigger: string;
  thought: string;
  pain_score?: number | null;
  log_type?: 'normal' | 'success';
  created_at: string;
}
```

- [ ] **Step 3: 타입체크**

Run: `npm run lint`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add types/index.ts
git commit -m "feat(delta-pain): add reevaluation and pain_score fields to Intervention/Log types"
```

---

## Task 2: pending-review 유틸 TDD

**Files:**
- Create: `lib/review/pending-review.ts`
- Create: `tests/review/pending-review.test.ts`

핵심 로직: 사용자의 완료된 intervention 중 "재평가 대기" 조건을 모두 만족하는 가장 오래된 1건을 반환. Supabase 쿼리를 감싼 순수 함수가 아니라, 쿼리 빌드 + 결과 필터링을 가진 실제 DB 쿼리 함수다. TDD 방식: DB 응답을 mock한 fake 클라이언트로 테스트.

- [ ] **Step 1: 실패 테스트 #1 — 6-48h 윈도우 필터링**

Create `tests/review/pending-review.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { findPendingReview, type PendingReviewClient } from '@/lib/review/pending-review';

function makeClient(rows: unknown[]): PendingReviewClient {
  return {
    queryPendingInterventions: vi.fn().mockResolvedValue({ data: rows, error: null }),
  };
}

describe('findPendingReview', () => {
  it('대기 건 없으면 null 반환', async () => {
    const client = makeClient([]);
    const result = await findPendingReview({ userId: 'u1', now: new Date(), client });
    expect(result).toBeNull();
  });

  it('대기 1건 있으면 그 건 반환', async () => {
    const now = new Date('2026-04-25T10:00:00Z');
    const ten_hours_ago = new Date('2026-04-25T00:00:00Z').toISOString();
    const client = makeClient([
      {
        id: 'i1',
        log_id: 'log1',
        completed_at: ten_hours_ago,
        logs: { id: 'log1', trigger: '회의 직전 긴장', pain_score: 4 },
      },
    ]);
    const result = await findPendingReview({ userId: 'u1', now, client });
    expect(result).not.toBeNull();
    expect(result?.logId).toBe('log1');
    expect(result?.triggerSnippet).toContain('회의');
    expect(result?.initialPainScore).toBe(4);
  });

  it('여러 건 중 가장 오래된(FIFO) 1건 반환', async () => {
    const now = new Date('2026-04-25T10:00:00Z');
    const client = makeClient([
      {
        id: 'i-old',
        log_id: 'log-old',
        completed_at: '2026-04-24T20:00:00Z',
        logs: { id: 'log-old', trigger: '오래된 것', pain_score: 3 },
      },
      {
        id: 'i-new',
        log_id: 'log-new',
        completed_at: '2026-04-25T01:00:00Z',
        logs: { id: 'log-new', trigger: '새 것', pain_score: 2 },
      },
    ]);
    const result = await findPendingReview({ userId: 'u1', now, client });
    expect(result?.logId).toBe('log-old');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- pending-review`
Expected: Cannot resolve import.

- [ ] **Step 3: 구현 (최소)**

Create `lib/review/pending-review.ts`:

```ts
// 대시보드 진입 시 재평가 대기 중인 가장 오래된 intervention을 찾는다.
// 조건(모두 AND):
//   1. intervention.is_completed = true
//   2. NOW() - 48h <= completed_at <= NOW() - 6h
//   3. intervention.reevaluated_pain_score IS NULL
//   4. intervention.review_dismissed_at IS NULL
//   5. logs.pain_score IS NOT NULL  (초기 점수 없으면 Δpain 계산 불가)
// 정렬: completed_at ASC (가장 오래된 = FIFO)
// 반환: 1건 또는 null

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

export interface PendingReviewRow {
  id: string;
  log_id: string;
  completed_at: string;
  logs: { id: string; trigger: string; pain_score: number | null };
}

export interface PendingReviewClient {
  queryPendingInterventions(args: {
    userId: string;
    completedAtGte: string;
    completedAtLte: string;
  }): Promise<{ data: PendingReviewRow[] | null; error: unknown }>;
}

export interface PendingReview {
  logId: string;
  interventionId: string;
  triggerSnippet: string;
  initialPainScore: number;
  completedAt: string;
  daysAgo: number;
}

export interface FindPendingReviewInput {
  userId: string;
  now: Date;
  client: PendingReviewClient;
}

function truncateTrigger(trigger: string, max = 40): string {
  if (trigger.length <= max) return trigger;
  return trigger.slice(0, max) + '…';
}

function daysBetween(older: Date, now: Date): number {
  const ms = now.getTime() - older.getTime();
  return Math.max(1, Math.floor(ms / (24 * 60 * 60 * 1000)));
}

export async function findPendingReview(
  input: FindPendingReviewInput
): Promise<PendingReview | null> {
  const completedAtLte = new Date(input.now.getTime() - SIX_HOURS_MS).toISOString();
  const completedAtGte = new Date(input.now.getTime() - FORTY_EIGHT_HOURS_MS).toISOString();

  const { data, error } = await input.client.queryPendingInterventions({
    userId: input.userId,
    completedAtGte,
    completedAtLte,
  });

  if (error || !data || data.length === 0) return null;

  // FIFO: 가장 오래된 completed_at부터
  const sorted = [...data].sort((a, b) =>
    a.completed_at.localeCompare(b.completed_at)
  );

  // logs.pain_score null 제외
  const valid = sorted.find((row) => row.logs?.pain_score != null);
  if (!valid) return null;

  return {
    logId: valid.log_id,
    interventionId: valid.id,
    triggerSnippet: truncateTrigger(valid.logs.trigger),
    initialPainScore: valid.logs.pain_score as number,
    completedAt: valid.completed_at,
    daysAgo: daysBetween(new Date(valid.completed_at), input.now),
  };
}
```

- [ ] **Step 4: 통과 확인**

Run: `npm test -- pending-review`
Expected: 3 pass.

- [ ] **Step 5: 실패 테스트 #2 — 초기 pain_score null 제외**

Append:

```ts
describe('findPendingReview - 초기 pain_score null 제외', () => {
  it('pain_score null인 log는 건너뜀', async () => {
    const now = new Date('2026-04-25T10:00:00Z');
    const client = makeClient([
      {
        id: 'i1',
        log_id: 'log-null',
        completed_at: '2026-04-24T20:00:00Z',
        logs: { id: 'log-null', trigger: '점수 없음', pain_score: null },
      },
    ]);
    const result = await findPendingReview({ userId: 'u1', now, client });
    expect(result).toBeNull();
  });

  it('pain_score 없는 건은 건너뛰고 다음 건 반환', async () => {
    const now = new Date('2026-04-25T10:00:00Z');
    const client = makeClient([
      {
        id: 'i1',
        log_id: 'log-null',
        completed_at: '2026-04-24T18:00:00Z', // 더 오래됨
        logs: { id: 'log-null', trigger: '점수 없음', pain_score: null },
      },
      {
        id: 'i2',
        log_id: 'log-ok',
        completed_at: '2026-04-24T20:00:00Z',
        logs: { id: 'log-ok', trigger: '점수 있음', pain_score: 3 },
      },
    ]);
    const result = await findPendingReview({ userId: 'u1', now, client });
    expect(result?.logId).toBe('log-ok');
  });
});
```

- [ ] **Step 6: 통과 확인**

Run: `npm test -- pending-review`
Expected: 5 pass. (기존 구현이 `find`로 valid만 고르므로 자연 통과)

- [ ] **Step 7: 에러 경로 테스트**

Append:

```ts
describe('findPendingReview - 에러 처리', () => {
  it('client가 error 반환 시 null', async () => {
    const client: PendingReviewClient = {
      queryPendingInterventions: vi.fn().mockResolvedValue({
        data: null,
        error: new Error('db down'),
      }),
    };
    const result = await findPendingReview({
      userId: 'u1',
      now: new Date(),
      client,
    });
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 8: 통과 확인**

Run: `npm test -- pending-review`
Expected: 6 pass.

- [ ] **Step 9: Commit**

```bash
git add lib/review/pending-review.ts tests/review/pending-review.test.ts
git commit -m "feat(delta-pain): pending-review utility with FIFO + null-pain-score filtering"
```

---

## Task 3: delta-pain 계산 유틸 TDD

**Files:**
- Create: `lib/review/delta-pain.ts`
- Create: `tests/review/delta-pain.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

Create `tests/review/delta-pain.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  calcDeltaPain,
  sumPositiveDeltaPain,
  type PainPair,
} from '@/lib/review/delta-pain';

describe('calcDeltaPain', () => {
  it('양수 Δpain (고통 감소)', () => {
    expect(calcDeltaPain(5, 2)).toBe(3);
  });

  it('음수 Δpain (고통 증가)', () => {
    expect(calcDeltaPain(2, 4)).toBe(-2);
  });

  it('변화 없음', () => {
    expect(calcDeltaPain(3, 3)).toBe(0);
  });

  it('재평가 null이면 null', () => {
    expect(calcDeltaPain(5, null)).toBeNull();
  });

  it('초기 null이면 null', () => {
    expect(calcDeltaPain(null, 3)).toBeNull();
  });
});

describe('sumPositiveDeltaPain', () => {
  it('양수만 합산, 음수·0·null 제외', () => {
    const pairs: PainPair[] = [
      { initial: 5, reevaluated: 2 }, // +3
      { initial: 4, reevaluated: 4 }, // 0 (제외)
      { initial: 2, reevaluated: 5 }, // -3 (제외)
      { initial: 5, reevaluated: null }, // null (제외)
      { initial: 3, reevaluated: 1 }, // +2
    ];
    expect(sumPositiveDeltaPain(pairs)).toBe(5);
  });

  it('빈 배열 0', () => {
    expect(sumPositiveDeltaPain([])).toBe(0);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- delta-pain`
Expected: Cannot resolve.

- [ ] **Step 3: 구현**

Create `lib/review/delta-pain.ts`:

```ts
// Δpain = initial - reevaluated
// - 양수: 고통 감소 (통찰 성공)
// - 음수: 고통 증가
// - null 입력은 계산 불가 → null 반환

export interface PainPair {
  initial: number | null;
  reevaluated: number | null;
}

export function calcDeltaPain(
  initial: number | null,
  reevaluated: number | null
): number | null {
  if (initial == null || reevaluated == null) return null;
  return initial - reevaluated;
}

// 대시보드 "이번 주 줄어든 고통" 카드용.
// 양수만 합산 — 음수는 "고통이 더 늘었다"는 신호이므로 "줄어든 고통" 지표에 섞이면 안 됨.
// (Insights 시계열 차트에서는 음수도 정직하게 표시)
export function sumPositiveDeltaPain(pairs: PainPair[]): number {
  let total = 0;
  for (const p of pairs) {
    const d = calcDeltaPain(p.initial, p.reevaluated);
    if (d != null && d > 0) total += d;
  }
  return total;
}
```

- [ ] **Step 4: 통과 확인**

Run: `npm test -- delta-pain`
Expected: 7 pass.

- [ ] **Step 5: Commit**

```bash
git add lib/review/delta-pain.ts tests/review/delta-pain.test.ts
git commit -m "feat(delta-pain): calcDeltaPain + sumPositiveDeltaPain utilities"
```

---

## Task 4: API — `/api/review/pain-score`

**Files:**
- Create: `app/api/review/pain-score/route.ts`

- [ ] **Step 1: 엔드포인트 작성**

Create `app/api/review/pain-score/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const schema = z.object({
  logId: z.string().uuid(),
  painScore: z.number().int().min(1).max(5),
});

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { logId?: string; painScore?: number };
    const parsed = schema.safeParse({
      logId: body.logId?.trim(),
      painScore: body.painScore,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: '유효한 logId와 painScore(1-5)가 필요합니다.' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 소유권 확인 + 초기 pain_score 조회 (Δpain 응답용)
    const { data: logRow, error: logErr } = await supabase
      .from('logs')
      .select('id, pain_score, user_id')
      .eq('id', parsed.data.logId)
      .eq('user_id', user.id)
      .single();
    if (logErr || !logRow) {
      return NextResponse.json({ error: '로그를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 중복 재평가 방지
    const { data: interventionRow, error: intErr } = await supabase
      .from('intervention')
      .select('id, is_completed, reevaluated_pain_score, review_dismissed_at')
      .eq('log_id', parsed.data.logId)
      .single();
    if (intErr || !interventionRow) {
      return NextResponse.json({ error: 'intervention을 찾을 수 없습니다.' }, { status: 404 });
    }
    if (!interventionRow.is_completed) {
      return NextResponse.json({ error: '완료되지 않은 intervention은 재평가할 수 없습니다.' }, { status: 409 });
    }
    if (interventionRow.reevaluated_pain_score != null) {
      return NextResponse.json({ error: '이미 재평가한 건입니다.' }, { status: 409 });
    }
    if (interventionRow.review_dismissed_at != null) {
      return NextResponse.json({ error: '해제된 건입니다.' }, { status: 409 });
    }

    const { error: updateErr } = await supabase
      .from('intervention')
      .update({
        reevaluated_pain_score: parsed.data.painScore,
        reevaluated_at: new Date().toISOString(),
      })
      .eq('id', interventionRow.id);
    if (updateErr) {
      return NextResponse.json({ error: '재평가 저장에 실패했습니다.' }, { status: 500 });
    }

    const deltaPain =
      logRow.pain_score != null ? logRow.pain_score - parsed.data.painScore : null;

    return NextResponse.json({ ok: true, deltaPain }, { status: 200 });
  } catch (error) {
    console.error('POST /api/review/pain-score 실패:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
```

- [ ] **Step 2: 타입체크**

Run: `npm run lint`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add app/api/review/pain-score/route.ts
git commit -m "feat(delta-pain): POST /api/review/pain-score endpoint"
```

---

## Task 5: API — `/api/review/dismiss`

**Files:**
- Create: `app/api/review/dismiss/route.ts`

- [ ] **Step 1: 엔드포인트 작성**

Create `app/api/review/dismiss/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const schema = z.object({ logId: z.string().uuid() });

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { logId?: string };
    const parsed = schema.safeParse({ logId: body.logId?.trim() });
    if (!parsed.success) {
      return NextResponse.json({ error: '유효한 logId가 필요합니다.' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 소유권 + 상태 확인
    const { data: interventionRow, error: intErr } = await supabase
      .from('intervention')
      .select('id, is_completed, reevaluated_pain_score, review_dismissed_at, logs!inner(user_id)')
      .eq('log_id', parsed.data.logId)
      .eq('logs.user_id', user.id)
      .single();
    if (intErr || !interventionRow) {
      return NextResponse.json({ error: 'intervention을 찾을 수 없습니다.' }, { status: 404 });
    }
    if (interventionRow.review_dismissed_at != null) {
      return NextResponse.json({ ok: true }, { status: 200 }); // 이미 해제 — 멱등
    }
    if (interventionRow.reevaluated_pain_score != null) {
      return NextResponse.json({ error: '이미 재평가한 건은 해제할 수 없습니다.' }, { status: 409 });
    }

    const { error: updateErr } = await supabase
      .from('intervention')
      .update({ review_dismissed_at: new Date().toISOString() })
      .eq('id', interventionRow.id);
    if (updateErr) {
      return NextResponse.json({ error: '해제 저장 실패' }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('POST /api/review/dismiss 실패:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
```

- [ ] **Step 2: 타입체크**

Run: `npm run lint`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add app/api/review/dismiss/route.ts
git commit -m "feat(delta-pain): POST /api/review/dismiss endpoint (idempotent)"
```

---

## Task 6: ReviewCard 컴포넌트

**Files:**
- Create: `components/review/ReviewCard.tsx`

- [ ] **Step 1: 컴포넌트 작성**

Create `components/review/ReviewCard.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ReviewCardProps {
  logId: string;
  triggerSnippet: string;
  daysAgo: number;
}

export function ReviewCard({ logId, triggerSnippet, daysAgo }: ReviewCardProps) {
  const router = useRouter();
  const [isDismissing, setIsDismissing] = useState(false);
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  async function handleDismiss(e: React.MouseEvent) {
    e.stopPropagation();
    if (isDismissing) return;
    setIsDismissing(true);
    try {
      await fetch('/api/review/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId }),
      });
    } finally {
      setHidden(true);
    }
  }

  function handleOpen() {
    router.push(`/review/${logId}`);
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      className="w-full text-left rounded-2xl border border-blue-200 bg-blue-50 p-4 hover:bg-blue-100 transition"
      aria-label="지난 항해 돌아보기"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900">지난 항해 돌아보기</p>
          <p className="mt-1 text-xs text-blue-800">
            {daysAgo === 1 ? '어제' : `${daysAgo}일 전`} 기록한 「{triggerSnippet}」, 지금은 어떠신가요?
          </p>
        </div>
        <span
          role="button"
          tabIndex={0}
          onClick={handleDismiss}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleDismiss(e as unknown as React.MouseEvent);
          }}
          className="text-blue-400 hover:text-blue-700 px-2 py-1 text-xs"
          aria-label="카드 숨기기"
        >
          ✕
        </span>
      </div>
    </button>
  );
}
```

- [ ] **Step 2: 타입체크**

Run: `npm run lint`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/review/ReviewCard.tsx
git commit -m "feat(delta-pain): ReviewCard component with dismiss and navigation"
```

---

## Task 7: `/review/[id]` 페이지

**Files:**
- Create: `app/review/[id]/page.tsx`

페이지는 서버 컴포넌트에서 log·intervention을 fetch해 사용자 본인 여부·완료 여부·재평가 전 상태인지 검증 후 클라이언트 폼에 넘긴다. 초기 pain_score는 **클라이언트에 넘기지 않음** (앵커링 방지).

- [ ] **Step 1: 페이지 + 서버 로더 + 클라이언트 폼 작성**

Create `app/review/[id]/page.tsx`:

```tsx
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ReviewForm } from './review-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReviewPage({ params }: PageProps) {
  const { id: logId } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: log } = await supabase
    .from('logs')
    .select('id, trigger, thought, created_at, user_id')
    .eq('id', logId)
    .eq('user_id', user.id)
    .single();
  if (!log) redirect('/dashboard');

  const { data: intervention } = await supabase
    .from('intervention')
    .select(
      'id, socratic_questions, user_answers, final_action, is_completed, reevaluated_pain_score, review_dismissed_at'
    )
    .eq('log_id', logId)
    .single();
  if (!intervention || !intervention.is_completed) redirect('/dashboard');
  if (intervention.reevaluated_pain_score != null) redirect('/dashboard');
  if (intervention.review_dismissed_at != null) redirect('/dashboard');

  const questions: string[] = Array.isArray(intervention.socratic_questions)
    ? (intervention.socratic_questions as string[])
    : [];
  const answers: Record<string, string> =
    (intervention.user_answers as Record<string, string>) ?? {};

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <header className="space-y-1">
        <p className="text-xs text-gray-500">항로 재점검</p>
        <h1 className="text-xl font-semibold text-gray-900">
          시간이 조금 지났네요. 이 문제를 지금 돌아보면 어떤가요?
        </h1>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-800">그때 기록한 것</h2>
        <div className="space-y-1">
          <p className="text-xs text-gray-500">트리거</p>
          <p className="text-sm text-gray-900">{log.trigger}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-500">자동 사고</p>
          <p className="text-sm text-gray-900 whitespace-pre-wrap">{log.thought}</p>
        </div>
        {intervention.final_action && (
          <div className="space-y-1">
            <p className="text-xs text-gray-500">행동 계획</p>
            <p className="text-sm text-gray-900">{intervention.final_action}</p>
          </div>
        )}
      </section>

      {questions.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-800">내 답변</h2>
          <ul className="space-y-3">
            {questions.map((q, idx) => {
              const key = `q${idx + 1}`;
              const a = answers[key];
              if (!a) return null;
              return (
                <li key={key} className="space-y-1">
                  <p className="text-xs text-gray-500">{q}</p>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{a}</p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <ReviewForm logId={logId} />
    </main>
  );
}
```

- [ ] **Step 2: 클라이언트 폼 컴포넌트 작성**

Create `app/review/[id]/review-form.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ReviewFormProps {
  logId: string;
}

const SCORES = [1, 2, 3, 4, 5];

export function ReviewForm({ logId }: ReviewFormProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (selected == null || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/review/pain-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId, painScore: selected }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? '저장에 실패했어요.');
        setSubmitting(false);
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('네트워크 오류가 발생했어요.');
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-blue-900">고통 점수 (1 편함 ~ 5 힘듦)</h2>
        <p className="mt-1 text-xs text-blue-800">
          지금 이 문제를 다시 생각하면 얼마나 고통스러운가요?
        </p>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {SCORES.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setSelected(n)}
            className={`rounded-xl py-3 text-lg font-semibold border transition ${
              selected === n
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-blue-900 border-blue-200 hover:border-blue-400'
            }`}
            aria-pressed={selected === n}
          >
            {n}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="button"
        disabled={selected == null || submitting}
        onClick={handleSubmit}
        className="w-full rounded-xl bg-blue-900 py-3 text-sm font-semibold text-white disabled:bg-gray-300"
      >
        {submitting ? '저장 중…' : '저장하기'}
      </button>
    </section>
  );
}
```

- [ ] **Step 3: 타입체크**

Run: `npm run lint`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add app/review/\[id\]/page.tsx app/review/\[id\]/review-form.tsx
git commit -m "feat(delta-pain): /review/[id] page with anchored-free re-rating form"
```

---

## Task 8: 대시보드 통합 (카드 + 주간 Δpain 통계)

**Files:**
- Modify: `app/dashboard/page.tsx`

**중요:** 현재 `app/dashboard/page.tsx` 구조를 먼저 읽어 기존 쿼리·렌더 패턴을 파악한 뒤, **기존 패턴을 따라** 2가지를 삽입한다.

- [ ] **Step 1: 현재 대시보드 구조 확인**

Read `/Users/dongseob/Desktop/Project-BlueBird-mvp/app/dashboard/page.tsx`.

식별할 것:
- `createServerSupabaseClient()` 호출 위치
- `user.id` 가져오는 지점
- 기존 통계 카드 렌더링 섹션 (자율성 지수 합 등)
- `intervention` 테이블 쿼리 패턴

- [ ] **Step 2: 재평가 대기 조회 로직 추가**

기존 `const supabase = ...` 뒤, user 로드 뒤에 아래 블록 삽입:

```ts
import { findPendingReview, type PendingReviewClient } from '@/lib/review/pending-review';
import { ReviewCard } from '@/components/review/ReviewCard';

// ... 기존 함수 안에서 user가 확보된 뒤 ...

// 재평가 대기 조회
const pendingReviewClient: PendingReviewClient = {
  async queryPendingInterventions({ userId, completedAtGte, completedAtLte }) {
    return supabase
      .from('intervention')
      .select('id, log_id, completed_at, logs!inner(id, trigger, pain_score, user_id)')
      .eq('is_completed', true)
      .is('reevaluated_pain_score', null)
      .is('review_dismissed_at', null)
      .gte('completed_at', completedAtGte)
      .lte('completed_at', completedAtLte)
      .eq('logs.user_id', userId);
  },
};
const pendingReview = await findPendingReview({
  userId: user.id,
  now: new Date(),
  client: pendingReviewClient,
});
```

**주의:** Supabase의 `logs!inner(...)` 반환 형태는 관계 이름 키 아래에 객체 또는 배열로 들어온다. 실제 반환 shape이 `{ logs: { ... } }` 인지 `{ logs: [{ ... }] }` 인지 확인 후, `pending-review.ts`에서 기대하는 `logs: { id, trigger, pain_score }` 단일 객체 shape에 맞추도록 TypeScript cast 필요하다면 `.select()` 결과 파싱 지점에서 조정. Supabase SSR v0.10+ 기준 `!inner`는 단일 객체.

만약 런타임에서 `logs`가 배열로 오면 `queryPendingInterventions`에서 `data.map(row => ({ ...row, logs: Array.isArray(row.logs) ? row.logs[0] : row.logs }))` 변환 추가.

- [ ] **Step 3: 주간 Δpain 통계 집계**

같은 함수 안에서:

```ts
import { sumPositiveDeltaPain, type PainPair } from '@/lib/review/delta-pain';

// ... user 로드 후 ...

const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
const { data: deltaPainRows } = await supabase
  .from('intervention')
  .select('reevaluated_pain_score, logs!inner(pain_score, user_id)')
  .eq('logs.user_id', user.id)
  .not('reevaluated_pain_score', 'is', null)
  .gte('reevaluated_at', oneWeekAgo);

const pairs: PainPair[] =
  (deltaPainRows ?? []).map((row) => {
    const logsField = row.logs as unknown as { pain_score: number | null } | Array<{ pain_score: number | null }>;
    const log = Array.isArray(logsField) ? logsField[0] : logsField;
    return {
      initial: log?.pain_score ?? null,
      reevaluated: (row as { reevaluated_pain_score: number | null }).reevaluated_pain_score,
    };
  });
const weeklyPositiveDeltaPain = sumPositiveDeltaPain(pairs);
```

- [ ] **Step 4: 렌더링 통합 — ReviewCard와 통계 카드**

JSX 최상단에 ReviewCard 삽입 (기존 헤더 바로 아래, 다른 섹션들 위):

```tsx
{pendingReview && (
  <ReviewCard
    logId={pendingReview.logId}
    triggerSnippet={pendingReview.triggerSnippet}
    daysAgo={pendingReview.daysAgo}
  />
)}
```

기존 통계 카드(자율성 지수 합 등) 옆 또는 아래에 주간 Δpain 카드 추가:

```tsx
<div className="rounded-2xl border border-gray-200 bg-white p-4">
  <p className="text-xs text-gray-500">이번 주 줄어든 고통</p>
  <p className="mt-1 text-2xl font-semibold text-gray-900">
    {weeklyPositiveDeltaPain}
    <span className="text-sm text-gray-500 ml-1">점</span>
  </p>
  <p className="mt-1 text-xs text-gray-400">7일 내 재평가 완료 기준</p>
</div>
```

기존 카드 그리드에 자연스럽게 끼워 넣는다.

- [ ] **Step 5: 타입체크**

Run: `npm run lint`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat(delta-pain): dashboard renders ReviewCard and weekly Δpain stat"
```

---

## Task 9: Insights 페이지 — Δpain 시계열 차트

**Files:**
- Modify: `app/insights/page.tsx`

- [ ] **Step 1: 현재 insights 구조 확인**

Read `/Users/dongseob/Desktop/Project-BlueBird-mvp/app/insights/page.tsx`. 기존 Recharts 사용 패턴, 기간 필터 방식 파악.

- [ ] **Step 2: Δpain 시계열 데이터 쿼리 추가**

기존 쿼리 블록 다음에:

```ts
// 시계열용: reevaluated_at 기준 일자별 Δpain 평균
const { data: deltaRows } = await supabase
  .from('intervention')
  .select('reevaluated_at, reevaluated_pain_score, logs!inner(pain_score, user_id)')
  .eq('logs.user_id', user.id)
  .not('reevaluated_pain_score', 'is', null)
  .gte('reevaluated_at', since) // 기존 `since` 기간 필터 변수 재사용
  .order('reevaluated_at', { ascending: true });

type DeltaDayPoint = { date: string; avgDelta: number };
const deltaByDay: Record<string, { sum: number; count: number }> = {};
for (const row of deltaRows ?? []) {
  const logsField = row.logs as unknown as { pain_score: number | null } | Array<{ pain_score: number | null }>;
  const log = Array.isArray(logsField) ? logsField[0] : logsField;
  const initial = log?.pain_score;
  const re = (row as { reevaluated_pain_score: number | null }).reevaluated_pain_score;
  if (initial == null || re == null) continue;
  const day = (row.reevaluated_at as string).slice(0, 10);
  if (!deltaByDay[day]) deltaByDay[day] = { sum: 0, count: 0 };
  deltaByDay[day].sum += initial - re;
  deltaByDay[day].count += 1;
}
const deltaPainSeries: DeltaDayPoint[] = Object.keys(deltaByDay)
  .sort()
  .map((date) => ({
    date,
    avgDelta: Math.round((deltaByDay[date].sum / deltaByDay[date].count) * 10) / 10,
  }));
```

`since` 변수명은 기존 페이지가 쓰는 변수로 치환. 없으면 `const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();` 추가.

- [ ] **Step 3: 라인차트 섹션 추가**

기존 Recharts import 아래 확인 후, JSX 적당한 위치에 섹션 삽입:

```tsx
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';

// ... JSX 내 ...

<section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
  <header className="space-y-1">
    <h2 className="text-sm font-semibold text-gray-900">인지 유연성 변화 (Δpain)</h2>
    <p className="text-xs text-gray-500">양수면 고통 감소, 음수면 증가. 0 기준선은 변화 없음.</p>
  </header>
  {deltaPainSeries.length === 0 ? (
    <p className="text-sm text-gray-500 py-6 text-center">
      아직 재평가 기록이 부족해요. 몇 번 더 돌아봐주세요.
    </p>
  ) : (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={deltaPainSeries} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis domain={[-4, 4]} tick={{ fontSize: 11 }} />
          <Tooltip />
          <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
          <Line type="monotone" dataKey="avgDelta" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )}
</section>
```

Recharts import가 이미 되어 있으면 중복 추가하지 말고 재사용.

- [ ] **Step 4: 타입체크**

Run: `npm run lint`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add app/insights/page.tsx
git commit -m "feat(delta-pain): insights page adds Δpain time-series line chart"
```

---

## Task 10: Gemini 프롬프트에 pain_score 주입

**Files:**
- Modify: `lib/openai/gemini.ts`
- Modify: `app/api/analyze/route.ts`

- [ ] **Step 1: gemini.ts의 AnalysisInput 시그니처 확장**

Read `/Users/dongseob/Desktop/Project-BlueBird-mvp/lib/openai/gemini.ts`. `analyzeDistortionsWithGemini` 함수의 입력 타입을 찾는다 (대략 `{ trigger: string; thought: string }`).

그 타입을 다음으로 확장:

```ts
interface AnalysisInput {
  trigger: string;
  thought: string;
  pain_score?: number | null;
}
```

함수 시그니처가 객체 구조분해로 쓰고 있으면 거기에 `pain_score` 필드 추가.

- [ ] **Step 2: buildAnalysisPrompt에 컨텍스트 한 줄 주입**

현재 `buildAnalysisPrompt`가 `trigger`, `thought`를 JSON으로 내보내고 있다면:

```ts
JSON.stringify({ trigger: safeTrigger, thought: safeThought }, null, 2)
```

를 아래와 같이 확장:

```ts
JSON.stringify(
  {
    trigger: safeTrigger,
    thought: safeThought,
    ...(input.pain_score != null ? { initial_pain_score: input.pain_score } : {}),
  },
  null,
  2
)
```

`pain_score`는 **분석 메타데이터**로 전달될 뿐, 조건부 톤이나 질문 난이도 분기를 만들지 **않는다** (YAGNI, 스펙 결정 사항 9).

- [ ] **Step 3: analyze route에서 pain_score 전달**

Edit `app/api/analyze/route.ts`. 현재 `logData` 조회 쿼리가 `'id, trigger, thought, user_id'` 라면 `pain_score` 포함:

```ts
const { data: logData, error: logError } = await supabase
  .from('logs')
  .select('id, trigger, thought, pain_score, user_id')
  .eq('id', logId)
  .eq('user_id', user.id)
  .single();
```

그리고 `analyzeDistortionsWithGemini` 호출 시:

```ts
analysisResult = await analyzeDistortionsWithGemini({
  trigger: logData.trigger,
  thought: logData.thought,
  pain_score: logData.pain_score ?? null,
});
```

- [ ] **Step 4: 기존 테스트 재검증**

Run: `npm test`
Expected: 기존 45 + 신규 (Task 2, 3에서 추가된 pending-review 6 + delta-pain 7) = **58 tests pass**.

- [ ] **Step 5: Commit**

```bash
git add lib/openai/gemini.ts app/api/analyze/route.ts
git commit -m "feat(delta-pain): inject pain_score as context in gemini analysis prompt"
```

---

## Task 11: 수동 스모크 체크리스트

**Files:**
- Create: `docs/delta-pain-smoke-checklist.md`

- [ ] **Step 1: 체크리스트 문서 작성**

Create `docs/delta-pain-smoke-checklist.md`:

```markdown
# Δpain 수동 스모크 체크리스트

실행 전:
- Supabase SQL Editor에서 `04_logs_pain_score.sql`, `05_intervention_reevaluation.sql` 실행
- `npm run dev` + 테스트 유저 로그인

## 시나리오 A: 정상 재평가 사이클

1. `/log` → trigger: "동료와 회의에서 긴장", thought: "또 실수할 것 같아", pain_score: 5
2. `/analyze/[id]` → 분석 완료
3. 질문 3개 답변 → `/visualize/[id]` → `/action/[id]` → 행동 계획 입력 → **완료**
4. Supabase Table Editor에서 해당 intervention row가 is_completed=true, completed_at 채워졌는지 확인
5. 확인용 SQL로 completed_at을 **7시간 전**으로 수동 업데이트:
   ```sql
   UPDATE intervention
     SET completed_at = NOW() - INTERVAL '7 hours'
     WHERE id = '...';
   ```
6. `/dashboard` 새로고침 → 상단에 ReviewCard 노출 확인
7. 카드 클릭 → `/review/[id]` 진입
   - 원래 trigger·thought·행동계획·소크라테스 답변이 모두 표시되는지
   - **원래 pain_score는 표시 안 되는지** (앵커링 방지)
8. 1~5 중 2 선택 → 저장
9. `/dashboard`로 복귀 → "이번 주 줄어든 고통" 카드에 `+3` 표시
10. Supabase: intervention.reevaluated_pain_score=2, reevaluated_at 기록 확인

## 시나리오 B: 6시간 미만 경과 — 카드 안 뜸

1. 방금 완료한 log가 있을 때(6h 미만), `/dashboard`에서 ReviewCard 노출되지 않음 확인

## 시나리오 C: 48시간 초과 — 카드 안 뜸

1. completed_at을 50시간 전으로 수동 업데이트:
   ```sql
   UPDATE intervention SET completed_at = NOW() - INTERVAL '50 hours' WHERE id = '...';
   ```
2. `/dashboard` 진입 → 카드 안 뜸 확인

## 시나리오 D: 닫기 영구성

1. 시나리오 A의 6~7단계에서 카드의 X 버튼 클릭
2. 카드 사라짐
3. `/dashboard` 새로고침 → 다시 안 뜸 확인
4. Supabase: intervention.review_dismissed_at 기록 확인

## 시나리오 E: 다수 대기 FIFO

1. 완료한 log 2개 모두 completed_at을 시간차 두고 7~40시간 전으로 업데이트
2. `/dashboard` → **오래된 것 1개만** 카드로 표시 확인
3. 재평가 완료 후 다시 `/dashboard` → 두 번째 건 카드로 노출

## 시나리오 F: 음수 Δpain

1. 초기 pain_score=2로 log 작성, 완료, completed_at 7시간 전 조정
2. 재평가 시 5 선택 → 저장 (Δpain = -3)
3. "이번 주 줄어든 고통" 카드는 해당 건 **제외** (양수만 합산)
4. Insights 시계열 차트에는 -3으로 표시됨

## 시나리오 G: 분석 프롬프트에 pain_score 주입 확인

1. 새 log 작성 (pain_score=5)
2. 분석 시작
3. `console.log`나 네트워크 탭으로 Gemini 요청에 `initial_pain_score: 5` 필드가 프롬프트에 포함됐는지 확인 (프롬프트 문자열 검증)

## Known gaps (v1 이관)

- 재발 감지 (같은 distortion_type 반복)
- 과거 답변 재활용 힌트
- 주간 리포트 (별도 플랜)
- Push 알림
- Δpain 기반 아키타입 진화
```

- [ ] **Step 2: Commit**

```bash
git add docs/delta-pain-smoke-checklist.md
git commit -m "docs(delta-pain): add v0 manual smoke checklist"
```

---

## Self-Review Checklist

### 1. Spec coverage

| Spec 항목 | 이행 Task |
|----------|-----------|
| 재평가 시점: 다음 세션 6-48h | Task 2 (pending-review) |
| Δpain ≠ autonomy_score | Task 4 (응답에만 deltaPain, autonomy 로직 불변) / Task 8 (별도 카드) |
| 비모달 카드 → /review/[id] | Task 6, 7 |
| 완료 시점 변화 없음 | (생략 — 플랜이 /action을 건드리지 않음) |
| 원래 pain_score 숨김 | Task 7 (ReviewForm에 initialPainScore 미전달) |
| 다수 대기 FIFO 1건 | Task 2 (sort + 첫 번째) |
| 해제는 영구 | Task 5 (review_dismissed_at 기록) + Task 2 (쿼리 제외) |
| 음수 Δpain 정직 표시 | Task 3 (calcDeltaPain) + Task 9 (차트) |
| pain_score 프롬프트 주입, 톤 분기 없음 | Task 10 |
| DB 컬럼 3개 + logs.pain_score 동기화 | Task 0 |
| 단위 테스트 | Task 2, 3 (13개) |
| 스모크 체크리스트 | Task 11 |

### 2. Placeholder scan

- No "TODO", "TBD", "implement later"
- 각 step에 실행 가능한 코드·명령 포함
- 에러 핸들링 추상화 없음 (각 path에 구체 응답 코드·메시지 명시)

### 3. Type consistency

- `PendingReview.logId` (Task 2) ↔ `ReviewCardProps.logId` (Task 6) ↔ `/review/[id]` param (Task 7) 일치
- `PainPair { initial, reevaluated }` (Task 3) 모든 호출처 (Task 8, 9) 동일
- `reevaluated_pain_score`, `reevaluated_at`, `review_dismissed_at` 컬럼명 Task 0/1/2/4/5/8/9 전부 동일

---

## Out of Scope

- Push 알림 트리거
- 재발 감지 (별도 플랜)
- 주간 리포트 (별도 플랜)
- analysis DELETE/UPDATE 정책 (RLS C4, 별도 hotfix)
- `analysis.distortion_type` NULL 허용 (RLS C3, 별도 hotfix)
- 검수·체계적 런타임 RLS 감사 (기존 감사 리포트로 완료)
