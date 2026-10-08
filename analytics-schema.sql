-- Run once in the existing project's Supabase SQL Editor.
-- Analytics uses the Worker's existing SUPABASE_SERVICE_ROLE_KEY.
begin;
create table if not exists public.bare_analytics_events (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 visitor_id text not null check(visitor_id ~ '^[a-f0-9]{64}$'),
 session_id text not null check(session_id ~ '^[a-f0-9]{64}$'),
 path text not null check(length(path)<=240),
 source text not null check(length(source)<=100),
 medium text not null default '' check(length(medium)<=80),
 campaign text not null default '' check(length(campaign)<=80),
 device text not null check(device in ('mobile','desktop'))
);
create index if not exists bare_analytics_events_created_idx on public.bare_analytics_events(created_at);
alter table public.bare_analytics_events enable row level security;
revoke all on public.bare_analytics_events from anon, authenticated;
grant select,insert,delete on public.bare_analytics_events to service_role;
create or replace function public.bare_analytics_prune() returns trigger
language plpgsql security invoker set search_path=public as $$
begin
 delete from public.bare_analytics_events where created_at < now()-interval '90 days';
 return null;
end $$;
revoke all on function public.bare_analytics_prune() from public,anon,authenticated;
grant execute on function public.bare_analytics_prune() to service_role;
drop trigger if exists bare_analytics_prune_old on public.bare_analytics_events;
create trigger bare_analytics_prune_old before insert on public.bare_analytics_events
for each statement execute function public.bare_analytics_prune();
create or replace function public.bare_analytics_report(report_days integer default 7)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare result jsonb; cutoff timestamptz;
begin
 if report_days not in (1,7,30) then raise exception 'Invalid date range'; end if;
 -- Delete expired event records when administrators load a report.
 delete from public.bare_analytics_events where created_at < now()-interval '90 days';
 cutoff := ((now() at time zone 'Asia/Seoul')::date-(report_days-1))::timestamp at time zone 'Asia/Seoul';
 with events as (select * from public.bare_analytics_events where created_at>=cutoff),
 daily as (select (created_at at time zone 'Asia/Seoul')::date as "day",count(*) views,count(distinct visitor_id) visitors,count(distinct session_id) sessions from events group by 1),
 sessions as (select distinct on(session_id) session_id,source,medium,campaign,created_at from events order by session_id,created_at,id),
 sources as (select source,count(*) visits from sessions group by source order by visits desc,source),
 pages as (select path,count(*) views from events group by path order by views desc,path limit 20),
 devices as (select device,count(distinct visitor_id) visitors from events group by device),
 campaigns as (select source,medium,campaign,count(*) visits from sessions where campaign<>'' group by source,medium,campaign order by visits desc limit 20)
 select jsonb_build_object('days',report_days,'timezone','Asia/Seoul','views',(select count(*) from events),'visitors',(select count(distinct visitor_id) from events),'sessions',(select count(distinct session_id) from events),'daily',coalesce((select jsonb_agg(d order by d."day") from daily d),'[]'::jsonb),'sources',coalesce((select jsonb_agg(s) from sources s),'[]'::jsonb),'pages',coalesce((select jsonb_agg(p) from pages p),'[]'::jsonb),'devices',coalesce((select jsonb_agg(d) from devices d),'[]'::jsonb),'campaigns',coalesce((select jsonb_agg(c) from campaigns c),'[]'::jsonb)) into result;
 return result;
end $$;
revoke all on function public.bare_analytics_report(integer) from public,anon,authenticated;
grant execute on function public.bare_analytics_report(integer) to service_role;
commit;
