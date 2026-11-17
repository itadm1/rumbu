import Link from 'next/link';
import PageHeader from '../../components/PageHeader';
import ContactCTA from '../../components/ContactCTA';
import Reveal from '../../components/Reveal';
import Icon from '../../components/Icon';
import { services, clientList } from '../../lib/data';

export const metadata = { title: 'Our Services' };

const extras = [
  { kicker: 'Strength in every sack', tags: ['Packaging', 'Agriculture', 'Industrial use'] },
  { kicker: 'Powering a better future', tags: ['Hybrid solar', 'Clean energy', 'Sustainability'] },
];

export default function Services() {
  return (
    <>
      <PageHeader
        variant="split"
        label="Our services"
        title={<>Beyond manufacturing.<br /><em>More possibilities.</em></>}
        description="Reliable packaging. Cleaner energy. Practical solutions that support industries and move us forward."
      />
      <section className="section section--white">
        <div className="container features">
          {services.map((s, i) => (
            <Reveal key={s.name}>
              <article className={`feature${i % 2 ? ' feature--flip' : ''}`}>
                <figure className="frame feature__media">
                  <div className="frame__media"><img src={s.img} alt={s.name} loading="lazy" decoding="async" /></div>
                  <figcaption className="frame__caption"><span>{s.name}</span><span>0{i + 1}</span></figcaption>
                </figure>
                <div className="feature__copy">
                  <span className="feature__index" aria-hidden="true">0{i + 1}</span>
                  <div className="eyebrow">{extras[i]?.kicker}</div>
                  <h2 className="title-lg">{s.name}</h2>
                  <p className="lead">{s.desc}</p>
                  <ul className="tag-list">{(extras[i]?.tags || []).map((t) => <li className="tag" key={t}>{t}</li>)}</ul>
                  {s.link
                    ? <a href={s.link} target="_blank" rel="noopener noreferrer" className="link-arrow">Explore our energy partnership with {s.linkLabel} <Icon name="external" size={17} /></a>
                    : <Link href={`/contact?product=${encodeURIComponent(s.name)}`} className="link-arrow">Discuss your packaging needs <Icon name="diagonal" size={18} /></Link>}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="section section--deep section--tight">
        <div className="container clients-band">
          <div>
            <div className="eyebrow">Who we serve</div>
            <h2 className="title-md">Trusted by public bodies and international organisations.</h2>
          </div>
          <ul>{clientList.map((c) => <li key={c}><Icon name="check" size={18} /> {c}</li>)}</ul>
        </div>
      </section>
      <ContactCTA title={<>A solution starts with <em>your needs.</em></>} />
    </>
  );
}
