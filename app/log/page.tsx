'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

type Step = 'trigger' | 'thought';

export default function LogPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('trigger');
  const [trigger, setTrigger] = useState('');
  const [thought, setThought] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTriggerNext = () => {
    if (trigger.trim().length < 5) {
      setError('트리거는 최소 5자 이상 입력해주세요.');
      return;
    }
    setError(null);
    setStep('thought');
  };

  const handleSubmit = async () => {
    if (thought.trim().length < 10) {
      setError('자동 사고는 최소 10자 이상 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 현재 사용자 확인
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // logs 테이블에 저장
      const { data, error: insertError } = await supabase
        .from('logs')
        .insert({
          user_id: user.id,
          trigger: trigger.trim(),
          thought: thought.trim(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 저장 성공 시 분석 페이지로 이동
      if (data) {
        router.push(`/analyze/${data.id}`);
      }
    } catch (err: any) {
      console.error('로그 저장 실패:', err);
      setError(err.message || '저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'thought') {
      setStep('trigger');
      setError(null);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b border-background-tertiary px-6 py-4 flex items-center">
        <button
          onClick={handleBack}
          className="text-primary font-semibold"
          disabled={loading}
        >
          ← 뒤로
        </button>
        <div className="flex-1 text-center">
          <p className="text-sm text-text-secondary">
            {step === 'trigger' ? '1/2 단계' : '2/2 단계'}
          </p>
        </div>
        <div className="w-16"></div>
      </header>

      {/* 진행 바 */}
      <div className="bg-background-secondary h-1">
        <div
          className="bg-primary h-full transition-all duration-300"
          style={{ width: step === 'trigger' ? '50%' : '100%' }}
        ></div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {step === 'trigger' ? (
            // 1단계: 트리거 입력
            <>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-text-primary">
                  무슨 일이 있었나요?
                </h1>
                <p className="text-text-secondary">
                  트리거(사건)를 입력해주세요. 구체적일수록 좋습니다.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <textarea
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  placeholder="예: 상사가 회의에서 내 의견을 무시했다"
                  className="w-full h-40 p-4 border border-background-tertiary rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={loading}
                  autoFocus
                />
                <div className="mt-2 text-right">
                  <span className="text-sm text-text-secondary">
                    {trigger.length}자
                  </span>
                </div>
              </div>

              {/* 예시 */}
              <div className="bg-background-secondary rounded-xl p-4">
                <p className="text-sm font-medium text-text-primary mb-2">
                  💡 트리거 예시
                </p>
                <ul className="space-y-1 text-sm text-text-secondary">
                  <li>• 친구가 내 메시지를 6시간 동안 읽씹했다</li>
                  <li>• 프로젝트 마감이 3일 남았는데 30%밖에 진행하지 못했다</li>
                  <li>• 중요한 발표에서 실수를 했다</li>
                </ul>
              </div>

              {error && (
                <div className="bg-danger bg-opacity-10 border border-danger rounded-xl p-4">
                  <p className="text-sm text-danger">{error}</p>
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
          ) : (
            // 2단계: 자동 사고 입력
            <>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-text-primary">
                  어떤 생각이 들었나요?
                </h1>
                <p className="text-text-secondary">
                  그 순간 자동으로 떠오른 생각을 적어주세요.
                </p>
              </div>

              {/* 트리거 요약 */}
              <div className="bg-background-secondary rounded-xl p-4">
                <p className="text-xs font-medium text-text-secondary mb-1">
                  트리거
                </p>
                <p className="text-sm text-text-primary">
                  {trigger}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <textarea
                  value={thought}
                  onChange={(e) => setThought(e.target.value)}
                  placeholder="예: 나는 무능하고 아무도 내 의견을 중요하게 생각하지 않는다"
                  className="w-full h-40 p-4 border border-background-tertiary rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={loading}
                  autoFocus
                />
                <div className="mt-2 text-right">
                  <span className="text-sm text-text-secondary">
                    {thought.length}자
                  </span>
                </div>
              </div>

              {/* 예시 */}
              <div className="bg-background-secondary rounded-xl p-4">
                <p className="text-sm font-medium text-text-primary mb-2">
                  💡 자동 사고 예시
                </p>
                <ul className="space-y-1 text-sm text-text-secondary">
                  <li>• 친구가 나를 싫어하는 게 분명하다</li>
                  <li>• 이번에도 실패할 것이다. 나는 항상 실패한다</li>
                  <li>• 모두가 내 실수를 기억하고 나를 무시할 것이다</li>
                </ul>
              </div>

              {error && (
                <div className="bg-danger bg-opacity-10 border border-danger rounded-xl p-4">
                  <p className="text-sm text-danger">{error}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || thought.length < 10}
                className="w-full bg-primary text-white font-semibold py-4 px-6 rounded-2xl touch-manipulation active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '분석 중...' : '분석 시작'}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
