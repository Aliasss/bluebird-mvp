'use client';

import { useRouter } from 'next/navigation';

const SECTIONS = [
  {
    number: '01',
    title: '내가 태어난 바다, 내가 잡은 키',
    subtitle: '30:70의 조화',
    body: [
      '어떤 이는 잔잔한 호수 같은 바다에서 태어나고, 어떤 이는 파도가 거친 바다에서 태어납니다. 불안에 대한 유전적 기여도는 연구에 따라 30~60%로 추정됩니다. 이건 우리가 선택할 수 없는 영역입니다.',
      '하지만 그 바다 위에서 어떻게 키를 조절하고 돛을 올릴지는 오직 항해사인 당신의 손에 달려 있습니다. 인지적 반응 방식은 40~70%까지 훈련으로 개선될 수 있습니다.',
      'Bluebird는 바다의 파도를 멈추려 하지 않습니다. 다만 어떤 파도 위에서도 중심을 잡는 숙련된 항해사가 되도록 돕습니다.',
    ],
    stat: { value: '30~60%', label: '불안의 유전적 기여도', source: 'NIH, 2025' },
  },
  {
    number: '02',
    title: '마음에 드리운 무거운 그림자',
    subtitle: '2.25배의 통증',
    body: [
      '왜 열 번의 칭찬보다 한 번의 비판에 밤잠을 설칠까요? 인간의 마음은 기쁨보다 슬픔을 2.25배 더 무겁게 느끼도록 설계되어 있습니다.',
      '누군가의 무심한 한 마디가 돌덩이처럼 느껴지는 건 당신의 마음이 약해서가 아닙니다. 우리 모두의 나침반에 새겨진 본능적인 설정값, 즉 손실 회피 본능 때문입니다.',
      'Bluebird는 이 무거운 그림자를 걷어내고 사건의 원래 무게를 측정할 수 있는 진실의 저울을 드립니다.',
    ],
    stat: { value: 'λ = 2.25', label: '손실 가중치 계수', source: 'Kahneman & Tversky, 1979' },
  },
  {
    number: '03',
    title: '번개처럼 스치는 불안, 별빛처럼 찾아오는 이성',
    subtitle: '0.01초 대 3초',
    body: [
      '"다 끝났어!"라는 불안은 번개처럼 짧고 강렬하게 찾아옵니다. 10ms라는 찰나의 순간에 감정은 이미 폭발해 버리죠.',
      '"정말 그럴까?"라는 이성의 목소리는 밤하늘의 별빛처럼 천천히 고요하게 찾아옵니다. 이 별빛을 보려면 최소 3초의 침묵이 필요합니다.',
      'Bluebird는 번개에 눈이 멀지 않도록, 당신이 고요한 이성의 빛을 따라 항로를 찾을 수 있는 망원경이 되어줍니다.',
    ],
    stat: { value: '10ms → 3s', label: '감정 → 이성의 처리 속도', source: 'Kahneman (2011), LeDoux (1996)' },
  },
  {
    number: '04',
    title: '안개 속을 걷는 법',
    subtitle: '46%의 진실',
    body: [
      '사람들 사이에서 길을 잃은 것 같은 기분이 드시나요? 그 불안의 46%는 실제 상황이 아니라 당신의 나침반을 가린 짙은 안개, 즉 인지 왜곡 때문입니다.',
      '"사람들이 나를 싫어할 거야"라는 생각이 사회적 불안의 절반 가까이를 만들어냅니다. 특히 "최악의 일이 생길 거야"라는 파국화 왜곡이 이 안개를 가장 짙게 만드는 주범입니다.',
      '안개가 걷히면 당신이 가야 할 길은 생각보다 훨씬 가깝고 안전하다는 것을 알게 됩니다.',
    ],
    stat: { value: 'R² = .46', label: '인지 왜곡이 사회적 불안을 설명하는 비율', source: 'Khan et al. (2021), JPPS' },
  },
  {
    number: '05',
    title: '다시, 항해를 시작하는 당신에게',
    subtitle: '75%의 확신',
    body: [
      '이 항해법을 익힌 4명 중 3명은 더 이상 폭풍을 두려워하지 않게 되었습니다. 인지 재구성 훈련은 임상적으로 75%의 증상 완화율을 보입니다.',
      'Bluebird는 당신의 성격을 바꾸라고 하지 않습니다. 다만 당신의 나침반을 다시 정렬하고, 별빛을 보는 법을 훈련할 뿐입니다.',
    ],
    stat: { value: '약 75%', label: '인지 재구성 훈련의 증상 완화율', source: 'Frontiers in Psychology, 2024' },
  },
];

const CITATIONS = [
  { category: '유전적 기질', data: '불안 장애의 유전적 기여도 (30~60%)', source: 'NIH (PMC7237282), "A Major Role for Common Genetic Variation in Anxiety Disorders" (2025)' },
  { category: '손실 회피', data: '손실 가중치 계수 (λ ≈ 2.25)', source: 'Kahneman & Tversky (1979), "Prospect Theory: An Analysis of Decision under Risk"' },
  { category: '이중 프로세스', data: '감정(10ms)과 이성(3s)의 처리 속도', source: 'Daniel Kahneman (2011), "Thinking, Fast and Slow" / LeDoux (1996)' },
  { category: '사회적 불안', data: '인지 왜곡의 설명력 (R² = .46)', source: 'Khan, S., et al. (2021), "Cognitive Distortions and Social Interaction Anxiety", JPPS' },
  { category: '주의 증후군', data: 'CAS와 반추의 상관관계', source: 'Adrian Wells (2009), "Metacognitive Therapy for Anxiety and Depression"' },
  { category: '교정 효능', data: '인지 재구성의 증상 완화율 (약 75%)', source: 'Frontiers in Psychology (2024), Clinical Efficacy Meta-Analysis of CBT' },
];

export default function OurPhilosophyPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background">

      {/* 헤더 내비게이션 */}
      <header className="bg-white border-b border-background-tertiary">
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

      {/* 히어로 */}
      <section className="bg-gradient-to-b from-slate-900 via-primary-dark to-primary text-white">
        <div className="max-w-2xl mx-auto px-6 py-16 sm:py-24 text-center space-y-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-system2">
            Bluebird Philosophy
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
            당신의 마음,<br />
            <span className="text-system2">'길'을 잃은 것이 아니라</span><br />
            '나침반'이 흔들리는 것입니다
          </h1>
          <p className="text-base text-slate-300 leading-relaxed max-w-md mx-auto">
            배가 흔들리는 건 당신의 잘못이 아닙니다.<br />
            배 안에 놓인 나침반이 잠시 자성을 잃었을 뿐입니다.
          </p>
        </div>
      </section>

      {/* 섹션들 */}
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">

        {SECTIONS.map((section) => (
          <article key={section.number} className="bg-white border border-background-tertiary rounded-2xl overflow-hidden">
            {/* 섹션 헤더 */}
            <div className="px-6 pt-6 pb-4 border-b border-background-tertiary">
              <div className="flex items-start gap-4">
                <span className="text-xs font-bold text-system2 bg-system2 bg-opacity-10 px-2 py-1 rounded-md mt-0.5 flex-shrink-0">
                  {section.number}
                </span>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">{section.title}</h2>
                  <p className="text-sm text-text-tertiary mt-0.5">{section.subtitle}</p>
                </div>
              </div>
            </div>

            {/* 핵심 수치 */}
            <div className="px-6 py-4 bg-slate-900 flex items-center gap-4">
              <p className="text-2xl font-bold text-system2 flex-shrink-0">{section.stat.value}</p>
              <div>
                <p className="text-xs text-slate-300">{section.stat.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{section.stat.source}</p>
              </div>
            </div>

            {/* 본문 */}
            <div className="px-6 py-6 space-y-4">
              {section.body.map((paragraph, i) => (
                <p key={i} className="text-sm text-text-secondary leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        ))}

        {/* CTA */}
        <div className="bg-gradient-to-br from-primary-dark to-primary rounded-2xl p-8 text-white text-center space-y-4">
          <h3 className="text-xl font-bold">자, 이제 키를 잡아보시겠어요?</h3>
          <p className="text-sm text-blue-200 leading-relaxed">
            당신의 항해는 이제 막 시작되었습니다.<br />
            오늘 첫 번째 생각을 기록해보세요.
          </p>
          <button
            onClick={() => router.push('/auth/signup')}
            className="w-full bg-white text-primary font-semibold py-4 px-6 rounded-xl touch-manipulation active:scale-95 transition-transform"
          >
            첫 번째 생각 기록하기
          </button>
          <button
            onClick={() => router.push('/auth/login')}
            className="text-sm text-blue-200 hover:text-white transition-colors"
          >
            이미 계정이 있어요
          </button>
        </div>

        {/* 출처 */}
        <div className="border border-background-tertiary rounded-2xl p-6 space-y-4">
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

      </div>
    </main>
  );
}
