'use client';

import { useState } from 'react';
import Reveal from './Reveal';
import ModalFrame from './ModalFrame';
import Icon from './Icon';
import { team } from '../lib/data';
import { socialIcons, socialOrder } from './socialIcons';

const ceo = team.find((t) => t.rank === 'ceo');
const eds = team.filter((t) => t.rank === 'ed');
const execs = team.filter((t) => t.rank === 'exec');

function initialsOf(name) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function Photo({ person, className }) {
  const [broken, setBroken] = useState(false);
  if (!person.img || broken) {
    return <div className={`${className} initials`} role="img" aria-label={person.name}>{initialsOf(person.name)}</div>;
  }
  return <img className={className} src={person.img} alt={person.name} width="200" height="200" loading="lazy" decoding="async" onError={() => setBroken(true)} />;
}

function Socials({ person }) {
  const links = socialOrder.filter((key) => person.social?.[key] && person.social[key] !== '#');
  if (links.length === 0) return null;
  return (
    <div className="social-links">
      {links.map((key) => (
        <a key={key} href={person.social[key]} target="_blank" rel="noopener noreferrer" aria-label={`${person.name} on ${key}`}>
          {socialIcons[key]}
        </a>
      ))}
    </div>
  );
}

const hasProfile = (p) => Boolean(p.bio || p.fullBio);

// Defined at module level so cards keep their identity between renders;
// focus can then return to the card that opened the profile dialog.
function Card({ person, tier, onOpen }) {
  const inner = (
    <>
      <span className="org-card__photo"><Photo person={person} className="org-card__img" /></span>
      <span className="org-card__role">{person.role}</span>
      <span className="org-card__name">{person.name}</span>
      {hasProfile(person) && <span className="org-card__more">View profile <Icon name="diagonal" size={14} /></span>}
    </>
  );
  return hasProfile(person)
    ? <button type="button" className={`org-card org-card--${tier}`} onClick={() => onOpen(person)} aria-haspopup="dialog">{inner}</button>
    : <div className={`org-card org-card--${tier}`}>{inner}</div>;
}

export default function OrgChart() {
  const [active, setActive] = useState(null);
  return (
    <div className="org-chart">
      {ceo && (
        <Reveal variant="scale">
          <div className="org-row"><Card person={ceo} tier="lead" onOpen={setActive} /></div>
        </Reveal>
      )}

      {eds.length > 0 && (
        <>
          <div className="org-connector" aria-hidden="true" />
          <div className="org-row">
            {eds.map((p, i) => (
              <Reveal key={p.name} delay={(i % 3) + 1} variant="scale"><Card person={p} tier="ed" onOpen={setActive} /></Reveal>
            ))}
          </div>
        </>
      )}

      {execs.length > 0 && (
        <>
          <div className="org-connector" aria-hidden="true" />
          <div className="org-row">
            {execs.map((p, i) => (
              <Reveal key={p.name} delay={(i % 2) + 1} variant="scale"><Card person={p} tier="exec" onOpen={setActive} /></Reveal>
            ))}
          </div>
        </>
      )}

      {active && (
        <ModalFrame onClose={() => setActive(null)} labelledBy="profile-name" className="profile-dialog">
          <button type="button" className="dialog-close" onClick={() => setActive(null)} aria-label="Close profile"><Icon name="close" size={20} /></button>
          <div className="profile">
            <div className="profile__photo"><Photo person={active} className="profile__img" /></div>
            <div className="profile__body">
              <div className="eyebrow">{active.role}</div>
              <h3 id="profile-name" className="title-md">{active.name}</h3>
              <p>{active.fullBio || active.bio}</p>
              <Socials person={active} />
            </div>
          </div>
        </ModalFrame>
      )}
    </div>
  );
}
