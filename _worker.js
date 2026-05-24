const menuPromoStyle = `
<style id="codex-deploy-menu-promo">
:root{--promo-height:38px}.promo-bar{gap:18px;font-size:13px}.mega-menu{width:min(132px,calc(100vw - 36px));padding:16px 18px}.mega-title,.mega-feature{display:none!important}.mega-body{display:block!important}.mega-categories{gap:11px;font-size:13px}.mega-categories a{display:block;text-decoration:none}@media(max-width:860px){:root{--promo-height:34px}.promo-bar{gap:12px;font-size:11px}.mega-menu{right:8px;width:min(132px,calc(100vw - 16px));padding:14px}.mega-body{display:block!important}}
</style>`;

const menuHeader = `<header class="topbar" aria-label="BAREDOT navigation"><a class="logo" href="#top" aria-label="맨 위로 이동"><img src="https://framerusercontent.com/images/a3Pvzk5vHkS6uAT6JGV5VgPpTZk.png?width=1080&height=1080" alt="BAREDOT."></a><nav class="topnav"><a href="#shop">Best</a><a href="#shop">Featured</a><button class="nav-trigger" type="button" data-menu="men">MEN</button><button class="nav-trigger" type="button" data-menu="women">WOMEN</button><a href="#shop">Acc</a></nav><div class="mega-menu" data-menu-panel="men" aria-hidden="true"><div class="mega-body"><nav class="mega-categories"><a href="#men-all">ALL</a><a href="#men-top">TOP</a><a href="#men-bottom">BOTTOM</a></nav></div></div><div class="mega-menu" data-menu-panel="women" aria-hidden="true"><div class="mega-body"><nav class="mega-categories"><a href="#women-all">ALL</a><a href="#women-top">TOP</a><a href="#women-bottom">BOTTOM</a></nav></div></div></header>`;

function patchHtml(html) {
  const headerPattern = /<header class="topbar" aria-label="BAREDOT navigation">[\s\S]*?<\/header>/;
  let patched = html.replace(/<style id="codex-deploy-menu-promo">[\s\S]*?<\/style>/, '');
  patched = patched.replace('</head>', `${menuPromoStyle}\n</head>`);
  patched = patched.replace(headerPattern, menuHeader);
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
