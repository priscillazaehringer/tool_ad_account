-- ---------------------------------------------------------------------------
-- Migration: add the help_requests table for the "Need help?" widget.
--
-- Safe to run more than once. If you're setting up a fresh database, running
-- schema.sql already includes this table.
--
-- Each row is a question a client asked from inside the wizard, with the step
-- they were on and their name/email copied in so you can review it at a glance.
-- ---------------------------------------------------------------------------

create extension if not exists "pgcrypto";

create table if not exists public.help_requests (
  id           uuid primary key default gen_random_uuid(),
  setup_id     uuid references public.meta_setup(id),
  first_name   text,
  last_name    text,
  email        text,
  step_index   int,
  step_label   text,
  question     text not null,
  created_at   timestamptz not null default now()
);

create index if not exists help_requests_created_at_idx
  on public.help_requests (created_at desc);

-- RLS on, no policies — reachable only via the service role key (server-side).
alter table public.help_requests enable row level security;
