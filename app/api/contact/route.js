import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '../../../lib/supabaseServer';
import { getSupabaseStatus } from '../../../lib/supabaseConfig';

const LIMITS = { name: 150, email: 254, subject: 200, message: 5000 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const text = (value) => (typeof value === 'string' ? value.trim() : '');

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Hidden field that people never see or fill in. Automated spam does.
    // Answer as if it worked, and store nothing.
    if (text(body?.company_website)) {
      return NextResponse.json({ ok: true });
    }

    const name = text(body?.name);
    const email = text(body?.email);
    const subject = text(body?.subject);
    const message = text(body?.message);

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    if (!EMAIL.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }
    if (
      name.length > LIMITS.name ||
      email.length > LIMITS.email ||
      subject.length > LIMITS.subject ||
      message.length > LIMITS.message
    ) {
      return NextResponse.json({ error: 'One of the fields is too long.' }, { status: 400 });
    }

    if (!getSupabaseStatus().ready) {
      return NextResponse.json(
        { error: 'The contact form is not connected yet. Please call or email us instead.', code: 'not_configured' },
        { status: 503 }
      );
    }

    const supabase = createSupabaseAdmin();

    const { error } = await supabase
      .from('contact_submissions')
      .insert([{ name, email, subject, message }]);

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Database error.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
