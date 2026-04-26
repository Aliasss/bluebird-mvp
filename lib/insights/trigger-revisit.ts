// 분석 페이지 진입 시 "비슷한 패턴(카테고리 × 주도 왜곡) 과거 로그"를 찾는다.
// 매칭 조건(모두 AND):
//   1. 같은 trigger_category
//   2. 같은 dominant distortion (강도 최댓값)
//   3. windowDays(기본 60) 이내
//   4. 자기 자신 제외
// 정렬: created_at DESC (가장 최근 매칭 1건만 노출 — 스팸 방지).
//
// 카테고리만 일치하는 매칭은 노이즈가 큼("직장" 카테고리는 매일 발생).
// dominant distortion까지 일치할 때만 진짜 패턴 시그널.

import type { DistortionType, TriggerCategory } from '@/types';

const DEFAULT_WINDOW_DAYS = 60;
const SNIPPET_MAX_LENGTH = 40;

export interface RevisitDistortion {
  type: DistortionType;
  intensity: number;
}

export interface RevisitLogRow {
  id: string;
  trigger: string;
  trigger_category: TriggerCategory | null;
  created_at: string;
  distortions: RevisitDistortion[];
}

export interface RevisitCandidate {
  logId: string;
  triggerSnippet: string;
  daysAgo: number;
  distortionType: DistortionType;
  category: TriggerCategory;
}

export interface FindRevisitInput {
  currentLogId: string;
  currentCategory: TriggerCategory | null;
  currentDominantDistortion: DistortionType | null;
  history: RevisitLogRow[];
  now: Date;
  windowDays?: number;
}

export function getDominantDistortion(
  distortions: readonly RevisitDistortion[]
): DistortionType | null {
  if (!distortions.length) return null;
  let dominant = distortions[0];
  for (let i = 1; i < distortions.length; i++) {
    if (distortions[i].intensity > dominant.intensity) {
      dominant = distortions[i];
    }
  }
  return dominant.type;
}

function truncateTrigger(trigger: string, max: number): string {
  if (trigger.length <= max) return trigger;
  return trigger.slice(0, max) + '…';
}

function daysBetween(older: Date, now: Date): number {
  const ms = now.getTime() - older.getTime();
  return Math.max(1, Math.floor(ms / (24 * 60 * 60 * 1000)));
}

export function findTriggerRevisit(input: FindRevisitInput): RevisitCandidate | null {
  const {
    currentLogId,
    currentCategory,
    currentDominantDistortion,
    history,
    now,
    windowDays = DEFAULT_WINDOW_DAYS,
  } = input;

  if (!currentCategory || !currentDominantDistortion) return null;

  const windowMs = windowDays * 24 * 60 * 60 * 1000;
  const cutoff = now.getTime() - windowMs;

  let best: { row: RevisitLogRow; createdAtMs: number } | null = null;

  for (const row of history) {
    if (row.id === currentLogId) continue;
    if (row.trigger_category !== currentCategory) continue;
    const dominant = getDominantDistortion(row.distortions);
    if (dominant !== currentDominantDistortion) continue;

    const createdAtMs = new Date(row.created_at).getTime();
    if (!Number.isFinite(createdAtMs)) continue;
    if (createdAtMs < cutoff) continue;
    if (createdAtMs > now.getTime()) continue;

    if (!best || createdAtMs > best.createdAtMs) {
      best = { row, createdAtMs };
    }
  }

  if (!best) return null;

  return {
    logId: best.row.id,
    triggerSnippet: truncateTrigger(best.row.trigger, SNIPPET_MAX_LENGTH),
    daysAgo: daysBetween(new Date(best.createdAtMs), now),
    distortionType: currentDominantDistortion,
    category: currentCategory,
  };
}
