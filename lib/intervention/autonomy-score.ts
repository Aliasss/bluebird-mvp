// autonomy_score v2 — Self-Determination Theory (Deci & Ryan, 2000) autonomy 차원에 정렬.
//
// 변경 이력:
//   v1 (∼2026-04): base 10 + averageIntensity × 5 + min(3, answerCount) + (note ? 15 : 0)
//      문제: averageIntensity는 *AI 모델*이 추정한 왜곡 강도(0~1)다. 사용자가 자율적으로
//           행사한 행동량이 아니라 AI 출력값에 가중치를 주는 셈이라, "자율성 행사 정도"라는
//           의미와 정합되지 않았다. AI 모델 변경(예: 프롬프트 개선)만으로 점수가 출렁이는
//           원치 않는 결합도 발생.
//
//   v2 (2026-05-04): min(15, answerCount × 5) + (note ? 15 : 0)
//      근거: SDT autonomy는 "자기 의지로 선택·표현한 행위"의 누적량으로 측정해야 한다.
//           - answerCount: 소크라테스 질문에 *직접 답변한 횟수* — 자기 검증(self-validation)
//                          행위. 1답 = 5점, 최대 3답까지 인정 (체감 한계효용 + 시간 비용).
//           - note 보너스: 완료 노트(자기 노트)는 자기 표현(self-expression) 행위로,
//                          단발 +15점.
//           최대치: 15 + 15 = 30점.
//
//      이론적 근거 (Deci & Ryan, 2000, "The 'what' and 'why' of goal pursuits", Psychological Inquiry):
//        SDT는 internal/external regulation 스펙트럼에서 autonomous motivation을 핵심 변인으로 삼는다.
//        autonomy는 (1) 자기 의지의 개시(initiation), (2) 자기 표현(expression) 두 측면을 포함하므로,
//        본 산식은 (1) ↔ answerCount, (2) ↔ note 로 매핑해 측정한다.

export interface AutonomyScoreInput {
  answerCount: number;
}

export const AUTONOMY_NOTE_BONUS = 15;
export const AUTONOMY_ANSWER_UNIT = 5;
export const AUTONOMY_ANSWER_CAP = 15; // = 3 × 5
export const AUTONOMY_MAX = AUTONOMY_ANSWER_CAP + AUTONOMY_NOTE_BONUS; // 30

export function calcAutonomyScore(params: AutonomyScoreInput): number {
  const answerBonus = Math.min(
    AUTONOMY_ANSWER_CAP,
    Math.max(0, params.answerCount) * AUTONOMY_ANSWER_UNIT
  );
  return answerBonus;
}
