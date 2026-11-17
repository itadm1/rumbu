'use client';

import { useState, useMemo } from 'react';
import { useAdminUI } from './AdminUI';
import ApplicationDetailModal from './ApplicationDetailModal';

const STAGES = [
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Screening' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
];

const STAGE_LABEL = Object.fromEntries(STAGES.map((s) => [s.value, s.label]));

const DOC_LABELS = {
  cv_path: 'CV',
  cover_letter_path: 'Cover letter',
  photo_path: 'Photo',
  nin_image_path: 'NIN slip',
  professional_cert_path: 'Prof. cert',
};

function fmt(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function csvEscape(v) {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function ApplicationsManager({ initialRows, jobTitles }) {
  const ui = useAdminUI();
  const [rows, setRows] = useState(initialRows);
  const [q, setQ] = useState('');
  const [jobFilter, setJobFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [err, setErr] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((a) => {
      if (jobFilter !== 'all' && a.job_title !== jobFilter) return false;
      if (stageFilter !== 'all' && (a.stage || 'applied') !== stageFilter) return false;
      if (needle) {
        const hay = `${a.full_name} ${a.email} ${a.phone}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [rows, q, jobFilter, stageFilter]);

  const viewing = rows.find((a) => a.id === viewingId) || null;

  const handleUpdated = (updated) => {
    setRows((r) => r.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
  };

  const remove = async (id) => {
    if (!(await ui.confirm({ title: 'Delete this application?', message: 'The application and its record will be removed. This cannot be undone.', confirmLabel: 'Delete application', danger: true }))) return;
    setBusyId(id);
    setErr('');
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.ok) { setRows((r) => r.filter((a) => a.id !== id)); ui.toast('Application deleted.', 'success'); }
      else setErr(data.error || 'Could not delete application.');
    } catch {
      setErr('Could not delete application.');
    } finally {
      setBusyId(null);
    }
  };

  const exportCsv = () => {
    const headers = [
      'Full name', 'Email', 'Phone', 'Role', 'Status', 'State of origin', 'LGA of origin',
      'State of residence', 'LGA of residence', 'Address', 'Highest qualification',
      'NIN number', 'Interview date', 'Interview location', 'CV path', 'Cover letter path',
      'Photo path', 'NIN image path', 'Professional certificate path', 'Qualifications',
      'Last emailed stage', 'Last emailed at', 'Date applied',
    ];
    const lines = [headers.join(',')];
    filtered.forEach((a) => {
      const qualsStr = (a.qualifications || [])
        .map((qq) => `${qq.level}${qq.classification ? ':' + qq.classification : ''}`)
        .join('; ');
      lines.push([
        a.full_name, a.email, a.phone, a.job_title, a.stage || 'applied',
        a.state_of_origin, a.lga_of_origin, a.state_of_residence, a.lga_of_residence,
        a.address, a.highest_qualification, a.nin_number,
        a.interview_at ? fmt(a.interview_at) : '', a.interview_location,
        a.docs?.cv_path?.path, a.docs?.cover_letter_path?.path, a.docs?.photo_path?.path,
        a.docs?.nin_image_path?.path, a.docs?.professional_cert_path?.path,
        qualsStr, a.last_emailed_stage, a.last_emailed_at ? fmt(a.last_emailed_at) : '',
        fmt(a.created_at),
      ].map(csvEscape).join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rumbu_Applications_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="panel">
      <div className="apps-toolbar">
        <input
          className="apps-search"
          type="search"
          aria-label="Search applications"
          placeholder="Search name, email or phone…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select aria-label="Filter by role" value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
          <option value="all">All roles</option>
          {jobTitles.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select aria-label="Filter by status" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <button type="button" className="a-btn gold" onClick={exportCsv}>Export CSV</button>
      </div>

      {err && <div className="a-msg err">{err}</div>}

      <div className="a-count">
        Showing {filtered.length} of {rows.length} application{rows.length === 1 ? '' : 's'}.
      </div>

      {filtered.length === 0 ? (
        <div className="a-empty">No applications match this filter.</div>
      ) : (
        <table className="admin-table apps-table">
          <thead>
            <tr>
              <th>Applicant</th><th>Role</th><th>Location</th><th>Qualification</th>
              <th>Documents</th><th>Status</th><th>Date</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => {
              const stage = a.stage || 'applied';
              return (
                <tr key={a.id}>
                  <td>
                    <div className="apps-name">{a.full_name}</div>
                    <div className="apps-sub"><a href={`mailto:${a.email}`}>{a.email}</a></div>
                    <div className="apps-sub">{a.phone || '—'}</div>
                  </td>
                  <td>{a.job_title}</td>
                  <td>
                    <div className="apps-sub">Origin: {a.state_of_origin || '—'}</div>
                    <div className="apps-sub">Resides: {a.state_of_residence || '—'}</div>
                  </td>
                  <td>{a.highest_qualification || '—'}</td>
                  <td>
                    <div className="apps-docs">
                      {Object.keys(a.docs || {}).length === 0 && '—'}
                      {Object.entries(a.docs || {}).map(([field, doc]) => (
                        doc.url ? (
                          <a key={field} href={doc.url} target="_blank" rel="noreferrer" className="apps-doc-link">
                            {DOC_LABELS[field]}
                          </a>
                        ) : null
                      ))}
                    </div>
                  </td>
                  <td><span className={`status-pill status-${stage}`}>{STAGE_LABEL[stage]}</span></td>
                  <td>{fmt(a.created_at)}</td>
                  <td className="apps-actions">
                    <button className="a-btn ghost sm" onClick={() => setViewingId(a.id)}>View</button>
                    <button className="a-btn danger sm" onClick={() => remove(a.id)} disabled={busyId === a.id}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {viewing && (
        <ApplicationDetailModal
          application={viewing}
          onClose={() => setViewingId(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}