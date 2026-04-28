import { describe, it, expect } from 'vitest';
import { AUTONOMY_NOTE_BONUS, calcAutonomyScore } from '@/lib/intervention/autonomy-score';

describe('calcAutonomyScore', () => {
  it('빈 입력(intensity 0, answer 0)에 대해 base 10을 반환한다', () => {
    expect(calcAutonomyScore({ averageIntensity: 0, answerCount: 0 })).toBe(10);
  });

  it('intensity는 5배 가중되어 반올림된다', () => {
    expect(calcAutonomyScore({ averageIntensity: 0.4, answerCount: 0 })).toBe(12);
    expect(calcAutonomyScore({ averageIntensity: 0.5, answerCount: 0 })).toBe(13);
    expect(calcAutonomyScore({ averageIntensity: 1, answerCount: 0 })).toBe(15);
  });

  it('answerCount는 최대 3까지만 보너스를 준다', () => {
    expect(calcAutonomyScore({ averageIntensity: 0, answerCount: 1 })).toBe(11);
    expect(calcAutonomyScore({ averageIntensity: 0, answerCount: 3 })).toBe(13);
    expect(calcAutonomyScore({ averageIntensity: 0, answerCount: 10 })).toBe(13);
  });

  it('성공 로그 시나리오(intensity 0, answer 0) + noteBonus = 25', () => {
    const score =
      calcAutonomyScore({ averageIntensity: 0, answerCount: 0 }) + AUTONOMY_NOTE_BONUS;
    expect(score).toBe(25);
  });

  it('전형적 분석 완료 시나리오(intensity 0.7, answer 4) + noteBonus = 28', () => {
    const score =
      calcAutonomyScore({ averageIntensity: 0.7, answerCount: 4 }) + AUTONOMY_NOTE_BONUS;
    expect(score).toBe(10 + 4 + 3 + 15);
  });
});
