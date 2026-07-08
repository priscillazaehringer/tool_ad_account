-- ---------------------------------------------------------------------------
-- Schema for the Meta ad account setup wizard.
-- Run this once against your Supabase project (SQL Editor → paste → Run).
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
  q1_answer         text,
  q2_answer         text,
  q3_answer         text,
  q4_answer         text,
  q5_completed_at   timestamptz,
  q6_completed_at   timestamptz,
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
