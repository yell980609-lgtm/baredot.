const legacySlugs={'product-halter-70000':'im-bared-halter-top','product-halter-69000':'im-bared-high-up-leggings','product-set':'im-bared-set-up','product-t-libbed-sleeveless':'t-libbed-sleeveless'};
const legacyNames={'product-halter-70000':"#I'M BARED HALTER TOP",'product-halter-69000':"#I'M BARED HIGH-UP LEGGINGS",'product-set':"[SET] #I'M BARED SET UP",'product-t-libbed-sleeveless':'RIBBED COVER-UP SLEEVELESS'};
export function decorateAnalyticsProducts(report,catalog=[]){
 const bySlug=new Map(catalog.map(p=>[p.slug,p]));
 const decorate=row=>{const key=row.product_key||row.path?.match(/#(product-[a-zA-Z0-9%_.-]+)$/)?.[1];if(!key)return row;let slug=key.startsWith('product-db-')?key.slice(11):legacySlugs[key]||key.slice(8);try{slug=decodeURIComponent(slug)}catch{}
 const product=bySlug.get(slug),images=Array.isArray(product?.images)?product.images:[],image=images.find(i=>i?.placement==='storefront-default')||images.find(i=>typeof i==='string'||(i?.url&&!['how-bared','product-review','storefront-hover'].includes(i.placement)));
 return {...row,path:'/#'+key,name:product?.name||legacyNames[key]||slug,image:typeof image==='string'?image:image?.url||'',catalog_missing:!product};};
 return {...report,products:(report.products||[]).map(decorate),pages:(report.pages||[]).map(decorate),landings:(report.landings||[]).map(decorate)};
}
