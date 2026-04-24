# Δpain 수동 스모크 체크리스트

실행 전:
- Supabase SQL Editor에서 `04_logs_pain_score.sql`, `05_intervention_reevaluation.sql` 실행
- `npm run dev` + 테스트 유저 로그인

## 시나리오 A: 정상 재평가 사이클

1. `/log` → trigger: "동료와 회의에서 긴장", thought: "또 실수할 것 같아", pain_score: 5
2. `/analyze/[id]` → 분석 완료
3. 질문 3개 답변 → `/visualize/[id]` → `/action/[id]` → 행동 계획 입력 → **완료**
4. Supabase Table Editor에서 해당 intervention row가 is_completed=true, completed_at 채워졌는지 확인
5. 확인용 SQL로 completed_at을 **7시간 전**으로 수동 업데이트:
   ```sql
   UPDATE intervention
     SET completed_at = NOW() - INTERVAL '7 hours'
     WHERE id = '...';
   ```
6. `/dashboard` 새로고침 → 상단에 ReviewCard 노출 확인
7. 카드 클릭 → `/review/[id]` 진입
   - 원래 trigger·thought·행동계획·소크라테스 답변이 모두 표시되는지
   - **원래 pain_score는 표시 안 되는지** (앵커링 방지)
8. 1~5 중 2 선택 → 저장
9. `/dashboard`로 복귀 → "이번 주 줄어든 고통" 카드에 `+3` 표시
10. Supabase: intervention.reevaluated_pain_score=2, reevaluated_at 기록 확인

## 시나리오 B: 6시간 미만 경과 — 카드 안 뜸

1. 방금 완료한 log가 있을 때(6h 미만), `/dashboard`에서 ReviewCard 노출되지 않음 확인

## 시나리오 C: 48시간 초과 — 카드 안 뜸

1. completed_at을 50시간 전으로 수동 업데이트:
   ```sql
   UPDATE intervention SET completed_at = NOW() - INTERVAL '50 hours' WHERE id = '...';
   ```
2. `/dashboard` 진입 → 카드 안 뜸 확인

## 시나리오 D: 닫기 영구성

1. 시나리오 A의 6~7단계에서 카드의 X 버튼 클릭
2. 카드 사라짐
3. `/dashboard` 새로고침 → 다시 안 뜸 확인
4. Supabase: intervention.review_dismissed_at 기록 확인

## 시나리오 E: 다수 대기 FIFO

1. 완료한 log 2개 모두 completed_at을 시간차 두고 7~40시간 전으로 업데이트
2. `/dashboard` → **오래된 것 1개만** 카드로 표시 확인
3. 재평가 완료 후 다시 `/dashboard` → 두 번째 건 카드로 노출

## 시나리오 F: 음수 Δpain

1. 초기 pain_score=2로 log 작성, 완료, completed_at 7시간 전 조정
2. 재평가 시 5 선택 → 저장 (Δpain = -3)
3. "이번 주 줄어든 고통" 카드는 해당 건 **제외** (양수만 합산)
4. Insights 시계열 차트에는 -3으로 표시됨

## 시나리오 G: 분석 프롬프트에 pain_score 주입 확인

1. 새 log 작성 (pain_score=5)
2. 분석 시작
3. `console.log`나 네트워크 탭으로 Gemini 요청에 `initial_pain_score: 5` 필드가 프롬프트에 포함됐는지 확인 (프롬프트 문자열 검증)

## Known gaps (v1 이관)

- 재발 감지 (같은 distortion_type 반복)
- 과거 답변 재활용 힌트
- 주간 리포트 (별도 플랜)
- Push 알림
- Δpain 기반 아키타입 진화
