import PageHeader from '../../components/PageHeader';
import ContactForm from '../../components/ContactForm';
import Icon from '../../components/Icon';
import { company } from '../../lib/data';

export const metadata = {
  title: 'Contact',
  description: 'Contact Rumbu Industries Limited in Kano, Nigeria, for product enquiries, custom orders and partnerships.',
};

const tel = (n) => `tel:${n.replace(/ /g, '')}`;
const wa = `https://wa.me/${company.phone1.replace(/[^0-9]/g, '')}`;

export default function Contact() {
  return (
    <>
      <PageHeader
        variant="ivory"
        label="Contact us"
        title={<>Let’s make<br /><em>something happen.</em></>}
        description="A product enquiry, a new partnership, or simply a question. We’d love to hear from you."
      />
      <section className="section section--white section--flush-top">
        <div className="container contact">
          <aside className="contact__card on-dark weave">
            <div className="eyebrow">Start a conversation</div>
            <h2 className="title-md">Here to help.<br /><em>Ready to connect.</em></h2>
            <p className="muted">Speak to our team about products, custom orders and opportunities to work together.</p>
            <ul className="contact__list">
              <li>
                <span className="contact__icon"><Icon name="phone" size={20} /></span>
                <div><h3>Give us a call</h3><a href={tel(company.phone1)}>{company.phone1}</a><a href={tel(company.phone2)}>{company.phone2}</a></div>
              </li>
              <li>
                <span className="contact__icon"><Icon name="mail" size={20} /></span>
                <div><h3>Send an email</h3><a href={`mailto:${company.email}`}>{company.email}</a></div>
              </li>
              <li>
                <span className="contact__icon"><Icon name="pin" size={20} /></span>
                <div><h3>Our head office</h3><p>{company.address}</p></div>
              </li>
            </ul>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">Chat on WhatsApp <Icon name="external" size={16} /></a>
          </aside>
          <ContactForm />
        </div>
      </section>
      <section className="section section--tight">
        <div className="container">
          <div className="section-head section-head--split">
            <div>
              <div className="eyebrow">Visit Rumbu</div>
              <h2 className="title-lg">Find us in <em>Kano.</em></h2>
            </div>
            <a href="https://www.google.com/maps/dir/?api=1&destination=Rumbu+Industries+Limited+Hadejia+Road+Kano+Nigeria" className="link-arrow" target="_blank" rel="noopener noreferrer">Get directions <Icon name="external" size={17} /></a>
          </div>
          <div className="map-wrap">
            <iframe title="Map showing Rumbu Industries Limited, Hadejia Road, Kano" src="https://www.google.com/maps?q=Rumbu%20Industries%20Limited%2C%20KM%204%20Hadejia%20Road%2C%20Kano%2C%20Nigeria&output=embed" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </section>
    </>
  );
}
