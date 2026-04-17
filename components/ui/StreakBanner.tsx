import type { StreakResult } from '@/lib/utils/streak';

export default function StreakBanner({ streak }: { streak: StreakResult }) {
  if (streak.current === 0 && !streak.doneToday) {
    return (
      <div className="bg-background-secondary border border-background-tertiary rounded-xl p-4 flex items-center gap-3 mb-4 sm:mb-6">
        <span className="text-2xl">🔥</span>
        <p className="text-sm text-text-secondary">오늘 첫 분석으로 스트릭을 시작해보세요</p>
      </div>
    );
  }

  return (
    <div className="bg-primary bg-opacity-5 border border-primary border-opacity-20 rounded-xl p-4 flex items-center justify-between mb-4 sm:mb-6">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔥</span>
        <div>
          <p className="text-xl font-bold text-primary">{streak.current}일 연속</p>
          <p className="text-xs text-text-secondary">
            {streak.doneToday ? '오늘도 달성했습니다!' : '오늘 분석하면 유지됩니다'}
          </p>
        </div>
      </div>
      {streak.best > 0 && (
        <div className="text-right">
          <p className="text-xs text-text-secondary">최고 기록</p>
          <p className="text-sm font-semibold text-text-primary">{streak.best}일</p>
        </div>
      )}
    </div>
  );
}
