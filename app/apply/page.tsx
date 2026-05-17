import type { Metadata } from 'next';
import Link from 'next/link';
import ApplyForm from '@/components/apply/ApplyForm';
import { SERVICE_CONTACT_EMAIL, buildMailto } from '@/lib/copy/contact';

// 폐쇄 베타 응모 페이지 — 2026-05-17.
// 사용자 결정: 비선정자는 서비스 진입 자체 차단 → /me 통합 폼 제거 + 외부 접근 가능한 /apply 페이지 신설.
// Migration 18: anon INSERT 허용 + auth.users 가입 화이트리스트 트리거.

export const metadata: Metadata = {
  title: '에반젤리스트(MVP 체험자) 응모 | BlueBird',
  description:
    'BlueBird MVP를 2주간 사용하고 서면 리포트로 통찰을 공유해주실 30명을 모집합니다. 단순 베타 테스터가 아니라 서비스 방향을 함께 정의하는 공동 설계자.',
};

export default function ApplyPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-white border-b border-background-tertiary">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary tracking-tight">
            Project Bluebird
          </Link>
          <span className="text-xs text-text-tertiary">폐쇄 베타 응모</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Closed Beta</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            에반젤리스트(MVP 체험자) 모집
          </h1>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            BlueBird MVP를 2주간 사용하고 서면 리포트로 통찰을 공유해주실 30명을 모집합니다.
            단순 베타 테스터가 아니라 서비스 방향을 함께 정의하는 공동 설계자입니다.
          </p>
        </section>

        <section className="bg-white border border-background-tertiary rounded-2xl p-5 space-y-3">
          <h2 className="text-sm font-bold text-text-primary">진행 흐름</h2>
          <ol className="text-sm text-text-secondary space-y-2 list-decimal pl-5">
            <li>아래 폼 작성 — 5~8분 (Q1~Q5 + 연령 + 동의 3개)</li>
            <li>운영자 검토 — 선발/미선발 결과를 입력하신 이메일로 안내</li>
            <li>
              <strong>선발자만</strong> 가입 안내 메일 수신 후 BlueBird 가입 → 2주 사용 + 서면 리포트 작성
            </li>
          </ol>
          <p className="text-xs text-text-tertiary leading-snug">
            ※ 현재 BlueBird MVP는 <strong>폐쇄 베타</strong>로 운영됩니다. 선발 전에는 가입이 차단되며,
            선발 결과는 응모 시 입력하신 이메일로만 안내드립니다.
          </p>
        </section>

        <ApplyForm />

        <section className="text-xs text-text-tertiary space-y-2 pt-4 border-t border-background-tertiary">
          <p>
            ※ 본 응모에서 <strong>직무·소속·연봉·진단명은 수집하지 않습니다.</strong>
          </p>
          <p>
            ※ 응답·서면 리포트는 분석 외 사용하지 않으며, 30일 후 원본 데이터를 폐기하고 코딩 결과만 보존합니다.
          </p>
          <p>
            위기 상황 시: 자살예방상담전화 <strong>1393</strong> · 정신건강위기상담{' '}
            <strong>1577-0199</strong>
          </p>
          <p>
            응모 관련 문의:{' '}
            <a
              href={buildMailto('[BlueBird] 에반젤리스트 응모 문의')}
              className="text-primary underline"
            >
              {SERVICE_CONTACT_EMAIL}
            </a>
          </p>
          <p className="flex flex-wrap gap-x-3 gap-y-1 pt-2">
            <Link href="/terms" className="hover:text-text-secondary underline-offset-2 hover:underline">
              이용약관
            </Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-text-secondary underline-offset-2 hover:underline">
              개인정보 처리방침
            </Link>
            <span>·</span>
            <Link href="/disclaimer" className="hover:text-text-secondary underline-offset-2 hover:underline">
              면책 안내
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
