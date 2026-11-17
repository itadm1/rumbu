'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminUI } from './AdminUI';

const emptyPanelist = () => ({ name: '', email: '' });

export default function HRInterviewManager({ awaitingPanel, pendingPanels }) {
  const ui = useAdminUI();
  const router = useRouter();
  const [modalFor, setModalFor] = useState(null); // application row being scheduled
  const [form, setForm] = useState({ scheduled_at: '', location: '', notes: '', threshold_score: 70, panelists: [emptyPanelist()] });
  const [msg, setMsg] = useState({ t: '', k: '' });
  const [busy, setBusy] = useState(false);

  const openModal = (app) => {
    setModalFor(app);
    setForm({ scheduled_at: '', location: '', notes: '', threshold_score: 70, panelists: [emptyPanelist()] });
    setMsg({ t: '', k: '' });
  };

  const updatePanelist = (i, field, value) => {
    const next = [...form.panelists];
    next[i] = { ...next[i], [field]: value };
    setForm({ ...form, panelists: next });
  };
  const addPanelistRow = () => setForm({ ...form, panelists: [...form.panelists, emptyPanelist()] });
  const removePanelistRow = (i) => setForm({ ...form, panelists: form.panelists.filter((_, idx) => idx !== i) });

  const createPanel = async () => {
    setBusy(true); setMsg({ t: 'Saving...', k: '' });
    const res = await fetch('/api/admin/hr/panels', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_panel', application_id: modalFor.id, ...form }),
    });
    const data = await res.json();
    setBusy(false);
    if (data.ok) {
      setModalFor(null);
      if (data.emailed === false) ui.toast('Panel saved. The interview email was logged but not delivered. Check your Resend setup.', 'error');
      else ui.toast('Panel saved.', 'success');
      router.refresh();
    }
    else setMsg({ t: data.error || 'Failed.', k: 'err' });
  };

  const updateScore = async (panelist_id, score, comments) => {
    const res = await fetch('/api/admin/hr/panels', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_score', panelist_id, score, comments }),
    });
    const data = await res.json();
    if (!data.ok) ui.toast(data.error || 'Failed to save score.', 'error');
  };

  const resendInterviewEmail = async (panel_id) => {
    const res = await fetch('/api/admin/hr/panels', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resend_interview_email', panel_id }),
    });
    const data = await res.json();
    if (data.ok) ui.toast(data.sent ? 'Email sent.' : `Logged, not delivered (${data.note})`, data.sent ? 'success' : 'error');
    else ui.toast(data.error || 'Failed.', 'error');
  };

  const finalize = async (panel_id) => {
    if (!(await ui.confirm({ title: 'Finalise scoring?', message: 'This compares the average score to the threshold, moves the applicant to Selected or Not Selected, and emails them the outcome.', confirmLabel: 'Finalise and decide' }))) return;
    const res = await fetch('/api/admin/hr/panels', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'finalize', panel_id }),
    });
    const data = await res.json();
    if (data.ok) {
      const emailNote = data.emailed === false ? ' Outcome email logged but not delivered.' : data.emailed ? ' Outcome email sent.' : '';
      ui.toast(`Average score: ${data.average.toFixed(1)}. Decision: ${data.decision === 'selected' ? 'Selected' : 'Not Selected'}.${emailNote}`, 'success');
      router.refresh();
    }
    else ui.toast(data.error || 'Failed.', 'error');
  };

  return (
    <>
      <div className="panel">
        <h2>Awaiting a panel</h2>
        {awaitingPanel.length === 0 ? <div className="a-empty">No interviewed candidates waiting on a panel.</div> : (
          <table className="admin-table">
            <thead><tr><th>Applicant</th><th>Job</th><th>Interviewed since</th><th>Actions</th></tr></thead>
            <tbody>
              {awaitingPanel.map((a) => (
                <tr key={a.id}>
                  <td className="apps-name">{a.full_name}<div className="apps-sub">{a.email}</div></td>
                  <td>{a.job_title}</td>
                  <td>{new Date(a.created_at).toLocaleDateString()}</td>
                  <td><button className="a-btn gold sm" onClick={() => openModal(a)}>Set Interview Panel</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <h2>Panels — scoring</h2>
        {pendingPanels.length === 0 ? <div className="a-empty">No panels awaiting scores.</div> : pendingPanels.map((p) => (
          <div key={p.id} className="hr-panel-card">
            <div className="hr-panel-head">
              <div>
                <strong>{p.applicant?.full_name}</strong> — {p.applicant?.jobs?.title || '—'}
                <div className="apps-sub">
                  {p.scheduled_at ? new Date(p.scheduled_at).toLocaleString() : 'No time set'}{p.location ? ` · ${p.location}` : ''} · Threshold {p.threshold_score}
                </div>
              </div>
              <div className="apps-actions">
                <button className="a-btn gold sm" onClick={() => finalize(p.id)}>Finalize &amp; Decide</button>
                <button className="a-btn ghost sm" onClick={() => resendInterviewEmail(p.id)}>Resend interview email</button>
              </div>
            </div>
            <table className="admin-table">
              <thead><tr><th>Panelist</th><th>Score (0–100)</th><th>Comments</th></tr></thead>
              <tbody>
                {p.interview_panelists.map((pl) => (
                  <PanelistRow key={pl.id} panelist={pl} onSave={updateScore} />
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {modalFor && (
        <div className="modal-backdrop" onClick={() => setModalFor(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Set interview panel — {modalFor.full_name}</h3>
              <button type="button" className="modal-close" onClick={() => setModalFor(null)} aria-label="Close">&times;</button>
            </div>
            <div className="modal-body">
              {msg.t && <div className={`a-msg ${msg.k === 'err' ? 'err' : ''}`}>{msg.t}</div>}
              <div className="modal-grid">
                <div className="a-field"><label>Date &amp; time</label><input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} /></div>
                <div className="a-field"><label>Location</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Kano HQ Boardroom / Zoom" /></div>
                <div className="a-field"><label>Pass threshold (avg score)</label><input type="number" min="0" max="100" value={form.threshold_score} onChange={(e) => setForm({ ...form, threshold_score: e.target.value })} /></div>
              </div>
              <div className="a-field"><label>Notes</label><textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>

              <div className="modal-section-title">Panelists</div>
              {form.panelists.map((pl, i) => (
                <div className="modal-grid" key={i}>
                  <div><input placeholder="Name" value={pl.name} onChange={(e) => updatePanelist(i, 'name', e.target.value)} /></div>
                  <div><input placeholder="Email (optional)" value={pl.email} onChange={(e) => updatePanelist(i, 'email', e.target.value)} /></div>
                  {form.panelists.length > 1 && <button className="a-btn ghost sm" onClick={() => removePanelistRow(i)}>Remove</button>}
                </div>
              ))}
              <button className="a-btn ghost sm" onClick={addPanelistRow}>+ Add panelist</button>
            </div>
            <div className="modal-footer">
              <button className="a-btn gold" disabled={busy} onClick={createPanel}>{busy ? 'Saving...' : 'Save panel'}</button>
              <button className="a-btn ghost" onClick={() => setModalFor(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PanelistRow({ panelist, onSave }) {
  const [score, setScore] = useState(panelist.score ?? '');
  const [comments, setComments] = useState(panelist.comments ?? '');
  const [saved, setSaved] = useState(true);

  return (
    <tr>
      <td>{panelist.name}{panelist.email ? <div className="apps-sub">{panelist.email}</div> : null}</td>
      <td>
        <input
          type="number" min="0" max="100" className="a-score" aria-label={`Score for ${panelist.name}`}
          value={score}
          onChange={(e) => { setScore(e.target.value); setSaved(false); }}
          onBlur={() => { onSave(panelist.id, score, comments); setSaved(true); }}
        />
      </td>
      <td>
        <input
          value={comments} placeholder="Optional"
          onChange={(e) => { setComments(e.target.value); setSaved(false); }}
          onBlur={() => { onSave(panelist.id, score, comments); setSaved(true); }}
        />
        {!saved && <span className="apps-sub"> (unsaved, click away to save)</span>}
      </td>
    </tr>
  );
}
