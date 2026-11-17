import { createBrowserClient } from '@supabase/ssr';
import { requirePublicConfig } from './supabaseConfig';

// Throws SupabaseConfigError (not the SDK's generic error) when the public
// URL or anon key is missing. Callers catch it and show a clear message.
export function createSupabaseBrowser() {
  const { url, anonKey } = requirePublicConfig();
  return createBrowserClient(url, anonKey);
}
