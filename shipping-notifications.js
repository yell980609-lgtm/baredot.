const TEMPLATE='KA01TP261020225219672R9Ijusi9A9b';
const CHANNEL='KA01PF261020224533772Gw69iBPVSIS';
const reply=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
function phone(value){let p=String(value||'').replace(/\D/g,'');if(p.startsWith('82'))p='0'+p.slice(2);return /^01[016789]\d{7,8}$/.test(p)?p:''}
export function shippingMessage(order,env={},testPhone){
 const to=phone(testPhone===undefined?order.phone:testPhone);
 if(!to)throw Error('수신 휴대폰 번호를 확인해주세요.');
 if(!order.buyer_name||!order.tracking_company||!order.tracking_number)throw Error('주문자명·택배사·송장번호를 모두 입력하고 저장해주세요.');
 if(order.payment_status==='cancelled'||order.fulfillment_status==='cancelled')throw Error('취소된 주문에는 배송 안내를 보낼 수 없습니다.');
 return {to,kakaoOptions:{pfId:env.SOLAPI_KAKAO_CHANNEL_ID||CHANNEL,templateId:env.SOLAPI_SHIPPING_TEMPLATE_ID||TEMPLATE,disableSms:true,variables:{'#{고객명}':String(order.buyer_name),'#{주문번호}':String(order.order_id),'#{택배사}':String(order.tracking_company),'#{운송장번호}':String(order.tracking_number)}}};
}
async function authorization(env){const date=new Date().toISOString(),salt=crypto.randomUUID(),key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.SOLAPI_API_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']),signature=Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(date+salt))),b=>b.toString(16).padStart(2,'0')).join('');return 'HMAC-SHA256 apiKey='+env.SOLAPI_API_KEY+', date='+date+', salt='+salt+', signature='+signature}
export async function shippingNotificationApi(request,env,id,{requireAdmin,rest,fetcher=fetch}){
 try{await requireAdmin(request,env)}catch{return reply({message:'관리자 로그인이 필요합니다.'},403)}
 if(!['GET','POST'].includes(request.method))return reply({message:'Method not allowed'},405);
 let order;try{[order]=await rest(env,'orders?order_id=eq.'+encodeURIComponent(id)+'&select=*&limit=1')}catch{return reply({message:'주문 정보를 불러오지 못했습니다.'},503)}
 if(!order)return reply({message:'주문을 찾을 수 없습니다.'},404);
 if(request.method==='GET'){
  let history=[],storageReady=true;try{history=await rest(env,'bare_shipping_notifications?order_id=eq.'+encodeURIComponent(id)+'&order=created_at.desc&limit=20')}catch{storageReady=false}
  return reply({ok:true,storageReady,configured:!!(env.SOLAPI_API_KEY&&env.SOLAPI_API_SECRET),phone:order.phone||'',templateId:env.SOLAPI_SHIPPING_TEMPLATE_ID||TEMPLATE,history:history.map(r=>({id:r.id,status:r.status,is_test:r.is_test,to:r.recipient,created_at:r.created_at,message:r.message||''}))});
 }
 const body=await request.json().catch(()=>({})),isTest=body.mode==='test';
 if(body.confirmed!==true||!['test','live'].includes(body.mode))return reply({message:'발송 대상과 내용을 확인해주세요.'},400);
 if(!isTest&&order.fulfillment_status!=='shipping')return reply({message:'주문을 배송중으로 저장한 뒤 발송해주세요.'},409);
 let message;try{message=shippingMessage(order,env,isTest?body.testPhone:undefined)}catch(error){return reply({message:error.message},400)}
 if(!env.SOLAPI_API_KEY||!env.SOLAPI_API_SECRET)return reply({message:'SOLAPI API 키 설정을 확인해주세요.'},503);
 // Durable unique reservation: an uncertain request must never be automatically sent twice.
 const key=isTest?'test:'+id+':'+message.to:'shipping:'+id;
 let reservation;try{reservation=await rest(env,'bare_shipping_notifications?on_conflict=dedupe_key',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=representation'},body:JSON.stringify({order_id:id,dedupe_key:key,recipient:message.to,is_test:isTest,status:'sending'})})}catch{return reply({message:'발송 기록 테이블을 먼저 설치해주세요. 메시지는 보내지 않았습니다.'},503)}
 if(!reservation?.length)return reply({message:'이미 접수했거나 발송 결과 확인이 필요한 건입니다. SOLAPI 발송 내역을 확인해주세요.'},409);
 const record=reservation[0];
 const save=async(status,note,providerId)=>rest(env,'bare_shipping_notifications?id=eq.'+encodeURIComponent(record.id),{method:'PATCH',body:JSON.stringify({status,message:note,provider_id:providerId||null,updated_at:new Date().toISOString()})});
 try{
  const response=await fetcher('https://api.solapi.com/messages/v4/send-many/detail',{method:'POST',headers:{Authorization:await authorization(env),'Content-Type':'application/json'},body:JSON.stringify({messages:[message]}),signal:AbortSignal.timeout(15000)});
  const data=await response.json();
  const failed=data.failedMessageList?.length>0||Number(data.groupInfo?.count?.registeredFailed||0)>0;
  if(!response.ok||failed){await save('rejected','SOLAPI에서 접수하지 못했습니다. SOLAPI 발송 내역과 템플릿 변수를 확인해주세요.',data.groupInfo?.groupId);return reply({message:'발송 접수가 거절되었습니다. SOLAPI에서 상세 사유를 확인해주세요.'},502)}
  const providerId=data.groupInfo?.groupId;
  if(!providerId)throw Error('Missing provider receipt');
  await save('accepted','SOLAPI 접수 완료 · 최종 도착 여부는 SOLAPI 발송 내역에서 확인하세요.',providerId);
  return reply({ok:true,status:'accepted',message:'SOLAPI에 접수했습니다. 최종 도착 여부는 SOLAPI 발송 내역에서 확인해주세요.'});
 }catch{try{await save('unknown','접수 결과 확인 필요 · 중복 발송을 막기 위해 재발송하지 않습니다. SOLAPI 발송 내역을 확인하세요.')}catch{}return reply({message:'접수 결과를 확정하지 못했습니다. SOLAPI 발송 내역을 먼저 확인해주세요.'},502)}
}
const script=String.raw`
const shippingOpenBase=openOrder;
openOrder=function(order){shippingOpenBase(order);const box=document.createElement('section');box.id='shipping-notification';box.style.cssText='border:1px solid #ddd;padding:14px;margin-top:18px';box.innerHTML='<h3>배송 시작 알림톡</h3><p style="font-size:12px">택배사·송장번호를 저장한 뒤 발송하세요. 회원 연결 없이 주문 연락처로 발송합니다.</p>';const status=document.createElement('p');status.style.cssText='font-size:12px;white-space:pre-line';status.textContent='발송 설정 확인 중…';const input=document.createElement('input');input.type='tel';input.placeholder='테스트 수신 번호 (본인 번호)';input.style.cssText='width:100%;height:38px;margin:8px 0';const test=document.createElement('button');test.type='button';test.className='btn secondary';test.textContent='입력한 번호로 테스트 발송';const live=document.createElement('button');live.type='button';live.className='btn';live.textContent='주문 연락처로 배송 안내 발송';live.style.marginTop='10px';const label=document.createElement('label');label.style.cssText='display:block;font-size:12px;margin:12px 0';const check=document.createElement('input');check.type='checkbox';label.append(check,document.createTextNode('수신 번호와 주문 정보를 확인했으며 실제 알림톡 발송에 동의합니다.'));box.append(input,label,test,live,status);document.getElementById('drawer-body').append(box);let ready=false,busy=false;const sync=()=>{test.disabled=!ready||busy||!check.checked||!input.value.trim();live.disabled=!ready||busy||!check.checked||order.fulfillment_status!=='shipping'};check.onchange=sync;input.oninput=sync;async function refresh(){try{const data=await api('/api/admin/orders/'+encodeURIComponent(order.order_id)+'/shipping-notification');ready=data.storageReady&&data.configured;status.textContent='주문 연락처: '+data.phone+'\n'+(!data.storageReady?'발송 기록 테이블 설치가 필요합니다.':!data.configured?'SOLAPI API 키 설정이 필요합니다.':data.history.length?data.history.map(r=>(r.is_test?'테스트':'주문 안내')+' · '+r.to+' · '+r.status+'\n'+r.message).join('\n'):'발송 내역 없음');}catch(error){status.textContent=error.message}sync()}async function send(mode){busy=true;sync();status.textContent='발송 접수 중…';let result;try{result=await api('/api/admin/orders/'+encodeURIComponent(order.order_id)+'/shipping-notification',{method:'POST',body:JSON.stringify({mode,confirmed:check.checked,testPhone:input.value})})}catch(error){result={message:error.message}}finally{busy=false;check.checked=false;await refresh();status.textContent=result.message+'\n'+status.textContent;sync()}}test.onclick=()=>send('test');live.onclick=()=>send('live');sync();refresh()};
`;
export function withShippingNotificationAdmin(html){return html.replace('supabase.auth.getSession().then',()=>script+'supabase.auth.getSession().then')}
