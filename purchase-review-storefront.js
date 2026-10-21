export const purchaseReviewStorefrontScript=String.raw`<script id="bare-purchase-review-storefront">(()=>{
 let active='';
 async function hydrate(){if(typeof productData==='undefined')return;const hash=location.hash,data=productData[hash];if(!data?.dynamic||!data.slug||data.purchase_reviews_loaded||active===hash)return;active=hash;
 try{const r=await fetch('/api/reviews/product/'+encodeURIComponent(data.slug),{cache:'no-store'});if(!r.ok)throw Error();const result=await r.json();if(!Array.isArray(result.reviews)||!Number.isSafeInteger(result.count)||result.count<0)throw Error();data.purchase_reviews=result.reviews;data.purchase_review_count=result.count;data.purchase_reviews_loaded=true;if(location.hash===hash&&typeof syncRoute==='function')syncRoute()}
 catch{if(location.hash===hash&&Number(data.purchase_review_count)>0){const list=document.querySelector('.review-list');if(list&&!list.querySelector('.purchase-review-load-error')){const note=document.createElement('p');note.className='purchase-review-load-error';note.textContent='구매 후기를 불러오지 못했습니다. 잠시 후 새로고침해주세요.';list.appendChild(note)}}}
 finally{if(active===hash)active=''}
 }
 addEventListener('hashchange',()=>setTimeout(hydrate,0));document.addEventListener('bare-catalog-loaded',()=>setTimeout(hydrate,0));setTimeout(hydrate,0);
})();</script>`;
