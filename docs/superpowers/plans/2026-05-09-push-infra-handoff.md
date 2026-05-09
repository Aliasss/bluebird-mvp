# 푸시 인프라 구현 — 자율 실행 핸드오프

**실행 일자:** 2026-05-09 ~ 2026-05-10 (자율 실행 모드)
**Spec:** `docs/strategy/push-infra-review-2026-05-09.md`
**Plan:** `docs/superpowers/plans/2026-05-09-push-infra.md`
**최종 commit:** `f1e4bd5`

---

## 완료된 작업 요약

| Phase | 내용 | 산출물 | 상태 |
|---|---|---|---|
| B+C+D | 데이터 + 서버 라이브러리 | Migration 14, lib/notifications/{copy,vapid,send}.ts, lib/supabase/service.ts | ✅ |
| D' | API routes + cron | /api/push/{subscribe,unsubscribe}, /api/cron/checkin-reminder, vercel.json | ✅ |
| E | Service worker + 클라이언트 | worker/index.js, next.config customWorker, usePushPermission, EnablePushCard, EnablePushBanner, PushToggle | ✅ |
| F | Page 통합 | /dashboard P2/P3 마운트, /me 토글 | ✅ |
| G | 카피 가드 | scripts/lint-copy.ts COMFORT_PATTERNS 4건 확장 | ✅ |
| H | 문서 | docs/qa/push-ios-checklist.md, docs/runbooks/vapid-key-rotation.md | ✅ |
| I | 측정 instrumentation | Migration 15 (notification_events 테이블 + 14 event types + view), lib/notifications/events.ts, /api/notifications/event, hook/components/cron 통합 | ✅ |

**테스트:** 27 신규 테스트 (notifications 도메인 전체) + 회귀 0건. 전체 154/154 passing.
**Typecheck:** clean (`npm run lint`).
**Lint-copy:** 신규 푸시 카피 위반 0건 (기존 4건은 사전-존재 항해 메타포 경고).

---

## ⚠️ 사용자 직접 수행 필요 (자율 실행 불가)

### Step 1. VAPID 키 생성 + Vercel env 등록

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp
npx web-push generate-vapid-keys
```

출력된 Public/Private Key를 Vercel project Settings → Environment Variables에 다음 5개 등록:

| Key | Value | Type | 환경 |
|---|---|---|---|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | (생성된 Public Key) | Plaintext | Production, Preview, Development |
| `VAPID_PRIVATE_KEY` | (생성된 Private Key) | Sensitive | Production, Preview, Development |
| `VAPID_SUBJECT` | `mailto:seob6615@gmail.com` | Plaintext | Production, Preview, Development |
| `CRON_SECRET` | `openssl rand -hex 32` 결과 | Sensitive | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | (이미 설정됨, 확인만) | Sensitive | Production, Preview, Development |

`.env.local`에도 동일 값 복사 (gitignore 보호됨).

### Step 2. Migration 14 + 15 production Supabase 적용

Supabase project SQL editor에서 다음 두 파일 내용을 순서대로 실행:

1. `supabase/migrations/14_push_subscriptions.sql`
2. `supabase/migrations/15_notification_events.sql`

검증 쿼리:

```sql
-- 14 검증
SELECT relrowsecurity FROM pg_class WHERE relname = 'push_subscriptions'; -- t
SELECT polname FROM pg_policy WHERE polrelid = 'push_subscriptions'::regclass;
-- expected: 3 policies (select_own, insert_own, delete_own)
SELECT * FROM users_without_today_evening_checkin_with_push();
-- expected: 0 rows, no error

-- 15 검증
SELECT relrowsecurity FROM pg_class WHERE relname = 'notification_events'; -- t
SELECT * FROM v_push_funnel; -- expected: 1 row, all zeros
```

`docs/safety-rls-audit-2026-04-25.md` 절차 준수.

### Step 3. Production 배포 + preview 검증

```bash
git push origin main  # 자율 실행이 이미 push했을 시 생략
```

Vercel 자동 배포 후:

1. Production preview URL에 PWA로 접속
2. 신규 계정 가입 → 첫 체크인 → /dashboard?justCheckedIn 진입 시 EnablePushCard(P2) 노출 확인
3. 데스크톱 터미널에서 cron handler 수동 호출:
   ```bash
   curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
     https://<preview-url>/api/cron/checkin-reminder
   ```
   응답: `{ "sent": N, "total": N, "failed": 0 }`
4. 테스트 디바이스에 알림 수신 확인

### Step 4. iOS 16.4+ 디바이스 검증

`docs/qa/push-ios-checklist.md` 체크리스트 7개 항목 수행. iOS 디바이스 미보유 시 베타 테스터 1명 사전 협조 의뢰.

### Step 5. IM.1 D7·D14 측정 (운영 단계)

D7 시점 KPI 산출:

```sql
-- service_role 또는 Supabase studio에서
SELECT * FROM v_push_funnel;
```

| 지표 | 산출 |
|---|---|
| 권한 동의율 | `unique_granted / p2_unique_shown` |
| 권한 거부율 | `unique_denied / p2_unique_shown` |
| 알림 → 체크인 전환율 | `total_clicked / total_sent` |

거부율 > 25% 시 카피 단일 변경 1회 허용 (§5.4 결정잠금 예외).

---

## Git 히스토리 (2026-05-09 이후 commit)

```
f1e4bd5 feat(push): IM.1 측정 instrumentation (Migration 15 + 14 event types)
dd9b603 docs(push): T19-T20 iOS 검증 체크리스트 + VAPID rotation runbook
384ea82 feat(push): T18 lint-copy COMFORT_PATTERNS에 푸시 카피 룰 4건 확장
931e023 feat(push): T16-T17 dashboard + /me wire-up
8e19a3c feat(push): T11-T14 service worker + 클라이언트 컴포넌트
3093898 feat(push): T7-T10 API routes + cron + vercel.json (23 tests passing)
89a525b feat(push): T1-T6 인프라 + 데이터 + 서버 라이브러리 (12 tests passing)
b93f7a8 docs(plans): 푸시 인프라 implementation plan 21 tasks + spec 보정
491fab8 docs(strategy): 푸시 인프라 도입 Product·Tech 통합 검토 (IM.1 D-3 G1)
```

---

## 변경된 파일 (최종 상태)

### 신규 (18개)

```
lib/supabase/service.ts
lib/notifications/copy.ts
lib/notifications/vapid.ts
lib/notifications/send.ts
lib/notifications/events.ts
app/api/push/subscribe/route.ts
app/api/push/unsubscribe/route.ts
app/api/cron/checkin-reminder/route.ts
app/api/notifications/event/route.ts
components/notifications/usePushPermission.ts
components/notifications/EnablePushCard.tsx
components/notifications/EnablePushBanner.tsx
components/notifications/PushToggle.tsx
worker/index.js
supabase/migrations/14_push_subscriptions.sql
supabase/migrations/15_notification_events.sql
vercel.json
docs/qa/push-ios-checklist.md
docs/runbooks/vapid-key-rotation.md
tests/notifications/{copy,vapid,send,subscribe,unsubscribe,cron,event}.test.ts
```

### 수정 (5개)

```
package.json + package-lock.json (web-push, @types/web-push 추가)
next.config.ts (customWorkerSrc/Dest)
app/checkin/page.tsx (push_clicked 이벤트 트리거)
app/dashboard/page.tsx (justCheckedIn state + P2/P3 마운트)
app/me/page.tsx (PushToggle 마운트)
scripts/lint-copy.ts (COMFORT_PATTERNS 4건)
```

---

## 결정잠금 (§5.4 재확인)

본 구현은 다음 6항목을 잠금 상태로 유지:

- ✅ Use case = 데일리 체크인 1종만
- ✅ 발송 트리거 = 21:00 KST 고정 + evening 미체크인 조건
- ✅ 권한 UX = P2 + P3 병행
- ✅ 채널 = Web Push only
- ✅ TZ = KST 단일
- ✅ 알림 카피 = C1 단일 (D7 거부율 임계 초과 시 1회 단순 단어 치환만 허용)

---

## 알려진 제약 (수용)

- iOS 16.3 이하 사용자는 도달 0
- 일반 Safari (홈 화면 미추가) 사용자는 도달 0
- dev(turbopack)에서는 SW 미작동 — production preview만 신뢰
- 21:00 직전 체크인 race condition (window <1초)
- Mozilla/FCM Push Service 장애 시 해당 시간대 미발송 (다음 날 자연 회복)

---

## Phase 2 Backlog (IM.1 종료 후)

§5.3 그대로 유지:
1. **휴면 사용자 게이팅** — 1순위
2. 재평가 리마인더 (시나리오 A) — 본 인프라 재사용
3. 사용자 지정 시각 (B3)
4. A/B 카피 실험 인프라 (`notification_events.metadata.variant`)
5. trigger_category 60일 재방문 알림
6. 위기 follow-up (C)
7. 적응형 발송 (B4)
8. 다중 시간대(TZ)
