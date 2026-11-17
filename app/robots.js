import { siteUrl } from '../lib/site';

// Search engines may read the public website. The staff workspace and the
// form endpoints are kept out of search results.
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
