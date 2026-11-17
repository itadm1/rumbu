'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

const collections = [
  {
    id: 'woven',
    label: 'Woven mats',
    category: 'Comfort, beautifully woven',
    title: <>Woven into<br /><em>everyday life.</em></>,
    word: 'WOVEN',
    description: 'Colour. Texture. A place to come together. Discover polypropylene woven mats made for the moments that matter.',
    detail: 'A little colour. A lot of possibility.',
    image: '/showcase/woven-mats-art.png',
    alt: 'Illustrative arrangement of colourful polypropylene woven mats, rolled and folded to show their texture',
    href: '/products/polypropylene-woven-mats',
    tags: ['Polypropylene', 'Woven in Kano'],
  },
  {
    id: 'twine',
    label: 'Twine ropes',
    category: 'Small threads. Big possibilities.',
    title: <>Strength in<br /><em>every strand.</em></>,
    word: 'TWISTED',
    description: 'For building, bundling and the work of everyday life. Our polypropylene twisted twine connects strength with versatility.',
    detail: 'Made to keep things moving.',
    image: '/showcase/twine-art.png',
    alt: 'Illustrative floating composition of polypropylene twine balls and looping ropes',
    href: '/products/pp-twisted-twine-ropes',
    tags: ['PP twisted twine', 'Everyday versatility'],
  },
  {
    id: 'custom',
    label: 'Custom creations',
    category: 'Your idea. Our craft.',
    title: <>Your vision.<br /><em>Our weave.</em></>,
    word: 'YOURS',
    description: 'Make your mark with customised woven mats. We bring your designs and specifications to life through Jacquard weaving.',
    detail: 'Made personal. Woven with purpose.',
    image: '/showcase/custom-mats-art.png',
    alt: 'Concept illustration of patterned woven mats showing possibilities for custom designs',
    href: '/products/customised-woven-mats',
    tags: ['Custom designs', 'Jacquard weaving'],
  },
];

export default function ProductExperience() {
  const [active, setActive] = useState(0);
  const root = useRef(null);
  const stage = useRef(null);
  const activeRef = useRef(0);
  const motion = useRef(false);
  const touchStart = useRef(null);
  const scene = collections[active];

  useEffect(() => {
    const element = root.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 1001px) and (min-height: 700px)');
    let scrollFrame = 0;
    let resizeFrame = 0;

    const update = () => {
      scrollFrame = 0;
      motion.current = !reduced.matches;
      element.dataset.motion = reduced.matches ? 'reduced' : 'full';
      if (!desktop.matches || reduced.matches) return;
      const box = element.getBoundingClientRect();
      const travel = element.offsetHeight - stage.current.offsetHeight;
      const header = document.querySelector('.site-header')?.offsetHeight || 0;
      const progress = Math.max(0, Math.min(1, (header - box.top) / Math.max(1, travel)));
      const next = Math.min(collections.length - 1, Math.round(progress * (collections.length - 1)));
      element.style.setProperty('--journey-progress', String(progress));
      if (activeRef.current !== next) {
        activeRef.current = next;
        setActive(next);
      }
    };
    const onScroll = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(update); };
    const onResize = () => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    reduced.addEventListener('change', onResize);
    desktop.addEventListener('change', onResize);
    const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(([entry]) => {
      element.dataset.inView = entry.isIntersecting ? 'true' : 'false';
    }) : null;
    observer?.observe(element);
    return () => {
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      reduced.removeEventListener('change', onResize);
      desktop.removeEventListener('change', onResize);
      observer?.disconnect();
    };
  }, []);

  const select = (index) => {
    const next = Math.max(0, Math.min(collections.length - 1, index));
    if (window.matchMedia('(min-width: 1001px) and (min-height: 700px)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const element = root.current;
      const header = document.querySelector('.site-header')?.offsetHeight || 0;
      const top = window.scrollY + element.getBoundingClientRect().top - header;
      const travel = element.offsetHeight - stage.current.offsetHeight;
      window.scrollTo({ top: top + (travel * next / (collections.length - 1)), behavior: 'smooth' });
    } else {
      activeRef.current = next;
      setActive(next);
    }
  };

  const onPointerMove = (event) => {
    if (!motion.current || event.pointerType !== 'mouse') return;
    const box = stage.current.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    stage.current.style.setProperty('--art-x', `${x * 20}px`);
    stage.current.style.setProperty('--art-y', `${y * 14}px`);
    stage.current.style.setProperty('--art-rotate', `${x * 3}deg`);
  };

  return (
    <section ref={root} className="product-experience" aria-label="Discover Rumbu products">
      <div
        ref={stage}
        className={`experience-stage theme-${scene.id}`}
        onPointerMove={onPointerMove}
        onPointerLeave={() => {
          stage.current.style.setProperty('--art-x', '0px');
          stage.current.style.setProperty('--art-y', '0px');
          stage.current.style.setProperty('--art-rotate', '0deg');
        }}
        onTouchStart={(e) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
        onTouchEnd={(e) => {
          if (!touchStart.current) return;
          const dx = e.changedTouches[0].clientX - touchStart.current.x;
          const dy = e.changedTouches[0].clientY - touchStart.current.y;
          if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5) select(active + (dx < 0 ? 1 : -1));
          touchStart.current = null;
        }}
      >
        <div className="experience-grain" aria-hidden="true" />
        <noscript><style>{`.collection-picker, .experience-pagination { display: none !important; }`}</style></noscript>
        <div className="experience-topline container">
          <span className="experience-kicker"><span /> THE ART OF EVERYDAY</span>
          <div className="collection-picker" role="group" aria-label="Choose a product collection">
            {collections.map((item, index) => (
              <button key={item.id} type="button" aria-pressed={active === index} onClick={() => select(index)}>
                <span className="picker-number">0{index + 1}</span>{item.label}
              </button>
            ))}
          </div>
          <span className="experience-origin">MADE IN NIGERIA <span>↗</span></span>
        </div>

        <div className="experience-main container">
          <div className="experience-word" aria-hidden="true" key={`word-${scene.id}`}>{scene.word}</div>
          <div className="experience-art" aria-hidden="true">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-glow" />
            <div className="art-strands">
              {Array.from({ length: 6 }, (_, i) => <span key={i} style={{ '--strand': i }} />)}
            </div>
            <div className="art-parallax">
              {collections.map((item, index) => (
                <div key={item.id} className={`art-product art-product-${item.id} ${active === index ? 'is-active' : ''}`}>
                  <Image
                    src={item.image}
                    alt=""
                    width={1254}
                    height={1254}
                    sizes="(max-width: 620px) 100vw, 70vw"
                    priority={index === 0}
                    loading={index === 0 ? undefined : 'eager'}
                    quality={85}
                    draggable="false"
                  />
                </div>
              ))}
            </div>
            <span className="art-coordinate art-coordinate-one">{scene.tags[0]}<i /></span>
            <span className="art-coordinate art-coordinate-two"><i /> {scene.detail}</span>
          </div>

          <div className="experience-copy" key={`copy-${scene.id}`}>
            <span className="experience-eyebrow">0{active + 1} / {scene.category}</span>
            <h1>{scene.title}</h1>
            <p>{scene.description}</p>
            <Link href={scene.href} className="experience-cta">Explore {active === 2 ? 'custom mats' : scene.label.toLowerCase()} <Icon name="diagonal" size={19} /></Link>
            <div className="experience-tags">{scene.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
          </div>

          <div className="experience-art-caption">PRODUCT ILLUSTRATION<em> <span>·</span> EXPLORE OUR ACTUAL RANGE BELOW</em></div>
        </div>

        <div className="experience-bottom container">
          <a href="#our-story" className="experience-scroll"><span className="scroll-capsule"><span /></span><span>Scroll to discover<br /><strong>A world of possibilities</strong></span></a>
          <div className="experience-pagination">
            <button type="button" aria-label="Previous product collection" disabled={active === 0} onClick={() => select(active - 1)}><Icon name="arrow" size={17} /></button>
            <span><strong>0{active + 1}</strong><i />0{collections.length}</span>
            <button type="button" aria-label="Next product collection" disabled={active === collections.length - 1} onClick={() => select(active + 1)}><Icon name="arrow" size={17} /></button>
          </div>
          <a href="/rumbu-product-catalogue.pdf" download className="experience-catalogue">The Rumbu catalogue <Icon name="download" size={16} /></a>
        </div>
        <div className="experience-progress" aria-hidden="true">{collections.map((item, i) => <span key={item.id} className={i <= active ? 'complete' : ''} />)}</div>
      </div>
    </section>
  );
}
