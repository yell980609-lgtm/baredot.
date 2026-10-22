export const CATEGORY_PAGES={
 '/women/all':{hash:'#women-all',title:'WOMEN / ALL',name:'WOMEN',description:'베어닷 여성 액티브웨어 전체 상품. 홀터탑, 레깅스, 티셔츠와 세트 상품을 만나보세요.',gender:'women'},
 '/women/top':{hash:'#women-top',title:'WOMEN / TOP',name:'WOMEN TOP',description:'베어닷 여성 액티브웨어 상의. 홀터탑과 슬리브리스, 티셔츠를 만나보세요.',gender:'women',kind:'top'},
 '/women/bottom':{hash:'#women-bottom',title:'WOMEN / BOTTOM',name:'WOMEN BOTTOM',description:'베어닷 여성 액티브웨어 하의. 움직임을 위한 레깅스와 팬츠를 만나보세요.',gender:'women',kind:'bottom'},
 '/men/all':{hash:'#men-all',title:'MEN / ALL',name:'MEN',description:'베어닷 남성 액티브웨어 전체 상품을 만나보세요.',gender:'men'},
 '/men/top':{hash:'#men-top',title:'MEN / TOP',name:'MEN TOP',description:'베어닷 남성 액티브웨어 상의와 슬리브리스를 만나보세요.',gender:'men',kind:'top'},
 '/men/bottom':{hash:'#men-bottom',title:'MEN / BOTTOM',name:'MEN BOTTOM',description:'베어닷 남성 액티브웨어 하의 상품을 확인하세요.',gender:'men',kind:'bottom'}
};
const origin='https://baredot.pages.dev';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json=value=>JSON.stringify(value).replace(/</g,'\\u003c');
const icons='<link rel="icon" type="image/png" sizes="1080x1080" href="/assets/baredot-logo.png"><link rel="apple-touch-icon" href="/assets/baredot-logo.png">';
export function categoryProducts(products,category){return products.filter(p=>{
 const type=String(p.category||'').toUpperCase(),words=[type,...(p.tags||[]),p.name||''].join(' ').toUpperCase();let gender='';
 if(p.slug==='im-bared-set-up'||type==='TOP'||type==='BOTTOM'||/WOMEN|WOMAN|WOMENS|여성|여자/.test(words))gender='women';else if(/MEN|MENS|남성|남자/.test(words))gender='men';
 const kind=/BOTTOM|LEGGINGS|PANTS|SHORTS|하의|레깅스|팬츠/.test(words)?'bottom':/TOP|SLEEVELESS|HALTER|BRA|SHIRT|TEE|나시|상의|탑/.test(words)?'top':'';
 return ['published','soldout'].includes(p.status)&&gender===category.gender&&(!category.kind||category.kind===kind);
}).sort((a,b)=>category.gender==='women'?((Number(a.sort_order)>0?Number(a.sort_order):Infinity)-(Number(b.sort_order)>0?Number(b.sort_order):Infinity)||0):0)}
function imageUrl(product){const images=Array.isArray(product.images)?product.images:[];const image=images.find(i=>i?.placement==='storefront-default')||images.find(i=>typeof i==='string'||(i?.url&&!['how-bared','product-review','storefront-hover'].includes(i.placement)));return typeof image==='string'?image:image?.url||''}
function serverCard(product){const href='/#product-db-'+encodeURIComponent(product.slug),image=imageUrl(product),price=Number(product.price||0),compare=Number(product.compare_price||0),money=n=>'₩'+n.toLocaleString('ko-KR');let src='';try{const u=new URL(image,origin);if(u.protocol==='https:')src=u.href}catch{}
 return '<a class="product-card" href="'+esc(href)+'"><figure><div class="product-image">'+(src?'<img src="'+esc(src)+'" alt="'+esc(product.name)+'" width="960" height="1200" loading="eager">':'')+'</div><figcaption class="product-info"><p class="product-name">'+esc(product.name)+'</p><strong class="product-price">'+(compare>price?'<s class="product-list-price">'+money(compare)+'</s> ':'')+money(price)+'</strong></figcaption></figure></a>';
}
export function withSearchSeo(html,path='/'){
 const page=CATEGORY_PAGES[path];const canonical=origin+(path==='/index.html'?'/':path),title=page?page.title+' | BARE. 베어닷':null;
 html=html.replace(/<link\b(?=[^>]*\brel=["'](?:canonical|icon|shortcut icon|apple-touch-icon)["'])[^>]*>/gi,'');
 let metadata=icons+'<link rel="canonical" href="'+canonical+'"><meta property="og:site_name" content="베어닷"><meta name="application-name" content="베어닷">';
 html=html.replace(/<meta property="og:url" content="[^"]*">/, '<meta property="og:url" content="'+canonical+'">');
 if(page){html=html.replace(/<title>[\s\S]*?<\/title>/,'<title>'+esc(title)+'</title>').replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="'+esc(page.description)+'">').replace(/<meta property="og:title" content="[^"]*">/,'<meta property="og:title" content="'+esc(title)+'">').replace(/<meta property="og:description" content="[^"]*">/,'<meta property="og:description" content="'+esc(page.description)+'">')}
 const organization={'@type':'Organization','@id':origin+'/#organization',name:'베어닷',alternateName:['BARE.','BAREDOT'],url:origin+'/',logo:{'@type':'ImageObject',url:origin+'/assets/baredot-logo.png',width:1080,height:1080},telephone:'0507-1417-1458',sameAs:['https://www.instagram.com/iambared_official/']};
 const graph=[organization,{'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'베어닷',alternateName:['BARE.','BAREDOT'],publisher:{'@id':organization['@id']}},{'@type':'ItemList',name:'베어닷 상품 카테고리',itemListElement:Object.entries(CATEGORY_PAGES).map(([p,c],i)=>({'@type':'ListItem',position:i+1,item:{'@type':'SiteNavigationElement',name:c.name,url:origin+p}}))}];
 if(page)graph.push({'@type':'CollectionPage',name:page.title,url:canonical,isPartOf:{'@id':origin+'/#website'}},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'베어닷',item:origin+'/'},{'@type':'ListItem',position:2,name:page.title,item:canonical}]});
 metadata+='<script type="application/ld+json" id="bare-search-identity">'+json({'@context':'https://schema.org','@graph':graph})+'</script>';
 html=html.replace('</head>',metadata+'</head>');
 for(const [p,c] of Object.entries(CATEGORY_PAGES))html=html.replaceAll('href="'+c.hash+'"','href="'+p+'"');
 const nav='<nav class="bare-category-links" aria-label="상품 카테고리">'+Object.entries(CATEGORY_PAGES).map(([p,c])=>'<a href="'+p+'">'+esc(c.name)+'</a>').join('')+'</nav>';
 html=html.replace('</head>','<style>.bare-category-links{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;padding:20px 18px;font:700 12px/1.5 InterDisplay,system-ui,sans-serif}.bare-category-links a{color:inherit;text-decoration:none}</style></head>').replace('<nav class="footer-links"',nav+'<nav class="footer-links"');
 return html;
}
export async function categoryPageResponse(request,category,path,{renderHome,loadProducts}){
 const home=await renderHome(new Request(new URL('/'+new URL(request.url).search,request.url),{headers:request.headers}));if(!home.ok)return home;
 let products=null;try{const result=await loadProducts();if(Array.isArray(result.products)&&!result.message)products=categoryProducts(result.products,category)}catch{}
 let html=withSearchSeo(await home.text(),path);
 const routeScript='<script id="bare-category-route">document.documentElement.classList.add("bare-category-boot");history.replaceState(null,"",location.pathname+location.search+'+json(category.hash)+');addEventListener("hashchange",()=>{if(location.hash!=='+json(category.hash)+')location.replace("/"+location.search+location.hash)});document.addEventListener("bare-catalog-loaded",()=>setTimeout(()=>{document.documentElement.classList.remove("bare-category-boot");document.getElementById("bare-category-server")?.remove()},0));document.addEventListener("bare-catalog-failed",()=>{document.documentElement.classList.remove("bare-category-boot");document.getElementById("bare-category-server")?.remove()});</script>';
 const routeStyle='<style id="bare-category-boot-style">.bare-category-boot .home-view,.bare-category-boot .product-detail,.bare-category-boot .collection-view{display:none!important}body>.intro-overlay{display:none!important}#bare-category-server{display:block;min-height:calc(100svh - var(--promo-height) - var(--topbar-height));padding:78px 0 96px;background:#f7f7f7}.bare-server-title{margin:0;font-size:clamp(24px,3vw,34px);line-height:1;text-transform:uppercase}</style>';
 // Run before existing route scripts; preserve the storefront and its review/cart behavior after hydration.
 html=html.replace(/<head>/,'<head><base href="/">'+routeScript+routeStyle).replace(/<body([^>]*)>/,function(_,attributes){return /class=/.test(attributes)?'<body'+attributes.replace(/class="([^"]*)"/,'class="$1 collection-route"')+'>':'<body'+attributes+' class="collection-route">'});
 const server='<section id="bare-category-server" class="bare-server-collection" aria-label="'+esc(category.title)+'"><div class="wrap"><div class="collection-head"><h1 class="bare-server-title">'+esc(category.title)+'</h1><a class="collection-back" href="/">← SHOP</a></div><div class="product-row">'+(products===null?'<p role="status">상품 목록을 잠시 불러오지 못했습니다. 새로고침해주세요.</p>':products.length?products.map(serverCard).join(''):'<p>현재 등록된 상품이 없습니다.</p>')+'</div></div></section>';
 html=html.replace('<main id="top">','<main id="top">'+server);
 if(products===null)html=html.replace('</head>','<meta name="robots" content="noindex"></head>');
 const headers=new Headers(home.headers);headers.delete('content-length');headers.set('cache-control','no-store');if(products===null)headers.set('retry-after','120');return new Response(html,{status:products===null?503:200,headers});
}
export function searchDiscoveryResponse(path){
 if(path==='/robots.txt')return new Response('User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /order/\nDisallow: /member/\nDisallow: /login\nDisallow: /signup\nDisallow: /auth/\nDisallow: /review\nDisallow: /my-page\nDisallow: /mypage\nDisallow: /myshop/\nSitemap: '+origin+'/sitemap.xml\n',{headers:{'content-type':'text/plain;charset=utf-8','cache-control':'public,max-age=3600'}});
 if(path==='/sitemap.xml'){const urls=['/',...Object.keys(CATEGORY_PAGES),'/about.html','/terms-of-use.html','/privacy-policy.html'];return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(p=>'<url><loc>'+origin+p+'</loc></url>').join('')+'</urlset>',{headers:{'content-type':'application/xml;charset=utf-8','cache-control':'public,max-age=3600'}})}
 return null;
}
