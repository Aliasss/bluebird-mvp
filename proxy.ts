import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user &&
    (request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/log') ||
      request.nextUrl.pathname.startsWith('/analyze') ||
      request.nextUrl.pathname.startsWith('/visualize') ||
      request.nextUrl.pathname.startsWith('/action'))
  ) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (
    user &&
    (request.nextUrl.pathname.startsWith('/auth/login') ||
      request.nextUrl.pathname.startsWith('/auth/signup'))
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/log/:path*',
    '/analyze/:path*',
    '/visualize/:path*',
    '/action/:path*',
    '/auth/:path*',
  ],
};
