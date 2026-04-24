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
