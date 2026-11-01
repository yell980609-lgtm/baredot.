// Home hero is enabled; demand loading limits media downloads to the home screen.
export const HOME_HERO_ENABLED=true;
export function withoutHomeHero(html){return html.replace(/<section\b[^>]*class="hero"[^>]*>[\s\S]*?<\/section>/,'').replace('</head>','<style id="bare-hero-disabled">.home-view .shop-section{padding-top:calc(var(--topbar-height) + 32px)!important}</style></head>')}
