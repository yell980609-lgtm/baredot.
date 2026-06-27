create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  payment_key text unique,
  status text not null default 'paid',
  amount integer not null default 0,
  method text,
  buyer_name text,
  buyer_phone text,
  shipping_address text,
  shipping_memo text,
  items jsonb not null default '[]'::jsonb,
  raw_payment jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_buyer_phone_idx on public.orders (buyer_phone);
create index if not exists orders_status_idx on public.orders (status);

alter table public.orders enable row level security;

drop policy if exists "service role can manage orders" on public.orders;
create policy "service role can manage orders"
on public.orders
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists "authenticated users can read own phone orders" on public.orders;
create policy "authenticated users can read own phone orders"
on public.orders
for select
using (
  auth.role() = 'authenticated'
  and buyer_phone = coalesce(auth.jwt() -> 'user_metadata' ->> 'phone', '')
);
