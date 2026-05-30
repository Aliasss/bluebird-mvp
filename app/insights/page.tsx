'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar, ReferenceLine,
} from 'recharts';
import { supabase } from '@/lib/supabase/client';
import { DistortionType, DistortionTypeKorean, type TriggerCategory } from '@/types';
import ArchetypePanel from '@/components/ui/ArchetypePanel';
import BottomTabBar from '@/components/ui/BottomTabBar';
import InfoTooltip from '@/components/ui/InfoTooltip';
import { AUTONOMY_SCORE_TOOLTIP } from '@/lib/copy/autonomy';
import PatternReport from '@/components/insights/PatternReport';
import { getArchetypeResultFromRows, type ArchetypeResult } from '@/lib/utils/archetype';
import type { PatternRow } from '@/lib/insights/pattern-report';

type Period = '7d' | '30d' | 'all';
type DistortionFreq = { name: string; count: number };
type AutonomyPoint = { date: string; score: number };
type IntensityPoint = { type: string; avgIntensity: number };
type DeltaDayPoint = { date: string; avgDelta: number };
type GrowthMetrics = {
  intensityDelta: number | null;   // % 변화 (음수 = 개선)
  completionDelta: number | null;  // % 포인트 변화 (양수 = 개선)
  mostImprovedType: string | null; // 가장 빈도 줄어든 왜곡 유형
};

const PERIOD_LABELS: Record<Period, string> = { '7d': '7일', '30d': '30일', 'all': '전체' };

function getSinceDates(period: Period): { since: string | null; prevSince: string | null; prevUntil: string | null } {
  if (period === 'all') return { since: null, prevSince: null, prevUntil: null };
  const days = period === '7d' ? 7 : 30;
  const now = new Date();
  const since = new Date(now.getTime() - days * 86400000).toISOString();
  const prevUntil = since;
  const prevSince = new Date(now.getTime() - days * 2 * 86400000).toISOString();
  return { since, prevSince, prevUntil };
}

export default function InsightsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('30d');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const [totalAnalyses, setTotalAnalyses] = useState(0);
  const [topDistortion, setTopDistortion] = useState<string>('—');
  const [completionRate, setCompletionRate] = useState<number>(0);
  const [distortionFreq, setDistortionFreq] = useState<DistortionFreq[]>([]);
  const [autonomyTrend, setAutonomyTrend] = useState<AutonomyPoint[]>([]);
  const [intensityData, setIntensityData] = useState<IntensityPoint[]>([]);
  const [growth, setGrowth] = useState<GrowthMetrics>({ intensityDelta: null, completionDelta: null, mostImprovedType: null });
  const [archetypeResult, setArchetypeResult] = useState<ArchetypeResult | null>(null);
  const [deltaPainSeries, setDeltaPainSeries] = useState<DeltaDayPoint[]>([]);
  const [patternRows, setPatternRows] = useState<PatternRow[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { since, prevSince, prevUntil } = getSinceDates(period);

      // 현재 기간 분석 데이터 (왜곡 빈도·강도 계산용 — 한 기록에서 왜곡 여러 개면 analysis 행도 여러 개)
      let analysisQuery = supabase
        .from('analysis')
        .select('distortion_type, intensity, created_at, logs!inner(user_id)')
        .eq('logs.user_id', user.id);
      if (since) analysisQuery = analysisQuery.gte('created_at', since);

      const { data: analysisRows } = await analysisQuery;
      const rows = (analysisRows ?? []) as Array<{ distortion_type: string; intensity: number; created_at: string }>;

      // 2026-05-30 CTO 수정: "총 분석 횟수"는 분석을 돌린 횟수(= 기록 수)를 센다.
      //   기존엔 analysis 행 수(rows.length)를 셌는데, 한 기록에서 왜곡이 2개 탐지되면 행이 2개라
      //   /me "전체 로그"(logs 행 수)와 어긋났다(11 vs 12). logs 행 수로 통일해 두 페이지 숫자를 일치시킨다.
      //   탐지된 왜곡 총 건수(rows.length)는 아래 "왜곡 유형 분포" 막대그래프 합계로 그대로 확인 가능.
      let analysisCountQuery = supabase
        .from('logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (since) analysisCountQuery = analysisCountQuery.gte('created_at', since);
      const { count: analysisEventCount } = await analysisCountQuery;
      setTotalAnalyses(analysisEventCount ?? 0);

      const freqMap: Record<string, number> = {};
      const intensityMap: Record<string, number[]> = {};
      rows.forEach((r) => {
        if (!r.distortion_type) return;
        freqMap[r.distortion_type] = (freqMap[r.distortion_type] ?? 0) + 1;
        if (!intensityMap[r.distortion_type]) intensityMap[r.distortion_type] = [];
        intensityMap[r.distortion_type].push(r.intensity);
      });

      const allTypes = Object.values(DistortionType);
      setDistortionFreq(allTypes.map((t) => ({ name: DistortionTypeKorean[t], count: freqMap[t] ?? 0 })));

      const topEntry = Object.entries(freqMap).sort((a, b) => b[1] - a[1])[0];
      setTopDistortion(topEntry ? DistortionTypeKorean[topEntry[0] as DistortionType] ?? topEntry[0] : '—');

      setIntensityData(allTypes.map((t) => {
        const vals = intensityMap[t] ?? [];
        const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        return { type: DistortionTypeKorean[t], avgIntensity: parseFloat(avg.toFixed(2)) };
      }));

      // 자율성 지수 추이
      let ivQuery = supabase
        .from('intervention')
        .select('autonomy_score, created_at, logs!inner(user_id)')
        .eq('logs.user_id', user.id)
        .not('autonomy_score', 'is', null)
        .order('created_at', { ascending: true });
      if (since) ivQuery = ivQuery.gte('created_at', since);

      const { data: interventions } = await ivQuery;
      const ivRows = (interventions ?? []) as Array<{ autonomy_score: number; created_at: string }>;

      let cumulative = 0;
      setAutonomyTrend(ivRows.map((r) => {
        cumulative += r.autonomy_score;
        return { date: new Date(r.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }), score: cumulative };
      }));

      // 완료율
      let totalQuery = supabase.from('intervention').select('log_id, logs!inner(user_id)', { count: 'exact', head: true }).eq('logs.user_id', user.id);
      let completedQuery = supabase.from('intervention').select('log_id, logs!inner(user_id)', { count: 'exact', head: true }).eq('is_completed', true).eq('logs.user_id', user.id);
      if (since) { totalQuery = totalQuery.gte('created_at', since); completedQuery = completedQuery.gte('created_at', since); }
      const [{ count: total }, { count: completed }] = await Promise.all([totalQuery, completedQuery]);
      const currCompletionRate = total && total > 0 ? Math.round(((completed ?? 0) / total) * 100) : 0;
      setCompletionRate(currCompletionRate);

      // 성장 지표 (전기간 비교 — period가 'all'이면 skip)
      if (prevSince && prevUntil) {
        const [{ data: prevAnalysis }, { count: prevTotal }, { count: prevCompleted }] = await Promise.all([
          supabase.from('analysis').select('distortion_type, intensity').eq('logs.user_id', user.id).gte('created_at', prevSince).lt('created_at', prevUntil).select('distortion_type, intensity, logs!inner(user_id)'),
          supabase.from('intervention').select('log_id, logs!inner(user_id)', { count: 'exact', head: true }).eq('logs.user_id', user.id).gte('created_at', prevSince).lt('created_at', prevUntil),
          supabase.from('intervention').select('log_id, logs!inner(user_id)', { count: 'exact', head: true }).eq('is_completed', true).eq('logs.user_id', user.id).gte('created_at', prevSince).lt('created_at', prevUntil),
        ]);

        const prevRows = (prevAnalysis ?? []) as Array<{ distortion_type: string; intensity: number }>;

        // 평균 왜곡 강도 delta
        const currAvgIntensity = rows.length ? rows.reduce((s, r) => s + r.intensity, 0) / rows.length : null;
        const prevAvgIntensity = prevRows.length ? prevRows.reduce((s, r) => s + r.intensity, 0) / prevRows.length : null;
        const intensityDelta = currAvgIntensity !== null && prevAvgIntensity !== null && prevAvgIntensity > 0
          ? Math.round(((currAvgIntensity - prevAvgIntensity) / prevAvgIntensity) * 100)
          : null;

        // 완료율 delta (포인트 차이)
        const prevCompletionRate = prevTotal && prevTotal > 0 ? Math.round(((prevCompleted ?? 0) / prevTotal) * 100) : null;
        const completionDelta = prevCompletionRate !== null ? currCompletionRate - prevCompletionRate : null;

        // 가장 개선된 왜곡 유형
        const prevFreqMap: Record<string, number> = {};
        prevRows.forEach((r) => { prevFreqMap[r.distortion_type] = (prevFreqMap[r.distortion_type] ?? 0) + 1; });
        const improvements = allTypes
          .map((t) => ({ type: t, delta: (prevFreqMap[t] ?? 0) - (freqMap[t] ?? 0) }))
          .filter((x) => x.delta > 0)
          .sort((a, b) => b.delta - a.delta);
        const mostImprovedType = improvements[0] ? DistortionTypeKorean[improvements[0].type] : null;

        setGrowth({ intensityDelta, completionDelta, mostImprovedType });
      } else {
        setGrowth({ intensityDelta: null, completionDelta: null, mostImprovedType: null });
      }

      // 아키타입 계산 (전체 기간 기준 — period 무관, distortion_type=null placeholder 제외)
      const { data: allAnalysis } = await supabase
        .from('analysis')
        .select('distortion_type, logs!inner(user_id)')
        .eq('logs.user_id', user.id);

      const allRows = (allAnalysis ?? []) as Array<{ distortion_type: string | null }>;
      setArchetypeResult(getArchetypeResultFromRows(allRows));

      // Δpain 시계열: reevaluated_at 일자별 평균 Δpain (재평가 없는 건 제외)
      let deltaQuery = supabase
        .from('intervention')
        .select('reevaluated_at, reevaluated_pain_score, logs!inner(pain_score, user_id)')
        .eq('logs.user_id', user.id)
        .not('reevaluated_pain_score', 'is', null)
        .order('reevaluated_at', { ascending: true });
      if (since) deltaQuery = deltaQuery.gte('reevaluated_at', since);

      const { data: deltaRows } = await deltaQuery;
      const deltaByDay: Record<string, { sum: number; count: number }> = {};
      for (const row of deltaRows ?? []) {
        const logsField = row.logs as unknown as
          | { pain_score: number | null }
          | Array<{ pain_score: number | null }>;
        const log = Array.isArray(logsField) ? logsField[0] : logsField;
        const initial = log?.pain_score;
        const re = (row as { reevaluated_pain_score: number | null }).reevaluated_pain_score;
        if (initial == null || re == null) continue;
        const day = (row.reevaluated_at as string).slice(0, 10);
        if (!deltaByDay[day]) deltaByDay[day] = { sum: 0, count: 0 };
        deltaByDay[day].sum += initial - re;
        deltaByDay[day].count += 1;
      }
      setDeltaPainSeries(
        Object.keys(deltaByDay)
          .sort()
          .map((date) => ({
            date,
            avgDelta: Math.round((deltaByDay[date].sum / deltaByDay[date].count) * 10) / 10,
          }))
      );

      // Phase 1.3: 패턴 리포트 데이터 — logs + analysis + intervention 조인 단일 쿼리.
      // trigger_category가 null인 로그(마이그레이션 06 적용 전)는 제외.
      let patternQuery = supabase
        .from('logs')
        .select(
          'id, trigger_category, pain_score, created_at, analysis(distortion_type, intensity), intervention(reevaluated_pain_score)'
        )
        .eq('user_id', user.id)
        .not('trigger_category', 'is', null);
      if (since) patternQuery = patternQuery.gte('created_at', since);
      const { data: patternLogs } = await patternQuery;

      const newPatternRows: PatternRow[] = [];
      for (const log of patternLogs ?? []) {
        const cat = (log as { trigger_category: TriggerCategory | null }).trigger_category;
        if (!cat) continue;
        const distortionEntries = ((log as { analysis?: unknown }).analysis ?? []) as Array<{
          distortion_type: string | null;
          intensity: number | null;
        }>;
        const validDistortions = distortionEntries.filter(
          (d) => d.distortion_type != null && d.intensity != null
        );
        if (validDistortions.length === 0) continue;
        let dominant = validDistortions[0];
        for (let i = 1; i < validDistortions.length; i++) {
          if ((validDistortions[i].intensity ?? 0) > (dominant.intensity ?? 0)) {
            dominant = validDistortions[i];
          }
        }
        const initialPain = (log as { pain_score: number | null }).pain_score;
        const interventionField = (log as { intervention?: unknown }).intervention;
        const intervention = Array.isArray(interventionField)
          ? (interventionField[0] as { reevaluated_pain_score: number | null } | undefined)
          : (interventionField as { reevaluated_pain_score: number | null } | null);
        const re = intervention?.reevaluated_pain_score ?? null;
        const deltaPain =
          initialPain != null && re != null && Number.isFinite(initialPain) && Number.isFinite(re)
            ? initialPain - re
            : null;

        newPatternRows.push({
          category: cat,
          distortion: dominant.distortion_type as DistortionType,
          deltaPain,
        });
      }
      setPatternRows(newPatternRows);

      setLoading(false);
    };
    load();
  }, [router, period]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </main>
    );
  }

  const periodLabel = PERIOD_LABELS[period];

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background border-b border-background-tertiary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">Project Bluebird</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/manual')} className="text-sm text-text-secondary hover:underline transition-colors">Manual</button>
            <button onClick={handleLogout} className="text-sm text-text-secondary hover:text-primary transition-colors">로그아웃</button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 space-y-6">

        {/* 사고 지문 헤드라인 (v2) */}
        <div>
          <p className="text-[13px] font-extrabold tracking-tight text-primary">인사이트</p>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">반복되는 사고 패턴</h2>
          <p className="mt-1 text-sm text-text-secondary">
            어떤 상황에서 어떤 왜곡이 반복되는지 보여드려요.
          </p>
        </div>

        {/* 아키타입 패널 — 클릭 시 5가지 아키타입 전체 비교 페이지로 */}
        <ArchetypePanel
          result={archetypeResult}
          linkHref={
            archetypeResult
              ? `/insights/archetypes?current=${archetypeResult.archetype.id}`
              : undefined
          }
        />

        {/* 기간 필터 */}
        <div className="flex gap-2">
          {(['7d', '30d', 'all'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                period === p ? 'bg-primary text-white' : 'bg-white border border-background-tertiary text-text-secondary hover:border-primary'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {/* 성장 지표 카드 */}
        {period !== 'all' ? (
          <div className="grid grid-cols-3 gap-3">
            {/* 평균 왜곡 강도 변화 */}
            <div className="bg-white border border-background-tertiary rounded-card p-4 text-center">
              <p className="text-xs text-text-secondary mb-1">왜곡 강도 변화</p>
              {growth.intensityDelta !== null ? (
                <p className={`text-lg font-bold ${growth.intensityDelta < 0 ? 'text-success' : growth.intensityDelta > 0 ? 'text-danger' : 'text-text-secondary'}`}>
                  {growth.intensityDelta > 0 ? '+' : ''}{growth.intensityDelta}%
                </p>
              ) : (
                <p className="text-sm text-text-secondary mt-1">데이터 부족</p>
              )}
              <p className="text-[10px] text-text-tertiary mt-0.5">전{periodLabel} 대비</p>
            </div>
            {/* 완료율 변화 */}
            <div className="bg-white border border-background-tertiary rounded-card p-4 text-center">
              <p className="text-xs text-text-secondary mb-1">완료율 변화</p>
              {growth.completionDelta !== null ? (
                <p className={`text-lg font-bold ${growth.completionDelta > 0 ? 'text-success' : growth.completionDelta < 0 ? 'text-danger' : 'text-text-secondary'}`}>
                  {growth.completionDelta > 0 ? '+' : ''}{growth.completionDelta}%p
                </p>
              ) : (
                <p className="text-sm text-text-secondary mt-1">데이터 부족</p>
              )}
              <p className="text-[10px] text-text-tertiary mt-0.5">전{periodLabel} 대비</p>
            </div>
            {/* 가장 개선된 왜곡 */}
            <div className="bg-white border border-background-tertiary rounded-card p-4 text-center">
              <p className="text-xs text-text-secondary mb-1">가장 개선</p>
              <p className="text-xs font-bold text-success leading-tight mt-1">
                {growth.mostImprovedType ?? '—'}
              </p>
              <p className="text-[10px] text-text-tertiary mt-0.5">빈도 감소 왜곡</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-text-secondary text-center">전체 기간 선택 시 비교 지표를 표시할 수 없습니다.</p>
        )}

        {/* 요약 카드 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-background-tertiary rounded-card p-4 text-center">
            <p className="text-xs text-text-secondary mb-1">총 분석 횟수</p>
            <p className="text-2xl font-bold text-text-primary">{totalAnalyses}</p>
          </div>
          <div className="bg-white border border-background-tertiary rounded-card p-4 text-center">
            <p className="text-xs text-text-secondary mb-1">주요 왜곡</p>
            <p className="text-sm font-bold text-primary leading-tight mt-1">{topDistortion}</p>
          </div>
          <div className="bg-white border border-background-tertiary rounded-card p-4 text-center">
            <p className="text-xs text-text-secondary mb-1">행동 완료율</p>
            <p className="text-2xl font-bold text-text-primary">{completionRate}%</p>
          </div>
        </div>

        {/* Phase 1.3: 개인화 패턴 리포트 */}
        <PatternReport rows={patternRows} periodLabel={periodLabel} />

        {/* 왜곡 유형 분포 */}
        <div className="bg-white border border-background-tertiary rounded-card p-4 sm:p-6">
          <h2 className="text-base font-bold text-text-primary mb-4">왜곡 유형 분포 ({periodLabel})</h2>
          {distortionFreq.every((d) => d.count === 0) ? (
            <p className="text-sm text-text-secondary text-center py-8">아직 분석 데이터가 없습니다.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={distortionFreq} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="탐지 횟수" fill="#1E40AF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 text-right">
                <Link
                  href="/manual#dbug-03"
                  className="text-xs text-primary hover:underline"
                >
                  각 왜곡이 무슨 뜻인가요? 매뉴얼 보기 →
                </Link>
              </div>
            </>
          )}
        </div>

        {/* 자율성 지수 추이 */}
        <div className="bg-white border border-background-tertiary rounded-card p-4 sm:p-6">
          <h2 className="text-base font-bold text-text-primary mb-4">
            <InfoTooltip text={AUTONOMY_SCORE_TOOLTIP}>자율성 지수</InfoTooltip>
            {' '}누적 추이 ({periodLabel})
          </h2>
          {autonomyTrend.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-8">행동을 완료하면 추이가 표시됩니다.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              {/* CPO 검토(2026-05-16): LineChart → AreaChart. 누적 데이터의 본질을 채워진 영역으로 표현. 단계 marker와 시각적 정합 ↑ */}
              <AreaChart data={autonomyTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="autonomyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                {/* CMO-4 (2026-05-16) 단계 전이 marker — 누적 score 임계 수평선. 차트 영역 안에 들어오는 단계만 자동 노출 */}
                <ReferenceLine y={50} stroke="#94A3B8" strokeDasharray="2 4" label={{ value: '분류', position: 'right', fontSize: 10, fill: '#64748B' }} />
                <ReferenceLine y={150} stroke="#94A3B8" strokeDasharray="2 4" label={{ value: '재구성', position: 'right', fontSize: 10, fill: '#64748B' }} />
                <ReferenceLine y={300} stroke="#94A3B8" strokeDasharray="2 4" label={{ value: '검증', position: 'right', fontSize: 10, fill: '#64748B' }} />
                <ReferenceLine y={500} stroke="#94A3B8" strokeDasharray="2 4" label={{ value: '운영', position: 'right', fontSize: 10, fill: '#64748B' }} />
                <Area type="monotone" dataKey="score" name="자율성 지수" stroke="#06B6D4" strokeWidth={2} fill="url(#autonomyGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 왜곡 강도 레이더 */}
        <div className="bg-white border border-background-tertiary rounded-card p-4 sm:p-6">
          <h2 className="text-base font-bold text-text-primary mb-4">왜곡 유형별 평균 강도 ({periodLabel})</h2>
          {intensityData.every((d) => d.avgIntensity === 0) ? (
            <p className="text-sm text-text-secondary text-center py-8">아직 분석 데이터가 없습니다.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={intensityData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="type" tick={{ fontSize: 11 }} />
                <Radar name="평균 강도" dataKey="avgIntensity" stroke="#1E40AF" fill="#1E40AF" fillOpacity={0.25} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Δpain 시계열 — id="delta-pain" anchor (대시보드 고통 카드 클릭 시 scroll 목표) */}
        <div id="delta-pain" className="bg-white border border-background-tertiary rounded-card p-4 sm:p-6 scroll-mt-20">
          <div className="space-y-1 mb-4">
            <h2 className="text-base font-bold text-text-primary">인지 유연성 변화 (고통 변화량)</h2>
            <p className="text-xs text-text-secondary">양수면 고통 감소, 음수면 증가. 0 기준선은 변화 없음.</p>
          </div>
          {deltaPainSeries.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-8">
              아직 재평가 기록이 부족해요. 몇 번 더 돌아봐주세요.
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={deltaPainSeries} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[-4, 4]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="avgDelta" name="평균 고통 변화량" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 텍스트 인사이트 */}
        <div className="bg-background-secondary border border-background-tertiary rounded-card p-4 sm:p-6 space-y-2">
          <h2 className="text-base font-bold text-text-primary mb-2">요약 인사이트</h2>
          <p className="text-sm text-text-secondary">
            최근 {periodLabel}간 가장 자주 나타난 왜곡은 <span className="font-semibold text-text-primary">{topDistortion}</span>입니다.
          </p>
          <p className="text-sm text-text-secondary">
            행동 확약 완료율은 <span className="font-semibold text-text-primary">{completionRate}%</span>입니다.
          </p>
        </div>

      </div>
      <BottomTabBar />
    </main>
  );
}
