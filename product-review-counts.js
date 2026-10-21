// Match the review source used in product details: managed reviews replace legacy ones.
export function productReviews(product,legacyReviews=[],hash=''){
 if(!product||hash==='#product-t-libbed-sleeveless')return [];
 const managed=Array.isArray(product.reviews)?product.reviews:(Array.isArray(product.images)?product.images:[]).filter(function(item){return item&&typeof item==='object'&&item.placement==='product-review'});
 if(managed.length)return managed;
 if(product.slug)return ['im-bared-halter-top','im-bared-high-up-leggings'].includes(product.slug)?legacyReviews:[];
 return product.dynamic?[]:legacyReviews;
}
const reviewCountStyle='<style id="bare-product-review-count-style">.product-card .product-review-count{display:block;margin:6px 0 0;color:inherit;opacity:.75;font:500 12px/1.5 Pretendard,"Noto Sans KR",system-ui,sans-serif;text-align:center}@media(max-width:860px){.product-card .product-review-count{margin-top:5px;font-size:10px}}</style>';
export function withProductReviewCounts(html){
 const helpers='<script id="bare-product-review-count-helpers">window.bareProductReviewList=function(product,hash){return ('+productReviews.toString()+')(product,typeof customerReviews!=="undefined"&&Array.isArray(customerReviews)?customerReviews:[],hash)};window.bareProductReviewCountMarkup=function(product,hash){const count=window.bareProductReviewList(product,hash).length;return count?\'<p class="product-review-count">리뷰(\'+count+\')</p>\':""};</script>';
 return html
 .replace('</head>',reviewCountStyle+helpers+'</head>')
 .replace("money(price)+'</strong>')+'</figcaption></figure></a>'}","money(price)+'</strong>')+window.bareProductReviewCountMarkup(product)+'</figcaption></figure></a>'}")
 .replace("formatWon(data.price)+'</strong>')+'</figcaption></figure></a>'}","formatWon(data.price)+'</strong>')+window.bareProductReviewCountMarkup(data,hash)+'</figcaption></figure></a>'}")
 .replace("const isLegacyWomenReview=/#product-db-im-bared-(halter-top|high-up-leggings)$/.test(location.hash),managedReviews=Array.isArray(data?.reviews)?data.reviews:[],reviews=managedReviews.length?managedReviews:(isLegacyWomenReview&&Array.isArray(customerReviews)?customerReviews:[]),list=","const reviews=window.bareProductReviewList(data,location.hash),list=");
}
