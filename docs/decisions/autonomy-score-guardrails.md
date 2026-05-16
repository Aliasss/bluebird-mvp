# 자율성 지수 — 거부 후보 Decision Lock

**작성:** 2026-05-16 (CSO 결의, CPO+CMO 합의)
**근거 회의:** Plan agent 합동 검토 (CSO-4 권장)
**상위 결정잠금:** `docs/strategy/positioning-and-vision-v1.md` §0 / `docs/meetings/2026-05-16-purpose-and-expansion-deep-dive.md` §5·§6
**적용 범위:** 자율성 지수 5단계 로드맵 · 점수 산출 · 단계 전이 · 회고 UI 모든 영역

---

## 0. 본 문서의 목적

자율성 지수 강화 회의에서 반복 surface될 가능성이 있으나 **SDT (Self-Determination Theory, Deci & Ryan 1985, 2000) 또는 BlueBird 차별화 3축을 위반하는 후보**를 명시적으로 등재한다. 향후 동일 제안이 회의에 재진입할 때 본 문서를 reference하여 재논의 비용 차단.

> **거부 == 회의 차단이 아님.** 거부 사유가 사라지거나 (예: 학술적 반증·차별화 축 변경) 새 근거가 surface될 때만 본 문서 갱신을 통해 재검토 가능.

---

## 1. 거부 후보 6종

### 1.1 단계 업그레이드 시 푸시·뱃지·축하 모션 (외부 보상 형태)

**거부 사유:** Deci & Ryan (1985) — 외부 보상(extrinsic reward)이 자기 행위에 의미 부여를 외주화하여 내재 동기(intrinsic motivation)를 잠식한다. 단계 진입 자체가 의미 있는 자기 변화 신호인데, 시스템이 별개의 *추가 자극*을 부여하면 사용자가 "단계 진입의 의미" 대신 "보상 자체"에 anchor한다.

**대체:** 분석가 톤 인터스티셜(권장안 A) — *축하가 아닌 상태 변화의 surface*. "관찰 → 분류로 전이. 지금까지 N건 기록" 같이 정량 회고 + 자기 인식.

### 1.2 Streak · 연속 일수 카운터

**거부 사유:** `docs/strategy/bluebird_retention_mechanisms_v1.md` §1 결정. 의무감 동력(obligation)은 BlueBird 미션 "자율성 회복"과 충돌. 사용자가 "오늘 streak 끊기지 않으려고" 사용하면 SDT autonomy 차원이 *외부 통제*(external regulation)로 전락.

**대체:** 누적 점수·단계 자체가 충분한 회고 자산.

### 1.3 점수 ranking · 친구 비교 · 리더보드

**거부 사유:** 차별화 축 #2 "운영자 자기상" 파괴. 외부 비교(social comparison) → 자기 평가가 외부 기준에 종속. SDT 정합 위반 (autonomy = 자기 가치 평가의 내재화).

추가: `docs/im1/coding-rubric-v0.1-im1-quickstart.md` C10 (사회적 비교 트리거)에 BlueBird가 사용자 인지 왜곡을 *유발*하는 모순.

**대체:** 자기 시계열 비교만 (이전 자기 vs 현재 자기).

### 1.4 max 30 천장 단순 상향 (예: max 30 → 50)

**거부 사유:** `lib/intervention/autonomy-score.ts` v2 산식의 SDT 정합 근거 훼손. 현 max 30 = `AUTONOMY_ANSWER_CAP 15 (3답변 × 5) + AUTONOMY_NOTE_BONUS 15`. 답변 횟수 한계효용 가정(3답변이 자기 검증의 충분조건) 위반 시 점수 인플레이션 발생 + 단계 임계 의미 약화.

**대체:** 운영 단계(500+) 도달 후 *질적 메트릭* surface (CPO-5: "운영 단계 N개월 차", "검증 패턴 N건"). 점수 자체가 아닌 자기 자산 누적으로 의미 부여.

### 1.5 단계 진입 강제 푸시 알림

**거부 사유:** 푸시 인프라(`docs/strategy/push-infra-review-2026-05-09.md` §5.4 결정잠금) — Web Push는 데일리 체크인 리마인더 1종만. 단계 진입 알림 추가는 결정잠금 위반.

추가: 1.1과 동일한 SDT 논리 — 외부 자극이 단계 진입의 의미를 잠식.

**대체:** 인터스티셜은 *사용자가 앱에 진입했을 때만* 표시 (push 발송 X).

### 1.6 동의 없는 친구 공유 유도 카드

**거부 사유:** 1.3과 인접 — 외부 비교 메커니즘 직접 트리거. *사용자가 자발적으로* 공유하는 export 도구(CMO-1)는 SDT 정합이지만, 시스템이 "친구에게 공유해보세요" 같은 카피로 유도하는 형태는 거부.

**대체:** 단계 전이 인터스티셜의 캡션이 *자기 기록용* 어휘만 사용 ("2026-05-16, 분류 단계 진입"). 공유 버튼·SNS 통합 X. 사용자가 직접 스크린샷 찍을 수는 있음.

---

## 2. 거부 후보 식별 가드 (lint·운영)

신규 자율성 지수 관련 카피·UI 변경 시 다음 패턴 검출 시 즉시 검토 escalation:

| 패턴 | 카테고리 |
|---|---|
| `축하`, `뱃지`, `훈장`, `배지` | 1.1 외부 보상 |
| `연속`, `streak`, `N일째` (점수/단계 맥락) | 1.2 streak |
| `친구`, `랭킹`, `리더보드`, `비교`, `또래` | 1.3 ranking |
| `max ?? → \d{2,}` (autonomy-score.ts diff) | 1.4 천장 상향 |
| 푸시 카피에 `단계`, `등급` | 1.5 단계 강제 푸시 |
| `공유해보세요`, `친구에게`, `SNS` | 1.6 친구 공유 유도 |

`scripts/lint-copy.ts`의 `META_AVOIDANCE_PATTERNS`와 동일 카테고리로 확장 검토 (별도 후속 작업, IM.1 후).

---

## 3. 허용 메커니즘 (참고)

거부 6종과 대비되는 *허용된 강화 방향*:

| 메커니즘 | 근거 |
|---|---|
| 단계 전이 인터스티셜 (분석가 톤 회고) | 자기 인식 강화 — SDT autonomy 차원 |
| 대시보드 단계 surface + 역량 description | 자기상 = 운영자 (차별화 축 #2) |
| 단계별 토스트 카피 차등 | 같은 행위의 의미 변화 = 자기 인식 |
| 매뉴얼 export (Stage 1+) | 자기 자산화 — *공유 강제 X* |
| 인사이트 timeline marker | 자기 변화 궤적 시각화 — 자기 인식 |
| 정형 회고 카피 (각 단계 1문장) | 자기 표현 도구 |

---

## 4. 운영 절차

본 문서는 *결정잠금 문서*. 다음 절차로만 갱신 가능:

1. **거부 후보 추가**: CSO 또는 risk-manager 발의 + CPO 동의 + 회의록 cross-ref
2. **거부 후보 해제**: 학술 반증·차별화 축 변경 시 — 3 조직 합동 회의 필요 (이번 문서 작성과 동일 형식)
3. **분기 점검**: 매 분기 1회 본 문서 6항목 + 신규 surface된 거부 후보 정합성 점검

---

## 5. 상위 문서 참조

- `docs/strategy/positioning-and-vision-v1.md` §0 — BlueBird 본질 3단계
- `docs/strategy/bluebird_retention_mechanisms_v1.md` §1 — streak 거부 근거
- `docs/strategy/push-infra-review-2026-05-09.md` §5.4 — 푸시 결정잠금
- `docs/meetings/2026-05-16-purpose-and-expansion-deep-dive.md` §5·§6 — 외부 보상·게임화 거부 결의
- `docs/im1/coding-rubric-v0.1-im1-quickstart.md` C10 — 사회적 비교 트리거 카테고리
- `lib/intervention/autonomy-score.ts` — v2 산식 SDT 정합 근거 (AUTONOMY_MAX 30 보존)
