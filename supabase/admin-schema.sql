-- ============================================================
-- RUMBU INDUSTRIES — ADMIN PANEL DATABASE SCHEMA
-- Run this whole file in Supabase → SQL Editor → New query → Run.
-- Safe to re-run: uses "if not exists" / "or replace" throughout.
-- ============================================================

-- ---------- 1. CONTACT SUBMISSIONS (already exists, kept here for completeness)
create table if not exists contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz not null default now()
);
alter table contact_submissions enable row level security;

-- ---------- 2. ADMIN PROFILES (roles for each logged-in user)
-- Linked to Supabase Auth users by id.
-- role is 'pending' (no access, the default), 'admin', 'hr' or 'super_admin'.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'pending' check (role in ('pending','admin','hr','super_admin')),
  created_at timestamptz not null default now()
);
alter table profiles enable row level security;

-- A signed-in person may read their own profile row only. The workspace reads
-- the full list on the server, with its own role checks.
drop policy if exists "profiles readable by authenticated" on profiles;
drop policy if exists "profiles read own row" on profiles;
create policy "profiles read own row"
  on profiles for select to authenticated using (auth.uid() = id);

-- Nobody may edit a profile row from the browser. Role and photo changes go
-- through the server routes. (An "update own row" policy would let any
-- signed-in account make itself a super admin.)
drop policy if exists "profiles self update" on profiles;

-- When a new auth user is created, auto-create their profile row, with NO
-- access. A super admin gives the role afterwards.
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
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
  for each row execute function handle_new_user();

-- ---------- 3. NEWS POSTS (managed from the admin)
create table if not exists news_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null default 'Press',
  excerpt text,
  body text,                       -- paragraphs separated by blank lines
  cover_url text,                  -- image URL (Supabase Storage public URL)
  youtube_url text,                -- optional YouTube link
  published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table news_posts enable row level security;

-- Public can read published posts (the website shows them).
drop policy if exists "news public read" on news_posts;
create policy "news public read"
  on news_posts for select using (published = true);

-- ---------- 4. JOB ADVERTS
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text,
  type text,
  department text,
  summary text,
  responsibilities text,           -- one per line
  requirements text,               -- one per line
  open boolean not null default true,
  created_at timestamptz not null default now()
);
alter table jobs enable row level security;

drop policy if exists "jobs public read" on jobs;
create policy "jobs public read"
  on jobs for select using (open = true);

-- ---------- 5. JOB APPLICATIONS (submitted by visitors)
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  cover_note text,
  created_at timestamptz not null default now()
);
alter table applications enable row level security;
-- No public read policy: applications are private, read only via admin (service role).

-- ---------- 6. STORAGE BUCKET for news images
insert into storage.buckets (id, name, public)
values ('news', 'news', true)
on conflict (id) do nothing;

-- Allow public read of news images; writes happen server-side via service role.
drop policy if exists "news images public read" on storage.objects;
create policy "news images public read"
  on storage.objects for select using (bucket_id = 'news');

-- ============================================================
-- DONE. Next: create your first admin user (see SETUP guide).
-- ============================================================
