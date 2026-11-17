import { redirect } from 'next/navigation';
import { requireSuperAdmin } from '../../../lib/authGuard';
import { createSupabaseAdmin } from '../../../lib/supabaseServer';
import SettingsForm from '../../../components/SettingsForm';
import AdminPageHeader from '../../../components/AdminPageHeader';

export const metadata = { title: 'Settings' };
export const dynamic = 'force-dynamic';

export default async function AdminSettings() {
  const profile = await requireSuperAdmin();
  if (!profile) redirect('/admin');

  const admin = createSupabaseAdmin();
  const { data } = await admin
    .from('app_settings')
    .select('value')
    .eq('key', 'careers_from_email')
    .single();

  return (
    <>
      <AdminPageHeader title="Settings" description="Panel-wide configuration." />
      <div className="panel">
        <SettingsForm initialFromEmail={data?.value || ''} />
      </div>
    </>
  );
}