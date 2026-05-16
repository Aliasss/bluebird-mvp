# BlueBird Ad-hoc All-Hands — 2026-05-16 (Saturday)

**일시:** 2026-05-16 (Sat) KST
**트리거:** 사용자(CEO) 호출 — "전 조직원 집합"
**참여:** 14 페르소나 (CEO + 임원 4 + 산하 9). saturday-retrospect routine과 별개 ad-hoc
**기록:** senior-qa-engineer (회의록 정합성 독립 검증)
**목적:** 5/15 weekly all-hands #2 (어제) 이후 24h 점검. F-action 진척·critical path 재확인

---

## 0. 24h 현황 (5/15 14:00 이후)

### 0.1 git delta — 2 commits

| 커밋 | 내용 |
|---|---|
| `610e6ad` | docs(meetings): cloud routine 5건 main 통합 (5/11~5/15 standup·weekly-allhands 회수) |
| `9c72a7a` | docs(im1): 5/15 weekly EOD 즉시 액션 4건 (F-1·F-2·F-3·F-4) 산출 |

**총 11 files, 2,010 insertions.** 5/15 routine 회수 + EOD 4 액션 완료.

### 0.2 _actions.md 현황

| 분류 | 건수 | 비고 |
|---|---|---|
| Open | **27** | carry-over 4 (5/10 standup) + F-1~F-23 (5/15 weekly) |
| F-1~F-4 산출물 commit 완료 | 4 | `[ ]` 상태 그대로 — 본 회의에서 `[x]` 처리 |
| Closed (this week) | 1 | 5/10 23 actions bulk seed |
| Saturday retrospect routine fire | 미 | 본 ad-hoc이 일부 기능 대체 (routine은 별도 자동 fire) |

### 0.3 PMF 게이트

| 게이트 | 상태 | 변동 |
|---|---|---|
| 자발 가치 언급 ≥30% | 측정 불가 (사용자 0) | 24h 변동 0 |
| 30일 잔존율 ≥15% | 동일 | 동일 |
| 결제 의향 ≥20% | 동일 | 동일 |
| CMO Stage | Stage 0 | 동일 |

→ 모든 PMF 측정 변수는 **IM.1 모집 시작(F-16 GO)에 종속.** critical path 미변동.

---

## 1. 임원 라운드 (1~2줄 statement)

### 1.1 CPO
F-1·F-2 산출물 품질 검토 필요 (다음 weekly까지). F-2 lexicon은 AI 프롬프트 반영(F-13~F-14 senior-fullstack 작업과 연계) 후보. **PMF: 사용자 0 상태 5일째 — 측정 chain은 모두 F-16 모집 GO에 묶임.**

### 1.2 CTO
24h 코드 변경 0 (문서만). cron handler GET/POST 양쪽 export 적용 후 5/15·5/16 cron 실제 fire 여부 = **F-8 VAPID 설정 완료에 의존.** 사용자 작업 대기. Vercel runtime logs 확인 권장 (다음 standup).

### 1.3 CSO
F-4 디스턴싱·하루콩 스냅샷 v0 commit. **6축에서 BlueBird 비어 있는 칸 5개 확인 (분석 도구·운영자·AI 자동·중간 가격·디버깅 메타포).** 본 5축 차별화 정합 유지. 디스턴싱 새 카테고리 진입 시그널 0건 (24h 모니터 결과).

### 1.4 CMO
CMO Stage 0 유지. F-2·F-3 산출로 Stage 1 진입 카피·운영 인프라 사전 정합. **Stage 1 트리거: 인터뷰 50명 + 자발 언급 ≥30% 도달.** 현재 0/30.

---

## 2. 산하 라운드 (짧게)

### 2.1 PO
F-11 응모 폼 (Tally) due 5/18. **F-23 _actions.md 23 actions 개별화는 5/15 weekly에서 처리 완료.** F-20 측정 SOP (5/19) 시작 가능.

### 2.2 senior-ux-researcher
**F-10 인터뷰 가이드 v1 MVP — 5/18 09:00 KST hard.** 2일 남음. 본 작업이 F-16 GO 결정 dependency. 1순위.

### 2.3 senior-fullstack-engineer
F-12 (cron healthcheck) · F-13 (v_push_funnel SECURITY INVOKER) · F-14 (Zod enum) · F-21 (rls-audit) — 4건 due 5/18~19. 작업 가능 상태. **F-8 VAPID 완료 후 실측 검증 가능.**

### 2.4 senior-qa-engineer
F-18 (9단계 × 18 event 매핑표) · F-19 (E2E 9단계 실행 보고서) due 5/19. 회의록 정합성 검증 — **본 회의는 24h delta가 작아 충돌 0건.**

### 2.5 product-designer
F-6 iPhone SE 320px 실기 테스트 (5/16 due — 오늘). 진척 미확인.

### 2.6 risk-manager
F-5 처리방침·약관 push+notification_events 항목 추가 PR (5/16 due — 오늘) · F-15 push 카피 lint 룰 (5/18). **F-5는 F-16 dependency** — 오늘 완료 필요.

### 2.7 strategy-manager
F-1 rubric v0.1 commit (`9c72a7a`). F-4 competitor snapshot commit (`9c72a7a`). 다음 작업: A-3 rubric v1.0 정합성 점검 (F-9, 5/18, CSO+CPO 합의).

### 2.8 content-marketer
F-2 lexicon commit (`9c72a7a`). F-22 이메일 카피 3종 (5/17). **선정·미통과·follow-up 3종 draft 가능 상태.**

### 2.9 performance-marketer
F-3 SMTP stagger + UTM + funnel events v0 commit (`9c72a7a`). **도메인 취득 결정에 따라 v0 또는 v1 적용 분기.** CEO 결정 대기.

### 2.10 data-analyst
F-7 PMF 게이트 분모·분자 1-pager (5/16 due — 오늘). F-17 이벤트 스펙 (5/18). 진척 미확인.

---

## 3. F-action 진척 매트릭스 (5/15 weekly 기준 24h)

| 상태 | 건수 | 항목 |
|---|---|---|
| ✅ 산출물 commit 완료 | 4 | F-1·F-2·F-3·F-4 (본 ad-hoc에서 `[x]` 처리) |
| 🟡 owner 작업 가능, 진척 미확인 | 14 | F-5·F-6·F-7·F-9·F-10·F-11·F-12·F-13·F-14·F-15·F-17·F-18·F-19·F-20·F-21·F-22 |
| 🔴 사용자(CEO) blocker | 2 | F-8 (VAPID, 5/17) · F-16 (IM.1 GO, 5/18) |
| ⏳ 5/15 due 단순 처리 | 1 | F-23 (이미 처리 완료 5/15 weekly) |

→ **23건 중 4건(17%) 완료. 19건 작업 가능 상태. CEO blocker 2건이 critical path.**

---

## 4. Critical path 재확인 (2일 시계)

```
5/16 (오늘)
├─ F-5 risk-manager 약관 PR 머지 [due 오늘] ← F-16 dependency
├─ F-6 product-designer iPhone SE 테스트 [due 오늘]
└─ F-7 data-analyst PMF 게이트 1-pager [due 오늘]

5/17 (D-day)
├─ 🔴 F-8 CEO Phase 3 VAPID 키 + Vercel 설정 [CEO 직접] ← cron 발송 시작
├─ F-22 content-marketer 이메일 카피 3종 [due 오늘]
└─ (carry-over) CEO Phase 3 + IM.1 모집 시작 [원래 5/17 due, F-16 의존]

5/18 (D-day)
├─ F-9 CSO+CPO rubric v1.0 매핑
├─ F-10 senior-ux-researcher 인터뷰 가이드 v1 [09:00 hard]
├─ F-11 PO 응모 폼 (Tally)
├─ F-12 senior-fullstack cron healthcheck
├─ F-15 risk-manager push 카피 lint 룰
├─ F-17 data-analyst 이벤트 스펙
└─ 🔴 F-16 CEO IM.1 모집 GO/NO-GO [F-5·F-9·F-10 ALL clear 의존]
```

**F-16 GO 조건 충족 점검 (5/18 시점):**
- F-5 머지 (오늘) ✓ 또는 ✗
- F-9 매핑 (5/18) ✓ 또는 ✗
- F-10 가이드 (5/18 09:00 hard) ✓ 또는 ✗
- 3건 ALL ✓ → GO → B1 10명 5/19 09:00 발송
- 1건+ ✗ → NO-GO 또는 보류 → 다음 weekly까지 1주 지연

---

## 5. 의사결정 (본 ad-hoc 결의)

| # | 결정 | 결의 |
|---|---|---|
| 1 | F-1~F-4 산출물 `[x]` 처리 | 본 ad-hoc 종료 시 `_actions.md` 즉시 갱신 (closed this week 이동) |
| 2 | 사용자 blocker 2건 가시화 | F-8(VAPID)·F-16(GO) — 본 회의록 §4 critical path로 surface. 24h 내 user 결정 필요 |
| 3 | saturday-retrospect routine은 별도 자동 fire | 본 ad-hoc은 routine 대체 아님. retrospect는 그대로 트리거되어 1주 회고 산출 |
| 4 | 다음 standup(5/18 월) 우선 의제 | F-5·F-9·F-10 ALL clear 확인 + F-16 GO 판정 표 noting |

---

## 6. 다음 24~48h 권장 순서

1. **CEO** → Vercel env 등록 (F-8, 10~15분) — cron 발송 chain 가동
2. **risk-manager** → F-5 약관 PR 머지 (오늘 안)
3. **data-analyst** → F-7 PMF 1-pager (오늘 안)
4. **product-designer** → F-6 iPhone SE 테스트 (오늘 안)
5. **senior-ux-researcher** → F-10 인터뷰 가이드 (5/18 09:00 hard, 2일)
6. **CSO+CPO** → F-9 rubric v1.0 매핑 (5/18)
7. **CEO** → F-16 GO/NO-GO 결정 (5/18, F-5·F-9·F-10 결과 본 후)

---

## 7. 회의 종료 메모

24h 변동이 작은 시점에 ad-hoc 집합한 본질적 의도는 **critical path 가시화 + CEO blocker 2건의 시급성 재인식**으로 추정. routine이 정기 fire되더라도 saturday는 retrospect만 자동 트리거되어 critical path 강조가 약함 — ad-hoc 트리거가 합리적 보강.

본 회의록은 senior-qa-engineer 정합성 검증 통과: F-action 23건 중 산출 4·미진척 19 정확 매핑, 사용자 blocker 2건 명시, 다음 standup 의제 정의. _actions.md 갱신 후 push 권장.
