import webpush from 'web-push';
import { getVapidConfig } from './vapid';
import { CHECKIN_REMINDER_PUSH } from './copy';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { logServerError } from '@/lib/logging/server-logger';

export interface PushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

let vapidConfigured = false;
function ensureVapid() {
  if (vapidConfigured) return;
  const cfg = getVapidConfig();
  webpush.setVapidDetails(cfg.subject, cfg.publicKey, cfg.privateKey);
  vapidConfigured = true;
}

export interface CheckinReminderResult {
  endpoint: string;
  status: 'sent' | 'gone';
}

/**
 * 체크인 리마인더 1건 발송.
 * - 200/201 → status 'sent' resolve
 * - 410 / 404 → push_subscriptions row 삭제 후 status 'gone' resolve
 * - 그 외 (500 등 일시 오류) → throw (cron의 Promise.allSettled가 reject로 분류)
 */
export async function sendCheckinReminder(
  sub: PushSubscription,
  userId: string,
): Promise<CheckinReminderResult> {
  ensureVapid();

  const payload = JSON.stringify({
    title: CHECKIN_REMINDER_PUSH.title,
    body: CHECKIN_REMINDER_PUSH.body,
    url: CHECKIN_REMINDER_PUSH.url,
  });

  try {
    await webpush.sendNotification(sub, payload);
    return { endpoint: sub.endpoint, status: 'sent' };
  } catch (err: unknown) {
    const statusCode = (err as { statusCode?: number })?.statusCode;
    if (statusCode === 410 || statusCode === 404) {
      // 만료/유효하지 않은 subscription — DB에서 회수
      try {
        const supabase = createServiceRoleClient();
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', sub.endpoint)
          .eq('user_id', userId);
      } catch (cleanupErr) {
        logServerError('lib/notifications/send.cleanup', cleanupErr);
      }
      return { endpoint: sub.endpoint, status: 'gone' };
    }
    throw err;
  }
}
