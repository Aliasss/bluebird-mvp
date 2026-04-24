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
