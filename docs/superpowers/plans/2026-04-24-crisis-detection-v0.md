# Crisis Detection v0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 사용자의 `trigger + thought`에 위기 신호(자살·자해 등)가 감지될 때 AI 분석을 중단하고, 판단·위로 없이 존재 인정 + 복수 자원 옵션을 제시하는 안전 모드로 전환한다.

**Architecture:** 2단계 하이브리드 감지 파이프라인. (1) 정규식 기반 경량 키워드 스크리너가 `/api/analyze` 초입에서 즉시 판정, (2) 모호한 경우 Gemini 2.5 Flash 분류기가 맥락 보고 재판정. 감지 시 분석 스킵 + Supabase `safety_events` 로깅 + 프론트는 `SafetyNotice` 컴포넌트로 자원 안내. 사용자는 "괜찮아요, 계속할래요"로 우회 가능하되 로그는 남는다.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Supabase, Gemini 2.5 Flash, Zod, Vitest (신규 도입).

**Scope boundaries (v0는 하지 않는 것):**
- 임상 가이드라인 수준 키워드 분류(전문가 리뷰는 v1로 미룸)
- 과거 로그 기반 위험 트렌드 분석
- 실시간 긴급 연결(단지 안내만)
- 미성년자 보호자 연결
- 다국어 지원(한국어만)

---

## File Structure

**신규 생성:**

| 파일 | 역할 |
|------|------|
| `lib/safety/types.ts` | `CrisisLevel`, `CrisisDetectionResult`, `SafetyResource` 타입 정의 |
| `lib/safety/resources.ts` | 한국 정신건강 자원 목록 (1393, 1577-0199, 1388 등) |
| `lib/safety/keyword-screener.ts` | 1차 정규식 스크리너 (재현율 우선) |
| `lib/safety/llm-classifier.ts` | 2차 Gemini 맥락 분류기 |
| `lib/safety/detect.ts` | 파이프라인 오케스트레이터 |
| `components/safety/SafetyNotice.tsx` | 안전 모드 UI |
| `app/safety/resources/page.tsx` | 상세 자원 페이지 (공개) |
| `supabase/migrations/03_safety_events.sql` | 감지 이벤트 테이블 + RLS |
| `vitest.config.ts` | Vitest 설정 |
| `tests/safety/keyword-screener.test.ts` | 스크리너 단위 테스트 |
| `tests/safety/detect.test.ts` | 파이프라인 통합 테스트 |
| `tests/setup.ts` | 테스트 글로벌 셋업 |

**수정:**

| 파일 | 변경 범위 |
|------|----------|
| `package.json` | devDependencies: `vitest`, `@vitest/ui`, `tsx` 추가 + `test` 스크립트 |
| `app/api/analyze/route.ts:54` 직후 | 감지 hook 추가 (logData 조회 후, Gemini 호출 전) |
| `app/analyze/[id]/page.tsx` | safety 응답 처리 로직 |
| `proxy.ts:34` | `/safety/resources`는 공개 경로로 허용 |
| `types/index.ts` | `CrisisLevel` re-export (선택) |

**설계 원칙:**
- **Fail closed**: Gemini 실패·타임아웃 시 `caution`으로 낮춤 (critical까진 올리지 않음 — false positive 최소화)
- **Regex critical = 즉시 반영**: 정규식 critical은 LLM 재확인 생략, false positive는 "계속할래요" 버튼으로 사용자 우회
- **Suspected만 LLM 경유**: 비용/latency 최소화
- **의존성 주입**: Gemini 클라이언트는 함수 인자로 주입 → 테스트 가능성 확보

---

## Pipeline Contract

```
detect({ trigger, thought })
   │
   ├─ keywordScreener({ text })
   │     └─ 'critical' | 'suspected' | 'none'
   │
   ├─ critical → CrisisDetectionResult { level: 'critical', detectedBy: 'keyword' }
   ├─ none     → CrisisDetectionResult { level: 'none' }
   └─ suspected
         │
         └─ llmClassifier({ text }) (fail-closed on error → 'caution')
               ├─ 'critical' → result { level: 'critical', detectedBy: 'llm' }
               ├─ 'caution'  → result { level: 'caution',  detectedBy: 'llm' }
               └─ 'none'     → result { level: 'none',     detectedBy: 'llm' }
```

`CrisisLevel` 의미:
- `critical`: 자살/자해 명시적 의도 — 분석 완전 차단, Safety Dialog 모달
- `caution`: 강한 절망·고통 신호 있으나 명시적 위험 불분명 — 부드러운 안내 + "계속할래요" 우회 허용
- `none`: 일반 진행

---

## Task 0: Vitest 인프라 도입

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Create: `tests/sanity.test.ts` (검증용 임시 파일, Task 3 직전 삭제)

- [ ] **Step 1: devDependencies 추가**

`package.json`의 `devDependencies`에 아래 3개 추가:

```json
    "vitest": "^2.1.9",
    "@vitest/ui": "^2.1.9",
    "tsx": "^4.20.3"
```

그리고 `scripts`에 아래 2개 추가:

```json
    "test": "vitest run",
    "test:watch": "vitest"
```

설치 명령:

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npm install
```

- [ ] **Step 2: Vitest 설정 작성**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['lib/safety/**/*.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Step 3: 테스트 글로벌 셋업**

Create `tests/setup.ts`:

```ts
// Vitest globals (describe, it, expect, vi) are enabled via config.
// 환경변수 기본값. 실제 Gemini 호출은 각 테스트에서 vi.mock으로 차단.
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? 'test-gemini-key';
```

- [ ] **Step 4: Sanity 테스트 작성**

Create `tests/sanity.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('vitest sanity', () => {
  it('runs basic assertions', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: 테스트 실행 확인**

Run: `npm test`

Expected output:
```
✓ tests/sanity.test.ts (1)
  ✓ vitest sanity (1)
    ✓ runs basic assertions

Test Files  1 passed (1)
     Tests  1 passed (1)
```

- [ ] **Step 6: Commit**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && git add package.json package-lock.json vitest.config.ts tests/setup.ts tests/sanity.test.ts && git commit -m "chore: introduce vitest for safety module tests"
```

---

## Task 1: Safety 타입 정의

**Files:**
- Create: `lib/safety/types.ts`

- [ ] **Step 1: 타입 파일 작성**

Create `lib/safety/types.ts`:

```ts
export type CrisisLevel = 'none' | 'caution' | 'critical';

export type KeywordVerdict = 'none' | 'suspected' | 'critical';

export type LlmVerdict = 'none' | 'caution' | 'critical';

export type DetectionSource = 'keyword' | 'llm' | 'llm_fallback';

export interface CrisisDetectionResult {
  level: CrisisLevel;
  detectedBy: DetectionSource | null; // null when level === 'none' and skipped via keyword
  matchedPattern?: string; // regex label for keyword hits (debugging)
  llmReason?: string; // short rationale from llm when used
}

export interface SafetyResource {
  id: string;
  name: string;
  phone?: string;
  sms?: string;
  webUrl?: string;
  description: string;
  availability: string; // '24시간' 등
  tags: Array<'suicide' | 'youth' | 'women' | 'general' | 'sms'>;
}
```

- [ ] **Step 2: 타입체크**

Run: `cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npm run lint`

Expected: 에러 없음 (exit 0).

- [ ] **Step 3: Commit**

```bash
git add lib/safety/types.ts && git commit -m "feat(safety): add core types for crisis detection"
```

---

## Task 2: 정신건강 자원 목록

**Files:**
- Create: `lib/safety/resources.ts`

- [ ] **Step 1: 자원 목록 작성**

Create `lib/safety/resources.ts`:

```ts
import type { SafetyResource } from './types';

/**
 * 한국 내 공인 정신건강·위기 상담 자원.
 * 번호는 2026-04 기준. 매년 검증 필요.
 */
export const SAFETY_RESOURCES: SafetyResource[] = [
  {
    id: 'suicide-prevention-1393',
    name: '자살예방상담전화',
    phone: '1393',
    description: '자살 위기에 있는 분과 가족·지인 모두 이용 가능한 전문 상담',
    availability: '24시간',
    tags: ['suicide', 'general'],
  },
  {
    id: 'mental-health-1577-0199',
    name: '정신건강위기상담',
    phone: '1577-0199',
    description: '정신건강복지센터 연계 24시간 상담',
    availability: '24시간',
    tags: ['general'],
  },
  {
    id: 'youth-1388',
    name: '청소년전화',
    phone: '1388',
    webUrl: 'https://www.cyber1388.kr',
    description: '청소년 위기·정서 상담, 온라인 채팅 상담 병행',
    availability: '24시간',
    tags: ['youth', 'suicide', 'sms'],
  },
  {
    id: 'women-1366',
    name: '여성긴급전화',
    phone: '1366',
    description: '폭력·위기 상황 여성 상담',
    availability: '24시간',
    tags: ['women'],
  },
  {
    id: 'life-line-sms',
    name: '생명의전화 문자상담',
    sms: '1588-9191',
    webUrl: 'https://www.lifeline.or.kr',
    description: '전화 통화가 어려울 때 문자/온라인 상담',
    availability: '10:00~22:00',
    tags: ['suicide', 'sms'],
  },
];

export function getCriticalResources(): SafetyResource[] {
  return SAFETY_RESOURCES.filter((r) => r.tags.includes('suicide') || r.tags.includes('general'));
}
```

- [ ] **Step 2: 타입체크**

Run: `npm run lint`

Expected: 에러 없음.

- [ ] **Step 3: Commit**

```bash
git add lib/safety/resources.ts && git commit -m "feat(safety): add Korean mental health resource registry"
```

---

## Task 3: Keyword Screener TDD

**Files:**
- Create: `tests/safety/keyword-screener.test.ts`
- Create: `lib/safety/keyword-screener.ts`

- [ ] **Step 1: Sanity 테스트 제거**

```bash
rm tests/sanity.test.ts
```

- [ ] **Step 2: 실패 테스트 #1 작성 — 명시적 자살 표현 → critical**

Create `tests/safety/keyword-screener.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { screenKeywords } from '@/lib/safety/keyword-screener';

describe('screenKeywords - critical 판정', () => {
  it('"죽고 싶어" 표현은 critical', () => {
    const result = screenKeywords('요즘 너무 힘들어서 죽고 싶어');
    expect(result.verdict).toBe('critical');
    expect(result.matchedPattern).toBeDefined();
  });

  it('"자살" 단어 포함은 critical', () => {
    const result = screenKeywords('자살 생각이 멈추질 않아');
    expect(result.verdict).toBe('critical');
  });

  it('"자해했어" 표현은 critical', () => {
    const result = screenKeywords('어제 자해했어. 아직도 아프다');
    expect(result.verdict).toBe('critical');
  });
});
```

- [ ] **Step 3: 테스트 실행 → 실패 확인**

Run: `npm test`

Expected: `Failed to resolve import "@/lib/safety/keyword-screener"` — 파일 없음.

- [ ] **Step 4: Keyword screener 최소 구현**

Create `lib/safety/keyword-screener.ts`:

```ts
import type { KeywordVerdict } from './types';

export interface KeywordScreenResult {
  verdict: KeywordVerdict;
  matchedPattern?: string;
}

interface Pattern {
  label: string;
  regex: RegExp;
}

const CRITICAL_PATTERNS: Pattern[] = [
  { label: 'suicide_direct', regex: /죽\s*(고|어\s*버리고|고\s*만)\s*싶/ },
  { label: 'suicide_word', regex: /자살/ },
  { label: 'self_harm_word', regex: /자해/ },
];

export function screenKeywords(text: string): KeywordScreenResult {
  const normalized = text.trim();
  for (const p of CRITICAL_PATTERNS) {
    if (p.regex.test(normalized)) {
      return { verdict: 'critical', matchedPattern: p.label };
    }
  }
  return { verdict: 'none' };
}
```

- [ ] **Step 5: 테스트 실행 → 통과 확인**

Run: `npm test -- keyword-screener`

Expected: 3 tests pass.

- [ ] **Step 6: 실패 테스트 #2 작성 — suspected 케이스**

Append to `tests/safety/keyword-screener.test.ts`:

```ts
describe('screenKeywords - suspected 판정', () => {
  it('"사라지고 싶어" 표현은 suspected', () => {
    const result = screenKeywords('그냥 사라지고 싶어');
    expect(result.verdict).toBe('suspected');
  });

  it('"더 이상 못 버티겠어" 표현은 suspected', () => {
    const result = screenKeywords('더 이상 못 버티겠어');
    expect(result.verdict).toBe('suspected');
  });

  it('"끝내고 싶다" 표현은 suspected', () => {
    const result = screenKeywords('다 끝내고 싶다');
    expect(result.verdict).toBe('suspected');
  });
});
```

- [ ] **Step 7: 테스트 실행 → 실패 확인**

Run: `npm test -- keyword-screener`

Expected: 3 pass, 3 fail (suspected 케이스가 none 반환).

- [ ] **Step 8: Suspected 패턴 추가 구현**

Edit `lib/safety/keyword-screener.ts` — `CRITICAL_PATTERNS` 아래에 `SUSPECTED_PATTERNS` 추가하고 함수를 확장:

```ts
const SUSPECTED_PATTERNS: Pattern[] = [
  { label: 'disappear_wish', regex: /사라지\s*(고|고만)\s*싶/ },
  { label: 'end_it_wish', regex: /(다|이제\s*그만)?\s*끝내\s*(고|고만)\s*싶/ },
  { label: 'cant_hold_on', regex: /더\s*(이상|는)?\s*못\s*(버티|견디|하)/ },
  { label: 'give_up', regex: /포기\s*(하고|하겠)/ },
  { label: 'exhausted', regex: /(너무)?\s*지쳤/ },
];

export function screenKeywords(text: string): KeywordScreenResult {
  const normalized = text.trim();
  for (const p of CRITICAL_PATTERNS) {
    if (p.regex.test(normalized)) {
      return { verdict: 'critical', matchedPattern: p.label };
    }
  }
  for (const p of SUSPECTED_PATTERNS) {
    if (p.regex.test(normalized)) {
      return { verdict: 'suspected', matchedPattern: p.label };
    }
  }
  return { verdict: 'none' };
}
```

- [ ] **Step 9: 테스트 실행 → 통과 확인**

Run: `npm test -- keyword-screener`

Expected: 6 tests pass.

- [ ] **Step 10: 실패 테스트 #3 — 관용 표현 / false positive 기대치**

Append to `tests/safety/keyword-screener.test.ts`:

```ts
describe('screenKeywords - 정상 표현', () => {
  it('일반 감정 표현은 none', () => {
    const result = screenKeywords('오늘 회의에서 실수해서 너무 창피했어');
    expect(result.verdict).toBe('none');
  });

  it('의문형 "힘들다"는 none', () => {
    const result = screenKeywords('이번 주는 정말 힘들다');
    expect(result.verdict).toBe('none');
  });

  it('빈 문자열은 none', () => {
    const result = screenKeywords('');
    expect(result.verdict).toBe('none');
  });

  // v0에서는 "죽겠다" 관용 표현도 보수적으로 suspected 이상으로 분류하지 않는다.
  // 실제 critical 정규식은 "죽고 싶" 형태에만 매칭되므로 "죽겠다"는 걸리지 않아야 한다.
  it('"배고파 죽겠다" 관용 표현은 none', () => {
    const result = screenKeywords('배고파 죽겠다');
    expect(result.verdict).toBe('none');
  });

  it('"웃겨 죽는 줄" 관용 표현은 none', () => {
    const result = screenKeywords('친구가 너무 웃겨서 죽는 줄 알았다');
    expect(result.verdict).toBe('none');
  });
});
```

- [ ] **Step 11: 테스트 실행 → 통과 확인**

Run: `npm test -- keyword-screener`

Expected: 11 tests pass. (현재 정규식은 "죽고 싶"에만 매칭되므로 "죽겠다/죽는 줄"은 자연스럽게 통과)

만약 실패한다면 `CRITICAL_PATTERNS`의 `suicide_direct` 정규식이 광범위하게 매칭 중이라는 뜻. `/죽\s*(고|어\s*버리고|고\s*만)\s*싶/` 패턴인지 재확인.

- [ ] **Step 12: Commit**

```bash
git add tests/safety/keyword-screener.test.ts lib/safety/keyword-screener.ts && git commit -m "feat(safety): keyword screener with critical/suspected/none verdict"
```

---

## Task 4: LLM Classifier (의존성 주입 + 목)

**Files:**
- Create: `lib/safety/llm-classifier.ts`
- Create: `tests/safety/llm-classifier.test.ts`

**설계 주의:** Gemini 클라이언트는 함수 인자로 주입. 실제 호출은 `app/api/analyze/route.ts`에서만. 테스트에선 fake classifier로 대체.

- [ ] **Step 1: 실패 테스트 작성**

Create `tests/safety/llm-classifier.test.ts`:

```ts
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
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npm test -- llm-classifier`

Expected: `Failed to resolve import "@/lib/safety/llm-classifier"`.

- [ ] **Step 3: LLM classifier 구현**

Create `lib/safety/llm-classifier.ts`:

```ts
import type { LlmVerdict } from './types';

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
  const prompt = `${SYSTEM_PROMPT}\n\n<사용자 입력>\n${input.text}\n</사용자 입력>`;

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
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

Run: `npm test -- llm-classifier`

Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add tests/safety/llm-classifier.test.ts lib/safety/llm-classifier.ts && git commit -m "feat(safety): llm classifier with fail-closed fallback"
```

---

## Task 5: 파이프라인 오케스트레이터 (detect.ts)

**Files:**
- Create: `lib/safety/detect.ts`
- Create: `tests/safety/detect.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

Create `tests/safety/detect.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { detect } from '@/lib/safety/detect';
import type { LlmClient } from '@/lib/safety/llm-classifier';

function makeClient(response: string): LlmClient {
  return { generate: vi.fn().mockResolvedValue(response) };
}

describe('detect - keyword critical 즉시 반영', () => {
  it('"자살" 입력은 LLM 호출 없이 critical', async () => {
    const client = makeClient('이 응답은 사용되면 안 됨');
    const result = await detect({ trigger: '', thought: '자살 생각이 든다', client });
    expect(result.level).toBe('critical');
    expect(result.detectedBy).toBe('keyword');
    expect(client.generate).not.toHaveBeenCalled();
  });
});

describe('detect - keyword none 즉시 반영', () => {
  it('평온한 입력은 LLM 호출 없이 none', async () => {
    const client = makeClient('이 응답은 사용되면 안 됨');
    const result = await detect({ trigger: '회의 시작', thought: '긴장되지만 잘 준비했다', client });
    expect(result.level).toBe('none');
    expect(result.detectedBy).toBeNull();
    expect(client.generate).not.toHaveBeenCalled();
  });
});

describe('detect - suspected → LLM 재분류', () => {
  it('suspected 키워드는 LLM이 critical 판정 시 critical', async () => {
    const client = makeClient(JSON.stringify({ level: 'critical', reason: '절망 + 구체적 의도' }));
    const result = await detect({ trigger: '', thought: '다 끝내고 싶다', client });
    expect(result.level).toBe('critical');
    expect(result.detectedBy).toBe('llm');
    expect(client.generate).toHaveBeenCalledOnce();
  });

  it('suspected 키워드는 LLM이 none 판정 시 none', async () => {
    const client = makeClient(JSON.stringify({ level: 'none', reason: '학업 피로' }));
    const result = await detect({ trigger: '', thought: '공부 포기하고 싶다' , client });
    expect(result.level).toBe('none');
    expect(result.detectedBy).toBe('llm');
  });

  it('suspected 키워드는 LLM이 caution 판정 시 caution', async () => {
    const client = makeClient(JSON.stringify({ level: 'caution', reason: '강한 소진' }));
    const result = await detect({ trigger: '', thought: '너무 지쳤다', client });
    expect(result.level).toBe('caution');
    expect(result.detectedBy).toBe('llm');
  });

  it('LLM 에러 시 caution으로 fail-closed + detectedBy=llm_fallback', async () => {
    const client: LlmClient = { generate: vi.fn().mockRejectedValue(new Error('timeout')) };
    const result = await detect({ trigger: '', thought: '너무 지쳤다', client });
    expect(result.level).toBe('caution');
    expect(result.detectedBy).toBe('llm_fallback');
  });
});

describe('detect - trigger + thought 결합', () => {
  it('trigger에만 위험 표현이 있어도 감지', async () => {
    const client = makeClient('unused');
    const result = await detect({ trigger: '자해한 다음 날', thought: '괜찮을지 모르겠어', client });
    expect(result.level).toBe('critical');
    expect(result.detectedBy).toBe('keyword');
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npm test -- detect`

Expected: `Failed to resolve import "@/lib/safety/detect"`.

- [ ] **Step 3: detect.ts 구현**

Create `lib/safety/detect.ts`:

```ts
import { screenKeywords } from './keyword-screener';
import { classifyWithLlm, type LlmClient } from './llm-classifier';
import type { CrisisDetectionResult } from './types';

export interface DetectInput {
  trigger: string;
  thought: string;
  client: LlmClient;
}

export async function detect(input: DetectInput): Promise<CrisisDetectionResult> {
  const combined = `${input.trigger}\n${input.thought}`.trim();

  const keyword = screenKeywords(combined);

  if (keyword.verdict === 'critical') {
    return {
      level: 'critical',
      detectedBy: 'keyword',
      matchedPattern: keyword.matchedPattern,
    };
  }

  if (keyword.verdict === 'none') {
    return { level: 'none', detectedBy: null };
  }

  // suspected → LLM 재분류
  const llm = await classifyWithLlm({ text: combined, client: input.client });

  const isFallback = llm.reason.includes('fallback');

  return {
    level: llm.verdict,
    detectedBy: isFallback ? 'llm_fallback' : 'llm',
    matchedPattern: keyword.matchedPattern,
    llmReason: llm.reason,
  };
}
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

Run: `npm test -- detect`

Expected: 7 tests pass.

- [ ] **Step 5: 전체 테스트 실행**

Run: `npm test`

Expected: keyword-screener 11 + llm-classifier 6 + detect 7 = 24 pass.

- [ ] **Step 6: Commit**

```bash
git add tests/safety/detect.test.ts lib/safety/detect.ts && git commit -m "feat(safety): detect pipeline orchestrator (keyword + llm)"
```

---

## Task 6: Supabase 마이그레이션 (safety_events)

**Files:**
- Create: `supabase/migrations/03_safety_events.sql`

- [ ] **Step 1: 마이그레이션 SQL 작성**

Create `supabase/migrations/03_safety_events.sql`:

```sql
-- 위기 감지 이벤트 로그.
-- 운영 검증, 오탐률 분석, 사용자가 "계속할래요"로 우회한 케이스 추적용.

CREATE TABLE IF NOT EXISTS safety_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_id UUID REFERENCES logs(id) ON DELETE SET NULL,
  level TEXT NOT NULL CHECK (level IN ('caution', 'critical')),
  detected_by TEXT NOT NULL CHECK (detected_by IN ('keyword', 'llm', 'llm_fallback')),
  matched_pattern TEXT,
  llm_reason TEXT,
  user_override BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safety_events_user_id ON safety_events(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_events_created_at ON safety_events(created_at DESC);

ALTER TABLE safety_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "safety_events_select_own" ON safety_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "safety_events_insert_own" ON safety_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE는 user_override 필드에 한정. 단순화를 위해 row 전체 UPDATE 허용하되 RLS로 user_id 고정.
CREATE POLICY "safety_events_update_own" ON safety_events
  FOR UPDATE USING (auth.uid() = user_id);
```

- [ ] **Step 2: 로컬/스테이징 Supabase에 마이그레이션 적용 (수동)**

사용자가 Supabase 대시보드 SQL Editor에서 위 파일 내용을 실행하거나, 로컬 supabase CLI 사용 시:

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && supabase db push
```

검증: Supabase 대시보드 Table Editor에서 `safety_events` 테이블 존재 확인.

**주의:** 이 단계는 외부 서비스 변경이므로 유저 승인 후 실행. 플랜 실행자는 사용자에게 "마이그레이션 SQL을 Supabase에 적용했습니까?"라고 확인 요청.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/03_safety_events.sql && git commit -m "feat(safety): add safety_events table with rls"
```

---

## Task 7: Gemini 클라이언트 어댑터

**Files:**
- Create: `lib/safety/gemini-adapter.ts`

**목적:** `detect()`에 넣을 `LlmClient` 구현체를 Gemini 2.5 Flash로 실체화. 기존 `lib/openai/gemini.ts`의 `getGeminiClient`를 재활용하되 safety 전용 모델 설정.

- [ ] **Step 1: 기존 Gemini 클라이언트 접근자 확인**

Read: `/Users/dongseob/Desktop/Project-BlueBird-mvp/lib/openai/gemini.ts` lines 1-50

기존 파일에서 `getGeminiClient()` 함수와 모델 초기화 패턴을 확인한다. 만약 `getGeminiClient`가 `export`되어 있지 않다면 Step 2 전에 해당 함수에 `export` 키워드 추가.

- [ ] **Step 2: Gemini adapter 작성**

Create `lib/safety/gemini-adapter.ts`:

```ts
import { SchemaType } from '@google/generative-ai';
import { getGeminiClient } from '@/lib/openai/gemini';
import type { LlmClient } from './llm-classifier';

const SAFETY_RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    level: { type: SchemaType.STRING },
    reason: { type: SchemaType.STRING },
  },
  required: ['level', 'reason'],
};

export function createSafetyLlmClient(): LlmClient {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.0,
      topP: 0.9,
      maxOutputTokens: 256,
      responseMimeType: 'application/json',
      responseSchema: SAFETY_RESPONSE_SCHEMA,
    },
  });

  return {
    async generate(prompt: string) {
      const result = await model.generateContent(prompt);
      return result.response.text();
    },
  };
}
```

- [ ] **Step 3: `getGeminiClient` export 확인 (수정 필요 시)**

`lib/openai/gemini.ts`에서 `getGeminiClient` 함수 선언부가 `export function getGeminiClient()` 형태인지 확인. 아니면 `export` 키워드를 추가:

```ts
// Before
function getGeminiClient() { ... }

// After
export function getGeminiClient() { ... }
```

- [ ] **Step 4: 타입체크**

Run: `npm run lint`

Expected: 에러 없음.

- [ ] **Step 5: Commit**

```bash
git add lib/safety/gemini-adapter.ts lib/openai/gemini.ts && git commit -m "feat(safety): gemini 2.5 flash adapter for safety classifier"
```

---

## Task 8: `/api/analyze` Hook 통합

**Files:**
- Modify: `app/api/analyze/route.ts`

- [ ] **Step 1: 현재 라우트 구조 재확인**

Read: `/Users/dongseob/Desktop/Project-BlueBird-mvp/app/api/analyze/route.ts` lines 80-100

확인 포인트: `logData` 조회 직후(라인 86 이후), `isAiInputTooLong` 체크 다음, 캐시 조회 전에 감지 훅을 삽입한다.

- [ ] **Step 2: import 추가**

Edit `app/api/analyze/route.ts` — 기존 import 블록에 추가:

```ts
import { detect } from '@/lib/safety/detect';
import { createSafetyLlmClient } from '@/lib/safety/gemini-adapter';
```

- [ ] **Step 3: 감지 훅 삽입**

Edit `app/api/analyze/route.ts` — `isAiInputTooLong` 체크 블록(현재 라인 91-96) 직후, `existingRows` 조회(현재 라인 98) 직전에 다음 블록을 삽입:

```ts
    // ── 위기 감지 훅 ──
    // 캐시 조회보다 먼저 실행. 캐시된 분석이 있어도 현재 입력이 위험하면 재분석 차단.
    const safetyResult = await detect({
      trigger: logData.trigger,
      thought: logData.thought,
      client: createSafetyLlmClient(),
    });

    if (safetyResult.level !== 'none') {
      // safety_events 기록 (실패해도 safety 응답은 반환)
      const { error: safetyLogError } = await supabase.from('safety_events').insert({
        user_id: user.id,
        log_id: logId,
        level: safetyResult.level,
        detected_by: safetyResult.detectedBy ?? 'keyword',
        matched_pattern: safetyResult.matchedPattern ?? null,
        llm_reason: safetyResult.llmReason ?? null,
        user_override: false,
      });
      if (safetyLogError) {
        console.error('safety_events insert 실패:', safetyLogError);
      }

      return NextResponse.json(
        {
          safety: {
            level: safetyResult.level,
            detectedBy: safetyResult.detectedBy,
          },
        },
        { status: 200 }
      );
    }
    // ── /위기 감지 훅 ──
```

- [ ] **Step 4: 타입체크**

Run: `npm run lint`

Expected: 에러 없음.

- [ ] **Step 5: 수동 스모크 테스트**

로컬 dev 서버 기동:

```bash
npm run dev
```

브라우저에서:
1. 로그인
2. `/log`에서 trigger="회의", thought="죽고 싶어" 입력 후 저장
3. 자동 이동된 `/analyze/[id]`에서 Network 탭 열고 `POST /api/analyze` 응답 확인
4. 예상 응답: `{ "safety": { "level": "critical", "detectedBy": "keyword" } }`, status 200
5. Supabase 대시보드에서 `safety_events` 테이블에 row 1개 추가 확인

"배고파 죽겠다" 같은 관용 표현으로 동일 테스트 → `safety` 필드 없이 정상 분석 흐름 기대.

- [ ] **Step 6: Commit**

```bash
git add app/api/analyze/route.ts && git commit -m "feat(safety): wire crisis detection into /api/analyze"
```

---

## Task 9: SafetyNotice 컴포넌트

**Files:**
- Create: `components/safety/SafetyNotice.tsx`

**UI 원칙 (임상 가이드 반영):**
- 판단·위로 문구 금지 ("괜찮아질 거예요" ❌)
- 존재 인정 ("말씀해주셔서 고맙습니다")
- 복수 옵션 제시 (전화만이 아님 — 문자, 웹)
- 자율성 보장 ("계속할래요" 허용)
- critical은 모달성, caution은 인라인 배너성

- [ ] **Step 1: 컴포넌트 작성**

Create `components/safety/SafetyNotice.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SAFETY_RESOURCES, getCriticalResources } from '@/lib/safety/resources';
import type { CrisisLevel } from '@/lib/safety/types';

interface SafetyNoticeProps {
  level: Exclude<CrisisLevel, 'none'>;
  onOverride: () => void; // "계속할래요" 콜백
}

export function SafetyNotice({ level, onOverride }: SafetyNoticeProps) {
  const [confirmingOverride, setConfirmingOverride] = useState(false);
  const resources = level === 'critical' ? getCriticalResources() : SAFETY_RESOURCES;

  const headline =
    level === 'critical'
      ? '지금 이야기해주신 내용이 걱정됩니다'
      : '지금 많이 지쳐 있는 것 같아요';

  const body =
    level === 'critical'
      ? '말씀해주셔서 고맙습니다. 지금 이 순간 함께할 수 있는 자원을 먼저 안내드릴게요. 어떤 선택이든 괜찮습니다.'
      : '분석을 잠시 멈출게요. 먼저 쉬어가는 것도 방법이고, 필요하면 아래 자원을 이용하실 수 있어요.';

  return (
    <section
      role="alert"
      aria-live="assertive"
      className="rounded-2xl border border-rose-200 bg-rose-50 p-6 space-y-4"
    >
      <header>
        <h2 className="text-lg font-semibold text-rose-900">{headline}</h2>
        <p className="mt-2 text-sm text-rose-800">{body}</p>
      </header>

      <ul className="space-y-3">
        {resources.map((r) => (
          <li key={r.id} className="rounded-xl bg-white p-4 border border-rose-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-gray-900">{r.name}</p>
                <p className="text-xs text-gray-600 mt-1">{r.description}</p>
                <p className="text-xs text-gray-500 mt-1">운영시간: {r.availability}</p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                {r.phone && (
                  <a
                    href={`tel:${r.phone}`}
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white text-center"
                  >
                    전화 {r.phone}
                  </a>
                )}
                {r.sms && (
                  <a
                    href={`sms:${r.sms}`}
                    className="rounded-lg border border-rose-300 px-3 py-1.5 text-sm text-rose-700 text-center"
                  >
                    문자 {r.sms}
                  </a>
                )}
                {r.webUrl && (
                  <a
                    href={r.webUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-rose-300 px-3 py-1.5 text-sm text-rose-700 text-center"
                  >
                    웹 상담
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="pt-2 space-y-2">
        <Link
          href="/safety/resources"
          className="block text-center text-sm text-rose-700 underline"
        >
          더 많은 자원 보기
        </Link>

        {confirmingOverride ? (
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm space-y-2">
            <p className="text-gray-700">정말 분석을 계속하시겠어요? 언제든 돌아와도 괜찮습니다.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onOverride}
                className="flex-1 rounded-lg bg-gray-900 py-2 text-sm text-white"
              >
                네, 계속할래요
              </button>
              <button
                type="button"
                onClick={() => setConfirmingOverride(false)}
                className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-700"
              >
                조금 더 있을래요
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingOverride(true)}
            className="block w-full rounded-lg border border-gray-300 bg-white py-2 text-sm text-gray-700"
          >
            괜찮아요, 계속할래요
          </button>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: 타입체크**

Run: `npm run lint`

Expected: 에러 없음.

- [ ] **Step 3: Commit**

```bash
git add components/safety/SafetyNotice.tsx && git commit -m "feat(safety): add SafetyNotice component with resource list and override"
```

---

## Task 10: `/safety/resources` 공개 페이지

**Files:**
- Create: `app/safety/resources/page.tsx`
- Modify: `proxy.ts`

- [ ] **Step 1: 현재 인증 보호 경로 확인**

Read: `/Users/dongseob/Desktop/Project-BlueBird-mvp/proxy.ts` lines 30-50

`PROTECTED_PATHS` 배열에 `/safety/resources`가 포함되어 있지 않은지 확인한다. 포함돼 있다면 제외.

- [ ] **Step 2: 리소스 페이지 작성**

Create `app/safety/resources/page.tsx`:

```tsx
import Link from 'next/link';
import { SAFETY_RESOURCES } from '@/lib/safety/resources';

export const metadata = {
  title: '정신건강 자원 | BlueBird',
  description: '대한민국 내 정신건강·위기 상담 전화 및 온라인 자원 모음',
};

export default function SafetyResourcesPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">정신건강 자원</h1>
        <p className="text-sm text-gray-600">
          지금 어려우시다면 아래 자원을 이용하실 수 있어요. 전화가 부담스러우시면 문자 상담이나 온라인
          상담도 가능합니다.
        </p>
        <p className="text-xs text-gray-500">
          BlueBird는 의료 서비스가 아닙니다. 지속적이거나 심각한 어려움은 전문가의 도움을
          받으시기를 권해드립니다.
        </p>
      </header>

      <ul className="space-y-4">
        {SAFETY_RESOURCES.map((r) => (
          <li key={r.id} className="rounded-2xl border border-gray-200 bg-white p-5 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h2 className="font-semibold text-gray-900">{r.name}</h2>
                <p className="text-sm text-gray-700">{r.description}</p>
                <p className="text-xs text-gray-500">{r.availability}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {r.phone && (
                <a
                  href={`tel:${r.phone}`}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white"
                >
                  전화 {r.phone}
                </a>
              )}
              {r.sms && (
                <a
                  href={`sms:${r.sms}`}
                  className="rounded-lg border border-rose-300 px-3 py-1.5 text-sm text-rose-700"
                >
                  문자 {r.sms}
                </a>
              )}
              {r.webUrl && (
                <a
                  href={r.webUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
                >
                  웹 상담 →
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      <footer className="pt-4 text-center">
        <Link href="/" className="text-sm text-gray-500 underline">
          홈으로
        </Link>
      </footer>
    </main>
  );
}
```

- [ ] **Step 3: proxy.ts에 공개 경로 예외 확인**

Read: `/Users/dongseob/Desktop/Project-BlueBird-mvp/proxy.ts` 전체

현재 구조에서 `/safety/resources`는 `/dashboard`, `/log` 등 보호 패턴에 매칭되지 않아 기본적으로 공개다. 만약 fallback으로 모든 경로가 보호된다면 `PROTECTED_PATHS` 반대로 `PUBLIC_PATHS` 배열을 사용 중인지 확인.

Proxy 코드에 명시적 `/safety` 처리가 없다면 수정 불필요. 있다면 공개 쪽으로 분류.

- [ ] **Step 4: 수동 검증**

dev 서버 기동 후 **비로그인** 상태 브라우저에서 `http://localhost:3000/safety/resources` 접근 → 페이지 정상 렌더링, `/auth/login` 리다이렉트 없음.

- [ ] **Step 5: Commit**

```bash
git add app/safety/resources/page.tsx proxy.ts && git commit -m "feat(safety): public /safety/resources page"
```

---

## Task 11: `/analyze/[id]` 페이지 safety 응답 처리

**Files:**
- Modify: `app/analyze/[id]/page.tsx`

- [ ] **Step 1: 현재 analyze 페이지의 API 호출부 확인**

Read: `/Users/dongseob/Desktop/Project-BlueBird-mvp/app/analyze/[id]/page.tsx` lines 1-80

확인할 점:
- `POST /api/analyze` 호출이 어디에 있는지 (useEffect, useState 패턴)
- 응답을 어떻게 파싱하는지
- 에러 핸들링 방식

- [ ] **Step 2: state 및 SafetyNotice import 추가**

Edit `app/analyze/[id]/page.tsx` — 상단 import 추가:

```tsx
import { SafetyNotice } from '@/components/safety/SafetyNotice';
import type { CrisisLevel } from '@/lib/safety/types';
```

그리고 컴포넌트 상태에 safety state 추가 (useState 묶음 안에):

```tsx
const [safetyLevel, setSafetyLevel] = useState<Exclude<CrisisLevel, 'none'> | null>(null);
const [safetyOverride, setSafetyOverride] = useState(false);
```

- [ ] **Step 3: `/api/analyze` 응답 처리 로직 수정**

기존 `fetch('/api/analyze', ...)` 응답 처리 블록에서, 응답 JSON에 `safety` 필드가 있는지 먼저 검사하도록 변경:

```tsx
const res = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ logId }),
});
const data = await res.json();

if (data.safety && !safetyOverride) {
  setSafetyLevel(data.safety.level);
  // 분석 흐름 중단: 기존 setState들 건너뜀
  return;
}

// 기존 분석 결과 처리 로직 (distortions, questions 등) 계속
```

정확한 삽입 지점은 Step 1에서 확인한 실제 코드 구조에 맞춘다. 핵심 불변: **`data.safety`가 있고 사용자가 아직 override하지 않았다면 분석 진행 중단**.

- [ ] **Step 4: override 핸들러 작성**

컴포넌트 바디 안에 추가:

```tsx
async function handleOverride() {
  setSafetyOverride(true);
  setSafetyLevel(null);

  // safety_events에 user_override=true 기록 후 분석 재호출
  await fetch('/api/safety/override', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ logId }),
  }).catch(() => {
    // override 기록 실패해도 분석 진행 허용
  });

  // 분석 재시작: 기존 analyze 트리거 함수 재호출
  await startAnalysis(); // 함수명은 실제 코드에 맞춤
}
```

**주의:** `startAnalysis`는 기존 페이지에 이미 존재하는 분석 트리거 함수. 없다면 useEffect에서 쓰는 로직을 함수로 분리 후 재사용. 함수명·시그니처는 Step 1 확인 결과에 맞춘다.

- [ ] **Step 5: 렌더링 분기 추가**

기존 JSX 최상단에 safety 렌더링 분기 추가:

```tsx
if (safetyLevel) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <SafetyNotice level={safetyLevel} onOverride={handleOverride} />
    </main>
  );
}

// 기존 JSX 계속
```

- [ ] **Step 6: `/api/safety/override` 엔드포인트 신설**

Create `app/api/safety/override/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const schema = z.object({ logId: z.string().uuid() });

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { logId?: string };
    const parsed = schema.safeParse({ logId: body.logId?.trim() });
    if (!parsed.success) {
      return NextResponse.json({ error: '유효한 logId가 필요합니다.' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { error } = await supabase
      .from('safety_events')
      .update({ user_override: true })
      .eq('user_id', user.id)
      .eq('log_id', parsed.data.logId);

    if (error) {
      return NextResponse.json({ error: 'override 기록 실패' }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('POST /api/safety/override 실패:', error);
    return NextResponse.json({ error: 'override 처리 실패' }, { status: 500 });
  }
}
```

- [ ] **Step 7: override 시 analyze 재호출이 감지를 다시 트리거하는 문제 처리**

`/api/analyze`는 매번 `detect()`를 실행한다. override 상태에서 재호출 시 다시 critical이 나오면 무한 루프.

해결: `/api/analyze`에서 `user_override=true`인 `safety_events` row가 해당 log_id에 이미 존재하면 감지를 스킵.

Edit `app/api/analyze/route.ts` — Task 8에서 추가한 감지 훅 블록을 다음으로 교체:

```ts
    // ── 위기 감지 훅 ──
    const { data: priorOverride } = await supabase
      .from('safety_events')
      .select('id')
      .eq('user_id', user.id)
      .eq('log_id', logId)
      .eq('user_override', true)
      .maybeSingle();

    if (!priorOverride) {
      const safetyResult = await detect({
        trigger: logData.trigger,
        thought: logData.thought,
        client: createSafetyLlmClient(),
      });

      if (safetyResult.level !== 'none') {
        const { error: safetyLogError } = await supabase.from('safety_events').insert({
          user_id: user.id,
          log_id: logId,
          level: safetyResult.level,
          detected_by: safetyResult.detectedBy ?? 'keyword',
          matched_pattern: safetyResult.matchedPattern ?? null,
          llm_reason: safetyResult.llmReason ?? null,
          user_override: false,
        });
        if (safetyLogError) {
          console.error('safety_events insert 실패:', safetyLogError);
        }

        return NextResponse.json(
          {
            safety: {
              level: safetyResult.level,
              detectedBy: safetyResult.detectedBy,
            },
          },
          { status: 200 }
        );
      }
    }
    // ── /위기 감지 훅 ──
```

- [ ] **Step 8: 타입체크**

Run: `npm run lint`

Expected: 에러 없음.

- [ ] **Step 9: Commit**

```bash
git add app/analyze/[id]/page.tsx app/api/safety/override/route.ts app/api/analyze/route.ts && git commit -m "feat(safety): analyze page handles safety responses + override flow"
```

---

## Task 12: E2E 수동 스모크 테스트 시나리오

**Files:**
- Create: `docs/safety-smoke-checklist.md`

- [ ] **Step 1: 체크리스트 문서 작성**

Create `docs/safety-smoke-checklist.md`:

```markdown
# Crisis Detection v0 수동 스모크 체크리스트

실행 전: `npm run dev` + 테스트 유저 로그인.

## 시나리오 A: 키워드 critical

1. `/log` → trigger: "회의", thought: "죽고 싶어"
2. `/analyze/[id]` 자동 이동
3. 기대 결과:
   - SafetyNotice 렌더링 (붉은 카드)
   - 1393 전화 버튼 노출
   - 기존 분석 UI(왜곡 목록) 미렌더링
4. Supabase `safety_events` 테이블에 row 추가 확인
   - level=critical, detected_by=keyword, user_override=false

## 시나리오 B: 관용 표현 false positive 방지

1. `/log` → trigger: "회의", thought: "배고파 죽겠다"
2. `/analyze/[id]`
3. 기대 결과:
   - 정상 분석 흐름 (왜곡 목록 표시)
   - SafetyNotice 미렌더링
   - `safety_events`에 추가 없음

## 시나리오 C: suspected → LLM 재분류

1. `/log` → trigger: "시험", thought: "다 포기하고 싶어"
2. `/analyze/[id]`
3. 기대 결과 (LLM 판정에 따라 분기):
   - LLM이 caution 반환 시: SafetyNotice (caution 톤)
   - LLM이 none 반환 시: 정상 분석
4. `safety_events` 검증: detected_by=llm (또는 llm_fallback if Gemini 에러)

## 시나리오 D: override 플로우

1. 시나리오 A 상태에서 "괜찮아요, 계속할래요" → "네, 계속할래요"
2. 기대 결과:
   - 분석 재호출
   - 이번엔 SafetyNotice 없이 분석 결과 렌더링
   - `safety_events`의 해당 row에 user_override=true UPDATE

## 시나리오 E: 비로그인 자원 페이지

1. 로그아웃 상태로 `/safety/resources` 접근
2. 기대 결과:
   - 페이지 정상 렌더링
   - `/auth/login` 리다이렉트 없음
   - 자원 리스트 5개 노출

## Known gaps (v1 이관)

- 청소년 감지 시 1388 우선 노출 로직 없음
- 키워드 목록이 임상 검증되지 않음
- `user_override=true` 이후 trigger·thought 편집 시 override 유지 여부 테스트 안됨
- LLM 호출 latency 미측정
```

- [ ] **Step 2: 각 시나리오 수동 실행 후 결과 기록**

문서의 각 시나리오를 실제로 수행. 기대치와 실제 결과가 다르면 이슈로 별도 기록 후 수정 후 재검증.

- [ ] **Step 3: Commit**

```bash
git add docs/safety-smoke-checklist.md && git commit -m "docs(safety): add v0 manual smoke checklist"
```

---

## Task 13: 법적 공시 최소치

**Files:**
- Modify: `app/our-philosophy/page.tsx`

**목적:** 사용자가 BlueBird를 의료 서비스로 오인하지 않도록 최소한의 공시를 기존 철학 페이지에 추가. v0 단계이므로 완전한 ToS/Privacy Policy는 별도 작업으로 미룸.

- [ ] **Step 1: 현재 철학 페이지 확인**

Read: `/Users/dongseob/Desktop/Project-BlueBird-mvp/app/our-philosophy/page.tsx`

적절한 삽입 지점을 찾는다 (보통 페이지 말미).

- [ ] **Step 2: 공시 섹션 추가**

Edit `app/our-philosophy/page.tsx` — 페이지 본문 말미에 다음 JSX 블록 추가:

```tsx
<section className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-6 space-y-3">
  <h2 className="text-sm font-semibold text-gray-900">BlueBird 이용 안내</h2>
  <ul className="text-xs text-gray-700 space-y-2 list-disc pl-4">
    <li>BlueBird는 의료·치료 서비스가 아닙니다. 진단·처방을 대체하지 않습니다.</li>
    <li>지속적·심각한 어려움이 있으시면 전문가(정신건강의학과, 심리상담)의 도움을 받으시길 권해드립니다.</li>
    <li>위기 상황에서는 자살예방상담전화 1393, 정신건강위기상담 1577-0199로 연락하실 수 있습니다.</li>
    <li>작성하시는 자동 사고·감정 데이터는 AI 분석을 위해 Google Gemini로 전송됩니다. 민감 정보 입력 시 이 점을 고려해주세요.</li>
  </ul>
  <a href="/safety/resources" className="inline-block text-xs text-blue-700 underline">
    전체 자원 보기 →
  </a>
</section>
```

- [ ] **Step 3: 수동 검증**

`/our-philosophy` 페이지에서 공시 섹션 렌더링 확인 + `/safety/resources` 링크 동작 확인.

- [ ] **Step 4: Commit**

```bash
git add app/our-philosophy/page.tsx && git commit -m "feat(safety): add medical disclaimer and data transmission notice"
```

---

## Self-Review Checklist

플랜 전체 검토:

- [ ] **Spec coverage 확인**
  - Crisis detection 파이프라인 ✅ Task 3~5
  - Fail-closed LLM ✅ Task 4
  - safety_events 로깅 ✅ Task 6, 8, 11
  - Safety UI (자원 안내 + override) ✅ Task 9
  - 공개 자원 페이지 ✅ Task 10
  - API 훅 통합 ✅ Task 8, 11
  - 법적 공시 ✅ Task 13
  - 수동 검증 ✅ Task 12
  - 테스트 인프라 ✅ Task 0

- [ ] **Placeholder scan**
  - "TODO", "TBD", "implement later" 없음 확인
  - 모든 파일 경로 절대/정확
  - 모든 코드 블록에 실제 구현 포함

- [ ] **Type consistency**
  - `CrisisLevel = 'none' | 'caution' | 'critical'` — types.ts, detect.ts, SafetyNotice 일치
  - `KeywordVerdict = 'none' | 'suspected' | 'critical'` — keyword-screener, detect 일치
  - `LlmVerdict = 'none' | 'caution' | 'critical'` — llm-classifier, detect 일치
  - `DetectionSource = 'keyword' | 'llm' | 'llm_fallback'` — detect.ts, safety_events DB CHECK 일치
  - `LlmClient.generate: (prompt) => Promise<string>` — llm-classifier, gemini-adapter 일치

- [ ] **DB CHECK 제약과 코드 enum 일치**
  - `safety_events.level CHECK IN ('caution', 'critical')` ← code에선 `'none'` 제외하고 insert하므로 OK
  - `safety_events.detected_by CHECK IN ('keyword', 'llm', 'llm_fallback')` ← DetectionSource와 일치

---

## Out of Scope (향후 이관)

v1 이후로 미룬 작업 — 이번 플랜에서 의도적으로 제외:

- 임상 전문가의 키워드·문구 감수 (한국임상심리학회 또는 대학원 연구실)
- 청소년 감지 시 1388 우선 분기
- LLM prompt 인젝션 방어 (Task 0에서 논의, 별도 플랜)
- 키워드 업데이트를 위한 관리자 대시보드
- `safety_events` 기반 제품 분석(ops dashboard)
- Δpain 측정(P1 별도 플랜)
- 완전한 개인정보처리방침·이용약관 페이지
