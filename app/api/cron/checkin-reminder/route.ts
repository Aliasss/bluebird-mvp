import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { sendCheckinReminder } from '@/lib/notifications/send';
import { recordServerEvent } from '@/lib/notifications/events';
import { logServerError } from '@/lib/logging/server-logger';

interface RpcRow {
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function POST(request: Request) {
  // Vercel Cron Bearer 검증 — 외부 임의 호출 차단.
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.rpc(
      'users_without_today_evening_checkin_with_push',
    );

    if (error) {
      logServerError('api/cron/checkin-reminder.rpc', error);
      return NextResponse.json({ error: 'RPC 실패' }, { status: 500 });
    }

    const targets: RpcRow[] = data ?? [];

    const results = await Promise.allSettled(
      targets.map((t) =>
        sendCheckinReminder(
          { endpoint: t.endpoint, keys: { p256dh: t.p256dh, auth: t.auth } },
          t.user_id,
        ),
      ),
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.length - sent;

    // 측정 이벤트 적재 — 발송 결과별로 분기. 실패해도 cron 자체 응답엔 영향 없음.
    await Promise.allSettled(
      results.map((r, i) => {
        const userId = targets[i].user_id;
        if (r.status === 'fulfilled') {
          const eventType =
            r.value.status === 'gone' ? 'push_gone' : 'push_sent';
          return recordServerEvent(supabase, userId, eventType);
        }
        return recordServerEvent(supabase, userId, 'push_failed', {
          error: String(r.reason),
        });
      }),
    );

    if (failed > 0) {
      const sample = results
        .filter((r) => r.status === 'rejected')
        .slice(0, 3);
      sample.forEach((r) => {
        if (r.status === 'rejected')
          logServerError('api/cron/checkin-reminder.send', r.reason);
      });
    }

    return NextResponse.json(
      { sent, total: targets.length, failed },
      { status: 200 },
    );
  } catch (error) {
    logServerError('api/cron/checkin-reminder', error);
    return NextResponse.json({ error: 'Cron 처리 실패' }, { status: 500 });
  }
}
