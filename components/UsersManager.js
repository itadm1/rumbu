'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminUI } from './AdminUI';

export default function UsersManager({ initialUsers, currentId }) {
  const ui = useAdminUI();
  const router = useRouter();
  const [users] = useState(initialUsers);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'admin' });
  const [msg, setMsg] = useState({ t: '', k: '' });
  const [busy, setBusy] = useState(false);

  const ch = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const create = async () => {
    if (!form.email || !form.password) { setMsg({ t: 'Email and password required.', k: 'err' }); return; }
    setBusy(true); setMsg({ t: 'Creating...', k: '' });
    const res = await fetch('/api/admin/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...form }),
    });
    const data = await res.json();
    setBusy(false);
    if (data.ok) { setCreating(false); setForm({ email: '', password: '', full_name: '', role: 'admin' }); router.refresh(); }
    else setMsg({ t: data.error || 'Failed.', k: 'err' });
  };

  const setRole = async (id, role) => {
    const res = await fetch('/api/admin/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_role', id, role }),
    });
    const data = await res.json();
    if (data.ok) router.refresh();
    else ui.toast(data.error || 'Failed.', 'error');
  };

  const del = async (id) => {
    if (!(await ui.confirm({ title: 'Delete this user?', message: 'They will lose access to the workspace immediately.', confirmLabel: 'Delete user', danger: true }))) return;
    const res = await fetch('/api/admin/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    const data = await res.json();
    if (data.ok) router.refresh();
    else ui.toast(data.error || 'Failed.', 'error');
  };

  return (
    <>
      <div className="panel">
        <h2>Admin users <button className="a-btn gold sm" onClick={() => { setCreating(!creating); setMsg({ t: '', k: '' }); }}>{creating ? 'Close' : '+ New user'}</button></h2>
        {creating && (
          <div className="a-subform">
            {msg.t && <div className={`a-msg ${msg.k}`}>{msg.t}</div>}
            <div className="a-row">
              <div className="a-field"><label>Full name</label><input name="full_name" value={form.full_name} onChange={ch} /></div>
              <div className="a-field"><label>Email</label><input name="email" type="email" value={form.email} onChange={ch} /></div>
            </div>
            <div className="a-row">
              <div className="a-field"><label>Temporary password</label><input name="password" value={form.password} onChange={ch} /><div className="hint">Share this with the person; they can change it later.</div></div>
              <div className="a-field"><label>Role</label>
                <select name="role" value={form.role} onChange={ch}>
                  <option value="admin">Admin</option>
                  <option value="hr">HR</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>
            <button className="a-btn gold" onClick={create} disabled={busy}>{busy ? 'Creating...' : 'Create user'}</button>
          </div>
        )}
        {users.length === 0 ? <div className="a-empty">No users yet.</div> : (
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.full_name || '—'}{u.id === currentId && <span className="hint"> (you)</span>}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${u.role === 'super_admin' ? 'super' : u.role === 'hr' ? 'hr' : 'admin'}`}>{u.role === 'super_admin' ? 'Super Admin' : u.role === 'hr' ? 'HR' : 'Admin'}</span></td>
                  <td><div className="a-actions">
                    <select
                      className="role-select"
                      value={u.role}
                      onChange={(e) => setRole(u.id, e.target.value)}
                      disabled={u.id === currentId}
                    >
                      <option value="admin">Admin</option>
                      <option value="hr">HR</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                    <button className="a-btn danger sm" onClick={() => del(u.id)} disabled={u.id === currentId}>Delete</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
