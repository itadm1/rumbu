'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Icon from './Icon';

// Workspace-wide feedback: toasts and a confirmation dialog.
// Replaces the browser's alert() and confirm() so feedback matches the
// interface, is announced to screen readers and never blocks the page.
const AdminUIContext = createContext({
  toast: (message) => { if (typeof window !== 'undefined') window.alert(message); },
  confirm: async ({ message }) => (typeof window !== 'undefined' ? window.confirm(message) : false),
});

export const useAdminUI = () => useContext(AdminUIContext);

let nextId = 1;

export function AdminUIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [ask, setAsk] = useState(null);
  const dialog = useRef(null);
  const resolver = useRef(null);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const toast = useCallback((message, type = 'info') => {
    const id = nextId++;
    setToasts((list) => [...list.slice(-3), { id, message: String(message), type }]);
    // Errors stay longer so they can be read.
    setTimeout(() => dismiss(id), type === 'error' ? 9000 : 5000);
  }, [dismiss]);

  const confirm = useCallback((options) => new Promise((resolve) => {
    resolver.current = resolve;
    setAsk({ title: 'Please confirm', confirmLabel: 'Confirm', cancelLabel: 'Cancel', danger: false, ...options });
  }), []);

  const settle = useCallback((value) => {
    resolver.current?.(value);
    resolver.current = null;
    setAsk(null);
  }, []);

  useEffect(() => {
    const el = dialog.current;
    if (ask && el && !el.open) el.showModal();
    if (!ask && el?.open) el.close();
  }, [ask]);

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);

  return (
    <AdminUIContext.Provider value={value}>
      {children}

      <dialog
        ref={dialog}
        className="a-dialog"
        aria-labelledby="a-dialog-title"
        aria-describedby="a-dialog-text"
        onCancel={(e) => { e.preventDefault(); settle(false); }}
        onClick={(e) => { if (e.target === e.currentTarget) settle(false); }}
      >
        {ask && (
          <div className="a-dialog__inner">
            <span className={`a-dialog__icon${ask.danger ? ' danger' : ''}`}><Icon name="alert" size={22} /></span>
            <h2 id="a-dialog-title">{ask.title}</h2>
            <p id="a-dialog-text">{ask.message}</p>
            <div className="a-dialog__actions">
              <button type="button" className="a-btn ghost" onClick={() => settle(false)} autoFocus>{ask.cancelLabel}</button>
              <button type="button" className={`a-btn ${ask.danger ? 'danger solid' : 'gold'}`} onClick={() => settle(true)}>{ask.confirmLabel}</button>
            </div>
          </div>
        )}
      </dialog>

      <div className="a-toasts" role="region" aria-label="Notifications">
        {toasts.map((t) => (
          <div key={t.id} className={`a-toast ${t.type}`} role={t.type === 'error' ? 'alert' : 'status'}>
            <Icon name={t.type === 'error' ? 'alert' : 'check'} size={18} />
            <span>{t.message}</span>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss notification"><Icon name="close" size={16} /></button>
          </div>
        ))}
      </div>
    </AdminUIContext.Provider>
  );
}
