'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminUI } from './AdminUI';

const empty = { id: null, title: '', category: 'Press', excerpt: '', content: '', cover_url: '', youtube_url: '', published: true };

export default function NewsManager({ initialPosts }) {
  const ui = useAdminUI();
  const router = useRouter();
  const [posts] = useState(initialPosts);
  const [editing, setEditing] = useState(null); // null = list view
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState({ t: '', k: '' });
  const [busy, setBusy] = useState(false);

  const openNew = () => { setForm(empty); setEditing('new'); setMsg({ t: '', k: '' }); };
  const openEdit = (p) => {
    setForm({ id: p.id, title: p.title, category: p.category, excerpt: p.excerpt || '', content: p.body || '', cover_url: p.cover_url || '', youtube_url: p.youtube_url || '', published: p.published });
    setEditing('edit'); setMsg({ t: '', k: '' });
  };

  const ch = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setMsg({ t: 'Uploading image...', k: '' });
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    setBusy(false);
    if (data.url) { setForm((f) => ({ ...f, cover_url: data.url })); setMsg({ t: 'Image uploaded.', k: 'ok' }); }
    else setMsg({ t: data.error || 'Upload failed.', k: 'err' });
  };

  const save = async () => {
    if (!form.title) { setMsg({ t: 'Title is required.', k: 'err' }); return; }
    setBusy(true); setMsg({ t: 'Saving...', k: '' });
    const res = await fetch('/api/admin/news', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: editing === 'new' ? 'create' : 'update', ...form }),
    });
    const data = await res.json();
    setBusy(false);
    if (data.ok) { setEditing(null); ui.toast('Post saved.', 'success'); router.refresh(); }
    else setMsg({ t: data.error || 'Save failed.', k: 'err' });
  };

  const del = async (id) => {
    if (!(await ui.confirm({ title: 'Delete this post?', message: 'The post will be removed from the website. This cannot be undone.', confirmLabel: 'Delete post', danger: true }))) return;
    const res = await fetch('/api/admin/news', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    const data = await res.json();
    if (data.ok) { ui.toast('Post deleted.', 'success'); router.refresh(); }
    else ui.toast(data.error || 'Delete failed.', 'error');
  };

  if (editing) {
    return (
      <div className="panel">
        <h2>{editing === 'new' ? 'New post' : 'Edit post'}</h2>
        {msg.t && <div className={`a-msg ${msg.k}`}>{msg.t}</div>}
        <div className="a-field"><label>Title</label><input name="title" value={form.title} onChange={ch} /></div>
        <div className="a-row">
          <div className="a-field"><label>Category</label>
            <select name="category" value={form.category} onChange={ch}>
              <option>Press</option><option>Events</option><option>Milestone</option>
            </select>
          </div>
          <div className="a-field"><label>YouTube link (optional)</label><input name="youtube_url" value={form.youtube_url} onChange={ch} placeholder="https://www.youtube.com/watch?v=..." /></div>
        </div>
        <div className="a-field"><label>Excerpt (short summary)</label><textarea name="excerpt" rows={2} value={form.excerpt} onChange={ch} /></div>
        <div className="a-field"><label>Body</label><textarea name="content" rows={8} value={form.content} onChange={ch} placeholder="Write paragraphs. Leave a blank line between paragraphs." /></div>
        <div className="a-field">
          <label>Cover image</label>
          <input type="file" accept="image/*" onChange={uploadImage} />
          {form.cover_url && <div className="hint">Current: <a href={form.cover_url} target="_blank" rel="noreferrer">view image</a></div>}
        </div>
        <div className="a-field">
          <label className="a-check"><input type="checkbox" name="published" checked={form.published} onChange={ch} />Published (visible on the site)</label>
        </div>
        <div className="a-actions">
          <button className="a-btn gold" onClick={save} disabled={busy}>{busy ? 'Saving...' : 'Save post'}</button>
          <button className="a-btn ghost" onClick={() => setEditing(null)} disabled={busy}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2>News posts <button className="a-btn gold sm" onClick={openNew}>+ New post</button></h2>
      {posts.length === 0 ? <div className="a-empty">No posts yet.</div> : (
        <table className="admin-table">
          <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.category}</td>
                <td><span className={`badge ${p.published ? 'open' : 'closed'}`}>{p.published ? 'Published' : 'Draft'}</span></td>
                <td>{new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td><div className="a-actions">
                  <button className="a-btn ghost sm" onClick={() => openEdit(p)}>Edit</button>
                  <button className="a-btn danger sm" onClick={() => del(p.id)}>Delete</button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
