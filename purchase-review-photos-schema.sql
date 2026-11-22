-- Supabase SQL Editor: run once after purchase-reviews-schema.sql. Safe to rerun.
begin;
alter table public.bare_purchase_reviews add column if not exists media jsonb not null default '[]'::jsonb;
create or replace function public.bare_submit_purchase_review_with_media(p_order_id text,p_item_id uuid,p_rating integer,p_body text,p_media jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare new_id uuid;
begin
 if p_media is null or jsonb_typeof(p_media)<>'array' then raise exception 'REVIEW_INVALID_MEDIA'; end if;
 if jsonb_array_length(p_media)>5 or exists(select 1 from jsonb_array_elements(p_media) value where jsonb_typeof(value)<>'string' or length(value#>>'{}')>1000 or (value#>>'{}') !~ '^https://[^/]+/storage/v1/object/public/purchase-review-photos/[a-f0-9]{40}/[a-f0-9-]+[.](jpg|png|webp)$') then raise exception 'REVIEW_INVALID_MEDIA'; end if;
 new_id:=public.bare_submit_purchase_review(p_order_id,p_item_id,p_rating,p_body);
 update public.bare_purchase_reviews set media=p_media where id=new_id;
 return new_id;
end $$;
revoke all on function public.bare_submit_purchase_review_with_media(text,uuid,integer,text,jsonb) from public,anon,authenticated;
grant execute on function public.bare_submit_purchase_review_with_media(text,uuid,integer,text,jsonb) to service_role;
create or replace function public.bare_public_product_reviews(p_slug text)
returns jsonb language sql security definer set search_path=public as $$
 with reviews as (select r.* from public.bare_purchase_reviews r join public.products p on p.slug=r.product_slug where r.product_slug=p_slug and p.status in ('published','soldout')),
 recent as (select author,option_text as option,rating,body as text,media,to_char(created_at at time zone 'Asia/Seoul','YY.MM.DD.') as date,true as verified_purchase from reviews order by created_at desc,id desc limit 50)
 select jsonb_build_object('count',(select count(*) from reviews),'reviews',coalesce((select jsonb_agg(r) from recent r),'[]'::jsonb));
$$;
revoke all on function public.bare_public_product_reviews(text) from public,anon,authenticated;
grant execute on function public.bare_public_product_reviews(text) to service_role;
commit;
