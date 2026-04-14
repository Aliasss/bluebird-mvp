import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { analyzeDistortionsWithGemini } from '@/lib/openai/gemini';
import type { AIAnalysisResult, DistortionAnalysis } from '@/types';
import { z } from 'zod';

const analyzeRequestSchema = z.object({
  logId: z.string().uuid(),
});

const distortionSchema = z.object({
  type: z.enum([
    'catastrophizing',
    'all_or_nothing',
    'emotional_reasoning',
    'personalization',
    'arbitrary_inference',
  ]),
  intensity: z.number().min(0).max(1),
  segment: z.string().min(1),
  rationale: z.string().optional(),
});

const analysisPayloadSchema = z.object({
  distortions: z.array(distortionSchema),
  frame_type: z.enum(['loss', 'gain', 'mixed']).optional(),
  reference_point: z.string().optional(),
  probability_estimate: z.number().min(0).max(100).nullable().optional(),
  loss_aversion_signal: z.number().min(0).max(1).optional(),
  cas_signal: z
    .object({
      rumination: z.number().min(0).max(1),
      worry: z.number().min(0).max(1),
    })
    .optional(),
  system2_question_seed: z.string().optional(),
  decentering_prompt: z.string().optional(),
});

type AnalyzeRequestBody = {
  logId?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeRequestBody;
    const parsedBody = analyzeRequestSchema.safeParse({
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

    let analysisResult: AIAnalysisResult = {
      distortions: [] as DistortionAnalysis[],
      questions: [],
      frame_type: 'mixed',
      reference_point: '분석 결과 없음',
      probability_estimate: null as number | null,
      loss_aversion_signal: 0.3,
      cas_signal: { rumination: 0.3, worry: 0.3 },
      system2_question_seed: '이 판단을 지지/반박하는 근거 비율은 각각 몇 %인가요?',
      decentering_prompt: '이 생각을 사실이 아닌 가설로 놓고 증거를 분리하세요.',
    };
    let warning: string | null = null;
    try {
      analysisResult = await analyzeDistortionsWithGemini({
        trigger: logData.trigger,
        thought: logData.thought,
      });
    } catch (aiError) {
      console.error('Gemini 분석 실패(폴백 적용):', aiError);
      warning = 'AI 응답 지연으로 기본 분석 결과를 사용했습니다.';
    }

    const normalized = analysisPayloadSchema.parse(analysisResult);
    const distortions = normalized.distortions;

    const { error: deleteError } = await supabase.from('analysis').delete().eq('log_id', logId);
    if (deleteError) {
      return NextResponse.json({ error: '기존 분석 데이터 삭제에 실패했습니다.' }, { status: 500 });
    }

    if (distortions.length > 0) {
      const rowsWithProtocolFields = distortions.map((item) => ({
        log_id: logId,
        distortion_type: item.type,
        intensity: item.intensity,
        logic_error_segment: item.segment,
        rationale: item.rationale || null,
        frame_type: normalized.frame_type ?? 'mixed',
        reference_point: normalized.reference_point ?? '사용자 준거점 정보 없음',
        probability_estimate: normalized.probability_estimate ?? null,
        loss_aversion_signal: normalized.loss_aversion_signal ?? 0.3,
        cas_rumination: normalized.cas_signal?.rumination ?? 0.3,
        cas_worry: normalized.cas_signal?.worry ?? 0.3,
        system2_question_seed:
          normalized.system2_question_seed ??
          '이 판단을 지지/반박하는 근거 비율은 각각 몇 %인가요?',
        decentering_prompt:
          normalized.decentering_prompt ??
          '생각을 사실이 아닌 가설로 두고 증거를 분리하세요.',
      }));

      let insertError = (await supabase.from('analysis').insert(rowsWithProtocolFields)).error;

      if (insertError) {
        const rowsLegacy = distortions.map((item) => ({
          log_id: logId,
          distortion_type: item.type,
          intensity: item.intensity,
          logic_error_segment: item.segment,
        }));
        const legacyInsert = await supabase.from('analysis').insert(rowsLegacy);
        insertError = legacyInsert.error;
      }

      if (insertError) {
        return NextResponse.json(
          { error: '분석 결과 저장에 실패했습니다.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        ...normalized,
        warning,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/analyze 실패:', error);
    return NextResponse.json({ error: '분석 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
