const menuPromoStyle = `
<style id="codex-deploy-menu-promo">
:root{--promo-height:38px}.promo-bar{gap:18px;font-size:13px}.mega-menu{width:min(132px,calc(100vw - 36px));padding:16px 18px}.mega-title,.mega-feature{display:none!important}.mega-body{display:block!important}.mega-categories{gap:11px;font-size:13px}.mega-categories a{display:block;text-decoration:none}.about-section{padding:74px 0 82px;background:#fff;color:#050505}.about-section .wrap{display:grid;grid-template-columns:minmax(0,.8fr) minmax(320px,1fr);gap:clamp(32px,6vw,88px);align-items:start}.about-kicker{margin:0 0 12px;font:900 11px/1 InterDisplay,Pretendard,sans-serif;text-transform:uppercase}.about-title{margin:0;font-size:clamp(32px,5vw,72px);line-height:.95;text-transform:uppercase}.about-copy{display:grid;gap:18px;margin:0;color:#1d1d1d;font:700 clamp(14px,1.4vw,18px)/1.75 Pretendard,'Noto Sans KR',sans-serif}.about-copy p{margin:0}@media(max-width:860px){:root{--promo-height:34px}.promo-bar{gap:12px;font-size:11px}.mega-menu{right:8px;width:min(132px,calc(100vw - 16px));padding:14px}.mega-body{display:block!important}.about-section{padding:54px 0 62px}.about-section .wrap{grid-template-columns:1fr;gap:26px}.about-title{font-size:36px}.about-copy{font-size:13px}}
</style>`;

const reviewPatchStyle = `
<style id="codex-review-refine">
.detail-tabs{padding-top:42px!important;margin-top:42px!important}.review-title{margin-bottom:12px!important;font-size:clamp(20px,2.1vw,30px)!important;line-height:1!important}.review-score{margin:0 0 12px!important;padding:10px 0!important;gap:10px!important}.review-score-main{gap:7px!important}.review-score-main strong{font-size:clamp(26px,3vw,38px)!important}.review-count-pill{min-height:28px!important;padding:0 12px!important;font-size:11px!important}.review-satisfaction{margin:0 0 16px!important;padding:12px 0!important;font-size:12px!important}.review-toolbar{gap:7px!important;margin-bottom:10px!important}.review-filter{min-height:30px!important;padding:0 11px!important;font-size:11px!important}.review-sort{margin:8px 0 12px!important;font-size:11px!important}.review-card{padding:22px 0!important}.review-author{font-size:12px!important}.review-date,.review-option,.review-profile{font-size:10px!important}.review-card-stars,.review-stars,.review-blue{color:#050505!important;letter-spacing:1px!important}.review-card-stars{font-size:14px!important}.review-body{font-size:12px!important;line-height:1.62!important}.review-help{font-size:10px!important}.review-help button{font-size:10px!important}@media(max-width:860px){.detail-tabs{padding-top:34px!important;margin-top:34px!important}.review-title{font-size:22px!important}.review-score{padding:8px 0!important}.review-card{padding:18px 0!important}.review-body{font-size:11px!important}}
</style>`;

const aboutMarkup = `<section class="about-section" id="about" aria-label="About BARE."><div class="wrap"><div><p class="about-kicker">ABOUT BARE.</p><h2 class="about-title">Bare moves with you.</h2></div><div class="about-copy"><p>베어닷은 움직이는 순간에도 몸의 선과 편안함이 자연스럽게 살아나는 애슬레저를 지향합니다.</p><p>불필요한 장식은 덜어내고, 소재와 핏, 작은 디테일에 집중해 일상과 운동 사이를 부드럽게 이어갑니다.</p><p>이 영역은 임시 브랜드 소개 문구입니다. 추후 원하는 톤과 내용으로 자유롭게 수정할 수 있습니다.</p></div></div></section>`;

const menuHeader = `<header class="topbar" aria-label="BAREDOT navigation"><a class="logo" href="#top" aria-label="맨 위로 이동"><img src="https://framerusercontent.com/images/a3Pvzk5vHkS6uAT6JGV5VgPpTZk.png?width=1080&height=1080" alt="BAREDOT."></a><nav class="topnav"><button class="nav-trigger" type="button" data-menu="men">MEN</button><button class="nav-trigger" type="button" data-menu="women">WOMEN</button><a href="#about">ABOUT</a><a href="#shop">Acc</a></nav><div class="mega-menu" data-menu-panel="men" aria-hidden="true"><div class="mega-body"><nav class="mega-categories"><a href="#men-all">ALL</a><a href="#men-top">TOP</a><a href="#men-bottom">BOTTOM</a></nav></div></div><div class="mega-menu" data-menu-panel="women" aria-hidden="true"><div class="mega-body"><nav class="mega-categories"><a href="#women-all">ALL</a><a href="#women-top">TOP</a><a href="#women-bottom">BOTTOM</a></nav></div></div></header>`;

function patchHtml(html) {
  const headerPattern = /<header class="topbar" aria-label="BAREDOT navigation">[\s\S]*?<\/header>/;
  let patched = html
    .replace(/<style id="codex-deploy-menu-promo">[\s\S]*?<\/style>/, '')
    .replace(/<style id="codex-review-refine">[\s\S]*?<\/style>/, '')
    .replace(/<script id="codex-review-lightbox">[\s\S]*?<\/script>/, '')
    .replace(/<script type="module" id="codex-journal-firebase">[\s\S]*?<\/script>/, '')
    .replace(/<section class="journal-section" id="journal"[\s\S]*?<\/section><div class="journal-modal"[\s\S]*?<\/div><\/article><\/div>/, '')
    .replace(/<section class="about-section" id="about"[\s\S]*?<\/section>/, '');
  patched = patched.replace('</head>', `${menuPromoStyle}\n${reviewPatchStyle}\n</head>`);
  patched = patched.replace(headerPattern, menuHeader);
  patched = patched.replace('</footer>', `</footer>\n${aboutMarkup}`);
  return patched;
}

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const type = response.headers.get('content-type') || '';

    if (!type.includes('text/html')) {
      return response;
    }

    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.set('cache-control', 'no-cache');

    return new Response(patchHtml(await response.text()), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
