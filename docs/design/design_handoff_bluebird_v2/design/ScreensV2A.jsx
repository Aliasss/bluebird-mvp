/* ============================================================
   Project Bluebird — UI Kit v2 · Landing + Dashboard
   ============================================================ */
const { T: V, Icon: I2, Btn: Bt, Card: Cd, Top: TopT, ListHeader: LH, ListRow: LR, BottomCTA: BCTA, Badge2: Bg } = window;

const SBClear = () => <div style={{ height: 50 }} />; // status bar clearance

/* compact sticky header for v2 (wordmark / back) */
function HeaderV2({ back, title, right }) {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 30, background: V.bg, padding: '50px 12px 8px', display: 'flex', alignItems: 'center', gap: 4, minHeight: 0 }}>
      {back ? <button onClick={back} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: V.tx1, display: 'flex' }}><I2 name="chevron-left" size={26} stroke={1.9} /></button>
            : <div style={{ flex: 1, padding: '0 8px', fontSize: 17, fontWeight: 800, color: V.primary, letterSpacing: '-0.02em' }}>{title || 'Project Bluebird'}</div>}
      <div style={{ flex: back ? 1 : 0 }} />
      <div style={{ paddingRight: 8 }}>{right}</div>
    </div>
  );
}

/* ---------------- LANDING v2 ---------------- */
function LandingV2({ go }) {
  return (
    <div style={{ minHeight: '100%', background: V.bg, display: 'flex', flexDirection: 'column' }}>
      <SBClear />
      <div style={{ flex: 1, padding: '8px 20px 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28, paddingBottom: 24 }}>
          <div>
            <Bg tone="primary">인지 분석 도구</Bg>
            <h1 style={{ fontSize: 32, lineHeight: 1.28, fontWeight: 800, color: V.tx1, letterSpacing: '-0.035em', margin: '16px 0 0' }}>
              반복되는 사고 패턴을<br /><span style={{ color: V.primary }}>구조로 봅니다.</span>
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: V.tx2, margin: '14px 0 0', letterSpacing: '-0.01em' }}>
              자동으로 떠오른 생각을 기록하면, 그 안에 숨은 인지 왜곡을 분석해 드려요. 분석이 쌓일수록 당신의 사고 패턴이 또렷해집니다.
            </p>
          </div>
          <div style={{ background: V.surface, borderRadius: 20, border: '1px solid ' + V.bg3, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 8px', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: V.tx3 }}>이런 순간에</div>
            <LR icon="message-circle" title="회의에서 한마디 한 뒤" desc='"괜히 말했다"로 굳어질 때' />
            <div style={{ height: 1, background: V.bg2, margin: '0 20px' }} />
            <LR icon="clock" title="답장이 하루 늦어진 걸 보고" desc='"내가 뭘 잘못했지"부터 떠오를 때' />
            <div style={{ height: 1, background: V.bg2, margin: '0 20px' }} />
            <LR icon="target" title="평가를 앞두고" desc='"이번에도 부족할 것이다"가 들릴 때' />
          </div>
        </div>
      </div>
      <BCTA sub="인지행동치료(CBT)·메타인지·전망이론 기반">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Bt full onClick={() => go('log')} style={{ padding: '17px 24px', fontSize: 16, borderRadius: 16 }}>60초 체험 시작하기</Bt>
          <Bt variant="ghost" full onClick={() => go('dashboard')} style={{ padding: '15px 24px', fontSize: 15, borderRadius: 16, border: 'none', color: V.tx2 }}>이미 계정이 있어요</Bt>
        </div>
      </BCTA>
    </div>
  );
}

/* ---------------- DASHBOARD v2 ---------------- */
function HeroStat({ go }) {
  return (
    <div style={{ margin: '4px 20px 0', borderRadius: 22, padding: 22, background: 'linear-gradient(160deg, #1E3A8A 0%, #1E40AF 60%, #3B82F6 140%)', color: '#fff', boxShadow: '0 10px 30px rgba(30,64,175,0.28)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: 0, fontWeight: 500 }}>자율성 지수</p>
          <p style={{ display: 'flex', alignItems: 'baseline', gap: 3, fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', margin: '4px 0 0', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>128<span style={{ fontSize: 18, opacity: 0.85, fontWeight: 700 }}>점</span></p>
        </div>
        <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 700, padding: '6px 11px', borderRadius: 9999, background: 'rgba(255,255,255,0.18)', whiteSpace: 'nowrap' }}>관찰자 단계</span>
      </div>
      <div style={{ marginTop: 18, height: 6, background: 'rgba(255,255,255,0.22)', borderRadius: 9999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: '64%', background: '#fff', borderRadius: 9999 }} />
      </div>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.82)', margin: '10px 0 0', lineHeight: 1.4 }}>다음 단계까지 22점 · 자동 사고를 한 발 떨어져 바라보는 중</p>
    </div>
  );
}

function DashboardV2({ go }) {
  const [morning, setMorning] = React.useState(true);
  return (
    <div style={{ minHeight: '100%', background: V.bg, paddingBottom: 96 }}>
      <HeaderV2 right={<div style={{ width: 34, height: 34, borderRadius: 9999, background: V.tint, color: V.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>알</div>} />
      <TopT title={<span>알빈님,<br />오늘 분석할 트리거가 있나요?</span>} style={{ padding: '4px 20px 8px' }} />

      <HeroStat go={go} />

      {/* quick stats — two ListRow-ish cards */}
      <div style={{ display: 'flex', gap: 12, padding: '16px 20px 0' }}>
        <Cd variant="flat" style={{ flex: 1, padding: 16, borderRadius: 18 }}>
          <p style={{ fontSize: 13, color: V.tx2, margin: 0 }}>연속 기록</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: V.tx1, letterSpacing: '-0.02em', margin: '2px 0 0', fontVariantNumeric: 'tabular-nums' }}>7<span style={{ fontSize: 15, color: V.tx3, marginLeft: 2 }}>일</span></p>
          <p style={{ fontSize: 11, color: V.tx3, margin: '2px 0 0' }}>오늘 기록 완료</p>
        </Cd>
        <Cd variant="flat" style={{ flex: 1, padding: 16, borderRadius: 18 }} onClick={() => go('insights')}>
          <p style={{ fontSize: 13, color: V.tx2, margin: 0 }}>이번 주 Δ고통</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: V.primary, letterSpacing: '-0.02em', margin: '2px 0 0', fontVariantNumeric: 'tabular-nums' }}>+12<span style={{ fontSize: 15, color: V.tx3, marginLeft: 2 }}>점</span></p>
          <p style={{ fontSize: 11, color: V.tx3, margin: '2px 0 0' }}>자세히 보기 →</p>
        </Cd>
      </div>

      {/* checkin as ListHeader + rows */}
      <LH title="오늘의 체크인" action="기록 보기" onAction={() => go('insights')} />
      <div style={{ margin: '0 20px', background: V.surface, borderRadius: 18, border: '1px solid ' + V.bg3, overflow: 'hidden' }}>
        <LR icon="sun-medium" iconBg={morning ? 'rgba(22,163,74,0.1)' : V.bg2} tone={morning ? V.success : V.tx3}
            title="모닝 체크인" desc={morning ? '오늘 완료' : '아직 안 했어요'}
            right={morning ? <I2 name="check" size={20} color={V.success} /> : '체크인'} onClick={() => setMorning(!morning)} />
        <div style={{ height: 1, background: V.bg2, margin: '0 20px' }} />
        <LR icon="moon" iconBg={V.bg2} tone={V.tx3} title="이브닝 체크인" desc="아직 안 했어요" right="체크인" chevron onClick={() => go('insights')} />
      </div>

      {/* archetype */}
      <LH title="인지 아키타입" action="전체 인사이트" onAction={() => go('insights')} />
      <div style={{ margin: '0 20px' }}>
        <Cd variant="flat" style={{ padding: 18, borderRadius: 18 }} onClick={() => go('insights')}>
          <Bg tone="primary">3회마다 갱신</Bg>
          <p style={{ fontSize: 20, fontWeight: 800, color: V.tx1, letterSpacing: '-0.02em', margin: '12px 0 0' }}>미래 예언가</p>
          <p style={{ fontSize: 14, color: V.tx2, margin: '4px 0 0' }}>일어나지 않은 일을 미리 결론짓는 경향이 두드러져요.</p>
          <div style={{ marginTop: 14, height: 6, background: V.bg2, borderRadius: 9999, overflow: 'hidden' }}><div style={{ height: '100%', width: '60%', background: V.primary, borderRadius: 9999 }} /></div>
          <p style={{ fontSize: 11, color: V.tx3, margin: '6px 0 0' }}>다음 업데이트까지 2회 더</p>
        </Cd>
      </div>
    </div>
  );
}

Object.assign(window, { LandingV2, DashboardV2, HeaderV2, SBClear });
