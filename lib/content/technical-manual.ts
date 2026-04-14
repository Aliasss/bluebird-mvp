export type ManualSectionId = 'core-01' | 'dyn-02' | 'dbug-03' | 'goal-04';

export type ManualSection = {
  id: ManualSectionId;
  title: string;
  content: string;
};

export const TECHNICAL_MANUAL_HEADER = {
  title: 'Bluebird Technical Manual: 인지 운영 체제 가이드',
  subtitle: '당신의 인지 시스템을 디버깅하고 실존적 자율성을 탈환하기 위한 기술 명세서',
  tone: '고밀도, 분석적, 전문적 (Professional & Analytical)',
} as const;

export const TECHNICAL_MANUAL_SECTIONS: ManualSection[] = [
  {
    id: 'core-01',
    title: '[CORE-01] 이중 프로세스 시스템',
    content:
      '인간의 사고는 두 가지 독립적인 경로로 정보를 처리합니다. Bluebird는 시스템 1의 자동적 오류를 포착하여 시스템 2로 전송하는 가교 역할을 합니다.',
  },
  {
    id: 'dyn-02',
    title: '[DYN-02] 전망이론과 가치 함수',
    content:
      '불확실성 하에서 인간의 가치 판단은 절대적 수치가 아닌 준거점 대비 변화량에 의해 결정됩니다.',
  },
  {
    id: 'dbug-03',
    title: '[DBUG-03] 인지 오류 Taxonomy',
    content:
      '시스템 1이 정보를 처리할 때 빈번하게 발생하는 논리적 에러들의 모음입니다.',
  },
  {
    id: 'goal-04',
    title: '[GOAL-04] 최종 지향점: 자율적 통제',
    content:
      'Bluebird의 목적은 단순한 위로가 아닙니다. 사용자가 자신의 인지 아키텍처를 명확히 이해하고, 시스템 1의 자동적 반응을 억제하며, 데이터에 기반한 주체적 선택을 내리는 상태를 지향합니다. 이것이 우리가 정의하는 진정한 자율성(Autonomy)입니다.',
  },
];

export const DUAL_PROCESS_TABLE = [
  {
    name: '시스템 1 (자동 처리기)',
    trait: '직관적, 즉각적, 감정적',
    speed: '< 10ms (병렬 처리)',
    energy: '극히 낮음 (Default 설정)',
    bluebirdDefinition: '인지 왜곡과 편향의 발원지',
  },
  {
    name: '시스템 2 (분석 제어기)',
    trait: '논리적, 규칙 기반, 분석적',
    speed: '수 초 이상 (직렬 처리)',
    energy: '매우 높음 (에너지 자원 할당 필요)',
    bluebirdDefinition: '시스템 1의 오류를 수정할 수 있는 유일한 디버깅 툴',
  },
] as const;

export const PROSPECT_THEORY_TERMS = [
  {
    term: '준거점 (Reference Point)',
    definition: '이득과 손실을 나누는 심리적 0점.',
    mechanism:
      '현재의 고통은 대개 비현실적으로 높게 설정된 준거점에서 기인합니다.',
  },
  {
    term: '손실 회피 (Loss Aversion)',
    definition: '같은 양의 이득보다 손실에 약 2.25배 더 강력하게 반응하는 본능.',
    mechanism:
      '이 특성은 사용자로 하여금 작은 위험도 과도하게 피하게 만들어 자율성을 제한합니다.',
  },
  {
    term: '결정 가중치 (Decision Weights)',
    definition: '확률을 주관적으로 왜곡하여 해석하는 함수.',
    mechanism:
      '발생 확률이 낮은 부정적 사건을 100%에 가깝게 과대평가하는 파국화의 원인이 됩니다.',
  },
] as const;

export const DISTORTION_GLOSSARY = [
  {
    term: '휴리스틱 (Heuristics)',
    technicalDefinition:
      '복잡한 문제를 신속하게 해결하기 위해 뇌가 사용하는 정신적 지름길.',
    bluebirdAnalysis:
      '지름길은 효율적이지만, 대개 가용성 편향이나 대표성 편향과 같은 오류를 동반합니다.',
  },
  {
    term: '파국화 (Catastrophizing)',
    technicalDefinition: '확률 가중치 함수의 극단적 왜곡.',
    bluebirdAnalysis:
      '"만약 ~하면 어떡하지?"라는 가설적 위협을 기정사실화하여 시스템을 공포 상태로 몰아넣는 에러.',
  },
  {
    term: '흑백논리 (Dichotomous Thinking)',
    technicalDefinition:
      '데이터의 연속성을 무시하고 0 또는 1로만 처리하는 이진 분류 에러.',
    bluebirdAnalysis:
      '중간 지대의 데이터를 손실로 처리하여 심리적 엔트로피를 높입니다.',
  },
  {
    term: '감정적 추론 (Emotional Reasoning)',
    technicalDefinition:
      '주관적 감정 데이터를 객관적 사실 데이터로 오인하는 데이터 타입 혼동 에러.',
    bluebirdAnalysis:
      '"불안을 느끼기 때문에 위험하다"는 논리적 비약을 발생시킵니다.',
  },
  {
    term: '메타인지 (Metacognition)',
    technicalDefinition:
      '자신의 인지 프로세스 자체를 모니터링하는 상위 계층의 인지 능력.',
    bluebirdAnalysis:
      '관찰자 시점에서 사고 데이터를 분석할 때 비로소 디버깅이 시작됩니다.',
  },
] as const;
