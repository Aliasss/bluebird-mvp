# BlueBird 주간 All-Hands — 2026-05-22

**일시**: 2026-05-22 18:00 KST  
**주차**: 2026-W21 (5월 3주차) — 회의록 #3  
**참여자**: 14 페르소나 (parallel dispatch, Sonnet × 14)  
**기록**: senior-qa-engineer (회의록 정합성 독립 검증)  
**목적**: 주 마감 deep 합의 — IM.1 모집 개시 후 첫 all-hands. 법규 위반·측정 무결성·인프라 부채 긴급 합의

---

## 0. 현황 (개회 시점 기준)

### 0.1 7일 git 통계 (2026-05-15~22)

| 영역 | 주요 commits | 내용 요약 |
|---|---|---|
| closed-beta 인프라 | d02f6f0·ff43f08·436662b·266a102 | /apply 비회원 응모 + selected_emails + migration 18·19 |
| admin UI | b7a7472·ba46583 | /admin/applications + 선발·미선발 1-click |
| auth | 3035656·cc56648 | callback 무한 로딩 fix + proxy.ts Next.js 16 충돌 해결 |
| push | 0a56023 | webpush urgency 'high' (Android) |
| analytics | eada9f2 | 입력 마찰 log_view + 자율성 micro-feedback 카드 |
| insights | 27c9064 | /insights/archetypes 5가지 비교 페이지 |
| autonomy | 1453d26 | 산식 투명성 강화 + 서면 리포트 점수 인식 문항 |
| IM.1 문서 | c0ae21b·f2b075d | Brunch 모집 글 공개(5/21 09:30) + 서면 리포트 양식 신설 |
| ⚠️ 법적 | ccbdb94 | /apply 푸터 법적 링크 3종 제거 |

총 15 commits 이상. 폐쇄 베타 v1(트리거 차단) → v2(게이트 차단) 전환 완료. **IM.1 모집 개시됨.**

### 0.2 PMF 게이트 진척

| PMF 임계 | 현재 |
|---|---|
| 자발 가치 언급 ≥30% | 측정 시작 (모집 중, 첫 코딩 D14 예정) |
| 30일 잔존율 ≥15% | 측정 시작 (day-0 코호트 입장 중) |
| 결제 의향 ≥20% | 측정 준비 (서면 리포트 B섹션 설계 완료) |

**CMO Stage 위치**: Stage 0 — Brunch organic 모집 진행 중 (유료 광고·발행 X).

### 0.3 _actions.md carry-over 요약

| 분류 | 건수 |
|---|---|
| Closed (5/16 ad-hoc) | F-1·F-2·F-3·F-4 |
| ≥3주 미완 (최장기) | A-2 [CEO] VAPID (CTO 사실상 완료 판단) |
| 신규 기한 초과 (F-series) | F-5·F-6·F-7·F-8·F-9·F-10·F-12·F-13·F-14·F-15·F-17·F-18·F-19·F-20·F-21·F-22·F-23 → 17건 |
| F-11 | Closed 제안 (PO, AC 초과 달성) |
| F-23 | Closed 제안 (PO, superseded) |

---

## 1. CEO 개회

> "Brunch 모집 글이 5/21 공개됐고, 폐쇄 베타 v2 전환, admin UI, 서면 리포트 양식이 모두 갖춰졌습니다. 이번 주는 이 한 주가 만들어낸 시스템이 외부 트래픽을 받으면서 드러난 이슈들을 정직하게 집계하고, 우선순위를 합의하는 자리입니다. agenda 없음 — routine standing summary로 진행."

---

## 2. 발언 라운드

### 2.1 CPO

**1순위: 측정 무결성 — rubric frozen + 폼 audit이 모집 개시와 순서가 역전됨**

모집 글은 5/21 나갔는데, 측정 인프라 4개(F-9 rubric frozen·F-7 분모·분자·F-10 인터뷰 가이드·F-20 SOP)가 모두 미완입니다. PMF plan §9 원칙 — "자(尺)를 데이터 보기 전에 frozen" — 이 지켜지지 않았습니다. 첫 응모 응답이 들어오기 전 **5/24~26을 hard freeze 데드라인**으로 잡고 4건을 동기화할 것을 제안합니다.

F-7(분모·분자)이 F-9(rubric frozen)의 블로커입니다 — 30일 잔존 분모를 "가입자" vs "활성화 day-0(첫 체크인/첫 log)" 중 어느 기준으로 쓸지 **CPO 결정 필요**. 권고: 활성화 day-0 기준.

**2순위: push urgency 'high' + F-15 짝 없음**

push 강도는 올렸는데 카피 가드(F-15)는 아직 미완입니다. IM.1 인터뷰에서 "알림 부담스럽다" 자발 언급 시 즉시 롤백 트리거로 잡을 것. F-15 이번 주 처리 요청.

**⚠️ 카피 이슈**: `/apply` "공동 설계자" 어휘가 5/17 `0cd158f` 마이그레이션에서 누락됨 (line 13, 36 잔존). "MVP 체험자"로 일괄 정합 필요.

---

### 2.2 CSO

**1순위: F-9 rubric frozen — 오늘 처리**

CSO 3축 매핑의 실질 내용은 v1.0 작성 시점에 이미 반영됐습니다. 남은 것은 헤더에 "v1.0 frozen — IM.1 코호트 코딩 중 변경 불가" 한 줄 추가뿐입니다. 오늘 all-hands 직후 CPO와 30분 내 처리하겠습니다.

**2순위: 시즌제(D) 가드레일 사전 박기**

5/19 deep-dive에서 시즌제(D)를 "IM.1 후 검토"로 결의했습니다. 정찰 보고서(액션 ⑤) 작성 시 "시즌제 ≠ 갱신형 구독, 시즌제 = falsifiability 사이클" 1번 가드를 명기하겠습니다. "시즌제 = 리텐션 장치"로 무의식 수렴하지 않도록 지금 못 박아둡니다.

**차별화 3축 상태**: 이번 주 변경분 이상 없음. 아키타입 비교·자율성 micro-feedback 모두 분석가 톤 정합. 글로벌 챗봇 한국어 진입 0건이나, **범용 LLM이 "감정 코치 모드"로 진입하는 경로**가 전용 앱보다 빠를 수 있어 모니터링 강화.

---

### 2.3 CTO

**⚠️ 최우선: ccbdb94 — /apply 법적 링크 제거, 법적 근거 불명**

`ccbdb94`에서 이용약관·개인정보처리방침·면책 안내 링크 3종을 `/apply`에서 제거했습니다. `/apply`는 비회원 이메일·연령·자유응답 5문항을 수집하는 페이지입니다. 법적 근거 없이 처리방침 링크를 제거하는 것은 PIPA §30 위반 가능성이 있습니다. risk-manager가 동일 이슈를 P0-B로 분류해 확인됩니다. CEO에게 법적 근거 확인 요청 — 없으면 처리방침 인라인 링크 복원 권고.

**2순위: senior-fullstack 4종 전부 미착수 (F-12/13/14/21)**

코드 확인 결과 4건 모두 착수 흔적 없음. 이번 주 closed-beta P0 우선은 이해되나 all-hands 사전 surface 없이 조용히 밀린 것은 절차 실패. CEO: owner capacity 확인 필요. F-13은 30분 작업, F-14는 어뷰징 표면 활성화 상태입니다.

VAPID Phase 3: webpush 동작 코드 증거상 사실상 완료로 판단. CEO carry-over closed 제안.

---

### 2.4 CMO

**1순위: Brunch 글 본문 brand-voice 사후 점검 — 아카이빙 미완**

Brunch 글(`@haesol/184`) 본문이 strategy 저장소에 없습니다. 패키지 카피 재사용이라 이번에는 통과로 추정되나, 공개 전 content-marketer 검수 게이트가 funnel에 없습니다. 다음 채널 글(Threads·Disquiet)부터 게이트 추가 제안.

**2순위: `/apply` "공동 설계자·함께" — 본질 위협 #6 인접**

"서비스 방향을 함께 정의하는 공동 설계자" 표현이 `/apply` 본문·metadata에 잔존(5/17 `0cd158f` 부분 누락). "검증하는 MVP 체험자"로 정합 요청. CSO 승인 + product-designer 일괄 수정.

F-22 선발 메일은 `admin-email.ts`로 사실상 산출됨. 미선발·follow-up 2종이 미작성이며 Brunch 글에 "회신 드립니다" 공개 약속이 박혔습니다. content-marketer 5/24 재약정 요청.

---

### 2.5 product-designer

**1순위: F-6 재약속 — 신설 화면 포함 5/23 EOD**

원 due 5/16 초과. 이번 주 신설 5화면(`/apply`·`/waitlist`·`/admin/applications`·`/insights/archetypes`·`/waitlist`)이 추가되어 스코프가 13→22캡처로 변동됐습니다. 코드 정적 점검 결과 320px 리스크 2곳 식별: `ApplyForm` 연령대 `grid-cols-3`(L208), `ApplicationCard` 버튼 `flex` 2열(L133). 2026-05-23 EOD 통합 보고서 제출.

**2순위: `/action` micro-feedback "+점수 text-3xl" 위계 재검토**

`+{delta}`가 `text-3xl font-bold text-warning`으로 화면 최강 위계를 점유합니다. 산식 투명성 의도는 좋으나 게임화 오인 위험. 제안: `text-2xl`로 낮춰 누적 점수와 동급 위계. 인터뷰에서 "+점수가 게임 같다" 자발 언급 트리거로 검증.

**WCAG 이슈**: `ApplyForm` 라디오 `focus-visible` 링 미구현 — WCAG 2.4.7 위반 소지. F-6 보고서에 포함.

---

### 2.6 product-owner

**F-11 → Closed 제안**: 외부 Tally 대신 자체 `/apply` 시스템으로 AC 초과 달성. F-19 `/apply` 회귀 케이스 추가 조건부.

**F-23 → Closed 제안**: F-1~F-23 재등록으로 superseded.

**F-20 due 5/25 재약정**: 서면 리포트·analytics가 SOP 입력을 채웠으므로 운영 절차 작성만 남음.

**⚠️ G2 분모 불일치**: `development-backlog.md` G2 "사용자 인터뷰 50명" vs IM.1 목표 30명. 분모 확정 CPO·strategy-manager 결정 필요.

**⚠️ 자율성 점수 인식 문항**: 서면 리포트 A6의 자기보고가 행동 metric(`autonomy_score`) 1차 변수와 섞일 위험. "1차 변수 = 행동 metric" 명문화 요청.

시즌제(D) 백로그 착지점 부재 — G3 후속 트랙에 검토 진입점 추가 제안(CPO 승인 필요).

---

### 2.7 senior-ux-researcher

**⚠️ F-10 미완료 +4일 초과 — STOP 신호급**

인터뷰 가이드 파일(`docs/im1/interview-guide-v1.md`) 존재하지 않습니다. 모집 글은 5/21 나갔고, rubric §0 원칙("유도 어휘 박지 않은 응답만 자발 카운트")의 검증 기준이 비어있습니다.

**⚠️ Q5 placeholder 유도어휘 누수 위험**: `"발표 망쳤다", "잠 안 옴", "결정 못 하겠음", "친구와 비교됨"` 예시 어휘가 coding-rubric §0 블랙리스트와 충돌 가능. 응모 데이터가 이미 유입 중 — 24h 내 audit + cohort 태깅 필요.

모집 중단 요구 아님 — audit + cohort 태깅으로 오염 범위를 격리하는 차선책.

**소표본 가드**: N=24 유효 표본에서 60% 트리거의 CI = [39%, 78%]. 점추정치 단독 선언 불가. GO/NO-GO 시 CI 동반 보고 필수.

F-10 이번 주 EOD 재약정.

---

### 2.8 data-analyst

**F-7 미완료 (6일 초과) — due 5/24 재약정**

30일 잔존율 분모 정의가 CPO 결정 선결입니다. draft 결론: 활성화 day-0(첫 체크인/첫 log) 기준 권고. N=30에서 잔존율 15%의 CI ≈ ±13%p — 소표본 결정 가드 포함.

**F-17 부분 완료**: `log_view` 이벤트가 `eada9f2`에서 이미 구현됨. QA 체크리스트 + 잔여 C-3 delta 스펙을 5/23 senior-fullstack 전달.

**⚠️ UTM attribution 공백**: Brunch 가입자의 `utm_source`가 DB에 안 박힘. `auth.signUp` → `raw_user_meta_data` 적재 미구현. 이번 스프린트 우선순위 결정 CPO 요청.

**⚠️ `log_view` QA 이슈**: `properties` 없음 — 중복 찍힘 시 delta 계산 부정확. `log_attempt_id` UUID 추가 권고. `log_view` survivorship bias — 완료자만 delta 측정, 이탈자 누락. 이탈률 view SQL로 보완 가능 (코드 변경 불요).

**⚠️ 자발 언급 분모 모호성**: 사용 전/후 응답 분리 태깅 필요.

---

### 2.9 strategy-manager

**A-3·E-1 완료 확인.** F-9 frozen CSO+CPO 공동 — 오늘 처리 예고.

**최우선: 인터뷰 가이드 ↔ rubric 교차검증 30분 게이트**

F-10 가이드 내 질문 어휘가 rubric §6(surface 어휘 거리 ≤3 어절 룰)을 침범하는지 첫 인터뷰 전 확인 필요. strategy-manager + senior-ux-researcher 공동 30분. CSO 승인 요청.

**서면 리포트 B1 Van Westendorp 앵커링 우려**: 후보 가격 19,900원을 4구간 문항과 함께 제시하면 앵커링 편향. B1 선수신 → B4 가격 노출 순서로 재배치 권고. 설계 결정은 CPO/data-analyst.

**경쟁 위협**: 디스턴싱·하루콩 신규 위협 0건. 잠재 위협 — 범용 LLM 한국어 인지 왜곡 흡수 시 BlueBird 카테고리 락인 단축. 현재 모니터링 carry-over 유지.

---

### 2.10 risk-manager

**⚠️ P0-A: /apply PIPA 동의 결함 — 즉시 보완 필요 (라이브 위반 중)**

1. **국외이전 동의 누락** (PIPA §28-8): 응모 데이터가 Supabase(미국) 저장되지만 동의 없음.
2. **만 14세 미만 차단 게이트 없음** (PIPA §22-2): `age_band` 라디오로 불충분.
3. **수집 항목·목적·보유기간 고지 미흡**: "코딩 결과만 보존"의 범위 불명확.

**⚠️ P0-B: 처리방침 링크 소멸** (ccbdb94): PIPA §30 처리방침 공개의무 위반. `/apply` 처리방침 도달 경로 없음.

→ 즉시 보완 4건: (1) 연령 확인 체크박스, (2) 국외이전 동의 1줄, (3) 수집항목·목적·보유기간 고지 블록, (4) 처리방침 인라인 링크. 배포 보류 아님 — 보완 PR 최우선.

F-5 (처리방침 push+notification_events 추가) 기한 초과 6일 — P0-A/B와 통합 PR로 이번 주 처리 예정.  
F-15 (push 카피 차단 어휘 목록) 이번 주 CTO 전달.

**P1-D: 수익화 트리거 사전 합의 요청** — "결제 PR 착수 결정 = G3 변호사 검토 발동" 명문화.

---

### 2.11 senior-fullstack-engineer

**⚠️ Migration 18 anon INSERT — 무인증 공개 쓰기 표면 라이브 중**

`evangelist_applications` anon INSERT가 rate-limit·captcha 없이 열려 있습니다. `/apply` 자유응답(Q1~Q5)은 프롬프트 인젝션 잠재 표면. 선택지: (a) rate-limit+captcha / (b) 가입 후 응모 전환. **CTO 결정 요청 → CEO 확인**.

F-13 (v_push_funnel security_invoker): 1줄, 이번 주 내 즉시 처리.  
F-14 (metadata Zod enum): 어뷰징 표면, 반나절 작업.  
F-12 (cron healthcheck): push 조용한 실패 방지, 우선.  
F-21 (rls-audit 신규 테이블): 신규 `evangelist_applications`·`selected_emails` 미커버.  
privacy/page.tsx push subscription 항목: due-2026-05-24.

이번 주 기능 동결 + 인프라 부채 청산 스프린트 제안.

---

### 2.12 senior-qa-engineer

독립 검증 결과:

- `proxy.ts` 승인 게이트: PASS
- `auth/callback` server route: PASS
- migration 19 idempotency: PASS
- admin API service_role 격리: PASS
- PII 평문 노출: 0건 PASS

**⚠️ P1-1: rls-audit 신규 테이블 커버리지 0건**  
`selected_emails`(정책 0개 = 전면 거부 의도)의 런타임 anon SELECT 차단 미검증. PII 직결 — 머지 전 처리 강하게 권고.

**⚠️ P1-2: admin/approve 부분 실패 시 데이터 불일치**  
`selected_emails` upsert 성공 + status update 실패 시 화이트리스트 등록됐으나 status='pending' 상태 불일치. P2, 후속 처리.

**P2-1: webpush urgency 'high' iOS 무효**  
APNs는 urgency를 다르게 해석 — iOS에서 효과 미달성. 5/24 iOS 실기기 E2E에서 확인.

**F-18/19 기한 초과**: migration 19 전환으로 E2E 경로 변경 — 재정의 후 재작성 필요. vitest 미실행(환경 차단) — CI에서 별도 확인 필요.

---

### 2.13 content-marketer

**1순위: F-22 미통과·follow-up 2종 미작성 — 공개 약속 미이행**

Brunch 글에 "통과 못 한 분께도 이유 회신" 약속이 박혔는데 카피 SSOT 없음. due 5/24 재약정. 미통과 메일 draft 제시:

> "안녕하세요. BlueBird MVP 에반젤리스트 응모를 검토했습니다. 이번 IM.1 코호트(30명)는 사고를 시스템처럼 다루는 사용 패턴을 집중 관찰하도록 구성됐고, 보내주신 답변은 이 코호트 구성 기준과 정합이 낮았습니다. 응모 자체의 우열이 아니라 이번 관찰 설계와의 적합도 판정입니다. 정식 출시 시 안내를 원하시면 본 메일에 회신해 주세요."

**2순위: 외부 채널 발행 funnel에 brand-voice 사인오프 게이트 없음**  
Brunch는 패키지 카피 재사용으로 통과. 다음 채널 글부터 "공개 전 content-marketer 검수" 게이트 추가 제안.

**카피 가드**: 선발 메일 `admin-email.ts` 내 "함께"가 brand-voice lexicon §1.1 COMFORT_PATTERNS 차단 어휘와 불일치. (a) 카피 수정 / (b) lexicon whitelist 명문화 — (a) 권장.

**⚠️ lint:copy 실행 불가** (`tsx: not found`). 자동 가드 중단 상태. senior-fullstack devDependency 복구 요청.

---

### 2.14 performance-marketer

**Stage 0 위반 없음**. Brunch organic은 유료 광고 아님 — 정합.

**CEO 인적 네트워크 50명 초대 5일 초과 (due 5/17)**: ROI 10배 채널이 집행 미완. recruitment-ops §4 conversion 가설상 인적 채널 없이 채널 모집만으로 30명 충원 시 발송 ~750~1000건 필요 — 1인 운영 한계 초과 위험.

**Brunch /apply 링크 UTM 미적용**: attribution 공백. 즉시 수동 부착 권고 (`?utm_source=brunch&utm_medium=post&utm_campaign=im1-2026-05`). Tally hidden field ↔ UTM 5종 매핑 확인 (PO).

SMTP stagger 가이드: CEO 50명 리스트 확정 시 B1(10명 D-day 09:00) → B2(10명 +12h) → B3(10명 +24h) 순서. spam 중단 게이트: B1 후 12h 내 spam 신고 0건 + 응답률 ≥30% 둘 다 OK여야 B2 진행.

---

## 3. 충돌 토론 (Synthesizer)

### §3.1 우선순위·자원 충돌 표

| # | 위치 A | 위치 B | 트레이드오프 | CEO 결정 필요? |
|---|---|---|---|---|
| C-1 | CPO: F-9 rubric frozen 오늘 (F-7 선결) | data-analyst: F-7 due 5/24 | 순서 꼬임 — F-7이 F-9의 블로커인데 F-7이 늦음 | ⚠️ F-7 5/24 이전 분모만 먼저 결정 |
| C-2 | senior-fullstack: 다음 스프린트 기능 동결 + 인프라 부채 청산 | CPO: UTM 적재·측정 무결성 이번 스프린트 | 안전·회귀 vs PMF 측정 속도 | ⚠️ Yes — 스프린트 우선순위 확정 |
| C-3 | senior-fullstack (a): anon INSERT rate-limit+captcha 유지 | senior-fullstack (b): 가입 후 응모 전환 | 모집 funnel 마찰 vs 무인증 DB 쓰기 표면 | ⚠️ Yes — CPO·CTO 합의 필요 |
| C-4 | senior-ux-researcher: Q5 유도어휘 cohort 태깅 (STOP 신호) | performance-marketer: 모집 계속 (모멘텀) | 측정 무결성 vs 채널 타이밍 | 합의 가능 — 모집 계속 + audit 24h |
| C-5 | PO: G2 분모 30명 (IM.1 실제) | CPO plan: G2 분모 50명 (backlog) | PMF 엄밀성 vs 모집 현실 | ⚠️ Yes — CPO·strategy-manager |
| C-6 | risk-manager: ccbdb94 처리방침 복원 (법적 의무) | 디자인 의도: 푸터 미니멀 | PIPA §30 vs UX 미니멀리즘 | 합의 가능 — 처리방침 인라인 링크 1개만 |

### §3.2 본질 위협 ⚠️ 검출 결과

| 신호 | 등급 | 출처 | 판정 |
|---|---|---|---|
| `/apply` "공동 설계자·함께" | #6 인접 (STOP 아님) | CPO·CMO·product-designer 독립 확인 | 이번 주 내 수정 권고 |
| micro-feedback "+점수 text-3xl" | #5 경계 | product-designer | 인터뷰 검증 후 판단 |
| P0-A·P0-B PIPA 위반 | 법규 위반 | risk-manager | ⚠️ 즉시 보완 (배포 보류 아님) |
| lint:copy 실행 불가 | 가드 인프라 | content-marketer | senior-fullstack tsx 복구 |

**즉시 STOP·escalate 분기 (b) 발동 여부**: risk-manager가 P0로 분류했으나 "배포 보류 아님, 신속 보완"으로 등급 조정. **분기 (a) — 합의 가능·CEO 보완 조치**로 판정하고 routine 계속. _heartbeat.log에 PIPA 위반 상태 명기.

### §3.5 Owner 재할당 surface

| 영역 | 미할당 항목 | 후보 owner | 결정 |
|---|---|---|---|
| Brunch 채널 brand-voice 게이트 | 외부 발행 funnel 검수 단계 신설 | content-marketer | G-19 신규 액션으로 추가 |
| lint:copy tsx 복구 | devDependency 복구 | senior-fullstack | G-18 신규 액션으로 추가 |
| UTM `auth.signUp` 적재 | `raw_user_meta_data` 5종 | senior-fullstack (CPO 우선순위 결정 후) | G-20 신규 액션으로 추가 |
| Brunch 글 본문 아카이빙 | `docs/im1/` 저장 + 6축 점검 | content-marketer | G-6에 포함 |

---

## 4. 합의

### 4.1 합의된 항목

1. **F-9 rubric v1.0 frozen 표기**: 오늘 CSO+CPO 30분 내 처리. frozen 미완 상태로 코딩 시작 불가.
2. **F-10·Q5 audit 병행**: 모집 계속(중단 아님) + 24h audit + cohort 태깅으로 측정 오염 격리.
3. **ccbdb94 처리방침**: 처리방침 인라인 링크 1개 복원 (푸터 전면 복원 불필요, 동의 폼 인접).
4. **F-11 Closed**: PO 제안 채택. F-19 `/apply` 회귀 케이스 첨부 조건부.
5. **F-23 Closed**: superseded. 좀비 항목 정리.
6. **CEO carry-over VAPID Phase 3**: CTO 증거 기반 사실상 완료로 Closed.
7. **인터뷰 가이드 ↔ rubric 교차검증**: 첫 인터뷰 전 strategy-manager + senior-ux-researcher 30분. CSO 승인.
8. **30일 잔존 분모**: CPO 결정 — 활성화 day-0(첫 체크인/첫 log) 기준 권고 채택 (정식 확정은 F-7).
9. **미통과 메일 SSOT**: content-marketer draft 채택 방향 (분석가 톤). F-22 due 5/24.

### 4.2 CEO 결정 필요 항목 ⚠️

| # | 항목 | 선택지 | 권고 |
|---|---|---|---|
| D-1 | /apply anon INSERT 보안 | (a) rate-limit+captcha / (b) 가입 후 응모 전환 | CTO+CPO 합의 후 결정 |
| D-2 | 인프라 부채 스프린트 우선순위 | F-12/13/14/21 이번 주 청산 vs 기능 병행 | senior-fullstack 권고: 기능 동결 스프린트 |
| D-3 | G2 분모 30명 vs 50명 | IM.1 30명으로 하향 확정 vs 목표 50명 유지 | CPO·strategy-manager 5/24 합의 필요 |
| D-4 | UTM `auth.signUp` 적재 이번 스프린트 여부 | 이번 스프린트 / 다음 스프린트 | data-analyst: 이번 스프린트 권고 (attribution 손실 복리 증가) |
| D-5 | 결제 PR 착수 = G3 변호사 검토 발동 명문화 | 명문화 / 구두 합의 | risk-manager: 명문화 권고 |

---

## 5. Action Items (다음 주)

| #ID | owner | due | action | trigger |
|---|---|---|---|---|
| G-1 | CEO | 2026-05-23 | `/apply` PIPA 보완 PR: (1) 만 14세 연령 확인 체크박스, (2) 국외이전 동의 1줄, (3) 수집항목·목적·보유기간 고지 블록, (4) 처리방침 인라인 링크 복원 | 즉시 (라이브 위반 중) |
| G-2 | senior-fullstack | 2026-05-23 | F-13: `v_push_funnel` `security_invoker=on` (1줄 migration 20) | 즉시, 30분 |
| G-3 | CSO+CPO | 2026-05-22 | F-9: rubric v1.0 frozen 표기 — "v1.0 frozen — IM.1 코호트 코딩 중 변경 불가" 헤더 추가 | 오늘 all-hands 직후 |
| G-4 | senior-ux-researcher | 2026-05-23 | 응모 폼 Q1~Q5 placeholder 유도어휘 audit + coding-rubric §0 블랙리스트 대조 → 오염 cohort 태깅 기준 도출 | 즉시 (응모 데이터 유입 중) |
| G-5 | senior-ux-researcher | 2026-05-23 | F-10 인터뷰 가이드 v1 MVP (10문항) 파일 생성 (`docs/im1/interview-guide-v1.md`) | 이번 주 EOD, 첫 인터뷰 전 필수 |
| G-6 | content-marketer | 2026-05-24 | F-22: 미통과·follow-up 이메일 카피 2종 SSOT 작성 + Brunch 글 본문 `docs/im1/` 아카이빙 + 6축 점검표 | Brunch 글 공개 후 즉시 (공개 약속 미이행 리스크) |
| G-7 | data-analyst | 2026-05-23 | F-17: `log_view` QA 체크리스트 (`log_attempt_id` 권고 포함) + 잔여 C-3 delta 스펙 → senior-fullstack 전달 | F-18 사전 |
| G-8 | risk-manager | 2026-05-24 | F-5: 처리방침 통합 PR (push subscription + notification_events + 국외이전 + 30일 보유기간 항목 추가) | G-1 PR과 병행 |
| G-9 | risk-manager | 2026-05-22 | F-15: push 카피 lint:copy 차단 어휘 목록("기분·우울·불안" 등) → senior-fullstack 전달 | 즉시 |
| G-10 | data-analyst | 2026-05-24 | F-7: PMF 게이트 분모·분자 1-pager (잔존·자발·결제 3종 + 입력 이탈률 view SQL + N=30 CI 가드) [분모 정의 CPO 결정 선결] | CPO D-3 결정 후 5/24 완료 |
| G-11 | product-designer | 2026-05-23 | F-6: iPhone SE 320px 실기 테스트 보고서 (신설 5화면 포함 22캡처 + ApplyForm 라디오 WCAG 2.4.7 점검) | 5/23 EOD |
| G-12 | PO + senior-fullstack | 2026-05-25 | F-20: C-2 측정 SOP (`docs/im1/measurement-sop.md`) — 메트릭 분자/분모/코호트/인프라 + N 신뢰구간 가드 + D7/D14 점검 시점 | F-7 완료 후 |
| G-13 | senior-fullstack | 2026-05-24 | F-21: `rls-audit.ts`에 `evangelist_applications`·`selected_emails` 커버리지 추가 (anon SELECT 0건·anon INSERT 정책 확인) | P1-1 해소 |
| G-14 | senior-fullstack | 2026-05-24 | F-14: `app/api/notifications/event/route.ts` metadata Zod enum 화이트리스트 키 강제 | 어뷰징 표면 |
| G-15 | senior-fullstack | 2026-05-25 | F-12: cron healthcheck — `last_cron_invoked_at` + 24h staleness 알림 | 운영 신뢰 |
| G-16 | senior-qa + senior-fullstack | 2026-05-25 | F-18: 9단계 × event_type 매핑표 재작성 (migration 19 기준 신규 동선 반영, `log_view` 포함) | F-7·F-17 완료 후 |
| G-17 | strategy-manager + senior-ux-researcher | 2026-05-24 | 인터뷰 가이드 v1 ↔ rubric v0.1 §6 유도어휘 교차검증 30분 (첫 인터뷰 전) | G-5 완료 후 즉시 |
| G-18 | senior-fullstack | 2026-05-24 | lint:copy tsx devDependency 복구 — `npm run lint:copy` 정상 가동 | 외부 발행 채널 증가 전 |
| G-19 | content-marketer | 2026-05-25 | 외부 채널 발행 funnel에 brand-voice 사인오프 게이트 추가 — `docs/im1/recruitment-ops-v0` §8 또는 별도 SOP에 "공개 전 content-marketer 검수" 명시 | 다음 채널 글(Threads·Disquiet) 전 |
| G-20 | senior-fullstack | 2026-05-25 | UTM `auth.signUp` → `raw_user_meta_data` 5종 적재 구현 (D-4 CEO 결정 후) | CEO D-4 결정 후 |

---

**CEO 즉시 결정 요청 (D-1~D-5)**: §4.2 참조. G-1(PIPA 보완)·G-3(frozen)은 결정 대기 없이 즉시 착수.
