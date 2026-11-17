'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminUI } from './AdminUI';

const STAGE_LABEL = {
  applicant: 'Applicant',
  disqualified: 'Disqualified',
  interviewed: 'Interviewed',
  selected: 'Selected',
  not_selected: 'Not Selected',
  staff: 'Staff',
};

export default function HRApplicantsManager({ initialRows, jobTitles }) {
  const ui = useAdminUI();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [sendEmailOnAction, setSendEmailOnAction] = useState(true);

  // ---- Query / filter form ----
  const [job, setJob] = useState('all');
  const [stage, setStage] = useState('applicant');
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const filtered = useMemo(() => {
    return initialRows.filter((a) => {
      if (job !== 'all' && a.job_title !== job) return false;
      if (stage !== 'all' && a.hr_stage !== stage) return false;
      if (q.trim()) {
        const needle = q.trim().toLowerCase();
        const hay = `${a.full_name} ${a.email} ${a.phone || ''}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      if (from && new Date(a.created_at) < new Date(from)) return false;
      if (to && new Date(a.created_at) > new Date(to + 'T23:59:59')) return false;
      return true;
    });
  }, [initialRows, job, stage, q, from, to]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((a) => selected.has(a.id));
  const toggleAll = () => {
    if (allFilteredSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map((a) => a.id)));
  };
  const toggleOne = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const act = async (action, ids) => {
    if (ids.length === 0) return;
    setBusy(true);
    const res = await fetch('/api/admin/hr/applicants', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ids, send_email: sendEmailOnAction }),
    });
    const data = await res.json();
    setBusy(false);
    if (data.ok) { setSelected(new Set()); router.refresh(); }
    else ui.toast(data.error || 'Failed.', 'error');
  };

  return (
    <div className="panel">
      <h2>Screen applicants</h2>

      <div className="apps-toolbar">
        <select value={job} onChange={(e) => setJob(e.target.value)}>
          <option value="all">All job adverts</option>
          {jobTitles.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="all">All stages</option>
          {Object.entries(STAGE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input className="apps-search" type="search" aria-label="Search applicants" placeholder="Search name, email, phone..." value={q} onChange={(e) => setQ(e.target.value)} />
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} title="From date" aria-label="Applied from date" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} title="To date" aria-label="Applied to date" />
      </div>

      {selected.size > 0 && (
        <div className="hr-bulk-bar">
          <span><strong>{selected.size}</strong> selected</span>
          <label className="hr-bulk-check">
            <input type="checkbox" checked={sendEmailOnAction} onChange={(e) => setSendEmailOnAction(e.target.checked)} />
            Send notification email
          </label>
          <button className="a-btn ghost sm" disabled={busy} onClick={() => act('disqualify', Array.from(selected))}>Disqualify Selected</button>
          <button className="a-btn gold sm" disabled={busy} onClick={() => act('move_to_interviewed', Array.from(selected))}>Move Selected to Interviewed</button>
          <button className="a-btn ghost sm" onClick={() => setSelected(new Set())}>Clear selection</button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="a-empty">No applications match this filter.</div>
      ) : (
        <table className="admin-table apps-table">
          <thead>
            <tr>
              <th><input type="checkbox" aria-label="Select all shown applicants" checked={allFilteredSelected} onChange={toggleAll} /></th>
              <th>Applicant</th><th>Job</th><th>Applied</th><th>Documents</th><th>Stage</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td><input type="checkbox" aria-label={`Select ${a.full_name}`} checked={selected.has(a.id)} onChange={() => toggleOne(a.id)} /></td>
                <td>
                  <div className="apps-name">{a.full_name}</div>
                  <div className="apps-sub">{a.email}{a.phone ? ` · ${a.phone}` : ''}</div>
                </td>
                <td>{a.job_title}<div className="apps-sub">{a.department}</div></td>
                <td>{new Date(a.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="apps-docs">
                    {a.docs.cv_path && <a className="apps-doc-link" href={a.docs.cv_path} target="_blank" rel="noreferrer">CV</a>}
                    {a.docs.cover_letter_path && <a className="apps-doc-link" href={a.docs.cover_letter_path} target="_blank" rel="noreferrer">Cover letter</a>}
                    {a.docs.photo_path && <a className="apps-doc-link" href={a.docs.photo_path} target="_blank" rel="noreferrer">Photo</a>}
                    {a.docs.nin_image_path && <a className="apps-doc-link" href={a.docs.nin_image_path} target="_blank" rel="noreferrer">NIN</a>}
                    {a.docs.professional_cert_path && <a className="apps-doc-link" href={a.docs.professional_cert_path} target="_blank" rel="noreferrer">Certificate</a>}
                  </div>
                </td>
                <td><span className={`status-pill hr-stage-${a.hr_stage}`}>{STAGE_LABEL[a.hr_stage] || a.hr_stage}</span></td>
                <td>
                  <div className="apps-actions">
                    {a.hr_stage === 'applicant' && (
                      <>
                        <button className="a-btn ghost sm" disabled={busy} onClick={() => act('disqualify', [a.id])}>Disqualify</button>
                        <button className="a-btn gold sm" disabled={busy} onClick={() => act('move_to_interviewed', [a.id])}>Move to Interviewed</button>
                      </>
                    )}
                    {a.hr_stage !== 'applicant' && a.hr_stage !== 'staff' && (
                      <button className="a-btn ghost sm" disabled={busy} onClick={() => act('reset_to_applicant', [a.id])}>Reset</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
