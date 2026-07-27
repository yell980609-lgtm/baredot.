const fs = require('fs');
const file = '_worker.js';
let source = fs.readFileSync(file, 'utf8');
const marker = 'bare-product-welcome-observer-v1';
if (!source.includes(marker)) {
  source += String.raw`

// bare-product-welcome-observer-v1
const bareProductWelcomeObserverScript='<script id="bare-product-welcome-observer-script">(()=>{let timer=0;function sync(){const how=document.querySelector(".product-detail .how-bared");if(!document.body.classList.contains("detail-route")||!how)return;if(how.nextElementSibling&&how.nextElementSibling.classList.contains("product-welcome-banner"))return;document.querySelectorAll(".product-welcome-banner").forEach(el=>el.remove());how.insertAdjacentHTML("afterend","<a class=\\"product-welcome-banner\\" href=\\"/member/signup.html\\" aria-label=\\"신규회원 웰컴팩 가입하기\\"><img src=\\"https://shop-phinf.pstatic.net/20260514_299/17787381562510SFCd_JPEG/57535494600578401_1343151862.jpg?type=o1000\\" alt=\\"\\"><span class=\\"product-welcome-copy\\"><small>NEW MEMBER BENEFIT</small><strong>WELCOME<br>PACK</strong><span>첫 구매 10% 할인 + 무료배송</span><em>JOIN NOW</em></span></a>")}function queue(){clearTimeout(timer);timer=setTimeout(sync,80)}new MutationObserver(queue).observe(document.body,{childList:true,subtree:true});addEventListener("hashchange",queue);queue()})();</script>';
const bareProductWelcomeObserverBase=patchHtml;
patchHtml=function(html){return bareProductWelcomeObserverBase(html).replace('</body>',bareProductWelcomeObserverScript+'</body>')};
`;
  fs.writeFileSync(file, source);
}
for (const path of ['.github/fix-product-welcome-timing.cjs', '.github/workflows/fix-product-welcome-timing.yml']) {
  try { fs.unlinkSync(path); } catch (_) {}
}
