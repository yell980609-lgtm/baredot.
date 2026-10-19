export const homeSignatureStyle=`<style id="bare-home-signature-style">
.home-signature{padding:0 0 64px;background:#fff;color:#050505}
.home-view .home-signature>.wrap{width:min(1120px,calc(100% - 36px))!important;margin-inline:auto}
.home-signature-head{margin-bottom:24px}
.home-signature h2{display:inline-block;margin:0;padding:12px 20px;background:#050505;color:#fff;font:900 clamp(28px,3.4vw,48px)/1 InterDisplay,Pretendard,sans-serif;letter-spacing:-.035em}
.home-signature-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.home-signature-grid .product-card{min-width:0;width:100%}
@media(max-width:860px){.home-signature{padding-bottom:44px}.home-view .home-signature>.wrap{width:calc(100% - 32px)!important}.home-signature-head{margin-bottom:18px}.home-signature h2{padding:10px 14px;font-size:26px}.home-signature-grid{gap:6px}}
</style>`;
// Reuse storefront cards so price, sale rate, stock state and product links stay consistent.
export function renderHomeSignature(products,card){
 const shop=document.querySelector('.home-view .shop-section');if(!shop)return;
 let section=document.getElementById('home-signature');
 if(!section){section=document.createElement('section');section.id='home-signature';section.className='home-signature';section.setAttribute('aria-labelledby','home-signature-title');section.innerHTML='<div class="wrap"><div class="home-signature-head"><h2 id="home-signature-title">OUR SIGNATURE</h2></div><div class="home-signature-grid"></div></div>';shop.after(section)}
 const slugs=['signature-cut-out-halter-top-chocolate','im-bared-halter-top'];
 const chosen=slugs.map(slug=>products.find(product=>product.slug===slug)).filter(Boolean);
 section.querySelector('.home-signature-grid').innerHTML=chosen.map(product=>{const images=Array.isArray(product.images)?product.images:[],thumbnail=images.find(image=>image?.placement==='storefront-default')?.url;return card(thumbnail?{...product,images:[thumbnail,...images]}:product)}).join('');
 section.hidden=!chosen.length;
}
