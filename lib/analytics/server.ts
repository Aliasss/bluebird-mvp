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

/**
 * 인지 단계 깔때기(funnel) 이벤트.
 * "분석 시도 vs 실제 행동 변화" 격차 추적용. founder 자기분석 review 2026-05-10 §4.3 도출.
 */
export type CognitiveFunnelEvent =
  | 'distortion_identified' // 분석 결과가 사용자에게 노출 가능 시점
  | 'reframe_attempted' // 소크라테스 질문 생성 = 리프레임 기회 진입
  | 'reframe_completed' // 답변 3건 저장 완료
  | 'action_completed'; // Tiny Habit 완료(is_completed=true)

type AllowedValue = string | number | boolean | null;
type AnalyticsEvent = AnalysisQualityEvent | CognitiveFunnelEvent;

async function insertAnalyticsEvent(
  event: AnalyticsEvent,
  properties?: Record<string, AllowedValue>,
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
    // request scope 밖 호출(eval 스크립트 등)은 cookies()가 throw — 의도된 silent skip.
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('cookies') && message.includes('request scope')) {
      return;
    }
    console.warn(`[analytics] ${event} 처리 실패:`, err);
  }
}

export async function trackAnalysisQuality(
  event: AnalysisQualityEvent,
  properties?: Record<string, AllowedValue>,
): Promise<void> {
  return insertAnalyticsEvent(event, properties);
}

/**
 * 인지 단계 funnel 이벤트 적재. 모든 이벤트는 best-effort — 실패가 사용자 요청을 깨선 안 됨.
 *
 * 운영 분석 예시 (Supabase SQL editor):
 *   -- 분석 → 행동 격차
 *   SELECT user_id,
 *          COUNT(*) FILTER (WHERE event_name='distortion_identified') AS analyzed,
 *          COUNT(*) FILTER (WHERE event_name='action_completed')      AS acted
 *   FROM analytics_events
 *   WHERE created_at > NOW() - INTERVAL '14 days'
 *   GROUP BY user_id;
 */
export async function trackCognitiveFunnel(
  event: CognitiveFunnelEvent,
  properties?: Record<string, AllowedValue>,
): Promise<void> {
  return insertAnalyticsEvent(event, properties);
}
