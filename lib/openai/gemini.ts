import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  BLUEBIRD_ANALYSIS_JSON_SCHEMA,
  BLUEBIRD_DISTORTION_TAXONOMY,
  BLUEBIRD_FEW_SHOT_CASES,
  BLUEBIRD_OPERATING_PRINCIPLES,
  BLUEBIRD_THEORY_SUMMARY,
} from '@/lib/ai/bluebird-protocol';
import {
  DistortionType,
  type AIAnalysisResult,
  type CasSignal,
  type DistortionAnalysis,
  type FrameType,
} from '@/types';

const VALID_DISTORTION_TYPES = new Set<string>(Object.values(DistortionType));
const DEFAULT_SOCRATIC_QUESTIONS = [
  '이 상황이 실제로 최악으로 전개될 확률을 0~100%로 추정하면 몇 %인가요?',
  '지금 생각을 뒷받침하는 객관적 증거와 반대 증거를 각각 3가지씩 적어볼 수 있나요?',
  '같은 상황을 겪는 친구에게 조언한다면, 어떤 대안 해석을 제시하시겠어요?',
];

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
  }
  return new GoogleGenerativeAI(apiKey);
}

function getGeminiModel() {
  const genAI = getGeminiClient();
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
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

async function generateContentWithRetry(prompt: string): Promise<string> {
  const model = getGeminiModel();
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      if (attempt === maxAttempts || !isRetryableGeminiError(error)) {
        throw error;
      }
      await sleep(600 * attempt);
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

function buildAnalysisPrompt(input: { trigger: string; thought: string }) {
  const distortionRules = Object.entries(BLUEBIRD_DISTORTION_TAXONOMY)
    .map(([key, value]) => `- ${key}: ${value.diagnosticRule}`)
    .join('\n');

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
    '',
    '[Few-shot Examples]',
    buildFewShotPromptBlock(),
    '',
    '[Actual Input]',
    JSON.stringify(input, null, 2),
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
  };
}

export async function analyzeDistortionsWithGemini(input: {
  trigger: string;
  thought: string;
}): Promise<AIAnalysisResult> {
  const prompt = buildAnalysisPrompt(input);
  const text = await generateContentWithRetry(prompt);
  const parsed = safeJsonParse<Record<string, unknown>>(text);
  if (!parsed) {
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
    };
  }
  return normalizeAnalysisPayload(parsed);
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
  const distortionsText = input.distortions.length
    ? input.distortions
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
    '',
    '[Context]',
    `트리거: ${input.trigger}`,
    `자동 사고: ${input.thought}`,
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

  const text = await generateContentWithRetry(prompt);
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
