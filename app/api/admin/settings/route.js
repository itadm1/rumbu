import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '../../../../lib/authGuard';
import { createSupabaseAdmin } from '../../../../lib/supabaseServer';

export async function GET() {
  const profile = await requireSuperAdmin();
  if (!profile) return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });

  const admin = createSupabaseAdmin();
  const { data } = await admin.from('app_settings').select('key, value');
  const settings = Object.fromEntries((data || []).map((r) => [r.key, r.value]));
  return NextResponse.json({ ok: true, settings });
}

export async function PATCH(request) {
  const profile = await requireSuperAdmin();
  if (!profile) return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });

  const { key, value } = await request.json();
  if (!key || typeof value !== 'string') {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const admin = createSupabaseAdmin();
  const { error } = await admin
    .from('app_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: 'Database error.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}