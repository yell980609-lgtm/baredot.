import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import worker from '../_worker.js';
const index=await readFile(new URL('../index.html',import.meta.url),'utf8');
const privacy=await readFile(new URL('../privacy-policy.html',import.meta.url),'utf8');
const original=globalThis.fetch;
globalThis.fetch=async url=>String(url).includes('/rest/v1/products?')?Response.json([]):new Response('{}',{status:503});
const env={SUPABASE_SERVICE_ROLE_KEY:'isolated-test',ASSETS:{fetch:async request=>new Response(new URL(request.url).pathname==='/privacy-policy.html'?privacy:index,{headers:{'content-type':'text/html;charset=utf-8'}})}};
try{
 for(const path of ['/','/women/all','/privacy-policy.html']){const response=await worker.fetch(new Request('https://baredot.pages.dev'+path),env,{}),html=await response.text();assert.equal(response.status,200,path);for(const id of ['bare-tracking-consent','bare-analytics-tracking','bare-meta-pixel'])assert.equal(html.split('<script id="'+id+'">').length-1,1,path+' '+id);assert(html.includes("fbq('init',pixel)"));assert(!html.includes('facebook.com/tr?id='),'noscript must not bypass consent');if(path==='/privacy-policy.html')assert(html.includes('Meta 광고 성과 측정 동의 철회'))}
 for(const path of ['/admin/orders','/member/login.html','/order/orderform.html','/review']){const html=await(await worker.fetch(new Request('https://baredot.pages.dev'+path),env,{})).text();assert(!html.includes('<script id="bare-meta-pixel">'),path)}
 console.log('PASS production worker injects consent + pixel exactly once on home/category/privacy, privacy controls and no consent-bypassing image; private pages excluded');
}finally{globalThis.fetch=original}
