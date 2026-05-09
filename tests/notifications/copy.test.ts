import { describe, it, expect } from 'vitest';
import {
  CHECKIN_REMINDER_PUSH,
  ENABLE_PUSH_CARD,
  ENABLE_PUSH_BANNER,
  ME_TOGGLE_LABEL,
} from '@/lib/notifications/copy';

describe('notifications/copy', () => {
  it('체크인 리마인더 푸시 제목·본문이 글자 수 제한 내', () => {
    expect(CHECKIN_REMINDER_PUSH.title).toBe('오늘 체크인 안 됐어요');
    expect(CHECKIN_REMINDER_PUSH.title.length).toBeLessThanOrEqual(30);
    expect(CHECKIN_REMINDER_PUSH.body.length).toBeLessThanOrEqual(120);
    expect(CHECKIN_REMINDER_PUSH.body).toContain('1분');
  });

  it('금지 어휘를 포함하지 않는다', () => {
    const allCopy = [
      CHECKIN_REMINDER_PUSH.title,
      CHECKIN_REMINDER_PUSH.body,
      ENABLE_PUSH_CARD.title,
      ENABLE_PUSH_CARD.body,
      ENABLE_PUSH_BANNER.text,
      ME_TOGGLE_LABEL,
    ].join(' ');
    expect(allCopy).not.toMatch(/오늘 하루도|함께|응원|소중한|❤️|🌟|✦|✧|★|☆/);
  });

  it('P2 카드 카피에 빈도 약속이 명시', () => {
    expect(ENABLE_PUSH_CARD.title).toMatch(/매일\s*21시/);
    expect(ENABLE_PUSH_CARD.title).toMatch(/체크인\s*안\s*한\s*날만/);
  });
});
