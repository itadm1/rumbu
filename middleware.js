import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { getPublicSupabaseConfig, getSupabaseStatus } from './lib/supabaseConfig';

const SETUP_PATH = '/admin/setup';

// Keep in step with STAFF_ROLES in lib/supabaseServer.js. It is repeated here
// because middleware cannot import that file (it uses next/headers).
const STAFF_ROLES = ['admin', 'hr', 'super_admin'];

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  const status = getSupabaseStatus();

  // Supabase is not configured: there is no way to authenticate anyone, so no
  // admin page may render. Every /admin URL shows the setup notice instead.
  // This fails closed; it does not grant access to anything.
  if (!status.ready) {
    if (path === SETUP_PATH) return NextResponse.next({ request });
    const url = request.nextUrl.clone();
    url.pathname = SETUP_PATH;
    return NextResponse.rewrite(url);
  }

  // Configured: the setup notice has nothing to say.
  if (path === SETUP_PATH) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({ request });
  const { url: supabaseUrl, anonKey } = getPublicSupabaseConfig();

  const supabase = createServerClient(supabaseUrl, anonKey, {
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
  });

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;
  } catch {
    // Supabase unreachable: treat as signed out. Protected pages redirect to
    // the login page, which reports the connection problem on sign-in.
    user = null;
  }

  // A signed-in account is not enough: it must also hold a staff role in the
  // profiles table. The lookup runs as the signed-in user, so row level
  // security applies. Any failure counts as no access (fails closed).
  let staff = false;
  if (user) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      staff = STAFF_ROLES.includes(profile?.role);
    } catch {
      staff = false;
    }
  }

  const isLoginPage = path === '/admin/login';

  // Not signed in, or signed in without a staff role, and trying to reach a
  // protected admin page -> go to login.
  if (!isLoginPage && !staff) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = user ? '?reason=no-access' : '';
    return NextResponse.redirect(url);
  }

  // Signed in as staff and visiting the login page -> go to dashboard.
  if (isLoginPage && staff) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
