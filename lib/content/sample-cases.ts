// 비회원 체험용 샘플 케이스 — Phase 1.4 funnel.
//
// 무결성 원칙: 이 데이터는 scripts/generate-sample-cases.ts가 실제 analyze API를
// 1회 호출해 받은 결과를 그대로 박은 것이다. 데모용 가공 절대 금지.
// 분석 로직 변경(few-shot, 프롬프트, 매핑 등) 시 generate-sample-cases.ts를 다시 돌려
// 이 파일을 갱신해야 한다.
//
// 마지막 갱신: 2026-04-26 — 한국어 우회 어미 fix (8880f18) + question 폴백 fix (4619a20)
// 적용된 분석 결과 사용.

import type {
  AIAnalysisResult,
  DistortionAnalysis,
  TriggerCategory,
} from '@/types';

export interface SampleCase {
  id: string;
  shortLabel: string;
  trigger: string;
  thought: string;
  analysis: {
    distortions: DistortionAnalysis[];
    frame_type: AIAnalysisResult['frame_type'];
    reference_point: string;
    probability_estimate: number | null;
    loss_aversion_signal: number;
    cas_signal: { rumination: number; worry: number };
    system2_question_seed: string;
    decentering_prompt: string;
    trigger_category: TriggerCategory;
  };
  questions: string[];
}

export const SAMPLE_CASES: SampleCase[] = [
  {
    id: 'presentation-mistake',
    shortLabel: '발표에서 실수한 뒤 "나는 항상 이런다"는 생각이 들 때',
    trigger: '오늘 회의에서 발표 중 한 부분에서 잠깐 말이 막혔다.',
    thought: '나는 항상 이런 식이고, 사람들이 분명 무능하다고 생각했을 거야.',
    analysis: {
      distortions: [
        {
          type: 'all_or_nothing' as DistortionAnalysis['type'],
          intensity: 0.75,
          segment: '나는 항상 이런 식이고',
          rationale:
            '단일 사건(발표 중 말이 막힘)을 일반화하여 자신의 능력을 \'항상 이렇다\'는 이분법적인 평가로 확장한다.',
        },
        {
          type: 'arbitrary_inference' as DistortionAnalysis['type'],
          intensity: 0.85,
          segment: '사람들이 분명 무능하다고 생각했을 거야',
          rationale:
            '객관적 증거 없이 타인의 마음을 읽어 부정적인 결론을 확정한다. \'분명 ~했을 거야\'는 한국어 점쟁이 오류 패턴이다.',
        },
      ],
      frame_type: 'loss',
      reference_point: '발표에서 완벽해야 하고, 타인에게 항상 유능하게 보여야 한다는 경직된 기준',
      probability_estimate: 80,
      loss_aversion_signal: 0.88,
      cas_signal: { rumination: 0.7, worry: 0.8 },
      system2_question_seed:
        '발표 중 말이 막힌 것이 \'항상 이런 식\'이라는 결론을 지지하는 객관적 데이터는 무엇이며, 타인이 \'무능하다\'고 생각했다는 증거는 몇 개인가?',
      decentering_prompt:
        '"나는 항상 이런 식이다"라는 생각을 사실이 아닌 \'자기 평가\'로, "사람들이 무능하다고 생각했을 거야"를 \'가설\'로 분리하여 기록하라.',
      trigger_category: 'work',
    },
    questions: [
      '"사람들이 분명 무능하다고 생각했을 거야"라는 가설을 뒷받침하는 구체적인 표정, 행동, 또는 발언 등 직접적인 증거는 몇 가지이며, 그러한 증거가 나타난 비율은 전체 참석자 중 몇 퍼센트입니까?',
      '"발표에서 완벽해야 하고, 타인에게 항상 유능하게 보여야 한다는 경직된 기준"을 잠시 내려놓고, 오늘 발표 중 말이 잠깐 막힌 상황에 대해 "나는 항상 이런 식이다"라는 자기 평가나 "사람들이 분명 무능하다고 생각했을 거야"라는 가설 외에, 다른 참석자들이 가질 수 있는 최소 3가지 이상의 대안적인 해석은 무엇이며, 각 해석을 뒷받침하는 반증 데이터는 무엇입니까?',
      '\'나는 항상 이런 식이다\'라는 자기 평가를 넘어, 다음 발표에서 말이 잠깐 막히는 상황을 예방하거나 발생 시 영향을 최소화하기 위해 구체적으로 통제 가능한 변수 3가지는 무엇이며, 각 변수를 개선하기 위한 행동 계획과 그 효과를 측정할 수 있는 지표는 무엇입니까?',
    ],
  },
  {
    id: 'friend-late-reply',
    shortLabel: '친구 답장이 늦어서 "날 싫어하나"라는 생각이 들 때',
    trigger: '친구에게 메시지를 보냈는데 두 시간째 답장이 없다.',
    thought: '나를 싫어하는 게 분명해. 내가 뭔가 잘못 말했나 봐.',
    analysis: {
      distortions: [
        {
          type: 'arbitrary_inference' as DistortionAnalysis['type'],
          intensity: 0.85,
          segment: '나를 싫어하는 게 분명해',
          rationale:
            '관찰 가능한 사실(답장 지연)에 대해 타인의 감정(싫어함)을 단정적으로 판단한다. 점쟁이 오류와 마음 읽기가 결합된 임의적 추론이다.',
        },
        {
          type: 'personalization' as DistortionAnalysis['type'],
          intensity: 0.78,
          segment: '내가 뭔가 잘못 말했나 봐',
          rationale:
            '친구의 답장 지연이라는 외부 사건의 원인을 자신의 결함이나 실수로 과도하게 귀속한다. 통제 불가능한 외부 변수(친구의 상황, 일정 등)를 무시한다.',
        },
      ],
      frame_type: 'loss',
      reference_point: '즉각적인 답장이 와야 관계가 안정적이라는 가정',
      probability_estimate: 70,
      loss_aversion_signal: 0.85,
      cas_signal: { rumination: 0.8, worry: 0.7 },
      system2_question_seed:
        '친구의 답장 지연에 영향을 미칠 수 있는 객관적 변수는 무엇이며, \'나를 싫어한다\'는 결론을 뒷받침하는 데이터는 몇 %인가?',
      decentering_prompt:
        '"나를 싫어하는 게 분명해"라는 해석과 "답장이 늦다"는 사실을 분리해서 기록하라. \'잘못 말했나 봐\'를 가설로 보고 근거와 반증을 나열하라.',
      trigger_category: 'relationship',
    },
    questions: [
      '친구의 답장이 두 시간째 없는 \'사실\' 외에, \'나를 싫어하는 게 분명해\'라는 자동 사고의 확률(현재 70%)을 뒷받침하는 객관적인 증거는 몇 가지이며, 그 증거들의 신뢰도는 0~100% 중 어느 정도입니까?',
      '과거 친구가 메시지에 두 시간 이상 답장이 늦었을 때, 실제 관계에 문제가 없었던 사례는 몇 번이었습니까? 또한, \'즉시 답장이 와야 관계가 안정적이라는 가정\' 대신, 친구의 답장 지연을 설명할 수 있는 다른 객관적 변수(예: 친구의 일정, 컨디션 등) 3가지는 무엇입니까?',
      '현재 \'나를 싫어한다\'는 해석과 \'답장이 늦다\'는 사실을 분리하여, \'나를 싫어하는 게 분명해\'라는 자동 사고의 강도를 낮추기 위해 친구의 답장을 기다리는 동안 당신이 직접 통제하거나 행동할 수 있는 변수는 무엇이며, 각 변수가 자동 사고 강도(0-100%)를 몇 % 낮출 수 있다고 예상합니까?',
    ],
  },
  {
    id: 'project-doom',
    shortLabel: '잘 될 것 같았는데 "어차피 망할 것 같다"는 느낌이 들 때',
    trigger: '준비한 프로젝트 발표가 내일이고 지금까지 동료 반응은 좋았다.',
    thought: '지금까지 잘 됐지만 어차피 막판에 망할 것 같다.',
    analysis: {
      distortions: [
        {
          type: 'arbitrary_inference' as DistortionAnalysis['type'],
          intensity: 0.8,
          segment: '어차피 막판에 망할 것 같다',
          rationale:
            '지금까지의 긍정적인 동료 반응(객관적 증거)에도 불구하고, 미래의 부정적 결과(\'망할 것\')를 단정적으로 예측하는 점쟁이 오류이다. \'~할 것 같다\'는 한국어 우회 어미가 결합되어 있지만, 부정적 결과 예측의 강도는 매우 높다.',
        },
      ],
      frame_type: 'mixed',
      reference_point: '완벽한 성공만이 \'성공\'이며, 작은 실수나 부정적 변수는 \'실패\'로 간주하는 기준',
      probability_estimate: 75,
      loss_aversion_signal: 0.85,
      cas_signal: { rumination: 0.6, worry: 0.85 },
      system2_question_seed:
        '\'어차피 막판에 망할 것 같다\'는 예측의 객관적 확률은 0~100% 중 몇 %이며, 지금까지 좋았던 동료 반응은 이 예측에 대한 반증으로 몇 % 작용하는가?',
      decentering_prompt:
        '"어차피 막판에 망할 것 같다"는 미래 예측을 사실이 아닌 \'가설\' 또는 \'뇌가 보내는 경고 신호\'로 분리하라. 지금까지의 긍정적인 동료 반응이라는 \'사실\'과 분리해서 기록하라.',
      trigger_category: 'work',
    },
    questions: [
      '지금까지 동료 반응이 좋았다는 객관적인 증거에도 불구하고, \'어차피 막판에 망할 것 같다\'는 예측이 75%의 확률로 실현될 것이라고 보는 구체적인 근거는 무엇이며, 그 근거가 사실로 입증된 사례는 과거에 몇 번이나 있었습니까?',
      '지금까지 좋았던 동료 반응을 \'막판에 망할 것 같다\'는 생각을 사실이 아닌 \'내 뇌가 보내는 미래 예측 신호\'로 기록하고 실제 관찰된 동료 반응(예: 긍정적 피드백, 질문, 행동 등)을 별도로 분리해 기록한다면, \'완벽한 성공\'이라는 경직된 기준 대신 \'성공\'을 정의할 수 있는 다른 3가지 객관적 지표는 무엇이며, 그 지표들에 대한 현재까지의 달성도는 몇 %입니까?',
      '내일 발표를 앞두고 \'어차피 막판에 망할 것 같다\'는 우려를 줄이기 위해, 지금 이 순간부터 발표 전까지 구체적으로 어떤 행동들을 취할 수 있으며, 각 행동이 발표 성공 확률에 미치는 긍정적 영향은 0~100% 중 몇 %로 추정합니까? 또한, 만약 발표 중 예상치 못한 상황이 발생하더라도 \'완벽한 성공\'이라는 기준에서 벗어나, 80% 이상의 성공으로 간주할 수 있는 \'대안적 성공 시나리오\'는 무엇입니까?',
    ],
  },
];

export function getSampleCase(id: string): SampleCase | null {
  return SAMPLE_CASES.find((c) => c.id === id) ?? null;
}
