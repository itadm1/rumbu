import { NextResponse } from 'next/server';
import { requireHR } from '../../../../../lib/authGuard';
import { createSupabaseAdmin } from '../../../../../lib/supabaseServer';
import { sendEmail } from '../../../../../lib/email';

// PATH: app/api/admin/hr/selected/route.js
//
// Every offer email is always logged to `email_log`, and additionally
// delivered via Resend if RESEND_API_KEY is set (see lib/email.js). Until
// then it's logged as "not sent" so HR still sees what would have gone out.

function fillTemplate(str, { name, job }) {
  return str.replaceAll('{{name}}', name).replaceAll('{{job}}', job);
}

export async function POST(request) {
  const profile = await requireHR();
  if (!profile) return NextResponse.json({ error: 'HR access only.' }, { status: 403 });

  const body = await request.json();
  const { action } = body;
  const admin = createSupabaseAdmin();

  if (action === 'send_offer') {
    const { application_id, subject, message } = body;
    if (!application_id) return NextResponse.json({ error: 'Missing application id.' }, { status: 400 });

    const { data: app, error: appErr } = await admin.from('applications').select('*, jobs(title)').eq('id', application_id).single();
    if (appErr || !app) return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
    if (!app.email) return NextResponse.json({ error: 'This applicant has no email on file.' }, { status: 400 });

    const job = app.jobs?.title || 'the role you applied for';
    const finalSubject = subject || `Job Offer — ${job}`;
    const finalBody = message || `Dear ${app.full_name},\n\nCongratulations — Rumbu Industries would like to offer you the position of ${job}. Please reply to confirm your acceptance.\n\nBest regards,\nRumbu Industries HR`;

    const result = await sendEmail({ to: app.email, subject: finalSubject, text: finalBody });
    const { error: logErr } = await admin.from('email_log').insert({
      application_id, to_email: app.email, subject: finalSubject, body: finalBody, sent: result.sent, provider_response: result.response,
    });
    if (logErr) return NextResponse.json({ error: logErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, sent: result.sent, note: result.sent ? 'Email delivered.' : result.response });
  }

  // Send a personalized offer to several selected candidates at once.
  // subject/message may use {{name}} and {{job}} placeholders, filled in per recipient.
  if (action === 'bulk_send_offer') {
    const { application_ids, subject, message } = body;
    if (!Array.isArray(application_ids) || application_ids.length === 0) {
      return NextResponse.json({ error: 'No candidates selected.' }, { status: 400 });
    }

    const results = [];
    for (const application_id of application_ids) {
      const { data: app } = await admin.from('applications').select('*, jobs(title)').eq('id', application_id).single();
      if (!app?.email) { results.push({ application_id, ok: false, error: 'No email on file.' }); continue; }

      const job = app.jobs?.title || 'the role you applied for';
      const finalSubject = fillTemplate(subject || `Job Offer — {{job}}`, { name: app.full_name, job });
      const finalBody = fillTemplate(
        message || `Dear {{name}},\n\nCongratulations — Rumbu Industries would like to offer you the position of {{job}}. Please reply to confirm your acceptance.\n\nBest regards,\nRumbu Industries HR`,
        { name: app.full_name, job }
      );

      const result = await sendEmail({ to: app.email, subject: finalSubject, text: finalBody });
      await admin.from('email_log').insert({ application_id, to_email: app.email, subject: finalSubject, body: finalBody, sent: result.sent, provider_response: result.response });
      results.push({ application_id, ok: true, sent: result.sent });
    }

    return NextResponse.json({ ok: true, results });
  }

  // Candidate confirmed acceptance (by phone/email/WhatsApp) -> copy to staff.
  if (action === 'mark_accepted') {
    const { application_id, job_title, department, start_date } = body;
    if (!application_id) return NextResponse.json({ error: 'Missing application id.' }, { status: 400 });

    const { data: app, error: appErr } = await admin.from('applications').select('*, jobs(title, department)').eq('id', application_id).single();
    if (appErr || !app) return NextResponse.json({ error: 'Application not found.' }, { status: 404 });

    const { error: staffErr } = await admin.from('staff').insert({
      application_id,
      full_name: app.full_name,
      email: app.email,
      phone: app.phone,
      job_title: job_title || app.jobs?.title || null,
      department: department || app.jobs?.department || null,
      start_date: start_date || null,
    });
    if (staffErr) return NextResponse.json({ error: staffErr.message }, { status: 500 });

    const { error: upErr } = await admin.from('applications').update({ hr_stage: 'staff' }).eq('id', application_id);
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  }

  // Candidate declined, or never confirmed.
  if (action === 'mark_declined') {
    const { application_id } = body;
    if (!application_id) return NextResponse.json({ error: 'Missing application id.' }, { status: 400 });
    const { error } = await admin.from('applications').update({ hr_stage: 'not_selected' }).eq('id', application_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
}
