'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Icon from './Icon';

const companyLinks = [
  ['/about', 'Our story'],
  ['/team', 'Our leadership'],
  ['/exhibitions', 'Exhibitions'],
  ['/news', 'News & milestones'],
];
const mainLinks = [
  ['/products', 'Products'],
  ['/services', 'Services'],
  ['/research', 'Innovation'],
  ['/careers', 'Careers'],
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const header = useRef(null);
  const toggle = useRef(null);

  // Close menus on navigation.
  useEffect(() => { setOpen(false); setCompanyOpen(false); }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape' && (open || companyOpen)) {
        setOpen(false);
        setCompanyOpen(false);
        if (open) toggle.current?.focus();
      }
      // Keep keyboard focus inside the open mobile menu.
      if (event.key === 'Tab' && open) {
        const items = [...header.current.querySelectorAll('a, button')].filter((el) => el.getClientRects().length);
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    const outside = (event) => { if (!header.current?.contains(event.target)) setCompanyOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', outside);
    if (open) document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', outside);
      document.body.style.overflow = '';
    };
  }, [open, companyOpen]);

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);
  const companyActive = companyLinks.some(([href]) => isActive(href));
  const closeAll = () => { setOpen(false); setCompanyOpen(false); };

  return (
    <header className="site-header" ref={header} data-scrolled={scrolled}>
      <div className="container site-header__bar">
        <Link href="/" className="brand" aria-label="Rumbu Industries Group, home">
          <Image src="/logo.png" alt="" width={34} height={40} priority />
          <span className="brand__name">RUMBU<small>INDUSTRIES GROUP</small></span>
        </Link>

        <nav id="primary-navigation" className={open ? 'site-nav is-open' : 'site-nav'} aria-label="Main navigation">
          <div className="site-nav__group" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setCompanyOpen(false); }}>
            <button
              type="button"
              className={companyActive ? 'site-nav__link is-active' : 'site-nav__link'}
              aria-expanded={companyOpen}
              aria-controls="company-navigation"
              onClick={() => setCompanyOpen(!companyOpen)}
            >
              Company <Icon name="chevron" size={16} />
            </button>
            <div id="company-navigation" className="site-nav__menu" hidden={!companyOpen}>
              {companyLinks.map(([href, title]) => (
                <Link key={href} href={href} aria-current={isActive(href) ? 'page' : undefined} onClick={closeAll}>
                  {title}<Icon name="diagonal" size={16} />
                </Link>
              ))}
            </div>
          </div>
          {mainLinks.map(([href, title]) => (
            <Link key={href} href={href} className="site-nav__link" aria-current={isActive(href) ? 'page' : undefined} onClick={closeAll}>
              {title}
            </Link>
          ))}
          <Link href="/contact" className="btn btn-gold btn-sm site-nav__cta" onClick={closeAll}>
            Let’s talk <Icon name="diagonal" size={16} />
          </Link>
        </nav>

        <button
          ref={toggle}
          type="button"
          className="nav-toggle"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen(!open)}
        >
          <Icon name={open ? 'close' : 'menu'} size={22} />
        </button>
      </div>
    </header>
  );
}
