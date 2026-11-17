import { team, company } from '../lib/data';
import { socialIcons, socialOrder } from './socialIcons';

// Founder is the team member with rank 'founder'.
const founder = team.find((t) => t.rank === 'founder') || team[0];
const bio = founder.fullBio || founder.bio;
// Only real profile links are shown; '#' placeholders are skipped.
const links = socialOrder.filter((k) => founder.social?.[k] && founder.social[k] !== '#');

export default function Founder() {
  return (
    <div className="founder">
      <figure className="frame founder__photo">
        <div className="frame__media"><img src={founder.img} alt={founder.name} width="200" height="200" loading="lazy" decoding="async" /></div>
        <figcaption className="frame__caption"><span>Founder</span><span>Est. {company.founded}</span></figcaption>
      </figure>
      <div className="founder__body">
        <div className="eyebrow">The vision behind Rumbu</div>
        <h2 className="title-lg">{founder.name}</h2>
        <p className="founder__role">Founder, {company.short}</p>
        <p className="lead">{bio}</p>
        {links.length > 0 && (
          <div className="social-links">
            {links.map((k) => (
              <a key={k} href={founder.social[k]} target="_blank" rel="noopener noreferrer" aria-label={`${founder.name} on ${k}`}>{socialIcons[k]}</a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
