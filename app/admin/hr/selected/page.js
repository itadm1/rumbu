import { createSupabaseAdmin } from '../../../../lib/supabaseServer';
import HRSelectedManager from '../../../../components/HRSelectedManager';
import AdminPageHeader from '../../../../components/AdminPageHeader';

// PATH: app/admin/hr/selected/page.js
export const metadata = { title: 'Selected' };
export const dynamic = 'force-dynamic';

export default async function HRSelectedPage() {
  const admin = createSupabaseAdmin();

  const { data: apps } = await admin
    .from('applications')
    .select('id, full_name, email, phone, created_at, jobs(title, department)')
    .eq('hr_stage', 'selected')
    .order('created_at', { ascending: false });

  const rows = apps || [];
  const ids = rows.map((a) => a.id);

  let lastEmailByApp = {};
  if (ids.length > 0) {
    const { data: logs } = await admin
      .from('email_log')
      .select('application_id, sent, created_at')
      .in('application_id', ids)
      .order('created_at', { ascending: false });
    (logs || []).forEach((l) => { if (!lastEmailByApp[l.application_id]) lastEmailByApp[l.application_id] = l; });
  }

  const enriched = rows.map((a) => ({
    ...a,
    job_title: a.jobs?.title || '—',
    department: a.jobs?.department || '—',
    last_email: lastEmailByApp[a.id] || null,
  }));

  return (
    <>
      <AdminPageHeader title="Selected" description="Candidates who passed the interview panel. Send the offer, then confirm once they accept." />
      <HRSelectedManager initialRows={enriched} />
    </>
  );
}
