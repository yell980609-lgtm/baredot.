export const homeShopCarouselStyle=`<style id="bare-home-shop-carousel-style">
.home-view .shop-section .shop-head{flex-direction:row;align-items:center;justify-content:flex-start;gap:12px!important;flex-wrap:wrap}
.home-view .shop-section .shop-tabs{width:auto;margin:0}
.home-shop-carousel{position:relative}
.home-view .shop-section .home-shop-carousel .product-row{display:flex!important;flex-wrap:nowrap!important;gap:6px!important;margin:0!important;padding:0 0 6px!important;width:100%;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scrollbar-width:none;overscroll-behavior-x:contain}
.home-shop-carousel .product-row::-webkit-scrollbar{display:none}
.home-view .shop-section .home-shop-carousel .product-card{flex:0 0 calc((100% - 18px)/4)!important;min-width:0;scroll-snap-align:start}
.home-shop-arrow{position:absolute;top:40%;z-index:3;display:grid;place-items:center;width:40px;height:40px;padding:0;border:1px solid #d4d4d4;border-radius:50%;background:#fff;color:#111;box-shadow:0 2px 10px #0002;cursor:pointer;transform:translateY(-50%)}
.home-shop-arrow svg{width:20px;height:20px}.home-shop-arrow:disabled{opacity:.3;cursor:default}.home-shop-arrow:focus-visible{outline:3px solid #111;outline-offset:3px}
.home-shop-arrow.previous{left:-20px}.home-shop-arrow.next{right:-20px}
@media(max-width:860px){.home-view .shop-section .shop-head{gap:10px!important}.home-view .shop-section .home-shop-carousel .product-card{flex-basis:calc((100% - 6px)/2)!important}.home-shop-arrow{width:32px;height:32px}.home-shop-arrow.previous{left:4px}.home-shop-arrow.next{right:4px}}
</style>`;
export const homeShopCarouselScript=`<script id="bare-home-shop-carousel-script">(()=>{
 const row=document.querySelector('.home-view .shop-section .product-row');if(!row||row.closest('.home-shop-carousel'))return;
 const wrapper=document.createElement('div');wrapper.className='home-shop-carousel';wrapper.setAttribute('role','region');wrapper.setAttribute('aria-label','NEW ARRIVALS 신상품');row.before(wrapper);wrapper.appendChild(row);row.id='home-shop-carousel-list';row.tabIndex=0;
 const buttons={};
 function move(direction){const card=row.querySelector('.product-card');if(!card)return;const gap=parseFloat(getComputedStyle(row).columnGap)||6;row.scrollBy({left:direction*(card.getBoundingClientRect().width+gap),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
 for(const [name,direction,label]of[['previous',-1,'이전 상품 보기'],['next',1,'다음 상품 보기']]){const button=document.createElement('button');button.type='button';button.className='home-shop-arrow '+name;button.setAttribute('aria-label',label);button.setAttribute('aria-controls',row.id);button.innerHTML='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="'+(direction<0?'M15 5l-7 7 7 7':'M9 5l7 7-7 7')+'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';button.addEventListener('click',()=>move(direction));buttons[name]=button;wrapper.appendChild(button)}
 function sync(){buttons.previous.disabled=row.scrollLeft<=2;buttons.next.disabled=row.scrollLeft+row.clientWidth>=row.scrollWidth-2}
 row.addEventListener('scroll',sync,{passive:true});row.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move(event.key==='ArrowLeft'?-1:1)}});
 new ResizeObserver(sync).observe(row);new MutationObserver(sync).observe(row,{childList:true,attributes:true,attributeFilter:['aria-busy']});sync();
})();</script>`;
