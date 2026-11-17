import Link from 'next/link';
import PageHeader from '../../components/PageHeader';
import ContactCTA from '../../components/ContactCTA';
import Reveal from '../../components/Reveal';
import Icon from '../../components/Icon';
import { research } from '../../lib/data';

export const metadata = { title: 'Innovation & Research' };

const icons = ['flask', 'gear', 'sun', 'leaf', 'spark'];

export default function Research() {
  return (
    <>
      <PageHeader
        variant="split"
        label="Research & development"
        title={<>Curiosity drives <em>progress.</em></>}
        description="Better materials. Smarter processes. A more sustainable future for manufacturing."
      />
      <section className="section section--white">
        <div className="container research">
          <aside className="research__intro">
            <div className="eyebrow">Our focus</div>
            <h2 className="title-lg">Innovation across <em>{research.areas.length} fields.</em></h2>
            <p className="lead">{research.intro}</p>
            <Link href="/careers" className="link-arrow">Join our research team <Icon name="diagonal" size={18} /></Link>
          </aside>
          <ol className="index-list">
            {research.areas.map((a, i) => (
              <li key={a.title}>
                <Reveal delay={(i % 3) + 1}>
                  <div className="index-list__item">
                    <span className="index-list__num">0{i + 1}</span>
                    <div>
                      <h3>{a.title}</h3>
                      <p>{a.desc}</p>
                    </div>
                    <span className="index-list__icon" aria-hidden="true"><Icon name={icons[i % icons.length]} size={24} /></span>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <ContactCTA />
    </>
  );
}
