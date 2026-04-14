import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type SaveAnswersRequestBody = {
  logId?: string;
  answers?: string[];
};

function hasNumericContent(value: string): boolean {
  return /\d+/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SaveAnswersRequestBody;
    const logId = body.logId?.trim();
    const answers = Array.isArray(body.answers) ? body.answers.map((v) => String(v).trim()) : [];

    if (!logId) {
      return NextResponse.json({ error: 'logId가 필요합니다.' }, { status: 400 });
    }

    if (answers.length !== 3) {
      return NextResponse.json({ error: '답변은 정확히 3개여야 합니다.' }, { status: 400 });
    }

    if (answers.some((answer) => !hasNumericContent(answer))) {
      return NextResponse.json(
        { error: '각 답변에는 숫자 또는 % 정보가 포함되어야 합니다.' },
        { status: 400 }
      );
    }

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
      .select('id')
      .eq('id', logId)
      .eq('user_id', user.id)
      .single();

    if (logError || !logData) {
      return NextResponse.json({ error: '로그를 찾을 수 없습니다.' }, { status: 404 });
    }

    const userAnswers = {
      q1: answers[0],
      q2: answers[1],
      q3: answers[2],
    };

    const { data: existingIntervention, error: existingError } = await supabase
      .from('intervention')
      .select('id')
      .eq('log_id', logId)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: '기존 데이터 조회에 실패했습니다.' }, { status: 500 });
    }

    if (existingIntervention?.id) {
      const { error: updateError } = await supabase
        .from('intervention')
        .update({ user_answers: userAnswers })
        .eq('id', existingIntervention.id);

      if (updateError) {
        return NextResponse.json({ error: '답변 저장에 실패했습니다.' }, { status: 500 });
      }
    } else {
      const { error: insertError } = await supabase.from('intervention').insert({
        log_id: logId,
        user_answers: userAnswers,
      });

      if (insertError) {
        return NextResponse.json({ error: '답변 저장에 실패했습니다.' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('POST /api/intervention/answers 실패:', error);
    return NextResponse.json(
      { error: '답변 저장 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
