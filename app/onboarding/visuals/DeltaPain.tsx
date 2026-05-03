// act3-2: pain 0~10 graph + 디버깅 직전·24시간 후 점 2개 + 고통 감소 라벨.

export default function DeltaPain() {
  return (
    <div className="w-full max-w-[280px] mx-auto" aria-hidden="true">
      <svg viewBox="0 0 280 140" className="w-full h-auto">
        {/* y축 */}
        <line x1="40" y1="20" x2="40" y2="110" stroke="currentColor" strokeWidth="0.6" />
        {/* x축 */}
        <line x1="40" y1="110" x2="260" y2="110" stroke="currentColor" strokeWidth="0.6" />

        {/* y축 눈금 0·10 */}
        <text x="34" y="114" textAnchor="end" className="fill-text-tertiary text-[9px]">0</text>
        <text x="34" y="24" textAnchor="end" className="fill-text-tertiary text-[9px]">10</text>

        {/* x축 라벨 */}
        <text x="80" y="125" textAnchor="middle" className="fill-text-secondary text-[9px]">디버깅 직전</text>
        <text x="220" y="125" textAnchor="middle" className="fill-text-secondary text-[9px]">24h 후</text>

        {/* 직전 고통 점 (pain=8 → y=20+(10-8)*9=38) */}
        <circle cx="80" cy="38" r="4" className="fill-primary" />
        <text x="92" y="42" className="fill-text-primary text-[10px] font-semibold">8</text>

        {/* 24h 후 고통 점 (pain=3 → y=20+(10-3)*9=83) */}
        <circle cx="220" cy="83" r="4" className="fill-primary" />
        <text x="232" y="87" className="fill-text-primary text-[10px] font-semibold">3</text>

        {/* 두 점 잇는 점선 */}
        <line x1="80" y1="38" x2="220" y2="83" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 2" />

        {/* 고통 감소 라벨 */}
        <text x="150" y="65" textAnchor="middle" className="fill-primary text-[12px] font-bold">고통 5 감소</text>
      </svg>
    </div>
  );
}
