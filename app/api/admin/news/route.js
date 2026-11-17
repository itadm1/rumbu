import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/authGuard';
import { createSupabaseAdmin } from '../../../../lib/supabaseServer';

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

export async function POST(request) {
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { action } = body;
  const admin = createSupabaseAdmin();

  if (action === 'create' || action === 'update') {
    const { id, title, category, excerpt, content, cover_url, youtube_url, published } = body;
    if (!title) return NextResponse.json({ error: 'Title is required.' }, { status: 400 });

    const row = {
      title,
      category: category || 'Press',
      excerpt: excerpt || '',
      body: content || '',
      cover_url: cover_url || null,
      youtube_url: youtube_url || null,
      published: published !== false,
    };

    if (action === 'create') {
      row.slug = `${slugify(title)}-${Date.now().toString(36)}`;
      const { error } = await admin.from('news_posts').insert([row]);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      const { error } = await admin.from('news_posts').update(row).eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  if (action === 'delete') {
    const { error } = await admin.from('news_posts').delete().eq('id', body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
}
