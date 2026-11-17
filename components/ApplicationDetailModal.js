'use client';

import { useState } from 'react';

const STAGES = [
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Screening' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
];

const EMAIL_STAGES = ['interview', 'offer', 'hired', 'rejected'];

const DOC_LABELS = {
  cv_path: 'CV',
  cover_letter_path: 'Cover letter',
  photo_path: 'Photo',
  nin_image_path: 'NIN slip',
  professional_cert_path: 'Prof. certificate',
};

function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function toLocalInputValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function buildTemplate(stage, a, interviewDate, interviewLocation) {
  const name = a.full_name?.split(' ')[0] || 'there';
  const role = a.job_title || 'the role';
  const when = interviewDate
    ? new Date(interviewDate).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })
    : '[date and time]';
  const where = interviewLocation || '[location or video call link]';

  if (stage === 'interview') {
    return {
      subject: `Interview invitation – ${role} at Rumbu Industries`,
      body: `Dear ${name},\n\nThank you for applying for the ${role} position at Rumbu Industries Limited. We were impressed with your application and would like to invite you for an interview.\n\nDate & time: ${when}\nLocation: ${where}\n\nPlease reply to confirm your attendance. If the time does not work for you, let us know and we will arrange an alternative.\n\nWe look forward to meeting you.\n\nKind regards,\nRecruitment Team\nRumbu Industries Limited`,
    };
  }
  if (stage === 'offer') {
    return {
      subject: `Job offer – ${role} at Rumbu Industries`,
      body: `Dear ${name},\n\nCongratulations. Following your interview, we are pleased to offer you the position of ${role} at Rumbu Industries Limited.\n\nOur HR team will be in touch shortly with your offer letter and the details of your start date and terms. Please reply to this email to confirm your interest.\n\nKind regards,\nRecruitment Team\nRumbu Industries Limited`,
    };
  }
  if (stage === 'hired') {
    return {
      subject: `Welcome to Rumbu Industries`,
      body: `Dear ${name},\n\nWelcome to Rumbu Industries Limited. We are delighted to confirm your appointment as ${role}.\n\nOur HR team will contact you shortly with onboarding details. We look forward to having you on the team.\n\nKind regards,\nRecruitment Team\nRumbu Industries Limited`,
    };
  }
  return {
    subject: `Your application – ${role}`,
    body: `Dear ${name},\n\nThank you for taking the time to apply for the ${role} position at Rumbu Industries Limited and for your interest in joining our team.\n\nAfter careful consideration, we will not be moving forward with your application on this occasion. We were impressed by your background and encourage you to apply for future opportunities that match your experience.\n\nWe wish you every success in your job search.\n\nKind regards,\nRecruitment Team\nRumbu Industries Limited`,
  };
}

export default function ApplicationDetailModal({ application, onClose, onUpdated }) {
  const a = application;
  const [stage, setStage] = useState(a.stage || 'applied');
  const [interviewDate, setInterviewDate] = useState(toLocalInputValue(a.interview_at));
  const [interviewLocation, setInterviewLocation] = useState(a.interview_location || '');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showEmail, setShowEmail] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const stageChanged = stage !== (a.stage || 'applied');
  const needsEmail = EMAIL_STAGES.includes(stage) && stageChanged;

  const onStageChange = (val) => {
    setStage(val);
    setMsg(''); setErr('');
    if (EMAIL_STAGES.includes(val) && val !== a.stage) {
      const tpl = buildTemplate(val, a, interviewDate, interviewLocation);
      setSubject(tpl.subject);
      setBody(tpl.body);
      setShowEmail(true);
    } else {
      setShowEmail(false);
    }
  };

  const regenerateTemplate = () => {
    const tpl = buildTemplate(stage, a, interviewDate, interviewLocation);
    setSubject(tpl.subject);
    setBody(tpl.body);
  };

  const saveOnly = async (markEmailed = false) => {
    setBusy(true); setErr(''); setMsg('');
    try {
      const payload = {
        id: a.id, stage,
        interview_at: interviewDate ? new Date(interviewDate).toISOString() : null,
        interview_location: interviewLocation || null,
      };
      if (markEmailed) {
        payload.last_emailed_stage = stage;
        payload.last_emailed_at = new Date().toISOString();
      }
      const res = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg(markEmailed ? 'Status saved and marked as emailed.' : 'Status saved.');
        onUpdated({ ...a, ...payload });
      } else {
        setErr(data.error || 'Could not save.');
      }
    } catch {
      setErr('Could not save.');
    } finally {
      setBusy(false);
    }
  };

  const saveAndSend = async () => {
    if (stage === 'interview' && (!interviewDate || !interviewLocation)) {
      setErr('Please set the interview date/time and location before sending.');
      return;
    }
    setBusy(true); setErr(''); setMsg('');
    try {
      const res = await fetch('/api/admin/applications/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: a.id, stage, subject, body,
          interview_at: interviewDate ? new Date(interviewDate).toISOString() : null,
          interview_location: interviewLocation || null,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg('Email sent and status updated.');
        onUpdated({
          ...a, stage,
          interview_at: interviewDate ? new Date(interviewDate).toISOString() : null,
          interview_location: interviewLocation,
          last_emailed_stage: stage,
          last_emailed_at: new Date().toISOString(),
        });
      } else {
        setErr(data.error || 'Could not send email.');
      }
    } catch {
      setErr('Could not send email.');
    } finally {
      setBusy(false);
    }
  };

  const sendViaMailApp = () => {
    if (stage === 'interview' && (!interviewDate || !interviewLocation)) {
      setErr('Please set the interview date/time and location before sending.');
      return;
    }
    const mailto = `mailto:${encodeURIComponent(a.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
    saveOnly(true);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{a.full_name}</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>

        <div className="modal-body">
          <div className="modal-section-title">Application</div>
          <div className="modal-grid">
            <div><strong>Role</strong><div>{a.job_title}</div></div>
            <div><strong>Email</strong><div><a href={`mailto:${a.email}`}>{a.email}</a></div></div>
            <div><strong>Phone</strong><div>{a.phone || '—'}</div></div>
            <div><strong>Date applied</strong><div>{fmt(a.created_at)}</div></div>
            <div><strong>State of origin</strong><div>{a.state_of_origin || '—'} {a.lga_of_origin ? `(${a.lga_of_origin})` : ''}</div></div>
            <div><strong>State of residence</strong><div>{a.state_of_residence || '—'} {a.lga_of_residence ? `(${a.lga_of_residence})` : ''}</div></div>
            <div className="span-all"><strong>Address</strong><div>{a.address || '—'}</div></div>
            <div><strong>Highest qualification</strong><div>{a.highest_qualification || '—'}</div></div>
            <div><strong>NIN number</strong><div>{a.nin_number || '—'}</div></div>
          </div>

          <div className="modal-section-title">Qualification certificates</div>
          <div className="modal-chips">
            {(a.qualifications || []).length === 0 && <span>—</span>}
            {(a.qualifications || []).map((qq, i) => (
              <span key={i} className="apps-qual-chip">
                {qq.url ? <a href={qq.url} target="_blank" rel="noreferrer">{qq.level}</a> : qq.level}
                {qq.classification ? ` (${qq.classification})` : ''}
              </span>
            ))}
          </div>

          <div className="modal-section-title">Documents</div>
          <div className="modal-chips">
            {Object.entries(a.docs || {}).length === 0 && <span>—</span>}
            {Object.entries(a.docs || {}).map(([field, doc]) => (
              doc.url ? (
                <a key={field} href={doc.url} target="_blank" rel="noreferrer" className="apps-doc-link">
                  {DOC_LABELS[field]}
                </a>
              ) : null
            ))}
          </div>

          <div className="modal-section-title">Status</div>
          <div className="modal-grid">
            <div>
              <strong>Current stage</strong>
              <select value={stage} onChange={(e) => onStageChange(e.target.value)}>
                {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            {stage === 'interview' && (
              <>
                <div>
                  <strong>Interview date &amp; time</strong>
                  <input type="datetime-local" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} />
                </div>
                <div>
                  <strong>Location / video link</strong>
                  <input
                    type="text"
                    value={interviewLocation}
                    onChange={(e) => setInterviewLocation(e.target.value)}
                    placeholder="e.g. Rumbu Head Office, Kano or a Zoom link"
                  />
                </div>
              </>
            )}
          </div>

          {a.last_emailed_stage && (
            <div className="modal-note">
              Last email sent for stage &ldquo;{a.last_emailed_stage}&rdquo; on {fmt(a.last_emailed_at)}.
            </div>
          )}

          {showEmail && (
            <>
              <div className="modal-section-title">Email to applicant</div>
              <div className="a-field">
                <label>Subject</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div className="a-field">
                <label>Message</label>
                <textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
              </div>
              <button className="a-btn ghost sm" onClick={regenerateTemplate} type="button">
                Reset to template
              </button>
            </>
          )}

          {err && <div className="a-msg err">{err}</div>}
          {msg && <div className="a-msg ok">{msg}</div>}
        </div>

        <div className="modal-footer">
          {needsEmail ? (
            <>
              <button className="a-btn gold" onClick={sendViaMailApp} disabled={busy}>
                {busy ? 'Opening…' : 'Send via my email app'}
              </button>
              <button className="a-btn ghost" onClick={saveAndSend} disabled={busy}>
                {busy ? 'Sending…' : 'Send via Resend'}
              </button>
            </>
          ) : (
            <button className="a-btn gold" onClick={() => saveOnly(false)} disabled={busy || !stageChanged}>
              {busy ? 'Saving…' : 'Save status'}
            </button>
          )}
          <button className="a-btn ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}