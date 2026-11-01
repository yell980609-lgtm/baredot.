// Hidden home heroes must not consume storage bandwidth on product/category pages.
export function withHeroDemandLoading(html){
 const video=/<video\b[^>]*class="hero-video"[^>]*>[\s\S]*?<\/video>/;
 const image=/<img\b[^>]*class="hero-gif"[^>]*>/;
 const defer=markup=>markup.replace(/\sautoplay(?:="[^"]*")?/g,'').replace(/preload="[^"]*"/g,'preload="none"').replace(/\ssrc="/g,' data-src="');
 const script=String.raw`<script id="bare-hero-demand-loading">(()=>{const hero=document.querySelector('.home-view .hero'),video=hero?.querySelector('video.hero-video'),image=hero?.querySelector('img.hero-gif');if(!hero)return;const home=()=>!location.hash&&(location.pathname==='/'||location.pathname==='/index.html');function sync(){if(!home()){video?.pause();return}if(image&&!image.getAttribute('src'))image.src=image.dataset.src;if(video){let changed=false;video.querySelectorAll('source[data-src]').forEach(source=>{if(!source.getAttribute('src')){source.src=source.dataset.src;changed=true}});video.muted=true;video.autoplay=true;if(changed)video.load();video.play()?.catch(()=>{})}}video?.addEventListener('playing',()=>{if(!home())video.pause()});addEventListener('hashchange',sync);sync()})();</script>`;
 return html.replace(video,markup=>defer(markup)+script).replace(image,markup=>defer(markup)+script);
}
export function adminQuotaMessage(message){return /exceed_cached_egress_quota|exceed_.*egress.*quota|Service for this project is restricted/i.test(String(message))?'Supabase 파일 전송량 한도 초과로 서비스가 제한되었습니다. 비밀번호 오류가 아닙니다. Supabase 프로젝트의 Billing·Usage에서 플랜 업그레이드 또는 사용량 제한 해제를 확인해주세요.':String(message)}
export function withAdminQuotaMessage(html){return html.replace("status('로그인 실패: '+error.message)","status(("+adminQuotaMessage.toString()+")('로그인 실패: '+error.message))")}
