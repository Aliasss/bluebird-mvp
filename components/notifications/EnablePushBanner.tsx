'use client';

import { useEffect, useState } from 'react';
import { usePushPermission } from './usePushPermission';
import { ENABLE_PUSH_BANNER } from '@/lib/notifications/copy';

const STORAGE_KEY = 'bluebird:p3_dismissed_at_v1';
const SILENCE_DAYS = 7;

/**
 * P3 — 대시보드 fallback. permission이 default이고 최근 7일 내 dismiss 없을 때 노출.
 * granted/denied/unsupported 모두 미노출.
 * Spec: docs/strategy/push-infra-review-2026-05-09.md §2.1 (P3)
 */
export default function EnablePushBanner() {
  const { state, enable, loading } = usePushPermission();
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dismissedAt = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
    const fresh = Date.now() - dismissedAt < SILENCE_DAYS * 24 * 60 * 60 * 1000;
    setHidden(fresh);
  }, []);

  if (state === 'unsupported' || state === 'granted' || state === 'denied') {
    return null;
  }
  if (hidden) return null;

  const handleEnable = async () => {
    const r = await enable();
    if (r.ok) setHidden(true);
  };

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    }
    setHidden(true);
  };

  return (
    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
      <span className="text-slate-700">{ENABLE_PUSH_BANNER.text}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleEnable}
          disabled={loading}
          className="rounded bg-slate-900 px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          {ENABLE_PUSH_BANNER.cta}
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="닫기"
          className="text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
