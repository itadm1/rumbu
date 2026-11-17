import { createSupabaseAdmin } from '../../../../lib/supabaseServer';
import HRInterviewManager from '../../../../components/HRInterviewManager';
import AdminPageHeader from '../../../../components/AdminPageHeader';

// PATH: app/admin/hr/interview-sessions/page.js
export const metadata = { title: 'Interview sessions' };
export const dynamic = 'force-dynamic';

export default async function HRInterviewSessionsPage() {
  const admin = createSupabaseAdmin();

  const { data: interviewed } = await admin
    .from('applications')
    .select('id, full_name, email, phone, created_at, jobs(title)')
    .eq('hr_stage', 'interviewed')
    .order('created_at', { ascending: false });

  const { data: panels } = await admin
    .from('interview_panels')
    .select('*, applications(id, full_name, email, jobs(title)), interview_panelists(*)')
    .order('created_at', { ascending: false });

  const rows = interviewed || [];
  const panelRows = (panels || []).map((p) => ({ ...p, applicant: p.applications }));
  const scheduledApplicationIds = new Set(panelRows.map((p) => p.application_id));

  const awaitingPanel = rows
    .filter((a) => !scheduledApplicationIds.has(a.id))
    .map((a) => ({ ...a, job_title: a.jobs?.title || '—' }));

  const pendingPanels = panelRows.filter((p) => p.decision === 'pending');

  return (
    <>
      <AdminPageHeader title="Interview sessions" description={<>Set up interview panels for interviewed candidates, then record each panelist’s score.</>} />
      <HRInterviewManager awaitingPanel={awaitingPanel} pendingPanels={pendingPanels} />
    </>
  );
}
