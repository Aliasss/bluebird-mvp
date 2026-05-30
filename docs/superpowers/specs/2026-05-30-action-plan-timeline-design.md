# Spec — 행동 기록 타임라인 (실행 예정일 기준 정리)

**문서 버전**: v1 (2026-05-30)
**상태**: design (CPO·CSO 조직 논의 완료, 사용자 승인 — "지금 즉시" 착수)
**상위 기준점**: [`positioning-and-vision-v1.md`](../../strategy/positioning-and-vision-v1.md)·[`pmf-validation-plan.md`](../../strategy/pmf-validation-plan.md)
**논의 출처**: 본 세션 CPO·CSO 8 페르소나 채널링 (2026-05-30)

---

## 1. 목적·배경

### 1.1 사용자 문제

사용자가 "행동 설계"에서 행동 계획(`{when, what, howLong}`)을 작성한 뒤, **언제 무엇을 하기로 했는지 잊어버린다**. 푸시 알림은 (a) 비용, (b) 사용자 피로도, (c) 본질 위협 #4(정기 체크인 알림)·SDT 자율성 위배 때문에 *비채택*. 사용자가 *스스로 열어볼 때* 자기 계획을 일자·시간순으로 볼 수 있는 수동(pull) 화면이 필요하다.

### 1.2 조직 논의 핵심 결론

8 페르소나 채널링 결과 **"캘린더(일정 관리)"가 아니라 "행동 기록 타임라인(읽기 전용·당겨보기)"**로 수렴:

- product-designer ⚠️: 캘린더 격자 + 미완료 빨간 뱃지 = 생산성 앱(habit-tracker) 톤 = 새 오염원. 코드 에디터 커밋 히스토리·항해 계기판 메타포의 *기록 타임라인*으로.
- CSO: "일정 관리 도구" 포지셔닝 = 카테고리 침식 ⚠️. 단 *"패턴 누적 자기 지도"*(락인 자산 #3)와 정합 → 기회.
- SDT(사실 B)·본질 위협 #4(사실 C): 알림·완료 강제 **영구 없음**. 읽기 전용·당겨보기만.
- risk-manager: 본인 데이터 재표시 → PIPA 신규 노출 없음(P3 이하). 단 *알림 도입 시* P2(의료 리마인더 오인) — 알림 미도입 방향이면 리스크 미발생.

### 1.3 기존 구현 발견 (스펙 단순화)

[`app/journal/page.tsx`](../../../app/journal/page.tsx)에 **이미 "actions" 탭이 존재**하며 행동 계획 목록을 표시 중. 단 `created_at`(계획을 *만든* 시각) 순. 본 기능은 *별도 페이지 신설이 아니라 이 기존 탭을 실행 예정일 기준으로 확장*한다. journal은 이미 "기록" 프레임이라 todo 앱 오염 위험 낮음.

---

## 2. 확정 결정 (CEO 승인 완료)

| # | 항목 | 결정 |
|---|---|---|
| 1 | 착수 시점 | **지금 즉시** (IM.1 인터뷰 검증 대기 ❌) |
| 2 | 범위 | **ⓐ 읽기 전용 타임라인** (캘린더 격자 ❌) |
| 3 | 선결 마이그레이션 | `when` 자유 텍스트 → 구조화 datetime 추가 (하위 호환) |
| 4 | 프레임 | "행동 기록 타임라인" 분석가 톤 명칭 + 금지어 가드 spec 명문화 |

### 2.1 하위 결정 — 구조화 datetime 확보 방식 (스펙 신규)

기존 `when`은 자유 텍스트("오늘 21:00", "5/30, 5/31")라 그대로는 정렬 불가. 3가지 방식 검토:

| 방식 | 장점 | 단점 | 채택 |
|---|---|---|---|
| (a) 별도 날짜·시간 picker UI 추가 | 정확 | 입력 마찰 ↑ — designer 인지 부하 가드·SDT 무마찰 원칙 위배 | ✗ |
| (b) 자유 텍스트 best-effort 파싱 | **마찰 0** — 기존 입력 그대로 | 파싱 실패 가능 | ✓ |
| (c) 파싱 + 확인 chip | 정확+마찰 중간 | UI 복잡도 ↑ | 차선 |

**채택: (b) best-effort 파싱.** 제출 시 `when` 텍스트(한국어 상대일 "오늘/내일/모레" + 절대일 "5/30", 시각 "21:00")를 `planned_at`(TIMESTAMPTZ)로 파싱. **성공 시 구조화 저장, 실패 시 `planned_at = null`** → 해당 계획은 타임라인 "날짜 미지정" 그룹에 표시. 기존 [`action-plan.ts`](../../../lib/intervention/action-plan.ts)의 "legacy free text fallback" 철학과 동일. 입력 화면 무변경 → 인지 부하·SDT 가드 보존.

---

## 3. 변경 전 → 변경 후 (구체)

| 영역 | 기존 | 변경 후 |
|---|---|---|
| DB | `intervention.final_action TEXT`, `is_completed`, `created_at`, `completed_at` | + `planned_at TIMESTAMPTZ NULL` 컬럼 (migration 21) |
| 입력 (action 페이지) | `{when, what, howLong}` JSON 저장, `when` 자유 텍스트 | **동일** + 제출 시 `when` 파싱 → `planned_at` 채움 (UI 무변경) |
| journal "actions" 탭 | `created_at DESC` 단순 목록 | **실행 예정일(`planned_at`) 기준 그룹·정렬** (오늘·내일·이번 주·이후·날짜 미지정·지난 계획) |
| 미완료 표시 | (탭 내 is_completed 플래그) | "관찰 대기(pending)" 중립 라벨 — 빨간 경고·뱃지 ❌ |
| 알림 | 없음 | **영구 없음** (본질 위협 #4 가드) |

---

## 4. 범위 (YAGNI + 본질 위협 가드)

### 하는 것
- migration 21: `intervention.planned_at` 추가 (nullable, 기존 row는 null 유지)
- `lib/intervention/when-parser.ts` 신규: 한국어 상대·절대 일시 best-effort 파싱
- action 제출 경로([`app/api/action/route.ts`](../../../app/api/action/route.ts) 등)에서 파싱 후 `planned_at` 저장
- journal "actions" 탭을 `planned_at` 기준 날짜 그룹 뷰로 확장 (읽기 전용)

### 안 하는 것 (영구 비목표)
- ❌ 푸시·인앱 알림·리마인더 (본질 위협 #4)
- ❌ 캘린더 격자(월/주 그리드) UI (designer 반대)
- ❌ 미완료 빨간 경고·"밀린 N개" 뱃지 (생산성 잔소리 = 오염)
- ❌ "캘린더/일정/할 일/스케줄" 메뉴·카피 (CSO 카테고리 가드)
- ❌ 완료 강제·외부 보상·연속 달성(streak) (SDT 자율성 위배)

---

## 5. 카피·프레임 가드 (strategy-manager·designer 공동)

| 금지어 | 허용어 |
|---|---|
| 캘린더, 일정, 스케줄, 할 일, 밀린, 남은, 마감, 연속 달성 | 기록, 관찰, 계획, 패턴, 대기, 실행 예정 |

- 화면 명칭: "행동 기록" 또는 "실행 예정" (탭 라벨) — "캘린더" ❌
- 미완료: "관찰 대기" — "미완료/밀림" ❌
- 톤: 분석가가 *자기 데이터를 관찰*하는 프레임. 위로·독려 카피 금지("화이팅", "할 수 있어요" ❌)

---

## 6. 측정 (data-analyst)

- 이벤트: `action_timeline_viewed`(화면 노출), `planned_at_parse_result`(성공/실패 — 파서 정확도 추적)
- 가설: 타임라인 노출 cohort vs 미노출 cohort 간 **행동 계획 완료율(`is_completed`) 차이**를 falsifiable하게 측정
- ⚠️ cohort 분리 없이는 "있으면 좋아 보이는" 기능으로 끝남 → 노출 여부 플래그 필수
- 파서 정확도: `planned_at` 성공률 모니터링, <70%면 파서 보강 트리거

---

## 7. Acceptance Criteria

- **AC1**: migration 21 적용 시 `intervention.planned_at TIMESTAMPTZ NULL` 추가. 기존 row 전부 null. 롤백 가능(컬럼 drop).
- **AC2**: `when-parser`가 "오늘/내일/모레 HH:MM", "M/D", "M/D HH:MM", "M월 D일" 형태를 KST 기준 `planned_at`로 변환. 파싱 불가 시 null 반환(throw 금지).
- **AC3**: action 제출 시 `planned_at` 채워짐. 파싱 실패해도 계획 저장은 정상(기존 흐름 무손상).
- **AC4**: journal "actions" 탭이 `planned_at` 기준 그룹(오늘·내일·이번 주·이후·날짜 미지정·지난 계획) 정렬. 읽기 전용 — 알림·완료 강제 버튼 없음.
- **AC5**: 금지어(캘린더·일정·할 일·밀린·남은) 화면·카피에 0건.
- **AC6**: legacy free-text `when`(파싱 실패)도 "날짜 미지정" 그룹에 표시되어 누락 없음.
- **AC7**: RLS — 타임라인은 본인 `intervention`만 조회(기존 RLS 정책 재사용, 신규 노출 없음).

---

## 8. 위험·대응

| 위험 | 시그널 | 대응 |
|---|---|---|
| 파서 오인식("내일"을 잘못 계산) | `planned_at` 성공률·사용자 혼란 | best-effort 명시, 실패 시 자유 텍스트 그대로 표시(누락보다 안전) |
| 타임라인이 todo 잔소리로 인식됨 | 인터뷰 "할 일 관리" 멘탈 모델 언급 | 카피 가드(§5) + "관찰 대기" 중립 라벨, ux-researcher terminology 검증 |
| 본질 위협 #4 재유입(차후 알림 추가 압박) | "리마인드 붙이자" 기획 발화 | spec §4 영구 비목표로 차단, 위반 시 ⚠️ STOP |
| 카테고리 침식(일정 앱화) | CSO 6축 중 메타포 축 이동 | 금지어 가드 + 분석가 톤 명칭 고정 |

---

## 9. 본질 정합성 self-check

- **3단계 본질 chain**: 본 기능은 단계 3(SDT 자율성)을 *깊게* 만든다 — 사용자가 *스스로* 세운 계획을 *스스로* 돌아보는 것. 강요·보상·알림 없음 → chain 위배 0.
- **차별화 3축**: 톤(분석적 유지)·자기상(자기 데이터 관찰하는 운영자)·메타포(기록 타임라인=디버깅 히스토리) 전부 무변동.
- **본질 위협 6신호**: #4(체크인 알림) 정면 가드, 나머지 무관.
- **Falsifiability**: cohort 분리로 완료율 영향 측정 → CPO 우선순위 ① 충족.

---

## 10. 후속·미해결

- 파서 커버리지는 v1에서 한국어 핵심 패턴만. IM.1 실제 입력 분포 확인 후 보강(별도 작업).
- "실행 예정일이 지난 계획"의 표현 — "지난 계획" 중립 그룹으로 두되, 어떤 nudge도 ❌. 표현 톤은 designer 최종 결정.
- 본 spec은 community-advocacy-manager spec과 독립. push는 두 작업 함께 진행(사용자 지시).

---

## 11. 구현 산출물 (writing-plans 입력)

- `supabase/migrations/21_intervention_planned_at.sql` (신규)
- `lib/intervention/when-parser.ts` (신규)
- `app/api/action/route.ts` 등 제출 경로 (수정 — planned_at 저장)
- `app/journal/page.tsx` actions 탭 (수정 — planned_at 그룹 뷰)
- 이벤트 instrumentation (수정)
