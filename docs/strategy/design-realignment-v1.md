# BlueBird 디자인 톤 정합 결정 (v1)

**문서 버전**: v1 (2026-04-29)
**대상 독자**: Claude Code, 파운더(CEO), product-designer, senior-fullstack-engineer, strategy-manager
**상태**: CEO 최종 승인 완료 (2026-04-29)
**관련 문서**:
- [`positioning-and-vision-v1.md`](./positioning-and-vision-v1.md) — 본질 위협 신호 6개·차별화 3축 (기준점)
- [`pmf-validation-plan.md`](./pmf-validation-plan.md) — IM.1 인터뷰 가이드 추가 항목
- [`development-backlog.md`](./development-backlog.md) — Tier 분류 (P0~P2 작업 추가 대상)
- [`bluebird_competitive_strategy_v1.md`](./bluebird_competitive_strategy_v1.md) — 디스턴싱과의 시각 차별화

**목적**: 2026-04-29 product-designer의 MVP 디자인 audit 결과 → CPO 리뷰 → CEO 최종 승인까지의 의사결정을 아카이빙. P0 즉시 진행 작업, P1·P2 보류·후속 작업, 인터뷰 검증 후 결정 항목, CEO 방향성 결정 3건의 *근거와 트레이드오프*를 보존하여 향후 실행·검증 시 일관성을 유지한다.

---

## 1. 발견된 본질 위협 신호 (CRITICAL)

### #1 카피 정서화 — HIGH

**집결지**: `app/our-philosophy/page.tsx`. 침투 영역: 랜딩(`app/page.tsx`), 대시보드 인사·체크인 카드, checkin 카피, analyze spinner·에러, action toast, manual 페이지 타이틀.

**대표 위반**:
- `app/our-philosophy/page.tsx:11` "잔잔한 호수 같은 바다… 파도가 거친 바다에서 태어나고"
- `app/our-philosophy/page.tsx:107-108` "배가 흔들리는 건 당신의 잘못이 아닙니다 / 배 안에 놓인 나침반이 잠시 자성을 잃었을 뿐입니다"
- `app/page.tsx:23` "흔들리는 마음의 영점을 맞추고, 당신의 삶을 다시 항해하세요"
- `app/page.tsx:26` "AI 인지 디버깅으로 불안의 안개를 걷어내고…"
- `app/dashboard/page.tsx:269` "{name} 항해사님 🧭"
- `app/analyze/[id]/page.tsx:457` "인지 나침반을 정교하게 맞추고 있어요"
- `app/manual/page.tsx:44` `PageHeader title="항해사 매뉴얼"` (본문은 분석가 톤 / 헤드만 항해 — 가장 모순적)

### #2 디자인 감성화 — MEDIUM-HIGH

- **이모지 39회**: dashboard 인사·체크인·스트릭·toast·등급(`🌅 🌙 🔥 🎉 ⚓ ⚡ 🧭`), pain selector(`😐 😟 😰 😱 🤯`), morning mood(`🎯 😌 ⚡ 😟 😪 💪 🤔`), FAB `✦`.
- **`our-philosophy` gradient hero**: `bg-gradient-to-b from-slate-900 via-primary-dark to-primary` (line 96, 132, 152) — `globals.css:23`에서 명시 제거한 정책 역행.
- 자연 사진·일러스트는 **0건** (raster 없음, lucide-react SVG만).

### 의료기기 표현 잔존
- `app/layout.tsx:9` description "**교정**"
- `public/manifest.json` 동일 description 사용
- `app/our-philosophy/page.tsx:68` "교정 효능" (학술 인용 맥락 — G3 변호사 검토 시 정렬)

### 보존 자산 (좋은 발견)
- `app/api/generate-questions/route.ts:17-21` AI 출력 카피 가드 정규식(`/괜찮아요/`·`/잘하고 있어/`·`/응원/`) 이미 운영 중. 정적 UI 카피 비대칭 → CI grep 확장 (P0 A8).

---

## 2. 차별화 정합성 점수 (vs 디스턴싱)

| 축 | 평가 | 근거 |
|---|---|---|
| 톤 (분석가 ↔ 정서) | **약함** | 외피·메시징 정서, 본문(analyze·insights·manual·sample) 분석가 — 내·외 비대칭 |
| 자기상 (운영자 ↔ 회복필요자) | **중립** | "항해사" 호칭이 운영자/모험가 사이 모호. 등급·스트릭은 RPG화 |
| 메타포 (디버깅·OS ↔ 치유) | **약함** | 디버깅·OS는 manual 본문에만 갇힘 |
| 시간 모델 (90일 falsifiability) | **중립** | UI에 명시 없음. Insights toggle(7d/30d/all)이 정신 구현 |
| 정보 밀도·구조 가시성 | **강함** | Insights 차트 5종 + Δpain 시계열 = 차별화 결정적 증거 |

---

## 3. CEO 최종 승인 결과 (2026-04-29)

| 결정 | 선택 옵션 | 근거 |
|---|---|---|
| **결정 ① 항해 메타포** | (b) **P0 본질 위협 위반만 즉시 제거 + IM.1 인터뷰에서 톤 자발 언급 측정** | Falsifiability 보존. 검증 없이 *전면* 변경 시 PMF 신호 해석 모호 |
| **결정 ② 게이미피케이션** | (b) **시각 표현만 분석가 어휘로 — 이모지·"항해사" 호칭 제거 + 진척 지표는 분석가 어휘로 *대체*** (예: "30일째 / Δpain 누적 +12점 / 분석 횟수 24회") | 차별화 + retention 부분 보존. 폐기가 아닌 *어휘 재정의* |
| **결정 ③ `our-philosophy` 페이지** | (b) **재작성하여 유지 (manual 톤 + 통계 카드 grid)** | philosophy = 가치 제안 surface, manual = 사용 설명 surface. 역할 분담 유지 |
| **즉시 진행 묶음 A1~A8** | 승인 ✅ | 본질 위협 직접 위반 + 거버넌스 부채 |
| **인터뷰 검증 후 보류 묶음 B1~B4** | 승인 ✅ | Falsifiability 보존 |
| **CSO·CTO 협의 진행** | 승인 ✅ | 차별화 근본 정의·회귀 위험 점검 |

---

## 4. P0 — 즉시 진행 작업 (CEO 승인 완료, senior-fullstack 위임 대상)

회귀 위험 낮음. 본질 위협 직접 위반 또는 거버넌스 부채. 예상 ~3~5일.

| ID | 작업 | 파일·범위 | 결제 가설 A 강화 | 회귀 위험 |
|---|---|---|---|---|
| A1 | `our-philosophy` 시 본문 → manual 톤 1:1 재작성. 통계 카드 grid 유지. gradient 제거 | `app/our-philosophy/page.tsx` 전체. 참조: `lib/content/technical-manual.ts:31-32` | 직접 (가입 직전 surface) | 낮음 |
| A2 | 랜딩 hero/footer 카피 정리 + "60초 체험" 버튼 *primary 격상*, "나의 항해 시작하기" → "가입하기"·secondary 강등 | `app/page.tsx:22-26, 49-51, 91-93` | **결정적** (5초 인상) | 낮음 |
| A3 | `layout.tsx` description "교정" 제거 + `manifest.json` description 동기화 + `theme_color` `#007AFF` → `#1E40AF` | `app/layout.tsx:9`, `public/manifest.json` | 간접 (검색 노출) | 0 |
| A4 | 게임화 이모지 일소 — 스트릭·등급·toast·인사·체크인 카드의 `🔥 🎉 ⚓ ⚡ 🧭 🌅 🌙` → lucide 또는 제거. **결정 ②에 따라 진척 지표는 분석가 어휘로 대체** ("30일째 / Δpain 누적 / 분석 횟수") | `app/dashboard/page.tsx`, `app/me/page.tsx`, `components/ui/StreakBanner.tsx`, `components/ui/BottomTabBar.tsx`, `app/action/[id]/page.tsx` | 간접 | 낮음 |
| A5 | 디자인 시스템 토큰 정렬 — `review-form.tsx`·`ReviewCard.tsx` raw blue → 토큰. 인라인 shadow 12건 → `shadow-card`. `text-green-600`·`text-red-500` → `text-success`·`text-danger` | `app/review/[id]/review-form.tsx`, `components/review/ReviewCard.tsx`, `app/dashboard/page.tsx`, `app/me/page.tsx`, `app/analyze/[id]/page.tsx`, `app/visualize/[id]/page.tsx`, `app/action/[id]/page.tsx`, `app/insights/page.tsx:309, 321, 332` | 간접 | 낮음 (CTO 회귀 평가 후) |
| A6 | tertiary text contrast 강화 `#94A3B8` → `#64748B` (WCAG AA 도달) | `tailwind.config.ts` text token | 간접 | 0 |
| A7 | icon-only 버튼 `aria-label` 누락 8건 보강 | `components/ui/BottomTabBar.tsx`, `components/review/ReviewCard.tsx`, `app/manual/page.tsx` `?` 링크 등 | 간접 | 0 |
| A8 | CI grep rule 추가 — 정적 카피에 AI 가드 패턴 확장 + `/항해\|나침반\|안개\|별빛\|바다/` 경고 등록 | CI config (lint script 또는 GitHub Actions) | 간접 (회귀 방어) | 0 |

**진행 순서 권고**: A3 → A6 → A7 → A8 (위험 0·토큰 적음) → A2 (5초 인상 결정적) → A1 (philosophy 재작성, 분량 큼) → A4 (이모지 + 진척 지표 어휘 재정의) → A5 (CTO 회귀 평가 선행).

---

## 5. P1 — 인터뷰 검증 후 결정 (보류, IM.1 트리거 대기)

CPO 우선순위 #1 Falsifiability 영역. 명시적 비목표 트리거와 충돌. 사전 결정 시 PMF 신호 해석 모호.

| ID | 항목 | 트리거 | 비목표 정합 |
|---|---|---|---|
| B1 | Pain selector 이모지(`😐 😟 😰 😱 🤯`) → 라벨+숫자 칩 | IM.1 인터뷰 자발 언급 또는 A/B | — |
| B2 | Morning mood 어휘 "평온/활기" → 분석가 어휘 ("집중/명료/산만/피로/추진/호기/평정") | IM.1·IM.2 톤 인식 분포 | **명시적 비목표 "분석가 톤 전면 마이그레이션" 트리거 미충족** |
| B3 | analyze spinner 등 *부분 잔존* 항해 메타포 카피 일소 | CEO 결정 ① 후속 (IM.1 항해 톤 자발 언급) | — |
| B4 | "탐지" 용어 사용자 표시 카피 → "발견·관찰·확인" 점진 교체 | G3 변호사 검토 후 | **명시적 비목표 "법적 표현 정렬" G3 후 *전면*** |

---

## 6. P2 — 컴포넌트 시스템 강화 (CTO 우선순위 검토 후)

거버넌스 부채. 향후 결제 페이지·실험 페이지 빠른 빌드 자산.

| ID | 항목 | 의존 |
|---|---|---|
| C1 | `<Card variant="default\|elevated\|secondary">` 추출 → 30+ 인라인 카드 통합 | A5 토큰 정렬 후 |
| C2 | `<StatChip label value sublabel>` 추출 → dashboard·insights·me 9+ 인라인 통합 | 독립 |
| C3 | A8 CI grep rule을 PR 차단 수준으로 격상 (현재 경고) | A8 검증 후 |

---

## 7. IM.1 인터뷰 가이드 추가 항목 (PMF plan §6과 연계)

CEO 결정 ① 후속. 다음 항목을 *우리가 유도하지 않는* 형태로 IM.1 인터뷰에 추가:

1. **항해 톤 자발 언급 측정** — "이 앱의 카피에서 어떤 인상을 받으셨나요?" → "항해/나침반/바다" 자발 언급 비율
2. **Pain selector 반응** — 이모지 vs 숫자 라벨 선호 자발 언급
3. **Mood selector 어휘 인식** — "평온/활기" 어휘 적합성 자발 평가
4. **분석가 톤 인식 분포** — "이 앱이 어떤 사용자를 위한 도구라고 느끼셨나요?" 자발 언급 코딩

자발 언급 임계 도달 시 B1·B2·B3 격상.

---

## 8. CSO·CTO 협의 항목

### CSO/strategy-manager 환기
- 결정 ①·②는 차별화 3축 *근본 정의*에 영향. 운영적 정합성 점검 진행
- "스트레스 관리" 입구화 — 현재 클린. 모니터링 항목 유지
- 글로벌 챗봇(Wysa·Woebot) 한국어 진입 시 카테고리 락인 시간 단축 압박 — 톤 정합 가속화 trigger로 작용 가능

### CTO/senior-fullstack 환기
- A5 회귀 위험 평가 (특히 review 컴포넌트 토큰 정렬 영향 범위)
- 의료기기 표현 *코드 식별자* 점검 (`detect`·`diagnose` 변수명·analytics 이벤트명 등)
- 분석 품질 회귀 인프라(`scripts/eval-distortion-fix.ts`) — UI 카피 변경은 영향 0이나 카피 가드 CI 추가는 분리 PR 권고
- Tier 정합성 — 현재 백로그 우선순위와 충돌하지 않는지 점검

---

## 9. 진행 상태 추적

| 단계 | 상태 | 일자 | 커밋·검증 |
|---|---|---|---|
| product-designer MVP audit | 완료 | 2026-04-29 | — |
| CPO 리뷰 + 결정 분류 | 완료 | 2026-04-29 | — |
| CEO 최종 승인 (3개 방향성 결정 + A·B 묶음) | 완료 | 2026-04-29 | — |
| 팀 subagent 정의 (CPO/CSO/CTO + 산하 시니어 3명) | 완료 | 2026-04-29 | `10ed6a5` |
| 결정 아카이브 작성 (본 문서 v1) | 완료 | 2026-04-29 | `23605a7` |
| senior-fullstack 위임 + P0 A1~A8 구현 | **완료** | 2026-04-29 | `59dba92` |
| P0 회귀 검증 | **완료** | 2026-04-29 | TypeScript 0 errors / 테스트 127/127 / `npm run lint:copy` 4건 (모두 B3 영역) |
| CTO 코드 리뷰 + GO 판정 | **완료** | 2026-04-29 | — |
| IM.1 인터뷰 모집 시작 | 대기 | TBD (PMF plan 참조) | — |
| B1~B4 인터뷰 검증 후 결정 | 대기 | IM.1 데이터 수집 후 | — |
| C1~C3 P2 착수 | 대기 | CTO 우선순위 검토 후 | — |

---

## 10. 본 문서 갱신 정책

- P0 작업 완료 시 §9 진행 상태 추적 갱신 (커밋 hash 함께)
- IM.1 인터뷰 데이터 수집 후 B1~B4 결정 결과 §5에 추가
- 새 디자인 audit 발생 시 v2로 별도 문서 (본 문서는 *결정 아카이브*로 보존)
- CEO 결정 변경 시 §3 갱신 + 변경 사유 명시
- 본 문서는 *살아있는 문서* — P0/P1/P2 진행에 따라 §9 지속 갱신
