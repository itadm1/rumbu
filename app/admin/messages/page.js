import { createSupabaseAdmin } from '../../../lib/supabaseServer';
import AdminPageHeader from '../../../components/AdminPageHeader';
import MessagesTable from '../../../components/MessagesTable';

export const metadata = { title: 'Messages' };
export const dynamic = 'force-dynamic';

export default async function AdminMessages() {
  const admin = createSupabaseAdmin();
  const { data } = await admin
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false });
  const rows = data || [];

  return (
    <>
      <AdminPageHeader title="Messages" description={`${rows.length} contact message${rows.length === 1 ? '' : 's'}.`} />
      <MessagesTable rows={rows} />
    </>
  );
}
