export interface AutonomyScoreInput {
  averageIntensity: number;
  answerCount: number;
}

export const AUTONOMY_NOTE_BONUS = 15;

export function calcAutonomyScore(params: AutonomyScoreInput): number {
  const base = 10;
  const distortionBonus = Math.round(params.averageIntensity * 5);
  const answerBonus = Math.min(3, params.answerCount);
  return base + distortionBonus + answerBonus;
}
