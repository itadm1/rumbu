import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '../../../../lib/authGuard';
import { createSupabaseAdmin } from '../../../../lib/supabaseServer';

const VALID_ROLES = ['admin', 'hr', 'super_admin'];
const normalizeRole = (role) => (VALID_ROLES.includes(role) ? role : 'admin');

export async function POST(request) {
  const profile = await requireSuperAdmin();
  if (!profile) return NextResponse.json({ error: 'Super admin only.' }, { status: 403 });

  const body = await request.json();
  const { action } = body;
  const admin = createSupabaseAdmin();

  if (action === 'create') {
    const { email, password, full_name, role } = body;
    if (!email || !password) return NextResponse.json({ error: 'Email and password required.' }, { status: 400 });
    // Create the auth user (email confirmed so they can log in immediately).
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name || email },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    // Ensure the profile row reflects the chosen role.
    await admin.from('profiles').upsert({
      id: data.user.id,
      email,
      full_name: full_name || email,
      role: normalizeRole(role),
    });
    return NextResponse.json({ ok: true });
  }

  if (action === 'set_role') {
    const { id, role } = body;
    if (id === profile.id && role !== 'super_admin') {
      return NextResponse.json({ error: 'You cannot remove your own super admin role.' }, { status: 400 });
    }
    const { error } = await admin.from('profiles')
      .update({ role: normalizeRole(role) })
      .eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'delete') {
    const { id } = body;
    if (id === profile.id) {
      return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 });
    }
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
}
