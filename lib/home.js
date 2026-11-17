import { createSupabaseAdmin } from './supabaseServer';
import { getSupabaseStatus } from './supabaseConfig';
import { HOME_DEFAULTS, sanitizeHome } from './homeContent';

// Where the front page content is saved: one row in the app_settings table.
export const HOME_KEY = 'home_page';

// Server only. Returns the saved front page content, or the defaults when
// nothing has been saved, the database is not connected, or it cannot be
// reached. The front page therefore always has something to show.
export async function getHomeContent() {
  if (!getSupabaseStatus().ready) return HOME_DEFAULTS;
  try {
    const { data, error } = await createSupabaseAdmin()
      .from('app_settings')
      .select('value')
      .eq('key', HOME_KEY)
      .maybeSingle();
    if (error || !data?.value) return HOME_DEFAULTS;
    return sanitizeHome(JSON.parse(data.value));
  } catch {
    return HOME_DEFAULTS;
  }
}
