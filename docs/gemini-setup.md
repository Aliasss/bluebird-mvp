# Gemini API 설정 가이드

## Google Gemini 2.0 Flash 사용

Project Bluebird는 Google Gemini 2.0 Flash 모델을 사용합니다.

## API 키 발급 방법

### 1. Google AI Studio 접속
1. https://aistudio.google.com/app/apikey 접속
2. Google 계정으로 로그인

### 2. API 키 생성
1. "Create API key" 버튼 클릭
2. "Create API key in new project" 선택
3. API 키 복사 (한 번만 표시됩니다!)

### 3. 환경 변수 설정
`.env.local` 파일에 API 키 입력:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. 개발 서버 재시작
```bash
# 서버 종료 (Ctrl+C)
npm run dev
```

## Gemini 2.0 Flash 특징

### 장점
- **무료 사용량**: 분당 15 RPM, 하루 1,500 RPM
- **빠른 속도**: Flash 모델로 빠른 응답
- **JSON 모드**: Native JSON 출력 지원
- **한국어 지원**: 우수한 한국어 이해 능력
- **최신 모델**: 2024년 12월 출시

### 제한사항
- 분당 15개 요청 제한 (무료 티어)
- 하루 1,500개 요청 제한

## 사용 예시

```typescript
import { gemini, DISTORTION_ANALYSIS_SYSTEM_PROMPT } from '@/lib/openai/gemini';

// 인지 왜곡 분석
const result = await gemini.generateContent({
  contents: [{
    role: 'user',
    parts: [{
      text: `${DISTORTION_ANALYSIS_SYSTEM_PROMPT}

트리거: ${trigger}
자동 사고: ${thought}`
    }]
  }]
});

const response = result.response.text();
const data = JSON.parse(response);
```

## 모델 정보

- **모델명**: gemini-2.0-flash-exp
- **컨텍스트 윈도우**: 1M 토큰
- **출력 토큰**: 최대 8,192
- **JSON 모드**: 지원 (responseMimeType: 'application/json')

## 요금 (무료 티어)

| 항목 | 제한 |
|------|------|
| 분당 요청 (RPM) | 15 |
| 일일 요청 (RPD) | 1,500 |
| 토큰/분 (TPM) | 1,000,000 |
| 이미지/분 | 100 |

## 유료 플랜

필요시 Google Cloud Console에서 유료 플랜으로 업그레이드 가능:
- https://console.cloud.google.com/

## 트러블슈팅

### 문제: API 키가 작동하지 않음
해결:
1. API 키가 올바르게 복사되었는지 확인
2. Google AI Studio에서 키가 활성화되었는지 확인
3. `.env.local` 파일 저장 확인
4. 개발 서버 재시작

### 문제: Rate limit 초과
해결:
1. 무료 티어: 분당 15개 요청 제한
2. 요청 간격을 4초 이상 두기
3. 또는 유료 플랜으로 업그레이드

### 문제: JSON 파싱 에러
해결:
1. Gemini 응답이 JSON 형식인지 확인
2. `responseMimeType: 'application/json'` 설정 확인
3. 프롬프트에 JSON 스키마 명확히 지정

## 참고 링크

- Google AI Studio: https://aistudio.google.com/
- Gemini API 문서: https://ai.google.dev/docs
- 모델 정보: https://ai.google.dev/models/gemini
- 가격 정보: https://ai.google.dev/pricing

## 다음 단계

API 키를 설정했다면 Phase 4를 진행하여 실제 AI 분석 기능을 구현하세요!
