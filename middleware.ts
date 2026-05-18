import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// 폐쇄 베타 게이트 — 2026-05-18 (Migration 19 정합).
// 보호 경로 진입 시 세션 + selected_emails 화이트리스트 검사.
// 미승인 → /waitlist 리다이렉트.
//
// 설계 결정 (CPO/CSO/CTO 합의):
//   - 가입·이메일 인증은 누구나 가능 (auth.users 트리거 제거됨)
//   - 게이트는 app 레이어 단일 지점 = root middleware
//   - public 경로는 인증·승인 무관하게 통과 (랜딩·약관·응모·인증·대기 페이지)

const PUBLIC_PATH_PREFIXES = [
  '/auth',           // login, signup, callback
  '/apply',          // 응모 폼
  '/waitlist',       // 승인 대기 안내
  '/terms',
  '/privacy',
  '/disclaimer',
  '/our-philosophy',
  '/manual',
  '/beta-incentive',
  '/safety',
  '/install',
  '/setup-required',
  '/icons',
];

// 정확히 매칭되는 public 경로 (prefix match 가 너무 넓을 때)
const PUBLIC_EXACT_PATHS = new Set<string>(['/']);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT_PATHS.has(pathname)) return true;
  return PUBLIC_PATH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // public 경로는 통과
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Supabase SSR 클라이언트 — 요청 쿠키 기반 세션 평가
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 미로그인은 미들웨어에서 처리하지 않음 (각 페이지의 기존 /auth/login 리다이렉트 흐름 유지)
  if (!user) {
    return response;
  }

  // 승인 여부 RPC 호출 (SECURITY DEFINER + STABLE)
  const { data: isApproved, error } = await supabase.rpc('is_current_user_approved');

  // RPC 오류 시 안전하게 미승인 처리 (게이트는 fail-closed)
  if (error || !isApproved) {
    const url = request.nextUrl.clone();
    url.pathname = '/waitlist';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

// 정적 자원·api·image 최적화 자원은 매칭에서 제외
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api|favicon.ico|sw.js|manifest.json|workbox-.*\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json)$).*)',
  ],
};
