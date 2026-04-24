import { describe, it, expect } from 'vitest';
import { screenKeywords } from '@/lib/safety/keyword-screener';

describe('screenKeywords - critical 판정', () => {
  it('"죽고 싶어" 표현은 critical', () => {
    const result = screenKeywords('요즘 너무 힘들어서 죽고 싶어');
    expect(result.verdict).toBe('critical');
    expect(result.matchedPattern).toBeDefined();
  });

  it('"자살" 단어 포함은 critical', () => {
    const result = screenKeywords('자살 생각이 멈추질 않아');
    expect(result.verdict).toBe('critical');
  });

  it('"자해했어" 표현은 critical', () => {
    const result = screenKeywords('어제 자해했어. 아직도 아프다');
    expect(result.verdict).toBe('critical');
  });
});

describe('screenKeywords - suspected 판정', () => {
  it('"사라지고 싶어" 표현은 suspected', () => {
    const result = screenKeywords('그냥 사라지고 싶어');
    expect(result.verdict).toBe('suspected');
  });

  it('"더 이상 못 버티겠어" 표현은 suspected', () => {
    const result = screenKeywords('더 이상 못 버티겠어');
    expect(result.verdict).toBe('suspected');
  });

  it('"끝내고 싶다" 표현은 suspected', () => {
    const result = screenKeywords('다 끝내고 싶다');
    expect(result.verdict).toBe('suspected');
  });
});

describe('screenKeywords - 정상 표현', () => {
  it('일반 감정 표현은 none', () => {
    const result = screenKeywords('오늘 회의에서 실수해서 너무 창피했어');
    expect(result.verdict).toBe('none');
  });

  it('의문형 "힘들다"는 none', () => {
    const result = screenKeywords('이번 주는 정말 힘들다');
    expect(result.verdict).toBe('none');
  });

  it('빈 문자열은 none', () => {
    const result = screenKeywords('');
    expect(result.verdict).toBe('none');
  });

  // v0에서는 "죽겠다" 관용 표현도 보수적으로 suspected 이상으로 분류하지 않는다.
  // 실제 critical 정규식은 "죽고 싶" 형태에만 매칭되므로 "죽겠다"는 걸리지 않아야 한다.
  it('"배고파 죽겠다" 관용 표현은 none', () => {
    const result = screenKeywords('배고파 죽겠다');
    expect(result.verdict).toBe('none');
  });

  it('"웃겨 죽는 줄" 관용 표현은 none', () => {
    const result = screenKeywords('친구가 너무 웃겨서 죽는 줄 알았다');
    expect(result.verdict).toBe('none');
  });
});
