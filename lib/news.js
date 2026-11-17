import { news as staticNews } from './data';
import { createSupabaseAdmin } from './supabaseServer';

const covers = {
  'president-buhari-visits-iatf-stand': '/exhibitions/p5.jpg',
  'made-in-kano-exhibition-2021': '/exhibitions/p15.jpg',
  'jacquard-weaving-milestone': '/products/factory-floor.jpg',
  'renewable-energy-partnership-enerwhere': '/services/renewable-energy.jpg',
};
const fallback = staticNews.map(post => ({ ...post, cover: post.cover || covers[post.slug] }));
export async function getNews() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return fallback;
  try {
    const { data, error } = await createSupabaseAdmin().from('news_posts').select('*').eq('published', true).order('created_at', { ascending: false });
    if (error) return fallback;
    const posts = (data || []).map(p => ({ slug: p.slug, title: p.title, category: p.category, date: p.created_at, excerpt: p.excerpt, cover: p.cover_url, body: (p.body || '').split(/\n\s*\n/).map(s => s.trim()).filter(Boolean), youtube_url: p.youtube_url }));
    const slugs = new Set(posts.map(p => p.slug));
    return [...posts, ...fallback.filter(p => !slugs.has(p.slug))].sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch { return fallback; }
}
