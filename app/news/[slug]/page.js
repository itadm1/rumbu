import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getNews } from '../../../lib/news';
import { formatDate } from '../../../lib/format';
import ContactCTA from '../../../components/ContactCTA';
import NewsCard from '../../../components/NewsCard';
import Icon from '../../../components/Icon';

export const dynamic = 'force-dynamic';

function ytEmbed(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null;
}

async function getArticle(slug) {
  const posts = await getNews();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return null;
  return { article: { ...post, youtube: ytEmbed(post.youtube_url) }, more: posts.filter((p) => p.slug !== slug).slice(0, 3) };
}

export async function generateMetadata({ params }) {
  const found = await getArticle(params.slug);
  if (!found) return { title: 'News' };
  return { title: found.article.title, description: found.article.excerpt };
}

export default async function Article({ params }) {
  const found = await getArticle(params.slug);
  if (!found) return notFound();
  const { article, more } = found;

  return (
    <>
      <article className="article">
        <header className="article__head">
          <div className="container container--narrow">
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span>
              <Link href="/news">News &amp; milestones</Link><span aria-hidden="true">/</span>
              <span aria-current="page">Story</span>
            </nav>
            <div className="article__meta"><span>{article.category}</span><time dateTime={article.date}>{formatDate(article.date)}</time></div>
            <h1 className="title-lg">{article.title}</h1>
            {article.excerpt && <p className="lead">{article.excerpt}</p>}
          </div>
        </header>
        <div className="container container--narrow article__body">
          {article.cover && (
            <figure className="frame article__cover">
              <div className="frame__media"><img src={article.cover} alt="" /></div>
            </figure>
          )}
          {article.youtube && (
            <div className="video-embed">
              <iframe src={article.youtube} title={`Video: ${article.title}`} loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          )}
          <div className="prose article__prose">
            {article.body.map((para, i) => <p key={i}>{para}</p>)}
          </div>
          <footer className="article__foot">
            <Link href="/news" className="link-arrow"><Icon name="chevronLeft" size={18} /> All news &amp; milestones</Link>
            <Link href="/contact" className="btn btn-sm">Get in touch <Icon name="diagonal" size={16} /></Link>
          </footer>
        </div>
      </article>

      {more.length > 0 && (
        <section className="section section--white">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow">Keep reading</div>
                <h2 className="title-lg">More stories</h2>
              </div>
            </div>
            <div className="grid-3">{more.map((p) => <NewsCard key={p.slug} post={p} />)}</div>
          </div>
        </section>
      )}
      <ContactCTA />
    </>
  );
}
