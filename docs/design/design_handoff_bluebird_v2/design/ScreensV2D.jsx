/* ============================================================
   Project Bluebird — UI Kit v2 · Visualize (prospect theory) + Me
   ============================================================ */
const { T: P, Icon: Ip, Btn: Bp, Top: TopP, ListHeader: LHp, ListRow: LRp, BottomCTA: BCp, Badge2: Bdp, HeaderV2: HVp } = window;

/* prospect-theory value function: v(x)=x^a (gain), -L*(-x)^a (loss) */
function ProspectChart() {
  const A = 0.88, L = 2.25, w = 320, h = 220, pad = 28;
  const vf = (x) => (x >= 0 ? Math.pow(x, A) : -L * Math.pow(-x, A));
  const xs = []; for (let i = -50; i <= 50; i++) xs.push(i / 50);
  const ys = xs.map(vf);
  const yMax = vf(1), yMin = vf(-1);
  const X = (x) => pad + ((x + 1) / 2) * (w - 2 * pad);
  const Y = (y) => pad + (1 - (y - yMin) / (yMax - yMin)) * (h - 2 * pad);
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${X(x).toFixed(1)},${Y(ys[i]).toFixed(1)}`).join(' ');
  const ux = -0.5, uy = vf(ux); // user loss point
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {/* grid axes */}
      <line x1={X(0)} y1={pad} x2={X(0)} y2={h - pad} stroke="#CBD5E1" strokeWidth="1" />
      <line x1={pad} y1={Y(0)} x2={w - pad} y2={Y(0)} stroke="#CBD5E1" strokeWidth="1" />
      {/* curve */}
      <path d={path} fill="none" stroke="#1E40AF" strokeWidth="3" strokeLinecap="round" />
      {/* user point */}
      <line x1={X(ux)} y1={Y(uy)} x2={X(ux)} y2={Y(0)} stroke="#E11D48" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx={X(ux)} cy={Y(uy)} r="6" fill="#E11D48" stroke="#fff" strokeWidth="2.5" />
      {/* labels */}
      <text x={w - pad} y={Y(0) - 8} textAnchor="end" fontSize="11" fill="#94A3B8">이득 →</text>
      <text x={pad} y={Y(0) - 8} fontSize="11" fill="#94A3B8">← 손실</text>
      <text x={X(ux)} y={Y(uy) + 20} textAnchor="middle" fontSize="11" fontWeight="700" fill="#E11D48">지금</text>
    </svg>
  );
}

function VisualizeV2({ go }) {
  return (
    <div style={{ minHeight: '100%', background: P.bg, paddingBottom: 150 }}>
      <HVp back={() => go('analyze')} />
      <TopP title="전망이론으로 본 지금" sub="같은 사건도 '손실'로 볼 때 우리는 실제보다 훨씬 크게 아파요." />
      <div style={{ margin: '0 20px', background: P.surface, borderRadius: 20, border: '1px solid ' + P.bg3, padding: '20px 12px 14px' }}>
        <ProspectChart />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: P.tx2 }}><span style={{ width: 14, height: 3, background: P.primary, borderRadius: 2 }} />가치 함수</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: P.tx2 }}><span style={{ width: 9, height: 9, background: P.distortion, borderRadius: 9999 }} />당신의 현재 위치</span>
        </div>
      </div>

      <LHp title="왜 이렇게 느껴질까요" />
      <div style={{ margin: '0 20px', background: P.surface, borderRadius: 20, border: '1px solid ' + P.bg3, overflow: 'hidden' }}>
        <LRp icon="anchor" title="준거점" desc="의견을 내면 인정받아야 한다" />
        <div style={{ height: 1, background: P.bg2, margin: '0 20px' }} />
        <LRp icon="trending-down" title="손실 프레임" desc="얻은 것보다 잃은 것에 초점이 가 있어요" tone={P.distortion} iconBg="rgba(225,29,72,0.1)" />
        <div style={{ height: 1, background: P.bg2, margin: '0 20px' }} />
        <LRp icon="percent" title="추정 확률" desc="두려워하는 일이 실제 일어날 확률" right="25%" />
      </div>

      <div style={{ margin: '16px 20px 0', background: P.tint, borderRadius: 18, padding: 18 }}>
        <p style={{ fontSize: 15, color: P.tx1, lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
          곡선의 왼쪽(손실)이 오른쪽(이득)보다 가파른 게 보이나요? <b style={{ color: P.primary }}>같은 크기라도 손실을 약 2배 더 아프게</b> 느끼도록 설계돼 있어요. 지금 느끼는 고통의 일부는 사건이 아니라 <b style={{ color: P.primary }}>프레임</b>에서 옵니다.
        </p>
      </div>

      <BCp>
        <Bp full onClick={() => go('action')} style={{ padding: '17px 24px', fontSize: 16, borderRadius: 16 }}>행동 하나로 확약하기</Bp>
      </BCp>
    </div>
  );
}

/* ---------------- ME v2 ---------------- */
function MeV2({ go }) {
  return (
    <div style={{ minHeight: '100%', background: P.bg, paddingBottom: 96 }}>
      <HVp title="나" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 20px 20px' }}>
        <div style={{ width: 60, height: 60, borderRadius: 9999, background: P.tint, color: P.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>알</div>
        <div>
          <p style={{ fontSize: 20, fontWeight: 800, color: P.tx1, margin: 0, letterSpacing: '-0.02em' }}>알빈님</p>
          <p style={{ fontSize: 14, color: P.tx3, margin: '2px 0 0' }}>관찰자 단계 · 분석 22회</p>
        </div>
      </div>

      <LHp title="기록" />
      <div style={{ margin: '0 20px', background: P.surface, borderRadius: 20, border: '1px solid ' + P.bg3, overflow: 'hidden' }}>
        <LRp icon="flame" title="연속 기록" right="7일" chevron onClick={() => {}} />
        <div style={{ height: 1, background: P.bg2, margin: '0 20px' }} />
        <LRp icon="award" title="자율성 지수" right="128점" chevron onClick={() => {}} />
        <div style={{ height: 1, background: P.bg2, margin: '0 20px' }} />
        <LRp icon="bell" title="체크인 알림" desc="모닝 08:00 · 이브닝 21:00" chevron onClick={() => {}} />
      </div>

      <LHp title="더 알아보기" />
      <div style={{ margin: '0 20px 8px', background: P.surface, borderRadius: 20, border: '1px solid ' + P.bg3, overflow: 'hidden' }}>
        <LRp icon="book-open" title="기술 매뉴얼" desc="인지 왜곡 5가지 정의와 디버깅 질문" chevron onClick={() => {}} />
        <div style={{ height: 1, background: P.bg2, margin: '0 20px' }} />
        <LRp icon="compass" title="우리의 철학" desc="System 2의 가치" chevron onClick={() => {}} />
        <div style={{ height: 1, background: P.bg2, margin: '0 20px' }} />
        <LRp icon="life-buoy" title="정신건강 자원" chevron onClick={() => {}} />
      </div>
    </div>
  );
}

Object.assign(window, { VisualizeV2, MeV2 });
