import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/authGuard';
import { createSupabaseAdmin } from '../../../../lib/supabaseServer';

// News cover images only. The file extension is taken from the checked
// content type, never from the uploaded file name.
const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request) {
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let file;
  try {
    const formData = await request.formData();
    file = formData.get('file');
  } catch {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }
  if (!file || typeof file.arrayBuffer !== 'function' || file.size === 0) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  const ext = TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: 'The cover image must be a JPG, PNG or WEBP file.' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'The cover image must be under 5MB.' }, { status: 400 });
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  const path = `covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const admin = createSupabaseAdmin();
  const { error } = await admin.storage.from('news').upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return NextResponse.json({ error: 'Could not upload the image.' }, { status: 500 });

  const { data } = admin.storage.from('news').getPublicUrl(path);
  return NextResponse.json({ ok: true, url: data.publicUrl });
}
