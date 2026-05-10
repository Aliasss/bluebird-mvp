# `/our-philosophy` 콘텐츠 가독성 개선 — UX·CPO·Risk Manager 통합 검토

**작성일:** 2026-05-10
**작성자:** Operator (UX Researcher 주도, CPO·Risk Manager 리뷰 통합)
**상태:** Brainstorming 완료, 구현 대기
**연관 파일:** `app/our-philosophy/page.tsx`, `scripts/lint-copy.ts`
**연관 결정:** §5.4 결정잠금 항목 (본 spec)

---

## 0. 한 줄 요약

> **`/our-philosophy` 본문에 등장하는 의료 인접·전문 어휘 7개를 일상어로 대체하되, 통계 카드·출처·CITATIONS의 학술 어휘는 정체성 자산으로 보존.** lint-copy MEDICAL_PATTERNS에 의료 함의 어휘 3개를 추가해 향후 회귀 차단.

---

## 1. UX Researcher 검토 (어휘별 대체안)

### 1.1 처리 매트릭스 (7개 어휘 + 동질 가드레일 어휘)

| 위치 | 변경 전 | 변경 후 |
|---|---|---|
| §05 body | "**부적응적 정서조절 전략**(회피·억제·반추)은 다양한 **정신병리**에서 일관된 효과크기로 보고됩니다. BlueBird는 이 전략들을 측정 가능한 출력으로 분류합니다." | "회피·억제·반추처럼 단기엔 편하지만 장기엔 문제를 키우는 **감정 대처 방식**은 여러 **심리적 어려움**에서 일관된 영향력으로 보고됩니다. BlueBird는 이 대처 방식을 측정 가능한 출력으로 분류합니다." |
| §06 subtitle | "**개입 표적**의 재정의" | "**관찰·훈련 초점**의 재정의" |
| §06 body | "**병리적 불안군**의 회피적 의사결정에서 가장 강력한 설명 변수는 손실 자체에 대한 민감도가 아니라 결과 불확실성에 대한 민감도입니다. **개입 표적**은 손실 둔감화가 아니라 불확실성 인내력 향상으로 정의됩니다." | "**불안이 강한 사람들**의 회피적 결정에서 가장 강한 설명 변수는 손실 자체에 대한 민감도가 아니라 결과가 불확실한 상황에 대한 민감도입니다. **관찰·훈련의 초점**은 '손실에 무뎌지는 것'이 아니라 '결과가 불확실한 상황을 견디는 능력 키우기'로 정의됩니다." |
| §06 stat.label | "**개입 표적**의 재정의" | "**관찰·훈련 초점**의 재정의" |
| §08 body | "**회피 대처 양식**은 9년 종단 추적에서 불안의 **발병**뿐 아니라 **만성 경과**를 예측합니다. 단기적 불안 감소가 장기적으로 학습·성장 차단으로 누적됩니다 ..." | "**회피로 반응하는 습관**은 9년간 추적에서 불안이 **처음 생기는 시점**뿐 아니라 **오래 지속되는 흐름**까지 예측합니다. 단기적 불안 감소가 장기적으로 학습·성장 차단으로 누적됩니다 ..." |
| CITATIONS `위험 회피 ≠ 손실 회피` | "**병리적 불안군**의 회피적 의사결정 — 결과 불확실성 민감도" | "**불안이 강한 사람들**의 회피적 의사결정 — 결과 불확실성 민감도" |
| CITATIONS `회피의 9년 곡선` | "회피 대처 양식의 **만성 경과** 예측 (9년 종단)" | "회피 대처 양식의 **장기 지속 경과** 예측 (9년 종단)" |

### 1.2 처리 원칙

| 영역 | 정책 | 근거 |
|---|---|---|
| 본문 (`section.body`) | **일상어 대체** | 사용자가 가장 오래 머무는 영역. 가독성 우선 |
| 통계 카드 (`stat.value`, `stat.label`) | **학술 어휘 유지** (단, 의료 함의 어휘는 예외 변경) | 신뢰 자산. 분석가 페르소나 보호 |
| 출처 (`stat.source`) + CITATIONS `source` (영문 인용) | **학술 원문 보존** | 정통성 신호. 한글 패턴과 무관 |
| CITATIONS 한국어 카테고리·data 라벨 | 학술 분류명은 유지, 의료 함의 어휘만 변경 | 정체성 vs 가드레일 균형 |
| 의료 함의 어휘 (`병리적`, `정신병리`, `발병`, `만성 경과`, `개입 표적`) | **본문 + 한국어 라벨에서 제거**, 영문 출처는 잔존 허용 | "의료기기 아님" 정체성 강화 |

---

## 2. CPO 검토 (정체성·전환 균형)

### 2.1 정체성 영향 매트릭스

| 정체성 자산 | 영향 |
|---|---|
| "분석 도구" 포지셔닝 | 통계 카드 라벨·출처 학술 유지 → **무영향** |
| "분석가형 페르소나" 신뢰 | 본문 일상어, 통계·출처 학술 — 두 자산이 분리 → 약간 약화, 통계로 보완 |
| "의료기기 아님" 카테고리 가드레일 | 본문에서 의료 어휘 제거 → **강화** |
| 카피 정체성 (분석·관찰 톤) | "관찰·훈련의 초점", "감정 대처 방식" 등 분석 동사 의도 사용 → **유지** |

### 2.2 전환 영향 가설

| 사용자 페르소나 | 영향 |
|---|---|
| 분석가형 (target) | 통계·출처 학술 톤 그대로 → 신뢰 자산 유지. 본문 가독성↑로 가입 결단 마찰↓ |
| 일반 호기심 사용자 | 본문 일상어 → 1회 정독 가능성↑. 가입 전환율 상승 가설 |
| 회피 사용자 (non-target) | 본문 진입 장벽↓. 다만 의도적으로 끌어들이지 않음 |

→ **target 페르소나 손실 0, 일반 호기심 사용자 가독성↑**. 비대칭 이득.

### 2.3 측정 instrumentation

본 변경의 효과는 별도 측정 인프라 없이 정밀 산출 어려움. 가능한 proxy:
- `/our-philosophy` 평균 체류 시간 (Vercel Analytics)
- `/our-philosophy → /auth/signup` 전환율
- IM.1 D14 회고 1문항: "철학 페이지 읽었는가"

본 스펙에서는 **측정 instrumentation 추가 안 함** (YAGNI). 운영 단계 데이터로 사후 검증.

---

## 3. Risk Manager 검토 (lint-copy 가드 + 카테고리 보호)

### 3.1 카테고리 가드레일 위반 회귀 방지

본 변경 후 어휘들이 **다른 곳에서 새로 들어오는 회귀**를 차단해야 함. 현재 `scripts/lint-copy.ts` MEDICAL_PATTERNS는 `교정/진단/치료` 3개만 차단.

**추가 권장 패턴 3건** (existing MEDICAL_NEGATION_PATTERNS 면책 그대로 적용):

```ts
// 의료기기 표현 — 본 스펙(2026-05-10)에서 추가
{ pattern: /병리적/g, label: '의료기기 표현 "병리적"' },
{ pattern: /정신병리/g, label: '의료기기 표현 "정신병리"' },
{ pattern: /발병/g, label: '의료기기 표현 "발병"' },
```

`개입` 단독 차단은 false positive 위험 큼 (예: "개입 효과", "조기 개입" 등 학술 분류명) → 추가하지 않음. `개입 표적`은 본 변경에서 1회 직접 처리.

### 3.2 차단 패턴별 false positive 위험 검토

| 패턴 | 본문 발생 가능 false positive | 처리 |
|---|---|---|
| `/병리적/g` | "병리적이지 않습니다" 같은 면책 어휘 → MEDICAL_NEGATION_PATTERNS로 자동 면제 | 안전 |
| `/정신병리/g` | "정신병리 분야에서…" 같은 학술 인용 — `app/our-philosophy/page.tsx` 에서는 본 변경으로 본문 0건. 그 외 파일은 등장 빈도 매우 낮음 | 안전 |
| `/발병/g` | "발병하지 않습니다", "발병률 통계는 별도" 같은 표현 — MEDICAL_NEGATION_PATTERNS로 면제 | 안전 |

기존 whitelist (`lib/content/technical-manual.ts`, `app/disclaimer/page.tsx`, `app/terms/page.tsx`, `app/safety/resources/page.tsx`, `components/safety/SafetyNotice.tsx`)는 그대로 적용 — 법적 면책·위기 자원 안내는 의료 어휘 의도적 사용 영역.

### 3.3 법적 함의 검토

| 어휘 | 변경 전 함의 | 변경 후 함의 |
|---|---|---|
| "병리적 불안군" | DSM-5 등 진단 분류 함의 → 사용자가 자신을 환자로 인식 가능 | "불안이 강한 사람들" → 일반 묘사. 진단 함의 ↓ |
| "정신병리" | 임상 용어 (psychopathology) | "심리적 어려움" → 비-임상 표현 |
| "발병" | 질병 onset 함의 | "처음 생기는 시점" → 중립 묘사 |
| "만성 경과" | 만성 질병(chronic disease) 함의 | "오래 지속되는 흐름" → 중립 |
| "개입 표적" | intervention target = 의료 시술 함의 | "관찰·훈련의 초점" → 도구적 표현, BlueBird 정체성 정합 |

**법적 자문 필요 여부:** 불요. 본 변경은 의료 함의를 **약화**하는 방향이며, 학술 출처 인용은 영문으로 보존 → 학술적 정통성 유지. `app/our-philosophy/page.tsx` 하단 "법적 공시" 섹션의 "BlueBird는 의료·치료 서비스가 아니며…" 문구는 그대로 유지되어 면책 기능 정합.

### 3.4 Risk Manager 결의

| 항목 | 결정 |
|---|---|
| 어휘 7개 + CITATIONS 2건 변경 | 승인 |
| lint-copy MEDICAL_PATTERNS 3건 추가 | 승인 (병리적·정신병리·발병) |
| `개입` 단독 패턴 추가 | **거부** (false positive 위험) — 본 변경 1회 처리로 충분 |
| 법적 면책 섹션 (`/our-philosophy` 하단) | **변동 없음** — 기존 문구 보존 |
| whitelist 추가 | 불요 — 변경 후 본문이 패턴 매칭 0건 |

---

## 4. 합의·결정잠금

### 4.1 양 조직 합의

| 관점 | 합의 |
|---|---|
| UX Researcher | 7개 어휘 + 2개 CITATIONS 라벨 일상어 대체. 통계 카드 라벨 1개(`개입 표적의 재정의` → `관찰·훈련 초점의 재정의`) 동반 변경 |
| CPO | 정체성 무손실, 가독성·가드레일 강화. 측정 instrumentation 본 스펙 외 |
| Risk Manager | lint-copy MEDICAL_PATTERNS에 `병리적/정신병리/발병` 3건 추가. `개입` 단독 차단은 거부. 법적 면책 섹션 보존 |

### 4.2 결정잠금 (변경 금지 항목)

본 스펙 적용 후 다음 결정은 별도 spec 개정 없이 변경 금지:

- ✅ 본문 영역 = 일상어 (분석가 톤 동사 의도적 보존)
- ✅ 통계 카드 (`stat.value`, `stat.label`) = 학술 어휘 유지 (단, 의료 함의는 예외 변경)
- ✅ 출처 (`stat.source`) + 영문 CITATIONS `source` = 학술 원문 그대로
- ✅ CITATIONS 한국어 라벨 = 학술 분류명 유지, 의료 함의만 일상어
- ✅ 의료 함의 어휘 5종 (`병리적`, `정신병리`, `발병`, `만성 경과`, `개입 표적`) = 본문에서 제거
- ✅ lint-copy MEDICAL_PATTERNS에 3건 (`병리적`, `정신병리`, `발병`) 추가 + 기존 negation exemption 적용
- ✅ 법적 면책 섹션 (`/our-philosophy` 하단) = 변동 없음

---

## 5. 변경 본문 (구현 reference)

### 5.1 SECTIONS 배열 (`app/our-philosophy/page.tsx` line 21~117)

**§05 (정서조절 전략 분류) — body 변경:**
```ts
{
  number: '05',
  title: '정서조절 전략 분류',
  subtitle: '측정 가능한 출력',
  body:
    '회피·억제·반추처럼 단기엔 편하지만 장기엔 문제를 키우는 감정 대처 방식은 여러 심리적 어려움에서 일관된 영향력으로 보고됩니다. BlueBird는 이 대처 방식을 측정 가능한 출력으로 분류합니다.',
  stat: {
    value: '회피·억제·반추',
    label: '측정 가능한 정서조절 전략',
    source: 'Aldao, Nolen-Hoeksema, & Schweizer (2010), Clinical Psychology Review',
  },
},
```

**§06 (위험 회피 ≠ 손실 회피) — subtitle, body, stat.label 변경:**
```ts
{
  number: '06',
  title: '위험 회피 ≠ 손실 회피',
  subtitle: '관찰·훈련 초점의 재정의',
  body:
    '불안이 강한 사람들의 회피적 결정에서 가장 강한 설명 변수는 손실 자체에 대한 민감도가 아니라 결과가 불확실한 상황에 대한 민감도입니다. 관찰·훈련의 초점은 \'손실에 무뎌지는 것\'이 아니라 \'결과가 불확실한 상황을 견디는 능력 키우기\'로 정의됩니다.',
  stat: {
    value: '위험 회피 ≠ 손실 회피',
    label: '관찰·훈련 초점의 재정의',
    source: 'Charpentier, Aylward, Roiser, & Robinson (2017), Biological Psychiatry, 81(12)',
  },
},
```

**§08 (회피의 9년 누적 곡선) — body 변경:**
```ts
{
  number: '08',
  title: '회피의 9년 누적 곡선',
  subtitle: '회피의 누적 효과',
  body:
    '회피로 반응하는 습관은 9년간 추적에서 불안이 처음 생기는 시점뿐 아니라 오래 지속되는 흐름까지 예측합니다. 단기적 불안 감소가 장기적으로 학습·성장 차단으로 누적됩니다 (예: 승진·발표·창의성·관계·장기 경력 회피).',
  stat: {
    value: '9년 종단',
    label: '회피의 누적 효과',
    source: 'Struijs, Lamers, Vroling, Roelofs, Spinhoven, & Penninx (2017), Psychiatry Research',
  },
},
```

### 5.2 CITATIONS 배열 (`app/our-philosophy/page.tsx` line 119~165)

**`위험 회피 ≠ 손실 회피` 항목 변경:**
```ts
{
  category: '위험 회피 ≠ 손실 회피',
  data: '불안이 강한 사람들의 회피적 의사결정 — 결과 불확실성 민감도',
  source: 'Charpentier, Aylward, Roiser, & Robinson (2017), Biological Psychiatry, 81(12)',
},
```

**`회피의 9년 곡선` 항목 변경:**
```ts
{
  category: '회피의 9년 곡선',
  data: '회피 대처 양식의 장기 지속 경과 예측 (9년 종단)',
  source: 'Struijs, Lamers, Vroling, Roelofs, Spinhoven, & Penninx (2017), Psychiatry Research',
},
```

### 5.3 lint-copy 패치 (`scripts/lint-copy.ts` line 63~67)

**MEDICAL_PATTERNS 배열에 3건 추가:**
```ts
const MEDICAL_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /교정(?!\s*(?:효능|치료))/g, label: '의료기기 표현 "교정"' },
  { pattern: /진단(?!명|서)/g, label: '의료기기 표현 "진단"' },
  { pattern: /(?<!인지행동)치료(?!학|법)/g, label: '의료기기 표현 "치료"' },
  // 본 spec(2026-05-10) 추가 — /our-philosophy 콘텐츠 가독성 개선과 동반
  { pattern: /병리적/g, label: '의료기기 표현 "병리적"' },
  { pattern: /정신병리/g, label: '의료기기 표현 "정신병리"' },
  { pattern: /발병/g, label: '의료기기 표현 "발병"' },
];
```

기존 `MEDICAL_NEGATION_PATTERNS` (`아닙니다`, `아니다`, `대체하지`, `대체하지 않`)는 신규 패턴에도 자동 적용 → "병리적이지 않습니다" 등 면책 어휘는 통과.

---

## 6. 검증 절차 (구현 시)

1. **Lint 통과 검증:** `npm run lint:copy` → MEDICAL violation 0건이 되어야 함 (변경 후)
2. **Type 체크:** `npm run lint` (= `tsc --noEmit`) → clean
3. **수동 검증 (production preview):** `/our-philosophy` 페이지 진입 → 8개 섹션 본문·CITATIONS 영역 시각 확인
4. **회귀 검증:** 다른 페이지(랜딩·대시보드·매뉴얼)는 무변동
5. **카테고리 가드레일 회귀 검증:** `npm run lint:copy`가 의도치 않은 다른 파일에서 false positive 만들지 않는지 확인 (만들 시 whitelist 추가 또는 면책 어휘 보강)

---

## 7. Out-of-Scope (본 spec 미포함)

- 나머지 18개 부담 어휘 (전망이론, 분산 분해, 편도체, R², λ 등) — 분석가형 페르소나 신뢰 자산으로 의도적 보존
- 측정 instrumentation (`/our-philosophy` 체류·전환 추적) — Phase 2 또는 운영 시 사후 검증
- 통계 카드에 ⓘ tooltip 추가 — 본 변경으로 본문 가독성 충분, 톨팁 불요 (YAGNI)
- 토글 (일상어 / 분석가 두 모드) — 1인 운영 MVP 범위 외
- `/manual`, `/insights` 등 다른 페이지의 어휘 검토 — 별도 spec
