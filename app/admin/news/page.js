import { createSupabaseAdmin } from '../../../lib/supabaseServer';
import NewsManager from '../../../components/NewsManager';
import AdminPageHeader from '../../../components/AdminPageHeader';

export const metadata = { title: 'News' };
export const dynamic = 'force-dynamic';

export default async function AdminNews() {
  const admin = createSupabaseAdmin();
  const { data } = await admin.from('news_posts').select('*').order('created_at', { ascending: false });
  return (
    <>
      <AdminPageHeader title="News" description="Create and manage news posts." />
      <NewsManager initialPosts={data || []} />
    </>
  );
}
