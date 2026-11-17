'use client';

import { useRef, useEffect, useState } from 'react';

export default function Reveal({ children, className = '', delay = 0, variant = 'up' }) {
  const ref = useRef(null);
  // Content remains visible in server-rendered HTML and without JavaScript.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window.IntersectionObserver !== 'function') {
      setVisible(true);
      return;
    }

    const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (motion?.matches) {
      setVisible(true);
      return;
    }

    // Only prepare content below the viewport. Anything already visible (or
    // previously passed) keeps its position and appearance during hydration.
    if (el.getBoundingClientRect().top < window.innerHeight) {
      setVisible(true);
      return;
    }

    setVisible(false);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);

    const onMotionChange = (event) => {
      if (event.matches) {
        observer.disconnect();
        setVisible(true);
      }
    };
    motion?.addEventListener?.('change', onMotionChange);

    return () => {
      observer.disconnect();
      motion?.removeEventListener?.('change', onMotionChange);
    };
  }, []);

  const dcls = delay ? ` d${delay}` : '';
  const vcls = variant !== 'up' ? ` reveal-${variant}` : '';

  return (
    <div ref={ref} className={`reveal${dcls}${vcls} ${visible ? 'visible' : ''} ${className}`}>
      {children}
    </div>
  );
}
