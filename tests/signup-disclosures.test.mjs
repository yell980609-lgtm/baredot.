import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import worker from '../_worker.js';
const request=new Request('https://example.com/member/signup.html');
for(const available of [true,false]){
 const response=await worker.fetch(request,{ASSETS:{fetch:async()=>available?new Response(await readFile(new URL('../terms-of-use.html',import.meta.url),'utf8')):new Response('Unavailable',{status:503})}},{});
 assert.equal(response.status,200);const html=await response.text();
 assert.equal((html.match(/data-signup-disclosure="/g)||[]).length,4);
 for(const id of ['signup-terms-content','signup-privacy-content','signup-marketing-content','signup-kakao-content']){assert(html.includes('aria-controls="'+id+'"'));assert(html.includes('id="'+id+'"'))}
 assert(!html.includes('연결 예정입니다'));assert(html.includes('수집·이용 목적:'));assert(html.includes('보유기간:'));assert(html.includes('동의 거부:'));
 assert(html.includes('/terms-of-use.html'));assert(html.includes('/privacy-policy.html'));
 if(available)assert(html.includes('제18조'));
}
console.log('PASS signup disclosures render all four panels and canonical terms with an asset failure fallback');
