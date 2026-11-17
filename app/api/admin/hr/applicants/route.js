import { NextResponse } from 'next/server';
import { requireHR } from '../../../../../lib/authGuard';
import { createSupabaseAdmin } from '../../../../../lib/supabaseServer';
import { sendEmail } from '../../../../../lib/email';

// PATH: app/api/admin/hr/applicants/route.js
// Actions on one or more applications while in the "Applicant" list.
// Every action accepts either a single `id` or an array `ids` (bulk).

const inviteEmail = (name, job) => ({
  subject: `You've been shortlisted — ${job}`,
  text: `Dear ${name},\n\nCongratulations — your application for the ${job} position at Rumbu Industries has passed our initial screening. Our HR team will be in touch shortly with the date, time and venue for your interview.\n\nBest regards,\nRumbu Industries HR`,
});

const regretEmail = (name, job) => ({
  subject: `Update on your application — ${job}`,
  text: `Dear ${name},\n\nThank you for applying for the ${job} position at Rumbu Industries and for the time you invested in your application. After careful review, we will not be moving forward with your application on this occasion.\n\nWe appreciate your interest in Rumbu Industries and encourage you to apply for future openings that match your experience.\n\nBest regards,\nRumbu Industries HR`,
});

export async function POST(request) {
  const profile = await requireHR();
  if (!profile) return NextResponse.json({ error: 'HR access only.' }, { status: 403 });

  const body = await request.json();
  const { action } = body;
  const admin = createSupabaseAdmin();

  const ids = Array.isArray(body.ids) && body.ids.length ? body.ids : (body.id ? [body.id] : []);
  if (['disqualify', 'move_to_interviewed', 'reset_to_applicant'].includes(action) && ids.length === 0) {
    return NextResponse.json({ error: 'No applications selected.' }, { status: 400 });
  }

  // send_email defaults to true; pass send_email:false to skip notifying.
  const wantsEmail = body.send_email !== false;

  if (action === 'disqualify' || action === 'move_to_interviewed') {
    const stage = action === 'disqualify' ? 'disqualified' : 'interviewed';
    const results = [];

    for (const id of ids) {
      const { error } = await admin.from('applications').update({ hr_stage: stage }).eq('id', id);
      if (error) { results.push({ id, ok: false, error: error.message }); continue; }

      let emailed = null;
      if (wantsEmail) {
        const { data: app } = await admin.from('applications').select('full_name, email, jobs(title)').eq('id', id).single();
        if (app?.email) {
          const job = app.jobs?.title || 'the role you applied for';
          const { subject, text } = action === 'disqualify' ? regretEmail(app.full_name, job) : inviteEmail(app.full_name, job);
          const result = await sendEmail({ to: app.email, subject, text });
          await admin.from('email_log').insert({ application_id: id, to_email: app.email, subject, body: text, sent: result.sent, provider_response: result.response });
          emailed = result.sent;
        }
      }
      results.push({ id, ok: true, emailed });
    }

    return NextResponse.json({ ok: true, results });
  }

  // Lets HR undo a disqualify/interview move back into the applicant pool.
  // Also clears any panel already set up (cascades to panelists), so a
  // fresh panel later won't hit the unique-constraint error.
  if (action === 'reset_to_applicant') {
    for (const id of ids) {
      await admin.from('interview_panels').delete().eq('application_id', id);
      await admin.from('applications').update({ hr_stage: 'applicant' }).eq('id', id);
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
}
