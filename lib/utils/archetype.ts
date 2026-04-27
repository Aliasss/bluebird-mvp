import { DistortionType } from '@/types';
import { ARCHETYPES, type Archetype } from '@/lib/content/archetypes';

export type ArchetypeResult = {
  archetype: Archetype;
  totalCount: number;
  progressInCycle: number;   // 현재 주기에서 몇 회 진행 (0~4)
  untilNextUpdate: number;   // 다음 업데이트까지 남은 횟수
  isJustUpdated: boolean;    // 이번 사이클 첫 번째 (방금 업데이트)
};

/**
 * analysis 테이블의 row 배열에서 archetype 계산용 입력을 추출한다.
 * 왜곡이 탐지되지 않은 분석은 distortion_type=null placeholder로 저장되므로
 * archetype 카운트에서는 반드시 제외한다.
 *
 * 이 함수는 dashboard·insights 두 페이지가 같은 입력으로 archetype을 계산하도록
 * 유일한 진입점이 된다.
 */
export function getArchetypeResultFromRows(
  rows: ReadonlyArray<{ distortion_type: string | null }>
): ArchetypeResult | null {
  const realRows = rows.filter(
    (r): r is { distortion_type: string } => r.distortion_type != null
  );

  if (realRows.length === 0) return null;

  const distortionCounts: Partial<Record<DistortionType, number>> = {};
  for (const row of realRows) {
    const t = row.distortion_type as DistortionType;
    distortionCounts[t] = (distortionCounts[t] ?? 0) + 1;
  }

  return getArchetypeResult(distortionCounts, realRows.length);
}

/**
 * 왜곡 유형별 빈도 카운트와 총 분석 횟수를 받아 아키타입 결과를 반환한다.
 * totalCount가 0이면 null 반환.
 */
export function getArchetypeResult(
  distortionCounts: Partial<Record<DistortionType, number>>,
  totalCount: number
): ArchetypeResult | null {
  if (totalCount === 0) return null;

  // 1위 왜곡 유형 찾기
  const allTypes = Object.values(DistortionType);
  let topType: DistortionType = allTypes[0];
  let topCount = 0;

  for (const type of allTypes) {
    const count = distortionCounts[type] ?? 0;
    if (count > topCount) {
      topCount = count;
      topType = type;
    }
  }

  const archetype = ARCHETYPES[topType];
  const progressInCycle = totalCount % 5;
  const untilNextUpdate = progressInCycle === 0 ? 0 : 5 - progressInCycle;
  const isJustUpdated = progressInCycle === 0;

  return { archetype, totalCount, progressInCycle, untilNextUpdate, isJustUpdated };
}
