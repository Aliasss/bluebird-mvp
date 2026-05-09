# iOS PWA Web Push 검증 체크리스트

**대상:** iOS 16.4 이상 디바이스 1대 이상
**연관 spec:** `docs/strategy/push-infra-review-2026-05-09.md` §3.4, §5.1 R2
**Plan:** `docs/superpowers/plans/2026-05-09-push-infra.md` (Task 19)

## 사전 조건

- [ ] 디바이스 iOS 버전 16.4 이상
- [ ] BlueBird production preview URL 또는 production URL 접근 가능
- [ ] 테스트용 계정으로 가입 가능
- [ ] CRON_SECRET 환경 변수 값 보유 (수동 cron 호출용)

## 검증 절차

### 1. 홈 화면 추가 전 동작 (negative test)

- [ ] Safari로 BlueBird URL 접속
- [ ] 가입 + 첫 체크인 완료
- [ ] **기대:** EnablePushCard가 노출되지 않거나, "지금 켜기" 클릭 시 silent fail / 안내 표시 (iOS Safari는 PWA 미설치 상태에서 Web Push 미지원 — `usePushPermission` hook이 'unsupported'로 반환)

### 2. 홈 화면 추가 후 권한 요청

- [ ] Safari 공유 메뉴 → "홈 화면에 추가"
- [ ] 홈 화면 아이콘 탭 → PWA 모드로 BlueBird 실행
- [ ] (가입자라면) `/checkin` 진입 후 첫 체크인 → `/dashboard?justCheckedIn` 이동
- [ ] EnablePushCard "지금 켜기" 클릭
- [ ] **기대:** iOS native permission dialog 표시
- [ ] "허용" 선택
- [ ] **기대:** 토스트 "켰습니다. 21시에 안 했으면 알림이 와요" 노출

### 3. 알림 수신 (manual cron 호출)

별도 환경(데스크톱 터미널)에서 cron handler 직접 호출:

```bash
curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
  https://<preview-url>/api/cron/checkin-reminder
```

**기대 응답 (JSON):**
```json
{ "sent": 1, "total": 1, "failed": 0 }
```

- [ ] iOS 디바이스에 알림 수신
- [ ] 잠금 화면에서도 표시
- [ ] 알림 탭 → BlueBird PWA가 `/checkin`으로 진입
- [ ] (이미 PWA가 열려 있다면) 기존 윈도우가 focus되어 `/checkin`으로 이동

### 4. Opt-out (`/me` 토글)

- [ ] PWA 내 `/me` 진입
- [ ] "21시 체크인 알림" 토글 OFF
- [ ] **기대:** 토글 회색으로 변경
- [ ] manual cron 재호출 → **기대:** `sent: 0`, 알림 수신되지 않음

### 5. 410 정리 (subscription 회수)

- [ ] iOS 설정 → BlueBird PWA 삭제 (홈 화면에서 제거)
- [ ] manual cron 재호출
- [ ] Supabase `push_subscriptions` 테이블 확인 → **기대:** 해당 row 삭제됨 (web-push가 410 응답을 반환했을 시 `lib/notifications/send.ts`에서 자동 회수)

### 6. P2 dismiss 동작 검증

- [ ] PWA 첫 진입 + 첫 체크인 → P2 카드 표시
- [ ] "나중에" 클릭 → 카드 사라짐
- [ ] PWA 재실행 또는 다시 체크인 → P2 카드 **다시 노출되지 않음** (localStorage `bluebird:p2_dismissed_v1` 영구 플래그)
- [ ] `/dashboard` 진입 → P3 배너 노출 (회복 경로)

### 7. P3 dismiss 동작 검증

- [ ] P3 배너의 ✕ 클릭 → 배너 사라짐
- [ ] PWA 재실행 → P3 배너 노출되지 않음
- [ ] (수동) 7일 후 또는 localStorage `bluebird:p3_dismissed_at_v1` 값을 7일 전으로 조정 후 재진입 → P3 배너 다시 노출

## 알려진 제약 (수용된 사항)

- **iOS 16.3 이하:** Web Push 미지원. 본 기능 도달 0.
- **Safari 일반 (홈 화면 미추가):** Web Push 미지원. PWA 설치 필수.
- **알림 actions 버튼:** iOS Safari 미지원 — 본 스펙에서 사용 안 함.
- **VAPID public key 변경 시:** 모든 기존 구독 무효화 — `docs/runbooks/vapid-key-rotation.md` 참조.

## 검증 결과 기록 (수행자가 기입)

| 항목 | iOS 버전 | 디바이스 | 통과 일자 | 비고 |
|---|---|---|---|---|
| 1. 홈 화면 미추가 negative |  |  |  |  |
| 2. 홈 화면 추가 후 권한 |  |  |  |  |
| 3. 알림 수신 |  |  |  |  |
| 4. Opt-out |  |  |  |  |
| 5. 410 정리 |  |  |  |  |
| 6. P2 dismiss |  |  |  |  |
| 7. P3 dismiss |  |  |  |  |
