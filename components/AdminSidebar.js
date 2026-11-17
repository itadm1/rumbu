'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Icon from './Icon';

const HR_LINKS = [
  { href: '/admin/jobs', label: 'Job adverts' },
  { href: '/admin/hr/applicants', label: 'Applicants' },
  { href: '/admin/hr/interview-sessions', label: 'Interview sessions' },
  { href: '/admin/hr/selected', label: 'Selected' },
];

export function roleLabel(role) {
  return role === 'super_admin' ? 'Super Admin' : role === 'hr' ? 'Human Resources' : 'Admin';
}

export default function AdminSidebar({ profile, pathname, collapsed, mobileOpen, onClose, onLogout, sidebarRef }) {
  const role = profile?.role;
  const canSeeHR = role === 'hr' || role === 'super_admin';
  const isHrRoute = pathname.startsWith('/admin/hr') || (role === 'hr' && pathname === '/admin/jobs');
  const [hrOpen, setHrOpen] = useState(isHrRoute || role === 'hr');

  const links = [
    { href: '/admin', label: 'Dashboard', icon: 'home' },
    { href: '/admin/home', label: 'Front page', icon: 'panel' },
    { href: '/admin/news', label: 'News', icon: 'news' },
    // HR users get Job adverts and Applicants inside the HR group instead.
    ...(role === 'hr' ? [] : [
      { href: '/admin/jobs', label: 'Job adverts', icon: 'briefcase' },
      { href: '/admin/applications', label: 'Applications', icon: 'file' },
    ]),
    { href: '/admin/messages', label: 'Messages', icon: 'inbox' },
    ...(role === 'super_admin' ? [{ href: '/admin/users', label: 'Users', icon: 'users' }] : []),
  ];

  const isActive = (href) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));
  const item = (l) => (
    <Link key={l.href} href={l.href} className="a-nav__link" aria-current={isActive(l.href) ? 'page' : undefined} title={collapsed ? l.label : undefined} onClick={onClose}>
      <Icon name={l.icon} size={19} /><span>{l.label}</span>
    </Link>
  );

  return (
    <aside ref={sidebarRef} id="admin-sidebar" className="a-sidebar" data-open={mobileOpen} aria-label="Workspace">
      <div className="a-sidebar__brand">
        <Link href="/admin" className="a-brand" aria-label="Rumbu workspace, dashboard" onClick={onClose}>
          <Image src="/logo.png" alt="" width={26} height={31} />
          <span>RUMBU<small>Workspace</small></span>
        </Link>
        <button type="button" className="a-icon-btn a-sidebar__close" aria-label="Close navigation" onClick={onClose}><Icon name="close" size={19} /></button>
      </div>

      <nav className="a-nav" aria-label="Admin navigation">
        <p className="a-nav__label">Manage</p>
        {links.map(item)}

        {canSeeHR && (
          <>
            <p className="a-nav__label">People</p>
            <button
              type="button"
              className={`a-nav__link${isHrRoute ? ' is-active' : ''}`}
              aria-expanded={hrOpen}
              aria-controls="admin-hr-links"
              title={collapsed ? 'HR Department' : undefined}
              onClick={() => setHrOpen(!hrOpen)}
            >
              <Icon name="briefcase" size={19} /><span>HR Department</span><Icon name="chevron" size={16} className="a-nav__chev" />
            </button>
            <div id="admin-hr-links" className="a-nav__sub" hidden={!hrOpen}>
              {HR_LINKS.map((l) => (
                <Link key={l.href} href={l.href} aria-current={pathname.startsWith(l.href) ? 'page' : undefined} onClick={onClose}>{l.label}</Link>
              ))}
            </div>
          </>
        )}
      </nav>

      <div className="a-sidebar__foot">
        {role === 'super_admin' && item({ href: '/admin/settings', label: 'Settings', icon: 'settings' })}
        <a href="/" target="_blank" rel="noopener noreferrer" className="a-nav__link" title={collapsed ? 'View website' : undefined}>
          <Icon name="external" size={19} /><span>View website</span>
        </a>
        <button type="button" className="a-nav__link" onClick={onLogout} title={collapsed ? 'Sign out' : undefined}>
          <Icon name="logout" size={19} /><span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
