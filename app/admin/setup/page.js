import Link from 'next/link';
import { redirect } from 'next/navigation';
import AdminNotice from '../../../components/AdminNotice';
import { getSupabaseStatus } from '../../../lib/supabaseConfig';

export const metadata = { title: 'Setup required' };
export const dynamic = 'force-dynamic';

const HELP = {
  NEXT_PUBLIC_SUPABASE_URL: 'Project Settings → API → Project URL',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Project Settings → API → Project API keys → anon public',
  SUPABASE_SERVICE_ROLE_KEY: 'Project Settings → API → Project API keys → service_role (keep secret)',
};

// Shown for every /admin URL while Supabase is not configured (see
// middleware.js). It lists which variables are missing, never their values.
export default function AdminSetup() {
  const status = getSupabaseStatus();
  if (status.ready) redirect('/admin');

  return (
    <AdminNotice
      icon="settings"
      eyebrow="Setup required"
      title="The workspace is not connected yet"
      actions={<><Link href="/admin" className="a-btn gold">Check again</Link><Link href="/" className="a-btn ghost">Back to website</Link></>}
    >
      <p>Sign-in is switched off because the Supabase connection details are missing or invalid. No admin data can be viewed until they are added.</p>
      <h2>Missing or invalid</h2>
      <ul className="a-notice__list">
        {status.missing.map((name) => (
          <li key={name}><code>{name}</code><span>{HELP[name]}</span></li>
        ))}
      </ul>
      <h2>How to fix it</h2>
      <ol className="a-notice__steps">
        <li>Copy <code>.env.example</code> to <code>.env.local</code> in the project folder.</li>
        <li>Paste the values from your Supabase dashboard into <code>.env.local</code>.</li>
        <li>Restart the server (<code>npm run dev</code>), then select “Check again”.</li>
      </ol>
      <p className="a-notice__foot">On Vercel, add the same 3 variables under Project Settings → Environment Variables and redeploy. Full steps are in <code>ADMIN-SETUP.md</code>.</p>
    </AdminNotice>
  );
}
