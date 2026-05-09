'use client';

import { usePushPermission } from './usePushPermission';
import { ME_TOGGLE_LABEL } from '@/lib/notifications/copy';

/**
 * /me 설정의 "21시 체크인 알림" 토글.
 * granted ↔ default/denied 토글. denied 상태에서는 안내만 표시 (재요청 불가).
 * Plan: docs/superpowers/plans/2026-05-09-push-infra.md (Task 15)
 */
export default function PushToggle() {
  const { state, loading, enable, disable } = usePushPermission();

  if (state === 'unsupported') {
    return (
      <div className="flex items-center justify-between py-3">
        <span className="text-sm text-slate-700">{ME_TOGGLE_LABEL}</span>
        <span className="text-xs text-slate-400">
          이 브라우저는 지원하지 않습니다
        </span>
      </div>
    );
  }

  const enabled = state === 'granted';
  const handleClick = async () => {
    if (loading) return;
    if (enabled) {
      await disable();
    } else if (state === 'denied') {
      // 직접 재요청 불가 — 안내만 노출
      alert(
        '알림이 차단되었습니다. 브라우저 설정에서 푸시를 허용해야 다시 켤 수 있습니다.',
      );
    } else {
      await enable();
    }
  };

  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-slate-700">{ME_TOGGLE_LABEL}</span>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-pressed={enabled}
        aria-label={`${ME_TOGGLE_LABEL} ${enabled ? '끄기' : '켜기'}`}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition disabled:opacity-50 ${
          enabled ? 'bg-slate-900' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
