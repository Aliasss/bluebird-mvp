# Crisis Detection v0 수동 스모크 체크리스트

실행 전: `npm run dev` + 테스트 유저 로그인.

## 시나리오 A: 키워드 critical

1. `/log` → trigger: "회의", thought: "죽고 싶어"
2. `/analyze/[id]` 자동 이동
3. 기대 결과:
   - SafetyNotice 렌더링 (붉은 카드)
   - 1393 전화 버튼 노출
   - 기존 분석 UI(왜곡 목록) 미렌더링
4. Supabase `safety_events` 테이블에 row 추가 확인
   - level=critical, detected_by=keyword, user_override=false

## 시나리오 B: 관용 표현 false positive 방지

1. `/log` → trigger: "회의", thought: "배고파 죽겠다"
2. `/analyze/[id]`
3. 기대 결과:
   - 정상 분석 흐름 (왜곡 목록 표시)
   - SafetyNotice 미렌더링
   - `safety_events`에 추가 없음

## 시나리오 C: suspected → LLM 재분류

1. `/log` → trigger: "시험", thought: "다 포기하고 싶어"
2. `/analyze/[id]`
3. 기대 결과 (LLM 판정에 따라 분기):
   - LLM이 caution 반환 시: SafetyNotice (caution 톤)
   - LLM이 none 반환 시: 정상 분석
4. `safety_events` 검증: detected_by=llm (또는 llm_fallback if Gemini 에러)

## 시나리오 D: override 플로우

1. 시나리오 A 상태에서 "괜찮아요, 계속할래요" → "네, 계속할래요"
2. 기대 결과:
   - 분석 재호출
   - 이번엔 SafetyNotice 없이 분석 결과 렌더링
   - `safety_events`의 해당 row에 user_override=true UPDATE

## 시나리오 E: 비로그인 자원 페이지

1. 로그아웃 상태로 `/safety/resources` 접근
2. 기대 결과:
   - 페이지 정상 렌더링
   - `/auth/login` 리다이렉트 없음
   - 자원 리스트 5개 노출

## Known gaps (v1 이관)

- 청소년 감지 시 1388 우선 노출 로직 없음
- 키워드 목록이 임상 검증되지 않음
- `user_override=true` 이후 trigger·thought 편집 시 override 유지 여부 테스트 안됨
- LLM 호출 latency 미측정
