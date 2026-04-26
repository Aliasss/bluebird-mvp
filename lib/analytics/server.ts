import { track as vercelTrack } from '@vercel/analytics/server';

/**
 * 서버사이드 분석 품질 이벤트.
 * - 분석 결과가 distortions=[]로 끝났는가 (사일런트 false negative 추적)
 * - 1차 분석 후 재시도가 발동됐는가
 * - 분석 응답이 JSON 파싱 자체에 실패했는가 (모델 응답 단절·잘림)
 * - 소크라테스 질문이 디폴트 폴백으로 채워졌는가
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
    await vercelTrack(event, properties);
  } catch (err) {
    // 텔레메트리는 silent. 운영 로그에만 남김.
    console.warn(`[analytics] ${event} 전송 실패:`, err);
  }
}
