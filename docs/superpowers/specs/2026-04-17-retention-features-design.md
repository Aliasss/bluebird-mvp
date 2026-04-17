# 리텐션 피처 설계 문서

**날짜**: 2026-04-17  
**범위**: 연속 교정 스트릭 → 자율성 지수 시계열 고도화 → 인지 아키타입 페르소나 리포트  
**진행 방식**: 3개 독립 서브프로젝트, 순서대로 구현

---

## Sub-project 1: 연속 교정 스트릭 (Streak)

### 정의
- **스트릭 기준**: 해당 날짜(KST)에 AI 분석(`analysis` 테이블에 행 존재)이 완료된 경우 카운트
- **리셋 정책**: 하루라도 분석 없으면 현재 스트릭 0 리셋. 단, 최고 기록은 영구 보존
- **날짜 기준**: KST 자정 (UTC+9) — 기존 일별 분석 한도와 동일 기준

### 데이터 계산

새 테이블 불필요. `analysis` 테이블에서 사용자의 분석 날짜 목록을 가져와 클라이언트에서 순수 함수로 계산.

**`lib/utils/streak.ts` 인터페이스:**

```typescript
// KST 기준 "YYYY-MM-DD" 형식 문자열 목록을 받아 스트릭 계산
// 예: ["2026-04-15", "2026-04-16", "2026-04-17"]
export function calculateStreak(analysisDateStrings: string[]): {
  current: number;   // 현재 연속 일수
  best: number;      // 역대 최고 기록
  doneToday: boolean; // 오늘 분석 완료 여부
}
```

**계산 알고리즘:**
1. `analysisDateStrings`를 Set으로 변환 (중복 제거)
2. 오늘(KST) 날짜부터 하루씩 거슬러 올라가며 연속 카운트 → `current`
3. 전체 날짜 목록에서 가장 긴 연속 구간 탐색 → `best`
4. 오늘 날짜가 Set에 포함되면 `doneToday = true`

### UI

**위치**: 대시보드 헤더와 통계 카드 사이

**컴포넌트**: `components/ui/StreakBanner.tsx`

**상태별 표시:**

| 상태 | 메시지 |
|------|--------|
| `doneToday = true` | 🔥 N일 연속 달성! (우측: 최고 기록 N일) |
| `doneToday = false`, `current > 0` | 🔥 N일 연속 중 — 오늘 분석하면 유지됩니다 |
| `current = 0` | 오늘 첫 분석으로 스트릭을 시작해보세요 |

**스타일**: `bg-primary bg-opacity-5`, `border border-primary border-opacity-20`, `rounded-xl p-4`  
좌측: 🔥 아이콘 + 현재 스트릭 숫자(크게) + 상태 메시지  
우측: 최고 기록 N일 (작게, `text-text-secondary`)

### 변경 파일

| 파일 | 변경 |
|------|------|
| `lib/utils/streak.ts` | 신규 생성 — 스트릭 계산 순수 함수 |
| `components/ui/StreakBanner.tsx` | 신규 생성 — 스트릭 UI 컴포넌트 |
| `app/dashboard/page.tsx` | 분석 날짜 목록 쿼리 추가 + StreakBanner 삽입 |

---

## Sub-project 2: 자율성 지수 시계열 고도화

*(Sub-project 1 완료 후 별도 브레인스토밍 진행)*

---

## Sub-project 3: 인지 아키타입 페르소나 리포트

*(Sub-project 2 완료 후 별도 브레인스토밍 진행)*
