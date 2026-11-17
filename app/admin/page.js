import Link from 'next/link';
import { createSupabaseAdmin, getCurrentProfile } from '../../lib/supabaseServer';
import { formatDate } from '../../lib/format';
import AdminPageHeader from '../../components/AdminPageHeader';
import Icon from '../../components/Icon';

export const metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

const STAGES = [
  ['applied', 'Applied'], ['screening', 'Screening'], ['shortlisted', 'Shortlisted'], ['interview', 'Interview'],
  ['offer', 'Offer'], ['hired', 'Hired'], ['rejected', 'Rejected'],
];

async function getStats() {
  const admin = createSupabaseAdmin();
  const count = (table) => admin.from(table).select('id', { count: 'exact', head: true });
  const [msgs, apps, jobs, posts, users, stages] = await Promise.all([
    count('contact_submissions'),
    count('applications'),
    count('jobs').eq('open', true),
    count('news_posts'),
    count('profiles'),
    admin.from('applications').select('stage'),
  ]);
  const byStage = {};
  (stages.data || []).forEach((a) => { const s = a.stage || 'applied'; byStage[s] = (byStage[s] || 0) + 1; });
  return {
    messages: msgs.count || 0,
    applications: apps.count || 0,
    openJobs: jobs.count || 0,
    posts: posts.count || 0,
    users: users.count || 0,
    byStage,
  };
}

async function getRecent() {
  const admin = createSupabaseAdmin();
  const [{ data: apps }, { data: msgs }] = await Promise.all([
    admin.from('applications').select('full_name, email, created_at, jobs(title)').order('created_at', { ascending: false }).limit(5),
    admin.from('contact_submissions').select('name, subject, created_at').order('created_at', { ascending: false }).limit(5),
  ]);
  return { apps: apps || [], msgs: msgs || [] };
}

function Kpi({ href, icon, label, value, tone }) {
  return (
    <Link href={href} className={`a-kpi${tone ? ` ${tone}` : ''}`}>
      <span className="a-kpi__icon"><Icon name={icon} size={20} /></span>
      <span className="a-kpi__label">{label}</span>
      <strong className="a-kpi__value">{value.toLocaleString('en-GB')}</strong>
      <span className="a-kpi__go">Open <Icon name="chevronRight" size={14} /></span>
    </Link>
  );
}

export default async function AdminDashboard() {
  const [stats, recent, profile] = await Promise.all([getStats(), getRecent(), getCurrentProfile()]);
  const role = profile?.role;
  const firstName = (profile?.full_name || '').split(' ')[0];
  const applicationsHref = role === 'hr' ? '/admin/hr/applicants' : '/admin/applications';
  const maxStage = Math.max(1, ...Object.values(stats.byStage));

  return (
    <>
      <AdminPageHeader title={firstName ? `Welcome back, ${firstName}` : 'Dashboard'} description="Overview of activity across the website.">
        <Link href="/admin/news" className="a-btn ghost"><Icon name="plus" size={17} /> News post</Link>
        <Link href="/admin/jobs" className="a-btn gold"><Icon name="plus" size={17} /> Job advert</Link>
      </AdminPageHeader>

      <div className="a-kpis">
        <Kpi href="/admin/messages" icon="inbox" label="Contact messages" value={stats.messages} />
        <Kpi href={applicationsHref} icon="file" label="Job applications" value={stats.applications} tone="gold" />
        <Kpi href="/admin/jobs" icon="briefcase" label="Open job adverts" value={stats.openJobs} />
        <Kpi href="/admin/news" icon="news" label="News posts" value={stats.posts} />
        {role === 'super_admin' && <Kpi href="/admin/users" icon="users" label="Workspace users" value={stats.users} />}
      </div>

      <div className="a-grid">
        <section className="panel" aria-labelledby="recent-apps">
          <h2 id="recent-apps">Recent applications <Link href={applicationsHref} className="a-link">View all</Link></h2>
          {recent.apps.length === 0 ? (
            <div className="a-empty"><Icon name="file" size={26} /><strong>No applications yet</strong><span>Applications submitted through the careers page appear here.</span></div>
          ) : (
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Role applied</th><th>Email</th><th>Date</th></tr></thead>
              <tbody>
                {recent.apps.map((a, i) => (
                  <tr key={i}>
                    <td><strong>{a.full_name}</strong></td>
                    <td>{a.jobs?.title || '—'}</td>
                    <td>{a.email}</td>
                    <td>{formatDate(a.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="panel" aria-labelledby="pipeline">
          <h2 id="pipeline">Application pipeline</h2>
          {stats.applications === 0 ? (
            <div className="a-empty"><Icon name="chart" size={26} /><strong>Nothing to show yet</strong><span>Stage totals appear once applications arrive.</span></div>
          ) : (
            <ul className="a-bars">
              {STAGES.map(([key, label]) => {
                const n = stats.byStage[key] || 0;
                return (
                  <li key={key}>
                    <span>{label}</span>
                    <span className="a-bars__track"><span style={{ width: `${(n / maxStage) * 100}%` }} /></span>
                    <strong>{n}</strong>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="panel" aria-labelledby="recent-msgs">
        <h2 id="recent-msgs">Recent messages <Link href="/admin/messages" className="a-link">View all</Link></h2>
        {recent.msgs.length === 0 ? (
          <div className="a-empty"><Icon name="inbox" size={26} /><strong>No messages yet</strong><span>Messages sent through the contact form appear here.</span></div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>From</th><th>Subject</th><th>Date</th></tr></thead>
            <tbody>
              {recent.msgs.map((m, i) => (
                <tr key={i}>
                  <td><strong>{m.name}</strong></td>
                  <td>{m.subject || '—'}</td>
                  <td>{formatDate(m.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
