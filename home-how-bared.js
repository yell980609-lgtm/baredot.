export const homeHowBaredStyle=`<style id="bare-home-how-bared-style">
.home-how-bared{padding:0 0 72px;background:#fff;color:#050505}
.home-how-bared .wrap{width:min(1120px,calc(100% - 36px));margin-inline:auto}
.home-how-bared-head{margin-bottom:24px}
.home-view .shop-head h2,.home-how-bared h2{margin:0;font:900 clamp(28px,3.4vw,48px)/1 InterDisplay,Pretendard,sans-serif;letter-spacing:-.035em;transform:none!important;text-align:left}
.home-how-bared h2{font-size:clamp(14px,1.7vw,24px);text-transform:none}
.home-view h2.home-box-heading{display:inline-block;width:fit-content;max-width:100%;margin:0;padding:10px 16px;background:#050505;color:#fff;font:900 clamp(14px,1.7vw,24px)/1 InterDisplay,Pretendard,sans-serif!important;letter-spacing:-.035em;text-align:left;transform:none!important;text-transform:none}
.home-how-bared-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.home-how-bared-card{display:block;aspect-ratio:4/5;overflow:hidden;background:#f5f5f5}
.home-how-bared-card img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .2s}
.home-how-bared-card:focus-visible{outline:3px solid #111;outline-offset:3px}
.home-how-bared-empty{margin:0;color:#777;font:14px/1.6 system-ui}
@media(hover:hover){.home-how-bared-card:hover img{transform:scale(1.025)}}
@media(prefers-reduced-motion:reduce){.home-how-bared-card img{transition:none}}
@media(max-width:860px){.home-view .shop-section>.wrap{width:calc(100% - 32px)!important}.home-view .shop-section .product-row{margin-inline:0!important;padding-inline:0!important}.home-how-bared{padding-bottom:44px}.home-how-bared .wrap{width:calc(100% - 32px)}.home-how-bared-head{margin-bottom:18px}.home-how-bared-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}}
</style>`;
export const homeHowBaredScript=`<script id="bare-home-how-bared-script">(()=>{
 const shop=document.querySelector('.home-view .shop-section');if(!shop)return;
 let section=document.getElementById('home-how-bared');
 if(!section){section=document.createElement('section');section.className='home-how-bared';section.id='home-how-bared';section.setAttribute('aria-labelledby','home-how-bared-title');section.innerHTML='<div class="wrap"><div class="home-how-bared-head"><h2 class="home-box-heading" id="home-how-bared-title">How to be Bared</h2></div><div class="home-how-bared-grid" aria-busy="true"></div></div>';shop.after(section)}
 const grid=section.querySelector('.home-how-bared-grid');let products=null,gallery=null,settingsReady=false;
 const validUrl=value=>{try{const url=new URL(value,location.origin);return /^https?:$/.test(url.protocol)?url.href:''}catch{return''}};
 function render(sourceProducts){
  products=sourceProducts;if(!settingsReady)return;
  const displayProducts=gallery?[{name:"BARE.",slug:"",images:gallery.items.map(item=>({...item,placement:"how-bared"}))}]:products;
  const seen=new Set(),fragment=document.createDocumentFragment();let count=0;
  for(const product of displayProducts){
   for(const item of Array.isArray(product.images)?product.images:[]){
    if(count>=4)continue;
    if(!item||typeof item!=='object'||item.placement!=='how-bared'||!item.url)continue;
    const image=validUrl(item.url);if(!image)continue;
    const internal=String(item.link||'').startsWith('#product-db-'),link=item.link&&item.link!=='#'?(internal?item.link:validUrl(item.link)):'';
    const href=link||(product.slug?'#product-db-'+encodeURIComponent(product.slug):'https://www.instagram.com/iambared_official/'),key=image+'|'+href;if(seen.has(key))continue;seen.add(key);
    const card=document.createElement('a');card.className='home-how-bared-card';card.href=href;card.setAttribute('aria-label',product.name+' 착용 사진 '+(link?'보기 (새 창)':'및 상품 보기'));
    if(link&&!internal){card.target='_blank';card.rel='noopener noreferrer'}
    const img=document.createElement('img');img.src=image;img.alt=product.name+' 착용 사진';img.loading='lazy';img.decoding='async';img.width=1080;img.height=1350;card.appendChild(img);fragment.appendChild(card);count++;
   }
  }
  grid.replaceChildren(fragment);grid.removeAttribute('aria-busy');
  if(!count){const empty=document.createElement('p');empty.className='home-how-bared-empty';empty.textContent='등록된 착용 사진이 없습니다.';grid.appendChild(empty)}
 }
 document.addEventListener('bare-catalog-loaded',event=>render(event.detail.products));
 document.addEventListener('bare-catalog-failed',()=>{grid.replaceChildren();grid.removeAttribute('aria-busy');const message=document.createElement('p');message.className='home-how-bared-empty';message.textContent='착용 사진을 불러오지 못했습니다. ';const retry=document.createElement('button');retry.type='button';retry.textContent='다시 불러오기';retry.addEventListener('click',()=>{retry.disabled=true;grid.setAttribute('aria-busy','true');window.bareReloadCatalog?.()});message.appendChild(retry);grid.appendChild(message)});
 if(Array.isArray(window.bareStorefrontProducts))products=window.bareStorefrontProducts;
 fetch('/api/site/home-gallery',{cache:'no-store'}).then(response=>{if(!response.ok)throw Error();return response.json()}).then(data=>gallery=data.gallery).catch(()=>{}).finally(()=>{settingsReady=true;if(products)render(products)});
})();</script>`;
