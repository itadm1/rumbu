'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminUI } from './AdminUI';

const empty = { id: null, title: '', location: '', type: 'Full-time', department: '', summary: '', responsibilities: '', requirements: '', open: true };

export default function JobsManager({ initialJobs }) {
  const ui = useAdminUI();
  const router = useRouter();
  const [jobs] = useState(initialJobs);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState({ t: '', k: '' });
  const [busy, setBusy] = useState(false);

  const openNew = () => { setForm(empty); setEditing('new'); setMsg({ t: '', k: '' }); };
  const openEdit = (j) => {
    setForm({ id: j.id, title: j.title, location: j.location || '', type: j.type || 'Full-time', department: j.department || '', summary: j.summary || '', responsibilities: j.responsibilities || '', requirements: j.requirements || '', open: j.open });
    setEditing('edit'); setMsg({ t: '', k: '' });
  };
  const ch = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const save = async () => {
    if (!form.title) { setMsg({ t: 'Title is required.', k: 'err' }); return; }
    setBusy(true); setMsg({ t: 'Saving...', k: '' });
    const res = await fetch('/api/admin/jobs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: editing === 'new' ? 'create' : 'update', ...form }),
    });
    const data = await res.json();
    setBusy(false);
    if (data.ok) { setEditing(null); ui.toast('Advert saved.', 'success'); router.refresh(); }
    else setMsg({ t: data.error || 'Save failed.', k: 'err' });
  };

  const del = async (id) => {
    if (!(await ui.confirm({ title: 'Delete this advert?', message: 'Its applications will also be removed. This cannot be undone.', confirmLabel: 'Delete advert', danger: true }))) return;
    const res = await fetch('/api/admin/jobs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    const data = await res.json();
    if (data.ok) { ui.toast('Advert deleted.', 'success'); router.refresh(); }
    else ui.toast(data.error || 'Delete failed.', 'error');
  };

  if (editing) {
    return (
      <div className="panel">
        <h2>{editing === 'new' ? 'New job advert' : 'Edit job advert'}</h2>
        {msg.t && <div className={`a-msg ${msg.k}`}>{msg.t}</div>}
        <div className="a-field"><label>Job title</label><input name="title" value={form.title} onChange={ch} /></div>
        <div className="a-row">
          <div className="a-field"><label>Location</label><input name="location" value={form.location} onChange={ch} /></div>
          <div className="a-field"><label>Type</label>
            <select name="type" value={form.type} onChange={ch}>
              <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
            </select>
          </div>
        </div>
        <div className="a-field"><label>Department</label><input name="department" value={form.department} onChange={ch} /></div>
        <div className="a-field"><label>Summary</label><textarea name="summary" rows={2} value={form.summary} onChange={ch} /></div>
        <div className="a-field"><label>Responsibilities (one per line)</label><textarea name="responsibilities" rows={5} value={form.responsibilities} onChange={ch} /></div>
        <div className="a-field"><label>Requirements (one per line)</label><textarea name="requirements" rows={5} value={form.requirements} onChange={ch} /></div>
        <div className="a-field"><label className="a-check"><input type="checkbox" name="open" checked={form.open} onChange={ch} />Open (accepting applications)</label></div>
        <div className="a-actions">
          <button className="a-btn gold" onClick={save} disabled={busy}>{busy ? 'Saving...' : 'Save advert'}</button>
          <button className="a-btn ghost" onClick={() => setEditing(null)} disabled={busy}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2>All adverts <button type="button" className="a-btn gold sm" onClick={openNew}>+ New advert</button></h2>
      {jobs.length === 0 ? <div className="a-empty"><strong>No adverts yet</strong><span>Create an advert to publish a vacancy on the careers page.</span><button type="button" className="a-btn gold sm" onClick={openNew}>+ New advert</button></div> : (
        <table className="admin-table">
          <thead><tr><th>Title</th><th>Location</th><th>Applicants</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id}>
                <td>{j.title}</td>
                <td>{j.location || '—'}</td>
                <td>{j.applicant_count}</td>
                <td><span className={`badge ${j.open ? 'open' : 'closed'}`}>{j.open ? 'Open' : 'Closed'}</span></td>
                <td><div className="a-actions">
                  <button className="a-btn ghost sm" onClick={() => openEdit(j)}>Edit</button>
                  <button className="a-btn danger sm" onClick={() => del(j.id)}>Delete</button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
