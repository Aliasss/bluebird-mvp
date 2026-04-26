'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { evaluateDeletionState, purgeExpiredAccount } from '@/lib/auth/account-deletion';

async function routeAfterAuth(router: ReturnType<typeof useRouter>) {
  const { data: { user } } = await supabase.auth.getUser();
  const action = evaluateDeletionState(user);

  if (action.kind === 'expired') {
    await purgeExpiredAccount();
    router.push('/auth/login?deleted=expired');
    return;
  }

  if (action.kind === 'recover') {
    router.push('/account/recover');
    return;
  }

  router.push('/dashboard');
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error_description = searchParams.get('error_description');

        if (error_description) {
          setError(error_description);
          timer = setTimeout(() => router.push('/auth/login'), 3000);
          return;
        }

        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            // 코드 교환은 실패했지만 Supabase가 이미 세션을 만들어 두었을 수 있음
            // (PKCE race / 중복 콜백 등). 세션이 이미 존재하면 silent recovery.
            const { data: { session: fallbackSession } } = await supabase.auth.getSession();
            if (fallbackSession) {
              await routeAfterAuth(router);
              return;
            }
            console.error('토큰 교환 실패:', exchangeError);
            setError('인증에 실패했습니다.');
            timer = setTimeout(() => router.push('/auth/login'), 3000);
            return;
          }

          if (data.session) {
            await routeAfterAuth(router);
            return;
          }
        }

        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          await routeAfterAuth(router);
        } else {
          router.push('/auth/login');
        }
      } catch (err: any) {
        console.error('Callback 처리 중 오류:', err);
        setError(err.message || '인증 처리 중 오류가 발생했습니다.');
        timer = setTimeout(() => router.push('/auth/login'), 3000);
      }
    };

    handleCallback();
    return () => clearTimeout(timer);
  }, [router, searchParams]);

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="text-5xl">⚠️</div>
            <p className="text-danger font-semibold">{error}</p>
            <p className="text-text-secondary text-sm">로그인 페이지로 이동합니다...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-text-secondary">인증 처리 중...</p>
          </>
        )}
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-text-secondary">인증 처리 중...</p>
          </div>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
