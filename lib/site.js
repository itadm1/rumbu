// The public address of the website, with no trailing slash.
//
// Order of preference:
//  1. NEXT_PUBLIC_SITE_URL, if you set it in Vercel (for example
//     https://www.rumbuindustries.com).
//  2. The production address Vercel assigns to the project. This becomes the
//     custom domain automatically once the domain is added to the project.
//  3. The company domain, for local builds.
//
// Link previews, the sitemap and robots.txt are built from this value, so they
// always point at the address the site is really served from.
export function siteUrl() {
  const explicit = (process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '');
  if (explicit) return explicit;
  const vercel = (process.env.VERCEL_PROJECT_PRODUCTION_URL || '').trim();
  if (vercel) return `https://${vercel}`;
  return 'https://www.rumbuindustries.com';
}
