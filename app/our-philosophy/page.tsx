'use client';

import { useRouter } from 'next/navigation';

/**
 * BlueBird Philosophy 페이지 — manual 톤 1:1 정렬.
 *
 * design-realignment-v1.md §3 결정 ③:
 *   - manual 톤 (lib/content/technical-manual.ts:31-32 참조)
 *   - 통계 카드 grid 유지
 *   - gradient 전부 제거
 *   - 시적 비유·자연 메타포 0건
 *   - 한 섹션당 본문 1~2문장 + 통계 카드 1
 */

type Section = {
  number: string;
  title: string;
  subtitle: string;
  body: string;
  stat: { value: string; label: string; source: string };
};

const SECTIONS: Section[] = [
  {
    number: '01',
    title: '기질의 변동성',
    subtitle: '유전과 학습의 분포',
    body:
      '불안의 유전적 기여도는 30~60%로 보고됩니다. 나머지 40~70%는 인지적 반응 방식에 해당하며, 이 영역은 훈련 가능한 변수입니다. BlueBird는 후자에 개입합니다.',
    stat: { value: '30–60%', label: '불안 장애의 유전적 기여도', source: 'NIH (PMC7237282), 2025' },
  },
  {
    number: '02',
    title: '손실 회피 본능',
    subtitle: '비대칭 가중치',
    body:
      '인간의 의사결정 시스템은 동일한 크기의 손실을 동일한 크기의 이익보다 약 2.25배 더 무겁게 평가합니다. 부정적 사건이 과대 표상되는 이유는 의지의 결함이 아니라 진화적 가중치 함수의 결과입니다.',
    stat: { value: '약 2.25배', label: '손실 가중치 (이득 대비)', source: 'Kahneman & Tversky, 1979' },
  },
  {
    number: '03',
    title: '이중 프로세스의 시간차',
    subtitle: '직관과 분석의 처리 속도',
    body:
      '편도체 기반 정서 반응은 약 10ms에 작동하지만, 전전두 피질 기반 분석적 평가는 최소 3초 이상의 의도적 주의를 필요로 합니다. 이 시간 격차가 왜곡 발생의 구조적 원인입니다.',
    stat: { value: '10ms → 3s', label: '시스템 1 → 시스템 2 처리 시간', source: 'Kahneman (2011), LeDoux (1996)' },
  },
  {
    number: '04',
    title: '인지 왜곡의 설명력',
    subtitle: '사회적 불안의 분산 분해',
    body:
      '사회적 불안의 분산 중 약 46%가 인지 왜곡으로 설명됩니다. 특히 파국화·독심술·과잉일반화가 주요 기여 인자로 보고됩니다. 환경 변수보다 개인 내부의 추론 규칙이 더 큰 비중을 차지합니다.',
    stat: { value: 'R² = .46', label: '인지 왜곡의 사회적 불안 설명 비율', source: 'Khan et al. (2021), JPPS' },
  },
  {
    number: '05',
    title: '인지 재구성의 효과 크기',
    subtitle: '임상적 증상 완화율',
    body:
      '메타분석에서 인지 재구성 기반 개입의 임상적 증상 완화율은 약 75%로 보고됩니다. BlueBird는 성격 변화를 목표로 하지 않으며, 측정 가능한 사고 패턴의 변화를 단일 출력으로 정의합니다.',
    stat: { value: '약 75%', label: '인지 재구성 훈련의 증상 완화율', source: 'Frontiers in Psychology, 2024' },
  },
];

const CITATIONS = [
  { category: '유전적 기질', data: '불안 장애의 유전적 기여도 (30–60%)', source: 'NIH (PMC7237282), "A Major Role for Common Genetic Variation in Anxiety Disorders" (2025)' },
  { category: '손실 회피', data: '손실 가중치 약 2.25배', source: 'Kahneman & Tversky (1979), "Prospect Theory: An Analysis of Decision under Risk"' },
  { category: '이중 프로세스', data: '시스템 1(10ms)과 시스템 2(3s)의 처리 속도', source: 'Daniel Kahneman (2011), "Thinking, Fast and Slow" / LeDoux (1996)' },
  { category: '사회적 불안', data: '인지 왜곡의 설명력 (R² = .46)', source: 'Khan, S., et al. (2021), "Cognitive Distortions and Social Interaction Anxiety", JPPS' },
  { category: '주의 증후군', data: 'CAS와 반추의 상관관계', source: 'Adrian Wells (2009), "Metacognitive Therapy for Anxiety and Depression"' },
  { category: '재구성 효과', data: '인지 재구성의 증상 완화율 (약 75%)', source: 'Frontiers in Psychology (2024), Clinical Efficacy Meta-Analysis of CBT' },
];

export default function OurPhilosophyPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background">
      {/* 헤더 내비게이션 */}
      <header className="sticky top-0 z-40 bg-white border-b border-background-tertiary">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-xl font-bold text-primary"
          >
            Project Bluebird
          </button>
          <button
            onClick={() => router.push('/auth/signup')}
            className="text-sm font-semibold text-white bg-primary px-4 py-2 rounded-xl touch-manipulation active:scale-95 transition-transform"
          >
            시작하기
          </button>
        </div>
      </header>

      {/* 히어로 — gradient 제거, manual 톤 정렬 */}
      <section className="bg-white border-b border-background-tertiary">
        <div className="max-w-2xl mx-auto px-6 py-12 sm:py-16 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
            Bluebird Philosophy
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-text-primary tracking-tight">
            반복되는 사고 패턴은 의지의 문제가 아니라
            <br />
            <span className="text-primary">측정 가능한 인지 시스템의 출력</span>입니다.
          </h1>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            BlueBird는 사용자의 자동 사고를 인지 왜곡 분류 체계에 따라 구조화하고, 고통 변화량·완료율·재발 빈도를 시계열로 기록합니다. 본 페이지는 그 설계가 근거하는 다섯 가지 연구 결과를 요약합니다.
          </p>
        </div>
      </section>

      {/* 섹션들 */}
      <div className="max-w-2xl mx-auto px-6 py-10 sm:py-12 space-y-6">
        {SECTIONS.map((section) => (
          <article
            key={section.number}
            className="bg-white border border-background-tertiary rounded-2xl overflow-hidden"
          >
            {/* 섹션 헤더 */}
            <div className="px-6 pt-6 pb-4 border-b border-background-tertiary">
              <div className="flex items-start gap-4">
                <span className="text-xs font-bold text-primary bg-primary bg-opacity-5 px-2 py-1 rounded-md mt-0.5 flex-shrink-0">
                  {section.number}
                </span>
                <div>
                  <h2 className="text-lg font-bold text-text-primary tracking-tight">{section.title}</h2>
                  <p className="text-sm text-text-tertiary mt-0.5">{section.subtitle}</p>
                </div>
              </div>
            </div>

            {/* 통계 카드 grid — gradient 제거, 분석가 톤 */}
            <div className="px-6 py-5 bg-background-secondary border-b border-background-tertiary">
              <div className="flex items-baseline gap-4">
                <p className="text-2xl sm:text-3xl font-bold text-primary tracking-tight flex-shrink-0">
                  {section.stat.value}
                </p>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-text-secondary leading-tight">
                    {section.stat.label}
                  </p>
                  <p className="text-[11px] text-text-tertiary mt-0.5">{section.stat.source}</p>
                </div>
              </div>
            </div>

            {/* 본문 — 1~2 문장 */}
            <div className="px-6 py-5">
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                {section.body}
              </p>
            </div>
          </article>
        ))}

        {/* CTA — gradient 제거, 분석가 톤 */}
        <div className="bg-white border border-primary border-opacity-30 rounded-2xl p-6 sm:p-8 space-y-4">
          <h3 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
            첫 분석으로 자신의 인지 패턴을 측정해보세요
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            누적된 분석은 왜곡 빈도·고통 변화량 시계열·완료율로 정리되어 본인의 사고 운영 체계를 객관화하는 자료가 됩니다.
          </p>
          <div className="space-y-2 pt-2">
            <button
              onClick={() => router.push('/auth/signup')}
              className="w-full bg-primary text-white font-semibold py-4 px-6 rounded-xl touch-manipulation active:scale-95 transition-transform"
            >
              가입하기
            </button>
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full text-sm text-text-secondary hover:text-primary transition-colors py-2"
            >
              이미 계정이 있어요
            </button>
          </div>
        </div>

        {/* 출처 */}
        <div className="border border-background-tertiary rounded-2xl p-6 space-y-4 bg-white">
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">참고 문헌</p>
          <div className="space-y-3">
            {CITATIONS.map((c, i) => (
              <div key={i} className="space-y-0.5">
                <p className="text-xs font-medium text-text-primary">{c.category}</p>
                <p className="text-xs text-text-secondary">{c.data}</p>
                <p className="text-xs text-text-tertiary italic">{c.source}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 법적 공시 */}
        <section className="rounded-2xl border border-background-tertiary bg-background-secondary p-6 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary">BlueBird 이용 안내</h2>
          <ul className="text-xs text-text-secondary space-y-2 list-disc pl-4">
            <li>BlueBird는 의료·치료 서비스가 아닙니다. 진단·처방을 대체하지 않습니다.</li>
            <li>지속적·심각한 어려움이 있으시면 전문가(정신건강의학과, 심리상담)의 도움을 받으시길 권해드립니다.</li>
            <li>위기 상황에서는 자살예방상담전화 1393, 정신건강위기상담 1577-0199로 연락하실 수 있습니다.</li>
            <li>작성하시는 자동 사고·감정 데이터는 AI 분석을 위해 Google Gemini로 전송됩니다. 민감 정보 입력 시 이 점을 고려해주세요.</li>
          </ul>
          <a href="/safety/resources" className="inline-block text-xs text-primary underline">
            전체 자원 보기 →
          </a>
        </section>
      </div>
    </main>
  );
}
