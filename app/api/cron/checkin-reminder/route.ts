import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { sendCheckinReminder } from '@/lib/notifications/send';
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
