# MVP Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** AI 분석 정확도 향상 + /insights 통계 페이지 신설 + UI 폴리싱 + 온보딩 개선으로 외부 사용자 공개 가능 수준으로 끌어올리기

**Architecture:** 4개 독립 Phase로 진행. Phase 1(AI)은 `lib/ai/bluebird-protocol.ts` 단일 진실원을 확장하고 `lib/openai/gemini.ts` 프롬프트를 강화. Phase 2는 `app/insights/page.tsx`를 신설하고 Recharts(기존 의존성)로 통계 시각화. Phase 3-4는 기존 컴포넌트를 다듬고 lucide-react 아이콘을 도입.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS, Supabase (client-side query), Recharts, Google Gemini 2.5 Flash, lucide-react (신규)

---

## File Map

### Phase 1 — AI
- Modify: `lib/ai/bluebird-protocol.ts` — `differentialRule` 필드 추가
- Modify: `lib/openai/gemini.ts` — 분석/질문 프롬프트 강화
- Modify: `lib/ai/eval-cases.ts` — 경계 케이스 10개 추가

### Phase 2 — /insights
- Modify: `proxy.ts` — `/insights` 경로 보호 추가
- Create: `app/insights/page.tsx` — 통계 대시보드 페이지
- Modify: `app/dashboard/page.tsx` — 인사이트 진입 버튼 추가

### Phase 3 — UI Polish
- Modify: `app/page.tsx` — 랜딩 카피 + CTA 개선
- Modify: `app/auth/login/page.tsx` — 디버그 텍스트 제거, 브랜드 일관성
- Modify: `app/auth/signup/page.tsx` — 브랜드 일관성
- Create: `components/ui/PageHeader.tsx` — 공통 페이지 헤더
- Create: `components/ui/SkeletonCard.tsx` — 로딩 스켈레톤
- Modify: `app/log/page.tsx` — PageHeader 적용
- Modify: `app/analyze/[id]/page.tsx` — PageHeader + Skeleton 적용
- Modify: `app/visualize/[id]/page.tsx` — PageHeader 적용
- Modify: `app/action/[id]/page.tsx` — PageHeader 적용
- Modify: `app/dashboard/page.tsx` — lucide-react 아이콘, 환영 섹션 간소화

### Phase 4 — Onboarding
- Modify: `app/dashboard/page.tsx` — empty state 3단계 안내 카드
- Modify: `app/log/page.tsx` — placeholder 예시 개선

---

## Phase 1: AI 프롬프트 재설계

### Task 1: bluebird-protocol.ts에 differentialRule 추가

**Files:**
- Modify: `lib/ai/bluebird-protocol.ts`

- [ ] **Step 1: BLUEBIRD_DISTORTION_TAXONOMY 타입에 differentialRule 추가**

`lib/ai/bluebird-protocol.ts`의 `BLUEBIRD_DISTORTION_TAXONOMY` 선언부를 아래로 교체:

```typescript
export const BLUEBIRD_DISTORTION_TAXONOMY: Record<
  DistortionType,
  { label: string; diagnosticRule: string; differentialRule: string }
> = {
  [DistortionType.CATASTROPHIZING]: {
    label: '파국화',
    diagnosticRule:
      '최악 시나리오를 단정하고 발생 확률을 비정상적으로 높게 추정한다.',
    differentialRule:
      '흑백논리와 구분: 파국화는 단일 사건에서 장기 재앙으로 시간적 확장을 한다. 흑백논리는 결과를 이분화하지만 미래 재앙을 단정하지 않는다. 감정적 추론과 구분: 파국화는 확률 추정이 왜곡되고, 감정적 추론은 감정을 사실 근거로 사용한다.',
  },
  [DistortionType.ALL_OR_NOTHING]: {
    label: '흑백논리',
    diagnosticRule:
      '중간 대안을 제거하고 성공/실패의 이분법으로만 상황을 해석한다.',
    differentialRule:
      '파국화와 구분: 흑백논리는 스펙트럼을 이분화하며 중간 가능성을 배제한다. 파국화처럼 미래 재앙을 단정하지 않아도 된다. 개인화와 구분: 흑백논리는 결과 평가의 이분화가 핵심이고, 개인화는 원인 귀속이 핵심이다.',
  },
  [DistortionType.EMOTIONAL_REASONING]: {
    label: '감정적 추론',
    diagnosticRule:
      '현재 감정 상태를 사실 판단의 직접 근거로 사용한다.',
    differentialRule:
      '파국화와 구분: 감정적 추론은 "불안하니까 위험하다"처럼 감정이 증거가 된다. 파국화는 위험 확률을 과대평가하지만 감정이 직접 근거가 아닐 수 있다. 임의적 추론과 구분: 감정적 추론은 감정이 근거이고, 임의적 추론은 증거 부재에도 결론을 확정한다.',
  },
  [DistortionType.PERSONALIZATION]: {
    label: '개인화',
    diagnosticRule:
      '통제 불가능한 외부 결과를 자신의 책임이나 결함으로 귀속한다.',
    differentialRule:
      '흑백논리와 구분: 개인화는 원인을 자신에게 과도하게 귀속하는 것이 핵심이다. 흑백논리는 결과 평가의 이분화가 핵심으로 원인 귀속 없이도 발생한다. 임의적 추론과 구분: 개인화는 "내 탓"이라는 귀속이 특징이고, 임의적 추론은 근거 없는 부정적 결론 확정이다.',
  },
  [DistortionType.ARBITRARY_INFERENCE]: {
    label: '임의적 추론',
    diagnosticRule:
      '증거 불충분 또는 반증이 존재하는데도 부정적 결론을 선행 확정한다.',
    differentialRule:
      '감정적 추론과 구분: 임의적 추론은 감정과 무관하게 논리적 비약으로 결론을 확정한다. 개인화와 구분: 임의적 추론은 타인/상황에 대한 결론도 포함한다(예: "저 사람이 나를 싫어한다"). 개인화는 자신에게 귀속되는 결론이다.',
  },
};
```

- [ ] **Step 2: 타입 체크**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npm run lint
```

Expected: 에러 없음. `differentialRule`을 참조하는 곳이 없으므로 기존 코드에 영향 없음.

- [ ] **Step 3: Commit**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && git add lib/ai/bluebird-protocol.ts && git commit -m "feat(ai): add differentialRule to distortion taxonomy for boundary case disambiguation"
```

---

### Task 2: 분석 프롬프트에 감별 진단 규칙 주입

**Files:**
- Modify: `lib/openai/gemini.ts`

- [ ] **Step 1: buildAnalysisPrompt 함수에서 distortionRules 생성 부분 교체**

`lib/openai/gemini.ts`의 `buildAnalysisPrompt` 함수 안에서:

기존:
```typescript
const distortionRules = Object.entries(BLUEBIRD_DISTORTION_TAXONOMY)
    .map(([key, value]) => `- ${key}: ${value.diagnosticRule}`)
    .join('\n');
```

교체:
```typescript
const distortionRules = Object.entries(BLUEBIRD_DISTORTION_TAXONOMY)
    .map(([key, value]) => `- ${key}:\n  진단: ${value.diagnosticRule}\n  감별: ${value.differentialRule}`)
    .join('\n');
```

- [ ] **Step 2: buildAnalysisPrompt의 [Constraints] 섹션에 감별 진단 constraint 추가**

기존 `'[Constraints]'` 배열 블록:
```typescript
    '[Constraints]',
    '- 반드시 JSON만 반환한다. 설명 문장/마크다운/코드펜스 금지.',
    '- 응답은 감정적 위로가 아니라 검증 가능한 분석만 포함한다.',
    '- probability_estimate는 0~100 정수 또는 null.',
    '- cas_signal 값은 0~1 범위.',
```

교체:
```typescript
    '[Constraints]',
    '- 반드시 JSON만 반환한다. 설명 문장/마크다운/코드펜스 금지.',
    '- 응답은 감정적 위로가 아니라 검증 가능한 분석만 포함한다.',
    '- probability_estimate는 0~100 정수 또는 null.',
    '- cas_signal 값은 0~1 범위.',
    '- 경계 케이스에서는 반드시 differentialRule을 참조해 왜곡 유형을 확정하라.',
    '- 복수 왜곡이 탐지되면 모두 포함하되, intensity로 주도 왜곡을 구분하라.',
```

- [ ] **Step 3: 타입 체크**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npm run lint
```

Expected: 에러 없음.

- [ ] **Step 4: Commit**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && git add lib/openai/gemini.ts && git commit -m "feat(ai): inject differentialRule into analysis prompt for better boundary case classification"
```

---

### Task 3: 소크라테스 질문 프롬프트 강화 + 경계 케이스 eval 추가

**Files:**
- Modify: `lib/openai/gemini.ts`
- Modify: `lib/ai/eval-cases.ts`

- [ ] **Step 1: generateSocraticQuestionsWithGemini 프롬프트에 reference_point constraint 추가**

`lib/openai/gemini.ts`의 `generateSocraticQuestionsWithGemini` 함수 안 prompt 배열에서 `'[Question Constraints]'` 블록:

기존:
```typescript
    '[Question Constraints]',
    '- 정확히 3개',
    '- 각 질문은 숫자/확률/비율 등 계량 답변을 요구',
    '- 위로 금지, 판단 단정 금지',
    '- Build-Measure-Learn 루프를 촉진하는 질문 포함',
```

교체:
```typescript
    '[Question Constraints]',
    '- 정확히 3개',
    '- 각 질문은 숫자/확률/비율 등 계량 답변을 요구',
    '- 위로 금지, 판단 단정 금지',
    '- Build-Measure-Learn 루프를 촉진하는 질문 포함',
    `- 반드시 reference_point("${input.referencePoint ?? '미확인'}")를 최소 1개 질문에 직접 언급하거나 반영하라.`,
    `- decentering_prompt("${input.decenteringPrompt ?? '없음'}")를 활용해 최소 1개 질문을 설계하라.`,
    '- 사용자의 구체적 상황(트리거/자동사고)에서 실제 수치/사례를 질문에 포함하라.',
```

- [ ] **Step 2: 경계 케이스 eval 데이터 추가**

`lib/ai/eval-cases.ts`의 `BLUEBIRD_EVAL_CASES` 배열에 기존 배열 마지막 항목 이후 다음 10개 추가:

```typescript
  // 경계 케이스: 파국화 vs 흑백논리
  {
    id: 'boundary-cat-vs-aon-1',
    trigger: '시험에서 한 문제를 틀렸다.',
    thought: '이거 틀리면 나는 낙제다.',
    expectedDistortions: [DistortionType.ALL_OR_NOTHING],
    expectedFrame: 'loss',
    minQuestionNumericCount: 3,
  },
  {
    id: 'boundary-cat-vs-aon-2',
    trigger: '첫 직장 면접에서 떨어졌다.',
    thought: '이번에 떨어지면 평생 취업 못 할 거야.',
    expectedDistortions: [DistortionType.CATASTROPHIZING],
    expectedFrame: 'loss',
    minQuestionNumericCount: 3,
  },
  // 경계 케이스: 감정적 추론 vs 임의적 추론
  {
    id: 'boundary-er-vs-ai-1',
    trigger: '발표 직전 심장이 두근거렸다.',
    thought: '심장이 이렇게 뛰니까 분명 오늘 망할 거야.',
    expectedDistortions: [DistortionType.EMOTIONAL_REASONING],
    expectedFrame: 'loss',
    minQuestionNumericCount: 3,
  },
  {
    id: 'boundary-er-vs-ai-2',
    trigger: '상사가 회의에서 나를 쳐다보지 않았다.',
    thought: '저게 나를 싫어한다는 신호다.',
    expectedDistortions: [DistortionType.ARBITRARY_INFERENCE],
    expectedFrame: 'loss',
    minQuestionNumericCount: 3,
  },
  // 경계 케이스: 개인화 vs 임의적 추론
  {
    id: 'boundary-per-vs-ai-1',
    trigger: '팀 KPI가 목표치에 미달했다.',
    thought: '내가 부족해서 팀 전체가 실패했다.',
    expectedDistortions: [DistortionType.PERSONALIZATION],
    expectedFrame: 'loss',
    minQuestionNumericCount: 3,
  },
  {
    id: 'boundary-per-vs-ai-2',
    trigger: '친구 모임에서 대화가 잠깐 끊겼다.',
    thought: '내가 분위기를 망쳤고 다들 나를 탓하고 있을 거다.',
    expectedDistortions: [DistortionType.PERSONALIZATION, DistortionType.ARBITRARY_INFERENCE],
    expectedFrame: 'loss',
    minQuestionNumericCount: 3,
  },
  // 경계 케이스: 복수 왜곡
  {
    id: 'boundary-multi-1',
    trigger: '코드 리뷰에서 코멘트를 10개 받았다.',
    thought: '이렇게 많이 지적당했으니 나는 실력이 없고, 팀장이 나를 못 미더워할 게 뻔하다.',
    expectedDistortions: [DistortionType.ALL_OR_NOTHING, DistortionType.ARBITRARY_INFERENCE],
    expectedFrame: 'loss',
    minQuestionNumericCount: 3,
  },
  {
    id: 'boundary-multi-2',
    trigger: '발표 자료를 세 번이나 수정했다.',
    thought: '세 번씩 고쳐야 한다는 건 내가 무능하다는 증거고, 이번 프로젝트는 망할 거야.',
    expectedDistortions: [DistortionType.PERSONALIZATION, DistortionType.CATASTROPHIZING],
    expectedFrame: 'loss',
    minQuestionNumericCount: 3,
  },
  // 경계 케이스: 낮은 왜곡 / 오탐 방지
  {
    id: 'boundary-low-distortion-1',
    trigger: '운동을 3일 연속 빠졌다.',
    thought: '3일 쉬었으니 다시 시작해야 한다. 다음 주부터 다시 루틴을 잡아보자.',
    expectedDistortions: [],
    expectedFrame: 'gain',
    minQuestionNumericCount: 3,
  },
  {
    id: 'boundary-low-distortion-2',
    trigger: '협상에서 원하는 조건을 50%만 얻었다.',
    thought: '절반은 얻었지만 나머지도 다음 라운드에서 시도해볼 수 있다.',
    expectedDistortions: [],
    expectedFrame: 'gain',
    minQuestionNumericCount: 3,
  },
```

- [ ] **Step 3: 타입 체크**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npm run lint
```

Expected: 에러 없음.

- [ ] **Step 4: Commit**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && git add lib/openai/gemini.ts lib/ai/eval-cases.ts && git commit -m "feat(ai): strengthen socratic question prompt with reference_point + add 10 boundary eval cases"
```

---

## Phase 2: /insights 통계 페이지

### Task 4: proxy.ts에 /insights 경로 보호 추가

**Files:**
- Modify: `proxy.ts`

- [ ] **Step 1: 인증 없는 사용자 리디렉션 조건에 /insights 추가**

`proxy.ts`에서:

기존:
```typescript
  if (
    !user &&
    (request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/log') ||
      request.nextUrl.pathname.startsWith('/analyze') ||
      request.nextUrl.pathname.startsWith('/visualize') ||
      request.nextUrl.pathname.startsWith('/action'))
  ) {
```

교체:
```typescript
  if (
    !user &&
    (request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/log') ||
      request.nextUrl.pathname.startsWith('/analyze') ||
      request.nextUrl.pathname.startsWith('/visualize') ||
      request.nextUrl.pathname.startsWith('/action') ||
      request.nextUrl.pathname.startsWith('/insights'))
  ) {
```

- [ ] **Step 2: matcher 배열에 /insights 추가**

기존:
```typescript
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/log/:path*',
    '/analyze/:path*',
    '/visualize/:path*',
    '/action/:path*',
    '/auth/:path*',
  ],
};
```

교체:
```typescript
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/log/:path*',
    '/analyze/:path*',
    '/visualize/:path*',
    '/action/:path*',
    '/insights/:path*',
    '/auth/:path*',
  ],
};
```

- [ ] **Step 3: 타입 체크**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npm run lint
```

Expected: 에러 없음.

- [ ] **Step 4: Commit**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && git add proxy.ts && git commit -m "feat(auth): add /insights route protection to middleware"
```

---

### Task 5: /insights 페이지 생성 (요약 카드 + 왜곡 분포 Bar Chart)

**Files:**
- Create: `app/insights/page.tsx`

- [ ] **Step 1: /insights/page.tsx 생성**

```bash
mkdir -p /Users/dongseob/Desktop/Project-BlueBird-mvp/app/insights
```

`app/insights/page.tsx`를 아래 내용으로 생성:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import { supabase } from '@/lib/supabase/client';
import { DistortionType, DistortionTypeKorean } from '@/types';

type DistortionFreq = { name: string; count: number };
type AutonomyPoint = { date: string; score: number };
type IntensityPoint = { type: string; avgIntensity: number };

export default function InsightsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [totalAnalyses, setTotalAnalyses] = useState(0);
  const [topDistortion, setTopDistortion] = useState<string>('—');
  const [avgAutonomy, setAvgAutonomy] = useState<number>(0);
  const [completionRate, setCompletionRate] = useState<number>(0);
  const [distortionFreq, setDistortionFreq] = useState<DistortionFreq[]>([]);
  const [autonomyTrend, setAutonomyTrend] = useState<AutonomyPoint[]>([]);
  const [intensityData, setIntensityData] = useState<IntensityPoint[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const since = thirtyDaysAgo.toISOString();

      // 왜곡 분포 데이터 (최근 30일)
      const { data: analysisRows } = await supabase
        .from('analysis')
        .select('distortion_type, intensity, created_at, logs!inner(user_id)')
        .eq('logs.user_id', user.id)
        .gte('created_at', since);

      const rows = (analysisRows ?? []) as Array<{
        distortion_type: string;
        intensity: number;
        created_at: string;
      }>;

      setTotalAnalyses(rows.length);

      // 왜곡 유형별 빈도
      const freqMap: Record<string, number> = {};
      const intensityMap: Record<string, number[]> = {};
      rows.forEach((r) => {
        freqMap[r.distortion_type] = (freqMap[r.distortion_type] ?? 0) + 1;
        if (!intensityMap[r.distortion_type]) intensityMap[r.distortion_type] = [];
        intensityMap[r.distortion_type].push(r.intensity);
      });

      const allTypes = Object.values(DistortionType);
      const freqData: DistortionFreq[] = allTypes.map((t) => ({
        name: DistortionTypeKorean[t],
        count: freqMap[t] ?? 0,
      }));
      setDistortionFreq(freqData);

      const topEntry = Object.entries(freqMap).sort((a, b) => b[1] - a[1])[0];
      setTopDistortion(
        topEntry ? DistortionTypeKorean[topEntry[0] as DistortionType] ?? topEntry[0] : '—'
      );

      const intensityPoints: IntensityPoint[] = allTypes.map((t) => {
        const vals = intensityMap[t] ?? [];
        const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        return { type: DistortionTypeKorean[t], avgIntensity: parseFloat(avg.toFixed(2)) };
      });
      setIntensityData(intensityPoints);

      // 자율성 지수 추이
      const { data: interventions } = await supabase
        .from('intervention')
        .select('autonomy_score, created_at, logs!inner(user_id)')
        .eq('logs.user_id', user.id)
        .not('autonomy_score', 'is', null)
        .order('created_at', { ascending: true });

      const ivRows = (interventions ?? []) as Array<{ autonomy_score: number; created_at: string }>;

      let cumulative = 0;
      const trendData: AutonomyPoint[] = ivRows.map((r) => {
        cumulative += r.autonomy_score;
        return {
          date: new Date(r.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
          score: cumulative,
        };
      });
      setAutonomyTrend(trendData);
      setAvgAutonomy(ivRows.length ? Math.round(cumulative / ivRows.length) : 0);

      // 완료율
      const { count: total } = await supabase
        .from('intervention')
        .select('log_id, logs!inner(user_id)', { count: 'exact', head: true })
        .eq('logs.user_id', user.id);
      const { count: completed } = await supabase
        .from('intervention')
        .select('log_id, logs!inner(user_id)', { count: 'exact', head: true })
        .eq('is_completed', true)
        .eq('logs.user_id', user.id);
      setCompletionRate(total && total > 0 ? Math.round(((completed ?? 0) / total) * 100) : 0);

      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-white border-b border-background-tertiary px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-4">
        <button onClick={() => router.push('/dashboard')} className="text-primary font-semibold">
          ← 대시보드
        </button>
        <h1 className="text-lg font-bold text-text-primary">인사이트</h1>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* 요약 카드 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-background-tertiary rounded-xl p-4 text-center">
            <p className="text-xs text-text-secondary mb-1">총 분석 횟수</p>
            <p className="text-2xl font-bold text-text-primary">{totalAnalyses}</p>
          </div>
          <div className="bg-white border border-background-tertiary rounded-xl p-4 text-center">
            <p className="text-xs text-text-secondary mb-1">주요 왜곡</p>
            <p className="text-sm font-bold text-primary leading-tight mt-1">{topDistortion}</p>
          </div>
          <div className="bg-white border border-background-tertiary rounded-xl p-4 text-center">
            <p className="text-xs text-text-secondary mb-1">행동 완료율</p>
            <p className="text-2xl font-bold text-text-primary">{completionRate}%</p>
          </div>
        </div>

        {/* 왜곡 유형 분포 */}
        <div className="bg-white border border-background-tertiary rounded-xl p-4 sm:p-6">
          <h2 className="text-base font-bold text-text-primary mb-4">왜곡 유형 분포 (최근 30일)</h2>
          {distortionFreq.every((d) => d.count === 0) ? (
            <p className="text-sm text-text-secondary text-center py-8">아직 분석 데이터가 없습니다.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={distortionFreq} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="탐지 횟수" fill="#1E40AF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 자율성 지수 추이 */}
        <div className="bg-white border border-background-tertiary rounded-xl p-4 sm:p-6">
          <h2 className="text-base font-bold text-text-primary mb-4">자율성 지수 누적 추이</h2>
          {autonomyTrend.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-8">행동을 완료하면 추이가 표시됩니다.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={autonomyTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" name="자율성 지수" stroke="#06B6D4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 왜곡 강도 레이더 */}
        <div className="bg-white border border-background-tertiary rounded-xl p-4 sm:p-6">
          <h2 className="text-base font-bold text-text-primary mb-4">왜곡 유형별 평균 강도</h2>
          {intensityData.every((d) => d.avgIntensity === 0) ? (
            <p className="text-sm text-text-secondary text-center py-8">아직 분석 데이터가 없습니다.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={intensityData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="type" tick={{ fontSize: 11 }} />
                <Radar name="평균 강도" dataKey="avgIntensity" stroke="#1E40AF" fill="#1E40AF" fillOpacity={0.25} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 텍스트 인사이트 */}
        <div className="bg-background-secondary border border-background-tertiary rounded-xl p-4 sm:p-6 space-y-2">
          <h2 className="text-base font-bold text-text-primary mb-2">요약 인사이트</h2>
          <p className="text-sm text-text-secondary">
            최근 30일간 가장 자주 나타난 왜곡은 <span className="font-semibold text-text-primary">{topDistortion}</span>입니다.
          </p>
          <p className="text-sm text-text-secondary">
            행동 확약 완료율은 <span className="font-semibold text-text-primary">{completionRate}%</span>입니다.
          </p>
        </div>

      </div>
    </main>
  );
}
```

- [ ] **Step 2: 타입 체크**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npm run lint
```

Expected: 에러 없음.

- [ ] **Step 3: dev 서버에서 /insights 페이지 확인**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npm run dev
```

브라우저에서 `http://localhost:3000/insights` 접근 후 로그인 리디렉션 확인. 로그인 후 페이지 로딩 및 차트 렌더링 확인.

- [ ] **Step 4: Commit**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && git add app/insights/page.tsx && git commit -m "feat: add /insights statistics page with distortion frequency, autonomy trend, intensity radar"
```

---

### Task 6: 대시보드에 인사이트 진입 버튼 추가

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: 대시보드 헤더에 "인사이트" 버튼 추가**

`app/dashboard/page.tsx`의 헤더 `<div className="flex items-center gap-4">` 안에서:

기존:
```typescript
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/manual')}
                className="text-sm text-primary hover:underline transition-colors"
              >
                Technical Manual
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-text-secondary hover:text-primary transition-colors"
              >
                로그아웃
              </button>
            </div>
```

교체:
```typescript
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/insights')}
                className="text-sm text-primary hover:underline transition-colors"
              >
                인사이트
              </button>
              <button
                onClick={() => router.push('/manual')}
                className="text-sm text-text-secondary hover:underline transition-colors"
              >
                Manual
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-text-secondary hover:text-primary transition-colors"
              >
                로그아웃
              </button>
            </div>
```

- [ ] **Step 2: 타입 체크 + dev 서버에서 버튼 클릭 확인**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npm run lint
```

Expected: 에러 없음. 브라우저에서 대시보드 헤더의 "인사이트" 버튼 클릭 → `/insights` 이동 확인.

- [ ] **Step 3: Commit**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && git add app/dashboard/page.tsx && git commit -m "feat: add insights navigation button to dashboard header"
```

---

## Phase 3: UI 폴리싱

### Task 7: lucide-react 설치 + 랜딩 페이지 개선

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: lucide-react 설치**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npm install lucide-react
```

Expected: `package.json`의 `dependencies`에 `lucide-react` 추가됨.

- [ ] **Step 2: 랜딩 페이지 카피 및 레이아웃 개선**

`app/page.tsx` 전체를 아래로 교체:

```typescript
'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">

        {/* 브랜드 */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-primary">Project Bluebird</h1>
          <p className="text-base text-text-secondary leading-relaxed">
            불안한 생각이 떠오른 순간을 기록하면<br />
            AI가 어떤 인지 왜곡인지 분석해드립니다.
          </p>
        </div>

        {/* 시나리오 예시 */}
        <div className="bg-white border border-background-tertiary rounded-2xl p-6 text-left space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">이런 순간에 쓰세요</p>
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <span className="text-primary font-bold mt-0.5">—</span>
              <p className="text-sm text-text-secondary">발표에서 실수한 뒤 "나는 항상 이런다"는 생각이 들 때</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-primary font-bold mt-0.5">—</span>
              <p className="text-sm text-text-secondary">친구 답장이 늦어서 "날 싫어하나"라는 생각이 들 때</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-primary font-bold mt-0.5">—</span>
              <p className="text-sm text-text-secondary">잘 될 것 같았는데 "어차피 망할 것 같다"는 느낌이 들 때</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3 pt-2">
          <button
            className="w-full bg-primary text-white font-semibold py-4 px-6 rounded-2xl touch-manipulation active:scale-95 transition-transform"
            onClick={() => router.push('/auth/signup')}
          >
            첫 번째 생각 기록하기
          </button>
          <button
            className="w-full bg-white border border-background-tertiary text-text-secondary font-medium py-3 px-6 rounded-2xl touch-manipulation active:scale-95 transition-transform"
            onClick={() => router.push('/auth/login')}
          >
            이미 계정이 있어요
          </button>
        </div>

        <p className="text-xs text-text-tertiary">
          PWA — 홈 화면에 추가하면 앱처럼 사용할 수 있습니다
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: 타입 체크 + 브라우저 확인**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npm run lint
```

Expected: 에러 없음. `http://localhost:3000` 에서 새 랜딩 페이지 확인.

- [ ] **Step 4: Commit**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && git add app/page.tsx package.json package-lock.json && git commit -m "feat(ui): redesign landing page with scenario examples + install lucide-react"
```

---

### Task 8: 인증 페이지 폴리싱

**Files:**
- Modify: `app/auth/login/page.tsx`
- Modify: `app/auth/signup/page.tsx` (있는 경우)

- [ ] **Step 1: 로그인 페이지 디버그 텍스트 및 불필요 요소 제거**

`app/auth/login/page.tsx`에서 디버그 텍스트 제거:

기존:
```typescript
          <p className="text-xs text-text-secondary opacity-60">auth-login-fix-v2</p>
```

삭제 (해당 줄 전체 제거).

- [ ] **Step 2: 로그인 페이지 헤더 브랜드 개선**

기존:
```typescript
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">
            로그인
          </h1>
          <p className="text-text-secondary">
            Project Bluebird에 오신 것을 환영합니다
          </p>
        </div>
```

교체:
```typescript
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold text-primary tracking-wide">Project Bluebird</p>
          <h1 className="text-2xl font-bold text-text-primary">로그인</h1>
        </div>
```

- [ ] **Step 3: 회원가입 페이지 확인 및 동일 패턴 적용**

`app/auth/signup/page.tsx`를 읽어 헤더에 `"Project Bluebird"` 브랜드 라벨이 없으면 Step 2와 동일하게 추가. 디버그 텍스트가 있으면 제거.

- [ ] **Step 4: 타입 체크**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npm run lint
```

Expected: 에러 없음.

- [ ] **Step 5: Commit**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && git add app/auth/login/page.tsx app/auth/signup/page.tsx && git commit -m "feat(ui): polish auth pages — remove debug text, add brand label"
```

---

### Task 9: 공통 PageHeader + SkeletonCard 컴포넌트 생성 및 핵심 플로우 적용

**Files:**
- Create: `components/ui/PageHeader.tsx`
- Create: `components/ui/SkeletonCard.tsx`
- Modify: `app/log/page.tsx`
- Modify: `app/analyze/[id]/page.tsx`
- Modify: `app/visualize/[id]/page.tsx`
- Modify: `app/action/[id]/page.tsx`

- [ ] **Step 1: PageHeader 컴포넌트 생성**

`components/ui/PageHeader.tsx`:

```typescript
'use client';

import { useRouter } from 'next/navigation';

type Props = {
  title: string;
  backHref?: string;
  onBack?: () => void;
  step?: { current: number; total: number };
  rightElement?: React.ReactNode;
};

export default function PageHeader({ title, backHref, onBack, step, rightElement }: Props) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) { onBack(); return; }
    if (backHref) { router.push(backHref); return; }
    router.back();
  };

  return (
    <>
      <header className="bg-white border-b border-background-tertiary px-4 sm:px-6 py-3 sm:py-4 flex items-center">
        <button onClick={handleBack} className="text-primary font-semibold min-w-[44px]">
          ← 뒤로
        </button>
        <div className="flex-1 text-center">
          {step ? (
            <p className="text-sm text-text-secondary">{step.current}/{step.total} 단계</p>
          ) : (
            <p className="text-sm font-semibold text-text-primary">{title}</p>
          )}
        </div>
        <div className="min-w-[44px] flex justify-end">
          {rightElement ?? null}
        </div>
      </header>
      {step && (
        <div className="bg-background-secondary h-1">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${(step.current / step.total) * 100}%` }}
          />
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: SkeletonCard 컴포넌트 생성**

`components/ui/SkeletonCard.tsx`:

```typescript
export default function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-white border border-background-tertiary rounded-xl p-4 sm:p-6 animate-pulse space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-background-secondary rounded"
          style={{ width: i === 0 ? '60%' : i === lines - 1 ? '40%' : '100%' }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: log/page.tsx에 PageHeader 적용**

`app/log/page.tsx`에서 기존 `<header>` + 진행바 블록:

```typescript
      {/* 헤더 */}
      <header className="bg-white border-b border-background-tertiary px-4 sm:px-6 py-3 sm:py-4 flex items-center">
        <button
          onClick={handleBack}
          className="text-primary font-semibold"
          disabled={loading}
        >
          ← 뒤로
        </button>
        <div className="flex-1 text-center">
          <p className="text-sm text-text-secondary">
            {step === 'trigger' ? '1/2 단계' : '2/2 단계'}
          </p>
        </div>
        <div className="w-16"></div>
      </header>

      {/* 진행 바 */}
      <div className="bg-background-secondary h-1">
        <div
          className="bg-primary h-full transition-all duration-300"
          style={{ width: step === 'trigger' ? '50%' : '100%' }}
        ></div>
      </div>
```

교체:

```typescript
      <PageHeader
        title="생각 기록"
        onBack={handleBack}
        step={{ current: step === 'trigger' ? 1 : 2, total: 2 }}
      />
```

파일 상단 import 추가:
```typescript
import PageHeader from '@/components/ui/PageHeader';
```

- [ ] **Step 4: 타입 체크**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npm run lint
```

Expected: 에러 없음.

- [ ] **Step 5: analyze, visualize, action 페이지의 헤더를 PageHeader로 교체**

각 페이지의 `<header>` + (진행바가 있다면 함께) 블록을 `<PageHeader>` 컴포넌트로 교체. 각 페이지를 읽어 기존 헤더 패턴을 확인한 후 아래 형태로 교체:

`app/analyze/[id]/page.tsx`:
```typescript
// 파일 상단에 추가
import PageHeader from '@/components/ui/PageHeader';

// 기존 <header>...</header> 블록 교체
<PageHeader title="분석 결과" backHref="/dashboard" />
```

`app/visualize/[id]/page.tsx`:
```typescript
import PageHeader from '@/components/ui/PageHeader';
<PageHeader title="시각화" />
```

`app/action/[id]/page.tsx`:
```typescript
import PageHeader from '@/components/ui/PageHeader';
<PageHeader title="행동 설계" />
```

- [ ] **Step 6: analyze 페이지 로딩 상태에 SkeletonCard 추가**

`app/analyze/[id]/page.tsx`의 로딩 스피너 반환 블록을 SkeletonCard로 교체:

기존 (스피너 형태):
```typescript
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </main>
    );
```

교체:
```typescript
import SkeletonCard from '@/components/ui/SkeletonCard';

// ...

    return (
      <main className="min-h-screen bg-background">
        <PageHeader title="분석 결과" backHref="/dashboard" />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          <SkeletonCard lines={4} />
          <SkeletonCard lines={3} />
        </div>
      </main>
    );
```

- [ ] **Step 7: 타입 체크 + dev 확인**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npm run lint
```

Expected: 에러 없음. 브라우저에서 `/log` 접근 후 헤더 일관성 확인.

- [ ] **Step 8: Commit**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && git add components/ui/PageHeader.tsx components/ui/SkeletonCard.tsx app/log/page.tsx "app/analyze/[id]/page.tsx" "app/visualize/[id]/page.tsx" "app/action/[id]/page.tsx" && git commit -m "feat(ui): add PageHeader + SkeletonCard components, apply to core flow pages"
```

---

### Task 10: 대시보드 lucide-react 아이콘 + 환영 섹션 간소화

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: lucide-react import 추가**

`app/dashboard/page.tsx` 상단 import에 추가:
```typescript
import { BookOpen, CheckCircle, Star } from 'lucide-react';
```

- [ ] **Step 2: 통계 카드 이모지 → lucide 아이콘으로 교체**

전체 로그 카드의 이모지:
```typescript
              <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                <span className="text-primary text-lg">📝</span>
              </div>
```
교체:
```typescript
              <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                <BookOpen size={20} className="text-primary" />
              </div>
```

완료한 행동 카드의 이모지:
```typescript
              <div className="w-10 h-10 bg-success bg-opacity-10 rounded-full flex items-center justify-center">
                <span className="text-success text-lg">✓</span>
              </div>
```
교체:
```typescript
              <div className="w-10 h-10 bg-success bg-opacity-10 rounded-full flex items-center justify-center">
                <CheckCircle size={20} className="text-success" />
              </div>
```

자율성 지수 카드의 이모지:
```typescript
              <div className="w-10 h-10 bg-warning bg-opacity-10 rounded-full flex items-center justify-center">
                <span className="text-warning text-lg">⭐</span>
              </div>
```
교체:
```typescript
              <div className="w-10 h-10 bg-warning bg-opacity-10 rounded-full flex items-center justify-center">
                <Star size={20} className="text-warning" />
              </div>
```

- [ ] **Step 3: 환영 메시지 섹션 간소화**

기존:
```typescript
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 mb-4 sm:mb-6 border border-background-tertiary shadow-none sm:shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-2">
            환영합니다! 👋
          </h2>
          <p className="text-sm text-text-secondary">
            {user?.email}
          </p>
        </div>
```

교체:
```typescript
        <div className="mb-4 sm:mb-6">
          <p className="text-sm text-text-secondary">{user?.email}</p>
        </div>
```

- [ ] **Step 4: 타입 체크 + dev 확인**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npm run lint
```

Expected: 에러 없음. 브라우저에서 `/dashboard`의 아이콘 및 레이아웃 확인.

- [ ] **Step 5: Commit**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && git add app/dashboard/page.tsx && git commit -m "feat(ui): replace emoji icons with lucide-react, simplify dashboard welcome section"
```

---

## Phase 4: 온보딩

### Task 11: 대시보드 Empty State + 로그 입력 Placeholder 개선

**Files:**
- Modify: `app/dashboard/page.tsx`
- Modify: `app/log/page.tsx`

- [ ] **Step 1: 대시보드 최근 활동 섹션의 empty state를 3단계 안내로 교체**

`app/dashboard/page.tsx`에서 최근 활동 섹션의 빈 상태 블록:

기존:
```typescript
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 opacity-20">📋</div>
              <p className="text-sm text-text-secondary">
                아직 기록이 없습니다<br />
                첫 번째 사고를 기록해보세요
              </p>
            </div>
```

교체:
```typescript
          {logs.length === 0 ? (
            <div className="space-y-3 py-4">
              <p className="text-sm font-medium text-text-primary mb-4">시작하는 방법</p>
              {[
                { step: '1', text: '오늘 마음에 걸리는 사건이나 생각을 적어보세요' },
                { step: '2', text: 'AI가 어떤 인지 왜곡인지 자동으로 분석해드립니다' },
                { step: '3', text: '소크라테스식 질문으로 사고를 직접 교정해보세요' },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                    {step}
                  </span>
                  <p className="text-sm text-text-secondary">{text}</p>
                </div>
              ))}
            </div>
```

- [ ] **Step 2: 로그 입력 페이지 placeholder 개선**

`app/log/page.tsx`에서 트리거 textarea placeholder:

기존:
```typescript
                  placeholder="예: 상사가 회의에서 내 의견을 무시했다"
```

교체:
```typescript
                  placeholder="예: 팀장이 내 보고서에 피드백을 주지 않았다"
```

자동사고 textarea placeholder:

기존:
```typescript
                  placeholder="예: 나는 무능하고 아무도 내 의견을 중요하게 생각하지 않는다"
```

교체:
```typescript
                  placeholder="예: 내가 일을 못하니까 무시하는 거겠지. 앞으로도 이럴 거야"
```

- [ ] **Step 3: 타입 체크 + dev 확인**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npm run lint
```

Expected: 에러 없음. 브라우저에서 로그 0개 상태의 대시보드 접근 → 3단계 안내 카드 확인. `/log` 접근 → 새 placeholder 확인.

- [ ] **Step 4: 최종 빌드 확인**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && npm run build
```

Expected: 빌드 성공, 에러 없음.

- [ ] **Step 5: Commit**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp && git add app/dashboard/page.tsx app/log/page.tsx && git commit -m "feat(onboarding): add 3-step empty state guide to dashboard + improve log page placeholders"
```
