export const META_PIXEL_ID='2846254909105262';
// PageView only. No automatic events or customer/account/order data are supplied.
export const metaPixelScript=String.raw`<script id="bare-meta-pixel">(()=>{
if(window.__bareMetaPixel||!['baredot.pages.dev','baredot.kr','www.baredot.kr'].includes(location.hostname))return;
const excluded=/^\/(?:admin|api|order|auth|login|signup|member|myshop|my-page|mypage|review|sandbox|cart|checkout|payment)(?:\/|\.|$)/i;
if(excluded.test(location.pathname))return;
window.__bareMetaPixel=true;
const pixel='2846254909105262';let initialized=false,last='',timer;
function allowed(){return !navigator.globalPrivacyControl&&navigator.doNotTrack!=='1'&&window.bareTrackingConsent?.accepted('meta')===true&&!excluded.test(location.pathname)&&![...new URLSearchParams(location.search).keys()].some(key=>/token|password|secret|email|phone|paymentkey|orderid|code/i.test(key))&&!/token=|access_token=|refresh_token=/i.test(location.hash)}
function view(){if(!allowed()||document.visibilityState==='hidden')return;
 const hash=/^#(?:product|women|men|shop)[a-zA-Z0-9%_.-]*$/.test(location.hash)?location.hash:'',route=location.pathname+hash;
 if(route===last)return;
 if(!initialized){
 !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
 fbq('consent','grant');fbq('set','autoConfig',false,pixel);fbq('init',pixel);initialized=true;
 }else fbq('consent','grant');
 last=route;fbq('track','PageView');
}
function revoke(){if(initialized){if(Array.isArray(fbq.queue))fbq.queue=fbq.queue.filter(call=>!(call[0]==='track'&&call[1]==='PageView'));fbq('consent','revoke')}last='';for(const name of ['_fbp','_fbc']){document.cookie=name+'=; Max-Age=0; path=/';const labels=location.hostname.split('.');for(let i=0;i<labels.length-1;i++)document.cookie=name+'=; Max-Age=0; path=/; domain=.'+labels.slice(i).join('.')}}
const queue=()=>{clearTimeout(timer);timer=setTimeout(view,200)};
addEventListener('bare-tracking-consent-change',()=>{if(!allowed())revoke();else queue()});
addEventListener('hashchange',queue);addEventListener('popstate',queue);document.addEventListener('visibilitychange',queue);queue();
})();</script>`;
