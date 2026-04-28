# BlueBird Research Catalog

> 마지막 업데이트: 2026-04-28
> BlueBird의 이론적 배경이 되는 클래식 자료 인덱스. 활용 시점은 *인터뷰 데이터
> 수집 후*. 사용자 0명 단계에서 무리하게 prompt·UI에 박는 것은 motivated reasoning.

---

## 디렉토리 구조

```
docs/research/
├── sources/      # 원문 PDF (Read tool로 직접 읽기 가능)
├── summaries/    # 마크다운 요약 (작성 시점에 추가)
└── stats/        # 한국 정신건강 통계·임상 결과 (외부 보강 시 추가)
```

---

## 자료 목록 (sources/)

### 1. Kahneman & Tversky (1979) — Prospect Theory: An Analysis of Decision under Risk

- **파일**: `sources/Kahneman_Tversky_1979_Prospect_theory.pdf` (11페이지)
- **카테고리**: 행동경제학 · 손실 회피
- **BlueBird 활용 위치**:
  - `lib/ai/bluebird-protocol.ts` `BLUEBIRD_THEORY_SUMMARY.prospectTheory` — 이미 인용됨
  - 손실 가중치 계수 λ ≈ 2.25 — `/our-philosophy` §2에 인용됨
  - 분석 prompt의 `loss_aversion_signal` 산출 근거
- **활용 트리거**: 인터뷰에서 "손실 회피·결제 의향" 시그널이 약하면 prompt 정밀화
- **읽기 우선순위**: ★★★ (짧음 + 직접 적용)

### 2. Daniel Kahneman — Thinking, Fast and Slow

- **파일**: `sources/Daniel Kahneman-Thinking, Fast and Slow.pdf` (533페이지)
- **카테고리**: 이중 프로세스 이론 · System 1/2 · 인지 편향
- **BlueBird 활용 위치**:
  - `BLUEBIRD_THEORY_SUMMARY.dualProcess` — 이미 인용됨
  - 분석 prompt의 `system2_question_seed` 생성 원리
  - `/our-philosophy` §3 "번개처럼 스치는 불안, 별빛처럼 찾아오는 이성" — 10ms vs 3s
- **활용 트리거**: 인터뷰에서 *재평가 회로*가 약한 시그널이 잡히면 System 2 활성화 메커니즘 보강
- **읽기 우선순위**: ★★★ (전체 X, 챕터별 발췌)
- **권장 발췌 챕터**: Part 1 (Two Systems), Part 2 (Heuristics & Biases), Part 4 (Choices, 손실 회피)

### 3. Richards J. Heuer Jr. — Psychology of Intelligence Analysis

- **파일**: `sources/Psychology_of_Intelligence_Analysis.pdf`
- **카테고리**: 분석가의 인지 편향 · 가설 경쟁 분석
- **BlueBird 활용 위치**:
  - **경쟁 전략 v1 §4 차별화 1축 "분석가 톤"의 이론적 근거** — 가장 직접적 정합성
  - 분석 prompt의 *Distortion Reporting Threshold* 룰 강화 (가설 경쟁 분석 ACH 기법)
  - 향후 인터뷰 가이드 §3.3 임상 자문 후보 선정 시 분석가형 사용자 attribution 근거
- **활용 트리거**: 60일 게이트 §11.3 보류 항목 *"분석가 톤 마이그레이션"* 결정 시 reference로 사용
- **읽기 우선순위**: ★★★ (Part II 인지 편향 챕터 발췌)

### 4. Albert Camus — The Myth of Sisyphus

- **파일**: `sources/Myth of Sisyphus.pdf` (129페이지)
- **카테고리**: 실존주의 철학 · 부조리 · 자율성 회복
- **BlueBird 활용 위치**:
  - **미션 "자율성 회복"의 철학적 근거** — 직접 정합
  - `/our-philosophy` 보강 자원 (현재 6개 인용에 추가 가능)
  - 카피 톤 결정 시 reference (반항·자유·열정 = 분석적 항해사 정체성과 연결)
- **활용 트리거**: 60일 게이트 §11.3 보류 항목 *"분석가 톤 vs 정서적 톤"* 결정 시,
  분석직 세그먼트가 우세할 경우 *Camus적 분석가-항해사* 메타포 강화
- **읽기 우선순위**: ★★ (특정 챕터: An Absurd Reasoning, The Myth of Sisyphus 본문)

---

## 활용 정책

### 즉시 활용 (이미 코드에 박혀있음)
- Prospect Theory λ=2.25 — `BLUEBIRD_THEORY_SUMMARY`, `/our-philosophy` §2
- Dual Process 10ms vs 3s — `/our-philosophy` §3
- Loss aversion signal — 분석 prompt의 `loss_aversion_signal`

### 보류 → 트리거 후 활용

| 자료 | 트리거 | 활용 위치 |
|---|---|---|
| Heuer (분석가 편향) | 60일 게이트에서 분석직 세그먼트 ≥40% | prompt §Distortion Reporting Threshold + ACH 룰 |
| Camus (자율성·부조리) | 톤 인식 분포가 분석적 우세이면서 깊이 부족 시그널 | `/our-philosophy` 추가 섹션 + 카피 보강 |
| Kahneman 본문 | 재평가 회로 약함·System 2 활성화 부족 시그널 | prompt `decentering_prompt` 강화 |
| Prospect Theory 본문 | 결제 의향 임계 ≥20% 미달, 손실 프레이밍 약함 | prompt + 결제 페이지 카피 |

### 기각될 시나리오
인터뷰 결과 정서적 톤 우세 + 분석가 톤 시그널 약함 → Heuer는 활용하지 않음.
이 가능성도 PMF plan §11.4 의문 제기에 명시되어 있음.

---

## 추가 자료 받는 법

새 자료 도착 시:
1. PDF: `sources/`로 이동, 본 README에 항목 추가
2. 마크다운 요약: `summaries/`로 (논문이 paywall이거나 너무 길면)
3. 통계·표: `stats/`로
4. README 업데이트 — 자료별 *BlueBird 활용 위치* + *트리거* 명시 필수

---

## 관련 문서

- [`docs/strategy/pmf-validation-plan.md`](../strategy/pmf-validation-plan.md) — 자료 활용 트리거의 출처 (60일 게이트)
- [`docs/strategy/bluebird_competitive_strategy_v1.md`](../strategy/bluebird_competitive_strategy_v1.md) — 분석가 톤 차별화 축의 근거
- [`lib/ai/bluebird-protocol.ts`](../../lib/ai/bluebird-protocol.ts) — 자료가 prompt에 코드화되는 위치
