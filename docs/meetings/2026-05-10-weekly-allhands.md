# BlueBird 주간 All-Hands — 2026-05-10

**일시**: 2026-05-10 18:00 KST  
**주차**: 2026-W19 (5월 2주차) · 회의록 #1 (자동화 첫 실행)  
**참여자**: 14 페르소나 (parallel dispatch, Sonnet 4.6 × 14)  
**기록**: senior-qa-engineer (회의록 정합성 독립 검증)  
**목적**: 주 마감 deep 합의 — 향후 1~2주 절박 아젠다·미완 actions·전략 시그널  

---

## 0. 현황 (개회 시점 기준)

### 0.1 7일 git 통계 (2026-05-04 ~ 2026-05-10)

| 영역 | 주요 commit | 영향 |
|---|---|---|
| Push 인프라 | `f1e4bd5` feat(push): IM.1 측정 instrumentation — Migration 15 (notification_events) + 14 event types | notification_events 테이블·RLS·v_push_funnel view·14 event types·cron reminder 가동 |
| Push 버그 수정 | `856728b` fix(push): /me 토글 OFF 미반영 — subscribed 상태 분리 추적 | PushToggle·usePushPermission 분리 |
| 핸드오프 | `7123696` docs(push): 자율 실행 핸드오프 — 사용자 직접 수행 5단계 + 결정잠금 | 사용자 수동 운영 필요 사항 명시 |
| 전략 문서 | `43e707b` docs(strategy): CMO Stage 가이드 v1 — Stage 0/1/2 허용·비허용 | 외부 마케팅 가드레일 명문화 |
| 신규 페르소나 | `28ef8f4` feat(agents): CMO 조직 신설 (cmo·content-marketer·performance-marketer·data-analyst) | 4 페르소나 합류 |
| Routine 설계 | `d7ab181`·`16b3111`·`c878fe2` docs(routines): 자동 미팅 routine 설계·프롬프트·dry-run 수정 | 본 회의 포함 automated routine 가동 |

**총 6 커밋, 2개 영역 (푸시 인프라·조직 확장). AI 분석 파이프라인 변경 0건.**

### 0.2 PMF 게이트 진척

| 게이트 | 임계 | 현재 상태 |
|---|---|---|
| 자발 가치 언급 ≥30% | N/A (인터뷰 대기) | IM.1 모집 0명 — 베타 사용자 0 |
| 30일 잔존율 ≥15% | N/A | 베타 사용자 0 |
| 결제 의향 ≥20% | N/A | 베타 사용자 0 |
| CMO Stage | Stage 0 | IM.1 모집 직전 (deadline 5/9 경과) |

### 0.3 _actions.md 현황

2026-05-03 all-hands에서 11개 action 산출. `_actions.md` 자동화 이전이라 미seed 상태 — 본 회의에서 최초 seed.

**2026-05-03 actions 실제 진척** (PO 발언으로 확인된 산출물 포함):

| # | Action | Owner | Due | 실제 산출물 | 상태 |
|---|---|---|---|---|---|
| 1 | iPhone SE 320px 실기 테스트 | designer | 5/4 | 미존재 | ⚠️ **6일 overdue** |
| 2 | E2E 9단계 시나리오 | senior-qa | 5/5 | 시나리오 정의(846줄) ✓, 실행 보고서 ✗ | ⚠️ **5일 overdue (부분)** |
| 3 | 측정 인프라 SOP | PO + senior-fullstack | 5/5 | measurement-tool-research 산출 ✓, SOP 문서 ✗ | ⚠️ **5일 overdue (부분)** |
| 4 | 약관·처리방침 1차 점검 | risk-manager | 5/4 | legal-review-2026-05-04.md ✓, push·notification_events 항목 미추가 ✗ | ⚠️ **6일 overdue (부분)** |
| 5 | 자발 언급 코딩 rubric 1page | strategy-mgr + CSO + CPO | 5/4 | coding-rubric-v1-2026-05-04.md ✓ (C10·C11 포함 29 카테고리) | ✅ **실질 완료 (재확인 필요)** |
| 6 | 모집 채널·스크리닝 5문항 | CPO + PO | 5/5 | recruitment-package-2026-05-03.md ✓ (6채널·5문항·인센티브 전부) | ✅ **실질 완료 (게시 GO만 남음)** |
| 7 | 카피 톤 가드 sweep | designer | 5/5~5/8 | lint-copy 0위반 ✓, 수동 tonе audit 4섹션 미완 ✗ | ⚠️ **50% 완료** |
| 8 | hot path 모니터링 | senior-fullstack | 모집 시작일 | 후보 5개 정리 완료, spec 문서 미작성 | 대기 (모집 시작 D-7 트리거) |
| 9 | 디스턴싱·하루콩 스냅샷 | strategy-manager | 모집 시작일 | 0건 | 대기 → **재설계 필요** |
| 10 | CEO GO/NO-GO 승인 | CEO | 5/5 EOD | 미결정 | ⚠️ **5일 overdue** |
| 11 | IM.1 모집 시작 | CPO | 5/9 DEADLINE | 게시 0건 | ⚠️ **DEADLINE PASSED** |

### 0.4 신규 합류 (이번 주)

CMO 조직 (cmo · content-marketer · performance-marketer) + data-analyst — 오늘 첫 all-hands 참여.

---

## 1. CEO 개회

> agenda 없음 — routine standing summary로 진행 (첫 자동화 실행, standup minutes 0건)  
>
> "2026-05-03 all-hands에서 IM.1 모집 시작 deadline을 5/9로 잡았으나 경과됐다. 오늘 all-hands의 목적은 (1) 왜 경과됐는지, (2) 지금 어디에 있는지, (3) 이번 주 어떻게 unblock할지 합의하는 것이다. CMO 조직 4명이 신규 합류했고, 이번 주 push 인프라가 들어왔다. 각자 절박한 것을 말해라."

---

## 2. 발언 라운드

### 2.1 CPO

**아젠다 A (P0) — Action 11 deadline 경과: dependency 기반 재설정**

Action 11 (IM.1 모집 시작, 5/9 DEADLINE)이 경과됐다. 원인은 prerequisite 4개가 미clear 상태였기 때문이다. "5/9"처럼 날짜에 박는 deadline은 다시 missed될 가능성이 높다.

**제안**: deadline을 *날짜*에서 *dependency*로 전환. "Action 5(rubric)·6(채널+스크리닝)·4(약관 보완)·E2E 보고서 ALL clear + CEO sign-off 익일 모집 시작." 이렇게 해야 prerequisite이 실제로 완료될 때 GO가 자동 발사된다.

PO가 발견한 `docs/im1/` 산출물(coding-rubric·legal-review·recruitment-package)을 보면 Action 5·6은 실질 완료에 가깝다. 아직 남은 것은 (a) E2E 실행 보고서, (b) 약관 push 항목 추가, (c) CEO sign-off다. 이 셋이 5/13 EOD까지 clear되면 5/14(목) 모집 시작 가능하다.

**CPO owner actions 진척**:
- Action 5: coding-rubric-v1 확인 (실질 완료) — CSO 차별화 3축 매핑 보완 필요
- Action 6: recruitment-package 확인 (실질 완료) — 스크리닝 문항 v1.0 CPO 코멘트 추가 필요
- Action 11: dependency 재정의 후 재활성화

**반론 인지**: "rubric 없이 모집 먼저" 옵션은 PMF plan §9 motivated reasoning 회피 원칙 위반. 코딩 기준 사후 작성 = 데이터 보고 임계를 조정할 자유 = 신뢰도 0. 양보 불가.

---

### 2.2 CSO

**아젠다 A (P0) — 경쟁 모니터링 6주+ 공백: 분기 평가 시즌에 디스턴싱 sensor-blind**

디스턴싱·하루콩 스냅샷 Action 9가 "모집 시작일" 트리거에 묶여 6주 이상 미가동. 5월은 분기 평가 시즌 — 한국 인지노동자의 자기-디버깅 수요 피크. 디스턴싱이 이 시즌에 분석가 톤으로 카피 실험했는지 우리는 모른다. **모른다는 것이 위협이다.** IM.1 인터뷰 해석에 컨파운더 들어온다.

Action 9 트리거를 모집과 분리해 독립 routine으로 격상 요청. strategy-manager가 5/15(금) 첫 스냅샷.

**아젠다 B (P0) — CMO 합류와 외부 표현 차별화 정합 사전 검토 트리거 미명문화**

CMO 조직 외부 표현이 "디스턴싱 앱 설명에 붙여도 어색하지 않은가"를 판단하는 프로세스가 없다. IM.1 모집 카피·랜딩 v0가 CMO 손을 떠나기 전, content-marketer가 분석가 어휘 사전 v0와 함께 CSO 1회 검토 트리거. 이 트리거를 `cmo-stage-guide-v1.md`에 박아야 한다.

**반론 인지**: "경쟁사보다 우리 검증이 먼저"라는 입장도 맞다. 단, 센서가 죽어있으면 검증 결과가 오염된다. 비용은 strategy-manager 1명 주 1회 cadence.

---

### 2.3 CTO

**아젠다 A (P0) — Migration 15 service_role 운영 경로 인벤토리 누락 (안전 가드 결손)**

push_sent·push_failed·push_gone은 server-side에서 service_role로 RLS 우회해 INSERT하도록 설계되어 있다. 이 경로가 어디에서(webhook? cron? 핸드오프 5단계?) 어떤 키로 호출되는지 인벤토리가 없다. service_role 키가 클라이언트 번들에 새면 `notification_events` KPI 위조 + 전 테이블 RLS 노출. 이번 주 안에 인벤토리 1줄 + rls-audit.ts 확장 + VAPID runbook에 service_role 회전 추가.

**아젠다 B — E2E 9단계 + 이벤트 매핑표 없이 KPI 산출 무의미**

시나리오 정의는 있으나 실행 보고서가 없다. 14개 event_type이 9단계 어느 지점에서 발화하는지 매핑표도 없다. 숫자는 나와도 의미를 모르는 상태. 5/12까지 senior-qa 실행 보고서 + event 매핑표 강제 마감.

**반론**: 푸시는 결제 가설 B(이걸 멈추면 후퇴한다)다. A(측정 가능한 인지 변화)와 혼동하면 KPI 설계가 흔들린다. data-analyst에게 IM.1 KPI dashboard에 Δpain·autonomy 코호트 비교(푸시 ON vs OFF) 포함 요청.

---

### 2.4 CMO

**합류 인사 + Stage 0 명시**

Stage 0 현재 위치. CMO 1차 미션: IM.1 모집 지원 + 분석가 톤 어휘 사전 v0. **비목표**: 외부 광고·블로그 발행·SEO 캠페인·인플루언서 — G3 통과 후.

**즉시 착수 (Stage 0 허용 범위)**:
- IM.1 모집 DM 카피 분석가 톤 review (content-marketer)
- SMTP stagger 가이드 (performance-marketer)
- UTM 스키마·이벤트 정의 v0 (performance-marketer + data-analyst)
- 분석가 톤 어휘 사전 v0 (content-marketer)

⚠️ **Stage 0 비허용 surface**: "IM.1 모집 잘 안되니 네이버 광고 돌려보자" → 즉시 거부. "블로그 발행해서 SEO 시드 만들자" → 거부. CMO 합류가 G3 전 외부 launch 시작을 의미하지 않는다.

CPO에게: 모집 자산(DM·랜딩·SMTP) 어디까지 준비됐는지 공유 요청 (PO 발언에서 확인됨 → recruitment-package 내 ready 상태).

---

### 2.5 product-designer

**Action 1 — iPhone SE 320px 실기 테스트: 6일 overdue, G1 prerequisite**

실행 보고서 미존재. Push 인프라 컴포넌트 검수에 끌려간 우선순위 실수를 인정. 코드 기준 위험 가설(PageHeader 320px 헤더 잘림, prospect-value-chart 라벨 겹침)은 있으나 실기 미검증. **5/11(월) 오전 전일 할당해 5플로우 + push UI 컴포넌트 톤 동시 검증.**

**Action 7 — 카피 톤 sweep: 50% 완료**

lint-copy 0건 PASS. 수동 톤 audit(our-philosophy·me·journal·review) 미완료 — 5/15 due로 완결 예정. SafetyNotice.tsx:25 "먼저 쉬어가는 것도 방법" → 회색 지대, 법무 컨펌 후 결정 보류.

**⚠️ 본질 위협 #4 경사면 경고**: push cron 가동으로 정기 자기 라벨링 체크인 방향 경사면이 가팔라졌다. "사용자 명시 트리거 또는 crisis detection-based만" 규칙을 push 운영 가이드에 명문화 CPO·CMO에 요청.

---

### 2.6 product-owner

**아젠다 #1 (P0) — 모집 게시 자체가 미게시: all-hands에서 GO/NO-GO 결정 요청**

카피는 이미 ready(recruitment-package §2 5종). 게시 GO/NO-GO 결정이 막혀 있다. 부록 D 체크리스트 상태를 5/10 EOD까지 각자 보고 → 5/11 CEO 결정. 시간 지연은 cascade로 G2·G3 게이트를 뒤로 밀어낸다.

**아젠다 #2 — 측정 SOP 미가동**

Migration 15로 데이터는 들어오는데 "데이터 → 주간 KPI 표 → 트리거 임계 점검" 회로가 없다. 5/13 EOD까지 `docs/im1/measurement-sop.md` 신설.

**Action 3·6 진척**:
- Action 6: recruitment-package 확인 → 실질 완료. 응모 폼(Tally/GF) 구축만 남음. 5/11 EOD.
- Action 3: measurement-tool-research ✓, SOP ✗. 5/13 EOD.

---

### 2.7 senior-ux-researcher

**아젠다 A (P0) — 인터뷰 가이드 v1 별도 문서 미존재**

coding-rubric §0 #1이 "인터뷰 가이드 surface 어휘"를 유도 어휘 블랙리스트에 박아두었는데, *그 인터뷰 가이드 자체*가 `find docs -iname "*interview*guide*"` → 0건. 블랙리스트의 referent가 비어있는 상태. 비동기 인터뷰 모드(d)라 폼 Q4~Q7이 1차 인터뷰 역할을 하는데, 폼이 유도 어휘 가드를 통과했는지 senior-ux-researcher 검증 없음.

5/11 EOD: 모집 폼 Q4~Q7 어휘 audit.  
5/13 EOD: 인터뷰 가이드 v1 문서 (`docs/im1/interview-guide-v1.md`).

**아젠다 B — 1차 타겟 3축 코딩 신뢰도 vs 표본 한계**

N=30에서 60% (=18명) 3축 ALL 정합의 95% Wilson CI = [40.6%, 76.8%]. 점추정 단독 surface 금지. CI lower bound ≥50%를 게이트로 surface 권고. CPO 결정 요청.

첫 5명 batch 후 A1·A2·A3 각 0.5점 부여 빈도 ≥30% 시 분류 기준 재정의 트리거.

**carry-over 완료**: C10(학습 자원 자발 언급)·C11(이탈 의도) 카테고리 추가 — coding-rubric-v1-2026-05-04.md에 완료.

---

### 2.8 data-analyst

**아젠다 A (P0) — PMF 게이트 3종 분모·분자 조작적 정의 미합의**

"30일 잔존율 15%"의 분모(install 전체? 첫 체크인 완료자? 3축 충족자만?)·분자(30일째 1회 활성? 누적 7일?) 미합의. 합의 전 잔존율 수치 발표 금지. 5/13 EOD까지 3가지 옵션 1-pager → CPO·PO 결정.

**아젠다 B — notification_events 14종: push 충분, PMF 게이트 불충분**

7개 갭 확인:
1. install/first_open 이벤트 부재 → 30일 잔존 분모 불가
2. first_checkin_completed 부재 → funnel 1단계 불가
3. act_entered(act_number, log_id) 부재 → H-O5 불가
4. act_completed 부재 → Act drop-off 불가
5. insight_view/visualize_view(depth) 부재 → 분석가 페이지 vs 잔존 상관 불가
6. success_log_created 부재 → 무가입 funnel 불가
7. target_axis_qualifier(3축 boolean) 부재 → 코호트 분리 불가

5/13 EOD까지 7개 이벤트 스펙 → senior-fullstack 전달.

**Falsifiability 가드**: 모든 weekly 리포트에 Wilson CI 의무 표기. Survivorship bias — `denominator_population` 메타 필드 의무화.

---

### 2.9 strategy-manager

**아젠다 A (P0) — 5월 분기 평가 시즌 자발 언급 윈도우 이번 주가 마지막**

5월 1~3주차 분기 평가 피크 — 다음 자연 트리거는 8월 반기 평가. rubric 없이 이 시즌에 들어오는 응답을 코딩하면 *사후 rubric 작성 = 결과 보고 임계 조정 자유 = 신뢰도 0*. 5/15(금)까지 rubric v0.1 30% 초안 surface, CSO·CPO 비동기 코멘트 → v1.0 frozen.

**아젠다 B (P0) — 디스턴싱·하루콩 스냅샷 6주+ 공백: sensor-blind**

Action 9 트리거 재설계 요청: 모집 의존성 제거 → 5/15(금) 첫 스냅샷, 이후 매주 금요일 독립 routine. CSO 승인 요청.

**IM.1 인터뷰 시점 트레이드오프**:

| 옵션 | 단기 | 중장기 |
|---|---|---|
| A. rubric 없이 평가 시즌 인터뷰 진행 | 시즌 트리거 활용 | G3 자발 언급 측정 신뢰도 ↓ |
| B. rubric 5/15 확정 후 인터뷰 | 시즌 피크 일부 손실 | 6축 정량 매핑 가능 |

**권고: B**. 측정 도구가 흔들리면 90일 게이트 의미 없어짐.

**Action 5 진척**: coding-rubric-v1 존재 — CSO 3축 매핑 v0 추가 필요. **Action 9 지연**: 트리거 설계 오류 인정, 재설계 요청.

---

### 2.10 risk-manager

**⚠️ ESCALATE-1 (P0): notification_events 수집 중, 처리방침 미명시**

`f1e4bd5` 이후 production에서 수집 중인데 처리방침에 notification_events 항목이 없다. PIPA §15 위반 의심. 임시 가드: 처리방침 §1에 notification_events 1줄 + §2에 Web Push(Apple/Google/Mozilla) 국외이전 추가. 5/13 EOD까지 PR 머지 또는 수집 일시 정지 — **CEO 결정 요청**.

**⚠️ ESCALATE-2 (P0): Push 권한 다이얼로그 직전 고지 카피 부재**

브라우저 다이얼로그 = 기술적 동의이지 법적 동의 아님. PIPA §22 ① 위반 의심. 임시 가드: P2/P3 카드 내부에 "허용 시 endpoint·토큰 저장, /me에서 해제 가능" 1줄.

**분기 판정: (a)** — 임시 가드 경로 존재, CEO 결정으로 처리 가능. routine 정상 진행.

**Action 4 진척**: legal-review-2026-05-04.md 존재 (부분 완료). push·notification_events 항목 미추가 — 5/13 EOD까지 보완 PR.

신규 리스크:
- R-25-19-2: 푸시 카피 정신건강 컨텍스트 (P1) — "기분·우울·불안" 어휘 push 본문 진입 시 fail lint 룰 추가 요청
- R-25-19-3: 온보딩 학술 인용 효과 입증 오인 (P2) — OnboardingActClient.tsx:203-208 caption sweep 필요

---

### 2.11 senior-fullstack-engineer

**아젠다 A (P0) — Migration 15 RLS 2개 미점검**

1. push_clicked의 iOS Safari SW context RLS 동작: auth.uid() 쿠키가 SW context에서 살아있는지 미검증. silent drop이면 측정 누락 → IM.1 KPI 왜곡.  
2. v_push_funnel view SECURITY INVOKER 미명시: PG 버전에 따라 행동 갈림. Migration 16으로 분리 패치 권고.

**아젠다 B (P1) — metadata JSONB PII 마스킹 잠재 경로**

`/api/notifications/event` metadata(자유 JSONB)에 미래에 사용자 텍스트가 들어가면 logServerError 경유 Vercel Logs에 평문 흘러나올 가능성. 지금은 비PII만 들어가나 Zod enum 화이트리스트 키 강제 권장.

**Action 3·8 진척**:
- analytics_events vs notification_events 분리 유지 결론 → PO와 W20 월요일 30분 정합
- hot path 5개 후보 정리 완료, spec 문서 모집 D-7 전 작성

---

### 2.12 senior-qa-engineer

**아젠다 (P0) — E2E 9단계 실행 보고서 부재**

`docs/qa/e2e-scenario-im1-prerequisite.md`(846줄, 93 check items)는 5/3 작성됨. 그러나 실행 보고서·baseline 모두 미존재. 5/5 due → 5일 overdue.

5/11(월) 또는 5/12(화) 90~120분 실행 → EOD 보고 + baseline 작성. IM.1 모집 GO 종속.

**신규 코드 독립 검증 결과**:
- Migration 15 RLS: PASS (append-only 의도 명시 ✓, 롤백 SQL 미명시 P2)
- notify event route: PASS (Zod·PII·타입 정합)
- event.test.ts 4케이스: PASS
- 미검증: server-only enum 경계, PushToggle 회귀 가드 (P2)

**회귀 3종**: node_modules 부재로 직접 실행 불가. CI 자동 가동 여부 CTO에 확인 요청.

---

### 2.13 content-marketer

**합류 발견: 모집 공고 카피 5종 이미 ready**

`docs/im1/recruitment-package-2026-05-03.md` §2.1~§2.5 — 분석가 톤 5종 카피 ALL PASS. 재작성 불필요.

**아젠다 #1 (P0) — 게시 GO/NO-GO unblock**

카피는 ready인데 게시 결정이 막혀 있다. 5/13 게시 권고. 게시 직전 부록 B 본질 위협 가드 sweep 재실행(content-marketer 담당).

**아젠다 #2 — 분석가 톤 어휘 사전 v1 (Stage 0 허용)**

`docs/strategy/brand-voice-lexicon-v1.md` 신설: 금지어·거부어·강화어·회색지대·SEO 금기·SEO 목표 분류표. strategy-manager rubric의 반대 방향 출력과 합쳐 어휘 오염 closed loop.

즉시 착수: 어휘 사전 v1 (5/12), 이메일 카피 3종 (5/14), 랜딩 v0 stockpile (5/15 — 발행 X).

---

### 2.14 performance-marketer

**Stage 0 가드 즉시 명시**: 유료 광고·발행·인플루언서·결제 캠페인 — 모두 Stage 0 비허용. G3 전 없음.

**아젠다 A — IM.1 모집 funnel 전환 인프라 (Stage 0 허용)**

모집 시작 여부 불명확 시 즉시 착수 가능한 것:
1. 모집 funnel 이벤트 명세 v0 (랜딩 view → CTA → form submit → 확정 reply)
2. UTM 스키마 v0 (DM-SNS·DM-email·organic·direct-invite 4종)
3. SMTP stagger 가이드 (30명 × 3일, 시간당 ≤8건, 도메인 미취득 gmail 가정)

**아젠다 B — notification_events 14종 attribution 연계 점검**

14종 중 invite 발송·click·신청 완료 단계 식별 가능 여부 data-analyst와 점검. invited_via 차원 지금 추가가 가장 싸다.

PIPA attribution 적법성: UTM·anonymous_id·email-based attribution 각각 처리방침 명시·동의 필요 여부 risk-manager에 의뢰. 답변 전까지 anonymous_id + UTM 단일 모델로만 설계.

---

## 3. 충돌 검출

### §3.1 주요 충돌 표

| 위치 A | 위치 B | 트레이드오프 | CEO 결정 필요? |
|---|---|---|---|
| **CPO**: dependency 기반 GO (Action 5·6·4·E2E clear 후 모집 시작) | **strategy-manager**: rubric 5/15 frozen 후 인터뷰 — 평가 시즌 일부 손실 감수 | 속도(시즌 활용) vs 측정 신뢰도(rubric 선행) | 합의 가능 — 둘 다 rubric 선행 동의, 시간 차 이슈만 |
| **CTO**: E2E 이벤트 매핑표를 모집 GO 추가 prerequisite으로 제안 | **CPO**: 기존 prerequisite 4개로 충분 | 기존 gate 확장 vs 현행 유지 | ⚠️ Yes — CEO 결정 |
| **CSO**: 분석가 톤 모집으로 30명 채우기 느려도 OK | **CPO**: 5/9 deadline 이미 경과, 속도 중요 | 카테고리 정합 vs PMF 속도 | CPO 결정 (CSO는 입장 surface만) |
| **CTO**: 자동 미팅 routine 비율이 결제 가설 무기여 | **orchestrator/CEO**: 운영 인프라 투자 | 메타-인프라 비용 vs 장기 운영 효율 | ⚠️ Yes — CEO 결정 (다음 주 재평가) |

### §3.2 충돌 아닌 것 (정합 확인)

- **push = 결제 가설 B**: CTO 명확화, CPO·data-analyst 동의. KPI에 Δpain·autonomy 코호트 포함으로 해결.
- **Stage 0 비허용**: CMO·content-marketer·performance-marketer 모두 동일 인지. 충돌 없음.
- **PIPA 임시 가드**: risk-manager가 경로 제시, CTO·senior-fullstack 실행 가능. 충돌 없음.

### §3.5 Owner 재할당·미할당 surface

| 영역 | 항목 | 현재 상태 | 결정 |
|---|---|---|---|
| Action 9 트리거 재설계 | 경쟁 스냅샷 모집 의존성 제거 | strategy-manager 요청 | **재설계 승인 → 독립 routine (5/15 첫 스냅샷)** |
| 인터뷰 가이드 v1 | 신규 문서 미존재 | senior-ux-researcher 신규 owner 요청 | **신규 action 할당** |
| 모집 폼 Q4~Q7 어휘 audit | 신규 체계적 검증 | senior-ux-researcher 신규 owner 요청 | **신규 action 할당** |
| PMF 게이트 분모·분자 정의 | 미합의 | data-analyst → CPO·PO 결정 요청 | **신규 action 할당** |
| 7개 추가 이벤트 스펙 | 갭 발견 | data-analyst → senior-fullstack 전달 | **신규 action 할당** |
| 응모 폼 구축 | Tally/GF 구축 미완 | PO가 strategy-manager 권고 | **PO owner로 신규 할당** |

---

## 4. 합의

### §4.1 전원 합의 사항

1. **IM.1 모집 시작 = dependency 기반 GO**: 날짜 deadline 제거. "E2E 보고서 + 약관 patch(privacy·terms push 항목) + rubric v1.0 frozen + CEO sign-off 익일 모집 게시." 목표 날짜: 5/14(목) 또는 5/15(금).

2. **경쟁 모니터링 Action 9 독립 routine 재설계**: 모집 시작 트리거 제거. 5/15(금) 첫 스냅샷, 이후 매주 금요일. strategy-manager 단독 운영.

3. **rubric v1.0 이전에 IM.1 인터뷰 데이터 코딩 금지**: strategy-manager의 옵션 B 채택. coding-rubric-v1-2026-05-04.md 기반 + CSO 3축 매핑 + CPO 사인 = v1.0 frozen 후 모집 시작.

4. **push = 결제 가설 B 도구**: IM.1 KPI dashboard에 Δpain·autonomy 코호트(push ON vs OFF) 포함. data-analyst 설계.

5. **Stage 0 가드 명문화**: CMO·content-marketer·performance-marketer 모두 `cmo-stage-guide-v1.md` §2 비허용 목록 준수. 위반 시 CMO 즉시 거부 + CPO·CSO 환기.

### §4.2 ⚠️ CEO 결정 필요 항목

| # | 사안 | 배경 | 선택지 |
|---|---|---|---|
| ⚠️ CEO-1 | **PIPA 임시 가드 vs 수집 일시 정지** | notification_events 수집 중, 처리방침 미명시. PIPA §15 위반 의심. | A: 5/13 EOD 처리방침 PR 머지 (임시 가드) / B: 그때까지 수집 일시 정지 |
| ⚠️ CEO-2 | **Push P2/P3 카드 고지 카피 추가** | PIPA §22 고지 요건 미충족 의심 | A: 5/13 EOD 이전 P2/P3 카드에 1줄 추가 / B: 모집 시작 전 추가 |
| ⚠️ CEO-3 | **E2E 이벤트 매핑표를 추가 prerequisite으로 추가할지** | CTO 제안: 9단계 × 14 event_type 매핑표 PR. CPO 기존 prerequisite 4개로 충분 주장 | A: 추가 (더 안전) / B: 제외 (더 빠름) |
| ⚠️ CEO-4 | **자동 미팅 routine 투자 비율 재평가** | 이번 주 6 commit 중 메타-인프라가 다수. 결제 가설 무기여. | A: 다음 2주 모니터링 후 재평가 / B: 즉시 격하 결정 |

---

## 5. Action Items (다음 주)

due 기준: 2026-05-17 (토) 자정 KST (주간 all-hands 전). 별도 표기 있는 경우 해당 due.

### 5.1 모집 GO 핵심 (P0)

| # | Action | Owner | Due | Verify |
|---|---|---|---|---|
| A-1 | E2E 9단계 시나리오 실행 보고서 + AI anomaly baseline | senior-qa | **5/12(화) EOD** | `docs/qa/` 실행 보고서 + baseline 파일 존재 + 9단계 ALL PASS 또는 fail 목록 |
| A-2 | 처리방침·약관 push·notification_events 항목 추가 PR (CEO-1·CEO-2 가드) | risk-manager | **5/13(수) EOD** | app/privacy PR 머지 + app/terms push 동의 고지 1줄 |
| A-3 | rubric v0.1 초안 surface (30%) | strategy-manager | **5/12(화) EOD** | `docs/im1/coding-rubric-v0.1.md` 또는 기존 v1에 CSO 3축 매핑 섹션 추가 |
| A-4 | rubric v1.0 CSO 매핑 보완 + CPO sign-off | CSO + CPO | **5/14(목) EOD** | rubric v1.0 frozen 표기 + 양측 sign-off |
| A-5 | 모집 GO/NO-GO CEO 결정 | CEO | **5/11(월) EOD** | A-1·A-2·A-3 진행 확인 후 A-4 전 최종 결정 |
| A-6 | 응모 폼 (Tally/GF) 구축 | PO | **5/12(화) EOD** | 폼 URL + Q1~Q5 정합 + 동의 항목 포함 |
| A-7 | iPhone SE 320px 실기 테스트 보고 | product-designer | **5/11(월) EOD** | `docs/test-reports/iphone-se-320px-2026-W19.md` + push UI 톤 동시 검증 |

### 5.2 기술·보안 (P0~P1)

| # | Action | Owner | Due | Verify |
|---|---|---|---|---|
| B-1 | Migration 15 service_role 인벤토리 1줄 + rls-audit.ts 확장 | CTO / senior-fullstack | **5/12(화) EOD** | service_role 호출 경로 문서 + audit 결과 |
| B-2 | v_push_funnel SECURITY INVOKER 명시 (Migration 16) | senior-fullstack | **5/13(수) EOD** | migration 파일 + `security_invoker=on` 명시 |
| B-3 | push_clicked iOS SW RLS 동작 실측 | senior-fullstack | **5/13(수) EOD** | 실측 결과 comment 또는 별도 보고 |
| B-4 | metadata Zod enum 화이트리스트 키 강제 | senior-fullstack | **5/14(목) EOD** | PR + PII 마스킹 경로 차단 verify |
| B-5 | push 카피 lint:copy 룰 추가 ("기분·우울·불안" push 본문 fail) | risk-manager + strategy-manager | **5/14(목) EOD** | `scripts/lint-copy.ts` 룰 추가 + 0위반 verify |

### 5.3 측정·데이터 (P0~P1)

| # | Action | Owner | Due | Verify |
|---|---|---|---|---|
| C-1 | PMF 게이트 3종 분모·분자 조작적 정의 1-pager | data-analyst | **5/13(수) EOD** | 3가지 옵션 → CPO·PO 결정 |
| C-2 | 측정 SOP (`docs/im1/measurement-sop.md`) | PO + senior-fullstack | **5/13(수) EOD** | 추출 SQL + 주간 KPI 템플릿 + 트리거 임계 점검 cadence |
| C-3 | 7개 추가 이벤트 스펙 → senior-fullstack 전달 | data-analyst | **5/13(수) EOD** | 스펙 문서 + 페이로드·필수 필드·QA 체크리스트 |
| C-4 | E2E 9단계 × 14 event_type 매핑표 | senior-qa + senior-fullstack | **5/12(화) EOD** | A-1 보고서에 포함 또는 별도 문서 |

### 5.4 모집 지원·콘텐츠 (Stage 0 허용)

| # | Action | Owner | Due | Verify |
|---|---|---|---|---|
| D-1 | 분석가 톤 어휘 사전 v1 (`docs/strategy/brand-voice-lexicon-v1.md`) | content-marketer | **5/12(화) EOD** | 금지·거부·강화·회색지대 4분류 + grep gate 후보 |
| D-2 | SMTP stagger 가이드 v0 + UTM 스키마 v0 | performance-marketer | **5/12(화) EOD** | 30명 × 3일 stagger 문서 + UTM 4채널 표준 |
| D-3 | 모집 funnel 이벤트 명세 v0 + attribution 적합성 진단 | performance-marketer | **5/13(수) EOD** | 단계별 이벤트 명세 + data-analyst 정합 |
| D-4 | selectee 통보 이메일·미통과 회신·follow-up 카피 3종 | content-marketer | **5/14(목) EOD** | `docs/im1/email-templates-v1.md` |
| D-5 | 모집 폼 Q4~Q7 어휘 audit + 인터뷰 가이드 v1 | senior-ux-researcher | 5/11(audit) · 5/13(가이드) EOD | audit 결과 diff + `docs/im1/interview-guide-v1.md` |

### 5.5 경쟁·전략

| # | Action | Owner | Due | Verify |
|---|---|---|---|---|
| E-1 | 디스턴싱·하루콩 첫 스냅샷 v0 (독립 routine 시작) | strategy-manager | **5/15(금) EOD** | 스냅샷 폴더 + 앱스토어·랜딩·가격·SNS 어휘 5개 |
| E-2 | `cmo-stage-guide-v1.md`에 CSO 1회 검토 트리거 명문화 | CSO + CMO | **5/15(금) EOD** | Stage 가이드 §2에 "모집 카피·랜딩 v0 CSO 검토 prerequisite" 추가 |

### 5.6 Carry-over 최종 처리 (≥7일 overdue 재확인)

| # | 원 Action | 재활성화 판정 | 처리 |
|---|---|---|---|
| 원 #7 | 카피 톤 sweep 50% 완료 | open → 계속 | **5/15 due, product-designer + content-marketer** — 수동 톤 audit 4섹션 완결 |
| 원 #8 | hot path 모니터링 | open → 계속 | **모집 D-7 활성화** — senior-fullstack spec 문서는 5/13 EOD |
| 원 #10 | CEO GO/NO-GO | → **A-5**로 통합 | 5/11 결정 |

---

## 6. 회의 결정 사항 요약

1. **IM.1 모집 GO = dependency 기반** — "E2E 보고서 + 약관 patch + rubric v1.0 + CEO sign-off 익일." 목표 5/14~5/15.
2. **rubric v1.0 이전에 인터뷰 데이터 코딩 금지** — strategy-manager 옵션 B 채택.
3. **경쟁 모니터링 독립 routine** — Action 9 트리거 재설계, 5/15 첫 스냅샷.
4. **PIPA 임시 가드 P0** — risk-manager 5/13 EOD PR 머지 + CEO 결정(수집 유지 또는 일시 정지).
5. **Migration 15 안전 가드 보완** — service_role 인벤토리 + SECURITY INVOKER 명시 Migration 16.
6. **push = 결제 가설 B** — KPI에 Δpain·autonomy 코호트 포함.
7. **CMO Stage 0 유지** — 외부 광고·발행 없음. 어휘 사전·모집 지원·측정 인프라만.
8. **data-analyst 합류 첫 임무** — PMF 게이트 분모·분자 정의 + 7개 이벤트 스펙.

---

## 7. 다음 회의

- **2026-05-11(월) EOD**: CEO A-5 결정 (dependency 기반 GO/NO-GO)
- **2026-05-14(목) all-hands 전**: A-1~A-6 ALL clear → CPO GO 발령 → 모집 시작
- **2026-05-17(일) 18:00 KST**: 2026-W20 주간 all-hands (첫 5명 응답자 batch 예상)

---

## 부록 A. 회의록 무결성 검증 (senior-qa 기록 책임)

| 페르소나 | 정의 일관성 | 주요 우선순위 정합 |
|---|---|---|
| CPO | ✓ | Falsifiability #1 → dependency 기반 GO |
| CSO | ✓ | 카테고리 락인·경쟁 모니터링·차별화 정합 |
| CTO | ✓ | 회귀 보호·안전 가드·P0 결손 명시 |
| CMO | ✓ | Stage 0 명시·외부 launch 가드 |
| product-designer | ✓ | G1 prerequisite 자기 책임·본질 위협 #1·#4 |
| product-owner | ✓ | 가설→메트릭·백로그·실질 완료 재발견 |
| senior-ux-researcher | ✓ | 인터뷰 방법론·코딩 신뢰도·표본 한계 |
| data-analyst | ✓ | Falsifiability 가드·분모·분자·CI 의무화 |
| strategy-manager | ✓ | 시그널 추출·자발 언급 cadence·경쟁 모니터링 |
| risk-manager | ✓ | PIPA·약관·AI 책임 한계·G3 임시 가드 |
| senior-fullstack | ✓ | RLS·안전 가드·surgical 변경 |
| senior-qa | ✓ | 독립 검증 라인·E2E·AI 회귀 |
| content-marketer | ✓ | 분석가 톤 가드·Stage 0 stockpile |
| performance-marketer | ✓ | Stage 0 비허용·attribution 인프라·SMTP stagger |

충돌 §3 에 명시. 합의 §4 에 명시. CEO 결정 필요 4건 ⚠️ 표시됨.

---

## 부록 B. 참조 문서

- `docs/strategy/positioning-and-vision-v1.md` — 차별화 3축·본질 위협 6·의사결정 우선순위
- `docs/strategy/pmf-validation-plan.md` — H1~H6·M30.1·§11.3 트리거·60일·90일 게이트
- `docs/strategy/cmo-stage-guide-v1.md` — Stage 0/1/2 허용·비허용·이행 트리거
- `docs/strategy/bluebird_competitive_strategy_v1.md` — 차별화 축·가드레일
- `docs/im1/recruitment-package-2026-05-03.md` — 모집 패키지 (카피·폼·인센티브·체크리스트)
- `docs/im1/coding-rubric-v1-2026-05-04.md` — 자발 언급 코딩 rubric (29 카테고리)
- `docs/im1/legal-review-2026-05-04.md` — 약관·처리방침 1차 점검
- `supabase/migrations/15_notification_events.sql` — push 측정 인프라
- `.claude/agents/*.md` — 14 페르소나 정의

---

**회의 종료**: 2026-05-10  
**다음 회의**: 2026-05-17 18:00 KST (W20 주간 all-hands)
