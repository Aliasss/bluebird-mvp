'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  
  const handleStart = () => {
    router.push('/auth/signup');
  };

  const handleManual = () => {
    router.push('/manual');
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-primary">
            Project Bluebird
          </h1>
          <p className="text-lg text-text-secondary">
            인지 왜곡 탐지 및 교정을 통한<br />
            실존적 자율성 회복
          </p>
        </div>

        <div className="space-y-4 pt-8">
          <div className="bg-background-secondary rounded-2xl p-6 text-left space-y-3">
            <h2 className="font-semibold text-lg">핵심 기능</h2>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>시스템 1 자동 사고 포착</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>AI 기반 인지 왜곡 탐지</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>소크라테스식 질문을 통한 시스템 2 기동</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>전망이론 기반 시각화</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>주체적 행동 설계 및 실행</span>
              </li>
            </ul>
          </div>

          <button
            className="w-full bg-primary text-white font-semibold py-4 px-6 rounded-2xl touch-manipulation active:scale-95 transition-transform"
            onClick={handleStart}
          >
            시작하기
          </button>
          <button
            className="w-full bg-white border border-primary text-primary font-semibold py-4 px-6 rounded-2xl touch-manipulation active:scale-95 transition-transform"
            onClick={handleManual}
          >
            Technical Manual 보기
          </button>
        </div>

        <p className="text-xs text-text-secondary pt-4">
          PWA 기능이 활성화되었습니다<br />
          홈 화면에 추가하여 앱처럼 사용하세요
        </p>
      </div>
    </main>
  );
}
