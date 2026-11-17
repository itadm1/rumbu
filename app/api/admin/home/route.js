import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../../../lib/authGuard';
import { createSupabaseAdmin } from '../../../../lib/supabaseServer';
import { HOME_KEY } from '../../../../lib/home';
import { LIMITS, sanitizeHome } from '../../../../lib/homeContent';

// Saves the front page content. Staff only.
export async function POST(request) {
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Nothing to save.' }, { status: 400 });
  }

  const sent = Array.isArray(body?.content?.panels) ? body.content.panels : [];
  const named = sent.filter((p) => typeof p?.title === 'string' && p.title.trim());
  if (named.length < LIMITS.minPanels) {
    return NextResponse.json({ error: `The front page needs at least ${LIMITS.minPanels} panels, each with a name.` }, { status: 400 });
  }
  if (named.length !== sent.length) {
    return NextResponse.json({ error: 'Every panel needs a name.' }, { status: 400 });
  }

  const content = sanitizeHome(body.content);
  const admin = createSupabaseAdmin();
  const { error } = await admin
    .from('app_settings')
    .upsert({ key: HOME_KEY, value: JSON.stringify(content), updated_at: new Date().toISOString() });
  if (error) {
    return NextResponse.json({ error: 'The front page could not be saved. Check that the app_settings table exists (see supabase/home-page.sql).' }, { status: 500 });
  }

  revalidatePath('/');
  return NextResponse.json({ ok: true, content });
}
