'use client';

import { useEffect } from 'react';
import Icon from '../../components/Icon';

// Controlled error state for any admin page that fails to load its data.
export default function AdminError({ error, reset }) {
  useEffect(() => { console.error('Admin page error:', error); }, [error]);
  return (
    <div className="a-state" role="alert">
      <span className="a-state__icon danger"><Icon name="alert" size={24} /></span>
      <h1>This page could not be loaded</h1>
      <p>The data for this page did not load. Nothing has been changed. Try again, and if the problem continues, check that the database tables from <code>supabase/admin-schema.sql</code> exist.</p>
      {error?.digest && <p className="a-state__ref">Reference: {error.digest}</p>}
      <div className="a-state__actions">
        <button type="button" className="a-btn gold" onClick={() => reset()}>Try again</button>
        <a href="/admin" className="a-btn ghost">Go to dashboard</a>
      </div>
    </div>
  );
}
