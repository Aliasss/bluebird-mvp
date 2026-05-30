/* ============================================================
   Project Bluebird — UI Kit v2 · TDS-influenced primitives
   (TDS의 구조 원칙을 블루버드 스타일로 재해석. Toss 브랜딩 미사용.)
   Exports: Top, ListHeader, ListRow, BottomCTA, Badge2, Stepper2
   ============================================================ */
const { T: K } = window;

/* "Top" — 화면 진입부 대형 2줄 볼드 헤드라인 (한 화면 한 메시지) */
function Top({ title, sub, style }) {
  return (
    <div style={{ padding: '12px 20px 20px', ...style }}>
      <h1 style={{ fontSize: 26, lineHeight: 1.32, fontWeight: 700, color: K.tx1, letterSpacing: '-0.03em', margin: 0, textWrap: 'pretty' }}>{title}</h1>
      {sub && <p style={{ fontSize: 15, lineHeight: 1.55, color: K.tx2, margin: '10px 0 0', letterSpacing: '-0.01em' }}>{sub}</p>}
    </div>
  );
}

/* ListHeader — 섹션 큰 헤더 (제목 + 우측 액션) */
function ListHeader({ title, action, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '20px 20px 8px' }}>
      <h2 style={{ fontSize: 19, fontWeight: 700, color: K.tx1, letterSpacing: '-0.02em', margin: 0 }}>{title}</h2>
      {action && <button onClick={onAction} style={{ fontSize: 13, fontWeight: 600, color: K.tx3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>{action}</button>}
    </div>
  );
}

/* ListRow — 좌(아이콘+텍스트) / 우(값+chevron) 구조 행. TDS 핵심 단위. */
function ListRow({ icon, iconBg, title, desc, right, rightSub, chevron, onClick, tone }) {
  const [press, setPress] = React.useState(false);
  return (
    <div onClick={onClick}
      onPointerDown={() => setPress(true)} onPointerUp={() => setPress(false)} onPointerLeave={() => setPress(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', cursor: onClick ? 'pointer' : 'default',
        background: press && onClick ? K.bg2 : 'transparent', transition: 'background .12s',
      }}>
      {icon && (
        <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: iconBg || K.tint, color: tone || K.primary }}>
          <window.Icon name={icon} size={20} stroke={1.9} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: K.tx1, letterSpacing: '-0.01em', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</p>
        {desc && <p style={{ fontSize: 13, color: K.tx3, margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{desc}</p>}
      </div>
      {(right || chevron) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {right && <div style={{ textAlign: 'right' }}><span style={{ fontSize: 15, fontWeight: 700, color: tone || K.tx1, fontVariantNumeric: 'tabular-nums' }}>{right}</span>{rightSub && <p style={{ fontSize: 11, color: K.tx3, margin: '1px 0 0' }}>{rightSub}</p>}</div>}
          {chevron && <window.Icon name="chevron-right" size={20} stroke={1.75} color={K.tx3} />}
        </div>
      )}
    </div>
  );
}

/* BottomCTA — 하단 고정 1차 액션 + 보호 그라데이션 */
function BottomCTA({ children, sub }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 45, pointerEvents: 'none' }}>
      <div style={{ height: 28, background: 'linear-gradient(to top, ' + K.bg + ' 0%, rgba(248,250,252,0) 100%)' }} />
      <div style={{ background: K.bg, padding: '6px 20px 34px', pointerEvents: 'auto' }}>
        {sub && <p style={{ fontSize: 12, color: K.tx3, textAlign: 'center', margin: '0 0 10px' }}>{sub}</p>}
        {children}
      </div>
    </div>
  );
}

/* Badge2 — 알약 상태 칩 (semantic) */
function Badge2({ children, tone = 'primary' }) {
  const map = {
    primary: [K.tint, K.primary], success: ['rgba(22,163,74,0.1)', K.success],
    warning: ['rgba(217,119,6,0.12)', K.warning], danger: ['rgba(220,38,38,0.1)', K.danger],
    neutral: [K.bg2, K.tx2],
  };
  const [bg, fg] = map[tone];
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, lineHeight: 1, padding: '6px 10px', borderRadius: 9999, background: bg, color: fg, letterSpacing: '-0.01em' }}>{children}</span>;
}

/* Stepper2 — 상단 가는 진행 점 (TDS식 미니멀 단계 표시) */
function Stepper2({ current, total }) {
  return (
    <div style={{ display: 'flex', gap: 6, padding: '0 20px 4px' }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{ flex: 1, height: 3, borderRadius: 9999, background: i < current ? K.primary : K.bg3, transition: 'background .3s' }} />
      ))}
    </div>
  );
}

Object.assign(window, { Top, ListHeader, ListRow, BottomCTA, Badge2, Stepper2 });
