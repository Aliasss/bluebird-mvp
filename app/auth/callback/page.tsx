'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { evaluateDeletionState, purgeExpiredAccount } from '@/lib/auth/account-deletion';

type Router = ReturnType<typeof useRouter>;

async function routeAfterAuth(router: Router) {
  const { data: { user } } = await supabase.auth.getUser();
  const action = evaluateDeletionState(user);

  if (action.kind === 'expired') {
    await purgeExpiredAccount();
    router.replace('/auth/login?deleted=expired');
    return;
  }

  if (action.kind === 'recover') {
    router.replace('/account/recover');
    return;
  }

  router.replace('/dashboard');
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    const error_description = searchParams.get('error_description');
    if (error_description) {
      setError(error_description);
      const t = setTimeout(() => router.replace('/auth/login'), 3000);
      return () => clearTimeout(t);
    }

    // detectSessionInUrl이 자동으로 code 처리 → SIGNED_IN 이벤트로 받음.
    const { data: subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (handledRef.current) return;
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        handledRef.current = true;
        await routeAfterAuth(router);
      }
    });

    // 안전망: 자동 감지가 누락된 경우(이미 세션이 있어 SIGNED_IN 이벤트가 없거나 PKCE race)
    // 1초 후 직접 세션 확인 + 6초 후 최종 timeout.
    const probe = setTimeout(async () => {
      if (handledRef.current) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        handledRef.current = true;
        await routeAfterAuth(router);
      }
    }, 1000);

    const fail = setTimeout(() => {
      if (handledRef.current) return;
      setError('인증 세션을 만들지 못했습니다.');
      setTimeout(() => router.replace('/auth/login'), 2500);
    }, 6000);

    return () => {
      subscription.subscription.unsubscribe();
      clearTimeout(probe);
      clearTimeout(fail);
    };
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
