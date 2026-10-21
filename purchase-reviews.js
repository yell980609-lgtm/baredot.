import {purchaseReviewPage} from './purchase-review-page.js';
export {purchaseReviewPage};
const json=(body,status=200)=>Response.json(body,{status,headers:{'cache-control':'no-store','referrer-policy':'no-referrer'}});
const encoder=new TextEncoder();
const hex=bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
async function sign(env,message){const secret=String(env.REVIEW_LINK_SECRET||env.SUPABASE_SERVICE_ROLE_KEY||'').replace(/\s/g,'');if(!secret)throw Error('REVIEW_NOT_CONFIGURED');const key=await crypto.subtle.importKey('raw',encoder.encode('bare-purchase-review-v1:'+secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,encoder.encode(message)))}
export async function createReviewToken(env,orderId,now=Date.now()){const payload=btoa(JSON.stringify({orderId,exp:Math.floor(now/1000)+30*86400})).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');return payload+'.'+await sign(env,payload)}
export async function readReviewToken(env,token,now=Date.now()){if(typeof token!=='string'||token.length>1000)throw Error('INVALID_TOKEN');const [payload,signature,...extra]=token.split('.');if(extra.length||!payload||!/^[a-f0-9]{64}$/.test(signature||''))throw Error('INVALID_TOKEN');const expected=await sign(env,payload);let diff=0;for(let i=0;i<64;i++)diff|=signature.charCodeAt(i)^expected.charCodeAt(i);if(diff)throw Error('INVALID_TOKEN');const data=JSON.parse(atob(payload.replace(/-/g,'+').replace(/_/g,'/')));if(typeof data.orderId!=='string'||!data.orderId||data.orderId.length>160||!Number.isFinite(data.exp)||data.exp<Math.floor(now/1000))throw Error('INVALID_TOKEN');return data.orderId}
const eligible=o=>o?.fulfillment_status==='done'&&o?.payment_status==='paid';
export async function adminReviewLink(request,env,orderId,{rest,requireAdmin}){try{await requireAdmin(request,env)}catch{return json({message:'관리자 로그인이 필요합니다.'},403)}if(request.method!=='POST')return json({message:'Method not allowed'},405);try{const [order]=await rest(env,'orders?select=order_id,fulfillment_status,payment_status&order_id=eq.'+encodeURIComponent(orderId)+'&limit=1');if(!eligible(order))return json({message:'결제·배송이 완료된 주문에서만 리뷰 링크를 만들 수 있습니다.'},409);await rest(env,'bare_purchase_reviews?select=id&limit=0');const token=await createReviewToken(env,orderId);return json({url:new URL('/review',request.url).href+'#token='+token,expiresInDays:30})}catch{return json({message:'리뷰 저장소 설정을 확인해주세요. purchase-reviews-schema.sql 적용이 필요합니다.'},503)}}
export async function purchaseReviewApi(request,env,{rest}){
 const path=new URL(request.url).pathname;
 if(path.startsWith('/api/reviews/product/')){if(request.method!=='GET')return json({message:'Method not allowed'},405);let slug;try{slug=decodeURIComponent(path.slice('/api/reviews/product/'.length));if(!slug||slug.length>180)throw Error()}catch{return json({message:'상품 주소를 확인해주세요.'},400)}try{return json(await rest(env,'rpc/bare_public_product_reviews',{method:'POST',body:JSON.stringify({p_slug:slug})}))}catch{return json({message:'리뷰를 불러오지 못했습니다.'},503)}}
 if(!['GET','POST'].includes(request.method))return json({message:'Method not allowed'},405);
 if(request.method==='POST'&&request.headers.get('origin')!==new URL(request.url).origin)return json({message:'요청을 확인해주세요.'},403);
 let orderId;try{orderId=await readReviewToken(env,(request.headers.get('authorization')||'').replace(/^Bearer\s+/i,''))}catch{return json({message:'리뷰 링크가 만료되었거나 올바르지 않습니다. 고객센터에 새 링크를 요청해주세요.'},401)}
 try{
 const [order]=await rest(env,'orders?select=order_id,fulfillment_status,payment_status&order_id=eq.'+encodeURIComponent(orderId)+'&limit=1');if(!eligible(order))return json({message:'배송완료된 구매 상품에만 리뷰를 작성할 수 있습니다. 취소·반품 처리 중인 주문은 제외됩니다.'},409);
 if(request.method==='GET'){
 const [items,written]=await Promise.all([rest(env,'order_items?select=id,product_title,option_text,image_url&order_id=eq.'+encodeURIComponent(orderId)+'&order=created_at.asc'),rest(env,'bare_purchase_reviews?select=order_item_id&order_id=eq.'+encodeURIComponent(orderId))]);
 const names=[...new Set(items.map(i=>i.product_title))];let products=[];if(names.length){const filter=names.map(n=>'"'+String(n).replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'"').join(',');products=await rest(env,'products?select=slug,name&name=in.'+encodeURIComponent('('+filter+')')+'&limit=1000')}
 return json({items:items.map(i=>({id:i.id,title:i.product_title,option:i.option_text||'',image:i.image_url||'',written:written.some(r=>r.order_item_id===i.id),available:products.filter(p=>p.name===i.product_title).length===1}))});
 }
 if(Number(request.headers.get('content-length')||0)>12000)return json({message:'리뷰는 2,000자 이하로 입력해주세요.'},400);
 const text=await request.text();if(text.length>12000)return json({message:'리뷰는 2,000자 이하로 입력해주세요.'},400);let body;try{body=JSON.parse(text)}catch{return json({message:'입력 내용을 확인해주세요.'},400)}
 if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(body.itemId||'')||!Number.isInteger(body.rating)||body.rating<1||body.rating>5||typeof body.text!=='string'||[...body.text.trim()].length<10||[...body.text.trim()].length>2000)return json({message:'별점과 10~2,000자의 후기를 입력해주세요.'},400);
 await rest(env,'rpc/bare_submit_purchase_review',{method:'POST',body:JSON.stringify({p_order_id:orderId,p_item_id:body.itemId,p_rating:body.rating,p_body:body.text.trim()})});return json({ok:true,message:'소중한 후기를 남겨주셔서 감사합니다.'});
 }catch(error){const message=String(error.message||'');if(/duplicate|unique|23505/i.test(message))return json({message:'이미 리뷰를 작성한 상품입니다.'},409);if(/REVIEW_ORDER_UNAVAILABLE|REVIEW_ITEM_UNAVAILABLE/.test(message))return json({message:'리뷰를 작성할 수 없는 주문 또는 상품입니다.'},409);if(/REVIEW_PRODUCT_UNLINKED/.test(message))return json({message:'구매 상품 연결을 확인해야 합니다. 고객센터로 문의해주세요.'},409);return json({message:'리뷰 저장소를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.'},503)}
}
export async function withPurchaseReviewCounts(response,env,{rest}){if(!response.ok)return response;let data;try{data=await response.clone().json();if(!Array.isArray(data.products))return response;const counts=await rest(env,'rpc/bare_public_review_counts',{method:'POST',body:'{}'});const bySlug=new Map(counts.map(r=>[r.product_slug,Number(r.review_count||0)]));return json({...data,products:data.products.map(p=>({...p,purchase_review_count:bySlug.get(p.slug)||0}))})}catch{return response}}
export const purchaseReviewAdminScript=String.raw`
const openOrderBeforePurchaseReview=openOrder;
openOrder=function(order){
 openOrderBeforePurchaseReview(order);const row=document.querySelector('#drawer-body .save-row');if(!row)return;
 const eligible=order.fulfillment_status==='done'&&order.payment_status==='paid';
 const button=document.createElement('button');button.type='button';button.className='btn secondary';button.textContent='리뷰 작성 링크 복사';button.disabled=!eligible;row.prepend(button);
 const panel=document.createElement('section');panel.id='review-link-panel';panel.style.cssText='margin:16px 0;padding:16px;border:1px solid #ddd;background:#fafafa;overflow-wrap:anywhere';
 const message=document.createElement('p');message.id='review-link-status';message.setAttribute('role','status');message.setAttribute('aria-live','polite');message.style.margin='0';message.textContent=eligible?'버튼을 누르면 구매자 전용 리뷰 링크가 여기에 표시됩니다.':'결제완료·배송완료 상태의 주문에서만 리뷰 링크를 만들 수 있습니다.';panel.appendChild(message);row.before(panel);
 button.addEventListener('click',async()=>{
  button.disabled=true;button.textContent='리뷰 링크 생성 중…';message.style.color='';message.textContent='구매자 전용 링크를 생성하고 있습니다.';
  panel.querySelector('.review-link-result')?.remove();const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  try{
   const data=await api('/api/admin/orders/'+encodeURIComponent(order.order_id)+'/review-link',{method:'POST',signal:controller.signal});clearTimeout(timer);
   const url=new URL(data.url);if(url.origin!==location.origin||url.pathname!=='/review'||!url.hash.startsWith('#token='))throw Error('리뷰 링크를 확인하지 못했습니다. 다시 시도해주세요.');
   const result=document.createElement('div');result.className='review-link-result';const label=document.createElement('label');label.textContent='구매자 전용 리뷰 링크';label.style.cssText='display:block;margin-top:12px;font-size:12px';
   const input=document.createElement('input');input.id='review-link-value';input.readOnly=true;input.value=url.href;input.style.cssText='display:block;width:100%;min-width:0;margin:6px 0 12px;padding:10px;border:1px solid #bbb;background:white;font:12px/1.5 system-ui';label.appendChild(input);result.appendChild(label);
   const actions=document.createElement('div');actions.style.cssText='display:flex;gap:8px;flex-wrap:wrap';const copy=document.createElement('button');copy.type='button';copy.className='btn secondary';copy.textContent='링크 복사';const open=document.createElement('a');open.className='btn';open.textContent='리뷰 작성 화면 열기';open.href=url.href;open.target='_blank';open.rel='noopener noreferrer';actions.append(copy,open);result.appendChild(actions);
   const note=document.createElement('p');note.style.cssText='margin:12px 0 0;font-size:12px;color:#666';note.textContent='링크는 30일간 유효합니다. 해당 구매자에게만 전달해주세요. 실제 리뷰를 등록하면 상품에 공개됩니다.';result.appendChild(note);panel.appendChild(result);
   message.textContent='리뷰 링크를 생성했습니다. 아래에서 복사하거나 작성 화면을 열 수 있습니다.';
   async function copyLink(){try{if(!navigator.clipboard?.writeText)throw Error();await Promise.race([navigator.clipboard.writeText(input.value),new Promise((_,reject)=>setTimeout(()=>reject(Error('Clipboard timeout')),1500))]);if(!panel.isConnected)return;message.style.color='';message.textContent='리뷰 링크를 복사했습니다. 구매자에게 전달해주세요.';status('리뷰 링크를 복사했습니다.')}catch{if(!panel.isConnected)return;message.textContent='자동 복사가 제한되어 있습니다. 아래 링크를 선택한 뒤 Ctrl+C로 복사하거나 작성 화면을 열어주세요.';input.focus();input.select()}}
   copy.addEventListener('click',copyLink);void copyLink();
  }catch(e){message.style.color='#b42318';message.textContent=e.name==='AbortError'?'링크 생성 응답이 지연되고 있습니다. 잠시 후 다시 눌러주세요.':'리뷰 링크 생성 실패: '+e.message}
  finally{clearTimeout(timer);button.disabled=false;button.textContent='리뷰 작성 링크 복사'}
 });
};
`;
