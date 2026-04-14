import { DistortionType } from '@/types';

export const BLUEBIRD_OPERATING_PRINCIPLES = [
  '데이터 우선: 주관적 고통을 수치/비교 가능한 데이터로 객관화한다.',
  '감정 배제: 위로 대신 논리 무결성과 사고 검증을 제공한다.',
  '자율성 지향: 정답 제시가 아니라 시스템2 기동 질문으로 자기 판단을 유도한다.',
] as const;

export const BLUEBIRD_THEORY_SUMMARY = {
  dualProcess: {
    system1:
      '직관적·감정적·자동 반응. 에너지 소모가 적고 인지 왜곡이 쉽게 발생한다.',
    system2:
      '논리적·분석적·노력 기반 사고. 왜곡 교정과 대안 행동 설계가 가능한 모드다.',
    interventionGoal:
      'Bluebird는 시스템1 오류를 데이터화하고 시스템2를 강제 기동하는 장치다.',
  },
  prospectTheory: {
    referenceDependence:
      '절대값이 아니라 개인 준거점 대비 이득/손실로 판단한다. 비현실적 준거점은 불안을 증폭한다.',
    lossAversion:
      '동일한 크기의 이득보다 손실을 더 크게 지각한다. 변화 회피/현상 유지 편향의 근거다.',
    probabilityWeighting:
      '낮은 확률은 과대평가, 높은 확률은 과소평가하는 경향이 있어 파국화를 강화한다.',
  },
  metacognition: {
    cas:
      '반추(과거)와 걱정(미래)에 주의 자원이 과투입되어 인지 자원이 고갈된 상태(CAS).',
    decentering:
      '생각을 사실이 아닌 일시적 정신 이벤트로 분리해 관찰하는 능력.',
    targetBelief:
      '“걱정은 필요하다”, “생각을 멈출 수 없다” 같은 메타 신념을 약화해야 한다.',
  },
  agency: {
    existentialResponsibility:
      '외부 사건과 별개로 반응/선택은 개인의 자유와 책임임을 인지한다.',
    buildMeasureLearn:
      '교정은 가설 실험이다. 행동 변화와 결과를 측정해 다음 개입을 학습한다.',
    gameTheoreticThinking:
      '감정 반응 대신 현재 상태에서 보상이 높은 다음 수를 계산한다.',
  },
} as const;

export const BLUEBIRD_DISTORTION_TAXONOMY: Record<
  DistortionType,
  { label: string; diagnosticRule: string }
> = {
  [DistortionType.CATASTROPHIZING]: {
    label: '파국화',
    diagnosticRule:
      '최악 시나리오를 단정하고 발생 확률을 비정상적으로 높게 추정한다.',
  },
  [DistortionType.ALL_OR_NOTHING]: {
    label: '흑백논리',
    diagnosticRule:
      '중간 대안을 제거하고 성공/실패의 이분법으로만 상황을 해석한다.',
  },
  [DistortionType.EMOTIONAL_REASONING]: {
    label: '감정적 추론',
    diagnosticRule:
      '현재 감정 상태를 사실 판단의 직접 근거로 사용한다.',
  },
  [DistortionType.PERSONALIZATION]: {
    label: '개인화',
    diagnosticRule:
      '통제 불가능한 외부 결과를 자신의 책임이나 결함으로 귀속한다.',
  },
  [DistortionType.ARBITRARY_INFERENCE]: {
    label: '임의적 추론',
    diagnosticRule:
      '증거 불충분 또는 반증이 존재하는데도 부정적 결론을 선행 확정한다.',
  },
};

export type BluebirdFrameType = 'loss' | 'gain' | 'mixed';

export type BluebirdFewShotCase = {
  input: {
    trigger: string;
    thought: string;
  };
  output: {
    distortions: Array<{
      type: DistortionType;
      intensity: number;
      segment: string;
      rationale: string;
    }>;
    frame_type: BluebirdFrameType;
    reference_point: string;
    probability_estimate: number | null;
    loss_aversion_signal: number;
    cas_signal: {
      rumination: number;
      worry: number;
    };
    system2_question_seed: string;
    decentering_prompt: string;
  };
};

export const BLUEBIRD_FEW_SHOT_CASES: BluebirdFewShotCase[] = [
  {
    input: {
      trigger: '팀 회의에서 내 제안이 바로 채택되지 않았다.',
      thought: '이번에 밀리면 나는 무능한 사람으로 낙인찍힐 거야.',
    },
    output: {
      distortions: [
        {
          type: DistortionType.CATASTROPHIZING,
          intensity: 0.86,
          segment: '무능한 사람으로 낙인찍힐 거야',
          rationale: '단일 사건을 장기적 파멸로 확장한다.',
        },
      ],
      frame_type: 'loss',
      reference_point: '항상 즉시 인정받아야 한다는 기준',
      probability_estimate: 72,
      loss_aversion_signal: 0.84,
      cas_signal: {
        rumination: 0.62,
        worry: 0.78,
      },
      system2_question_seed:
        '회의 1회의 반응이 장기 평판으로 이어질 객관 확률은 몇 %인가?',
      decentering_prompt:
        '“낙인찍힌다”는 판단을 사실이 아닌 가설로 보고 근거/반증을 분리하라.',
    },
  },
  {
    input: {
      trigger: '친구가 메시지 답장을 늦게 했다.',
      thought: '답장이 늦은 걸 보니 나를 싫어하는 게 분명해.',
    },
    output: {
      distortions: [
        {
          type: DistortionType.ARBITRARY_INFERENCE,
          intensity: 0.79,
          segment: '나를 싫어하는 게 분명해',
          rationale: '증거 없이 부정 결론을 확정한다.',
        },
      ],
      frame_type: 'loss',
      reference_point: '즉시 응답이 관계 안정의 기준이라는 가정',
      probability_estimate: 68,
      loss_aversion_signal: 0.67,
      cas_signal: {
        rumination: 0.55,
        worry: 0.72,
      },
      system2_question_seed:
        '답장 지연 외에 관계 악화를 지지하는 데이터는 몇 개인가?',
      decentering_prompt:
        '“싫어한다”는 해석과 “답장이 늦다”는 사실을 분리해서 기록하라.',
    },
  },
  {
    input: {
      trigger: '발표 중 한 슬라이드를 잠깐 버벅였다.',
      thought: '나는 발표를 망쳤고 완전히 실패했다.',
    },
    output: {
      distortions: [
        {
          type: DistortionType.ALL_OR_NOTHING,
          intensity: 0.91,
          segment: '완전히 실패했다',
          rationale: '부분 실수를 전체 실패로 이분화한다.',
        },
      ],
      frame_type: 'mixed',
      reference_point: '실수 0회 발표만 성공으로 간주하는 기준',
      probability_estimate: 65,
      loss_aversion_signal: 0.81,
      cas_signal: {
        rumination: 0.82,
        worry: 0.58,
      },
      system2_question_seed:
        '발표 전체 중 실수 구간 비율이 몇 %이며, 평가 영향은 어느 정도인가?',
      decentering_prompt:
        '“완전 실패”라는 라벨 대신 관찰 가능한 성과/실수 지표를 분리해 적어라.',
    },
  },
  {
    input: {
      trigger: '상사가 일정 지연 이유를 물었다.',
      thought: '내가 부족해서 팀 전체가 손해를 본다.',
    },
    output: {
      distortions: [
        {
          type: DistortionType.PERSONALIZATION,
          intensity: 0.76,
          segment: '내가 부족해서 팀 전체가 손해를 본다',
          rationale: '복합 원인을 개인 책임으로 과도 귀속한다.',
        },
      ],
      frame_type: 'loss',
      reference_point: '모든 변수를 개인이 통제해야 한다는 기준',
      probability_estimate: 61,
      loss_aversion_signal: 0.73,
      cas_signal: {
        rumination: 0.64,
        worry: 0.69,
      },
      system2_question_seed:
        '지연 원인 중 개인 통제 가능 변수와 외생 변수를 각각 몇 %로 볼 수 있는가?',
      decentering_prompt:
        '책임을 0~100으로 분해해 개인 몫과 환경 몫을 분리 평가하라.',
    },
  },
  {
    input: {
      trigger: '몸이 긴장되고 불안한 느낌이 계속된다.',
      thought: '이렇게 불안한 걸 보니 곧 큰일이 날 거야.',
    },
    output: {
      distortions: [
        {
          type: DistortionType.EMOTIONAL_REASONING,
          intensity: 0.88,
          segment: '불안한 걸 보니 곧 큰일이 날 거야',
          rationale: '감정을 미래 사실 예측의 직접 근거로 사용한다.',
        },
      ],
      frame_type: 'loss',
      reference_point: '불안이 0이어야 안전하다는 기준',
      probability_estimate: 74,
      loss_aversion_signal: 0.77,
      cas_signal: {
        rumination: 0.48,
        worry: 0.86,
      },
      system2_question_seed:
        '불안 강도(주관)와 실제 위험 데이터(객관)를 각각 몇 점으로 평가하는가?',
      decentering_prompt:
        '“불안하다”를 사건이 아닌 내부 신호로 기록하고 사실 데이터와 분리하라.',
    },
  },
];

export const BLUEBIRD_ANALYSIS_JSON_SCHEMA = {
  distortions: [
    {
      type: 'catastrophizing | all_or_nothing | emotional_reasoning | personalization | arbitrary_inference',
      intensity: '0~1 number',
      segment: 'string',
      rationale: 'string',
    },
  ],
  frame_type: 'loss | gain | mixed',
  reference_point: 'string',
  probability_estimate: 'number | null',
  loss_aversion_signal: '0~1 number',
  cas_signal: {
    rumination: '0~1 number',
    worry: '0~1 number',
  },
  system2_question_seed: 'string',
  decentering_prompt: 'string',
} as const;
