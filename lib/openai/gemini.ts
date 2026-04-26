import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai';
import {
  BLUEBIRD_ANALYSIS_JSON_SCHEMA,
  BLUEBIRD_DISTORTION_TAXONOMY,
  BLUEBIRD_FEW_SHOT_CASES,
  BLUEBIRD_OPERATING_PRINCIPLES,
  BLUEBIRD_THEORY_SUMMARY,
} from '@/lib/ai/bluebird-protocol';
import { sanitizeForPrompt } from '@/lib/safety/prompt-sanitize';
import {
  DistortionType,
  TRIGGER_CATEGORIES,
  type AIAnalysisResult,
  type CasSignal,
  type DistortionAnalysis,
  type FrameType,
  type TriggerCategory,
} from '@/types';

const VALID_DISTORTION_TYPES = new Set<string>(Object.values(DistortionType));
const VALID_TRIGGER_CATEGORIES = new Set<string>(TRIGGER_CATEGORIES);
const DEFAULT_SOCRATIC_QUESTIONS = [
  '이 상황이 실제로 최악으로 전개될 확률을 0~100%로 추정하면 몇 %인가요?',
  '지금 생각을 뒷받침하는 객관적 증거와 반대 증거를 각각 3가지씩 적어볼 수 있나요?',
  '같은 상황을 겪는 친구에게 조언한다면, 어떤 대안 해석을 제시하시겠어요?',
];

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
  }
  return new GoogleGenerativeAI(apiKey);
}

const ANALYSIS_RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    distortions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          type: {
            type: SchemaType.STRING,
            format: 'enum',
            enum: ['catastrophizing', 'all_or_nothing', 'emotional_reasoning', 'personalization', 'arbitrary_inference'],
          },
          intensity: { type: SchemaType.NUMBER },
          segment: { type: SchemaType.STRING },
          rationale: { type: SchemaType.STRING },
        },
        required: ['type', 'intensity', 'segment', 'rationale'],
      },
    },
    frame_type: { type: SchemaType.STRING, format: 'enum', enum: ['loss', 'gain', 'mixed'] },
    reference_point: { type: SchemaType.STRING },
    probability_estimate: { type: SchemaType.NUMBER, nullable: true },
    loss_aversion_signal: { type: SchemaType.NUMBER },
    cas_signal: {
      type: SchemaType.OBJECT,
      properties: {
        rumination: { type: SchemaType.NUMBER },
        worry: { type: SchemaType.NUMBER },
      },
      required: ['rumination', 'worry'],
    },
    system2_question_seed: { type: SchemaType.STRING },
    decentering_prompt: { type: SchemaType.STRING },
    trigger_category: {
      type: SchemaType.STRING,
      format: 'enum',
      enum: ['work', 'relationship', 'family', 'health', 'self', 'finance', 'study', 'other'],
    },
  },
  required: [
    'distortions',
    'frame_type',
    'reference_point',
    'loss_aversion_signal',
    'cas_signal',
    'system2_question_seed',
    'decentering_prompt',
    'trigger_category',
  ],
};

const QUESTIONS_RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    questions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
  },
  required: ['questions'],
};

function getAnalysisModel() {
  const genAI = getGeminiClient();
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.2,
      topP: 0.9,
      topK: 20,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
      responseSchema: ANALYSIS_RESPONSE_SCHEMA,
    },
  });
}

function getQuestionsModel() {
  const genAI = getGeminiClient();
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.3,
      topP: 0.9,
      topK: 20,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
      responseSchema: QUESTIONS_RESPONSE_SCHEMA,
    },
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableGeminiError(error: unknown): boolean {
  const status = (error as { status?: number })?.status;
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

async function generateContentWithRetry(
  prompt: string,
  model: ReturnType<typeof getAnalysisModel>
): Promise<string> {
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      if (attempt === maxAttempts || !isRetryableGeminiError(error)) {
        throw error;
      }
      const baseBackoffMs = 1200 * 2 ** (attempt - 1);
      const jitterMs = Math.floor(Math.random() * 300);
      await sleep(baseBackoffMs + jitterMs);
    }
  }

  throw new Error('Gemini 응답을 받지 못했습니다.');
}

function safeJsonParse<T>(text: string): T | null {
  const cleaned = text
    .trim()
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const candidates = [cleaned];
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start >= 0 && end > start) {
    candidates.push(cleaned.slice(start, end + 1));
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate.replace(/,\s*([}\]])/g, '$1')) as T;
    } catch {
      // 다음 후보 시도
    }
  }

  return null;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function toCasSignal(input: unknown): CasSignal {
  if (!input || typeof input !== 'object') {
    return { rumination: 0.3, worry: 0.3 };
  }
  const rumination = clamp(Number((input as { rumination?: unknown }).rumination ?? 0.3), 0, 1);
  const worry = clamp(Number((input as { worry?: unknown }).worry ?? 0.3), 0, 1);
  return { rumination, worry };
}

function toFrameType(input: unknown): FrameType {
  const raw = String(input ?? '').toLowerCase();
  if (raw === 'loss' || raw === 'gain' || raw === 'mixed') {
    return raw;
  }
  return 'mixed';
}

function toTriggerCategory(input: unknown): TriggerCategory {
  const raw = String(input ?? '').toLowerCase();
  return VALID_TRIGGER_CATEGORIES.has(raw) ? (raw as TriggerCategory) : 'other';
}

function normalizeDistortions(payload: unknown): DistortionAnalysis[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const rawDistortions = (payload as { distortions?: unknown }).distortions;
  if (!Array.isArray(rawDistortions)) {
    return [];
  }

  return rawDistortions
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const rawType = String((item as { type?: unknown }).type ?? '');
      const rawIntensity = Number((item as { intensity?: unknown }).intensity ?? 0);
      const rawSegment = String((item as { segment?: unknown }).segment ?? '').trim();

      if (!VALID_DISTORTION_TYPES.has(rawType)) return null;
      if (!Number.isFinite(rawIntensity)) return null;

      const rationale = String((item as { rationale?: unknown }).rationale ?? '').trim();
      return {
        type: rawType as DistortionType,
        intensity: Math.max(0, Math.min(1, rawIntensity)),
        segment: rawSegment || '사용자 사고 전반',
        ...(rationale ? { rationale } : {}),
      };
    })
    .filter((item): item is DistortionAnalysis => item !== null);
}

function buildFewShotPromptBlock() {
  return BLUEBIRD_FEW_SHOT_CASES.map((example, index) => {
    return `예시 ${index + 1}
INPUT:
${JSON.stringify(example.input, null, 2)}
OUTPUT:
${JSON.stringify(example.output, null, 2)}`;
  }).join('\n\n');
}

function buildAnalysisPrompt(input: {
  trigger: string;
  thought: string;
  pain_score?: number | null;
  retryHint?: boolean;
}) {
  const safeTrigger = sanitizeForPrompt(input.trigger);
  const safeThought = sanitizeForPrompt(input.thought);

  const distortionRules = Object.entries(BLUEBIRD_DISTORTION_TAXONOMY)
    .map(([key, value]) => `- ${key}:\n  진단: ${value.diagnosticRule}\n  감별: ${value.differentialRule}`)
    .join('\n');

  const retryBlock = input.retryHint
    ? [
        '',
        '[Retry Notice]',
        '- 이 입력은 이전 분석에서 distortions=[]로 판정됐다.',
        '- 사고가 정말 사실 기반·행동 지향적이라면 다시 빈 배열을 반환해도 된다.',
        '- 그러나 [Distortion Reporting Threshold]의 다섯 신호 중 하나라도 보이는 경우,',
        '  특히 [Korean Hedge Expressions]의 우회 어미가 부정 결과와 결합돼 있다면,',
        '  반드시 가장 가까운 왜곡 1개 이상을 intensity 0.3 이상으로 보고하라.',
        '- 첫 분석이 신중을 위한 false negative였는지 재검토하라.',
      ].join('\n')
    : '';

  return [
    '너는 Bluebird DDE(Distortion Detection Engine) 분석가다.',
    '너의 목적은 시스템1 오류를 시스템2 기동 데이터로 변환하는 것이다.',
    '',
    '[Bluebird Operating Principles]',
    ...BLUEBIRD_OPERATING_PRINCIPLES.map((v) => `- ${v}`),
    '',
    '[Bluebird Theory Summary]',
    `- Dual Process: ${BLUEBIRD_THEORY_SUMMARY.dualProcess.interventionGoal}`,
    `- Prospect Theory: ${BLUEBIRD_THEORY_SUMMARY.prospectTheory.probabilityWeighting}`,
    `- Metacognition: ${BLUEBIRD_THEORY_SUMMARY.metacognition.cas}`,
    `- Agency: ${BLUEBIRD_THEORY_SUMMARY.agency.gameTheoreticThinking}`,
    '',
    '[Distortion Taxonomy]',
    distortionRules,
    '',
    '[Output Schema: JSON ONLY]',
    JSON.stringify(BLUEBIRD_ANALYSIS_JSON_SCHEMA, null, 2),
    '',
    '[Constraints]',
    '- 반드시 JSON만 반환한다. 설명 문장/마크다운/코드펜스 금지.',
    '- 응답은 감정적 위로가 아니라 검증 가능한 분석만 포함한다.',
    '- probability_estimate는 0~100 정수 또는 null.',
    '- cas_signal 값은 0~1 범위.',
    '- 경계 케이스에서는 반드시 differentialRule을 참조해 왜곡 유형을 확정하라.',
    '- 복수 왜곡이 탐지되면 모두 포함하되, intensity로 주도 왜곡을 구분하라.',
    '',
    '[Distortion Reporting Threshold]',
    '- distortions=[] 빈 배열 반환은 사고가 명확히 사실 기반이고 행동 지향적인 경우에만 허용한다.',
    '  · 허용 예: "다음 주 일정을 점검하자", "원인을 데이터로 분석해보자", "3일 쉬었으니 다시 시작하자"',
    '- 다음 신호 중 하나라도 보이면 반드시 가장 가까운 왜곡 1개 이상을 intensity 0.3 이상으로 보고하라:',
    '  · 부정적 미래 예언 (사건이 어떻게 흘러갈지 부정적으로 단정)',
    '  · 타인의 마음/평가에 대한 단정 (실제 관찰되지 않은 타인의 반응을 확정)',
    '  · 이분법적 결과 평가 (성공 아니면 실패 / 완벽 아니면 무가치)',
    '  · 감정을 사실 근거로 사용 (불안하니까 위험하다 류)',
    '  · 자기 결함/책임으로의 과도 귀속',
    '- 모호함이 의심을 불러도 differentialRule을 적용해 가장 가까운 라벨로 단정하라.',
    '  "확신이 없어 빈 배열" 보고는 protocol 위반이다.',
    '',
    '[Korean Hedge Expressions]',
    '- 한국어 화자는 단정적 표현을 다음과 같이 우회한다. 표면적 비단정으로 보이지만 내적으로는 부정 결과를 확정한 상태다.',
    '  · "~할까 봐", "~할까 두렵다", "~할까 걱정된다" → 미래 부정 결과 예언 (점쟁이 오류 = 임의적 추론)',
    '  · "~할 것 같다", "~할지 모르겠다" → 부정 결과와 결합되면 임의적 추론 또는 파국화 후보',
    '  · "잘 ~할 수 있을지 모르겠다" → 자기 능력 의심 / 결과 비관 — 임의적 추론 또는 흑백논리 후보',
    '  · "~로 인해 ~할까" → 인과 단정 + 미래 예언 — 임의적 추론',
    '- 어미가 비단정적이라는 이유만으로 왜곡 미보고하지 마라. 결합되는 결과의 부정성으로 판단한다.',
    '',
    '[Trigger Category Rules]',
    '- trigger_category는 trigger 문장의 도메인을 8개 중 하나로 라벨링한다.',
    '  · work: 직장 업무, 상사·동료, 회사, 커리어, 면접, 출근, 발표, 마감',
    '  · relationship: 친구, 연인, 지인, 데이트, 이별, 비연애 인간관계 갈등',
    '  · family: 부모, 형제자매, 자녀, 배우자, 친척',
    '  · health: 신체 컨디션, 수면, 통증, 질병, 의료 검진, 식이',
    '  · self: 자존감, 정체성, 외모, 성격, 능력 자기평가',
    '  · finance: 돈, 소비, 부채, 투자, 노후, 가격 결정',
    '  · study: 학교, 시험, 과제, 자격증, 진학',
    '  · other: 위 7개 모두에 해당하지 않을 때만 사용',
    '- 모호하면 가장 dominant한 도메인 1개를 고른다. 절대 복수 라벨 금지.',
    '- 반드시 8개 중 하나만 사용. 새 라벨 생성 금지.',
    '',
    '[Few-shot Examples]',
    buildFewShotPromptBlock(),
    '',
    '[Actual Input]',
    JSON.stringify(
      {
        trigger: safeTrigger,
        thought: safeThought,
        ...(input.pain_score != null ? { initial_pain_score: input.pain_score } : {}),
      },
      null,
      2
    ),
    retryBlock,
  ].join('\n');
}

function normalizeAnalysisPayload(payload: unknown): AIAnalysisResult {
  const distortions = normalizeDistortions(payload);
  const frameType = toFrameType((payload as { frame_type?: unknown })?.frame_type);
  const probabilityEstimateRaw = Number(
    (payload as { probability_estimate?: unknown })?.probability_estimate ?? Number.NaN
  );
  const probabilityEstimate = Number.isFinite(probabilityEstimateRaw)
    ? clamp(Math.round(probabilityEstimateRaw), 0, 100)
    : null;
  const lossAversionRaw = Number(
    (payload as { loss_aversion_signal?: unknown })?.loss_aversion_signal ?? 0.3
  );
  const lossAversionSignal = clamp(lossAversionRaw, 0, 1);
  const casSignal = toCasSignal((payload as { cas_signal?: unknown })?.cas_signal);

  return {
    distortions,
    questions: [],
    frame_type: frameType,
    reference_point:
      String((payload as { reference_point?: unknown })?.reference_point ?? '').trim() ||
      '사용자 기대 기준이 명확히 드러나지 않음',
    probability_estimate: probabilityEstimate,
    loss_aversion_signal: lossAversionSignal,
    cas_signal: casSignal,
    system2_question_seed:
      String((payload as { system2_question_seed?: unknown })?.system2_question_seed ?? '').trim() ||
      '이 판단의 확률과 근거를 분리해서 다시 계산해볼 수 있나요?',
    decentering_prompt:
      String((payload as { decentering_prompt?: unknown })?.decentering_prompt ?? '').trim() ||
      '현재 생각을 사실이 아닌 가설로 두고, 관찰 가능한 증거만 분리해보세요.',
    trigger_category: toTriggerCategory(
      (payload as { trigger_category?: unknown })?.trigger_category
    ),
  };
}

// 사고 텍스트 길이 임계값. 미만이면 false negative retry를 트리거하지 않음
// (입력 정보 자체가 부족하면 재시도해도 같은 결과 — 오히려 오탐 위험).
const FALSE_NEGATIVE_RETRY_MIN_THOUGHT_LENGTH = 15;

export async function analyzeDistortionsWithGemini(input: {
  trigger: string;
  thought: string;
  pain_score?: number | null;
}): Promise<AIAnalysisResult> {
  const firstPrompt = buildAnalysisPrompt(input);
  const firstText = await generateContentWithRetry(firstPrompt, getAnalysisModel());
  const firstParsed = safeJsonParse<Record<string, unknown>>(firstText);

  if (!firstParsed) {
    return {
      distortions: [],
      questions: [],
      frame_type: 'mixed',
      reference_point: '파싱 실패로 준거점을 추출하지 못함',
      probability_estimate: null,
      loss_aversion_signal: 0.3,
      cas_signal: { rumination: 0.3, worry: 0.3 },
      system2_question_seed: '이 생각을 지지/반박하는 데이터 비율은 각각 몇 %인가요?',
      decentering_prompt: '생각을 사실이 아닌 가설로 표기하고 관찰 사실만 분리하세요.',
      trigger_category: 'other',
    };
  }

  const firstResult = normalizeAnalysisPayload(firstParsed);

  // Fix B: 의미 있는 입력에 distortions=[]가 나오면 1회 재시도. 두 번째도 0개면 그대로 수용.
  const thoughtLength = input.thought.trim().length;
  const shouldRetry =
    firstResult.distortions.length === 0 &&
    thoughtLength >= FALSE_NEGATIVE_RETRY_MIN_THOUGHT_LENGTH;

  if (!shouldRetry) {
    return firstResult;
  }

  const retryPrompt = buildAnalysisPrompt({ ...input, retryHint: true });
  const retryText = await generateContentWithRetry(retryPrompt, getAnalysisModel());
  const retryParsed = safeJsonParse<Record<string, unknown>>(retryText);
  if (!retryParsed) return firstResult;

  const retryResult = normalizeAnalysisPayload(retryParsed);
  // 재시도가 distortion을 1개 이상 발견한 경우에만 채택. 아니면 첫 결과 유지.
  return retryResult.distortions.length > 0 ? retryResult : firstResult;
}

function normalizeQuestions(payload: unknown): string[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }
  const rawQuestions = (payload as { questions?: unknown }).questions;
  if (!Array.isArray(rawQuestions)) {
    return [];
  }

  return rawQuestions
    .map((q) => String(q ?? '').trim())
    .filter((q) => q.length > 0)
    .slice(0, 3);
}

export async function generateSocraticQuestionsWithGemini(input: {
  trigger: string;
  thought: string;
  distortions: DistortionAnalysis[];
  frameType?: FrameType;
  referencePoint?: string;
  probabilityEstimate?: number | null;
  casSignal?: CasSignal;
  system2QuestionSeed?: string;
  decenteringPrompt?: string;
}): Promise<string[]> {
  const safeTrigger = sanitizeForPrompt(input.trigger);
  const safeThought = sanitizeForPrompt(input.thought);
  const safeDistortions = input.distortions.map((d) => ({
    ...d,
    segment: sanitizeForPrompt(d.segment),
  }));

  const distortionsText = safeDistortions.length
    ? safeDistortions
        .map(
          (d, idx) =>
            `${idx + 1}. type=${d.type}, intensity=${d.intensity.toFixed(2)}, segment=${d.segment}`
        )
        .join('\n')
    : '탐지된 왜곡 없음';

  const prompt = [
    '너는 Bluebird의 System-2 Activation Question Engine이다.',
    '목표: 사용자가 스스로 판단하도록 논리적 검증 질문 3개를 생성한다.',
    '',
    '[Question Constraints]',
    '- 정확히 3개',
    '- 각 질문은 숫자/확률/비율 등 계량 답변을 요구',
    '- 위로 금지, 판단 단정 금지',
    '- Build-Measure-Learn 루프를 촉진하는 질문 포함',
    `- 반드시 reference_point("${input.referencePoint ?? '미확인'}")를 최소 1개 질문에 직접 언급하거나 반영하라.`,
    `- decentering_prompt("${input.decenteringPrompt ?? '없음'}")를 활용해 최소 1개 질문을 설계하라.`,
    '- 사용자의 구체적 상황(트리거/자동사고)에서 실제 수치/사례를 질문에 포함하라.',
    '',
    '[Context]',
    `트리거: ${safeTrigger}`,
    `자동 사고: ${safeThought}`,
    `탐지된 왜곡:\n${distortionsText}`,
    `frame_type: ${input.frameType ?? 'mixed'}`,
    `reference_point: ${input.referencePoint ?? '미확인'}`,
    `probability_estimate: ${input.probabilityEstimate ?? 'null'}`,
    `cas_signal: rumination=${input.casSignal?.rumination ?? 0.3}, worry=${input.casSignal?.worry ?? 0.3}`,
    `system2_question_seed: ${input.system2QuestionSeed ?? '없음'}`,
    `decentering_prompt: ${input.decenteringPrompt ?? '없음'}`,
    '',
    '[Output JSON Schema]',
    JSON.stringify(
      {
        questions: [
          '질문 1',
          '질문 2',
          '질문 3',
        ],
      },
      null,
      2
    ),
    '',
    'JSON 이외 텍스트는 출력하지 마라.',
  ].join('\n');

  const text = await generateContentWithRetry(prompt, getQuestionsModel());
  const parsed = safeJsonParse<{ questions?: unknown }>(text);
  if (!parsed) {
    return DEFAULT_SOCRATIC_QUESTIONS;
  }
  const questions = normalizeQuestions(parsed);

  if (questions.length === 3) {
    return questions;
  }

  return DEFAULT_SOCRATIC_QUESTIONS;
}
