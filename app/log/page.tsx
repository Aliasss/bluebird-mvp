'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import PageHeader from '@/components/ui/PageHeader';

type Step = 'trigger' | 'thought' | 'pain';

const PAIN_OPTIONS = [
  { score: 1, emoji: '😐', label: '별로 안 힘들어요' },
  { score: 2, emoji: '😟', label: '조금 힘들어요' },
  { score: 3, emoji: '😰', label: '꽤 힘들어요' },
  { score: 4, emoji: '😱', label: '많이 힘들어요' },
  { score: 5, emoji: '🤯', label: '매우 힘들어요' },
];

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
            // 3단계: 고통 점수
            <>
              <div className="space-y-2">
                <h1 className="text-xl font-bold text-text-primary tracking-tight">
                  지금 얼마나 힘드세요?
                </h1>
                <p className="text-sm text-text-secondary">
                  솔직하게 체크해주세요. 분석에 활용돼요.
                </p>
              </div>

              <div className="space-y-3">
                {PAIN_OPTIONS.map((option) => (
                  <button
                    key={option.score}
                    onClick={() => setPainScore(option.score)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      painScore === option.score
                        ? 'border-primary bg-primary/5'
                        : 'border-background-tertiary bg-white'
                    }`}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <div>
                      <p className={`text-sm font-semibold ${painScore === option.score ? 'text-primary' : 'text-text-primary'}`}>
                        {option.label}
                      </p>
                      <p className="text-xs text-text-tertiary">{option.score}점</p>
                    </div>
                  </button>
                ))}
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
