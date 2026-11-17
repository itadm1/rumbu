'use client';

import { useState } from 'react';

export default function SettingsForm({ initialFromEmail }) {
  const [fromEmail, setFromEmail] = useState(initialFromEmail);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const save = async () => {
    setBusy(true); setErr(''); setMsg('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'careers_from_email', value: fromEmail }),
      });
      const data = await res.json();
      if (data.ok) setMsg('Saved.');
      else setErr(data.error || 'Could not save.');
    } catch {
      setErr('Could not save.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="a-narrow">
      <h2>Careers email sender</h2>
      <p className="hint">
        This is the &ldquo;From&rdquo; address used for interview invitations, offers, rejections
        and hire confirmations sent from the Applications page. Format:{' '}
        <code>Display Name &lt;email@rumbuindustries.com&gt;</code>. The domain must be verified
        in your Resend account.
      </p>
      <div className="a-field">
        <label htmlFor="from-address">From address</label>
        <input id="from-address" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} />
      </div>
      {err && <div className="a-msg err">{err}</div>}
      {msg && <div className="a-msg ok">{msg}</div>}
      <button className="a-btn gold" onClick={save} disabled={busy}>
        {busy ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}