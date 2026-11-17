export const FEATURED_COLLECTIONS={
 '/collections/signature':{key:'signature',title:'MEET OUR SIGNATURE',description:'베어닷 시그니처 초콜릿·네이비 할터탑 컬렉션'},
 '/collections/wine-pairing':{key:'wine',title:'WINE PAIRING EDITION',description:'래글런 탑, 폴딩 레깅스와 와인·블랙 라벨 할터탑 컬렉션'}
};
const normal=value=>String(value||'').toLowerCase().replace(/[^a-z0-9가-힣]/g,'');
export function featuredCollectionProducts(products,key){
 const rules=key==='signature'?[
  p=>p.slug==='signature-cut-out-halter-top-chocolate'||normal(p.name).includes('signaturecutouthaltertopchocolate'),
  p=>p.slug==='im-bared-halter-top'||normal(p.name)==='imbaredhaltertop'
 ]:[
  p=>normal(p.name).includes('slimraglanoffshoulder')&&normal(p.name).includes('babypurple'),
  p=>normal(p.name).includes('widefoldingleggings'),
  p=>normal(p.name).includes('labeldetailhaltertop')&&normal(p.name).includes('purplewine'),
  p=>normal(p.name).includes('labeldetailhaltertop')&&normal(p.name).endsWith('black')
 ];
 const chosen=[],seen=new Set();for(const match of rules)for(const p of products){if(!['published','soldout'].includes(p.status)||!p.slug||seen.has(p.slug)||!match(p))continue;chosen.push(p);seen.add(p.slug);break}return chosen;
}
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function productCard(p){
 const images=Array.isArray(p.images)?p.images:[],selected=images.find(i=>i?.placement==='storefront-default')||images.find(i=>typeof i==='string'||i?.url&&!['how-bared','product-review','storefront-hover','product-recommendations'].includes(i.placement));let image='';try{const u=new URL(typeof selected==='string'?selected:selected?.url,'https://baredot.pages.dev');if(['https:','http:'].includes(u.protocol))image=u.href}catch{}
 const amount=Number(p.price||0),compare=Number(p.compare_price||0),money=n=>'₩'+n.toLocaleString('ko-KR'),sale=compare>amount;
 return '<a class="featured-product" href="/#product-db-'+encodeURIComponent(p.slug)+'"><div class="featured-product-image">'+(image?'<img src="'+esc(image)+'" alt="'+esc(p.name)+'" width="960" height="1200" loading="lazy" decoding="async">':'')+(p.status==='soldout'?'<span class="featured-soldout">SOLD OUT</span>':'')+'</div><h2>'+esc(p.name)+'</h2><p>'+(sale?'<s>'+money(compare)+'</s><span class="featured-sale">'+Math.round((1-amount/compare)*100)+'% OFF</span>':'')+'<strong>'+money(amount)+'</strong></p></a>';
}
export async function featuredCollectionPage(request,collection,{renderHome,loadProducts}){
 const url=new URL(request.url),home=await renderHome(new Request(new URL('/',url),{headers:request.headers}));if(!home.ok)return home;
 let products=null;try{const data=await loadProducts();if(Array.isArray(data.products)&&!data.message)products=featuredCollectionProducts(data.products,collection.key)}catch{}
 let html=await home.text();
 html=html.replace(/<title>[\s\S]*?<\/title>/,()=>'<title>'+esc(collection.title)+' | BARE.</title>').replace(/<meta name="description" content="[^"]*">/,()=>'<meta name="description" content="'+esc(collection.description)+'">');
 html=html.replace(/<link rel="canonical"[^>]*>/g,'').replace(/<meta property="og:(?:title|description|url)"[^>]*>/g,'');
 const style=String.raw`<style id="bare-featured-collection-style">html.bare-featured-collection .home-view,html.bare-featured-collection .collection-view,html.bare-featured-collection .product-detail{display:none!important}.featured-collection{max-width:1280px;min-height:60vh;margin:0 auto;padding:42px 24px 72px;background:#fff}.featured-collection-head{display:flex;align-items:baseline;justify-content:space-between;gap:20px;margin-bottom:32px}.featured-collection-head h1{font:600 clamp(22px,3vw,36px)/1.15 Arial,sans-serif;letter-spacing:-.04em;margin:0}.featured-collection-head a{font:11px Arial,sans-serif;color:#111;text-decoration:none;white-space:nowrap}.featured-products{display:grid;grid-template-columns:repeat(var(--collection-columns),minmax(0,1fr));gap:18px}.featured-product{display:block;min-width:0;color:#111;text-decoration:none;text-align:center}.featured-product-image{position:relative;aspect-ratio:4/5;overflow:hidden;background:#f6f6f6}.featured-product-image img{display:block;width:100%;height:100%;object-fit:cover}.featured-product h2{margin:14px 0 8px;font:600 12px/1.5 Arial,sans-serif;overflow-wrap:anywhere}.featured-product p{display:flex;justify-content:center;align-items:center;gap:8px;flex-wrap:wrap;margin:0;font:11px/1.5 Arial,sans-serif}.featured-product s{color:#888}.featured-product strong{flex-basis:100%;font-size:13px}.featured-sale,.featured-soldout{background:#111;color:#fff;font:600 10px/1.4 Arial,sans-serif;padding:2px 5px}.featured-soldout{position:absolute;bottom:12px;left:12px}.featured-empty{font:14px/1.8 system-ui;color:#777}.featured-empty button{padding:8px 12px;background:white;border:1px solid #aaa;cursor:pointer}@media(max-width:640px){.featured-collection{padding:28px 16px 48px}.featured-collection-head{align-items:flex-start;margin-bottom:24px}.featured-collection-head h1{font-size:22px}.featured-products{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.featured-product h2{font-size:10px;margin-top:10px}.featured-product p{gap:5px}}</style>`;
 const metadata='<link rel="canonical" href="https://baredot.pages.dev'+esc(url.pathname)+'"><meta property="og:title" content="'+esc(collection.title)+' | BARE."><meta property="og:description" content="'+esc(collection.description)+'"><meta property="og:url" content="https://baredot.pages.dev'+esc(url.pathname)+'">';
 html=html.replace('<head>','<head><base href="/"><script>document.documentElement.classList.add("bare-featured-collection");</script>'+style+metadata+(products===null?'<meta name="robots" content="noindex">':''));
 const empty=products===null?'<p class="featured-empty" role="status">상품 목록을 불러오지 못했습니다. <button type="button" onclick="location.reload()">다시 불러오기</button></p>':'<p class="featured-empty">현재 등록된 상품이 없습니다.</p>';
 const section='<section class="featured-collection" aria-labelledby="featured-collection-title"><header class="featured-collection-head"><h1 id="featured-collection-title">'+esc(collection.title)+'</h1><a href="/">← SHOP</a></header><div class="featured-products" style="--collection-columns:'+Math.min(4,Math.max(2,products?.length||2))+'">'+(products?.length?products.map(productCard).join(''):empty)+'</div></section>';
 html=html.replace('<main id="top">',()=>'<main id="top">'+section);
 const headers=new Headers(home.headers);headers.delete('Content-Length');headers.delete('ETag');headers.delete('Last-Modified');headers.set('Cache-Control','no-store');if(products===null)headers.set('Retry-After','120');return new Response(html,{status:products===null?503:200,headers});
}
