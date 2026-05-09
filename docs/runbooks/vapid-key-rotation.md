# VAPID Key Rotation Runbook

**상태:** 비상 절차 (정기 rotation 권장 주기 미정)
**연관 spec:** `docs/strategy/push-infra-review-2026-05-09.md` §5.2 U6
**Plan:** `docs/superpowers/plans/2026-05-09-push-infra.md` (Task 20)

## 언제 실행하나

- VAPID private key 유출 의심
- VAPID 키 정기 rotation 정책 도입 시 (현재 미설정)
- VAPID 키 알고리즘 deprecation 발생 시 (현재 미발생)

## 영향 (반드시 사용자 사전 공지)

**무중단 rotation 불가능.** 새 public key로 모든 client가 재구독해야 하므로:

- 모든 기존 push subscription 무효화 → 사용자 재구독 필요
- 일부 사용자는 P3 배너 미응답으로 영구 미수신 상태로 전환될 수 있음
- IM.1 베타 종료 전 rotation은 측정값 분리(D1~D7 vs D8~D14) 야기 — **절대 회피**
- iOS PWA 사용자는 PWA 재실행 + 권한 재요청 필요 (홈 화면 PWA 유지)

## 절차

### 1. 새 VAPID 키쌍 생성

```bash
npx web-push generate-vapid-keys
```

**키는 절대 commit 금지.**

### 2. Vercel env 갱신

Vercel project Settings → Environment Variables:

- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` ← 새 public key
- `VAPID_PRIVATE_KEY` ← 새 private key

모든 환경(Production, Preview, Development) 동일하게 갱신.

### 3. 재배포

```bash
git commit --allow-empty -m "ops(push): VAPID key rotation"
git push origin main
```

Vercel 자동 배포 대기.

### 4. 기존 subscription 무효화 (Supabase SQL editor)

```sql
TRUNCATE TABLE push_subscriptions;
```

### 5. 사용자 재구독 유도

자동:
- 다음 `/me` 또는 `/dashboard` 진입 시 토글이 OFF로 표시
- P3 배너가 다시 노출 (단, 사용자별 localStorage `bluebird:p3_dismissed_at_v1` 잔존 시 7일 침묵)

수동 (필요 시):
- 운영자가 베타 그룹에 별도 안내 (이메일·DM)
- "21시 알림 다시 켜주세요" 메시지

### 6. 모니터링 (rotation 후 24~72h)

- 다음 21:00 cron 후 응답 `total` 값이 평소 대비 90%+ 감소 확인 → rotation 영향 정상 반영
- 7일 후 재구독율 측정 (`SELECT COUNT(*) FROM push_subscriptions`)
- 50% 미만 회복 시 사용자 안내 보강

## 비상 롤백

새 키 도입 후 문제 발생 시 롤백 가능 여부:

- **Vercel env를 이전 키로 되돌리기**: 가능. 이미 새 키로 구독한 사용자는 재구독 필요
- **이전 push_subscriptions 데이터 복구**: TRUNCATE 직후라면 Supabase point-in-time restore로 가능. 시간 지연 시 손실 누적

→ 결론: rotation은 **반드시 retest 가능 시점(주말 등 트래픽 낮은 시간대)에 실행**.

## 책임자

운영자(현재 1인 운영). rotation 실행 전 본 runbook 6단계 모두 1회 dry-run 권장.
