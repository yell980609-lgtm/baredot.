-- BARE. admin MVP schema
-- Run this in Supabase SQL Editor, then set the Cloudflare env vars listed below.

create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_id text unique not null,
  payment_key text,
  buyer_name text,
  phone text,
  email text,
  address text,
  memo text,
  amount integer not null default 0,
  payment_method text,
  payment_status text not null default 'paid',
  fulfillment_status text not null default 'paid',
  raw_payment jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(order_id) on delete cascade,
  product_title text not null,
  option_text text,
  price integer not null default 0,
  quantity integer not null default 1,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  email text,
  category text not null default 'Q&A',
  message text not null,
  status text not null default 'new',
  admin_reply text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.inquiries enable row level security;

-- The site Worker uses SUPABASE_SERVICE_ROLE_KEY for admin/order writes.
-- Keep these tables private from anonymous browser reads.

create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_fulfillment_status_idx on public.orders(fulfillment_status);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists inquiries_created_at_idx on public.inquiries(created_at desc);
create index if not exists inquiries_status_idx on public.inquiries(status);

-- Required Cloudflare Pages/Worker environment variables:
-- TOSS_SECRET_KEY=test_sk_...
-- SUPABASE_URL=https://adltmckypuqwzbcuvuuh.supabase.co
-- SUPABASE_SERVICE_ROLE_KEY=...
-- ADMIN_EMAILS=owner@example.com,manager@example.com
