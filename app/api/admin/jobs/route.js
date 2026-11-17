import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/authGuard';
import { createSupabaseAdmin } from '../../../../lib/supabaseServer';

export async function POST(request) {
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { action } = body;
  const admin = createSupabaseAdmin();

  if (action === 'create' || action === 'update') {
    const { id, title, location, type, department, summary, responsibilities, requirements, open } = body;
    if (!title) return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    const row = {
      title,
      location: location || '',
      type: type || '',
      department: department || '',
      summary: summary || '',
      responsibilities: responsibilities || '',
      requirements: requirements || '',
      open: open !== false,
    };
    if (action === 'create') {
      const { error } = await admin.from('jobs').insert([row]);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      const { error } = await admin.from('jobs').update(row).eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  if (action === 'delete') {
    const { error } = await admin.from('jobs').delete().eq('id', body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
}
