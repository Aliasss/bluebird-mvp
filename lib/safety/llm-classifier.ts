import type { LlmVerdict } from './types';
import { sanitizeForPrompt } from './prompt-sanitize';

export interface LlmClient {
  generate(prompt: string): Promise<string>;
}

export interface LlmClassifyInput {
  text: string;
  client: LlmClient;
}

export interface LlmClassifyResult {
  verdict: LlmVerdict;
  reason: string;
}

const SYSTEM_PROMPT = `너는 한국어 정신건강 위기 신호 분류기다. 사용자가 작성한 자동 사고(thought) 원문을 받아, 자살/자해 의도 또는 강한 절망 신호를 분류하라.

<분류 기준>
- critical: 자살/자해에 대한 명시적 의도 또는 구체적 계획/수단 언급
- caution: 명시적 위험은 없으나 강한 절망, 무가치감, 통제 상실 신호
- none: 일상적 스트레스·분노·슬픔 표현이며 위험 신호 없음
</분류 기준>

<제약>
- JSON 외 출력 금지
- 스키마: { "level": "critical" | "caution" | "none", "reason": "한 문장 근거" }
- 판단은 맥락(관용 표현, 은유)을 고려하되 애매하면 caution 우선 (재현율 우선)
</제약>`;

export async function classifyWithLlm(input: LlmClassifyInput): Promise<LlmClassifyResult> {
  const safeText = sanitizeForPrompt(input.text);
  const prompt = `${SYSTEM_PROMPT}\n\n<사용자 입력>\n${safeText}\n</사용자 입력>`;

  let raw: string;
  try {
    raw = await input.client.generate(prompt);
  } catch (error) {
    return { verdict: 'caution', reason: `llm_error fallback: ${(error as Error).message ?? 'unknown'}` };
  }

  try {
    const parsed = JSON.parse(stripCodeFence(raw)) as { level?: string; reason?: string };
    if (parsed.level === 'critical' || parsed.level === 'caution' || parsed.level === 'none') {
      return { verdict: parsed.level, reason: parsed.reason ?? '' };
    }
    return { verdict: 'caution', reason: `unknown_level fallback: ${String(parsed.level)}` };
  } catch {
    return { verdict: 'caution', reason: 'parse_error fallback' };
  }
}

function stripCodeFence(text: string): string {
  return text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}
