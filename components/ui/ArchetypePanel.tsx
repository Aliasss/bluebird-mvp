import type { ArchetypeResult } from '@/lib/utils/archetype';

export default function ArchetypePanel({ result }: { result: ArchetypeResult | null }) {
  if (!result) {
    return (
      <div className="bg-background-secondary border border-background-tertiary rounded-xl p-4 sm:p-6">
        <p className="text-sm font-semibold text-text-primary mb-1">인지 아키타입</p>
        <p className="text-sm text-text-secondary">
          아직 분석 데이터가 없습니다. 첫 번째 생각을 기록하고 분석을 완료하면 아키타입이 생성됩니다.
        </p>
      </div>
    );
  }

  const { archetype, progressInCycle, untilNextUpdate, isJustUpdated, totalCount } = result;
  const progressPct = (progressInCycle / 5) * 100;

  return (
    <div className="bg-white border border-background-tertiary rounded-xl p-4 sm:p-6 space-y-4">
      {/* 헤더 */}
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">인지 아키타입</p>
        <h2 className="text-xl font-bold text-text-primary">{archetype.name}</h2>
        <p className="text-sm text-text-secondary mt-1">{archetype.tagline}</p>
      </div>

      {/* 설명 */}
      <p className="text-sm text-text-secondary leading-relaxed border-t border-background-tertiary pt-4">
        {archetype.description}
      </p>

      {/* 업데이트 진행 */}
      <div className="border-t border-background-tertiary pt-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-secondary">총 {totalCount}회 분석 기반</p>
          {isJustUpdated ? (
            <span className="text-xs text-primary font-medium">✓ 방금 업데이트됨</span>
          ) : (
            <span className="text-xs text-text-tertiary">{untilNextUpdate}회 후 업데이트</span>
          )}
        </div>
        <div className="h-1.5 bg-background-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${isJustUpdated ? 100 : progressPct}%` }}
          />
        </div>
        <p className="text-[10px] text-text-tertiary">
          분석 5회마다 아키타입이 재계산됩니다
        </p>
      </div>
    </div>
  );
}
