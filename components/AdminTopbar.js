'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { ThemeToggle } from './AdminTheme';
import { roleLabel } from './AdminSidebar';

// Titles for the breadcrumb trail. Only routes that exist are listed.
const TITLES = {
  '/admin': 'Dashboard',
  '/admin/home': 'Front page',
  '/admin/news': 'News',
  '/admin/jobs': 'Job adverts',
  '/admin/applications': 'Applications',
  '/admin/messages': 'Messages',
  '/admin/users': 'Users',
  '/admin/settings': 'Settings',
  '/admin/hr/applicants': 'Applicants',
  '/admin/hr/interview-sessions': 'Interview sessions',
  '/admin/hr/selected': 'Selected',
};

function initials(profile) {
  const source = profile?.full_name || profile?.email || 'A';
  return source.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function AdminTopbar({ profile, pathname, onMenu, onCollapse, collapsed, onLogout, menuRef }) {
  const [open, setOpen] = useState(false);
  const account = useRef(null);
  const title = TITLES[pathname] || 'Workspace';
  const inHr = pathname.startsWith('/admin/hr');

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); account.current?.querySelector('button')?.focus(); } };
    const outside = (e) => { if (!account.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', outside); };
  }, [open]);

  return (
    <header className="a-topbar">
      <button ref={menuRef} type="button" className="a-icon-btn a-topbar__menu" aria-label="Open navigation" aria-controls="admin-sidebar" onClick={onMenu}><Icon name="menu" size={20} /></button>
      <button type="button" className="a-icon-btn a-topbar__collapse" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-pressed={collapsed} aria-controls="admin-sidebar" onClick={onCollapse}><Icon name="panel" size={19} /></button>

      <nav className="a-crumbs" aria-label="Breadcrumb">
        {pathname === '/admin' ? (
          <span aria-current="page">Dashboard</span>
        ) : (
          <>
            <Link href="/admin">Dashboard</Link>
            <Icon name="chevronRight" size={14} />
            {inHr && <><span>HR Department</span><Icon name="chevronRight" size={14} /></>}
            <span aria-current="page">{title}</span>
          </>
        )}
      </nav>

      <div className="a-topbar__actions">
        <ThemeToggle />
        <div className="a-account" ref={account}>
          <button type="button" className="a-account__btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" className="a-avatar" />
              : <span className="a-avatar" aria-hidden="true">{initials(profile)}</span>}
            <span className="a-account__text">
              <strong>{profile?.full_name || profile?.email || 'Admin'}</strong>
              <small>{roleLabel(profile?.role)}</small>
            </span>
            <Icon name="chevron" size={16} />
          </button>
          {open && (
            <div className="a-menu" role="menu">
              <div className="a-menu__who">
                <strong>{profile?.full_name || 'Signed in'}</strong>
                <small>{profile?.email}</small>
              </div>
              {profile?.role === 'super_admin' && <Link role="menuitem" href="/admin/settings"><Icon name="settings" size={17} /> Settings</Link>}
              <a role="menuitem" href="/" target="_blank" rel="noopener noreferrer"><Icon name="external" size={17} /> View website</a>
              <button role="menuitem" type="button" onClick={onLogout}><Icon name="logout" size={17} /> Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
