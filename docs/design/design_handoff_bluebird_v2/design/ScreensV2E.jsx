/* ============================================================
   Project Bluebird — UI Kit v2 · Action (Tiny Habit 확약)
   원본 app/action/[id]/page.tsx 구조 충실 재현.
   ============================================================ */
const { T: A, Icon: Ia, Btn: Ba, Top: TopA, ListHeader: LHa, BottomCTA: BCa, Badge2: Bda, HeaderV2: HVa } = window;

// 파국화 우세 → 실제 DISTORTION_HABITS.catastrophizing 제안
const HABIT = {
  cue: '최악의 시나리오가 머릿속에 떠오르는 순간',
  action: '그 결과가 실제로 일어날 확률을 0~100%로 적고, 반대 증거 1가지를 찾는다. (5분)',
  reflection: '실제 확률이 내가 체감한 것보다 낮았는지 1문장으로 기록한다.',
};

function ActionV2({ go }) {
  const [when, setWhen] = React.useState('오늘 21:00');
  const [what, setWhat] = React.useState('확률을 적고 반대 증거 1가지 찾기');
  const [howLong, setHowLong] = React.useState('5분');
  const [phase, setPhase] = React.useState('plan'); // plan → committed
  const [sheet, setSheet] = React.useState(false);
  const [reaction, setReaction] = React.useState(null);
  const [memo, setMemo] = React.useState('');
  const [done, setDone] = React.useState(null); // {delta, total, hasNote}

  const field = (label, val, set, ph) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: A.tx2, letterSpacing: '0.01em', marginBottom: 6 }}>{label}</label>
      <input value={val} onChange={(e) => set(e.target.value)} placeholder={ph} disabled={phase === 'committed'}
        style={{ width: '100%', boxSizing: 'border-box', padding: '13px 16px', fontFamily: A.font, fontSize: 15, color: A.tx1, border: '1px solid ' + A.bg3, borderRadius: 12, outline: 'none', background: phase === 'committed' ? A.bg2 : '#fff' }} />
    </div>
  );

  const reactions = [['improved', '😌', '나아졌어요'], ['same', '😐', '비슷해요'], ['worse', '😟', '더 힘들어요']];
  const valid = when.trim() && what.trim() && howLong.trim();

  const commitDone = () => {
    const hasNote = memo.trim().length > 0;
    const delta = hasNote ? 25 : 10; // 답변보너스 + 노트보너스 단순화
    setDone({ delta, total: 128 + delta, hasNote });
    setSheet(false);
    setPhase('committed');
  };

  return (
    <div style={{ minHeight: '100%', background: A.bg, paddingBottom: 150 }}>
      <HVa back={() => go('visualize')} />
      <TopA title={<span>작은 행동 하나로<br />확약해볼까요</span>} sub="분석한 생각을 측정 가능한 행동으로 바꾸면, 직접 행사한 자율성이 지수로 쌓여요." />

      {/* 상황 요약 */}
      <div style={{ margin: '0 20px', background: A.surface, borderRadius: 20, border: '1px solid ' + A.bg3, padding: 18 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}><Bda tone="neutral">트리거</Bda><Bda tone="primary">파국화 72%</Bda></div>
        <p style={{ fontSize: 15, color: A.tx1, lineHeight: 1.5, margin: 0, fontWeight: 500 }}>회의에서 의견을 냈는데 팀장이 별 반응 없이 넘어갔다</p>
      </div>

      {/* Tiny Habit 제안 */}
      <LHa title="Tiny Habit 제안" />
      <div style={{ margin: '0 20px', background: A.tint, borderRadius: 18, padding: 18 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: A.primary, margin: '0 0 8px' }}>[{HABIT.cue}]</p>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[HABIT.action, HABIT.reflection, '완료 직후 기분 변화를 1~5점으로 기록한다.'].map((s, i) => (
            <li key={i} style={{ display: 'flex', gap: 8, fontSize: 14, color: A.tx1, lineHeight: 1.5 }}><span style={{ color: A.primary, fontWeight: 700 }}>·</span><span>{s}</span></li>
          ))}
        </ul>
      </div>

      {/* 내 행동 계획 */}
      <LHa title="내 행동 계획" />
      <div style={{ margin: '0 20px', background: A.surface, borderRadius: 20, border: '1px solid ' + A.bg3, padding: 20 }}>
        <p style={{ fontSize: 12, color: A.tx3, margin: '0 0 16px', lineHeight: 1.5 }}>측정 가능한 한 가지로 좁혀주세요. 24시간 뒤 결과를 다시 적으러 들어옵니다.</p>
        {field('⏰ 언제', when, setWhen, '예: 오늘 21:00 / 내일 점심 후')}
        {field('🎯 무엇을', what, setWhat, '예: 보고서 첫 문단만 쓰기')}
        {field('⏱️ 얼마나', howLong, setHowLong, '예: 5분 / 1번')}
        {phase === 'committed' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, padding: '12px', borderRadius: 12, background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.3)' }}>
            <Ia name="check" size={18} color={A.success} /><span style={{ fontSize: 14, fontWeight: 700, color: A.success }}>완료됨</span>
          </div>
        )}
      </div>

      {/* 자율성 micro-feedback */}
      {done && (
        <div style={{ margin: '16px 20px 0', background: A.surface, border: '2px solid rgba(217,119,6,0.4)', borderRadius: 20, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><span style={{ fontSize: 11, fontWeight: 700, color: A.warning, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Autonomy</span><span style={{ fontSize: 12, color: A.tx3 }}>방금 행사한 자율성</span></div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '10px 0' }}><span style={{ fontSize: 34, fontWeight: 800, color: A.warning, letterSpacing: '-0.02em' }}>+{done.delta}</span><span style={{ fontSize: 14, color: A.tx2 }}>점{done.hasNote && <span style={{ color: A.tx3 }}> (메모 보너스 포함)</span>}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 12, borderTop: '1px solid ' + A.bg3 }}><span style={{ fontSize: 12, color: A.tx2 }}>누적 자율성 지수</span><span style={{ fontSize: 16, fontWeight: 700, color: A.tx1 }}>{done.total}점</span></div>
        </div>
      )}

      {/* BottomCTA */}
      <BCa sub={phase === 'plan' ? '계획을 확정한 뒤 실행하고 결과를 기록해요' : undefined}>
        {phase === 'plan' ? (
          <Ba full disabled={!valid} onClick={() => setSheet(true)} style={{ padding: '17px 24px', fontSize: 16, borderRadius: 16 }}>행동 계획 확정하고 실행</Ba>
        ) : (
          <Ba full onClick={() => go('dashboard')} style={{ padding: '17px 24px', fontSize: 16, borderRadius: 16 }}>대시보드로</Ba>
        )}
      </BCa>

      {/* 완료 시트 */}
      {sheet && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }} onClick={() => setSheet(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', background: '#fff', borderRadius: '28px 28px 0 0', padding: '24px 20px 40px', boxShadow: A.shadowElev2 }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: A.tx1, textAlign: 'center', margin: '0 0 20px', letterSpacing: '-0.02em' }}>행동을 완료했어요</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: A.tx3, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 10px' }}>행동 전후 변화</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              {reactions.map(([v, e, l]) => (
                <button key={v} onClick={() => setReaction(v)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '14px 0', borderRadius: 16, cursor: 'pointer', fontSize: 12, fontWeight: 700, background: reaction === v ? A.tint : '#fff', border: '2px solid ' + (reaction === v ? A.primary : A.bg3), color: reaction === v ? A.primary : A.tx2 }}>
                  <span style={{ fontSize: 22 }}>{e}</span>{l}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, color: A.tx3, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 8px' }}>행동 메모 <span style={{ color: A.primary, textTransform: 'none', fontWeight: 600 }}>(+15점)</span></p>
            <textarea value={memo} onChange={(e) => setMemo(e.target.value.slice(0, 200))} placeholder="짧은 생각 한 줄을 남겨볼까요? (선택)"
              style={{ width: '100%', boxSizing: 'border-box', height: 76, padding: 12, fontFamily: A.font, fontSize: 14, color: A.tx1, border: '1px solid ' + A.bg3, borderRadius: 12, resize: 'none', outline: 'none', lineHeight: 1.5 }} />
            <Ba full onClick={commitDone} style={{ marginTop: 14, padding: '16px 24px', fontSize: 15, borderRadius: 16 }}>{memo.trim() ? '메모 기록하고 완료 (+15점 보너스)' : '완료하기'}</Ba>
          </div>
        </div>
      )}
    </div>
  );
}

window.ActionV2 = ActionV2;
