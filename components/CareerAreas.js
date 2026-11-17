import Reveal from './Reveal';
import Icon from './Icon';
import { careerAreas } from '../lib/data';

// One icon per career area, in the order the areas appear in lib/data.js.
const icons = ['factory', 'gear', 'shield', 'flask', 'truck', 'sun', 'monitor', 'spark', 'chart'];

export default function CareerAreas() {
  return (
    <section className="section section--white">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">Find your direction</div>
            <h2 className="title-lg">Many talents. <em>One shared ambition.</em></h2>
          </div>
          <p className="lead">From the factory floor to research and digital systems, discover the fields that make Rumbu work.</p>
        </div>
        <ul className="career-fields">
          {careerAreas.map((a, i) => (
            <li key={a.title}>
              <Reveal delay={(i % 3) + 1}>
                <div className="career-field">
                  <div className="career-field__top">
                    <span className="career-field__icon"><Icon name={icons[i % icons.length]} size={24} /></span>
                    <span className="career-field__num">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3>{a.title}</h3>
                  <p>{a.desc}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
