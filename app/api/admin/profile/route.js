import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '../../../../lib/supabaseServer';
import { requireAdmin } from '../../../../lib/authGuard';

export async function POST(request) {
  const profile = await requireAdmin();
  if (!profile) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get('avatar');

    if (!file || typeof file.arrayBuffer !== 'function' || file.size === 0) {
      return NextResponse.json({ error: 'No image provided.' }, { status: 400 });
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: 'Photo must be a JPG, PNG or WEBP image.' }, { status: 400 });
    }
    if (file.size > 3 * 1024 * 1024) {
      return NextResponse.json({ error: 'Photo must be under 3MB.' }, { status: 400 });
    }

    const admin = createSupabaseAdmin();
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${profile.id}/avatar.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: upErr } = await admin.storage
      .from('avatars')
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (upErr) {
      return NextResponse.json({ error: 'Could not upload photo.' }, { status: 500 });
    }

    const { data: pub } = admin.storage.from('avatars').getPublicUrl(path);
    // Cache-bust so the new photo shows immediately instead of a stale cached one.
    const avatar_url = `${pub.publicUrl}?t=${Date.now()}`;

    const { error: dbErr } = await admin
      .from('profiles')
      .update({ avatar_url })
      .eq('id', profile.id);

    if (dbErr) {
      return NextResponse.json({ error: 'Could not save photo to your profile.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, avatar_url });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
