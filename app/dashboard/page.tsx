'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import StreakBanner from '@/components/ui/StreakBanner';
import ArchetypeCard from '@/components/ui/ArchetypeCard';
import BottomTabBar from '@/components/ui/BottomTabBar';
import { calculateStreak, type StreakResult } from '@/lib/utils/streak';
import { getArchetypeResult, type ArchetypeResult } from '@/lib/utils/archetype';
import { getRankResult } from '@/lib/utils/rank';
import type { User } from '@supabase/supabase-js';
import type { Log, DistortionType } from '@/types';
import { findPendingReview, type PendingReviewClient, type PendingReview } from '@/lib/review/pending-review';
import { sumPositiveDeltaPain, type PainPair } from '@/lib/review/delta-pain';
import { ReviewCard } from '@/components/review/ReviewCard';

type LogWithType = Log & { log_type?: string | null };

function getGreeting(email: string) {
  const name = email.split('@')[0];
  const kstHour = (new Date().getUTCHours() + 9) % 24;
  let message = '';
  if (kstHour >= 5 && kstHour < 13) {
    message = '오늘의 항해를 준비할 시간이에요.';
  } else if (kstHour >= 13 && kstHour < 19) {
    message = '지금 이 순간도 주체적으로 항해하고 있어요.';
  } else {
    message = '오늘 하루를 갈무리해보세요.';
  }
  return { name, message };
}

function DashboardContent() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [successLogs, setSuccessLogs] = useState<LogWithType[]>([]);
  const [streak, setStreak] = useState<StreakResult>({ current: 0, best: 0, doneToday: false });
  const [archetype, setArchetype] = useState<ArchetypeResult | null>(null);
  const [autonomyScore, setAutonomyScore] = useState(0);
  const [pendingReview, setPendingReview] = useState<PendingReview | null>(null);
  const [weeklyPositiveDeltaPain, setWeeklyPositiveDeltaPain] = useState(0);
  const [successToast, setSuccessToast] = useState(false);
  const [checkinToast, setCheckinToast] = useState(false);
  const [todayCheckin, setTodayCheckin] = useState<{ morning: boolean; evening: boolean }>({ morning: false, evening: false });
  const [showManualNudge, setShowManualNudge] = useState(false);

  useEffect(() => {
    // sessionStorage 기반 — Router Cache가 stale searchParams를 복원해도 토스트 재발사 안 됨.
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('justSuccessLogged') === '1') {
      sessionStorage.removeItem('justSuccessLogged');
      setSuccessToast(true);
      const timer = setTimeout(() => setSuccessToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('justCheckedIn') === '1') {
      sessionStorage.removeItem('justCheckedIn');
      setCheckinToast(true);
      const timer = setTimeout(() => setCheckinToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/auth/login');
      } else {
        setUser(session.user);
        fetchData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const fetchData = async (userId: string) => {
    try {
      const KST_OFFSET = 9 * 60 * 60 * 1000;
      const toKstDate = (iso: string) =>
        new Date(new Date(iso).getTime() + KST_OFFSET).toISOString().slice(0, 10);

      // 성공 로그
      const { data: successLogsData } = await supabase
        .from('logs')
        .select('*, log_type')
        .eq('user_id', userId)
        .eq('log_type', 'success')
        .order('created_at', { ascending: false })
        .limit(3);
      setSuccessLogs((successLogsData || []) as LogWithType[]);

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

      const analysisDates = (analysisData ?? []).map((r) => toKstDate((r as { created_at: string }).created_at));
      const checkinDates = (checkinData ?? []).map((r) => toKstDate((r as { created_at: string }).created_at));
      const allDates = [...new Set([...analysisDates, ...checkinDates])];
      setStreak(calculateStreak(allDates));

      // 자율성 지수
      const { data: interventionsData } = await supabase
        .from('intervention')
        .select('autonomy_score, logs!inner(user_id)')
        .eq('logs.user_id', userId)
        .not('autonomy_score', 'is', null);
      const totalScore = interventionsData?.reduce((sum, item) => sum + (item.autonomy_score || 0), 0) || 0;
      setAutonomyScore(totalScore);

      // 재평가 대기 (Δpain)
      const pendingReviewClient: PendingReviewClient = {
        async queryPendingInterventions({ userId: uid, completedAtGte, completedAtLte }) {
          const { data, error } = await supabase
            .from('intervention')
            .select('id, log_id, completed_at, logs!inner(id, trigger, pain_score, user_id)')
            .eq('is_completed', true)
            .is('reevaluated_pain_score', null)
            .is('review_dismissed_at', null)
            .gte('completed_at', completedAtGte)
            .lte('completed_at', completedAtLte)
            .eq('logs.user_id', uid);
          const normalized = (data ?? []).map((row) => ({
            ...row,
            logs: Array.isArray(row.logs) ? row.logs[0] : row.logs,
          })) as import('@/lib/review/pending-review').PendingReviewRow[];
          return { data: normalized, error };
        },
      };
      const pending = await findPendingReview({
        userId,
        now: new Date(),
        client: pendingReviewClient,
      });
      setPendingReview(pending);

      // 이번 주 (7일) Δpain 양수 합계
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: deltaPainRows } = await supabase
        .from('intervention')
        .select('reevaluated_pain_score, logs!inner(pain_score, user_id)')
        .eq('logs.user_id', userId)
        .not('reevaluated_pain_score', 'is', null)
        .gte('reevaluated_at', oneWeekAgo);

      const pairs: PainPair[] = (deltaPainRows ?? []).map((row) => {
        const logsField = row.logs as unknown as
          | { pain_score: number | null }
          | Array<{ pain_score: number | null }>;
        const log = Array.isArray(logsField) ? logsField[0] : logsField;
        return {
          initial: log?.pain_score ?? null,
          reevaluated: (row as { reevaluated_pain_score: number | null }).reevaluated_pain_score,
        };
      });
      setWeeklyPositiveDeltaPain(sumPositiveDeltaPain(pairs));

      // 아키타입
      const distortionCounts: Partial<Record<DistortionType, number>> = {};
      const distortionRows = (analysisData ?? []).filter(
        (r) => (r as { distortion_type: string | null }).distortion_type != null
      );
      distortionRows.forEach((r) => {
        const t = (r as { distortion_type: string }).distortion_type as DistortionType;
        distortionCounts[t] = (distortionCounts[t] ?? 0) + 1;
      });
      setArchetype(getArchetypeResult(distortionCounts, distortionRows.length));

      // 매뉴얼 너지 배너: 3회 이상 분석 + 영구 dismiss 안 한 사용자에게만
      if (typeof window !== 'undefined') {
        const dismissed = localStorage.getItem('manual-nudge-dismissed') === '1';
        setShowManualNudge(!dismissed && distortionRows.length >= 3);
      }

      // 오늘 체크인 상태
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
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </main>
    );
  }

  const greeting = user ? getGreeting(user.email!) : null;

  const dismissManualNudge = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('manual-nudge-dismissed', '1');
    }
    setShowManualNudge(false);
  };

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
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-primary">Project Bluebird</h1>
          <button
            onClick={() => router.push('/me')}
            className="text-xs text-text-tertiary"
          >
            {greeting?.name} 항해사님
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="max-w-lg mx-auto px-4 py-5 pb-28 space-y-4">

        {/* 인사말 */}
        <div>
          <p className="text-xl font-bold text-text-primary tracking-tight">
            안녕하세요, {greeting?.name} 항해사님 🧭
          </p>
          <p className="text-sm text-text-secondary mt-0.5">{greeting?.message}</p>
        </div>

        {/* 재평가 대기 카드 */}
        {pendingReview && (
          <ReviewCard
            logId={pendingReview.logId}
            triggerSnippet={pendingReview.triggerSnippet}
            daysAgo={pendingReview.daysAgo}
          />
        )}

        {/* 매뉴얼 너지 배너 — 3회 이상 분석한 사용자에게만, 영구 dismiss 가능 */}
        {showManualNudge && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">📖</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary mb-0.5">
                  왜곡이 작동하는 이유가 궁금하다면
                </p>
                <p className="text-xs text-text-secondary">
                  매뉴얼에서 인지 왜곡 5가지의 정의와 디버깅 질문을 확인할 수 있어요.
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <Link
                    href="/manual"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    매뉴얼 열기 →
                  </Link>
                  <button
                    onClick={dismissManualNudge}
                    className="text-xs text-text-tertiary hover:text-text-secondary"
                  >
                    다시 보지 않기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 체크인 카드 */}
        <div className="bg-white rounded-2xl p-4 border border-background-tertiary shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text-primary">오늘의 체크인</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/checkin/history')}
                className="text-xs text-text-secondary"
              >
                기록 보기
              </button>
              {(() => {
                // 현재 KST 시각대의 type 결정 — /checkin 페이지의 getCheckinType과 동일 로직
                const kstHour = (new Date().getUTCHours() + 9) % 24;
                const currentType: 'morning' | 'evening' =
                  kstHour >= 5 && kstHour < 13 ? 'morning' : 'evening';
                const currentTypeDone =
                  currentType === 'morning' ? todayCheckin.morning : todayCheckin.evening;
                return currentTypeDone ? (
                  <span className="text-xs text-text-tertiary font-medium">
                    오늘 완료 ✓
                  </span>
                ) : (
                  <button
                    onClick={() => router.push('/checkin')}
                    className="text-xs text-primary font-semibold"
                  >
                    체크인하기
                  </button>
                );
              })()}
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

        {/* 스트릭 + 자율성 지수 + 이번 주 줄어든 고통 */}
        {(() => {
          const { rank, progressPct, pointsToNext } = getRankResult(autonomyScore);
          return (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)]">
                  <p className="text-xs text-text-secondary mb-1">연속 항해</p>
                  <p className="text-2xl font-extrabold text-primary tracking-tight">{streak.current}일 🔥</p>
                  <p className="text-[10px] text-text-tertiary mt-1">
                    {streak.doneToday ? '오늘도 달성!' : streak.best > 0 ? `최고 ${streak.best}일` : '오늘 시작해보세요'}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)]">
                  <p className="text-xs text-text-secondary mb-1">자율성 지수</p>
                  <p className="text-xl font-extrabold text-warning tracking-tight">{autonomyScore}점</p>
                  <p className="text-[10px] font-semibold text-primary mt-0.5">{rank.title}</p>
                  <div className="mt-2 h-1 bg-background-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-warning rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-text-tertiary mt-1">
                    {pointsToNext !== null ? `다음 등급까지 ${pointsToNext}점` : '최고 등급 달성 ⚓'}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)]">
                <p className="text-xs text-text-secondary mb-1">이번 주 줄어든 고통</p>
                <p className="text-2xl font-extrabold text-primary tracking-tight">
                  {weeklyPositiveDeltaPain}
                  <span className="text-sm text-text-tertiary ml-1">점</span>
                </p>
                <p className="text-[10px] text-text-tertiary mt-1">7일 내 재평가 완료 기준</p>
              </div>
            </>
          );
        })()}

        {/* 아키타입 카드 */}
        <ArchetypeCard result={archetype} onClick={() => router.push('/insights')} />

        {/* 성공 순간 기록 */}
        {successLogs.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-success/30 shadow-sm">
            <h3 className="text-sm font-semibold text-text-primary mb-3">최근 성공 순간</h3>
            <div className="space-y-2">
              {successLogs.map((log) => (
                <div key={log.id} className="bg-success/5 border border-success/20 rounded-xl p-3">
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

        {/* 푸터: 보조 콘텐츠 진입점 */}
        <div className="pt-2 flex items-center justify-center gap-3 text-[11px] text-text-tertiary">
          <Link href="/our-philosophy" className="hover:text-text-secondary hover:underline">
            철학
          </Link>
          <span aria-hidden>·</span>
          <Link href="/manual" className="hover:text-text-secondary hover:underline">
            매뉴얼
          </Link>
          <span aria-hidden>·</span>
          <Link href="/safety/resources" className="hover:text-text-secondary hover:underline">
            정신건강 자원
          </Link>
        </div>
      </div>

      <BottomTabBar />
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
