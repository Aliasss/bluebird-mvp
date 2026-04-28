import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import BottomTabBar from '@/components/ui/BottomTabBar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Project Bluebird',
  description: 'AI 기반 인지 패턴 분석으로 사고 습관을 관찰하고 기록하는 도구',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bluebird',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#1E40AF',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        {/* Pretendard variable subset — 한·영 본문/헤딩 통합 폰트.
            기기별 시스템 폰트 차이로 인한 시각적 무관심 해결 (refined minimalism). */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <Script id="disable-sw-in-local-dev" strategy="afterInteractive">
          {`
            (function () {
              if (location.hostname !== 'localhost') return;
              if (!('serviceWorker' in navigator)) return;
              navigator.serviceWorker.getRegistrations().then(function (registrations) {
                registrations.forEach(function (registration) {
                  registration.unregister();
                });
              });
              if ('caches' in window) {
                caches.keys().then(function (keys) {
                  keys.forEach(function (key) {
                    caches.delete(key);
                  });
                });
              }
            })();
          `}
        </Script>
        {children}
        <BottomTabBar />
        <Analytics />
      </body>
    </html>
  );
}
