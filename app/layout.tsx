import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import BottomTabBar from '@/components/ui/BottomTabBar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Project Bluebird',
  description: '인지 왜곡 탐지 및 교정을 통한 실존적 자율성 회복',
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
  themeColor: '#007AFF',
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
      </body>
    </html>
  );
}
