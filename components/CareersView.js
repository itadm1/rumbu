'use client';

import { useState, useMemo } from 'react';
import Reveal from './Reveal';
import ApplyForm from './ApplyForm';
import CareerAreas from './CareerAreas';
import PageHeader from './PageHeader';
import Icon from './Icon';
import { company } from '../lib/data';

function lines(text) {
  return (text || '').split('\n').map((l) => l.trim()).filter(Boolean);
}

const offers = [
  { icon: 'chart', title: 'Room to grow', text: 'Develop your skills in a company that keeps investing in its people, technology and facilities.' },
  { icon: 'factory', title: 'Real impact', text: 'Be part of large-scale manufacturing that serves markets across Nigeria and beyond.' },
  { icon: 'shield', title: 'Quality culture', text: 'Join a team that takes pride in superior products and puts quality at the centre.' },
];

export default function CareersView({ jobs, unavailable = false }) {
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('');
  const [loc, setLoc] = useState('');

  const departments = useMemo(() => [...new Set(jobs.map((j) => j.department).filter(Boolean))].sort(), [jobs]);
  const locations = useMemo(() => [...new Set(jobs.map((j) => j.location).filter(Boolean))].sort(), [jobs]);

  const filtered = jobs.filter((j) => {
    const matchesQ = !q || `${j.title} ${j.summary || ''} ${j.department || ''}`.toLowerCase().includes(q.toLowerCase());
    const matchesDept = !dept || j.department === dept;
    const matchesLoc = !loc || j.location === loc;
    return matchesQ && matchesDept && matchesLoc;
  });
  const clear = () => { setQ(''); setDept(''); setLoc(''); };

  return (
    <>
      <PageHeader
        variant="cinema"
        image="/products/factory-floor.jpg"
        label="Careers at Rumbu Industries"
        title={<>A world of opportunity,<br /><em>built in Nigeria.</em></>}
        description="We believe in talent, quality and impact. Join Nigeria’s leading manufacturer of polypropylene woven mats and twine, and build a career with purpose."
      >
        <div className="btn-row" style={{ marginTop: 32 }}>
          <a href="#open-positions" className="btn btn-gold">Explore open roles <Icon name="arrow" size={18} /></a>
        </div>
      </PageHeader>

      <section className="section">
        <div className="container careers-intro">
          <div>
            <div className="eyebrow">Come work with us</div>
            <h2 className="title-lg">Grow with a <em>world leader.</em></h2>
            <p className="lead">With about 2,200 staff across our facilities in Kano and Ogun States, Rumbu offers the chance to work at scale in a company that has grown from a local manufacturer into one of the largest of its kind in the world.</p>
          </div>
          <div className="stat-row careers-intro__stats">
            <div className="stat"><div className="stat__num">2,200+</div><div className="stat__label">People employed</div></div>
            <div className="stat"><div className="stat__num">6</div><div className="stat__label">Facilities across 2 states</div></div>
            <div className="stat"><div className="stat__num">20+</div><div className="stat__label">Years of growth</div></div>
          </div>
        </div>
      </section>

      <section className="section section--forest on-dark weave">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Why Rumbu</div>
              <h2 className="title-lg">What we <em>offer.</em></h2>
            </div>
          </div>
          <ul className="offer-grid">
            {offers.map((o, i) => (
              <li key={o.title}>
                <Reveal delay={i + 1}>
                  <div className="offer">
                    <span className="offer__icon"><Icon name={o.icon} size={26} /></span>
                    <h3>{o.title}</h3>
                    <p>{o.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CareerAreas />

      <section className="section" id="open-positions">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Open positions</div>
              <h2 className="title-lg">Current <em>vacancies.</em></h2>
            </div>
          </div>

          {jobs.length > 0 && (
            <div className="job-filters">
              <label className="search-field">
                <span className="sr-only">Search job roles</span>
                <Icon name="search" size={18} />
                <input className="field-control" type="search" placeholder="Search roles" value={q} onChange={(e) => setQ(e.target.value)} />
              </label>
              <select className="field-control" aria-label="Filter by department" value={dept} onChange={(e) => setDept(e.target.value)}>
                <option value="">All departments</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <select className="field-control" aria-label="Filter by location" value={loc} onChange={(e) => setLoc(e.target.value)}>
                <option value="">All locations</option>
                {locations.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          )}

          {jobs.length === 0 ? (
            <div className="empty-state">
              <Icon name="briefcase" size={30} />
              <h3>{unavailable ? 'Current openings are temporarily unavailable' : 'No current openings'}</h3>
              <p>
                {unavailable ? 'Please check back shortly, or contact our team at' : 'We don’t have any vacancies right now. Please check back soon, or send your CV to'}{' '}
                <a className="text-link" href={`mailto:${company.email}`}>{company.email}</a>.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Icon name="search" size={30} />
              <h3>No matching roles</h3>
              <p>No roles match your search. Try clearing the filters.</p>
              <button type="button" className="btn btn-sm" onClick={clear}>Clear filters</button>
            </div>
          ) : (
            <>
              <p className="range-count" role="status">{filtered.length} open role{filtered.length === 1 ? '' : 's'}</p>
              <div className="job-list">
                {filtered.map((job) => (
                  <article className="job-card" key={job.id}>
                    <header className="job-card__head">
                      <h3 className="title-md">{job.title}</h3>
                      <ul className="tag-list">
                        {job.location && <li className="tag"><Icon name="pin" size={14} />&nbsp;{job.location}</li>}
                        {job.type && <li className="tag">{job.type}</li>}
                        {job.department && <li className="tag">{job.department}</li>}
                      </ul>
                    </header>
                    {job.summary && <p className="lead">{job.summary}</p>}
                    <div className="job-card__cols">
                      {lines(job.responsibilities).length > 0 && (
                        <div><h4>Responsibilities</h4><ul>{lines(job.responsibilities).map((r, idx) => <li key={idx}>{r}</li>)}</ul></div>
                      )}
                      {lines(job.requirements).length > 0 && (
                        <div><h4>Requirements</h4><ul>{lines(job.requirements).map((r, idx) => <li key={idx}>{r}</li>)}</ul></div>
                      )}
                    </div>
                    <ApplyForm jobId={job.id} jobTitle={job.title} />
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
