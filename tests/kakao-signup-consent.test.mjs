import assert from 'node:assert/strict';
import {startKakaoConsent,finishKakaoConsent,SOCIAL_TERMS_VERSION,socialIdentity} from '../kakao-signup-consent.js';
const env={SUPABASE_SERVICE_ROLE_KEY:'test-key'},config={url:'https://supabase.test',publicKey:'public'},user={id:'1234',name:'테스트',email:'test@example.com'};
const original=globalThis.fetch;let existing=null,updates=[],completed=[];
globalThis.fetch=async(url,options)=>{if(url.endsWith('/token?grant_type=password'))return existing?Response.json({user:existing}):Response.json({error_code:'invalid_credentials'},{status:400});assert(url.endsWith('/admin/users/user-id'));updates.push(JSON.parse(options.body));return Response.json({id:'user-id'})};
const complete=async(...args)=>{completed.push(args);return new Response('complete')};
const request=new Request('https://bare.test/api/auth/kakao/callback');
async function start(){const r=await startKakaoConsent(request,env,user,'/#women-all',config,complete);const html=await r.text();return {r,html,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:html.match(/name="csrf" value="([^"]+)"/)?.[1]}}
function post(pending,fields={},headers={}){return new Request('https://bare.test/api/auth/kakao/consent',{method:'POST',headers:{origin:'https://bare.test',cookie:pending.cookie,...headers},body:new URLSearchParams({csrf:pending.csrf,terms:'on',privacy:'on',...fields})})}
try{
 const identity=await socialIdentity(env,'kakao',user);assert.equal(identity.email,'kakao-1234@social.baredot.kr');
 let pending=await start();assert.equal(pending.r.headers.get('referrer-policy'),'strict-origin');assert.equal(completed.length,0);assert.equal((pending.html.match(/type="checkbox"/g)||[]).length,4);assert(pending.html.includes('[선택]'));assert(!pending.html.includes('type="checkbox" name="kakaoMarketing" checked'));assert(pending.r.headers.get('set-cookie').includes('HttpOnly'));assert(!pending.cookie.includes('test@example.com'));
 let r=await finishKakaoConsent(post(pending,{terms:''}),env,config,complete);assert.equal(r.status,400);assert.equal(completed.length,0);
 r=await finishKakaoConsent(post(pending,{}, {origin:'https://evil.test'}),env,config,complete);assert.equal(r.status,403);
 r=await finishKakaoConsent(post(pending,{}, {origin:'null'}),env,config,complete);assert.equal(r.status,403);
 r=await finishKakaoConsent(post(pending,{csrf:'tampered'}),env,config,complete);assert.equal(r.status,403);
 r=await finishKakaoConsent(post({...pending,cookie:pending.cookie+'tampered'}),env,config,complete);assert.equal(r.status,400);assert.equal(completed.length,0);
 r=await finishKakaoConsent(post(pending),env,config,complete);assert.equal(r.status,200);assert(r.headers.get('set-cookie').includes('Max-Age=0'));assert.equal(completed[0][3],'/#women-all');const evidence=completed[0][4];assert.equal(evidence.signup_consent.version,SOCIAL_TERMS_VERSION);assert.equal(evidence.marketing_consent.kakao.granted,false);assert(Date.now()-Date.parse(evidence.signup_consent.consented_at)<5000);
 existing={id:'user-id',user_metadata:{name:'기존 회원'},app_metadata:{provider:'email',marketing_consent:{sms:{granted:true}}}};
 pending=await start();assert(pending.csrf);r=await finishKakaoConsent(post(pending,{kakaoMarketing:'on'}),env,config,complete);assert.equal(r.status,200);assert.equal(updates.length,1);assert.equal(updates[0].app_metadata.provider,'email');assert.equal(updates[0].app_metadata.marketing_consent.sms.granted,true);assert.equal(updates[0].app_metadata.marketing_consent.kakao.granted,true);assert.equal(updates[0].user_metadata.name,'기존 회원');assert.equal(completed.at(-1)[4],undefined);
 existing.app_metadata=updates[0].app_metadata;pending=await start();assert.equal(pending.html,'complete');assert.equal(updates.length,1);
 console.log('PASS new/legacy/returning Kakao members, required consent, optional marketing, protected evidence, encrypted pending identity, CSRF, tampering and return URL');
}finally{globalThis.fetch=original}
// Exercise the actual Worker callback and account creation with mocked providers.
const {default:worker}=await import('../_worker.js');let created;
globalThis.fetch=async(url,options)=>{
 if(url==='https://kauth.kakao.com/oauth/token')return Response.json({access_token:'test-kakao-token'});
 if(url==='https://kapi.kakao.com/v2/user/me')return Response.json({id:1234,kakao_account:{profile:{nickname:'테스트'},email:'test@example.com'}});
 if(url.endsWith('/token?grant_type=password'))return Response.json({error_code:'invalid_credentials'},{status:400});
 if(url.endsWith('/admin/users')){created=JSON.parse(options.body);return Response.json({id:'created-test-user'})}
 throw Error('Unexpected request '+url);
};
try{
 const callback=await worker.fetch(new Request('https://bare.test/api/auth/kakao/callback?code=test'),{...env,KAKAO_REST_API_KEY:'test'},{});const html=await callback.text();assert.equal(created,undefined);assert(html.includes('동의하고 시작하기'));const pending={cookie:callback.headers.get('set-cookie').split(';')[0],csrf:html.match(/name="csrf" value="([^"]+)"/)[1]};
 const result=await worker.fetch(post(pending,{kakaoMarketing:'on'}),env,{});assert.equal(result.status,200);assert((await result.text()).includes('signInWithPassword'));assert.equal(created.email,'kakao-1234@social.baredot.kr');assert.equal(created.app_metadata.signup_consent.terms,true);assert.equal(created.app_metadata.marketing_consent.kakao.granted,true);assert.equal(created.user_metadata.marketing_kakao,true);
 console.log('PASS actual Worker Kakao callback gates account creation until server-validated consent');
}finally{globalThis.fetch=original}
