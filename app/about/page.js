import Image from 'next/image';
import Reveal from '../../components/Reveal';
import PageHeader from '../../components/PageHeader';
import ContactCTA from '../../components/ContactCTA';
import Founder from '../../components/Founder';
import { about } from '../../lib/data';

export const metadata = { title: 'Our Story' };

// Facts drawn from the company history in lib/data.js.
const facts = [
  ['Founded', '2001, Kano'],
  ['Ownership', '100% indigenous Nigerian'],
  ['People', 'About 2,200 ground staff'],
  ['Revenue', 'Over $28 million (2020)'],
  ['Recognition', 'Bank of Industry Hall of Fame'],
];

const timeline = [
  ['2001', 'Where it began', 'Established in Kano as Rumbu Sacks Nigeria Limited, manufacturing polypropylene woven sacks.'],
  ['2015', 'A new chapter', 'Renamed Rumbu Industries Limited as our ambitions and product range continued to grow.'],
  ['Today', 'More possibilities', 'Expanding our capabilities in woven products, household goods, recycled materials and renewable energy.'],
];

export default function About() {
  const [opening, ...rest] = about;
  return (
    <>
      <PageHeader
        variant="ivory"
        label="Our story"
        title={<>A Nigerian vision.<br /><em>An African success story.</em></>}
        description="From our beginnings in Kano to a growing manufacturing group. Our ambition has always been to make things better."
      />

      <div className="panorama">
        <div className="container">
          <figure>
            <div className="panorama__media">
              <Image src="/products/factory-floor.jpg" alt="Rumbu’s polypropylene weaving hall in Kano" fill priority sizes="(max-width: 1376px) 100vw, 1280px" quality={82} />
            </div>
            <figcaption><span>Our weaving hall</span><span>Kano, Nigeria</span></figcaption>
          </figure>
        </div>
      </div>

      <section className="section section--white">
        <div className="container history">
          <aside className="history__aside">
            <div className="eyebrow">Since 2001</div>
            <h2 className="title-md">Built on purpose.<br />Growing with possibility.</h2>
            <dl className="fact-list">
              {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          </aside>
          <div className="history__body prose">
            <Reveal><p className="history__opening">{opening}</p></Reveal>
            {rest.map((para, i) => <Reveal key={i}><p>{para}</p></Reveal>)}
          </div>
        </div>
      </section>

      <section className="section section--deep">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Milestones that shaped us</div>
              <h2 className="title-lg">A story of <em>moving forward.</em></h2>
            </div>
          </div>
          <ol className="timeline">
            {timeline.map(([year, title, text], i) => (
              <li key={year}>
                <Reveal delay={i + 1}>
                  <span className="timeline__year">{year}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--white">
        <div className="container"><Founder /></div>
      </section>

      <ContactCTA />
    </>
  );
}
