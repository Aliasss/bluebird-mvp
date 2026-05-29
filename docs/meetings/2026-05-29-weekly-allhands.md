# BlueBird 주간 All-Hands — 2026-05-29

**일시**: 2026-05-29 18:00 KST
**주차**: 2026-W22 (5월 5주차) · 회의록 #3
**참여자**: 14 페르소나 (parallel dispatch, Opus × 14)
**기록**: senior-qa-engineer (회의록 정합성 독립 검증)
**목적**: 주 마감 deep 합의 — 2주 공백 정산·IM.1 오염 risk·mood_level 본질 위협 논의·W23 구현 확정

---

## 0. 현황 (개회 시점 기준)

### 0.1 7일 git 통계 (2026-05-23 ~ 2026-05-29)

| 커밋 | 날짜 | 내용 |
|---|---|---|
| `c8e1981` | 2026-05-26 | feat(checkin): 모닝 5단계 mood_level + history 탭 분리 + line chart (Migration 20) |

**총 1 커밋.** 5/15~5/19 사이 코드 변경이 다수 있었으나 7일 창 바깥. 이 기간 주요 산출물: `eada9f2`(5/19 액션①② 착수) 등. 상세는 §2 발언 라운드 참조.

> **브리핑 정정 — strategy-manager 발견**: 배경자료에 "IM.1 모집 시작 여부 불명"으로 기재됐으나, **`recruitment-ops-v0 §8` launch log에 2026-05-21 09:30 Brunch 모집 글 공개 기록 확인**(`c0ae21b`). 모집은 이미 8일 전 시작됨. F-16 GO/NO-GO 게이트는 공식 기록 없이 우회됨.

### 0.2 PMF 게이트 진척

| 게이트 | 임계 | 현재 상태 |
|---|---|---|
| 자발 가치 언급 ≥30% | B 카테고리 인터뷰 코딩 | **⚠️ 오염 위험**: 응모 폼이 차별화 축 어휘("분석" 4회·"패턴"·"디버깅") 노출 → 자발 카운트 신뢰 훼손 가능 |
| 30일 잔존율 ≥15% | D30 재방문 | 분모·분자 미합의 (F-7 13일 overdue), 측정 SQL 미완성 |
| 결제 의향 ≥20% | 인터뷰 G2 이후 | 미측정 |
| CMO Stage | Stage 0 | IM.1 모집 시작됨, 응모자 수 불명 |

### 0.3 _actions.md Open 현황 요약

| 출처 | 건수 | 상태 |
|---|---|---|
| carry-over (5/10 standup) | 4건 | [CEO] VAPID Phase 3 · IM.1 모집 50명 · privacy push 항목 · iOS E2E — 대부분 overdue |
| F-1~F-4 | 4건 | **Closed** (5/15 `9c72a7a`) |
| F-5~F-23 | 19건 open | 10~13일 overdue, 대부분 미착수 확인 |
| 5/19 deep-dive 액션 ①② | 2건 | action②(micro-feedback) ✅ done (`eada9f2`), action① ⚠️ 절반 완료 (log_view만 wiring) |

---

## 1. CEO 개회

> agenda 없음 (_pending/ 비어있음) — routine standing summary로 진행
>
> "2주간 standup 0건, F-actions 10~13일 overdue인 동안 제품 코드는 계속 나갔다. 세 가지가 가장 절박하다. 첫째, IM.1 응모 폼이 우리 PMF 측정 어휘를 그대로 노출했다 — 들어온 응모자가 있다면 자발 언급 데이터가 오염됐을 수 있다. 둘째, F-5 처리방침 update 없이 push가 실발사 중이라 PIPA 노출이 진행 중이다. 셋째, mood_level이 본질 위협 #4 시그널인지 결정해야 한다. 오늘 이 셋에 대한 결정을 내린다."

---

## 2. 발언 라운드

### 2.1 CPO

**⚠️ 아젠다 A (STOP 권고) — c8e1981 mood_level: 본질 위협 #4 표시 표면 문제**

`c8e1981`이 모닝 체크인에 추가한 것 확인:
- 5단계 이모지(😞😕😐🙂😄) 기분 자기 라벨링 + "오늘 기분 5단계" 레이블
- "최근 7일 일관성 N/7일" 스트릭 카운터 + 요일 칩
- "평균 기분" StatCard + 30일 mood line chart + "매일 체크인하면 추이가 쌓입니다" 카피

이건 **본질 위협 신호 #4(정기 자기 라벨링 체크인)의 교과서적 사례.** 결정이 CEO 명시 결정(B-1 옵션)으로 처리됐다는 걸 알지만, *표시 표면*이 무드트래커 시각 언어 그대로다. 차별화 정합성(우선순위 #2) 직격.

**CPO 권고**: "평균 기분"·"7일 일관성" 표시 표면 제거 또는 인터뷰 자발 언급 트리거 게이트. mood_level *입력* 자체는 유지 가능. 카피 교체(product-designer 권한)는 CPO 승인 아래 즉시 가능. **CEO+CSO 결정 요청**.

**아젠다 B — F-16 11일 overdue: 지금 병목은 기능이 아니라 검증 인프라**

F-16 GO/NO-GO 게이트 없이 모집이 시작된 것 자체가 문제. 베타 0명에서 기능을 쌓는 동안 측정 인프라(rubric·가이드·분모 정의)가 멈췄다. 이번 주 단 하나만 풀어야 한다면 F-16 사후 추인 + F-7 1-pager.

**Carry-over (CPO owner):**
- F-9 rubric v1.0 frozen: **11일 overdue, 제 책임.** 이번 주말 CSO와 30분 cross-check 후 frozen 커밋 약속. Content 재설계 아님, frozen 태그만.

---

### 2.2 CSO

**아젠다 A (최우선) — rubric frozen + 사후 GO 추인 오늘 닫기**

git 확인으로 모집은 5/21에 이미 시작됐음을 발견(`c0ae21b`). "모집 시작 결정"이 아니라 "이미 시작된 모집의 측정 기준 사후 frozen"이 지금 과제. F-9 rubric frozen이 내 11일 overdue — **이번 주말 frozen 커밋 확정. 변명 없이 닫는다.**

**아젠다 B — mood_level 차별화 톤 축 이동 관찰 필요 ⚠️**

mood_level 자체보다 *표시 표면 언어*가 디스턴싱 계열 방향으로 0.5칸 이상 이동:

| 축 | 이동 전 | 이동 후 | 판단 |
|---|---|---|---|
| 톤 | 분석적·구조적 | "오늘 기분"·"매우 나쁨/좋음" 정서 라벨 | ⚠️ 0.5칸 이동 |
| 자기상 | 운영자·디버거 | "기분을 매일 보고하는 사람" | 디스턴싱 쪽 |
| 메타포 | 디버깅·OS | "기분 추이" = 무드트래커 메타포 | 이동 |

mood_level이 *왜곡 상관관계의 입력값*으로 회로에 연결되면 자산. 단독 차트로 남으면 부채. F-9 rubric frozen 시 이 판정 기준 명시.

**경쟁 모니터링 2주 공백 ⚠️**: 디스턴싱 마지막 스냅샷 5/15. 분기 평가 비수기지만 무한정 방치 불가 — diff 스냅샷 6/6까지.

**Carry-over (CSO owner):**
- F-9: 이번 주말 frozen. 위 아젠다 A와 동일.

---

### 2.3 CTO

**아젠다 A — c8e1981 Migration 20: P0 무영향 확인, 단 보안 track 6건 10일+ overdue**

Migration 20 (`20_checkin_mood_level.sql`) 검토:
- 기존 `checkins` 테이블 컬럼 1개 추가(mood_level INT, CHECK 1~5 or NULL). RLS 표면 변화 없음(11_checkins.sql의 기존 정책 그대로 덮음). **P0 안전 가드 무영향 ✅**
- 멱등 패턴 적용, 롤백 한 줄. 데이터 손실 없음. Migration 20 결정잠금 약한 충돌 기록 양호.

**보안 track 선별 처리 권고**:

| 항목 | 실제 상태 | W23 처리 |
|---|---|---|
| F-21 rls-audit.ts | `scripts/rls-audit.ts` 5/10에 이미 존재. service_role 4곳 식별됨 — 검수만 하면 닫힘 | **이번 주 닫기** |
| F-13 SECURITY INVOKER | `v_push_funnel` SECURITY DEFINER 상태. `ALTER VIEW ... SET (security_invoker=on)` 한 줄. 위험도 낮으나 정책 정렬 필요 | **F-21과 묶어서 닫기** |
| F-12 cron staleness | silent 실패 감지 불가. 가설 B(락인) 핵심 습관 루프 위험 | **이번 주 닫기** |
| F-14 Zod enum 화이트리스트 | metadata = analytics enum, 인젝션 surface 아님 | **공식 동결** |
| F-18·F-19 | 유저 18명 규모에서 9단계 E2E 자동화 over-engineering | **공식 동결** |

**CTO 요청: F-14·F-18·F-19 공식 동결 결의.**

**5/19 액션 ① 미완 확인**: `eada9f2`에 log_view만 wiring됨. log_submit·analyze_complete·action_save 3개 누락 — 이건 신규 작업이 아니라 5/19 부채 청산으로 처리 권고.

---

### 2.4 CMO

**아젠다 A (P0) — IM.1 모집 지연의 분기 코호트 유실 확정**

5월 분기 평가 시즌 마감 완료. "분기 평가 맥락 자발 언급" 코호트 5월분 **영구 유실.** 다음 자연 트리거 8월(13주 후). 이건 비회복 비용이었다.

F-16 GO/NO-GO가 게이트를 통과하지 않고 모집이 launch됐고, 그 사이 **F-22(이메일 카피 3종)는 12일째 미착수**다. 모집 운영의 선정·미통과·follow-up 메일 없이 운영 중인 상황.

**⚠️ 본질 위협 #4 확인 (CMO 권한 내 즉시 조치):**
- mood_level UI 카피 "오늘 기분 5단계"·"매우 나쁨~매우 좋음" = 정서 라벨링 톤
- **CMO 권한 내 즉시 락**: 향후 랜딩 v0·모집 DM·F-22 카피에서 "기분"·"오늘 기분"·"평균 기분" 외부 노출 전면 금지. mood_level은 내부 측정값으로만.
- CSO·CPO에 앱 내 카피 톤 판정 요청.

**Carry-over (CMO owner):**
- F-16 GO 결정 CEO에 계속 push.
- F-22: content-marketer에 5/31 hard 재지정 지시.

---

### 2.5 product-designer

**⚠️ 아젠다 A (최우선) — c8e1981 카피 본질 위협 #4·#1 동시 점화**

앱 내 카피·시각 표현이 분석가 톤과 어긋남:

| 현행 | 위협 | 분석가 대안 |
|---|---|---|
| "오늘 기분 5단계" + 😞😕😐🙂😄 + "매우 나쁨~매우 좋음" | #4 무드트래커 관용구 | "오늘 상태 자기평가 (1~5)" 또는 "컨디션 5단계 기록" |
| "최근 30일 기분 추이" | #1 정서화 | "최근 30일 상태 점수 추이" |
| "평균 기분" StatCard | #1 정서화 | "평균 점수" |
| "아직 점수가 기록된 모닝 체크인이 없어요." | #1 코칭 어미 | "기록된 상태 점수 없음. 내일 모닝부터 누적됩니다." |

구현 비용: 카피만 교체. UI 구조·데이터·토큰 불변. **CPO 승인만 주시면 카피-only PR로 올립니다.**

헤더 `"오늘 나침반은 어디를 향하나요?"` — 항해 메타포 가드 정합, 유지.
recharts 색 하드코딩(primary blue hex) — 토큰 미참조, 기술부채 minor. CTO에 환기.

**아젠다 B — F-6 320px 테스트 13일 overdue, c8e1981이 320px 회귀 추가**

- 모닝 5칸 grid(`grid-cols-5 gap-2`, 칸당 ~50px): "매우 나쁨"(4자) 레이블 줄바꿈 거의 확실
- 통계 3칸 헤더: "최근 7일 일관성" 줄바꿈 위험
- **이번 주 안에 F-6 닫기, 범위는 c8e1981 신규 컴포넌트 포함.** G-1(카피 교체)과 묶어서 처리.

**Carry-over:**
- 카피 톤 sweep 50%에서 정체 → G-5에 흡수.

---

### 2.6 product-owner

**아젠다 A — carry-over 목록이 git 현실과 어긋납니다: 정정 3건**

직접 코드 확인 결과 _actions.md Open 항목 3건이 이미 완료·우회됨:

| Action | _actions.md 상태 | git 현실 |
|---|---|---|
| **F-11** 응모 폼 | Open, 11일 overdue | `fa7b355`·`ba46583`·`b7a7472` — `/apply` 자체 폼 + Migration 17 `evangelist_applications` + `/admin/applications` admin UI 모두 구현됨. **Tally → 자체 폼으로 우회 완료. F-11 close.** |
| **F-23** _actions.md 개별화 | "이미 처리됐을 수 있음" | 5/16 F-1~F-23 재등록됨. close. |
| 액션 ①② (5/19) | 미착수 추정 | `eada9f2`에서 shipped. 단 **AC 없이 코드 먼저** — 이게 문제. |

**아젠다 B — AC 없이 코드부터 나간 순서 역전: 사후 교정**

액션 ①: `log_view` 이벤트는 wiring됐으나 분모 정의·윈도우 경계·손실률 측정 AC 없음. 액션 ②: micro-feedback 카드는 출시됐으나 Falsifiability 가설 미부착. 이건 "deep-dive 액션 → PO AC → 구현" 순서가 역전된 것 — PO 책임.

**아젠다 C — ⚠️ UTM 적재 미구현: 5/21 이후 가입자 attribution 소급 불가 신규 gap**

`recruitment-ops-v0` §3.3: "UTM 5종을 `auth.signUp options.data`로 적재 — 앱 측 구현 필요". 코드 확인 결과 이 구현 0건. 모집 글이 5/21 나갔으므로 **5/21~현재 가입자 채널 attribution이 `raw_user_meta_data`에 없음.** performance-marketer가 5/15 경고했던 "attribution 없는 발화"가 실제로 발생. 소급 불가 — 향후 가입자부터 회수.

**Carry-over (PO owner):**
- **F-20 측정 SOP**: 유일하게 살아있는 PO 부채. 오늘 EOD부터 착수. G-20으로 재지정.
- _actions.md reconcile: 오늘 +30분 내 F-11·F-23 close + ①② shipped 주석.

**CEO·CPO 결정 요청 2건:**
1. UTM 미적재 손실 수용 여부 — "향후 가입자만" 적재 또는 모집 일시 중단 후 UTM 배포 후 재개
2. 순서 역전 재발 방지 게이트 — deep-dive 액션 → PO AC 정의 → 구현 순서 명문화 여부

---

### 2.7 senior-ux-researcher

**⚠️⚠️ 아젠다 A (ESCALATE-1) — IM.1 응모 폼 Falsifiability 붕괴 진행 중**

직접 코드·파일 확인 결과:
1. **F-10 인터뷰 가이드 v1: 파일 자체 부재** (`find` 결과 0건)
2. **IM.1 모집: 5/21 시작됨** (`recruitment-ops-v0 §8` launch log 확인)
3. **응모 폼이 차별화 축 어휘 노출**: "분석" 4회, "패턴" 1회, "디버깅" 1회 (`evangelist-application-form-preview.html` 직접 확인)

**충격**: rubric §0 #1 원문 — _"모집 공고·스크리닝 폼·인터뷰 가이드에서 surface한 어휘는 자발 카운트 X."_ 우리 폼이 PMF B 카테고리 핵심 어휘(분석·패턴·디버깅)를 먼저 노출했다. **5/21 이후 응모자가 인터뷰에서 이 어휘를 사용해도 자발 언급으로 카운트 불능.**

PMF plan §0 자발 언급 ≥30% 게이트의 분모 신뢰도를 직접 훼손. 오염 규모는 응모자 raw count에 달림.

**옵션 제시 (CPO 결정)**:

| 옵션 | 내용 | 비용 | 회복 가능성 |
|---|---|---|---|
| A | 응모 raw count 즉시 확인 (오염 scoping) | 반나절 | 0건이면 문제 없음 |
| B | 인터뷰 가이드 v1 즉시 착수 (오늘) | 1~2일 | 향후 응모자부터는 깨끗 |
| C | 응모 폼 차별화 어휘 중립화 (분석→중립) | product-designer+PO | 신규 응모자부터 자발성 회복 |

**제 commitment**: 옵션 B 오늘 즉시 착수. §0 #1·#6 가드 적용한 10문항 비동기 가이드 draft — verify: rubric surfaced-lexicon 어휘가 질문문에 0건.

**PO·performance-marketer에 즉시 요청**: 5/21~5/29 Tally 응모 제출 raw count + 인터뷰 진입자 수 (오염 범위 판정용).

**Carry-over (UX-researcher owner):**
- F-10: 11일 overdue → **오늘 착수, 6/2 draft** 재지정.

---

### 2.8 data-analyst

**아젠다 A (P0) — F-7·F-17 24일 합산 overdue: 베타 사용자 유입 시 funnel 영구 손실**

F-7(PMF 게이트 1-pager) 13일 + F-17(이벤트 스펙) 11일 overdue. 두 항목은 순서 의존(F-7 분모 확정 → F-17 스펙). 지연의 실제 원인을 솔직히 보고: F-7 분모 정의가 흔들려 F-17 스펙도 착수 못 한 것. 순서를 F-7 → F-17로 고정.

**30일 잔존율 측정 불가 사실 확인**: log_submit·analyze_complete·action_save 미wiring 상태에서 베타 사용자가 들어오면 **소급 불가능한 funnel 데이터 손실 발생**. 이벤트는 발생 시점에 안 찍으면 복원 불가.

분모·분자 초안 surface (1-pager 확정 전):
- 잔존 코호트 분모: 첫 log_submit 발생 주 기준 (설치 기준 아님, survivorship 오류 방지)
- D30 분자: 코호트 진입 후 27~33일 윈도 내 log_view 1회 이상 (재체크인 vs 열람 — CPO에 선택지 surface)
- N<50 구간: 점추정 금지, Wilson/Bayesian 신뢰구간 병기

**mood_level analytics pipeline 포함 여부**: PMF 게이트 3종에는 직접 포함 안 함. 잔존 상관 분석 보조지표로만 활용(오염 주의: NULL 코호트 분리 필수).

**Commitment:**
- F-7 PMF 게이트 1-pager → 6/2(화)
- F-17 이벤트 스펙 → 6/4(목)

---

### 2.9 strategy-manager

**아젠다 A — IM.1 funnel: 모집은 5/21 시작됐고, 지금 critical path는 선발→인터뷰 일정**

git 직접 확인으로 `recruitment-ops-v0 §8`에 5/21 09:30 Brunch 모집 글 공개 기록 발견. "모집 시작 여부 불명"은 정정 필요.

60일 게이트 역산:

| 마일스톤 | 필요 시점 |
|---|---|
| 응모자 30명 선발 확정 | ~6월 1주 |
| 인터뷰 batch 1 시작 | ~6월 1주 |
| 인터뷰 30명 batch 완료 | **7월 초 이전** (방학 전) |
| 자발 언급 코딩 1차 분포 | 7월 중 |

**⚠️ 시계 리스크**: 모집 글이 8일 됐는데 선발 카운트가 all-hands에 안 올라온다 = funnel 정체 가능성. **이번 주 EOD까지 응모자 수 1개 숫자 확보가 6월 critical path 판정 기준.**

**경쟁사 2주 공백**: 디스턴싱 마지막 스냅샷 5/15. 비수기지만 무한정 방치 불가. diff 스냅샷 6/6 갱신(전체 재조사 아님).

**Carry-over:**
- A-3 rubric v0.1: `9c72a7a`에서 closed. 제 파트 완료.
- F-9 rubric v1.0 frozen: CSO+CPO owner, 환기만.

---

### 2.10 risk-manager

**⚠️ ESCALATE — F-5 PIPA §15 P0로 격상 (지연이 아니라 수집 중인데 미고지)**

코드 직접 확인 결과:
- `push_subscriptions`(Migration 14): endpoint·p256dh·auth·user_agent 수집 중
- `notification_events`(Migration 15): user_id + 14종 이벤트 + metadata JSONB 수집 중
- `0a56023`: webpush urgency 'high' — **실발사 중**
- `app/privacy/page.tsx` §1: **위 항목 한 줄도 없음** (최종 수정 2026-04-28, push 도입 이전)

**F-5는 "문서 작업 지연"이 아니라 "이미 수집 중인 항목을 고지 안 한 상태".** PIPA §15(수집·이용 고지) 위반이 진행 중. **13일 overdue, 전량 제 책임.**

**즉시 조치**: 처리방침 §1에 push 구독정보·user_agent·notification_events·mood_level 4항목 추가 PR — F-16과 분리, 단독 머지. **이번 주 30일 내 확정.**

**mood_level 민감정보 해당 여부 (P1, 변호사 검토 표시)**:
- 자동사고 텍스트 전체가 PIPA §23 민감정보(정신건강 관련 정보)인지 여부 — G3 변호사 질문 리스트에 정식 등재. 단정 보류.
- mood_level 단독은 민감정보 경계선상. 처리방침에 "자기평가 기분 척도 기록"으로 명시하면 임시 가드 가능.

**F-15 lint:copy 룰 (11일 overdue)**: F-5 다음 우선순위. push 카피에 "기분·우울·불안" 차단 룰 — 분석가 톤 + 의료광고법 동시 가드.

**결제 의향 측정 주의**: `f2b075d` 서면 리포트가 결제 의향을 묻기 시작하면 미등록 개인사업자 상태에서 전자상거래법 트리거 가능성 사전 알림.

---

### 2.11 senior-fullstack-engineer

**아젠다 A — c8e1981 검토: Migration 20 P0 무영향 확인, 단 vitest 독립 재실행 미확인**

- Migration 20: 기존 RLS 무변화, 멱등 패턴, 롤백 한 줄. **P0 안전 가드 무영향 ✅**
- 3종 회귀 표준: tsc clean, lint:copy 미실행. **vitest 127 통과 주장이 이 환경에서 독립 재실행 불가 — 다음 커밋 전 확인.**
- 결제 가설 A 기여: mood_level line chart는 가설 A("내가 변하고 있다는 증거" 추이 시각화) 직접 강화.

**아젠다 B — 5/19 액션 ① 미완: log_submit·analyze_complete·action_save 3개 누락**

`eada9f2`에서 `log_view`만 wiring됨. log_submit·analyze_complete·action_save 누락. **funnel의 핵심 delta(제출→분석완료 구간) 측정 불가.** 이건 신규 작업 아니라 5/19 부채 청산으로 즉시 처리.

**W23 우선순위 권고 (senior-fullstack 확정 요청)**:
1. 액션 ① 완결 (log_submit+analyze_complete+action_save wiring) — 반나절
2. F-13 (SECURITY INVOKER Migration 21, 한 줄) — F-21과 묶음
3. F-21 (rls-audit.ts 검수 + service_role 4곳 인벤토리) — 검수만 하면 닫힘
4. F-12 (cron staleness healthcheck) — silent 실패 감지 필수
5. F-18 c8e1981 `as any` P2 (history/page.tsx:291 recharts Formatter) — 후속

**defer**: F-14·F-18·F-19 공식 동결 (CTO 결의 후)

---

### 2.12 senior-qa-engineer

**c8e1981 독립 QA 검증 — 조건부 PASS, P2 1건**

| 점검 항목 | 결과 |
|---|---|
| Migration 20 idempotency | PASS (`IF NOT EXISTS` 패턴) |
| Migration 20 RLS 정합 | PASS (컬럼 추가만, RLS 표면 불변) |
| mood_level NOT NULL 위치 | PASS (app-side route.ts:25, DB는 NULL 허용, 기존 row 보존) |
| 컬럼 드리프트 | PASS (코드 5개 사용처 ↔ schema 1:1) |
| history 차트 NULL 가드 | PASS (history/page.tsx:111 필터 존재) |
| PII 로깅 | PASS (console.* 0건) |
| tsc | 신규 에러 0건 (기존 환경 에러만) |

**⚠️ P2 발견**: `history/page.tsx:291` `as any` — c8e1981에서 신규 도입. recharts Formatter 타입 우회. 머지 차단 사유 아님이나 "as any 신규 도입 0건" 표준 위반. senior-fullstack 후속 수정.

**미검증 (환경 제약)**: vitest 177 tests · rls-audit 라이브 실행 · prod 적재 E2E — `node_modules` 미설치 환경. 이 3건은 W23 환경 복구 후 재실행.

**carry-over (QA owner):**
- F-19 E2E 9단계 보고서: 10일 overdue → **CTO 동결 결의 시 deferred**
- F-18 9단계 × 18 event 매핑표: 동일
- iOS E2E push: 5일 overdue → Phase 3 완료 후 연기

**CTO 결정 요청**: (1) 환경 자격증명 문제 해결, (2) F-19·F-18 동결 결의.

---

### 2.13 content-marketer

**아젠다 A (P0) — F-22 이메일 카피 3종 12일 overdue, 미착수 사실 고백**

`docs/im1/email-templates-v1.md` 파일 부재 직접 확인. F-1 lexicon(`9c72a7a`)은 closed이므로 blocker 없음. 지연은 우선순위 배치 실패 — 제 책임.

모집이 이미 5/21 시작됐으므로 선정·미통과·follow-up 메일 없이 운영 중인 상태가 될 수 있음. **F-22 → 5/31 EOD hard 재지정.** CMO 승인 요청.

**브랜드 voice 점검 (c8e1981)**:

| 항목 | 판정 |
|---|---|
| "오늘 기분 5단계" + 이모지 | ⚠️ 정서 라벨링 톤. "오늘 상태 자기평가 (1~5)"로 교체 권고 |
| history "최근 30일 기분 추이" / "평균 기분" | ⚠️ 동일 — "추이"는 OK, "기분" 어휘가 정서화 |
| "오늘 나침반은 어디를 향하나요?" | ✅ 항해 메타포, 유지 |
| "최근 30일 기분 추이" + "1=매우 나쁨 · 3=보통" 주석 | ✅ 분석가 톤 OK |

위 ⚠️ 2건은 **product-designer에 이관 (외부 표현 아님)**. 외부 채널에서 "기분" 어휘 노출 전면 금지 즉시 적용.

**Carry-over:**
- F-1 lexicon: ✅ closed. 더 이상 blocker 아님.
- F-22 draft: 5/31 hard.

---

### 2.14 performance-marketer

**아젠다 A — F-16 attribution 2갈래 나쁨 + funnel event 4종 중 1개만 살아있음**

F-16이 11일 overdue이고 그 사이 모집이 launch됐다. attribution 관점에서 두 가지 모두 나쁜 상황:
- (a) 모집 미시작이면: attribution 인프라 idle 11일
- (b) 모집 시작됐다면: UTM 미정의 + funnel event 3개 누락 상태로 발화 = 소급 attribution 불가

**funnel event wiring 상태 직접 확인**:

| Event | 설계(F-3) | 실제 wiring |
|---|---|---|
| log_view | O | O (`app/api/analytics/log-view/route.ts`) |
| log_submit | O | **미wiring** |
| analyze_complete | O | **미wiring** |
| action_save | O | **미wiring** |

→ funnel 입구(log_view) 1개만. 전환율 계산 불가.

**즉시 요청**: F-16 결정(시작/미시작) 명시 confirm. 미시작이면 invite 발화 전 G-6(액션① wiring) 완결 창 아직 열림.

**Stage 0 가드 위반 없음.** 유료 광고·CAC 측정 발화 0건.

새 funnel(체크인→mood→결제의향) attribution은 **Stage 1로 보류** 권고 — 결제 화면 부재 + mvp-overview §4.2 이론 근거 검토 선행 필요.

---

## 3. 충돌 토론

### §3.1 주요 충돌 표

| 위치 A | 위치 B | 트레이드오프 | CEO 결정 필요? |
|---|---|---|---|
| **CPO+CMO+Designer**: mood_level "평균 기분"·"7일 일관성" 표시 표면 제거 or 인터뷰 트리거 게이트 (본질 위협 #4) | **CTO**: 결정잠금 약한 갱신으로 처리, P0 무영향 확인, 유지 가능 | 카테고리 선명도(분석가 vs 무드트래커) vs 가설 A 측정 자산(Δpain 추이 시각화) | ⚠️ Yes — 표시 표면 유지/제거 결정. **단, 카피-only 교체는 product-designer 권한 내 즉시 가능** |
| **senior-ux-researcher**: IM.1 응모 폼 차별화 어휘 노출 = 자발 언급 오염 (Falsifiability #1 위반 진행 중) | **strategy-manager+CPO**: 모집 시작됐으니 contamination scoping 후 진행 | 측정 신뢰도(자발 언급 순도) vs 모집 모멘텀(이미 시작된 IM.1) | ⚠️ Yes — 기존 응모자 처리 방침 (태깅·제외 여부) |
| **risk-manager**: F-5 PIPA P0 이번 주 30일 머지 | **CTO**: push가 발사 중이므로 동시에 처리 필요, F-21 묶음 가능 | 법규 노출 최소화 vs 구현 패키지 정렬 | 합의 가능: F-5 단독 즉시 머지 (F-16·F-21과 분리) |
| **senior-fullstack**: W23 우선순위 — 액션 ① + F-13+F-21+F-12 이번 주 4건 | **CTO**: 동일 3건(F-13·F-21·F-12) + F-14·F-18·F-19 공식 동결 | W23 sprint WIP vs 보안 track 정리 | 합의 가능: G-6(액션①) + G-7·G-8·G-9(보안3) W23, F-14·F-18·F-19 deferred |
| **data-analyst**: F-7 1-pager 먼저(6/2) → F-17 스펙(6/4) → senior-fullstack 구현(G-6) | **performance-marketer**: funnel event 3개 누락이 CAC/attribution 측정 불능 | 측정 설계 선행 vs 구현 속도 | 합의 가능: F-7 → F-17 → G-6 순서 고정 |

### §3.2 충돌 아닌 것 (정합 확인)

- **c8e1981 Migration 20 P0 무영향**: CTO·senior-fullstack·senior-qa 모두 확인.
- **F-5 즉시 머지**: risk-manager·CTO·CPO 동의. 이번 주 30일 확정.
- **5/19 액션 ② micro-feedback 카드**: 완료됨(`eada9f2`), 전 페르소나 지지.
- **Stage 0 비허용 재확인**: CMO·content-marketer·performance-marketer 동일.
- **F-14·F-18·F-19 동결**: CTO·senior-fullstack·senior-qa 동의.

### §3.3 본질 위협 분기 판정

| 신호 | 분류 | 분기 |
|---|---|---|
| mood_level 표시 표면 #4 | 카피 차원 + CEO 명시 결정(B-1) 존재 | **(a) 합의 가능** — 카피 변경 + 인터뷰 트리거 게이트 |
| 응모 폼 어휘 오염 (Falsifiability #1) | 측정 설계 결함, 응모자 수에 따라 회복 가능 | **(a) 합의 가능** — scoping + 가이드 즉시 착수로 봉합 |
| F-5 PIPA §15 위반 (법규) | risk-manager P0, 즉시 fix 가능 | **(a) 합의 가능** — 이번 주 PR 머지 즉시 해소 |

> 분기 (b) 즉시 stop 조건(차별화 3축 무너짐·즉시 해소 불가 법규 위반·P0 안전 가드 fail) 미해당. **루틴 정상 진행.**

### §3.5 Owner 재할당 surface

| 영역 | 항목 | 현황 | 결정 |
|---|---|---|---|
| IM.1 contamination scoping | 응모자 raw count 확인 | 미실행 | CEO+PO → G-12 즉시 |
| F-8 VAPID Phase 3 | CEO 직접 실행, F-5 머지 후 가능 | carry-over | F-5 머지 후 CEO (G-2 dependency) |
| F-15 push 카피 lint 룰 | risk-manager, F-5 다음 | 11일 overdue | F-5 완료 후 W23 말 |
| F-20 측정 SOP | PO+fullstack, G-6 이후 착수 | 10일 overdue | G-6 완결 후 착수 |
| 폼 어휘 중립화 | product-designer+PO | 신규 | G-19 — 신규 응모자 오염 방지 |

---

## 4. 합의

### §4.1 합의 사항

1. **F-5 처리방침 PR 이번 주 30일 머지** — risk-manager 단독, push subscriptions·notification_events·mood_level 4항목 추가. F-16과 분리.
2. **F-9 rubric v1.0 frozen 5/31** — CSO+CPO, mood_level→왜곡 상관관계 입력값 판정 기준 포함.
3. **F-22 이메일 카피 5/31** — content-marketer, F-1 lexicon 기반, risk-manager 사전검토 포함.
4. **mood_level 앱 내 카피 교체** — product-designer 권한, CPO 승인 후 카피-only PR. "기분" → "상태/컨디션" 계열. 단 표시 표면(평균 기분·7일 일관성) 유지/제거는 CEO 결정 대기.
5. **W23 구현 패키지** — senior-fullstack: G-6(액션① 완결)+G-7(F-13 INVOKER)+G-8(F-21 rls-audit 검수)+G-9(F-12 cron staleness). G-6은 F-17 스펙 수신 후 착수.
6. **F-7 → F-17 → G-6 순서 고정** — data-analyst: F-7 6/2, F-17 6/4 → senior-fullstack G-6 착수.
7. **F-10 인터뷰 가이드 오늘 착수** — senior-ux-researcher: §0 #1·#6 가드 적용, 6/2 draft. 응모 폼 어휘 노출과 무관하게 지금 완성이 필요.
8. **IM.1 contamination scoping 오늘** — CEO+PO: 5/21~5/29 응모 raw count + 인터뷰 진입자 수. 0건이면 오염 없음, N건이면 pre-guide 태깅.
9. **F-14·F-18·F-19 공식 동결** — CTO: PMF 게이트 통과까지 deferred. overdue 카운터 정지.
10. **경쟁사 diff 스냅샷 6/6** — strategy-manager: 5/15 대비 변경분만, 전체 재조사 아님.

### §4.2 CEO 결정 필요 항목 ⚠️

| 항목 | 쟁점 | 선택지 | 비고 |
|---|---|---|---|
| ⚠️ **mood_level 표시 표면** | "평균 기분"·"7일 일관성" 유지 vs 제거 | A) 카피 교체만(product-designer 즉시 가능) · B) 표시 표면 제거·재설계 · C) 인터뷰 트리거 게이트 후 결정 | CTO·CPO·CSO 공동 검토 요청 |
| ⚠️ **IM.1 응모자 오염 처리** | 이미 들어온 응모자 데이터 처리 | A) pre-guide 코호트 별도 태깅 후 자발 카운트에서 제외 · B) 폼 어휘 교체 후 응모자 재응모 유도 · C) 오염 인정 후 코호트 전체 1차 탐색적으로만 활용 | scoping(G-12) 결과가 판단 기준 |
| ⚠️ **F-16 공식 GO/NO-GO 기록** | 모집이 사실상 시작됐으나 게이트 결의 없음 | 사후 추인 형태로 GO 기록 + 다음 batch 일정 확정 | 이번 주말(5/31)까지 기록 필요 |

---

## 5. Action Items (W23, 다음 주)

| ID | Action | Owner | Due | Verify |
|---|---|---|---|---|
| G-1 | mood_level 앱 내 카피 교체 PR: "오늘 기분 5단계"→"오늘 상태 자기평가 (1~5)", 이모지 라벨 중립 척도어, "평균 기분"→"평균 점수" | product-designer | **2026-06-05** | CPO 승인 + lint:copy 0 + F-6 320px 범위에 포함 |
| G-2 | F-5 처리방침 push subscriptions·notification_events·mood_level 4항목 추가 PR 즉시 머지 | risk-manager | **2026-05-30** | app/privacy §1 4항목 존재 + risk-manager sign-off |
| G-3 | F-9 rubric v1.0 CSO 3축 매핑 + frozen 커밋 | CSO+CPO | **2026-05-31** | "frozen" 표기 파일 + CSO/CPO sign-off |
| G-4 | F-22 이메일 카피 3종 draft (선정·미통과·follow-up) | content-marketer | **2026-05-31** | docs/im1/email-templates-v1.md 존재 + risk-manager 표시광고법 사전검토 |
| G-5 | F-6 iPhone SE 320px 실기 테스트 (c8e1981 신규 컴포넌트 포함: 5칸 grid·통계 3칸·7일 칩) | product-designer | **2026-06-05** | docs/test-reports/iphone-se-320px-2026-W23.md + 5칸 grid 라벨 overflow 여부 명시 |
| G-6 | 5/19 액션 ① 완결: log_submit·analyze_complete·action_save wiring (F-17 스펙 수신 후) | senior-fullstack | **2026-06-04** | 4종 funnel event analytics_events 도착 검증 + vitest 통과 |
| G-7 | F-13 v_push_funnel SECURITY INVOKER (Migration 21, 한 줄 수정) | senior-fullstack | **2026-06-02** | view GRANT 불변 + 롤백 한 줄 확인 |
| G-8 | F-21 rls-audit.ts 현재 스키마 실행 + service_role 4곳 인벤토리 문서화 | senior-fullstack | **2026-06-02** | rls-audit 통과 + 인벤토리 1페이지 |
| G-9 | F-12 cron healthcheck (last_cron_invoked_at + 24h staleness 알림) | senior-fullstack | **2026-06-02** | 강제 stale 주입 → 알림 발동 confirm |
| G-10 | F-7 PMF 게이트 분모·분자 1-pager (잔존 코호트 정의·D30 윈도·소표본 가드 포함) | data-analyst | **2026-06-02** | 잔존 게이트 SQL 산식 dry-run 1건 + CPO/PO 회람 |
| G-11 | F-17 C-3 이벤트 스펙 delta-only → senior-fullstack 전달 | data-analyst | **2026-06-04** | 4종 페이로드 스키마 + PII 필드 0건 grep |
| G-12 | IM.1 응모 raw count + 인터뷰 진입자 수 확인 (오염 범위 scoping) | CEO+PO | **2026-05-29 EOD** | 응모자 N명·진입 M명·오염 판정 결과 |
| G-13 | F-16 공식 GO/NO-GO 사후 추인 기록 + IM.1 다음 batch 일정 확정 | CEO | **2026-05-31** | _actions.md F-16 closed + batch 날짜 명시 |
| G-14 | F-10 인터뷰 가이드 v1 MVP (10문항, §0 #1·#6 가드 적용, 비동기 응답 풍부도 포함) | senior-ux-researcher | **2026-06-02** | docs/im1/interview-guide-v1.md + rubric surfaced-lexicon 어휘 질문 내 0건 |
| G-15 | UTM 적재 기능 구현 — `auth.signUp options.data`에 utm_campaign·utm_source·utm_medium·utm_content·utm_term 적재 (5/21~현재 소급 불가, 신규 가입자부터 회수) | performance-marketer+senior-fullstack | **2026-06-04** | `auth.signUp` 호출부 grep → options.data.utm_* 5종 존재 + vitest 통과 |
| G-16 | F-14·F-18·F-19 공식 동결 (development-backlog.md deferred 명시) | CTO | **2026-05-30** | backlog.md deferred 표시 + overdue 카운터 정지 |
| G-17 | 경쟁사 diff 스냅샷 갱신 (5/15 대비 변경분만: 디스턴싱 톤·가격·코치 정책 + 챗봇 한국어 진입) | strategy-manager | **2026-06-06** | docs/im1/competitor-snapshot-diff-v1-2026-06-06.md |
| G-18 | c8e1981 P2 as any 수정 (history/page.tsx:291 recharts Formatter 타입 캐스팅) | senior-fullstack | **2026-06-04** | tsc --noEmit 신규 에러 0건 (G-6 번들에 포함) |
| G-19 | IM.1 응모 폼 어휘 중립화 (분석·패턴·디버깅 → 중립 표현, 신규 응모자 자발성 회복) | product-designer+PO | **2026-06-02** | 폼에서 rubric §0 #1 surfaced-lexicon 어휘 grep 0건 |
| G-20 | F-20 측정 SOP `docs/im1/measurement-sop.md` (4개 산출 SQL + UTM gap 경고 명시 + 운영 주체·주기 정의) | PO | **2026-06-04** | measurement-sop.md 존재 + G-11 이벤트 스펙 수신 후 완성 |

---

## 6. Carry-over 정리 (F-actions → G-actions 매핑)

| F-ID | 원래 Due | G-ID | 재 Due | 상태 |
|---|---|---|---|---|
| F-5 | 5/16 (+13d) | G-2 | 5/30 | risk-manager P0 |
| F-6 | 5/16 (+13d) | G-5 | 6/5 | scope 확장(c8e1981 포함) |
| F-7 | 5/16 (+13d) | G-10 | 6/2 | data-analyst 착수 선언 |
| F-8 | 5/17 (+12d) | carry-over | F-5(G-2) 머지 후 | CEO 실행 대기 |
| F-9 | 5/18 (+11d) | G-3 | 5/31 | CSO 확정 약속 |
| F-10 | 5/18 (+11d) | G-14 | 6/2 | 오늘 착수 |
| F-11 | 5/18 (+11d) | **closed** | — | 자체 폼 구현 확인 (Migration 17 + `/apply` + `/admin/applications`) |
| F-12 | 5/18 (+11d) | G-9 | 6/2 | senior-fullstack W23 |
| F-13 | 5/19 (+10d) | G-7 | 6/2 | F-21과 묶음 |
| F-14 | 5/19 (+10d) | G-16 | 5/30 (deferred) | 공식 동결 |
| F-15 | 5/18 (+11d) | carry-over | G-2 이후 | risk-manager |
| F-16 | 5/18 (+11d) | G-13 | 5/31 | 사후 추인 GO |
| F-17 | 5/18 (+11d) | G-11 | 6/4 | F-7 후 착수 |
| F-18 | 5/19 (+10d) | G-16 | deferred | 공식 동결 |
| F-19 | 5/19 (+10d) | G-16 | deferred | 공식 동결 |
| F-20 | 5/19 (+10d) | G-20 | 6/4 | G-11 이벤트 스펙 수신 후 완성 |
| F-21 | 5/19 (+10d) | G-8 | 6/2 | rls-audit 검수만 |
| F-22 | 5/17 (+12d) | G-4 | 5/31 | 미착수 → hard 재지정 |
| carry-over VAPID | 5/17 (+12d) | carry-over | F-5 후 | CEO 실행 대기 |
