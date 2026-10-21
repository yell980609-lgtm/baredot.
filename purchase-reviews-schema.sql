-- Run once in the existing Supabase SQL Editor. No historical orders are modified.
begin;
create table if not exists public.bare_purchase_reviews (
 id uuid primary key default gen_random_uuid(),
 order_id text not null references public.orders(order_id) on delete cascade,
 order_item_id uuid not null unique references public.order_items(id) on delete cascade,
 product_slug text not null,
 author text not null,
 option_text text not null default '',
 rating integer not null check(rating between 1 and 5),
 body text not null check(char_length(body) between 10 and 2000),
 created_at timestamptz not null default now()
);
create index if not exists bare_purchase_reviews_product_idx on public.bare_purchase_reviews(product_slug,created_at desc);
alter table public.bare_purchase_reviews enable row level security;
revoke all on public.bare_purchase_reviews from anon,authenticated;
grant select on public.bare_purchase_reviews to service_role;
create or replace function public.bare_submit_purchase_review(p_order_id text,p_item_id uuid,p_rating integer,p_body text)
returns uuid language plpgsql security definer set search_path=public as $$
declare o public.orders; item public.order_items; target_slug text; matches integer; new_id uuid; masked_name text;
begin
 select * into o from public.orders where order_id=p_order_id for update;
 if not found or o.fulfillment_status<>'done' or o.payment_status<>'paid' then raise exception 'REVIEW_ORDER_UNAVAILABLE'; end if;
 select * into item from public.order_items where id=p_item_id and order_id=p_order_id;
 if not found then raise exception 'REVIEW_ITEM_UNAVAILABLE'; end if;
 select min(slug),count(*) into target_slug,matches from public.products where name=item.product_title;
 if matches<>1 then raise exception 'REVIEW_PRODUCT_UNLINKED'; end if;
 if p_rating is null or p_rating not between 1 and 5 or p_body is null or char_length(trim(p_body)) not between 10 and 2000 then raise exception 'REVIEW_INVALID_CONTENT'; end if;
 masked_name:=case when length(trim(coalesce(o.buyer_name,'')))>0 then left(trim(o.buyer_name),1)||'***' else '구매자' end;
 insert into public.bare_purchase_reviews(order_id,order_item_id,product_slug,author,option_text,rating,body)
 values(p_order_id,p_item_id,target_slug,masked_name,coalesce(item.option_text,''),p_rating,trim(p_body)) returning id into new_id;
 return new_id;
end $$;
revoke all on function public.bare_submit_purchase_review(text,uuid,integer,text) from public,anon,authenticated;
grant execute on function public.bare_submit_purchase_review(text,uuid,integer,text) to service_role;
create or replace function public.bare_public_review_counts()
returns jsonb language sql security definer set search_path=public as $$
 select coalesce(jsonb_agg(t),'[]'::jsonb) from (
 select r.product_slug,count(*) review_count from public.bare_purchase_reviews r
 join public.products p on p.slug=r.product_slug where p.status in ('published','soldout') group by r.product_slug
 ) t;
$$;
revoke all on function public.bare_public_review_counts() from public,anon,authenticated;
grant execute on function public.bare_public_review_counts() to service_role;
create or replace function public.bare_public_product_reviews(p_slug text)
returns jsonb language sql security definer set search_path=public as $$
 with reviews as (select r.* from public.bare_purchase_reviews r join public.products p on p.slug=r.product_slug where r.product_slug=p_slug and p.status in ('published','soldout')),
 recent as (select author,option_text as option,rating,body as text,to_char(created_at at time zone 'Asia/Seoul','YY.MM.DD.') as date,true as verified_purchase from reviews order by created_at desc,id desc limit 50)
 select jsonb_build_object('count',(select count(*) from reviews),'reviews',coalesce((select jsonb_agg(r) from recent r),'[]'::jsonb));
$$;
revoke all on function public.bare_public_product_reviews(text) from public,anon,authenticated;
grant execute on function public.bare_public_product_reviews(text) to service_role;
commit;
