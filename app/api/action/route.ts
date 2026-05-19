import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { consumeRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { AUTONOMY_NOTE_BONUS, calcAutonomyScore } from '@/lib/intervention/autonomy-score';
import { logServerError } from '@/lib/logging/server-logger';
import { trackCognitiveFunnel } from '@/lib/analytics/server';
import { z } from 'zod';

type ActionRequestBody = {
  logId?: string;
  finalAction?: string;
  markCompleted?: boolean;
  completionNote?: string;
};

const actionRequestSchema = z.object({
  logId: z.string().uuid(),
  finalAction: z.string().trim().max(500).optional(),
  markCompleted: z.boolean().optional(),
  completionNote: z.string().trim().max(200).optional(),
  completionReaction: z.enum(['improved', 'same', 'worse']).optional(),
});

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
    const completionNote = parsedBody.data.completionNote?.trim() ?? '';
    const completionReaction = parsedBody.data.completionReaction;

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
      .select('id, user_answers, final_action, is_completed, autonomy_score')
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

    // 이미 완료 처리된 경우 중복 완료 방지
    if (markCompleted && intervention?.is_completed) {
      return NextResponse.json(
        { success: true, isCompleted: true, autonomyScore: intervention.autonomy_score ?? null },
        { status: 200 }
      );
    }

    const actionPayload: {
      final_action: string;
      is_completed?: boolean;
      autonomy_score?: number;
      completion_note?: string;
      completion_reaction?: string;
    } = { final_action: effectiveAction };

    if (markCompleted) {
      // autonomy_score v2 — SDT autonomy 차원 측정. averageIntensity는 더 이상 사용하지 않음
      // (AI 추정값에 가중치를 주던 v1의 결합도를 끊는다).
      const answerCount = Object.keys(intervention?.user_answers ?? {}).filter(
        (key) => Boolean(intervention?.user_answers?.[key])
      ).length;

      const noteBonus = completionNote.length > 0 ? AUTONOMY_NOTE_BONUS : 0;
      actionPayload.is_completed = true;
      actionPayload.autonomy_score = calcAutonomyScore({ answerCount }) + noteBonus;
      if (completionNote.length > 0) {
        actionPayload.completion_note = completionNote;
      }
      if (completionReaction) {
        actionPayload.completion_reaction = completionReaction;
      }
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

    if (markCompleted) {
      void trackCognitiveFunnel('action_completed', {
        log_id: logId,
        autonomy_score: actionPayload.autonomy_score ?? null,
        has_note: completionNote.length > 0,
      });
    }

    // 누적 자율성 합계 — micro-feedback 카드 (액션 ② 2026-05-19 deep-dive).
    // markCompleted 일 때만 계산 (drafted save 시 누적 미변경).
    let totalAutonomyScore: number | null = null;
    if (markCompleted) {
      const { data: aggregate } = await supabase
        .from('intervention')
        .select('autonomy_score, logs!inner(user_id)')
        .eq('logs.user_id', user.id)
        .not('autonomy_score', 'is', null);
      totalAutonomyScore = (aggregate ?? []).reduce(
        (sum, row) => sum + (row.autonomy_score ?? 0),
        0,
      );
    }

    return NextResponse.json(
      {
        success: true,
        isCompleted: markCompleted,
        autonomyScore: actionPayload.autonomy_score ?? null,
        totalAutonomyScore,
      },
      { status: 200 }
    );
  } catch (error) {
    logServerError('api/action', error);
    return NextResponse.json({ error: '행동 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
