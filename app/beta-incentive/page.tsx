import Link from 'next/link';

/**
 * 베타 인터뷰 완주자 혜택 안내 페이지.
 *
 * 근거:
 *   - docs/im1/legal-review-2026-05-04.md §4 — Critical 1건 해결책 ((E2)+(F) 약속의
 *     *무효 조건* 명시 + 약관 surface 위치 결정)
 *   - CEO 결정 (E2)+(F) — 돈 지불 0, 서비스 혜택만 (2026-05-03)
 *   - 모집 공고 surface 정책: (β') — 본문에는 1줄 + 자세히 보기 링크, 본 페이지에 약속 본문 + 무효 조건 4종 surface
 *
 * 톤 가드:
 *   - 정서·치유·동반 어휘 0 (본질 위협 #1·#6)
 *   - 의료기기 함의 0 (본질 위협 #4)
 *   - 강한 단정 어휘 0 (legal-review §4.3 어휘 금지 list — 영구·무조건·필수 류)
 *   - 카피 변경 X — 임무 description 그대로
 */

export const metadata = {
  title: '베타 인터뷰 완주자 혜택 안내 | BlueBird',
  description: 'BlueBird 베타 인터뷰를 완주하신 분께 제공하는 두 가지 서비스 혜택 안내.',
};

export default function BetaIncentivePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white border-b border-background-tertiary">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary tracking-tight">
            Project Bluebird
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        {/* 타이틀 */}
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Beta Incentive
          </p>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            베타 인터뷰 완주자 혜택 안내
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            BlueBird는 사고를 디버깅하는 도구입니다. 베타 단계에서는 결제 인프라가 활성화되지 않았으며, 본 인터뷰는 PMF(Product-Market Fit) 검증을 위해 진행됩니다.
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">
            베타 인터뷰를 완주하신 분께 다음 두 가지 혜택을 제공합니다.
          </p>
        </section>

        {/* 혜택 1 */}
        <article className="bg-white rounded-2xl border border-background-tertiary p-6 space-y-3">
          <h2 className="text-lg font-bold text-text-primary tracking-tight">
            혜택 1. 결제 활성화 후 6개월 무상 사용권
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            BlueBird 결제 인프라가 활성화되는 시점에 베타 인터뷰 완주자에게 6개월간 무상 사용권을 제공합니다.
          </p>
        </article>

        {/* 혜택 2 */}
        <article className="bg-white rounded-2xl border border-background-tertiary p-6 space-y-3">
          <h2 className="text-lg font-bold text-text-primary tracking-tight">
            혜택 2. 매뉴얼 v1.0 우선 제공
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            매뉴얼 v1.0은 60일 게이트(G2) 통과 후 출시되는 산출물입니다. 베타 인터뷰 완주자에게 정식 출시 시점에 우선 제공됩니다.
          </p>
        </article>

        {/* 약속 무효 조건 */}
        <article className="bg-white rounded-2xl border border-background-tertiary p-6 space-y-3">
          <h2 className="text-lg font-bold text-text-primary tracking-tight">
            약속 무효 조건
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            다음의 경우 본 혜택 약속은 효력을 잃습니다.
          </p>
          <ul className="text-sm text-text-secondary leading-relaxed space-y-1.5 list-none pl-0">
            <li>(a) BlueBird 서비스 운영 중단</li>
            <li>(b) 운영자 결정에 의한 서비스 종료</li>
            <li>(c) 사용자의 약관 위반</li>
            <li>(d) 60일 게이트(G2) 미통과로 결제 인프라 미활성화</li>
          </ul>
        </article>

        {/* 인터뷰 완주의 정의 */}
        <article className="bg-white rounded-2xl border border-background-tertiary p-6 space-y-3">
          <h2 className="text-lg font-bold text-text-primary tracking-tight">
            인터뷰 완주의 정의
          </h2>
          <ul className="text-sm text-text-secondary leading-relaxed space-y-1.5 list-disc pl-5">
            <li>30분 이상 1:1 인터뷰 1회 완료</li>
            <li>사후 follow-up 답변 (2~3 메시지 이내)</li>
          </ul>
        </article>

        {/* 안내 */}
        <section className="rounded-2xl border border-background-tertiary bg-background-secondary p-6 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary">안내</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            본 안내는 정식 법률 자문을 대체하지 않습니다. 자세한 사항은{' '}
            <Link href="/terms" className="text-primary underline">
              이용약관
            </Link>
            ·
            <Link href="/privacy" className="text-primary underline">
              개인정보처리방침
            </Link>
            을 함께 확인하세요.
          </p>
          <p className="text-xs text-text-secondary leading-relaxed">
            문의: [TBD — CEO 결정 후 추가]
          </p>
        </section>

        <footer className="text-center pt-4 pb-12">
          <Link href="/" className="text-sm text-text-tertiary underline">
            홈으로
          </Link>
        </footer>
      </div>
    </main>
  );
}
