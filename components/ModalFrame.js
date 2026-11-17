'use client';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
export default function ModalFrame({ children, onClose, label, labelledBy, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = previousOverflow; previous?.focus(); };
  }, []);
  return createPortal(<dialog ref={ref} className={`rumbu-dialog ${className}`} aria-label={label} aria-labelledby={labelledBy} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose(); } }}>{children}</dialog>, document.body);
}
