import { createSupabaseAdmin } from '../../../lib/supabaseServer';
import JobsManager from '../../../components/JobsManager';
import AdminPageHeader from '../../../components/AdminPageHeader';

export const metadata = { title: 'Job adverts' };
export const dynamic = 'force-dynamic';

export default async function AdminJobs() {
  const admin = createSupabaseAdmin();
  const { data: jobs } = await admin.from('jobs').select('*').order('created_at', { ascending: false });

  // Count applications per job.
  const { data: apps } = await admin.from('applications').select('job_id');
  const counts = {};
  (apps || []).forEach((a) => { counts[a.job_id] = (counts[a.job_id] || 0) + 1; });
  const withCounts = (jobs || []).map((j) => ({ ...j, applicant_count: counts[j.id] || 0 }));

  return (
    <>
      <AdminPageHeader title="Job adverts" description="Post and manage vacancies." />
      <JobsManager initialJobs={withCounts} />
    </>
  );
}
