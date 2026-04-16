'use client';

import Link from 'next/link';
import TheoryValueCurveChart from '@/components/charts/theory-value-curve-chart';
import {
  DISTORTION_GLOSSARY,
  DUAL_PROCESS_TABLE,
  PROSPECT_THEORY_TERMS,
  TECHNICAL_MANUAL_HEADER,
  TECHNICAL_MANUAL_SECTIONS,
} from '@/lib/content/technical-manual';

const SECTION_LINKS = [
  { id: 'intro', label: '개요', shortLabel: '개요' },
  { id: 'core-01', label: '[CORE-01] 이중 프로세스 시스템', shortLabel: '이중 프로세스' },
  { id: 'dyn-02', label: '[DYN-02] 전망이론과 가치 함수', shortLabel: '전망이론' },
  { id: 'dbug-03', label: '[DBUG-03] 인지 오류 Taxonomy', shortLabel: '인지 오류' },
  { id: 'goal-04', label: '[GOAL-04] 실존적 자율성', shortLabel: '실존적 자율성' },
] as const;

export default function ManualPage() {
  const coreSection = TECHNICAL_MANUAL_SECTIONS.find((section) => section.id === 'core-01');
  const dynSection = TECHNICAL_MANUAL_SECTIONS.find((section) => section.id === 'dyn-02');
  const dbugSection = TECHNICAL_MANUAL_SECTIONS.find((section) => section.id === 'dbug-03');
  const goalSection = TECHNICAL_MANUAL_SECTIONS.find((section) => section.id === 'goal-04');

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 sm:gap-8">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="bg-white border border-background-tertiary rounded-2xl p-4 space-y-3">
            <p className="text-xs text-text-secondary">Technical Manual Navigation</p>
            <nav className="space-y-2">
              {SECTION_LINKS.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block text-sm text-text-primary hover:text-primary transition-colors"
                >
                  <span className="lg:hidden">{item.shortLabel}</span>
                  <span className="hidden lg:inline">{item.label}</span>
                </a>
              ))}
            </nav>
            <div className="pt-3 border-t border-background-tertiary">
              <Link
                href="/dashboard"
                className="text-sm text-primary hover:underline"
              >
                대시보드로 돌아가기
              </Link>
            </div>
          </div>
        </aside>

        <div className="space-y-8">
          <section id="intro" className="bg-white rounded-2xl p-5 sm:p-8 border border-background-tertiary">
            <p className="text-xs uppercase tracking-wide text-text-secondary mb-3">Bluebird Knowledge Base</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-text-primary leading-tight mb-4">
              {TECHNICAL_MANUAL_HEADER.title}
            </h1>
            <p className="text-base text-text-secondary mb-3">
              {TECHNICAL_MANUAL_HEADER.subtitle}
            </p>
            <p className="text-sm text-text-secondary">
              Tone: {TECHNICAL_MANUAL_HEADER.tone}
            </p>
          </section>

          <section id="core-01" className="bg-white rounded-2xl p-5 sm:p-8 border border-background-tertiary space-y-5">
            <h2 className="text-xl sm:text-2xl font-semibold text-text-primary">{coreSection?.title}</h2>
            <p className="text-text-secondary leading-relaxed">{coreSection?.content}</p>
            <div className="overflow-x-auto rounded-xl border border-background-tertiary">
              <table className="min-w-full text-sm">
                <thead className="bg-background-secondary">
                  <tr>
                    <th className="px-4 py-3 text-left text-text-secondary font-medium">구분</th>
                    <th className="px-4 py-3 text-left text-text-secondary font-medium">특징</th>
                    <th className="px-4 py-3 text-left text-text-secondary font-medium">속도</th>
                    <th className="px-4 py-3 text-left text-text-secondary font-medium">에너지 소모</th>
                    <th className="px-4 py-3 text-left text-text-secondary font-medium">Bluebird 정의</th>
                  </tr>
                </thead>
                <tbody>
                  {DUAL_PROCESS_TABLE.map((row) => (
                    <tr key={row.name} className="border-t border-background-tertiary">
                      <td className="px-4 py-4 text-text-primary">{row.name}</td>
                      <td className="px-4 py-4 text-text-secondary">{row.trait}</td>
                      <td className="px-4 py-4 text-text-secondary">{row.speed}</td>
                      <td className="px-4 py-4 text-text-secondary">{row.energy}</td>
                      <td className="px-4 py-4 text-text-secondary">{row.bluebirdDefinition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="dyn-02" className="bg-white rounded-2xl p-5 sm:p-8 border border-background-tertiary space-y-5">
            <h2 className="text-xl sm:text-2xl font-semibold text-text-primary">{dynSection?.title}</h2>
            <p className="text-text-secondary leading-relaxed">{dynSection?.content}</p>
            <div className="bg-background-secondary rounded-xl p-5">
              <p className="text-sm text-text-secondary mb-3">Prospect Theory Value Function (S-Curve Simulation)</p>
              <TheoryValueCurveChart />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PROSPECT_THEORY_TERMS.map((term) => (
                <article key={term.term} className="rounded-xl border border-background-tertiary p-4 space-y-2">
                  <h3 className="text-text-primary font-medium">{term.term}</h3>
                  <p className="text-sm text-text-secondary">{term.definition}</p>
                  <p className="text-sm text-text-secondary">{term.mechanism}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="dbug-03" className="bg-white rounded-2xl p-5 sm:p-8 border border-background-tertiary space-y-5">
            <h2 className="text-xl sm:text-2xl font-semibold text-text-primary">{dbugSection?.title}</h2>
            <p className="text-text-secondary leading-relaxed">{dbugSection?.content}</p>
            <div className="space-y-3">
              {DISTORTION_GLOSSARY.map((item, index) => (
                <article key={item.term} className="rounded-xl border border-background-tertiary p-5">
                  <p className="text-xs text-text-secondary mb-2">ITEM {index + 1}</p>
                  <h3 className="text-lg text-text-primary mb-2">{item.term}</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-text-secondary">
                      기술적 정의: {item.technicalDefinition}
                    </p>
                    <p className="text-text-secondary">
                      Bluebird 분석: {item.bluebirdAnalysis}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="goal-04" className="bg-white rounded-2xl p-5 sm:p-8 border border-background-tertiary space-y-5">
            <h2 className="text-xl sm:text-2xl font-semibold text-text-primary">{goalSection?.title}</h2>
            <p className="text-text-secondary leading-relaxed">{goalSection?.content}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
