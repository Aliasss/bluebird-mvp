// 온보딩 9 슬라이드 카피·시각 메타데이터 (Act 3구성 — Act 1: 왜 / Act 2: 무엇 / Act 3: 어떻게).
// 합의일: 2026-05-01 (CEO + CPO·CSO·designer·PO)
//
// 카피는 본 파일에서 "그대로" 화면에 노출된다. 변경은 별도 합의 필요.
// caption: 학술 출처. 슬라이드 하단 작은 텍스트로만 노출 (로고·이미지 X — 본질 위협 #4 가드).
// visualKey: visuals/<key>.tsx 컴포넌트로 매핑 (동적 import X — 9개 정적 매핑).

export type SlideMeta = {
  id: string;
  act: 1 | 2 | 3;
  indexInAct: 1 | 2 | 3;
  visualKey: string;
  paragraphs: string[];
  caption?: string;
};

export const SLIDES: SlideMeta[] = [
  // ━━━ Act 1 — 왜 디버깅이 필요한가 ━━━
  {
    id: 'act1-1',
    act: 1,
    indexInAct: 1,
    visualKey: 'context-grid',
    paragraphs: [
      '회의 중 한 마디, 답장 안 온 메시지, 분기 평가 한 줄.',
      '같은 자극에 같은 방식으로 반응한다.',
      '직장·체면·자기낙인이 그 회로를 강화한다.',
    ],
  },
  {
    id: 'act1-2',
    act: 1,
    indexInAct: 2,
    visualKey: 'auto-loop',
    paragraphs: [
      '왜 같은 실수가 반복될까?',
      '사고는 학습된다. 그리고 학습된 사고는 자동으로 작동한다.',
      '이게 인지 왜곡이다.',
    ],
  },
  {
    id: 'act1-3',
    act: 1,
    indexInAct: 3,
    visualKey: 'tool-quadrant',
    paragraphs: [
      '명상은 가라앉히지만 분석하지 않는다.',
      '코칭은 비싸고 느리다. 일기는 누적되지만 디버깅하지 않는다.',
      '챗봇은 위로하지만 구조를 보여주지 않는다.',
      '분석가에게 닿는 도구는 비어 있다.',
    ],
  },
  // ━━━ Act 2 — 어떤 이론으로 디버깅하는가 ━━━
  {
    id: 'act2-1',
    act: 2,
    indexInAct: 1,
    visualKey: 'dual-process',
    paragraphs: [
      '사고는 두 시스템으로 작동한다.',
      'System 1은 10ms 안에 자동 반응한다. System 2는 3초 들여 검증한다.',
      '디버깅은 System 1을 System 2로 옮기는 일이다.',
    ],
    caption: 'Daniel Kahneman, 『생각에 관한 생각』(2011)',
  },
  {
    id: 'act2-2',
    act: 2,
    indexInAct: 2,
    visualKey: 'cbt-grid',
    paragraphs: [
      '인지 왜곡은 식별 가능한 패턴이다.',
      '파국화·이분법·감정적 추론·개인화·자의적 추론.',
      '당신의 사고가 어느 패턴에 빠지는지, BlueBird가 표시한다.',
    ],
    caption: 'Aaron Beck (1976) — 인지 왜곡 5종',
  },
  {
    id: 'act2-3',
    act: 2,
    indexInAct: 3,
    visualKey: 'loss-cas',
    paragraphs: [
      '우리는 손실에 2.25배 민감하다.',
      '반추와 걱정은 측정 가능한 신호다.',
      'BlueBird는 이 신호들을 디버깅 입력으로 받는다.',
    ],
    caption: 'Kahneman & Tversky (1979) · Adrian Wells (CAS 모델)',
  },
  // ━━━ Act 3 — 어떻게 작동하고 무엇이 남는가 ━━━
  {
    id: 'act3-1',
    act: 3,
    indexInAct: 1,
    visualKey: 'four-step',
    paragraphs: [
      '기록: 자극과 자동 반응을 잡는다.',
      '분석: CBT 5왜곡 + Dual Process로 분해한다.',
      '검증: 반증 질문으로 System 2를 깨운다.',
      '재평가: 같은 자극에 다른 판단을 내린다.',
    ],
  },
  {
    id: 'act3-2',
    act: 3,
    indexInAct: 2,
    visualKey: 'delta-pain',
    paragraphs: [
      '디버깅이 효과 있는지는 측정한다.',
      '디버깅 직전 통증과 24시간 후 통증의 차이 — Δpain.',
      '효과는 가설이고, 가설은 검증 가능해야 한다.',
    ],
  },
  {
    id: 'act3-3',
    act: 3,
    indexInAct: 3,
    visualKey: 'manual-template',
    paragraphs: [
      '사용할수록 당신의 사용설명서가 채워진다.',
      '7회 후 첫 패턴이 보이고, 30회 후 자기 지도가 정교해진다.',
      '목표는 치료가 아니다. 자기 운영이다.',
    ],
    caption: 'Albert Camus, 『시지프 신화』(1942) — 자율성 회복',
  },
];

// Act 별 슬라이드 추출 헬퍼 — server·client 양쪽에서 사용.
export function slidesForAct(act: 1 | 2 | 3): SlideMeta[] {
  return SLIDES.filter((s) => s.act === act);
}
