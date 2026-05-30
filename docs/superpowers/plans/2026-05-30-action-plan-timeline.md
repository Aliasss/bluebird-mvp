# 행동 기록 타임라인 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 행동 계획을 *실행 예정일* 기준으로 그룹·정렬해 보여주는 읽기 전용 타임라인을 기존 journal "actions" 탭에 추가한다 (알림 없음, 분석가 톤).

**Architecture:** 자유 텍스트 `when`을 best-effort로 KST 기준 `planned_at`(TIMESTAMPTZ)로 파싱(입력 UI 무변경) → journal 탭에서 `planned_at` 기준 6개 그룹(오늘·내일·이번 주·이후·날짜 미지정·지난 계획)으로 묶어 렌더. 파싱·그룹화는 순수 함수로 분리해 단위 테스트.

**Tech Stack:** Next.js 16 (App Router), Supabase, TypeScript, Vitest, Tailwind. KST(UTC+9, DST 없음) 고정.

**Spec:** [docs/superpowers/specs/2026-05-30-action-plan-timeline-design.md](../specs/2026-05-30-action-plan-timeline-design.md)

---

## 파일 구조

| 파일 | 책임 | 신규/수정 |
|---|---|---|
| `supabase/migrations/21_intervention_planned_at.sql` | `planned_at` 컬럼 추가 | 신규 |
| `lib/intervention/when-parser.ts` | 자유 텍스트 `when` → KST `planned_at` ISO best-effort 파싱 | 신규 |
| `tests/intervention/when-parser.test.ts` | 파서 단위 테스트 | 신규 |
| `lib/journal/action-timeline.ts` | `planned_at` → 6개 버킷 그룹화(순수) | 신규 |
| `tests/journal/action-timeline.test.ts` | 그룹화 단위 테스트 | 신규 |
| `app/api/action/route.ts` | 제출 시 `planned_at` 채워 저장 | 수정 |
| `app/journal/page.tsx` | actions 탭 그룹 타임라인 렌더 + "관찰 대기" 중립 라벨 | 수정 |

---

## Task 1: migration 21 — `planned_at` 컬럼

**Files:**
- Create: `supabase/migrations/21_intervention_planned_at.sql`

- [ ] **Step 1: 마이그레이션 작성**

```sql
-- 행동 계획 실행 예정 일시(구조화). 자유 텍스트 when을 best-effort 파싱한 결과.
-- 파싱 실패 시 NULL → journal 타임라인 "날짜 미지정" 그룹에 표시.
-- ⚠️ 알림·리마인더 용도 아님(본질 위협 #4 가드). 읽기 전용 정렬·그룹화 전용.
ALTER TABLE intervention ADD COLUMN IF NOT EXISTS planned_at TIMESTAMPTZ;
COMMENT ON COLUMN intervention.planned_at IS '행동 계획 실행 예정 일시(KST 파싱). 정렬·그룹화 전용, 알림 미사용.';
```

롤백: `ALTER TABLE intervention DROP COLUMN IF EXISTS planned_at;`

- [ ] **Step 2: 커밋**

```bash
git add supabase/migrations/21_intervention_planned_at.sql
git commit -m "feat(db): migration 21 — intervention.planned_at 추가 (행동 타임라인 정렬용)"
```

---

## Task 2: `when-parser` — 자유 텍스트 → KST planned_at

**Files:**
- Create: `lib/intervention/when-parser.ts`
- Test: `tests/intervention/when-parser.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

```ts
// tests/intervention/when-parser.test.ts
import { describe, it, expect } from 'vitest';
import { parseWhenToPlannedAt } from '@/lib/intervention/when-parser';

// 기준 시각: 2026-05-30 10:00 KST = 2026-05-30T01:00:00.000Z
const NOW = new Date('2026-05-30T01:00:00.000Z');

// 헬퍼: 결과 ISO를 KST 날짜 문자열(YYYY-MM-DD)로 환산
function kstDate(iso: string | null): string | null {
  if (!iso) return null;
  const k = new Date(new Date(iso).getTime() + 9 * 3600 * 1000);
  return `${k.getUTCFullYear()}-${String(k.getUTCMonth() + 1).padStart(2, '0')}-${String(k.getUTCDate()).padStart(2, '0')}`;
}

describe('parseWhenToPlannedAt', () => {
  it('null/빈 입력은 null', () => {
    expect(parseWhenToPlannedAt(null, NOW)).toBeNull();
    expect(parseWhenToPlannedAt('', NOW)).toBeNull();
    expect(parseWhenToPlannedAt('   ', NOW)).toBeNull();
  });

  it('"오늘"은 오늘 KST 날짜', () => {
    expect(kstDate(parseWhenToPlannedAt('오늘 21:00', NOW))).toBe('2026-05-30');
  });

  it('"내일"은 +1일', () => {
    expect(kstDate(parseWhenToPlannedAt('내일', NOW))).toBe('2026-05-31');
  });

  it('"모레"는 +2일', () => {
    expect(kstDate(parseWhenToPlannedAt('모레 9시', NOW))).toBe('2026-06-01');
  });

  it('"M/D" 절대일', () => {
    expect(kstDate(parseWhenToPlannedAt('6/3', NOW))).toBe('2026-06-03');
    expect(kstDate(parseWhenToPlannedAt('6/3 21:00', NOW))).toBe('2026-06-03');
  });

  it('"M월 D일" 절대일', () => {
    expect(kstDate(parseWhenToPlannedAt('6월 5일', NOW))).toBe('2026-06-05');
  });

  it('콤마 나열은 첫 토큰', () => {
    expect(kstDate(parseWhenToPlannedAt('5/30, 5/31', NOW))).toBe('2026-05-30');
  });

  it('파싱 불가는 null (누락보다 안전)', () => {
    expect(parseWhenToPlannedAt('다음 주 화요일', NOW)).toBeNull();
    expect(parseWhenToPlannedAt('나중에', NOW)).toBeNull();
  });

  it('시각 보존 — "오늘 21:00"은 KST 21시', () => {
    const iso = parseWhenToPlannedAt('오늘 21:00', NOW)!;
    const k = new Date(new Date(iso).getTime() + 9 * 3600 * 1000);
    expect(k.getUTCHours()).toBe(21);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run tests/intervention/when-parser.test.ts`
Expected: FAIL — "Cannot find module '@/lib/intervention/when-parser'"

- [ ] **Step 3: 파서 구현**

```ts
// lib/intervention/when-parser.ts
// 행동 계획 자유 텍스트 "when"을 best-effort로 KST 기준 planned_at(UTC ISO)으로 변환.
// 파싱 실패 시 null → 호출자가 planned_at을 비워둔다(날짜 미지정 그룹).
// 한국 전용 앱: KST(UTC+9, DST 없음) 고정. 알림 용도 아님 — 정렬·그룹화 전용.

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_HOUR = 12; // 날짜만 있을 때 정오(KST) — UTC 변환 시 같은 KST 날짜 보존

function kstParts(instant: Date): { y: number; mo: number; d: number } {
  const shifted = new Date(instant.getTime() + KST_OFFSET_MS);
  return { y: shifted.getUTCFullYear(), mo: shifted.getUTCMonth() + 1, d: shifted.getUTCDate() };
}

function kstWallClockToUtcIso(y: number, mo: number, d: number, h: number, mi: number): string {
  const asIfUtc = Date.UTC(y, mo - 1, d, h, mi, 0, 0);
  return new Date(asIfUtc - KST_OFFSET_MS).toISOString();
}

function parseTime(s: string): { h: number; mi: number } | null {
  const colon = s.match(/(\d{1,2}):(\d{2})/);
  if (colon) {
    const h = Number(colon[1]);
    const mi = Number(colon[2]);
    if (h <= 23 && mi <= 59) return { h, mi };
  }
  const kor = s.match(/(\d{1,2})시(?:\s*(\d{1,2})분)?/);
  if (kor) {
    let h = Number(kor[1]);
    const mi = kor[2] ? Number(kor[2]) : 0;
    if (/오후|저녁|밤/.test(s) && h < 12) h += 12;
    if (h <= 23 && mi <= 59) return { h, mi };
  }
  return null;
}

export function parseWhenToPlannedAt(when: string | null | undefined, now: Date): string | null {
  if (!when) return null;
  const raw = when.split(',')[0].trim();
  if (!raw) return null;

  const time = parseTime(raw);
  const h = time?.h ?? DEFAULT_HOUR;
  const mi = time?.mi ?? 0;
  const today = kstParts(now);

  if (/오늘/.test(raw)) {
    return kstWallClockToUtcIso(today.y, today.mo, today.d, h, mi);
  }
  if (/내일/.test(raw)) {
    const t = new Date(now.getTime() + KST_OFFSET_MS + DAY_MS);
    return kstWallClockToUtcIso(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate(), h, mi);
  }
  if (/모레/.test(raw)) {
    const t = new Date(now.getTime() + KST_OFFSET_MS + 2 * DAY_MS);
    return kstWallClockToUtcIso(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate(), h, mi);
  }

  const slash = raw.match(/(\d{1,2})\/(\d{1,2})/);
  if (slash) {
    const mo = Number(slash[1]);
    const d = Number(slash[2]);
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
      return kstWallClockToUtcIso(today.y, mo, d, h, mi);
    }
  }
  const kor = raw.match(/(\d{1,2})월\s*(\d{1,2})일/);
  if (kor) {
    const mo = Number(kor[1]);
    const d = Number(kor[2]);
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
      return kstWallClockToUtcIso(today.y, mo, d, h, mi);
    }
  }
  return null;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run tests/intervention/when-parser.test.ts`
Expected: PASS (10 tests)

- [ ] **Step 5: 커밋**

```bash
git add lib/intervention/when-parser.ts tests/intervention/when-parser.test.ts
git commit -m "feat(intervention): when 자유텍스트 → KST planned_at best-effort 파서"
```

---

## Task 3: `action-timeline` — planned_at 버킷 그룹화

**Files:**
- Create: `lib/journal/action-timeline.ts`
- Test: `tests/journal/action-timeline.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

```ts
// tests/journal/action-timeline.test.ts
import { describe, it, expect } from 'vitest';
import { bucketForPlannedAt, groupActionsByPlannedAt } from '@/lib/journal/action-timeline';

const NOW = new Date('2026-05-30T01:00:00.000Z'); // 2026-05-30 10:00 KST

// KST 정오(12:00) ISO 생성 헬퍼
function kstNoon(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0) - 9 * 3600 * 1000).toISOString();
}

describe('bucketForPlannedAt', () => {
  it('null은 undated', () => {
    expect(bucketForPlannedAt(null, NOW)).toBe('undated');
  });
  it('오늘/내일/이번주/이후/지난 분류', () => {
    expect(bucketForPlannedAt(kstNoon('2026-05-30'), NOW)).toBe('today');
    expect(bucketForPlannedAt(kstNoon('2026-05-31'), NOW)).toBe('tomorrow');
    expect(bucketForPlannedAt(kstNoon('2026-06-04'), NOW)).toBe('thisWeek'); // +5일
    expect(bucketForPlannedAt(kstNoon('2026-06-10'), NOW)).toBe('later');    // +11일
    expect(bucketForPlannedAt(kstNoon('2026-05-28'), NOW)).toBe('past');     // -2일
  });
  it('잘못된 ISO는 undated', () => {
    expect(bucketForPlannedAt('not-a-date', NOW)).toBe('undated');
  });
});

describe('groupActionsByPlannedAt', () => {
  it('표시 순서대로 그룹 반환, 빈 그룹 생략', () => {
    const items = [
      { id: 'a', planned_at: kstNoon('2026-05-31') }, // 내일
      { id: 'b', planned_at: null },                  // 날짜 미지정
      { id: 'c', planned_at: kstNoon('2026-05-30') }, // 오늘
    ];
    const groups = groupActionsByPlannedAt(items, NOW);
    expect(groups.map((g) => g.bucket)).toEqual(['today', 'tomorrow', 'undated']);
    expect(groups[0].label).toBe('오늘');
    expect(groups[0].items[0].id).toBe('c');
  });

  it('버킷 내 planned_at 오름차순 정렬', () => {
    const items = [
      { id: 'late', planned_at: kstNoon('2026-06-07') },
      { id: 'early', planned_at: kstNoon('2026-06-03') },
    ];
    const groups = groupActionsByPlannedAt(items, NOW);
    expect(groups[0].bucket).toBe('thisWeek');
    expect(groups[0].items.map((i) => i.id)).toEqual(['early', 'late']);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run tests/journal/action-timeline.test.ts`
Expected: FAIL — "Cannot find module '@/lib/journal/action-timeline'"

- [ ] **Step 3: 그룹화 구현**

```ts
// lib/journal/action-timeline.ts
// 행동 계획을 실행 예정일(planned_at) 기준 6개 버킷으로 그룹화 (순수 함수).
// ⚠️ 읽기 전용 정렬·그룹화 전용 — 알림·완료 강제 없음(본질 위협 #4 가드).
// KST(UTC+9) 고정. TZ 독립 테스트를 위해 now를 인자로 받는다.

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export type TimelineBucket = 'today' | 'tomorrow' | 'thisWeek' | 'later' | 'undated' | 'past';

export const TIMELINE_BUCKET_LABEL: Record<TimelineBucket, string> = {
  today: '오늘',
  tomorrow: '내일',
  thisWeek: '이번 주',
  later: '이후',
  undated: '날짜 미지정',
  past: '지난 계획',
};

// 화면 표시 순서 (미래 → 미지정 → 과거)
export const TIMELINE_BUCKET_ORDER: TimelineBucket[] = [
  'today', 'tomorrow', 'thisWeek', 'later', 'undated', 'past',
];

function kstDayIndex(instant: Date): number {
  return Math.floor((instant.getTime() + KST_OFFSET_MS) / DAY_MS);
}

export function bucketForPlannedAt(plannedAt: string | null, now: Date): TimelineBucket {
  if (!plannedAt) return 'undated';
  const t = new Date(plannedAt);
  if (!Number.isFinite(t.getTime())) return 'undated';
  const diff = kstDayIndex(t) - kstDayIndex(now);
  if (diff < 0) return 'past';
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff <= 7) return 'thisWeek';
  return 'later';
}

export interface HasPlannedAt {
  planned_at: string | null;
}

export interface TimelineGroup<T> {
  bucket: TimelineBucket;
  label: string;
  items: T[];
}

export function groupActionsByPlannedAt<T extends HasPlannedAt>(
  items: T[],
  now: Date,
): TimelineGroup<T>[] {
  const map = new Map<TimelineBucket, T[]>();
  for (const item of items) {
    const b = bucketForPlannedAt(item.planned_at, now);
    const arr = map.get(b) ?? [];
    arr.push(item);
    map.set(b, arr);
  }

  const result: TimelineGroup<T>[] = [];
  for (const bucket of TIMELINE_BUCKET_ORDER) {
    const group = map.get(bucket);
    if (!group || group.length === 0) continue;
    if (bucket !== 'undated') {
      group.sort((a, b) => {
        const ta = a.planned_at ? new Date(a.planned_at).getTime() : 0;
        const tb = b.planned_at ? new Date(b.planned_at).getTime() : 0;
        return bucket === 'past' ? tb - ta : ta - tb; // past는 최근 지난 것 먼저
      });
    }
    result.push({ bucket, label: TIMELINE_BUCKET_LABEL[bucket], items: group });
  }
  return result;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run tests/journal/action-timeline.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: 커밋**

```bash
git add lib/journal/action-timeline.ts tests/journal/action-timeline.test.ts
git commit -m "feat(journal): planned_at 기준 행동 타임라인 그룹화 (순수 함수)"
```

---

## Task 4: action 라우트에 planned_at 저장

**Files:**
- Modify: `app/api/action/route.ts`

- [ ] **Step 1: import 추가** (파일 상단 import 블록, 7번째 줄 `import { z }` 위)

```ts
import { parseActionPlan } from '@/lib/intervention/action-plan';
import { parseWhenToPlannedAt } from '@/lib/intervention/when-parser';
```

- [ ] **Step 2: actionPayload 타입에 planned_at 추가 + 파싱 채움**

`const actionPayload: { final_action: string; ... } = { final_action: effectiveAction };` (현 100~106행) 를 다음으로 교체:

```ts
    // planned_at — final_action JSON의 when을 best-effort 파싱 (실패 시 null = 날짜 미지정).
    // ⚠️ 정렬·그룹화 전용, 알림 미사용.
    const plan = parseActionPlan(effectiveAction);
    const plannedAt = plan ? parseWhenToPlannedAt(plan.when, new Date()) : null;

    const actionPayload: {
      final_action: string;
      planned_at: string | null;
      is_completed?: boolean;
      autonomy_score?: number;
      completion_note?: string;
      completion_reaction?: string;
    } = { final_action: effectiveAction, planned_at: plannedAt };
```

- [ ] **Step 3: 타입체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음 (planned_at 관련)

- [ ] **Step 4: 커밋**

```bash
git add app/api/action/route.ts
git commit -m "feat(api): action 저장 시 planned_at 채움 (when best-effort 파싱)"
```

---

## Task 5: journal actions 탭 — 그룹 타임라인 + 중립 라벨

**Files:**
- Modify: `app/journal/page.tsx`

- [ ] **Step 1: import 추가** (상단 import 블록, BottomTabBar import 아래)

```ts
import { groupActionsByPlannedAt } from '@/lib/journal/action-timeline';
```

- [ ] **Step 2: RecentActionItem 타입에 planned_at 추가** (현 21~33행 type, `created_at: string;` 아래)

```ts
  planned_at: string | null;
```

- [ ] **Step 3: select 쿼리에 planned_at 추가** (현 69행)

기존:
```ts
.select('id, log_id, final_action, is_completed, autonomy_score, created_at, logs!inner(trigger, user_id, log_type, trigger_category)')
```
변경:
```ts
.select('id, log_id, final_action, is_completed, autonomy_score, created_at, planned_at, logs!inner(trigger, user_id, log_type, trigger_category)')
```

- [ ] **Step 4: actions 렌더를 그룹 타임라인으로 교체** (현 280~322행, `) : (` 부터 닫는 `</div>` 직전 `)}` 까지의 `<div className="space-y-3">...` 블록)

기존 `<div className="space-y-3"> {(showAllActions ? ...).map((item) => ( <카드/> ))} {더보기} </div>` 를 다음으로 교체:

```tsx
              <div className="space-y-5">
                {groupActionsByPlannedAt(
                  showAllActions ? visibleActions : visibleActions.slice(0, 3),
                  new Date(),
                ).map((group) => (
                  <div key={group.bucket} className="space-y-2">
                    <p className="text-xs font-semibold text-text-tertiary px-1">{group.label}</p>
                    <div className="space-y-3">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => router.push(`/action/${item.log_id}`)}
                          className="bg-white border border-background-tertiary/80 rounded-xl p-4 shadow-sm hover:border-primary hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <p className="text-sm font-medium text-text-primary line-clamp-1">
                                {item.logs?.trigger || '행동 계획'}
                              </p>
                              {item.logs?.trigger_category && (
                                <span className="text-[10px] text-text-tertiary bg-background-secondary px-1.5 py-0.5 rounded flex-shrink-0">
                                  {TriggerCategoryKorean[item.logs.trigger_category]}
                                </span>
                              )}
                            </div>
                            <span className={`text-xs font-semibold flex-shrink-0 ${item.is_completed ? 'text-success' : 'text-text-tertiary'}`}>
                              {item.is_completed ? '완료' : '관찰 대기'}
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary line-clamp-2">
                            {formatActionPlanForDisplay(item.final_action) || '행동 계획이 아직 작성되지 않았습니다.'}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-text-secondary">{formatDate(item.created_at)}</span>
                            <span className="text-xs text-primary">
                              {item.autonomy_score ? `+${item.autonomy_score}점` : '점수 대기'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {visibleActions.length > 3 && !showAllActions && (
                  <button
                    onClick={() => setShowAllActions(true)}
                    className="w-full py-2.5 text-sm text-primary font-semibold border border-primary/30 rounded-xl hover:bg-primary/5 transition-colors"
                  >
                    더보기 ({visibleActions.length - 3}개 더)
                  </button>
                )}
              </div>
```

- [ ] **Step 5: 타입체크 + 빌드**

Run: `npx tsc --noEmit && npm run build`
Expected: 성공 (journal 관련 에러 0)

- [ ] **Step 6: 커밋**

```bash
git add app/journal/page.tsx
git commit -m "feat(journal): actions 탭 실행 예정일 그룹 타임라인 + 관찰 대기 중립 라벨"
```

---

## Task 6: 전체 검증

- [ ] **Step 1: 전체 테스트**

Run: `npx vitest run`
Expected: 전체 PASS (기존 + 신규 when-parser 10 + action-timeline 5)

- [ ] **Step 2: 프로덕션 빌드**

Run: `npm run build`
Expected: 성공 (webpack 빌드, next-pwa)

- [ ] **Step 3: 금지어 가드 확인**

Run: `grep -n "캘린더\|일정\|밀린\|마감" app/journal/page.tsx lib/journal/action-timeline.ts`
Expected: 매치 0건 (spec §5 금지어 가드)

---

## Self-Review

**1. Spec coverage:**
- §2 결정 1(지금 즉시) → 본 plan 실행 ✓
- §2 결정 2(읽기 전용 타임라인) → Task 5 그룹 렌더, 캘린더 격자 없음 ✓
- §2.1(best-effort 파싱, 입력 UI 무변경) → Task 2, Task 4 ✓
- §3(planned_at 컬럼, 관찰 대기 라벨) → Task 1, Task 5 Step 4 ✓
- §4 안 하는 것(알림·캘린더·뱃지·streak) → 미구현, Task 6 Step 3 가드 ✓
- §5(금지어) → Task 6 Step 3 ✓
- §6(측정) → ⚠️ 이벤트 instrumentation은 본 plan 범위 외(별도). 아래 갭 참조
- §7 AC1~AC7 → Task 1(AC1), Task 2(AC2·AC3), Task 5(AC4·AC6), Task 6(AC5), 기존 RLS 재사용(AC7) ✓

**갭:** spec §6의 `action_timeline_viewed`·`planned_at_parse_result` 이벤트는 본 plan에 미포함. v1은 *기능 동작*에 집중하고, 측정 instrumentation은 cohort 설계와 함께 별도 작업으로 분리(spec §10 "후속" 정신과 정합). 실착수 전 사용자 확인 필요 항목.

**2. Placeholder scan:** TODO·TBD·"적절히 처리" 없음. 모든 코드 스텝 완전 코드 포함 ✓

**3. Type consistency:** `parseWhenToPlannedAt(when, now)`·`groupActionsByPlannedAt(items, now)`·`bucketForPlannedAt(plannedAt, now)`·`planned_at: string | null` 시그니처 Task 2/3/4/5 전반 일치 ✓
