'use client';

import { useRouter } from 'next/navigation';
import { track } from '@vercel/analytics';
import { ExternalLink } from 'lucide-react';
import { useState } from 'react';

const SCENARIOS = [
  '회의에서 한마디 한 뒤 "괜히 말했다, 다음부턴 가만히 있어야지"로 굳어질 때',
  '답장이 하루 늦어진 걸 보고 "내가 뭘 잘못한 거지"부터 떠오를 때',
  '평가를 앞두고 "이번에도 결국 부족하다고 드러날 것이다"가 미리 결론처럼 들릴 때',
];

export default function HomePage() {
  const router = useRouter();
  const [showMoreScenarios, setShowMoreScenarios] = useState(false);

  const handleSampleStart = () => {
    track('sample_funnel_start');
    router.push('/sample');
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-6 pt-6 pb-8 sm:p-6">
      <div className="max-w-md w-full space-y-5 text-center">

        {/* 브랜드 */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-primary tracking-tighter">Project Bluebird</h1>
          <p className="text-2xl font-semibold text-text-primary leading-snug tracking-tight">
            반복되는 사고 패턴을<br />구조로 본다.
          </p>
        </div>

        {/* 시나리오 예시 + 샘플 funnel 진입점 */}
        <div className="bg-white border border-background-tertiary rounded-2xl p-5 text-left space-y-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">이런 순간에 쓰세요</p>
          <ul className="space-y-3 list-none" role="list">
            <li className="text-sm text-text-secondary border-l-2 border-primary/30 pl-3 leading-relaxed">
              {SCENARIOS[0]}
            </li>
            {showMoreScenarios && SCENARIOS.slice(1).map((s) => (
              <li key={s} className="text-sm text-text-secondary border-l-2 border-primary/30 pl-3 leading-relaxed">
                {s}
              </li>
            ))}
          </ul>
          {!showMoreScenarios && (
            <button
              onClick={() => setShowMoreScenarios(true)}
              className="text-xs text-text-tertiary hover:text-primary transition-colors"
            >
              다른 사례 보기 →
            </button>
          )}
          <button
            onClick={handleSampleStart}
            className="w-full mt-1 bg-primary text-white text-sm font-semibold py-4 px-4 rounded-xl active:scale-95 transition-transform touch-manipulation"
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
            className="w-full bg-white border border-primary/60 text-primary font-semibold py-3 px-6 rounded-2xl touch-manipulation active:scale-95 transition-transform"
            onClick={() => router.push('/auth/signup')}
          >
            가입하기
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
          분석 횟수가 쌓일수록<br />당신의 사고 패턴이 더 또렷이 보입니다.
        </p>

        {/* 법적 문서 */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-text-tertiary pt-2">
          <a href="/disclaimer" className="py-2 hover:text-text-secondary underline-offset-2 hover:underline">
            면책 안내
          </a>
          <span aria-hidden>·</span>
          <a href="/terms" className="py-2 hover:text-text-secondary underline-offset-2 hover:underline">
            이용약관
          </a>
          <span aria-hidden>·</span>
          <a href="/privacy" className="py-2 hover:text-text-secondary underline-offset-2 hover:underline">
            개인정보 처리방침
          </a>
          <span aria-hidden>·</span>
          <a href="/safety/resources" className="py-2 hover:text-text-secondary underline-offset-2 hover:underline">
            정신건강 자원
          </a>
        </div>

      </div>
    </main>
  );
}
