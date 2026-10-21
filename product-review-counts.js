// Match the review source used in product details: managed reviews replace legacy ones.
export function productReviews(product,legacyReviews=[],hash=''){
 if(!product||hash==='#product-t-libbed-sleeveless')return [];
 const managed=Array.isArray(product.reviews)?product.reviews:(Array.isArray(product.images)?product.images:[]).filter(function(item){return item&&typeof item==='object'&&item.placement==='product-review'});
 if(managed.length)return managed;
 if(product.slug)return ['im-bared-halter-top','im-bared-high-up-leggings'].includes(product.slug)?legacyReviews:[];
 return product.dynamic?[]:legacyReviews;
}
const reviewCountStyle='<style id="bare-product-review-count-style">.product-card .product-image{position:relative}.product-card .product-review-count{position:absolute;right:8px;bottom:8px;z-index:2;display:block;margin:0;padding:4px 7px;border-radius:3px;background:rgba(255,255,255,.9);color:#111;font:500 12px/1.4 Pretendard,"Noto Sans KR",system-ui,sans-serif;white-space:nowrap;pointer-events:none}@media(max-width:860px){.product-card .product-review-count{right:6px;bottom:6px;padding:3px 6px;font-size:10px}}</style>';
export function withProductReviewCounts(html){
 const helpers='<script id="bare-product-review-count-helpers">window.bareProductReviewList=function(product,hash){return ('+productReviews.toString()+')(product,typeof customerReviews!=="undefined"&&Array.isArray(customerReviews)?customerReviews:[],hash)};window.bareProductReviewCountMarkup=function(product,hash){const count=window.bareProductReviewList(product,hash).length;return count?\'<p class="product-review-count">리뷰(\'+count+\')</p>\':""};</script>';
 return html
 .replace('</head>',reviewCountStyle+helpers+'</head>')
 .replace('<span class="wish" aria-hidden="true"></span>\'+(soldout?', '<span class="wish" aria-hidden="true"></span>\'+window.bareProductReviewCountMarkup(product)+(soldout?')
 .replace(/function productCardMarkup\(hash\)\{[^\r\n]+/,function(source){return source.replace('<span class="wish" aria-hidden="true"></span></div><figcaption class="product-info">','<span class="wish" aria-hidden="true"></span>\'+window.bareProductReviewCountMarkup(data,hash)+\'</div><figcaption class="product-info">')})
 .replace("const isLegacyWomenReview=/#product-db-im-bared-(halter-top|high-up-leggings)$/.test(location.hash),managedReviews=Array.isArray(data?.reviews)?data.reviews:[],reviews=managedReviews.length?managedReviews:(isLegacyWomenReview&&Array.isArray(customerReviews)?customerReviews:[]),list=","const reviews=window.bareProductReviewList(data,location.hash),list=");
}
