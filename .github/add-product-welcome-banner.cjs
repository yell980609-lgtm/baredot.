const fs = require('fs');
const file = '_worker.js';
let source = fs.readFileSync(file, 'utf8');
const marker = 'bare-product-welcome-banner-v1';
if (!source.includes(marker)) {
  source += String.raw`

// bare-product-welcome-banner-v1
const bareProductWelcomeStyle='<style id="bare-product-welcome-style">.product-welcome-banner{position:relative;display:grid;place-items:center;width:100%;min-height:clamp(300px,34vw,440px);margin:28px 0 0;overflow:hidden;background:#111;color:#fff;text-decoration:none;isolation:isolate}.product-welcome-banner img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;filter:brightness(.48);z-index:-1}.product-welcome-copy{display:flex;flex-direction:column;align-items:center;gap:7px;padding:34px 22px;text-align:center;text-shadow:0 1px 12px rgba(0,0,0,.35)}.product-welcome-copy small{font-size:11px;letter-spacing:.18em}.product-welcome-copy strong{font-size:clamp(38px,5vw,70px);line-height:.92;letter-spacing:-.055em}.product-welcome-copy span{font-size:clamp(15px,1.5vw,20px);font-weight:700}.product-welcome-copy em{margin-top:12px;padding-bottom:4px;border-bottom:1px solid currentColor;font-size:12px;font-style:normal;font-weight:800;letter-spacing:.08em}@media(max-width:600px){.product-welcome-banner{min-height:285px;margin-top:18px}.product-welcome-copy{padding:28px 18px}.product-welcome-copy strong{font-size:42px}.product-welcome-copy span{font-size:14px}}</style>';
const bareProductWelcomeScript='<script id="bare-product-welcome-script">(()=>{const marker="bare-product-welcome-banner-v1";const markup="<a class=\\"product-welcome-banner\\" href=\\"/member/signup.html\\" aria-label=\\"신규회원 웰컴팩 가입하기\\"><img src=\\"https://shop-phinf.pstatic.net/20260514_299/17787381562510SFCd_JPEG/57535494600578401_1343151862.jpg?type=o1000\\" alt=\\"\\"><span class=\\"product-welcome-copy\\"><small>NEW MEMBER BENEFIT</small><strong>WELCOME<br>PACK</strong><span>첫 구매 10% 할인 + 무료배송</span><em>JOIN NOW</em></span></a>";function sync(){const how=document.querySelector(".product-detail .how-bared");if(!document.body.classList.contains("detail-route")||!how)return;if(how.nextElementSibling&&how.nextElementSibling.classList.contains("product-welcome-banner"))return;document.querySelectorAll(".product-welcome-banner").forEach(el=>el.remove());how.insertAdjacentHTML("afterend",markup)}sync();addEventListener("hashchange",()=>setTimeout(sync,160));document.addEventListener("bare-product-updated",()=>setTimeout(sync,0));setTimeout(sync,350)})();</script>';
const bareProductWelcomeBase=patchHtml;
patchHtml=function(html){return bareProductWelcomeBase(html).replace('</head>',bareProductWelcomeStyle+'</head>').replace('</body>',bareProductWelcomeScript+'</body>')};
`;
  fs.writeFileSync(file, source);
}
for (const path of ['.github/add-product-welcome-banner.cjs', '.github/workflows/add-product-welcome-banner.yml']) {
  try { fs.unlinkSync(path); } catch (_) {}
}
