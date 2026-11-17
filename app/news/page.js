import PageHeader from '../../components/PageHeader';
import NewsCard from '../../components/NewsCard';
import ContactCTA from '../../components/ContactCTA';
import Reveal from '../../components/Reveal';
import { getNews } from '../../lib/news';

export const metadata = { title: 'News & Milestones' };
export const dynamic = 'force-dynamic';

export default async function News() {
  const posts = await getNews();
  const [lead, ...rest] = posts;
  return (
    <>
      <PageHeader
        variant="ivory"
        label="News & milestones"
        title={<>Our journey.<br /><em>Our stories.</em></>}
        description="The people, partnerships and moments moving Rumbu forward."
      />
      <section className="section section--white section--flush-top">
        <div className="container">
          {posts.length === 0 ? (
            <div className="empty-state"><h3>No stories yet</h3><p>News and milestones will appear here as they are published.</p></div>
          ) : (
            <>
              <Reveal><NewsCard post={lead} featured /></Reveal>
              {rest.length > 0 && (
                <>
                  <div className="news-divider"><span>{posts.length} stories &amp; milestones</span></div>
                  <div className="grid-3">
                    {rest.map((post, i) => <Reveal key={post.slug} delay={(i % 3) + 1}><NewsCard post={post} /></Reveal>)}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
      <ContactCTA />
    </>
  );
}
