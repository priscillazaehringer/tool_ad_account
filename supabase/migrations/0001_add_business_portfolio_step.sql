-- ---------------------------------------------------------------------------
-- Migration: add the Business Portfolio step (step 5) to the wizard.
--
-- Run this ONLY if you already ran an earlier version of schema.sql. It's safe
-- to run more than once. If you're setting up a fresh database, just run
-- schema.sql instead — it already includes these columns.
--
-- What changed: a new question step (q5_answer) was inserted, so the two
-- "add our team" action steps moved from steps 5 & 6 to steps 6 & 7.
--   q5_answer        -> Business Portfolio? (new)
--   q6_completed_at  -> Added our team to the Page   (was q5_completed_at)
--   q7_completed_at  -> Added our team to the ad account (new; was q6_completed_at)
-- ---------------------------------------------------------------------------

alter table public.meta_setup add column if not exists q5_answer text;
alter table public.meta_setup add column if not exists q6_completed_at timestamptz;
alter table public.meta_setup add column if not exists q7_completed_at timestamptz;

-- Note: an older column named q5_completed_at may still exist from the previous
-- schema. It's no longer used (step 5 is now a question) and can be left as-is,
-- or dropped if you prefer:
--   alter table public.meta_setup drop column if exists q5_completed_at;
