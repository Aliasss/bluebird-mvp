# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. https://supabase.com 접속
2. "Start your project" 클릭
3. "New project" 생성
   - Name: project-bluebird
   - Database Password: 강력한 비밀번호 설정 (기록 필수!)
   - Region: Northeast Asia (Seoul)
4. 프로젝트 생성 완료 대기 (약 2분)

## 2. 데이터베이스 스키마 생성

1. Supabase 대시보드에서 좌측 메뉴 "SQL Editor" 클릭
2. "New query" 클릭
3. `supabase/migrations/01_initial_schema.sql` 파일의 전체 내용을 복사하여 붙여넣기
4. "Run" 버튼 클릭하여 실행
5. 성공 메시지 확인

## 3. API 키 확인

1. 좌측 메뉴에서 "Project Settings" (톱니바퀴 아이콘) 클릭
2. "API" 탭 선택
3. 다음 정보 복사:
   - Project URL
   - anon public key

## 4. 환경 변수 설정

프로젝트 루트의 `.env.local` 파일을 열고 다음 값을 입력:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
OPENAI_API_KEY=sk-... (Phase 4에서 입력)
```

## 5. 인증 설정 (선택사항)

### 이메일 인증 설정
1. "Authentication" > "Providers" 메뉴
2. "Email" 활성화 확인
3. "Confirm email" 옵션 설정 (개발 중에는 비활성화 가능)

### 이메일 템플릿 커스터마이징 (선택)
1. "Authentication" > "Email Templates"
2. "Confirm signup", "Magic Link" 등 템플릿 수정 가능

## 6. 테이블 확인

1. "Table Editor" 메뉴 클릭
2. 다음 테이블이 생성되었는지 확인:
   - logs
   - analysis
   - intervention
3. 각 테이블의 RLS 정책 확인:
   - "Authentication" > "Policies"에서 정책 확인 가능

## 7. 테스트 사용자 생성 (선택)

개발 중 테스트를 위해 수동으로 사용자 생성:

1. "Authentication" > "Users" 메뉴
2. "Add user" > "Create new user"
3. 이메일과 비밀번호 입력
4. "Auto Confirm User" 체크 (이메일 인증 스킵)

## 8. 개발 서버 재시작

환경 변수를 변경했으므로 개발 서버 재시작:

```bash
# 현재 실행 중인 서버 종료 (Ctrl+C)
# 재시작
npm run dev
```

## 트러블슈팅

### 문제: RLS 정책으로 인해 데이터 접근 불가
해결: Supabase 대시보드에서 "SQL Editor"로 다음 쿼리 실행하여 RLS 임시 비활성화:
```sql
ALTER TABLE logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE analysis DISABLE ROW LEVEL SECURITY;
ALTER TABLE intervention DISABLE ROW LEVEL SECURITY;
```

### 문제: 환경 변수가 적용되지 않음
해결: 
1. `.env.local` 파일 저장 확인
2. 개발 서버 완전히 종료 후 재시작
3. 브라우저 캐시 삭제

### 문제: Supabase 연결 오류
해결:
1. URL과 Key가 정확한지 확인
2. 따옴표나 공백이 없는지 확인
3. 프로젝트가 활성 상태인지 Supabase 대시보드에서 확인

## 다음 단계

Supabase 설정이 완료되면 인증 UI를 테스트할 수 있습니다.
http://localhost:3000/auth/login 페이지로 이동하여 회원가입을 시도하세요.
