# 폐쇄 베타 운영 가이드 — 2026-05-17 (2026-05-18 v2 갱신)

**전제:** BlueBird MVP는 IM.1 폐쇄 베타로 운영. **가입·인증은 누구나 가능 + 서비스 진입은 승인자만**.
**기술 근거:**
- Migration 18 (`18_closed_beta_whitelist.sql`) — selected_emails 테이블·트리거 신설 (트리거는 19에서 제거됨)
- Migration 19 (`19_approval_gate.sql`) — 트리거 제거 + `is_current_user_approved()` RPC + 기존 4명 사전 등록
- `proxy.ts` (root) — 보호 경로 진입 시 RPC 호출 → 미승인 시 `/waitlist` 리다이렉트
- `app/waitlist/page.tsx` — 승인 대기 안내 UI

**v1 (트리거 차단) → v2 (게이트 차단) 전환 이유 (CPO/CSO/CTO 합의):**
- CPO: 트리거의 "Database error" 노출이 사용자 혼란 야기 → 가입 허용 + 게이트 안내가 멘탈모델 명료
- CSO: 미승인자도 잠재 관심자 → 데이터 보존이 launch 시 lead 풀
- CTO: middleware = 단일 게이트, 변경 위험 낮음. RPC = SECURITY DEFINER 로 RLS 우회 안전 검사

---

## 1. 구조 한눈에 (v2)

```
[비회원] → /apply (anon INSERT, user_id=NULL) → evangelist_applications.status='pending'
                                                          │
                                                          ▼
[운영자] 검토 → 선발자 결정 → selected_emails INSERT (service_role)
                                              │
                                              ├─ 응모자에게 가입 안내 메일 발송 (선택)
                                              │
                                              ▼
[누구든] /auth/signup → auth.users 가입 ✅ → 이메일 인증 ✅
                              │
                              ▼
[보호 경로 진입 시] middleware → is_current_user_approved() RPC
                          │
                          ├─ email IN selected_emails → 통과 (서비스 정상 이용)
                          └─ 외 → /waitlist 리다이렉트 (안내 + /apply 링크)
```

---

## 2. 응모 검토 — 어드민 UI (권장)

**URL:** `https://bluebird-mvp.vercel.app/admin/applications`
**접근 조건:** env `ADMIN_EMAILS` 에 등록된 이메일로 로그인.

### 2-0. ENV 설정 (필수)

운영자 이메일을 다음 두 곳에 모두 설정해야 어드민 진입 가능:

1. **로컬 개발** — `.env.local` 추가:
   ```bash
   ADMIN_EMAILS=mvp.bluebird@gmail.com
   ```
2. **Vercel 프로덕션** — Project Settings → Environment Variables 추가:
   - Key: `ADMIN_EMAILS`
   - Value: `mvp.bluebird@gmail.com` (또는 콤마 구분 다중 이메일)
   - Environment: Production (+ Preview 필요시)

설정 후 재배포 필요. 미설정 시 `/admin/*` 모든 경로 자동 차단 (fail-safe).

### 2-1. 화면 구성

- 통계 헤더 (대기·선발·미선발·철회 카운트)
- 응모 카드 (대기 먼저 노출, 그 다음 최신순)
- 각 카드: 이메일·연령·동의 3종·UTM·답변 5문항 + `[선발]` `[미선발]` 버튼

### 2-2. 선발 흐름

1. 대기 응모 카드의 `[선발]` 클릭
2. 확인 다이얼로그 → 확인
3. API `/api/admin/approve` 호출:
   - `selected_emails` upsert (email PK, 기존이면 application_id 갱신)
   - `evangelist_applications.status = 'selected'`
4. 페이지 자동 새로고침 → 카드가 "선발" 상태로 표시
5. 선발자에게 가입 안내 메일 별도 발송 (운영자 수동 — §3 참고)

### 2-3. 미선발 흐름

`[미선발]` 클릭 → status='rejected' 만 갱신. selected_emails 변경 없음.

### 2-3'. 선발자에게 안내 메일 발송

선발 처리 후 카드 하단에 `[선발 안내 메일 보내기 ✉]` 버튼 노출. 클릭 시 본인 메일 클라이언트(Gmail 등)로 prefill된 mailto 링크가 열립니다.
- Subject: `[BlueBird] MVP 에반젤리스트 선발 안내 — 가입 진행 요청`
- Body: 가입 URL + 동일 이메일 가입 강조 + 다음 단계 (lib/copy/admin-email.ts SSOT)
- 발송 전 검토·수정 가능. 운영자 본인 메일 계정으로 보내므로 외부 SMTP 인프라 불요.

응모자가 아직 가입 전(`user_id=null`) 인 경우 카드에 ⚠️ 표시 — 메일 안내 필수.

### 2-4. 가입 대기자 검토 (응모 없이 가입만 한 사용자)

페이지 하단 "② 가입 대기자" 섹션. 응모 답변 없는 가입자가 표시됨.
- `[직접 승인]` — `/api/admin/approve-user` 호출, selected_emails upsert (application_id=null, notes='direct signup approval')
- `[승인 안내 메일 ✉]` — 환영 + 즉시 로그인 안내 (대시보드 URL)

원칙: **/apply 응모를 거치도록 안내하는 것이 우선**. 직접 승인은 운영자 재량 (예: 사전에 알고 있는 신뢰 가능한 사용자).

### 2-5. 보안 게이트 (3중)

1. **proxy.ts** 라우트 진입 시 `isAdminEmail(user.email)` 검사 → 비운영자 `/` 로 리다이렉트
2. **`page.tsx` server component** 본문에서 동일 검사 (이중 안전)
3. **`/api/admin/*` route handler** 에서 동일 검사 (실제 액션 시점 + service_role 사용)

ENV 미설정 시 admin 집합 = 빈 Set → 본인 포함 누구도 진입 불가.

---

## 2'. 응모 검토 — SQL 직접 (대체 경로, UI 장애 시)

### 2-1. 대기 중인 응모 목록 조회

```sql
SELECT
  id,
  contact_email,
  age_band,
  LEFT(q1_handling, 80) AS q1_preview,
  LEFT(q5_recurring, 80) AS q5_preview,
  utm_source,
  utm_campaign,
  created_at
FROM evangelist_applications
WHERE status = 'pending'
ORDER BY created_at ASC;
```

### 2-2. 특정 응모 전체 답변 보기

```sql
SELECT *
FROM evangelist_applications
WHERE id = '<application_id>';
```

### 2-3. 선발 — selected_emails INSERT + status 갱신 (트랜잭션)

```sql
BEGIN;

-- (a) 선발 등록 — 화이트리스트에 이메일 추가
INSERT INTO selected_emails (email, application_id, notes, added_by)
VALUES (
  LOWER('<contact_email>'),
  '<application_id>',
  '<선발 사유 한 줄>',
  '<운영자 식별자>'
);

-- (b) 응모 status 업데이트
UPDATE evangelist_applications
   SET status = 'selected', updated_at = NOW()
 WHERE id = '<application_id>';

COMMIT;
```

⚠️ **이메일 lowercasing:** /apply 폼은 자동으로 lowercase 저장하지만, 운영자 수동 입력 시 반드시 `LOWER()`로 통일. 트리거는 `LOWER(email)` 매칭이므로 대소문자가 다르면 가입 실패.

### 2-4. 미선발 처리

```sql
UPDATE evangelist_applications
   SET status = 'rejected', updated_at = NOW()
 WHERE id = '<application_id>';
```

미선발자에게도 안내 메일 발송 — "이번 기수 미선발, 다음 기수/정식 출시 시 우선 안내" 톤. (`recruitment-package-2026-05-03.md` §6 톤 정합)

---

## 3. 가입 안내 메일 (선발자)

**발신 계정 (공식 SSOT):** `mvp.bluebird@gmail.com` (`lib/copy/contact.ts`)
**제목 예:** `[BlueBird] MVP 에반젤리스트로 선발되셨습니다 — 가입 안내`

**본문 핵심 요소:**
- 선발 안내 + 2주간 사용 + 서면 리포트 일정
- 가입 URL: `https://bluebird-mvp.vercel.app/auth/signup`
- 가입 시 **응모 시 입력하신 이메일과 동일한 이메일**로 가입 필수 (트리거 매칭)
- 답신 안내: 본 메일 수신 거부·문의는 `mvp.bluebird@gmail.com` 회신
- 가입 후 별도 후속 단계 (오리엔테이션·서면 리포트 양식) 안내

**SMTP 분산:** 30명 일괄 발송이 아닌 시간차 발송 권장 (메모: SMTP stagger 가이드 별도 surface 예정 — 도메인 미취득 상태에서만 유효).

---

## 4. 가입 후 후속 — application_id ↔ user_id 연결 (선택)

가입 완료 시 `selected_emails.used_at`이 자동 기록되지만, `evangelist_applications.user_id`는 자동 연결되지 않음. 분석 편의를 위해 연결하려면:

```sql
UPDATE evangelist_applications
   SET user_id = u.id, updated_at = NOW()
  FROM auth.users u
 WHERE evangelist_applications.id = '<application_id>'
   AND LOWER(u.email) = LOWER(evangelist_applications.contact_email);
```

---

## 5. 모니터링 SQL

### 5-1. 응모·선발·가입 단계별 카운트

```sql
SELECT
  (SELECT COUNT(*) FROM evangelist_applications WHERE status='pending')  AS pending,
  (SELECT COUNT(*) FROM evangelist_applications WHERE status='selected') AS selected,
  (SELECT COUNT(*) FROM evangelist_applications WHERE status='rejected') AS rejected,
  (SELECT COUNT(*) FROM selected_emails WHERE used_at IS NULL)           AS invited_not_signed_up,
  (SELECT COUNT(*) FROM selected_emails WHERE used_at IS NOT NULL)       AS signed_up;
```

### 5-2. UTM 채널별 응모 분포

```sql
SELECT
  COALESCE(utm_source, '(direct)') AS source,
  COALESCE(utm_campaign, '(none)') AS campaign,
  COUNT(*) AS applications,
  COUNT(*) FILTER (WHERE status='selected') AS selected
FROM evangelist_applications
GROUP BY 1, 2
ORDER BY applications DESC;
```

### 5-3. 연령대 분포

```sql
SELECT age_band, COUNT(*) AS applications
FROM evangelist_applications
WHERE status IN ('pending', 'selected')
GROUP BY age_band
ORDER BY age_band;
```

---

## 6. 게이트 우회·예외 처리 (v2)

### 6-1. 운영자(본인) 접근은?

Migration 19 적용 시점에 `auth.users` 기존 4명 (founder seob6615@gmail.com 포함) 전원 사전 등록됨. 이후 운영자가 새 이메일로 가입한다면 `selected_emails` 에 미리 INSERT 해두는 것을 권장.

### 6-2. 게이트 임시 해제 (긴급 대응)

`is_current_user_approved()` 가 항상 TRUE 를 반환하도록 일시 변경:

```sql
-- 긴급: 게이트 해제 (운영자 검토용)
CREATE OR REPLACE FUNCTION public.is_current_user_approved()
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$ SELECT TRUE $$;

-- 복원: Migration 19 본문 재실행
```

또는 middleware 분기 short-circuit (코드 변경 + 배포 필요).

### 6-3. 잘못 추가한 화이트리스트 항목 제거 = 즉시 접근 차단

```sql
DELETE FROM selected_emails WHERE email = LOWER('<email>');
-- auth.users row 는 그대로 유지 (사용자 자신의 데이터 통제권 보존)
-- 해당 사용자는 다음 페이지 로드 시 /waitlist 로 redirect
```

### 6-4. 미승인 사용자 데이터 보유 정책 (P2 결정 예정)

가입했으나 미승인 상태로 30일 이상 경과한 auth.users / 관련 데이터의 폐기 주기는 별도 운영 결정.
PIPA 정합 검토 필요 — privacy 처리방침 §보유 기간에 추가 surface.

---

## 7. 응모 페이지 URL (홍보용)

베이스: `https://bluebird-mvp.vercel.app/apply`

UTM 예시:
- 채팅·DM: `https://bluebird-mvp.vercel.app/apply?utm_source=kakao&utm_medium=dm&utm_campaign=im1`
- 커뮤니티 글: `https://bluebird-mvp.vercel.app/apply?utm_source=disquiet&utm_medium=post&utm_campaign=im1`
- 페어 인터뷰: `https://bluebird-mvp.vercel.app/apply?utm_source=pair&utm_medium=intro&utm_campaign=im1`

`recruitment-ops-v0-2026-05-15.md` §2 UTM 컨벤션 정합.

---

## 8. 변경 이력

- 2026-05-17: 폐쇄 베타 v1 (트리거 차단) — Migration 18 적용, /apply 신설, /me 통합 폼 제거.
- 2026-05-18: 폐쇄 베타 v2 (게이트 차단) — Migration 19 트리거 제거 + RPC 신설, root proxy + /waitlist 페이지 신설. signup 의 closedBetaBlocked 분기 제거, 이메일 인증 화면에 승인 안내 추가.
- 2026-05-18 v2.1: `/auth/callback` client page → server route handler (이메일 인증 로딩 무한 회전 회귀 해결).
- 2026-05-18 v2.2: **어드민 UI 신설** — `/admin/applications` (server component) + 1-click 선발·미선발 + `/api/admin/approve|reject` + 3중 ENV `ADMIN_EMAILS` 게이트.
- 2026-05-18 v2.3: 어드민 UI 확장 — (a) 가입 대기자 섹션 (응모 X, 가입만 한 사용자) + 직접 승인 버튼 + `/api/admin/approve-user` (b) 선발자에게 `mailto:` 메일 헬퍼 (`lib/copy/admin-email.ts` SSOT, 본인 메일 클라이언트로 prefill 발송) (c) `/apply` 진행 흐름에 "선발 시 본인이 직접 가입 + 응모 이메일과 동일하게" 명시.
