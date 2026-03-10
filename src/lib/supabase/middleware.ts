import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars are missing, pass through without crashing
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  try {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options: Record<string, unknown>;
          }>
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(
              name,
              value,
              options as Parameters<typeof supabaseResponse.cookies.set>[2]
            )
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Redirect unauthenticated users away from protected routes
    const protectedPaths = [
      '/today',
      '/dashboard',
      '/log',
      '/onboarding',
      '/settings',
    ];
    const isProtected = protectedPaths.some((p) =>
      request.nextUrl.pathname.startsWith(p)
    );

    if (!user && isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch {
    // If Supabase auth fails, pass through rather than crashing all routes
    return NextResponse.next({ request });
  }
}
