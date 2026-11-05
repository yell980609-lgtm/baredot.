const TEMPLATE='KA01TP261020225219672R9Ijusi9A9b';
const CHANNEL='KA01PF261020224533772Gw69iBPVSIS';
const reply=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
function phone(value){let p=String(value||'').replace(/\D/g,'');if(p.startsWith('82'))p='0'+p.slice(2);return /^01[016789]\d{7,8}$/.test(p)?p:''}
export function shippingMessage(order,env={},testPhone){
 const to=phone(testPhone===undefined?order.phone:testPhone);
 if(!to)throw Error('수신 휴대폰 번호를 확인해주세요.');
 if(!order.buyer_name||!order.tracking_company||!order.tracking_number)throw Error('주문자명·택배사·송장번호를 모두 입력하고 저장해주세요.');
 if(order.payment_status==='cancelled'||order.fulfillment_status==='cancelled')throw Error('취소된 주문에는 배송 안내를 보낼 수 없습니다.');
 const sender=String(env.SOLAPI_SENDER||'').replace(/\D/g,'');
 return {to,type:'ATA',...(sender?{from:sender}:{}),kakaoOptions:{pfId:env.SOLAPI_KAKAO_CHANNEL_ID||CHANNEL,templateId:env.SOLAPI_SHIPPING_TEMPLATE_ID||TEMPLATE,disableSms:true,variables:{'#{고객명}':String(order.buyer_name),'#{주문번호}':String(order.order_id),'#{택배사}':String(order.tracking_company),'#{운송장번호}':String(order.tracking_number)}}};
}
async function authorization(env){const date=new Date().toISOString(),salt=crypto.randomUUID(),key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.SOLAPI_API_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']),signature=Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(date+salt))),b=>b.toString(16).padStart(2,'0')).join('');return 'HMAC-SHA256 apiKey='+env.SOLAPI_API_KEY+', date='+date+', salt='+salt+', signature='+signature}
// Persist only selected provider error fields, never headers or complete request/response payloads.
const RETRY='[미접수 확인·재시도 가능] ';
function providerReason(data,env,status){
 const failed=data?.failedMessageList?.[0]||{},parts=[failed.statusCode||data?.errorCode,failed.statusMessage||data?.errorMessage||data?.message].filter(v=>typeof v==='string'||typeof v==='number');
 let value=parts.length?parts.join(' · '):'HTTP '+status+' · 상세 사유를 반환하지 않았습니다.';
 for(const secret of [env.SOLAPI_API_KEY,env.SOLAPI_API_SECRET])if(secret)value=value.split(String(secret)).join('[비공개]');
 return value.replace(/[\r\n\x00-\x1f]/g,' ').slice(0,700);
}
function allUnregistered(data){const c=data?.groupInfo?.count;return Number(c?.total)===1&&Number(c?.registeredFailed)===1&&Number(c?.registeredSuccess)===0&&Number(c?.sentTotal||0)===0}
async function providerGet(path,env,fetcher){const r=await fetcher('https://api.solapi.com/'+path,{headers:{Authorization:await authorization(env)},signal:AbortSignal.timeout(10000)});const data=await r.json();if(!r.ok)throw Error(providerReason(data,env,r.status));return data}
async function diagnostics(env,history,rest,fetcher){
 const notes=[];
 if(history.some(r=>r.status==='rejected'&&!r.provider_id&&!String(r.message).startsWith(RETRY)))notes.push('기존 실패 건에 SOLAPI 접수 ID가 없어 사유를 복원할 수 없습니다. SOLAPI 발송 내역의 실패 사유를 확인해주세요.');
 if(!env.SOLAPI_API_KEY||!env.SOLAPI_API_SECRET)return ['SOLAPI API 키 설정이 필요합니다.'];
 for(const row of history.filter(r=>r.provider_id).slice(0,5)){
  try{const group=await providerGet('messages/v4/groups/'+encodeURIComponent(row.provider_id),env,fetcher),messages=await providerGet('messages/v4/groups/'+encodeURIComponent(row.provider_id)+'/messages?limit=10',env,fetcher),list=Object.values(messages.messageList||{}),detail=list.find(m=>m.statusMessage)||list[0],reason=detail?providerReason({failedMessageList:[detail]},env,200):row.message;
   const unregistered=allUnregistered({groupInfo:group}),accepted=Number(group.count?.registeredSuccess)>0||(list.length===1&&String(detail?.statusCode)==='2000');
   const status=accepted?'accepted':unregistered?'rejected':row.status;
   const note=(accepted?'SOLAPI 접수 확인 · ':unregistered?RETRY:'')+reason+(detail?.type?' · 메시지 유형: '+String(detail.type).slice(0,12):'')+(String(detail?.statusCode)==='2000'?' · 발송 대기 중이며 최종 도착 완료는 아닙니다.':'');
   const updated=await rest(env,'bare_shipping_notifications?id=eq.'+encodeURIComponent(row.id)+'&status=eq.'+encodeURIComponent(row.status),{method:'PATCH',body:JSON.stringify({status,message:note,updated_at:new Date().toISOString()})});if(updated?.length){row.message=note;row.status=status;}
  }catch(error){notes.push('기존 실패 건 조회: '+error.message)}
 }
 const checks=await Promise.allSettled([providerGet('cash/v1/balance',env,fetcher),providerGet('kakao/v2/templates/'+encodeURIComponent(env.SOLAPI_SHIPPING_TEMPLATE_ID||TEMPLATE),env,fetcher)]);
 const balance=checks[0],template=checks[1];
 if(balance.status==='fulfilled')notes.push('SOLAPI 잔액: '+Number(balance.value.balance||0).toLocaleString()+'원 / 포인트: '+Number(balance.value.point||0).toLocaleString()+'원');else notes.push('잔액 조회: '+balance.reason.message);
 if(template.status==='fulfilled'){
  const t=template.value;notes.push('템플릿 조회 성공'+(t.status?' · '+t.status:''));
  const vars=[...String(t.content||'').matchAll(/#\{[^}]+\}/g)].map(m=>m[0]);const expected=['#{고객명}','#{주문번호}','#{택배사}','#{운송장번호}'];const missing=[...new Set(vars)].filter(v=>!expected.includes(v));if(missing.length)notes.push('템플릿에 추가 변수가 있습니다: '+missing.join(', '));
  if(t.pfId&&t.pfId!==(env.SOLAPI_KAKAO_CHANNEL_ID||CHANNEL))notes.push('템플릿의 카카오 채널 ID와 서버 설정이 다릅니다.');
 }else notes.push('템플릿 조회: '+template.reason.message);
 return notes;
}
export async function shippingNotificationApi(request,env,id,{requireAdmin,rest,fetcher=fetch}){
 try{await requireAdmin(request,env)}catch{return reply({message:'관리자 로그인이 필요합니다.'},403)}
 if(!['GET','POST'].includes(request.method))return reply({message:'Method not allowed'},405);
 let order;try{[order]=await rest(env,'orders?order_id=eq.'+encodeURIComponent(id)+'&select=*&limit=1')}catch{return reply({message:'주문 정보를 불러오지 못했습니다.'},503)}
 if(!order)return reply({message:'주문을 찾을 수 없습니다.'},404);
 if(request.method==='GET'){
  let history=[],storageReady=true;try{history=await rest(env,'bare_shipping_notifications?order_id=eq.'+encodeURIComponent(id)+'&order=created_at.desc&limit=20')}catch{storageReady=false}
  const diagnosis=new URL(request.url).searchParams.get('diagnose')==='1'?await diagnostics(env,history,rest,fetcher):[];
  return reply({ok:true,diagnosis,storageReady,configured:!!(env.SOLAPI_API_KEY&&env.SOLAPI_API_SECRET),phone:order.phone||'',templateId:env.SOLAPI_SHIPPING_TEMPLATE_ID||TEMPLATE,history:history.map(r=>({id:r.id,status:r.status,is_test:r.is_test,to:r.recipient,created_at:r.created_at,message:r.message||''}))});
 }
 const body=await request.json().catch(()=>({})),isTest=body.mode==='test';
 if(body.confirmed!==true||!['test','live'].includes(body.mode))return reply({message:'발송 대상과 내용을 확인해주세요.'},400);
 if(!isTest&&order.fulfillment_status!=='shipping')return reply({message:'주문을 배송중으로 저장한 뒤 발송해주세요.'},409);
 let message;try{message=shippingMessage(order,env,isTest?body.testPhone:undefined)}catch(error){return reply({message:error.message},400)}
 if(!env.SOLAPI_API_KEY||!env.SOLAPI_API_SECRET)return reply({message:'SOLAPI API 키 설정을 확인해주세요.'},503);
 // Durable unique reservation: an uncertain request must never be automatically sent twice.
 const key=isTest?'test:'+id+':'+message.to:'shipping:'+id;
 let reservation;try{reservation=await rest(env,'bare_shipping_notifications?on_conflict=dedupe_key',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=representation'},body:JSON.stringify({order_id:id,dedupe_key:key,recipient:message.to,is_test:isTest,status:'sending'})})}catch{return reply({message:'발송 기록 테이블을 먼저 설치해주세요. 메시지는 보내지 않았습니다.'},503)}
 let record=reservation?.[0];
 if(!record){
  const prior=await rest(env,'bare_shipping_notifications?dedupe_key=eq.'+encodeURIComponent(key)+'&limit=1');
  const previous=prior?.[0];
  if(previous?.status==='rejected'&&String(previous.message).startsWith(RETRY)){
   const claimed=await rest(env,'bare_shipping_notifications?id=eq.'+encodeURIComponent(previous.id)+'&status=eq.rejected&message=eq.'+encodeURIComponent(previous.message),{method:'PATCH',body:JSON.stringify({status:'sending',message:null,provider_id:null,updated_at:new Date().toISOString()})});record=claimed?.[0];
  }
  if(!record)return reply({message:'이미 접수했거나 발송 결과 확인이 필요한 건입니다. SOLAPI 발송 내역을 확인해주세요.'},409);
 }
 const save=async(status,note,providerId)=>rest(env,'bare_shipping_notifications?id=eq.'+encodeURIComponent(record.id),{method:'PATCH',body:JSON.stringify({status,message:note,provider_id:providerId||null,updated_at:new Date().toISOString()})});
 try{
  const response=await fetcher('https://api.solapi.com/messages/v4/send-many/detail',{method:'POST',headers:{Authorization:await authorization(env),'Content-Type':'application/json'},body:JSON.stringify({messages:[message]}),signal:AbortSignal.timeout(15000)});
  const data=await response.json();
  const accepted=Number(data.groupInfo?.count?.registeredSuccess)>0;
  const failed=!accepted&&(data.failedMessageList?.length>0||Number(data.groupInfo?.count?.registeredFailed||0)>0);
  if((!response.ok&&!accepted)||failed){
   const retryable=allUnregistered(data)||(!response.ok&&[400,401,403,404,422].includes(response.status)&&typeof data.errorCode==='string'),certain=retryable||(!response.ok&&response.status>=400&&response.status<500),note=(retryable?RETRY:'')+providerReason(data,env,response.status);
   await save(certain?'rejected':'unknown',note,data.groupInfo?.groupId);return reply({message:'SOLAPI 발송 접수 실패: '+note},502);
  }
  const providerId=data.groupInfo?.groupId;
  if(!providerId)throw Error('Missing provider receipt');
  await save('accepted','SOLAPI 접수 완료 · 최종 도착 여부는 SOLAPI 발송 내역에서 확인하세요.',providerId);
  return reply({ok:true,status:'accepted',message:'SOLAPI에 접수했습니다. 최종 도착 여부는 SOLAPI 발송 내역에서 확인해주세요.'});
 }catch{try{await save('unknown','접수 결과 확인 필요 · 중복 발송을 막기 위해 재발송하지 않습니다. SOLAPI 발송 내역을 확인하세요.')}catch{}return reply({message:'접수 결과를 확정하지 못했습니다. SOLAPI 발송 내역을 먼저 확인해주세요.'},502)}
}
const script=String.raw`
const shippingOpenBase=openOrder;
openOrder=function(order){shippingOpenBase(order);const box=document.createElement('section');box.id='shipping-notification';box.style.cssText='border:1px solid #ddd;padding:14px;margin-top:18px';box.innerHTML='<h3>배송 시작 알림톡</h3><p style="font-size:12px">택배사·송장번호를 저장한 뒤 발송하세요. 회원 연결 없이 주문 연락처로 발송합니다.</p>';const status=document.createElement('p');status.style.cssText='font-size:12px;white-space:pre-line';status.textContent='발송 설정 확인 중…';const input=document.createElement('input');input.type='tel';input.placeholder='테스트 수신 번호 (본인 번호)';input.style.cssText='width:100%;height:38px;margin:8px 0';const test=document.createElement('button');test.type='button';test.className='btn secondary';test.textContent='입력한 번호로 테스트 발송';const live=document.createElement('button');live.type='button';live.className='btn';live.textContent='주문 연락처로 배송 안내 발송';live.style.marginTop='10px';const label=document.createElement('label');label.style.cssText='display:block;font-size:12px;margin:12px 0';const check=document.createElement('input');check.type='checkbox';label.append(check,document.createTextNode('수신 번호와 주문 정보를 확인했으며 실제 알림톡 발송에 동의합니다.'));const diagnose=document.createElement('button');diagnose.type='button';diagnose.className='btn secondary';diagnose.textContent='실패 사유·발송 설정 확인';diagnose.style.marginTop='10px';box.append(input,label,test,live,diagnose,status);document.getElementById('drawer-body').append(box);let ready=false,busy=false;const sync=()=>{test.disabled=!ready||busy||!check.checked||!input.value.trim();live.disabled=!ready||busy||!check.checked||order.fulfillment_status!=='shipping'};check.onchange=sync;input.oninput=sync;async function refresh(diagnoseNow=false){try{const data=await api('/api/admin/orders/'+encodeURIComponent(order.order_id)+'/shipping-notification'+(diagnoseNow?'?diagnose=1':''));ready=data.storageReady&&data.configured;status.textContent='주문 연락처: '+data.phone+'\n'+(!data.storageReady?'발송 기록 테이블 설치가 필요합니다.':!data.configured?'SOLAPI API 키 설정이 필요합니다.':data.history.length?data.history.map(r=>(r.is_test?'테스트':'주문 안내')+' · '+r.to+' · '+({sending:'접수 확인 중',accepted:'접수 완료',rejected:'접수 거절',unknown:'결과 확인 필요'}[r.status]||r.status)+'\n'+r.message).join('\n'):'발송 내역 없음');if(data.diagnosis?.length)status.textContent+='\n\n'+data.diagnosis.join('\n')}catch(error){status.textContent=error.message}sync()}diagnose.onclick=async()=>{diagnose.disabled=true;status.textContent='SOLAPI 설정과 실패 사유를 확인하고 있습니다…';try{await refresh(true)}finally{diagnose.disabled=false}};async function send(mode){busy=true;sync();status.textContent='발송 접수 중…';let result;try{result=await api('/api/admin/orders/'+encodeURIComponent(order.order_id)+'/shipping-notification',{method:'POST',body:JSON.stringify({mode,confirmed:check.checked,testPhone:input.value})})}catch(error){result={message:error.message}}finally{busy=false;check.checked=false;await refresh();status.textContent=result.message+'\n'+status.textContent;sync()}}test.onclick=()=>send('test');live.onclick=()=>send('live');sync();refresh()};
`;
export function withShippingNotificationAdmin(html){return html.replace('supabase.auth.getSession().then',()=>script+'supabase.auth.getSession().then')}
