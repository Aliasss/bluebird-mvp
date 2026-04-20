# Success Log (성공 로그) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 인지 왜곡에 빠질 뻔했지만 시스템 2를 사용해 빠져나온 순간을 기록하는 "성공 로그" 기능을 추가해 자율성 지수 +15점을 부여한다.

**Architecture:** `logs` 테이블에 `log_type` 컬럼을 추가해 'distortion' | 'success'를 구분한다. 성공 로그 저장 시 AI 분석 없이 즉시 `intervention` row를 is_completed=true, autonomy_score=15로 생성한다. 대시보드에 성공 로그 진입점과 최근 활동 표시를 추가한다.

**Tech Stack:** Next.js 16 App Router, Supabase (PostgreSQL + RLS), Tailwind CSS, TypeScript

**Note:** 이 프로젝트에는 테스트 인프라가 없으므로 TDD 단계 대신 수동 검증 단계로 대체한다.

---

## File Structure

| 파일 | 작업 | 역할 |
|---|---|---|
| `app/log/success/page.tsx` | CREATE | 2단계 성공 로그 입력 폼 |
| `app/api/success-log/route.ts` | CREATE | 성공 로그 저장 API (logs + intervention 생성) |
| `app/dashboard/page.tsx` | MODIFY | 성공 로그 CTA 버튼 추가, 최근 활동에 성공 로그 표시 |

**DB 변경 (Supabase SQL Editor에서 수동 실행):**
```sql
ALTER TABLE logs ADD COLUMN IF NOT EXISTS log_type text DEFAULT 'distortion';
```

---

### Task 1: DB 컬럼 추가

**Files:**
- DB 변경 (Supabase SQL Editor)

- [ ] **Step 1: Supabase SQL Editor에서 실행**

```sql
ALTER TABLE logs ADD COLUMN IF NOT EXISTS log_type text DEFAULT 'distortion';
```

- [ ] **Step 2: 컬럼 추가 확인**

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'logs' AND column_name = 'log_type';
```

Expected: `log_type | text | 'distortion'` 행이 반환됨

---

### Task 2: 성공 로그 저장 API

**Files:**
- Create: `app/api/success-log/route.ts`

- [ ] **Step 1: API 파일 생성**

```typescript
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({
  situation: z.string().trim().min(5).max(1000),
  system2Action: z.string().trim().min(10).max(1000),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: '입력 형식이 올바르지 않습니다.' }, { status: 400 });
    }
    const { situation, system2Action } = parsed.data;

    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // logs 테이블에 성공 로그 저장
    const { data: logData, error: logError } = await supabase
      .from('logs')
      .insert({
        user_id: user.id,
        trigger: situation,
        thought: system2Action,
        log_type: 'success',
      })
      .select()
      .single();

    if (logError || !logData) {
      return NextResponse.json({ error: '저장에 실패했습니다.' }, { status: 500 });
    }

    // intervention 테이블에 완료 상태로 저장 (autonomy_score: 15)
    const { error: interventionError } = await supabase.from('intervention').insert({
      log_id: logData.id,
      socratic_questions: [],
      user_answers: {},
      final_action: system2Action,
      is_completed: true,
      autonomy_score: 15,
    });

    if (interventionError) {
      // logs 저장은 됐으니 실패해도 진행 (non-critical)
      console.error('intervention 저장 실패:', interventionError);
    }

    return NextResponse.json({ success: true, logId: logData.id }, { status: 200 });
  } catch (error) {
    console.error('POST /api/success-log 실패:', error);
    return NextResponse.json({ error: '저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
```

- [ ] **Step 2: 커밋**

```bash
git add app/api/success-log/route.ts
git commit -m "feat: add success-log API endpoint"
```

---

### Task 3: 성공 로그 입력 페이지

**Files:**
- Create: `app/log/success/page.tsx`

- [ ] **Step 1: 페이지 파일 생성**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';

type Step = 'situation' | 'action';

export default function SuccessLogPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('situation');
  const [situation, setSituation] = useState('');
  const [system2Action, setSystem2Action] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSituationNext = () => {
    if (situation.trim().length < 5) {
      setError('상황은 최소 5자 이상 입력해주세요.');
      return;
    }
    setError(null);
    setStep('action');
  };

  const handleSubmit = async () => {
    if (system2Action.trim().length < 10) {
      setError('대처 방법은 최소 10자 이상 입력해주세요.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/success-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation: situation.trim(), system2Action: system2Action.trim() }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || '저장에 실패했습니다.');
      router.push('/dashboard?success=1');
    } catch (err: any) {
      setError(err.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'action') {
      setStep('situation');
      setError(null);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <PageHeader
        title="성공 순간 기록"
        onBack={handleBack}
        step={{ current: step === 'situation' ? 1 : 2, total: 2 }}
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
          {step === 'situation' ? (
            <>
              <div className="space-y-2">
                <h1 className="text-xl md:text-2xl font-bold text-text-primary">
                  어떤 상황이었나요?
                </h1>
                <p className="text-sm text-text-secondary">
                  왜곡된 사고로 빠질 수 있었던 상황을 설명해주세요.
                </p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-background-tertiary">
                <textarea
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  placeholder="예: 발표에서 말이 조금 꼬였을 때"
                  className="w-full h-40 p-4 border border-background-tertiary rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loading}
                  autoFocus
                />
                <div className="mt-2 text-right text-xs text-text-secondary">{situation.length}자</div>
              </div>
              <div className="bg-background-secondary rounded-xl p-4">
                <p className="text-xs font-medium text-text-primary mb-2">💡 예시</p>
                <ul className="space-y-1 text-xs text-text-secondary">
                  <li>• 팀장이 내 보고서를 수정 없이 통과시켜 주지 않았을 때</li>
                  <li>• 친구가 약속 시간보다 30분 늦게 도착했을 때</li>
                  <li>• 내 아이디어가 회의에서 즉각 채택되지 않았을 때</li>
                </ul>
              </div>
              {error && (
                <div className="bg-danger bg-opacity-10 border border-danger rounded-xl p-4">
                  <p className="text-xs text-danger">{error}</p>
                </div>
              )}
              <button
                onClick={handleSituationNext}
                disabled={situation.length < 5}
                className="w-full bg-primary text-white font-semibold py-4 px-6 rounded-2xl touch-manipulation active:scale-95 transition-transform disabled:opacity-50"
              >
                다음
              </button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <h1 className="text-xl md:text-2xl font-bold text-text-primary">
                  어떻게 이성적으로 대처했나요?
                </h1>
                <p className="text-sm text-text-secondary">
                  시스템 2(이성)를 가동해 왜곡을 피한 방법을 적어주세요.
                </p>
              </div>
              <div className="bg-background-secondary rounded-xl p-4">
                <p className="text-[10px] font-medium text-text-secondary mb-1">상황</p>
                <p className="text-xs text-text-primary">{situation}</p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-background-tertiary">
                <textarea
                  value={system2Action}
                  onChange={(e) => setSystem2Action(e.target.value)}
                  placeholder="예: '한 번의 실수가 전체를 결정하지 않는다'고 스스로 상기했다"
                  className="w-full h-40 p-4 border border-background-tertiary rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loading}
                  autoFocus
                />
                <div className="mt-2 text-right text-xs text-text-secondary">{system2Action.length}자</div>
              </div>
              {error && (
                <div className="bg-danger bg-opacity-10 border border-danger rounded-xl p-4">
                  <p className="text-xs text-danger">{error}</p>
                </div>
              )}
              <button
                onClick={handleSubmit}
                disabled={loading || system2Action.length < 10}
                className="w-full bg-success text-white font-semibold py-4 px-6 rounded-2xl touch-manipulation active:scale-95 transition-transform disabled:opacity-50"
              >
                {loading ? '저장 중...' : '성공 순간 저장하기 (+15점)'}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: 커밋**

```bash
git add "app/log/success/page.tsx"
git commit -m "feat: add success log input page"
```

---

### Task 4: 대시보드 업데이트

**Files:**
- Modify: `app/dashboard/page.tsx`

변경 사항 3가지:
1. `?success=1` 쿼리 파라미터 감지 → 토스트 메시지 표시
2. 기존 "새로운 사고 기록하기" 카드 옆에 "성공 순간 기록하기" 버튼 추가
3. 최근 활동에서 `log_type === 'success'` 인 로그를 다른 스타일로 표시

- [ ] **Step 1: `useSearchParams` import 및 토스트 상태 추가**

`app/dashboard/page.tsx` 상단 import에 추가:
```typescript
import { useSearchParams } from 'next/navigation';
```

컴포넌트 내부 상단에 추가:
```typescript
const searchParams = useSearchParams();
const [successToast, setSuccessToast] = useState(false);

useEffect(() => {
  if (searchParams.get('success') === '1') {
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  }
}, [searchParams]);
```

- [ ] **Step 2: 토스트 UI 추가**

`return` 문 안 `<main>` 바로 안에 추가:
```tsx
{successToast && (
  <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-success text-white text-sm font-semibold px-6 py-3 rounded-2xl shadow-lg">
    성공 순간이 기록됐습니다 +15점 🎉
  </div>
)}
```

- [ ] **Step 3: 성공 로그 CTA 버튼 추가**

기존 액션 버튼 카드 아래에 추가 (라인 262 이후):
```tsx
<div className="mt-4 bg-white border border-success rounded-xl sm:rounded-2xl p-4 sm:p-6">
  <h3 className="text-base md:text-lg font-bold text-text-primary mb-1">
    이성이 이긴 순간이 있었나요?
  </h3>
  <p className="text-xs text-text-secondary mb-3">
    왜곡에 빠질 뻔했지만 잘 대처한 순간을 기록하면 자율성 지수 +15점
  </p>
  <button
    onClick={() => router.push('/log/success')}
    className="bg-success text-white font-semibold py-2 px-6 rounded-xl text-sm touch-manipulation active:scale-95 transition-transform"
  >
    성공 순간 기록하기
  </button>
</div>
```

- [ ] **Step 4: 최근 활동에서 `log_type` 조회 및 표시**

`fetchData` 내 logs 쿼리를 `log_type` 포함으로 변경:
```typescript
const { data: logsData, error: logsError } = await supabase
  .from('logs')
  .select('*, log_type')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(5);
```

`Log` 타입이 `log_type`을 모르므로 타입 확장 인라인 처리:
```typescript
type LogWithType = Log & { log_type?: string | null };
```

최근 활동 렌더링 부분에서 성공 로그를 다르게 표시:
```tsx
{(logs as LogWithType[]).map((log) => {
  const isSuccess = log.log_type === 'success';
  return (
    <div
      key={log.id}
      onClick={() => !isSuccess && router.push(`/analyze/${log.id}`)}
      className={`border rounded-xl p-4 transition-colors ${
        isSuccess
          ? 'border-success bg-success bg-opacity-5 cursor-default'
          : 'border-background-tertiary hover:border-primary cursor-pointer'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {isSuccess && (
            <span className="text-[10px] font-semibold text-success bg-success bg-opacity-10 px-2 py-0.5 rounded-full">
              성공 로그
            </span>
          )}
          <p className="text-sm font-medium text-text-primary line-clamp-1">
            {log.trigger}
          </p>
        </div>
        <span className="text-xs text-text-secondary whitespace-nowrap ml-2">
          {formatDate(log.created_at)}
        </span>
      </div>
      <p className="text-sm text-text-secondary line-clamp-2">{log.thought}</p>
    </div>
  );
})}
```

- [ ] **Step 5: 수동 검증**

1. `/log/success` 접속 → 2단계 폼 작동 확인
2. 저장 → `/dashboard?success=1` 리다이렉트 → 토스트 표시 확인
3. Supabase에서 `logs` 테이블: `log_type = 'success'` row 생성 확인
4. Supabase에서 `intervention` 테이블: `is_completed = true`, `autonomy_score = 15` 확인
5. 대시보드 최근 활동에서 성공 로그가 초록 뱃지로 표시 확인

- [ ] **Step 6: 커밋 및 푸시**

```bash
git add app/dashboard/page.tsx
git commit -m "feat: integrate success log into dashboard"
git push origin main
```

---

## Self-Review

**Spec coverage:**
- ✅ 성공 로그 2단계 입력 (상황 + 시스템 2 행동)
- ✅ AI 호출 없이 즉시 저장
- ✅ autonomy_score = 15 (일반 분석 10~18보다 명확히 높은 고정값)
- ✅ 대시보드 진입점
- ✅ 최근 활동에서 구분 표시

**Placeholder scan:** 없음. 모든 단계에 실제 코드 포함.

**Type consistency:** `LogWithType`, `situation`, `system2Action` — 모든 태스크에서 동일하게 사용.
