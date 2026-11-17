-- ============================================================
-- RUMBU WEBSITE: SECURITY HARDENING (17 Nov 2026)
-- Run this ONCE in Supabase: SQL Editor > New query > paste all > Run.
-- It is safe to run more than once.
--
-- What it fixes
--   1. A newly created account no longer becomes an admin automatically.
--      It starts as 'pending' and has no access until a super admin gives
--      it a role on the Users page.
--   2. A signed-in person can no longer change their own role. Before this,
--      any signed-in account could make itself a super admin from the
--      browser.
--   3. A signed-in person can read only their own profile row, not the list
--      of every staff account.
--
-- Also do this in the Supabase dashboard (it cannot be done from SQL):
--   Authentication > Sign In / Providers > turn OFF "Allow new users to
--   sign up". Staff accounts are created by a super admin on the Users page,
--   which keeps working when public sign-up is off.
-- ============================================================

-- ---------- 1. Roles: allow 'pending' and 'hr', and make 'pending' the default
do $$
declare c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%role%'
  loop
    execute format('alter table public.profiles drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('pending', 'admin', 'hr', 'super_admin'));

alter table public.profiles alter column role set default 'pending';

-- New accounts get a profile row with NO access.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'pending')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- 2. Nobody may edit a profile row from the browser.
-- Role changes go through the Users page, and photo changes through the
-- profile page. Both run on the server with their own checks.
drop policy if exists "profiles self update" on public.profiles;

-- ---------- 3. A signed-in person reads their own profile row only.
drop policy if exists "profiles readable by authenticated" on public.profiles;
drop policy if exists "profiles read own row" on public.profiles;
create policy "profiles read own row"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

-- ---------- 4. CHECK YOUR ACCOUNTS (read the results, nothing is changed)
-- Every account that can sign in, with its role. Look for any email you do
-- not recognise. Remove a stranger on the Users page, or under
-- Authentication > Users in Supabase.
select u.email, coalesce(p.role, '(no profile row)') as role, u.created_at, u.last_sign_in_at
from auth.users u
left join public.profiles p on p.id = u.id
order by u.created_at;
