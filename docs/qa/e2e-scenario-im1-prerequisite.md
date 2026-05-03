# E2E 사용자 플로우 시나리오 — IM.1 prerequisite (b)

**작성**: 2026-05-03 (senior-qa-engineer)
**실행 예정**: 2026-05-05 (화) (senior-qa-engineer 본인 — 독립 검증 라인)
**소요 시간 예상**: 90~120분 (Step 1~9 합산 + 24h 단축 SOP 30분 + 보고서 30분)
**환경**: production (Vercel main + Supabase production project)
**테스트 계정**: 신규 1회용 (실 사용자 데이터·통계와 분리). 형식 권고 `qa-e2e-2026-05-05+<random4>@<dev-domain>`. 실행 후 `auth.users` row + cascade 삭제로 정리.
**합의 근거**: `docs/meetings/2026-05-03-all-hands-priority-agenda.md` §2.9 (senior-qa 1순위 발언) · §4.2 (b) · §5 #2 (담당·기한·검증)
**페르소나 정의**: `.claude/agents/senior-qa-engineer.md` §6 (E2E 사용자 플로우)

---

## 0. 사전 준비

실행 *직전* (5/5 화 오전) 모두 통과 확인. 1건이라도 부재 시 본 시나리오 시작 X.

- [ ] 테스트 계정 이메일 확보 (`qa-e2e-2026-05-05+xxxx@<도메인>`)
- [ ] Supabase Dashboard SQL editor 접근 권한 확인 (`auth.users`·`logs`·`analysis`·`intervention`·`user_onboarding`·`user_patterns`·`checkins`·`safety_events` SELECT 가능)
- [ ] Vercel Dashboard 로그 접근 권한 확인 (Functions → `/api/analyze`·`/api/onboarding/complete`·`/api/checkin`·`/api/review/pain-score` 실시간 로그 tail 가능)
- [ ] 마이그레이션 09·10·11·12 production 적용 확인 — Database > Tables 에서:
  - [ ] `user_patterns` 테이블 존재 (09)
  - [ ] `user_onboarding` 테이블 존재 + `reached_act IN (1,2,3)` CHECK 제약 (10)
  - [ ] `checkins` 테이블 존재 + `type IN ('morning','evening')` CHECK 제약 (11)
  - [ ] `logs.log_type` 컬럼 존재 (12 — `'normal'|'success'` enum CHECK)
  - [ ] `analysis.distortion_type` NOT NULL 해제 확인 (12 — `is_nullable='YES'`)
  - [ ] `analysis` DELETE 정책 `Users can delete own analysis` 존재 (12)
  - [ ] `intervention.completion_note`·`completion_reaction` 컬럼 존재 (12)
- [ ] 24h 단축 검증 SOP (본 문서 §2)에 따른 SQL 1건 dry-run (`UPDATE` 직전 `BEGIN; ROLLBACK;` 페어로 시뮬레이션)
- [ ] 본질 위협 #1·#2·#4 가드 grep 1차 sweep — 본 시나리오 단계별 카피 검수 시 비교 대조용
- [ ] PWA 캐시 초기화 (Chrome DevTools → Application → Clear storage) — 이전 토스트·sessionStorage 잔존 회피
- [ ] iPhone SE 320px 폭 시뮬레이터 (Safari Responsive Design Mode 또는 Chrome DevTools Device Mode) 준비. designer 5/4 실기 결과와 cross-reference

---

## 1. 시나리오 9단계

각 단계는 다음 6항목 일관 구조: **사전 조건**·**작업**·**기대 UI**·**기대 DB/API**·**점검 항목**·**실패 분류**·**관련 파일**.

### Step 1 — 가입 → 온보딩 자동 진입 (Act 1 강제)

**사전 조건**:
- /auth/signup 접근 가능
- 신규 이메일 (테스트 계정 — `auth.users` 미존재)
- 마이그레이션 10 적용 (`user_onboarding` 테이블 + RLS 정책 3개)

**작업**:
1. /auth/signup 진입
2. 이메일·비밀번호(6자 이상) 입력
3. 만 14세 이상·이용약관·개인정보 처리방침 [필수] 3건 체크
4. 마케팅 동의 [선택] 1건 — 양면 검증 위해 해제 상태로 진행
5. "회원가입" 클릭 → 가입 성공 → `success` 상태 `needsEmailVerification=true` 화면
6. 이메일 확인 inbox에서 인증 링크 클릭 → /auth/callback → router.push('/dashboard')

**기대 UI**:
- 가입 완료 화면 카피: "이메일을 확인해주세요" + 마스킹된 이메일 노출
- 인증 후 /dashboard 진입 시도 → user_onboarding row 부재 감지 → /onboarding/1 redirect
- /onboarding/1 진입 — Act dot ●○○, 슬라이드 1/3, 우상단 X 버튼 노출 (Act 1·2 only)
- BottomTabBar 미표시 (/onboarding/* 자동 미표시 정책)
- iPhone SE 320px 폭에서 viewport fit (스크롤 없이 슬라이드 1장 noviewport-overflow)

**기대 DB/API**:
- `auth.users` 신규 row INSERT — `raw_user_meta_data`에 `terms_agreed_at`·`privacy_agreed_at`·`age_confirmed_at`·`marketing_agreed=false`·`terms_version='2026-04-28'`·`privacy_version='2026-04-28'` 6개 키 포함
- `user_onboarding` row 0건 (이 시점 — `/api/onboarding/complete` 미호출 상태)
- 가입 직후 Vercel Functions 로그에 PII (이메일 평문) 노출 0건

**점검 항목**:
- [ ] 가입 성공 → `auth.users` 신규 row INSERT (Supabase Dashboard SQL: `SELECT id, email, raw_user_meta_data, created_at FROM auth.users WHERE email='qa-e2e-...';`)
- [ ] `raw_user_meta_data` 6키 정합 (terms·privacy·age·marketing×2·terms/privacy version)
- [ ] /dashboard 진입 시 `user_onboarding` SELECT (auth.uid() RLS) → null → `router.push('/onboarding/1')` 즉시 동작
- [ ] BottomTabBar 미표시 (/onboarding/*)
- [ ] iPhone SE 320px 슬라이드 1·2·3 viewport fit (단락 잘림 0건)
- [ ] 본질 위협 #1·#2 카피 가드: "함께"·"위로"·"마음을 안아"·"외롭지 않게" 자발 등장 0건. 슬라이드 톤 *분석가형* 유지
- [ ] 본질 위협 #4: 학술 caption (Beck·Kahneman 등) *효과 입증*으로 오인되는 표현 무. caption 글자 크기 11px 유지
- [ ] Vercel 로그에 이메일 평문·비밀번호 평문 0건 (server-logger 마스킹 PASS — 5/2 commit 69557cd 검증)

**실패 분류**:
- **Critical**: 가입 자체 실패 / /dashboard 진입 시 무한 redirect 루프 / `user_onboarding` RLS가 본인 row 차단해 항상 redirect 루프 / `auth.users` INSERT 누락
- **Major**: BottomTabBar 표시 (자동 미표시 정책 위반) / iPhone SE 320px 슬라이드 단락 잘림 / 본질 위협 #1·#2·#4 카피 회귀 / `raw_user_meta_data` 키 누락
- **Minor**: 마이크로카피 톤 위반 (예: "환영합니다 :)" 등 정서적 카피 잔존)

**관련 파일**:
- `app/auth/signup/page.tsx:33-102` (가입 핸들러)
- `app/auth/callback/route.ts` (이메일 인증 callback — 별도 검증)
- `app/dashboard/page.tsx:74-97` (user_onboarding row 부재 시 redirect)
- `supabase/migrations/10_onboarding_completed.sql:19-23` (테이블·CHECK)

---

### Step 2 — Act 1·2·3 진입 + Act 3 끝 CTA → /log

**사전 조건**:
- Step 1 통과 (user는 `/onboarding/1` 진입 상태)
- `app/onboarding/[act]/OnboardingActClient.tsx` 슬라이드 데이터 로드 가능
- `lib/onboarding/slides.ts` Act별 3슬라이드 정의 적용

**작업**:
1. Act 1: 슬라이드 1 → 2 (다음 버튼·키보드 →·터치 swipe 좌→우 모두 검증) → 3 (마지막 슬라이드)
2. Act 1 끝: CTA "작동 원리 더 알아보기" 클릭 → `/onboarding/2` 라우팅 — `completeOnboarding` 미호출 (더 깊은 Act 진입은 완료 처리 X)
3. Act 2: 슬라이드 1·2·3 진행 → "누적 가치 더 알아보기" 클릭 → `/onboarding/3`
4. Act 3: 슬라이드 1·2·3 진행 → CTA "지금 첫 디버깅 시작하기" 클릭
5. `handleFinishAct3` 호출: `completeOnboarding(3)` 호출 → POST `/api/onboarding/complete` `{reached_act:3}` → `router.push('/log')`

**기대 UI**:
- Act dot 인디케이터: Act 1 ●○○, Act 2 ○●○, Act 3 ○○●
- 슬라이드 카운터: "1 / 3", "2 / 3", "3 / 3"
- 슬라이드 전환 200ms ease-out fade + translateX(8px → 0)
- Act 1·2 우상단 X 버튼 노출, Act 3 미노출
- Act 3 마지막 CTA 카피 정확히 "지금 첫 디버깅 시작하기" (회의록 §2.9 합의)
- /log 진입 시 PageHeader "생각 기록" + step 1/3 (trigger 단계)

**기대 DB/API**:
- POST `/api/onboarding/complete` 200 응답 + body `{success:true}`
- `user_onboarding` 신규 row INSERT — `user_id=<test>`·`reached_act=3`·`completed_at=NOW()`
- RLS `user_onboarding_insert_own` 정책 통과 (auth.uid() = user_id)
- /log 라우트 진입 시 BottomTabBar는 (/log 도 미표시 정책 — 점검)

**점검 항목**:
- [ ] Act 1·2·3 모두 슬라이드 1·2·3 진입 (총 9슬라이드 전부 도달)
- [ ] 키보드 ←→ 모두 작동, 좌우 swipe 50px 임계 통과 시 전환, 임계 미만 무효
- [ ] Act 3 CTA 카피 정확히 "지금 첫 디버깅 시작하기" (회의록 §2.9 키워드)
- [ ] POST `/api/onboarding/complete` 200 + `user_onboarding` row INSERT 확인 (SQL: `SELECT * FROM user_onboarding WHERE user_id=<test>;` → reached_act=3·completed_at)
- [ ] RLS 검증: 다른 user의 user_onboarding row SELECT 시도 → 0행 (Supabase Dashboard에서 anon key로 cross-account SELECT 시뮬)
- [ ] router.push('/log') 즉시 진입, 어떤 시점에도 /onboarding/* 재진입 0건 (replay 모드 아닌 한)
- [ ] iPhone SE 320px 폭에서 9 슬라이드 전부 viewport fit (단락 4·5개 풀어쓰기 잘림 0건)
- [ ] 본질 위협 #1·#2·#4 카피 가드: 슬라이드 9개 전부 분석가형 톤 유지, "치료"·"회복" 단어 0건 (디스클레이머 외)
- [ ] sr-only live region "Act N, 슬라이드 N / 3" announce 작동 (스크린리더 검증)

**실패 분류**:
- **Critical**: Act 진입 자체 실패 / `/api/onboarding/complete` 401·500 / `user_onboarding` INSERT 실패 / Act 3 CTA 클릭 후 /log 미진입 / RLS 위반 (타 user row 노출)
- **Major**: CTA 카피 회귀 (회의록 합의 단어 변경) / 슬라이드 단락 잘림 / 본질 위협 카피 회귀 / Act dot·카운터 인디케이터 회귀
- **Minor**: 200ms 전환 애니메이션 부재·튐 / sr-only announce 누락

**관련 파일**:
- `app/onboarding/[act]/page.tsx:9-25` (Act param 검증)
- `app/onboarding/[act]/OnboardingActClient.tsx:56-98` (CTA 핸들러)
- `app/api/onboarding/complete/route.ts:18-65` (UPSERT 로직)
- `lib/onboarding/slides.ts` (슬라이드 카피)
- `components/ui/BottomTabBar.tsx` (/onboarding/* 자동 미표시 로직)

---

### Step 3 — 첫 로그 작성 → analyze → 분석 결과 + reframe 질문

**사전 조건**:
- Step 2 통과 (/log 진입 상태)
- `analysis` 테이블 DELETE 정책 적용 (마이그레이션 12 — 재분석 시 기존 row 삭제)
- `user_patterns` 테이블 적용 (마이그레이션 09)
- Gemini API 키 production 환경변수 설정 정상

**작업**:
1. /log step `trigger` — 트리거 5자 이상 입력 (예: "팀장이 내 보고서에 피드백을 주지 않았다")
2. "다음" → step `thought` — 자동 사고 10자 이상 입력 (예: "내가 일을 못하니까 무시하는 거겠지. 앞으로도 이럴 거야")
3. "다음" → step `pain` — 통증 점수 3점 (꽤 힘들어요) 선택
4. "분석 시작하기" 클릭 → `logs` INSERT → /analyze/<id> 라우팅
5. /analyze/<id> stage 흐름: `fetch` → `analyze` (loader: "인지 나침반을 정교하게 맞추고 있어요") → `question` (loader: "맞춤 질문을 준비하고 있어요") → `done`
6. 분석 결과 노출: 이론 기반 해석 6개 박스 + 발견된 생각의 패턴 + 생각을 점검하는 질문 3개
7. 질문 1·2·3 답변 작성 (각 1문장 이상) → "저장 후 시각화 보기" → /visualize/<id>

**기대 UI**:
- 분석 stage 메시지: fetch→analyze→question→done 4단계 정확
- 분석 결과: 이론 기반 해석 카드 (현재 프레임·추정 확률·준거점·손실 민감도·반추 경향·걱정 경향) 6개 박스 모두 채워짐
- 사용자 자동 사고 텍스트 내 distortion segment `<mark>` 하이라이팅 노출 (≤3개 segment)
- 질문 카운터 "1 / 3", "2 / 3", "3 / 3"
- "검증 모드(System 2) 시작. 핵심 질문" + system2_question_seed 노출
- "탈중심화 안내" + decentering_prompt 노출

**기대 DB/API**:
- POST `/api/analyze` `{logId:<uuid>}` → 200
  - 본문: distortions·frame_type·reference_point·probability_estimate·loss_aversion_signal·cas_signal·system2_question_seed·decentering_prompt·trigger_category(optional)
- `logs` 신규 row — `pain_score=3`·`user_id=<test>`·`trigger_category=null|enum`
- `analysis` row N개 INSERT (왜곡 N건) — distortion_type·intensity·logic_error_segment + 프로토콜 컬럼 (frame_type·reference_point 등)
- `user_patterns` row N개 INSERT (best-effort, distortion 1건당 1 row) — `user_id`·`log_id`·`distortion_type`·`trigger_category`·`pain_score_delta=null`
- `safety_events` row 0건 (위 트리거·자동 사고는 위기 키워드 미포함 — 회귀 시 noise)
- POST `/api/generate-questions` `{logId}` → 200 + questions 배열 3개

**점검 항목**:
- [ ] `logs` row INSERT (`SELECT id, pain_score, log_type, created_at, trigger_category FROM logs WHERE user_id=<test>;` → log_type=null·pain_score=3)
- [ ] `analysis` row 1개 이상 INSERT (왜곡 탐지 시) 또는 NULL placeholder 1건 (왜곡 0건 시) — distortion_type·intensity·logic_error_segment·frame_type·reference_point·probability_estimate·loss_aversion_signal·cas_rumination·cas_worry·system2_question_seed·decentering_prompt 11개 컬럼 정합
- [ ] `user_patterns` row N개 INSERT (왜곡 N건). RLS `user_patterns_insert_own` 정책 통과 — `user_id=auth.uid()`. 실패 시에도 분석 응답 200 (best-effort 로그만)
- [ ] `safety_events` 0건 (이 트리거는 위기 키워드 미포함). 만약 INSERT 발생 시 false positive — 즉시 보고
- [ ] segment 하이라이팅 `<mark>` 작동 (자동 사고 내 segment 부분 노란 배경)
- [ ] 분석 결과 — distortion type 5종 enum 중 하나만 등장 (`catastrophizing`·`all_or_nothing`·`emotional_reasoning`·`personalization`·`arbitrary_inference`)
- [ ] reframe 질문 (생각을 점검하는 질문) 3개 노출 + 답변 입력 영역 작동
- [ ] system2_question_seed에 *숫자/근거 비율 분리* 키워드 등장 (분석가 톤 유지)
- [ ] PII grep — Vercel 로그에서 trigger·thought 평문 0건 (server-logger length만 로깅 PASS)
- [ ] iPhone SE 320px 폭에서 이론 박스 6개·하이라이트·질문 카드 단락 잘림 0건
- [ ] 본질 위협 #1·#2·#4: 분석 결과 박스 카피 분석가 톤 유지, "치료 효과"·"전문가 진단" 표현 0건
- [ ] **AI anomaly 베이스라인 기록**: 본 1건 분석 결과를 `docs/qa/baseline-2026-05-05.md` 형식으로 기록 (distortion type·intensity·rationale·frame_type·probability_estimate). 첫 5명 인터뷰 후 senior-qa 후속 anomaly 비교의 기준점 (회의록 §4.3)

**실패 분류**:
- **Critical**: `/api/analyze` 500·503 (Gemini fail) / `analysis` INSERT 실패 (NOT NULL CHECK 위반·CHECK 제약 위반) / segment 하이라이팅으로 XSS 발생 / 분석 결과에 타 user 데이터 leak
- **Major**: `user_patterns` INSERT 실패 (RLS 차단) — 데이터 수집 누락 / Zod schema 검증 실패 fallback 동작 / 질문 3개 미만 / 분석 결과에 distortion type enum 외 값 등장
- **Minor**: stage loader 메시지 회귀 / 11개 프로토콜 컬럼 일부 누락 (graceful fallback 작동 시 minor)

**관련 파일**:
- `app/log/page.tsx:45-78` (logs INSERT)
- `app/api/analyze/route.ts:51-362` (분석 + user_patterns INSERT)
- `app/api/generate-questions/route.ts` (Socratic 질문 생성)
- `app/analyze/[id]/page.tsx:127-308` (3 stage 흐름)
- `lib/openai/gemini.ts` (Gemini 분석 함수)
- `lib/safety/detect.ts` (위기 감지 — 이번 케이스 negative)
- `supabase/migrations/09_user_patterns_aggregates.sql`
- `supabase/migrations/12_schema_drift_fixes.sql:54-67` (analysis DELETE 정책)

---

### Step 4 — action 진행 → 자율성 지수 변화

**사전 조건**:
- Step 3 통과 (/visualize/<id> 진입 상태에서 /action/<id>로 라우팅 가능 — 또는 /analyze/<id>에서 답변 저장 후 자동 라우팅)
- `intervention` 테이블에 `completion_note`·`completion_reaction` 컬럼 적용 (마이그레이션 12)

**작업**:
1. /visualize/<id>에서 "행동 설계" 진입 또는 직접 /action/<id> 진입
2. "Tiny Habit 제안" 3건 노출 (dominant distortion 매핑)
3. 행동 계획 3필드 입력:
   - 언제 (예: "오늘 21:00")
   - 무엇을 (예: "보고서 첫 문단만 쓰기")
   - 얼마나 (예: "5분")
4. "행동 계획 확정" 클릭 → POST `/api/action` `{markCompleted:false}` → `intervention` UPSERT
5. 화면 전환 — "이미 했어요 — 결과 기록" 버튼 노출
6. "이미 했어요 — 결과 기록" 클릭 → 완료 모달
7. 모달 내 행동 전후 변화 1탭 선택 (예: `improved` 😌 나아졌어요)
8. 행동 메모 1줄 입력 (예: "처음 2문장 썼더니 흐름이 잡혔다") — +15점 보너스
9. "메모 기록하고 완료 (+15점 보너스)" 클릭 → POST `/api/action` `{markCompleted:true, completionNote, completionReaction}`
10. notice 노출: "행동이 기록됐습니다. +25점 (메모 보너스 포함)" — 기본 10점 + 메모 보너스 15점

**기대 UI**:
- 자율성 지수 카드 — 0점 → 25점 변화
- 완료 후 버튼 disabled "완료됨 ✓" (success bg)
- legacyAction 배너는 미노출 (이번이 첫 계획)
- iPhone SE 폭 모달 fit + 1탭 3버튼 가로 배치 (반응 옵션)

**기대 DB/API**:
- POST `/api/action` 1차 (markCompleted=false) — `intervention` row INSERT (또는 UPSERT) — `final_action` JSON 직렬화·`is_completed=false`·`autonomy_score=null`
- POST `/api/action` 2차 (markCompleted=true) — `intervention` UPDATE — `is_completed=true`·`completed_at=NOW()`·`autonomy_score=25`(+15 메모 보너스)·`completion_note`·`completion_reaction='improved'`
- RLS `intervention` 본인 log row만 UPSERT 허용

**점검 항목**:
- [ ] /action/<id> 진입 시 dominant distortion 매핑된 Tiny Habit 3건 노출 (DISTORTION_HABITS 5종 매핑 정합)
- [ ] 3필드 입력 검증 — `validateActionPlan` 통과 (when·what·howLong 모두 trim().length > 0)
- [ ] 1차 저장 후 `intervention` row INSERT (`SELECT id, log_id, final_action, is_completed, autonomy_score FROM intervention WHERE log_id=<step3 log_id>;`)
- [ ] 2차 완료 후 `intervention` UPDATE — is_completed=true·completed_at NOT NULL·autonomy_score=25·completion_note≤200자·completion_reaction='improved'
- [ ] CHECK 제약 통과: `completion_reaction IN ('improved','same','worse')` + `completion_note LENGTH ≤ 200`
- [ ] 자율성 지수 카드 UI 반영 — 0 → 25 (+15 메모 보너스 적용 확인)
- [ ] 모달 1탭 3버튼 (improved/same/worse) UI 노출 + 선택 상태 시각 표시
- [ ] iPhone SE 320px 모달 viewport fit (스크롤 없이 1탭+메모+CTA 표시)
- [ ] PII grep — Vercel 로그에서 final_action·completion_note 평문 0건
- [ ] RLS 검증: 다른 user의 intervention row UPDATE 시도 → 0행 (Supabase에서 anon cross-account 시뮬)
- [ ] 본질 위협 #1·#2: Tiny Habit 카피 분석가 톤 유지, "함께"·"위로" 0건. CTA "이미 했어요 — 결과 기록" 회의록 톤 정합

**실패 분류**:
- **Critical**: `/api/action` 500 / `intervention` UPSERT 실패 (CHECK 위반·RLS 차단) / autonomy_score 계산 오류 (예: 메모 보너스 누락)
- **Major**: completion_note·completion_reaction 컬럼 부재 (마이그레이션 12 미적용) → graceful fallback 시 데이터 누락 / 자율성 지수 UI 반영 안됨 / Tiny Habit 매핑 회귀
- **Minor**: notice 카피 회귀 / 모달 애니메이션 부재

**관련 파일**:
- `app/action/[id]/page.tsx:31-78` (DISTORTION_HABITS 매핑)
- `app/action/[id]/page.tsx:206-264` (saveAction)
- `app/api/action/route.ts` (POST handler)
- `lib/intervention/action-plan.ts` (parseActionPlan·validateActionPlan·serializeActionPlan)
- `supabase/migrations/12_schema_drift_fixes.sql:74-84` (completion_note/reaction 컬럼)

---

### Step 5 — 24시간 후 재평가 → 통증 변화량 측정

**사전 조건**:
- Step 4 통과 (`intervention` row is_completed=true·completed_at=NOW())
- 24h 단축 SOP 사용 (실시간 24h 대기 X — 본 문서 §2 참조)
- `findPendingReview` 게이트 조건: `NOW() - 48h ≤ completed_at ≤ NOW() - 6h` 충족 필요

**작업**:
1. **24h 단축 SOP 채택 (a)** 적용 — Supabase SQL editor에서:
   ```sql
   UPDATE intervention
   SET completed_at = NOW() - INTERVAL '7 hours'
   WHERE id = '<step4 intervention id>'
     AND user_id IN (SELECT id FROM auth.users WHERE email='qa-e2e-...');
   -- 7h: pending review window (6h~48h) 진입 + 여유 1h
   ```
   (변경 전: completed_at = step4 시점 NOW. 변경 후: step5 시점 NOW - 7h. 결과: pending review FIFO 게이트 통과)
2. /dashboard 새로고침 → 상단에 ReviewCard 노출 — "지난 기록 재평가하기 — 어제 기록한 「<trigger>」, 지금은 어떠신가요?"
3. ReviewCard 클릭 → /review/<logId> 라우팅
4. 재평가 폼에서 통증 점수 1점 (별로 안 힘들어요) 선택 — 초기 3점에서 1점으로 감소
5. POST `/api/review/pain-score` `{logId, painScore:1}` → 200 + `{ok:true, deltaPain:2}`
6. /dashboard 복귀 → "이번 주 통증 변화량 누적" 카드 0 → 2점

**기대 UI**:
- ReviewCard 카피 정확히 "지난 기록 재평가하기" + "어제 기록한 「<trigger snippet 40자>」, 지금은 어떠신가요?"
- ReviewCard 우측 ✕ 버튼 (dismiss용)
- 재평가 후 dashboard "이번 주 통증 변화량 누적" 카드 = 2 (=3-1)
- iPhone SE 폭 ReviewCard fit (단락 잘림 0건)

**기대 DB/API**:
- `findPendingReview` SELECT — `intervention.is_completed=true` AND `reevaluated_pain_score IS NULL` AND `review_dismissed_at IS NULL` AND `completed_at` window 통과
- POST `/api/review/pain-score` 200 — `intervention` UPDATE — `reevaluated_pain_score=1`·`reevaluated_at=NOW()`
- 중복 재평가 시도 시 409 응답 (`reevaluated_pain_score is not null`)
- /dashboard `weeklyPositiveDeltaPain` 산출: `sumPositiveDeltaPain([{initial:3, reevaluated:1}])` = 2

**점검 항목**:
- [ ] 24h 단축 SOP (a) 정확히 적용 — UPDATE 1건만 영향 (`UPDATE ... WHERE id='<step4 iv id>'` AND user_id 매칭). 영향 row 수 1 정확
- [ ] /dashboard 새로고침 시 ReviewCard 노출 — `findPendingReview` 결과 not null
- [ ] ReviewCard 카피 정확 — "지난 기록 재평가하기" 헤드 + 트리거 snippet (40자 트런케이트)
- [ ] daysAgo 계산 정합 — completed_at NOW-7h 기준 → daysBetween → 1일 (Math.max(1, floor(7h/24h))=1, 카피 "어제")
- [ ] 재평가 페이지 진입 — `/review/<logId>` 라우팅 + pain_score 1·2·3·4·5 선택지 5개
- [ ] POST `/api/review/pain-score` 200 — body `{ok:true, deltaPain:2}` 정합 (3-1=2)
- [ ] `intervention` UPDATE 검증: `SELECT reevaluated_pain_score, reevaluated_at FROM intervention WHERE id=<iv id>;` → 1, NOW
- [ ] 중복 재평가 시 409 — POST 재호출 시 "이미 재평가한 건입니다" 응답
- [ ] /dashboard `이번 주 통증 변화량 누적` 카드 = 2점 (sumPositiveDeltaPain 동작 — 양수만 집계)
- [ ] /insights "인지 유연성 변화 (통증 변화량)" 차트에 1개 점 노출 (오늘 일자, avgDelta=2)
- [ ] PII grep — Vercel 로그에 painScore·logId 평문 노출 0건
- [ ] RLS 검증: 다른 user의 logId로 painScore POST 시도 → 404 ("로그를 찾을 수 없습니다")
- [ ] 본질 위협 #4: 재평가 카피에 "치료" "회복" 0건. "통증 변화량" 라벨 회의록 §2.9 정합

**실패 분류**:
- **Critical**: `/api/review/pain-score` 500 / 24h 단축 SQL이 의도 외 row 수정 / `intervention` UPDATE 실패 / RLS 위반 (타 user log painScore 조작 가능)
- **Major**: ReviewCard 미노출 (findPendingReview 게이트 fail — completed_at window 오류) / dashboard 통증 변화량 카드 반영 안됨 / 중복 재평가 검증 누락 (409 미반환 — 데이터 정합성 손상)
- **Minor**: daysAgo 카피 회귀 ("어제" / "N일 전" 분기 오류)

**관련 파일**:
- `lib/review/pending-review.ts:53-84` (findPendingReview)
- `lib/review/delta-pain.ts` (sumPositiveDeltaPain)
- `components/review/ReviewCard.tsx:38-66`
- `app/review/[id]/page.tsx` (재평가 폼)
- `app/api/review/pain-score/route.ts:11-80`
- `app/dashboard/page.tsx:182-200` (weeklyPositiveDeltaPain 산출)
- 본 문서 §2 (24h 단축 SOP)

---

### Step 6 — /me → "온보딩 다시 보기" → /onboarding/1?replay=1

**사전 조건**:
- Step 5 통과 (user는 onboarding 완주 완료 상태 — `user_onboarding.reached_act=3`)
- `OnboardingActClient.tsx`에 `isReplay = searchParams.get('replay') === '1'` 분기 적용

**작업**:
1. /me 진입 (BottomTabBar "나" 탭 클릭)
2. 메뉴 섹션 "탐색"에서 "온보딩 다시 보기" 클릭
3. `/onboarding/1?replay=1` 라우팅
4. Act 1 슬라이드 1·2·3 → "다음 Act"·"바로 시작하기" 동일 노출
5. (검증을 위해) "바로 시작하기" 클릭 → `handleStartNow` 호출
6. `completeOnboarding(1)` 호출 시도 — but `isReplay=true`로 **early return** → /api/onboarding/complete *미호출*
7. /dashboard 라우팅

**기대 UI**:
- /me "탐색" 메뉴 — "온보딩 다시 보기" 항목 노출 + 부제 "9 슬라이드 — 왜·무엇·어떻게"
- 라우트 `?replay=1` query param 유지
- 슬라이드 UI는 평소와 동일 (replay 별도 표식 X — 의도적)
- /dashboard 복귀 시 user_onboarding row 변경 없음 (reached_act=3 유지, completed_at 변경 X)

**기대 DB/API**:
- POST `/api/onboarding/complete` **호출 0건** (replay 모드 — `completeOnboarding` early return)
- `user_onboarding` row 변경 0건 — reached_act=3·completed_at 모두 step 2 시점 그대로
- 만약 호출됐어도 reached_act=3 → max(3, 1) = 3 → UPDATE 미실행 (idempotent)

**점검 항목**:
- [ ] /me 메뉴 "온보딩 다시 보기" 항목 존재 — href `/onboarding/1?replay=1` 정확
- [ ] 라우팅 후 `searchParams.get('replay') === '1'` true → `isReplay=true`
- [ ] Act 1 슬라이드 진입 — UI는 평소와 동일 (인디케이터·CTA·X 버튼 정합)
- [ ] CTA "바로 시작하기" / "작동 원리 더 알아보기" / "지금 첫 디버깅 시작하기" 모두 노출
- [ ] CTA 클릭 시 `completeOnboarding` early return → POST `/api/onboarding/complete` Network 탭에서 호출 0건
- [ ] `user_onboarding` row 변경 0건 (`SELECT * FROM user_onboarding WHERE user_id=<test>;` → reached_act·completed_at 그대로)
- [ ] Act 1·2 X 버튼 클릭 시도 → /dashboard 복귀 + replay 모드 로직 동일 (POST 미호출)
- [ ] Act 2·3 진입 시 URL `?replay=1` query 유지 (handleNextAct 함수 내 `${isReplay ? '?replay=1' : ''}` 정합)
- [ ] iPhone SE 320px replay 슬라이드 viewport fit (Step 2와 동일 폭)
- [ ] /dashboard 복귀 시 BottomTabBar 정상 노출 (replay 모드 종료)

**실패 분류**:
- **Critical**: /me 메뉴 항목 회귀 (href 변경) / replay 모드에서 `user_onboarding` UPDATE 발생 (completed_at 덮어쓰기) — 데이터 손상
- **Major**: replay 모드에서 POST 발생 (early return 회귀) — best-effort라 사용자 영향 X but signal noise / Act 진입 URL replay query 누락
- **Minor**: 메뉴 부제 카피 회귀

**관련 파일**:
- `app/me/page.tsx:170-178` (메뉴 항목)
- `app/onboarding/[act]/OnboardingActClient.tsx:32-72` (replay 분기)

---

### Step 7 — /insights → 자율성 지수 누적·통증 변화량 차트 노출

**사전 조건**:
- Step 4·5 통과 (`intervention.autonomy_score=25`·`reevaluated_pain_score=1`·`logs.pain_score=3`)
- `analysis` row 1건 이상 (Step 3)

**작업**:
1. /insights 진입 (BottomTabBar "인사이트" 탭 클릭)
2. 기간 필터 "30일" 기본 선택 → "7일"·"전체" 토글 검증
3. 차트 6종 모두 렌더링 확인:
   - 성장 지표 카드 3종 (왜곡 강도 변화·완료율 변화·가장 개선 — 30일/7일에서만)
   - 요약 카드 3종 (총 분석 횟수=1·주요 왜곡=<step3 dominant>·행동 완료율=100%)
   - 패턴 리포트 (PatternReport — Step 3 trigger_category × dominant distortion 1건)
   - 왜곡 유형 분포 BarChart
   - 자율성 지수 누적 추이 LineChart (1점 = 25점)
   - 왜곡 유형별 평균 강도 RadarChart
   - 인지 유연성 변화 (통증 변화량) LineChart (1점 = avgDelta=2)
   - 텍스트 인사이트 ("최근 30일간 가장 자주 나타난 왜곡은 ..." 마이크로카피)

**기대 UI**:
- 자율성 지수 누적 추이 차트 — y축 25 도달 (1개 점)
- 통증 변화량 차트 — 0 기준선 + avgDelta=2 점 1개 (양수)
- 패턴 리포트 — Step 3 trigger_category(예: 'work') × dominant distortion(예: 'catastrophizing') 1행 + deltaPain=2
- "Manual" 헤더 링크 → /manual

**기대 DB/API**:
- SELECT `analysis` (logs!inner user_id RLS) → 1건
- SELECT `intervention` (logs!inner user_id) — autonomy_score not null + reevaluated_pain_score not null
- SELECT `logs` join `analysis` join `intervention` 패턴 리포트 쿼리 — RLS 통과 + 본인 row만

**점검 항목**:
- [ ] 모든 차트 렌더링 (recharts ResponsiveContainer 작동)
- [ ] 자율성 지수 LineChart — cumulative 25점 도달
- [ ] 통증 변화량 LineChart — y축 양수 영역 + ReferenceLine y=0 노출 + 1개 점
- [ ] 왜곡 유형 분포 BarChart — Step 3 dominant 1건 막대
- [ ] PatternReport — patternRows 1건 (category·distortion·deltaPain=2 정합)
- [ ] 기간 필터 7d/30d/all 전환 시 데이터 재로드 + period state 갱신
- [ ] "전체" 선택 시 성장 지표 3종 "전체 기간 선택 시 비교 지표를 표시할 수 없습니다" 카피 노출
- [ ] RLS — `logs!inner(user_id=<test>)` 필터로 본인 row만. cross-account 검증 (Supabase에서 anon으로 다른 user 조회 시 0행)
- [ ] iPhone SE 320px 폭에서 차트 6종 viewport fit (recharts ResponsiveContainer 동작 + 좌측 margin -20 적용)
- [ ] BottomTabBar "인사이트" 탭 active 상태
- [ ] 본질 위협 #1·#2: "인지 유연성 변화 (통증 변화량)" 라벨 분석가 톤 유지. "치유"·"회복" 0건
- [ ] "주요 왜곡" 라벨 분석가 톤 ("주요 패턴" 등 정서적 변경 회귀 0건)

**실패 분류**:
- **Critical**: /insights 진입 자체 실패 / 차트 렌더링 0개 / RLS 위반 (타 user 데이터 노출) / 통증 변화량 차트가 음수만 표시 (양수 산식 오류)
- **Major**: 자율성 지수 누적 추이 데이터 0 (Step 4 데이터 누락) / PatternReport 0건 (trigger_category null로 필터링) / 기간 필터 토글 회귀
- **Minor**: 텍스트 인사이트 카피 회귀 / 차트 색상·여백 미세 회귀

**관련 파일**:
- `app/insights/page.tsx:42-259`
- `components/insights/PatternReport.tsx`
- `lib/insights/pattern-report.ts`

---

### Step 8 — /journal → 로그 기록 노출

**사전 조건**:
- Step 3 (logs row 1건) + Step 4 (intervention row 1건) 통과
- `logs.log_type=null` (분석 로그 — `or('log_type.eq.distortion,log_type.is.null')` 필터에서 포함)

**작업**:
1. /journal 진입 (BottomTabBar "일지" 탭 클릭)
2. 탭 "최근 활동" 선택 — Step 3 로그 1건 카드 노출
3. 카드 클릭 → /analyze/<logId> 라우팅 (기존 분석 결과 캐시 노출)
4. 뒤로가기 → /journal
5. 탭 "행동 계획" 선택 — Step 4 intervention 1건 카드 노출 ("완료" 라벨 + +25점)
6. 카드 클릭 → /action/<logId> 라우팅 (완료됨 ✓ 상태 노출)

**기대 UI**:
- 탭 2종 ("최근 활동"·"행동 계획") 노출 + active border-primary 분기
- "최근 활동" 카드: trigger·thought·formatDate 노출
- "행동 계획" 카드: trigger·formatActionPlanForDisplay·created_at·`+25점` 노출 + 완료/진행중 라벨 분기
- 더보기 버튼: 3개 초과 시만 노출 (이번엔 1건이라 미노출)
- 빈 상태 카피: "아직 기록이 없어요"·"아직 행동 계획이 없어요" (Step 3·4 통과 후엔 미노출)

**기대 DB/API**:
- SELECT `logs` `or('log_type.eq.distortion,log_type.is.null')` + `eq('user_id', <test>)` + `order created_at DESC` + `limit 20` — 1건
- SELECT `intervention` `logs!inner(user_id, log_type)` + `order created_at DESC` + `limit 20` → success log_type 필터링 후 1건

**점검 항목**:
- [ ] /journal 진입 시 로딩 spinner 후 데이터 로드
- [ ] "최근 활동" 카드 1건 (Step 3 trigger·thought 정합)
- [ ] 카드 클릭 → /analyze/<logId> 라우팅 → 기존 분석 결과 (Step 3와 동일 distortion·intensity·segment) 캐시 노출
- [ ] "행동 계획" 카드 1건 (Step 4 final_action JSON 디스플레이용 변환 정합) + autonomy_score 25점·완료 라벨
- [ ] 카드 클릭 → /action/<logId> 라우팅 → "완료됨 ✓" 상태 노출
- [ ] 탭 토글 시 active 표시 분기 정합
- [ ] log_type='success' 카드는 행동 계획 탭에서 필터링 (filteredActions.filter log_type !== 'success')
- [ ] RLS — 본인 logs/intervention만 노출 (cross-account 검증)
- [ ] iPhone SE 320px 폭에서 카드 단락 잘림 0건
- [ ] BottomTabBar "일지" 탭 active

**실패 분류**:
- **Critical**: /journal 진입 시 다른 user 로그 노출 / formatActionPlanForDisplay 오류로 카드 fail
- **Major**: 탭 토글 회귀 / 카드 클릭 시 라우팅 실패 / log_type 필터 회귀 (success 로그가 행동 계획 탭에 등장)
- **Minor**: formatDate 라벨 회귀 / "더보기" 임계 변경

**관련 파일**:
- `app/journal/page.tsx:25-200`
- `lib/intervention/action-plan.ts` (formatActionPlanForDisplay)

---

### Step 9 — 매뉴얼 페이지 정합

**사전 조건**:
- /me 또는 /dashboard 푸터에서 /manual 진입 가능
- `lib/content/technical-manual.ts` MANUAL_SECTIONS 배열 정합

**작업**:
1. /me → 메뉴 "매뉴얼" 클릭 또는 /dashboard 푸터 "매뉴얼" 클릭 → /manual 진입
2. 사이드바 목차 노출 — "0. 서문" + MANUAL_SECTIONS 항목들
3. 본문 헤더 + 서문 + 각 섹션 (인지 왜곡 5종 매뉴얼 anchor `dbug-01`~`dbug-05` 등) 렌더링
4. /analyze/<id>에서 distortion 카드 ? 버튼 클릭 → `/manual#<DistortionManualAnchor[type]>` 라우팅 → 해당 섹션 자동 스크롤
5. /insights 왜곡 분포 차트 하단 "각 왜곡이 무슨 뜻인가요? 매뉴얼 보기 →" 링크 → `/manual#dbug-03` 라우팅
6. /dashboard 매뉴얼 너지 배너 (3회 이상 분석 누적 시) → "매뉴얼 열기 →" 클릭 → /manual

**기대 UI**:
- /manual 진입 시 사이드바·본문 2-column 레이아웃 (lg 이상)
- 모바일 (lg 미만) — 사이드바 위·본문 아래 stacked
- iPhone SE 폭 — 사이드바 navLabel 짧은 형식 노출 (`<span className="lg:hidden">`)
- 본문 카드 — title·body·items·debuggingQuestion 정합 렌더링
- "디버깅 질문" 박스 — primary bg-opacity-5 강조

**기대 DB/API**:
- DB·API 호출 없음 (정적 콘텐츠 — `lib/content/technical-manual.ts`)

**점검 항목**:
- [ ] /manual 진입 — 헤더 + MANUAL_PREFACE + MANUAL_SECTIONS 모두 렌더링
- [ ] 사이드바 anchor 클릭 시 해당 섹션 스크롤 (browser native anchor 동작)
- [ ] /analyze 카드 ? 버튼 → `/manual#dbug-XX` 라우팅 + anchor scroll 정합
- [ ] /insights "매뉴얼 보기 →" 링크 → `/manual#dbug-03` 라우팅
- [ ] 매뉴얼 너지 배너 (Step 3 분석 1회로는 노출 X — 3회 임계 미달. 점검을 위해 별도 SQL로 `realDistortionCount` 시뮬 또는 dismiss 동작만 확인)
- [ ] iPhone SE 320px 폭에서 사이드바 navLabel 짧은 형식 + 본문 카드 단락 잘림 0건
- [ ] 본질 위협 #1·#2·#4 카피 가드: 매뉴얼 sweep 미진행 영역(designer 5/5~5/8 sweep 진행) — 회의록 §2.4 합의. 잔존 카피 발견 시 Major 이슈로 보고
- [ ] /me 메뉴 "매뉴얼" 항목 → /manual 라우팅 정합
- [ ] /dashboard 푸터 "매뉴얼" 링크 → /manual 라우팅 정합
- [ ] 5개 distortion 모두 anchor 정합 (`DistortionManualAnchor` map 모든 enum 키 매핑)

**실패 분류**:
- **Critical**: /manual 자체 진입 실패 / MANUAL_SECTIONS 렌더링 fail
- **Major**: anchor scroll 회귀 (?·매뉴얼 보기 → 진입 시 섹션 미도달) / 본질 위협 #4 잔존 카피 ("치료" "회복" "전문가 진단") 발견 / DistortionManualAnchor map 누락 키
- **Minor**: 사이드바 lg breakpoint 분기 회귀 / "디버깅 질문" 박스 색상 회귀

**관련 파일**:
- `app/manual/page.tsx:1-80`
- `lib/content/technical-manual.ts` (콘텐츠 진실원)
- `types/index.ts` `DistortionManualAnchor` map

---

## 2. 24시간 단축 검증 SOP

24시간 실시간 대기는 *5/5 (화) E2E 실행 시간 윈도우* 안에 도달 불가. 다음 3방법 비교:

| 방법 | 설명 | RLS·CASCADE·정합성 영향 |
|---|---|---|
| **(a) intervention.completed_at UPDATE** | SQL editor에서 `UPDATE intervention SET completed_at = NOW() - INTERVAL '7 hours' WHERE id=<iv id>` | RLS service_role 우회 가능. CASCADE 영향 0 (logs.created_at 그대로). 정합성: `findPendingReview` window (NOW-48h ~ NOW-6h) 즉시 진입. *권장*. |
| **(b) reevaluated_pain_score 직접 INSERT** | `UPDATE intervention SET reevaluated_pain_score=<n>, reevaluated_at=NOW()` | findPendingReview·재평가 폼·POST `/api/review/pain-score` 흐름 *전체 우회*. /review/<id> UI 검증 누락. CHECK 위반 위험. *비권장*. |
| **(c) checkin/route.ts·review API의 게이트 우회** | production code 변경 | 코드 변경 0건 가드 위반. *불가*. |

### 채택: (a) — `intervention.completed_at` UPDATE

**이유**:
1. `findPendingReview` 게이트 6h~48h window 자연 통과 — UI 흐름 (ReviewCard 노출 → 클릭 → /review/<id> → POST `/api/review/pain-score`) 모두 검증 가능
2. `logs.created_at`·`analysis.created_at` 그대로 — daysAgo 계산은 completed_at 기준이므로 영향 0
3. CASCADE 영향 0: `intervention` UPDATE는 logs/auth.users CASCADE chain에 영향 X
4. RLS 영향: SQL editor는 service_role 또는 dashboard owner — RLS bypass 정상. 단 *production data*에서는 절대 사용 X (테스트 계정만)
5. 롤백 용이: `UPDATE intervention SET completed_at = '<원래 ISO>' WHERE id=<iv id>` 1줄

**실행 SQL** (Step 5 사전):
```sql
-- Variables
-- :test_email = 'qa-e2e-2026-05-05+xxxx@<도메인>'
-- 1. user_id 확인
SELECT id FROM auth.users WHERE email = :test_email;
-- 2. intervention id 확인
SELECT id, log_id, completed_at FROM intervention
WHERE log_id IN (SELECT id FROM logs WHERE user_id = (SELECT id FROM auth.users WHERE email = :test_email))
  AND is_completed = true;
-- 3. UPDATE (가드: user_id 매칭 명시)
UPDATE intervention
SET completed_at = NOW() - INTERVAL '7 hours'
WHERE id = '<step4 iv id>'
  AND log_id IN (SELECT id FROM logs WHERE user_id = (SELECT id FROM auth.users WHERE email = :test_email));
-- 영향 row = 1 확인
```

**검증 후 정리** (E2E 종료 시):
```sql
-- 테스트 계정 cascade 삭제 (auth.users → ON DELETE CASCADE → logs·user_onboarding·user_patterns·checkins·intervention·analysis 모두 정리)
DELETE FROM auth.users WHERE email = :test_email;
```

---

## 3. AI 분석 anomaly 베이스라인

본 E2E의 Step 3 분석 결과를 *베이스라인*으로 별도 파일에 기록 (회의록 §4.3 — senior-qa 후속 액션).

**기록 형식** (`docs/qa/baseline-2026-05-05.md` — Step 3 직후 작성):

```
# AI 분석 anomaly 베이스라인 (2026-05-05 E2E 1회)

## 입력
- trigger: "<Step 3 trigger>"
- thought: "<Step 3 thought>"
- pain_score: 3

## 출력 (Gemini 응답)
- distortions: [{type, intensity, segment, rationale}, ...]
- frame_type: <loss/gain/mixed>
- reference_point: "<...>"
- probability_estimate: <int|null>
- loss_aversion_signal: <0~1>
- cas_signal: { rumination: <0~1>, worry: <0~1> }
- system2_question_seed: "<...>"
- decentering_prompt: "<...>"
- trigger_category: <enum>

## 비교 기준 (5명 인터뷰 후)
첫 5명 인터뷰의 분석 결과를 본 베이스라인 대비:
- distortion 종류 변동 (5종 enum 중 어떤 것이 새로 등장/누락?)
- intensity 평균 ±0.2 이상 변동?
- frame_type 분포 변화?
- probability_estimate 변동 ±20% 이상?
변동 발견 시 Gemini 모델 업데이트·프롬프트 회귀 추적 트리거.
```

## 4. 발견 이슈 기록 양식

E2E 실행 중 발견된 모든 이슈를 다음 표로 기록 후 5/5 EOD 회의 보고 (회의록 §7).

| # | 단계 | 분류 | 설명 (변경 전→변경 후 / 기대→실제) | 재현 절차 (1·2·3) | 영향 영역 (사용자·데이터·법적) | 우선순위 | 상태 |
|---|---|---|---|---|---|---|---|
| 1 | Step N | Critical/Major/Minor | 기대: ... / 실제: ... | 1. ... 2. ... 3. ... | 사용자: ... / 데이터: ... / 법적: ... | P0/P1/P2 | open/fixing/verify/closed |
| 2 | ... | ... | ... | ... | ... | ... | ... |

분류 정의 (페르소나 정의 §6 + 본 시나리오):
- **Critical**: 데이터 손실·RLS 위반·인증 차단·핵심 흐름 차단 (P0)
- **Major**: 메트릭·UI 회귀·본질 위협 카피 회귀·CHECK 위반 (P1)
- **Minor**: 마이크로카피·애니메이션·경계 분기 (P2)

## 5. GO/NO-GO 판정 기준

5/5 EOD CEO 보고 시 IM.1 모집 시작 승인 판정:

- **GO**: Critical 0건. Major ≤ 2건 (모두 hotfix 가능 또는 우회 가능). Minor 무관.
- **NO-GO**: Critical ≥ 1건 OR Major ≥ 3건. → CTO·CEO 보고 → senior-fullstack hotfix 후 재실행. 5/9 (월) deadline 사수.

본 시나리오와 회의록 §4.2 prerequisite 4개 (a·b·c·d) ALL pass가 모집 시작 GO 조건. (b)는 본 시나리오 GO 판정에 종속.

## 6. 보고선

페르소나 정의 §보고선 + 회의록 §3.2 합의:

1. **1차**: senior-qa → CTO (기술 회귀 사안 — 코드·migration·RLS·AI quality)
2. **2차**: senior-qa → CEO (Major·Critical 발견 시 직보 — 독립 검증 라인 권한)
3. **3차**: 회의록 §7 5/5 EOD 종합 보고 → 모집 시작 GO/NO-GO 판정 회의

senior-fullstack-engineer hotfix 권고 시 등급별 분기:
- P0/P1: senior-fullstack 즉시 수정 → senior-qa 재실행
- P2: 모집 시작 후 후속 처리 (모집 차단 X)

## 7. 권한·가드 경계 (실행 시 준수 사항)

senior-qa-engineer 권한 경계 (페르소나 정의 §권한 경계):

- **본 시나리오 실행 중 코드·migration·RLS 정책 작성 X** — 발견된 이슈는 senior-fullstack에 보고만
- **production data 임의 UPDATE X** — §2 (a) SOP는 *테스트 계정 한정*. 실 사용자 데이터에 대한 SQL은 절대 실행 X
- **Gemini API 응답 변동 자체는 수정 권한 X** — anomaly 베이스라인 기록만, 프롬프트 변경은 senior-fullstack
- **법무·PII 정합성 해석 X** — 코드상 PII 누출만 grep, 법적 해석은 risk-manager
- **머지 차단권 X** — P0 발견 시 강하게 권고만, 머지 결정은 CTO

---

## 부록 A. 점검 항목 체크리스트 (Step 1~9 합산)

실행 시 단순 mark용 — 본 부록 인쇄·디지털 markdown editor에서 체크.

### Step 1 (8개)
- [ ] 가입 성공 → `auth.users` 신규 row INSERT
- [ ] `raw_user_meta_data` 6키 정합
- [ ] /dashboard → /onboarding/1 redirect 동작
- [ ] BottomTabBar 미표시
- [ ] iPhone SE 320px 슬라이드 fit
- [ ] 본질 위협 #1·#2 카피 가드
- [ ] 본질 위협 #4 caption 가드
- [ ] PII 마스킹 (이메일·비밀번호 평문 0건)

### Step 2 (9개)
- [ ] Act 1·2·3 9슬라이드 모두 도달
- [ ] 키보드 ←→ + swipe 50px 동작
- [ ] Act 3 CTA 카피 정확
- [ ] POST /api/onboarding/complete 200 + INSERT
- [ ] RLS — 타 user row SELECT 0행
- [ ] /log 즉시 진입
- [ ] iPhone SE 9슬라이드 fit
- [ ] 본질 위협 #1·#2·#4 9슬라이드 가드
- [ ] sr-only announce 작동

### Step 3 (12개)
- [ ] `logs` row INSERT
- [ ] `analysis` 11컬럼 정합 INSERT
- [ ] `user_patterns` N개 INSERT (RLS)
- [ ] `safety_events` 0건
- [ ] segment 하이라이팅 작동
- [ ] distortion 5종 enum만 등장
- [ ] reframe 질문 3개 + 답변 입력
- [ ] system2_question_seed 분석가 톤
- [ ] PII grep — trigger·thought 평문 0건
- [ ] iPhone SE 320px 분석 결과 fit
- [ ] 본질 위협 #1·#2·#4 분석 결과 가드
- [ ] AI anomaly 베이스라인 기록 (별도 파일)

### Step 4 (10개)
- [ ] Tiny Habit 5종 매핑 정합
- [ ] 3필드 검증 통과
- [ ] `intervention` INSERT (1차)
- [ ] `intervention` UPDATE (2차) — autonomy_score 25
- [ ] CHECK 제약 통과 (reaction enum + note 200자)
- [ ] 자율성 지수 UI 반영
- [ ] 모달 1탭 3버튼 노출
- [ ] iPhone SE 모달 fit
- [ ] PII grep — final_action·completion_note 평문 0건
- [ ] RLS — 타 user intervention UPDATE 차단

### Step 5 (12개)
- [ ] 24h 단축 SOP (a) — UPDATE 1건만 영향
- [ ] /dashboard ReviewCard 노출
- [ ] ReviewCard 카피 정확
- [ ] daysAgo 계산 정합
- [ ] /review/<id> 라우팅 + 5점 선택지
- [ ] POST /api/review/pain-score 200 + deltaPain=2
- [ ] `intervention` UPDATE 검증
- [ ] 중복 재평가 409
- [ ] 통증 변화량 카드 = 2점
- [ ] /insights Δpain 차트 1점
- [ ] PII grep — painScore·logId 평문 0건
- [ ] RLS — 타 user logId 차단

### Step 6 (10개)
- [ ] /me 메뉴 "온보딩 다시 보기" href 정확
- [ ] `?replay=1` query 인식 → isReplay=true
- [ ] Act 1 슬라이드 평소와 동일 UI
- [ ] CTA 3종 모두 노출
- [ ] CTA 클릭 시 POST 호출 0건
- [ ] `user_onboarding` row 변경 0건
- [ ] X 버튼·바로 시작 모두 POST 미호출
- [ ] Act 2·3 진입 시 ?replay=1 query 유지
- [ ] iPhone SE replay 슬라이드 fit
- [ ] /dashboard 복귀 시 BottomTabBar 정상

### Step 7 (12개)
- [ ] 차트 6종 모두 렌더링
- [ ] 자율성 지수 LineChart 25점 도달
- [ ] 통증 변화량 LineChart 양수 + ReferenceLine y=0
- [ ] 왜곡 유형 분포 BarChart 1건
- [ ] PatternReport 1건 (deltaPain=2)
- [ ] 기간 필터 7d/30d/all 전환 동작
- [ ] "전체" 선택 시 성장 지표 미노출 카피
- [ ] RLS — 본인 row만
- [ ] iPhone SE 320px 차트 fit
- [ ] BottomTabBar 인사이트 active
- [ ] 본질 위협 #1·#2 라벨 가드
- [ ] "주요 왜곡" 분석가 톤

### Step 8 (10개)
- [ ] /journal 데이터 로드
- [ ] "최근 활동" 카드 1건
- [ ] 카드 → /analyze/<id> 캐시 노출
- [ ] "행동 계획" 카드 1건 + 25점·완료
- [ ] 카드 → /action/<id> "완료됨 ✓"
- [ ] 탭 토글 active 분기
- [ ] log_type='success' 필터링 동작
- [ ] RLS — 본인 row만
- [ ] iPhone SE 320px 카드 fit
- [ ] BottomTabBar 일지 active

### Step 9 (10개)
- [ ] /manual 진입 + 헤더·서문·섹션 렌더링
- [ ] 사이드바 anchor 스크롤
- [ ] /analyze ? 버튼 → /manual#dbug-XX
- [ ] /insights 매뉴얼 보기 → /manual#dbug-03
- [ ] 너지 배너 dismiss 동작
- [ ] iPhone SE 320px 사이드바 navLabel·본문 fit
- [ ] 본질 위협 #1·#2·#4 매뉴얼 카피 sweep (잔존 시 Major 보고)
- [ ] /me "매뉴얼" 라우팅
- [ ] /dashboard 푸터 "매뉴얼" 라우팅
- [ ] DistortionManualAnchor 5종 매핑 정합

**총합**: 8 + 9 + 12 + 10 + 12 + 10 + 12 + 10 + 10 = **93개**

---

## 부록 B. 코드베이스 cross-reference

각 단계에서 참조할 파일·라인·함수 list. 발견 이슈 보고 시 *재현 단계 + 코드 라인* 명시 의무.

### Step 1
- `app/auth/signup/page.tsx:33-102` — handleSignup
- `app/auth/callback/route.ts` — 이메일 인증 후 redirect
- `app/dashboard/page.tsx:74-97` — user_onboarding 부재 시 /onboarding/1 redirect
- `supabase/migrations/10_onboarding_completed.sql:19-55` — user_onboarding 테이블 + RLS

### Step 2
- `app/onboarding/[act]/page.tsx:9-25` — Act param 검증 (1·2·3)
- `app/onboarding/[act]/OnboardingActClient.tsx:56-98` — completeOnboarding·CTA 핸들러
- `app/onboarding/[act]/OnboardingActClient.tsx:118-128` — Touch swipe 50px
- `app/api/onboarding/complete/route.ts:18-65` — UPSERT (max reached_act)
- `lib/onboarding/slides.ts` — 슬라이드 카피 진실원
- `components/ui/BottomTabBar.tsx` — /onboarding/* 자동 미표시 로직

### Step 3
- `app/log/page.tsx:45-78` — handleSubmit (logs INSERT)
- `app/api/analyze/route.ts:51-149` — 인증·rate limit·log fetch·safety detect
- `app/api/analyze/route.ts:151-260` — 분석 캐시·daily limit·Gemini 호출
- `app/api/analyze/route.ts:261-355` — analysis INSERT + user_patterns best-effort INSERT
- `app/analyze/[id]/page.tsx:127-308` — 3 stage 흐름 (fetch→analyze→question→done)
- `app/analyze/[id]/page.tsx:54-95` — segment 하이라이팅 renderThoughtWithHighlights
- `lib/safety/detect.ts` — 위기 감지 (이번 케이스 negative)
- `lib/openai/gemini.ts` — Gemini 분석 함수 진실원

### Step 4
- `app/action/[id]/page.tsx:31-78` — DISTORTION_HABITS·suggestTinyHabit 매핑
- `app/action/[id]/page.tsx:206-264` — saveAction (1·2차)
- `app/api/action/route.ts` — POST handler (UPSERT·markCompleted·autonomy_score)
- `lib/intervention/action-plan.ts` — parse·serialize·validate·formatActionPlanForDisplay
- `supabase/migrations/12_schema_drift_fixes.sql:74-84` — completion_note·completion_reaction CHECK

### Step 5
- `lib/review/pending-review.ts:53-84` — findPendingReview (6h~48h window)
- `lib/review/delta-pain.ts` — sumPositiveDeltaPain
- `components/review/ReviewCard.tsx:38-66` — 카드 UI + dismiss
- `app/review/[id]/page.tsx` — 재평가 폼
- `app/api/review/pain-score/route.ts:11-80` — UPDATE intervention reevaluated_pain_score
- `app/dashboard/page.tsx:155-200` — pendingReviewClient·weeklyPositiveDeltaPain

### Step 6
- `app/me/page.tsx:170-178` — 메뉴 "온보딩 다시 보기" href
- `app/onboarding/[act]/OnboardingActClient.tsx:32, 56-72` — isReplay·early return

### Step 7
- `app/insights/page.tsx:42-259` — 차트 6종 + 기간 필터 + 패턴 리포트
- `app/insights/page.tsx:104-129` — autonomyTrend cumulative
- `app/insights/page.tsx:174-205` — deltaPainSeries
- `app/insights/page.tsx:209-254` — patternRows
- `components/insights/PatternReport.tsx`
- `lib/insights/pattern-report.ts` — PatternRow 타입

### Step 8
- `app/journal/page.tsx:25-200` — logs·intervention 쿼리·탭 분기
- `lib/intervention/action-plan.ts` — formatActionPlanForDisplay

### Step 9
- `app/manual/page.tsx:1-80` — 사이드바·본문 렌더링
- `lib/content/technical-manual.ts` — MANUAL_HEADER·MANUAL_PREFACE·MANUAL_SECTIONS·PROSPECT_THEORY_CHART_NOTE
- `types/index.ts` — `DistortionManualAnchor` map

---

**작성 종료**: 2026-05-03
**다음 액션**: 5/5 (화) 본 시나리오 1회 통과 → 발견 이슈 기록 → 5/5 EOD CEO 종합 보고 회의 (회의록 §7)
