import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createReviewToken,purchaseReviewApi} from '../purchase-reviews.js';
const {PGlite}=await import(process.env.PGLITE_MODULE||'@electric-sql/pglite');
const db=new PGlite(),env={REVIEW_LINK_SECRET:'isolated-photo-test'},item='123e4567-e89b-42d3-a456-426614174000',origin='https://bare.test';
try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create table orders(order_id text primary key,buyer_name text,fulfillment_status text,payment_status text);create table order_items(id uuid primary key,order_id text references orders(order_id),product_title text,option_text text);create table products(slug text primary key,name text,status text);insert into orders values('order-1','김고객','done','paid');insert into products values('top','탑','published');insert into order_items values('${item}','order-1','탑','M');`);
 for(const file of ['purchase-reviews-schema.sql','purchase-review-photos-schema.sql','purchase-review-photos-schema.sql'])await db.exec(await readFile(new URL('../'+file,import.meta.url),'utf8'));
 const storage=new Map();let uploadCount=0;
 const rest=async(_env,path,options)=>{
  if(path.startsWith('orders?'))return (await db.query('select * from orders')).rows;
  if(path.startsWith('order_items?'))return (await db.query('select id from order_items where id=$1 and order_id=$2',[new URLSearchParams(path.split('?')[1]).get('id').slice(3),new URLSearchParams(path.split('?')[1]).get('order_id').slice(3)])).rows;
  if(path==='bare_purchase_reviews?select=media&limit=0')return (await db.query('select media from bare_purchase_reviews limit 0')).rows;
  if(path.startsWith('bare_purchase_reviews?'))return (await db.query('select id from bare_purchase_reviews where order_item_id=$1',[new URLSearchParams(path.split('?')[1]).get('order_item_id').slice(3)])).rows;
  if(path==='rpc/bare_submit_purchase_review_with_media'){const b=JSON.parse(options.body);return (await db.query('select bare_submit_purchase_review_with_media($1,$2,$3,$4,$5)',[b.p_order_id,b.p_item_id,b.p_rating,b.p_body,JSON.stringify(b.p_media)])).rows}
  if(path==='rpc/bare_public_product_reviews')return (await db.query('select bare_public_product_reviews($1) value',[JSON.parse(options.body).p_slug])).rows[0].value;
  throw Error('Unexpected '+path);
 };
 const deps={rest,base:()=> 'https://project.supabase.co',headers:()=>({Authorization:'Bearer server-secret'}),fetch:async(url,options={})=>{
 assert.equal(options.headers.Authorization,'Bearer server-secret');
 if(url.includes('/bucket/'))return Response.json({});
 if(url.includes('/object/list/'))return Response.json([]);
 if(options.method==='POST'&&url.includes('/object/purchase-review-photos/')){uploadCount++;storage.set(url,options.body);return Response.json({})}throw Error(url)
 }};
 const token=await createReviewToken(env,'order-1');
 const auth={Authorization:'Bearer '+token,Origin:origin};
 const upload=async(id=item,bytes=Uint8Array.from([137,80,78,71,13,10,26,10,0]))=>{const body=new FormData();body.append('itemId',id);body.append('file',new Blob([bytes],{type:'image/png'}),'photo.png');return purchaseReviewApi(new Request(origin+'/api/reviews/photos',{method:'POST',headers:auth,body}),env,deps)};
 assert.equal((await upload('123e4567-e89b-42d3-a456-426614174001')).status,403);
 assert.equal((await upload(item,new TextEncoder().encode('<svg>bad</svg>'))).status,400);
 let response=await upload();assert.equal(response.status,200);const receipt=await response.json();assert.equal(uploadCount,1);assert(storage.size===1);
 const submit=media=>purchaseReviewApi(new Request(origin+'/api/reviews/order',{method:'POST',headers:{...auth,'Content-Type':'application/json'},body:JSON.stringify({itemId:item,rating:5,text:'직접 입어보니 정말 편안하고 좋습니다.',media})}),env,deps);
 assert.equal((await submit([{...receipt,url:'https://evil.test/a.png'}])).status,400);
 assert.equal((await submit(Array(6).fill(receipt))).status,400);
 assert.equal((await submit([receipt])).status,200);
 const saved=(await db.query('select * from bare_purchase_reviews')).rows;assert.equal(saved.length,1);assert.deepEqual(saved[0].media,[receipt.url]);assert.equal(saved[0].rating,5);
 assert.equal((await submit([receipt])).status,409);assert.equal((await upload()).status,409);
 const pub=await purchaseReviewApi(new Request(origin+'/api/reviews/product/top'),env,deps),data=await pub.json();assert.equal(data.count,1);assert.deepEqual(data.reviews[0].media,[receipt.url]);assert.equal(data.reviews[0].author,'김***');assert(!JSON.stringify(data).includes('order-1'));assert(!JSON.stringify(data).includes('proof'));
 console.log('PASS real PostgreSQL photo review save + public read, repeatable migration, stored bytes, purchase ownership, forged receipts, max count, duplicate submission and post-review upload blocked');
}finally{await db.close()}
