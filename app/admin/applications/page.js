import { createSupabaseAdmin } from '../../../lib/supabaseServer';
import ApplicationsManager from '../../../components/ApplicationsManager';
import AdminPageHeader from '../../../components/AdminPageHeader';

export const metadata = { title: 'Applications' };
export const dynamic = 'force-dynamic';

const DOC_FIELDS = ['cv_path', 'cover_letter_path', 'photo_path', 'nin_image_path', 'professional_cert_path'];

export default async function AdminApplications() {
  const admin = createSupabaseAdmin();
  const { data: apps } = await admin
    .from('applications')
    .select('*, jobs(title)')
    .order('created_at', { ascending: false });

  const rows = apps || [];

  // Collect every storage path referenced (standard docs + qualification
  // certificates) and sign them all in a single batched call.
  const paths = new Set();
  rows.forEach((a) => {
    DOC_FIELDS.forEach((f) => { if (a[f]) paths.add(a[f]); });
    (a.qualifications || []).forEach((q) => { if (q.file_path) paths.add(q.file_path); });
  });

  let signedMap = {};
  if (paths.size > 0) {
    const { data: signed } = await admin.storage
      .from('applications')
      .createSignedUrls(Array.from(paths), 60 * 60); // 1 hour
    (signed || []).forEach((s) => { if (s?.signedUrl) signedMap[s.path] = s.signedUrl; });
  }

  const enriched = rows.map((a) => ({
    ...a,
    job_title: a.jobs?.title || '—',
    docs: DOC_FIELDS.reduce((out, f) => {
      if (a[f]) out[f] = { path: a[f], url: signedMap[a[f]] || null };
      return out;
    }, {}),
    qualifications: (a.qualifications || []).map((q) => ({
      ...q,
      url: q.file_path ? signedMap[q.file_path] || null : null,
    })),
  }));

  const jobTitles = Array.from(new Set(enriched.map((a) => a.job_title))).sort();

  return (
    <>
      <AdminPageHeader title="Applications" description={<>{rows.length} total application{rows.length === 1 ? '' : 's'}.</>} />
      <ApplicationsManager initialRows={enriched} jobTitles={jobTitles} />
    </>
  );
}