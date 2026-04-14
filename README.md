# Project Bluebird MVP

인지 왜곡 탐지 및 교정을 통한 실존적 자율성(Autonomy) 회복 PWA 앱

## 프로젝트 미션

시스템 1의 자동 사고를 포착하고, NLP 기반으로 인지 왜곡을 분석하여, 시스템 2를 강제 기동시키는 소크라테스식 질문을 제공합니다. 전망이론 기반 시각화를 통해 주관적 왜곡과 객관적 현실의 괴리를 보여주고, 사용자가 주체적으로 행동을 설계할 수 있도록 돕습니다.

## 핵심 기능

1. **시스템 1 인지 로깅**: 트리거(사건)와 자동 사고를 간편하게 입력
2. **인지 왜곡 탐지**: Gemini 2.5 Flash를 활용한 5대 왜곡 유형 자동 분석
3. **시스템 2 서킷 브레이커**: 분석적 사고를 유도하는 소크라테스식 질문
4. **전망이론 시각화**: Recharts 기반 가치 함수 그래프로 왜곡 시각화
5. **행동 확약**: Tiny Habit 설계 및 실행 체크, 자율성 지수 부여
6. **Technical Manual**: 이론/용어를 문서형 페이지에서 상시 조회

## Bluebird Master Protocol

AI 분석 로직의 단일 기준점은 `lib/ai/bluebird-protocol.ts` 입니다.

- 이중처리 이론(Dual Process)
- 전망이론(준거점/손실회피/확률가중치)
- 메타인지(CAS/탈중심화)
- 실존적 자율성/Build-Measure-Learn 원칙

모든 분석/질문 생성은 위 프로토콜을 프롬프트와 스키마에 주입해 일관성을 유지합니다.

## 5대 인지 왜곡 유형

- 파국화 (Catastrophizing)
- 흑백논리 (All-or-Nothing Thinking)
- 감정적 추론 (Emotional Reasoning)
- 개인화 (Personalization)
- 임의적 추론 (Arbitrary Inference)

## 기술 스택

- **Frontend**: Next.js 14 (App Router), Tailwind CSS
- **PWA**: next-pwa
- **Data Visualization**: Recharts
- **Backend**: Supabase (Auth, PostgreSQL, Edge Functions)
- **AI**: Google Gemini 2.5 Flash (JSON Mode)
- **Deployment**: Vercel

## 개발 시작

```bash
# 프로젝트 클론 후
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local에 API 키 입력

# 개발 서버 실행
npm run dev
```

## 환경 변수

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

## 프로젝트 구조

```
/app                    # Next.js App Router
  /api                  # API 라우트
  /auth                # 인증 페이지
  /dashboard           # 대시보드
  /log                 # 로깅 페이지
  /analyze             # 분석 페이지
  /visualize           # 시각화 페이지
  /action              # 행동 확약 페이지
  /manual              # 기술 매뉴얼 페이지
/components            # 재사용 컴포넌트
  /ui                  # UI 컴포넌트
  /charts              # 차트 컴포넌트
  /forms               # 폼 컴포넌트
/lib                   # 유틸리티 및 클라이언트
  /supabase            # Supabase 클라이언트
  /openai              # Gemini 클라이언트
  /utils               # 헬퍼 함수
/types                 # TypeScript 타입 정의
/public                # 정적 파일
  /icons               # PWA 아이콘
  manifest.json        # PWA Manifest
```

## 개발 플랜

상세한 개발 플랜은 `DEVELOPMENT_PLAN.md`를 참고하세요.

총 7단계로 구성:
1. 프로젝트 초기 설정
2. Supabase 연동 및 인증
3. 시스템 1 로깅 UI
4. AI 인지 왜곡 분석 엔진
5. 분석 대시보드 및 시각화
6. 행동 확약 및 자율성 지수
7. 최적화 및 배포

## 데이터베이스 스키마

### logs
- id (uuid, primary key)
- user_id (uuid, foreign key)
- trigger (text): 사건/트리거
- thought (text): 자동 사고
- created_at (timestamp)

### analysis
- id (uuid, primary key)
- log_id (uuid, foreign key)
- distortion_type (text): 왜곡 유형
- intensity (float): 왜곡 강도 (0-1)
- logic_error_segment (text): 논리 오류 구간
- created_at (timestamp)

### intervention
- id (uuid, primary key)
- log_id (uuid, foreign key)
- socratic_questions (jsonb): 3가지 질문
- user_answers (jsonb): 사용자 답변
- final_action (text): 확약한 행동
- is_completed (boolean): 실행 여부
- autonomy_score (integer): 자율성 지수
- created_at (timestamp)

## PWA 기능

- 홈 화면에 추가 가능
- 오프라인 모드 지원
- Standalone 디스플레이 모드
- 모바일 앱처럼 작동

## 라이선스

MIT

## 기여

이 프로젝트는 MVP 단계입니다. 버그 리포트나 기능 제안은 이슈로 등록해주세요.
