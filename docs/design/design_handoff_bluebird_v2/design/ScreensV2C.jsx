/* ============================================================
   Project Bluebird — UI Kit v2 · Insights + Journal
   ============================================================ */
const { T: G, Icon: Ig, Card: Cg, Top: TopG, ListHeader: LHg, ListRow: LRg, Badge2: Bdg, HeaderV2: HVg } = window;

/* ---------------- INSIGHTS v2 ---------------- */
function InsightsV2({ go }) {
  const freq = [
    ['대인관계', '파국화', '8회'],
    ['업무·성취', '임의적 추론', '5회'],
    ['자기평가', '흑백논리', '4회'],
  ];
  const eff = [
    ['업무·성취', '임의적 추론', '+3.2'],
    ['대인관계', '파국화', '+1.8'],
  ];
  const bars = [2, 4, 3, 6, 5, 8, 7]; // weekly Δpain
  const maxB = Math.max(...bars);
  return (
    <div style={{ minHeight: '100%', background: G.bg, paddingBottom: 96 }}>
      <HVg title="인사이트" />
      <TopG title="당신의 사고 지문" sub="트리거 도메인과 왜곡 유형을 교차해 반복되는 패턴을 보여드려요." style={{ padding: '4px 20px 8px' }} />

      {/* summary bullets */}
      <div style={{ margin: '0 20px', background: G.surface, borderRadius: 20, border: '1px solid ' + G.bg3, padding: 18 }}>
        <Bdg tone="primary">최근 30일 리포트</Bdg>
        <ul style={{ margin: '14px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {['대인관계 영역에서 가장 많이 분석했어요 (8회)', '가장 잦은 패턴은 대인관계 × 파국화 (8회)', '임의적 추론에서 인지 개입이 가장 효과적이었어요 (평균 +3.2점)'].map((s, i) => (
            <li key={i} style={{ display: 'flex', gap: 10, fontSize: 15, color: G.tx1, lineHeight: 1.5 }}>
              <span style={{ color: G.primary, fontWeight: 700 }}>·</span><span>{s}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* delta pain trend */}
      <LHg title="주간 고통 변화량" action="자세히" />
      <div style={{ margin: '0 20px', background: G.surface, borderRadius: 20, border: '1px solid ' + G.bg3, padding: 20 }}>
        <p style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: 0 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: G.primary, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>+35</span>
          <span style={{ fontSize: 14, color: G.tx3 }}>점 · 이번 주 누적</span>
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 96, marginTop: 16 }}>
          {bars.map((b, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: '100%', height: (b / maxB) * 72, background: i === bars.length - 1 ? G.primary : G.tint, borderRadius: 6, transition: 'height .3s' }} />
              <span style={{ fontSize: 10, color: G.tx3 }}>{['월', '화', '수', '목', '금', '토', '일'][i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* frequent patterns */}
      <LHg title="가장 자주 나타난 패턴" />
      <div style={{ margin: '0 20px', background: G.surface, borderRadius: 20, border: '1px solid ' + G.bg3, overflow: 'hidden' }}>
        {freq.map(([cat, dist, n], i) => (
          <React.Fragment key={i}>
            {i > 0 && <div style={{ height: 1, background: G.bg2, margin: '0 20px' }} />}
            <LRg title={dist} desc={cat} right={n} rightSub="누적" />
          </React.Fragment>
        ))}
      </div>

      {/* effective patterns */}
      <LHg title="가장 효과적인 패턴" />
      <div style={{ margin: '0 20px 8px', background: G.surface, borderRadius: 20, border: '1px solid ' + G.bg3, overflow: 'hidden' }}>
        {eff.map(([cat, dist, d], i) => (
          <React.Fragment key={i}>
            {i > 0 && <div style={{ height: 1, background: G.bg2, margin: '0 20px' }} />}
            <LRg title={dist} desc={cat} right={d} rightSub="평균 Δpain" tone={G.success} />
          </React.Fragment>
        ))}
      </div>
      <p style={{ fontSize: 12, color: G.tx3, textAlign: 'center', margin: '12px 20px 0', lineHeight: 1.5 }}>고통 변화량(Δpain)은 재평가를 2회 이상 완료한 패턴만 집계해요.</p>
    </div>
  );
}

/* ---------------- JOURNAL v2 ---------------- */
function JournalV2({ go }) {
  const [tab, setTab] = React.useState('all');
  const entries = [
    { d: '오늘', t: '회의에서 의견을 냈는데 팀장이 별 반응 없이 넘어갔다', dist: '파국화', pain: 6, kind: 'distortion' },
    { d: '어제', t: '발표 후 동료가 짧게 답해서 별로였나 생각했다', dist: '임의적 추론', pain: 4, kind: 'distortion' },
    { d: '2일 전', t: '미루던 보고서를 결국 끝냈다', dist: null, pain: null, kind: 'success' },
    { d: '3일 전', t: '친구 답장이 늦어 무슨 일 있나 계속 신경 쓰였다', dist: '개인화', pain: 5, kind: 'distortion' },
    { d: '5일 전', t: '운동 약속을 일주일째 지켰다', dist: null, pain: null, kind: 'success' },
  ];
  const filtered = tab === 'all' ? entries : entries.filter((e) => e.kind === tab);
  const tabs = [['all', '전체'], ['distortion', '왜곡'], ['success', '성공']];
  return (
    <div style={{ minHeight: '100%', background: G.bg, paddingBottom: 96 }}>
      <HVg title="일지" />
      <TopG title="기록 일지" sub="지금까지 남긴 생각과 성공의 순간이에요." style={{ padding: '4px 20px 12px' }} />
      {/* segmented control */}
      <div style={{ display: 'flex', gap: 6, padding: '0 20px 12px' }}>
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 700, borderRadius: 12, cursor: 'pointer',
            border: 'none', background: tab === id ? G.primary : G.surface, color: tab === id ? '#fff' : G.tx2,
            boxShadow: tab === id ? 'none' : 'inset 0 0 0 1px ' + G.bg3, letterSpacing: '-0.01em',
          }}>{label}</button>
        ))}
      </div>
      <div style={{ margin: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((e, i) => (
          <div key={i} onClick={() => e.kind === 'distortion' && go('analyze')} style={{
            background: G.surface, borderRadius: 18, border: '1px solid ' + (e.kind === 'success' ? 'rgba(22,163,74,0.25)' : G.bg3),
            padding: 16, cursor: e.kind === 'distortion' ? 'pointer' : 'default',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              {e.kind === 'success' ? <Bdg tone="success">성공 순간</Bdg> : <Bdg tone="primary">{e.dist}</Bdg>}
              <span style={{ fontSize: 12, color: G.tx3 }}>{e.d}</span>
            </div>
            <p style={{ fontSize: 15, color: G.tx1, lineHeight: 1.5, margin: 0, fontWeight: 500 }}>{e.t}</p>
            {e.pain !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                <span style={{ fontSize: 12, color: G.tx3 }}>고통</span>
                <div style={{ flex: 1, height: 5, background: G.bg2, borderRadius: 9999, overflow: 'hidden' }}><div style={{ height: '100%', width: (e.pain * 10) + '%', background: G.primary, borderRadius: 9999 }} /></div>
                <span style={{ fontSize: 12, fontWeight: 700, color: G.tx2, fontVariantNumeric: 'tabular-nums' }}>{e.pain}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { InsightsV2, JournalV2 });
