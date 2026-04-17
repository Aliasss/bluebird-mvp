'use client';

import { usePathname, useRouter } from 'next/navigation';
import { BarChart2, Home, PenLine } from 'lucide-react';

const SHOW_ON = ['/dashboard', '/insights'];

export default function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();

  if (!SHOW_ON.includes(pathname)) return null;

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-background-tertiary pb-safe-bottom">
      <div className="flex items-center h-16 max-w-lg mx-auto px-8">

        {/* 홈 탭 */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex-1 flex flex-col items-center gap-0.5 pt-2 touch-manipulation"
        >
          <Home size={22} className={isActive('/dashboard') ? 'text-primary' : 'text-text-tertiary'} />
          <span className={`text-[11px] ${isActive('/dashboard') ? 'text-primary font-semibold' : 'text-text-tertiary'}`}>
            홈
          </span>
          {isActive('/dashboard') && <div className="w-1 h-1 bg-primary rounded-full mt-0.5" />}
        </button>

        {/* FAB — 기록 */}
        <div className="flex-1 flex flex-col items-center relative">
          <button
            onClick={() => router.push('/log')}
            className="absolute -top-7 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform touch-manipulation"
            aria-label="새 기록 시작"
          >
            <PenLine size={24} className="text-white" />
          </button>
          <span className="text-[11px] text-text-tertiary mt-6">기록</span>
        </div>

        {/* 인사이트 탭 */}
        <button
          onClick={() => router.push('/insights')}
          className="flex-1 flex flex-col items-center gap-0.5 pt-2 touch-manipulation"
        >
          <BarChart2 size={22} className={isActive('/insights') ? 'text-primary' : 'text-text-tertiary'} />
          <span className={`text-[11px] ${isActive('/insights') ? 'text-primary font-semibold' : 'text-text-tertiary'}`}>
            인사이트
          </span>
          {isActive('/insights') && <div className="w-1 h-1 bg-primary rounded-full mt-0.5" />}
        </button>

      </div>
    </nav>
  );
}
