import Link from 'next/link';
import Icon from './Icon';
import { company } from '../lib/data';

export default function ContactCTA({
  title = <>Good things start with <em>a conversation.</em></>,
  description = 'Tell us what you need. Let’s find the right product, solution or partnership for you.',
}) {
  return (
    <section className="cta-band on-dark weave">
      <div className="container cta-band__inner">
        <div>
          <div className="eyebrow">Build with Rumbu</div>
          <h2 className="title-lg">{title}</h2>
        </div>
        <div className="cta-band__action">
          <p className="lead">{description}</p>
          <div className="btn-row">
            <Link href="/contact" className="btn btn-gold">Get in touch <Icon name="diagonal" size={18} /></Link>
            <a href={`tel:${company.phone1.replace(/ /g, '')}`} className="link-arrow"><Icon name="phone" size={17} /> {company.phone1}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
