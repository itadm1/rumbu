import { redirect } from 'next/navigation';
import { requireAdmin } from '../../../lib/authGuard';
import { getHomeContent } from '../../../lib/home';
import HomeEditor from '../../../components/HomeEditor';
import AdminPageHeader from '../../../components/AdminPageHeader';

export const metadata = { title: 'Front page' };
export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  const profile = await requireAdmin();
  if (!profile) redirect('/admin/login');

  const content = await getHomeContent();

  return (
    <>
      <AdminPageHeader title="Front page" description="Change the words and pictures on the first page of the website." />
      <HomeEditor initial={content} />
    </>
  );
}
