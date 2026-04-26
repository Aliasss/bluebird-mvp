import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * 서버사이드 분석 품질 이벤트.
 * Vercel Analytics Custom Events 대신 Supabase analytics_events 테이블에 기록.
 *
 * 운영자는 Supabase SQL editor에서 다음 쿼리로 점검:
 *   SELECT * FROM analytics_quality_summary;
 *   SELECT properties->>'reason' AS reason, COUNT(*)
 *     FROM analytics_events
 *     WHERE event_name = 'analyze_distortion_zero'
 *       AND created_at > NOW() - INTERVAL '7 days'
 *     GROUP BY 1;
 *
 * 모든 이벤트는 best-effort. 텔레메트리 실패가 사용자 요청을 깨면 안 된다.
 */

export type AnalysisQualityEvent =
  | 'analyze_distortion_zero'
  | 'analyze_retry_fired'
  | 'analyze_parse_failed'
  | 'questions_fallback';

type AllowedValue = string | number | boolean | null;

export async function trackAnalysisQuality(
  event: AnalysisQualityEvent,
  properties?: Record<string, AllowedValue>
): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // 비인증 호출은 무시. RLS가 어차피 거부하므로 명시적으로 짧게 종료.
      return;
    }

    const { error } = await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_name: event,
      properties: properties ?? {},
    });

    if (error) {
      console.warn(`[analytics] ${event} insert 실패:`, error.message);
    }
  } catch (err) {
    console.warn(`[analytics] ${event} 처리 실패:`, err);
  }
}
