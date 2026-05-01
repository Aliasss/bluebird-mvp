// act1-3: 4분면 (명상·코칭·일기·챗봇) + 빈 5번 자리.
// 5번째 슬롯은 점선 박스 ("분석가에게 닿는 도구는 비어 있다").
// 별 글리프 ✦/★ 사용 금지 (lint:copy 항해 메타포).

export default function ToolQuadrant() {
  const tools = [
    { label: '명상', sub: '가라앉힘' },
    { label: '코칭', sub: '비싸고 느림' },
    { label: '일기', sub: '누적만' },
    { label: '챗봇', sub: '위로만' },
  ];
  return (
    <div className="w-full max-w-[280px] mx-auto" aria-hidden="true">
      <div className="grid grid-cols-2 gap-2">
        {tools.map((t) => (
          <div
            key={t.label}
            className="border border-background-tertiary rounded-xl p-3 bg-white text-center"
          >
            <p className="text-[12px] font-semibold text-text-primary">{t.label}</p>
            <p className="text-[10px] text-text-tertiary mt-0.5">{t.sub}</p>
          </div>
        ))}
      </div>
      <div className="mt-2">
        <div className="border border-dashed border-primary rounded-xl p-3 bg-background-secondary text-center">
          <p className="text-[12px] font-semibold text-primary">분석가용 — 비어 있음</p>
          <p className="text-[10px] text-text-secondary mt-0.5">디버깅 도구</p>
        </div>
      </div>
    </div>
  );
}
