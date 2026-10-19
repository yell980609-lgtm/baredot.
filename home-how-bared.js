export const homeHowBaredStyle=`<style id="bare-home-how-bared-style">
.home-how-bared{padding:0 0 72px;background:#fff;color:#050505}
.home-how-bared .wrap{width:min(1120px,calc(100% - 36px));margin-inline:auto}
.home-how-bared-head{margin-bottom:24px}
.home-how-bared h2{margin:0;font:900 clamp(28px,3.4vw,48px)/1 InterDisplay,Pretendard,sans-serif;letter-spacing:-.035em}
.home-how-bared-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.home-how-bared-card{display:block;aspect-ratio:1;overflow:hidden;background:#f5f5f5}
.home-how-bared-card img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .2s}
.home-how-bared-card:focus-visible{outline:3px solid #111;outline-offset:3px}
.home-how-bared-empty{margin:0;color:#777;font:14px/1.6 system-ui}
@media(hover:hover){.home-how-bared-card:hover img{transform:scale(1.025)}}
@media(prefers-reduced-motion:reduce){.home-how-bared-card img{transition:none}}
@media(max-width:860px){.home-how-bared{padding-bottom:44px}.home-how-bared .wrap{width:calc(100% - 32px)}.home-how-bared-head{margin-bottom:18px}.home-how-bared-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}}
</style>`;
export const homeHowBaredScript=`<script id="bare-home-how-bared-script">(()=>{
 const shop=document.querySelector('.home-view .shop-section');if(!shop)return;
 let section=document.getElementById('home-how-bared');
 if(!section){section=document.createElement('section');section.className='home-how-bared';section.id='home-how-bared';section.setAttribute('aria-labelledby','home-how-bared-title');section.innerHTML='<div class="wrap"><div class="home-how-bared-head"><h2 id="home-how-bared-title">HOW TO BE BARED ?</h2></div><div class="home-how-bared-grid" aria-busy="true"></div></div>';shop.after(section)}
 const grid=section.querySelector('.home-how-bared-grid');
 const validUrl=value=>{try{const url=new URL(value,location.origin);return /^https?:$/.test(url.protocol)?url.href:''}catch{return''}};
 function render(products){
  const seen=new Set(),fragment=document.createDocumentFragment();let count=0;
  for(const product of products){
   for(const item of Array.isArray(product.images)?product.images:[]){
    if(!item||typeof item!=='object'||item.placement!=='how-bared'||!item.url)continue;
    const image=validUrl(item.url);if(!image)continue;
    const link=item.link&&item.link!=='#'?validUrl(item.link):'';
    const href=link||'#product-db-'+encodeURIComponent(product.slug),key=image+'|'+href;if(seen.has(key))continue;seen.add(key);
    const card=document.createElement('a');card.className='home-how-bared-card';card.href=href;card.setAttribute('aria-label',product.name+' 착용 사진 '+(link?'보기 (새 창)':'및 상품 보기'));
    if(link){card.target='_blank';card.rel='noopener noreferrer'}
    const img=document.createElement('img');img.src=image;img.alt=product.name+' 착용 사진';img.loading='lazy';img.decoding='async';img.width=600;img.height=600;card.appendChild(img);fragment.appendChild(card);count++;
   }
  }
  grid.replaceChildren(fragment);grid.removeAttribute('aria-busy');
  if(!count){const empty=document.createElement('p');empty.className='home-how-bared-empty';empty.textContent='등록된 착용 사진이 없습니다.';grid.appendChild(empty)}
 }
 document.addEventListener('bare-catalog-loaded',event=>render(event.detail.products));
 document.addEventListener('bare-catalog-failed',()=>{grid.replaceChildren();grid.removeAttribute('aria-busy');const message=document.createElement('p');message.className='home-how-bared-empty';message.textContent='착용 사진을 불러오지 못했습니다. ';const retry=document.createElement('button');retry.type='button';retry.textContent='다시 불러오기';retry.addEventListener('click',()=>{retry.disabled=true;grid.setAttribute('aria-busy','true');window.bareReloadCatalog?.()});message.appendChild(retry);grid.appendChild(message)});
 if(Array.isArray(window.bareStorefrontProducts))render(window.bareStorefrontProducts);
})();</script>`;
