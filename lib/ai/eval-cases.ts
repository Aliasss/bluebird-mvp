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
  // 경계 케이스: 파국화 vs 흑백논리
  {
    id: 'boundary-cat-vs-aon-1',
    trigger: '시험에서 한 문제를 틀렸다.',
    thought: '이거 틀리면 나는 낙제다.',
    expectedDistortions: [DistortionType.ALL_OR_NOTHING],
    expectedFrame: 'loss',
    minQuestionNumericCount: 3,
  },
  {
    id: 'boundary-cat-vs-aon-2',
    trigger: '첫 직장 면접에서 떨어졌다.',
    thought: '이번에 떨어지면 평생 취업 못 할 거야.',
    expectedDistortions: [DistortionType.CATASTROPHIZING],
    expectedFrame: 'loss',
    minQuestionNumericCount: 3,
  },
  // 경계 케이스: 감정적 추론 vs 임의적 추론
  {
    id: 'boundary-er-vs-ai-1',
    trigger: '발표 직전 심장이 두근거렸다.',
    thought: '심장이 이렇게 뛰니까 분명 오늘 망할 거야.',
    expectedDistortions: [DistortionType.EMOTIONAL_REASONING],
    expectedFrame: 'loss',
    minQuestionNumericCount: 3,
  },
  {
    id: 'boundary-er-vs-ai-2',
    trigger: '상사가 회의에서 나를 쳐다보지 않았다.',
    thought: '저게 나를 싫어한다는 신호다.',
    expectedDistortions: [DistortionType.ARBITRARY_INFERENCE],
    expectedFrame: 'loss',
    minQuestionNumericCount: 3,
  },
  // 경계 케이스: 개인화 vs 임의적 추론
  {
    id: 'boundary-per-vs-ai-1',
    trigger: '팀 KPI가 목표치에 미달했다.',
    thought: '내가 부족해서 팀 전체가 실패했다.',
    expectedDistortions: [DistortionType.PERSONALIZATION],
    expectedFrame: 'loss',
    minQuestionNumericCount: 3,
  },
  {
    id: 'boundary-per-vs-ai-2',
    trigger: '친구 모임에서 대화가 잠깐 끊겼다.',
    thought: '내가 분위기를 망쳤고 다들 나를 탓하고 있을 거다.',
    expectedDistortions: [DistortionType.PERSONALIZATION, DistortionType.ARBITRARY_INFERENCE],
    expectedFrame: 'loss',
    minQuestionNumericCount: 3,
  },
  // 경계 케이스: 복수 왜곡
  {
    id: 'boundary-multi-1',
    trigger: '코드 리뷰에서 코멘트를 10개 받았다.',
    thought: '이렇게 많이 지적당했으니 나는 실력이 없고, 팀장이 나를 못 미더워할 게 뻔하다.',
    expectedDistortions: [DistortionType.ALL_OR_NOTHING, DistortionType.ARBITRARY_INFERENCE],
    expectedFrame: 'loss',
    minQuestionNumericCount: 3,
  },
  {
    id: 'boundary-multi-2',
    trigger: '발표 자료를 세 번이나 수정했다.',
    thought: '세 번씩 고쳐야 한다는 건 내가 무능하다는 증거고, 이번 프로젝트는 망할 거야.',
    expectedDistortions: [DistortionType.PERSONALIZATION, DistortionType.CATASTROPHIZING],
    expectedFrame: 'loss',
    minQuestionNumericCount: 3,
  },
  // 경계 케이스: 낮은 왜곡 / 오탐 방지
  {
    id: 'boundary-low-distortion-1',
    trigger: '운동을 3일 연속 빠졌다.',
    thought: '3일 쉬었으니 다시 시작해야 한다. 다음 주부터 다시 루틴을 잡아보자.',
    expectedDistortions: [],
    expectedFrame: 'gain',
    minQuestionNumericCount: 3,
  },
  {
    id: 'boundary-low-distortion-2',
    trigger: '협상에서 원하는 조건을 50%만 얻었다.',
    thought: '절반은 얻었지만 나머지도 다음 라운드에서 시도해볼 수 있다.',
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
