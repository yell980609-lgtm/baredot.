import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const {PGlite}=await import(process.env.PGLITE_MODULE||'@electric-sql/pglite');const db=new PGlite();
try{
await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');const sql=await readFile(new URL('../analytics-schema.sql',import.meta.url),'utf8');await db.exec(sql);await db.exec(sql);
const insert=async(v,s,path,offset,source='instagram',campaign='story_event')=>db.query(`insert into bare_analytics_events(visitor_id,session_id,path,source,medium,campaign,device,created_at) values($1,$2,$3,$4,'social',$5,'mobile',now()+$6::interval)`,[v.repeat(64),s.repeat(64),path,source,campaign,offset]);
await insert('a','1','/','-1 hour');await insert('a','1','/#product-db-test-top','-50 minutes');await insert('a','1','/index.html#product-db-test-top','-40 minutes');await insert('a','2','/#product-db-test-top','-30 minutes','naver','');await insert('b','3','/#product-db-test-top','-20 minutes');await insert('b','3','/#women-all','-10 minutes');
await insert('a','4','/','-8 days');
let r=(await db.query('select bare_analytics_report(7) report')).rows[0].report;
assert.equal(r.report_version,2);assert.equal(r.views,6);assert.equal(r.visitors,2);assert.equal(r.sessions,3);assert.equal(r.products[0].product_key,'product-db-test-top');assert.equal(r.products[0].views,4);assert.equal(r.products[0].visitors,2);assert.equal(r.products[0].sessions,3);assert.equal(r.returning_visitors,1);assert.equal(r.first_time_visitors,1);assert.equal(r.previous.views,1);assert.equal(r.sources.find(x=>x.source==='instagram').visits,2);assert.equal(r.sources.find(x=>x.source==='naver').visitors,1);assert.equal(r.campaigns[0].visits,2);assert.equal(r.hourly.reduce((sum,x)=>sum+x.views,0),6);assert.equal(r.daily.reduce((sum,x)=>sum+x.views,0),6);assert.equal(r.landings.reduce((sum,x)=>sum+x.visits,0),3);
// A session spanning a reporting boundary retains its original source/entry page.
await db.query(`insert into bare_analytics_events(visitor_id,session_id,path,source,medium,campaign,device,created_at) values($1,$2,'/about.html','original-source','social','initial','desktop',((now() at time zone 'Asia/Seoul')::date-6)::timestamp at time zone 'Asia/Seoul'-interval '1 minute')`,['c'.repeat(64),'5'.repeat(64)]);
await insert('c','5','/#product-db-test-top','-5 minutes','changed-source','changed');
r=(await db.query('select bare_analytics_report(7) report')).rows[0].report;assert(r.sources.some(s=>s.source==='original-source'));assert(!r.sources.some(s=>s.source==='changed-source'));assert(r.landings.some(l=>l.path==='/about.html'));assert.equal(r.returning_visitors,2);
// Prior comparison has equal elapsed duration, and date bucketing uses Seoul.
assert(Math.abs((Date.parse(r.period_end)-Date.parse(r.period_start))-(Date.parse(r.previous_end)-Date.parse(r.previous_start)))<2);
await assert.rejects(()=>db.query('select bare_analytics_report(5)'));
await db.exec('set role anon');await assert.rejects(()=>db.query('select * from bare_analytics_events'));await assert.rejects(()=>db.query('select bare_analytics_report(7)'));await db.exec('reset role;set role authenticated');await assert.rejects(()=>db.query('select bare_analytics_report(7)'));await db.exec('reset role');
await insert('d','6','/','-91 days');await db.query('select bare_analytics_report(7)');assert.equal((await db.query(`select count(*)::int n from bare_analytics_events where visitor_id=$1`,['d'.repeat(64)])).rows[0].n,0);
console.log('PASS repeatable SQL, exact deduplication, product aliases, previous elapsed period, source attribution, landings, hourly, returning visitors, retention and access control');
}catch(e){console.error(e.message,e.detail||'',e.where||'');process.exitCode=1}finally{await db.close()}
