'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import { AdminUIProvider } from './AdminUI';
import { createSupabaseBrowser } from '../lib/supabaseBrowser';

const COLLAPSE_KEY = 'rumbu-admin-sidebar';

// Progressive enhancements applied to whatever the current page renders:
//  1. Tables: each cell gets a data-label from its column heading, which lets
//     the stylesheet turn rows into readable cards on small screens.
//  2. Modals built with .modal-backdrop/.modal-panel get dialog semantics
//     and receive focus when they open.
function enhance(root) {
  root.querySelectorAll('table.admin-table').forEach((table) => {
    const heads = [...table.querySelectorAll('thead th')].map((th) => th.textContent.trim());
    table.querySelectorAll('tbody tr').forEach((tr) => {
      [...tr.children].forEach((td, i) => {
        const label = heads[i] || '';
        if (td.getAttribute('data-label') !== label) td.setAttribute('data-label', label);
      });
    });
  });
  root.querySelectorAll('.modal-panel:not([role])').forEach((panel) => {
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('tabindex', '-1');
    const heading = panel.querySelector('.modal-header h2, .modal-header h3, .modal-header strong');
    if (heading) panel.setAttribute('aria-label', heading.textContent.trim());
    panel.focus({ preventScroll: true });
  });
}

export default function AdminShell({ profile, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebar = useRef(null);
  const menuButton = useRef(null);
  const main = useRef(null);

  useEffect(() => {
    try { setCollapsed(localStorage.getItem(COLLAPSE_KEY) === 'collapsed'); } catch { /* default: expanded */ }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try { localStorage.setItem(COLLAPSE_KEY, c ? 'expanded' : 'collapsed'); } catch { /* not persisted */ }
      return !c;
    });
  };

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Mobile drawer: lock scroll, trap focus, close on Escape.
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sidebar.current?.querySelector('a, button')?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') { setMobileOpen(false); menuButton.current?.focus(); }
      if (e.key === 'Tab') {
        const items = [...sidebar.current.querySelectorAll('a, button')].filter((el) => el.getClientRects().length);
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', onKey); };
  }, [mobileOpen]);

  // Enhance tables and modals, now and whenever the page content changes.
  useEffect(() => {
    const root = main.current;
    if (!root) return undefined;
    let frame = 0;
    const run = () => { frame = 0; enhance(root); };
    run();
    const observer = new MutationObserver(() => { if (!frame) frame = requestAnimationFrame(run); });
    observer.observe(root, { childList: true, subtree: true });
    // Escape closes an open page modal by using its own backdrop handler.
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      const backdrops = root.querySelectorAll('.modal-backdrop');
      backdrops[backdrops.length - 1]?.click();
    };
    document.addEventListener('keydown', onKey);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); document.removeEventListener('keydown', onKey); };
  }, [pathname]);

  const logout = async () => {
    try {
      await createSupabaseBrowser().auth.signOut();
    } catch {
      // Even if sign-out cannot reach Supabase, leave the workspace.
    }
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <AdminUIProvider>
      <div className="a-shell" data-collapsed={collapsed}>
        <a href="#admin-main" className="a-skip">Skip to content</a>
        {mobileOpen && <div className="a-scrim" onClick={closeMobile} aria-hidden="true" />}
        <AdminSidebar profile={profile} pathname={pathname} collapsed={collapsed} mobileOpen={mobileOpen} onClose={closeMobile} onLogout={logout} sidebarRef={sidebar} />
        <div className="a-main">
          <AdminTopbar profile={profile} pathname={pathname} collapsed={collapsed} onCollapse={toggleCollapsed} onMenu={() => setMobileOpen(true)} onLogout={logout} menuRef={menuButton} />
          <main id="admin-main" ref={main} className="a-content" tabIndex={-1}>{children}</main>
        </div>
      </div>
    </AdminUIProvider>
  );
}
