# Project Bluebird MVP 개발 플랜

## 프로젝트 개요
인지 왜곡 탐지 및 교정을 통한 실존적 자율성 회복 PWA 앱

## 개발 기간 및 단계
총 6단계로 구성된 점진적 개발 방식

---

## Phase 1: 프로젝트 초기 설정
**목표**: 개발 환경 구축 및 PWA 기반 구조 설정

### 작업 항목
1. Next.js 14 프로젝트 초기화
   - `npx create-next-app@latest project-bluebird --typescript --tailwind --app`
   - App Router 활성화 확인

2. PWA 설정
   - `next-pwa` 패키지 설치
   - `next.config.js` 설정
   - `manifest.json` 생성
     - name: "Project Bluebird"
     - short_name: "Bluebird"
     - theme_color: "#007AFF"
     - background_color: "#FFFFFF"
     - display: "standalone"
     - icons: 192x192, 512x512 (maskable)

3. Service Worker 설정
   - 정적 자산 캐싱 전략
   - 오프라인 폴백 페이지

4. 프로젝트 구조 생성
```
/app
  /api
  /(auth)
  /(dashboard)
  layout.tsx
  page.tsx
/components
  /ui
  /charts
  /forms
/lib
  /supabase
  /openai
  /utils
/types
  index.ts
/public
  /icons
  manifest.json
```

5. 환경 변수 설정
   - `.env.local` 파일 생성
   - `.env.example` 템플릿 생성

### 결과물
- 로컬에서 실행 가능한 Next.js PWA 기본 구조
- 모바일에서 "홈 화면에 추가" 가능

---

## Phase 2: Supabase 연동 및 인증
**목표**: 백엔드 서비스 연결 및 사용자 인증 구현

### 작업 항목
1. Supabase 프로젝트 생성
   - 새 프로젝트 생성
   - API URL 및 anon key 확보

2. 데이터베이스 스키마 생성
   - `logs` 테이블 생성
   - `analysis` 테이블 생성
   - `intervention` 테이블 생성
   - 테이블 간 관계 설정 (Foreign Keys)

3. Row Level Security(RLS) 정책 설정
   - 사용자는 본인 데이터만 조회/수정 가능
   - 인증된 사용자만 데이터 생성 가능

4. Supabase 클라이언트 설정
   - `/lib/supabase/client.ts` 생성
   - `/lib/supabase/server.ts` 생성 (Server Components용)

5. 인증 UI 구현
   - 이메일/비밀번호 로그인
   - 회원가입
   - 로그아웃
   - Auth 상태 관리

### 결과물
- 완전히 작동하는 사용자 인증 시스템
- 보안이 적용된 데이터베이스 스키마

---

## Phase 3: 시스템 1 로깅 UI
**목표**: 사용자 입력 인터페이스 구현

### 작업 항목
1. 메인 로깅 페이지 (`/app/log/page.tsx`)
   - 2단계 폼 구조
   - 1단계: 트리거(사건) 입력
   - 2단계: 자동 사고 입력

2. UI 컴포넌트 구현
   - 메시징 앱 스타일 인터페이스
   - 입력 필드 컴포넌트
   - 제출 버튼
   - 로딩 상태 표시

3. 모바일 최적화
   - Touch-friendly 입력 영역
   - 키보드 자동 포커스
   - 스크롤 최적화

4. 데이터 저장 로직
   - Supabase `logs` 테이블에 저장
   - 낙관적 UI 업데이트
   - 에러 핸들링

5. 폼 검증
   - 필수 입력 체크
   - 최소 글자 수 검증
   - 사용자 피드백

### 결과물
- 직관적이고 빠른 입력 인터페이스
- Supabase에 저장된 사용자 로그 데이터

---

## Phase 4: AI 인지 왜곡 분석 엔진
**목표**: OpenAI GPT-4o를 이용한 왜곡 탐지 및 질문 생성

### 작업 항목
1. OpenAI API 연동
   - `/lib/openai/client.ts` 생성
   - API 키 환경 변수 설정

2. 인지 왜곡 탐지 API 라우트 (`/app/api/analyze/route.ts`)
   - 사용자 입력 수신
   - GPT-4o JSON Mode 호출
   - 5대 왜곡 유형 분석
   - 왜곡 강도 계산 (0-1)
   - 논리 오류 구간 추출

3. 시스템 프롬프트 설계
   - 5대 왜곡 유형 정의 명시
   - JSON 출력 스키마 지정
   - 분석적 톤 유지

4. 소크라테스식 질문 생성 API (`/app/api/generate-questions/route.ts`)
   - 탐지된 왜곡 기반 질문 생성
   - 3가지 질문 (확률/근거 요구)
   - 사용자 사고 자극 설계

5. 분석 결과 저장
   - `analysis` 테이블에 저장
   - `intervention` 테이블 초기 레코드 생성

6. TypeScript 타입 정의
   - `DistortionType` enum
   - `AnalysisResult` interface
   - `SocraticQuestion` interface

### 결과물
- 실시간 인지 왜곡 탐지 시스템
- 자동 생성된 소크라테스식 질문

---

## Phase 5: 분석 대시보드 및 시각화
**목표**: 분석 결과 표시 및 전망이론 그래프 구현

### 작업 항목
1. 분석 결과 페이지 (`/app/analyze/[id]/page.tsx`)
   - 탐지된 왜곡 유형 표시
   - 왜곡 강도 시각화 (진행바/게이지)
   - 논리 오류 구간 하이라이트

2. 소크라테스식 질문 인터페이스
   - 3가지 질문 순차 표시
   - 답변 입력 폼 (확률/수치 필수)
   - 입력 검증 (숫자, % 형식)

3. 전망이론 가치 함수 그래프 컴포넌트
   - Recharts 사용
   - S자 곡선 렌더링
   - 손실 영역 강조 (음수 영역)
   - 사용자 데이터 포인트 표시
     - 주관적 손실 가중치 (사용자 답변 기반)
     - 객관적 확률 (질문 답변 기반)

4. 시각화 페이지 (`/app/visualize/[id]/page.tsx`)
   - 그래프 전체 화면 표시
   - 해석 가이드 텍스트
   - 괴리 지점 설명

5. 인터랙션
   - 그래프 호버 툴팁
   - 줌/팬 기능 (선택사항)

### 결과물
- 시각적으로 명확한 분석 대시보드
- 전망이론 기반 왜곡 시각화 그래프

---

## Phase 6: 행동 확약 및 자율성 지수
**목표**: 교정된 사고를 행동으로 전환

### 작업 항목
1. 행동 설계 페이지 (`/app/action/[id]/page.tsx`)
   - 교정된 사고 요약 표시
   - Tiny Habit 입력 폼
     - 5분 내 실행 가능한 행동
     - 구체적 행동 검증

2. 행동 확약 저장
   - `intervention` 테이블 `final_action` 업데이트

3. 체크리스트 인터페이스
   - 실행 여부 체크박스
   - 완료 시간 기록

4. 자율성 지수 계산 로직
   - 완료 시 점수 부여 (예: +10점)
   - 누적 점수 계산
   - 레벨 시스템 (선택사항)

5. 대시보드 홈 (`/app/(dashboard)/page.tsx`)
   - 자율성 지수 표시
   - 최근 로그 목록
   - 완료한 행동 히스토리
   - 통계 요약 (총 로그, 완료율 등)

6. 히스토리 페이지
   - 과거 로그 탐색
   - 필터링 (왜곡 유형별)
   - 검색 기능

### 결과물
- 완전한 사용자 플로우 (입력→분석→질문→시각화→행동→완료)
- 동기부여 시스템 (자율성 지수)

---

## Phase 7: 최적화 및 배포
**목표**: 성능 최적화 및 프로덕션 배포

### 작업 항목
1. 성능 최적화
   - 이미지 최적화 (Next.js Image)
   - 코드 스플리팅
   - Lazy Loading
   - 캐싱 전략

2. 오프라인 모드 강화
   - 읽기 전용 오프라인 모드
   - 오프라인 시 사용자 안내
   - 온라인 복귀 시 동기화

3. PWA 테스트
   - Lighthouse PWA 점수 확인 (90+ 목표)
   - 다양한 디바이스 테스트
   - 설치 플로우 테스트

4. 에러 핸들링 강화
   - 전역 에러 바운더리
   - API 에러 처리
   - 사용자 친화적 메시지

5. Vercel 배포
   - Vercel 프로젝트 연결
   - 환경 변수 설정
   - 도메인 연결 (선택사항)
   - HTTPS 자동 설정

6. 모니터링 설정
   - Vercel Analytics
   - 에러 추적 (Sentry 등, 선택사항)

### 결과물
- 프로덕션 레디 PWA 앱
- 안정적인 배포 환경

---

## 기술적 고려사항

### API 요청 제한
- OpenAI API 속도 제한 처리
- 재시도 로직 구현
- 로딩 상태 명확한 표시

### 데이터 보안
- 사용자 입력 sanitization
- SQL Injection 방지 (Supabase 자동 처리)
- XSS 방지
- CORS 설정

### 모바일 최적화
- Viewport meta 태그 설정
- Touch 제스처 최적화
- 세로 모드 우선 설계
- Safe Area 고려 (iPhone 노치 등)

### 접근성
- ARIA 라벨
- 키보드 네비게이션
- 색상 대비 (WCAG AA 준수)
- 스크린 리더 지원

---

## 우선순위 기능 (MVP 범위)

### 필수 기능
1. 사용자 인증 (이메일/비밀번호)
2. 시스템 1 로깅 (트리거 + 자동 사고)
3. AI 인지 왜곡 탐지
4. 소크라테스식 질문 생성
5. 전망이론 그래프 시각화
6. 행동 확약 및 체크
7. 기본 대시보드

### 향후 확장 기능 (MVP 이후)
- Push Notifications
- 소셜 로그인 (Google, Apple)
- 데이터 내보내기
- 주간/월간 리포트
- 친구와 공유 (선택적)
- 다크 모드
- 다국어 지원
- 고급 통계 및 인사이트

---

## 개발 체크리스트

### Phase 1
- [ ] Next.js 프로젝트 초기화
- [ ] next-pwa 설정
- [ ] manifest.json 생성
- [ ] 아이콘 생성 (192x192, 512x512)
- [ ] Service Worker 설정
- [ ] 폴더 구조 생성
- [ ] Tailwind CSS 설정 확인
- [ ] TypeScript 설정 확인

### Phase 2
- [ ] Supabase 프로젝트 생성
- [ ] logs 테이블 생성
- [ ] analysis 테이블 생성
- [ ] intervention 테이블 생성
- [ ] RLS 정책 설정
- [ ] Supabase 클라이언트 설정
- [ ] 인증 UI 구현
- [ ] 로그인/로그아웃 기능

### Phase 3
- [ ] 로깅 페이지 라우트
- [ ] 트리거 입력 폼
- [ ] 자동 사고 입력 폼
- [ ] 데이터 저장 로직
- [ ] 폼 검증
- [ ] 모바일 최적화
- [ ] 에러 핸들링

### Phase 4
- [ ] OpenAI 클라이언트 설정
- [ ] /api/analyze 라우트
- [ ] /api/generate-questions 라우트
- [ ] 시스템 프롬프트 작성
- [ ] JSON Mode 구현
- [ ] TypeScript 타입 정의
- [ ] 분석 결과 저장

### Phase 5
- [ ] 분석 결과 페이지
- [ ] 왜곡 유형 표시 UI
- [ ] 소크라테스식 질문 UI
- [ ] 답변 입력 폼
- [ ] Recharts 설치
- [ ] 가치 함수 그래프 컴포넌트
- [ ] 시각화 페이지
- [ ] 데이터 포인트 표시

### Phase 6
- [ ] 행동 설계 페이지
- [ ] Tiny Habit 입력 폼
- [ ] 체크리스트 UI
- [ ] 자율성 지수 계산
- [ ] 대시보드 홈
- [ ] 로그 히스토리
- [ ] 통계 요약

### Phase 7
- [ ] 성능 최적화
- [ ] 오프라인 모드 테스트
- [ ] Lighthouse 점수 확인
- [ ] 에러 바운더리
- [ ] Vercel 배포
- [ ] 환경 변수 설정
- [ ] 프로덕션 테스트

---

## 예상 기술적 도전 과제

### 1. AI 응답 일관성
**문제**: GPT-4o 응답이 항상 정확한 JSON을 반환하지 않을 수 있음
**해결**: JSON Mode 사용, 엄격한 스키마 정의, 파싱 에러 핸들링

### 2. 전망이론 그래프 정확성
**문제**: S자 곡선의 수학적 정확성 유지
**해결**: 전망이론 논문 참고, 정확한 공식 적용, 시각적 검증

### 3. 모바일 성능
**문제**: 큰 그래프나 복잡한 계산이 모바일에서 느릴 수 있음
**해결**: 코드 스플리팅, Lazy Loading, 최적화된 렌더링

### 4. 오프라인 데이터 동기화
**문제**: 오프라인 시 생성한 데이터를 온라인 복귀 시 동기화
**해결**: IndexedDB 사용, 큐 시스템 구현, Supabase Realtime 활용

---

## 개발 시작 명령어

```bash
# 1. Next.js 프로젝트 생성
npx create-next-app@latest project-bluebird --typescript --tailwind --app

# 2. 프로젝트 이동
cd project-bluebird

# 3. 필수 패키지 설치
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install openai
npm install recharts
npm install next-pwa
npm install -D @types/node

# 4. 개발 서버 실행
npm run dev
```

---

## 다음 단계

이 개발 플랜을 바탕으로 **Phase 1부터 순차적으로 진행**하는 것을 추천합니다.

첫 번째로 실행할 프롬프트:
"Phase 1의 작업 항목을 시작해줘. Next.js 14 App Router 기반으로 프로젝트를 초기화하고, next-pwa를 사용해서 PWA 환경을 설정해줘. manifest.json과 기본 Service Worker를 구성하고, 프로젝트 폴더 구조를 생성해줘."

개발 과정에서 각 Phase가 완료되면 다음 단계로 진행하고, 필요시 기술적 피드백을 주고받으면서 조정할 수 있습니다.
