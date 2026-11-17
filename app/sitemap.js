import { siteUrl } from '../lib/site';
import { getProducts } from '../lib/products';
import { getNews } from '../lib/news';

// Rebuilt every hour, so newly published stories appear without a redeploy.
export const revalidate = 3600;

const PAGES = ['', '/about', '/products', '/services', '/research', '/team', '/careers', '/exhibitions', '/news', '/contact'];

export default async function sitemap() {
  const base = siteUrl();
  const now = new Date();
  let news = [];
  try {
    news = await getNews();
  } catch {
    news = [];
  }
  return [
    ...PAGES.map((path) => ({ url: `${base}${path}`, lastModified: now, changeFrequency: path === '' || path === '/news' ? 'weekly' : 'monthly', priority: path === '' ? 1 : 0.7 })),
    ...getProducts().map((p) => ({ url: `${base}/products/${p.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 })),
    ...news.map((n) => ({ url: `${base}/news/${n.slug}`, lastModified: n.date ? new Date(n.date) : now, changeFrequency: 'yearly', priority: 0.5 })),
  ];
}
