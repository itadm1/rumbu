import { NextResponse } from 'next/server';
import { requireHR } from '../../../../../lib/authGuard';
import { createSupabaseAdmin } from '../../../../../lib/supabaseServer';
import { sendEmail } from '../../../../../lib/email';

function interviewEmailFor(app, panel) {
  const job = app.jobs?.title || 'the role you applied for';
  const when = panel.scheduled_at
    ? new Date(panel.scheduled_at).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })
    : 'to be confirmed';
  return {
    subject: `Interview scheduled — ${job}`,
    text: `Dear ${app.full_name},\n\nYour interview for the ${job} position at Rumbu Industries has been scheduled:\n\nDate & time: ${when}\nLocation: ${panel.location || 'to be confirmed'}\n\n${panel.notes ? panel.notes + '\n\n' : ''}Please arrive 10 minutes early with a valid ID.\n\nBest regards,\nRumbu Industries HR`,
  };
}

function outcomeEmailFor(app, decision) {
  const job = app.jobs?.title || 'the role you applied for';
  if (decision === 'selected') {
    return {
      subject: `You've been selected — ${job}`,
      text: `Dear ${app.full_name},\n\nCongratulations — after a thorough interview process, we are pleased to let you know that you have been selected to move forward for the ${job} position at Rumbu Industries. Our HR team will be in touch shortly with the formal offer and next steps.\n\nBest regards,\nRumbu Industries HR`,
    };
  }
  return {
    subject: `Interview outcome — ${job}`,
    text: `Dear ${app.full_name},\n\nThank you for taking the time to interview for the ${job} position at Rumbu Industries. After careful consideration, we have decided not to move forward with your application on this occasion.\n\nWe appreciate the effort you put into the process and encourage you to apply again in the future.\n\nBest regards,\nRumbu Industries HR`,
  };
}

// PATH: app/api/admin/hr/panels/route.js
// Interview panel setup, panelist scoring, and the final threshold decision.
export async function POST(request) {
  const profile = await requireHR();
  if (!profile) return NextResponse.json({ error: 'HR access only.' }, { status: 403 });

  const body = await request.json();
  const { action } = body;
  const admin = createSupabaseAdmin();

  // Create the panel for an application, with a first batch of panelists.
  // application must currently be hr_stage = 'interviewed'.
  if (action === 'create_panel') {
    const { application_id, scheduled_at, location, notes, threshold_score, panelists } = body;
    if (!application_id) return NextResponse.json({ error: 'Missing application id.' }, { status: 400 });
    const cleanPanelists = (panelists || []).filter((p) => p.name?.trim());
    if (cleanPanelists.length === 0) return NextResponse.json({ error: 'Add at least one panelist.' }, { status: 400 });

    // Reuse an existing panel for this application if one already exists —
    // covers retries after a previous attempt partially failed (panel row
    // saved, panelist rows didn't), instead of hitting the unique-constraint
    // error on application_id.
    const { data: existing } = await admin.from('interview_panels')
      .select('id, decision').eq('application_id', application_id).maybeSingle();

    if (existing && existing.decision !== 'pending') {
      return NextResponse.json({
        error: 'This applicant already has a finalized panel. Use "Reset" on the Applicants page first, then set up a new panel.',
      }, { status: 400 });
    }

    let panelId;
    if (existing) {
      panelId = existing.id;
      const { error: updErr } = await admin.from('interview_panels').update({
        scheduled_at: scheduled_at || null,
        location: location || null,
        notes: notes || null,
        threshold_score: threshold_score ? Number(threshold_score) : 70,
      }).eq('id', panelId);
      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
      // Clear any partially-saved panelists so a retry doesn't duplicate them.
      await admin.from('interview_panelists').delete().eq('panel_id', panelId);
    } else {
      const { data: panel, error } = await admin.from('interview_panels').insert({
        application_id,
        scheduled_at: scheduled_at || null,
        location: location || null,
        notes: notes || null,
        threshold_score: threshold_score ? Number(threshold_score) : 70,
      }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      panelId = panel.id;
    }

    const rows = cleanPanelists.map((p) => ({ panel_id: panelId, name: p.name.trim(), email: p.email?.trim() || null }));
    const { error: pErr } = await admin.from('interview_panelists').insert(rows);
    if (pErr) {
      // Roll back the panel row we just created (but not one we were
      // reusing) so a retry doesn't collide with it again.
      if (!existing) await admin.from('interview_panels').delete().eq('id', panelId);
      return NextResponse.json({ error: pErr.message }, { status: 500 });
    }

    // Notify the applicant with the confirmed interview details.
    let emailed = null;
    const wantsEmail = body.send_email !== false;
    if (wantsEmail) {
      const { data: app } = await admin.from('applications').select('full_name, email, jobs(title)').eq('id', application_id).single();
      if (app?.email) {
        const { subject, text } = interviewEmailFor(app, { scheduled_at, location, notes });
        const result = await sendEmail({ to: app.email, subject, text });
        await admin.from('email_log').insert({ application_id, to_email: app.email, subject, body: text, sent: result.sent, provider_response: result.response });
        emailed = result.sent;
      }
    }

    return NextResponse.json({ ok: true, panel_id: panelId, emailed });
  }

  // Resend the interview-details email for an existing panel — use after a
  // reschedule, or if the first send failed before Resend was configured.
  if (action === 'resend_interview_email') {
    const { panel_id } = body;
    if (!panel_id) return NextResponse.json({ error: 'Missing panel id.' }, { status: 400 });
    const { data: panel, error: panelErr } = await admin.from('interview_panels').select('*').eq('id', panel_id).single();
    if (panelErr || !panel) return NextResponse.json({ error: 'Panel not found.' }, { status: 404 });
    const { data: app } = await admin.from('applications').select('full_name, email, jobs(title)').eq('id', panel.application_id).single();
    if (!app?.email) return NextResponse.json({ error: 'This applicant has no email on file.' }, { status: 400 });

    const { subject, text } = interviewEmailFor(app, panel);
    const result = await sendEmail({ to: app.email, subject, text });
    await admin.from('email_log').insert({ application_id: panel.application_id, to_email: app.email, subject, body: text, sent: result.sent, provider_response: result.response });
    return NextResponse.json({ ok: true, sent: result.sent, note: result.sent ? 'Email delivered.' : result.response });
  }

  // Add one more panelist to an existing panel.
  if (action === 'add_panelist') {
    const { panel_id, name, email } = body;
    if (!panel_id || !name?.trim()) return NextResponse.json({ error: 'Missing panel or name.' }, { status: 400 });
    const { error } = await admin.from('interview_panelists').insert({ panel_id, name: name.trim(), email: email?.trim() || null });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // Record (or update) one panelist's score for their panel.
  if (action === 'update_score') {
    const { panelist_id, score, comments } = body;
    if (!panelist_id) return NextResponse.json({ error: 'Missing panelist id.' }, { status: 400 });
    const s = score === '' || score === null || score === undefined ? null : Number(score);
    if (s !== null && (isNaN(s) || s < 0 || s > 100)) {
      return NextResponse.json({ error: 'Score must be between 0 and 100.' }, { status: 400 });
    }
    const { error } = await admin.from('interview_panelists').update({ score: s, comments: comments ?? null }).eq('id', panelist_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // Average every panelist's score against the panel's threshold, and
  // automatically move the applicant to Selected or Not Selected.
  if (action === 'finalize') {
    const { panel_id } = body;
    if (!panel_id) return NextResponse.json({ error: 'Missing panel id.' }, { status: 400 });

    const { data: panel, error: panelErr } = await admin.from('interview_panels').select('*').eq('id', panel_id).single();
    if (panelErr || !panel) return NextResponse.json({ error: 'Panel not found.' }, { status: 404 });

    const { data: panelists, error: plErr } = await admin.from('interview_panelists').select('*').eq('panel_id', panel_id);
    if (plErr) return NextResponse.json({ error: plErr.message }, { status: 500 });

    const scored = (panelists || []).filter((p) => p.score !== null && p.score !== undefined);
    if (scored.length === 0) return NextResponse.json({ error: 'No panelist scores entered yet.' }, { status: 400 });

    const average = scored.reduce((sum, p) => sum + Number(p.score), 0) / scored.length;
    const decision = average >= Number(panel.threshold_score) ? 'selected' : 'not_selected';

    const { error: upErr } = await admin.from('interview_panels').update({ decision }).eq('id', panel_id);
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    const { error: appErr } = await admin.from('applications').update({ hr_stage: decision }).eq('id', panel.application_id);
    if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 });

    // Notify the applicant of the outcome — congrats if selected, a polite
    // regret note if not. Pass send_email:false in the request to skip this.
    let emailed = null;
    if (body.send_email !== false) {
      const { data: app } = await admin.from('applications').select('full_name, email, jobs(title)').eq('id', panel.application_id).single();
      if (app?.email) {
        const { subject, text } = outcomeEmailFor(app, decision);
        const result = await sendEmail({ to: app.email, subject, text });
        await admin.from('email_log').insert({ application_id: panel.application_id, to_email: app.email, subject, body: text, sent: result.sent, provider_response: result.response });
        emailed = result.sent;
      }
    }

    return NextResponse.json({ ok: true, average, decision, emailed });
  }

  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
}
