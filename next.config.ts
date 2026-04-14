import type { NextConfig } from 'next';
const runtimeCaching = require('next-pwa/cache');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next.js 16 + next-pwa(webpack) 동시 사용 시 build 모드 명시 필요
  turbopack: {},
};

// next-pwa 설정을 별도로 적용
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching,
  fallbacks: {
    document: '/offline.html',
  },
  buildExcludes: [/middleware-manifest\.json$/],
});

export default withPWA(nextConfig);
