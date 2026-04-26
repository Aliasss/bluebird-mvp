'use client';

import { useRouter } from 'next/navigation';
import { track } from '@vercel/analytics';
import { ExternalLink } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const handleSampleStart = () => {
    track('sample_funnel_start');
    router.push('/sample');
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-6 pt-20 pb-10 sm:p-6">
      <div className="max-w-md w-full space-y-8 text-center">

        {/* 브랜드 */}
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold text-primary tracking-tighter">Project Bluebird</h1>
          <p className="text-xl font-semibold text-text-primary leading-snug tracking-tight">
            흔들리는 마음의 영점을 맞추고,<br />당신의 삶을 다시 항해하세요.
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">
            AI 인지 디버깅으로 불안의 안개를 걷어내고,<br />실존적 주체성을 회복하는 시간.
          </p>
        </div>

        {/* 시나리오 예시 + 샘플 funnel 진입점 */}
        <div className="bg-white border border-background-tertiary rounded-2xl p-6 text-left space-y-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">이런 순간에 쓰세요</p>
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <span className="text-primary font-bold mt-0.5">✦</span>
              <p className="text-sm text-text-secondary">발표에서 실수한 뒤 "나는 항상 이런다"는 생각이 들 때</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-primary font-bold mt-0.5">✦</span>
              <p className="text-sm text-text-secondary">친구 답장이 늦어서 "날 싫어하나"라는 생각이 들 때</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-primary font-bold mt-0.5">✦</span>
              <p className="text-sm text-text-secondary">잘 될 것 같았는데 "어차피 망할 것 같다"는 느낌이 들 때</p>
            </div>
          </div>
          <button
            onClick={handleSampleStart}
            className="w-full mt-2 bg-white border-2 border-primary text-primary text-sm font-semibold py-3 px-4 rounded-xl active:scale-95 transition-transform touch-manipulation"
          >
            위 사례로 60초 체험해보기 →
          </button>
        </div>

        {/* 철학 페이지 링크 */}
        <button
          onClick={() => router.push('/our-philosophy')}
          className="w-full text-sm text-primary font-medium transition-colors py-1"
        >
          인지 왜곡이 왜 중요한가요? →
        </button>

        {/* CTA */}
        <div className="space-y-3 pt-2">
          <p className="text-xs text-text-tertiary text-center">
            CBT, CAS, 전망이론을 기반으로 설계된 인지 분석 도구
          </p>
          <button
            className="w-full bg-primary text-white font-semibold py-4 px-6 rounded-2xl touch-manipulation active:scale-95 transition-transform"
            onClick={() => router.push('/auth/signup')}
          >
            나의 항해 시작하기
          </button>
          <button
            className="w-full bg-white border border-background-tertiary text-text-secondary font-medium py-3 px-6 rounded-2xl touch-manipulation active:scale-95 transition-transform"
            onClick={() => router.push('/auth/login')}
          >
            이미 계정이 있어요
          </button>
        </div>

        <button
          onClick={() => router.push('/install')}
          className="flex items-center justify-center gap-1.5 text-xs text-text-tertiary hover:text-primary transition-colors mx-auto"
        >
          <ExternalLink size={11} />
          홈 화면에 추가하고 연속 기록을 시작하세요
        </button>

        {/* Footer */}
        <p className="text-xs text-text-tertiary leading-relaxed pb-2">
          불안은 바다의 파도와 같지만,<br />주체성을 가진 항해사는 길을 잃지 않습니다.
        </p>

        {/* 법적 문서 */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px] text-text-tertiary pt-2">
          <a href="/disclaimer" className="hover:text-text-secondary underline-offset-2 hover:underline">
            면책 안내
          </a>
          <span aria-hidden>·</span>
          <a href="/terms" className="hover:text-text-secondary underline-offset-2 hover:underline">
            이용약관
          </a>
          <span aria-hidden>·</span>
          <a href="/privacy" className="hover:text-text-secondary underline-offset-2 hover:underline">
            개인정보 처리방침
          </a>
          <span aria-hidden>·</span>
          <a href="/safety/resources" className="hover:text-text-secondary underline-offset-2 hover:underline">
            정신건강 자원
          </a>
        </div>

      </div>
    </main>
  );
}
