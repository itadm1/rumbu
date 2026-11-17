-- ============================================================
-- RUMBU WEBSITE: FRONT PAGE CONTENT (17 Nov 2026)
-- Run this ONCE in Supabase: SQL Editor > New query > paste all > Run.
-- It is safe to run more than once.
--
-- The front page words and pictures are saved as one row in app_settings
-- (key = 'home_page'). This makes sure that table exists. If the workspace
-- Settings page already works, the table is there and this changes nothing.
-- ============================================================
create table if not exists public.app_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

-- No public access. The website reads and writes it on the server only.
alter table public.app_settings enable row level security;
