'use client';

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('앱 에러 경계:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-sm text-center space-y-4">
        <p className="text-4xl">⚠️</p>
        <h1 className="text-2xl font-bold text-text-primary">문제가 발생했습니다</h1>
        <p className="text-sm text-text-secondary">
          일시적인 오류일 수 있습니다. 다시 시도해보세요.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="bg-primary text-white font-semibold py-3 px-6 rounded-xl"
          >
            다시 시도
          </button>
          <a
            href="/dashboard"
            className="bg-white border border-primary text-primary font-semibold py-3 px-6 rounded-xl"
          >
            대시보드
          </a>
        </div>
      </div>
    </main>
  );
}
