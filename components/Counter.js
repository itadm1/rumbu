'use client';

import { useRef, useEffect, useState } from 'react';

// Parses a display string like "8 mil", "2,873", "20+" into a number to
// animate, preserving prefix/suffix text around it.
function parse(display) {
  const match = display.match(/([\d.,]+)/);
  if (!match) return { target: 0, pre: '', post: display };
  const numStr = match[1];
  const target = parseFloat(numStr.replace(/,/g, ''));
  const idx = display.indexOf(numStr);
  return {
    target,
    hasComma: numStr.includes(','),
    pre: display.slice(0, idx),
    post: display.slice(idx + numStr.length),
  };
}

// The real figure is in the page from the first byte, so search engines, link
// previews and visitors without JavaScript all read it. The count-up is an
// enhancement that runs once, when the figure scrolls into view. Screen
// readers always get the final figure, never the numbers in between.
export default function Counter({ display }) {
  const ref = useRef(null);
  const { target, pre, post, hasComma } = parse(display);
  const [val, setVal] = useState(target);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(el);
        const dur = 1400;
        const start = performance.now();
        const tick = (now) => {
          // The frame time can be a hair earlier than `start`, so clamp at 0:
          // the figure must never dip below zero.
          const p = Math.min(Math.max((now - start) / dur, 0), 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(target * eased);
          if (p < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [target]);

  const rounded = Math.round(val);
  const shown = hasComma ? rounded.toLocaleString('en-US') : String(rounded);

  return (
    <span ref={ref}>
      <span className="sr-only">{display}</span>
      <span aria-hidden="true">{pre}{shown}{post}</span>
    </span>
  );
}
