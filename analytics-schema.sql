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
create index if not exists bare_analytics_events_session_idx on public.bare_analytics_events(session_id,created_at,id);
create index if not exists bare_analytics_events_visitor_idx on public.bare_analytics_events(visitor_id,created_at);
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
declare result jsonb; cutoff timestamptz; previous_start timestamptz; previous_end timestamptz; report_now timestamptz := now();
begin
 if report_days not in (1,7,30) then raise exception 'Invalid date range'; end if;
 delete from public.bare_analytics_events where created_at < report_now-interval '90 days';
 cutoff := ((report_now at time zone 'Asia/Seoul')::date-(report_days-1))::timestamp at time zone 'Asia/Seoul';
 previous_start := cutoff - make_interval(days=>report_days);
 previous_end := report_now - make_interval(days=>report_days);
 with events as (select * from public.bare_analytics_events where created_at>=cutoff and created_at<=report_now),
 previous as (select * from public.bare_analytics_events where created_at>=previous_start and created_at<=previous_end),
 daily as (select (created_at at time zone 'Asia/Seoul')::date as "day",count(*) views,count(distinct visitor_id) visitors,count(distinct session_id) sessions from events group by 1),
 session_starts as (select distinct on(e.session_id) e.session_id,e.source,e.medium,e.campaign,e.path,e.created_at from public.bare_analytics_events e where e.session_id in(select session_id from events) order by e.session_id,e.created_at,e.id),
 sources as (select s.source,count(distinct e.session_id) visits,count(distinct e.visitor_id) visitors,count(*) views from events e join session_starts s using(session_id) group by s.source order by visits desc,s.source),
 pages as (select path,count(*) views,count(distinct visitor_id) visitors,count(distinct session_id) sessions from events group by path order by views desc,path limit 50),
 product_events as (select *,substring(path from '#(product-[a-zA-Z0-9%_.-]+)$') product_key from events where path ~ '#product-[a-zA-Z0-9%_.-]+$'),
 products as (select product_key,count(*) views,count(distinct visitor_id) visitors,count(distinct session_id) sessions from product_events group by product_key order by views desc,product_key limit 20),
 landings as (select path,count(*) visits from session_starts group by path order by visits desc,path limit 20),
 devices as (select device,count(distinct visitor_id) visitors,count(distinct session_id) sessions from events group by device order by visitors desc,device),
 campaigns as (select s.source,s.medium,s.campaign,count(distinct e.session_id) visits,count(distinct e.visitor_id) visitors from events e join session_starts s using(session_id) where s.campaign<>'' group by s.source,s.medium,s.campaign order by visits desc,s.source,s.medium,s.campaign limit 30),
 hourly as (select extract(hour from created_at at time zone 'Asia/Seoul')::integer "hour",count(*) views,count(distinct visitor_id) visitors from events group by 1),
 first_seen as (select visitor_id,min(created_at) seen from public.bare_analytics_events where visitor_id in(select visitor_id from events) group by visitor_id)
 select jsonb_build_object(
 'last_event_at',(select max(created_at) from public.bare_analytics_events),'report_version',2,'days',report_days,'timezone','Asia/Seoul','generated_at',report_now,'period_start',cutoff,'period_end',report_now,
 'previous_start',previous_start,'previous_end',previous_end,
 'previous',jsonb_build_object('views',(select count(*) from previous),'visitors',(select count(distinct visitor_id) from previous),'sessions',(select count(distinct session_id) from previous)),
 'views',(select count(*) from events),'visitors',(select count(distinct visitor_id) from events),'sessions',(select count(distinct session_id) from events),
 'first_time_visitors',(select count(*) from first_seen where seen>=cutoff),'returning_visitors',(select count(*) from first_seen where seen<cutoff),
 'daily',coalesce((select jsonb_agg(d order by d."day") from daily d),'[]'::jsonb),
 'sources',coalesce((select jsonb_agg(s order by s.visits desc,s.source) from sources s),'[]'::jsonb),
 'pages',coalesce((select jsonb_agg(p order by p.views desc,p.path) from pages p),'[]'::jsonb),
 'products',coalesce((select jsonb_agg(p order by p.views desc,p.product_key) from products p),'[]'::jsonb),
 'landings',coalesce((select jsonb_agg(l order by l.visits desc,l.path) from landings l),'[]'::jsonb),
 'devices',coalesce((select jsonb_agg(d order by d.visitors desc,d.device) from devices d),'[]'::jsonb),
 'campaigns',coalesce((select jsonb_agg(c order by c.visits desc,c.source,c.medium,c.campaign) from campaigns c),'[]'::jsonb),
 'hourly',coalesce((select jsonb_agg(h order by h."hour") from hourly h),'[]'::jsonb)) into result;
 return result;
end $$;
revoke all on function public.bare_analytics_report(integer) from public,anon,authenticated;
grant execute on function public.bare_analytics_report(integer) to service_role;
commit;
