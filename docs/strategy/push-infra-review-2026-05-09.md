# 푸시 인프라 도입 — Product·Tech 통합 검토

**작성일:** 2026-05-09
**작성자:** Operator (CPO·CTO 양 관점 통합)
**스펙 상태:** Brainstorming 완료, 구현 plan 작성 직전
**연관 문서:** `docs/strategy/bluebird_retention_mechanisms_v1.md`, `docs/bluebird-mvp-status-2026-05-04.md`, `docs/im1/recruitment-package-2026-05-03.md`

---

## 0. 한 줄 요약

**21:00 KST에 오늘 evening 체크인을 하지 않은 사용자에게만 Web Push로 한 번 리마인더를 보낸다.** 권한 요청은 첫 체크인 완료 직후 컨텍스트 카드(P2)로, 거부·미응답자는 대시보드 배너(P3)로 회복 경로 제공. 채널은 Web Push 단독, 시간대는 KST 단일.

> **Implementation note (2026-05-09 codebase 발견):** `checkins` 테이블은 `type ∈ {morning, evening}` 두 종류. 21:00은 자연스럽게 evening 시간대이므로 본 스펙의 "오늘 체크인 미생성"은 **"오늘 evening 체크인 미생성"**으로 정의함. morning만 체크인한 사용자도 알림 대상에 포함 (저녁 체크인 유도). 결정잠금 §5.4의 "21:00 KST 고정 + 미체크인 조건"은 이 정의로 해석.

---

## 1. Executive Summary

### 1.1 변경 전 → 변경 후

| 영역 | 기존 (2026-05-04 status 기준) | 변경 후 |
|---|---|---|
| 푸시 인프라 | 코드/문서 기준 0 (next-pwa만 존재, service worker 푸시 핸들러 없음) | Web Push 인프라 구축 (VAPID + service worker + cron) |
| Streak 유지 트리거 | `/dashboard` Streak 카드 passive 노출만 | 21:00 KST 미체크인 사용자에 1회 능동 발송 |
| 알림 권한 자산 | 자산 0 | `push_subscriptions` 테이블 + opt-in 사용자 풀 (IM.1 베타 동안 적립) |
| iOS 사용자 도달 | 동일 | iOS 16.4+ + 홈 화면 추가 사용자만 도달 (수용된 제약) |

### 1.2 성공·실패 신호 (IM.1 14일)

| 지표 | 측정 | 합격 기준(가설) |
|---|---|---|
| 권한 동의율 (P2 카드 노출자 중) | `Notification.permission='granted'` 전환 | ≥ 60% |
| 알림 → 체크인 전환율 | 알림 클릭 후 24h 내 checkin 생성 | ≥ 25% |
| 권한 거부율 | `denied` 비율 | ≤ 25% (이상이면 P2 카피·시점 재설계) |
| 북극성 영향 (Δpain) | 알림 노출 그룹 vs 비노출 streak 일치 시 Δpain 차이 | 측정만, 합격선은 IM.1 후 결정 |

### 1.3 비-목표 (NOT building)

- 알림 시각 사용자 지정 — Phase 2
- 적응형(스마트) 발송 — 데이터 부족
- 다중 알림 종류 (재평가/위기/배너) — 본 스펙은 데일리 체크인 1종만
- 이메일·SMS·인앱 알림 — Web Push 단일 채널 정책
- 다중 시간대(TZ) — KST 고정

### 1.4 양 조직 핵심 판단

**CPO 관점:** IM.1 직전이 푸시 인프라 도입 적기. 30명 14일 베타에서 streak 유실이 표본 손실로 직결되며, retention은 PMF 검증의 핵심 변수. 위기는 P2 권한 카드가 "체크인 직후 마찰"로 인지될 가능성 — 카피·노출 정책으로 통제.

**CTO 관점:** 기존 스택(Vercel + Supabase + Next.js 16 + next-pwa)에 새 런타임·새 외부 서비스 추가 없이 구현 가능. 운영 surface 최소화 위해 Vercel Cron + Next.js Route Handler + `web-push` lib + Supabase 테이블 1개 조합. 신규 의존성 1개, 신규 인프라는 cron 1슬롯 + 마이그레이션 13번.

---

## 2. Product (CPO) Detail

### 2.1 권한 요청 UX

#### P2 — 체크인 완료 직후 컨텍스트 카드

**노출 조건:** 사용자의 **최초 체크인**이 성공적으로 저장된 직후, `/checkin` 완료 화면(또는 후속 라우트)에서 `Notification.permission === 'default'`인 경우에만 **1회 한정** 노출. 사용자가 [나중에]를 누르거나 dismiss한 경우 P2는 재노출하지 않으며, **회복 경로는 P3 대시보드 배너로 일원화**한다 (P2 누적 노출로 인한 마찰 방지).

**UX 흐름:**

```
[체크인 저장 성공]
   ↓
[성공 화면 + 권한 카드]
   "매일 21시, 체크인 안 한 날만 알려드릴게요"
   "오늘처럼 한 줄을 기록하면 데이터가 쌓입니다"
   [지금 켜기]  [나중에]
   ↓ "지금 켜기" 클릭
[Notification.requestPermission()]
   ├─ granted → 토스트 "켰습니다. 21시에 안 했으면 알림이 와요" + push subscription 생성·서버 저장
   ├─ denied → 토스트 "알림이 차단되었어요. 브라우저 설정에서 푸시를 허용해야 다시 켤 수 있어요"
   └─ default(닫힘/dismiss) → 변동 없음, P3 배너로 회복 경로 유지
```

**카피 결정:**
- 분석/관찰 톤 (정서 응원·항해 메타포·글리프 ✦✧★☆ 모두 차단 — `lint-copy` 가드 기존 룰과 일치)
- "매일 21시, 체크인 안 한 날만" 명시 — 빈도가 통제됨을 사전 약속하여 거부율↓

#### P3 — 대시보드 fallback 배너

**노출 조건:** `/dashboard` 진입 시 `Notification.permission !== 'granted'` AND (마지막 dismiss 후 7일 경과 OR 첫 진입).

**위치·UI:** Streak 카드 바로 아래, 1줄 + CTA 1개 + dismiss(✕). Streak 카드를 가리지 않음.

**카피:** "21시 미체크인 알림 켜기 — Streak 보호" (분석적, 권장).

**Dismiss 정책:** ✕ 클릭 시 7일 침묵, `denied` 상태에선 노출 안 함 (브라우저 설정으로 가야 풀림 → 안내 텍스트로 대체).

### 2.2 알림 본문 카피

기술 제약: 제목 ~30자(iOS 잘림), 본문 ~120자, action 버튼은 iOS Safari 미지원이므로 사용 안 함.

**채택 카피 (C1):**

| 필드 | 내용 |
|---|---|
| 제목 | `오늘 체크인 안 됐어요` |
| 본문 | `1분이면 한 줄 남길 수 있어요. 지난 7일과 비교 데이터가 쌓입니다.` |
| 클릭 랜딩 | `/checkin` (체크인 작성 화면 직진, `/dashboard` 경유 ❌) |
| tag | `checkin-reminder` (중복 알림 합치기) |

IM.1 14일 동안 동일 카피 유지 → 베타 종료 후 A/B 데이터 기반으로 Phase 2에서 재설계.

### 2.3 Opt-out 경로

| 경로 | 위치 | 동작 |
|---|---|---|
| `/me` 설정 | 신규 토글 "21시 체크인 알림" | OFF 시 `push_subscriptions` row 삭제 + service worker `unsubscribe()` |
| 알림 자체 | (Web Push에 native off 액션 없음) | 안 함 |
| 브라우저 설정 | OS·브라우저별 표준 | 안내 텍스트만 제공 |

`/me` 토글은 반드시 신규 추가. 끄는 길이 1단계여야 거부율(P2)·신뢰가 지켜진다.

### 2.4 카피 가드 / lint-copy 통합

기존 `npm run lint:copy` 가드(항해 메타포 ✦✧★☆ + "회사" 표기 등)에 알림 관련 신규 룰 추가:

- **금지:** `오늘 하루도`, `함께`, `응원`, `소중한`, `❤️`, `🌟`
- **권장:** `관찰`, `기록`, `데이터`, `패턴`, `1분`

신규 카피 파일: `lib/notifications/copy.ts` 단일 출처, lint-copy가 이 파일의 export만 검증.

### 2.5 실패 모드 (사전 수용 리스크)

| 실패 모드 | 영향 | 대응 |
|---|---|---|
| iOS 사용자가 홈 화면 미추가 → 알림 0 | IM.1 30명 중 iOS 비중만큼 도달 손실 | 베타 모집 시 "PWA 설치" 안내 + 모집 데이터에 OS 분포 기록 |
| 권한 거부율 > 25% | P2 카피·시점 결함 신호 | IM.1 D7 시점 측정, P2 카피 단일 변경 후 D8~D14 재측정 |
| 21:00 직전 체크인한 사용자가 알림 받음 (race condition) | 피로도↑, 차단율↑ | cron 실행 시점의 `today_checkin_exists` 쿼리, race window <1초로 수용 |
| 휴면 사용자(14일 미사용)에 계속 발송 | 무의미·차단 유발 | 본 스펙에서는 미해결 — Phase 2에서 "최근 7일 1회 이상 사용자만" 게이팅 추가 |

---

## 3. Tech (CTO) Detail

### 3.1 아키텍처

```
[Browser/PWA]                  [Next.js on Vercel]              [Supabase]

체크인 성공 후 P2 카드
   ↓ 사용자 "지금 켜기"
Notification.requestPermission()
   ↓ granted
swReg.pushManager.subscribe(VAPID_PUBLIC)
   ↓
POST /api/push/subscribe ────────► Route Handler ──────► INSERT
   {endpoint, p256dh, auth}         (auth: Supabase)    push_subs


[Vercel Cron 12:00 UTC = 21:00 KST]
   ↓ Authorization: Bearer CRON_SECRET
POST /api/cron/checkin-reminder ──► Route Handler
                                     │
                                     │ 1. SELECT 미체크인 user_ids ◄ Supabase
                                     │    (service-role key)
                                     │
                                     │ 2. for each subscription:
                                     │    web-push.send(sub, payload)
                                     │      ├ 200 → log
                                     │      ├ 410 → DELETE row     ►
                                     │      └ 404 → DELETE row     ►

[User Device]
service worker `push` → showNotification("오늘 체크인 안 됐어요")
service worker `notificationclick` → openWindow('/checkin')
```

### 3.2 신규 파일 (변경 전: 부재)

```
lib/notifications/
  ├─ copy.ts                      # 알림 카피 단일 출처 (lint-copy 검증 대상)
  ├─ vapid.ts                     # VAPID env 로더 + getter
  └─ send.ts                      # web-push 래퍼 (410/404 정리 포함)

app/api/push/
  ├─ subscribe/route.ts           # POST — 사용자 자신의 subscription 저장
  └─ unsubscribe/route.ts         # POST — 자신의 subscription 삭제

app/api/cron/
  └─ checkin-reminder/route.ts    # 21:00 KST cron 진입점 (Bearer CRON_SECRET)

components/notifications/
  ├─ EnablePushCard.tsx           # P2 (체크인 완료 후)
  └─ EnablePushBanner.tsx         # P3 (대시보드 fallback)

worker/
  └─ index.js                     # next-pwa custom worker (push/notificationclick)

supabase/migrations/
  └─ 14_push_subscriptions.sql    # 마이그레이션 (이전 13_pain_score_range_0_10 다음)

vercel.json                       # 신규 (cron schedule 1슬롯) — 현재 파일 부재 확인됨
docs/qa/push-ios-checklist.md     # iOS PWA 검증 체크리스트
```

**기존 파일 변경:**

- `app/me/page.tsx` — "21시 체크인 알림" 토글 추가
- `app/dashboard/page.tsx` — `<EnablePushBanner />` 마운트
- `app/checkin/page.tsx` (또는 success 화면) — `<EnablePushCard />` conditional 마운트
- `next.config.ts` — next-pwa `customWorkerSrc: 'worker'` 또는 동등 옵션 명시
- `package.json` — `web-push@^3.6.7` 의존성 1개 추가
- `scripts/lint-copy.ts` — 알림 금지/권장 단어 룰 추가

### 3.3 DB Schema (Migration 14)

```sql
create table push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  endpoint    text not null,
  p256dh      text not null,
  auth        text not null,
  user_agent  text,
  created_at  timestamptz not null default now(),
  unique(user_id, endpoint)
);

create index push_subscriptions_user_id_idx on push_subscriptions(user_id);

alter table push_subscriptions enable row level security;

create policy "select own" on push_subscriptions
  for select to authenticated using (auth.uid() = user_id);
create policy "insert own" on push_subscriptions
  for insert to authenticated with check (auth.uid() = user_id);
create policy "delete own" on push_subscriptions
  for delete to authenticated using (auth.uid() = user_id);
-- UPDATE 정책 없음: subscription은 갱신되지 않음 (변경 시 새 endpoint로 재구독)
-- service_role은 RLS 우회 → cron에서 사용
```

기존 RLS 감사 통과 패턴 (`docs/safety-rls-audit-2026-04-25.md`) 준수: per-row owner check, deny-by-default.

**RPC function (단일 round-trip):**

```sql
create or replace function users_without_today_checkin_with_push()
returns table(user_id uuid, endpoint text, p256dh text, auth text)
language sql security definer as $$
  select ps.user_id, ps.endpoint, ps.p256dh, ps.auth
  from push_subscriptions ps
  where ps.user_id not in (
    select c.user_id from checkins c
    where c.created_at >= (now() at time zone 'Asia/Seoul')::date at time zone 'Asia/Seoul'
  );
$$;
```

`security definer` 사용 시 검색 경로 고정 + RLS 감사 절차 준수.

### 3.4 Service Worker 통합 (next-pwa)

**제약:** `dev는 turbopack, build는 webpack` (next-pwa 호환). dev에서 SW 비활성, **production preview에서만 검증 가능**.

**전략:** next-pwa의 `customWorkerSrc` 옵션으로 `worker/index.js`를 자동 SW에 append. 직접 SW 파일을 작성하지 않음 (Workbox precaching 충돌 회피).

```js
// worker/index.js — next-pwa가 자동 생성된 sw.js에 append
self.addEventListener('push', (event) => {
  const payload = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icon-192.png',
      data: { url: payload.url ?? '/checkin' },
      tag: 'checkin-reminder',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/checkin';
  event.waitUntil(clients.openWindow(url));
});
```

### 3.5 환경 변수 (Vercel project env)

| 키 | 노출 | 용도 |
|---|---|---|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | client | `pushManager.subscribe()` applicationServerKey |
| `VAPID_PRIVATE_KEY` | server | `web-push.setVapidDetails` |
| `VAPID_SUBJECT` | server | `mailto:` (operator 연락처) |
| `CRON_SECRET` | server | Vercel cron Authorization 검증 |
| `SUPABASE_SERVICE_ROLE_KEY` | server | (기존) cron handler에서 RLS 우회용 |

**키 생성:** `npx web-push generate-vapid-keys` 1회 실행 → Vercel env에 수동 저장. 키 파일은 git 비커밋, `.env.local` gitignore 기존 정책 유지.

### 3.6 Cron 설정 (vercel.json)

```json
{
  "crons": [
    { "path": "/api/cron/checkin-reminder", "schedule": "0 12 * * *" }
  ]
}
```

- `0 12 * * *` UTC = 21:00 KST 고정 (한국 DST 없음 → 영구 안정)
- Vercel Hobby tier: daily cron 무료. 현재 비용 가산 0
- **현재 `vercel.json` 파일은 부재** — 신규 생성. 기존 cron 슬롯 점유 0건 확인됨 (2026-05-09)
- 핸들러 진입점에서 `request.headers.get('authorization') === 'Bearer ' + CRON_SECRET` 검증, 불일치 시 401

### 3.7 발송 핵심 로직 (의사코드)

```ts
// app/api/cron/checkin-reminder/route.ts
export async function POST(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const { data: targets } = await supabase.rpc('users_without_today_checkin_with_push');

  const results = await Promise.allSettled(
    targets.map((t) =>
      sendCheckinReminder(
        { endpoint: t.endpoint, keys: { p256dh: t.p256dh, auth: t.auth } },
        t.user_id
      )
    )
  );

  // 410/404 응답 → push_subscriptions DELETE (send.ts 내부 처리)
  return Response.json({ sent: results.filter((r) => r.status === 'fulfilled').length });
}
```

### 3.8 테스트 전략

| 레이어 | 도구 | 검증 |
|---|---|---|
| Unit | vitest | `copy.ts` lint-copy 통과 / `send.ts` 410·404 → DELETE 분기 |
| Integration | vitest + Supabase test client | subscribe/unsubscribe round-trip / cron RPC가 미체크인 사용자만 반환 |
| E2E manual | 실 디바이스 3종 | Mac Chrome / Android Chrome / iOS 16.4+ PWA |
| iOS 체크리스트 | `docs/qa/push-ios-checklist.md` 신규 | 홈 화면 추가 후에만 권한 요청 가능 / 잠금화면 노출 / 미설치 Safari에서 silent fail |

기존 vitest 인프라(`vitest.config.ts`) 그대로 활용. 신규 test 도구 추가 0.

### 3.9 비용 분석

| 항목 | IM.1 (30명) | 1만 명 규모 |
|---|---|---|
| Vercel Cron | $0 (Hobby 1/day 무료) | $0 (Pro 가입 시 무제한) |
| Supabase row | ~30 row | ~10k row, 무시 |
| web-push 발송 | ~30/day, $0 | ~3k/day, $0 (Mozilla Push Service / FCM Web 무료) |
| VAPID | 자체 생성, $0 | $0 |
| **합계** | **$0** | **$0** (Pro $20/mo는 일반 운영비, 푸시 전용 비용 0) |

---

## 4. 일정·우선순위·작업 분해

### 4.1 IM.1 정합

| 마일스톤 | 시점 (IM.1 D-day 기준) | 결정사항 |
|---|---|---|
| **G1: 푸시 인프라 production 배포 완료** | IM.1 D-3 | 모든 베타 테스터가 가입 직후 P2 카드를 만나도록 |
| G2: 실 디바이스 수신 검증 통과 | IM.1 D-2 | iOS·Android·desktop 각 1대 이상 |
| G3: IM.1 시작 | D0 | 베타 모집 SMTP stagger 발송 (memory 별도 가이드) |
| G4: 권한 동의율·거부율 1차 측정 | D+7 | 거부율 > 25% 시 카피 단일 수정 |
| G5: 알림→체크인 전환율 측정 | D+14 (베타 종료) | Phase 2 격상 의사결정 입력값 |

**현재 상태:** 도메인 미취득. 베타 시작은 도메인 취득에 종속되므로, 푸시 인프라 작업은 도메인 작업과 병렬 진행 가능. D-day 미정 상태에서도 G1까지 사전 완료해 두는 것이 합리적.

### 4.2 작업 분해 (Work Breakdown)

총 7개 milestone, **critical path M1 → M2 → M3 → M4 → M6**.

```
M1 ──► M2 ──► M3 ──┐
              │     ├──► M6 ──► G1
              └► M4 ┤
                    │
              M5 ───┘
```

| ID | 단위 | 의존 | 추정 (1인 집중) | 산출물 |
|---|---|---|---|---|
| M1 | 인프라 준비 | — | 1h | VAPID 키 생성, `web-push` 설치, Vercel env 5종 등록 |
| M2 | 데이터 레이어 | M1 | 2~3h | Migration 14 + RLS + index + RPC, 로컬·production Supabase 적용 |
| M3 | 서버 레이어 | M2 | 4~6h | `/api/push/{subscribe,unsubscribe}`, `/api/cron/checkin-reminder`, `lib/notifications/{copy,vapid,send}.ts`, `vercel.json` |
| M4 | 클라이언트·SW 레이어 | M1 | 6~8h | `worker/index.js`, `next.config.ts` customWorker, `EnablePushCard`/`EnablePushBanner`, `/me` 토글, `/checkin`·`/dashboard` 마운트 |
| M5 | 카피 가드 | — | 1~2h | `copy.ts` 단일 출처, `scripts/lint-copy.ts` 룰 확장 |
| M6 | 테스트·검증 | M3, M4, M5 | 4~6h | Unit/Integration vitest, production preview 1회 cron 수동 발송, iOS 16.4+ PWA 실 디바이스 검증, `docs/qa/push-ios-checklist.md` 작성 |
| M7 | IM.1 운영 | G1 통과 후 | ongoing (14일) | D7·D14 측정, 거부율 임계 초과 시 카피 단일 수정 |

**총 추정 18~26시간 = 집중 작업 3~4 working day** (1인 operator). next-pwa SW 통합(M4) 변수 1일 buffer 포함 시 **실질 4~5 day**.

### 4.3 우선순위 매트릭스 (G1 기준)

| 작업 | Must / Should / Nice |
|---|---|
| Migration 14 + RLS + RPC | Must — 없으면 발송 자체 불가능 |
| `/api/cron/checkin-reminder` + 인증 | Must — 본 기능의 본체 |
| Service worker push handler | Must — 수신 자체가 안 됨 |
| EnablePushCard (P2) | Must — 권한 풀이 0이면 모든 후속 무의미 |
| `web-push` 410/404 → DELETE 회수 | Must — 부재 시 좀비 subscription 누적 |
| EnablePushBanner (P3) | Must — §5.4 결정잠금 항목. 회복 경로 부재 시 P2 dismiss 사용자가 영구 미수신 상태로 고착됨. 단순 컴포넌트 1개라 descope 실익도 적음 |
| `/me` 토글 (opt-out) | Must — opt-out 부재는 신뢰·법적 리스크 |
| lint-copy 신규 룰 | Must — 1인 운영자가 카피 일관성 유지 안전망 |
| iOS 체크리스트 문서 | Should — 베타 모집 안내문 입력값 |
| 적응형 발송 / TZ 다중 / 휴면 게이팅 | Nice (out of scope) — Phase 2 |

### 4.4 병렬화 지점

- M3 / M4 / M5는 서로 독립 — 같은 작업자라도 컨텍스트 분리해 batch 가능
- subagent 활용 후보 (executing-plans 단계):
  - "Migration 14 작성·적용" 단일 subagent
  - "lib/notifications/copy.ts + lint-copy 룰 확장" 단일 subagent
  - "worker/index.js + next.config.ts 통합" 단일 subagent
  - 모두 무상태·격리 가능 → `dispatching-parallel-agents` 패턴 적합

### 4.5 G1 → G2 검증 슬롯 (반드시 확보)

production preview에서만 검증 가능한 사항:

| 항목 | 검증 방법 |
|---|---|
| SW push handler 실제 동작 | preview URL을 PWA로 설치 → preview cron handler 수동 호출 → 실 디바이스 알림 수신 확인 |
| iOS 16.4+ PWA 권한 흐름 | 홈 화면 추가 → P2 카드 → 권한 grant → 잠금화면 알림 |
| 410/404 회수 | dev에서 강제 unsubscribe 후 cron 실행 → DB row 자동 삭제 확인 |
| dev(turbopack)에서 SW 미동작 | 정상 처리, 회귀 신호 아님 |

**dev에서 푸시 동작 검증 시도하지 말 것.** production preview만 신뢰 가능.

### 4.6 외부 의존·블로커

| 항목 | 상태 | 영향 |
|---|---|---|
| 도메인 취득 | 미완 | IM.1 시작에만 영향. 푸시 작업과 무관 — 병렬 진행 가능 |
| iOS 16.4+ 디바이스 확보 | 운영자 자체 확인 필요 | 부재 시 베타 테스터 1명 사전 검증 협조 의뢰 (G2 1일 지연 수용) |
| Vercel Cron 다른 슬롯 점유 여부 | **2026-05-09 확인: `vercel.json` 부재, 기존 슬롯 0** | Hobby 1/day 한도 충분 |
| Supabase production 마이그레이션 권한 | 기존 경로 (마이그레이션 06~12 동일) | 신규 절차 불요 |

---

## 5. 리스크·미해결 이슈·Phase 2 Backlog

### 5.1 리스크 매트릭스

| # | 리스크 | 확률 | 영향 | 통제 | 잔여 위험 |
|---|---|---|---|---|---|
| R1 | next-pwa + customWorker SW 통합 실패 | 중 | 높음 (G1 일정 슬립) | M6 production preview 검증, M4 1일 buffer | 통제 후 낮음 |
| R2 | iOS 도달 손실 (홈 화면 미추가) | 높음 | 중 (표본 X% 손실) | 베타 모집 안내문 PWA 설치 절차 + OS 분포 기록 | 수용 — 분석가형 페르소나 가설 |
| R3 | 권한 거부율 > 25% | 중 | 중 (P2 결함 신호) | D7 측정 → 카피 단일 변경 1회 허용 | 수용 — Phase 2 입력값 |
| R4 | VAPID private key 유출 | 낮음 | 매우 높음 | Vercel env, git 비커밋, key rotation 절차 사전 문서화 | 통제 |
| R5 | CRON_SECRET 유출 | 낮음 | 높음 (외부 임의 발송) | Vercel env, Bearer 검증, secret rotation | 통제 |
| R6 | 21:00 직전 체크인 race condition | 높음 | 매우 낮음 | RPC 단일 round-trip, race window <1초 | 수용 |
| R7 | Mozilla/FCM Push Service 장애 | 매우 낮음 | 중 (해당 시간대 미발송) | 외부 SLA 의존, 재시도 1회만 | 수용 — 다음 날 자연 회복 |
| R8 | dev(turbopack)에서 SW 미동작 | 100% | 매우 낮음 | 정상 처리, production preview만 신뢰 | 수용 |

### 5.2 본 스펙 미해결 (구현 단계에서 답해야 할 것)

| # | 이슈 | 답해야 할 시점 | 권장 처리 |
|---|---|---|---|
| U1 | 분석 이벤트 instrumentation — 권한 동의율·알림→체크인 전환율을 어디서 측정? | implementation plan 작성 시 | 신규 테이블 `notification_events`(user_id, event_type ∈ {prompt_shown, granted, denied, dismissed, push_sent, push_clicked}, created_at)에 자체 적재 + Supabase view로 funnel 산출. PostHog 등 외부 도입 ❌ |
| U2 | P2 카드의 정확한 마운트 위치 — `/checkin` page 내부인가, success 화면인가, 토스트인가 | M4 구현 직전 | `/checkin` 현 코드 확인 후 결정. 단일 라우트 내 conditional 노출 우선 |
| U3 | iOS 16.4+ 디바이스 확보 — 운영자 본인 보유 여부 | M6 검증 직전 | 미보유 시 베타 테스터 1명 사전 검증 협조 (G2 1일 지연 수용) |
| U4 | 법적 동의 처리 — 브라우저 native permission이 한국 정보통신망법상 마케팅 정보 수신 동의로 충분한가 | M3 구현 직전 | 운영자 잠정 해석: "BlueBird 알림은 마케팅이 아닌 사용자 작업 리마인더이므로 정보통신망법 §50의 마케팅 동의 요건과 무관". `app/terms/page.tsx`에 1줄 추가 권장. **본 해석은 운영자 자체 판단이며, 알림 카피에 마케팅성 문구가 추가되는 시점(예: Phase 2 A/B 카피)에는 별도 법률 자문 필수** |
| U5 | Vercel Cron 다른 슬롯 점유 여부 | M1 직전 | **2026-05-09 해소: `vercel.json` 부재 확인** |
| U6 | Key rotation 절차 문서화 | M1 직후 | `docs/runbooks/vapid-key-rotation.md` 신규. 무중단 rotation 불가능 명시 |

### 5.3 Phase 2 Backlog

베타 종료(D+14) 데이터를 입력값으로 의사결정. 우선순위 가설순:

1. **휴면 사용자 게이팅** — `최근 7일 1회 이상 사용` 조건 추가. IM.1 동안 수용한 부채 1순위 회수
2. **재평가 리마인더(A 시나리오)** — Phase 1 인프라에 use case 1종 증분. `intervention 생성 + 6h~48h` 트리거. 본 스펙의 `notification_events` 인프라 그대로 재사용
3. **사용자 지정 시각** — `/me` 토글 옆 시각 picker 추가. cron N슬롯 확장 (Vercel Pro 필요)
4. **A/B 카피 실험 인프라** — `notification_events`에 `variant` 컬럼 추가, Supabase view에 cohort split. 외부 A/B 도구 도입 ❌
5. **trigger_category 60일 재방문 알림** — 기존 dashboard 배너 → push 격상
6. **위기 follow-up** — Web Push로 가능한 형태 (24h 안전 확인). 카피·법적 검토 별도. 본 스펙 정책상 이메일 fallback 없음
7. **적응형(스마트) 발송** — IM.1 데이터로 사용자별 평균 체크인 시각 학습 가능 시 검토
8. **다중 시간대(TZ)** — 글로벌 사용자 발생 시. 현 IM.1엔 무의미

### 5.4 결정 잠금 (Decision Lock)

본 스펙 완료 시점에 **다음 결정은 IM.1 종료 전까지 변경 금지** (변경 시 표본 분리·측정 불가):

- ✅ Use case = 데일리 체크인 1종만
- ✅ 발송 트리거 = 21:00 KST 고정 + 미체크인 조건
- ✅ 권한 UX = P2 + P3 병행
- ✅ 채널 = Web Push only
- ✅ TZ = KST 단일
- ✅ 알림 카피 = C1 단일 (D7 거부율 임계 초과 시 1회 단순 단어 치환만 허용)

위 6항목 변경은 별도 spec 개정 + IM.1 표본 재모집 없이는 불가.

---

## 6. 합의 요약 (조직 검토 결과)

| 관점 | 합의 사항 |
|---|---|
| CPO | IM.1 직전이 푸시 인프라 도입 적기. 카피·UX 가드(lint-copy 룰)로 BlueBird 정체성 안전망 확보. iOS 도달 손실은 페르소나 가설로 수용. **Phase 2 backlog 1순위 = 휴면 사용자 게이팅** |
| CTO | 신규 외부 의존 0, 신규 패키지 1개(`web-push`), 마이그레이션 13번 자연 연속, $0 추가 운영비. **잔여 우려 = next-pwa SW 통합 (M4)** — production preview 검증 슬롯 필수 |

**의사결정:** 본 스펙 승인 → `writing-plans` 스킬로 implementation plan 작성 진행.
