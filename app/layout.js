import localFont from 'next/font/local';
import './globals.css';
import './site.css';
import './pages.css';
import './product-experience.css';
import './home-stage.css';
import SiteFrame from '../components/SiteFrame';
import { siteUrl } from '../lib/site';
import { company } from '../lib/data';

// Fonts are stored in app/fonts and served from this site, so the build and
// the pages never depend on a request to Google Fonts.
const fraunces = localFont({
  src: [
    { path: './fonts/fraunces-normal.woff2', weight: '100 900', style: 'normal' },
    { path: './fonts/fraunces-italic.woff2', weight: '100 900', style: 'italic' },
  ],
  display: 'swap',
  variable: '--font-fraunces',
});

const manrope = localFont({
  src: [{ path: './fonts/manrope.woff2', weight: '200 800', style: 'normal' }],
  display: 'swap',
  variable: '--font-manrope',
});

export const metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: 'Rumbu Industries Limited | PP Woven Mats & Twine, Kano',
    template: '%s | Rumbu Industries Limited',
  },
  description:
    'Rumbu Industries Limited is Nigeria’s leading polypropylene woven mat and twine rope manufacturer, based in Kano since 2001. The largest in West Africa.',
  keywords: ['Rumbu', 'Rumbu Industries', 'PP woven mats', 'twine ropes', 'Kano', 'Nigeria manufacturing'],
  openGraph: {
    title: 'Rumbu Industries Limited',
    description: 'World leader in quality polypropylene woven mats and twine ropes. Kano, Nigeria.',
    url: siteUrl(),
    siteName: 'Rumbu Industries Limited',
    type: 'website',
    images: [{ url: '/products/factory-floor.jpg', width: 1901, height: 1000, alt: 'The Rumbu weaving hall in Kano, Nigeria' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rumbu Industries Limited',
    description: 'World leader in quality polypropylene woven mats and twine ropes.',
    images: ['/products/factory-floor.jpg'],
  },
};

export const viewport = {
  themeColor: '#092820',
};

const organisation = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: company.name,
  url: siteUrl(),
  logo: `${siteUrl()}/logo-dark.png`,
  foundingDate: String(company.founded),
  email: company.email,
  telephone: company.phone1,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'KM 4 Hadejia Road, Opp. Sir Muhd Sanusi Hospital',
    addressLocality: 'Kano',
    addressCountry: 'NG',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>
        <SiteFrame>{children}</SiteFrame>
        {/* Tells search engines who the company is: name, address, phone. */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organisation) }} />
      </body>
    </html>
  );
}
