'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import { supabase } from '@/lib/supabase/client';
import { DistortionType, DistortionTypeKorean } from '@/types';

type DistortionFreq = { name: string; count: number };
type AutonomyPoint = { date: string; score: number };
type IntensityPoint = { type: string; avgIntensity: number };

export default function InsightsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };
  const [totalAnalyses, setTotalAnalyses] = useState(0);
  const [topDistortion, setTopDistortion] = useState<string>('—');
  const [_avgAutonomy, setAvgAutonomy] = useState<number>(0);
  const [completionRate, setCompletionRate] = useState<number>(0);
  const [distortionFreq, setDistortionFreq] = useState<DistortionFreq[]>([]);
  const [autonomyTrend, setAutonomyTrend] = useState<AutonomyPoint[]>([]);
  const [intensityData, setIntensityData] = useState<IntensityPoint[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const since = thirtyDaysAgo.toISOString();

      // 왜곡 분포 데이터 (최근 30일)
      const { data: analysisRows } = await supabase
        .from('analysis')
        .select('distortion_type, intensity, created_at, logs!inner(user_id)')
        .eq('logs.user_id', user.id)
        .gte('created_at', since);

      const rows = (analysisRows ?? []) as Array<{
        distortion_type: string;
        intensity: number;
        created_at: string;
      }>;

      setTotalAnalyses(rows.length);

      // 왜곡 유형별 빈도
      const freqMap: Record<string, number> = {};
      const intensityMap: Record<string, number[]> = {};
      rows.forEach((r) => {
        freqMap[r.distortion_type] = (freqMap[r.distortion_type] ?? 0) + 1;
        if (!intensityMap[r.distortion_type]) intensityMap[r.distortion_type] = [];
        intensityMap[r.distortion_type].push(r.intensity);
      });

      const allTypes = Object.values(DistortionType);
      const freqData: DistortionFreq[] = allTypes.map((t) => ({
        name: DistortionTypeKorean[t],
        count: freqMap[t] ?? 0,
      }));
      setDistortionFreq(freqData);

      const topEntry = Object.entries(freqMap).sort((a, b) => b[1] - a[1])[0];
      setTopDistortion(
        topEntry ? DistortionTypeKorean[topEntry[0] as DistortionType] ?? topEntry[0] : '—'
      );

      const intensityPoints: IntensityPoint[] = allTypes.map((t) => {
        const vals = intensityMap[t] ?? [];
        const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        return { type: DistortionTypeKorean[t], avgIntensity: parseFloat(avg.toFixed(2)) };
      });
      setIntensityData(intensityPoints);

      // 자율성 지수 추이
      const { data: interventions } = await supabase
        .from('intervention')
        .select('autonomy_score, created_at, logs!inner(user_id)')
        .eq('logs.user_id', user.id)
        .not('autonomy_score', 'is', null)
        .order('created_at', { ascending: true });

      const ivRows = (interventions ?? []) as Array<{ autonomy_score: number; created_at: string }>;

      let cumulative = 0;
      const trendData: AutonomyPoint[] = ivRows.map((r) => {
        cumulative += r.autonomy_score;
        return {
          date: new Date(r.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
          score: cumulative,
        };
      });
      setAutonomyTrend(trendData);
      setAvgAutonomy(ivRows.length ? Math.round(cumulative / ivRows.length) : 0);

      // 완료율
      const { count: total } = await supabase
        .from('intervention')
        .select('log_id, logs!inner(user_id)', { count: 'exact', head: true })
        .eq('logs.user_id', user.id);
      const { count: completed } = await supabase
        .from('intervention')
        .select('log_id, logs!inner(user_id)', { count: 'exact', head: true })
        .eq('is_completed', true)
        .eq('logs.user_id', user.id);
      setCompletionRate(total && total > 0 ? Math.round(((completed ?? 0) / total) * 100) : 0);

      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-white border-b border-background-tertiary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">Project Bluebird</h1>
          <div className="flex items-center gap-4">
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 space-y-6">

        {/* 요약 카드 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-background-tertiary rounded-xl p-4 text-center">
            <p className="text-xs text-text-secondary mb-1">총 분석 횟수</p>
            <p className="text-2xl font-bold text-text-primary">{totalAnalyses}</p>
          </div>
          <div className="bg-white border border-background-tertiary rounded-xl p-4 text-center">
            <p className="text-xs text-text-secondary mb-1">주요 왜곡</p>
            <p className="text-sm font-bold text-primary leading-tight mt-1">{topDistortion}</p>
          </div>
          <div className="bg-white border border-background-tertiary rounded-xl p-4 text-center">
            <p className="text-xs text-text-secondary mb-1">행동 완료율</p>
            <p className="text-2xl font-bold text-text-primary">{completionRate}%</p>
          </div>
        </div>

        {/* 왜곡 유형 분포 */}
        <div className="bg-white border border-background-tertiary rounded-xl p-4 sm:p-6">
          <h2 className="text-base font-bold text-text-primary mb-4">왜곡 유형 분포 (최근 30일)</h2>
          {distortionFreq.every((d) => d.count === 0) ? (
            <p className="text-sm text-text-secondary text-center py-8">아직 분석 데이터가 없습니다.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={distortionFreq} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="탐지 횟수" fill="#1E40AF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 자율성 지수 추이 */}
        <div className="bg-white border border-background-tertiary rounded-xl p-4 sm:p-6">
          <h2 className="text-base font-bold text-text-primary mb-4">자율성 지수 누적 추이</h2>
          {autonomyTrend.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-8">행동을 완료하면 추이가 표시됩니다.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={autonomyTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" name="자율성 지수" stroke="#06B6D4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 왜곡 강도 레이더 */}
        <div className="bg-white border border-background-tertiary rounded-xl p-4 sm:p-6">
          <h2 className="text-base font-bold text-text-primary mb-4">왜곡 유형별 평균 강도</h2>
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

        {/* 텍스트 인사이트 */}
        <div className="bg-background-secondary border border-background-tertiary rounded-xl p-4 sm:p-6 space-y-2">
          <h2 className="text-base font-bold text-text-primary mb-2">요약 인사이트</h2>
          <p className="text-sm text-text-secondary">
            최근 30일간 가장 자주 나타난 왜곡은 <span className="font-semibold text-text-primary">{topDistortion}</span>입니다.
          </p>
          <p className="text-sm text-text-secondary">
            행동 확약 완료율은 <span className="font-semibold text-text-primary">{completionRate}%</span>입니다.
          </p>
        </div>

      </div>
    </main>
  );
}
