// Home hero is enabled; demand loading limits media downloads to the home screen.
export const HOME_HERO_ENABLED=true;
export function withoutHomeHero(html){return html.replace(/<section\b[^>]*class="hero"[^>]*>[\s\S]*?<\/section>/,'').replace('</head>','<style id="bare-hero-disabled">.home-view .shop-section{padding-top:calc(var(--topbar-height) + 32px)!important}</style></head>')}

// Mobile landscape media should determine the hero height instead of a full-screen box.
export function withMobileHeroLayout(html){return html.replace('</head>','<style id="bare-mobile-hero-layout">@media(max-width:860px){body .home-view .hero{display:block!important;height:auto!important;min-height:0!important;max-height:none!important;aspect-ratio:auto!important;padding:0!important}body .home-view .hero video.hero-video,body .home-view .hero img.hero-gif{position:relative!important;inset:auto!important;display:block!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;max-width:none!important;margin:0!important;object-fit:contain!important;transform:none!important}body .home-view .hero .hero-content{min-height:0!important}}</style></head>')}
