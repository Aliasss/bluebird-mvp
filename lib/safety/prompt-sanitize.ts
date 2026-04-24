// 제어 문자 제거.
// C0 (U+0000-U+001F) 중 \n(U+000A), \t(U+0009) 외 전부.
// DEL (U+007F), C1 (U+0080-U+009F).
// Zero-width: U+200B-U+200F, U+FEFF.
const CONTROL_CHARS_RE = /[\x00-\x08\x0b-\x1f\x7f-\x9f​-‏﻿]/g;

// LLM 특수 토큰 패턴.
const LLM_TOKEN_PATTERNS: Array<[RegExp, string]> = [
  [/<\|[^|>]*\|>/g, '[BLOCKED]'],
  [/<\/?s>/gi, '[BLOCKED]'],
];

// 프롬프트 델리미터 목록.
const PROMPT_DELIMITERS = [
  '<사용자 입력>',
  '</사용자 입력>',
  '<Actual Input>',
  '</Actual Input>',
];

const MAX_LENGTH = 2000;
const TRUNCATION_MARKER = '…[truncated]';

function escapeDelimiters(text: string): string {
  let out = text;
  for (const d of PROMPT_DELIMITERS) {
    const replaced = d.replace(/</g, '[').replace(/>/g, ']');
    out = out.split(d).join(replaced);
  }
  return out;
}

function collapseNewlines(text: string): string {
  return text.replace(/\n{3,}/g, '\n\n');
}

function truncate(text: string): string {
  if (text.length <= MAX_LENGTH) return text;
  return text.slice(0, MAX_LENGTH) + TRUNCATION_MARKER;
}

export function sanitizeForPrompt(text: string): string {
  let out = text.replace(CONTROL_CHARS_RE, '');
  for (const [re, replacement] of LLM_TOKEN_PATTERNS) {
    out = out.replace(re, replacement);
  }
  out = escapeDelimiters(out);
  out = collapseNewlines(out);
  out = truncate(out);
  return out;
}
