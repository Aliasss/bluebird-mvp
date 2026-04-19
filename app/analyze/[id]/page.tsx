'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import {
  DistortionTypeKorean,
  type CasSignal,
  type DistortionAnalysis,
  type FrameType,
  type Log,
} from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import SkeletonCard from '@/components/ui/SkeletonCard';

type Stage = 'fetch' | 'analyze' | 'question' | 'done';
type InterventionRow = {
  socratic_questions: string[] | null;
  user_answers: Record<string, string> | null;
};
type TheoryMeta = {
  frameType: FrameType;
  referencePoint: string;
  probabilityEstimate: number | null;
  lossAversionSignal: number;
  casSignal: CasSignal;
  system2QuestionSeed: string;
  decenteringPrompt: string;
};

function hasNumericContent(value: string): boolean {
  return /\d+/.test(value);
}

function toAnswerArray(userAnswers: Record<string, string> | null | undefined): string[] {
  return [userAnswers?.q1 ?? '', userAnswers?.q2 ?? '', userAnswers?.q3 ?? ''];
}

function renderThoughtWithHighlights(
  thought: string,
  distortions: DistortionAnalysis[]
): ReactNode {
  const segments = distortions
    .map((item) => item.segment.trim())
    .filter((segment) => segment.length >= 2)
    .slice(0, 3);

  if (segments.length === 0) {
    return thought;
  }

  const sortedSegments = [...segments].sort((a, b) => b.length - a.length);
  let nodes: ReactNode[] = [thought];

  sortedSegments.forEach((segment, index) => {
    nodes = nodes.flatMap((node) => {
      if (typeof node !== 'string') return [node];
      if (!node.includes(segment)) return [node];

      const parts = node.split(segment);
      const mapped: ReactNode[] = [];
      parts.forEach((part, partIndex) => {
        if (part) mapped.push(part);
        if (partIndex < parts.length - 1) {
          mapped.push(
            <mark
              key={`highlight-${index}-${partIndex}`}
              className="bg-warning bg-opacity-30 px-1 rounded"
            >
              {segment}
            </mark>
          );
        }
      });
      return mapped;
    });
  });

  return nodes;
}

export default function AnalyzePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [logData, setLogData] = useState<Log | null>(null);
  const [distortions, setDistortions] = useState<DistortionAnalysis[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [stage, setStage] = useState<Stage>('fetch');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savingAnswers, setSavingAnswers] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const isRequestInFlightRef = useRef(false);
  const [theoryMeta, setTheoryMeta] = useState<TheoryMeta>({
    frameType: 'mixed',
    referencePoint: '준거점 정보 없음',
    probabilityEstimate: null,
    lossAversionSignal: 0.3,
    casSignal: { rumination: 0.3, worry: 0.3 },
    system2QuestionSeed: '판단 근거의 비율을 숫자로 분리해보세요.',
    decenteringPrompt: '생각을 사실이 아닌 가설로 두고 관찰 가능한 데이터만 분리하세요.',
  });

  useEffect(() => {
    const logId = params.id;

    if (!logId) {
      setError('잘못된 접근입니다.');
      setLoading(false);
      return;
    }

    const runAnalysis = async () => {
      if (isRequestInFlightRef.current) {
        return;
      }
      isRequestInFlightRef.current = true;
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace('/auth/login');
          return;
        }

        const { data, error: logError } = await supabase
          .from('logs')
          .select('*')
          .eq('id', logId)
          .eq('user_id', user.id)
          .single();

        if (logError) throw logError;

        setLogData(data);

        const [{ data: analysisRows }, { data: interventionRow }] = await Promise.all([
          supabase
            .from('analysis')
            .select('distortion_type, intensity, logic_error_segment')
            .eq('log_id', logId),
          supabase
            .from('intervention')
            .select('socratic_questions, user_answers')
            .eq('log_id', logId)
            .maybeSingle(),
        ]);

        if ((analysisRows?.length ?? 0) > 0) {
          const existingDistortions = (analysisRows ?? []).map((row) => ({
            type: row.distortion_type,
            intensity: row.intensity,
            segment: row.logic_error_segment,
          })) as DistortionAnalysis[];
          setDistortions(existingDistortions);
        }

        const castIntervention = interventionRow as InterventionRow | null;
        const existingQuestions = Array.isArray(castIntervention?.socratic_questions)
          ? castIntervention.socratic_questions.map((q) => String(q))
          : [];
        const existingAnswers =
          castIntervention?.user_answers && typeof castIntervention.user_answers === 'object'
            ? toAnswerArray(castIntervention.user_answers)
            : ['', '', ''];

        if (existingAnswers.some((answer) => answer.length > 0)) {
          setAnswers(existingAnswers);
        }

        if ((analysisRows?.length ?? 0) > 0 && existingQuestions.length === 3) {
          setQuestions(existingQuestions);
          setStage('done');
          return;
        }

        setStage('analyze');
        const analyzeRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logId }),
        });
        const analyzePayload = await analyzeRes.json();

        if (!analyzeRes.ok) {
          throw new Error(analyzePayload.error || '분석에 실패했습니다.');
        }

        const analyzedDistortions = (analyzePayload.distortions ?? []) as DistortionAnalysis[];
        setDistortions(analyzedDistortions);
        setWarning(analyzePayload.warning ?? null);
        setTheoryMeta({
          frameType: (analyzePayload.frame_type as FrameType) || 'mixed',
          referencePoint: analyzePayload.reference_point || '준거점 정보 없음',
          probabilityEstimate:
            typeof analyzePayload.probability_estimate === 'number'
              ? analyzePayload.probability_estimate
              : null,
          lossAversionSignal:
            typeof analyzePayload.loss_aversion_signal === 'number'
              ? analyzePayload.loss_aversion_signal
              : 0.3,
          casSignal: {
            rumination:
              typeof analyzePayload.cas_signal?.rumination === 'number'
                ? analyzePayload.cas_signal.rumination
                : 0.3,
            worry:
              typeof analyzePayload.cas_signal?.worry === 'number'
                ? analyzePayload.cas_signal.worry
                : 0.3,
          },
          system2QuestionSeed:
            analyzePayload.system2_question_seed || '판단 근거의 비율을 숫자로 분리해보세요.',
          decenteringPrompt:
            analyzePayload.decentering_prompt ||
            '생각을 사실이 아닌 가설로 두고 관찰 가능한 데이터만 분리하세요.',
        });

        setStage('question');
        const questionRes = await fetch('/api/generate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logId }),
        });
        const questionPayload = await questionRes.json();

        if (!questionRes.ok) {
          throw new Error(questionPayload.error || '질문 생성에 실패했습니다.');
        }

        setQuestions((questionPayload.questions ?? []) as string[]);
        setStage('done');
      } catch (err: any) {
        console.error('로그 조회 실패:', err);
        setError(err.message || '분석 중 오류가 발생했습니다.');
      } finally {
        isRequestInFlightRef.current = false;
        setLoading(false);
      }
    };

    runAnalysis();
  }, [params.id, router]);

  const retryAnalysis = () => {
    window.location.reload();
  };

  const handleAnswerChange = (value: string) => {
    setSaveError(null);
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQuestion] = value;
      return next;
    });
  };

  const goNextQuestion = () => {
    if (!answers[currentQuestion]?.trim()) {
      setSaveError('답변을 입력해주세요.');
      return;
    }
    setSaveError(null);
    setCurrentQuestion((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const goPrevQuestion = () => {
    setSaveError(null);
    setCurrentQuestion((prev) => Math.max(prev - 1, 0));
  };

  const handleSaveAnswers = async () => {
    if (answers.some((answer) => !answer.trim())) {
      setSaveError('세 질문에 모두 답변해주세요.');
      return;
    }

    try {
      setSavingAnswers(true);
      setSaveError(null);

      const response = await fetch('/api/intervention/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logId: params.id,
          answers,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || '답변 저장에 실패했습니다.');
      }

      router.push(`/visualize/${params.id}`);
    } catch (err: any) {
      setSaveError(err.message || '답변 저장 중 오류가 발생했습니다.');
    } finally {
      setSavingAnswers(false);
    }
  };

  if (loading) {
    const stageMessages: Record<Stage, { title: string; sub: string }> = {
      fetch: { title: '데이터를 불러오는 중...', sub: '' },
      analyze: { title: 'AI가 인지 왜곡을 분석하고 있습니다', sub: '잠시만 기다려주세요. 보통 10~20초 정도 소요됩니다.' },
      question: { title: '소크라테스식 질문을 생성하고 있습니다', sub: '분석 결과를 바탕으로 맞춤 질문을 만들고 있습니다.' },
      done: { title: '완료', sub: '' },
    };
    const msg = stageMessages[stage];

    return (
      <main className="min-h-screen bg-background">
        <PageHeader title="분석 결과" backHref="/dashboard" />
        {stage === 'fetch' ? (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
            <SkeletonCard lines={4} />
            <SkeletonCard lines={3} />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 flex flex-col items-center text-center gap-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-background-tertiary" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <div className="space-y-2">
              <p className="text-base font-semibold text-text-primary">{msg.title}</p>
              {msg.sub && <p className="text-sm text-text-secondary">{msg.sub}</p>}
            </div>
          </div>
        )}
      </main>
    );
  }

  if (error || !logData) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="text-6xl">⚠️</div>
          <h2 className="text-lg md:text-xl font-bold text-text-primary">
            오류가 발생했습니다
          </h2>
          <p className="text-text-secondary">
            {error || '데이터를 불러올 수 없습니다.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={retryAnalysis}
              className="bg-white border border-primary text-primary font-semibold py-3 px-6 rounded-xl"
            >
              다시 시도
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-primary text-white font-semibold py-3 px-6 rounded-xl"
            >
              대시보드로 돌아가기
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-background-tertiary shadow-none sm:shadow-sm">
          <h1 className="text-xl md:text-2xl font-bold text-text-primary mb-3 sm:mb-4">AI 분석 결과</h1>
          {warning && (
            <div className="mb-4 bg-warning bg-opacity-10 border border-warning rounded-xl p-3">
              <p className="text-xs md:text-sm text-warning">{warning}</p>
            </div>
          )}
          <p className="text-xs md:text-sm text-text-secondary mb-1.5 sm:mb-2">트리거</p>
          <p className="text-text-primary mb-4">{logData?.trigger}</p>
          <p className="text-xs md:text-sm text-text-secondary mb-1.5 sm:mb-2">자동 사고</p>
          <p className="text-text-primary leading-relaxed">
            {renderThoughtWithHighlights(logData?.thought ?? '', distortions)}
          </p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-background-tertiary shadow-none sm:shadow-sm">
          <h2 className="text-lg md:text-xl font-bold text-text-primary mb-3 sm:mb-4">이론 기반 해석</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs md:text-sm">
            <div className="border border-background-tertiary rounded-xl p-4">
              <p className="text-text-secondary mb-1">현재 프레임</p>
              <p className="font-semibold text-text-primary">
                {theoryMeta.frameType === 'loss'
                  ? '손실 프레임'
                  : theoryMeta.frameType === 'gain'
                    ? '이득 프레임'
                    : '혼합 프레임'}
              </p>
            </div>
            <div className="border border-background-tertiary rounded-xl p-4">
              <p className="text-text-secondary mb-1">추정 확률</p>
              <p className="font-semibold text-text-primary">
                {theoryMeta.probabilityEstimate !== null
                  ? `${theoryMeta.probabilityEstimate}%`
                  : '추정치 없음'}
              </p>
            </div>
            <div className="border border-background-tertiary rounded-xl p-4">
              <p className="text-text-secondary mb-1">준거점</p>
              <p className="text-text-primary">{theoryMeta.referencePoint}</p>
            </div>
            <div className="border border-background-tertiary rounded-xl p-4">
              <p className="text-text-secondary mb-1">손실 민감도 지표</p>
              <p className="font-semibold text-text-primary">
                {(theoryMeta.lossAversionSignal * 100).toFixed(0)}%
              </p>
            </div>
            <div className="border border-background-tertiary rounded-xl p-4">
              <p className="text-text-secondary mb-1">CAS-반추</p>
              <p className="font-semibold text-text-primary">
                {(theoryMeta.casSignal.rumination * 100).toFixed(0)}%
              </p>
            </div>
            <div className="border border-background-tertiary rounded-xl p-4">
              <p className="text-text-secondary mb-1">CAS-걱정</p>
              <p className="font-semibold text-text-primary">
                {(theoryMeta.casSignal.worry * 100).toFixed(0)}%
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-xs md:text-sm text-text-secondary">System 2 기동 핵심 질문</p>
            <p className="text-sm text-text-primary">{theoryMeta.system2QuestionSeed}</p>
            <p className="text-xs md:text-sm text-text-secondary">탈중심화 안내</p>
            <p className="text-sm text-text-primary">{theoryMeta.decenteringPrompt}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-background-tertiary shadow-none sm:shadow-sm">
          <h2 className="text-lg md:text-xl font-bold text-text-primary mb-3 sm:mb-4">탐지된 인지 왜곡</h2>
          {distortions.length === 0 ? (
            <p className="text-text-secondary">명확한 왜곡 패턴이 탐지되지 않았습니다.</p>
          ) : (
            <div className="space-y-3">
              {distortions.map((item, index) => (
                <div key={`${item.type}-${index}`} className="border border-background-tertiary rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-text-primary">
                      {DistortionTypeKorean[item.type]}
                    </p>
                    <span className="text-xs md:text-sm text-primary">
                      강도 {(item.intensity * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-background-secondary rounded-full mb-2 overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${Math.max(5, item.intensity * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs md:text-sm text-text-secondary">{item.segment}</p>
                  {item.rationale && (
                    <p className="text-[10px] md:text-xs text-text-secondary mt-2">
                      판단 근거: {item.rationale}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-background-tertiary shadow-none sm:shadow-sm">
          <h2 className="text-lg md:text-xl font-bold text-text-primary mb-3 sm:mb-4">소크라테스식 질문</h2>
          {questions.length === 0 ? (
            <p className="text-text-secondary">질문을 생성하지 못했습니다. 다시 시도해주세요.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="text-text-secondary">
                  질문 {currentQuestion + 1} / {questions.length}
                </span>
                <span className="text-primary font-medium">
                  구체적인 근거를 담아 답변해주세요
                </span>
              </div>

              <div className="border border-background-tertiary rounded-xl p-4">
                <p className="text-text-primary font-medium mb-3">
                  {currentQuestion + 1}. {questions[currentQuestion]}
                </p>
                <textarea
                  value={answers[currentQuestion] ?? ''}
                  onChange={(event) => handleAnswerChange(event.target.value)}
                  placeholder="예: 최악의 경우는 30% 정도라고 생각합니다. 근거는 ..."
                  className="w-full h-28 p-3 border border-background-tertiary rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={savingAnswers}
                />
              </div>

              {saveError && (
                <div className="bg-danger bg-opacity-10 border border-danger rounded-xl p-3">
                  <p className="text-xs md:text-sm text-danger">{saveError}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={goPrevQuestion}
                  disabled={savingAnswers || currentQuestion === 0}
                  className="flex-1 bg-white border border-background-tertiary text-text-primary font-semibold py-3 rounded-xl disabled:opacity-50"
                >
                  이전 질문
                </button>

                {currentQuestion < questions.length - 1 ? (
                  <button
                    onClick={goNextQuestion}
                    disabled={savingAnswers}
                    className="flex-1 bg-primary text-white font-semibold py-3 rounded-xl disabled:opacity-50"
                  >
                    다음 질문
                  </button>
                ) : (
                  <button
                    onClick={handleSaveAnswers}
                    disabled={savingAnswers}
                    className="flex-1 bg-primary text-white font-semibold py-3 rounded-xl disabled:opacity-50"
                  >
                    {savingAnswers ? '저장 중...' : '답변 저장 후 시각화 보기'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex justify-center gap-2 sm:gap-3">
            <button
              onClick={() => router.push(`/visualize/${params.id}`)}
              className="bg-white border border-background-tertiary text-text-secondary font-medium py-3 px-6 rounded-xl text-sm"
            >
              답변 없이 시각화 보기
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-primary text-white font-semibold py-3 px-8 rounded-xl"
            >
              대시보드로 돌아가기
            </button>
          </div>
          <p className="text-xs text-text-tertiary">답변은 나중에 이 페이지로 돌아와 작성할 수 있습니다</p>
        </div>
      </div>
    </main>
  );
}
