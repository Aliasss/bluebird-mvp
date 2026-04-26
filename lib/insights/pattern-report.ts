// 트리거 카테고리 × 왜곡 유형 패턴 집계.
// 인사이트 페이지의 개인화 리포트를 위한 순수 함수 모음.
//
// 핵심 셀(PatternCell): (category, distortion) 조합당 (count, avgDelta).
//   - count: 해당 조합의 분석 빈도
//   - avgDelta: 해당 조합 분석들의 (initial_pain - reevaluated_pain) 평균.
//     재평가 데이터가 부족하면 null.
//
// 양수 avgDelta = 인지 개입이 평균적으로 고통을 줄였다는 의미.

import type { DistortionType, TriggerCategory } from '@/types';

export interface PatternRow {
  category: TriggerCategory;
  distortion: DistortionType;
  deltaPain: number | null;
}

export interface PatternCell {
  category: TriggerCategory;
  distortion: DistortionType;
  count: number;
  avgDelta: number | null;
}

export function aggregatePatterns(rows: readonly PatternRow[]): PatternCell[] {
  const buckets = new Map<
    string,
    {
      category: TriggerCategory;
      distortion: DistortionType;
      count: number;
      deltaSum: number;
      deltaCount: number;
    }
  >();

  for (const row of rows) {
    const key = `${row.category}|${row.distortion}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        category: row.category,
        distortion: row.distortion,
        count: 0,
        deltaSum: 0,
        deltaCount: 0,
      };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    if (row.deltaPain != null && Number.isFinite(row.deltaPain)) {
      bucket.deltaSum += row.deltaPain;
      bucket.deltaCount += 1;
    }
  }

  return Array.from(buckets.values()).map((b) => ({
    category: b.category,
    distortion: b.distortion,
    count: b.count,
    avgDelta: b.deltaCount > 0 ? b.deltaSum / b.deltaCount : null,
  }));
}

// 빈도 상위 K개. 동률은 avgDelta(있는 쪽 우선, 큰 쪽 우선)로 안정 정렬.
export function topByCount(cells: readonly PatternCell[], k: number): PatternCell[] {
  return [...cells]
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      const aDelta = a.avgDelta ?? -Infinity;
      const bDelta = b.avgDelta ?? -Infinity;
      return bDelta - aDelta;
    })
    .slice(0, k);
}

// Δpain 효과 상위 K개. minSamples 미달 셀은 제외 (1회 표본 신뢰성 X).
// avgDelta가 null인 셀도 제외.
export function topByDelta(
  cells: readonly PatternCell[],
  k: number,
  minSamples: number
): PatternCell[] {
  return cells
    .filter((c) => c.avgDelta != null && c.count >= minSamples)
    .sort((a, b) => (b.avgDelta as number) - (a.avgDelta as number))
    .slice(0, k);
}

// 카테고리별 분석 횟수.
export function countByCategory(
  cells: readonly PatternCell[]
): Array<{ category: TriggerCategory; count: number }> {
  const totals = new Map<TriggerCategory, number>();
  for (const cell of cells) {
    totals.set(cell.category, (totals.get(cell.category) ?? 0) + cell.count);
  }
  return Array.from(totals.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}
