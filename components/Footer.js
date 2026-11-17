import Image from 'next/image';
import Link from 'next/link';
import { company } from '../lib/data';
import Icon from './Icon';

const tel = (n) => `tel:${n.replace(/ /g, '')}`;

export default function Footer() {
  return (
    <footer className="site-footer weave">
      <div className="container">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <Link href="/" className="brand" aria-label="Rumbu Industries Group, home">
              <Image src="/logo.png" alt="" width={34} height={40} />
              <span className="brand__name">RUMBU<small>INDUSTRIES GROUP</small></span>
            </Link>
            <p className="site-footer__statement">Made in Nigeria.<br /><em>Woven into everyday life.</em></p>
            <p style={{ marginTop: 16, maxWidth: '26em' }}>Quality manufacturing from Kano to the world, since {company.founded}.</p>
          </div>
          <nav aria-label="Company">
            <h2>Discover</h2>
            <div className="site-footer__links">
              <Link href="/about">Our story</Link>
              <Link href="/team">Leadership</Link>
              <Link href="/research">Innovation</Link>
              <Link href="/exhibitions">Exhibitions</Link>
              <Link href="/news">News & milestones</Link>
            </div>
          </nav>
          <nav aria-label="Work with us">
            <h2>Work with us</h2>
            <div className="site-footer__links">
              <Link href="/products">Our products</Link>
              <Link href="/services">Our services</Link>
              <Link href="/careers">Careers</Link>
              <Link href="/contact">Contact us</Link>
              <a href="/rumbu-product-catalogue.pdf" download>Product catalogue <Icon name="download" size={15} /></a>
            </div>
          </nav>
          <div>
            <h2>Find us</h2>
            <div className="site-footer__links">
              <p>{company.address}</p>
              <a href={tel(company.phone1)}>{company.phone1}</a>
              <a href={tel(company.phone2)}>{company.phone2}</a>
              <a href={`mailto:${company.email}`}>{company.email}</a>
              <a href="https://www.google.com/maps/search/?api=1&query=Rumbu+Industries+Kano" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold-400)' }}>
                Get directions <Icon name="diagonal" size={15} />
              </a>
            </div>
          </div>
        </div>
        <div className="site-footer__bottom">
          <span>&copy; {new Date().getFullYear()} {company.name}. All rights reserved.</span>
          <span className="site-footer__origin">Kano, Nigeria <span className="flag-ng" aria-hidden="true" /></span>
        </div>
      </div>
    </footer>
  );
}
