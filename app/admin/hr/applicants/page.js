import { createSupabaseAdmin } from '../../../../lib/supabaseServer';
import HRApplicantsManager from '../../../../components/HRApplicantsManager';
import AdminPageHeader from '../../../../components/AdminPageHeader';

// PATH: app/admin/hr/applicants/page.js
export const metadata = { title: 'Applicants' };
export const dynamic = 'force-dynamic';

const DOC_FIELDS = ['cv_path', 'cover_letter_path', 'photo_path', 'nin_image_path', 'professional_cert_path'];

export default async function HRApplicantsPage() {
  const admin = createSupabaseAdmin();
  const { data: apps } = await admin
    .from('applications')
    .select('*, jobs(title, department)')
    .order('created_at', { ascending: false });

  const rows = apps || [];

  const paths = new Set();
  rows.forEach((a) => DOC_FIELDS.forEach((f) => { if (a[f]) paths.add(a[f]); }));

  let signedMap = {};
  if (paths.size > 0) {
    const { data: signed } = await admin.storage.from('applications').createSignedUrls(Array.from(paths), 60 * 60);
    (signed || []).forEach((s) => { if (s?.signedUrl) signedMap[s.path] = s.signedUrl; });
  }

  const enriched = rows.map((a) => ({
    ...a,
    job_title: a.jobs?.title || '—',
    department: a.jobs?.department || '—',
    docs: DOC_FIELDS.reduce((out, f) => {
      if (a[f]) out[f] = signedMap[a[f]] || null;
      return out;
    }, {}),
  }));

  const jobTitles = Array.from(new Set(enriched.map((a) => a.job_title))).sort();

  return (
    <>
      <AdminPageHeader title="Applicants" description={<>{rows.length} submission{rows.length === 1 ? '' : 's'} total. Filter, screen, then disqualify or move to Interviewed.</>} />
      <HRApplicantsManager initialRows={enriched} jobTitles={jobTitles} />
    </>
  );
}
