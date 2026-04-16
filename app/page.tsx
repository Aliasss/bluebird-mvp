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
