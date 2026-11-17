-- Rumbu Industries Group website
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

create table if not exists contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security. The public site never reads this table;
-- inserts happen server-side using the service role key, which bypasses RLS.
-- With RLS on and no permissive policies, the anon key cannot read submissions.
alter table contact_submissions enable row level security;

-- Optional: index for sorting newest first in your future admin area
create index if not exists contact_submissions_created_at_idx
  on contact_submissions (created_at desc);
