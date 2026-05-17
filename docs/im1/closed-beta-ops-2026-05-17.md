# 폐쇄 베타 운영 가이드 — 2026-05-17

**전제:** BlueBird MVP는 IM.1 폐쇄 베타로 운영. 비선정자는 서비스 진입 자체 차단.
**기술 근거:** Migration 18 (`supabase/migrations/18_closed_beta_whitelist.sql`).

---

## 1. 구조 한눈에

```
[비회원] → /apply (anon INSERT, user_id=NULL) → evangelist_applications.status='pending'
                                                          │
                                                          ▼
[운영자] 검토 → 선발자 결정 → selected_emails INSERT (service_role)
                                              │
                                              ├─ 응모자에게 가입 안내 메일 발송
                                              │
                                              ▼
[선발자] /auth/signup → auth.users BEFORE INSERT 트리거 검사
                          │
                          ├─ email IN selected_emails → 통과 + used_at 기록
                          └─ 화이트리스트 외 → RAISE EXCEPTION (가입 차단)
```

---

## 2. 응모 검토 — 운영자 SQL

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

## 6. 트리거 우회·예외 처리

### 6-1. 운영자(본인) 가입은?

운영자 본인 이메일도 `selected_emails`에 미리 INSERT 해두면 가입 가능. 또는 이미 가입한 4명은 영향 없음 (트리거는 INSERT에만 작동).

### 6-2. 트리거 일시 비활성화 (긴급 대응)

```sql
ALTER TABLE auth.users DISABLE TRIGGER trg_enforce_closed_beta_whitelist;
-- ... 작업 ...
ALTER TABLE auth.users ENABLE TRIGGER trg_enforce_closed_beta_whitelist;
```

### 6-3. 잘못 추가한 화이트리스트 항목 제거

```sql
DELETE FROM selected_emails WHERE email = LOWER('<email>');
-- 이미 가입한 경우(used_at IS NOT NULL) auth.users row 는 그대로 남음 → 별도 정리 필요
```

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

- 2026-05-17: 폐쇄 베타 전환 — Migration 18 적용, /apply 신설, /me 통합 폼 제거.
