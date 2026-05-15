# IM.1 모집 운영 — SMTP stagger + UTM + funnel events v0

> **소유:** performance-marketer (CMO 산하). **출처:** 5/15 weekly all-hands §5 #F-3 (D-2 + D-3 통합 draft).
> **목적:** `docs/im1/recruitment-package-2026-05-03.md`(585 lines, 채널·카피)를 보완하는 **운영(ops) 계층** — 실제 발송·트래킹·funnel 측정 메커닉.
> **상태:** v0 draft. F-16 (5/18 IM.1 GO/NO-GO) 결정 직후 발송 시작 가능하도록 사전 정합.

---

## 0. 한 줄 정의

> **"30명 모집 cohort를 3-batch × 10명, 12h 간격으로 분산 발송하고, UTM 표준으로 채널별 funnel을 분리 측정한다."**

---

## 1. SMTP stagger 가이드

### 1.1 왜 stagger인가

- **응답 품질 보호:** 30명에게 동시 발송 시 응답이 spike → 24h 내 spike 응답이 자기 선택 편향(빠른 응답자가 비례 이상 분석가형이 아닐 수 있음) 유발
- **응답 처리 부하 평탄화:** 운영자 1명이 응답 30건을 동일 시간대에 처리 불가. batch별 시차로 인터뷰 일정 분산
- **SMTP 평판 보호:** 30건 1회 발송이 신생 도메인에선 spam flag 위험 (memory: 도메인 미취득 상태, gmail 발송 시 더더욱)
- **테스트·롤백 여유:** 1-batch 결과 (수락률·spam 보고 0건) 확인 후 다음 batch 진행

### 1.2 분산 정책

| Batch | 인원 | 발송 시각 (KST) | 대상 우선순위 |
|---|---|---|---|
| **B1** | 10명 | D-day 09:00 | 가장 가까운 인적 네트워크 (high trust, 빠른 피드백) |
| **B2** | 10명 | D-day 21:00 (B1 +12h) | 2차 인적 네트워크 |
| **B3** | 10명 | D+1 09:00 (B1 +24h) | 채널 모집(LinkedIn·디스코드 등) 1차 응모자 |

**중단 게이트 (B1 → B2 진행 조건):**
- B1 발송 후 12h 내 **spam 신고 0건** (Gmail에서 받은 사람이 "스팸 신고" 클릭 시 운영자 inbox 도착)
- B1 응답률 ≥30% (10명 중 3명+ 응답) — 카피·도착성 sanity check
- 위 2개 모두 OK 시 B2 자동 진행. 1개라도 fail 시 B2 보류 + CPO 검토

### 1.3 발송 메커닉

| 항목 | 값 |
|---|---|
| 발송 도구 | gmail "From: seob6615@gmail.com" (도메인 미취득 상태) — operator 직접 발송 |
| BCC 사용 | ❌ — 1:1 발송. BCC는 spam 시그널 |
| 본문 형태 | 개인화 — 첫 단락에 수신자 이름·접점(추천인) 명시 |
| 첨부 | ❌ — 텍스트 + 인라인 링크만 |
| HTML/Plain | Plain text (분석가 톤 정합) |
| 발송 간격 (batch 내) | 동시 발송 가능 (10명 batch 단위) |

**도메인 취득 후 (5/17 이후 후속 결정):**
- `From: ops@bluebird.kr` 같은 자체 도메인 전환
- DKIM/SPF/DMARC 셋업
- SendGrid·Mailgun 같은 트랜잭션 SMTP 도입 검토

본 v0은 **gmail 발송 한정 운영 가이드**.

---

## 2. UTM 파라미터 표준

### 2.1 표준 형식

모든 모집 링크에 다음 5개 UTM 파라미터를 **반드시** 포함한다:

```
https://bluebird-mvp.vercel.app/auth/signup
  ?utm_source={source}
  &utm_medium={medium}
  &utm_campaign={campaign}
  &utm_content={content}
  &utm_term={cohort}
```

### 2.2 값 사전 (allowed values)

| 파라미터 | 허용 값 | 의미 |
|---|---|---|
| `utm_source` | `gmail`·`linkedin`·`discord`·`twitter`·`brunch`·`treba`·`munto` | 응모 채널 |
| `utm_medium` | `email`·`post`·`dm`·`link-in-bio` | 노출 매체 |
| `utm_campaign` | `im1-2026-05` | 본 cohort 식별자 (다음 cohort는 `im2-...`) |
| `utm_content` | `b1`·`b2`·`b3`·`channel` | batch 식별자 (이메일) 또는 `channel` (모집 게시) |
| `utm_term` | `personal`·`recruit` | 인적 네트워크 vs 일반 채널 모집 |

### 2.3 채널별 링크 예시

| 채널 | URL |
|---|---|
| Gmail B1 (인적) | `?utm_source=gmail&utm_medium=email&utm_campaign=im1-2026-05&utm_content=b1&utm_term=personal` |
| Gmail B2 (인적) | `?utm_source=gmail&utm_medium=email&utm_campaign=im1-2026-05&utm_content=b2&utm_term=personal` |
| LinkedIn post | `?utm_source=linkedin&utm_medium=post&utm_campaign=im1-2026-05&utm_content=channel&utm_term=recruit` |
| Discord DM | `?utm_source=discord&utm_medium=dm&utm_campaign=im1-2026-05&utm_content=channel&utm_term=recruit` |

### 2.4 URL builder 운영

`docs/im1/utm-builder.md` (별도 후속 파일, 본 v0 외) — 운영자가 카피 1건당 1개 링크 생성 시 빠른 reference.

---

## 3. Funnel events v0

### 3.1 측정 funnel — 6단계

```
[1] 발송 (이메일 전송) — operator 수동 카운트
    ↓
[2] 노출 (이메일 open 또는 LinkedIn impression) — 측정 불가 (gmail open tracking 미사용)
    ↓
[3] 클릭 (응모 폼 진입) — 응모 폼 진입 event
    ↓
[4] 응모 (Tally 폼 제출) — Tally webhook 또는 manual
    ↓
[5] 선정 (스크리닝 통과) — operator 수동 코딩
    ↓
[6] 활성 (가입 + 첫 체크인) — analytics_events 자체 트래킹
```

### 3.2 event 이름 정의 (v0)

| 단계 | event_name | source | 적재 위치 |
|---|---|---|---|
| [1] 발송 | `recruit_email_sent` | operator 운영 spreadsheet | manual log |
| [3] 클릭 (응모 폼 진입) | `recruit_form_visited` | Tally form 진입 page UTM 파싱 | manual log (Tally가 UTM 보존) |
| [4] 응모 | `recruit_form_submitted` | Tally 응답 timestamp | Tally CSV export |
| [5] 선정 통과 | `recruit_selected` | operator 코딩 결과 | manual log |
| [6] 가입 | `auth_signup` | (기존) Supabase auth | `auth.users.created_at` |
| [6] 첫 체크인 | (기존) `distortion_identified` 또는 `checkins.first_at` | (기존) `analytics_events`·`checkins` | 자동 적재 |

**중요:** 본 v0은 **신규 코드 변경 0**. 기존 `analytics_events` 테이블·`Tally`·`auth.users` 조합으로 funnel 측정 가능. cron healthcheck (F-12)와 UTM 파싱은 별도 작업.

### 3.3 measurement workflow (D14 산출용)

운영자가 IM.1 D14 시점에 다음 1개 SQL + manual log 통합:

```sql
-- Step [6]: 가입 + 첫 체크인 cohort
SELECT u.id AS user_id,
       u.created_at AS signup_at,
       MIN(c.created_at) AS first_checkin_at,
       (MIN(c.created_at) - u.created_at) AS time_to_first_checkin
FROM auth.users u
LEFT JOIN checkins c ON c.user_id = u.id
WHERE u.created_at >= '2026-05-19'::timestamp  -- IM.1 GO 후
  AND u.raw_user_meta_data->>'utm_campaign' = 'im1-2026-05'
GROUP BY u.id, u.created_at
ORDER BY u.created_at;
```

UTM은 가입 시 `auth.signUp({ options: { data: { utm_campaign, utm_source, ... } } })`로 raw_user_meta_data에 넣어야 함 — **앱 측 구현 필요** (별도 후속 작업, 본 v0 외).

→ v0 단계에선 operator manual log + Tally CSV 통합으로 충분. UTM 자동 적재는 F-13~F-14 senior-fullstack 작업과 함께 검토.

---

## 4. Conversion 목표 (모집 funnel)

| 단계 전환 | 목표 비율 | 산식 |
|---|---|---|
| [1] → [3] 클릭 | ≥ 40% | 클릭 / 발송 |
| [3] → [4] 응모 | ≥ 50% | 응모 / 클릭 |
| [4] → [5] 선정 | 30~50% (모집 패키지 §0 기준) | 선정 / 응모 |
| [5] → [6] 가입 + 첫 체크인 | ≥ 70% (24h 내) | 활성 / 선정 |
| **종합 [1] → [6]** | **≥ 5%** (30/600 발송 기준) | 활성 / 발송 |

→ 30명 selectee × 80% 인터뷰 완주 가설 시 발송 총량은 ~600~750건. B1~B3 30건 + 채널 모집 570~720건. 채널 비중이 압도적.

**B1~B3(인적 네트워크) ROI 가설:** 인적 30건 → 활성 10~15명 (33~50% 종합 conversion). 채널 570건 → 활성 15~20명 (3~4% 종합). **인적이 ROI 10배.**

---

## 5. 운영 리스크 (사전 mitigation)

| 리스크 | 시그널 | 대응 |
|---|---|---|
| Gmail spam flag | "받는 사람의 inbox에 안 들어감" 신고 1건+ | 즉시 발송 중단, 도메인·SPF 셋업 우선 처리 후 재개 |
| B1 응답률 <30% | 12h 내 응답 3건 미만 | B2 보류, 카피 sanity check (CPO 검토) |
| Tally 폼 spam 응답 | 자동 응답·중복 응답 발견 | reCAPTCHA·Honeypot 추가 검토 |
| UTM 파라미터 누락 | 응답에 UTM 추적 불가 | Tally 폼 hidden field 5개에 UTM 5종 모두 매핑 (Tally 설정 필요) |

---

## 6. v0 → v1 격상 조건 (Phase 2)

본 v0는 **gmail 단독 발송 + manual log + Tally CSV 조합**의 IM.1 한정 운영판. 다음 시점에 v1으로 격상:

- IM.1 D14 완료 + 모집 데이터 1회 회고
- 도메인 취득 + SPF/DKIM/DMARC 셋업 완료
- F-12 cron healthcheck + F-13~F-14 funnel 자동 적재 인프라 완료

v1 격상 시 추가:
- 자동 SMTP (SendGrid/Mailgun)
- UTM `auth.users.raw_user_meta_data` 자동 적재
- Tally → Supabase webhook 자동 적재
- Funnel dashboard SQL view

---

## 7. 출처·근거

| 자산 | 위치 |
|---|---|
| 모집 채널·카피 (상위) | `docs/im1/recruitment-package-2026-05-03.md` (585 lines) |
| IM.1 GO/NO-GO 조건 | 5/15 weekly all-hands §5 #F-16 |
| 측정 인프라 (analytics_events) | `lib/analytics/server.ts` |
| SMTP stagger 메모리 노트 | user memory: "IM.1 선정 완료 시 SMTP stagger 리마인드" |
| Tally 폼 (F-11) | 5/15 weekly all-hands §5 #F-11 due 5/18 (PO) |
