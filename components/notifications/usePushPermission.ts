'use client';

import { useCallback, useEffect, useState } from 'react';
import { urlBase64ToUint8Array } from '@/lib/notifications/vapid';

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export interface PushPermissionApi {
  state: PermissionState;
  loading: boolean;
  enable: () => Promise<{ ok: boolean; reason?: PermissionState }>;
  disable: () => Promise<{ ok: boolean }>;
}

/**
 * 공유 hook — 권한 상태 + subscribe/unsubscribe + 서버 동기화.
 * Plan: docs/superpowers/plans/2026-05-09-push-infra.md (Task 12)
 */
export function usePushPermission(): PushPermissionApi {
  const [state, setState] = useState<PermissionState>('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (
      !('Notification' in window) ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window)
    ) {
      setState('unsupported');
      return;
    }
    setState(Notification.permission as PermissionState);
  }, []);

  const enable = useCallback(async () => {
    if (state === 'unsupported') return { ok: false, reason: 'unsupported' as const };
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setState(perm as PermissionState);
      if (perm !== 'granted') return { ok: false, reason: perm as PermissionState };

      const reg = await navigator.serviceWorker.ready;
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error('NEXT_PUBLIC_VAPID_PUBLIC_KEY 미설정');

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const { endpoint, keys } = sub.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ endpoint, keys }),
      });

      if (!res.ok) {
        await sub.unsubscribe();
        return { ok: false, reason: 'denied' as const };
      }

      return { ok: true };
    } finally {
      setLoading(false);
    }
  }, [state]);

  const disable = useCallback(async () => {
    if (state === 'unsupported') return { ok: false };
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) return { ok: true };

      const endpoint = sub.endpoint;
      await sub.unsubscribe();
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ endpoint }),
      });
      return { ok: true };
    } finally {
      setLoading(false);
    }
  }, [state]);

  return { state, loading, enable, disable };
}
