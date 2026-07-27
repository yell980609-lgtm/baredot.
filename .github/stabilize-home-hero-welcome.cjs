const fs = require('fs');
const file = '_worker.js';
let source = fs.readFileSync(file, 'utf8');
const marker = 'bare-home-hero-welcome-stable-v1';
if (!source.includes(marker)) {
  source += String.raw`

// bare-home-hero-welcome-stable-v1
const bareHomeHeroStableScript='<script id="bare-home-hero-stable-script">(()=>{const markup="<a class=\\"bare-welcome-hero\\" href=\\"/member/signup.html\\" aria-label=\\"웰컴팩 회원가입\\"><img src=\\"https://shop-phinf.pstatic.net/20260514_299/17787381562510SFCd_JPEG/57535494600578401_1343151862.jpg?type=o1000\\" alt=\\"BARE. welcome pack\\"><span class=\\"bare-welcome-copy\\"><small class=\\"bare-welcome-eyebrow\\">NEW MEMBER BENEFIT</small><strong>WELCOME<br>PACK</strong><span>첫 구매 10% 할인 + 무료배송</span><b class=\\"bare-welcome-cta\\">JOIN NOW</b></span></a>";let timer=0;function sync(){const hero=document.querySelector(".home-view .hero")||document.querySelector(".hero"),video=hero?.querySelector("video");if(!hero||!video)return;let welcome=hero.querySelector(".bare-welcome-hero");if(!welcome){hero.insertAdjacentHTML("beforeend",markup);welcome=hero.querySelector(".bare-welcome-hero")}video.loop=false;video.removeAttribute("loop");if(video.dataset.welcomeBound!=="1"){video.dataset.welcomeBound="1";video.addEventListener("ended",()=>welcome?.classList.add("is-visible"))}if(video.ended)welcome?.classList.add("is-visible")}function queue(){clearTimeout(timer);timer=setTimeout(sync,80)}new MutationObserver(queue).observe(document.body,{childList:true,subtree:true});addEventListener("hashchange",queue);queue()})();</script>';
const bareHomeHeroStableBase=patchHtml;
patchHtml=function(html){return bareHomeHeroStableBase(html).replace('</body>',bareHomeHeroStableScript+'</body>')};
`;
  fs.writeFileSync(file, source);
}
for (const path of ['.github/stabilize-home-hero-welcome.cjs', '.github/workflows/stabilize-home-hero-welcome.yml']) {
  try { fs.unlinkSync(path); } catch (_) {}
}
