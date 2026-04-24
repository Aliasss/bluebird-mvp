'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ReviewFormProps {
  logId: string;
}

const SCORES = [1, 2, 3, 4, 5];

export function ReviewForm({ logId }: ReviewFormProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (selected == null || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/review/pain-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId, painScore: selected }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? '저장에 실패했어요.');
        setSubmitting(false);
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('네트워크 오류가 발생했어요.');
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-blue-900">고통 점수 (1 편함 ~ 5 힘듦)</h2>
        <p className="mt-1 text-xs text-blue-800">
          지금 이 문제를 다시 생각하면 얼마나 고통스러운가요?
        </p>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {SCORES.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setSelected(n)}
            className={`rounded-xl py-3 text-lg font-semibold border transition ${
              selected === n
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-blue-900 border-blue-200 hover:border-blue-400'
            }`}
            aria-pressed={selected === n}
          >
            {n}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="button"
        disabled={selected == null || submitting}
        onClick={handleSubmit}
        className="w-full rounded-xl bg-blue-900 py-3 text-sm font-semibold text-white disabled:bg-gray-300"
      >
        {submitting ? '저장 중…' : '저장하기'}
      </button>
    </section>
  );
}
