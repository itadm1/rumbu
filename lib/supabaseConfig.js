// Single source of truth for Supabase environment configuration.
//
// Nothing here creates a client. It only reports whether the required
// environment variables are present and well formed, so callers can show a
// controlled "not configured" state instead of letting the Supabase SDK throw
// "Your project's URL and Key are required to create a Supabase client!".
//
// Safe to import from middleware, server components, route handlers and
// client components. Only NEXT_PUBLIC_* values are ever exposed to the
// browser; the service role key is read on the server alone and its value is
// never returned from this module.

const PLACEHOLDER = /your-project-ref|your-anon|your-service|^changeme$/i;

function clean(value) {
  const v = (value || '').trim();
  return v && !PLACEHOLDER.test(v) ? v : '';
}

function validUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

export class SupabaseConfigError extends Error {
  constructor(missing) {
    super(`Supabase is not configured. Missing or invalid: ${missing.join(', ')}.`);
    this.name = 'SupabaseConfigError';
    this.missing = missing;
  }
}

// NOTE: the NEXT_PUBLIC_* names must be written out literally so Next.js can
// inline them into the browser bundle.
export function getPublicSupabaseConfig() {
  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const missing = [];
  if (!url || !validUrl(url)) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return { url, anonKey, ready: missing.length === 0, missing };
}

// Server only. Reports presence of the service role key without returning it.
export function getSupabaseStatus() {
  const pub = getPublicSupabaseConfig();
  const missing = [...pub.missing];
  if (!clean(process.env.SUPABASE_SERVICE_ROLE_KEY)) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  return { publicReady: pub.ready, ready: missing.length === 0, missing };
}

// Server only. Returns the service role key, or throws a typed error.
export function requireServiceConfig() {
  const status = getSupabaseStatus();
  if (!status.ready) throw new SupabaseConfigError(status.missing);
  const { url } = getPublicSupabaseConfig();
  return { url, serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY.trim() };
}

export function requirePublicConfig() {
  const pub = getPublicSupabaseConfig();
  if (!pub.ready) throw new SupabaseConfigError(pub.missing);
  return pub;
}
