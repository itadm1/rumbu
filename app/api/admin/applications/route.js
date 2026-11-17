import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/authGuard';
import { createSupabaseAdmin } from '../../../../lib/supabaseServer';

const STAGES = ['applied', 'screening', 'shortlisted', 'interview', 'offer', 'hired', 'rejected'];

export async function PATCH(request) {
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });

  const { id, stage, interview_at, interview_location, last_emailed_stage, last_emailed_at } = await request.json();
  if (!id || !stage || !STAGES.includes(stage)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const update = { stage };
  if (interview_at !== undefined) update.interview_at = interview_at || null;
  if (interview_location !== undefined) update.interview_location = interview_location || null;
  if (last_emailed_stage !== undefined) update.last_emailed_stage = last_emailed_stage;
  if (last_emailed_at !== undefined) update.last_emailed_at = last_emailed_at;

  const admin = createSupabaseAdmin();
  const { error } = await admin.from('applications').update(update).eq('id', id);
  if (error) return NextResponse.json({ error: 'Database error.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });

  const admin = createSupabaseAdmin();
  const { error } = await admin.from('applications').delete().eq('id', id);
  if (error) return NextResponse.json({ error: 'Database error.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}