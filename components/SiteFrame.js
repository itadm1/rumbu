'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import SiteChrome from './SiteChrome';

// Renders the public Header/Footer/SiteChrome on every page EXCEPT /admin.
// The admin section has its own shell defined in app/admin/layout.js, so it
// must never receive the public menu bar.
export default function SiteFrame({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="public-site">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Header />
      {/* Keyed by route so each page fades in on navigation. */}
      <main id="main-content" tabIndex={-1} key={pathname} className="page-enter">{children}</main>
      {/* The front page is a single screen with its own short footer line. */}
      {pathname !== '/' && <Footer />}
      <SiteChrome />
    </div>
  );
}
