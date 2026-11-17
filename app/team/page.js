import PageHeader from '../../components/PageHeader';
import ContactCTA from '../../components/ContactCTA';
import OrgChart from '../../components/orgChart';

export const metadata = { title: 'Our Leadership' };

export default function TeamPage() {
  return (
    <>
      <PageHeader
        variant="center"
        label="Our leadership"
        title={<>People with <em>vision.</em></>}
        description="Meet the people shaping our future and moving Rumbu Industries forward."
      />
      <section className="section section--white">
        <div className="container">
          <div className="section-head section-head--center">
            <div>
              <div className="eyebrow">Leadership</div>
              <h2 className="title-lg">Leadership with purpose.</h2>
            </div>
            <p className="lead">Discover the experience and ambition behind our leadership team. Select a profile to read more.</p>
          </div>
          <OrgChart />
        </div>
      </section>
      <ContactCTA />
    </>
  );
}
