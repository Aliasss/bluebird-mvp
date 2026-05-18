// 운영자가 선발자에게 보내는 안내 메일 본문 SSOT — 2026-05-18.
//
// 사용처: /admin/applications 카드의 "선발 안내 메일 보내기" 버튼 — mailto: 링크 prefill.
// 운영자 본인의 메일 클라이언트(Gmail 등) 에서 발송 — 외부 SMTP 인프라 불요.
//
// 톤: 분석가적 + 친절. PIPA·legal review 정합 — 의료·치유 어휘 0, 과장 0.

import { SERVICE_CONTACT_EMAIL } from './contact';

const SIGNUP_URL = 'https://bluebird-mvp.vercel.app/auth/signup';

export const SELECTION_EMAIL_SUBJECT =
  '[BlueBird] MVP 에반젤리스트 선발 안내 — 가입 진행 요청';

/**
 * 응모 → 선발 흐름에서 사용. 응모 시 입력한 이메일과 동일하게 가입할 것을 강조.
 */
export function buildSelectionEmailBody(recipientEmail: string): string {
  return [
    `안녕하세요.`,
    ``,
    `BlueBird MVP 에반젤리스트로 선발되셨습니다.`,
    `입력해주신 답변을 검토한 결과, 함께 2주간 MVP를 사용하고 서면 리포트를 공유해주실 분으로 모셨습니다.`,
    ``,
    `[다음 단계]`,
    `1) 본 메일을 받으신 이메일(${recipientEmail})로 가입해주세요.`,
    `   가입 페이지: ${SIGNUP_URL}`,
    `2) 이메일 인증 후 바로 서비스 이용이 가능합니다.`,
    `3) 2주 사용 후 서면 리포트 양식을 별도로 안내드립니다.`,
    ``,
    `※ 다른 이메일로 가입하시면 서비스 진입이 차단됩니다. 반드시 이 메일을 받은 이메일과 동일하게 가입해주세요.`,
    ``,
    `문의·답신: ${SERVICE_CONTACT_EMAIL}`,
    ``,
    `감사합니다.`,
    `BlueBird MVP 운영자 드림`,
  ].join('\n');
}

/**
 * 응모 페이지 거치지 않고 가입만 한 사용자를 직접 승인했을 때 사용.
 * (운영자 재량 승인 케이스 — 가입 동의에 따른 환영 + 다음 단계 안내)
 */
export function buildDirectApprovalEmailBody(recipientEmail: string): string {
  return [
    `안녕하세요.`,
    ``,
    `BlueBird MVP 가입을 환영합니다.`,
    `폐쇄 베타 운영 기간이지만, 본 계정(${recipientEmail})에 대해 운영자 검토를 통해 서비스 이용 권한을 부여했습니다.`,
    ``,
    `[다음 단계]`,
    `1) 이미 가입된 상태이므로 로그인 후 바로 서비스 이용이 가능합니다.`,
    `   대시보드: https://bluebird-mvp.vercel.app/dashboard`,
    `2) 사용 중 의견이나 문의는 아래 이메일로 보내주세요.`,
    ``,
    `문의·답신: ${SERVICE_CONTACT_EMAIL}`,
    ``,
    `감사합니다.`,
    `BlueBird MVP 운영자 드림`,
  ].join('\n');
}

/** mailto URL 빌더 — subject·body 모두 percent-encode. */
export function buildSelectionMailto(recipientEmail: string): string {
  const subject = encodeURIComponent(SELECTION_EMAIL_SUBJECT);
  const body = encodeURIComponent(buildSelectionEmailBody(recipientEmail));
  return `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
}

export function buildDirectApprovalMailto(recipientEmail: string): string {
  const subject = encodeURIComponent(SELECTION_EMAIL_SUBJECT);
  const body = encodeURIComponent(buildDirectApprovalEmailBody(recipientEmail));
  return `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
}
