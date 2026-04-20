'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, CheckCircle, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import StreakBanner from '@/components/ui/StreakBanner';
import ArchetypeCard from '@/components/ui/ArchetypeCard';
import { calculateStreak, type StreakResult } from '@/lib/utils/streak';
import { getArchetypeResult, type ArchetypeResult } from '@/lib/utils/archetype';
import type { User } from '@supabase/supabase-js';
import type { Log, DistortionType } from '@/types';

type LogWithType = Log & { log_type?: string | null };

type RecentActionItem = {
  id: string;
  log_id: string;
  final_action: string | null;
  is_completed: boolean;
  autonomy_score: number | null;
  created_at: string;
  logs?: {
    trigger?: string;
    log_type?: string | null;
  } | null;
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [successToast, setSuccessToast] = useState(false);
  const [successLogs, setSuccessLogs] = useState<LogWithType[]>([]);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [showAllActions, setShowAllActions] = useState(false);
  const [todayCheckin, setTodayCheckin] = useState<{ morning: boolean; evening: boolean }>({ morning: false, evening: false });
  const [checkinToast, setCheckinToast] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === '1') {
      setSuccessToast(true);
      router.replace('/dashboard');
      const timer = setTimeout(() => setSuccessToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (searchParams.get('checkin') === '1') {
      setCheckinToast(true);
      router.replace('/dashboard');
      const timer = setTimeout(() => setCheckinToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

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
      // 최근 인지 왜곡 로그 (성공 로그 제외)
      const { data: logsData, error: logsError } = await supabase
        .from('logs')
        .select('*, log_type')
        .eq('user_id', userId)
        .or('log_type.eq.distortion,log_type.is.null')
        .order('created_at', { ascending: false })
        .limit(20);

      if (logsError) throw logsError;
      setLogs(logsData || []);

      // 성공 로그 별도 fetch
      const { data: successLogsData } = await supabase
        .from('logs')
        .select('*, log_type')
        .eq('user_id', userId)
        .eq('log_type', 'success')
        .order('created_at', { ascending: false })
        .limit(5);
      setSuccessLogs((successLogsData || []) as LogWithType[]);

      const { data: actionData, error: actionError } = await supabase
        .from('intervention')
        .select('id, log_id, final_action, is_completed, autonomy_score, created_at, logs!inner(trigger, user_id, log_type)')
        .eq('logs.user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (actionError) throw actionError;
      // 성공 로그에 연결된 intervention 제외
      const filteredActions = ((actionData || []) as unknown as RecentActionItem[]).filter(
        (item) => item.logs?.log_type !== 'success'
      );
      setRecentActions(filteredActions);

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
      const [{ data: analysisData }, { data: checkinData }] = await Promise.all([
        supabase
          .from('analysis')
          .select('distortion_type, created_at, logs!inner(user_id)')
          .eq('logs.user_id', userId),
        supabase
          .from('checkins')
          .select('created_at')
          .eq('user_id', userId),
      ]);

      const KST_OFFSET = 9 * 60 * 60 * 1000;
      const toKstDate = (iso: string) =>
        new Date(new Date(iso).getTime() + KST_OFFSET).toISOString().slice(0, 10);

      const analysisDates = (analysisData ?? []).map((r) =>
        toKstDate((r as { created_at: string }).created_at)
      );
      const checkinDates = (checkinData ?? []).map((r) =>
        toKstDate((r as { created_at: string }).created_at)
      );
      const allDates = [...new Set([...analysisDates, ...checkinDates])];
      setStreak(calculateStreak(allDates));

      // 오늘 체크인 상태 조회
      const kstNow = new Date(Date.now() + KST_OFFSET);
      const todayStartIso = new Date(
        Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate()) - KST_OFFSET
      ).toISOString();

      const { data: todayCheckins } = await supabase
        .from('checkins')
        .select('type')
        .eq('user_id', userId)
        .gte('created_at', todayStartIso);

      setTodayCheckin({
        morning: (todayCheckins ?? []).some((c: { type: string }) => c.type === 'morning'),
        evening: (todayCheckins ?? []).some((c: { type: string }) => c.type === 'evening'),
      });

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
      {successToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-success text-white text-sm font-semibold px-6 py-3 rounded-2xl shadow-lg">
          성공 순간이 기록됐습니다 +15점 🎉
        </div>
      )}
      {checkinToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-primary text-white text-sm font-semibold px-6 py-3 rounded-2xl shadow-lg">
          체크인 완료! 연속 기록이 유지됩니다 ✓
        </div>
      )}
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white border-b border-background-tertiary">
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
        <div className="mb-4 sm:mb-6 bg-white rounded-xl sm:rounded-2xl p-4 border border-background-tertiary">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text-primary">오늘의 체크인</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/checkin/history')}
                className="text-xs text-text-secondary"
              >
                기록 보기
              </button>
              <button
                onClick={() => router.push('/checkin')}
                className="text-xs text-primary font-semibold"
              >
                체크인하기
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <div className={`flex-1 flex items-center gap-2 p-3 rounded-xl border ${
              todayCheckin.morning ? 'border-success bg-success bg-opacity-5' : 'border-background-tertiary'
            }`}>
              <span className="text-lg">🌅</span>
              <div>
                <p className="text-xs font-semibold text-text-primary">모닝</p>
                <p className={`text-[10px] ${todayCheckin.morning ? 'text-success' : 'text-text-tertiary'}`}>
                  {todayCheckin.morning ? '완료' : '미완료'}
                </p>
              </div>
            </div>
            <div className={`flex-1 flex items-center gap-2 p-3 rounded-xl border ${
              todayCheckin.evening ? 'border-success bg-success bg-opacity-5' : 'border-background-tertiary'
            }`}>
              <span className="text-lg">🌙</span>
              <div>
                <p className="text-xs font-semibold text-text-primary">이브닝</p>
                <p className={`text-[10px] ${todayCheckin.evening ? 'text-success' : 'text-text-tertiary'}`}>
                  {todayCheckin.evening ? '완료' : '미완료'}
                </p>
              </div>
            </div>
          </div>
        </div>
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

        <div className="mt-4 bg-white border border-success rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h3 className="text-base md:text-lg font-bold text-text-primary mb-1">
            이성이 이긴 순간이 있었나요?
          </h3>
          <p className="text-xs text-text-secondary mb-3">
            왜곡에 빠질 뻔했지만 잘 대처한 순간을 기록하면 자율성 지수 +15점
          </p>
          <button
            onClick={() => router.push('/log/success')}
            className="bg-success text-white font-semibold py-2 px-6 rounded-xl text-sm touch-manipulation active:scale-95 transition-transform"
          >
            성공 순간 기록하기
          </button>
        </div>

        {/* 성공 순간 기록 */}
        {successLogs.length > 0 && (
          <div className="mt-4 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-success border-opacity-40">
            <h3 className="text-sm font-semibold text-text-primary mb-3">성공 순간 기록</h3>
            <div className="space-y-3">
              {successLogs.map((log) => (
                <div key={log.id} className="border border-success border-opacity-30 bg-success bg-opacity-5 rounded-xl p-3">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium text-text-primary line-clamp-1">{log.trigger}</p>
                    <span className="text-xs text-text-secondary whitespace-nowrap ml-2">{formatDate(log.created_at)}</span>
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2">{log.thought}</p>
                </div>
              ))}
            </div>
          </div>
        )}

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
              {(showAllLogs ? logs : logs.slice(0, 3)).map((log) => (
                <div
                  key={log.id}
                  onClick={() => router.push(`/analyze/${log.id}`)}
                  className="border border-background-tertiary rounded-xl p-4 hover:border-primary transition-colors cursor-pointer"
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
                  className="w-full py-2 text-sm text-primary font-semibold border border-primary border-opacity-30 rounded-xl hover:bg-primary hover:bg-opacity-5 transition-colors"
                >
                  더보기 ({logs.length - 3}개 더)
                </button>
              )}
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
              {(showAllActions ? recentActions : recentActions.slice(0, 3)).map((item) => (
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
              {recentActions.length > 3 && !showAllActions && (
                <button
                  onClick={() => setShowAllActions(true)}
                  className="w-full py-2 text-sm text-primary font-semibold border border-primary border-opacity-30 rounded-xl hover:bg-primary hover:bg-opacity-5 transition-colors"
                >
                  더보기 ({recentActions.length - 3}개 더)
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
