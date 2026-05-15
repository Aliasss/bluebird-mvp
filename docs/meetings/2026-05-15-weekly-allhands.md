# BlueBird 주간 All-Hands — 2026-05-15

**일시**: 2026-05-15 18:00 KST
**주차**: 2026-W20 (5월 3주차) · 회의록 #2
**참여자**: 14 페르소나 (parallel dispatch, Opus × 14)
**기록**: senior-qa-engineer (회의록 정합성 독립 검증)
**목적**: 주 마감 deep 합의 — 향후 1~2주 절박 아젠다·미완 actions·전략 시그널

---

## 0. 현황 (개회 시점 기준)

### 0.1 7일 git 통계 (2026-05-09 ~ 2026-05-15)

| 날짜 | 커밋 | 내용 |
|---|---|---|
| 2026-05-11 | `e6c0e62` feat(funnel) | 인지 단계 4 events + 메타회피 카피 가드 (A1·A3·A4 백로그) |
| 2026-05-11 | `31ba9c1` docs(backlog) | 파운더 자기분석 review 잔여 12건 아카이브 |
| 2026-05-12 | `964d50d` fix(push) | cron이 GET 요청을 받아야 하는데 POST만 export — 알림 미발송 root cause |

**총 3 커밋. 5/10 all-hands 23 actions 산출물 커밋 0건. standup 5일 0건.**

### 0.2 PMF 게이트 진척

| 게이트 | 임계 | 현재 상태 |
|---|---|---|
| 자발 가치 언급 ≥30% | N/A | IM.1 모집 0명 |
| 30일 잔존율 ≥15% | N/A | 베타 사용자 0 |
| 결제 의향 ≥20% | N/A | 베타 사용자 0 |
| CMO Stage | Stage 0 | IM.1 모집 아직 미시작 |
| 분기 평가 시즌 | 5월 피크 마지막 주 | 다음 트리거 8월 (13주 공백) |

### 0.3 _actions.md 현황

| 항목 | 상태 |
|---|---|
| [CEO] VAPID Phase 3 수행 (due 5/17) | Open |
| [CEO] IM.1 모집 시작 (due 5/17) | Open |
| [senior-fullstack] app/privacy push 항목 추가 (due 5/24) | Open |
| [senior-qa] iOS push E2E (due 5/24) | Open |
| [all-hands] 5/10 23 actions seed (due 5/17) | Open — 23건 bulk 항목 미개별화 |

**5/10 all-hands A-1~E-2 (23건) due date 5/11~5/15: 완료 확인 커밋 0건. 전량 overdue 추정.**

---

## 1. CEO 개회

> agenda 없음 (_pending/ 비어있음) — routine standing summary로 진행
>
> "5/10 all-hands에서 23개 action을 합의했고 이번 주 5/17이 많은 deadline이다. 그런데 커밋은 3건, standup은 0건. 가장 절박한 것들만 짚겠다. 특히 cron 활성화(5/17)와 IM.1 모집(5/17) 두 CEO 액션 앞에 무엇이 블로커인지 명확히 가려달라."

---

## 2. 발언 라운드

### 2.1 CPO

**⚠️ 아젠다 A (P0) — 시간 자체가 본질 위협**

베타 사용자 0명, IM.1 모집 미시작, standup 0건/5일, 지난 5일 커밋 3건. PMF 게이트는 *시간*에 잠겨 있는데 검증 메커니즘 가동 자체가 멈춰 있습니다. 우선순위 #1 Falsifiability 위반 — 검증할 데이터가 0이면 가설은 죽지도 살지도 않습니다.

**아젠다 B — A-5 GO/NO-GO 결정을 오늘 강제**

CEO due 5/11 결정이 4일 overdue. 오늘 18:30까지 GO/NO-GO, NO-GO면 차단 요인 명시 요청.

**Carry-over Actions (CPO owner):**
- A-4 (rubric v1.0 frozen): due 5/14 → overdue. 5/18(월) EOD frozen 커밋 약속. CSO 초안 5/15 EOD 미도착 시 v0.9 draft CPO가 직접 surface.

**잠재 반론 인지:**
- CTO "Phase 3 인프라 선행": 동의하나 모집 공지·폼·rubric은 인프라와 병렬 가능.
- CSO "rubric 조기 박제": frozen = IM.1 코딩 일관성 확보용, v1.1은 IM.1 종료 후 가능.
- **비목표 재확인**: cron 버그 fix 후 알림 빈도·톤 튜닝으로 흐르면 본질 위협 #4. 알림은 상태 변화 트리거 한정.

---

### 2.2 CSO

**아젠다 A (P0) — 카테고리 정의가 0명에서 증발 중**

디스턴싱이 분기 평가 시즌 마지막 주에 캠페인을 돌리는 동안 우리는 분석가 톤 카피 한 줄도 시장에 없습니다. E-1 스냅샷 미가동으로 **6주+ sensor-blind 상태** 지속 중.

**Carry-over Actions (CSO owner):**

| Action | Due | 상태 |
|---|---|---|
| A-4 rubric v1.0 CSO 매핑 + CPO sign-off | 5/14 | **미이행** (어제 overdue) — 월 EOD 처리 |
| E-2 cmo-stage-guide CSO 트리거 명문화 | 5/15 (오늘) | **부분** — 정량화 미흡 |
| E-1 디스턴싱·하루콩 스냅샷 | 5/15 (오늘) | strategy-manager owner — 오늘 23:59 결과 수령 예정 |

**CSO 우선순위**: E-1 > A-4 > E-2.

**잠재 반론 인지:**
- CPO "모집 먼저": 수용. 단 모집 메시지 자체가 차별화 3축 정합 카피라는 점 합의 필요.
- CMO "스냅샷은 베타 시그널 후 calibrate": 거부 — 베타 시그널은 우리 카피로 모은 사람한테서 나오므로 calibration 기준 선행.

⚠️ **본질 위협 #1** (디스턴싱 분석가 톤 진입): 이번 주 모니터링 산출물 0건. **블라인드 상태**.

---

### 2.3 CTO

**아젠다 A (P0) — cron 침묵 5일: monitoring 부재가 root cause**

`964d50d` GET export 복구는 증상 처리. 5/10~5/12 사이 cron 완전 침묵인데 detection 0. **즉시**: cron 성공/실패 메트릭 + 24h 무발송 알림. 결제 가설 B(락인) 직접 손상.

**아젠다 B — B-1~B-5 전부 overdue, 보안 가드 약화 누적**

이번 주 보안 트랙 산출물 0건.

**B-1~B-5 진척:**

| Action | 상태 | 비고 |
|---|---|---|
| B-1 service_role 인벤토리 | overdue +3d | W21 우선순위 1번 |
| B-2 v_push_funnel SECURITY INVOKER | overdue +2d | W21 화요일 |
| B-3 push_clicked iOS SW 실측 | 블록 | cron 복구 후 5/13~ 데이터 유효 |
| B-4 metadata Zod 화이트리스트 | overdue +1d | W21 화요일 |
| B-5 push 카피 lint:copy 룰 | overdue +1d | risk/strategy 트랙 |

**W21 커밋 약속**: 월 cron monitoring·B-1, 화 B-2·B-4, 수 B-3 실측.

**잠재 반론 인지:**
- CPO "B 트랙보다 가설 A 기능 먼저": cron 5일 죽음이 이브닝 체크인→Δpain 측정 채널을 끊었음. 보안·발송 인프라는 A의 전제.
- risk-manager "미발송 5일 사용자 약속 위반": 영향 사용자 수·미발송 알림 수 W21 월요일 보고.

---

### 2.4 CMO

**아젠다 A (P0) — D-1~D-5 전부 overdue: 5/17 발화 시 attribution 0**

D-1 어휘 사전·D-2 SMTP+UTM·D-4 카피 3종·D-5 Q4~Q7 audit+가이드·E-2 stage-guide — 전부 overdue. 이틀 안에 최소 D-1·D-2·D-4만 min-viable 머지 필요.

**제안**: 5/16(토) D-1·D-2·D-4 min-viable → 5/17 CEO 발화. D-3·D-5는 5/17 후 48시간 내 follow-up.

**Carry-over (CMO+산하):**

| Action | Owner | Due | 상태 |
|---|---|---|---|
| D-1 어휘사전 v1 | content-mkt | 5/12 | overdue 3d |
| D-2 SMTP+UTM v0 | perf-mkt | 5/12 | overdue 3d |
| D-3 funnel events+attribution | perf-mkt | 5/13 | overdue 2d |
| D-4 카피 3종 | content-mkt | 5/14 | overdue 1d |
| D-5 Q4~Q7 audit + 가이드 v1 | sr-ux | 5/11·5/13 | overdue 2~4d |
| E-2 cmo-stage-guide CSO trigger | CSO+CMO | 5/15 (오늘) | 미착수 |

⚠️ **Stage 0 가드 재확인**: 외부 광고·SEO 캠페인 비목표.

---

### 2.5 product-designer

**아젠다 A (P0) — A-7 4일 overdue, 5/16(토) 완료 약속**

`docs/test-reports/` 디렉터리 자체 미존재. 착수 흔적 0. **5/16(토) 실기 캡처 + 보고서 PR.** 스코프: `/log`·`/analyze`·`/visualize` 오전, `/action`·`/dashboard`·push UI 오후. verify: 320px 캡처 13장 + 가독성·터치 타깃·overflow 3-체크리스트.

**⚠️ 아젠다 B — `e6c0e62` 메타회피 가드 적용 범위 누수**

A3 패턴이 *현재 코드 카피*만 검사. **IM.1 모집 카피는 `lib/content/` 외부에 존재** → 가드 우회 가능. 본질 위협 #1 변종이 모집 카피에서 새어 들어올 1순위 경로. **별도 PR로 lint-copy glob 확장 제안** (CPO 승인 후).

**Carry-over:**
- 카피 톤 sweep (our-philosophy·me·journal·review): 50%에서 정체 → W21 명시 이월.

**잠재 반론**: CTO "또 미끄러지면" → 토 18:00 미제출 시 스코프 자동 축소(3플로우).

---

### 2.6 product-owner

**아젠다 A (P1) — 5/10 23 actions _actions.md 개별화**

bulk 항목으로 A-6·C-2 due date 경과를 *인지조차 못 했다*. 구조적 결함. 오늘 회의 후 30분 내 23 row 개별 분해 commit.

**아젠다 B — A-6·C-2 overdue 재정의**

- **A-6 응모 폼 (due 5/12, +3d)**: 미착수. Tally 확정, **재 due 5/18(월)**.
- **C-2 측정 SOP (due 5/13, +2d)**: PO가 초안 미제공 — PO 책임. **재 due 5/19(화)**.

**잠재 반론**: CTO "개별화는 오버헤드" → bulk 항목이 3일 overdue를 못 surface한 비용이 더 큼.

---

### 2.7 senior-ux-researcher

**⚠️ 아젠다 A (P0) — 인터뷰 가이드 부재 STOP**

가이드 없이 IM.1 모집 시작 = 인터뷰어 즉흥 어휘 진행 = 자발 vs 유도 분리 불가 = coding-rubric §0 #1·#2 가드 무력화 = **Falsifiability 붕괴**.

**제안**: 5/18 09:00 KST 인터뷰 가이드 v1 MVP hard deadline. 미달 시 모집 게시 1주 추가 지연 권고. (모집 1주 지연 비용 < N=30 데이터 오염 비용)

**Carry-over (D-5):**
| Action | Due | 상태 |
|---|---|---|
| 모집 폼 Q4·Q5 어휘 audit | 5/11 | **미완 +4d** (자가검증 1차만) |
| 인터뷰 가이드 v1 | 5/13 | **미생성 +2d** |

**rubric v1.0 frozen**: 문서 "frozen" 명시 없음. A-4가 요구한 CSO 3축 매핑이 *현 A 영역 명시화*인지 *별도 산출물*인지 CSO 환기 요청.

**결정 요청 (CPO)**:
- (a) 5/18 09:00 인터뷰 가이드 v1 MVP hard deadline 승인
- (b) 미달 시 모집 1주 지연 권한 위임
- (c) Q4·Q5 외부 audit 5/17(토) 24h sprint 승인

---

### 2.8 data-analyst

**아젠다 A (P0) — PMF 게이트 분모·분자 미합의**

C-1 1-pager 2일 overdue. 분모 미합의 상태에서 사용자 유입 시 retroactive 재정의 → 코호트 오염. **5/16(토) 1-pager draft → 5/19(화) CPO 승인.**

- 자발 언급 분모: 응답자 전체 vs 1차 타겟 3축 충족자 → 후자면 N<50 가능, 신뢰구간 ±13%p
- 잔존 ≥15%: install 기준 vs 첫 체크인 기준 → 2~3배 차이
- 결제 의향: "지불하겠다" vs 구체 금액 → measurable 차이

**아젠다 B — `e6c0e62`↔C-3 이벤트 정합성 불명**

"인지 단계 4 events"가 C-3 7개의 subset인지 별도 트랙인지 senior-fullstack 확인 요청. 두 스키마 분리 시 funnel join 불가.

**Carry-over:**

| Action | Due | 상태 |
|---|---|---|
| C-1 PMF 분모·분자 1-pager | 5/13 | **+2d** — 5/16 draft |
| C-3 7개 이벤트 스펙 | 5/13 | **+2d** — `e6c0e62` diff 후 5/18 전달 |
| C-4 9×14 매핑표 | 5/12 | **+3d** — C-3 확정 후 5/20 |

---

### 2.9 strategy-manager

**아젠다 A (P0) — 분기 평가 시즌 오늘 닫힘**

5월 분기 평가 피크 마지막 주. 다음 자연 트리거 8월(13주 공백). IM.1 모집이 5/18 월요일 안에 시작되지 못하면 "분기 평가 맥락 자발 언급" 코호트 이번 분기 통째로 유실.

**트레이드오프:**

| 옵션 | 장점 | 비용 |
|---|---|---|
| A) rubric v1.0 frozen 후 5/19 모집 | 코딩 신뢰도 보존 | 분기 평가 맥락 자발 언급 일부 유실 |
| B) v0.1로 5/16 모집 시작, frozen 병행 | 시즌 코호트 확보 | frozen 전 응답은 재코딩 전제 |

**권고: A** — frozen 지연이 더 큰 비용. 단 5/18 월요일 frozen을 못 박아야 함.

**Carry-over:**

| Action | Due | 상태 |
|---|---|---|
| A-3 rubric v0.1 surface | 5/12 | **+3d** — 오늘 EOD surface |
| E-1 디스턴싱·하루콩 스냅샷 v0 | 5/15 | 진행 중 — 오늘 23:59 CSO 보고 |

---

### 2.10 risk-manager

**⚠️ ESCALATE-1·2 (P0) — VAPID 활성화 전 PIPA 게이트**

`964d50d` cron 복구됨 → **VAPID Phase 3 완료 순간 push 실발사 + PIPA §15·§22 동시 위반 노출**.

| 리스크 | 등급 | 임시 가드 |
|---|---|---|
| notification_events 처리방침 미명시 (PIPA §15) | **P0** | privacy.tsx 즉시 PR |
| Push 권한 직전 고지 카피 부재 (PIPA §22) | **P0** | 권한 직전 inline 고지 UI |

**제안**: A-2 privacy PR 머지 + 고지 UI 배포 **이전에** CEO Phase 3 활성화 보류. 24h 지연이지만 "발사 후 위반"은 되돌릴 수 없음.

**Carry-over:**

| Action | Due | 상태 |
|---|---|---|
| A-2 처리방침·약관 push 항목 추가 | 5/13 | **+2d** — 오늘 밤 draft |
| B-5 lint:copy push 카피 룰 | 5/14 | **+1d** — 월요일 오전 머지 |

**결정 요청 (CEO+CSO)**: A-2 머지 전 Phase 3 활성화 보류 승인.

> 변호사 정식 자문 필요: 권한 동의 UI 최종 문구는 G3 검토 권장.

---

### 2.11 senior-fullstack-engineer

**아젠다 A (P0) — cron healthcheck 없이 Phase 3 활성화 무의미**

cron 침묵 5일 detection 0이 드러낸 건 회귀 추적 인프라 부재. **즉시**: `last_cron_invoked_at` 테이블 + 24h staleness 알림. 이것 없이 Phase 3 실측 의미 없음.

**`964d50d` 임팩트:**
- Plus: Phase 3 실측 unblock
- Minus: 5/10~5/12 push 데이터 전량 invalid
- Lesson: route HTTP verb CI grep 가드 → 다음 PR 포함

**Carry-over:**

| Action | 상태 |
|---|---|
| B-1 service_role 인벤토리 | 0% — W21 우선순위 1번 |
| B-2 v_push_funnel INVOKER | 0% — W21 화 |
| B-3 iOS push_clicked 실측 | 블록 → 5/13~ 데이터부터 유효 |
| B-4 metadata Zod 화이트리스트 | 0% — W21 화 |
| C-2 measurement-sop.md | 0% — PO 합동 미스케줄 |

**W21 커밋 약속**: 월 cron monitoring, 화 B-2·B-4, 수 B-3 실측.

---

### 2.12 senior-qa-engineer

**아젠다 A — A-1·C-4 overdue + e6c0e62 검증 부분 통과**

**e6c0e62 독립 검증 결과:**

| 점검 | 결과 |
|---|---|
| lint-copy META_AVOIDANCE_PATTERNS 3패턴 | PASS |
| CognitiveFunnelEvent 4종 타입 정합 | PASS |
| 4 call site void 처리 | PASS |
| Supabase 실제 적재 검증 | **보류** |
| 텔레메트리 실패 시 요청 비차단 테스트 | **보류** |

**14 → 18 events**: C-4 매핑 대상이 증가 → **재작성 필요. 재 due 5/18(월).**

**Carry-over:**

| Action | Due | 상태 |
|---|---|---|
| A-1 E2E 9단계 보고서 + AI baseline | 5/12 | **+3d** — 재 due 5/19(화) |
| C-4 9단계 × event_type 매핑표 | 5/12 | **+3d** — 18 event 기준 재작성, 재 due 5/18(월) |
| iOS E2E push (from standup) | 5/24 | Phase 3 완료 후 |

**머지 보류 권고 없음**: e6c0e62 코드 정합 PASS. 단 A-1·C-4 전까지 인지 펀넬 KPI를 strategy 결정 근거로 인용 금지.

---

### 2.13 content-marketer

**아젠다 A (P0) — 어휘 사전 v1 오늘 밤 commit 약속**

순서 오류 자백: 이메일 3종(D-4) 먼저 쓰려다 어휘 사전(D-1) 없이 작성하면 retrofit 비용 더 큼. **오늘 23:00 D-1 초안 commit → 5/17(일) D-4.** 

**어휘 분류 구조 (사전 v1)**:
- **금지** (lint-copy 차단): "위로", "함께 안아", "스트레스 관리"(입구), 메타회피 패턴 등
- **거부** (사람 리뷰): "AI 친구", "치유", 파스텔 카피
- **강화**: "분석", "디버깅", "패턴", "재평가", "반증", "운영"
- **회색지대**: "마음", "감정" (분석 객체로만 허용)

**사전 v1 = lint-copy 상위 집합. lint-copy는 자동 grep gate.**

**Carry-over:**

| Action | Due | 상태 |
|---|---|---|
| D-1 brand-voice-lexicon-v1.md | 5/12 | **+3d** — 오늘 23:00 draft |
| D-4 im1/email-templates-v1.md | 5/14 | **+1d** — D-1 완료 후 5/17 |

---

### 2.14 performance-marketer

**아젠다 A (P0) — attribution 인프라 zero: 5/17 발화 시 데이터 손실 확정**

UTM 미정의 → 채널별 전환 분리 불가. funnel 이벤트 미정의 → 이탈 구간 식별 불가. SMTP stagger 문서 없음 → 도메인 reputation 손상 위험.

**오늘(5/15) 23:59 KST 3종 draft commit 약속:**
- SMTP stagger v0 (30명 × 3일, 시간당 ≤8건)
- UTM 스키마 v0 (DM-SNS·이메일·organic·direct 4채널)
- funnel 이벤트 명세 v0 (랜딩 → 신청 → 확정)

**Carry-over:**

| Action | Due | 상태 |
|---|---|---|
| D-2 SMTP stagger + UTM v0 | 5/12 | **+3d** — 오늘 23:59 draft |
| D-3 funnel 이벤트 명세 v0 + attribution 진단 | 5/13 | **+2d** — 오늘 23:59 draft |

**잠재 반론**: CEO "1일 연기 어렵다" → attribution 없는 발화 시 IM.2 개선 근거 영구 손실. 1일 연기 비용 < 데이터 손실 비용.

---

## 3. 충돌 검출

### §3.1 주요 충돌 표

| 위치 A | 위치 B | 트레이드오프 | CEO 결정 필요? |
|---|---|---|---|
| **CEO/CMO**: IM.1 모집 5/17 발화 (두 CEO action) | **risk-manager**: A-2 처리방침 PR 머지 전 cron 활성화 보류 (PIPA P0) | 일정 준수 vs 법규 위반 방지 (24h 지연으로 해결 가능) | ⚠️ Yes — A-2 머지 전 Phase 3 보류 |
| **CMO**: 5/17 발화 (D-1·D-2·D-4 min-viable) | **senior-ux-researcher**: 인터뷰 가이드 없으면 5/18까지 모집 보류 (Falsifiability P0) | 속도 (시즌 코호트) vs 측정 신뢰도 (자발 언급 오염 방지) | ⚠️ Yes — 모집 게시 시점 결정 |
| **strategy-manager**: rubric v1.0 frozen 후 5/18 or 5/19 모집 | **CPO**: A-5 GO/NO-GO 오늘 강제 + 5/17 게시 목표 | 시즌 코호트 확보 vs 코딩 신뢰도 | 합의 가능: 5/18 모집 + 동시 frozen |
| **senior-fullstack**: B-1·C-2 W21 reslip 요청 | **CTO**: B-1 service_role 인벤토리는 P0 안전 가드 — 지연 불가 | W21 sprint 우선순위 vs P0 보안 | CTO 결정 (B-1 최우선, B-4 2순위로 합의 가능) |
| **data-analyst**: C-3 7개 이벤트 스펙 delta-only 5/18 전달 | **senior-qa**: C-4 18 event 기준 재작성 5/18 | 이벤트 스키마 단일 진실원 확립 선후 관계 | 합의 가능: C-3 diff 5/18 → C-4 18-event 재작성 5/19 |

### §3.2 충돌 아닌 것 (정합 확인)

- **rubric v1.0 5/18 frozen**: CPO·CSO·strategy-manager 모두 동의. 시간 차 이슈만.
- **cron healthcheck 즉시**: CTO·senior-fullstack 동의. 구현 비용 최소.
- **_actions.md 23건 개별화**: PO owner, W20 내. 반대 없음.
- **Stage 0 비허용**: CMO·content-marketer·performance-marketer 모두 동일 인지.
- **e6c0e62 코드 정합**: senior-qa PASS (실적재 검증 보류). 머지 보류 없음.

### §3.5 Owner 재할당·미할당 surface

| 영역 | 항목 | 현재 상태 | 결정 |
|---|---|---|---|
| cron healthcheck monitoring | 신규 P0 인프라 | senior-fullstack 자발 약속 (W21 월) | senior-fullstack → CTO 승인 |
| B-5 lint:copy push 카피 룰 | risk-manager + strategy-manager 공동 | 1일 overdue | risk-manager lead → W21 월 |
| 인터뷰 가이드 v1 | senior-ux-researcher | 2일 overdue, 5/18 hard deadline | 승인 여부 CPO 결정 |
| _actions.md 23건 개별화 | PO owner | 오늘 30분 내 분해 commit 약속 | — |
| e6c0e62 Supabase 실적재 검증 | senior-qa 보류 항목 | 미실행 | senior-qa + senior-fullstack → W21 |

---

## 4. 합의

### §4.1 합의 사항

1. **rubric v1.0 frozen 5/18(월) EOD** — CPO 주도, CSO A 영역 3축 매핑 포함. strategy-manager A-3 v0.1 오늘 EOD.
2. **IM.1 모집 시작: 5/19(화) 조건부** — 조건: (a) A-2 처리방침 PR 머지, (b) 인터뷰 가이드 v1 5/18 09:00 KST, (c) rubric v1.0 frozen. 셋 ALL clear → 5/19(화) GO. [strategy-manager B 옵션 대신 A + 1일 당기기]
3. **cron healthcheck W21 월요일** — senior-fullstack 구현, CTO 승인. Phase 3 실측의 선행 조건.
4. **B-1 W21 우선순위 1번** — service_role 인벤토리 보안 가드 P0. B-2·B-4 화요일.
5. **_actions.md 23건 개별화** — PO 오늘 회의 후 30분 내 commit.
6. **e6c0e62 스키마 정합**: C-3 diff-only 스펙 5/18 → C-4 18-event 재작성 5/19.
7. **E-1 스냅샷 오늘 23:59 KST** — strategy-manager → CSO 보고.
8. **D-1(어휘사전)·D-2(SMTP+UTM)·D-3(funnel events) 오늘 23:59 draft** — content-marketer·performance-marketer 각자 약속.

### §4.2 CEO 결정 필요 항목 ⚠️

| 항목 | 안 | CEO 결정 |
|---|---|---|
| ⚠️ **PIPA 게이트 신설**: A-2 처리방침 PR 머지 전 Phase 3 활성화 보류 | risk-manager 제안 | CEO가 5/16 토 오전까지 A-2 PR 머지 후 Phase 3 실행 or 5/18 월 모집 시작에 맞춰 정렬 |
| ⚠️ **모집 게시 시점**: 5/17 vs 5/19(조건부) | CPO·CMO 5/17 vs UX-researcher 5/18+ 선행 가드 | 5/19 조건부 GO (세 전제조건 충족 시 자동 발사) 또는 5/17 강행 시 인터뷰 가이드 없음 명시 |
| ⚠️ **인터뷰 가이드 v1 보류 권한**: 미달 시 1주 지연 위임 | senior-ux-researcher 요청 | CPO 위임 여부 결정 |

---

## 5. Action Items (다음 주)

| ID | Action | Owner | Due | Verify |
|---|---|---|---|---|
| F-1 | A-3 rubric v0.1 surface | strategy-manager | **2026-05-15 EOD** | `docs/im1/coding-rubric-v0.1.md` 또는 기존 v1 CSO 3축 섹션 추가 |
| F-2 | D-1 brand-voice-lexicon-v1.md draft commit | content-marketer | **2026-05-15 23:00** | 금지·거부·강화·회색지대 4분류 + lint-copy 매핑표 |
| F-3 | D-2+D-3 SMTP stagger + UTM + funnel events v0 draft | performance-marketer | **2026-05-15 23:59** | 3종 문서 draft commit |
| F-4 | E-1 디스턴싱·하루콩 스냅샷 v0 CSO 보고 | strategy-manager | **2026-05-15 23:59** | 스냅샷 폴더 + 톤 변화 5개 어휘 관찰 |
| F-5 | A-2 처리방침·약관 push+notification_events 항목 추가 PR | risk-manager | **2026-05-16(토) 12:00** | app/privacy PR 머지 + push 동의 고지 UI 1줄 |
| F-6 | iPhone SE 320px 실기 테스트 보고서 | product-designer | **2026-05-16(토) 18:00** | `docs/test-reports/iphone-se-320px-2026-W20.md` + 캡처 13장 |
| F-7 | C-1 PMF 게이트 분모·분자 1-pager draft | data-analyst | **2026-05-16(토) 18:00** | 3가지 옵션 → CPO·PO 회람용 |
| F-8 | Phase 3 VAPID 키 생성·Vercel 환경변수 설정 (A-2 머지 후) | CEO | **2026-05-17(일)** | A-2 PR 머지 후 활성화 |
| F-9 | A-4 rubric v1.0 CSO 3축 매핑 + frozen 표기 | CSO + CPO | **2026-05-18(월) EOD** | rubric 파일 frozen 명시 + 양측 sign-off |
| F-10 | 인터뷰 가이드 v1 MVP (10문항 최소판) | senior-ux-researcher | **2026-05-18(월) 09:00** | `docs/im1/interview-guide-v1.md` 존재 |
| F-11 | A-6 응모 폼 구축 (Tally, Q1~Q5 정합 + 동의) | PO | **2026-05-18(월) EOD** | 폼 URL + Q1~Q5 정합 |
| F-12 | cron healthcheck (last_cron_invoked_at + 24h staleness 알림) | senior-fullstack | **2026-05-18(월) EOD** | 의도적 cron 중단 시 알림 발사 verify |
| F-13 | B-2 v_push_funnel SECURITY INVOKER Migration 16 | senior-fullstack | **2026-05-19(화) EOD** | 3종 회귀 표준 verify |
| F-14 | B-4 metadata Zod enum 화이트리스트 키 강제 | senior-fullstack | **2026-05-19(화) EOD** | 잘못된 키 reject 테스트 |
| F-15 | B-5 push 카피 lint:copy 룰 ("기분·우울·불안") | risk-manager | **2026-05-18(월) EOD** | lint:copy 0위반 verify |
| F-16 | IM.1 모집 시작 GO/NO-GO 최종 결정 | CEO | **2026-05-18(월) 09:00** | F-5·F-9·F-10 ALL clear 확인 후 GO |
| F-17 | C-3 이벤트 스펙 (e6c0e62 delta-only 방식) | data-analyst | **2026-05-18(월) EOD** | senior-fullstack 전달 스펙 문서 |
| F-18 | C-4 9단계 × 18 event_type 매핑표 재작성 | senior-qa + senior-fullstack | **2026-05-19(화) EOD** | A-1 E2E 보고서에 포함 또는 별도 |
| F-19 | A-1 E2E 9단계 실행 보고서 + AI anomaly baseline | senior-qa | **2026-05-19(화) EOD** | 9단계 ALL PASS 또는 fail 목록 + baseline |
| F-20 | C-2 측정 SOP (PO 초안 → senior-fullstack 검토) | PO + senior-fullstack | **2026-05-19(화) EOD** | `docs/im1/measurement-sop.md` |
| F-21 | B-1 service_role 인벤토리 + rls-audit.ts 확장 | senior-fullstack | **2026-05-19(화) EOD** | 인벤토리 1줄 + audit 결과 |
| F-22 | D-4 이메일 카피 3종 (선정·미통과·follow-up) | content-marketer | **2026-05-17(일) EOD** | `docs/im1/email-templates-v1.md` |
| F-23 | _actions.md 5/10 23 actions 개별화 | PO | **2026-05-15 (오늘 30분 내)** | A-1~E-2 23 row 개별 등록 |

---

## 6. Carry-over 정리 (5/10 actions 상태)

| ID | Action | 상태 | 이번 all-hands 처리 |
|---|---|---|---|
| A-1 | E2E 보고서 | +3d overdue | F-19로 재지정 (5/19) |
| A-2 | 처리방침 push 항목 | +2d overdue | F-5로 재지정 (5/16 토) |
| A-3 | rubric v0.1 | +3d overdue | F-1로 재지정 (오늘 EOD) |
| A-4 | rubric v1.0 frozen | +1d overdue | F-9로 재지정 (5/18 월) |
| A-5 | 모집 GO/NO-GO | +4d overdue | F-16으로 재지정 (5/18 월) |
| A-6 | 응모 폼 | +3d overdue | F-11로 재지정 (5/18 월) |
| A-7 | iPhone SE 테스트 | +4d overdue | F-6으로 재지정 (5/16 토) |
| B-1 | service_role 인벤토리 | +3d overdue | F-21로 재지정 (5/19 화) |
| B-2 | SECURITY INVOKER | +2d overdue | F-13으로 재지정 (5/19 화) |
| B-3 | iOS SW 실측 | 블록 | cron 데이터 누적 후 W21 내 |
| B-4 | Zod 화이트리스트 | +1d overdue | F-14로 재지정 (5/19 화) |
| B-5 | push 카피 lint:copy 룰 | +1d overdue | F-15로 재지정 (5/18 월) |
| C-1 | PMF 분모·분자 1-pager | +2d overdue | F-7로 재지정 (5/16 토) |
| C-2 | 측정 SOP | +2d overdue | F-20으로 재지정 (5/19 화) |
| C-3 | 7개 이벤트 스펙 | +2d overdue | F-17로 재지정 (5/18 월) |
| C-4 | 9×14 매핑표 | +3d overdue | F-18로 재지정 (5/19 화, 18 event로) |
| D-1 | 어휘 사전 v1 | +3d overdue | F-2로 재지정 (오늘 23:00) |
| D-2 | SMTP+UTM v0 | +3d overdue | F-3으로 재지정 (오늘 23:59) |
| D-3 | funnel 이벤트 명세 | +2d overdue | F-3으로 통합 (오늘 23:59) |
| D-4 | 이메일 카피 3종 | +1d overdue | F-22로 재지정 (5/17 일) |
| D-5 | Q4~Q7 audit + 인터뷰 가이드 | +2~4d overdue | F-10으로 통합 (5/18 월 09:00) |
| E-1 | 디스턴싱 스냅샷 | 오늘 마감 | F-4로 재지정 (오늘 23:59) |
| E-2 | cmo-stage-guide CSO trigger | 오늘 마감 | F-9와 연동 (5/18 월 CSO sign-off 시 동시 처리) |
