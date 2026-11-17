import Link from 'next/link';
import Icon from './Icon';
import { formatDate } from '../lib/format';

export default function NewsCard({ post, featured = false }) {
  return (
    <Link href={`/news/${post.slug}`} className={featured ? 'news-card news-card--featured' : 'news-card'}>
      <div className="news-card__media">
        {post.cover
          ? <img src={post.cover} alt="" loading="lazy" decoding="async" />
          : <div className="placeholder-media"><strong>Rumbu</strong><small>News &amp; milestones</small></div>}
      </div>
      <div className="news-card__body">
        <div className="news-card__meta">
          <span>{post.category}</span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </div>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <span className="news-card__more">Read story <Icon name="diagonal" size={16} /></span>
      </div>
    </Link>
  );
}
