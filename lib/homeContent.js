// The front page content: its defaults, its limits and its checks.
// This file is safe to import anywhere (browser and server). It has no
// database code. lib/home.js reads the saved version on the server.

export const LIMITS = { headline: 90, intro: 170, title: 28, text: 150, cta: 30, minPanels: 2, maxPanels: 4 };

// Built-in artwork, shown when a panel has no photograph.
export const ART_OPTIONS = [
  { value: 'mats', label: 'Woven mats artwork' },
  { value: 'yarn', label: 'Yarn thread artwork' },
  { value: 'pet', label: 'PET flakes artwork' },
  { value: 'twine', label: 'Twine artwork' },
];

// Pages a panel may link to.
export const LINK_OPTIONS = [
  { value: '/products', label: 'All products' },
  { value: '/products/polypropylene-woven-mats', label: 'Product: PP woven mats' },
  { value: '/products/customised-woven-mats', label: 'Product: customised woven mats' },
  { value: '/products/pp-twisted-twine-ropes', label: 'Product: twisted twine ropes' },
  { value: '/products/yarn-thread', label: 'Product: yarn thread' },
  { value: '/products/pet-flakes', label: 'Product: PET flakes' },
  { value: '/products/polyester-staple-fibre', label: 'Product: polyester staple fibre' },
  { value: '/services', label: 'Services' },
  { value: '/research', label: 'Innovation' },
  { value: '/about', label: 'Our story' },
  { value: '/careers', label: 'Careers' },
  { value: '/news', label: 'News' },
  { value: '/contact', label: 'Contact' },
];

export const HOME_DEFAULTS = {
  headline: 'Woven mats, yarn thread and PET flakes, made in Nigeria.',
  intro: 'Rumbu Industries Group has manufactured in Kano since 2001. Choose a product to see more.',
  panels: [
    { title: 'Woven mats', text: 'Polypropylene woven mats for homes and gatherings, made in Kano since 2001.', cta: 'See woven mats', href: '/products/polypropylene-woven-mats', art: 'mats', image: '' },
    { title: 'Yarn thread', text: 'Yarn and thread from our Tamburawa mill, for industrial and textile use.', cta: 'See yarn thread', href: '/products/yarn-thread', art: 'yarn', image: '' },
    { title: 'PET flakes', text: 'Recycled PET flakes, washed and processed at our plants in Kano and Agbara.', cta: 'See PET flakes', href: '/products/pet-flakes', art: 'pet', image: '' },
  ],
};

const str = (value, max) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '');

// A link must be a page on this website.
const safeHref = (value) => (typeof value === 'string' && /^\/[a-z0-9\-/]*$/i.test(value) ? value : '/products');

// A picture must be on this website or served over https.
const safeImage = (value) => {
  if (typeof value !== 'string') return '';
  const v = value.trim().slice(0, 600);
  if (/^\/[\w\-./%]+$/.test(v) && !v.startsWith('//')) return v;
  if (/^https:\/\/[^\s"'<>]+$/i.test(v)) return v;
  return '';
};

// Returns clean content. Anything missing or unusable falls back to the
// default, so the front page can never be saved into a broken state.
export function sanitizeHome(input) {
  const src = input && typeof input === 'object' ? input : {};
  const arts = ART_OPTIONS.map((a) => a.value);
  const panels = (Array.isArray(src.panels) ? src.panels : [])
    .slice(0, LIMITS.maxPanels)
    .map((p) => {
      const panel = p && typeof p === 'object' ? p : {};
      const title = str(panel.title, LIMITS.title);
      return {
        title,
        text: str(panel.text, LIMITS.text),
        cta: str(panel.cta, LIMITS.cta) || `See ${title}`.slice(0, LIMITS.cta),
        href: safeHref(panel.href),
        art: arts.includes(panel.art) ? panel.art : 'mats',
        image: safeImage(panel.image),
      };
    })
    .filter((p) => p.title);
  return {
    headline: str(src.headline, LIMITS.headline) || HOME_DEFAULTS.headline,
    intro: str(src.intro, LIMITS.intro),
    panels: panels.length >= LIMITS.minPanels ? panels : HOME_DEFAULTS.panels,
  };
}
