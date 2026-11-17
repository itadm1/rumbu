'use client';

import { useMemo, useState } from 'react';
import Icon from './Icon';
import { formatDate } from '../lib/format';

export default function MessagesTable({ rows }) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((m) => `${m.name} ${m.email} ${m.subject || ''} ${m.message || ''}`.toLowerCase().includes(needle));
  }, [rows, q]);

  if (rows.length === 0) {
    return (
      <div className="panel">
        <div className="a-empty"><Icon name="inbox" size={26} /><strong>No messages yet</strong><span>Messages sent through the website contact form appear here.</span></div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="apps-toolbar">
        <input className="apps-search" type="search" aria-label="Search messages" placeholder="Search name, email, subject or message…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="a-count" role="status">Showing {filtered.length} of {rows.length} message{rows.length === 1 ? '' : 's'}.</div>
      {filtered.length === 0 ? (
        <div className="a-empty"><Icon name="search" size={26} /><strong>No messages match</strong><span>Try a different search term.</span><button type="button" className="a-btn ghost sm" onClick={() => setQ('')}>Clear search</button></div>
      ) : (
        <table className="admin-table">
          <thead><tr><th>From</th><th>Subject</th><th>Message</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id}>
                <td><div className="apps-name">{m.name}</div><div className="apps-sub"><a href={`mailto:${m.email}`}>{m.email}</a></div></td>
                <td>{m.subject || '—'}</td>
                <td className="a-cell-text">{m.message}</td>
                <td>{formatDate(m.created_at)}</td>
                <td><a className="a-btn ghost sm" href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || 'Your enquiry to Rumbu Industries'}`)}`}>Reply</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
