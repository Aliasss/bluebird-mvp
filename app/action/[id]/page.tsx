'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { DistortionAnalysis, Log } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import SkeletonCard from '@/components/ui/SkeletonCard';

type ActionState = {
  log: Log | null;
  distortions: DistortionAnalysis[];
  existingAction: string;
  isCompleted: boolean;
  autonomyScore: number | null;
};

function suggestTinyHabit(trigger: string): string[] {
  const shortTrigger = trigger.slice(0, 24);
  return [
    `오늘 ${shortTrigger} 상황이 오면, 2분 동안 메모 앱에 사실/해석을 분리해서 적는다.`,
    '지금 바로 5분 타이머를 켜고 실행 가능한 가장 작은 행동 1가지를 시작한다.',
    '실행 직후 체크박스에 완료 표시하고, 체감 변화를 1문장으로 남긴다.',
  ];
}

export default function ActionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [state, setState] = useState<ActionState>({
    log: null,
    distortions: [],
    existingAction: '',
    isCompleted: false,
    autonomyScore: null,
  });
  const [actionInput, setActionInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const logId = params.id;
    if (!logId) {
      setError('잘못된 접근입니다.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.replace('/auth/login');
          return;
        }

        const [logResult, analysisResult, interventionResult] = await Promise.all([
          supabase.from('logs').select('*').eq('id', logId).eq('user_id', user.id).single(),
          supabase
            .from('analysis')
            .select('distortion_type, intensity, logic_error_segment')
            .eq('log_id', logId),
          supabase
            .from('intervention')
            .select('final_action, is_completed, autonomy_score')
            .eq('log_id', logId)
            .maybeSingle(),
        ]);

        if (logResult.error || !logResult.data) {
          throw new Error('로그 데이터를 찾을 수 없습니다.');
        }

        const distortions = (analysisResult.data ?? []).map((row) => ({
          type: row.distortion_type,
          intensity: row.intensity,
          segment: row.logic_error_segment,
        })) as DistortionAnalysis[];

        const existingAction = String(interventionResult.data?.final_action ?? '');
        setState({
          log: logResult.data,
          distortions,
          existingAction,
          isCompleted: Boolean(interventionResult.data?.is_completed),
          autonomyScore:
            typeof interventionResult.data?.autonomy_score === 'number'
              ? interventionResult.data.autonomy_score
              : null,
        });
        setActionInput(existingAction);
      } catch (err: any) {
        console.error('행동 페이지 로드 실패:', err);
        setError(err.message || '행동 설계 데이터를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  const suggestions = useMemo(
    () => suggestTinyHabit(state.log?.trigger ?? '이 상황'),
    [state.log?.trigger]
  );

  const validateAction = (value: string) => {
    if (value.trim().length < 8) {
      return '행동 문장을 최소 8자 이상으로 작성해주세요.';
    }
    if (!/\d/.test(value)) {
      return '5분 내 실행 가능성을 위해 시간/횟수 등 숫자를 포함해주세요.';
    }
    return null;
  };

  const saveAction = async (markCompleted: boolean) => {
    const validationError = validateAction(actionInput);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setNotice(null);

      const response = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logId: params.id,
          finalAction: actionInput.trim(),
          markCompleted,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || '행동 저장에 실패했습니다.');
      }

      if (markCompleted) {
        setState((prev) => ({
          ...prev,
          isCompleted: true,
          autonomyScore: payload.autonomyScore ?? prev.autonomyScore,
          existingAction: actionInput.trim(),
        }));
        setNotice(
          `행동 완료! 자율성 지수 +${payload.autonomyScore ?? 10}점이 반영되었습니다.`
        );
      } else {
        setState((prev) => ({
          ...prev,
          existingAction: actionInput.trim(),
        }));
        setNotice('행동 계획이 저장되었습니다.');
      }
    } catch (err: any) {
      setError(err.message || '행동 처리 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <PageHeader title="행동 설계" />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          <SkeletonCard lines={4} />
          <SkeletonCard lines={3} />
        </div>
      </main>
    );
  }

  if (error && !state.log) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <p className="text-xl md:text-2xl">⚠️</p>
          <p className="text-text-primary font-semibold">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-primary text-white font-semibold py-3 px-6 rounded-xl"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <PageHeader title="행동 설계" />
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-background-tertiary shadow-none sm:shadow-sm">
          <h1 className="text-xl md:text-2xl font-bold text-text-primary mb-2">행동 확약</h1>
          <p className="text-sm text-text-secondary">
            분석 결과를 행동으로 전환하면 자율성 지수가 올라갑니다.
          </p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-background-tertiary shadow-none sm:shadow-sm space-y-3">
          <h2 className="text-base md:text-lg font-bold text-text-primary">현재 상황 요약</h2>
          <p className="text-xs md:text-sm text-text-secondary">트리거: {state.log?.trigger}</p>
          {state.distortions.length > 0 && (
            <p className="text-xs md:text-sm text-text-secondary">
              왜곡 평균 강도:{' '}
              {(
                (state.distortions.reduce((sum, item) => sum + item.intensity, 0) /
                  state.distortions.length) *
                100
              ).toFixed(0)}
              %
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-background-tertiary shadow-none sm:shadow-sm space-y-4">
          <h2 className="text-base md:text-lg font-bold text-text-primary">Tiny Habit 제안</h2>
          <ul className="space-y-2 text-xs md:text-sm text-text-secondary">
            {suggestions.map((item, index) => (
              <li key={index}>- {item}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-background-tertiary shadow-none sm:shadow-sm space-y-4">
          <h2 className="text-base md:text-lg font-bold text-text-primary">내 행동 계획</h2>
          <textarea
            value={actionInput}
            onChange={(event) => {
              setActionInput(event.target.value);
              setError(null);
              setNotice(null);
            }}
            placeholder="예: 오늘 21:00에 5분 동안 보고서 첫 문단만 작성하고 체크리스트에 완료 표시한다."
            className="w-full h-32 p-4 border border-background-tertiary rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={saving || state.isCompleted}
          />

          {error && (
            <div className="bg-danger bg-opacity-10 border border-danger rounded-xl p-3">
              <p className="text-xs md:text-sm text-danger">{error}</p>
            </div>
          )}
          {notice && (
            <div className="bg-success bg-opacity-10 border border-success rounded-xl p-3">
              <p className="text-xs md:text-sm text-success">{notice}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => saveAction(false)}
              disabled={saving || state.isCompleted}
              className="flex-1 bg-white border border-primary text-primary font-semibold py-3 rounded-xl disabled:opacity-50"
            >
              행동 계획 저장
            </button>
            <button
              onClick={() => saveAction(true)}
              disabled={saving || state.isCompleted}
              className="flex-1 bg-primary text-white font-semibold py-3 rounded-xl disabled:opacity-50"
            >
              {saving ? '처리 중...' : state.isCompleted ? '완료 처리됨' : '행동 완료 체크 (+점수)'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-background-tertiary shadow-none sm:shadow-sm">
          <h2 className="text-base md:text-lg font-bold text-text-primary mb-3">자율성 지수</h2>
          <p className="text-3xl font-bold text-primary">
            {state.autonomyScore ?? 0}
            <span className="text-base text-text-secondary ml-1">점</span>
          </p>
          <p className="text-xs md:text-sm text-text-secondary mt-2">
            행동 완료 시 자동으로 점수가 반영됩니다.
          </p>
        </div>

        <div className="flex justify-center gap-2 sm:gap-3">
          <button
            onClick={() => router.push(`/visualize/${params.id}`)}
            className="bg-white border border-primary text-primary font-semibold py-3 px-8 rounded-xl"
          >
            시각화로 돌아가기
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-primary text-white font-semibold py-3 px-8 rounded-xl"
          >
            대시보드
          </button>
        </div>
      </div>
    </main>
  );
}
