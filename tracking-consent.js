// Keep advertising consent separate from the site's older, analytics-only choice.
export const trackingConsentScript=String.raw`<style id="bare-tracking-consent-style">.bare-analytics-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:300;background:#fff;color:#111;border:1px solid #ddd;padding:16px;box-shadow:0 4px 24px #0002;font:13px/1.5 system-ui;display:flex;align-items:center;justify-content:space-between;gap:12px}.bare-analytics-consent button{padding:8px 12px;border:1px solid #111;background:#fff;cursor:pointer}.bare-analytics-consent button:first-child{background:#111;color:#fff}.bare-analytics-consent[hidden]{display:none}@media(max-width:600px){.bare-analytics-consent{flex-direction:column;align-items:flex-start}}</style><script id="bare-tracking-consent">(()=>{
if(window.bareTrackingConsent)return;
const excluded=/^\/(?:admin|api|order|auth|login|signup|member|myshop|my-page|mypage|review|sandbox|cart|checkout|payment)(?:\/|\.|$)/i;
if(excluded.test(location.pathname)||navigator.globalPrivacyControl||navigator.doNotTrack==='1')return;
const metaAvailable=['baredot.pages.dev','baredot.kr','www.baredot.kr'].includes(location.hostname),keys={analytics:'bare_analytics_consent',meta:'bare_meta_pixel_consent'};
const read=key=>{try{const value=JSON.parse(localStorage.getItem(key));return ['accepted','rejected'].includes(value)?value:null}catch{return null}};
const choice={analytics:read(keys.analytics),meta:read(keys.meta)};
// A previous refusal remains a refusal; an old analytics acceptance never grants advertising consent.
if(choice.analytics==='rejected'&&!choice.meta)choice.meta='rejected';
const announce=()=>dispatchEvent(new Event('bare-tracking-consent-change'));
function save(kind,value){choice[kind]=value;try{localStorage.setItem(keys[kind],JSON.stringify(value))}catch{}}
window.bareTrackingConsent={accepted:kind=>choice[kind]==='accepted'};
window.bareDisableAnalytics=()=>{save('analytics','rejected');try{localStorage.removeItem('bare_analytics_visitor');sessionStorage.removeItem('bare_analytics_session')}catch{}announce()};
window.bareDisableMetaPixel=()=>{save('meta','rejected');announce()};
function show(){if(document.querySelector('.bare-analytics-consent'))return;const banner=document.createElement('aside');banner.className='bare-analytics-consent';banner.setAttribute('aria-label','선택적 쿠키 및 방문 정보 수집 안내');banner.innerHTML='<span>'+(metaAvailable?'사이트 개선과 Meta 광고 성과 측정을 위해 쿠키와 방문 정보를 사용합니다. 동의하면 페이지 조회·기기 정보 등이 Meta에 전송됩니다.':'사이트 개선을 위해 방문 페이지와 유입 경로를 수집합니다. 이름·연락처는 수집하지 않습니다.')+' <a href="/privacy-policy.html">개인정보처리방침</a></span><div style="white-space:nowrap"><button type="button" data-consent="accepted">동의</button> <button type="button" data-consent="rejected">거절</button></div>';banner.addEventListener('click',event=>{const value=event.target.closest('[data-consent]')?.dataset.consent;if(!['accepted','rejected'].includes(value))return;save('analytics',value);if(metaAvailable)save('meta',value);banner.remove();announce()});document.body.appendChild(banner)}
window.bareShowTrackingChoices=show;
addEventListener('storage',event=>{if(!event.key||Object.values(keys).includes(event.key)){choice.analytics=read(keys.analytics);choice.meta=read(keys.meta);announce()}});
if(!choice.analytics||(metaAvailable&&!choice.meta))show();
})();</script>`;
