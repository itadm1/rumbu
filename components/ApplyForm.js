'use client';

import { useState } from 'react';
import { NIGERIA_STATES, STATE_LGAS } from '../lib/nigeriaStatesLga';

const QUALIFICATIONS = ['PhD', 'MSc', 'BSc', 'ND', 'SSCE'];

// Ordered lowest to highest, used to work out the cascade of documents to
// request once the applicant picks their highest qualification.
const QUALIFICATION_LEVELS = ['SSCE', 'ND', 'BSc', 'MSc', 'PhD'];
const NEEDS_CGPA = { SSCE: false, ND: true, BSc: true, MSc: true, PhD: false };
const LEVEL_LABELS = {
  SSCE: 'SSCE certificate',
  ND: 'ND certificate',
  BSc: 'BSc certificate',
  MSc: 'MSc certificate',
  PhD: 'PhD certificate',
};

// Client-side preview only — the server recomputes this independently and
// that computed value is what actually gets stored.
function classifyCgpa(cgpaRaw, scaleRaw) {
  const cgpa = parseFloat(cgpaRaw);
  const scale = parseFloat(scaleRaw);
  if (!cgpa || !scale || cgpa <= 0 || scale <= 0) return '';
  const normalized = (cgpa / scale) * 5;
  if (normalized >= 4.5) return 'First Class (1.1)';
  if (normalized >= 3.5) return 'Second Class Upper (2.1)';
  if (normalized >= 2.4) return 'Second Class Lower (2.2)';
  if (normalized >= 1.5) return 'Third Class (3.1)';
  if (normalized >= 1.0) return 'Pass (4.0)';
  return 'Below classification range';
}

const EMPTY_FORM = {
  full_name: '',
  email: '',
  phone: '',
  state_of_origin: '',
  lga_of_origin: '',
  state_of_residence: '',
  lga_of_residence: '',
  address: '',
  highest_qualification: '',
  nin_number: '',
};

const EMPTY_QUALS = {
  SSCE: { file: null },
  ND: { file: null, cgpa: '', scale: '5' },
  BSc: { file: null, cgpa: '', scale: '5' },
  MSc: { file: null, cgpa: '', scale: '5' },
  PhD: { file: null },
};

const FILE_FIELDS = [
  { name: 'cv', label: 'CV / Résumé (PDF)', accept: '.pdf,application/pdf', required: true },
  { name: 'cover_letter', label: 'Cover letter (PDF)', accept: '.pdf,application/pdf', required: false },
  { name: 'photo', label: 'Passport photograph', accept: 'image/*', required: false },
  { name: 'nin_image', label: 'NIN slip / card image', accept: 'image/*,.pdf,application/pdf', required: false },
  { name: 'professional_cert', label: 'Professional certificate', accept: '.pdf,application/pdf,image/*', required: false },
];

export default function ApplyForm({ jobId, jobTitle }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [quals, setQuals] = useState(EMPTY_QUALS);
  const [files, setFiles] = useState({});
  const [status, setStatus] = useState({ state: 'idle', msg: '' });

  const ch = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const chState = (e) => {
    const { name, value } = e.target;
    if (name === 'state_of_origin') {
      setForm({ ...form, state_of_origin: value, lga_of_origin: '' });
    } else if (name === 'state_of_residence') {
      setForm({ ...form, state_of_residence: value, lga_of_residence: '' });
    }
  };

  const chFile = (e) => {
    const { name, files: fl } = e.target;
    setFiles({ ...files, [name]: fl && fl[0] ? fl[0] : null });
  };

  const chQualFile = (level) => (e) => {
    const f = e.target.files?.[0] || null;
    setQuals((q) => ({ ...q, [level]: { ...q[level], file: f } }));
  };
  const chQualField = (level, field) => (e) => {
    const value = e.target.value;
    setQuals((q) => ({ ...q, [level]: { ...q[level], [field]: value } }));
  };

  const submit = async () => {
    if (!form.full_name || !form.email || !form.phone) {
      setStatus({ state: 'err', msg: 'Please enter your full name, email and phone number.' });
      return;
    }
    if (!form.highest_qualification) {
      setStatus({ state: 'err', msg: 'Please select your highest qualification.' });
      return;
    }
    if (!files.cv) {
      setStatus({ state: 'err', msg: 'Please attach your CV/Resume as a PDF.' });
      return;
    }
    if (!quals[form.highest_qualification]?.file) {
      setStatus({ state: 'err', msg: `Please attach your ${LEVEL_LABELS[form.highest_qualification]}.` });
      return;
    }

    setStatus({ state: 'loading', msg: 'Submitting...' });

    const requiredLevels = QUALIFICATION_LEVELS.slice(
      0,
      QUALIFICATION_LEVELS.indexOf(form.highest_qualification) + 1
    );

    const fd = new FormData();
    fd.append('job_id', jobId);
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    Object.entries(files).forEach(([k, f]) => { if (f) fd.append(k, f); });

    requiredLevels.forEach((level) => {
      const q = quals[level];
      if (q.file) fd.append(`qual_${level}_file`, q.file);
      if (NEEDS_CGPA[level]) {
        if (q.cgpa) fd.append(`qual_${level}_cgpa`, q.cgpa);
        if (q.scale) fd.append(`qual_${level}_scale`, q.scale);
      }
    });

    try {
      const res = await fetch('/api/apply', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.ok) {
        setStatus({ state: 'ok', msg: 'Thank you. Your application has been received.' });
        setForm(EMPTY_FORM);
        setQuals(EMPTY_QUALS);
        setFiles({});
      } else {
        setStatus({ state: 'err', msg: data.error || 'Something went wrong. Please try again later.' });
      }
    } catch {
      setStatus({ state: 'err', msg: 'Something went wrong. Please try again later.' });
    }
  };

  if (!open) {
    return <button type="button" className="btn btn-gold btn--auto" onClick={() => setOpen(true)}>Apply for this role</button>;
  }

  const originLgas = form.state_of_origin ? (STATE_LGAS[form.state_of_origin] || []) : [];
  const residenceLgas = form.state_of_residence ? (STATE_LGAS[form.state_of_residence] || []) : [];

  const requiredLevels = form.highest_qualification
    ? QUALIFICATION_LEVELS.slice(0, QUALIFICATION_LEVELS.indexOf(form.highest_qualification) + 1)
    : [];

  return (
    <div className="apply-form">
      <h4>Apply: {jobTitle}</h4>
      {status.state === 'ok' && <div className="form-msg success" role="status">{status.msg}</div>}
      {status.state === 'err' && <div className="form-msg error" role="alert">{status.msg}</div>}
      {status.state !== 'ok' && (
        <>
          <div className="apply-form-section">Personal details</div>
          <div className="form-field">
            <label htmlFor={`${jobId}-full_name`}>Full name</label>
            <input id={`${jobId}-full_name`} name="full_name" autoComplete="name" value={form.full_name} onChange={ch} />
          </div>
          <div className="form-field">
            <label htmlFor={`${jobId}-email`}>Email</label>
            <input id={`${jobId}-email`} name="email" type="email" autoComplete="email" value={form.email} onChange={ch} />
          </div>
          <div className="form-field">
            <label htmlFor={`${jobId}-phone`}>Phone number</label>
            <input id={`${jobId}-phone`} name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={ch} />
          </div>

          <div className="apply-form-section">Origin &amp; residence</div>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor={`${jobId}-state_of_origin`}>State of origin</label>
              <select id={`${jobId}-state_of_origin`} name="state_of_origin" value={form.state_of_origin} onChange={chState}>
                <option value="">Select state</option>
                {NIGERIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor={`${jobId}-lga_of_origin`}>LGA of origin</label>
              <select
                id={`${jobId}-lga_of_origin`} name="lga_of_origin"
                value={form.lga_of_origin}
                onChange={ch}
                disabled={!form.state_of_origin}
              >
                <option value="">{form.state_of_origin ? 'Select LGA' : 'Select a state first'}</option>
                {originLgas.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor={`${jobId}-state_of_residence`}>State of residence</label>
              <select id={`${jobId}-state_of_residence`} name="state_of_residence" value={form.state_of_residence} onChange={chState}>
                <option value="">Select state</option>
                {NIGERIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor={`${jobId}-lga_of_residence`}>LGA of residence</label>
              <select
                id={`${jobId}-lga_of_residence`} name="lga_of_residence"
                value={form.lga_of_residence}
                onChange={ch}
                disabled={!form.state_of_residence}
              >
                <option value="">{form.state_of_residence ? 'Select LGA' : 'Select a state first'}</option>
                {residenceLgas.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="form-field">
            <label htmlFor={`${jobId}-address`}>Residential address</label>
            <textarea id={`${jobId}-address`} name="address" rows={2} value={form.address} onChange={ch} />
          </div>

          <div className="apply-form-section">Qualification</div>
          <div className="form-field">
            <label htmlFor={`${jobId}-highest_qualification`}>Highest qualification</label>
            <select id={`${jobId}-highest_qualification`} name="highest_qualification" value={form.highest_qualification} onChange={ch}>
              <option value="">Select qualification</option>
              {QUALIFICATIONS.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>

          {requiredLevels.length > 0 && (
            <>
              <div className="apply-form-section">Qualification documents</div>
              <p className="qual-help">
                Upload your certificates from SSCE up to your highest qualification. Only your{' '}
                {LEVEL_LABELS[form.highest_qualification]} is required &mdash; the rest are optional.
              </p>
              {requiredLevels.map((level) => {
                const isTop = level === form.highest_qualification;
                const q = quals[level];
                return (
                  <div className="qual-block" key={level}>
                    <div className="form-field">
                      <label htmlFor={`${jobId}-${level}-file`}>{LEVEL_LABELS[level]} (PDF){isTop ? ' *' : ' (optional)'}</label>
                      <input id={`${jobId}-${level}-file`} type="file" accept=".pdf,application/pdf" onChange={chQualFile(level)} />
                      {q.file && <span className="apply-file-name">{q.file.name}</span>}
                    </div>
                    {NEEDS_CGPA[level] && (
                      <div className="form-row">
                        <div className="form-field">
                          <label htmlFor={`${jobId}-${level}-cgpa`}>{level} CGPA</label>
                          <input
                            id={`${jobId}-${level}-cgpa`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={q.cgpa}
                            onChange={chQualField(level, 'cgpa')}
                          />
                        </div>
                        <div className="form-field">
                          <label htmlFor={`${jobId}-${level}-scale`}>Grading scale</label>
                          <select id={`${jobId}-${level}-scale`} value={q.scale} onChange={chQualField(level, 'scale')}>
                            <option value="5">5.0 point scale</option>
                            <option value="10">10.0 point scale</option>
                          </select>
                        </div>
                      </div>
                    )}
                    {NEEDS_CGPA[level] && q.cgpa && (
                      <div className="qual-classification">
                        {classifyCgpa(q.cgpa, q.scale) || 'Enter a valid CGPA'}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          <div className="apply-form-section">Identification</div>
          <div className="form-field">
            <label htmlFor={`${jobId}-nin_number`}>NIN (National Identification Number)</label>
            <input id={`${jobId}-nin_number`} name="nin_number" inputMode="numeric" value={form.nin_number} onChange={ch} maxLength={11} />
          </div>

          <div className="apply-form-section">Documents</div>
          {FILE_FIELDS.map((f) => (
            <div className="form-field" key={f.name}>
              <label htmlFor={`${jobId}-${f.name}`}>{f.label}{f.required ? ' *' : ' (optional)'}</label>
              <input id={`${jobId}-${f.name}`} type="file" name={f.name} accept={f.accept} onChange={chFile} />
              {files[f.name] && <span className="apply-file-name">{files[f.name].name}</span>}
            </div>
          ))}

          <div className="apply-actions">
            <button type="button" className="btn" onClick={submit} disabled={status.state === 'loading'}>
              {status.state === 'loading' ? 'Submitting...' : 'Submit application'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
