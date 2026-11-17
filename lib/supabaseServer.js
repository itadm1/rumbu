import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getSupabaseStatus, requirePublicConfig, requireServiceConfig } from './supabaseConfig';

// Auth-aware server client: reads the logged-in user from cookies.
// Throws SupabaseConfigError when the environment is not configured.
export function createSupabaseServer() {
  const { url, anonKey } = requirePublicConfig();
  const cookieStore = cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component without a response to mutate; ignore.
        }
      },
    },
  });
}

// Admin client using the service role key. BYPASSES row level security.
// Only ever import this in server code (API routes / server actions), never client.
// Throws SupabaseConfigError when the environment is not configured.
export function createSupabaseAdmin() {
  const { url, serviceKey } = requireServiceConfig();
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// The only roles that may use the workspace. Anything else (including the
// database default of 'pending' and a missing profile row) has no access.
export const STAFF_ROLES = ['admin', 'hr', 'super_admin'];

export function isStaffRole(role) {
  return STAFF_ROLES.includes(role);
}

// Helper: get the current user's profile (with role), or null.
// Returns null (never throws) when Supabase is not configured, so every
// authorisation check built on it fails closed.
//
// A signed-in account is NOT enough. The account must also have a profile row
// with a staff role. An account with no profile row, or with any other role,
// gets null, so every page and API route treats it as signed out.
export async function getCurrentProfile() {
  if (!getSupabaseStatus().ready) return null;
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createSupabaseAdmin();
  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile || !isStaffRole(profile.role)) return null;
  return profile;
}
