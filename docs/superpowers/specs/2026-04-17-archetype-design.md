# 인지 아키타입 페르소나 리포트 설계 문서

**날짜**: 2026-04-17

---

## 아키타입 정의 (5개, 왜곡 1위 유형 기준)

| DistortionType | 아키타입 이름 | 태그라인 |
|----------------|-------------|---------|
| catastrophizing | 파국화형 시나리오 구축가 | 최악을 먼저 계산하는 분석가 |
| all_or_nothing | 완벽주의 이분법자 | 중간 지대를 허용하지 않는 기준 설계자 |
| emotional_reasoning | 감정 기반 항법사 | 느낌을 사실로 번역하는 내면 탐험가 |
| personalization | 책임 과잉 수집가 | 모든 원인을 자신에게서 찾는 분석가 |
| arbitrary_inference | 결론 선행 사고가 | 증거보다 결론이 먼저인 직관의 소유자 |

## 계산 로직

- **`lib/utils/archetype.ts`**: 왜곡 유형별 빈도 카운트 → 1위 유형 → 아키타입 반환
- 분석 0회: `null` 반환 → "첫 분석을 진행하면 아키타입이 생성됩니다"
- 분석 1회 이상: 아키타입 표시
- **업데이트 주기**: 5회마다 재계산 (pure function이므로 항상 최신 데이터 기준)
- **진행률**: `totalCount % 5` → 다음 업데이트까지 `5 - (totalCount % 5)`회

## 표시 위치

### 대시보드 (`app/dashboard/page.tsx`)
- 스트릭 배너 아래, 통계 카드 위
- `ArchetypeCard` 컴포넌트: 아키타입 이름 + 태그라인 + 업데이트 진행 바
- 클릭 시 `/insights`로 이동

### 인사이트 (`app/insights/page.tsx`)
- 기간 필터 아래, 성장 지표 위
- `ArchetypePanel` 컴포넌트: 이름 + 태그라인 + 설명 전문 + 진행 바

## 변경 파일

| 파일 | 변경 |
|------|------|
| `lib/content/archetypes.ts` | 5개 아키타입 데이터 정의 |
| `lib/utils/archetype.ts` | 계산 함수 |
| `components/ui/ArchetypeCard.tsx` | 대시보드용 카드 |
| `components/ui/ArchetypePanel.tsx` | 인사이트용 전체 패널 |
| `app/dashboard/page.tsx` | 아키타입 쿼리 + ArchetypeCard 삽입 |
| `app/insights/page.tsx` | ArchetypePanel 삽입 |
