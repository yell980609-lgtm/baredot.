// Cancellation never trusts a browser-supplied payment key or refund amount.
export async function cancelAdminOrder(request,env,orderId,{requireAdmin,rest,fetchPayment=fetch}){
 const reply=(body,status=200)=>Response.json(body,{status,headers:{'cache-control':'no-store'}});
 try{await requireAdmin(request,env)}catch{return reply({message:'관리자 로그인이 필요합니다.'},403)}
 if(request.method!=='POST')return reply({message:'Method not allowed'},405);
 const body=await request.json().catch(()=>null),reason=String(body?.reason||'').trim();
 if(!reason||reason.length>200)return reply({message:'취소 사유를 1~200자로 입력해주세요.'},400);
 let order;
 try{[order]=await rest(env,'orders?order_id=eq.'+encodeURIComponent(orderId)+'&select=*&limit=1')}catch{return reply({message:'주문 정보를 불러오지 못했습니다.'},503)}
 if(!order)return reply({message:'주문을 찾을 수 없습니다.'},404);
 if(order.payment_status==='cancelled'&&order.fulfillment_status==='cancelled')return reply({ok:true,alreadyCancelled:true});
 if(order.tracking_number||!['paid','confirmed','ready','cancel_requested','cancelled'].includes(order.fulfillment_status))return reply({message:'배송이 시작되었거나 취소할 수 없는 주문입니다. 반품 절차를 이용해주세요.'},409);
 if(!order.payment_key)return reply({message:'연결된 결제 정보가 없습니다. 실제 결제한 곳에서 취소·환불을 처리해주세요.'},409);
 if(!env.TOSS_SECRET_KEY)return reply({message:'결제 취소 설정이 준비되지 않았습니다.'},503);
 const headers={Authorization:'Basic '+btoa(env.TOSS_SECRET_KEY+':'),'Content-Type':'application/json'};
 let payment;
 try{
  const response=await fetchPayment('https://api.tosspayments.com/v1/payments/'+encodeURIComponent(order.payment_key),{headers});
  payment=await response.json();if(!response.ok)throw Error(payment.message||'결제 정보를 확인하지 못했습니다.');
  if(payment.orderId!==order.order_id||Number(payment.totalAmount)!==Number(order.amount))return reply({message:'주문과 결제 정보가 일치하지 않아 취소하지 않았습니다.'},409);
  if(payment.status!=='CANCELED'){
   if(payment.status!=='DONE'||Number(payment.balanceAmount)!==Number(order.amount))return reply({message:'전액 취소 가능한 결제가 아닙니다. 토스 관리자에서 결제 상태를 확인해주세요.'},409);
   if(payment.method==='가상계좌')return reply({message:'가상계좌 환불은 환불계좌 확인이 필요합니다. 토스 관리자에서 처리해주세요.'},409);
   const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(order.order_id));
   const key='bare-cancel-'+Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('').slice(0,40);
   const canceled=await fetchPayment('https://api.tosspayments.com/v1/payments/'+encodeURIComponent(order.payment_key)+'/cancel',{method:'POST',headers:{...headers,'Idempotency-Key':key},body:JSON.stringify({cancelReason:reason})});
   payment=await canceled.json();if(!canceled.ok)throw Error(payment.message||'결제 취소에 실패했습니다.');
   if(payment.status!=='CANCELED')throw Error('결제 취소 완료를 확인하지 못했습니다. 토스 관리자에서 확인해주세요.');
  }
 }catch(error){return reply({message:error.message||'결제사 연결에 실패했습니다. 잠시 후 다시 시도해주세요.'},502)}
 try{
  const rows=await rest(env,'orders?order_id=eq.'+encodeURIComponent(order.order_id),{method:'PATCH',body:JSON.stringify({payment_status:'cancelled',fulfillment_status:'cancelled',cancel_reason:reason,raw_payment:payment,updated_at:new Date().toISOString()})});
  if(!rows?.length)throw Error('Missing order');
 }catch{return reply({message:'결제는 취소됐지만 주문 상태 저장에 실패했습니다. 같은 버튼을 다시 눌러 상태를 동기화해주세요. 중복 환불은 진행하지 않습니다.'},503)}
 return reply({ok:true,message:'결제 전액 취소 및 주문 취소가 완료되었습니다.'});
}
export const cancellationAdminScript=`
const openOrderBeforeCancellation=openOrder;
openOrder=function(order){
 openOrderBeforeCancellation(order);
 document.querySelector('[data-status="cancelled"]')?.remove();
 const option=document.querySelector('#detail-status option[value="cancelled"]');if(option)option.disabled=true;
 if(order.fulfillment_status==='cancelled')document.getElementById('detail-status').disabled=true;
 const row=document.querySelector('#drawer-body .save-row');if(!row)return;
 const button=document.createElement('button');button.type='button';button.id='cancel-order';button.className='btn secondary';button.style.color='#b42318';
 const canceled=order.payment_status==='cancelled'&&order.fulfillment_status==='cancelled';
 button.textContent=canceled?'취소 완료':'주문 취소·환불';
 button.disabled=canceled||!!order.tracking_number||!['paid','confirmed','ready','cancel_requested','cancelled'].includes(order.fulfillment_status);
 row.prepend(button);
 button.addEventListener('click',async()=>{
  const reason=document.getElementById('cancel-reason').value.trim();
  if(!reason||reason.length>200){alert('취소/CS 사유에 취소 사유를 1~200자로 입력해주세요.');document.getElementById('cancel-reason').focus();return}
  if(!confirm('주문 '+order.order_id+'\\n결제금액 '+money(order.amount)+'을 전액 취소·환불합니다.\\n계속하시겠습니까?'))return;
  button.disabled=true;button.textContent='취소 처리 중...';
  try{await api('/api/admin/orders/'+encodeURIComponent(order.order_id)+'/cancel',{method:'POST',body:JSON.stringify({reason})});document.getElementById('drawer').classList.remove('is-open');await load();status('주문 취소 및 결제 전액 취소가 완료되었습니다.');alert('주문 취소 및 결제 전액 취소가 완료되었습니다.');}
  catch(error){alert(error.message);status(error.message);button.disabled=false;button.textContent='주문 취소·환불'}
 });
};
`;
