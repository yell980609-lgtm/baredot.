const fs = require('fs');
const workerPath = '_worker.js';
let source = fs.readFileSync(workerPath, 'utf8');
const marker = '// bare-restore-legacy-women-reviews-v1';
if (!source.includes(marker)) {
  source += `\n\n${marker}\nconst bareLegacyWomenReviewsBase=patchHtml;\npatchHtml=function(html){return bareLegacyWomenReviewsBase(html)\n.replace(\"function renderManagedReviews(data){const reviews=Array.isArray(data?.reviews)?data.reviews:[],list=\",\"function renderManagedReviews(data){const isLegacyWomenReview=/#product-db-im-bared-(halter-top|high-up-leggings)$/.test(location.hash),managedReviews=Array.isArray(data?.reviews)?data.reviews:[],reviews=managedReviews.length?managedReviews:(isLegacyWomenReview&&Array.isArray(customerReviews)?customerReviews:[]),list=\")\n.replace(\"safe(review.author||'구매자')+'</strong>\",\"safe(review.author||'구매자')+(review.best?'<span class=\\\"review-badge\\\">BEST</span>':'')+'</strong>\")\n.replace(\"safe(review.option||'')+'</div></div><div class=\\\"review-card-stars\\\">'\",\"safe(review.option||'')+'</div>'+(review.profile?'<div class=\\\"review-profile\\\">'+safe(review.profile)+'</div>':'')+'</div><div class=\\\"review-card-stars\\\">'\")};\n`;
  fs.writeFileSync(workerPath, source);
}
for (const path of ['.github/restore-legacy-women-reviews.cjs','.github/workflows/restore-legacy-women-reviews.yml']) {
  if (fs.existsSync(path)) fs.unlinkSync(path);
}
