import Link from 'next/link';
import { SAFETY_RESOURCES } from '@/lib/safety/resources';

export const metadata = {
  title: '정신건강 자원 | BlueBird',
  description: '대한민국 내 정신건강·위기 상담 전화 및 온라인 자원 모음',
};

export default function SafetyResourcesPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">정신건강 자원</h1>
        <p className="text-sm text-gray-600">
          지금 어려우시다면 아래 자원을 이용하실 수 있어요. 전화가 부담스러우시면 문자 상담이나 온라인
          상담도 가능합니다.
        </p>
        <p className="text-xs text-gray-500">
          BlueBird는 의료 서비스가 아닙니다. 지속적이거나 심각한 어려움은 전문가의 도움을
          받으시기를 권해드립니다.
        </p>
      </header>

      <ul className="space-y-4">
        {SAFETY_RESOURCES.map((r) => (
          <li key={r.id} className="rounded-2xl border border-gray-200 bg-white p-5 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h2 className="font-semibold text-gray-900">{r.name}</h2>
                <p className="text-sm text-gray-700">{r.description}</p>
                <p className="text-xs text-gray-500">{r.availability}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {r.phone && (
                <a
                  href={`tel:${r.phone}`}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white"
                >
                  전화 {r.phone}
                </a>
              )}
              {r.sms && (
                <a
                  href={`sms:${r.sms}`}
                  className="rounded-lg border border-rose-300 px-3 py-1.5 text-sm text-rose-700"
                >
                  문자 {r.sms}
                </a>
              )}
              {r.webUrl && (
                <a
                  href={r.webUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
                >
                  웹 상담 →
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      <footer className="pt-4 text-center">
        <Link href="/" className="text-sm text-gray-500 underline">
          홈으로
        </Link>
      </footer>
    </main>
  );
}
