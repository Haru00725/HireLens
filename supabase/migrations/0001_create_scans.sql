-- HireLens: scans table
-- Run this in the Supabase SQL Editor after creating your project.

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists "pgcrypto";

create type scan_status as enum (
  'draft',
  'pending_payment',
  'payment_processing',
  'paid',
  'analyzing',
  'completed',
  'failed',
  'expired'
);

create table scans (
  id             uuid primary key default gen_random_uuid(),
  status         scan_status not null default 'draft',
  resume_text    text,
  job_description text,
  role_title     text,
  amount_paise   integer not null default 1900,
  currency       text not null default 'INR',

  razorpay_order_id   text unique,
  razorpay_payment_id text unique,
  payment_status      text,

  report_json    jsonb,
  error_code     text,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  expires_at     timestamptz not null,
  completed_at   timestamptz
);

-- Indexes
create index idx_scans_status on scans (status);
create index idx_scans_razorpay_order on scans (razorpay_order_id) where razorpay_order_id is not null;
create index idx_scans_expires_at on scans (expires_at) where status in ('draft', 'pending_payment');

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_scans_updated_at
  before update on scans
  for each row execute function update_updated_at();

-- Row Level Security
alter table scans enable row level security;

-- No public access: all operations go through service role key
-- (no RLS policies = deny all for anon/authenticated roles)
-- The service role key bypasses RLS, which is what our server routes use.
