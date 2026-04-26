// 5대 인지 왜곡 유형
export enum DistortionType {
  CATASTROPHIZING = 'catastrophizing',
  ALL_OR_NOTHING = 'all_or_nothing',
  EMOTIONAL_REASONING = 'emotional_reasoning',
  PERSONALIZATION = 'personalization',
  ARBITRARY_INFERENCE = 'arbitrary_inference',
}

export type FrameType = 'loss' | 'gain' | 'mixed';

export interface CasSignal {
  rumination: number; // 0~1
  worry: number; // 0~1
}

// 왜곡 유형 한국어 매핑
export const DistortionTypeKorean: Record<DistortionType, string> = {
  [DistortionType.CATASTROPHIZING]: '파국화',
  [DistortionType.ALL_OR_NOTHING]: '흑백논리',
  [DistortionType.EMOTIONAL_REASONING]: '감정적 추론',
  [DistortionType.PERSONALIZATION]: '개인화',
  [DistortionType.ARBITRARY_INFERENCE]: '임의적 추론',
};

// 왜곡 유형 → 매뉴얼 앵커 매핑
export const DistortionManualAnchor: Record<DistortionType, string> = {
  [DistortionType.CATASTROPHIZING]: 'dbug-03-s2',
  [DistortionType.ALL_OR_NOTHING]: 'dbug-03-s3',
  [DistortionType.EMOTIONAL_REASONING]: 'dbug-03-s4',
  [DistortionType.PERSONALIZATION]: 'dbug-03-s5',
  [DistortionType.ARBITRARY_INFERENCE]: 'dbug-03-s1',
};

// 데이터베이스 테이블 타입
export interface Log {
  id: string;
  user_id: string;
  trigger: string;
  thought: string;
  pain_score?: number | null;
  log_type?: 'normal' | 'success';
  created_at: string;
}

export interface Analysis {
  id: string;
  log_id: string;
  distortion_type: DistortionType;
  intensity: number;
  logic_error_segment: string;
  rationale?: string | null;
  frame_type?: FrameType | null;
  reference_point?: string | null;
  probability_estimate?: number | null;
  loss_aversion_signal?: number | null;
  cas_rumination?: number | null;
  cas_worry?: number | null;
  system2_question_seed?: string | null;
  decentering_prompt?: string | null;
  created_at: string;
}

export interface Intervention {
  id: string;
  log_id: string;
  socratic_questions: string[];
  user_answers: Record<string, string>;
  theory_context?: Record<string, unknown>;
  final_action: string | null;
  is_completed: boolean;
  autonomy_score: number | null;
  created_at: string;
  completed_at?: string | null;
  reevaluated_pain_score?: number | null;
  reevaluated_at?: string | null;
  review_dismissed_at?: string | null;
}

// AI 분석 결과 타입
export interface DistortionAnalysis {
  type: DistortionType;
  intensity: number;
  segment: string;
  rationale?: string;
}

export interface AIAnalysisResult {
  distortions: DistortionAnalysis[];
  questions: string[];
  frame_type?: FrameType;
  reference_point?: string;
  probability_estimate?: number | null;
  loss_aversion_signal?: number;
  cas_signal?: CasSignal;
  system2_question_seed?: string;
  decentering_prompt?: string;
}

// 전망이론 시각화 데이터 타입
export interface ProspectTheoryDataPoint {
  x: number; // 객관적 확률
  y: number; // 주관적 가치
  label?: string;
}
