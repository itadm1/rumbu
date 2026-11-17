import PageHeader from '../../components/PageHeader';
import ContactCTA from '../../components/ContactCTA';
import ExhibitionGallery from '../../components/ExhibitionGallery';
import { exhibitions } from '../../lib/data';

export const metadata = { title: 'Exhibitions' };

export default function Exhibitions() {
  const photoCount = exhibitions.reduce((n, ex) => n + ex.photos.length, 0);
  const countries = new Set(exhibitions.map((ex) => ex.place.split(',').pop().trim()));
  return (
    <>
      <PageHeader
        variant="split"
        label="Exhibitions"
        title={<>Local expertise.<br /><em>Global connections.</em></>}
        aside={
          <>
            <p className="lead">Bringing Nigerian manufacturing to the national and international stage.</p>
            <dl className="head-stats">
              <div><dt>{exhibitions.length}</dt><dd>Exhibitions</dd></div>
              <div><dt>{countries.size}</dt><dd>Countries</dd></div>
              <div><dt>{photoCount}</dt><dd>Photographs</dd></div>
            </dl>
          </>
        }
      />
      <section className="section section--white">
        <div className="container"><ExhibitionGallery /></div>
      </section>
      <ContactCTA />
    </>
  );
}
