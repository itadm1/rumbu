'use client';

import { useState, useEffect, useCallback } from 'react';
import { exhibitions } from '../lib/data';
import ModalFrame from './ModalFrame';
import Icon from './Icon';

// Flatten every photo across events for lightbox navigation.
const allPhotos = exhibitions.flatMap((ex) =>
  ex.photos.map((p) => ({ ...p, event: ex.event, place: ex.place }))
);

export default function ExhibitionGallery() {
  const [lightbox, setLightbox] = useState(null);

  const close = useCallback(() => setLightbox(null), []);
  const move = useCallback((dir) => {
    setLightbox((i) => (i === null ? i : (i + dir + allPhotos.length) % allPhotos.length));
  }, []);

  useEffect(() => {
    if (lightbox === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowLeft') move(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightbox, move]);

  let flatIndex = -1;
  const active = lightbox !== null ? allPhotos[lightbox] : null;

  return (
    <>
      <div className="events">
        {exhibitions.map((ex) => (
          <article className="event" key={ex.event}>
            <header className="event__meta">
              <span className="event__year">{ex.year}</span>
              <h2 className="title-md">{ex.event}</h2>
              <p className="event__place"><Icon name="pin" size={16} /> {ex.place}</p>
              {ex.note && <p className="muted">{ex.note}</p>}
              <p className="event__count">{ex.photos.length} photograph{ex.photos.length === 1 ? '' : 's'}</p>
            </header>
            <ul className="event__photos">
              {ex.photos.map((p) => {
                flatIndex += 1;
                const idx = flatIndex;
                return (
                  <li key={idx}>
                    <button type="button" className="photo-tile" onClick={() => setLightbox(idx)} aria-label={`View photo: ${p.caption}`}>
                      <span className="photo-tile__media">
                        <img src={p.img} alt="" loading="lazy" decoding="async" />
                        <span className="photo-tile__zoom" aria-hidden="true"><Icon name="expand" size={18} /></span>
                      </span>
                      <span className="photo-tile__caption">{p.caption}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>

      {active && (
        <ModalFrame onClose={close} label="Exhibition photo viewer" className="lightbox">
          <button type="button" className="dialog-close" onClick={close} aria-label="Close photo viewer"><Icon name="close" size={20} /></button>
          <div className="lightbox__stage">
            <button type="button" className="lightbox__nav" onClick={() => move(-1)} aria-label="Previous photo"><Icon name="chevronLeft" size={22} /></button>
            <img src={active.img} alt={active.caption} />
            <button type="button" className="lightbox__nav" onClick={() => move(1)} aria-label="Next photo"><Icon name="chevronRight" size={22} /></button>
          </div>
          <div className="lightbox__caption" aria-live="polite">
            <span>Photo {lightbox + 1} of {allPhotos.length}</span>
            <strong>{active.event} · {active.place}</strong>
            <p>{active.caption}</p>
          </div>
        </ModalFrame>
      )}
    </>
  );
}
