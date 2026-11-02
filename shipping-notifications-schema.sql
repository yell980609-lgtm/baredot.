-- Run once in Supabase SQL Editor. No existing order/member records are changed.
begin;
create table if not exists public.bare_shipping_notifications (
 id uuid primary key default gen_random_uuid(),
 order_id text not null,
 dedupe_key text not null unique,
 recipient text not null,
 is_test boolean not null default false,
 status text not null check(status in ('sending','accepted','rejected','unknown')),
 provider_id text,
 message text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.bare_shipping_notifications enable row level security;
revoke all on public.bare_shipping_notifications from public,anon,authenticated;
grant select,insert,update on public.bare_shipping_notifications to service_role;
commit;
