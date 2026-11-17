'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminUI } from './AdminUI';

export default function HRSelectedManager({ initialRows }) {
  const ui = useAdminUI();
  const router = useRouter();
  const [selected, setSelected] = useState(new Set());
  const [emailModal, setEmailModal] = useState(null); // single row, or 'bulk'
  const [acceptModal, setAcceptModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ t: '', k: '' });

  const [emailForm, setEmailForm] = useState({ subject: '', message: '' });
  const [acceptForm, setAcceptForm] = useState({ job_title: '', department: '', start_date: '' });

  const allSelected = initialRows.length > 0 && initialRows.every((r) => selected.has(r.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(initialRows.map((r) => r.id)));
  const toggleOne = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const openEmail = (row) => {
    setEmailModal(row);
    setEmailForm({
      subject: `Job Offer — ${row.job_title}`,
      message: `Dear ${row.full_name},\n\nCongratulations — Rumbu Industries would like to offer you the position of ${row.job_title}. Please reply to confirm your acceptance.\n\nBest regards,\nRumbu Industries HR`,
    });
    setMsg({ t: '', k: '' });
  };

  const openBulkEmail = () => {
    setEmailModal('bulk');
    setEmailForm({
      subject: `Job Offer — {{job}}`,
      message: `Dear {{name}},\n\nCongratulations — Rumbu Industries would like to offer you the position of {{job}}. Please reply to confirm your acceptance.\n\nBest regards,\nRumbu Industries HR`,
    });
    setMsg({ t: '', k: '' });
  };

  const openAccept = (row) => {
    setAcceptModal(row);
    setAcceptForm({ job_title: row.job_title, department: row.department, start_date: '' });
    setMsg({ t: '', k: '' });
  };

  const sendEmail = async () => {
    setBusy(true); setMsg({ t: 'Sending...', k: '' });
    if (emailModal === 'bulk') {
      const res = await fetch('/api/admin/hr/selected', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk_send_offer', application_ids: Array.from(selected), subject: emailForm.subject, message: emailForm.message }),
      });
      const data = await res.json();
      setBusy(false);
      if (data.ok) {
        const sentCount = data.results.filter((r) => r.sent).length;
        setMsg({ t: `${sentCount}/${data.results.length} delivered (rest logged only — check Resend setup if that's unexpected).`, k: sentCount === data.results.length ? 'ok' : 'err' });
        setSelected(new Set());
        router.refresh();
      } else setMsg({ t: data.error || 'Failed.', k: 'err' });
      return;
    }

    const res = await fetch('/api/admin/hr/selected', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send_offer', application_id: emailModal.id, subject: emailForm.subject, message: emailForm.message }),
    });
    const data = await res.json();
    setBusy(false);
    if (data.ok) {
      setMsg({ t: data.sent ? 'Email sent.' : `Logged — not delivered (${data.note})`, k: data.sent ? 'ok' : 'err' });
      router.refresh();
    } else setMsg({ t: data.error || 'Failed.', k: 'err' });
  };

  const markAccepted = async () => {
    setBusy(true); setMsg({ t: 'Saving...', k: '' });
    const res = await fetch('/api/admin/hr/selected', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_accepted', application_id: acceptModal.id, ...acceptForm }),
    });
    const data = await res.json();
    setBusy(false);
    if (data.ok) { setAcceptModal(null); router.refresh(); }
    else setMsg({ t: data.error || 'Failed.', k: 'err' });
  };

  const markDeclined = async (row) => {
    if (!(await ui.confirm({ title: 'Mark as declined?', message: `${row.full_name} will be recorded as declined or not proceeding.`, confirmLabel: 'Mark declined', danger: true }))) return;
    const res = await fetch('/api/admin/hr/selected', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_declined', application_id: row.id }),
    });
    const data = await res.json();
    if (data.ok) router.refresh();
    else ui.toast(data.error || 'Failed.', 'error');
  };

  return (
    <>
      <div className="panel">
        <h2>Selected candidates</h2>

        {selected.size > 0 && (
          <div className="hr-bulk-bar">
            <span><strong>{selected.size}</strong> selected</span>
            <button className="a-btn gold sm" onClick={openBulkEmail}>✉ Email Selected</button>
            <button className="a-btn ghost sm" onClick={() => setSelected(new Set())}>Clear selection</button>
          </div>
        )}

        {initialRows.length === 0 ? <div className="a-empty">No candidates in Selected right now.</div> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
                <th>Candidate</th><th>Job</th><th>Last email</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialRows.map((r) => (
                <tr key={r.id}>
                  <td><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleOne(r.id)} /></td>
                  <td className="apps-name">{r.full_name}<div className="apps-sub">{r.email}{r.phone ? ` · ${r.phone}` : ''}</div></td>
                  <td>{r.job_title}<div className="apps-sub">{r.department}</div></td>
                  <td>{r.last_email ? (r.last_email.sent ? 'Sent' : 'Logged, not delivered') + ' · ' + new Date(r.last_email.created_at).toLocaleDateString() : '—'}</td>
                  <td>
                    <div className="apps-actions">
                      <button className="a-btn ghost sm" onClick={() => openEmail(r)}>✉ Email</button>
                      <button className="a-btn gold sm" onClick={() => openAccept(r)}>Mark Accepted</button>
                      <button className="a-btn ghost sm apps-btn-danger" onClick={() => markDeclined(r)}>Declined</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {emailModal && (
        <div className="modal-backdrop" onClick={() => setEmailModal(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{emailModal === 'bulk' ? `Email — ${selected.size} candidates` : `Email — ${emailModal.full_name}`}</h3>
              <button type="button" aria-label="Close" className="modal-close" onClick={() => setEmailModal(null)}>&times;</button>
            </div>
            <div className="modal-body">
              {msg.t && <div className={`a-msg ${msg.k === 'err' ? 'err' : ''}`}>{msg.t}</div>}
              <div className="a-field"><label>Subject</label><input value={emailForm.subject} onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })} /></div>
              <div className="a-field"><label>Message</label><textarea rows={8} value={emailForm.message} onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })} /></div>
              {emailModal === 'bulk' && <div className="modal-note">Use <code>{'{{name}}'}</code> and <code>{'{{job}}'}</code> — each candidate gets their own individually addressed email with those filled in.</div>}
              <div className="modal-note">If no email provider is configured yet (RESEND_API_KEY), this is logged here but not delivered — send it manually and use “Mark Accepted” once they confirm.</div>
            </div>
            <div className="modal-footer">
              <button className="a-btn gold" disabled={busy} onClick={sendEmail}>{busy ? 'Sending...' : 'Send'}</button>
              <button className="a-btn ghost" onClick={() => setEmailModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {acceptModal && (
        <div className="modal-backdrop" onClick={() => setAcceptModal(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Move to Staff — {acceptModal.full_name}</h3><button type="button" aria-label="Close" className="modal-close" onClick={() => setAcceptModal(null)}>&times;</button></div>
            <div className="modal-body">
              {msg.t && <div className={`a-msg ${msg.k === 'err' ? 'err' : ''}`}>{msg.t}</div>}
              <div className="a-field"><label>Job title</label><input value={acceptForm.job_title} onChange={(e) => setAcceptForm({ ...acceptForm, job_title: e.target.value })} /></div>
              <div className="a-field"><label>Department</label><input value={acceptForm.department} onChange={(e) => setAcceptForm({ ...acceptForm, department: e.target.value })} /></div>
              <div className="a-field"><label>Start date</label><input type="date" value={acceptForm.start_date} onChange={(e) => setAcceptForm({ ...acceptForm, start_date: e.target.value })} /></div>
            </div>
            <div className="modal-footer">
              <button className="a-btn gold" disabled={busy} onClick={markAccepted}>{busy ? 'Saving...' : 'Confirm & move to Staff'}</button>
              <button className="a-btn ghost" onClick={() => setAcceptModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
