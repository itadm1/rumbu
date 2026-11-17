import { redirect } from 'next/navigation';
import { getCurrentProfile, createSupabaseAdmin } from '../../../lib/supabaseServer';
import UsersManager from '../../../components/UsersManager';
import AdminPageHeader from '../../../components/AdminPageHeader';

export const metadata = { title: 'Users' };
export const dynamic = 'force-dynamic';

export default async function AdminUsers() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'super_admin') {
    redirect('/admin');
  }
  const admin = createSupabaseAdmin();
  const { data } = await admin.from('profiles').select('*').order('created_at', { ascending: true });

  return (
    <>
      <AdminPageHeader title="Users" description="Manage admin access and roles." />
      <UsersManager initialUsers={data || []} currentId={profile.id} />
    </>
  );
}
