// 행동 계획의 구조적 입력·저장·표시 헬퍼.
//
// 저장 포맷: intervention.final_action 컬럼에 JSON 문자열로 저장.
//   {"when":"오늘 21:00","what":"보고서 첫 문단 쓰기","howLong":"5분"}
//
// Backwards-compat:
//   기존에 free text로 저장된 row는 parseActionPlan이 null을 반환하고
//   호출자가 raw text를 그대로 표시한다.

export interface ActionPlan {
  when: string;
  what: string;
  howLong: string;
}

/**
 * raw final_action 값을 parse한다.
 * - 정상 JSON이면 ActionPlan 반환
 * - JSON이 아니거나 필수 키 누락이면 null (= legacy free text)
 */
export function parseActionPlan(raw: string | null | undefined): ActionPlan | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed.startsWith('{')) return null;
  try {
    const parsed = JSON.parse(trimmed) as Partial<ActionPlan>;
    if (
      typeof parsed.when === 'string' &&
      typeof parsed.what === 'string' &&
      typeof parsed.howLong === 'string' &&
      parsed.when.trim() &&
      parsed.what.trim() &&
      parsed.howLong.trim()
    ) {
      return {
        when: parsed.when.trim(),
        what: parsed.what.trim(),
        howLong: parsed.howLong.trim(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 3개 필드를 JSON 저장 형태로 직렬화.
 * 각 필드는 trim 후 빈값 검증.
 */
export function serializeActionPlan(plan: ActionPlan): string {
  return JSON.stringify({
    when: plan.when.trim(),
    what: plan.what.trim(),
    howLong: plan.howLong.trim(),
  });
}

/**
 * 사람 친화적인 한 줄 표시. review 페이지나 dashboard에서 사용.
 * legacy free text도 함께 처리 — parseActionPlan이 null이면 raw 그대로 반환.
 */
export function formatActionPlanForDisplay(raw: string | null | undefined): string {
  if (!raw) return '';
  const parsed = parseActionPlan(raw);
  if (!parsed) return raw.trim();
  return `${parsed.when} · ${parsed.what} · ${parsed.howLong}`;
}

/**
 * 입력 검증. 각 필드 비어있지 않고 howLong에 숫자 1개 이상.
 * 반환: 에러 메시지 (검증 통과 시 null)
 */
export function validateActionPlan(plan: ActionPlan): string | null {
  if (!plan.when.trim()) return '언제 실행할지 적어주세요.';
  if (!plan.what.trim()) return '무엇을 할지 적어주세요.';
  if (!plan.howLong.trim()) return '얼마나 할지 적어주세요.';
  if (plan.what.trim().length < 4) return '"무엇을"은 4자 이상으로 적어주세요.';
  if (!/\d/.test(plan.howLong)) {
    return '"얼마나"에는 숫자(예: 5분, 1번)를 포함해주세요.';
  }
  return null;
}
