# 푸시 인프라 (데일리 체크인 리마인더) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 21:00 KST에 오늘 evening 체크인을 하지 않은 사용자에게 Web Push 리마인더 1회 발송. 권한 요청은 첫 체크인 직후 컨텍스트 카드(P2) + 대시보드 fallback 배너(P3) 병행.

**Architecture:** Vercel Cron(daily) → Next.js Route Handler → Supabase RPC(미체크인 사용자 조회) → web-push lib(VAPID 서명·암호화) → Mozilla Push Service / FCM → service worker `push` 이벤트 → `showNotification`. 신규 외부 의존 0, 신규 패키지 1개(`web-push`), 마이그레이션 14번.

**Tech Stack:** Next.js 16 App Router, Supabase (Auth+DB+RPC), `@ducanh2912/next-pwa` (customWorker), `web-push@^3.6.7`, Vercel Cron, vitest.

**Spec 출처:** `docs/strategy/push-infra-review-2026-05-09.md` (commit `491fab8`).

**Codebase 발견 사항 (spec과 차이):**
- 체크인은 `morning` / `evening` 두 타입 — 21:00 알림은 **`evening` 미체크인 대상으로 정의** (자연 정합)
- Migration 13 이미 점유(`13_pain_score_range_0_10.sql`) → 푸시 테이블은 **Migration 14**
- `lib/logging/server-logger.ts`의 `logServerError` 사용 (PII 마스킹)
- `lint-copy`는 `--strict` flag 없이 경고만 — 신규 푸시 룰은 `COMFORT_PATTERNS` 확장으로 추가

---

## File Structure

**신규 파일:**
```
lib/supabase/service.ts                     # service-role client (cron 전용)
lib/notifications/
  ├─ copy.ts                                # 카피 단일 출처 (lint-copy 검증 대상)
  ├─ vapid.ts                               # VAPID env 로더 + Uint8Array 변환
  └─ send.ts                                # web-push 래퍼 (410/404 → DELETE)
app/api/push/
  ├─ subscribe/route.ts                     # POST 자기 subscription 저장
  └─ unsubscribe/route.ts                   # POST 자기 subscription 삭제
app/api/cron/checkin-reminder/route.ts      # Bearer CRON_SECRET 검증
components/notifications/
  ├─ usePushPermission.ts                   # 공유 hook (구독/해지/permission 상태)
  ├─ EnablePushCard.tsx                     # P2 (체크인 직후)
  ├─ EnablePushBanner.tsx                   # P3 (대시보드 fallback)
  └─ PushToggle.tsx                         # /me 설정 토글 ('use client' 분리)
worker/index.js                             # next-pwa customWorker (push handler)
supabase/migrations/14_push_subscriptions.sql
vercel.json                                 # cron 1슬롯
docs/qa/push-ios-checklist.md
docs/runbooks/vapid-key-rotation.md
tests/notifications/
  ├─ copy.test.ts
  ├─ vapid.test.ts
  ├─ send.test.ts
  └─ cron.test.ts
```

**기존 파일 변경:**
- `package.json` — `web-push@^3.6.7` 의존성 추가
- `next.config.ts` — next-pwa `customWorkerSrc` 추가
- `app/me/page.tsx` — "21시 체크인 알림" 토글 추가
- `app/checkin/page.tsx` — `<EnablePushCard />` conditional 마운트
- `app/dashboard/page.tsx` — `<EnablePushBanner />` 마운트
- `scripts/lint-copy.ts` — `COMFORT_PATTERNS`에 푸시 카피 룰 4건 추가

---

## Task 1: 의존성 설치 + VAPID 키 생성

**Files:**
- Modify: `package.json`
- (Manual) Vercel project env: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `CRON_SECRET`

- [ ] **Step 1: Install web-push**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp
npm install web-push@^3.6.7
```

Expected: `package.json` "dependencies"에 `"web-push": "^3.6.7"` 추가됨. `web-push`는 자체 type을 번들하지 않으므로 별도 `@types/web-push`도 설치:

```bash
npm install --save-dev @types/web-push
```

- [ ] **Step 2: VAPID 키 생성**

```bash
npx web-push generate-vapid-keys
```

Expected output (예시):
```
=======================================
Public Key:
BNxxxx...

Private Key:
xxxxxx...
=======================================
```

**키는 절대 commit 금지.** 출력을 클립보드에 보관.

- [ ] **Step 3: Vercel env 등록 (manual)**

Vercel project Settings → Environment Variables에서 다음 5개 등록 (Production, Preview, Development 모두):

| Key | Value | Type |
|---|---|---|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | (Step 2의 Public Key) | Plaintext |
| `VAPID_PRIVATE_KEY` | (Step 2의 Private Key) | Sensitive |
| `VAPID_SUBJECT` | `mailto:seob6615@gmail.com` | Plaintext |
| `CRON_SECRET` | `openssl rand -hex 32` 결과 | Sensitive |
| (기존) `SUPABASE_SERVICE_ROLE_KEY` | (이미 설정됨, 확인만) | Sensitive |

`.env.local`에도 동일 값 추가 (gitignore 정책으로 commit 안 됨).

- [ ] **Step 4: package.json 변경 commit**

```bash
git add package.json package-lock.json
git commit -m "feat(push): web-push@3.6.7 + @types/web-push 의존성 추가"
```

---

## Task 2: Migration 14 — push_subscriptions 테이블 + RLS + RPC

**Files:**
- Create: `supabase/migrations/14_push_subscriptions.sql`

- [ ] **Step 1: Migration 파일 작성**

`supabase/migrations/14_push_subscriptions.sql`:

```sql
-- 14_push_subscriptions.sql
-- Web Push 구독 테이블 — 데일리 체크인 리마인더용.
--
-- Spec: docs/strategy/push-infra-review-2026-05-09.md
--
-- 정책:
--   - per-row owner only (RLS) — `checkins`, `logs` 와 동일 패턴
--   - UPDATE 정책 없음 — subscription은 append/delete만 (브라우저가 endpoint 변경 시 새 row)
--   - DELETE 정책: 자기 row만. service_role(cron)은 RLS bypass로 410/404 정리
--   - unique(user_id, endpoint) — 동일 디바이스 중복 구독 방지

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user
  ON push_subscriptions(user_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS push_subscriptions_select_own ON push_subscriptions;
CREATE POLICY push_subscriptions_select_own ON push_subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS push_subscriptions_insert_own ON push_subscriptions;
CREATE POLICY push_subscriptions_insert_own ON push_subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS push_subscriptions_delete_own ON push_subscriptions;
CREATE POLICY push_subscriptions_delete_own ON push_subscriptions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 의도적으로 UPDATE 정책 없음 — subscription은 endpoint 변경 시 새 row.

-- ============================================================
-- RPC: cron handler가 단일 round-trip으로 발송 대상 조회.
-- "오늘 KST evening 체크인이 없는 사용자의 활성 subscription".
-- service definer로 service_role 호출에서도 RLS 우회 후 일관 동작.
-- ============================================================

CREATE OR REPLACE FUNCTION users_without_today_evening_checkin_with_push()
RETURNS TABLE(user_id UUID, endpoint TEXT, p256dh TEXT, auth TEXT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ps.user_id, ps.endpoint, ps.p256dh, ps.auth
  FROM push_subscriptions ps
  WHERE NOT EXISTS (
    SELECT 1 FROM checkins c
    WHERE c.user_id = ps.user_id
      AND c.type = 'evening'
      AND c.created_at >= ((NOW() AT TIME ZONE 'Asia/Seoul')::date)::timestamp AT TIME ZONE 'Asia/Seoul'
  );
$$;

-- service_role만 호출 가능하도록 EXECUTE 권한 제한.
REVOKE ALL ON FUNCTION users_without_today_evening_checkin_with_push() FROM PUBLIC;
REVOKE ALL ON FUNCTION users_without_today_evening_checkin_with_push() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION users_without_today_evening_checkin_with_push() TO service_role;

-- 끝.
```

- [ ] **Step 2: 로컬 Supabase에 적용**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp
npx supabase db reset --db-url "$LOCAL_SUPABASE_DB_URL"
# 또는 단일 마이그레이션 적용:
npx supabase migration up --db-url "$LOCAL_SUPABASE_DB_URL"
```

(local supabase CLI 환경 변수가 없을 시, supabase dashboard SQL editor에서 파일 내용 직접 실행)

- [ ] **Step 3: 적용 확인 — psql 또는 supabase studio에서**

```sql
-- 테이블 존재
SELECT * FROM information_schema.tables WHERE table_name = 'push_subscriptions';

-- RLS enabled
SELECT relrowsecurity FROM pg_class WHERE relname = 'push_subscriptions';
-- expected: t

-- 정책 3개 존재
SELECT polname FROM pg_policy WHERE polrelid = 'push_subscriptions'::regclass;
-- expected: push_subscriptions_select_own, _insert_own, _delete_own

-- RPC 호출 가능
SELECT * FROM users_without_today_evening_checkin_with_push();
-- expected: empty result (no subs yet) — 에러 없이 0 row
```

- [ ] **Step 4: Production Supabase 적용**

`docs/safety-rls-audit-2026-04-25.md`의 절차 준수. Supabase project SQL editor에서 Migration 14 내용 그대로 실행.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/14_push_subscriptions.sql
git commit -m "feat(push): Migration 14 — push_subscriptions 테이블 + RLS + RPC"
```

---

## Task 3: lib/supabase/service.ts — service-role client

**Files:**
- Create: `lib/supabase/service.ts`

- [ ] **Step 1: 서비스롤 client 작성**

```ts
// lib/supabase/service.ts
import { createClient } from '@supabase/supabase-js';

/**
 * Service-role client — RLS 우회.
 * **사용처는 cron handler·운영 스크립트로 한정.** Server Component·일반 API에서 사용 금지.
 *
 * env 부재 시 즉시 throw — silent fallback으로 RLS 보호 우회 사고 방지.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'createServiceRoleClient: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 미설정',
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/supabase/service.ts
git commit -m "feat(push): lib/supabase/service.ts — service-role client (cron 전용)"
```

---

## Task 4: lib/notifications/copy.ts (with tests)

**Files:**
- Create: `lib/notifications/copy.ts`
- Create: `tests/notifications/copy.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/notifications/copy.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { CHECKIN_REMINDER_PUSH, ENABLE_PUSH_CARD, ENABLE_PUSH_BANNER, ME_TOGGLE_LABEL } from '@/lib/notifications/copy';

describe('notifications/copy', () => {
  it('체크인 리마인더 푸시 제목·본문이 분석 톤이며 글자 수 제한 내', () => {
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
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npm run test -- tests/notifications/copy.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/notifications/copy'`

- [ ] **Step 3: copy.ts 작성**

`lib/notifications/copy.ts`:

```ts
/**
 * 알림 카피 단일 출처.
 * 본 파일의 export 외에 알림 문구를 코드 내에 인라인 작성 금지.
 * scripts/lint-copy.ts가 본 파일 export를 기준으로 검증.
 *
 * 톤: 분석/관찰 (BlueBird 정체성). 정서·응원·항해 메타포·이모지 금지.
 * Spec: docs/strategy/push-infra-review-2026-05-09.md §2.2
 */

export const CHECKIN_REMINDER_PUSH = {
  title: '오늘 체크인 안 됐어요',
  body: '1분이면 한 줄 남길 수 있어요. 지난 7일과 비교 데이터가 쌓입니다.',
  url: '/checkin',
  tag: 'checkin-reminder',
} as const;

export const ENABLE_PUSH_CARD = {
  title: '매일 21시, 체크인 안 한 날만 알려드릴게요',
  body: '오늘처럼 한 줄을 기록하면 데이터가 쌓입니다.',
  ctaPrimary: '지금 켜기',
  ctaSecondary: '나중에',
  toastGranted: '켰습니다. 21시에 안 했으면 알림이 와요.',
  toastDenied: '알림이 차단되었어요. 브라우저 설정에서 푸시를 허용해야 다시 켤 수 있어요.',
} as const;

export const ENABLE_PUSH_BANNER = {
  text: '21시 미체크인 알림 켜기 — Streak 보호',
  cta: '켜기',
} as const;

export const ME_TOGGLE_LABEL = '21시 체크인 알림';
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npm run test -- tests/notifications/copy.test.ts
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/notifications/copy.ts tests/notifications/copy.test.ts
git commit -m "feat(push): lib/notifications/copy.ts — 알림 카피 단일 출처 + tests"
```

---

## Task 5: lib/notifications/vapid.ts (with tests)

**Files:**
- Create: `lib/notifications/vapid.ts`
- Create: `tests/notifications/vapid.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/notifications/vapid.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { getVapidConfig, urlBase64ToUint8Array } from '@/lib/notifications/vapid';

describe('notifications/vapid', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'BPub_test';
    process.env.VAPID_PRIVATE_KEY = 'priv_test';
    process.env.VAPID_SUBJECT = 'mailto:test@example.com';
  });

  it('env 모두 존재 시 config 반환', () => {
    const cfg = getVapidConfig();
    expect(cfg.publicKey).toBe('BPub_test');
    expect(cfg.privateKey).toBe('priv_test');
    expect(cfg.subject).toBe('mailto:test@example.com');
  });

  it('VAPID_PRIVATE_KEY 미설정 시 throw', () => {
    delete process.env.VAPID_PRIVATE_KEY;
    expect(() => getVapidConfig()).toThrowError(/VAPID_PRIVATE_KEY/);
  });

  it('urlBase64ToUint8Array는 표준 base64url을 디코드', () => {
    // 'Hello'를 base64url로: SGVsbG8
    const arr = urlBase64ToUint8Array('SGVsbG8');
    expect(Array.from(arr)).toEqual([72, 101, 108, 108, 111]);
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npm run test -- tests/notifications/vapid.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: vapid.ts 작성**

`lib/notifications/vapid.ts`:

```ts
/**
 * VAPID 키 로딩 + base64url → Uint8Array 변환.
 * server: getVapidConfig() — web-push.setVapidDetails 입력
 * client: urlBase64ToUint8Array(NEXT_PUBLIC_VAPID_PUBLIC_KEY) — pushManager.subscribe 입력
 */

export interface VapidConfig {
  publicKey: string;
  privateKey: string;
  subject: string;
}

export function getVapidConfig(): VapidConfig {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey) throw new Error('NEXT_PUBLIC_VAPID_PUBLIC_KEY 미설정');
  if (!privateKey) throw new Error('VAPID_PRIVATE_KEY 미설정');
  if (!subject) throw new Error('VAPID_SUBJECT 미설정');

  return { publicKey, privateKey, subject };
}

/**
 * 표준 base64url → Uint8Array.
 * pushManager.subscribe의 applicationServerKey는 Uint8Array 또는 BufferSource를 요구.
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = typeof atob === 'function'
    ? atob(base64)
    : Buffer.from(base64, 'base64').toString('binary');
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npm run test -- tests/notifications/vapid.test.ts
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/notifications/vapid.ts tests/notifications/vapid.test.ts
git commit -m "feat(push): lib/notifications/vapid.ts — env 로더 + base64url 변환 + tests"
```

---

## Task 6: lib/notifications/send.ts (with tests, mocked web-push)

**Files:**
- Create: `lib/notifications/send.ts`
- Create: `tests/notifications/send.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/notifications/send.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// web-push와 service client를 mock
vi.mock('web-push', () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn(),
  },
  setVapidDetails: vi.fn(),
  sendNotification: vi.fn(),
}));

const mockDelete = vi.fn();
const mockEq = vi.fn(() => ({ eq: mockEq }));
mockEq.mockImplementation(() => ({ eq: mockEq, delete: mockDelete }));

vi.mock('@/lib/supabase/service', () => ({
  createServiceRoleClient: () => ({
    from: () => ({ delete: () => ({ eq: mockEq }) }),
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'BPub_test';
  process.env.VAPID_PRIVATE_KEY = 'priv_test';
  process.env.VAPID_SUBJECT = 'mailto:test@example.com';
});

const SUB = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
  keys: { p256dh: 'p256dh_test', auth: 'auth_test' },
};

describe('notifications/send', () => {
  it('200 응답 시 정상 resolve', async () => {
    const webpush = await import('web-push');
    (webpush.default.sendNotification as any).mockResolvedValue({ statusCode: 200 });

    const { sendCheckinReminder } = await import('@/lib/notifications/send');
    await expect(sendCheckinReminder(SUB, 'user-1')).resolves.toBeDefined();
  });

  it('410 Gone 응답 시 push_subscriptions에서 endpoint 삭제', async () => {
    const webpush = await import('web-push');
    const err: any = new Error('Gone');
    err.statusCode = 410;
    (webpush.default.sendNotification as any).mockRejectedValue(err);

    const { sendCheckinReminder } = await import('@/lib/notifications/send');
    await sendCheckinReminder(SUB, 'user-1').catch(() => {});

    // mockEq가 endpoint·user_id 두 번 호출됨 (delete().eq().eq() 체이닝)
    expect(mockEq).toHaveBeenCalled();
  });

  it('404 응답도 410과 동일하게 정리', async () => {
    const webpush = await import('web-push');
    const err: any = new Error('Not Found');
    err.statusCode = 404;
    (webpush.default.sendNotification as any).mockRejectedValue(err);

    const { sendCheckinReminder } = await import('@/lib/notifications/send');
    await sendCheckinReminder(SUB, 'user-1').catch(() => {});

    expect(mockEq).toHaveBeenCalled();
  });

  it('500 등 일시 오류는 정리하지 않고 throw', async () => {
    const webpush = await import('web-push');
    const err: any = new Error('Server error');
    err.statusCode = 500;
    (webpush.default.sendNotification as any).mockRejectedValue(err);

    const { sendCheckinReminder } = await import('@/lib/notifications/send');
    await expect(sendCheckinReminder(SUB, 'user-1')).rejects.toThrow();
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npm run test -- tests/notifications/send.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: send.ts 작성**

`lib/notifications/send.ts`:

```ts
import webpush from 'web-push';
import { getVapidConfig } from './vapid';
import { CHECKIN_REMINDER_PUSH } from './copy';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { logServerError } from '@/lib/logging/server-logger';

export interface PushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

let vapidConfigured = false;
function ensureVapid() {
  if (vapidConfigured) return;
  const cfg = getVapidConfig();
  webpush.setVapidDetails(cfg.subject, cfg.publicKey, cfg.privateKey);
  vapidConfigured = true;
}

export interface CheckinReminderResult {
  endpoint: string;
  status: 'sent' | 'gone';
}

/**
 * 체크인 리마인더 1건 발송.
 * - 200/201 → status 'sent' resolve
 * - 410 / 404 → push_subscriptions row 삭제 후 status 'gone' resolve
 * - 그 외 (500 등 일시 오류) → throw (cron의 Promise.allSettled가 reject로 분류)
 */
export async function sendCheckinReminder(
  sub: PushSubscription,
  userId: string,
): Promise<CheckinReminderResult> {
  ensureVapid();

  const payload = JSON.stringify({
    title: CHECKIN_REMINDER_PUSH.title,
    body: CHECKIN_REMINDER_PUSH.body,
    url: CHECKIN_REMINDER_PUSH.url,
  });

  try {
    await webpush.sendNotification(sub, payload);
    return { endpoint: sub.endpoint, status: 'sent' };
  } catch (err: unknown) {
    const statusCode = (err as { statusCode?: number })?.statusCode;
    if (statusCode === 410 || statusCode === 404) {
      // 만료/유효하지 않은 subscription — DB에서 회수
      try {
        const supabase = createServiceRoleClient();
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', sub.endpoint)
          .eq('user_id', userId);
      } catch (cleanupErr) {
        logServerError('lib/notifications/send.cleanup', cleanupErr);
      }
      return { endpoint: sub.endpoint, status: 'gone' };
    }
    throw err;
  }
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npm run test -- tests/notifications/send.test.ts
```

Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/notifications/send.ts tests/notifications/send.test.ts
git commit -m "feat(push): lib/notifications/send.ts — web-push 래퍼 (410/404 회수) + tests"
```

---

## Task 7: /api/push/subscribe (POST)

**Files:**
- Create: `app/api/push/subscribe/route.ts`
- Create: `tests/notifications/subscribe.test.ts` (route handler 직접 호출)

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/notifications/subscribe.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';

const mockUpsert = vi.fn(() => ({ select: () => ({ data: null, error: null }) }));
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({
    auth: { getUser: mockGetUser },
    from: () => ({ upsert: mockUpsert }),
  }),
}));

describe('POST /api/push/subscribe', () => {
  it('body 형식 위반 시 400', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
    const { POST } = await import('@/app/api/push/subscribe/route');
    const req = new Request('http://localhost/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify({ wrong: 'shape' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('인증 없으면 401', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const { POST } = await import('@/app/api/push/subscribe/route');
    const req = new Request('http://localhost/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        endpoint: 'https://fcm.googleapis.com/fcm/send/x',
        keys: { p256dh: 'p', auth: 'a' },
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('정상 요청 시 upsert 호출 + 200', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
    const { POST } = await import('@/app/api/push/subscribe/route');
    const req = new Request('http://localhost/api/push/subscribe', {
      method: 'POST',
      headers: { 'user-agent': 'TestUA/1.0' },
      body: JSON.stringify({
        endpoint: 'https://fcm.googleapis.com/fcm/send/x',
        keys: { p256dh: 'p', auth: 'a' },
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'u1',
        endpoint: 'https://fcm.googleapis.com/fcm/send/x',
        p256dh: 'p',
        auth: 'a',
        user_agent: 'TestUA/1.0',
      }),
      expect.objectContaining({ onConflict: 'user_id,endpoint' }),
    );
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npm run test -- tests/notifications/subscribe.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: route 작성**

`app/api/push/subscribe/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/logging/server-logger';

const schema = z.object({
  endpoint: z.string().url().min(1),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: '입력 형식이 올바르지 않습니다.' }, { status: 400 });
    }
    const { endpoint, keys } = parsed.data;

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user.id,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          user_agent: request.headers.get('user-agent') ?? null,
        },
        { onConflict: 'user_id,endpoint' },
      );

    if (error) {
      logServerError('api/push/subscribe', error);
      return NextResponse.json({ error: '구독 저장에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logServerError('api/push/subscribe', error);
    return NextResponse.json({ error: '구독 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npm run test -- tests/notifications/subscribe.test.ts
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add app/api/push/subscribe/route.ts tests/notifications/subscribe.test.ts
git commit -m "feat(push): POST /api/push/subscribe + tests"
```

---

## Task 8: /api/push/unsubscribe (POST)

**Files:**
- Create: `app/api/push/unsubscribe/route.ts`
- Create: `tests/notifications/unsubscribe.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/notifications/unsubscribe.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';

const mockEq2 = vi.fn();
const mockEq1 = vi.fn(() => ({ eq: mockEq2 }));
const mockDelete = vi.fn(() => ({ eq: mockEq1 }));
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({
    auth: { getUser: mockGetUser },
    from: () => ({ delete: mockDelete }),
  }),
}));

describe('POST /api/push/unsubscribe', () => {
  it('인증 없으면 401', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const { POST } = await import('@/app/api/push/unsubscribe/route');
    const req = new Request('http://localhost/api/push/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ endpoint: 'https://x' }),
    });
    expect((await POST(req)).status).toBe(401);
  });

  it('endpoint 누락 시 400', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
    const { POST } = await import('@/app/api/push/unsubscribe/route');
    const req = new Request('http://localhost/api/push/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    expect((await POST(req)).status).toBe(400);
  });

  it('정상 요청 시 delete().eq(endpoint).eq(user_id) 체이닝', async () => {
    mockEq2.mockResolvedValue({ error: null });
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
    const { POST } = await import('@/app/api/push/unsubscribe/route');
    const req = new Request('http://localhost/api/push/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ endpoint: 'https://fcm.googleapis.com/fcm/send/x' }),
    });
    expect((await POST(req)).status).toBe(200);
    expect(mockEq1).toHaveBeenCalledWith('endpoint', 'https://fcm.googleapis.com/fcm/send/x');
    expect(mockEq2).toHaveBeenCalledWith('user_id', 'u1');
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npm run test -- tests/notifications/unsubscribe.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: route 작성**

`app/api/push/unsubscribe/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/logging/server-logger';

const schema = z.object({ endpoint: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: '입력 형식이 올바르지 않습니다.' }, { status: 400 });
    }
    const { endpoint } = parsed.data;

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint)
      .eq('user_id', user.id);

    if (error) {
      logServerError('api/push/unsubscribe', error);
      return NextResponse.json({ error: '구독 해지에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logServerError('api/push/unsubscribe', error);
    return NextResponse.json({ error: '해지 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npm run test -- tests/notifications/unsubscribe.test.ts
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add app/api/push/unsubscribe/route.ts tests/notifications/unsubscribe.test.ts
git commit -m "feat(push): POST /api/push/unsubscribe + tests"
```

---

## Task 9: /api/cron/checkin-reminder (POST)

**Files:**
- Create: `app/api/cron/checkin-reminder/route.ts`
- Create: `tests/notifications/cron.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/notifications/cron.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRpc = vi.fn();
vi.mock('@/lib/supabase/service', () => ({
  createServiceRoleClient: () => ({ rpc: mockRpc }),
}));

const mockSend = vi.fn();
vi.mock('@/lib/notifications/send', () => ({
  sendCheckinReminder: (...args: unknown[]) => mockSend(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CRON_SECRET = 'test-secret';
});

describe('POST /api/cron/checkin-reminder', () => {
  it('Authorization 헤더 누락 시 401', async () => {
    const { POST } = await import('@/app/api/cron/checkin-reminder/route');
    const req = new Request('http://localhost/api/cron/checkin-reminder', { method: 'POST' });
    expect((await POST(req)).status).toBe(401);
  });

  it('Authorization 불일치 시 401', async () => {
    const { POST } = await import('@/app/api/cron/checkin-reminder/route');
    const req = new Request('http://localhost/api/cron/checkin-reminder', {
      method: 'POST',
      headers: { authorization: 'Bearer wrong' },
    });
    expect((await POST(req)).status).toBe(401);
  });

  it('targets 0건이면 200 + sent=0', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });
    const { POST } = await import('@/app/api/cron/checkin-reminder/route');
    const req = new Request('http://localhost/api/cron/checkin-reminder', {
      method: 'POST',
      headers: { authorization: 'Bearer test-secret' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(expect.objectContaining({ sent: 0 }));
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('각 target마다 sendCheckinReminder 호출, subscription shape 변환', async () => {
    mockRpc.mockResolvedValue({
      data: [
        { user_id: 'u1', endpoint: 'https://x/1', p256dh: 'p1', auth: 'a1' },
        { user_id: 'u2', endpoint: 'https://x/2', p256dh: 'p2', auth: 'a2' },
      ],
      error: null,
    });
    mockSend.mockResolvedValue({ status: 'sent' });

    const { POST } = await import('@/app/api/cron/checkin-reminder/route');
    const req = new Request('http://localhost/api/cron/checkin-reminder', {
      method: 'POST',
      headers: { authorization: 'Bearer test-secret' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(mockSend).toHaveBeenCalledWith(
      { endpoint: 'https://x/1', keys: { p256dh: 'p1', auth: 'a1' } },
      'u1',
    );
  });

  it('일부 발송 실패해도 전체 응답은 200, sent 카운트는 성공만', async () => {
    mockRpc.mockResolvedValue({
      data: [
        { user_id: 'u1', endpoint: 'https://x/1', p256dh: 'p1', auth: 'a1' },
        { user_id: 'u2', endpoint: 'https://x/2', p256dh: 'p2', auth: 'a2' },
      ],
      error: null,
    });
    mockSend
      .mockResolvedValueOnce({ status: 'sent' })
      .mockRejectedValueOnce(new Error('500 transient'));

    const { POST } = await import('@/app/api/cron/checkin-reminder/route');
    const req = new Request('http://localhost/api/cron/checkin-reminder', {
      method: 'POST',
      headers: { authorization: 'Bearer test-secret' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sent).toBe(1);
    expect(body.total).toBe(2);
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npm run test -- tests/notifications/cron.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: route 작성**

`app/api/cron/checkin-reminder/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { sendCheckinReminder } from '@/lib/notifications/send';
import { logServerError } from '@/lib/logging/server-logger';

interface RpcRow {
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function POST(request: Request) {
  // Vercel Cron Bearer 검증 — 외부 임의 호출 차단.
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.rpc('users_without_today_evening_checkin_with_push');

    if (error) {
      logServerError('api/cron/checkin-reminder.rpc', error);
      return NextResponse.json({ error: 'RPC 실패' }, { status: 500 });
    }

    const targets: RpcRow[] = data ?? [];

    const results = await Promise.allSettled(
      targets.map((t) =>
        sendCheckinReminder(
          { endpoint: t.endpoint, keys: { p256dh: t.p256dh, auth: t.auth } },
          t.user_id,
        ),
      ),
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.length - sent;

    if (failed > 0) {
      const sample = results.filter((r) => r.status === 'rejected').slice(0, 3);
      sample.forEach((r) => {
        if (r.status === 'rejected') logServerError('api/cron/checkin-reminder.send', r.reason);
      });
    }

    return NextResponse.json({ sent, total: targets.length, failed }, { status: 200 });
  } catch (error) {
    logServerError('api/cron/checkin-reminder', error);
    return NextResponse.json({ error: 'Cron 처리 실패' }, { status: 500 });
  }
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npm run test -- tests/notifications/cron.test.ts
```

Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add app/api/cron/checkin-reminder/route.ts tests/notifications/cron.test.ts
git commit -m "feat(push): POST /api/cron/checkin-reminder + tests"
```

---

## Task 10: vercel.json — cron schedule

**Files:**
- Create: `vercel.json` (현재 부재 확인됨, 2026-05-09)

- [ ] **Step 1: vercel.json 작성**

```json
{
  "crons": [
    { "path": "/api/cron/checkin-reminder", "schedule": "0 12 * * *" }
  ]
}
```

`0 12 * * *` UTC = 21:00 KST. 한국 DST 없음 → 영구 안정.

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "feat(push): vercel.json — 21:00 KST cron 1슬롯"
```

---

## Task 11: Service Worker — worker/index.js + next.config.ts

**Files:**
- Create: `worker/index.js`
- Modify: `next.config.ts`

- [ ] **Step 1: worker/index.js 작성**

```js
// worker/index.js
// next-pwa의 customWorker 진입점. 자동 생성된 sw.js 끝에 append됨.
// dev(turbopack)에서는 SW 비활성 — production preview/production에서만 동작.

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_) {
    payload = {};
  }

  const title = payload.title || '오늘 체크인 안 됐어요';
  const body = payload.body || '1분이면 한 줄 남길 수 있어요.';
  const url = payload.url || '/checkin';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url },
      tag: 'checkin-reminder', // 동일 tag는 합쳐짐 — 중복 알림 방지
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/checkin';

  event.waitUntil(
    (async () => {
      const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const existing = wins.find((w) => w.url.includes(url));
      if (existing) {
        await existing.focus();
        return;
      }
      await self.clients.openWindow(url);
    })(),
  );
});
```

- [ ] **Step 2: next.config.ts 수정 — customWorkerSrc 추가**

`next.config.ts`의 `withPWA` 옵션에 `customWorkerSrc: 'worker'` 추가. 기존 next-pwa 설정 객체에 1줄 삽입.

먼저 현재 파일 확인:

```bash
cat /Users/dongseob/Desktop/Project-BlueBird-mvp/next.config.ts
```

기존 파일에서 `withPWA({ ... })` 또는 동등 호출의 옵션 객체에 다음 키 추가:

```ts
{
  // ... 기존 옵션 유지
  customWorkerSrc: 'worker',
  customWorkerDest: 'public', // 또는 default 위치 사용
}
```

(`@ducanh2912/next-pwa`의 정확한 옵션명은 패키지 README를 참조하되, 본 패키지에서 사용 중인 형태에 맞춤. customWorker 옵션 명칭이 다르면 동등 의미 옵션을 사용)

- [ ] **Step 3: production build에서 SW에 push handler가 포함되었는지 확인**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp
npm run build
grep -l "addEventListener.*push" public/sw.js .next/static 2>/dev/null
```

Expected: `public/sw.js` 또는 빌드 산출물 SW에 push 이벤트 리스너가 포함됨.

- [ ] **Step 4: Commit**

```bash
git add worker/index.js next.config.ts
git commit -m "feat(push): service worker push/notificationclick handler (next-pwa customWorker)"
```

---

## Task 12: usePushPermission 공유 hook

**Files:**
- Create: `components/notifications/usePushPermission.ts`

- [ ] **Step 1: hook 작성**

```ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { urlBase64ToUint8Array } from '@/lib/notifications/vapid';

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export interface PushPermissionApi {
  state: PermissionState;
  loading: boolean;
  enable: () => Promise<{ ok: boolean; reason?: PermissionState }>;
  disable: () => Promise<{ ok: boolean }>;
}

export function usePushPermission(): PushPermissionApi {
  const [state, setState] = useState<PermissionState>('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported');
      return;
    }
    setState(Notification.permission as PermissionState);
  }, []);

  const enable = useCallback(async () => {
    if (state === 'unsupported') return { ok: false, reason: 'unsupported' as const };
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setState(perm as PermissionState);
      if (perm !== 'granted') return { ok: false, reason: perm as PermissionState };

      const reg = await navigator.serviceWorker.ready;
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error('NEXT_PUBLIC_VAPID_PUBLIC_KEY 미설정');

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const { endpoint, keys } = sub.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ endpoint, keys }),
      });

      if (!res.ok) {
        await sub.unsubscribe();
        return { ok: false, reason: 'denied' as const };
      }

      return { ok: true };
    } finally {
      setLoading(false);
    }
  }, [state]);

  const disable = useCallback(async () => {
    if (state === 'unsupported') return { ok: false };
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) return { ok: true };

      const endpoint = sub.endpoint;
      await sub.unsubscribe();
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ endpoint }),
      });
      return { ok: true };
    } finally {
      setLoading(false);
    }
  }, [state]);

  return { state, loading, enable, disable };
}
```

- [ ] **Step 2: Commit**

```bash
git add components/notifications/usePushPermission.ts
git commit -m "feat(push): usePushPermission hook — 구독/해지/permission 상태 통합"
```

---

## Task 13: EnablePushCard (P2)

**Files:**
- Create: `components/notifications/EnablePushCard.tsx`

- [ ] **Step 1: P2 카드 컴포넌트 작성**

```tsx
'use client';

import { useState } from 'react';
import { usePushPermission } from './usePushPermission';
import { ENABLE_PUSH_CARD } from '@/lib/notifications/copy';

const STORAGE_KEY = 'bluebird:p2_dismissed_v1';

export interface EnablePushCardProps {
  /** 호출자가 노출 조건을 통제할 수 있도록. 기본값: 첫 마운트 시 1회 + permission default */
  forceShow?: boolean;
}

/**
 * P2 — 최초 체크인 직후 1회 노출.
 * dismiss 후 영구 미노출 (로컬 스토리지 플래그). 회복 경로는 P3 배너.
 * Spec: docs/strategy/push-infra-review-2026-05-09.md §2.1 (P2)
 */
export default function EnablePushCard({ forceShow = false }: EnablePushCardProps) {
  const { state, loading, enable } = usePushPermission();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(STORAGE_KEY) === '1';
  });
  const [toast, setToast] = useState<string | null>(null);

  if (state === 'unsupported') return null;
  if (state !== 'default') return null; // granted/denied은 UI 변동 없음
  if (dismissed && !forceShow) return null;

  const handleEnable = async () => {
    const result = await enable();
    if (result.ok) {
      setToast(ENABLE_PUSH_CARD.toastGranted);
      setDismissed(true);
      localStorage.setItem(STORAGE_KEY, '1');
    } else if (result.reason === 'denied') {
      setToast(ENABLE_PUSH_CARD.toastDenied);
      setDismissed(true);
      localStorage.setItem(STORAGE_KEY, '1');
    }
  };

  const handleLater = () => {
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, '1');
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" role="region" aria-label="푸시 알림 켜기">
      <h3 className="text-sm font-medium text-slate-900">{ENABLE_PUSH_CARD.title}</h3>
      <p className="mt-1 text-sm text-slate-600">{ENABLE_PUSH_CARD.body}</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleEnable}
          disabled={loading}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {ENABLE_PUSH_CARD.ctaPrimary}
        </button>
        <button
          type="button"
          onClick={handleLater}
          disabled={loading}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
        >
          {ENABLE_PUSH_CARD.ctaSecondary}
        </button>
      </div>
      {toast && <p className="mt-2 text-xs text-slate-500" role="status">{toast}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/notifications/EnablePushCard.tsx
git commit -m "feat(push): EnablePushCard (P2) — 최초 체크인 직후 1회 권한 요청"
```

---

## Task 14: EnablePushBanner (P3)

**Files:**
- Create: `components/notifications/EnablePushBanner.tsx`

- [ ] **Step 1: P3 배너 작성**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { usePushPermission } from './usePushPermission';
import { ENABLE_PUSH_BANNER } from '@/lib/notifications/copy';

const STORAGE_KEY = 'bluebird:p3_dismissed_at_v1';
const SILENCE_DAYS = 7;

/**
 * P3 — 대시보드 fallback. permission이 granted가 아니고, 최근 7일 내 dismiss 없을 때 노출.
 * denied 상태에서는 노출하지 않음 (브라우저 설정으로만 회복 가능).
 * Spec: docs/strategy/push-infra-review-2026-05-09.md §2.1 (P3)
 */
export default function EnablePushBanner() {
  const { state, enable, loading } = usePushPermission();
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dismissedAt = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
    const fresh = Date.now() - dismissedAt < SILENCE_DAYS * 24 * 60 * 60 * 1000;
    setHidden(fresh);
  }, []);

  if (state === 'unsupported' || state === 'granted' || state === 'denied') return null;
  if (hidden) return null;

  const handleEnable = async () => {
    const r = await enable();
    if (r.ok) setHidden(true);
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setHidden(true);
  };

  return (
    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
      <span className="text-slate-700">{ENABLE_PUSH_BANNER.text}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleEnable}
          disabled={loading}
          className="rounded bg-slate-900 px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          {ENABLE_PUSH_BANNER.cta}
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="닫기"
          className="text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/notifications/EnablePushBanner.tsx
git commit -m "feat(push): EnablePushBanner (P3) — 대시보드 fallback 배너"
```

---

## Task 15: /me page — 21시 체크인 알림 토글

**Files:**
- Modify: `app/me/page.tsx`

- [ ] **Step 1: 현재 /me 구조 확인**

```bash
cat /Users/dongseob/Desktop/Project-BlueBird-mvp/app/me/page.tsx
```

기존 page에는 계정 삭제 등 설정 항목이 있음. 토글은 그 위 또는 적절한 섹션에 삽입.

- [ ] **Step 2: 토글 컴포넌트 추가**

`app/me/page.tsx` 적절한 위치에 다음 컴포넌트 마운트 또는 인라인 추가 (호출 측은 'use client' 컴포넌트여야 함 — `usePushPermission` 사용 때문). `/me`가 server component면 별도 client component로 분리:

`components/notifications/PushToggle.tsx` 신규 생성:

```tsx
'use client';

import { usePushPermission } from './usePushPermission';
import { ME_TOGGLE_LABEL } from '@/lib/notifications/copy';

export default function PushToggle() {
  const { state, loading, enable, disable } = usePushPermission();

  if (state === 'unsupported') {
    return (
      <div className="flex items-center justify-between py-3">
        <span className="text-sm text-slate-700">{ME_TOGGLE_LABEL}</span>
        <span className="text-xs text-slate-400">이 브라우저는 지원하지 않습니다</span>
      </div>
    );
  }

  const enabled = state === 'granted';
  const handleClick = async () => {
    if (enabled) {
      await disable();
    } else if (state === 'denied') {
      // 직접 재요청 불가 — 안내만 노출
      alert('알림이 차단되었습니다. 브라우저 설정에서 푸시를 허용해야 다시 켤 수 있습니다.');
    } else {
      await enable();
    }
  };

  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-slate-700">{ME_TOGGLE_LABEL}</span>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-pressed={enabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          enabled ? 'bg-slate-900' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
```

- [ ] **Step 3: /me 페이지에 마운트**

`app/me/page.tsx`의 적절한 섹션 (예: 설정/알림 영역 또는 계정 정보 다음)에 추가:

```tsx
import PushToggle from '@/components/notifications/PushToggle';

// ... 기존 JSX 안에서, 적절한 섹션 div 내부에:
<PushToggle />
```

- [ ] **Step 4: 수동 검증 (production preview에서만)**

`/me` 진입 → 토글 ON → 권한 grant → DB에 row 생성 → 토글 OFF → DB row 삭제 + service worker unsubscribe.

dev에서는 SW 미작동이므로 토글이 unsupported로 표시될 수 있음. 정상.

- [ ] **Step 5: Commit**

```bash
git add app/me/page.tsx components/notifications/PushToggle.tsx
git commit -m "feat(push): /me에 21시 체크인 알림 토글 추가"
```

---

## Task 16: /checkin — EnablePushCard 마운트

**Files:**
- Modify: `app/checkin/page.tsx`

- [ ] **Step 1: 체크인 성공 처리 위치 확인**

```bash
grep -n "alreadyDone\|체크인.*성공\|setLoading(false)\|router.push\|onSubmit" /Users/dongseob/Desktop/Project-BlueBird-mvp/app/checkin/page.tsx
```

체크인이 성공적으로 저장된 직후의 상태(예: `submitted=true` 또는 success 화면 분기)에서 `<EnablePushCard />` 노출.

- [ ] **Step 2: import + conditional 마운트 추가**

`app/checkin/page.tsx` 상단:

```tsx
import EnablePushCard from '@/components/notifications/EnablePushCard';
```

체크인 성공 후 렌더되는 영역(현재 `alreadyDone` true 또는 submit 직후 상태)에 다음 추가:

```tsx
{/* P2 — 사용자의 첫 체크인 성공 후 1회 노출. 컴포넌트 내부에서 permission/dismiss 게이팅 */}
<EnablePushCard />
```

위치는 성공 메시지·돌아가기 버튼 **아래**에 두어 1차 시각 흐름을 방해하지 않게 한다.

- [ ] **Step 3: 수동 검증**

production preview에서 신규 가입 → 첫 체크인 → 성공 화면에 카드 노출 → "지금 켜기" → permission grant → 토스트 노출 → 카드 사라짐.

- [ ] **Step 4: Commit**

```bash
git add app/checkin/page.tsx
git commit -m "feat(push): /checkin 성공 화면에 EnablePushCard (P2) 마운트"
```

---

## Task 17: /dashboard — EnablePushBanner 마운트

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Streak 카드 위치 확인**

```bash
grep -n "Streak\|streak\|연속" /Users/dongseob/Desktop/Project-BlueBird-mvp/app/dashboard/page.tsx | head
```

- [ ] **Step 2: import + 마운트**

```tsx
import EnablePushBanner from '@/components/notifications/EnablePushBanner';
```

Streak 카드 **바로 아래** (또는 동일 시각 영역 내):

```tsx
{/* P3 — permission이 granted가 아니고 최근 7일 내 dismiss 없을 때만 노출 */}
<EnablePushBanner />
```

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat(push): /dashboard에 EnablePushBanner (P3) 마운트"
```

---

## Task 18: lint-copy 룰 확장

**Files:**
- Modify: `scripts/lint-copy.ts`

- [ ] **Step 1: COMFORT_PATTERNS에 푸시 카피 룰 추가**

`scripts/lint-copy.ts`의 `COMFORT_PATTERNS` 배열에 다음 4개 추가 (기존 패턴 뒤):

```ts
  // 푸시 알림 카피 톤 가드 — push-infra-review-2026-05-09.md §2.4
  { pattern: /오늘\s*하루도/g, label: '응원체 "오늘 하루도"' },
  { pattern: /소중(?:한|해)/g, label: '정서 어휘 "소중"' },
  { pattern: /❤️/g, label: '정서 이모지 "❤️"' },
  { pattern: /🌟/g, label: '정서 이모지 "🌟"' },
```

(`함께`, `응원`은 이미 기존 COMFORT_PATTERNS에 포함되어 있음 — 중복 추가 금지)

- [ ] **Step 2: 실행 — 회귀 없는지 확인**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp
npm run lint:copy
```

Expected: 기존 경고 외에 신규 위반은 0. 신규 카피 파일 `lib/notifications/copy.ts`도 통과.

만약 `lib/notifications/copy.ts`에서 위반이 발생하면 카피를 수정 (분석 톤 위반 신호).

- [ ] **Step 3: Commit**

```bash
git add scripts/lint-copy.ts
git commit -m "feat(push): lint-copy COMFORT_PATTERNS에 푸시 카피 룰 4건 확장"
```

---

## Task 19: iOS PWA 검증 체크리스트 문서

**Files:**
- Create: `docs/qa/push-ios-checklist.md`

- [ ] **Step 1: 체크리스트 문서 작성**

```markdown
# iOS PWA Web Push 검증 체크리스트

**대상:** iOS 16.4 이상 디바이스 1대 이상
**연관 spec:** `docs/strategy/push-infra-review-2026-05-09.md` §3.4, §5.1 R2

## 사전 조건

- [ ] 디바이스 iOS 버전 16.4 이상
- [ ] BlueBird production preview URL 또는 production URL 접근 가능
- [ ] 테스트용 계정으로 가입 가능

## 검증 절차

### 1. 홈 화면 추가 전 동작 (negative test)

- [ ] Safari로 BlueBird URL 접속
- [ ] 가입 + 첫 체크인 완료
- [ ] **기대:** EnablePushCard가 노출되지 않거나, "지금 켜기" 클릭 시 silent fail / 안내 표시 (iOS Safari는 PWA 미설치 상태에서 Web Push 미지원)

### 2. 홈 화면 추가 후 권한 요청

- [ ] Safari 공유 메뉴 → "홈 화면에 추가"
- [ ] 홈 화면 아이콘 탭 → PWA 모드로 BlueBird 실행
- [ ] (가입자라면) `/checkin` 진입 후 첫 체크인
- [ ] EnablePushCard "지금 켜기" 클릭
- [ ] **기대:** iOS native permission dialog 표시
- [ ] "허용" 선택
- [ ] **기대:** 토스트 "켰습니다. 21시에 안 했으면 알림이 와요" 노출

### 3. 알림 수신 (manual cron 호출)

(테스트 진행자가 별도 환경에서)

```bash
curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
  https://<preview-url>/api/cron/checkin-reminder
```

- [ ] iOS 디바이스에 알림 수신
- [ ] 잠금 화면에서도 표시
- [ ] 알림 탭 → BlueBird PWA가 `/checkin`으로 진입

### 4. Opt-out

- [ ] PWA 내 `/me` 진입
- [ ] "21시 체크인 알림" 토글 OFF
- [ ] **기대:** 토글 회색으로 변경
- [ ] manual cron 재호출 → **기대:** 알림 수신되지 않음

### 5. 410 정리 (subscription 회수)

- [ ] iOS 설정 → BlueBird PWA 삭제 (홈 화면에서 제거)
- [ ] manual cron 재호출
- [ ] DB `push_subscriptions` 테이블 확인 → **기대:** 해당 row 삭제됨 (web-push가 410 응답 반환했을 시)

## 알려진 제약

- iOS 16.3 이하: Web Push 미지원. 본 기능 도달 0.
- Safari 일반 (홈 화면 미추가): Web Push 미지원.
- 알림 actions(button): iOS Safari 미지원 — 본 스펙에서 사용 안 함.
```

- [ ] **Step 2: Commit**

```bash
git add docs/qa/push-ios-checklist.md
git commit -m "docs(push): iOS PWA 검증 체크리스트"
```

---

## Task 20: VAPID key rotation runbook

**Files:**
- Create: `docs/runbooks/vapid-key-rotation.md`

- [ ] **Step 1: runbook 작성**

```markdown
# VAPID Key Rotation Runbook

**상태:** 비상 절차 (정기 rotation 권장 주기 미정)
**연관 spec:** `docs/strategy/push-infra-review-2026-05-09.md` §5.2 U6

## 언제 실행하나

- VAPID private key 유출 의심
- VAPID 키 정기 rotation 정책 도입 시 (현재 미설정)

## 영향

**무중단 rotation 불가능.** 새 public key로 client가 재구독해야 하므로:

- 모든 기존 subscription 무효화 → 사용자 재구독 필요
- 일부 사용자는 P3 배너 미응답으로 영구 미수신 상태로 전환될 수 있음
- IM.1 베타 종료 전 rotation은 측정값 분리 야기 — 절대 회피

## 절차

1. **새 VAPID 키쌍 생성**
   ```bash
   npx web-push generate-vapid-keys
   ```

2. **Vercel env 갱신**
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` ← 새 public key
   - `VAPID_PRIVATE_KEY` ← 새 private key
   - 모든 환경(Production, Preview, Development) 동일하게 갱신

3. **재배포**
   ```bash
   git commit --allow-empty -m "ops(push): VAPID rotation"
   git push
   ```

4. **기존 subscription 무효화 (Supabase SQL)**
   ```sql
   TRUNCATE TABLE push_subscriptions;
   ```

5. **사용자 재구독 유도**
   - 다음 `/me` 또는 `/dashboard` 진입 시 토글이 OFF로 표시됨
   - P3 배너가 다시 노출됨 (dismiss 플래그는 로컬에 남아있을 수 있어 사용자별 상이)

6. **모니터링**
   - 다음 21:00 cron 후 `sent` 수치가 평소 대비 90%+ 감소 확인 → rotation 영향
   - 7일 후 재구독율 측정
```

- [ ] **Step 2: Commit**

```bash
git add docs/runbooks/vapid-key-rotation.md
git commit -m "docs(push): VAPID key rotation runbook"
```

---

## Task 21: Production preview 검증 (manual)

**Files:** 없음 (운영 절차)

- [ ] **Step 1: production preview에 배포**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp
git push origin main
# Vercel preview URL 확인 (PR 또는 main의 preview)
```

- [ ] **Step 2: production Supabase에 Migration 14 적용**

`docs/safety-rls-audit-2026-04-25.md` 절차 그대로:
1. Supabase project SQL editor에서 Migration 14 SQL 실행
2. 적용 후 RLS 정책·RPC EXECUTE 권한 확인 (Task 2 Step 3 쿼리 동일)

- [ ] **Step 3: preview에서 신규 계정으로 end-to-end 시나리오**

| 시나리오 | 기대 결과 |
|---|---|
| 신규 가입 → 온보딩 → 첫 체크인 | 성공 화면에 EnablePushCard 노출 |
| "지금 켜기" 클릭 → permission grant | DB `push_subscriptions`에 row 생성, 토스트 노출 |
| `/dashboard` 진입 | EnablePushBanner 미노출 (granted) |
| `/me` 진입 → 토글 OFF | DB row 삭제, 토글 회색 |
| `/me` → 토글 ON | DB row 재생성 |
| 데스크톱 Chrome에서 manual cron 호출 (`curl -H "Authorization: Bearer $CRON_SECRET" preview/api/cron/checkin-reminder`) | 21:00 evening 미체크인 사용자에게 알림 도착 |
| 알림 클릭 | `/checkin` 진입 |

- [ ] **Step 4: iOS 16.4+ 디바이스에서 `docs/qa/push-ios-checklist.md` 절차 수행**

각 항목 체크. 실패 시 G1 일정 재조정.

- [ ] **Step 5: 검증 결과 문서화**

`docs/qa/push-ios-checklist.md`에 검증 일자·OS 버전·기기명·통과 여부를 추기 commit:

```bash
git commit -am "docs(qa): push 인프라 production preview 검증 결과 (YYYY-MM-DD)"
```

---

## 자체 점검 (Spec 대비)

| Spec 요구사항 | 구현 Task |
|---|---|
| §1.1 푸시 인프라 0 → Web Push 인프라 | T1, T11, T12 |
| §1.1 Streak 유지 트리거 (passive → 21시 능동) | T2, T9, T10 |
| §1.2 권한 동의율·거부율·전환율 측정 | (U1 미해결 — 본 plan에 측정 instrumentation 미포함; 별도 후속 plan 또는 plan 확장 필요) |
| §2.1 P2 카드 (최초 체크인 1회) | T13, T16 |
| §2.1 P3 배너 (대시보드 fallback, 7일 silence) | T14, T17 |
| §2.2 알림 카피 C1 단일 + 클릭 → /checkin | T4, T11 |
| §2.3 /me 토글 opt-out | T15 |
| §2.4 lint-copy 룰 확장 | T18 |
| §3.3 Migration 14 + RLS + RPC | T2 |
| §3.4 next-pwa customWorker push handler | T11 |
| §3.5 환경 변수 5종 | T1 |
| §3.6 vercel.json cron 1슬롯 | T10 |
| §3.7 cron handler (Bearer 검증, RPC, allSettled) | T9 |
| §3.8 Unit/Integration tests | T4~T9 |
| §3.8 iOS 체크리스트 | T19 |
| §4.5 production preview 검증 슬롯 | T21 |
| §5.2 U6 key rotation runbook | T20 |

**미해결 (U1, instrumentation):** `notification_events` 테이블·이벤트 적재는 본 plan 범위 외. IM.1 측정값 산출이 필요하므로 G1 이전 또는 직후 별도 mini-plan으로 추가 권장. P2 dismissal·permission state 변화·알림 클릭 추적이 핵심.

**Plan 길이 정합:**
- Tasks 1~21, 평균 5 step per task — 약 100 step
- TDD 패턴 (Task 4~9): 실패 테스트 작성 → 실패 확인 → 구현 → 통과 확인 → commit
- Manual 검증 (Task 1, 11, 15~17, 19~21): 검증 단계로 step 구성

---

## Execution Handoff

**Plan 작성·self-review 완료. 두 가지 실행 옵션 중 선택해주세요.**

### 1. Subagent-Driven (recommended)
- Task별 독립 subagent 디스패치 → 컨텍스트 격리, 검토 사이클 빠름
- 본 plan의 T2(Migration), T4~T6(서버 라이브러리), T13~T15(클라이언트 컴포넌트)는 서로 독립이라 병렬 가능
- `superpowers:subagent-driven-development` 스킬 사용

### 2. Inline Execution
- 본 세션에서 순차 실행 + 체크포인트
- 단일 컨텍스트 유지로 패턴 일관성 ↑, 시간은 더 길게
- `superpowers:executing-plans` 스킬 사용

**어느 쪽으로 진행하시겠습니까?**

(또한 §1.2 측정값 산출을 위한 `notification_events` instrumentation은 본 plan에 없습니다 — IM.1 측정 필수라면 G1 전 별도 plan 추가 여부도 함께 결정 부탁드립니다.)
