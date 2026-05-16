// 종단 패턴 산출 — 같은 trigger_category × 같은 dominant distortion의 누적 등장 횟수·
// 마지막 등장일·평균 강도를 정리해 사용자에게 "이번 사고가 지난 N회와 어떻게 연결되는지"
// 새 정보를 surface한다. 5/16 창업자 자기 인터뷰 P0-1.
//
// 데이터 입력은 trigger-revisit의 RevisitLogRow 그대로 재사용 — 신규 DB 쿼리 0.

import type { DistortionType, TriggerCategory } from '@/types';
import type { RevisitLogRow } from './trigger-revisit';

export interface LongitudinalPattern {
  /** 같은 트리거 카테고리 + 같은 우세 왜곡 등장 횟수 (현재 분석 포함) */
  occurrenceCount: number;
  /** 같은 트리거 카테고리 전체 등장 횟수 (왜곡 무관, 현재 분석 포함) */
  totalCategoryCount: number;
  /** 같은 묶음 평균 강도 (0~1, 현재 분석 제외) */
  averageIntensity: number | null;
  /** 가장 최근 같은 묶음 발생일까지 일수 (현재 분석 제외, 가까울수록 작음) */
  lastOccurrenceDaysAgo: number | null;
  /** 어제 ~ 30일 전 사이 같은 묶음 빈도 (현재 분석 제외) */
  recentMonthCount: number;
}

export interface ComputeLongitudinalInput {
  currentCategory: TriggerCategory | null;
  currentDominantDistortion: DistortionType | null;
  history: readonly RevisitLogRow[];
  now: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 신규 DB 쿼리 없이 trigger-revisit이 가져온 history를 재활용.
 * history에는 현재 분석(currentLogId)이 제외된 과거 60일 데이터가 들어옴.
 *
 * 반환 값의 occurrenceCount·totalCategoryCount는 *현재 분석 포함* 카운트.
 * 다른 통계(평균 강도·마지막 발생일)는 history 기준 — 현재 분석 제외.
 *
 * 입력 조건 불충분 시 (카테고리 또는 우세 왜곡 없음) null 반환.
 */
export function computeLongitudinalPattern(
  input: ComputeLongitudinalInput,
): LongitudinalPattern | null {
  const { currentCategory, currentDominantDistortion, history, now } = input;
  if (!currentCategory || !currentDominantDistortion) return null;

  let sameBundleCount = 0;
  let sameBundleIntensitySum = 0;
  let sameBundleIntensityN = 0;
  let lastOccurrenceMs: number | null = null;
  let sameBundleLast30dCount = 0;
  let totalCategoryCount = 0;

  const monthAgoMs = now.getTime() - 30 * DAY_MS;

  for (const row of history) {
    if (row.trigger_category !== currentCategory) continue;
    totalCategoryCount += 1;

    // 같은 카테고리 row의 dominant 산출
    let dominant: DistortionType | null = null;
    let topIntensity = -1;
    for (const d of row.distortions) {
      if (d.intensity > topIntensity) {
        topIntensity = d.intensity;
        dominant = d.type;
      }
    }
    if (dominant !== currentDominantDistortion) continue;

    sameBundleCount += 1;
    sameBundleIntensitySum += topIntensity;
    sameBundleIntensityN += 1;

    const rowMs = new Date(row.created_at).getTime();
    if (lastOccurrenceMs === null || rowMs > lastOccurrenceMs) {
      lastOccurrenceMs = rowMs;
    }
    if (rowMs >= monthAgoMs) {
      sameBundleLast30dCount += 1;
    }
  }

  const averageIntensity =
    sameBundleIntensityN > 0 ? sameBundleIntensitySum / sameBundleIntensityN : null;

  const lastOccurrenceDaysAgo =
    lastOccurrenceMs !== null
      ? Math.max(0, Math.floor((now.getTime() - lastOccurrenceMs) / DAY_MS))
      : null;

  return {
    occurrenceCount: sameBundleCount + 1, // 현재 분석 포함
    totalCategoryCount: totalCategoryCount + 1, // 현재 분석 포함
    averageIntensity,
    lastOccurrenceDaysAgo,
    recentMonthCount: sameBundleLast30dCount,
  };
}
