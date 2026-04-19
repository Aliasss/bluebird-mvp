import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({
  situation: z.string().trim().min(5).max(1000),
  system2Action: z.string().trim().min(10).max(1000),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: '입력 형식이 올바르지 않습니다.' }, { status: 400 });
    }
    const { situation, system2Action } = parsed.data;

    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // logs 테이블에 성공 로그 저장
    const { data: logData, error: logError } = await supabase
      .from('logs')
      .insert({
        user_id: user.id,
        trigger: situation,
        thought: system2Action,
        log_type: 'success',
      })
      .select()
      .single();

    if (logError || !logData) {
      return NextResponse.json({ error: '저장에 실패했습니다.' }, { status: 500 });
    }

    // intervention 테이블에 완료 상태로 저장 (autonomy_score: 15)
    const { error: interventionError } = await supabase.from('intervention').insert({
      log_id: logData.id,
      socratic_questions: [],
      user_answers: {},
      final_action: system2Action,
      is_completed: true,
      autonomy_score: 15,
    });

    if (interventionError) {
      // logs 저장은 됐으니 실패해도 진행 (non-critical)
      console.error('intervention 저장 실패:', interventionError);
    }

    return NextResponse.json({ success: true, logId: logData.id }, { status: 200 });
  } catch (error) {
    console.error('POST /api/success-log 실패:', error);
    return NextResponse.json({ error: '저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
