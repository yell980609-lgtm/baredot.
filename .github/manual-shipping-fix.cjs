const fs=require('fs');
const p='_worker.js';
let s=fs.readFileSync(p,'utf8');
if(!s.includes('bare-manual-shipping-save-v1')){
 const target="async function saveOrder(orderId){const body={fulfillment_status:$('#detail-status').value,tracking_company:$('#tracking-company').value,tracking_number:$('#tracking-number').value,customer_note:$('#customer-note').value,cancel_reason:$('#cancel-reason').value};await api('/api/admin/orders/'+encodeURIComponent(orderId),{method:'PATCH',body:JSON.stringify(body)});$('#drawer').classList.remove('is-open');await load()}";
 const replacement="async function saveOrder(orderId){const button=$('#save-order'),tracking=$('#tracking-number').value.trim(),selected=$('#detail-status').value,body={fulfillment_status:tracking&&['paid','confirmed','ready'].includes(selected)?'shipping':selected,tracking_company:$('#tracking-company').value.trim(),tracking_number:tracking,customer_note:$('#customer-note').value,cancel_reason:$('#cancel-reason').value};if(button){button.disabled=true;button.textContent='저장 중...'}try{await api('/api/admin/orders/'+encodeURIComponent(orderId),{method:'PATCH',body:JSON.stringify(body)});status('주문상태를 '+(labels[body.fulfillment_status]||body.fulfillment_status)+'으로 저장했습니다.');$('#drawer').classList.remove('is-open');await load()}catch(error){status('저장 실패: '+error.message);if(button){button.disabled=false;button.textContent='저장'}throw error}}";
 const patch='\n/* bare-manual-shipping-save-v1 */\nconst bareAdminOrdersManualShipping=adminOrdersPage;\nadminOrdersPage=function(env={}){return bareAdminOrdersManualShipping(env).replace('+JSON.stringify(target)+','+JSON.stringify(replacement)+')}\n';
 s+=patch;
}
fs.writeFileSync(p,s);
fs.rmSync('.github/manual-shipping-fix.cjs');
fs.rmSync('.github/workflows/manual-shipping-fix.yml');
