import './admin.css';
import Link from 'next/link';
import { getCurrentProfile } from '../../lib/supabaseServer';
import AdminShell from '../../components/AdminShell';
import AdminNotice from '../../components/AdminNotice';
import { AdminThemeSync, themeInitScript } from '../../components/AdminTheme';

export const metadata = {
  title: { default: 'Workspace', template: '%s | Rumbu Workspace' },
  robots: { index: false, follow: false },
};

// Wraps everything under /admin.
//  - Signed in: the application shell (sidebar, top bar) around the page.
//  - Not signed in: the page alone. Middleware only lets the login page and
//    the setup notice through in that state.
//  - Supabase unreachable: a controlled notice, never a crash.
export default async function AdminLayout({ children }) {
  let profile = null;
  let unreachable = false;
  try {
    profile = await getCurrentProfile();
  } catch {
    unreachable = true;
  }

  return (
    <div className="admin-root" data-theme="light" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      <AdminThemeSync />
      {unreachable ? (
        <AdminNotice
          eyebrow="Connection problem"
          title="The workspace cannot reach its database"
          actions={<><Link href="/admin" className="a-btn gold">Try again</Link><Link href="/" className="a-btn ghost">Back to website</Link></>}
        >
          <p>Your sign-in could not be verified because the data service did not respond. Nothing has been changed. Check your connection and try again in a moment.</p>
        </AdminNotice>
      ) : profile ? (
        <AdminShell profile={profile}>{children}</AdminShell>
      ) : (
        children
      )}
    </div>
  );
}
