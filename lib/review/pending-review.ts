// 대시보드 진입 시 재평가 대기 중인 가장 오래된 intervention을 찾는다.
// 조건(모두 AND):
//   1. intervention.is_completed = true
//   2. NOW() - 48h <= completed_at <= NOW() - 6h
//   3. intervention.reevaluated_pain_score IS NULL
//   4. intervention.review_dismissed_at IS NULL
//   5. logs.pain_score IS NOT NULL  (초기 점수 없으면 Δpain 계산 불가)
// 정렬: completed_at ASC (가장 오래된 = FIFO)

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
