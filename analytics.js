import {trackingConsentScript} from './tracking-consent.js';
import {metaPixelScript} from './meta-pixel.js';
import {analyticsPage} from './analytics-dashboard.js';
import {decorateAnalyticsProducts} from './analytics-products.js';
export {analyticsPage};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store'}});
const safeLabel=value=>typeof value==='string'&&value.length<=80&&/^[\p{L}\p{N} _./-]*$/u.test(value)?value.trim():'';
export function normalizeEvent(body,request){
 if(!body||body.consent!==true||!['visitor','session'].every(key=>/^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(body[key]||'')))throw new Error('Invalid event');
 const path=String(body.path||'');if(path.length>240||!/^\/(?:[a-zA-Z0-9._/-]*)(?:#(?:product|women|men|shop)[a-zA-Z0-9%_.-]*)?$/.test(path)||/^\/(?:admin|api|order|auth|login|signup|member|myshop|my-page|mypage)(?:\/|\.|$)/i.test(path))throw new Error('Invalid page');
 let source=safeLabel(body.source).toLowerCase();if(!source){try{const url=new URL(body.referrer||'');if(url.hostname!==new URL(request.url).hostname)source=url.hostname.slice(0,100)}catch{}}source=source||'direct / unknown';
 return {path,source,medium:safeLabel(body.medium),campaign:safeLabel(body.campaign),device:body.device==='mobile'?'mobile':'desktop'};
}
async function hashed(value,key){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key+'|'+value));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('')}
async function rest(env,path,options={}){const key=String(env.SUPABASE_SERVICE_ROLE_KEY||'').replace(/\s/g,'');if(!key)throw new Error('Analytics storage is not configured');const response=await fetch((env.SUPABASE_URL||'https://adltmckypuqwzbcuvuuh.supabase.co').replace(/\/$/,'')+'/rest/v1/'+path,{...options,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',...options.headers}});const data=await response.json().catch(()=>null);if(!response.ok){const error=new Error('통계 저장소를 확인해주세요.');error.setup=['PGRST202','PGRST205','42P01','42883'].includes(data?.code);throw error}return data}
export async function analyticsApi(request,env,requireAdmin){const url=new URL(request.url);
 if(url.pathname==='/api/analytics/status'){if(request.method!=='GET')return json({ready:false},405);try{await rest(env,'bare_analytics_events?select=id&limit=0');return json({ready:true})}catch{return json({ready:false})}}
 if(url.pathname==='/api/analytics/event'){
  if(request.method!=='POST')return json({message:'Method not allowed'},405);
  if(request.headers.get('origin')!==url.origin||Number(request.headers.get('content-length')||0)>4096)return json({message:'Invalid request'},400);
  if(/bot|crawler|spider|headless/i.test(request.headers.get('user-agent')||''))return new Response(null,{status:204});
  let body,event;try{const text=await request.text();if(text.length>4096)throw new Error();body=JSON.parse(text);event=normalizeEvent(body,request)}catch{return json({message:'Invalid event'},400)}
  try{const key=env.SUPABASE_SERVICE_ROLE_KEY||'';const [visitor_id,session_id]=await Promise.all([hashed(body.visitor,key),hashed(body.session,key)]);await rest(env,'bare_analytics_events',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({...event,visitor_id,session_id})});return new Response(null,{status:204})}catch{return json({message:'Analytics unavailable'},503)}
 }
 try{await requireAdmin(request,env)}catch{return json({message:'관리자 로그인이 필요합니다.'},403)}
 if(request.method!=='GET')return json({message:'Method not allowed'},405);
 const days=Number(url.searchParams.get('days')||7);if(![1,7,30].includes(days))return json({message:'기간을 확인해주세요.'},400);
 try{
 const report=await rest(env,'rpc/bare_analytics_report',{method:'POST',body:JSON.stringify({report_days:days})});
 let catalog=[],catalogUnavailable=false;
 try{catalog=await rest(env,'products?select=slug,name,images&limit=1000')}catch{catalogUnavailable=true}
 return json({...decorateAnalyticsProducts(report,Array.isArray(catalog)?catalog:[]),catalogUnavailable,upgradeRequired:report.report_version!==2});
 }catch(error){return json({message:error.message,setupRequired:!!error.setup},503)}
}
export const trackingScript=trackingConsentScript+`<script id="bare-analytics-tracking">(async()=>{if(/^\\/(admin|api|order|auth|login|signup|member|myshop|my-page|mypage|review|sandbox|cart|checkout|payment)(?:\\/|\\.|$)/i.test(location.pathname)||navigator.globalPrivacyControl||navigator.doNotTrack==='1')return;try{const status=await fetch('/api/analytics/status',{cache:'no-store'}).then(r=>r.json());if(!status.ready)return}catch{return}const consentKey='bare_analytics_consent',visitorKey='bare_analytics_visitor',sessionKey='bare_analytics_session';let consent=null,last='',session=null,visitorCache=null;const read=(store,key)=>{try{return JSON.parse(store.getItem(key))}catch{return null}},write=(store,key,value)=>{try{store.setItem(key,JSON.stringify(value))}catch{}};consent=window.bareTrackingConsent?.accepted('analytics')?'accepted':'rejected';function collect(){if(consent!=='accepted'||document.visibilityState==='hidden')return;const now=Date.now();let visitor=read(localStorage,visitorKey)||visitorCache;if(!visitor||now-visitor.created>90*86400000){visitor={id:crypto.randomUUID(),created:now};write(localStorage,visitorKey,visitor)}visitorCache=visitor;session=read(sessionStorage,sessionKey)||session;if(!session||now-session.last>1800000){const params=new URLSearchParams(location.search);session={id:crypto.randomUUID(),source:params.get('utm_source')||'',medium:params.get('utm_medium')||'',campaign:params.get('utm_campaign')||'',referrer:(()=>{try{return new URL(document.referrer).origin}catch{return''}})(),last:now}}session.last=now;write(sessionStorage,sessionKey,session);const hash=/^#(?:product|women|men|shop)[a-zA-Z0-9%_.-]*$/.test(location.hash)?location.hash:'';const path=location.pathname+hash;const dedup=session.id+'|'+path;if(dedup===last)return;last=dedup;fetch('/api/analytics/event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({consent:true,visitor:visitor.id,session:session.id,path,source:session.source,medium:session.medium,campaign:session.campaign,referrer:session.referrer,device:/Mobi|Android/i.test(navigator.userAgent)?'mobile':'desktop'}),keepalive:true}).catch(()=>{})}let timer;const queue=()=>{clearTimeout(timer);timer=setTimeout(collect,200)};addEventListener('bare-tracking-consent-change',()=>{consent=window.bareTrackingConsent?.accepted('analytics')?'accepted':'rejected';if(consent!=='accepted'){session=null;visitorCache=null;last=''}queue()});addEventListener('hashchange',queue);document.addEventListener('visibilitychange',queue);queue()})();</script>`+metaPixelScript;
