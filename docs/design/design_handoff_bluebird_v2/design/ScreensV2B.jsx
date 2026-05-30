/* ============================================================
   Project Bluebird — UI Kit v2 · Log flow + Analyze
   ============================================================ */
const { T: W, Icon: I3, Btn: Bn, Card: Cr, Top: TopL, BottomCTA: BC2, Stepper2: Stp, Badge2: Bd2, HeaderV2: HV } = window;

/* ---------------- LOG FLOW v2 ---------------- */
function LogFlowV2({ go }) {
  const [step, setStep] = React.useState(0);
  const [trigger, setTrigger] = React.useState('회의에서 의견을 냈는데 팀장이 별 반응 없이 넘어갔다');
  const [thought, setThought] = React.useState('내 생각이 한심했나 보다. 앞으로 회의에서 입을 다물어야겠다');
  const [pain, setPain] = React.useState(6);
  const back = () => (step === 0 ? go('landing') : setStep(step - 1));
  const band = (s) => (s <= 2 ? '거의 없음' : s <= 4 ? '약간' : s <= 6 ? '보통' : s <= 8 ? '심함' : '극심');

  const field = (val, set, ph) => (
    <textarea value={val} onChange={(e) => set(e.target.value)} placeholder={ph} autoFocus
      style={{ width: '100%', minHeight: 130, padding: 0, boxSizing: 'border-box', fontFamily: W.font, fontSize: 19, lineHeight: 1.5, fontWeight: 500, color: W.tx1, border: 'none', resize: 'none', outline: 'none', background: 'transparent', letterSpacing: '-0.01em' }} />
  );

  const titles = [
    ['무슨 일이 있었나요?', '어떤 일이 있었는지 적어주세요. 구체적일수록 더 정확히 분석돼요.'],
    ['그때 어떤 생각이 들었나요?', '그 순간 자동으로 떠오른 생각을 그대로 적어주세요.'],
    ['지금 고통 강도는 얼마인가요?', '0(전혀 없음)부터 10(참을 수 없는)까지. 재평가 때 차이값(Δpain)으로 써요.'],
  ];

  return (
    <div style={{ minHeight: '100%', background: W.bg, display: 'flex', flexDirection: 'column' }}>
      <HV back={back} />
      <Stp current={step + 1} total={3} />
      <TopL title={titles[step][0]} sub={titles[step][1]} />
      <div style={{ flex: 1, padding: '8px 20px 150px' }}>
        {step === 0 && <div style={{ background: W.surface, borderRadius: 18, border: '1px solid ' + W.bg3, padding: 20 }}>{field(trigger, setTrigger, '예: 팀장이 내 보고서에 피드백을 주지 않았다')}</div>}
        {step === 1 && (<>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}><Bd2 tone="neutral">트리거</Bd2><span style={{ fontSize: 13, color: W.tx2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trigger}</span></div>
          <div style={{ background: W.surface, borderRadius: 18, border: '1px solid ' + W.bg3, padding: 20 }}>{field(thought, setThought, '예: 내가 일을 못하니까 무시하는 거겠지')}</div>
        </>)}
        {step === 2 && (
          <div style={{ background: W.surface, borderRadius: 18, border: '1px solid ' + W.bg3, padding: 24 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <p style={{ fontSize: 60, fontWeight: 800, color: W.primary, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em', margin: 0, lineHeight: 1 }}>{pain}</p>
              <p style={{ fontSize: 15, color: W.tx2, fontWeight: 600, margin: '8px 0 0' }}>{band(pain)}</p>
            </div>
            <input type="range" min="0" max="10" value={pain} onChange={(e) => setPain(+e.target.value)}
              style={{ width: '100%', accentColor: W.primary, height: 6 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}><span style={{ fontSize: 12, color: W.tx3 }}>0 · 전혀 없음</span><span style={{ fontSize: 12, color: W.tx3 }}>10 · 참을 수 없는</span></div>
          </div>
        )}
      </div>
      <BC2>
        <Bn full disabled={step === 0 ? trigger.trim().length < 5 : step === 1 ? thought.trim().length < 10 : false}
            onClick={() => (step < 2 ? setStep(step + 1) : go('analyze'))}
            style={{ padding: '17px 24px', fontSize: 16, borderRadius: 16 }}>
          {step < 2 ? '다음' : '분석 시작하기'}
        </Bn>
      </BC2>
    </div>
  );
}

/* ---------------- ANALYZE v2 ---------------- */
const DIST2 = [
  { name: '파국화', intensity: 0.72, seg: '앞으로 회의에서 입을 다물어야겠다', role: '우세' },
  { name: '임의적 추론', intensity: 0.54, seg: '내 생각이 한심했나 보다', role: '보조' },
];
const THEORY2 = [['현재 프레임', '손실 프레임'], ['추정 확률', '25%'], ['손실 민감도', '68%'], ['반추 경향', '60%']];
const Q2 = [
  '팀장이 반응하지 않은 것이 "내 의견이 한심하다"는 결론으로 이어질 확률은 몇 %인가요?',
  '같은 상황을 동료가 겪었다면 어떤 다른 해석을 제시하겠어요?',
  '"입을 다문다"가 1주일 뒤 가져올 손실과 이득을 숫자로 적어보세요.',
];

function AnalyzeV2({ go }) {
  const [loading, setLoading] = React.useState(true);
  const [qi, setQi] = React.useState(0);
  const [ans, setAns] = React.useState(['', '', '']);
  React.useEffect(() => { const t = setTimeout(() => setLoading(false), 1700); return () => clearTimeout(t); }, []);

  if (loading) return (
    <div style={{ minHeight: '100%', background: W.bg, display: 'flex', flexDirection: 'column' }}>
      <HV back={() => go('dashboard')} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 24, padding: '0 32px 80px' }}>
        <div style={{ width: 56, height: 56, borderRadius: 9999, border: '4px solid ' + W.bg3, borderTopColor: W.primary, animation: 'bbspin2 .9s linear infinite' }} />
        <div><p style={{ fontSize: 18, fontWeight: 700, color: W.tx1, margin: 0, letterSpacing: '-0.02em' }}>인지 패턴을 맞추고 있어요</p><p style={{ fontSize: 14, color: W.tx2, margin: '8px 0 0' }}>보통 10~20초 정도 걸려요.</p></div>
      </div>
      <style>{`@keyframes bbspin2{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const mark = (text, seg) => { const i = text.indexOf(seg); if (i < 0) return text; return (<>{text.slice(0, i)}<mark style={{ background: 'rgba(217,119,6,0.28)', padding: '0 3px', borderRadius: 3 }}>{seg}</mark>{text.slice(i + seg.length)}</>); };
  const sec = { background: W.surface, borderRadius: 20, border: '1px solid ' + W.bg3, padding: 20, margin: '0 20px' };

  return (
    <div style={{ minHeight: '100%', background: W.bg, paddingBottom: 150 }}>
      <HV back={() => go('dashboard')} />
      <TopL title="분석이 완료됐어요" sub="2개 왜곡이 동시에 작동하고 있어요." />

      {/* input echo */}
      <div style={sec}>
        <Bd2 tone="neutral">기록한 생각</Bd2>
        <p style={{ fontSize: 16, color: W.tx1, lineHeight: 1.6, margin: '12px 0 0', fontWeight: 500 }}>{mark('내 생각이 한심했나 보다. 앞으로 회의에서 입을 다물어야겠다', '앞으로 회의에서 입을 다물어야겠다')}</p>
      </div>

      {/* distortions */}
      <window.ListHeader title="발견된 생각의 패턴" />
      <div style={{ margin: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {DIST2.map((d, i) => (
          <div key={i} style={{ background: W.surface, borderRadius: 18, border: '1px solid ' + W.bg3, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 17, fontWeight: 700, color: W.tx1, letterSpacing: '-0.01em' }}>{d.name}</span><Bd2 tone={i === 0 ? 'primary' : 'neutral'}>{d.role}</Bd2></div>
              <span style={{ fontSize: 14, fontWeight: 700, color: W.primary, fontVariantNumeric: 'tabular-nums' }}>{Math.round(d.intensity * 100)}%</span>
            </div>
            <div style={{ height: 8, background: W.bg2, borderRadius: 9999, overflow: 'hidden', marginBottom: 10 }}><div style={{ height: '100%', width: (d.intensity * 100) + '%', background: W.primary, borderRadius: 9999 }} /></div>
            <p style={{ fontSize: 14, color: W.tx2, margin: 0 }}>{d.seg}</p>
          </div>
        ))}
      </div>

      {/* theory grid */}
      <window.ListHeader title="이론 기반 해석" />
      <div style={{ ...sec, padding: 6 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          {THEORY2.map(([k, v], i) => (
            <div key={k} style={{ padding: 16, borderRight: i % 2 === 0 ? '1px solid ' + W.bg2 : 'none', borderBottom: i < 2 ? '1px solid ' + W.bg2 : 'none' }}>
              <p style={{ fontSize: 12, color: W.tx3, margin: 0 }}>{k}</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: W.tx1, margin: '4px 0 0', letterSpacing: '-0.01em' }}>{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* socratic question */}
      <window.ListHeader title="생각을 점검하는 질문" />
      <div style={sec}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><Bd2 tone="primary">질문 {qi + 1} / 3</Bd2><span style={{ fontSize: 12, color: W.tx3 }}>근거를 담아 적어주세요</span></div>
        <p style={{ fontSize: 17, fontWeight: 700, color: W.tx1, lineHeight: 1.5, margin: '0 0 14px', letterSpacing: '-0.01em' }}>{Q2[qi]}</p>
        <textarea value={ans[qi]} onChange={(e) => { const n = [...ans]; n[qi] = e.target.value; setAns(n); }} placeholder="예: 최악의 경우는 25% 정도라고 생각해요. 근거는 ..."
          style={{ width: '100%', minHeight: 90, padding: 14, boxSizing: 'border-box', fontFamily: W.font, fontSize: 15, color: W.tx1, border: '1px solid ' + W.bg3, borderRadius: 14, resize: 'none', outline: 'none', lineHeight: 1.5 }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          {qi > 0 && <Bn variant="ghost" onClick={() => setQi(qi - 1)} style={{ flex: 1, borderRadius: 14 }}>이전</Bn>}
          <Bn full={qi === 0} onClick={() => (qi < 2 ? setQi(qi + 1) : null)} style={{ flex: 2, borderRadius: 14 }}>{qi < 2 ? '다음 질문' : '세 질문 모두 완료'}</Bn>
        </div>
      </div>

      <BC2 sub="답변은 나중에 이어서 작성할 수 있어요">
        <Bn full onClick={() => go('visualize')} style={{ padding: '17px 24px', fontSize: 16, borderRadius: 16 }}>저장하고 시각화 보기</Bn>
      </BC2>
    </div>
  );
}

Object.assign(window, { LogFlowV2, AnalyzeV2 });
