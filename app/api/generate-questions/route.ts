import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateSocraticQuestionsWithGemini } from '@/lib/openai/gemini';
import type { DistortionAnalysis } from '@/types';
import { z } from 'zod';

const generateQuestionsRequestSchema = z.object({
  logId: z.string().uuid(),
});

const generatedQuestionsSchema = z.object({
  questions: z.array(z.string().min(5)).length(3),
});

const COMFORT_LANGUAGE_PATTERNS = [
  /괜찮아요/gi,
  /괜찮아/gi,
  /힘내/gi,
  /잘하고 있어/gi,
  /응원/gi,
];

function stripComfortLanguage(value: string) {
  return COMFORT_LANGUAGE_PATTERNS.reduce(
    (acc, pattern) => acc.replace(pattern, '').trim(),
    value
  );
}

type GenerateQuestionsRequestBody = {
  logId?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateQuestionsRequestBody;
    const parsedBody = generateQuestionsRequestSchema.safeParse({
      logId: body.logId?.trim(),
    });
    if (!parsedBody.success) {
      return NextResponse.json({ error: '유효한 logId가 필요합니다.' }, { status: 400 });
    }
    const logId = parsedBody.data.logId;

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { data: logData, error: logError } = await supabase
      .from('logs')
      .select('id, trigger, thought, user_id')
      .eq('id', logId)
      .eq('user_id', user.id)
      .single();

    if (logError || !logData) {
      return NextResponse.json({ error: '로그를 찾을 수 없습니다.' }, { status: 404 });
    }

    const primaryQuery = await supabase
      .from('analysis')
      .select(
        'distortion_type, intensity, logic_error_segment, rationale, frame_type, reference_point, probability_estimate, loss_aversion_signal, cas_rumination, cas_worry, system2_question_seed, decentering_prompt'
      )
      .eq('log_id', logId);
    let analysisRows: Array<Record<string, unknown>> | null = primaryQuery.data as Array<
      Record<string, unknown>
    > | null;
    let analysisError = primaryQuery.error;

    if (analysisError) {
      const legacyQuery = await supabase
        .from('analysis')
        .select('distortion_type, intensity, logic_error_segment')
        .eq('log_id', logId);
      analysisRows = legacyQuery.data as Array<Record<string, unknown>> | null;
      analysisError = legacyQuery.error;
    }

    if (analysisError) {
      return NextResponse.json(
        { error: '분석 데이터를 불러오지 못했습니다.' },
        { status: 500 }
      );
    }

    const distortions: DistortionAnalysis[] = (analysisRows ?? []).map((row) => ({
      type: (row as any).distortion_type,
      intensity: Number((row as any).intensity ?? 0),
      segment: String((row as any).logic_error_segment ?? ''),
      rationale: ((row as any).rationale as string | undefined) || undefined,
    })) as DistortionAnalysis[];

    const analysisMeta = (analysisRows?.[0] ?? {}) as Record<string, any>;

    let questions = [];
    try {
      questions = await generateSocraticQuestionsWithGemini({
        trigger: logData.trigger,
        thought: logData.thought,
        distortions,
        frameType: analysisMeta?.frame_type,
        referencePoint: analysisMeta?.reference_point,
        probabilityEstimate: analysisMeta?.probability_estimate,
        casSignal: {
          rumination: Number(analysisMeta?.cas_rumination ?? 0.3),
          worry: Number(analysisMeta?.cas_worry ?? 0.3),
        },
        system2QuestionSeed: analysisMeta?.system2_question_seed,
        decenteringPrompt: analysisMeta?.decentering_prompt,
      });
    } catch (aiError) {
      console.error('Gemini 질문 생성 실패(폴백 적용):', aiError);
      questions = [
        '이 상황이 실제로 최악으로 전개될 확률을 0~100%로 추정하면 몇 %인가요?',
        '지금 생각을 뒷받침하는 객관적 증거와 반대 증거를 각각 3가지씩 적어볼 수 있나요?',
        '같은 상황을 겪는 친구에게 조언한다면, 어떤 대안 해석을 제시하시겠어요?',
      ];
    }

    const sanitizedQuestions = questions.map((question) =>
      stripComfortLanguage(question).replace(/\s+/g, ' ').trim()
    );
    const normalizedQuestions = generatedQuestionsSchema.parse({
      questions: sanitizedQuestions.map((q, index) =>
        q.length >= 5 ? q : `질문 ${index + 1}: 객관적 지표를 포함해 재평가해볼 수 있나요?`
      ),
    }).questions;

    const theoryContext = {
      frame_type: analysisMeta?.frame_type ?? 'mixed',
      reference_point: analysisMeta?.reference_point ?? null,
      probability_estimate: analysisMeta?.probability_estimate ?? null,
      loss_aversion_signal: analysisMeta?.loss_aversion_signal ?? null,
      cas_signal: {
        rumination: analysisMeta?.cas_rumination ?? null,
        worry: analysisMeta?.cas_worry ?? null,
      },
      decentering_prompt: analysisMeta?.decentering_prompt ?? null,
    };

    const { data: existingIntervention, error: existingError } = await supabase
      .from('intervention')
      .select('id')
      .eq('log_id', logId)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: '기존 개입 데이터를 확인하지 못했습니다.' }, { status: 500 });
    }

    if (existingIntervention?.id) {
      let { error: updateError } = await supabase
        .from('intervention')
        .update({
          socratic_questions: normalizedQuestions,
          theory_context: theoryContext,
        })
        .eq('id', existingIntervention.id);

      if (updateError) {
        const legacyUpdate = await supabase
          .from('intervention')
          .update({ socratic_questions: normalizedQuestions })
          .eq('id', existingIntervention.id);
        updateError = legacyUpdate.error;
      }

      if (updateError) {
        return NextResponse.json({ error: '질문 저장에 실패했습니다.' }, { status: 500 });
      }
    } else {
      let { error: insertError } = await supabase
        .from('intervention')
        .insert({
          log_id: logId,
          socratic_questions: normalizedQuestions,
          theory_context: theoryContext,
        });

      if (insertError) {
        const legacyInsert = await supabase
          .from('intervention')
          .insert({ log_id: logId, socratic_questions: normalizedQuestions });
        insertError = legacyInsert.error;
      }

      if (insertError) {
        return NextResponse.json({ error: '질문 저장에 실패했습니다.' }, { status: 500 });
      }
    }

    return NextResponse.json({ questions: normalizedQuestions }, { status: 200 });
  } catch (error) {
    console.error('POST /api/generate-questions 실패:', error);
    return NextResponse.json(
      { error: '질문 생성 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
