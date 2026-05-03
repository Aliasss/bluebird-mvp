# BlueBird 전 구성원 회의 — 가장 중요한 아젠다

**일시**: 2026-05-03
**참여자**: CEO + 9명
- 임원: CPO · CSO · CTO
- CPO 산하: product-designer · product-owner
- CSO 산하: strategy-manager · risk-manager
- CTO 산하: senior-fullstack-engineer · senior-qa-engineer

**주재**: CEO
**기록**: senior-qa-engineer (회의록 정합성 독립 검증)
**목적**: 베타 사용자 0명·온보딩 deploy 완료 시점에서 *향후 2~4주 가장 절박한 아젠다*를 합의하고 후속 액션을 분담한다.

---

## 0. 현황 (개회 시점 기준)

| 항목 | 상태 |
|---|---|
| 베타 사용자 | 0명 (IM.1 모집 직전) |
| 마이그레이션 | 09(user_patterns) · 10(user_onboarding) · 11(checkins) · 12(schema_drift) 적용 완료 |
| 온보딩 9 슬라이드 | deploy 완료 (5/1) — Act 3구성, 학자 한글 호명, 풀어쓰기 |
| 카피 sweep | Δpain·λ·CBT·CAS·System 풀이 완료 (5/2) |
| 4 임원 합의 | (a) 데이터 스키마 + (c) 통계 수집(미노출) deploy 완료 |
| iPhone SE 320px 실기 | **미진행** (G1 prerequisite) |
| E2E 사용자 플로우 | **미검증** |
| 자발 언급 코딩 rubric | **미합의** |
| 약관·개인정보처리방침 정합 | "회사" → "운영자" 1차 정정 후 미점검 |

---

## 1. CEO 개회

> "베타 사용자 0명, 온보딩 deploy 완료, 마이그레이션 12까지 적용. 지금 우리가 *가장 집중해야 할 아젠다*는 무엇인가? 각자 자기 영역에서 가장 절박한 사안을 1~2개씩 발언해주세요. 이후 충돌 토론하고 합의 도출합니다."

---

## 2. 발언 라운드 — 각자의 가장 중요한 아젠다

### 2.1 CPO

> **1순위: IM.1 인터뷰 30명 모집 시작 — *지금이 기점***

베타 사용자 0명에서 PMF 검증의 모든 가설이 *측정 불가*입니다. 자발 언급 ≥30% / 30일 잔존 ≥15% / 결제 의향 ≥20% 셋 다 인터뷰 입력값이 있어야 합니다. 온보딩·매뉴얼 인프라·통계 스키마 모두 갖춰졌습니다. 이번 주 안에 모집을 시작해야 60일 게이트(G2)에 시간 안에 도달합니다.

> **2순위: 1차 타겟 3축 selectee 검증 메커니즘**

직무 narrowing은 정정했지만(commit 64ad52f), *어떻게 3축을 만족하는 사람을 모으는지*가 아직 운영 SOP가 없습니다. PO와 함께 모집 채널별 selectee 사전 스크리닝(질문지 5문항 이내) 정립이 모집 시작 *전* 필수입니다.

> **반대 의견 사전 점검**: "더 검증한 다음 모집"이라는 입장도 가능. 하지만 *0명에서 무한정 검증*하는 건 가설 자체가 falsifiable하지 않게 됨. 검증은 prerequisite 4건만 통과하면 진행해야 합니다. 그 이상은 게이트 끝없이 미루는 핑계.

---

### 2.2 CSO

> **1순위: 디스턴싱·하루콩 분기 평가 시즌 모니터링 cadence 정립**

지금 우리만 deploy하는 게 아니라 디스턴싱·하루콩도 동시에 움직입니다. 5월~6월은 한국 직장인 분기 평가 시즌으로 *경쟁사 자발 가치 언급 변화*를 추적할 절호의 기회입니다. 우리는 인터뷰에서 "디스턴싱 대비" 자발 언급을 코딩하기로 했는데(PMF plan §3), 그 시점에 디스턴싱 카피 변화가 있으면 인터뷰 해석에 *컨파운더(confounder)* 들어옵니다. 디스턴싱 랜딩·카피·기능 변화를 *주 1회 스냅샷* 잡아야 합니다. strategy-manager가 운영.

> **2순위: 글로벌 챗봇 한국어 진입 시그널**

Wysa·Woebot은 한국어 미진입 상태이지만, 진입 시 우리 카테고리 락인이 흔들립니다. 베타 인터뷰 30명에 *외국어 챗봇 사용 경험* 질문 1개 추가 권고. 자발 언급 ≥10% 시 락인 메커니즘 격상 트리거.

> **반론 인지**: "지금 경쟁사보다 우리 검증이 먼저"라는 CTO 입장 일견 타당. 하지만 *카테고리 자체*가 진입자에게 점유당하면 우리 PMF 의미 약화. 둘 다 병렬 진행해야 합니다. 비용은 strategy-manager 1명 cadence라 작습니다.

---

### 2.3 CTO

> **1순위: 모집 *직전* E2E Acid Test — senior-qa와 함께**

30명이 진입했을 때 robust한가? 마이그레이션 12 적용 후 RLS·INSERT·DELETE 정책이 *코드와 정합*인지 실제 데이터 흐름으로 검증 안 했습니다. analyze API의 user_patterns INSERT (best-effort), checkins 테이블, log_type 컬럼 모두 *production 1번도 통과 안 한 path*입니다. 베타 5명만 진입해도 broken path 발견되면 그 인터뷰는 신뢰도 0.

> **2순위: hot path 모니터링 routine 가동**

새 deploy 직후 30분 routine 부재. 인터뷰 시작 시점부터 매일 1회 Vercel 에러 로그·Supabase analytics_events 점검 SOP 정립. senior-fullstack 운영.

> **CPO 입장에 대한 코멘트**: "지금 모집"은 동의하지만 *prerequisite ALL pass*가 빠지면 위험합니다. E2E 1회 통과는 양보 불가. 모집 후 broken path 나오면 인터뷰 데이터 자체가 더럽혀집니다. 1~2일 늦어지더라도 PASS 후 진행해야 합니다.

---

### 2.4 product-designer (CPO 산하)

> **1순위: iPhone SE 320px 실기 테스트 — G1 prerequisite**

PMF plan에서 G1 진입 전 *반드시* 통과해야 한다고 명시된 항목입니다. 9 슬라이드 온보딩에서 단락 4~5개로 풀어쓰기 한 후 320px viewport에서 *스크롤 없이 fit하는지* 실제 기기로 본 적이 없습니다. 시뮬레이터는 폰트 렌더링·터치 정밀도가 다릅니다. 이번 주 1번 mandatory.

> **2순위: 본질 위협 #1·#2 가드 일관성 점검 (사용자 facing 전 영역)**

온보딩·랜딩·인사이트는 sweep했지만, `manual`·`our-philosophy`·`me`·`journal`·`review` 페이지는 *과거 카피 잔존*. 카피 톤 회귀가 누적되면 베타 사용자가 일관성 없는 인상을 받습니다. lint:copy 가드는 패턴 기반이라 *문장 톤*까지 잡지 못합니다. designer가 1회 sweep 권고.

> **PO 입장에 대한 코멘트**: 측정 인프라 점검은 중요하지만 *시각 회귀가 인터뷰 자발 언급을 오염*시킬 수 있습니다. "이 앱 디자인이 왜 이래" 같은 자발 언급이 카테고리 정합 시그널을 가립니다.

---

### 2.5 product-owner (CPO 산하)

> **1순위: 측정 인프라 정합 점검 — H-O5·H-O6·자발 언급 코딩 fixture**

온보딩 deploy 후 H-O5(Act 2·3 진입율 ≥40%) · H-O6(이론 이름 자발 언급 ≥10%)가 측정 가능한지 점검 안 했습니다. `user_onboarding.reached_act` 컬럼은 있지만, 인터뷰 시점에 이 데이터를 어떻게 추출해 코딩 결과와 cross-reference하는지 *운영 SOP* 부재. strategy-manager·senior-fullstack과 함께 점검.

> **2순위: 자발 언급 트리거 메커니즘 운영 시작**

PMF plan §11.3에 7개 트리거(매뉴얼·통계·신체화·통증vs스트레스·분석가 톤 인식·법적 표현·등급 임계 framing)가 정의됐는데, *언제 어떻게 점검*하는지 cadence 부재. 매 인터뷰 batch마다(첫 5명·다음 10명·이후 15명) 자발 언급 frequency 표 업데이트 SOP 정립이 모집 *동시*에 가동돼야 합니다.

> **CTO 입장에 대한 코멘트**: E2E 통과 동의. 단, E2E는 *사용자 흐름*만 검증할 뿐 *측정 코드의 정합성*은 별도. 둘 다 통과해야 합니다.

---

### 2.6 strategy-manager (CSO 산하)

> **1순위: 자발 언급 코딩 rubric 사전 합의 — 모집 *전* 필수**

N=30 인터뷰에서 자발 언급을 코딩하는데, *코딩 기준*이 사전 합의 안 되어 있으면 결과 분쟁이 납니다. "이 사용자가 *디버깅*이라 말했나, *분석*이라 말했나, 둘 다인가?" 같은 경계 case에서 코딩자(저)가 임의로 결정하면 *내부 합의 신뢰도가 0*. CSO·CPO가 함께 rubric 1page에 합의하고, 처음 5명 인터뷰는 *2명이 동시 코딩 후 정합도(Cohen's κ)* 측정해서 적어도 0.7 이상 확보 필요.

> **2순위: 경쟁 monitoring 시작점 잡기**

CSO가 제기한 디스턴싱·하루콩 cadence 운영 책임을 제가 받습니다. 첫 스냅샷은 *모집 시작 시점*에 잡아야 base line이 됩니다. 일주일 늦으면 인터뷰 시점과 비교 못 합니다.

> **risk-manager 입장에 대한 코멘트**: 약관 정합 점검과 자발 언급 코딩은 다른 layer입니다. 동시에 진행 가능.

---

### 2.7 risk-manager (CSO 산하)

> **1순위: 모집 시작 *전* 약관·개인정보처리방침 정합 1차 점검**

5/2 commit 1ee6df4에서 "회사" → "운영자" 치환 + 1인 운영 사실 명시 했지만 *변호사 검토는 G3*. 그 사이 *우리 표시*가 PIPA(개인정보보호법) §22(개인정보 처리방침 수립·공개)·표시광고법·약관규제법 §3(약관의 명시·교부)에 *최소 정합*인지 확인 안 됐습니다. 모집 시작하면 30명이 가입하면서 *법적 효력*이 생깁니다. 1번이라도 misrepresentation이 발견되면 G3 변호사 검토 시 *임시 가드 부재*가 책임 소재가 됩니다.

> **2순위: AI 책임 한계 surface 점검**

`/disclaimer` 페이지는 있지만, *온보딩 9 슬라이드*에서 학술 인용(Beck 1976·Kahneman 2011 등)을 *효과 입증*으로 오인 가능성 있습니다. 본질 위협 #4 가드는 코드 lint(`/치료/`)만 잡고 *인용의 함의*는 못 잡습니다. 인터뷰 첫 5명에서 "BlueBird가 치료 효과 있다고 들었다" 같은 자발 언급이 ≥1건이라도 나오면 즉시 caption 수위 재검토 트리거 권고.

> **CPO 입장에 대한 코멘트**: 모집을 미루자는 게 아닙니다. 모집과 *동시에* 약관 점검을 진행해야 합니다. 점검 결과 misrepresentation 발견 시는 *그 항목만* hotfix하고 모집 계속.

---

### 2.8 senior-fullstack-engineer (CTO 산하)

> **1순위: 마이그레이션 적용 후 일주일 모니터링 routine**

09·11·12 적용 후 5/3 현재 1일 경과. 첫 베타 사용자가 진입하면 *production에서 처음으로 user_patterns INSERT·analysis DELETE·log_type 컬럼이 hot path를 통과*합니다. RLS 차단·CHECK 위반·NOT NULL 위반 같은 silent error는 분석 결과에 누락되거나 재분석 실패로 surface됩니다. Vercel 로그 + Supabase logs 매일 1회 점검 SOP가 모집 시작 시점부터 가동돼야 합니다.

> **2순위: PII 마스킹 logger 검증**

5/2 commit 69557cd에서 `console.error` → server-logger 마이그레이션 완료. 단, *실제 production 로그에서 PII 마스킹이 작동하는지* 사후 검증 안 됨. 모집 *전*에 인위적인 PII 포함 에러 trigger 후 Vercel 로그에서 마스킹 확인. senior-qa와 협업.

> **CTO·QA 입장과 정합**: E2E·hot path 모니터링은 같은 트랙. 분담 OK.

---

### 2.9 senior-qa-engineer (CTO 산하)

> **1순위: E2E 사용자 플로우 1회 통과 — 모집 *전* mandatory**

베타 사용자 0명 → 첫 1명이 *우리 인터뷰 대상*인데 그 사람이 broken path를 만나면 가설 검증 자체가 무의미합니다. 시나리오:
1. 가입 → 온보딩 자동 진입 (Act 1 강제)
2. Act 1·2·3 진입 → "지금 첫 디버깅 시작하기" → /log 진입
3. 첫 로그 작성 → analyze → 분석 결과 + reframe 질문
4. action 진행 → 자율성 지수 변화
5. 24시간 후 재평가 → Δpain 측정
6. /me → "온보딩 다시 보기" → /onboarding/1?replay=1
7. /insights → 자율성 지수 누적·통증 변화량 차트 노출
8. /journal → 로그 기록 노출
9. 매뉴얼 페이지 정합

각 단계에서 RLS·INSERT·SELECT 정합·UI 시각 회귀 점검. *내가 책임지고 1회 수동 통과 + 발견된 이슈 모두 보고서*. CTO 결정에 대한 *독립 검증 라인*이라 senior-fullstack과 별개로 진행.

> **2순위: AI 분석 품질 회귀 가드**

Gemini 응답은 *비결정적*이고 *모델 업데이트*에 따라 변동합니다. 5/2 마이그레이션 후 분석 결과 변화 모니터링 안 됨. 첫 5명 인터뷰의 분석 결과 *anomaly*(distortion 0건·왜곡 분류 변동)를 베이스라인 대비 비교 routine 정립.

> **모든 발언 통합 코멘트**: senior-qa로서 *모집 시점 결정*은 prerequisite ALL pass 후라는 CTO 입장에 동의. 단, prerequisite 자체를 *최소화*해서 모집을 *지나치게 미루지 않는* 균형 필요. 4개(실기·E2E·측정·약관)는 *최소 set*이라 봅니다. 더 추가 시도되면 반대.

---

## 3. 토론 — 모집 시작 시점·prerequisite 우선순위

### 3.1 핫스팟 — 모집 시작 시점 분기

| 입장 | 발언자 | 핵심 |
|---|---|---|
| 즉시 (1~2일 내) | CPO | 0명 상태에서 무한 검증은 falsifiability 약화 |
| Prerequisite ALL pass 후 (4~5일) | CTO · designer · PO · QA · risk-manager | broken path·misrepresentation 시 데이터·법적 신뢰도 0 |
| 동시 진행 가능 항목은 병렬 | CSO · strategy-manager · senior-fullstack | 약관 점검·경쟁 모니터링은 모집과 *병렬* |

### 3.2 합의 도출 (CEO 정리)

CTO 입장에 동의 — *prerequisite 4개 ALL pass*까지 모집 *시작* 보류. 단:

1. Prerequisite는 *최소 set 4개*만. 추가 항목은 별도 결정.
2. Prerequisite 통과 기한은 **5/5 (목)** — 5/3 회의 후 영업일 2~3일.
3. 5/6 (금) 또는 늦어도 5/9 (월) 모집 *시작*.
4. 모집과 *동시에* 가동: 자발 언급 코딩 rubric·경쟁 모니터링·hot path 모니터링·약관 정합 후속 점검.

> **CPO 코멘트**: 동의. 단, 5/9 (월)을 넘기면 60일 게이트 일정에 부담. 5/9이 *deadline*.

> **risk-manager 코멘트**: 약관 점검은 5/4 (월) 1일 내 완료 가능. prerequisite 차단 요인 아님.

> **senior-qa 코멘트**: E2E 1회 통과는 5/3~5/5 사이 1.5일. 시나리오 9단계 미리 문서화 시 더 단축.

---

## 4. 합의 — 1순위 아젠다와 prerequisite

### 4.1 1순위 아젠다 (전원 합의)

> **IM.1 인터뷰 30명 모집 시작 (G1 → G2 게이트 진입)**
> 모집 시작일: **5/6 (수) 권고, 늦어도 5/9 (월)**

이 아젠다 외 모든 작업은 *모집을 가능하게 만드는 prerequisite* 또는 *모집과 병렬 가동되는 운영 라인*으로 정합.

### 4.2 모집 *전* prerequisite 4개 (ALL pass 필수)

| # | prerequisite | 담당 | 기한 | 검증 |
|---|---|---|---|---|
| (a) | iPhone SE 320px 실기 테스트 — 9 슬라이드 viewport fit + 카드 스크롤 회귀 | designer | 5/4 | 캡처 + 발견 이슈 list |
| (b) | E2E 사용자 플로우 1회 수동 통과 — 9단계 시나리오 | senior-qa | 5/5 | 통과 보고서 + 이슈 list |
| (c) | 측정 인프라 정합 점검 — H-O5·H-O6·자발 언급 코딩 데이터 추출 SOP | PO + senior-fullstack | 5/5 | 추출 쿼리 동작 + 결과 sample |
| (d) | 약관·개인정보처리방침 1차 점검 — PIPA·약관규제법·표시광고법 최소 정합 | risk-manager | 5/4 | 점검 보고서 (G3 임시 가드) |

ALL pass 후 CEO에게 결과 종합 보고 → 모집 시작 승인.

### 4.3 모집 *동시*에 가동 (병렬)

| 라인 | 담당 | 시점 |
|---|---|---|
| 자발 언급 코딩 rubric 1page 합의 | strategy-manager (주관) + CSO + CPO | 5/4 |
| 첫 5명 인터뷰 *2명 동시 코딩* (Cohen's κ ≥ 0.7) | strategy-manager + PO | 첫 5명 후 |
| 디스턴싱·하루콩 주 1회 스냅샷 | strategy-manager | 모집 시작일부터 |
| Wysa·Woebot 한국어 진입 시그널 모니터링 | strategy-manager | 월 1회 |
| Vercel·Supabase hot path 모니터링 | senior-fullstack | 매일 1회 |
| AI 분석 anomaly 베이스라인 비교 | senior-qa | 첫 5명 후 |
| 카피 톤 가드 sweep (manual·our-philosophy·me·journal·review) | designer | 5/5~5/8 (모집과 병렬) |

### 4.4 인터뷰 batch별 트리거 점검 (PO 운영)

매 batch(5·15·30명)마다 PMF plan §11.3 트리거 7개 + 매뉴얼·통계 기대치 ≥10% 점검:
- 매뉴얼 prototype 격상
- 통계 prototype 격상
- 신체화 모듈 D 격상
- 통증 vs 스트레스 라벨 변경
- 분석가 톤 인식 분포 — 카피 마이그레이션
- 법적 표현 정렬
- AI 추정 framing 보강

---

## 5. 후속 액션 (담당·기한·검증 메트릭)

| # | 액션 | 담당 | 기한 | 검증 |
|---|---|---|---|---|
| 1 | iPhone SE 320px 실기 테스트 + 보고 | designer | 5/4 (월) | 9 슬라이드·랜딩·dashboard·analyze 4영역 캡처 |
| 2 | E2E 9단계 시나리오 통과 + 이슈 list | senior-qa | 5/5 (화) | 9단계 ALL PASS 또는 fail 영역 명시 |
| 3 | 측정 인프라 SOP — H-O5·H-O6·자발 언급 추출 쿼리 | PO + senior-fullstack | 5/5 (화) | sample 결과 1세트 |
| 4 | 약관·개인정보처리방침 1차 점검 | risk-manager | 5/4 (월) | 점검 보고서 (PIPA·약관규제·표시광고법) |
| 5 | 자발 언급 코딩 rubric 1page | strategy-manager + CSO + CPO | 5/4 (월) | rubric 문서 + κ 측정 SOP |
| 6 | 모집 채널·인센티브·1차 타겟 selectee 사전 스크리닝 5문항 | CPO + PO | 5/5 (화) | 모집 공고 draft + 스크리닝 폼 |
| 7 | 카피 톤 가드 sweep (manual·our-philosophy·me·journal·review) | designer | 5/5~5/8 | sweep 보고서 + 변경 전·후 |
| 8 | hot path 모니터링 routine 가동 | senior-fullstack | 모집 시작일 | Vercel·Supabase 매일 1회 |
| 9 | 디스턴싱·하루콩 주 1회 스냅샷 | strategy-manager | 모집 시작일 | 스냅샷 폴더 + 변화 diff |
| 10 | 모집 시작 GO/NO-GO 승인 | CEO | 5/5 EOD | 1~6 ALL PASS 보고 후 |
| 11 | IM.1 모집 시작 | CPO | 5/6 (수) 권고 / 5/9 (월) deadline | 모집 공고 게시 + 첫 응답 inbound |

---

## 6. 회의 결정 사항 요약

1. **1순위 아젠다 = IM.1 인터뷰 30명 모집 시작** — 다른 모든 작업은 이 아젠다의 prerequisite 또는 병렬 운영 라인으로 정합.
2. **prerequisite 4개 (실기·E2E·측정·약관) ALL pass 후 모집 시작**. 추가 항목 들어가지 않도록 *최소 set 고정*.
3. **모집 시작일 5/6 (수) 권고, 5/9 (월) deadline**.
4. **모집과 동시 가동되는 7개 라인** — strategy-manager·senior-fullstack·senior-qa·designer 분담.
5. **인터뷰 batch별 트리거 점검은 PO 운영** — PMF plan §11.3 + 매뉴얼·통계 ≥10%.

---

## 7. 다음 회의

- **5/5 (화) EOD** — prerequisite 1~6 ALL PASS 보고 회의 (CEO + 담당자만, 30분)
- **5/13 (월)** — 첫 5명 인터뷰 batch 결과 회의 (전 구성원, κ 정합도·자발 언급 frequency·트리거 점검)
- **5/27 (월)** — 15명 batch 결과 회의 (G2 게이트 사전 점검)

---

## 부록 A. 회의록 무결성 검증 (senior-qa 기록 책임)

본 회의록은 9명 페르소나 발언을 *각자 책임 영역·우선순위 정합*으로 기록함. 페르소나 정의(.claude/agents/*.md)와 cross-reference 검증:

| 페르소나 | 정의 일관성 | 주요 우선순위 정합 |
|---|---|---|
| CPO | ✓ | Falsifiability → 차별화 → 미션 → 인지 부하 → 비용 |
| CSO | ✓ | 카테고리 락인·차별화·경쟁 모니터링 |
| CTO | ✓ | 회귀 보호·안전 가드 |
| product-designer | ✓ | 본질 위협 #1·#2 1차 방어 |
| product-owner | ✓ | 가설→메트릭·트리거 운영 |
| strategy-manager | ✓ | 자발 언급 코딩·경쟁 모니터링 |
| risk-manager | ✓ | PIPA·약관·AI 책임 한계 |
| senior-fullstack | ✓ | migration·RLS·hot path |
| senior-qa | ✓ | 독립 검증 라인·E2E·AI 회귀 |

발언 간 *충돌 영역*은 §3.1에 명시. 합의 도출 과정은 §3.2에 명시.

---

## 부록 B. 참조 문서

- `docs/strategy/positioning-and-vision-v1.md` — 1차 타겟 3축·차별화 3축·본질 위협 6개·의사결정 우선순위
- `docs/strategy/pmf-validation-plan.md` — H1~H6·M30.1·§11.3 트리거·60일·90일 게이트
- `docs/strategy/design-realignment-v1.md` — P0~P2·B1~B4 인터뷰 검증 대기·진행 상태
- `docs/strategy/development-backlog.md` — Tier 분류·결제 가설
- `docs/strategy/bluebird_competitive_strategy_v1.md` — 차별화 축·가드레일
- `docs/strategy/bluebird_retention_mechanisms_v1.md` — H1~H6·매뉴얼·통계 메커니즘
- `docs/strategy/bluebird_stress_integration_review_v1.md` — 입력 vs 결과 원칙
- `.claude/agents/*.md` — 9 페르소나 정의·보고선·권한 경계

---

**회의 종료**: 2026-05-03
**다음 회의**: 2026-05-05 EOD (prerequisite ALL PASS 보고)
