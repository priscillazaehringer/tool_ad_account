-- ---------------------------------------------------------------------------
-- Schema for the Meta ad account setup wizard.
-- Run this once against your Supabase project (SQL Editor → paste → Run).
--
-- Already ran an earlier version? Don't re-run this — run the migration in
-- supabase/migrations/ instead (it only adds the new columns).
-- ---------------------------------------------------------------------------

-- gen_random_uuid() lives in pgcrypto. Supabase enables it by default, but
-- this makes the script self-contained.
create extension if not exists "pgcrypto";

create table if not exists public.meta_setup (
  id                uuid primary key default gen_random_uuid(),
  email             text,
  last_name         text,
  first_name        text,
  current_step      int not null default 1,
  q1_answer         text,          -- Step 1: Personal Facebook account?
  q2_answer         text,          -- Step 2: Facebook Business Page?
  q3_answer         text,          -- Step 3: Instagram connected to Page?
  q4_answer         text,          -- Step 4: Ad account used for real campaigns?
  q5_answer         text,          -- Prerequisite: Business Portfolio?
  q6_completed_at   timestamptz,   -- Step 5: Invited our team (partner access)
  q7_completed_at   timestamptz,   -- (unused — reserved)
  completed_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Resume lookups match on a case-insensitive email + last name.
create index if not exists meta_setup_email_lastname_idx
  on public.meta_setup (lower(email), lower(last_name));

-- Keep updated_at fresh on every write.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists meta_setup_set_updated_at on public.meta_setup;
create trigger meta_setup_set_updated_at
  before update on public.meta_setup
  for each row
  execute function public.set_updated_at();

-- Enable RLS with NO policies. The service role key used server-side bypasses
-- RLS, so the API keeps working; anon/authenticated clients get nothing.
alter table public.meta_setup enable row level security;
