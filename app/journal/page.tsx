'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import BottomTabBar from '@/components/ui/BottomTabBar';
import type { Log } from '@/types';

type LogWithType = Log & { log_type?: string | null };

type RecentActionItem = {
  id: string;
  log_id: string;
  final_action: string | null;
  is_completed: boolean;
  autonomy_score: number | null;
  created_at: string;
  logs?: { trigger?: string; log_type?: string | null } | null;
};

type Tab = 'logs' | 'actions';

export default function JournalPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('logs');
  const [logs, setLogs] = useState<LogWithType[]>([]);
  const [recentActions, setRecentActions] = useState<RecentActionItem[]>([]);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [showAllActions, setShowAllActions] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const [{ data: logsData }, { data: actionData }] = await Promise.all([
        supabase
          .from('logs')
          .select('*, log_type')
          .eq('user_id', user.id)
          .or('log_type.eq.distortion,log_type.is.null')
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('intervention')
          .select('id, log_id, final_action, is_completed, autonomy_score, created_at, logs!inner(trigger, user_id, log_type)')
          .eq('logs.user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      setLogs((logsData || []) as LogWithType[]);
      const filteredActions = ((actionData || []) as unknown as RecentActionItem[]).filter(
        (item) => item.logs?.log_type !== 'success'
      );
      setRecentActions(filteredActions);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white border-b border-background-tertiary">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-text-primary tracking-tight">항해 일지</h1>
        </div>
        {/* 탭 */}
        <div className="max-w-lg mx-auto px-4 flex gap-4 border-t border-background-tertiary">
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'logs'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-tertiary'
            }`}
          >
            최근 활동
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'actions'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-tertiary'
            }`}
          >
            행동 계획
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4 pb-28">
        {activeTab === 'logs' && (
          <>
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-sm font-semibold text-text-primary mb-1">아직 기록이 없어요</p>
                <p className="text-xs text-text-secondary">하단 + 버튼으로 첫 기록을 시작해보세요.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(showAllLogs ? logs : logs.slice(0, 3)).map((log) => (
                  <div
                    key={log.id}
                    onClick={() => router.push(`/analyze/${log.id}`)}
                    className="bg-white border border-background-tertiary/80 rounded-xl p-4 shadow-sm hover:border-primary hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-text-primary line-clamp-1">{log.trigger}</p>
                      <span className="text-xs text-text-secondary whitespace-nowrap ml-2">
                        {formatDate(log.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary line-clamp-2">{log.thought}</p>
                  </div>
                ))}
                {logs.length > 3 && !showAllLogs && (
                  <button
                    onClick={() => setShowAllLogs(true)}
                    className="w-full py-2.5 text-sm text-primary font-semibold border border-primary/30 rounded-xl hover:bg-primary/5 transition-colors"
                  >
                    더보기 ({logs.length - 3}개 더)
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'actions' && (
          <>
            {recentActions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-4xl mb-3">🗺️</p>
                <p className="text-sm font-semibold text-text-primary mb-1">아직 행동 계획이 없어요</p>
                <p className="text-xs text-text-secondary">분석 후 행동 설계를 완료해보세요.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(showAllActions ? recentActions : recentActions.slice(0, 3)).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/action/${item.log_id}`)}
                    className="bg-white border border-background-tertiary/80 rounded-xl p-4 shadow-sm hover:border-primary hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-text-primary line-clamp-1">
                        {item.logs?.trigger || '행동 계획'}
                      </p>
                      <span className={`text-xs font-semibold ${item.is_completed ? 'text-success' : 'text-warning'}`}>
                        {item.is_completed ? '완료' : '진행 중'}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary line-clamp-2">
                      {item.final_action || '행동 계획이 아직 작성되지 않았습니다.'}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-text-secondary">{formatDate(item.created_at)}</span>
                      <span className="text-xs text-primary">
                        {item.autonomy_score ? `+${item.autonomy_score}점` : '점수 대기'}
                      </span>
                    </div>
                  </div>
                ))}
                {recentActions.length > 3 && !showAllActions && (
                  <button
                    onClick={() => setShowAllActions(true)}
                    className="w-full py-2.5 text-sm text-primary font-semibold border border-primary/30 rounded-xl hover:bg-primary/5 transition-colors"
                  >
                    더보기 ({recentActions.length - 3}개 더)
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <BottomTabBar />
    </main>
  );
}
