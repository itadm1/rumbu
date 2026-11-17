import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '../../../lib/supabaseServer';
import { getSupabaseStatus } from '../../../lib/supabaseConfig';

const QUALIFICATIONS = ['PhD', 'MSc', 'BSc', 'ND', 'SSCE'];
const QUALIFICATION_LEVELS = ['SSCE', 'ND', 'BSc', 'MSc', 'PhD'];
const NEEDS_CGPA = { SSCE: false, ND: true, BSc: true, MSc: true, PhD: false };

const FILE_RULES = {
  cv: { required: true, types: ['application/pdf'], maxMb: 5, label: 'CV/Resume' },
  cover_letter: { required: false, types: ['application/pdf'], maxMb: 5, label: 'Cover letter' },
  photo: { required: false, types: ['image/jpeg', 'image/png', 'image/webp'], maxMb: 3, label: 'Photo' },
  nin_image: { required: false, types: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'], maxMb: 3, label: 'NIN image' },
  professional_cert: { required: false, types: ['application/pdf', 'image/jpeg', 'image/png'], maxMb: 5, label: 'Professional certificate' },
};

function extFromName(name = '') {
  const m = name.match(/\.([a-zA-Z0-9]+)$/);
  return m ? m[1].toLowerCase() : 'bin';
}

// Authoritative classification: normalizes any scale to a 5-point equivalent,
// then applies the standard Nigerian class-of-degree bands.
function classifyCgpa(cgpa, scale) {
  if (!cgpa || !scale || cgpa <= 0 || scale <= 0) return null;
  const normalized = (cgpa / scale) * 5;
  if (normalized >= 4.5) return 'First Class (1.1)';
  if (normalized >= 3.5) return 'Second Class Upper (2.1)';
  if (normalized >= 2.4) return 'Second Class Lower (2.2)';
  if (normalized >= 1.5) return 'Third Class (3.1)';
  if (normalized >= 1.0) return 'Pass (4.0)';
  return 'Below classification range';
}

export async function POST(request) {
  try {
    const form = await request.formData();

    const job_id = form.get('job_id');
    const full_name = form.get('full_name');
    const email = form.get('email');
    const phone = form.get('phone');
    const state_of_origin = form.get('state_of_origin');
    const lga_of_origin = form.get('lga_of_origin');
    const state_of_residence = form.get('state_of_residence');
    const lga_of_residence = form.get('lga_of_residence');
    const address = form.get('address');
    const highest_qualification = form.get('highest_qualification');
    const nin_number = form.get('nin_number');

    if (!job_id || !full_name || !email || !phone) {
      return NextResponse.json(
        { error: 'Please enter your full name, email and phone number.' },
        { status: 400 }
      );
    }
    if (!highest_qualification || !QUALIFICATIONS.includes(highest_qualification)) {
      return NextResponse.json(
        { error: 'Please select your highest qualification.' },
        { status: 400 }
      );
    }

    if (!getSupabaseStatus().ready) {
      return NextResponse.json({ ok: false, error: 'Online applications are not connected yet. Please email your CV to info@rumbuindustries.com.' }, { status: 503 });
    }

    const admin = createSupabaseAdmin();
    const filePaths = {};

    // ---------- Standard supporting documents (CV, cover letter, photo, etc.)
    for (const [field, rule] of Object.entries(FILE_RULES)) {
      const file = form.get(field);
      const hasFile = file && typeof file === 'object' && typeof file.arrayBuffer === 'function' && file.size > 0;

      if (!hasFile) {
        if (rule.required) {
          return NextResponse.json({ error: `${rule.label} is required.` }, { status: 400 });
        }
        continue;
      }

      if (!rule.types.includes(file.type)) {
        return NextResponse.json({ error: `${rule.label} must be an accepted file type.` }, { status: 400 });
      }
      if (file.size > rule.maxMb * 1024 * 1024) {
        return NextResponse.json({ error: `${rule.label} must be under ${rule.maxMb}MB.` }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const path = `${job_id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${field}.${extFromName(file.name)}`;
      const { error: upErr } = await admin.storage.from('applications').upload(path, buffer, { contentType: file.type, upsert: false });
      if (upErr) {
        return NextResponse.json({ error: `Could not upload ${rule.label.toLowerCase()}.` }, { status: 500 });
      }
      filePaths[`${field}_path`] = path;
    }

    // ---------- Academic qualification documents, SSCE up to the applicant's highest level
    const topIndex = QUALIFICATION_LEVELS.indexOf(highest_qualification);
    const requiredLevels = QUALIFICATION_LEVELS.slice(0, topIndex + 1);
    const qualifications = [];

    for (const level of requiredLevels) {
      const file = form.get(`qual_${level}_file`);
      const isTop = level === highest_qualification;
      const hasFile = file && typeof file === 'object' && typeof file.arrayBuffer === 'function' && file.size > 0;

      if (!hasFile) {
        if (isTop) {
          return NextResponse.json({ error: `Your ${level} certificate is required.` }, { status: 400 });
        }
        continue;
      }

      if (file.type !== 'application/pdf') {
        return NextResponse.json({ error: `${level} certificate must be a PDF.` }, { status: 400 });
      }
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: `${level} certificate must be under 5MB.` }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const path = `${job_id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-qual-${level}.${extFromName(file.name)}`;
      const { error: upErr } = await admin.storage.from('applications').upload(path, buffer, { contentType: file.type, upsert: false });
      if (upErr) {
        return NextResponse.json({ error: `Could not upload your ${level} certificate.` }, { status: 500 });
      }

      const entry = { level, file_path: path };

      if (NEEDS_CGPA[level]) {
        const cgpaRaw = form.get(`qual_${level}_cgpa`);
        const scaleRaw = form.get(`qual_${level}_scale`);
        const cgpa = cgpaRaw ? parseFloat(cgpaRaw) : null;
        const scale = scaleRaw ? parseFloat(scaleRaw) : null;
        if (cgpa && scale) {
          entry.cgpa = cgpa;
          entry.scale = scale;
          entry.classification = classifyCgpa(cgpa, scale);
        }
      }

      qualifications.push(entry);
    }

    const { error } = await admin.from('applications').insert([{
      job_id,
      full_name,
      email,
      phone,
      state_of_origin: state_of_origin || null,
      lga_of_origin: lga_of_origin || null,
      state_of_residence: state_of_residence || null,
      lga_of_residence: lga_of_residence || null,
      address: address || null,
      highest_qualification,
      nin_number: nin_number || null,
      cv_path: filePaths.cv_path || null,
      cover_letter_path: filePaths.cover_letter_path || null,
      photo_path: filePaths.photo_path || null,
      nin_image_path: filePaths.nin_image_path || null,
      professional_cert_path: filePaths.professional_cert_path || null,
      qualifications,
      stage: 'applied',
    }]);

    if (error) {
      return NextResponse.json({ error: 'Database error.' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
