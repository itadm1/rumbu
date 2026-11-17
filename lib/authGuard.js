import { getCurrentProfile } from './supabaseServer';

// Returns the profile if the caller is signed in AND has a staff role
// ('admin', 'hr' or 'super_admin'), else null. getCurrentProfile already
// returns null for an account with no profile row or with any other role.
export async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  return profile;
}

// Returns the profile only if super_admin, else null.
export async function requireSuperAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'super_admin') return null;
  return profile;
}

// Returns the profile if the caller is HR (or super_admin, who can see
// everything), else null. Used to gate the /admin/hr/* pages and their APIs.
export async function requireHR() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  if (profile.role !== 'hr' && profile.role !== 'super_admin') return null;
  return profile;
}
