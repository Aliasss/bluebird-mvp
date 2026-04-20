'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';

const MOOD_OPTIONS = [
  { word: '집중', emoji: '🎯' },
  { word: '평온', emoji: '😌' },
  { word: '활기', emoji: '⚡' },
  { word: '불안', emoji: '😟' },
  { word: '피곤', emoji: '😪' },
  { word: '의욕', emoji: '💪' },
  { word: '호기심', emoji: '🤔' },
];

function getCheckinType(): 'morning' | 'evening' {
  // KST 시각: UTC + 9
  const kstHour = (new Date().getUTCHours() + 9) % 24;
  return kstHour >= 5 && kstHour < 13 ? 'morning' : 'evening';
}

export default function CheckinPage() {
  const router = useRouter();
  const [type, setType] = useState<'morning' | 'evening'>('morning');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moment, setMoment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setType(getCheckinType());
  }, []);

  const handleSubmit = async () => {
    if (type === 'morning' && !selectedMood) {
      setError('기분을 선택해주세요.');
      return;
    }
    if (type === 'evening' && moment.trim().length < 1) {
      setError('한 줄이라도 적어주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          moodWord: selectedMood ?? undefined,
          system2Moment: moment.trim() || undefined,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        if (payload.alreadyDone) {
          router.push('/dashboard?checkin=done');
          return;
        }
        throw new Error(payload.error || '저장에 실패했습니다.');
      }
      router.push('/dashboard?checkin=1');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <PageHeader
        title={type === 'morning' ? '모닝 체크인' : '이브닝 체크인'}
        onBack={() => router.push('/dashboard')}
      />
      <div className="flex-1 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {type === 'morning' ? (
            <>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-text-primary mb-1">
                  오늘 나침반은 어디를 향하나요?
                </h1>
                <p className="text-sm text-text-secondary">오늘 하루를 시작하는 마음 태도를 선택하세요.</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {MOOD_OPTIONS.map(({ word, emoji }) => (
                  <button
                    key={word}
                    onClick={() => setSelectedMood(word)}
                    className={`flex flex-col items-center gap-1 p-4 rounded-2xl border-2 transition-all touch-manipulation active:scale-95 ${
                      selectedMood === word
                        ? 'border-primary bg-primary bg-opacity-10'
                        : 'border-background-tertiary bg-white'
                    }`}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className={`text-xs font-semibold ${selectedMood === word ? 'text-primary' : 'text-text-secondary'}`}>
                      {word}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-text-primary mb-1">
                  오늘 시스템 2를 켠 순간이 있었나요?
                </h1>
                <p className="text-sm text-text-secondary">이성적으로 생각한 짧은 순간을 기록해보세요. 10초면 됩니다.</p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-background-tertiary">
                <textarea
                  value={moment}
                  onChange={(e) => setMoment(e.target.value)}
                  placeholder="예: 지각할 것 같아 불안했지만, 내가 통제할 수 없는 일임을 인정했다"
                  className="w-full h-32 p-3 border border-background-tertiary rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  disabled={loading}
                  autoFocus
                />
                <div className="mt-1 text-right text-xs text-text-secondary">{moment.length}자</div>
              </div>
            </>
          )}

          {error && (
            <div className="bg-danger bg-opacity-10 border border-danger rounded-xl p-3">
              <p className="text-xs text-danger">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || (type === 'morning' && !selectedMood) || (type === 'evening' && !moment.trim())}
            className="w-full bg-primary text-white font-semibold py-4 px-6 rounded-2xl touch-manipulation active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? '저장 중...' : '체크인 완료'}
          </button>

          <p className="text-center text-xs text-text-tertiary">
            {type === 'morning'
              ? '저녁 체크인은 오늘 저녁에 이어서 할 수 있어요'
              : '아침 체크인은 내일 아침에 시작해요'}
          </p>
        </div>
      </div>
    </main>
  );
}
