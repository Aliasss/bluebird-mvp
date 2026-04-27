'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { DistortionAnalysis, Log } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import SkeletonCard from '@/components/ui/SkeletonCard';
import {
  parseActionPlan,
  serializeActionPlan,
  validateActionPlan,
} from '@/lib/intervention/action-plan';

type ActionState = {
  log: Log | null;
  distortions: DistortionAnalysis[];
  dominantDistortion: string | undefined;
  existingAction: string;
  isCompleted: boolean;
  autonomyScore: number | null;
};

type DistortionSuggestions = {
  cue: string;
  action: string;
  reflection: string;
};

const DISTORTION_HABITS: Record<string, DistortionSuggestions> = {
  catastrophizing: {
    cue: '최악의 시나리오가 머릿속에 떠오르는 순간',
    action: '그 결과가 실제로 일어날 확률을 0~100%로 적고, 반대 증거 1가지를 찾는다. (5분)',
    reflection: '실제 확률이 내가 체감한 것보다 낮았는지 1문장으로 기록한다.',
  },
  all_or_nothing: {
    cue: '"완전히 실패했다"는 생각이 드는 순간',
    action: '오늘 완전히 실패하지 않은 것 3가지를 메모 앱에 적는다. (3분)',
    reflection: '부분적으로 잘 된 점 1가지를 인정하는 문장을 남긴다.',
  },
  emotional_reasoning: {
    cue: '감정이 사실처럼 느껴지는 순간',
    action: '"나는 _라고 느낀다(감정)"와 "실제로 _이다(사실)"를 분리해서 적는다. (3분)',
    reflection: '감정과 사실 중 어느 쪽이 더 객관적 근거를 갖는지 1문장으로 쓴다.',
  },
  personalization: {
    cue: '모든 책임이 나에게 있다는 생각이 드는 순간',
    action: '이 상황에 영향을 준 외부 요인 3가지를 적는다. (5분)',
    reflection: '내 책임의 비율을 % 단위로 추정하고, 나머지의 원인을 1문장으로 쓴다.',
  },
  arbitrary_inference: {
    cue: '증거 없이 결론을 내린다는 느낌이 드는 순간',
    action: '지금 내린 결론을 가설로 바꾸고, 이를 뒷받침하는 증거와 반박하는 증거를 각 1개씩 찾는다. (5분)',
    reflection: '가설이 확정된 사실인지, 아직 미확인인지를 1문장으로 판단한다.',
  },
};

function suggestTinyHabit(trigger: string, dominantDistortion?: string): string[] {
  const shortTrigger = trigger.slice(0, 30);
  const habits = dominantDistortion
    ? DISTORTION_HABITS[dominantDistortion]
    : null;

  if (habits) {
    return [
      `[${habits.cue}] "${shortTrigger}" 같은 상황에서 → ${habits.action}`,
      habits.reflection,
      '완료 직후 오늘의 기분 변화를 1점(나쁨)~5점(좋음)으로 Bluebird에 기록한다.',
    ];
  }

  return [
    `"${shortTrigger}" 상황이 다시 오면, 2분 동안 사실과 해석을 분리해서 적는다.`,
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
    dominantDistortion: undefined,
    existingAction: '',
    isCompleted: false,
    autonomyScore: null,
  });
  const [whenInput, setWhenInput] = useState('');
  const [whatInput, setWhatInput] = useState('');
  const [howLongInput, setHowLongInput] = useState('');
  const [legacyAction, setLegacyAction] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [insightInput, setInsightInput] = useState('');
  const [reaction, setReaction] = useState<'improved' | 'same' | 'worse' | null>(null);

  useEffect(() => {
    const logId = params.id;
    if (!logId) {
      setError('올바른 경로로 접근할 수 없어요.');
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
          throw new Error('기록을 찾을 수 없어요.');
        }

        const distortions = (analysisResult.data ?? []).map((row) => ({
          type: row.distortion_type,
          intensity: row.intensity,
          segment: row.logic_error_segment,
        })) as DistortionAnalysis[];

        const dominantDistortion = distortions.length > 0
          ? distortions.reduce((a, b) => a.intensity >= b.intensity ? a : b).type
          : undefined;

        const existingAction = String(interventionResult.data?.final_action ?? '');
        setState({
          log: logResult.data,
          distortions,
          dominantDistortion,
          existingAction,
          isCompleted: Boolean(interventionResult.data?.is_completed),
          autonomyScore:
            typeof interventionResult.data?.autonomy_score === 'number'
              ? interventionResult.data.autonomy_score
              : null,
        });

        const parsedPlan = parseActionPlan(existingAction);
        if (parsedPlan) {
          setWhenInput(parsedPlan.when);
          setWhatInput(parsedPlan.what);
          setHowLongInput(parsedPlan.howLong);
          setLegacyAction(null);
        } else if (existingAction.trim()) {
          // Legacy free text — '무엇을' 필드에 옮겨 사용자가 다시 구조화하도록 유도.
          setLegacyAction(existingAction.trim());
          setWhatInput(existingAction.trim());
        }
      } catch (err: any) {
        console.error('행동 페이지 로드 실패:', err);
        setError(err.message || '데이터를 불러오지 못했어요.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  const suggestions = useMemo(
    () => suggestTinyHabit(state.log?.trigger ?? '이 상황', state.dominantDistortion),
    [state.log?.trigger, state.dominantDistortion]
  );

  const currentPlan = {
    when: whenInput,
    what: whatInput,
    howLong: howLongInput,
  };

  const handleCompleteClick = () => {
    const validationError = validateActionPlan(currentPlan);
    if (validationError) {
      setError(validationError);
      return;
    }
    setInsightInput('');
    setReaction(null);
    setShowCompletionModal(true);
  };

  const saveAction = async (markCompleted: boolean, completionNote?: string, completionReaction?: string) => {
    const validationError = validateActionPlan(currentPlan);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setNotice(null);

      const serialized = serializeActionPlan(currentPlan);
      const response = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logId: params.id,
          finalAction: serialized,
          markCompleted,
          completionNote: completionNote?.trim() || undefined,
          completionReaction: completionReaction || undefined,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || '행동을 저장하지 못했어요.');
      }

      if (markCompleted) {
        const score = payload.autonomyScore ?? 10;
        const hasNote = Boolean(completionNote?.trim());
        setState((prev) => ({
          ...prev,
          isCompleted: true,
          autonomyScore: score,
          existingAction: serialized,
        }));
        setLegacyAction(null);
        setNotice(
          hasNote
            ? `안개를 뚫고 나아갔어요! +${score}점 획득 (메모 보너스 포함) ⚓`
            : `한 걸음 더 나아갔어요! +${score}점 획득 ⚓`
        );
      } else {
        setState((prev) => ({
          ...prev,
          existingAction: serialized,
        }));
        setLegacyAction(null);
        setNotice('행동 계획을 저장했어요. 내일 이 시간 즈음 다시 들어오시면 결과를 적을 수 있어요.');
      }
    } catch (err: any) {
      setError(err.message || '처리 중에 문제가 생겼어요.');
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
        <div className="bg-white rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)]">
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
          <div>
            <h2 className="text-base md:text-lg font-bold text-text-primary">내 행동 계획</h2>
            <p className="text-xs text-text-tertiary mt-1">
              측정 가능한 한 가지 행동으로 좁혀주세요. 24시간 후 결과를 다시 적으러 들어옵니다.
            </p>
          </div>

          {legacyAction && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 leading-relaxed">
              이전에 자유 형식으로 저장하신 계획이 있어요: <strong>{legacyAction}</strong>
              <br />
              아래 3칸으로 다시 정리해 저장하시면 결과 측정이 더 정확해져요.
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label
                htmlFor="action-when"
                className="text-xs font-semibold text-text-secondary tracking-wide"
              >
                ⏰ 언제
              </label>
              <input
                id="action-when"
                type="text"
                value={whenInput}
                onChange={(e) => {
                  setWhenInput(e.target.value);
                  setError(null);
                  setNotice(null);
                }}
                placeholder="예: 오늘 21:00 / 내일 점심 후"
                className="w-full px-4 py-3 border border-background-tertiary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={saving || state.isCompleted}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="action-what"
                className="text-xs font-semibold text-text-secondary tracking-wide"
              >
                🎯 무엇을
              </label>
              <input
                id="action-what"
                type="text"
                value={whatInput}
                onChange={(e) => {
                  setWhatInput(e.target.value);
                  setError(null);
                  setNotice(null);
                }}
                placeholder="예: 보고서 첫 문단만 쓰기"
                className="w-full px-4 py-3 border border-background-tertiary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={saving || state.isCompleted}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="action-howlong"
                className="text-xs font-semibold text-text-secondary tracking-wide"
              >
                ⏱️ 얼마나
              </label>
              <input
                id="action-howlong"
                type="text"
                value={howLongInput}
                onChange={(e) => {
                  setHowLongInput(e.target.value);
                  setError(null);
                  setNotice(null);
                }}
                placeholder="예: 5분 / 1번"
                className="w-full px-4 py-3 border border-background-tertiary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={saving || state.isCompleted}
              />
            </div>
          </div>

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

          {/* 1단계: 계획 미저장 → 계획 확정 (primary). 2단계: 계획 저장됨, 미완료 → 결과 기록 안내 */}
          {!state.isCompleted && !state.existingAction && (
            <button
              onClick={() => saveAction(false)}
              disabled={saving}
              className="w-full bg-primary text-white font-semibold min-h-[44px] py-3 rounded-2xl text-sm disabled:opacity-50"
            >
              {saving ? '저장 중...' : '행동 계획 확정'}
            </button>
          )}

          {!state.isCompleted && state.existingAction && (
            <div className="space-y-3">
              <div className="bg-primary bg-opacity-5 border border-primary border-opacity-20 rounded-xl p-3 text-xs text-text-secondary leading-relaxed">
                계획이 저장됐어요. 이 행동을 시도한 뒤 다시 들어오시면 결과를 적을 수 있어요.
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => saveAction(false)}
                  disabled={saving}
                  className="flex-1 bg-white border border-background-tertiary text-text-secondary font-medium min-h-[44px] py-3 rounded-2xl text-sm disabled:opacity-50"
                >
                  {saving ? '저장 중...' : '계획 수정'}
                </button>
                <button
                  onClick={handleCompleteClick}
                  disabled={saving}
                  className="flex-1 bg-primary text-white font-semibold min-h-[44px] py-3 rounded-2xl text-sm disabled:opacity-50"
                >
                  이미 했어요 — 결과 기록
                </button>
              </div>
            </div>
          )}

          {state.isCompleted && (
            <button
              disabled
              className="w-full bg-success bg-opacity-10 border border-success text-success font-semibold min-h-[44px] py-3 rounded-2xl text-sm"
            >
              완료됨 ✓
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)]">
          <h2 className="text-base md:text-lg font-bold text-text-primary mb-3">자율성 지수</h2>
          <p className="text-3xl font-bold text-primary">
            {state.autonomyScore ?? 0}
            <span className="text-base text-text-secondary ml-1">점</span>
          </p>
          <p className="text-xs md:text-sm text-text-secondary mt-2">
            행동 완료 시 자동으로 점수가 반영됩니다.
          </p>
        </div>

        <div className="flex gap-3 w-full max-w-sm mx-auto">
          <button
            onClick={() => router.push(`/visualize/${params.id}`)}
            className="flex-1 bg-white border border-background-tertiary text-text-secondary font-medium min-h-[44px] py-3 rounded-2xl text-sm"
          >
            시각화 보기
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 bg-white border border-background-tertiary text-text-secondary font-medium min-h-[44px] py-3 rounded-2xl text-sm"
          >
            대시보드
          </button>
        </div>
      </div>

      {/* 완료 모달 */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-6 sm:pb-0">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="text-center space-y-1">
              <p className="text-2xl">⚓</p>
              <h3 className="text-base font-bold text-text-primary tracking-tight">항해를 완료했어요!</h3>
            </div>

            {/* 원탭 반응 */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">행동 전후 변화</p>
              <div className="flex gap-2">
                {([
                  { value: 'improved', emoji: '😌', label: '나아졌어요' },
                  { value: 'same', emoji: '😐', label: '비슷해요' },
                  { value: 'worse', emoji: '😟', label: '더 힘들어요' },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setReaction(opt.value)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all text-xs font-semibold ${
                      reaction === opt.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-background-tertiary text-text-secondary'
                    }`}
                  >
                    <span className="text-xl">{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 소감 메모 */}
            <div>
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">항해 메모 <span className="text-primary normal-case font-normal">(+15점)</span></p>
              <textarea
                value={insightInput}
                onChange={(e) => setInsightInput(e.target.value)}
                placeholder="짧은 생각 한 줄을 남겨볼까요? (선택)"
                className="w-full h-20 p-3 border border-background-tertiary rounded-xl resize-none text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                maxLength={200}
              />
              <p className="text-right text-xs text-text-tertiary mt-1">{insightInput.length}/200</p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowCompletionModal(false);
                  saveAction(true, insightInput, reaction ?? undefined);
                }}
                disabled={saving}
                className="w-full bg-primary text-white font-semibold min-h-[44px] py-3 rounded-2xl text-sm disabled:opacity-50"
              >
                {insightInput.trim() ? '메모 기록하고 완료 (+15점 보너스)' : '완료하기'}
              </button>
              <button
                onClick={() => setShowCompletionModal(false)}
                className="w-full text-text-tertiary text-sm py-2"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
