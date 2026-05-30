'use client';

import { useRouter } from 'next/navigation';
import { track } from '@vercel/analytics';
import { ExternalLink, MessageCircle, Clock, Target } from 'lucide-react';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Badge from '@/components/ui/Badge';
import ListRow from '@/components/ui/ListRow';

// v2 랜딩: 짧은 title/desc 쌍 + 아이콘 (ListRow 형식). 기존 3개 시나리오와 동일 맥락.
const SCENARIOS = [
  { icon: MessageCircle, title: '회의에서 한마디 한 뒤', desc: '"괜히 말했다"로 굳어질 때' },
  { icon: Clock, title: '답장이 하루 늦어진 걸 보고', desc: '"내가 뭘 잘못했지"부터 떠오를 때' },
  { icon: Target, title: '평가를 앞두고', desc: '"이번에도 부족할 것이다"가 들릴 때' },
];

export default function HomePage() {
  const router = useRouter();

  // 인증 사용자가 PWA 진입 시 /dashboard 자동 redirect.
  // 미인증 사용자는 마케팅 랜딩(무가입 funnel) 그대로 노출 — 회귀 0.
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace('/dashboard');
    });
  }, [router]);

  const handleSampleStart = () => {
    track('sample_funnel_start');
    router.push('/sample');
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 w-full max-w-lg mx-auto px-5 pt-8 pb-8 flex flex-col">
        {/* Hero */}
        <div className="pt-2">
          <Badge tone="primary">인지 분석 도구</Badge>
          <h1
            className="mt-4 text-[32px] font-extrabold leading-[1.28] text-text-primary"
            style={{ letterSpacing: '-0.035em' }}
          >
            반복되는 사고 패턴을
            <br />
            <span className="text-primary">구조로 봅니다.</span>
          </h1>
          <p className="mt-3.5 text-base leading-relaxed tracking-snug text-text-secondary">
            자동으로 떠오른 생각을 기록하면, 그 안에 숨은 인지 왜곡을 분석해 드려요. 분석이 쌓일수록 당신의 사고
            패턴이 또렷해집니다.
          </p>
        </div>

        {/* 시나리오 카드 */}
        <div className="mt-7 overflow-hidden rounded-card border border-background-tertiary bg-white">
          <p className="px-5 pt-4 pb-2 text-xs font-bold uppercase tracking-[0.04em] text-text-tertiary">
            이런 순간에
          </p>
          {SCENARIOS.map((s, i) => (
            <div key={s.title}>
              {i > 0 && <div className="mx-5 h-px bg-background-secondary" />}
              <ListRow icon={s.icon} title={s.title} desc={s.desc} />
            </div>
          ))}
        </div>

        {/* 1차 / 2차 액션 */}
        <div className="mt-8 space-y-2.5">
          <button
            onClick={handleSampleStart}
            className="w-full rounded-2xl bg-primary px-6 py-[17px] text-base font-semibold text-white transition-transform active:scale-95 touch-manipulation hover:bg-primary-dark"
          >
            60초 체험 시작하기
          </button>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full rounded-2xl px-6 py-[15px] text-[15px] font-semibold text-text-secondary transition-transform active:scale-95 touch-manipulation"
          >
            이미 계정이 있어요
          </button>
          <p className="text-center text-xs text-text-tertiary">
            인지행동치료(CBT)·메타인지·전망이론 기반
          </p>
        </div>

        {/* 보조 링크 — 하단 고정 */}
        <div className="mt-auto space-y-3 pt-8">
          <button
            onClick={() => router.push('/auth/signup')}
            className="w-full py-1 text-sm font-medium text-primary transition-colors"
          >
            바로 가입하기 →
          </button>
          <button
            onClick={() => router.push('/our-philosophy')}
            className="w-full py-1 text-sm text-text-secondary transition-colors"
          >
            인지 왜곡이 왜 중요한가요? →
          </button>
          <button
            onClick={() => router.push('/install')}
            className="mx-auto flex items-center justify-center gap-1.5 text-xs text-text-tertiary transition-colors hover:text-primary"
          >
            <ExternalLink size={11} />
            홈 화면에 추가하고 연속 기록을 시작하세요
          </button>
          {/* 법적 문서 (lint-copy 예외 영역) */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 pt-2 text-xs text-text-tertiary">
            <a href="/disclaimer" className="py-2 underline-offset-2 hover:text-text-secondary hover:underline">
              면책 안내
            </a>
            <span aria-hidden>·</span>
            <a href="/terms" className="py-2 underline-offset-2 hover:text-text-secondary hover:underline">
              이용약관
            </a>
            <span aria-hidden>·</span>
            <a href="/privacy" className="py-2 underline-offset-2 hover:text-text-secondary hover:underline">
              개인정보 처리방침
            </a>
            <span aria-hidden>·</span>
            <a href="/safety/resources" className="py-2 underline-offset-2 hover:text-text-secondary hover:underline">
              정신건강 자원
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
