# Project BlueBird — MVP 외부 소개 종합 문서

**문서 버전**: 2026-05-03 v1 (rev 2026-05-04 — pain_score NRS-11 0~10 정렬 · autonomy_score v2 SDT 정합)
**대상 독자**: 투자자·임상 자문 후보·제휴 후보·외부 소개 라인
**작성**: BlueBird CPO + strategy-manager + senior-fullstack-engineer 3 페르소나 협업
**상태**: 베타 단계 (사용자 0명, IM.1 모집 직전, 온보딩 deploy 완료)
**참조 문서 cross-link**: `docs/strategy/positioning-and-vision-v1.md` · `docs/strategy/pmf-validation-plan.md` · `docs/strategy/bluebird_competitive_strategy_v1.md` · `docs/strategy/bluebird_retention_mechanisms_v1.md` · `docs/strategy/bluebird_stress_integration_review_v1.md` · `docs/strategy/design-realignment-v1.md` · `docs/strategy/development-backlog.md` · `docs/im1/recruitment-package-2026-05-03.md` · `docs/im1/coding-rubric-v1-2026-05-04.md` · `docs/im1/legal-review-2026-05-04.md` · `docs/qa/e2e-scenario-im1-prerequisite.md` · `docs/research/README.md` · `docs/meetings/2026-05-03-all-hands-priority-agenda.md`

> **본 문서의 톤 — 분석가 톤 (Analyst Voice).** 정량·구조·근거 인용 우선. 셀링 톤 회피. 검증 가능한 주장만 surface. 추정·가정 항목은 "측정 SOP는 sprint 2 정의 예정"으로 명시.
>
> **본 문서가 부정 명제로 surface하는 것**: BlueBird는 *치료가 아니다*, *의료기기가 아니다*, *명상 앱이 아니다*, *코칭 앱이 아니다*, *챗봇이 아니다*. 이 부정 명제는 의도적 — 의료기기 함의 차단 및 카테고리 표류 방지(positioning §1·§9 가드).
>
> **인적 정보 정책**: BlueBird = 해솔(필명) 페르소나. 본명 surface 0. CEO 본인 외 직원 0 — 베타 단계 1인 운영자 명시. 외부 연락은 응모 폼 / `seob6615@gmail.com`을 통하며, 본 문서 본문 어디에도 외부 노출 비대상 정보(사업자 등록 상태·주민번호·물리 주소) surface 0.

---

# 목차

0. Executive Summary
1. 문제의식 — Why
2. 이론적 근거 — Theoretical Foundation (CBT · Dual Process · Prospect Theory · CAS · Heuer · Camus · SDT)
3. 솔루션 — Product (카테고리·4단계 회로·차별화 3축)
4. 서비스 내 개념·지표 — Definitions & Formulas (Δpain·자율성 지수·λ·CAS·archetype·N≥50·게이트)
5. 기능 (Features) — 모든 사용자 facing 기능
6. 기술 스택 (Architecture) — Next.js 16 · Supabase · Gemini · 13 마이그레이션
7. PMF 검증 (Validation) — IM.1 모집·코딩 rubric·G2·G3 게이트
8. 본질 위협·비목표
9. 조직 구성
10. 로드맵
11. 위험·완화
12. 부록 (학술 출처·약관 핵심·코드·문서 cross-reference)

---

# 0. Executive Summary

## 0.1 한 줄 정의

> **BlueBird는 사고를 디버깅하는 도구입니다.**
>
> 명상 앱도, 코칭 앱도, 일기 앱도, 챗봇도 아닙니다. 본인의 사고 패턴을 *시스템처럼* 보고 싶은 한국 인지노동자를 위한, 인지 왜곡 5종 분석 + Δpain 효과 측정 + 누적 매뉴얼이 결합된 PWA 도구입니다.
> (출처: `docs/strategy/positioning-and-vision-v1.md` 한 줄 정의 / `docs/im1/recruitment-package-2026-05-03.md` §2.1)

## 0.2 핵심 가치

| 카테고리 | 내용 | 검증 메커니즘 |
|---|---|---|
| 핵심 가치 (Δ 측정) | 사고 디버깅 후 *측정 가능한 고통 감소* (Δpain) | `intervention.reevaluated_pain_score - logs.pain_score` 시계열 |
| 누적 가치 (락인) | 내 사용설명서 — 사용할수록 정교해지는 자기 지도 | 30일+ 사용자에게 고통·왜곡 상관관계 surface |
| 차별 가치 | 한국어 fine-tuning (우회 어미·체면 어휘) + 분석가 톤 | 인터뷰 자발 가치 언급 코딩 (PMF plan §0) |
(출처: `docs/strategy/positioning-and-vision-v1.md` §3)

## 0.3 1차 타겟 3축 (직무 무관)

다음 3축이 *동시에* 충족되는 사용자 — 직무 enumerate(BA·PM·엔지니어·컨설턴트·연구자 등)는 *예시일 뿐 한정 X*. 측정은 직무 분포가 아니라 3축 자발 언급 코딩.

- **심리·동기**: 감정 언어가 부담스럽고 자기를 *시스템처럼* 이해하고 싶음
- **인지 스타일**: 분석적 자기이해 선호 — "위로받기"보다 "구조 보기"
- **맥락**: 한국 인지노동자 (직장·체면·자기낙인 맥락)
(출처: `docs/strategy/positioning-and-vision-v1.md` §2 / commit `64ad52f` — 직무 narrowing 정정)

## 0.4 차별화 3축 (vs 디스턴싱)

| 축 | 디스턴싱 | BlueBird |
|---|---|---|
| 톤 | 정서적·치유적 ("따뜻한 봄날") | 분석적·구조적 ("디버깅·OS 최적화") |
| 사용자 자기상 | "회복이 필요한 사람" | "최적화하려는 운영자" |
| 가격 가설 | 월 8~10만원 (코치 인건비) | 월 1.9~3.9만원 (자동화) — 인터뷰 후 결정 |
(출처: `docs/strategy/positioning-and-vision-v1.md` §4 / `bluebird_competitive_strategy_v1.md` §4)

## 0.5 현재 상태 (2026-05-03 기준)

- 베타 사용자 0명 (IM.1 모집 직전)
- 온보딩 9 슬라이드 deploy 완료 (5/1 — Act 3구성, 학자 한글 호명, 풀어쓰기)
- 카피 sweep 완료 (5/2 — Δpain·λ·CBT·CAS·System 풀이)
- 마이그레이션 12까지 production 적용 완료
- IM.1 모집 시작 권고일: 5/6 (수) / deadline: 5/9 (월)
(출처: `docs/meetings/2026-05-03-all-hands-priority-agenda.md` §0)

## 0.6 학술 백본 7종

1. **CBT** (Aaron Beck, 1976) — 인지 왜곡 5종 분류 → `lib/ai/bluebird-protocol.ts:45~84` 코드화 + archetype 매칭(§4.2.10)·기록 빈도 한도(§4.2.8) 임상 권장 근거
2. **Dual Process Theory** (Daniel Kahneman, *Thinking, Fast and Slow*, 2011) — System 1/2 (10ms vs 3s) → `BLUEBIRD_THEORY_SUMMARY.dualProcess` + System 2 질문 시드(`system2_question_seed`) 산출 근거
3. **Prospect Theory** (Kahneman & Tversky, 1979) — 손실 가중치 λ ≈ 2.25 → `loss_aversion_signal` 0~1 추정 + λ 학술 상수 (§4.2.4)
4. **Metacognitive / CAS Model** (Adrian Wells, 2009) — 반추·걱정 → `cas_signal.rumination`·`cas_signal.worry` 0~1 + 분석 한도(§4.2.8) 반추 증폭 회피 근거
5. **Cognitive Biases** (Richards Heuer, *Psychology of Intelligence Analysis*, 1999) — 분석가 톤 학술 근거
6. **실존주의** (Albert Camus, *The Myth of Sisyphus*, 1942) — 미션 "자율성 회복"
7. **자기결정성 이론 (Self-Determination Theory, SDT)** (Deci & Ryan, 2000) — autonomy_score (§4.2.2) 산식 근거. autonomy 차원(자기 의지의 개시·자기 표현)을 두 입력(answerCount·completion_note)으로 매핑.

부록 측정 척도:
- **NRS-11** (Hawker et al., 2011) — pain_score 0~10 정수 척도 (§4.1.4). 임상·심리측정에서 자기보고 통증 강도 측정의 정수 표준.

(출처: `docs/research/README.md` 자료 1~4 + `docs/strategy/positioning-and-vision-v1.md` §5)

---

# 1. 문제의식 — Why

## 1.1 한국 인지노동자가 직면한 문제

### 1.1.1 시장 진단 — unmet need

- 정신건강 문제 경험자의 73%가 어떤 형태의 상담·치료도 받지 않음. 4명 중 3명이 방치 상태.
- 가장 큰 진입 장벽은 "주변의 부정적 시선"(27%)으로, 이는 비대면·익명 디지털 도구의 강한 정당성을 만든다.
- 직장인 번아웃 경험률 69%, 30대는 75.3%.
- 글로벌 디지털 정신건강 시장은 2025-2035년 연평균 18.54% 성장 전망.
(출처: `docs/strategy/bluebird_competitive_strategy_v1.md` §1.1)

### 1.1.2 한국 맥락의 3중 압력

한국 인지노동자가 자기 사고를 다루는 행위는 다음 3중 압력에서 발생한다:

1. **직장 압력** — 회의·평가·리뷰 등 인지노동의 결과가 평판으로 즉시 환산되는 환경. 분기·연간 평가 사이클이 "내 능력이 드러난다"는 부담을 주기 사이클로 만든다.
2. **체면 부담** — 정신건강 문제 노출에 대한 사회적 stigma. 친구·가족·동료에게 "감정 일기"·"상담 받는다"를 말하는 것 자체가 비용.
3. **자기낙인** — 자신을 "감정에 휘둘리는 사람"으로 라벨링하는 것이 *그 자체로* 자기상에 대한 손실.

이 3중 압력은 위로형 도구(명상·일기·챗봇)를 사용 가능하게 만들지만, 사용자가 *자기 자신을 시스템처럼 보는* 도구를 원할 때는 채우지 못하는 빈자리를 만든다.
(출처: 온보딩 슬라이드 `lib/onboarding/slides.ts` Act 1-1 paragraphs 1~4 — "회의에서 무심코 던진 한 마디 / 며칠째 답장 없는 메시지 / 분기 평가서의 짧은 한 줄 / 직장·체면·자기낙인 같은 한국 사회의 압력 속에서 점점 굳어집니다")

## 1.2 같은 실수의 반복 — 학습된 자동 사고

### 1.2.1 핵심 메커니즘

> "사고는 학습됩니다. 한 번 학습된 생각의 길은 점점 빠르고 자동으로 작동합니다.
> 의식하지 못한 채 현실을 한쪽으로 비틀어 해석하는 것을 인지 왜곡이라고 부릅니다.
> 인지 왜곡은 성격의 결함이 아니라 빠르게 판단하려는 뇌의 학습 결과입니다."
(출처: 온보딩 슬라이드 `lib/onboarding/slides.ts` Act 1-2 paragraphs 1~4)

### 1.2.2 학술 정합

이 메커니즘은 §2.1 CBT (Beck 1976) + §2.2 Dual Process (Kahneman 2011) + §2.4 CAS (Wells 2009)의 결합 — *학습된 자동 사고*는 CBT의 핵심 진단 단위이며, *자동성*은 System 1 특성이고, *반복성*은 CAS(Cognitive Attentional Syndrome)의 반추·걱정 사이클이다.

### 1.2.3 BlueBird의 진단

본 도구는 사용자에게 "당신은 X한 사람이다"라고 *정의*하지 않는다. 대신 "어느 자극에 어느 패턴이 작동했는지"를 *관찰 가능한 데이터*로 분리해 보여준다. 이는 §2.1 CBT의 *행동·패턴 수준*과 *인격 수준*을 분리하는 원칙(매뉴얼 가드레일 (c) — `bluebird_retention_mechanisms_v1.md` §2.5)에 정합한다.

## 1.3 기존 도구의 빈자리 — 4분면 분석

| 도구 | 무엇을 채우는가 | BlueBird 관점 빈자리 |
|---|---|---|
| 명상 (마보 등) | 마음을 가라앉힘 | 어떤 생각이 비틀렸는지 분석해주지 않음 |
| 코칭 (디스턴싱·트로스트·마인드카페) | 효과적이지만 비싸고 (월 8~10만원) 자주 만나기 어려움 | 자동화·저가 모델 부재 |
| 일기 (하루콩 등) | 기록을 쌓음 | 그 기록의 패턴을 보여주진 않음 |
| 챗봇 (Wysa·Woebot·Replika) | 위로함 | 내 사고가 어떻게 작동하는지 *구조*를 보여주진 않음 |
| 의료기기 DTx (솜즈·ANZELAX·Cogthera) | 의사 처방 기반 임상 효과 | 일반 웰니스 트랙 부재. 처방 진입 장벽 |
(출처: 온보딩 Act 1-3 + `bluebird_competitive_strategy_v1.md` §2)

> **내 사고가 어디서 어떻게 비틀렸는지를 *구조*로 보여주는 도구는 비어 있다.**
> (출처: 온보딩 슬라이드 Act 1-3 paragraph 5)

## 1.4 시장 빈자리 — 분석가형 자기이해 선호자

### 1.4.1 정의

분석가형 자기이해 선호자는 자기 자신을 *데이터·시스템·메커니즘*으로 보고 싶어 하는 사용자다. 이들은:

- 감정 언어("위로받기")보다 구조 언어("구조 보기")를 선호
- "회복이 필요한 사람"이라는 자기상을 거부하고 "최적화하려는 운영자"로 자기를 다룸
- MBTI·strengthsfinder·노션 정리·sheets 분류 등 *구조화 도구* 경험이 비례 이상
(출처: `coding-rubric-v1-2026-05-04.md` A1·A2 정합 sample)

### 1.4.2 점유 상태

조사한 한국 멘탈헬스 앱 (디스턴싱·하루콩·인사이드·마인들링·마보·마인드카페·트로스트·솜즈·ANZELAX) 어디에서도 분석가형을 *주 타겟*으로 명시한 곳은 없다. 디스턴싱이 가장 가까우나 톤이 "거리두기·치유" 영역으로 점유.
(출처: `bluebird_competitive_strategy_v1.md` §2~§3)

### 1.4.3 타겟 사이즈 가설

분석가형은 absolute 작은 niche가 아니라 한국 인지노동자 인구의 *비례 이상* 분포하는 세그먼트로 가설. 30대 직장인 번아웃 경험률 75.3% 중 일부, LinkedIn·Disquiet·Twitter 한국 dense 사용자 중 일부, 노션·sheets 정리 도구 사용자 중 일부의 합집합.
(측정 SOP는 sprint 2 정의 예정 — IM.1 30명 모집 결과 후 자발 언급 코딩으로 분포 시그널 잡기.)

---

# 2. 이론적 근거 — Theoretical Foundation

## 2.1 Cognitive Behavioral Therapy (Aaron Beck, 1976)

### 2.1.1 학술 출처

- Beck, A. T. (1976). *Cognitive therapy and the emotional disorders*. International Universities Press.
- Beck, A. T., Rush, A. J., Shaw, B. F., & Emery, G. (1979). *Cognitive Therapy of Depression*. Guilford Press.

### 2.1.2 인지 왜곡 5종 정의

본 도구는 Beck (1976)의 인지 왜곡 분류 중 한국 인지노동자 맥락에서 빈도 높은 5종을 채택한다:

#### (1) 파국화 (catastrophizing)

- **진단 룰**: 최악 시나리오를 단정하거나, "~하면 반드시 ~될 것이다"처럼 조건부 최악 결과를 확정적으로 예상한다. 발생 확률을 비정상적으로 높게 추정하거나, 결과가 수습 불가능할 것이라 믿는다.
- **감별 룰**: 사실적 걱정과의 구분 — 마감 임박 같은 실제 위기 상황이라도 "신뢰가 완전히 바닥날 것"처럼 결과를 회복 불가능한 파멸로 정의하면 파국화. 흑백논리와 구분 — 파국화는 단일 사건에서 장기 재앙으로 *시간적 확장*. 감정적 추론과 구분 — 파국화는 확률 추정이 왜곡되고, 감정적 추론은 감정을 사실 근거로 사용.
- **코드 위치**: `lib/ai/bluebird-protocol.ts:49~55` `BLUEBIRD_DISTORTION_TAXONOMY[CATASTROPHIZING]`
- **사례 (코드 인용 — `BLUEBIRD_FEW_SHOT_CASES[1]`)**: 트리거="팀 회의에서 내 제안이 바로 채택되지 않았다." 자동 사고="이번에 밀리면 나는 무능한 사람으로 낙인찍힐 거야." → 파국화 intensity 0.86, segment="무능한 사람으로 낙인찍힐 거야", rationale="단일 사건을 장기적 파멸로 확장한다."

#### (2) 흑백논리 (all_or_nothing)

- **진단 룰**: 중간 대안이나 완화 가능성을 제거하고 0 아니면 100의 이분법으로 상황을 해석한다.
- **감별 룰**: 성공과 실패 사이에 존재하는 수많은 부분적 성공의 레이어를 무시할 때 진단. 파국화와 구분 — 흑백논리는 스펙트럼을 이분화하며 중간 가능성을 배제. 개인화와 구분 — 흑백논리는 *결과 평가*의 이분화가 핵심이고, 개인화는 *원인 귀속*이 핵심.
- **코드 위치**: `lib/ai/bluebird-protocol.ts:56~62`
- **사례 (`BLUEBIRD_FEW_SHOT_CASES[3]`)**: 트리거="발표 중 한 슬라이드를 잠깐 버벅였다." 자동 사고="나는 발표를 망쳤고 완전히 실패했다." → 흑백논리 intensity 0.91, segment="완전히 실패했다."

#### (3) 감정적 추론 (emotional_reasoning)

- **진단 룰**: 현실의 객관적 증거보다 현재 느끼는 공포나 불안 자체를 사실의 증거로 삼는다. "무섭다"는 느낌이 "실제로 위험하다"는 결론으로 바로 이어지는 논리적 비약이 핵심.
- **감별 룰**: 파국화와 구분 — 감정적 추론은 "불안하니까 위험하다"처럼 감정이 증거. 임의적 추론과 구분 — 감정적 추론은 감정이 근거이고, 임의적 추론은 증거 부재에도 결론을 확정.
- **코드 위치**: `lib/ai/bluebird-protocol.ts:63~69`
- **사례 (`BLUEBIRD_FEW_SHOT_CASES[5]`)**: 트리거="몸이 긴장되고 불안한 느낌이 계속된다." 자동 사고="이렇게 불안한 걸 보니 곧 큰일이 날 거야." → 감정적 추론 intensity 0.88.

#### (4) 개인화 (personalization)

- **진단 룰**: 통제 불가능한 환경 변수나 타인의 반응을 오직 자신의 결함이나 책임으로 해석한다. 복합적 원인 중 개인의 몫을 100%로 설정하는 과도 귀속.
- **감별 룰**: 흑백논리와 구분 — 개인화는 *원인을 자신에게 과도하게 귀속*하는 것이 핵심. 임의적 추론과 구분 — 개인화는 "내 탓"이라는 귀속이 특징.
- **코드 위치**: `lib/ai/bluebird-protocol.ts:70~76`
- **사례 (`BLUEBIRD_FEW_SHOT_CASES[4]`)**: 트리거="상사가 일정 지연 이유를 물었다." 자동 사고="내가 부족해서 팀 전체가 손해를 본다." → 개인화 intensity 0.76, rationale="복합 원인을 개인 책임으로 과도 귀속한다."

#### (5) 임의적 추론 (arbitrary_inference)

- **진단 룰**: 충분한 근거 없이 타인의 마음을 읽거나(Mind Reading), 미래 결과를 부정적으로 예언한다(Fortune Telling). "그럴 수도 있다"가 아니라 "분명히 그럴 것이다"라고 결론을 선행 확정.
- **감별 룰**: 감정적 추론과 구분 — 임의적 추론은 감정과 무관하게 논리적 비약으로 결론을 확정. 개인화와 구분 — 임의적 추론은 타인/상황에 대한 결론도 포함.
- **코드 위치**: `lib/ai/bluebird-protocol.ts:77~84`
- **사례 (`BLUEBIRD_FEW_SHOT_CASES[2]`)**: 트리거="친구가 메시지 답장을 늦게 했다." 자동 사고="답장이 늦은 걸 보니 나를 싫어하는 게 분명해." → 임의적 추론 intensity 0.79.
- **한국어 우회 어미 케이스 (`BLUEBIRD_FEW_SHOT_CASES[6]`)**: 트리거="중요한 업무를 맡았는데 일정이 빠듯하고 복잡도가 높다." 자동 사고="내가 이걸 잘 해낼 수 있을지 모르겠고, 상사가 실망할까 두렵다." → 임의적 추론 2개 (intensity 0.68 / 0.55), rationale="관찰되지 않은 타인의 미래 부정 반응을 우회 어미('~할까 두렵다')로 단정한다. 한국어 점쟁이 오류 패턴이며, 어미가 비단정적이라도 결합된 결과의 부정성으로 왜곡으로 본다."

### 2.1.3 BlueBird 적용 매핑

- **DB enum CHECK** (`supabase/migrations/01_initial_schema.sql:18~26`):
  ```sql
  distortion_type TEXT CHECK (distortion_type IN (
    'catastrophizing', 'all_or_nothing', 'emotional_reasoning',
    'personalization', 'arbitrary_inference'
  ))
  ```
  (단 mig 12에 의해 NOT NULL 해제 — null-only row는 "왜곡 0건 분석" 스트릭 마커.)

- **Zod 검증** (`app/api/analyze/route.ts:16~26`): 클라이언트→서버 유효성, Gemini 응답이 5종 enum 외 값일 시 reject.

- **Gemini Structured Output Schema** (`lib/openai/gemini.ts:46~49`): `format: 'enum'` + `enum: [...5종]`로 강제.

- **운영 원칙** (`lib/ai/bluebird-protocol.ts:3~8` `BLUEBIRD_OPERATING_PRINCIPLES`):
  1. 데이터 우선: 주관적 고통을 수치/비교 가능한 데이터로 객관화한다.
  2. 감정 배제: 위로 대신 논리 무결성과 사고 검증을 제공한다.
  3. 자율성 지향: 정답 제시가 아니라 시스템2 기동 질문으로 자기 판단을 유도한다.
  4. 경직성 타파: 사실처럼 보이는 생각이라도 그것이 행동을 제약한다면 인지적 틈새를 찾아낸다.

- **archetype 매핑** (`lib/content/archetypes.ts`): 5종 왜곡 1:1 archetype.

## 2.2 Dual Process Theory (Daniel Kahneman, 2011)

### 2.2.1 학술 출처

- Kahneman, D. (2011). *Thinking, Fast and Slow*. Farrar, Straus and Giroux.
- 권장 발췌 챕터: Part 1 (Two Systems), Part 2 (Heuristics & Biases), Part 4 (Choices).
(`docs/research/README.md` 자료 2)

### 2.2.2 핵심 주장

| 시스템 | 특성 | 시간 척도 | 오류 가능성 |
|---|---|---|---|
| System 1 | 직관적·감정적·자동 | ≈ 10ms (0.01초) | 인지 왜곡 빈발 |
| System 2 | 논리적·분석적·노력 기반 | ≈ 3s (3초) | 왜곡 교정·대안 행동 설계 가능 |

### 2.2.3 BlueBird 적용

- **운영 메타포** (`lib/ai/bluebird-protocol.ts:11~18` `BLUEBIRD_THEORY_SUMMARY.dualProcess`):
  - system1: "직관적·감정적·자동 반응. 에너지 소모가 적고 인지 왜곡이 쉽게 발생한다."
  - system2: "논리적·분석적·노력 기반 사고. 왜곡 교정과 대안 행동 설계가 가능한 모드다."
  - interventionGoal: "Bluebird는 시스템1 오류를 데이터화하고 시스템2를 강제 기동하는 장치다."

- **온보딩 surface** (`lib/onboarding/slides.ts` Act 2-1):
  - "System 1은 0.01초 만에 떠오르는 자동 반응입니다. 빠르고 직관적이지만 실수가 많습니다."
  - "System 2는 3초쯤 시간을 들여 천천히 검증하는 모드입니다. 느리지만 정확합니다."
  - "디버깅이란 자동으로 떠오른 생각을 잠깐 멈추고 System 2로 다시 검토하는 일입니다."
  - caption: "Daniel Kahneman, 『생각에 관한 생각』(2011)"

- **분석 결과 시각화** — 분석 라우트(`/analyze/[id]`)는 자동 떠오른 사고(System 1)를 *분해*해 사용자에게 보여주고, 검증 라우트(`/action/[id]`)는 사용자에게 System 2 질문을 던진다.

- **`system2_question_seed` 필드** (`analysis` 테이블 컬럼 mig 02): Gemini가 사용자 사고에 맞춰 *System 2 기동 질문*을 1개 생성. 예시(`BLUEBIRD_FEW_SHOT_CASES[1]`): "회의 1회의 반응이 장기 평판으로 이어질 객관 확률은 몇 %인가?"

## 2.3 Prospect Theory (Kahneman & Tversky, 1979)

### 2.3.1 학술 출처

- Kahneman, D., & Tversky, A. (1979). Prospect Theory: An Analysis of Decision under Risk. *Econometrica*, 47(2), 263-291.
- PDF: `docs/research/sources/Kahneman_Tversky_1979_Prospect_theory.pdf` (11페이지)

### 2.3.2 핵심 명제 — 손실 가중치 λ ≈ 2.25

- **준거 의존성** (Reference Dependence): 절대값이 아니라 *개인 준거점 대비 이득/손실*로 판단. 비현실적 준거점은 불안 증폭.
- **손실 회피** (Loss Aversion): 동일한 크기의 이득보다 손실을 더 크게 지각. **2.25배 법칙** — 변화 회피 / 현상 유지 편향의 근거.
- **확률 가중치** (Probability Weighting): 낮은 확률은 과대평가(파국화), 높은 확률은 과소평가(무력감).
(`lib/ai/bluebird-protocol.ts:20~26` `BLUEBIRD_THEORY_SUMMARY.prospectTheory`)

### 2.3.3 BlueBird 적용

- **`loss_aversion_signal` 필드** (`analysis.loss_aversion_signal FLOAT CHECK 0~1`, mig 02): Gemini가 사용자 사고에서 손실 민감도를 0~1로 추정. 사례별 값: 마감 압박 케이스 0.92 / 발표 케이스 0.81 / 답장 지연 케이스 0.67 / 친구 케이스 0.77.
- **`frame_type` enum** (`analysis.frame_type IN ('loss', 'gain', 'mixed')`, mig 02): 사용자 사고가 어느 프레임으로 작동했는지 라벨.
- **`reference_point` 필드** (`analysis.reference_point TEXT`, mig 02): 사용자가 묵시적으로 가정한 *준거점*을 텍스트로 명시. 사례: "마감을 완벽히 지켜야만 신뢰가 유지된다는 경직된 기준" / "항상 즉시 인정받아야 한다는 기준" / "실수 0회 발표만 성공으로 간주하는 기준".
- **`probability_estimate` 필드** (`analysis.probability_estimate FLOAT 0~100`, mig 02): 사용자 사고가 *함축한* 확률(파국 발생 확률 등)을 Gemini가 0~100으로 추정. 사례: 마감 케이스 85, 발표 단편 65.
- **온보딩 surface** (`lib/onboarding/slides.ts` Act 2-3):
  - "인간은 같은 크기의 이득보다 손실에 약 2.25배 더 민감합니다."
  - "카너먼과 트버스키의 1979년 연구가 이 손실 민감도를 처음 측정했습니다."
  - caption: "Kahneman & Tversky (1979) · Adrian Wells (CAS 모델)"
- **매뉴얼 락인 메커니즘 근거** (`bluebird_retention_mechanisms_v1.md` §2.3): "사용자가 BlueBird를 떠나는 결정은 단순히 '이 앱을 안 쓴다'가 아니라 *내 자신에 대한 매뉴얼을 잃는다*가 된다. 손실 회피 효과로 인해, 동일 가치의 획득보다 손실이 약 2.25배 강하게 작용한다."

## 2.4 Metacognitive / CAS Model (Adrian Wells, 2009)

### 2.4.1 학술 출처

- Wells, A. (2009). *Metacognitive Therapy for Anxiety and Depression*. Guilford Press.
- Wells, A. (2000). *Emotional Disorders and Metacognition: Innovative Cognitive Therapy*. Wiley.

### 2.4.2 핵심 개념 — CAS (Cognitive Attentional Syndrome)

- **반추** (Rumination): 과거 사건에 대한 반복적 회상·분석. 우울 차원 신호.
- **걱정** (Worry): 미래 부정 결과에 대한 반복적 시뮬레이션. 불안 차원 신호.
- **메타 신념** (Metacognitive Beliefs): "걱정은 필요하다", "생각을 멈출 수 없다" — 약화 대상.
- **탈중심화** (Decentering): 생각을 *사실*이 아닌 *일시적 정신 이벤트*로 분리해 관찰하는 능력.
(`lib/ai/bluebird-protocol.ts:27~34` `BLUEBIRD_THEORY_SUMMARY.metacognition`)

### 2.4.3 BlueBird 적용

- **`cas_signal` 객체** (`analysis.cas_rumination FLOAT 0~1` + `analysis.cas_worry FLOAT 0~1`, mig 02): Gemini가 두 신호를 독립 추정.
- **사례별 값**:
  | 사례 | rumination | worry |
  |---|---|---|
  | 마감 압박 | 0.30 | 0.95 |
  | 회의 제안 | 0.62 | 0.78 |
  | 답장 지연 | 0.55 | 0.72 |
  | 발표 단편 | 0.82 | 0.58 |
  | 상사 질문 | 0.64 | 0.69 |
  | 신체 긴장 | 0.48 | 0.86 |
  | 한국어 우회 | 0.35 | 0.82 |

- **`decentering_prompt` 필드** (`analysis.decentering_prompt TEXT`, mig 02): Gemini가 사용자 사고에 맞춰 탈중심화 프롬프트 생성. 사례: "'신뢰가 바닥난다'는 문장을 사실이 아닌 '지금 내 뇌가 보내는 경고 신호'로 재정의하라."
- **온보딩 surface** (`lib/onboarding/slides.ts` Act 2-3): "심리학자 에이드리언 웰스는 반추와 걱정이 측정 가능한 신호라는 걸 보였습니다."

## 2.5 Cognitive Biases — Heuer (1999)

### 2.5.1 학술 출처

- Heuer, R. J. Jr. (1999). *Psychology of Intelligence Analysis*. Center for the Study of Intelligence, CIA.
- PDF: `docs/research/sources/Psychology_of_Intelligence_Analysis.pdf`

### 2.5.2 BlueBird 정합 — 분석가 톤의 학술 근거

Heuer는 정보분석가가 자신의 인지 편향을 *체계적으로 점검*하는 방법론(가설 경쟁 분석 ACH 등)을 제시했다. 이는 BlueBird의 "분석가 톤" 차별화 축의 학술 근거다 — 사용자가 *자기 자신의 분석가*가 되어 자기 사고를 가설로 다루도록 유도.

### 2.5.3 활용 정책

`docs/research/README.md` 활용 정책에 따라 *60일 게이트(G2) 통과 후* 분석가 톤 인식 ≥40% 시 활용:
- prompt §Distortion Reporting Threshold 강화
- ACH(Analysis of Competing Hypotheses) 룰 도입

베타 단계는 "분석가 톤"이 *학술 정합성*을 가진다는 사실만 surface (positioning §5).

## 2.6 실존주의 — Camus (1942)

### 2.6.1 학술 출처

- Camus, A. (1942). *Le Mythe de Sisyphe*. Gallimard.
- 영문: *The Myth of Sisyphus*. PDF: `docs/research/sources/Myth of Sisyphus.pdf` (129페이지)
- 권장 발췌: An Absurd Reasoning, The Myth of Sisyphus 본문.

### 2.6.2 BlueBird 미션과의 정합

> "당신을 치료하는 것이 아닙니다. 당신이 자신을 더 정확하게 보고 *스스로 운영*하도록 돕는 것이 알베르 카뮈가 말한 *자율성의 회복*입니다."
(출처: 온보딩 슬라이드 `lib/onboarding/slides.ts` Act 3-3 paragraph 5 + caption: "Albert Camus, 『시지프 신화』(1942) — 자율성 회복")

### 2.6.3 운영 원칙 정합

`BLUEBIRD_OPERATING_PRINCIPLES` 3번 — "자율성 지향: 정답 제시가 아니라 시스템2 기동 질문으로 자기 판단을 유도한다."는 Camus의 부조리·자유·반항(absurde·liberté·révolte) 도식의 응용. *외부 사건과 별개로 반응/선택은 개인의 자유와 책임*이라는 명제(`BLUEBIRD_THEORY_SUMMARY.agency.existentialResponsibility`)는 본 도구가 사용자에게 *답*을 주지 않고 *자기 판단*을 유도하는 이유.

## 2.7 자기결정성 이론 — Deci & Ryan (2000)

### 2.7.1 학술 출처

- Deci, E. L., & Ryan, R. M. (2000). *The "What" and "Why" of Goal Pursuits: Human Needs and the Self-Determination of Behavior.* Psychological Inquiry, 11(4), 227–268.
- 보충: Ryan, R. M., & Deci, E. L. (2017). *Self-Determination Theory: Basic Psychological Needs in Motivation, Development, and Wellness.* Guilford Press.

### 2.7.2 핵심 명제 — 3대 기본 욕구

SDT는 인간 동기를 외재적(external regulation) ↔ 내재적(intrinsic motivation) 스펙트럼으로 모델링하며, 자율적 동기(autonomous motivation)를 강화하기 위한 3대 기본 심리욕구를 제안:

1. **Autonomy (자율성)** — 자기 의지로 행동을 *개시*하고 *표현*함. (BlueBird 직접 측정 대상)
2. **Competence (유능성)** — 환경과 효과적으로 상호작용한다는 감각.
3. **Relatedness (관계성)** — 타인과 의미 있게 연결되어 있다는 감각.

### 2.7.3 BlueBird 적용

본 도구의 미션이 §2.6 Camus의 *자율성 회복*임을 감안하면, "사용자가 얼마나 자율적으로 디버깅 사이클을 통과했는가"를 측정하는 단일 지표가 필요하다. 이것이 `autonomy_score` (§4.2.2)다.

- **autonomy 측정 매핑** (autonomy_score v2):
  - 자기 의지의 개시(initiation) ↔ `answerCount` (소크라테스 질문에 직접 답한 횟수)
  - 자기 표현(expression) ↔ `completion_note` 작성 여부
- **competence·relatedness는 측정 X** — relatedness는 1인 도구라는 카테고리 정의(§3.1.1)와 충돌, competence는 자칫 "유능감 부여"식 게임화로 미끄러질 위험. 따라서 SDT 3대 욕구 중 *autonomy만* 측정.
- **AI 추정값과의 분리**: v1(2026-04)에서는 `averageIntensity`(AI가 추정한 왜곡 강도) 가중치를 점수에 포함했으나, AI 출력값이 점수에 *영향을 끼치는* 구조는 SDT autonomy 정의(=사용자 자기 행위)와 충돌하므로 v2(2026-05-04)에서 제거. 점수는 *오직 사용자 자기 행위*에서만 누적된다.

---

# 3. 솔루션 — Product

## 3.1 카테고리 정의

### 3.1.1 우리는 *맞는* 것

- **인지 왜곡 디버깅 도구** (Cognitive Distortion Debugging Engine)
- **자가 인지 코칭** (도구 + 측정 + 패턴 누적)
- **분석가형 자기이해 선호자**의 1번 도구
- **일반 웰니스** (의료기기 X)
(출처: `docs/strategy/positioning-and-vision-v1.md` §1)

### 3.1.2 우리는 *아닌* 것 (5종)

| 우리는 *아닌* 것 | 점유자 |
|---|---|
| 스트레스 관리 앱 | 디스턴싱·하루콩·인사이드 |
| 명상·힐링 | 마보 |
| 인간 코치 매칭 | 디스턴싱·트로스트·마인드카페 |
| 의료기기·DTx | 솜즈·ANZELAX·Cogthera (식약처 트랙) |
| 정서 챗봇 | Wysa·Woebot (글로벌, 한국어 미진입) |
(출처: `docs/strategy/positioning-and-vision-v1.md` §1)

### 3.1.3 미션·비전

- **미션 (단기 — 90일)**: 한국 인지노동자가 *자기 사고를 더 정확하게 보는* 1번 도구가 된다. 디스턴싱이 점유하지 않은 분석가 세그먼트에서 PMF 시그널 확보.
- **비전 (중기 — 12~24개월)**: "한국어 인지 디버깅"이라는 *카테고리 자체를 창출*. 글로벌 AI 챗봇(Wysa·Woebot) 한국어 진입 시도에도 한국 직장 문화·체면·자기낙인 맥락은 단기간 따라잡기 어렵게 락인.
- **비전 (장기)**: 분석적 항해사 정체성을 가진 사용자가 *자기 자신을 디버깅*하고 *자율성을 회복*하는 도구. 치료가 아닌 *자기 운영*.
(출처: `docs/strategy/positioning-and-vision-v1.md` §6)

## 3.2 4단계 회로

### 3.2.1 흐름

```
① 기록 (/log)
  → ② 분석 (/analyze/[id])
    → ③ 검증 (/action/[id] — 소크라테스식 질문 + 행동 설계)
      → ④ 재평가 (/review/[id] — 24h 후 Δpain 측정)
```
(출처: 온보딩 슬라이드 Act 3-1)

### 3.2.2 단계별 상세

#### ① 기록 — `/log` (POST 시 `logs` row INSERT)

- **입력**: 트리거(자유 텍스트, 1자~`MAX_AI_TEXT_LENGTH`), 자동 사고(자유 텍스트), pain_score(0~10 INT — NRS-11)
- **DB**: `logs.trigger TEXT NOT NULL` + `logs.thought TEXT NOT NULL` + `logs.pain_score INT CHECK 0~10` (mig 04 → 13) + `logs.log_type TEXT IN ('normal','success')` (mig 12)
- **RLS**: 본인 row만 INSERT (`auth.uid() = user_id`)

#### ② 분석 — `/analyze/[id]` (POST `/api/analyze`)

- **입력**: logId (UUID)
- **처리** (`app/api/analyze/route.ts`):
  1. 분당 한도 체크 (5건 / 60초 — line 79)
  2. 위기 감지 (`detect()` keyword + LLM — line 115)
  3. 캐시 조회 (`analysis` 기존 row — line 152)
  4. 일별 한도 체크 (5건 / KST 자정 기준 — line 220) — 사유: "하루 5번까지 기록할 수 있어요. 너무 자주 분석하면 오히려 *반추*가 깊어질 수 있어 한도를 두고 있어요." (line 224~226)
  5. Gemini 분석 (`analyzeDistortionsWithGemini` — line 245)
  6. Zod 검증 (`analysisPayloadSchema.parse` — line 258)
  7. 기존 row 삭제 후 재삽입 (line 261, 297)
  8. trigger_category UPDATE (line 320)
  9. user_patterns INSERT (best-effort — line 348)
- **출력 DB**: `analysis` 테이블 — distortion_type, intensity, logic_error_segment, rationale, frame_type, reference_point, probability_estimate, loss_aversion_signal, cas_rumination, cas_worry, system2_question_seed, decentering_prompt
- **자동 fallback**: `distortions=[]`일 때 distortion_type=null placeholder INSERT (스트릭 적립용 — line 268)

#### ③ 검증 — `/action/[id]` (POST `/api/action`)

- **사용자 입력**: socratic_questions에 대한 user_answers (JSONB), final_action(자유 텍스트 ≤500), completion_note(≤200), completion_reaction enum('improved','same','worse') (mig 12)
- **autonomy_score 산출** v2 (`app/api/action/route.ts:107~133`):
  ```ts
  const answerCount = Object.keys(intervention?.user_answers ?? {}).filter(
    (key) => Boolean(intervention?.user_answers?.[key])
  ).length;
  const noteBonus = completionNote.length > 0 ? AUTONOMY_NOTE_BONUS : 0;
  actionPayload.autonomy_score = calcAutonomyScore({ answerCount }) + noteBonus;
  ```
  → §4.2.2 산식·SDT 이론 근거 참조. v1의 `averageIntensity` 가중치는 제거 (AI 추정값 ↔ 사용자 자율성 결합 해소).
- **DB**: `intervention.user_answers JSONB`, `intervention.final_action TEXT`, `intervention.is_completed BOOLEAN`, `intervention.autonomy_score INTEGER ≥ 0`, `intervention.completed_at TIMESTAMPTZ` (자동 트리거 — mig 01 line 152)

#### ④ 재평가 — `/review/[id]` (POST `/api/review/pain-score`)

- **시점**: 완료 후 6~48h (mig 05 코멘트)
- **입력**: reevaluated_pain_score (INT 0~10 — NRS-11)
- **DB**: `intervention.reevaluated_pain_score INT CHECK 0~10` + `intervention.reevaluated_at TIMESTAMPTZ` (mig 05 → 13)
- **Δpain 산출**: `pain_score - reevaluated_pain_score` (양수 = 효과)
- **카드 dismiss**: `intervention.review_dismissed_at TIMESTAMPTZ` (X 클릭 시 영구 해제)
- **인덱스 최적화** (`mig 05`): `idx_intervention_pending_review ON intervention(completed_at DESC) WHERE is_completed = TRUE AND reevaluated_pain_score IS NULL AND review_dismissed_at IS NULL`

## 3.3 차별화 3축 (vs 디스턴싱)

(출처: `docs/strategy/positioning-and-vision-v1.md` §4 + `bluebird_competitive_strategy_v1.md` §3.2 / §4)

### 3.3.1 톤·자기상·메타포 표

| 축 | 디스턴싱 | BlueBird |
|---|---|---|
| **톤** | 정서적·치유적 ("따뜻한 봄날", "외롭지 않게") | 분석적·구조적 ("분석가 정밀함", "구조 가시화") |
| **사용자 자기상** | "회복이 필요한 사람" | "최적화하려는 운영자" |
| **개입 방식** | 인간 코치 매칭 + 활동지 + 피드백 | 자동화된 구조 가시화 + 반증 질문 + 행동→재평가 회로 |
| **시간 모델** | 3개월 권장 (체화 중심) | 90일 검증 (가설 falsifiability 중심) |
| **신체 데이터** | 다루지 않음 | 신체화-인지 매핑 (보류 — `bluebird_competitive_strategy_v1.md` §4 축 2) |
| **가격 가설** | 월 8~10만원 (코치 인건비 포함) | 월 1.9~3.9만원 (자동화) — 인터뷰 후 결정 |
| **메타포** | 거리두기·치유·동반 | 디버깅·OS 최적화·항해 (분석적 의미) |

### 3.3.2 가격 가설 (보류 항목 — PMF plan §11.3)

월 19,000~39,000원대. 디스턴싱의 1/3~1/2.
- **트리거**: 인터뷰 결제 의향 분포가 1.9~3.9만 구간에 자연 수렴 시 가설 채택. 사전 박지 않음.
- **리스크**: 인간 코치가 주는 "지속적 격려·완주 지원" 효과를 자동화로 어떻게 대체할 것인가 — 90일 검증 핵심 가설 중 하나.
(출처: `bluebird_competitive_strategy_v1.md` §4.3)

### 3.3.3 카피 가드 (분석가 톤 유지)

- **사용 권장**: "구조", "패턴", "기록·관찰", "데이터", "프레임", "디버깅", "가시화"
- **사용 제한**: "치유", "위로", "마음", "공감", "함께"
- **메타포 권장**: 시스템 운영, 디버깅, 데이터 분석, 항해(분석적 의미)
- **메타포 회피**: 자연·계절·동물 메타포
- **참조 미감**: 노션, 리니어, 피그마, 메트릭스 대시보드, 아카이브적 디자인.
- **회피 미감**: 명상 앱, 일기 앱, 라이프스타일 콘텐츠.
(출처: `bluebird_competitive_strategy_v1.md` §4.1 / §6.2)

---

# 4. 서비스 내 개념·지표 — Definitions & Formulas

## 4.1 핵심 개념

### 4.1.1 자동 사고 (Automatic Thoughts)

- **정의**: 사용자가 트리거 자극에 대해 *의식하지 못한 채* 떠올린 즉시 반응 사고. CBT의 핵심 진단 단위.
- **DB 필드**: `logs.thought TEXT NOT NULL` (mig 01)
- **수집 UI**: `/log` 페이지 — 자유 텍스트 입력
- **분석 입력**: `/api/analyze` POST에서 trigger + thought 결합 후 Gemini 분석.

### 4.1.2 인지 왜곡 5종

§2.1.2에서 정의. DB enum CHECK은 `analysis.distortion_type IN ('catastrophizing', 'all_or_nothing', 'emotional_reasoning', 'personalization', 'arbitrary_inference')`.

### 4.1.3 트리거 카테고리 (8종)

- **enum**: `'work' | 'relationship' | 'family' | 'health' | 'self' | 'finance' | 'study' | 'other'`
- **DB 필드**: `logs.trigger_category TEXT CHECK (...)` (mig 06)
- **인덱스**: `idx_logs_user_category ON logs(user_id, trigger_category) WHERE trigger_category IS NOT NULL` (mig 06)
- **분류 방식**: Gemini 분석 시점에 `trigger_category` enum 자동 라벨링 (`lib/openai/gemini.ts:71~75` Schema에 enum 박힘) → `app/api/analyze/route.ts:319~330` UPDATE.
- **활용**: 패턴 리포트 (`lib/insights/pattern-report.ts`) — "직장 × 파국화 5회, 관계 × 임의적 추론 평균 +2.3점 효과" 같은 결제 가설 A 직접 강화 문장.

### 4.1.4 고통 (pain_score)

- **정의**: 사용자가 자동 사고 직후 매기는 *주관적 고통 강도*. CBT 임상에서 SUDS(Subjective Units of Distress Scale)·NRS-11(Numeric Rating Scale)의 한국어 적응.
- **이론적 근거 — NRS-11 (Hawker et al., 2011)**:
  > Hawker, G. A., Mian, S., Kendzerska, T., & French, M. (2011). *Measures of adult pain.* Arthritis Care & Research, 63(S11), S240–S252.
  - 0(전혀 없음) ~ 10(참을 수 없는) 정수 척도. 본 학술 출처는 *신체 통증* 자기보고 측정의 임상 표준이며, BlueBird는 이를 *심리적 고통(distress)* 측정에 한국어로 적응. 코드·DB 컬럼명은 학술 정합 유지(`pain_score`), 사용자 surface 라벨은 senior-ux-researcher 검토 결과(2026-05-04) "고통"으로 통일 — "통증(痛症)"의 신체 통증 의미 누수 해소.
  - 5점 척도 대비 해상도가 2배 이상 → Δpain (전·후 차이) 계산에서 유의한 변화 포착력 향상.
- **범위**: **0~10 INT** (코드 정합 — mig 13 `pain_score IS NULL OR (pain_score BETWEEN 0 AND 10)`. 2026-04 mig 04에서 1~5로 출발 → 2026-05-04 mig 13에서 NRS-11 정렬을 위해 0~10으로 확장).
- **DB 필드**: `logs.pain_score INT CHECK NULL OR 0~10` (mig 04 + mig 13)
- **수집 UI**: `/log` 페이지 — 0~10 정수 버튼 그리드 + anchor 라벨 ("0 · 전혀 없음" / "10 · 참을 수 없는"). 선택값에 따라 5구간 밴드 라벨 표시(거의 없음·약간·보통·심함·극심) — 정수 척도의 직관적 해석 보조.
- **CHECK 위반 가드**: NOT NULL 비강제 — 첫 분석 케이스에서 미입력 허용.

### 4.1.5 분석 결과 (Analysis Result)

`analysis` 테이블 1행 단위 (왜곡 1종당 1행). 1 log → N analysis (1 트리거에 여러 왜곡 동시 작동 가능). 컬럼:

| 컬럼 | 타입 | 의미 |
|---|---|---|
| log_id | UUID FK | 부모 logs row |
| distortion_type | enum (5종) NULL 허용 | 왜곡 종류. NULL = 0건 스트릭 마커 (mig 12) |
| intensity | FLOAT 0~1 | Gemini 강도 추정 |
| logic_error_segment | TEXT | 왜곡 발생 *원문 segment* |
| rationale | TEXT | 왜곡 판단 근거 (mig 02) |
| frame_type | enum 'loss'\|'gain'\|'mixed' | 손실·이득 프레임 (mig 02) |
| reference_point | TEXT | 묵시적 준거점 (mig 02) |
| probability_estimate | FLOAT 0~100 | 함축 확률 추정 (mig 02) |
| loss_aversion_signal | FLOAT 0~1 | 손실 민감도 (mig 02) |
| cas_rumination | FLOAT 0~1 | 반추 신호 (mig 02) |
| cas_worry | FLOAT 0~1 | 걱정 신호 (mig 02) |
| system2_question_seed | TEXT | System 2 기동 질문 (mig 02) |
| decentering_prompt | TEXT | 탈중심화 프롬프트 (mig 02) |

## 4.2 지표·산식

### 4.2.1 고통 변화량 (Δpain)

- **이론적 근거 — Beck CBT 효과 측정 (1976)**:
  CBT는 사고·행동 개입의 효과를 *전·후 자기보고 distress 점수의 차이*로 정량화한다 (Beck, 1976; Beck Institute clinical protocols). 본 지표는 그 임상 측정 패러다임을 사용자 친화적으로 단순화한 것.
- **산식**:
  ```
  Δpain = pain_score(initial) - reevaluated_pain_score
  ```
  양수 = 고통 감소 (= 효과 있음). Δ 표기는 변화량(delta)의 표준 수학 기호.
- **산식 구성 절차**:
  1. *사전 측정*: `/log` 단계 3에서 사용자가 NRS-11 (0~10) 자기보고
  2. *개입*: `/analyze` → `/action` (소크라테스 질문 → 행동 약속) 사이클 실행
  3. *유예 시점*: 행동 완료 후 6~48h 윈도우(임상 권장 24h 중심)에 재평가 카드 노출
  4. *사후 측정*: 동일 NRS-11 (0~10)으로 재평가
  5. *차이 계산*: `lib/review/delta-pain.ts` `calcDeltaPain(initial, reevaluated)`
- **입력 데이터**:
  - `logs.pain_score` (INT 0~10, mig 04 + mig 13) — 사고 직후
  - `intervention.reevaluated_pain_score` (INT 0~10, mig 05 + mig 13) — 6~48h 후
- **측정 시점**: `intervention.is_completed = TRUE` AND `reevaluated_pain_score IS NULL` AND `review_dismissed_at IS NULL` 조건 충족 시 재평가 카드 노출 (mig 05 인덱스 `idx_intervention_pending_review`).
- **코드 위치**: `lib/review/delta-pain.ts` (CPO 권한 외 — 여기서는 dashboard 계산 함수 `sumPositiveDeltaPain` 사용. 양수만 합산하는 변형 — "줄어든 고통" 카드용. 음수는 *고통 증가* 신호로 Insights 시계열에선 정직하게 표시하지만 dashboard 카드에 합산하지 않음).
- **임계·해석**:
  - 양수 누적 평균 = 사용자가 효과 보고 있음 (PMF plan §6 월별 메트릭 "평균 Δpain")
  - 0 또는 음수 = 효과 미관찰 → 분석 품질·재평가 시점 점검 트리거
- **온보딩 surface** (Act 3-2 paragraph 3): "고통이 8에서 3으로 줄었다면 5만큼 줄어든 것입니다." — 코드(0~10)·카피·온보딩 슬라이드 모두 mig 13 + 라벨 통일(2026-05-04) 이후 정합.

### 4.2.2 자율성 지수 (autonomy_score)

- **이론적 근거 — 자기결정성 이론 (Deci & Ryan, 2000)**: §2.7 참조.
  - SDT의 autonomy 차원 = "자기 의지로 행동을 *개시*하고 *표현*함"
  - autonomy 측정 매핑: (1) 개시 = `answerCount` (자기 검증 답변 횟수) / (2) 표현 = `completion_note` (자기 노트 작성 여부)
  - SDT 3대 욕구 중 *autonomy만* 측정. competence·relatedness는 의도적 비측정 (§2.7.3 참조).
- **정의**: 사용자가 1회 디버깅 사이클에서 *자기 의지로 행한 행위*의 누적량. 게임화 카운터 아님 — *오직 사용자 자기 행위*만 점수화.
- **산식 v2** (2026-05-04~ , `lib/intervention/autonomy-score.ts` + `app/api/action/route.ts:107~133`):
  ```ts
  // 답변 가산 — 1답 = 5점, 최대 3답까지 인정
  AUTONOMY_ANSWER_UNIT = 5
  AUTONOMY_ANSWER_CAP = 15  // = 3 × 5
  answerBonus = min(15, max(0, answerCount) × 5)

  // 노트 가산 — 단발 보너스
  AUTONOMY_NOTE_BONUS = 15
  noteBonus = (completionNote.length > 0) ? 15 : 0

  // 최종
  AUTONOMY_MAX = 30
  autonomy_score = answerBonus + noteBonus  // 0~30
  ```
- **산식 구성 절차**:
  1. *측정 대상 식별*: SDT autonomy = 자기 의지의 *개시* + *표현*
  2. *개시(initiation) 입력*: 소크라테스 질문에 직접 답한 횟수(answerCount). 1답 = 5점 부여 → 가산 가시성 확보.
  3. *cap 설정*: 답변 4번째부터는 한계효용 체감 + 시간 비용 반영해 3답에서 cap (= 15점). 학술적 정수 아닌 운용 합의(CPO·CSO 2026-05-04).
  4. *표현(expression) 입력*: 완료 노트(자기 1줄 회고) 작성 시 단발 +15점. 작성 *행위*만 카운트하고 텍스트 길이·내용엔 가중치 없음 — 자기 표현의 *발생* 자체가 측정 대상.
  5. *합산*: 0~30점 정수.
- **v1 → v2 변경 사유** (2026-05-04, `lib/intervention/autonomy-score.ts` 헤더 코멘트 인용):
  - v1 (∼2026-04): `base 10 + averageIntensity × 5 + min(3, answerCount) + (note ? 15 : 0)`
  - 문제: `averageIntensity`는 *AI 모델*이 추정한 왜곡 강도(0~1)다. 사용자가 자율적으로 행사한 행동량이 아니라 AI 출력값에 가중치를 주는 셈이라, "자율성 행사 정도"라는 의미와 정합되지 않았다. AI 모델 변경(예: 프롬프트 개선)만으로 점수가 출렁이는 *원치 않는 결합도* 발생.
  - v2 결정 (CPO + CSO 합의 2026-05-04): SDT autonomy 정의에 정확히 일치하도록 `averageIntensity` 항을 *제거*하고, 입력을 (1) `answerCount` (2) `completion_note` 두 사용자 행위로 한정. AI 추정값과의 *결합도 0*.
- **입력 데이터**:
  - `answerCount`: socratic_questions에 대해 사용자가 user_answers JSONB에 채운 항목 수
  - `completionNote`: `intervention.completion_note TEXT ≤ 200` (mig 12) — 사용자가 행동 후 1줄 회고
- **측정 시점**: `/action/[id]` 완료 시점 (`POST /api/action` `markCompleted=true` 분기)
- **코드 위치**: `lib/intervention/autonomy-score.ts` + `app/api/action/route.ts:107~133`
- **DB 저장**: `intervention.autonomy_score INTEGER CHECK ≥ 0` (mig 01). 누적 점수는 사용자별 *모든 intervention*의 합으로 dashboard·me·insights 페이지에서 surface.
- **사용자 노출 카피** (`InfoTooltip` 4 페이지 일관 — 2026-05-04 갱신):
  > "자기 검증 답변·자기 노트 작성으로 자율성을 행사한 정도. (Deci & Ryan, 2000 자기결정성 이론 autonomy 차원 측정)"
- **임계·해석**: 학술 근거가 SDT로 정렬됨에 따라 v1의 PMF plan §11.3 *학술 근거 없는 게임화* 보류 사유는 해소. 단 인터뷰 *해석* 답변에서 모호함·불신 ≥ 20% 시 → 산식 투명화·SDT 인용 surface 보강 트리거는 유지.

### 4.2.3 강도 (intensity)

- **이론적 근거**: Beck CBT 인지 왜곡 모델은 왜곡의 *유무*뿐 아니라 *강도*를 임상가가 평가한다 — 본 도구에서는 그 평가를 LLM(Gemini)이 대행. few-shot 학습 사례(`BLUEBIRD_FEW_SHOT_CASES`)는 Beck 임상 사례집의 한국어 적응.
- **정의**: 1개 왜곡 인스턴스의 *Gemini 추정 강도* — "이 segment에서 이 왜곡이 얼마나 강하게 작동했는가".
- **범위**: 0~1 FLOAT (`analysis.intensity FLOAT CHECK 0~1`, mig 01)
- **산출**: Gemini Structured Output (`lib/openai/gemini.ts:46~49` schema). few-shot 정합 (`BLUEBIRD_FEW_SHOT_CASES`).
- **활용**:
  - ~~autonomy_score 입력 (averageIntensity)~~ — v2에서 제거 (§4.2.2). AI 추정값이 사용자 자율성 점수에 결합되는 구조 해소.
  - archetype 매칭 (분포 카운트 — §4.2.10)
  - 패턴 리포트 정렬 (high intensity 우선 surface)

### 4.2.4 손실 가중치 (λ)

- **정의**: Kahneman & Tversky (1979) 손실 회피 계수. *동일 크기 이득 대비 손실 가중치*.
- **수치**: λ ≈ 2.25 (학술 정수 — `BLUEBIRD_THEORY_SUMMARY.prospectTheory.lossAversion` "(2.25배 법칙)")
- **BlueBird 적용**: 사용자별 추정 X — 학술 *상수*로 인용. 매뉴얼 락인 메커니즘 근거(`bluebird_retention_mechanisms_v1.md` §2.3) 및 온보딩 Act 2-3 surface.

### 4.2.5 loss_aversion_signal

- **정의**: 사용자 *해당 사고 1건의* 손실 민감도. λ 학술 상수와 다름 — 사용자별·사고별 가변값.
- **범위**: 0~1 FLOAT (`analysis.loss_aversion_signal FLOAT CHECK 0~1`, mig 02)
- **산출**: Gemini 추정 (`BLUEBIRD_FEW_SHOT_CASES` 학습). 사례별 0.67~0.92.
- **활용**: pattern-report 보강 신호 (`lib/insights/pattern-report.ts`).

### 4.2.6 CAS 신호 (rumination · worry)

- **정의**: §2.4 — 반추(과거 회상) / 걱정(미래 시뮬레이션) 강도.
- **범위**: 각 0~1 FLOAT (`analysis.cas_rumination` + `analysis.cas_worry`, mig 02)
- **산출**: Gemini 추정 — 두 신호 *독립*.
- **활용**: 패턴 분석 보조. 본질 위협 가드 — 분석 한도(일 5건) 사유로 surface ("너무 자주 분석하면 오히려 *반추*가 깊어질 수 있어 한도를 두고 있어요" — `app/api/analyze/route.ts:226`)

### 4.2.7 AI 신뢰구간 (frame_type · probability_estimate)

- **frame_type**: 'loss' | 'gain' | 'mixed' enum — 사용자 사고가 작동한 *프레임*. (`analysis.frame_type CHECK`, mig 02)
- **probability_estimate**: 0~100 FLOAT — 사용자 사고가 *함축한 확률*. (`analysis.probability_estimate FLOAT`, mig 02)
- **산출**: Gemini 추정. NULL 허용 (`probability_estimate FLOAT` — NOT NULL 강제 안함).
- **활용**: System 2 질문 seed의 정량 입력 — "이 판단을 지지/반박하는 근거 비율은 각각 몇 %인가요?" 같은 정밀 질문 생성.

### 4.2.8 기록 빈도 한도

- **분당 한도**: 5건/60초 (`app/api/analyze/route.ts:79`):
  ```ts
  if ((recentAnalyses?.length ?? 0) >= 5) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', retryAfterSec: 60 },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  ```
- **일별 한도**: 5건/일 (KST 자정 기준, `app/api/analyze/route.ts:201~231`)
- **사유 카피**: "하루 5번까지 기록할 수 있어요. 너무 자주 분석하면 오히려 *반추*가 깊어질 수 있어 한도를 두고 있어요. 내일 다시 만나요." (line 224~226)
- **임계 근거**: CBT 임상 권장 3~5회/일 + §2.4 CAS 반추 증폭 회피 + 비용 통제.
- **재분석 예외**: 같은 log 재분석은 1회로 카운트 (log_id Set 중복 제거 — line 213, 217).

### 4.2.9 재평가 시점

- **정의**: 사용자가 디버깅 행동 완료 후, *24시간 후* 재평가 카드 노출.
- **실제 윈도우**: 6~48h (mig 05 코멘트 — "사용자가 완료 후 6-48h 시점에 다시 매긴 pain score").
- **DB 인덱스**: `idx_intervention_pending_review ON intervention(completed_at DESC) WHERE is_completed = TRUE AND reevaluated_pain_score IS NULL AND review_dismissed_at IS NULL` (mig 05)
- **dismiss**: `review_dismissed_at TIMESTAMPTZ` — X 클릭 시 영구 해제 (이후 카드 안 뜸).
- **API**: `POST /api/review/pain-score` (`reevaluated_pain_score` UPDATE) + `POST /api/review/dismiss` (`review_dismissed_at` UPDATE).

### 4.2.10 archetype 매칭

- **이론적 근거 — Beck 인지 왜곡 분류 (1976)**:
  Beck의 인지 왜곡 5종 분류(catastrophizing·all_or_nothing·emotional_reasoning·personalization·arbitrary_inference)는 본 도구가 채택한 분류 체계(§2.1.2). 한 개인의 *누적된* 자동 사고 데이터에서 가장 빈번하게 작동하는 왜곡 유형을 도출하면, 그 사람의 *지배적 인지 패턴*에 대한 가설로 기능한다 (Beck Institute clinical formulation 모델 응용).
- **산식 구성 절차**:
  1. *분류 체계 채택*: Beck 5종을 enum으로 코드화 (`lib/ai/bluebird-protocol.ts`)
  2. *누적 카운트*: 사용자 모든 analysis row의 distortion_type 빈도 집계 (NULL = 0건 스트릭 마커 제외)
  3. *1위 매핑*: 빈도 1위 distortion_type → 5종 archetype 중 1개 1:1 대응
  4. *사이클 갱신*: 5건 분석마다 재계산 — `progressInCycle = totalCount % 5`. 5라는 cap은 Beck 5종 균형(분포 1라운드 = 5건)에서 왔지만 학술 정수 아닌 운용 합의.
- **정의**: 사용자의 누적 분석 결과에서 *가장 빈번한 왜곡 1종*을 archetype으로 매핑. 5종 archetype 1:1 대응 (`lib/content/archetypes.ts`).
- **산식** (`lib/utils/archetype.ts:42~67` `getArchetypeResult`):
  ```ts
  // 1. 왜곡별 카운트 집계 (NULL = 0건 스트릭 마커 제외)
  // 2. 1위 distortion_type 식별
  // 3. ARCHETYPES[topType] 반환
  // 4. progressInCycle = totalCount % 5
  // 5. untilNextUpdate = (progressInCycle === 0) ? 0 : 5 - progressInCycle
  // 6. isJustUpdated = (progressInCycle === 0)
  ```
- **NULL row 제외** (`lib/utils/archetype.ts:23~25`):
  ```ts
  const realRows = rows.filter(
    (r): r is { distortion_type: string } => r.distortion_type != null
  );
  ```
- **5종 archetype** (`lib/content/archetypes.ts`):
  | 왜곡 | 이름 | 태그라인 |
  |---|---|---|
  | catastrophizing | 파국화형 시나리오 구축가 | 최악을 먼저 계산하는 손실 추정자 |
  | all_or_nothing | 완벽주의 이분법자 | 중간 지대를 허용하지 않는 기준 설계자 |
  | emotional_reasoning | 감정 기반 항법사 | 느낌을 사실로 번역하는 내면 탐험가 |
  | personalization | 책임 과잉 수집가 | 모든 원인을 자신에게서 찾는 귀인 추적자 |
  | arbitrary_inference | 결론 선행 사고가 | 증거보다 결론이 먼저인 직관의 소유자 |
- **사이클 5건**: 사용자가 5건 분석할 때마다 archetype 재계산 — `progressInCycle = totalCount % 5` (line 62~64).
- **dashboard·insights 단일 진입점** (`lib/utils/archetype.ts:18~20` 코멘트): "이 함수는 dashboard·insights 두 페이지가 같은 입력으로 archetype을 계산하도록 유일한 진입점이 된다."

### 4.2.11 N≥50 표본 가드

- **이론적 근거 — 정규근사 임계 (Central Limit Theorem 운용 임계)**:
  통계학의 일반적 운용 규칙으로 N ≥ 30 부근에서 표본 분포가 정규분포에 충분히 근사한다 (Cochran, 1977; 다수 통계 교과서 합의). BlueBird는 보수적 임계 N ≥ 50을 적용 — 분포 추정의 신뢰성과 *익명성 보호*(작은 표본에서 개인 식별 위험 감소)를 동시에 만족시키기 위함. K-anonymity 관점에서도 N ≥ 50은 표준 권장.
- **정의**: 통계 맥락 노출 (`bluebird_retention_mechanisms_v1.md` §3 메커니즘 2) 의 *최소 표본*. N < 50 카테고리는 노출 X.
- **SQL function** (`supabase/migrations/09_user_patterns_aggregates.sql:123~149` `compute_pattern_stats`):
  ```sql
  CREATE OR REPLACE FUNCTION compute_pattern_stats(min_n INT DEFAULT 50)
  RETURNS TABLE(
    distortion_type TEXT,
    n BIGINT,
    pct NUMERIC,
    is_sample_sufficient BOOLEAN
  )
  LANGUAGE SQL STABLE SECURITY DEFINER
  SET search_path = public
  AS $$
    WITH counts AS (
      SELECT distortion_type, COUNT(*) AS n
      FROM user_patterns GROUP BY distortion_type
    ),
    total AS (SELECT COUNT(*) AS total_n FROM user_patterns)
    SELECT c.distortion_type, c.n,
           ROUND(c.n::numeric / NULLIF(t.total_n, 0) * 100, 1) AS pct,
           (c.n >= min_n) AS is_sample_sufficient
    FROM counts c, total t;
  $$;
  ```
- **권한**: PUBLIC·anon·authenticated EXECUTE 거부, service_role 전용 (mig 09 line 151~154).
- **노출 시점**: G3 통과 + 자발 언급 ≥ 10% 트리거 후 (PMF plan §11.3).

### 4.2.12 자발 언급 ≥30% 게이트 (PMF G2)

- **정의**: 인터뷰 N=30 코딩 결과 자발 가치 언급 비율.
- **산식**:
  ```
  자발 언급 비율 = (B 영역 정합 응답자 수) / (코딩된 N)
  ```
  B 영역(PMF 핵심 가치 자발 언급) = B1·B2·B3·B4 (4 카테고리 — `coding-rubric-v1-2026-05-04.md` §1).
- **임계**: ≥ 30% (PMF plan §0 정의)
- **유도 어휘 가드**: §0 #1 — 모집 공고·스크리닝 폼·인터뷰 가이드에서 우리가 surface한 어휘는 자발 카운트 X.
  - 명시적 surface 어휘: "사고를 디버깅하는 도구"·"디버깅"·"시스템처럼"·"패턴"·"사용설명서"·"분석적 vs 정서적"·"디스턴싱·마인드카페·하루콩"
  - 동의어 인정 (§0 #2): "프로그램·시스템·로직·구조·메커니즘·작동 방식·체계" → "구조"의 동의어 군집 (단 코딩 노트에 원문 인용 + 매핑 사유 1줄 의무)
- **Cohen's κ 가드**: 첫 5명 batch 후 측정. ≥ 0.7 미달 시 rubric v1.1 재정의 (`coding-rubric-v1-2026-05-04.md` 헤더).

### 4.2.13 30일 잔존 ≥15% 게이트

- **정의**: 가입 후 30일 시점 활성 사용자 비율.
- **임계**: ≥ 15% (한국 정신건강 앱 평균 5~10% 대비 1.5~3배 — PMF plan §0)
- **활성 정의**: 측정 SOP는 sprint 2 정의 예정 (현재 PMF plan §6 월별 "30일 잔존율" 항목으로만 surface, 정확한 active 정의는 미명시).
- **데이터 소스**: `auth.users.created_at` + `analytics_events`·`logs`·`checkins` 활동 row (Supabase SQL editor 직접 쿼리).

### 4.2.14 결제 의향 ≥20% 게이트

- **정의**: 인터뷰 답변자 중 *결제 의향 응답자* 비율.
- **임계**: ≥ 20% (PMF plan §0 정의)
- **F 영역 코딩** (`coding-rubric-v1-2026-05-04.md` F1·F2):
  - F1: 결제 의향 *수치* 자발 언급 (₩ 단위)
  - F2: 결제 트리거 *기능* 자발 언급
- **원칙** (PMF plan §0 #3): "결제 의향 사용자 비율 ≥20%, 가격 분포가 인터뷰 결과로 *자연스럽게 모임*."
- **사전 박지 않음** (PMF plan §11.3): "인터뷰 결제 의향 분포가 1.9~3.9만 구간에 자연 수렴하면 가설 채택. 사전 박지 않음."

## 4.3 누적 가치 (Lock-in)

(출처: `bluebird_retention_mechanisms_v1.md`)

### 4.3.1 내 사용설명서 (My User Manual)

- **정의**: 사용자가 BlueBird를 누적 사용한 결과로 *자기 자신에 대한 매뉴얼*이 만들어짐.
- **데이터 흐름**: 베타 단계 *데이터 스키마*만 (mig 09 — `user_patterns` 테이블).
- **G2 통과 후**: 첫 매뉴얼 산출물(v1.0) — 30일 사용자 또는 100건 입력자에게 자동 생성.
- **G3 통과 후**: 매뉴얼 갱신 메커니즘(v1.1, v1.2) — 시계열 변화.
- **구성 예시** (`bluebird_retention_mechanisms_v1.md` §2.2):
  - 섹션 1: 활성 인지 왜곡 패턴 (1위·2위·3위 + 빈도)
  - 섹션 2: 트리거 상황 분포 ("발표·평가 상황에서 X 빈도가 평소의 N배")
  - 섹션 3: 효과 측정 누적 ("지난 30일간 N건 디버깅, 평균 고통 감소 폭 ±X점")
  - 섹션 4: 다음 30일 가설
- **가드레일** (§2.5):
  - (a) "잠정적·수정 가능한 가설"로 제시 — "당신은 X한 사람" 금지
  - (b) 사용자가 수정·반박 가능
  - (c) 부정적 정체성 강화 안 함 — *행동·패턴 수준*만, 인격 수준 라벨링 X
  - (d) 매뉴얼 손실 회피를 마케팅 도구로 쓰지 않음 ("이걸 잃지 마세요" 류 금지)
  - (e) export 가능 (PDF·텍스트)

### 4.3.2 패턴 리포트

- **정의**: 인사이트 페이지의 "당신의 사고 지문" 섹션. 매뉴얼의 *베타 단계 prototype*.
- **코드 위치**: `lib/insights/pattern-report.ts` (commit `7fd0c57`)
- **구성**: 요약 문장 3개 + 빈도 top3 + Δpain 효과 top3 (2회+ 표본만)
- **결제 가설 A 직접 강화**: "직장 × 파국화 5회, 관계 × 점쟁이오류 평균 +2.3점 효과" 같은 정량 문장.

### 4.3.3 archetype 5종

§4.2.10 참조. `lib/content/archetypes.ts`에서 정확 추출.

### 4.3.4 매뉴얼 v1.0 (G2 통과 후 산출물)

- **활성화 조건**: G2 통과 (자발 언급 ≥30% + 30일 잔존 ≥15% + 결제 의향 ≥20%) 후
- **트리거 격상 조건**: 인터뷰 자발 언급 ≥10% (PMF plan §11.3 — *매뉴얼 prototype* 격상 결정 트리거)
- **자발 언급 측정 질문** (PMF plan §3 M30.1 추가): "BlueBird를 사용하면서 *시간이 쌓일수록 의미 있다*고 느낀 순간이 있었나요?" — *유도하지 않는* 질문 형태로 "매뉴얼" 어휘 박지 않음.

### 4.3.5 익명 통계 맥락화

- **정의**: 다른 사용자들의 *익명 통계*를 통해 사용자에게 분석적 맥락 제공 (`bluebird_retention_mechanisms_v1.md` §3).
- **데이터 흐름**: 베타 단계 *데이터 수집*만 (`user_aggregates_daily` + `anon_user_hash` + RLS + N≥50 가드 — mig 09).
- **노출 시점**: G3 통과 + 사용자 1,000명 누적 + 자발 언급 ≥ 10% (둘 중 늦은 때).
- **익명화** (mig 09 line 49~59):
  ```sql
  ALTER TABLE user_patterns
    ADD COLUMN anon_user_hash TEXT
    GENERATED ALWAYS AS (encode(digest(user_id::text, 'sha256'), 'hex')) STORED;
  ```
- **가드레일** (§3.5):
  - (a) 비교 아닌 맥락 — "당신은 평균보다 X% 많이 합니다" 금지
  - (b) 부정적 통계 노출 제한
  - (c) 표본 크기 명시 (N ≥ 50)
  - (d) 익명성 절대 보장
  - (e) 통계 노출 끄기 옵션 제공

---

# 5. 기능 (Features)

## 5.1 사용자 흐름 (User Journey)

```
가입 (/auth/signup)
  → 이메일 인증 (/auth/callback)
    → 첫 진입 dashboard redirect (/dashboard) — user_onboarding row 부재 감지
      → /onboarding/1 (Act 1 — 왜)
        → /onboarding/2 (Act 2 — 무엇)
          → /onboarding/3 (Act 3 — 어떻게)
            → "지금 첫 디버깅 시작하기" → /log
              → /analyze/[id] → /action/[id] → 24h 후 /review/[id]
                → 누적 5건 → archetype 부여 → /insights 활성화
                  → 누적 30건 → 매뉴얼 v1.0 (G2 후 활성화)
```
(출처: `qa/e2e-scenario-im1-prerequisite.md` Step 1~9)

### 5.1.1 가입 → 이메일 인증

- **`/auth/signup`** — 이메일 + 비밀번호(6자 이상) + 만 14세 이상·이용약관·개인정보 처리방침 [필수] 3건 체크. 마케팅 동의 [선택] 1건.
- **`/auth/callback`** — Supabase 이메일 인증 callback. 성공 시 `router.push('/dashboard')`.

### 5.1.2 온보딩 강제

- **첫 진입 redirect**: `/dashboard` 진입 시 `user_onboarding` row 부재 감지 → `/onboarding/1`로 redirect.
- **9 슬라이드 Act 3구성** (`lib/onboarding/slides.ts`):
  - Act 1 (왜): act1-1 (한국 인지노동자 직장·체면·자기낙인) / act1-2 (학습된 자동 사고) / act1-3 (4분면 빈자리)
  - Act 2 (무엇): act2-1 (Dual Process) / act2-2 (CBT 5종) / act2-3 (Prospect + CAS)
  - Act 3 (어떻게): act3-1 (4단계 회로) / act3-2 (Δpain 측정) / act3-3 (자율성·매뉴얼)
- **X 버튼 (Act 1·2)**: 스킵 시 `user_onboarding` row 작성 후 `reached_act` = 그때까지 본 가장 깊은 Act.
- **완주 (Act 3 끝)**: "지금 첫 디버깅 시작하기" → row 작성 (`reached_act = 3`) → `/log`.
- **다시 보기**: `/me`에서 클릭 → `?replay=1` query param (row 삭제 X — mig 10 코멘트).
- **API**: `POST /api/onboarding/complete` (logId·reached_act 등) → `user_onboarding` UPSERT.

## 5.2 화면별 기능 (코드 라우트 직접 인용)

각 라우트마다 진입 경로 / 기능 핵심 / DB 입출력 / UI 시각 (분석가 톤 점검) 명시.

### 5.2.1 `/` (랜딩) — `app/page.tsx`

- **진입**: 미인증 사용자 default. SCENARIOS 3종 surface (line 8~12):
  - "회의에서 한마디 한 뒤 '괜히 말했다, 다음부턴 가만히 있어야지'로 굳어질 때"
  - "답장이 하루 늦어진 걸 보고 '내가 뭘 잘못한 거지'부터 떠오를 때"
  - "평가를 앞두고 '이번에도 결국 부족하다고 드러날 것이다'가 미리 결론처럼 들릴 때"
- **CTA**: "위 사례로 60초 체험해보기" → `/sample` (sample funnel) + "가입하기" → `/auth/signup` + "이미 계정이 있어요" → `/auth/login`
- **분석가 톤 점검**: "반복되는 사고 패턴을 / 구조로 본다" (line 31) — 분석가 톤 정합. "인지행동치료(CBT)·메타인지 모형(CAS)·전망이론을 기반으로 설계된 인지 분석 도구" (line 75) — 학술 백본 surface.

### 5.2.2 `/dashboard` (홈) — `app/dashboard/page.tsx`

- **진입**: 인증 후 default. `user_onboarding` row 부재 시 `/onboarding/1` redirect.
- **기능**: 인사 (시간대별 메시지 — line 24~36) / StreakBanner / archetype 카드 / pendingReview 카드 (re-eval) / weeklyPositiveDeltaPain 노출 / 진척 지표 (분석가 어휘 — design-realignment §3 ② "30일째 / Δpain 누적 / 분석 횟수")
- **DB 입출력**: SELECT `auth.users` + `logs` + `analysis` + `intervention` + `checkins`.
- **분석가 톤 점검**: design-realignment P0 A4 — 이모지 일소 (`🔥 🎉 ⚓ ⚡ 🧭`) → lucide 아이콘 + 분석가 어휘.

### 5.2.3 `/journal` (일지) — `app/journal/page.tsx`

- **기능**: 사용자의 모든 logs 시계열 list. log_type='success' 별도 필터 (mig 12 — `idx_logs_user_log_type`).
- **DB**: SELECT `logs` ORDER BY `created_at DESC`.

### 5.2.4 `/log` + `/log/success` (기록)

- **`/log`**: 자유 텍스트 trigger + thought + pain_score (0~10 INT — NRS-11) 입력 → `logs` INSERT → `/analyze/[id]` redirect.
- **`/log/success`**: 성공 순간 기록 (락인 보조 — log_type='success'). API `POST /api/success-log`.

### 5.2.5 `/analyze/[id]` (분석) — `app/analyze/[id]/page.tsx`

- **진입**: `/log` 완료 후 redirect 또는 journal에서 클릭.
- **기능**: `POST /api/analyze` 호출 → 분석 결과 시각화 (5종 왜곡·강도 bar·rationale·System 2 질문 surface).
- **재방문 배너** (commit `a4f7d26`): 같은 카테고리 + 같은 dominant 왜곡 + ≤60일 시 "N일 전 비슷한 패턴이 있었어요"
- **분석가 톤 점검**: design-realignment B3 보류 — analyze spinner "인지 나침반을 정교하게 맞추고 있어요" (line 457) → 인터뷰 트리거 후 일소.

### 5.2.6 `/action/[id]` (액션·자율성) — `app/action/[id]/page.tsx`

- **기능**: socratic_questions 3종 노출 → user_answers 입력 → final_action(≤500) → completion_note(≤200) → completion_reaction(improved/same/worse) → autonomy_score 산출.
- **API**: `POST /api/action` (`actionRequestSchema` Zod 검증)
- **레이트 리밋**: `consumeRateLimit({ windowMs: 60_000, maxRequests: 20 })` (line 53)
- **DB**: `intervention` UPDATE (autonomy_score · is_completed · completed_at — auto trigger mig 01 line 152~158)

### 5.2.7 `/checkin` + `/checkin/history` (체크인)

- **`/checkin`**: 아침/저녁 체크인 단일 화면. type='morning' 시 mood_word(1~20자), type='evening' 시 system2_moment(1~500자).
- **`/checkin/history`**: 누적 체크인 리스트.
- **API**: `POST /api/checkin` (Zod enum + nullable validator)
- **DB**: `checkins` 테이블 (mig 11) — `type CHECK ('morning','evening')` + `mood_word TEXT` + `system2_moment TEXT`. INSERT-only (UPDATE 정책 X).
- **인덱스**: `idx_checkins_user_type_created (user_id, type, created_at DESC)` + `idx_checkins_user_created (user_id, created_at DESC)`.

### 5.2.8 `/review/[id]` (재평가) — `app/review/[id]/page.tsx`

- **진입**: dashboard pendingReview 카드 클릭. 조건: `is_completed=TRUE AND reevaluated_pain_score IS NULL AND review_dismissed_at IS NULL`.
- **기능**: reevaluated_pain_score 입력 (0~10).
- **API**: `POST /api/review/pain-score` + `POST /api/review/dismiss` (X 클릭 시).

### 5.2.9 `/insights` (인사이트·차트) — `app/insights/page.tsx`

- **기능**: 왜곡 분포 / 자율성 추이 / archetype / Δpain 시계열 / 패턴 리포트(`pattern-report.ts`) — 5종 차트.
- **시간 toggle**: 7d / 30d / all (정신적 90일 falsifiability 모델 구현).
- **DB**: SELECT `analysis` + `intervention` + `logs`. NULL distortion_type row 필터.

### 5.2.10 `/visualize/[id]` (시각화)

- **기능**: 단일 분석의 손실 회피·CAS 신호·확률 추정을 *전망이론 기반 시각화*로 표현.
- **차트 컴포넌트**: `theory-value-curve-chart.tsx`.

### 5.2.11 `/manual` (매뉴얼) — `app/manual/page.tsx`

- **진입**: `/me`에서 "기술 매뉴얼" 링크.
- **컨텐츠** (`lib/content/technical-manual.ts`): 6 섹션 — 운영 원칙 4종 / 5종 왜곡 / Dual Process / Prospect Theory + λ 차트 / CAS 모델 / 자율성 회복.
- **분석가 톤**: design-realignment §3 결정 ③ — manual = 사용 설명 surface, 분석가 톤 일관.
- **PageHeader title**: "기술 매뉴얼" (design-realignment P0 A1 — "항해사 매뉴얼" → "기술 매뉴얼" 정정).

### 5.2.12 `/me` (마이) — `app/me/page.tsx`

- **기능**: 자기관리 hub. 매뉴얼 / 철학 / 온보딩 다시 보기 / 데이터 export / 계정 삭제 (`/me/delete-account`).
- **데이터 권리**: §5.5 RLS 본인 row 한정 + DELETE = ON DELETE CASCADE.

### 5.2.13 `/onboarding/[act]` (온보딩 9 슬라이드) — `app/onboarding/[act]/page.tsx`

- **9 슬라이드** (`lib/onboarding/slides.ts`): §5.1.2 참조.
- **API**: `POST /api/onboarding/complete` (`reached_act` UPSERT).
- **iPhone SE 320px viewport fit**: G1 prerequisite 미진행 — 5/4 designer 실기 테스트 예정 (`docs/meetings/2026-05-03-all-hands-priority-agenda.md` §2.4)

### 5.2.14 `/beta-incentive` (베타 혜택)

- **컨텐츠** (CEO 결정 2026-05-03): (E2) 결제 활성화 후 6개월 무상 사용권 + (F) 매뉴얼 v1.0 우선 제공 (G2 통과 후) + 무효 조건 4종 명시.
- **법적 정합**: `legal-review-2026-05-04.md` §4 Critical 1건 해결 — 약속 surface 위치 결정.
- **약관규제법 §6(신의성실)·표시광고법 정합**: (β') 채택 — 모집 공고 본문에는 *혜택 요약 1줄 + 자세히 보기 링크*만.

### 5.2.15 `/our-philosophy` (철학) — `app/our-philosophy/page.tsx`

- **컨텐츠**: BlueBird 가치 제안 surface. design-realignment §3 결정 ③ — manual 톤 + 통계 카드 grid 유지.
- **재작성 완료** (commit `59dba92`): gradient 제거, 항해 메타포 본문 → manual 톤 1:1 재작성.

### 5.2.16 `/disclaimer` (면책) — `app/disclaimer/page.tsx`

- **명시**:
  - 본 도구는 *치료가 아닌 자가 인지 코칭*
  - 정신과적 위기 시 1393·1577-0199 우선
  - 데이터는 본인 외 누구도 임의 열람 X
  (출처: PMF plan §2 IM.2)

### 5.2.17 `/terms` `/privacy` (약관)

- **`/terms`**: 이용약관. "회사" → "운영자" 정정 (commit `1ee6df4`).
- **`/privacy`**: 개인정보 처리방침. PIPA §22 항목 정합 — `legal-review-2026-05-04.md` §1 점검 결과 OK / Major 2건 보완 권고 (위탁 §26 / 국외이전 §28-8).

### 5.2.18 `/safety` `/safety/resources` (위기 자원)

- **`/safety/resources`**: 자살예방상담 1393 / 정신건강 위기상담 1577-0199 surface.
- **API**: `POST /api/safety/override` — 사용자가 "계속할래요"로 우회 시 `safety_events.user_override = TRUE` UPDATE.

### 5.2.19 `/install` (PWA 설치)

- **기능**: PWA 설치 가이드. iOS Safari "홈 화면에 추가" + Chrome "설치" 분기.
- **manifest**: `public/manifest.json` (theme_color · description "교정" → 정정 — design-realignment P0 A3).

### 5.2.20 `/auth/login` `/auth/signup` `/auth/callback` (인증)

- **Supabase Auth** — 이메일/비밀번호. OAuth 미도입 (베타 단계 비목표).
- **이메일 verify 강제**: `/auth/signup` 완료 후 callback 통과 전 로그인 차단.

### 5.2.21 `/(public)/sample` (sample funnel)

- **`/sample`**: 무가입 체험. 3개 정적 케이스. 4 funnel events.
- **`/sample/[caseId]`**: 케이스별 분석 결과. 실제 analyze + questions API 1회 호출 결과를 그대로 캐시 (무결성 원칙: 데모 가공 금지).
- **commit**: `e96ccb7`. AI 호출 0회 (어뷰징 차단), 시각화·행동 설계 제외 (60초 흐름 최적화).

### 5.2.22 `/setup-required` (마이그레이션 부재 안내)

- **기능**: 마이그레이션 부재 환경에서 운영자에게 안내. RLS 정책 미적용 시 fallback 동작 차단.

## 5.3 Crisis Detection (안전 가드)

### 5.3.1 메커니즘

- **코드**: `lib/safety/detect.ts` (line 11~39):
  ```ts
  export async function detect(input: DetectInput): Promise<CrisisDetectionResult> {
    const combined = `${input.trigger}\n${input.thought}`.trim();
    const keyword = screenKeywords(combined);

    if (keyword.verdict === 'critical') {
      return { level: 'critical', detectedBy: 'keyword', matchedPattern };
    }
    if (keyword.verdict === 'none') {
      return { level: 'none', detectedBy: null };
    }
    // suspected → LLM 재분류
    const llm = await classifyWithLlm({ text: combined, client: input.client });
    const isFallback = llm.reason.includes('fallback');
    return { level: llm.verdict, detectedBy: isFallback ? 'llm_fallback' : 'llm', ... };
  }
  ```
- **2단계 layered**: keyword → LLM 재분류 (suspected case만)
- **레벨**: `'none' | 'caution' | 'critical'` (`safety_events.level CHECK` mig 03)

### 5.3.2 surface 자원

- 자살예방상담 1393 / 정신건강 위기상담 1577-0199
- `/safety/resources` 페이지 + 분석 응답 시 즉시 carousel 노출 (`/api/analyze` 분기 — line 139~147)

### 5.3.3 user_override 추적

- `safety_events.user_override BOOLEAN DEFAULT FALSE` (mig 03)
- `POST /api/safety/override` — 사용자가 "계속할래요" 클릭 시 UPDATE
- 동일 logId 재분석 시 priorOverride 체크 (`/api/analyze:106~113`) — 중복 차단 회피

### 5.3.4 sanitize

- `lib/safety/prompt-sanitize.ts` — 사용자 입력에 prompt injection 어휘 (`ignore previous` 등) 검출 + sanitize.
- `lib/security/ai-guard.ts` — `MAX_AI_TEXT_LENGTH` 가드 + `isAiInputTooLong` 검사.

## 5.4 PII 마스킹·로깅

### 5.4.1 server-logger (commit `69557cd`)

- **코드**: `lib/logging/server-logger.ts` — `logServerError(scope, error, context)` 표준화.
- **PII 마스킹 정책**: 이메일·user_id·logId 컨텍스트 박되, 자유 텍스트 (trigger·thought)는 로그에 남기지 않음.
- **마이그레이션 완료**: 모든 `console.error` → `logServerError` 전환 (5/2 commit).
- **검증 보류**: production 로그에서 PII 마스킹 작동 사후 검증 — IM.1 모집 전 senior-fullstack + senior-qa 협업 (`docs/meetings/2026-05-03-all-hands-priority-agenda.md` §2.8 1순위).

## 5.5 데이터 권리 (RLS)

### 5.5.1 RLS 정책 표준

모든 사용자 facing 테이블 — 자기 row 한정 SELECT/INSERT/UPDATE. DELETE는 ON DELETE CASCADE only (의도적 — append-only 모델).

| 테이블 | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| logs | self | self | self | self (RLS) — mig 01 |
| analysis | via logs join | via logs join | — | self (RLS) — mig 12 |
| intervention | via logs join | via logs join | self via logs join | — (CASCADE only) |
| safety_events | self | self | self (override) | — (CASCADE only) |
| analytics_events | — (의도적 차단) | self | — | — (CASCADE only) |
| user_patterns | self | self | — | — (CASCADE only) |
| user_aggregates_daily | self | service_role only | service_role only | — |
| user_onboarding | self | self | self | — (CASCADE only) |
| checkins | self | self | — (append-only) | — (CASCADE only) |

### 5.5.2 회원 탈퇴 (mig 07)

- **30일 유예 예약** (default): `schedule_account_deletion()` SECURITY DEFINER — `auth.users.raw_user_meta_data.deletion_scheduled_at = NOW() + INTERVAL '30 days'`.
- **즉시 영구 삭제** (옵션): `delete_my_account()` SECURITY DEFINER — `DELETE FROM auth.users` → CASCADE.
- **복구**: `cancel_account_deletion()` — 30일 내 재로그인 시 사용자 명시적 호출로 메타데이터 제거.
- **월 1회 정기 cleanup**: `cleanup_expired_deletions()` GRANT service_role only — `deletion_scheduled_at <= NOW()` 모든 계정 삭제.

### 5.5.3 self-service `/me`

- 열람·수정·이동(데이터 export 보류 — Tier 2.x)·탈퇴.
- `/me/delete-account` → 30일 유예 vs 즉시 영구 삭제 선택.
- `/account/recover` → 30일 유예 기간 내 복구.

---

# 6. 기술 스택 (Architecture)

## 6.1 Frontend

- **Next.js 16** (App Router) — `next.config.ts`
- **TypeScript** strict — `tsconfig.json`
- **Tailwind 4** — `tailwind.config.ts` (디자인 토큰 정렬 — design-realignment P0 A5)
- **Pretendard variable** (jsdelivr CDN) — 모든 페이지 한국어 글꼴 통일 (commit `f3c3b4b`)
- **lucide-react** SVG 아이콘 (raster 0건 — design audit 결과)
- **PWA**: `public/manifest.json` + `public/sw.js`
- **회귀 보호**: `vitest 127/127` + `lint:copy` 정적 카피 가드 (위로·항해·의료 패턴 — design-realignment P0 A8) + 한국어 우회 어미 false-negative `eval-distortion-fix.ts` (commit `8880f18`)

## 6.2 Backend

- **Supabase Auth** — 이메일/비밀번호. RLS 활성.
- **Supabase PostgreSQL** — 13 마이그레이션 적용.
- **Vercel hosting** — Next.js Edge / Server Components.
- **Vercel Analytics** — sample funnel + 일부 클라이언트 events.

## 6.3 AI

- **Google Gemini API** — `lib/openai/gemini.ts`
  - 모델: gemini-1.5-flash (`gemini-setup.md`·`gemini-migration.md` 참조)
  - Structured Output Schema 강제 (line 37~87 `ANALYSIS_RESPONSE_SCHEMA`)
  - `maxOutputTokens 4096` (한국어 토큰 효율 — commit `4619a20`)
  - retry + minItems/maxItems 3 강제 (questions schema)
- **프롬프트 인젝션 가드**: `sanitizeForPrompt` (`lib/safety/prompt-sanitize.ts`) + `detect` (`lib/safety/detect.ts`)
- **Few-shot**: `BLUEBIRD_FEW_SHOT_CASES` 7개 (한국어 우회 어미 7번째 케이스 포함)
- **분석 품질 자체 메트릭** (mig 08 — `analytics_events`):
  - `analyze_distortion_zero` — distortions=[]로 끝나는 비율
  - `analyze_retry_fired` — 재시도 발동 빈도
  - `questions_fallback` — 디폴트 폴백으로 떨어진 비율
  - `analyze_parse_failed` — JSON 파싱 실패

## 6.4 데이터 스키마 (13 마이그레이션)

### 6.4.1 핵심 테이블 정렬

| 테이블 | 도입 mig | 용도 |
|---|---|---|
| logs | 01 | 사용자 트리거·자동 사고 기록 (+ pain_score mig 04, trigger_category mig 06, log_type mig 12) |
| analysis | 01 | AI 분석 결과 (+ 프로토콜 컬럼 mig 02, distortion_type NOT NULL 해제 mig 12) |
| intervention | 01 | 소크라테스식 질문·user_answers·autonomy_score (+ reevaluation mig 05, completion_note·reaction mig 12) |
| safety_events | 03 | 위기 감지 이벤트 로그 |
| analytics_events | 08 | 분석 품질 자체 메트릭 |
| user_patterns | 09 | 매뉴얼 데이터 누적 + anon_user_hash sha256 |
| user_aggregates_daily | 09 | 일자별 시계열 누적 (service_role 전용 INSERT/UPDATE) |
| user_onboarding | 10 | 온보딩 완료·reached_act |
| checkins | 11 | 아침/저녁 체크인 |

### 6.4.2 마이그레이션 13종 상세

#### 01_initial_schema.sql

- logs (id UUID, user_id, trigger TEXT, thought TEXT, created_at, updated_at)
- analysis (id, log_id, distortion_type CHECK 5종 enum, intensity FLOAT 0~1, logic_error_segment TEXT)
- intervention (id, log_id, socratic_questions JSONB, user_answers JSONB, final_action, is_completed, autonomy_score INTEGER ≥ 0, completed_at)
- 인덱스: idx_logs_user_id, idx_logs_created_at, idx_analysis_log_id, idx_intervention_log_id, idx_intervention_completed
- RLS: logs SELECT/INSERT/UPDATE/DELETE self / analysis SELECT/INSERT via logs join / intervention SELECT/INSERT/UPDATE via logs join
- Trigger: update_updated_at_column / update_completed_at

#### 02_protocol_fields.sql

- analysis ADD: rationale, frame_type CHECK loss/gain/mixed, reference_point, probability_estimate FLOAT, loss_aversion_signal CHECK 0~1, cas_rumination CHECK 0~1, cas_worry CHECK 0~1, system2_question_seed, decentering_prompt
- 인덱스: idx_analysis_frame_type
- intervention ADD: theory_context JSONB DEFAULT '{}'

#### 03_safety_events.sql

- safety_events (id, user_id, log_id, level CHECK caution/critical, detected_by CHECK keyword/llm/llm_fallback, matched_pattern, llm_reason, user_override BOOLEAN, created_at)
- 인덱스: idx_safety_events_user_id, idx_safety_events_created_at
- RLS: SELECT/INSERT/UPDATE self

#### 04_logs_pain_score.sql

- logs ADD: pain_score INT CHECK 1~5
- (RLS 감사 2026-04-25 C2 이슈 해소 — 코드와 schema 정합화)
- *2026-05-04 mig 13에서 0~10으로 확장됨 (NRS-11 정렬)*

#### 05_intervention_reevaluation.sql

- intervention ADD: reevaluated_pain_score INT CHECK 1~5, reevaluated_at, review_dismissed_at
- 인덱스: idx_intervention_pending_review (completed_at DESC) WHERE is_completed=TRUE AND reevaluated_pain_score IS NULL AND review_dismissed_at IS NULL
- *2026-05-04 mig 13에서 0~10으로 확장됨 (NRS-11 정렬)*

#### 06_trigger_category.sql

- logs ADD: trigger_category TEXT CHECK 8종 enum (work·relationship·family·health·self·finance·study·other)
- 인덱스: idx_logs_user_category

#### 07_account_deletion.sql

- 함수 4종 SECURITY DEFINER:
  - delete_my_account() — 즉시 영구 삭제. authenticated grant.
  - schedule_account_deletion() — 30일 유예. authenticated grant.
  - cancel_account_deletion() — 복구. authenticated grant.
  - cleanup_expired_deletions() — 정기 cleanup. service_role only grant.

#### 08_analytics_events.sql

- analytics_events (id, user_id, event_name, properties JSONB, created_at)
- 인덱스: idx_analytics_events_event_created, idx_analytics_events_user
- RLS: INSERT self only (SELECT 정책 *없음* — 운영자만 service_role로 조회)
- View: analytics_quality_summary (security_invoker=true) — 30일 윈도우 일별 집계

#### 09_user_patterns_aggregates.sql

- pgcrypto extension
- user_patterns (id, user_id, log_id, distortion_type, trigger_category, pain_score_delta INT, anon_user_hash GENERATED sha256 STORED, created_at)
- 인덱스: idx_user_patterns_user_id, idx_user_patterns_distortion, idx_user_patterns_created_at, idx_user_patterns_anon_hash
- user_aggregates_daily (user_id, date, distortion_count_jsonb, trigger_count_jsonb, pain_delta_avg, total_logs, PK(user_id, date))
- 인덱스: idx_user_aggregates_daily_date
- RLS: user_patterns SELECT/INSERT self / user_aggregates_daily SELECT self만 (INSERT/UPDATE service_role only)
- 함수: compute_pattern_stats(min_n INT DEFAULT 50) — service_role only EXECUTE
- enum: cognitive_role (analytical·creative·managerial·service·student·other)

#### 10_onboarding_completed.sql

- user_onboarding (user_id PK, completed_at, reached_act INT CHECK 1~3)
- 인덱스: idx_user_onboarding_completed_at
- RLS: SELECT/INSERT/UPDATE self

#### 11_checkins.sql

- checkins (id, user_id, type CHECK 'morning'/'evening', mood_word TEXT, system2_moment TEXT, created_at)
- 인덱스: idx_checkins_user_type_created (user_id, type, created_at DESC), idx_checkins_user_created
- RLS: SELECT/INSERT self (UPDATE/DELETE 정책 *없음* — append-only)

#### 12_schema_drift_fixes.sql

- logs ADD: log_type CHECK 'normal'/'success'
- 인덱스: idx_logs_user_log_type
- analysis distortion_type NOT NULL 해제 (코드 정합 — 0건 스트릭 마커 INSERT)
- analysis DELETE 정책 추가: "Users can delete own analysis" via logs join
- intervention ADD: completion_note TEXT CHECK ≤ 200, completion_reaction CHECK improved/same/worse

#### 13_pain_score_range_0_10.sql (2026-05-04 추가)

- logs.pain_score CHECK 1~5 → CHECK 0~10 (제약 이름: `logs_pain_score_range_0_10`)
- intervention.reevaluated_pain_score CHECK 1~5 → CHECK 0~10 (제약 이름: `intervention_reevaluated_pain_score_range_0_10`)
- 근거: NRS-11 (Hawker et al., 2011) 정렬 (§4.1.4). 5점 척도 대비 해상도 2배 — Δpain 변화 포착력 향상.
- 데이터 변환 불필요: 기존 1~5 데이터는 0~10 범위에 그대로 들어맞음.
- 동반 변경: `app/log/page.tsx` (5점 칩 → 0~10 정수 그리드), `app/review/[id]/review-form.tsx` (grid-cols-5 → grid-cols-11), `app/api/review/pain-score/route.ts` Zod min(0).max(10).

## 6.5 회귀 보호 인프라

### 6.5.1 vitest 127/127

- 단위 테스트 + 통합 테스트. 5/2 commit 시점 100% green.
- `vitest.config.ts` — Node·jsdom 분리.

### 6.5.2 lint:copy 정적 카피 가드

- design-realignment P0 A8 — CI grep rule 추가.
- 위반 패턴 (예시):
  - `/괜찮아요/`·`/잘하고 있어/`·`/응원/` (AI 출력 가드)
  - `/항해|나침반|안개|별빛|바다/` (메타포 회귀)
  - `/치료|효과|교정/` (의료기기 함의)
- 현재 4건 잔존 (모두 B3 영역 — 인터뷰 트리거 후 일소).

### 6.5.3 E2E 9단계 시나리오

- `docs/qa/e2e-scenario-im1-prerequisite.md` (senior-qa-engineer 작성)
- 실행 예정 2026-05-05 (화)
- 9 단계: 가입 → 온보딩 → 첫 디버깅 → 24h 단축 → 재평가 → 체크인 → 위기 감지 → /me 삭제 → 복구.
- 24h 단축 SOP: SQL `BEGIN; UPDATE; COMMIT;` 페어로 24h 윈도우 시뮬레이션.

### 6.5.4 senior-qa 독립 검증 라인

- senior-qa-engineer는 senior-fullstack과 *분리된 보고선*. CTO 직속.
- 회의록 정합성 독립 검증 + E2E 시나리오 작성·실행.

---

# 7. PMF 검증 (Validation)

## 7.1 1차 타겟 3축 정의

§0.3에서 정의. 직무 narrowing 0 — 측정은 직무 분포가 아니라 3축 자발 언급 코딩.

(출처: `docs/strategy/positioning-and-vision-v1.md` §2 / commit `64ad52f`)

## 7.2 IM.1 모집·코딩

### 7.2.1 모집 채널 (CPO 권고)

- **1순위**: LinkedIn 한국 인지노동자 그룹 (1.1) + Disquiet 한국 메이커 커뮤니티 (1.3) **동시** 게시.
- **2순위 보조** (응모 < 10명/주 시): Threads (1.2) + Twitter/X (1.6).
- **보조 라인**: 1촌 추천 (1.4) — ≤ 5명 (≤ 17%).
- **비권고**: 직장인 커뮤니티 블라인드·리멤버 (1.5) — 본질 위협 #3 위험.
(출처: `docs/im1/recruitment-package-2026-05-03.md` §1.7)

### 7.2.2 인센티브 정책 (CEO 결정 2026-05-03)

(E2)+(F) 조합 — 서비스 혜택 only, 돈 지불 0건:

| 혜택 | 내용 | 비용 |
|---|---|---|
| (E2) | 결제 활성화 후 6개월 무상 사용권 | 0원 |
| (F) | 매뉴얼 v1.0 우선 제공 (G2 통과 후) | 0원 |

- 모집 공고 본문에는 *혜택 요약 1줄 + 자세히 보기 링크*만 (β')
- 약속 본문 + 무효 조건 4종은 `/beta-incentive`에 surface
- 약관규제법 §6(신의성실)·표시광고법 정합 확보

### 7.2.3 비동기 인터뷰 모드 (CEO 결정 2026-05-03)

PMF plan §3 M30.1 본 결정으로 정정:
- 30분 1:1 인터뷰는 *옵션 경로*로 격하
- 모집 폼(Google Forms)의 자유 응답 4문항(Q4~Q7)이 *1차 인터뷰 답변* 역할
- 응답 즉시 strategy-manager + PO가 코딩 (rubric v1.0)
- N=30 도달 기준 = 폼 응답 30개 (1:1 인터뷰 횟수 X)
- Follow-up 메시지 (자발 시그널 풍부한 응답자만): 1~2건 추가 질문, 응답자 동의 시 30분 1:1 옵션
(출처: `recruitment-package-2026-05-03.md` §5)

### 7.2.4 coding rubric v1.0

- **문서**: `docs/im1/coding-rubric-v1-2026-05-04.md` (873줄)
- **6 영역 27 카테고리**:
  - A. 1차 타겟 3축 (A1·A2·A3 — 3 카테고리)
  - B. PMF 핵심 가치 자발 언급 (B1·B2·B3·B4 — 4 카테고리)
  - C. 트리거 카테고리 (C1~C9 — 9 카테고리)
  - D. 본질 위협 시그널 (D1~D6 — 6 카테고리)
  - E. 경쟁사 비교 (E1·E2·E3 — 3 카테고리)
  - F. 결제 의향 (F1·F2 — 2 카테고리)
- **각 카테고리 형식**: 측정 의도 → 정합 sample (≥5) → 미정합 sample (≥3) → 경계 case (≥1) → 분류 기준 (정량) — 총 251 sample.
- **Cohen's κ ≥ 0.7 가드** — 첫 5명 batch 후 측정. 미달 시 v1.1 재정의.

### 7.2.5 6 코딩 원칙 (rubric §0)

1. 유도 어휘 박지 않은 응답만 자발 언급으로 인정
2. 응답 어휘가 우리 키워드의 *동의어*면 자발로 인정 (의미 매핑 표 §부록 E)
3. 부정 명제도 자발로 인정 ("위로받는 건 저한테 안 맞아요" → A1 정합 1점)
4. 불확실 응답은 별도 분류 — 경계 case 큐 누적
5. 본질 위협 자발 언급은 즉시 escalation — D 영역 ≥10% 누적 시 카피 hotfix 트리거
6. 자발성 가드 — 응답 위치 추적 (어휘 거리 ≤ 3 어절 내 등장 시 *유도 의심 case*)

## 7.3 게이트

### 7.3.1 G2 (60일 게이트)

전부 충족 시 Tier 2 진입:
- [ ] 30일 잔존율 ≥ 15%
- [ ] 인터뷰 자발 가치 언급률 ≥ 30%
- [ ] 결제 의향 사용자 비율 ≥ 20%
- [ ] 임상 자문 후보군 ≥ 1명 발굴

부분 통과·미통과 분기:
- 잔존율 OK / 결제 의향 약함 → 가치 *명료성* 강화 (UX/메시지 작업)
- 자발 언급 OK / 잔존 약함 → 락인 메커니즘 강화 (PWA Push, 마일스톤)
- 둘 다 약함 → 미통과 처리 → 가설 재검토
- 피벗 옵션 (사전 정의 — 결정을 미루지 않기 위해):
  1. **B2B 피벗** — 기업 EAP·복지 패키지
  2. **임상 협력 피벗** — 정신과 의원 보조 도구로 포지션
  3. **수직 좁힘** — 특정 카테고리(예: 직장인 발표 불안)에 집중
(출처: PMF plan §4)

### 7.3.2 G3 (90일 게이트)

전부 충족 시 외부 마케팅 활성:
- [ ] G2 통과 후 30일 더 지속
- [ ] 임상 자문 1명 확보 (계약 또는 자문 합의)
- [ ] 익명 케이스 스터디 1편 작성 가능 데이터 누적
- [ ] PIPA·면책·데이터 export 모두 정비
- [ ] 100명 베타 7일 잔존율 ≥ 30%
(출처: PMF plan §5)

## 7.4 트리거 메커니즘 (PMF plan §11.3)

7 트리거 + 매뉴얼·통계 ≥10% = 9 트리거. 자발 언급 frequency 기반 격상 결정.

| 트리거 | 임계 | 격상 결정 |
|---|---|---|
| 분석가 톤 마이그레이션 | 톤 인식 "정서적" 우세 + 결제 의향 약함 | 마이그레이션 (그렇지 않으면 하이브리드) |
| 모듈 D 신체화 매핑 | 자발 언급 ≥ 10% | MVP 진입 검토 |
| 가격 가설 사전 박음 | 결제 의향 분포 1.9~3.9만 자연 수렴 | 가설 채택 (사전 박지 않음) |
| 법적 표현 정렬 ("탐지" → "기록·관찰") | G3 진입 시점 변호사 검토 | 정식 변호사 결정 |
| 고통 vs 스트레스 라벨 | 인터뷰 자발 언급 ≥ 60% 우세 | 라벨 재변경 (현 라벨 "고통" — 2026-05-04 senior-ux-researcher 검토 결과) |
| 수치 framing 정직성 | 모호함·불신 ≥ 20% | "AI 추정" 라벨 + 신뢰구간 + 산식 투명화 |
| 매뉴얼 prototype | 자발 언급 ≥ 10% | prototype 격상 (미만이면 G2 후 v1.0까지 대기) |
| 통계 맥락 prototype | 자발 언급 ≥ 10% | prototype 격상 (미만이면 G3 후까지 대기) |
| 글로벌 챗봇 한국어 진입 시그널 | 외국어 챗봇 자발 언급 ≥ 10% | 락인 메커니즘 격상 |

---

# 8. 본질 위협·비목표

## 8.1 본질 위협 6 시그널 (즉시 멈춤 트리거)

다음 발생 시 작업을 *멈추고* `bluebird_competitive_strategy_v1.md` §6.4 + PMF plan §11.6으로 복귀:

1. 카피가 정서적·치유적 톤으로 자연스럽게 흘러감 ("함께", "위로", "마음을 안아")
2. 디자인이 파스텔·자연 사진·감성 일러스트로 수렴
3. "스트레스 관리"가 *입구*로 등장 (메뉴·카피·랜딩)
4. 정기 자기 라벨링 체크인 (모닝/이브닝 알림 등)이 추가됨
5. 가격 책정이 디스턴싱과 비슷한 수준이 자연스럽게 느껴짐
6. 기능 기획 동기가 "사용자가 외롭지 않게" 류로 흐름

(출처: `positioning-and-vision-v1.md` §9)

### 8.1.1 자기점검 체크리스트

새 카피·디자인·기능 작업 큐에 올라올 때:

- 카피 작성 시: "디스턴싱 앱에 그대로 붙여도 어색하지 않은가" → 어색하지 않다면 차별화 부족.
- 디자인 결정 시: "치유적 따뜻함을 시도하고 있는가" → 그렇다면 BlueBird 톤 아님.
- 기능 추가 시: "디스턴싱과 무엇이 다른가" → 같다면 추가 금지.

(출처: `bluebird_competitive_strategy_v1.md` §6.1~§6.3)

## 8.2 명시적 비목표

베타 단계에서 *하지 않는* 것 (PMF plan §8 + §11.3):

| 항목 | 트리거 |
|---|---|
| 결제 인프라 | G2 통과 후 |
| 외부 마케팅 | G3 통과 후 |
| 모바일 네이티브 | PWA 검증 후 |
| 다국어 | 한국 시장 검증 후 |
| 모듈 D 신체화 매핑 격상 | 인터뷰 자발 언급 ≥10% |
| 분석가 톤 전면 마이그레이션 | 인터뷰 톤 인식 분포 |
| 라벨 재변경 ("고통" vs "스트레스") | 인터뷰 자발 언급 ≥60% 우세 (현 라벨 "고통" — 2026-05-04 senior-ux-researcher 검토) |
| 법적 표현 정렬 ("탐지" → "기록·관찰") | G3 변호사 검토 후 |
| 다크모드 | 인터뷰 자발 언급 ≥10% |
| 챗봇 카테고리 | **영구 비목표** (못 이기는 싸움) |
| 소셜·커뮤니티 | **영구 비목표** (비교 압력 = 인지 왜곡 유발) |
| AI 챗봇화 (Wysa·Replika 카테고리) | **영구 비목표** |
| 무료 사용자 알림 폭격 | **영구 비목표** |
| 하드코딩된 소크라테스 질문 풀 | Gemini 동적 생성이 우월 |

(출처: `positioning-and-vision-v1.md` §8 + `development-backlog.md` "일부러 안 하기로 한 것")

---

# 9. 조직 구성

## 9.1 페르소나 정의

`/Users/dongseob/Desktop/Project-BlueBird-mvp/.claude/agents/`:

| 페르소나 | 역할 | 보고선 |
|---|---|---|
| CEO | 알빈 (필명 — 본명 surface 0). 최종 의사결정 | — |
| CPO | Chief Product Officer | CEO |
| CSO | Chief Strategy Officer | CEO |
| CTO | Chief Technology Officer | CEO |
| product-designer | 디자인 audit·디자인 시스템 토큰·시각·마이크로카피 *산출* | CPO |
| product-owner | 측정 인프라 SOP·자발 언급 트리거 cadence | CPO |
| senior-ux-researcher | 사용자 멘탈 모델·terminology fit·인터뷰·A/B 테스트 방법론 *입력측 분석* (2026-05-04 추가) | CPO |
| strategy-manager | 인터뷰 코딩 rubric·경쟁 monitoring | CSO |
| risk-manager | 약관·PIPA·표시광고법 임시 가드 (G3 정식 변호사 검토 전) | CSO |
| senior-fullstack-engineer | 코드·DB·운영 인프라 | CTO |
| senior-qa-engineer | E2E 시나리오·회의록 정합성 *독립 검증 라인* | CTO 직속 (senior-fullstack과 분리) |

(출처: `.claude/agents/*.md`, `docs/meetings/2026-05-03-all-hands-priority-agenda.md`, `docs/meetings/org-chart-2026-05-03.html`)

## 9.2 협업 패턴

### 9.2.1 4 임원 합의

CEO + 3 임원(CPO·CSO·CTO) 4인 합의 시 deploy. 예: (a)+(c) 데이터 스키마 + 통계 수집(미노출) — 2026-04-30 4 임원 전원 합의 deploy 완료.

### 9.2.2 법적 합의

risk-manager 임시 가드 + G3 진입 시 정식 변호사 검토. 베타 단계 1차 점검 (`legal-review-2026-05-04.md`) — Critical 1건 / Major 8건 / Minor 9건. 모집 시작 5/6 *전* Critical hotfix 필수.

### 9.2.3 기술 합의

CTO + senior-fullstack + senior-qa 3자. 마이그레이션 적용 전 회귀 평가. E2E 시나리오 통과 후 모집 시작.

### 9.2.4 독립 검증 라인

senior-qa-engineer는 senior-fullstack과 *분리된 보고선*. 회의록 정합성·E2E 결과 독립 검증 — *합리화 회피*.

## 9.3 1인 운영자 명시

베타 단계 인적 구성:
- **운영자**: 1인 (CEO 본인) — `app/privacy/page.tsx:264~273`에 "Project BlueBird 운영자 / `seob6615@gmail.com`" 명시.
- **법적 점검 보류**: 보호책임자 *이름* 미명시 (Minor 1건 — `legal-review-2026-05-04.md` §1.3) — G3 정식 변호사 검토 권고.
- **사업자 등록**: 베타 단계 미등록. G2 통과 후 결제 인프라 진입 시점에 등록 검토.

---

# 10. 로드맵

## 10.1 베타 (현재 ~ G2)

- **현재 (2026-05-03)**: 베타 사용자 0명, IM.1 모집 직전.
- **5/4**: strategy-manager 코딩 rubric v1.0 합의.
- **5/5**: senior-qa E2E 시나리오 실행 + iPhone SE 320px 실기 테스트 + risk-manager 약관 hotfix.
- **5/5 EOD**: prerequisite 1~6 ALL PASS 보고 → CEO 모집 시작 GO/NO-GO.
- **5/6 (수) 권고 / 5/9 (월) deadline**: LinkedIn + Disquiet 모집 시작.
- **5/6 ~ 5/27**: 모집 2~3주 (selectee 30명 확정).
- **6/1 ~ 6/30**: 비동기 인터뷰 30명 + 코딩.
- **2026-07-03 (60일 게이트 G2)**: 자발 언급 ≥30% / 잔존 ≥15% / 결제 의향 ≥20% / 임상 자문 ≥1명 평가.

## 10.2 G2 후 (매뉴얼 v1.0·결제 인프라·Δpain prototype)

- **매뉴얼 v1.0** — 30일 사용자 또는 100건 입력자에게 자동 생성. `lib/insights/pattern-report.ts` 강화.
- **결제 인프라** — Stripe (글로벌 카드) + 토스페이먼츠 (한국 카드). 7일 무료 체험 + 첫 결제 후 30일 환불 보장 (한국 시장 신뢰).
- **Δpain prototype** — 인사이트 페이지 차트 강화. (Tier 2.1 — 주간/월간 리포트 + 공유 가능 이미지/PDF — `development-backlog.md` Tier 2)

## 10.3 G3 후 (외부 마케팅·통계 노출·매뉴얼 정식 출시)

- **G3 (2026-08-03 — 90일 게이트)**: G2 30일 지속 + 임상 자문 1명 + 케이스 스터디 1편 + PIPA 정비.
- **외부 마케팅 활성**: 브런치·언론·인플루언서.
- **통계 맥락화** — `compute_pattern_stats(min_n=50)` 호출 결과 surface (자발 언급 ≥10% 트리거 충족 시).
- **매뉴얼 정식 출시** — v1.0 → v1.1 (시계열 변화 가시화) → v1.2 (export PDF/텍스트).
- **법적 표현 정렬** — "탐지" → "기록·관찰" 점진 교체 (변호사 검토 후).

## 10.4 장기 비전 (12~24개월)

- "한국어 인지 디버깅"이라는 *카테고리 자체를 창출*.
- 글로벌 AI 챗봇(Wysa·Woebot) 한국어 진입 시도에도 한국 직장 문화·체면·자기낙인 맥락은 단기간 따라잡기 어렵게 락인.
- 분석적 항해사 정체성을 가진 사용자가 *자기 자신을 디버깅*하고 *자율성을 회복*하는 도구. 치료가 아닌 *자기 운영*.
(출처: `positioning-and-vision-v1.md` §6 비전)

---

# 11. 위험·완화

## 11.1 데이터 오염 위험 (broken path)

- **위험**: 마이그레이션 12 적용 후 production에서 처음 hot path 통과. RLS 차단·CHECK 위반·NOT NULL 위반 같은 silent error는 분석 결과에 누락되거나 재분석 실패로 surface.
- **완화**:
  - E2E 9단계 시나리오 (senior-qa, 5/5 실행)
  - hot path 모니터링 routine — Vercel 로그 + Supabase analytics_events 매일 1회 점검 SOP
  - 24h 단축 SOP — SQL `BEGIN; UPDATE; COMMIT;` 페어로 윈도우 시뮬레이션
(출처: `qa/e2e-scenario-im1-prerequisite.md` 0~9)

## 11.2 본질 위협 #1·#2·#4

- **위험**: 카피 정서화·디자인 감성화·정기 자기 라벨링 체크인 → 카테고리 표류.
- **완화**:
  - lint:copy 정적 카피 가드 (위로·항해·의료 패턴 — design-realignment P0 A8)
  - 카피 sweep — 5/2 commit 시점 분석가 톤 정합 PASS
  - 본질 위협 자발 언급 ≥10% 시 즉시 carpark hotfix
(출처: `coding-rubric-v1-2026-05-04.md` §0 #5)

## 11.3 법적 위험

- **위험**:
  - 의료법 회색지대 (디지털의료제품법 2025-02 시행) — "탐지·교정·치료" 표현 위반
  - PIPA §28-8 (2024-03 개정) — 국외이전 *별도 동의* 필요
  - 약관규제법 §6 신의성실 — 인센티브 약속 무효 조건 명시
- **완화**:
  - risk-manager 임시 가드 (`legal-review-2026-05-04.md` 1차 점검)
  - G3 진입 시 정식 변호사 검토
  - `/disclaimer` 면책 페이지 (PMF plan §2 IM.2)
  - "치료" 어휘 0건 / "교정" 어휘 정렬 작업 (design-realignment P0 A3)

## 11.4 경쟁 진입

- **위험**:
  - 디스턴싱이 분석가 톤·신체화 매핑 부분 모방
  - 글로벌 AI 챗봇(Wysa·Woebot) 한국어 진입
  - 식약처 DTx 보험 급여 진입 → 일반 웰니스 가격 정당성 압박
- **완화**:
  - 한국어 fine-tuning 강화 (한국어 우회 어미·체면 어휘 — Tier 3.4)
  - 분석가 톤 락인 (사용자 인식 굳히기 속도가 핵심)
  - "한국 인지노동자의 사고 패턴에 특화" 포지션 빨리 굳히기
  - 의료기기 트랙 명시적 회피 + "웰니스·자기관리" 트랙 유지
(출처: `bluebird_competitive_strategy_v1.md` §7)

## 11.5 1인 운영 위험

- **위험**:
  - 1인 SLA — 인터뷰 응답 회신 SLA (≤24시간) / 사례비 지급 SLA (≤1주) 미준수 시 신뢰 자산 손실
  - 인적 자원 부재 — production 사고 대응·법적 검토 단일 SPOF
- **완화**:
  - 비동기 인터뷰 모드 (5/3 결정) — 30분 1:1 옵션화 → 운영 부담 감소
  - SQL editor 직접 쿼리 + service_role cleanup function — 자동화
  - G2 통과 후 첫 합류 (CFO·콘텐츠·임상 자문)

## 11.6 Gemini API 의존도

- **위험**: 분석 품질이 Gemini Flash 성능에 직접 묶여 있음. 모델 deprecation·가격 변경·정책 변경 리스크.
- **완화**:
  - 분석 품질 자체 메트릭 (mig 08 — `analytics_events`)
  - 4겹 방어: 0개 반환 제약 + 한국어 hedge 가이드 + retry + few-shot 7번째 케이스 (commit `8880f18`)
  - 장기적 멀티 프로바이더 fallback 검토 (Claude Haiku 등 — Tier 2 운영 트랙)

---

# 12. 부록

## A. 약관·개인정보처리방침·면책 핵심

### A.1 약관 (`app/terms/page.tsx`)

- 이용약관 — "회사" → "운영자" 정정 완료 (commit `1ee6df4`).
- 만 14세 이상 가입 — Supabase auth signup [필수] 체크.
- 미통과 시 (β') — 응모 폼 필수 항목 동의.

### A.2 개인정보 처리방침 (`app/privacy/page.tsx`)

PIPA §22 항목별 점검 (`legal-review-2026-05-04.md` §1):

| 항목 | 정합 상태 |
|---|---|
| 처리 목적 | OK |
| 처리 항목 | OK |
| 보유 기간 | OK (이용 기간 / 탈퇴 후 30일 유예) |
| 제3자 제공 | OK (판매·제공 X) |
| 위탁 (Supabase·Vercel·Gemini) | Major #1 — 위탁 기간·재위탁 조건 보완 필요 |
| 정보주체 권리 | OK |
| 파기 절차·방법 | OK |
| 보호책임자 | Minor #1 — *이름* 미명시 (G3 검토) |
| 처리방침 변경 절차 | OK |
| 국외이전 동의 (PIPA §28-8) | Major #2 — 별도 체크박스 권고 |
| 안전성 확보 조치 | OK (bcrypt·HTTPS·RLS·1인 접근) |

### A.3 면책 (`app/disclaimer/page.tsx`)

- 본 도구는 *치료가 아닌 자가 인지 코칭*
- 정신과적 위기 시 1393·1577-0199 우선
- 데이터는 본인 외 누구도 임의 열람 X

## B. 학술 출처 (전체 인용)

### B.1 1차 자료 (PDF 보유)

1. **Kahneman, D., & Tversky, A.** (1979). Prospect Theory: An Analysis of Decision under Risk. *Econometrica*, 47(2), 263-291.
   - `docs/research/sources/Kahneman_Tversky_1979_Prospect_theory.pdf`
2. **Kahneman, D.** (2011). *Thinking, Fast and Slow*. Farrar, Straus and Giroux.
   - `docs/research/sources/Daniel Kahneman-Thinking, Fast and Slow.pdf` (533p)
3. **Heuer, R. J. Jr.** (1999). *Psychology of Intelligence Analysis*. Center for the Study of Intelligence, CIA.
   - `docs/research/sources/Psychology_of_Intelligence_Analysis.pdf`
4. **Camus, A.** (1942). *The Myth of Sisyphus*. Gallimard.
   - `docs/research/sources/Myth of Sisyphus.pdf` (129p)

### B.2 2차 인용 (BlueBird 코드·문서 인용)

5. **Beck, A. T.** (1976). *Cognitive therapy and the emotional disorders*. International Universities Press. — 인지 왜곡 5종 분류 근거 (`lib/ai/bluebird-protocol.ts:45~84`)
6. **Beck, A. T., Rush, A. J., Shaw, B. F., & Emery, G.** (1979). *Cognitive Therapy of Depression*. Guilford Press. — 자동 사고 진단 단위 근거.
7. **Wells, A.** (2009). *Metacognitive Therapy for Anxiety and Depression*. Guilford Press. — CAS 모델 근거 (`BLUEBIRD_THEORY_SUMMARY.metacognition`).
8. **Wells, A.** (2000). *Emotional Disorders and Metacognition: Innovative Cognitive Therapy*. Wiley.
9. **Deci, E. L., & Ryan, R. M.** (2000). The "What" and "Why" of Goal Pursuits: Human Needs and the Self-Determination of Behavior. *Psychological Inquiry*, 11(4), 227-268. — autonomy_score (§4.2.2) 산식 근거.
10. **Ryan, R. M., & Deci, E. L.** (2017). *Self-Determination Theory: Basic Psychological Needs in Motivation, Development, and Wellness*. Guilford Press. — SDT 보충 (§2.7).
11. **Hawker, G. A., Mian, S., Kendzerska, T., & French, M.** (2011). Measures of adult pain. *Arthritis Care & Research*, 63(S11), S240-S252. — NRS-11 척도 표준 (§4.1.4).

## C. 문서 cross-reference

### C.1 strategy/

- `docs/strategy/positioning-and-vision-v1.md` — 통합 기준점 (한 줄 정의·1차 타겟·차별화·미션·PMF 정의·비목표·본질 위협)
- `docs/strategy/pmf-validation-plan.md` — 살아있는 문서. 가설·임계·트리거 (§11 부록)
- `docs/strategy/bluebird_competitive_strategy_v1.md` — 디스턴싱 정밀 비교·차별화 3축·가드레일
- `docs/strategy/bluebird_retention_mechanisms_v1.md` — 매뉴얼·통계 맥락화 메커니즘·H1~H6 가설
- `docs/strategy/bluebird_stress_integration_review_v1.md` — 입력 vs 결과 원칙·라벨 결정 트리거
- `docs/strategy/design-realignment-v1.md` — P0 A1~A8 / P1 B1~B4 / 진행 상태 추적
- `docs/strategy/development-backlog.md` — Tier 0~3 + 운영 트랙 + 결정 게이트

### C.2 im1/

- `docs/im1/recruitment-package-2026-05-03.md` — 6 채널 분석 + 5 카피 + 5문항 스크리닝 + CEO 4 결정
- `docs/im1/coding-rubric-v1-2026-05-04.md` — 27 카테고리 251 sample + Cohen's κ ≥ 0.7
- `docs/im1/legal-review-2026-05-04.md` — 1 Critical / 8 Major / 9 Minor

### C.3 qa/

- `docs/qa/e2e-scenario-im1-prerequisite.md` — 9 단계 시나리오 + 24h 단축 SOP

### C.4 meetings/

- `docs/meetings/2026-05-03-all-hands-priority-agenda.md` — 9명 발언 라운드 + 충돌 토론 + prerequisite 1~6
- `docs/meetings/org-chart-2026-05-03.html` — 조직 구성 시각화

### C.5 research/

- `docs/research/README.md` — 4종 자료 + 활용 트리거
- `docs/research/sources/` — 4 PDF 원문
- `docs/research/summaries/` — 1~2페이지 markdown 요약 (트리거 발생 시 추가)
- `docs/research/stats/` — 한국 정신건강 통계 (외부 보강 시 추가)

## D. 코드 라우트·핵심 파일 인덱스

### D.1 사용자 facing 라우트 (page.tsx)

```
/                              app/page.tsx                                 (랜딩)
/dashboard                     app/dashboard/page.tsx                       (홈)
/journal                       app/journal/page.tsx                         (일지)
/log                           app/log/page.tsx                             (기록)
/log/success                   app/log/success/page.tsx                     (성공 기록)
/analyze/[id]                  app/analyze/[id]/page.tsx                    (분석)
/action/[id]                   app/action/[id]/page.tsx                     (액션·자율성)
/checkin                       app/checkin/page.tsx                         (체크인)
/checkin/history               app/checkin/history/page.tsx                 (체크인 history)
/review/[id]                   app/review/[id]/page.tsx                     (재평가)
/insights                      app/insights/page.tsx                        (인사이트)
/visualize/[id]                app/visualize/[id]/page.tsx                  (시각화)
/manual                        app/manual/page.tsx                          (기술 매뉴얼)
/me                            app/me/page.tsx                              (마이)
/me/delete-account             app/me/delete-account/page.tsx               (탈퇴)
/account/recover               app/account/recover/page.tsx                 (복구)
/onboarding/[act]              app/onboarding/[act]/page.tsx                (온보딩 9 슬라이드)
/beta-incentive                app/beta-incentive/page.tsx                  (베타 혜택)
/our-philosophy                app/our-philosophy/page.tsx                  (철학)
/disclaimer                    app/disclaimer/page.tsx                      (면책)
/terms                         app/terms/page.tsx                           (이용약관)
/privacy                       app/privacy/page.tsx                         (개인정보 처리방침)
/safety/resources              app/safety/resources/page.tsx                (위기 자원)
/install                       app/install/page.tsx                         (PWA 설치)
/auth/login                    app/auth/login/page.tsx                      (로그인)
/auth/signup                   app/auth/signup/page.tsx                     (가입)
/auth/callback                 app/auth/callback/page.tsx                   (이메일 인증)
/(public)/sample               app/(public)/sample/page.tsx                 (sample funnel 진입)
/(public)/sample/[caseId]      app/(public)/sample/[caseId]/page.tsx        (케이스별 결과)
/setup-required                app/setup-required/page.tsx                  (마이그레이션 부재 안내)
```

### D.2 API 라우트 (route.ts)

```
POST /api/analyze                app/api/analyze/route.ts                   (분석 — Gemini)
POST /api/generate-questions     app/api/generate-questions/route.ts        (소크라테스 질문 생성)
POST /api/action                 app/api/action/route.ts                    (액션·autonomy_score)
POST /api/intervention/answers   app/api/intervention/answers/route.ts      (user_answers UPDATE)
POST /api/checkin                app/api/checkin/route.ts                   (아침/저녁 체크인)
POST /api/success-log            app/api/success-log/route.ts               (성공 순간 기록)
POST /api/safety/override        app/api/safety/override/route.ts           (위기 우회)
POST /api/review/pain-score      app/api/review/pain-score/route.ts         (재평가 점수)
POST /api/review/dismiss         app/api/review/dismiss/route.ts            (재평가 카드 dismiss)
POST /api/onboarding/complete    app/api/onboarding/complete/route.ts       (온보딩 완료)
```

### D.3 핵심 lib

```
lib/ai/bluebird-protocol.ts                   — 운영 원칙 4종 + 이론 요약 + 5종 왜곡 + 7 few-shot
lib/openai/gemini.ts                           — Gemini Structured Output Schema + retry + 폴백
lib/intervention/autonomy-score.ts             — calcAutonomyScore + AUTONOMY_NOTE_BONUS=15
lib/safety/detect.ts                           — 2단계 keyword + LLM 위기 감지
lib/safety/keyword-screener.ts                 — 키워드 스크리너
lib/safety/llm-classifier.ts                   — LLM 재분류
lib/safety/prompt-sanitize.ts                  — 프롬프트 인젝션 방어
lib/safety/gemini-adapter.ts                   — createSafetyLlmClient
lib/security/ai-guard.ts                       — MAX_AI_TEXT_LENGTH 가드
lib/security/rate-limit.ts                     — consumeRateLimit
lib/utils/archetype.ts                         — getArchetypeResultFromRows
lib/content/archetypes.ts                      — 5종 archetype 1:1
lib/content/technical-manual.ts                — 매뉴얼 컨텐츠 6 섹션
lib/onboarding/slides.ts                       — 9 슬라이드 메타데이터
lib/insights/pattern-report.ts                 — "당신의 사고 지문" 섹션
lib/review/delta-pain.ts                       — sumPositiveDeltaPain
lib/review/pending-review.ts                   — findPendingReview
lib/utils/streak.ts                            — calculateStreak
lib/utils/rank.ts                              — getRankResult
lib/analytics/server.ts                        — trackAnalysisQuality (analytics_events)
lib/logging/server-logger.ts                   — logServerError + PII 마스킹
lib/supabase/server.ts                         — createServerSupabaseClient
lib/supabase/client.ts                         — supabase (브라우저)
```

### D.4 마이그레이션 파일

```
supabase/migrations/01_initial_schema.sql       — logs · analysis · intervention + RLS
supabase/migrations/02_protocol_fields.sql      — 분석 protocol 컬럼 9종
supabase/migrations/03_safety_events.sql        — safety_events
supabase/migrations/04_logs_pain_score.sql      — pain_score INT (mig 13에서 0~10으로 확장)
supabase/migrations/05_intervention_reevaluation.sql — Δpain 컬럼 3종 (mig 13에서 0~10 확장)
supabase/migrations/06_trigger_category.sql     — 8종 enum CHECK
supabase/migrations/07_account_deletion.sql     — 탈퇴 함수 4종
supabase/migrations/08_analytics_events.sql     — 분석 품질 메트릭
supabase/migrations/09_user_patterns_aggregates.sql — 매뉴얼·통계 데이터 + N≥50 가드
supabase/migrations/10_onboarding_completed.sql — user_onboarding
supabase/migrations/11_checkins.sql             — checkins
supabase/migrations/12_schema_drift_fixes.sql   — log_type · DELETE 정책 · completion_note
supabase/migrations/13_pain_score_range_0_10.sql — NRS-11 정렬 (1~5 → 0~10)
```

### D.5 컴포넌트 (재사용 UI)

```
components/ui/StreakBanner.tsx                 — 스트릭 배너 (분석가 어휘 — design-realignment P0 A4)
components/ui/ArchetypeCard.tsx                — archetype 카드
components/ui/ArchetypePanel.tsx               — archetype 상세 패널
components/ui/BottomTabBar.tsx                 — 하단 탭바 (온보딩 시 미표시)
components/ui/InfoTooltip.tsx                  — 툴팁
components/ui/InfoSheet.tsx                    — 시트
components/ui/PageHeader.tsx                   — 페이지 헤더
components/ui/SkeletonCard.tsx                 — skeleton 로딩
components/review/ReviewCard.tsx               — 재평가 카드
components/charts/theory-value-curve-chart.tsx — 전망이론 가치 곡선 차트
```

---

## 부록 D.6 — 본 문서 자체 cross-check

본 문서가 *추정·가정*을 포함하지 않음을 보장하기 위한 self-check:

| 주장 | 출처 | 검증 |
|---|---|---|
| 인지 왜곡 5종 enum | `lib/ai/bluebird-protocol.ts:45~84` + mig 01 line 18~26 | ✓ |
| Δpain 산식 | mig 04·05·13 + 온보딩 Act 3-2 (NRS-11 0~10 정합) | ✓ |
| autonomy_score 산식 v2 (SDT 정합) | `lib/intervention/autonomy-score.ts` + `app/api/action/route.ts:107~133` | ✓ |
| λ ≈ 2.25 | `BLUEBIRD_THEORY_SUMMARY.prospectTheory.lossAversion` + 온보딩 Act 2-3 | ✓ |
| loss_aversion_signal 0~1 | mig 02 CHECK + `BLUEBIRD_FEW_SHOT_CASES` 사례 | ✓ |
| CAS 신호 0~1 (rumination·worry) | mig 02 CHECK + few-shot | ✓ |
| AI 신뢰구간 (frame_type·probability_estimate) | mig 02 CHECK + Gemini Schema | ✓ |
| 기록 빈도 한도 일 5건 | `app/api/analyze/route.ts:201~231` | ✓ |
| 재평가 시점 24h (실 6~48h) | mig 05 코멘트 + 인덱스 | ✓ |
| archetype 매칭 | `lib/utils/archetype.ts:42~67` + `lib/content/archetypes.ts` | ✓ |
| N≥50 표본 가드 | mig 09 `compute_pattern_stats(min_n INT DEFAULT 50)` | ✓ |
| 자발 언급 ≥30% 게이트 | PMF plan §0 정의 | ✓ |
| 30일 잔존 ≥15% 게이트 | PMF plan §0 정의 | ✓ |
| 결제 의향 ≥20% 게이트 | PMF plan §0 정의 | ✓ |
| 1차 타겟 3축 (직무 무관) | positioning §2 + commit `64ad52f` | ✓ |
| 차별화 3축 | positioning §4 + competitive §4 | ✓ |
| 7 학술 백본 (CBT·DPT·Prospect·CAS·Heuer·Camus·SDT) | research README + bluebird-protocol.ts + 온보딩 caption + §2.7 SDT | ✓ |
| 13 마이그레이션 | `supabase/migrations/01~13` | ✓ |
| 30 라우트 | `find app -name "page.tsx"` 결과 | ✓ |
| 10 API 라우트 | `find app/api -name "route.ts"` 결과 | ✓ |

---

## 부록 D.7 — 알려진 이슈·drift

본 문서 작성 과정에서 발견한 코드·문서 drift 항목 (sprint 2 정정 검토 대상):

1. ~~**pain_score 라벨 drift**~~: **2026-05-04 해소** — mig 13으로 코드·온보딩 모두 NRS-11 0~10으로 정합. (이전 상태: 코드 1~5 vs 온보딩 0~10).
2. ~~**본 문서가 사용한 사례 수치**~~: **2026-05-04 해소** — 온보딩 캡션 "고통이 8에서 3으로 줄었다면" 카피와 코드 모두 0~10으로 정합. 라벨 자체도 senior-ux-researcher 검토 결과 "통증" → "고통"으로 통일.
3. ~~**autonomy_score 산식 학술 근거 부재**~~: **2026-05-04 해소** — autonomy_score v2 (Deci & Ryan, 2000 SDT autonomy 차원 정렬). PMF plan §11.3 *학술 근거 없는 게임화* 보류 사유 해소. 단 인터뷰 *모호함·불신* ≥20% 시 framing 보강 트리거는 유지.
4. **온보딩 9 슬라이드 한 줄 정의 surface 어휘**: "디버깅"이 모집 공고에서 surface 어휘로 박혀 있어 인터뷰 자발 언급 카운트 X 가드 적용 (`coding-rubric §0 #1`).
5. **`analytics_events` SELECT 정책 *없음***: 운영자만 service_role로 조회 — Supabase SQL editor 직접 책갈피.
6. **`compute_pattern_stats()` G3 통과 + 자발 언급 ≥10% 트리거 후만 호출**: 베타 단계 함수 정의만 (mig 09).
7. **iPhone SE 320px 실기 테스트**: G1 prerequisite 미진행 — 5/4 designer 실기 (회의록 §2.4).
8. **pre-commit hook 본 작업 무관**: 본 작업은 markdown 1 파일 신규만 — tsc·vitest 영향 0건. lint:copy는 .ts/.tsx만 검사라 영향 0.

---

## 부록 D.8 — 본질 위협 가드 점검 (CPO 직접)

본 문서 §0~§12 카피 sweep — 본질 위협 신호 #1~#6 + 의료기기 함의 + 직무 narrowing + 캐릭터·이모지:

| 가드 | 어휘 | 본 문서 surface | 결과 |
|---|---|---|---|
| #1 정서·치유 톤 | 함께·위로·치유·마음을 안아·괜찮아·힘내·곁에 | 0건 (디스턴싱·하루콩 톤 분석 §3.3 인용 외 0) | ✓ |
| #2 디자인 수렴 | 파스텔·자연 사진·감성 일러스트 | 0건 | ✓ |
| #3 입구 어휘 | 스트레스 관리·스트레스 받으셨나요 | 0건 (입력 vs 결과 분석 §11.4 인용 외 0) | ✓ |
| #4 정기 자기 라벨링 | 모닝/이브닝 알림 | 0건 (위반 사례 인용 외 0) | ✓ |
| #5 디스턴싱 가격 수렴 | 월 8~10만원 | 0건 (가격 가설 §3.3.2 비교 인용 외 0) | ✓ |
| #6 동반 동기 | 외롭지 않게·혼자가 아니에요 | 0건 (위반 사례 인용 외 0) | ✓ |
| 의료 함의 | 임상 검증·치료 효과·DTx 직접 적용 | 0건 (DTx 경쟁자 분석 인용 외 0) | ✓ |
| 직무 narrowing | BA·PM·엔지니어·컨설턴트·연구자 enumerate | 0건 (오히려 §0.3·§7.1·rubric §부록 인용에서 *예시일 뿐 한정 X* 명시) | ✓ |
| 강한 어휘 | 평생·항상·반드시 | 0건 (단정 회피) | ✓ |
| 사용자 셀프 라벨 | "분석가" 사용자 자처 surface | 0건 (rubric A2 sample "분석적 자기이해" 표현은 측정 의도 어휘 — 사용자 자처 X) | ✓ |
| 부정 명제 surface | "치료가 아니다" | ≥1건 (의료기기 함의 차단 의도 — §0 / §1 / §3.1.1 / §3.1.3) | ✓ (의도적) |

전체 결과: **본질 위협 가드 점검 ALL PASS**.

---

## 마무리

본 문서는 *베타 단계 BlueBird MVP의 분석가 톤 종합 소개* 자료입니다. 다음 시점에 갱신 권고:

- IM.1 인터뷰 30명 코딩 결과 도착 시 (자발 언급 분포·디스턴싱 자발 언급·가격 분포)
- G2 통과/미통과 결정 시 (피벗 결정 포함)
- G3 통과 시 (외부 마케팅 활성·매뉴얼 v1.0 정식 출시·통계 노출)
- 본질 위협 신호 발생 시 (즉시 sweep)

본 문서는 *기준점*이지 *살아있는 문서*는 아닙니다. 빈번한 변경은 PMF plan(`docs/strategy/pmf-validation-plan.md`)에서, 본 문서는 분기별 통합 갱신.

— Project BlueBird (1인 운영 / 베타 단계 invite-only)
연락: 응모 폼 / `seob6615@gmail.com`
