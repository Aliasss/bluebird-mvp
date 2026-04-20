'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, CheckCircle, Star, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import BottomTabBar from '@/components/ui/BottomTabBar';
import type { User } from '@supabase/supabase-js';

export default function MePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalLogs: 0, completedActions: 0, autonomyScore: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);

      const [
        { count: totalLogs },
        { count: completedActions },
        { data: interventionsData },
      ] = await Promise.all([
        supabase.from('logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase
          .from('intervention')
          .select('log_id, logs!inner(user_id)', { count: 'exact', head: true })
          .eq('is_completed', true)
          .eq('logs.user_id', user.id),
        supabase
          .from('intervention')
          .select('autonomy_score, logs!inner(user_id)')
          .eq('logs.user_id', user.id)
          .not('autonomy_score', 'is', null),
      ]);

      const totalScore = interventionsData?.reduce((sum, item) => sum + (item.autonomy_score || 0), 0) || 0;
      setStats({ totalLogs: totalLogs || 0, completedActions: completedActions || 0, autonomyScore: totalScore });
      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const name = user?.email?.split('@')[0] ?? '';

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
          <h1 className="text-lg font-bold text-text-primary">나</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5 pb-28 space-y-5">

        {/* 프로필 */}
        <div className="bg-white rounded-2xl p-5 border border-background-tertiary">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">{name[0]?.toUpperCase()}</span>
            </div>
            <div>
              <p className="font-semibold text-text-primary">{name} 항해사님</p>
              <p className="text-xs text-text-secondary">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* 통계 */}
        <div>
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2 px-1">항해 기록</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-background-tertiary text-center">
              <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <BookOpen size={16} className="text-primary" />
              </div>
              <p className="text-xl font-bold text-text-primary">{stats.totalLogs}</p>
              <p className="text-[10px] text-text-secondary mt-0.5">전체 로그</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-background-tertiary text-center">
              <div className="w-8 h-8 bg-success bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle size={16} className="text-success" />
              </div>
              <p className="text-xl font-bold text-text-primary">{stats.completedActions}</p>
              <p className="text-[10px] text-text-secondary mt-0.5">완료한 행동</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-background-tertiary text-center">
              <div className="w-8 h-8 bg-warning bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star size={16} className="text-warning" />
              </div>
              <p className="text-xl font-bold text-text-primary">{stats.autonomyScore}</p>
              <p className="text-[10px] text-text-secondary mt-0.5">자율성 지수</p>
            </div>
          </div>
        </div>

        {/* 메뉴 */}
        <div>
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2 px-1">탐색</p>
          <div className="bg-white rounded-2xl border border-background-tertiary divide-y divide-background-tertiary overflow-hidden">
            {[
              { label: '인사이트', sub: '인지 아키타입 & 분석 차트', href: '/insights' },
              { label: '체크인 기록', sub: '모닝·이브닝 체크인 히스토리', href: '/checkin/history' },
              { label: '매뉴얼', sub: '서비스 이용 가이드', href: '/manual' },
              { label: '블루버드 철학', sub: '인지 왜곡이 왜 중요한가요?', href: '/our-philosophy' },
              { label: '홈 화면에 추가', sub: 'PWA 설치 가이드', href: '/install' },
            ].map(({ label, sub, href }) => (
              <button
                key={href}
                onClick={() => router.push(href)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-background-secondary transition-colors touch-manipulation"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">{label}</p>
                  <p className="text-xs text-text-secondary">{sub}</p>
                </div>
                <ChevronRight size={16} className="text-text-tertiary flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* 로그아웃 */}
        <button
          onClick={handleLogout}
          className="w-full py-3 text-sm text-danger font-medium border border-danger border-opacity-30 rounded-2xl"
        >
          로그아웃
        </button>
      </div>

      <BottomTabBar />
    </main>
  );
}
