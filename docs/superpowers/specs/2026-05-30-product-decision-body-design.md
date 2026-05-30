# Spec — 제품 의결체 정의 (거버넌스 동기화)

**문서 버전**: v1 (2026-05-30)
**상태**: design (CEO 결정 완료 — "제품 코어 4인 유지 + 이름 정리")
**유형**: 거버넌스 결정 기록 (SSOT)
**상위 기준점**: [`positioning-and-vision-v1.md`](../../strategy/positioning-and-vision-v1.md)·[org-chart-2026-05-30.html](../../meetings/org-chart-2026-05-30.html)

---

## 1. 배경 — "4 임원" 용어 충돌

CMO 임원·community-advocacy-manager 신설로 조직이 CEO + 15명이 되면서, "4 임원"이라는 표현이 **세 가지 다른 의미**로 뒤섞였다:

| 위치 | "4 임원"이 가리킨 것 | 문제 |
|---|---|---|
| 조직도 헤더 | CPO·CSO·CTO·CMO (실제 임원 4명) | ✅ 정확 |
| 조직도 협업표 "4 임원 합의" | CPO·CSO·designer·PO | ⚠️ designer·PO는 시니어인데 "임원"이라 호칭 |
| product-owner.md | CPO·CSO·CTO·designer·strategy-manager (5명) | ⚠️ "4"라 부르나 5명, 구성도 상이 |

→ "제품 의사결정 의결체가 누구인가"가 문서마다 달라 거버넌스 모호.

## 2. 결정 (CEO)

**제품 코어 4인 유지 + 이름 정리.** 제품 의결체 멤버는 그대로 두되, "임원" 호칭을 제거하고 임원 tier와 명확히 분리한다.

### 2.1 두 개념 정의 (SSOT)

| 개념 | 구성 | 정의 |
|---|---|---|
| **임원 tier** | CPO · CSO · CTO · CMO | 실제 C-level 4명. 조직도 헤더 "4 임원"은 *이 뜻으로만* 사용 |
| **제품 의결체** | CPO · CSO · product-designer · product-owner | 제품·기능 의사결정 상설 의결체 (구 "4 임원 합의") |

### 2.2 소집 규칙 (상설 의결체 + 사안별 합류)

| 사안 | 합류 | 패턴명 |
|---|---|---|
| 마케팅·획득 | + CMO | 마케팅·획득 합의 (기존) |
| 기술·회귀·migration | + CTO | 기술·회귀 합의 (기존) |
| 법적·안전·PIPA | + risk-manager | 법적·안전 합의 (기존) |
| 측정·연구 | + data-analyst·senior-ux-researcher | 측정·연구 합의 (기존) |

CMO·CTO는 제품 의결체 *상설 투표권은 아니며*, 자기 도메인 사안에서 소집된다. 임원 충돌 시 CEO 결정.

## 3. 변경 전 → 변경 후

| 파일 | 기존 | 변경 후 |
|---|---|---|
| [org-chart-2026-05-30.html](../../meetings/org-chart-2026-05-30.html) 협업표 | "4 임원 합의" / 참여자 CPO·CSO·designer·PO | **"제품 의결체"** / 동일 멤버 |
| 〃 product-owner 카드 | "4 임원 의견 통합" | "제품 의결체 의견 통합" |
| [product-owner.md](../../../.claude/agents/product-owner.md) frontmatter·보고선 | "4 임원(CPO·CSO·CTO·designer·strategy-manager) 의견 통합" | "제품 의결체(CPO·CSO·designer·PO) + 사안별 소집 임원·strategy-manager 의견 통합" |

## 4. 건드리지 않는 것 (의도적)

- 조직도 헤더 "4 임원 + 11 시니어" — 실제 임원 4명 뜻이라 정확, 유지
- 과거 org-chart(`2026-05-03`·`2026-05-10`) — 시점 스냅샷, 역사 기록 보존
- [design-realignment-v1.md](../../strategy/design-realignment-v1.md) "4 임원 전원 합의 (a)+(c)" (2026-04-30, 완료) — 과거 결정 기록 보존
- cpo·cso·product-designer 페르소나 — "4 임원 합의" 직접 참조 없음(grep 확인), 무변경

## 5. 후속·미해결

- 향후 신규 페르소나·임원 추가 시 본 문서의 §2.1 정의를 기준으로 동기화
- "제품 의결체" 명칭이 회의록·routine prompt에서 추가로 등장하면 본 정의로 정렬 (현재 weekly/daily prompt에는 "4 임원 합의" 직접 호출 없음 — daily-standup은 "임원 4명"=CPO·CSO·CTO·CMO로 별개 정합)
