import { describe, it, expect, vi } from 'vitest';
import { classifyWithLlm, type LlmClient } from '@/lib/safety/llm-classifier';

function makeFakeClient(response: string): LlmClient {
  return {
    generate: vi.fn().mockResolvedValue(response),
  };
}

describe('classifyWithLlm', () => {
  it('Gemini가 critical 반환 시 verdict=critical', async () => {
    const client = makeFakeClient(JSON.stringify({ level: 'critical', reason: '자살 의도 표명' }));
    const result = await classifyWithLlm({ text: '다 끝내고 싶어', client });
    expect(result.verdict).toBe('critical');
    expect(result.reason).toContain('자살');
  });

  it('Gemini가 none 반환 시 verdict=none', async () => {
    const client = makeFakeClient(JSON.stringify({ level: 'none', reason: '학업 스트레스 표현' }));
    const result = await classifyWithLlm({ text: '공부 포기하고 싶어', client });
    expect(result.verdict).toBe('none');
  });

  it('Gemini가 caution 반환 시 verdict=caution', async () => {
    const client = makeFakeClient(JSON.stringify({ level: 'caution', reason: '강한 절망' }));
    const result = await classifyWithLlm({ text: '더 이상 못 버티겠어', client });
    expect(result.verdict).toBe('caution');
  });

  it('Gemini가 JSON 파싱 실패 시 caution으로 fail-closed', async () => {
    const client = makeFakeClient('이건 JSON이 아닌 응답');
    const result = await classifyWithLlm({ text: '끝내고 싶어', client });
    expect(result.verdict).toBe('caution');
    expect(result.reason).toContain('fallback');
  });

  it('Gemini가 에러 throw 시 caution으로 fail-closed', async () => {
    const client: LlmClient = {
      generate: vi.fn().mockRejectedValue(new Error('timeout')),
    };
    const result = await classifyWithLlm({ text: '끝내고 싶어', client });
    expect(result.verdict).toBe('caution');
    expect(result.reason).toContain('fallback');
  });

  it('Gemini가 알 수 없는 level 반환 시 caution으로 fail-closed', async () => {
    const client = makeFakeClient(JSON.stringify({ level: 'unknown_value', reason: '?' }));
    const result = await classifyWithLlm({ text: '끝내고 싶어', client });
    expect(result.verdict).toBe('caution');
  });
});
