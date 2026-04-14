import { DistortionType, type FrameType } from '@/types';

export type EvalCase = {
  id: string;
  trigger: string;
  thought: string;
  expectedDistortions: DistortionType[];
  expectedFrame: FrameType;
  minQuestionNumericCount: number;
};

export const BLUEBIRD_EVAL_CASES: EvalCase[] = [
  {
    id: 'catastrophizing-1',
    trigger: '상사 피드백이 예상보다 차가웠다.',
    thought: '이번 평가에서 밀리면 내 커리어는 끝이야.',
    expectedDistortions: [DistortionType.CATASTROPHIZING],
    expectedFrame: 'loss',
    minQuestionNumericCount: 3,
  },
  {
    id: 'all-or-nothing-1',
    trigger: '발표 중 질문 한 개에 즉답하지 못했다.',
    thought: '완전히 실패했고 나는 발표를 못하는 사람이다.',
    expectedDistortions: [DistortionType.ALL_OR_NOTHING],
    expectedFrame: 'loss',
    minQuestionNumericCount: 3,
  },
  {
    id: 'emotional-reasoning-1',
    trigger: '출근 전 긴장감이 심하게 들었다.',
    thought: '이렇게 불안하면 오늘 분명 문제가 생긴다.',
    expectedDistortions: [DistortionType.EMOTIONAL_REASONING],
    expectedFrame: 'loss',
    minQuestionNumericCount: 3,
  },
  {
    id: 'personalization-1',
    trigger: '프로젝트 일정이 지연되었다.',
    thought: '다 내 탓이고 팀 성과를 망쳤다.',
    expectedDistortions: [DistortionType.PERSONALIZATION],
    expectedFrame: 'loss',
    minQuestionNumericCount: 3,
  },
  {
    id: 'arbitrary-inference-1',
    trigger: '친구가 카톡 답장을 늦게 했다.',
    thought: '날 싫어하는 게 확실하다.',
    expectedDistortions: [DistortionType.ARBITRARY_INFERENCE],
    expectedFrame: 'loss',
    minQuestionNumericCount: 3,
  },
  {
    id: 'mixed-1',
    trigger: '신규 제안이 채택됐지만 수정 요청이 많았다.',
    thought: '좋은 시작이긴 한데, 결국 완벽하지 않으면 실패다.',
    expectedDistortions: [DistortionType.ALL_OR_NOTHING],
    expectedFrame: 'mixed',
    minQuestionNumericCount: 3,
  },
  {
    id: 'gain-frame-1',
    trigger: '파일럿 실험에서 기대 이상의 결과가 나왔다.',
    thought: '이번엔 잘됐지만 다음엔 실패할 확률이 80%일 거야.',
    expectedDistortions: [DistortionType.CATASTROPHIZING],
    expectedFrame: 'mixed',
    minQuestionNumericCount: 3,
  },
  {
    id: 'cas-worry-heavy',
    trigger: '내일 중요한 미팅이 있다.',
    thought: '밤새 대비하지 않으면 큰일 나고 그다음 프로젝트도 다 망한다.',
    expectedDistortions: [DistortionType.CATASTROPHIZING],
    expectedFrame: 'loss',
    minQuestionNumericCount: 3,
  },
  {
    id: 'cas-rumination-heavy',
    trigger: '지난주 협상에서 불리한 조건을 수락했다.',
    thought: '그 실수 하나로 나는 전략 판단 능력이 없다.',
    expectedDistortions: [DistortionType.ALL_OR_NOTHING, DistortionType.PERSONALIZATION],
    expectedFrame: 'loss',
    minQuestionNumericCount: 3,
  },
  {
    id: 'low-distortion-neutral',
    trigger: '회의 중 예상 밖 질문이 나왔다.',
    thought: '당황했지만 다음 회의 전엔 예상 질문 5개를 미리 준비하자.',
    expectedDistortions: [],
    expectedFrame: 'gain',
    minQuestionNumericCount: 3,
  },
];

export const BLUEBIRD_EVAL_CHECKLIST = [
  '왜곡 라벨이 기대 왜곡 중 최소 1개와 일치하는가(해당 케이스에 기대 왜곡이 있는 경우)',
  'frame_type이 기대 프레임과 동일하거나 mixed로 수용 가능한가',
  '질문 3개 모두 숫자/확률/비율 입력을 유도하는가',
  '질문에 위로/격려 중심 문장이 포함되지 않는가',
  '응답이 항상 JSON 파싱 가능한가',
] as const;
