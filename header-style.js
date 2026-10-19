export const slimHeaderStyle=`<style id="bare-slim-transparent-logo-header">
:root{--topbar-height:36px!important}
.topbar{background:transparent!important}
body:not(.detail-route):not(.collection-route) .topbar:not(.is-scrolled){margin-bottom:calc(-1 * var(--topbar-height))!important}
body:not(.detail-route):not(.collection-route) .topbar:not(.is-scrolled)::before{
 background:#000!important;
 -webkit-mask-image:var(--logo-mask),linear-gradient(#000,#000)!important;
 mask-image:var(--logo-mask),linear-gradient(#000,#000)!important;
 -webkit-mask-size:var(--logo-size) var(--logo-size),100% 100%!important;
 mask-size:var(--logo-size) var(--logo-size),100% 100%!important;
 -webkit-mask-position:center,center!important;mask-position:center,center!important;
 -webkit-mask-repeat:no-repeat!important;mask-repeat:no-repeat!important;
 -webkit-mask-composite:xor!important;mask-composite:exclude!important;
}
body:not(.detail-route):not(.collection-route) .topbar:not(.is-scrolled) .logo img{opacity:0!important}
@media(max-width:860px){
 .mobile-menu-toggle{top:calc(var(--promo-height) + 2px)!important;height:32px!important}
}
</style>`;
