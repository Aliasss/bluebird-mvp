'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';

type Step = 'situation' | 'action';

export default function SuccessLogPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('situation');
  const [situation, setSituation] = useState('');
  const [system2Action, setSystem2Action] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSituationNext = () => {
    if (situation.trim().length < 5) {
      setError('상황은 최소 5자 이상 입력해주세요.');
      return;
    }
    setError(null);
    setStep('action');
  };

  const handleSubmit = async () => {
    if (system2Action.trim().length < 10) {
      setError('대처 방법은 최소 10자 이상 입력해주세요.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/success-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation: situation.trim(), system2Action: system2Action.trim() }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || '저장에 실패했습니다.');
      router.push('/dashboard?success=1');
    } catch (err: any) {
      setError(err.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'action') {
      setStep('situation');
      setError(null);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <PageHeader
        title="성공 순간 기록"
        onBack={handleBack}
        step={{ current: step === 'situation' ? 1 : 2, total: 2 }}
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
          {step === 'situation' ? (
            <>
              <div className="space-y-2">
                <h1 className="text-xl md:text-2xl font-bold text-text-primary">
                  어떤 상황이었나요?
                </h1>
                <p className="text-sm text-text-secondary">
                  왜곡된 사고로 빠질 수 있었던 상황을 설명해주세요.
                </p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-background-tertiary">
                <textarea
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  placeholder="예: 발표에서 말이 조금 꼬였을 때"
                  className="w-full h-40 p-4 border border-background-tertiary rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loading}
                  autoFocus
                />
                <div className="mt-2 text-right text-xs text-text-secondary">{situation.length}자</div>
              </div>
              <div className="bg-background-secondary rounded-xl p-4">
                <p className="text-xs font-medium text-text-primary mb-2">💡 예시</p>
                <ul className="space-y-1 text-xs text-text-secondary">
                  <li>• 팀장이 내 보고서를 수정 없이 통과시켜 주지 않았을 때</li>
                  <li>• 친구가 약속 시간보다 30분 늦게 도착했을 때</li>
                  <li>• 내 아이디어가 회의에서 즉각 채택되지 않았을 때</li>
                </ul>
              </div>
              {error && (
                <div className="bg-danger bg-opacity-10 border border-danger rounded-xl p-4">
                  <p className="text-xs text-danger">{error}</p>
                </div>
              )}
              <button
                onClick={handleSituationNext}
                disabled={situation.length < 5}
                className="w-full bg-primary text-white font-semibold py-4 px-6 rounded-2xl touch-manipulation active:scale-95 transition-transform disabled:opacity-50"
              >
                다음
              </button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <h1 className="text-xl md:text-2xl font-bold text-text-primary">
                  어떻게 이성적으로 대처했나요?
                </h1>
                <p className="text-sm text-text-secondary">
                  시스템 2(이성)를 가동해 왜곡을 피한 방법을 적어주세요.
                </p>
              </div>
              <div className="bg-background-secondary rounded-xl p-4">
                <p className="text-[10px] font-medium text-text-secondary mb-1">상황</p>
                <p className="text-xs text-text-primary">{situation}</p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-background-tertiary">
                <textarea
                  value={system2Action}
                  onChange={(e) => setSystem2Action(e.target.value)}
                  placeholder="예: '한 번의 실수가 전체를 결정하지 않는다'고 스스로 상기했다"
                  className="w-full h-40 p-4 border border-background-tertiary rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loading}
                  autoFocus
                />
                <div className="mt-2 text-right text-xs text-text-secondary">{system2Action.length}자</div>
              </div>
              {error && (
                <div className="bg-danger bg-opacity-10 border border-danger rounded-xl p-4">
                  <p className="text-xs text-danger">{error}</p>
                </div>
              )}
              <button
                onClick={handleSubmit}
                disabled={loading || system2Action.length < 10}
                className="w-full bg-success text-white font-semibold py-4 px-6 rounded-2xl touch-manipulation active:scale-95 transition-transform disabled:opacity-50"
              >
                {loading ? '저장 중...' : '성공 순간 저장하기 (+15점)'}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
