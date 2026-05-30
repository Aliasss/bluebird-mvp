/* ============================================================
   Project Bluebird — UI Kit · shared primitives + Icon + shell
   Exports to window: Icon, Btn, Card, AppHeader, BottomTab, T (tokens)
   ============================================================ */

const T = {
  primary: '#1E40AF', primaryDark: '#1E3A8A', primaryLight: '#3B82F6',
  tint: 'rgba(30,64,175,0.08)', border20: 'rgba(30,64,175,0.20)',
  success: '#16A34A', warning: '#D97706', danger: '#DC2626', distortion: '#E11D48',
  bg: '#F8FAFC', bg2: '#F1F5F9', bg3: '#E2E8F0', surface: '#FFFFFF',
  tx1: '#0F172A', tx2: '#475569', tx3: '#64748B',
  font: '"Pretendard Variable", Pretendard, -apple-system, system-ui, sans-serif',
  shadowCard: '0 2px 8px rgba(15,23,42,0.04), 0 1px 2px rgba(15,23,42,0.06)',
  shadowElev2: '0 8px 24px rgba(15,23,42,0.08), 0 2px 6px rgba(15,23,42,0.06)',
};

/* Lucide icon — memoized so typing/state changes don't re-touch converted SVGs.
   App root runs lucide.createIcons() after each render to convert new <i>. */
const Icon = React.memo(function Icon({ name, size = 22, stroke = 1.75, color, style }) {
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current) ref.current.setAttribute('stroke-width', stroke); });
  return (
    <i ref={ref} data-lucide={name} width={size} height={size}
       style={{ display: 'inline-flex', width: size, height: size, color: color || 'currentColor', ...style }} />
  );
});

function Btn({ variant = 'primary', children, onClick, disabled, style, full }) {
  const [press, setPress] = React.useState(false);
  const base = {
    fontFamily: T.font, fontWeight: 600, fontSize: 15, borderRadius: 14,
    padding: '14px 24px', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    width: full ? '100%' : undefined, transition: 'transform .15s, background .2s',
    transform: press && !disabled ? 'scale(0.96)' : 'scale(1)',
    opacity: disabled ? 0.5 : 1, letterSpacing: '-0.01em', lineHeight: 1.3,
  };
  const variants = {
    primary: { background: T.primary, color: '#fff' },
    secondary: { background: T.surface, color: T.primary, border: `1px solid ${T.border20}` },
    ghost: { background: T.surface, color: T.tx2, border: `1px solid ${T.bg3}` },
    success: { background: T.success, color: '#fff' },
  };
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled}
      onPointerDown={() => setPress(true)} onPointerUp={() => setPress(false)} onPointerLeave={() => setPress(false)}
      style={{ ...base, ...variants[variant], ...style }}>{children}</button>
  );
}

function Card({ children, variant = 'card', style, onClick }) {
  const variants = {
    card: { background: T.surface, borderRadius: 16, boxShadow: T.shadowCard, border: '1px solid transparent' },
    flat: { background: T.surface, borderRadius: 16, border: `1px solid ${T.bg3}` },
    accent: { background: T.tint, borderRadius: 16, border: `1px solid ${T.border20}` },
    success: { background: 'rgba(22,163,74,0.05)', borderRadius: 16, border: '1px solid rgba(22,163,74,0.25)' },
  };
  return (
    <div onClick={onClick} style={{ padding: 16, ...variants[variant], cursor: onClick ? 'pointer' : undefined, ...style }}>
      {children}
    </div>
  );
}

/* Sticky app header (wordmark + right slot) */
function AppHeader({ title = 'Project Bluebird', right, onBack, center }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 30, background: T.surface,
      borderBottom: `1px solid ${T.bg3}`, padding: '46px 16px 12px',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {onBack && (
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.primary, fontWeight: 600, fontSize: 15, cursor: 'pointer', padding: 0, minWidth: 44, textAlign: 'left' }}>← 뒤로</button>
      )}
      {center ? (
        <div style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 600, color: T.tx1 }}>{title}</div>
      ) : (
        <div style={{ flex: 1, fontSize: 18, fontWeight: 800, color: T.primary, letterSpacing: '-0.02em' }}>{title}</div>
      )}
      <div style={{ minWidth: 44, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </div>
  );
}

/* Progress bar under header (multi-step) */
function StepBar({ current, total }) {
  return (
    <div style={{ height: 4, background: T.bg2 }}>
      <div style={{ height: '100%', width: `${(current / total) * 100}%`, background: T.primary, transition: 'width .3s' }} />
    </div>
  );
}

/* Bottom tab bar + center FAB */
function BottomTab({ active, onNav, onFab }) {
  const tabs = [
    { id: 'dashboard', icon: 'home', label: '홈' },
    { id: 'journal', icon: 'scroll-text', label: '일지' },
    null,
    { id: 'insights', icon: 'trending-up', label: '인사이트' },
    { id: 'me', icon: 'user', label: '나' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 40,
      background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      borderTop: `1px solid ${T.bg3}`, paddingBottom: 22,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', height: 60, padding: '0 8px' }}>
        {tabs.map((t, i) => {
          if (!t) return (
            <div key="fab" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <button onClick={onFab} aria-label="기록하기" style={{
                width: 54, height: 54, marginTop: -22, borderRadius: 9999, background: T.primary,
                color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: T.shadowElev2, cursor: 'pointer',
              }}><Icon name="plus" size={26} stroke={2} /></button>
            </div>
          );
          const on = active === t.id;
          return (
            <button key={t.id} onClick={() => onNav(t.id)} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0',
              color: on ? T.primary : T.tx3,
            }}>
              <Icon name={t.icon} size={22} stroke={on ? 2.5 : 1.5} />
              <span style={{ fontSize: 10, fontWeight: 500 }}>{t.label}</span>
              {on && <div style={{ width: 4, height: 4, borderRadius: 9999, background: T.primary }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { T, Icon, Btn, Card, AppHeader, StepBar, BottomTab });
