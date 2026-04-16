'use client';

import { useRouter } from 'next/navigation';

type Props = {
  title: string;
  backHref?: string;
  onBack?: () => void;
  step?: { current: number; total: number };
  rightElement?: React.ReactNode;
};

export default function PageHeader({ title, backHref, onBack, step, rightElement }: Props) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) { onBack(); return; }
    if (backHref) { router.push(backHref); return; }
    router.back();
  };

  return (
    <>
      <header className="bg-white border-b border-background-tertiary px-4 sm:px-6 py-3 sm:py-4 flex items-center">
        <button onClick={handleBack} className="text-primary font-semibold min-w-[44px]">
          ← 뒤로
        </button>
        <div className="flex-1 text-center">
          {step ? (
            <p className="text-sm text-text-secondary">{step.current}/{step.total} 단계</p>
          ) : (
            <p className="text-sm font-semibold text-text-primary">{title}</p>
          )}
        </div>
        <div className="min-w-[44px] flex justify-end">
          {rightElement ?? null}
        </div>
      </header>
      {step && (
        <div className="bg-background-secondary h-1">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${(step.current / step.total) * 100}%` }}
          />
        </div>
      )}
    </>
  );
}
