'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import { supabase } from '@/lib/supabase/client';

type Checkin = {
  id: string;
  type: 'morning' | 'evening';
  mood_word: string | null;
  system2_moment: string | null;
  created_at: string;
};

const KST_OFFSET = 9 * 60 * 60 * 1000;

function toKstDateLabel(iso: string): string {
  const kst = new Date(new Date(iso).getTime() + KST_OFFSET);
  const y = kst.getUTCFullYear();
  const m = kst.getUTCMonth() + 1;
  const d = kst.getUTCDate();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const day = days[kst.getUTCDay()];
  return `${y}년 ${m}월 ${d}일 (${day})`;
}

function toKstDateKey(iso: string): string {
  const kst = new Date(new Date(iso).getTime() + KST_OFFSET);
  return kst.toISOString().slice(0, 10);
}

export default function CheckinHistoryPage() {
  const router = useRouter();
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCheckins = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data } = await supabase
        .from('checkins')
        .select('id, type, mood_word, system2_moment, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setCheckins((data || []) as Checkin[]);
      setLoading(false);
    };

    fetchCheckins();
  }, [router]);

  // 날짜별로 그룹핑
  const grouped = checkins.reduce<Record<string, Checkin[]>>((acc, item) => {
    const key = toKstDateKey(item.created_at);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
  const groupedKeys = Object.keys(grouped).sort((a, b) => (a > b ? -1 : 1));

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <PageHeader title="체크인 기록" onBack={() => router.push('/dashboard')} />
      <div className="flex-1 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          {checkins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-sm font-semibold text-text-primary mb-1">아직 체크인 기록이 없어요</p>
              <p className="text-xs text-text-secondary mb-6">매일 체크인하면 연속 기록이 유지됩니다.</p>
              <button
                onClick={() => router.push('/checkin')}
                className="bg-primary text-white font-semibold py-3 px-8 rounded-2xl touch-manipulation active:scale-95 transition-transform"
              >
                첫 체크인 하기
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedKeys.map((dateKey) => (
                <div key={dateKey}>
                  <p className="text-xs font-semibold text-text-tertiary mb-2">
                    {toKstDateLabel(grouped[dateKey][0].created_at)}
                  </p>
                  <div className="space-y-2">
                    {grouped[dateKey].map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl border border-background-tertiary p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base">{item.type === 'morning' ? '🌅' : '🌙'}</span>
                          <span className="text-xs font-semibold text-text-primary">
                            {item.type === 'morning' ? '모닝 체크인' : '이브닝 체크인'}
                          </span>
                        </div>
                        {item.type === 'morning' && item.mood_word && (
                          <p className="text-sm text-text-secondary">
                            오늘의 기분: <span className="font-medium text-primary">{item.mood_word}</span>
                          </p>
                        )}
                        {item.type === 'evening' && item.system2_moment && (
                          <p className="text-sm text-text-secondary">{item.system2_moment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
