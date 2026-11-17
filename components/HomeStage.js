'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import HomeArt from './HomeArt';
import Icon from './Icon';
import { company } from '../lib/data';

// The front page: one screen, no long scroll. Each product is a full-height
// picture panel. Pointing at, focusing or tapping a panel opens it.
// The words and pictures come from the workspace (Front page).
export default function HomeStage({ content }) {
  const { headline, intro, panels } = content;
  const [active, setActive] = useState(0);
  const waterRef = useRef(null);

  // The water light is drawn small and stretched to fill the screen. That
  // keeps it soft and cheap to draw, on phones too. It stays still for
  // visitors who have asked their device for less motion.
  useEffect(() => {
    const svg = waterRef.current;
    if (!svg) return undefined;
    const stage = svg.parentElement;
    const fit = () => {
      svg.style.transform = `scale(${stage.clientWidth / 480}, ${stage.clientHeight / 270})`;
    };
    fit();
    window.addEventListener('resize', fit);
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    const applyMotion = () => {
      try {
        if (still.matches) svg.pauseAnimations(); else svg.unpauseAnimations();
      } catch {
        // Older browsers: the light simply stays as drawn.
      }
    };
    applyMotion();
    still.addEventListener?.('change', applyMotion);
    return () => {
      window.removeEventListener('resize', fit);
      still.removeEventListener?.('change', applyMotion);
    };
  }, []);

  const tel = `tel:${company.phone1.replace(/ /g, '')}`;

  return (
    <section className="stage" aria-labelledby="stage-title">
      <ul className="stage__panels">
        {panels.map((p, i) => (
          <li
            key={`${p.title}-${i}`}
            className="stage-panel"
            data-on={i === active ? 'true' : 'false'}
            data-art={p.image ? 'photo' : p.art}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
          >
            <div className="stage-panel__bg">
              {p.image ? <img src={p.image} alt="" decoding="async" /> : <HomeArt kind={p.art} />}
            </div>
            <div className="stage-panel__body">
              <h2 className="stage-panel__title">{p.title}</h2>
              <div className="stage-panel__more">
                {p.text && <p>{p.text}</p>}
                <Link href={p.href} className="btn btn-gold btn--auto">{p.cta} <Icon name="arrow" size={18} /></Link>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <svg ref={waterRef} className="stage__water" width="480" height="270" viewBox="0 0 480 270" aria-hidden="true" focusable="false">
        <filter id="stage-water" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          {/* Thin bright veins, like sunlight on the floor of a pool. */}
          <feTurbulence type="turbulence" baseFrequency="0.011 0.019" numOctaves="1" seed="8">
            <animate attributeName="baseFrequency" dur="28s" values="0.011 0.019;0.015 0.014;0.011 0.019" repeatCount="indefinite" />
          </feTurbulence>
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -11 0 0 0 1.05" />
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
        <rect width="480" height="270" filter="url(#stage-water)" />
      </svg>

      <div className="stage__intro">
        <h1 id="stage-title">{headline}</h1>
        {intro && <p>{intro}</p>}
      </div>

      <div className="stage__foot">
        <span className="stage__where">{company.address.replace(/\.$/, '')}</span>
        <nav aria-label="More on this website">
          <Link href="/products">All products</Link>
          <Link href="/about">Our story</Link>
          <Link href="/contact">Contact us</Link>
          <a href={tel}>{company.phone1}</a>
        </nav>
      </div>
    </section>
  );
}
