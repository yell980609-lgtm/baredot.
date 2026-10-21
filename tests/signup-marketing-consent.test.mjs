import assert from 'node:assert/strict';
import worker from '../_worker.js';
import {signupKakaoMarketingConsent,KAKAO_MARKETING_CONSENT_TEXT,KAKAO_MARKETING_CONSENT_VERSION} from '../signup-marketing-consent.js';
const fixed=new Date('2026-10-21T03:00:00.000Z');
for(const value of [undefined,false,'true','false',1,null]){const record=signupKakaoMarketingConsent({marketing_kakao:value},fixed);assert.equal(record.granted,false);assert.equal(record.consented_at,null)}
const granted=signupKakaoMarketingConsent({marketing_kakao:true},fixed);assert.equal(granted.consented_at,fixed.toISOString());assert.equal(granted.version,KAKAO_MARKETING_CONSENT_VERSION);
const realFetch=globalThis.fetch;const requests=[];
globalThis.fetch=async(url,options)=>{assert(String(url).endsWith('/auth/v1/admin/users'));requests.push(JSON.parse(options.body));return Response.json({id:'test-user'})};
const metadata={name:'테스트',phone:'010-1234-5678',address:'테스트 주소',contact_email:'test@example.com',marketing_sms:false,marketing_email:false};
try{
 for(const choice of [true,false,undefined,'true']){
  const response=await worker.fetch(new Request('https://example.com/api/auth/signup',{method:'POST',body:JSON.stringify({loginId:'test-member',password:'test-password',terms:true,privacy:true,metadata:{...metadata,marketing_kakao:choice,marketing_kakao_consent_at:'2000-01-01T00:00:00.000Z',marketing_kakao_consent_version:'tampered'}})}),{SUPABASE_SERVICE_ROLE_KEY:'test-service-key'},{});
  assert.equal(response.status,200);const saved=requests.at(-1),consent=saved.app_metadata.marketing_consent.kakao;
  assert.equal(saved.user_metadata.marketing_kakao,choice===true);assert.equal(consent.granted,choice===true);assert.equal(consent.text,KAKAO_MARKETING_CONSENT_TEXT);assert.equal(consent.source,'member_signup');assert.equal(saved.user_metadata.marketing_kakao_consent_version,KAKAO_MARKETING_CONSENT_VERSION);assert.equal(saved.user_metadata.marketing_sms,false);assert.equal(saved.user_metadata.marketing_email,false);
  if(choice===true){assert.equal(saved.user_metadata.marketing_kakao_consent_at,consent.consented_at);assert(Date.now()-Date.parse(consent.consented_at)<5000)}else assert.equal(saved.user_metadata.marketing_kakao_consent_at,null);
 }
 const response=await worker.fetch(new Request('https://example.com/api/auth/signup',{method:'POST',body:JSON.stringify({loginId:'test-member',password:'test-password',terms:false,privacy:true,metadata})}),{SUPABASE_SERVICE_ROLE_KEY:'test-service-key'},{});assert.equal(response.status,400);assert.equal(requests.length,4);
 console.log('PASS strict opt-in, optional opt-out signup, server timestamps/version, protected consent evidence and required terms');
}finally{globalThis.fetch=realFetch}
