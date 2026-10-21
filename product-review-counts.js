import {purchaseReviewStorefrontScript} from './purchase-review-storefront.js';
// Match the review source used in product details: managed reviews replace legacy ones.
export function productReviews(product,legacyReviews=[],hash=''){
 if(!product||hash==='#product-t-libbed-sleeveless')return [];
 const managed=Array.isArray(product.reviews)?product.reviews:(Array.isArray(product.images)?product.images:[]).filter(function(item){return item&&typeof item==='object'&&item.placement==='product-review'});
 const base=managed.length?managed:product.slug?(['im-bared-halter-top','im-bared-high-up-leggings'].includes(product.slug)?legacyReviews:[]):product.dynamic?[]:legacyReviews;
 return base.concat(Array.isArray(product.purchase_reviews)?product.purchase_reviews:[]).sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''))});
}
const reviewCountStyle='<style id="bare-product-review-count-style">@font-face{font-family:Inter;src:url(https://framerusercontent.com/assets/qITWJ2WdG0wrgQPDb8lvnYnTXDg.woff2) format(\'woff2\');font-weight:500;font-display:swap}.product-card .product-image{position:relative}.product-card .product-review-count{position:absolute;right:8px;bottom:8px;z-index:2;display:block;margin:0;padding:4px 7px;border-radius:3px;background:rgba(255,255,255,.9);color:#111;font:500 12px/1.4 Inter,InterDisplay,system-ui,sans-serif;white-space:nowrap;pointer-events:none}@media(max-width:860px){.product-card .product-review-count{right:6px;bottom:6px;padding:3px 6px;font-size:10px}}</style>';
export function withProductReviewCounts(html){
 const helpers='<script id="bare-product-review-count-helpers">window.bareProductReviewList=function(product,hash){return ('+productReviews.toString()+')(product,typeof customerReviews!=="undefined"&&Array.isArray(customerReviews)?customerReviews:[],hash)};window.bareProductReviewTotal=function(product,hash){const stored=Array.isArray(product?.purchase_reviews)?product.purchase_reviews.length:0;return window.bareProductReviewList(product,hash).length-stored+Math.max(stored,Number(product?.purchase_review_count)||0)};window.bareProductReviewCountMarkup=function(product,hash){const count=window.bareProductReviewTotal(product,hash);return count?\'<p class="product-review-count">Review(\'+count+\')</p>\':""};</script>';
 return html
 .replace('</head>',reviewCountStyle+helpers+'</head>')
 .replace('</body>',purchaseReviewStorefrontScript+'</body>')
 .replace('slug:product.slug};productRoutes.add(hash)','purchase_review_count:Number(product.purchase_review_count||0),slug:product.slug};productRoutes.add(hash)')
 .replace("if(titleCount)titleCount.textContent=reviews.length;if(countPill)countPill.textContent=reviews.length+'개의 리뷰';","const reviewTotal=window.bareProductReviewTotal(data,location.hash);if(titleCount)titleCount.textContent=reviewTotal;if(countPill)countPill.textContent=reviewTotal+'개의 리뷰'+(data.purchase_reviews_loaded&&Number(data.purchase_review_count)>(data.purchase_reviews||[]).length?' · 구매 후기 최신 50개 표시':'');")
 .replace('<span class="wish" aria-hidden="true"></span>\'+(soldout?', '<span class="wish" aria-hidden="true"></span>\'+window.bareProductReviewCountMarkup(product)+(soldout?')
 .replace(/function productCardMarkup\(hash\)\{[^\r\n]+/,function(source){return source.replace('<span class="wish" aria-hidden="true"></span></div><figcaption class="product-info">','<span class="wish" aria-hidden="true"></span>\'+window.bareProductReviewCountMarkup(data,hash)+\'</div><figcaption class="product-info">')})
 .replace("const isLegacyWomenReview=/#product-db-im-bared-(halter-top|high-up-leggings)$/.test(location.hash),managedReviews=Array.isArray(data?.reviews)?data.reviews:[],reviews=managedReviews.length?managedReviews:(isLegacyWomenReview&&Array.isArray(customerReviews)?customerReviews:[]),list=","const reviews=window.bareProductReviewList(data,location.hash),list=");
}
