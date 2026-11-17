'use client';

import { useState } from 'react';
import { ART_OPTIONS, LINK_OPTIONS, LIMITS } from '../lib/homeContent';

const blankPanel = () => ({ title: '', text: '', cta: '', href: '/products', art: 'mats', image: '' });

// Workspace screen for the front page: the headline, the short line under it,
// and 2 to 4 product panels. Each panel has a name, a line of text, a button,
// a page to open and a picture.
export default function HomeEditor({ initial }) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ t: '', k: '' });

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));
  const setPanel = (i, name, value) =>
    setForm((f) => ({ ...f, panels: f.panels.map((p, k) => (k === i ? { ...p, [name]: value } : p)) }));
  const addPanel = () => setForm((f) => ({ ...f, panels: [...f.panels, blankPanel()] }));
  const removePanel = (i) => setForm((f) => ({ ...f, panels: f.panels.filter((_, k) => k !== i) }));
  const movePanel = (i, by) =>
    setForm((f) => {
      const panels = [...f.panels];
      const j = i + by;
      if (j < 0 || j >= panels.length) return f;
      [panels[i], panels[j]] = [panels[j], panels[i]];
      return { ...f, panels };
    });

  const uploadPhoto = async (i, e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true); setMsg({ t: 'Uploading the photograph…', k: '' });
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        setPanel(i, 'image', data.url);
        setMsg({ t: 'Photograph uploaded. Save the front page to publish it.', k: 'ok' });
      } else {
        setMsg({ t: data.error || 'The photograph could not be uploaded.', k: 'err' });
      }
    } catch {
      setMsg({ t: 'The photograph could not be uploaded. Check your connection and try again.', k: 'err' });
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (form.panels.some((p) => !p.title.trim())) {
      setMsg({ t: 'Every panel needs a name.', k: 'err' });
      return;
    }
    setBusy(true); setMsg({ t: 'Saving the front page…', k: '' });
    try {
      const res = await fetch('/api/admin/home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: form }),
      });
      const data = await res.json();
      if (data.ok) {
        setForm(data.content);
        setMsg({ t: 'Front page saved. It is live on the website now.', k: 'ok' });
      } else {
        setMsg({ t: data.error || 'The front page could not be saved.', k: 'err' });
      }
    } catch {
      setMsg({ t: 'The front page could not be saved. Check your connection and try again.', k: 'err' });
    } finally {
      setBusy(false);
    }
  };

  const count = form.panels.length;

  return (
    <>
      <div className="panel">
        <h2>Headline</h2>
        <div className="a-field">
          <label htmlFor="home-headline">Headline</label>
          <textarea id="home-headline" rows={2} maxLength={LIMITS.headline} value={form.headline} onChange={(e) => setField('headline', e.target.value)} />
          <div className="hint">The large words at the top of the front page. Up to {LIMITS.headline} characters.</div>
        </div>
        <div className="a-field">
          <label htmlFor="home-intro">Line under the headline (optional)</label>
          <textarea id="home-intro" rows={2} maxLength={LIMITS.intro} value={form.intro} onChange={(e) => setField('intro', e.target.value)} />
        </div>
      </div>

      {form.panels.map((p, i) => (
        <div className="panel" key={i}>
          <h2>
            Panel {i + 1}{p.title ? `: ${p.title}` : ''}
            <span className="a-actions">
              <button type="button" className="a-btn ghost sm" onClick={() => movePanel(i, -1)} disabled={busy || i === 0}>Move left</button>
              <button type="button" className="a-btn ghost sm" onClick={() => movePanel(i, 1)} disabled={busy || i === count - 1}>Move right</button>
              <button type="button" className="a-btn danger sm" onClick={() => removePanel(i)} disabled={busy || count <= LIMITS.minPanels}>Remove panel</button>
            </span>
          </h2>
          <div className="a-row">
            <div className="a-field">
              <label htmlFor={`home-title-${i}`}>Name</label>
              <input id={`home-title-${i}`} maxLength={LIMITS.title} value={p.title} onChange={(e) => setPanel(i, 'title', e.target.value)} placeholder="For example: Yarn thread" />
            </div>
            <div className="a-field">
              <label htmlFor={`home-cta-${i}`}>Button words</label>
              <input id={`home-cta-${i}`} maxLength={LIMITS.cta} value={p.cta} onChange={(e) => setPanel(i, 'cta', e.target.value)} placeholder="For example: See yarn thread" />
            </div>
          </div>
          <div className="a-field">
            <label htmlFor={`home-text-${i}`}>Short description</label>
            <textarea id={`home-text-${i}`} rows={2} maxLength={LIMITS.text} value={p.text} onChange={(e) => setPanel(i, 'text', e.target.value)} />
            <div className="hint">One sentence. Up to {LIMITS.text} characters.</div>
          </div>
          <div className="a-row">
            <div className="a-field">
              <label htmlFor={`home-href-${i}`}>Page the button opens</label>
              <select id={`home-href-${i}`} value={p.href} onChange={(e) => setPanel(i, 'href', e.target.value)}>
                {!LINK_OPTIONS.some((l) => l.value === p.href) && <option value={p.href}>{p.href}</option>}
                {LINK_OPTIONS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div className="a-field">
              <label htmlFor={`home-art-${i}`}>Built-in artwork</label>
              <select id={`home-art-${i}`} value={p.art} onChange={(e) => setPanel(i, 'art', e.target.value)}>
                {ART_OPTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
              <div className="hint">Shown only when the panel has no photograph.</div>
            </div>
          </div>
          <div className="a-field">
            <label htmlFor={`home-photo-${i}`}>Photograph</label>
            <input id={`home-photo-${i}`} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => uploadPhoto(i, e)} disabled={busy} />
            <div className="hint">
              JPG, PNG or WEBP, up to 5MB. A tall or square photograph works best, because each panel is taller than it is wide.
              {p.image ? (
                <> Current: <a href={p.image} target="_blank" rel="noreferrer">view photograph</a>.{' '}
                  <button type="button" className="a-btn ghost sm" onClick={() => setPanel(i, 'image', '')} disabled={busy}>Remove photograph</button>
                </>
              ) : ' No photograph yet, so the built-in artwork is shown.'}
            </div>
          </div>
        </div>
      ))}

      <div className="panel">
        <div role="status" aria-live="polite">
          {msg.t && <div className={`a-msg ${msg.k}`}>{msg.t}</div>}
        </div>
        <div className="a-actions">
          <button type="button" className="a-btn gold" onClick={save} disabled={busy}>{busy ? 'Working…' : 'Save front page'}</button>
          <button type="button" className="a-btn ghost" onClick={addPanel} disabled={busy || count >= LIMITS.maxPanels}>Add a panel</button>
          <a className="a-btn ghost" href="/" target="_blank" rel="noopener noreferrer">View the front page</a>
        </div>
        <div className="hint">The front page shows {LIMITS.minPanels} to {LIMITS.maxPanels} panels. Changes appear on the website as soon as you save.</div>
      </div>
    </>
  );
}
