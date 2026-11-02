-- Run once in the project's Supabase SQL Editor. Safe to run again.
-- Existing members are not backfilled; only accounts created after activation receive 1,000 KRW.
begin;
create table if not exists public.bare_reward_settings (
 id boolean primary key default true check (id),
 enabled boolean not null default true,
 started_at timestamptz not null default now()
);
insert into public.bare_reward_settings(id) values(true) on conflict do nothing;
create table if not exists public.bare_reward_balances (
 user_id uuid primary key references auth.users(id) on delete cascade,
 balance integer not null default 0 check(balance>=0),
 updated_at timestamptz not null default now()
);
create table if not exists public.bare_reward_ledger (
 id bigint generated always as identity primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 amount integer not null,
 reason text not null,
 note text not null,
 created_at timestamptz not null default now()
);
create unique index if not exists bare_reward_signup_once on public.bare_reward_ledger(user_id) where reason='signup';
alter table public.bare_reward_settings enable row level security;
alter table public.bare_reward_balances enable row level security;
alter table public.bare_reward_ledger enable row level security;
revoke all on public.bare_reward_settings, public.bare_reward_balances, public.bare_reward_ledger from public, anon, authenticated;
grant select on public.bare_reward_settings, public.bare_reward_balances, public.bare_reward_ledger to service_role;
create or replace function public.bare_grant_signup_reward() returns trigger
language plpgsql security definer set search_path=public,pg_temp as $$
declare config public.bare_reward_settings; inserted integer;
begin
 select * into config from public.bare_reward_settings where id=true;
 if not found or not config.enabled or new.created_at<config.started_at then return new; end if;
 insert into public.bare_reward_ledger(user_id,amount,reason,note)
 values(new.id,1000,'signup','신규회원 가입 적립금') on conflict do nothing;
 get diagnostics inserted=row_count;
 if inserted>0 then
  insert into public.bare_reward_balances(user_id,balance) values(new.id,1000)
  on conflict(user_id) do update set balance=bare_reward_balances.balance+1000,updated_at=now();
 end if;
 return new;
end $$;
revoke all on function public.bare_grant_signup_reward() from public,anon,authenticated;
drop trigger if exists bare_signup_reward on auth.users;
create trigger bare_signup_reward after insert on auth.users for each row execute function public.bare_grant_signup_reward();
commit;
