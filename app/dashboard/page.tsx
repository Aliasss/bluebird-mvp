'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, CheckCircle, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import StreakBanner from '@/components/ui/StreakBanner';
import ArchetypeCard from '@/components/ui/ArchetypeCard';
import { calculateStreak, type StreakResult } from '@/lib/utils/streak';
import { getArchetypeResult, type ArchetypeResult } from '@/lib/utils/archetype';
import type { User } from '@supabase/supabase-js';
import type { Log, DistortionType } from '@/types';

type RecentActionItem = {
  id: string;
  log_id: string;
  final_action: string | null;
  is_completed: boolean;
  autonomy_score: number | null;
  created_at: string;
  logs?: {
    trigger?: string;
  } | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<Log[]>([]);
  const [recentActions, setRecentActions] = useState<RecentActionItem[]>([]);
  const [stats, setStats] = useState({
    totalLogs: 0,
    completedActions: 0,
    autonomyScore: 0,
  });
  const [streak, setStreak] = useState<StreakResult>({ current: 0, best: 0, doneToday: false });
  const [archetype, setArchetype] = useState<ArchetypeResult | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
      } else {
        setUser(user);
        await fetchData(user.id);
      }
      setLoading(false);
    };

    checkUser();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/auth/login');
      } else {
        setUser(session.user);
        fetchData(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const fetchData = async (userId: string) => {
    try {
      // 최근 로그 가져오기
      const { data: logsData, error: logsError } = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (logsError) throw logsError;
      setLogs(logsData || []);

      const { data: actionData, error: actionError } = await supabase
        .from('intervention')
        .select('id, log_id, final_action, is_completed, autonomy_score, created_at, logs!inner(trigger, user_id)')
        .eq('logs.user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (actionError) throw actionError;
      setRecentActions((actionData as unknown as RecentActionItem[]) || []);

      // 통계 데이터 가져오기
      const { count: totalLogs } = await supabase
        .from('logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: completedActions } = await supabase
        .from('intervention')
        .select('log_id, logs!inner(user_id)', { count: 'exact', head: true })
        .eq('is_completed', true)
        .eq('logs.user_id', userId);

      const { data: interventionsData } = await supabase
        .from('intervention')
        .select('autonomy_score, logs!inner(user_id)')
        .eq('logs.user_id', userId)
        .not('autonomy_score', 'is', null);

      const totalScore = interventionsData?.reduce((sum, item) => sum + (item.autonomy_score || 0), 0) || 0;

      // 스트릭 계산
      const { data: analysisData } = await supabase
        .from('analysis')
        .select('distortion_type, created_at, logs!inner(user_id)')
        .eq('logs.user_id', userId);

      const KST_OFFSET = 9 * 60 * 60 * 1000;
      const analysisDateStrings = [
        ...new Set(
          (analysisData ?? []).map((r) =>
            new Date(new Date((r as { created_at: string }).created_at).getTime() + KST_OFFSET)
              .toISOString()
              .slice(0, 10)
          )
        ),
      ];
      setStreak(calculateStreak(analysisDateStrings));

      // 아키타입 계산 (placeholder row 제외)
      const distortionCounts: Partial<Record<DistortionType, number>> = {};
      const distortionRows = (analysisData ?? []).filter(
        (r) => (r as { distortion_type: string | null }).distortion_type != null
      );
      distortionRows.forEach((r) => {
        const t = (r as { distortion_type: string }).distortion_type as DistortionType;
        distortionCounts[t] = (distortionCounts[t] ?? 0) + 1;
      });
      const totalAnalysisCount = distortionRows.length;
      setArchetype(getArchetypeResult(distortionCounts, totalAnalysisCount));

      setStats({
        totalLogs: totalLogs || 0,
        completedActions: completedActions || 0,
        autonomyScore: totalScore,
      });
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="bg-white border-b border-background-tertiary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-primary">Project Bluebird</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/our-philosophy')}
              className="text-sm text-text-secondary hover:underline transition-colors"
            >
              철학
            </button>
            <button
              onClick={() => router.push('/manual')}
              className="text-sm text-text-secondary hover:underline transition-colors"
            >
              Manual
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-text-secondary hover:text-primary transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24">
        {/* 환영 메시지 */}
        <div className="mb-4 sm:mb-6">
          <p className="text-sm text-text-secondary">{user?.email}</p>
        </div>

        <StreakBanner streak={streak} />
        <ArchetypeCard result={archetype} onClick={() => router.push('/insights')} />

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-background-tertiary shadow-none sm:shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-text-secondary">전체 로그</h3>
              <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                <BookOpen size={20} className="text-primary" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-text-primary">{stats.totalLogs}</p>
            <p className="text-xs text-text-secondary mt-1">
              {stats.totalLogs === 0 ? '아직 기록이 없습니다' : '개의 사고를 기록했습니다'}
            </p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-background-tertiary shadow-none sm:shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-text-secondary">완료한 행동</h3>
              <div className="w-10 h-10 bg-success bg-opacity-10 rounded-full flex items-center justify-center">
                <CheckCircle size={20} className="text-success" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-text-primary">{stats.completedActions}</p>
            <p className="text-xs text-text-secondary mt-1">
              {stats.completedActions === 0 ? '행동을 완료하면 점수가 올라갑니다' : '개의 행동을 완료했습니다'}
            </p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-background-tertiary shadow-none sm:shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-text-secondary">자율성 지수</h3>
              <div className="w-10 h-10 bg-warning bg-opacity-10 rounded-full flex items-center justify-center">
                <Star size={20} className="text-warning" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-text-primary">{stats.autonomyScore}</p>
            <p className="text-xs text-text-secondary mt-1">
              {stats.autonomyScore === 0 ? '행동 완료로 지수를 높이세요' : '점 획득했습니다'}
            </p>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-xl sm:rounded-2xl p-4 sm:p-8 text-white shadow-md">
          <h3 className="text-xl md:text-2xl font-bold mb-2">
            새로운 사고 기록하기
          </h3>
          <p className="text-sm md:text-base mb-4 sm:mb-6 opacity-90">
            트리거(사건)와 자동 사고를 기록하여 인지 왜곡을 분석해보세요
          </p>
          <button
            onClick={() => router.push('/log')}
            className="bg-white text-primary font-semibold py-3 px-8 rounded-xl touch-manipulation active:scale-95 transition-transform"
          >
            기록 시작하기
          </button>
        </div>

        {/* 최근 활동 */}
        <div className="mt-6 sm:mt-8 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-background-tertiary shadow-none sm:shadow-sm">
          <h3 className="text-lg md:text-xl font-bold text-text-primary mb-4">
            최근 활동
          </h3>
          {logs.length === 0 ? (
            <div className="space-y-3 py-4">
              <p className="text-sm font-medium text-text-primary mb-4">시작하는 방법</p>
              {[
                { step: '1', text: '오늘 마음에 걸리는 사건이나 생각을 적어보세요' },
                { step: '2', text: 'AI가 어떤 인지 왜곡인지 자동으로 분석해드립니다' },
                { step: '3', text: '소크라테스식 질문으로 사고를 직접 교정해보세요' },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                    {step}
                  </span>
                  <p className="text-sm text-text-secondary">{text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => router.push(`/analyze/${log.id}`)}
                  className="border border-background-tertiary rounded-xl p-4 hover:border-primary transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-text-primary line-clamp-1">
                      {log.trigger}
                    </p>
                    <span className="text-xs text-text-secondary whitespace-nowrap ml-2">
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-2">
                    {log.thought}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 최근 행동 계획 */}
        <div className="mt-6 sm:mt-8 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-background-tertiary shadow-none sm:shadow-sm">
          <h3 className="text-lg md:text-xl font-bold text-text-primary mb-4">최근 행동 계획</h3>
          {recentActions.length === 0 ? (
            <p className="text-text-secondary text-sm">
              아직 행동 계획이 없습니다. 분석 후 행동 설계를 진행해보세요.
            </p>
          ) : (
            <div className="space-y-3">
              {recentActions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/action/${item.log_id}`)}
                  className="border border-background-tertiary rounded-xl p-4 hover:border-primary transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-text-primary line-clamp-1">
                      {item.logs?.trigger || '행동 계획'}
                    </p>
                    <span
                      className={`text-xs font-semibold ${
                        item.is_completed ? 'text-success' : 'text-warning'
                      }`}
                    >
                      {item.is_completed ? '완료' : '진행 중'}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-2">
                    {item.final_action || '행동 계획이 아직 작성되지 않았습니다.'}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-text-secondary">
                      {formatDate(item.created_at)}
                    </span>
                    <span className="text-xs text-primary">
                      {item.autonomy_score ? `+${item.autonomy_score}점` : '점수 대기'}
                    </span>
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
