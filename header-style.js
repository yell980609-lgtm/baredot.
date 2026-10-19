export const slimHeaderStyle=`<style id="bare-slim-transparent-logo-header">
:root{--topbar-height:36px!important;--logo-mask:url(/assets/baredot-logo.png)}
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
body:not(.detail-route):not(.collection-route) .topbar:not(.is-scrolled) .logo img{opacity:.64!important}
body:not(.detail-route):not(.collection-route) .topbar:not(.is-scrolled) .logo.has-video-frame img{opacity:0!important}
.logo .logo-video-frame{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:none;-webkit-mask:var(--logo-mask) center/contain no-repeat;mask:var(--logo-mask) center/contain no-repeat}
body:not(.detail-route):not(.collection-route) .topbar:not(.is-scrolled) .logo.has-video-frame .logo-video-frame{display:block}
@media(max-width:860px){
 .mobile-menu-toggle{top:calc(var(--promo-height) + 2px)!important;height:32px!important}
}
</style>`;

export const liveLogoScript=`<script id="bare-live-video-logo">(()=>{
 const video=document.querySelector('.home-view .hero-video'),logo=document.querySelector('.topbar .logo'),header=document.querySelector('.topbar');
 if(!video||!logo||!header)return;
 const image=logo.querySelector('img');if(image)image.src='/assets/baredot-logo.png';
 const canvas=document.createElement('canvas');canvas.className='logo-video-frame';canvas.setAttribute('aria-hidden','true');logo.appendChild(canvas);
 const context=canvas.getContext('2d');if(!context)return;let timer=0;
 const visible=()=>!document.hidden&&!document.body.matches('.detail-route,.collection-route')&&!header.classList.contains('is-scrolled');
 const draw=()=>{if(!visible()||video.readyState<2||!video.videoWidth||video.currentTime<.05)return;
  const size=Math.round(logo.getBoundingClientRect().width*Math.min(devicePixelRatio||1,2));if(!size)return;
  if(canvas.width!==size){canvas.width=size;canvas.height=size}
  const crop=Math.min(video.videoWidth,video.videoHeight);
  try{context.drawImage(video,(video.videoWidth-crop)/2,(video.videoHeight-crop)/2,crop,crop,0,0,size,size);logo.classList.add('has-video-frame')}catch{logo.classList.remove('has-video-frame')}
 };
 const stop=()=>{clearInterval(timer);timer=0};
 const sync=()=>{stop();if(!visible())return;draw();if(!video.paused&&!video.ended)timer=setInterval(draw,100)};
 video.addEventListener('play',sync);video.addEventListener('pause',stop);video.addEventListener('ended',()=>{draw();stop()});video.addEventListener('loadeddata',sync);video.addEventListener('seeked',draw);
 video.addEventListener('emptied',()=>{stop();logo.classList.remove('has-video-frame')});video.addEventListener('error',()=>{stop();logo.classList.remove('has-video-frame')});
 addEventListener('scroll',sync,{passive:true});addEventListener('hashchange',sync);document.addEventListener('visibilitychange',sync);sync();
})();</script>`;
