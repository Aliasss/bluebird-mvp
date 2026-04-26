'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import { track } from '@vercel/analytics';
import { getSampleCase } from '@/lib/content/sample-cases';
import { DistortionTypeKorean } from '@/types';

export default function SampleResultPage() {
  const router = useRouter();
  const params = useParams<{ caseId: string }>();
  const sample = params.caseId ? getSampleCase(params.caseId) : null;

  if (!sample) {
    notFound();
  }

  const { trigger, thought, analysis, questions } = sample;

  const handleSignupClick = () => {
    track('sample_signup_click', { caseId: sample.id });
    router.push('/auth/signup');
  };

  const handleOtherCaseClick = () => {
    track('sample_other_case_click', { caseId: sample.id });
    router.push('/sample');
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <header className="px-5 pt-10 pb-4">
        <button
          onClick={() => router.push('/sample')}
          className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
        >
          ← 다른 사례 보기
        </button>
      </header>

      <div className="flex-1 px-5 pb-12">
        <div className="max-w-md mx-auto space-y-6">
          {/* 1. 입력 — 사용자가 무엇을 분석하는지 */}
          <section className="bg-white border border-background-tertiary rounded-2xl p-5 space-y-4 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
              사례 입력
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] text-text-tertiary mb-1">어떤 일이 있었나</p>
                <p className="text-sm text-text-primary leading-relaxed">{trigger}</p>
              </div>
              <div>
                <p className="text-[11px] text-text-tertiary mb-1">그때 든 생각</p>
                <p className="text-sm text-text-primary leading-relaxed">{thought}</p>
              </div>
            </div>
          </section>

          {/* 2. 분석 결과 — 어떤 인지 왜곡이 탐지됐는지 */}
          <section className="bg-white border border-background-tertiary rounded-2xl p-5 space-y-4 shadow-card">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                탐지된 인지 왜곡
              </p>
              <p className="text-xs text-text-tertiary">
                {analysis.distortions.length}개 패턴 발견
              </p>
            </div>
            <div className="space-y-3">
              {analysis.distortions.map((d, i) => (
                <div
                  key={`${d.type}-${i}`}
                  className="bg-background-secondary rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-text-primary">
                      {DistortionTypeKorean[d.type]}
                    </p>
                    <span className="text-xs text-primary font-medium">
                      강도 {(d.intensity * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-background-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.max(8, d.intensity * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{d.segment}</p>
                  {d.rationale && (
                    <p className="text-[11px] text-text-tertiary leading-relaxed pt-1 border-t border-background-tertiary/60">
                      {d.rationale}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 3. 검증 질문 1개 — 자율성 원칙 (답을 단정하지 않음) */}
          <section className="bg-white border border-background-tertiary rounded-2xl p-5 space-y-4 shadow-card">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                생각을 점검하는 질문
              </p>
              <p className="text-xs text-text-tertiary">
                실제 사용자는 3개의 검증 질문을 받습니다. 그중 1개를 미리 보여드릴게요.
              </p>
            </div>
            <p className="text-sm text-text-primary leading-relaxed">
              {questions[0]}
            </p>
            <div className="bg-background-secondary rounded-xl p-3">
              <p className="text-[11px] text-text-tertiary leading-relaxed">
                BlueBird는 답을 단정하지 않습니다. 사용자가 스스로 검증할 수 있도록 구체적인 질문만 제공합니다.
              </p>
            </div>
          </section>

          {/* 4. 가입 CTA */}
          <section className="space-y-3 pt-2">
            <button
              onClick={handleSignupClick}
              className="w-full bg-primary text-white font-semibold py-4 px-6 rounded-2xl active:scale-95 transition-transform touch-manipulation"
            >
              내 이야기로 직접 해보기 →
            </button>
            <button
              onClick={handleOtherCaseClick}
              className="w-full bg-white border border-background-tertiary text-text-secondary font-medium py-3 px-6 rounded-2xl active:scale-95 transition-transform touch-manipulation"
            >
              다른 사례 더 보기
            </button>
          </section>

          <p className="text-[11px] text-text-tertiary text-center pt-2 leading-relaxed">
            위 분석은 실제 BlueBird 엔진의 출력 그대로입니다.
            <br />
            가입 후 당신의 사례에도 동일한 품질로 작동합니다.
          </p>
        </div>
      </div>
    </main>
  );
}
