import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../lib/authGuard';
import { createSupabaseAdmin } from '../../../../../lib/supabaseServer';

const STAGES = ['applied', 'screening', 'shortlisted', 'interview', 'offer', 'hired', 'rejected'];

async function getFromAddress(admin) {
  const { data } = await admin
    .from('app_settings')
    .select('value')
    .eq('key', 'careers_from_email')
    .single();
  return data?.value || process.env.CAREERS_FROM_EMAIL || 'Rumbu Industries Careers <itadm1.ed2@rumbuindustries.com>';
}

export async function POST(request) {
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });

  const { id, stage, subject, body, interview_at, interview_location } = await request.json();
  if (!id || !stage || !STAGES.includes(stage) || !subject || !body) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const admin = createSupabaseAdmin();

  const { data: applicant, error: fetchErr } = await admin
    .from('applications')
    .select('email, full_name')
    .eq('id', id)
    .single();
  if (fetchErr || !applicant) {
    return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email is not configured yet (missing RESEND_API_KEY in Vercel).' }, { status: 500 });
  }

  const fromAddress = await getFromAddress(admin);

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: fromAddress, to: applicant.email, subject, text: body }),
  });

  if (!emailRes.ok) {
    const detail = await emailRes.text();
    return NextResponse.json({ error: `Email could not be sent (${detail.slice(0, 200)}).` }, { status: 502 });
  }

  const update = { stage, last_emailed_stage: stage, last_emailed_at: new Date().toISOString() };
  if (interview_at) update.interview_at = interview_at;
  if (interview_location) update.interview_location = interview_location;

  const { error } = await admin.from('applications').update(update).eq('id', id);
  if (error) return NextResponse.json({ error: 'Email sent, but the status could not be saved.' }, { status: 500 });

  return NextResponse.json({ ok: true });
}