'use client';

import { useRouter } from 'next/navigation';
import { track } from '@vercel/analytics';
import { SAMPLE_CASES } from '@/lib/content/sample-cases';

export default function SampleIndexPage() {
  const router = useRouter();

  const handleSelect = (caseId: string) => {
    track('sample_case_select', { caseId });
    router.push(`/sample/${caseId}`);
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <header className="px-5 pt-10 pb-6">
        <button
          onClick={() => router.push('/')}
          className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
        >
          ← 홈으로
        </button>
      </header>

      <div className="flex-1 px-5 pb-12">
        <div className="max-w-md mx-auto space-y-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              60초 체험
            </p>
            <h1 className="text-2xl font-bold text-text-primary leading-tight tracking-tight">
              가입 전, 어떻게 작동하는지 먼저 보여드릴게요
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed">
              AI가 인지 왜곡을 어떻게 탐지하고 검증 질문을 만드는지, 미리 준비한 사례로 먼저 보여드립니다. 보고 마음에 들면 그때 가입하셔도 됩니다.
            </p>
          </div>

          <div className="space-y-3">
            {SAMPLE_CASES.map((c, i) => (
              <button
                key={c.id}
                onClick={() => handleSelect(c.id)}
                className="w-full text-left bg-white border border-background-tertiary rounded-2xl p-5 hover:border-primary transition-colors active:scale-[0.99] touch-manipulation"
              >
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-7 h-7 shrink-0 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <p className="text-sm text-text-primary font-medium leading-snug">
                      {c.shortLabel}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      탭해서 분석 결과 보기 →
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-background-secondary rounded-xl p-4 space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
              무결성
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">
              위 사례의 분석 결과는 실제 BlueBird 분석 엔진을 1회 호출해 받은 결과를 그대로 보여드립니다. 데모용 가공이 아닙니다.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
