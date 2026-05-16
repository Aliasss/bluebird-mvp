'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, SunMedium, Moon } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import StreakBanner from '@/components/ui/StreakBanner';
import EnablePushCard from '@/components/notifications/EnablePushCard';
import EnablePushBanner from '@/components/notifications/EnablePushBanner';
import ArchetypeCard from '@/components/ui/ArchetypeCard';
import BottomTabBar from '@/components/ui/BottomTabBar';
import InfoTooltip from '@/components/ui/InfoTooltip';
import { calculateStreak, type StreakResult } from '@/lib/utils/streak';
import { getArchetypeResultFromRows, type ArchetypeResult } from '@/lib/utils/archetype';
import { getRankResult } from '@/lib/utils/rank';
import StageTransitionModal from '@/components/insights/StageTransitionModal';
import { DistortionTypeKorean } from '@/types';
import { AUTONOMY_SCORE_TOOLTIP, DELTA_PAIN_WEEKLY_TOOLTIP } from '@/lib/copy/autonomy';
import type { User } from '@supabase/supabase-js';
import type { Log } from '@/types';
import { findPendingReview, type PendingReviewClient, type PendingReview } from '@/lib/review/pending-review';
import { sumPositiveDeltaPain, type PainPair } from '@/lib/review/delta-pain';
import { ReviewCard } from '@/components/review/ReviewCard';

type LogWithType = Log & { log_type?: string | null };

function getGreeting(email: string) {
  const name = email.split('@')[0];
  const kstHour = (new Date().getUTCHours() + 9) % 24;
  let message = '';
  if (kstHour >= 5 && kstHour < 13) {
    message = '오늘 분석할 트리거가 있나요?';
  } else if (kstHour >= 13 && kstHour < 19) {
    message = '지금 떠오른 자동 사고를 기록해보세요.';
  } else {
    message = '오늘 하루의 사고 패턴을 정리해보세요.';
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
  // 방금 체크인 완료한 직후 진입 시 P2 카드 노출 트리거 (component가 permission/dismiss 자체 게이팅)
  const [justCheckedIn, setJustCheckedIn] = useState(false);
  const [todayCheckin, setTodayCheckin] = useState<{ morning: boolean; evening: boolean }>({ morning: false, evening: false });
  const [showManualNudge, setShowManualNudge] = useState(false);
  // 단계 전이 인터스티셜 (Plan agent 권장안 A, 2026-05-16). localStorage 1회 표시.
  const [stageTransition, setStageTransition] = useState<{
    previousTitle: string | null;
    currentTitle: string;
    totalLogs: number;
    topDistortionKorean: string | null;
  } | null>(null);

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
      setJustCheckedIn(true);
      const timer = setTimeout(() => setCheckinToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // 온보딩 미완 사용자는 /onboarding/1 redirect.
      // user_onboarding row 부재 = 미완. RLS로 본인 row만 조회.
      const { data: onboarding } = await supabase
        .from('user_onboarding')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!onboarding) {
        router.push('/onboarding/1');
        return;
      }

      setUser(user);
      await fetchData(user.id);
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

      // 단계 전이 인터스티셜 — Plan agent 권장안 A (2026-05-16)
      // localStorage 1회 표시 가드. 본인의 마지막으로 본 단계와 현 단계가 다르면 모달 표시
      if (typeof window !== 'undefined') {
        const currentRank = getRankResult(totalScore).rank;
        const STORAGE_KEY = 'bluebird:last_seen_rank_v1';
        const previousTitle = window.localStorage.getItem(STORAGE_KEY);

        if (previousTitle !== currentRank.title) {
          // 첫 진입 (previousTitle === null) 시에는 modal 표시 안 함 (단계 진입 신호가 아니라 첫 가입)
          if (previousTitle !== null) {
            // 정량 회고용 데이터 — best-effort 별도 fetch
            const { data: patternsData } = await supabase
              .from('user_patterns')
              .select('distortion_type')
              .eq('user_id', userId);

            const counts = new Map<string, number>();
            (patternsData ?? []).forEach((p) => {
              const t = (p as { distortion_type?: string }).distortion_type;
              if (t) counts.set(t, (counts.get(t) ?? 0) + 1);
            });
            let topType: string | null = null;
            let topN = 0;
            counts.forEach((n, t) => {
              if (n > topN) {
                topN = n;
                topType = t;
              }
            });

            setStageTransition({
              previousTitle,
              currentTitle: currentRank.title,
              totalLogs: (analysisData ?? []).length,
              topDistortionKorean:
                topType && topType in DistortionTypeKorean
                  ? DistortionTypeKorean[topType as keyof typeof DistortionTypeKorean]
                  : null,
            });
          }
          // 첫 진입이든 전이든 localStorage 갱신
          window.localStorage.setItem(STORAGE_KEY, currentRank.title);
        }
      }

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

      // 아키타입 — distortion_type=null placeholder는 자동 제외 (insights와 통일)
      const archetypeRows = (analysisData ?? []) as Array<{ distortion_type: string | null }>;
      setArchetype(getArchetypeResultFromRows(archetypeRows));

      // 매뉴얼 너지 배너: 3회 이상 분석(왜곡 탐지된 것만) + 영구 dismiss 안 한 사용자에게만
      const realDistortionCount = archetypeRows.filter((r) => r.distortion_type != null).length;
      if (typeof window !== 'undefined') {
        const dismissed = localStorage.getItem('manual-nudge-dismissed') === '1';
        setShowManualNudge(!dismissed && realDistortionCount >= 3);
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
          성공 순간이 기록됐습니다 +15점 (분석 보너스 포함)
        </div>
      )}
      {checkinToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-primary text-white text-sm font-semibold px-6 py-3 rounded-2xl shadow-lg">
          체크인 완료. 연속 기록이 유지됩니다.
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
            {greeting?.name}님
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="max-w-lg mx-auto px-4 py-5 pb-28 space-y-4">

        {/* 인사말 */}
        <div>
          <p className="text-xl font-bold text-text-primary tracking-tight">
            {greeting?.name}님, {greeting?.message}
          </p>
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
              <BookOpen className="text-primary mt-0.5 shrink-0" size={20} strokeWidth={1.75} />
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
              <SunMedium
                size={18}
                strokeWidth={1.75}
                className={todayCheckin.morning ? 'text-success' : 'text-text-tertiary'}
              />
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
              <Moon
                size={18}
                strokeWidth={1.75}
                className={todayCheckin.evening ? 'text-success' : 'text-text-tertiary'}
              />
              <div>
                <p className="text-xs font-semibold text-text-primary">이브닝</p>
                <p className={`text-[10px] ${todayCheckin.evening ? 'text-success' : 'text-text-tertiary'}`}>
                  {todayCheckin.evening ? '완료' : '미완료'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/*
          푸시 알림 자산 — 사용자 permission이 default일 때만 컴포넌트 내부에서 렌더.
          - 방금 체크인 완료 직후: P2 카드 (1회 한정, dismiss 영구)
          - 그 외 기본 상태: P3 배너 (7일 silence, dismiss 시 침묵)
          상호배타로 렌더해 같은 화면 중복 노출 방지.
        */}
        {justCheckedIn ? <EnablePushCard /> : <EnablePushBanner />}

        {/* 스트릭 + 자율성 지수 + 이번 주 줄어든 고통 */}
        {(() => {
          const { rank, progressPct, pointsToNext } = getRankResult(autonomyScore);
          return (
            <>
              {/* CPO 검토(2026-05-16): 자율성 지수 콘텐츠가 더 많아 1:2 비대칭 적용.
                  연속 기록 1칸 · 자율성 2칸 — 본질 위계(단계 3 surface) 정합 + description 줄바꿈 완화. */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-2xl p-4 shadow-card">
                  <p className="text-xs text-text-secondary mb-1">연속 기록</p>
                  <p className="text-2xl font-extrabold text-primary tracking-tight">{streak.current}일</p>
                  <p className="text-[10px] text-text-tertiary mt-1">
                    {streak.doneToday ? '오늘 기록 완료' : streak.best > 0 ? `최고 ${streak.best}일` : '오늘 시작해보세요'}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-card col-span-2">
                  <p className="text-xs text-text-secondary mb-1">
                    <InfoTooltip text={AUTONOMY_SCORE_TOOLTIP}>자율성 지수</InfoTooltip>
                  </p>
                  <p className="text-xl font-extrabold text-warning tracking-tight">{autonomyScore}점</p>
                  {/* CPO-2 (2026-05-16): 단계명을 prominent하게 + 역량 description 1줄 추가 */}
                  <p className="text-xs font-bold text-primary mt-1">{rank.title}</p>
                  <p className="text-[10px] text-text-secondary mt-0.5 leading-tight line-clamp-2">{rank.description}</p>
                  <div className="mt-2 h-1 bg-background-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-warning rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-text-tertiary mt-1">
                    {pointsToNext !== null ? `다음 단계까지 ${pointsToNext}점` : '최종 단계 도달'}
                  </p>
                </div>
              </div>
              {/* CPO 검토(2026-05-16): 카드 클릭 시 인사이트 페이지 Δpain 섹션으로 이동.
                  InfoTooltip 추가로 카드 콘텐츠 자체에서 즉시 의미 surface. */}
              <div
                onClick={() => router.push('/insights#delta-pain')}
                className="bg-white rounded-2xl p-4 shadow-card cursor-pointer hover:border-primary hover:shadow-md border border-transparent transition-all"
              >
                <p className="text-xs text-text-secondary mb-1">
                  <InfoTooltip text={DELTA_PAIN_WEEKLY_TOOLTIP}>이번 주 고통 변화량 누적</InfoTooltip>
                </p>
                <p className="text-2xl font-extrabold text-primary tracking-tight">
                  {weeklyPositiveDeltaPain}
                  <span className="text-sm text-text-tertiary ml-1">점</span>
                </p>
                <p className="text-[10px] text-text-tertiary mt-1">7일 내 재평가 완료 기준 · 자세히 보기 →</p>
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

      {/* 단계 전이 인터스티셜 — Plan agent 권장안 A (2026-05-16). localStorage 1회 표시 가드 */}
      {stageTransition && (
        <StageTransitionModal
          previousRankTitle={stageTransition.previousTitle}
          currentRank={getRankResult(autonomyScore).rank}
          totalLogs={stageTransition.totalLogs}
          topDistortionKorean={stageTransition.topDistortionKorean}
          onDismiss={() => setStageTransition(null)}
        />
      )}
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
