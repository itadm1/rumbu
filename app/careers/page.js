import CareersView from '../../components/CareersView';
import { createSupabaseAdmin } from '../../lib/supabaseServer';
import { getSupabaseStatus } from '../../lib/supabaseConfig';

export const metadata = {
  title: 'Careers',
  description: 'Build a career with Rumbu Industries Limited, Nigeria’s leading manufacturer of polypropylene woven mats and twine.',
};
export const dynamic = 'force-dynamic';

export default async function Careers() {
  let data = [];
  let unavailable = false;
  if (!getSupabaseStatus().ready) {
    unavailable = true;
  } else {
    try {
      const admin = createSupabaseAdmin();
      const result = await admin.from('jobs').select('*').eq('open', true).order('created_at', { ascending: false });
      if (result.error) unavailable = true;
      else data = result.data || [];
    } catch { unavailable = true; }
  }
  return <CareersView jobs={data} unavailable={unavailable} />;
}
