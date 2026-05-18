import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { isAdminEmail } from '@/lib/auth/admin';
import ApplicationCard, { type Application } from './ApplicationCard';

// 어드민 응모 검토 페이지 — 2026-05-18.
//
// 3중 게이트:
//   (1) proxy.ts /admin 보호 + admin email 검사 (선제 차단)
//   (2) server component 본문에서 user.email cross-check (이중 안전)
//   (3) API 라우트(/api/admin/approve|reject)에서도 cross-check (실제 액션 시점)
//
// 데이터 조회: service_role (RLS 우회 — 모든 응모를 검토하기 위함).
// server component 라 클라이언트에 service_role 노출 없음.

export const dynamic = 'force-dynamic'; // 매 요청마다 최신 데이터
export const metadata = {
  title: '응모 검토 | Admin',
};

const STATUS_LABEL: Record<Application['status'], string> = {
  pending: '대기',
  selected: '선발',
  rejected: '미선발',
  withdrawn: '철회',
};

export default async function AdminApplicationsPage() {
  // 이중 게이트
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    redirect('/');
  }

  // service_role 로 전체 응모 조회 (RLS 우회)
  const service = createServiceRoleClient();
  const { data: applications, error } = await service
    .from('evangelist_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-background p-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-danger">응모 조회 실패: {error.message}</p>
        </div>
      </main>
    );
  }

  const apps = (applications ?? []) as Application[];
  const stats = {
    pending: apps.filter((a) => a.status === 'pending').length,
    selected: apps.filter((a) => a.status === 'selected').length,
    rejected: apps.filter((a) => a.status === 'rejected').length,
    withdrawn: apps.filter((a) => a.status === 'withdrawn').length,
  };

  // 정렬: 대기 먼저, 그 다음 최신순
  const sorted = [...apps].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-white border-b border-background-tertiary">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-bold text-primary tracking-tight">
              Project Bluebird
            </Link>
            <span className="text-xs font-semibold uppercase tracking-widest text-warning">
              Admin
            </span>
          </div>
          <Link href="/dashboard" className="text-xs text-text-tertiary hover:text-text-secondary">
            ← 서비스로
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <section>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">응모 검토</h1>
          <p className="text-sm text-text-secondary mt-1">
            로그인 운영자: <span className="font-semibold">{user.email}</span>
          </p>
        </section>

        <section className="grid grid-cols-4 gap-3">
          <StatCard label="대기" value={stats.pending} color="warning" />
          <StatCard label="선발" value={stats.selected} color="success" />
          <StatCard label="미선발" value={stats.rejected} color="text-tertiary" />
          <StatCard label="철회" value={stats.withdrawn} color="text-tertiary" />
        </section>

        <section className="space-y-3">
          {sorted.length === 0 ? (
            <div className="bg-white border border-background-tertiary rounded-2xl p-8 text-center text-sm text-text-secondary">
              아직 접수된 응모가 없습니다.
            </div>
          ) : (
            sorted.map((app) => (
              <ApplicationCard key={app.id} app={app} statusLabel={STATUS_LABEL[app.status]} />
            ))
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'warning' | 'success' | 'text-tertiary';
}) {
  const colorClass =
    color === 'warning' ? 'text-warning' : color === 'success' ? 'text-success' : 'text-text-tertiary';
  return (
    <div className="bg-white border border-background-tertiary rounded-2xl p-3 text-center">
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
      <p className="text-[11px] text-text-secondary mt-0.5">{label}</p>
    </div>
  );
}
