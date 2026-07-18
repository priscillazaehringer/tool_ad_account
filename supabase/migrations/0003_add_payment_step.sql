-- ---------------------------------------------------------------------------
-- Migration: add the Payment Method step (step 6).
--
-- Safe to run more than once. Fresh databases already get this column from
-- schema.sql. Adds one column that stores the payment-method question answer.
-- ---------------------------------------------------------------------------

alter table public.meta_setup add column if not exists payment_answer text;
