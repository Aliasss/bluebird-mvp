'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import PageHeader from '@/components/ui/PageHeader';

type Step = 'trigger' | 'thought' | 'pain';

// NRS-11 (Hawker et al., 2011) — 0=전혀 없음, 10=참을 수 없는 통증.
// 5점 척도(1~5)에서 0~10 정수 척도로 전환 (마이그레이션 13).
function painBandLabel(score: number): string {
  if (score <= 2) return '거의 없음';
  if (score <= 4) return '약간';
  if (score <= 6) return '보통';
  if (score <= 8) return '심함';
  return '극심';
}

export default function LogPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('trigger');
  const [trigger, setTrigger] = useState('');
  const [thought, setThought] = useState('');
  const [painScore, setPainScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTriggerNext = () => {
    if (trigger.trim().length < 5) {
      setError('5자 이상 적어주세요.');
      return;
    }
    setError(null);
    setStep('thought');
  };

  const handleThoughtNext = () => {
    if (thought.trim().length < 10) {
      setError('10자 이상 적어주세요.');
      return;
    }
    setError(null);
    setStep('pain');
  };

  const handleSubmit = async (selectedScore: number | null) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data, error: insertError } = await supabase
        .from('logs')
        .insert({
          user_id: user.id,
          trigger: trigger.trim(),
          thought: thought.trim(),
          ...(selectedScore !== null ? { pain_score: selectedScore } : {}),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        router.push(`/analyze/${data.id}`);
      }
    } catch (err: any) {
      console.error('로그 저장 실패:', err);
      setError(err.message || '저장하지 못했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'pain') {
      setStep('thought');
      setError(null);
    } else if (step === 'thought') {
      setStep('trigger');
      setError(null);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <PageHeader
        title="생각 기록"
        onBack={handleBack}
        step={{ current: step === 'trigger' ? 1 : step === 'thought' ? 2 : 3, total: 3 }}
      />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
          {step === 'trigger' ? (
            // 1단계: 트리거 입력
            <>
              <div className="space-y-2">
                <h1 className="text-xl md:text-2xl font-bold text-text-primary">
                  무슨 일이 있었나요?
                </h1>
                <p className="text-text-secondary">
                  어떤 일이 있었는지 적어주세요. 구체적일수록 더 잘 분석돼요.
                </p>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-background-tertiary shadow-none sm:shadow-sm">
                <textarea
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  placeholder="예: 팀장이 내 보고서에 피드백을 주지 않았다"
                  aria-label="오늘 있었던 사건을 입력하세요"
                  className="w-full h-40 p-4 border border-background-tertiary rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={loading}
                  autoFocus
                />
                <div className="mt-2 text-right">
                  <span className="text-xs md:text-sm text-text-secondary">
                    {trigger.length}자
                  </span>
                </div>
              </div>

              {/* 예시 */}
              <div className="bg-background-secondary rounded-xl p-4">
                <p className="text-xs md:text-sm font-medium text-text-primary mb-2">
                  💡 트리거 예시
                </p>
                <ul className="space-y-1 text-xs md:text-sm text-text-secondary">
                  <li>• 친구가 내 메시지를 6시간 동안 읽씹했다</li>
                  <li>• 프로젝트 마감이 3일 남았는데 30%밖에 진행하지 못했다</li>
                  <li>• 중요한 발표에서 실수를 했다</li>
                </ul>
              </div>

              {error && (
                <div className="bg-danger bg-opacity-10 border border-danger rounded-xl p-4">
                  <p className="text-xs md:text-sm text-danger">{error}</p>
                </div>
              )}

              <button
                onClick={handleTriggerNext}
                disabled={loading || trigger.length < 5}
                className="w-full bg-primary text-white font-semibold py-4 px-6 rounded-2xl touch-manipulation active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </>
          ) : step === 'thought' ? (
            // 2단계: 자동 사고 입력
            <>
              <div className="space-y-2">
                <h1 className="text-xl md:text-2xl font-bold text-text-primary">
                  어떤 생각이 들었나요?
                </h1>
                <p className="text-sm text-text-secondary">
                  그 순간 자동으로 떠오른 생각을 적어주세요.
                </p>
              </div>

              {/* 트리거 요약 */}
              <div className="bg-background-secondary rounded-xl p-4">
                <p className="text-[10px] md:text-xs font-medium text-text-secondary mb-1">
                  트리거
                </p>
                <p className="text-xs md:text-sm text-text-primary">
                  {trigger}
                </p>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-background-tertiary shadow-none sm:shadow-sm">
                <textarea
                  value={thought}
                  onChange={(e) => setThought(e.target.value)}
                  placeholder="예: 내가 일을 못하니까 무시하는 거겠지. 앞으로도 이럴 거야"
                  aria-label="그 순간 떠오른 생각을 입력하세요"
                  className="w-full h-40 p-4 border border-background-tertiary rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={loading}
                  autoFocus
                />
                <div className="mt-2 text-right">
                  <span className="text-xs md:text-sm text-text-secondary">
                    {thought.length}자
                  </span>
                </div>
              </div>

              {/* 예시 */}
              <div className="bg-background-secondary rounded-xl p-4">
                <p className="text-xs md:text-sm font-medium text-text-primary mb-2">
                  💡 자동 사고 예시
                </p>
                <ul className="space-y-1 text-xs md:text-sm text-text-secondary">
                  <li>• 친구가 나를 싫어하는 게 분명하다</li>
                  <li>• 이번에도 실패할 것이다. 나는 항상 실패한다</li>
                  <li>• 모두가 내 실수를 기억하고 나를 무시할 것이다</li>
                </ul>
              </div>

              {error && (
                <div className="bg-danger bg-opacity-10 border border-danger rounded-xl p-4">
                  <p className="text-xs md:text-sm text-danger">{error}</p>
                </div>
              )}

              <button
                onClick={handleThoughtNext}
                disabled={loading || thought.length < 10}
                className="w-full bg-primary text-white font-semibold py-4 px-6 rounded-2xl touch-manipulation active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </>
          ) : (
            // 3단계: 고통 강도 (NRS-11, 0~10)
            <>
              <div className="space-y-2">
                <h1 className="text-xl font-bold text-text-primary tracking-tight">
                  지금 고통 강도는 얼마인가요?
                </h1>
                <p className="text-sm text-text-secondary">
                  0(전혀 없음) ~ 10(참을 수 없는) 사이에서 솔직하게 골라주세요. 재평가 시 차이값(Δpain)으로 사용됩니다.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-background-tertiary p-5 space-y-5">
                <div className="text-center">
                  <p className="text-5xl font-extrabold text-primary tabular-nums">
                    {painScore ?? '–'}
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {painScore !== null ? painBandLabel(painScore) : '값을 선택하세요'}
                  </p>
                </div>

                <div className="grid grid-cols-11 gap-1">
                  {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPainScore(n)}
                      aria-pressed={painScore === n}
                      aria-label={`고통 ${n}점`}
                      className={`aspect-square text-sm font-semibold rounded-lg border transition ${
                        painScore === n
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-text-primary border-background-tertiary hover:border-primary/50'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between text-[11px] text-text-tertiary">
                  <span>0 · 전혀 없음</span>
                  <span>10 · 참을 수 없는</span>
                </div>
              </div>

              {error && (
                <div className="bg-danger bg-opacity-10 border border-danger rounded-xl p-4">
                  <p className="text-xs md:text-sm text-danger">{error}</p>
                </div>
              )}

              <button
                onClick={() => handleSubmit(painScore)}
                disabled={loading || painScore === null}
                className="w-full bg-primary text-white font-semibold py-4 px-6 rounded-2xl touch-manipulation active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '저장하고 있어요...' : '분석 시작하기'}
              </button>
              <button
                onClick={() => handleSubmit(null)}
                disabled={loading}
                className="w-full text-text-tertiary text-sm py-2"
              >
                건너뛰기
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
