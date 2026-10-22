export const homeSignatureStyle=`<style id="bare-home-signature-style">
.home-signature{padding:36px 0 44px;margin-bottom:64px;background:#050505;color:#fff}
.home-view .home-signature>.wrap{width:min(1120px,calc(100% - 36px))!important;margin-inline:auto}
.home-signature-head{margin-bottom:24px;margin-left:0;text-align:center}
.home-signature h2{margin:0;padding:0;color:#fff;font:900 clamp(14px,1.7vw,24px)/1 InterDisplay,Pretendard,sans-serif;letter-spacing:-.035em;text-transform:none}
@keyframes bare-signature-fade{0%,100%{opacity:.5}50%{opacity:1}}
.home-signature h2{animation:bare-signature-fade 8s ease-in-out infinite}
@media(prefers-reduced-motion:reduce){.home-signature h2{animation:none;opacity:1}}
.home-signature-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
.home-signature-grid .product-card{min-width:0;width:100%;color:#fff}
.home-signature-grid .product-card:first-child{grid-column:2}
.home-signature .product-name,.home-signature .product-price,.home-signature .product-sale-price{color:#fff!important}
.home-signature .product-list-price{color:#aaa!important}
.home-signature .product-discount-badge{background:#fff!important;color:#050505!important}
.home-signature .product-card:focus-visible{outline:2px solid #fff;outline-offset:4px}
@media(max-width:860px){.home-signature{padding:26px 0 32px;margin-bottom:44px}.home-view .home-signature>.wrap{width:calc(100% - 32px)!important}.home-signature-head{margin-bottom:18px;margin-left:0}.home-signature h2{font-size:13px}.home-signature-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.home-signature-grid .product-card:first-child{grid-column:auto}}
</style>`;
// Reuse storefront cards so price, sale rate, stock state and product links stay consistent.
export function renderHomeSignature(products,card){
 const shop=document.querySelector('.home-view .shop-section');if(!shop)return;
 let section=document.getElementById('home-signature');
 if(!section){section=document.createElement('section');section.id='home-signature';section.className='home-signature';section.setAttribute('aria-labelledby','home-signature-title');section.innerHTML='<div class="wrap"><div class="home-signature-head"><h2 id="home-signature-title">Meet our Signature</h2></div><div class="home-signature-grid"></div></div>';shop.after(section)}
 const slugs=['signature-cut-out-halter-top-chocolate','im-bared-halter-top'];
 const chosen=slugs.map(slug=>products.find(product=>product.slug===slug)).filter(Boolean);
 section.querySelector('.home-signature-grid').innerHTML=chosen.map(product=>{const images=Array.isArray(product.images)?product.images:[],thumbnail=images.find(image=>image?.placement==='storefront-default')?.url;return card(thumbnail?{...product,images:[thumbnail,...images]}:product)}).join('');
 section.hidden=!chosen.length;
}
