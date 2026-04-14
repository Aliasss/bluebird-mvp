import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { consumeRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { z } from 'zod';

type ActionRequestBody = {
  logId?: string;
  finalAction?: string;
  markCompleted?: boolean;
};

const actionRequestSchema = z.object({
  logId: z.string().uuid(),
  finalAction: z.string().trim().max(500).optional(),
  markCompleted: z.boolean().optional(),
});

function calcAutonomyScore(params: { averageIntensity: number; answerCount: number }): number {
  const base = 10;
  const distortionBonus = Math.round(params.averageIntensity * 5);
  const answerBonus = Math.min(3, params.answerCount);
  return base + distortionBonus + answerBonus;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ActionRequestBody;
    const parsedBody = actionRequestSchema.safeParse({
      logId: body.logId?.trim(),
      finalAction: body.finalAction,
      markCompleted: body.markCompleted,
    });
    if (!parsedBody.success) {
      return NextResponse.json({ error: '입력 형식이 올바르지 않습니다.' }, { status: 400 });
    }
    const { logId } = parsedBody.data;
    const finalAction = parsedBody.data.finalAction?.trim() ?? '';
    const markCompleted = Boolean(parsedBody.data.markCompleted);

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const rateKey = `action:${user.id}:${getClientIp(request)}`;
    const rate = consumeRateLimit(rateKey, { windowMs: 60_000, maxRequests: 20 });
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
          retryAfterSec: rate.retryAfterSec,
        },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
      );
    }

    const { data: logData, error: logError } = await supabase
      .from('logs')
      .select('id')
      .eq('id', logId)
      .eq('user_id', user.id)
      .single();

    if (logError || !logData) {
      return NextResponse.json({ error: '로그를 찾을 수 없습니다.' }, { status: 404 });
    }

    const { data: intervention, error: interventionError } = await supabase
      .from('intervention')
      .select('id, user_answers, final_action')
      .eq('log_id', logId)
      .maybeSingle();

    if (interventionError) {
      return NextResponse.json({ error: '개입 데이터 조회에 실패했습니다.' }, { status: 500 });
    }

    const effectiveAction = finalAction || intervention?.final_action || '';
    if (effectiveAction.length < 8) {
      return NextResponse.json(
        { error: '행동 문장은 최소 8자 이상으로 구체적으로 작성해주세요.' },
        { status: 400 }
      );
    }

    const actionPayload: {
      final_action: string;
      is_completed?: boolean;
      autonomy_score?: number;
    } = { final_action: effectiveAction };

    if (markCompleted) {
      const { data: analysisRows, error: analysisError } = await supabase
        .from('analysis')
        .select('intensity')
        .eq('log_id', logId);

      if (analysisError) {
        return NextResponse.json({ error: '분석 데이터 조회에 실패했습니다.' }, { status: 500 });
      }

      const averageIntensity =
        (analysisRows?.reduce((sum, row) => sum + Number(row.intensity ?? 0), 0) ?? 0) /
        Math.max(1, analysisRows?.length ?? 1);

      const answerCount = Object.keys(intervention?.user_answers ?? {}).filter(
        (key) => Boolean(intervention?.user_answers?.[key])
      ).length;

      actionPayload.is_completed = true;
      actionPayload.autonomy_score = calcAutonomyScore({ averageIntensity, answerCount });
    }

    if (intervention?.id) {
      const { error: updateError } = await supabase
        .from('intervention')
        .update(actionPayload)
        .eq('id', intervention.id);

      if (updateError) {
        return NextResponse.json({ error: '행동 저장에 실패했습니다.' }, { status: 500 });
      }
    } else {
      const { error: insertError } = await supabase.from('intervention').insert({
        log_id: logId,
        socratic_questions: [],
        user_answers: {},
        ...actionPayload,
      });

      if (insertError) {
        return NextResponse.json({ error: '행동 저장에 실패했습니다.' }, { status: 500 });
      }
    }

    return NextResponse.json(
      {
        success: true,
        isCompleted: markCompleted,
        autonomyScore: actionPayload.autonomy_score ?? null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/action 실패:', error);
    return NextResponse.json({ error: '행동 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
