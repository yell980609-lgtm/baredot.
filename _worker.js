const menuPromoStyle = `
<style id="codex-deploy-menu-promo">
:root{--promo-height:38px}.promo-bar{gap:18px;font-size:13px}.mega-menu{width:min(132px,calc(100vw - 36px));padding:16px 18px}.mega-title,.mega-feature{display:none!important}.mega-body{display:block!important}.mega-categories{gap:11px;font-size:13px}.mega-categories a{display:block;text-decoration:none}.about-section{padding:74px 0 82px;background:#fff;color:#050505}.about-section .wrap{display:grid;grid-template-columns:minmax(0,.8fr) minmax(320px,1fr);gap:clamp(32px,6vw,88px);align-items:start}.about-kicker{margin:0 0 12px;font:900 11px/1 InterDisplay,Pretendard,sans-serif;text-transform:uppercase}.about-title{margin:0;font-size:clamp(32px,5vw,72px);line-height:.95;text-transform:uppercase}.about-copy{display:grid;gap:18px;margin:0;color:#1d1d1d;font:700 clamp(14px,1.4vw,18px)/1.75 Pretendard,'Noto Sans KR',sans-serif}.about-copy p{margin:0}.journal-section{padding:76px 0 84px;background:#fff;color:#050505;border-top:1px solid #eee}.journal-head{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:28px}.journal-kicker{margin:0 0 8px;font:900 11px/1 InterDisplay,Pretendard,sans-serif;text-transform:uppercase}.journal-title{margin:0;font-size:clamp(30px,4vw,56px);line-height:1;text-transform:uppercase}.journal-admin{font:900 11px/1 InterDisplay,Pretendard,sans-serif;text-transform:uppercase;text-decoration:none}.journal-tabs{display:flex;gap:8px;margin-bottom:24px;overflow-x:auto}.journal-tab{min-height:34px;padding:0 14px;border:1px solid #050505;background:#fff;color:#050505;font:900 12px/1 InterDisplay,Pretendard,sans-serif;text-transform:uppercase;cursor:pointer}.journal-tab.is-active{background:#050505;color:#fff}.journal-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px}.journal-card{display:grid;grid-template-columns:minmax(160px,.85fr) minmax(0,1fr);gap:18px;align-items:start;text-decoration:none;color:#050505}.journal-thumb{aspect-ratio:4/3;background:#efefef;overflow:hidden}.journal-thumb img{width:100%;height:100%;object-fit:cover}.journal-card h3{margin:0 0 8px;font:900 clamp(18px,2vw,25px)/1.15 InterDisplay,Pretendard,sans-serif}.journal-date{display:block;margin-bottom:12px;color:#888;font:800 11px/1 Pretendard,'Noto Sans KR',sans-serif}.journal-card p{margin:0;color:#333;font:700 13px/1.65 Pretendard,'Noto Sans KR',sans-serif}.journal-empty{display:none;padding:36px 0;color:#777;font:800 13px/1.6 Pretendard,'Noto Sans KR',sans-serif}.journal-empty.is-visible{display:block}.journal-modal{position:fixed;inset:0;z-index:150;display:grid;place-items:center;padding:28px;background:rgba(0,0,0,.62);opacity:0;visibility:hidden;transition:.18s}.journal-modal.is-open{opacity:1;visibility:visible}.journal-modal-card{position:relative;width:min(820px,calc(100vw - 34px));max-height:86vh;overflow:auto;background:#fff;color:#050505;padding:34px}.journal-modal-close{position:absolute;top:18px;right:18px;border:0;background:transparent;color:#050505;font:400 34px/.8 Arial,sans-serif;cursor:pointer}.journal-modal-card img{width:100%;max-height:420px;object-fit:cover;margin:0 0 24px;background:#eee}.journal-modal-card h3{margin:0 44px 12px 0;font-size:clamp(24px,3vw,38px);line-height:1.1}.journal-modal-body{white-space:pre-line;color:#222;font:700 15px/1.85 Pretendard,'Noto Sans KR',sans-serif}@media(max-width:860px){:root{--promo-height:34px}.promo-bar{gap:12px;font-size:11px}.mega-menu{right:8px;width:min(132px,calc(100vw - 16px));padding:14px}.mega-body{display:block!important}.about-section{padding:54px 0 62px}.about-section .wrap{grid-template-columns:1fr;gap:26px}.about-title{font-size:36px}.about-copy{font-size:13px}.journal-section{padding:54px 0 62px}.journal-head{align-items:start;flex-direction:column;gap:12px}.journal-grid{grid-template-columns:1fr;gap:22px}.journal-card{grid-template-columns:1fr;gap:12px}.journal-modal-card{padding:28px 18px}}
</style>`;

const reviewPatchStyle = `
<style id="codex-review-refine">
.detail-tabs{padding-top:42px!important;margin-top:42px!important}.review-title{margin-bottom:12px!important;font-size:clamp(20px,2.1vw,30px)!important;line-height:1!important}.review-score{margin:0 0 12px!important;padding:10px 0!important;gap:10px!important}.review-score-main{gap:7px!important}.review-score-main strong{font-size:clamp(26px,3vw,38px)!important}.review-count-pill{min-height:28px!important;padding:0 12px!important;font-size:11px!important}.review-satisfaction{margin:0 0 16px!important;padding:12px 0!important;font-size:12px!important}.review-toolbar{gap:7px!important;margin-bottom:10px!important}.review-filter{min-height:30px!important;padding:0 11px!important;font-size:11px!important}.review-sort{margin:8px 0 12px!important;font-size:11px!important}.review-card{padding:22px 0!important}.review-author{font-size:12px!important}.review-date,.review-option,.review-profile{font-size:10px!important}.review-card-stars,.review-stars,.review-blue{color:#050505!important;letter-spacing:1px!important}.review-card-stars{font-size:14px!important}.review-body{font-size:12px!important;line-height:1.62!important}.review-help{font-size:10px!important}.review-help button{font-size:10px!important}.review-media a{cursor:zoom-in}.review-lightbox{position:fixed;inset:0;z-index:160;display:grid;place-items:center;padding:58px 64px;background:rgba(0,0,0,.78);opacity:0;visibility:hidden;transition:.18s}.review-lightbox.is-open{opacity:1;visibility:visible}.review-lightbox img{max-width:min(920px,82vw);max-height:78vh;object-fit:contain;background:#fff}.review-lightbox-close,.review-lightbox-nav{position:absolute;border:0;background:#fff;color:#050505;cursor:pointer}.review-lightbox-close{top:22px;right:24px;width:38px;height:38px;font:400 34px/.8 Arial,sans-serif}.review-lightbox-nav{top:50%;width:42px;height:56px;transform:translateY(-50%);font:400 38px/1 Arial,sans-serif}.review-lightbox-prev{left:22px}.review-lightbox-next{right:22px}.review-lightbox-count{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);color:#fff;font:800 12px/1 InterDisplay,Pretendard,sans-serif}.review-lightbox.is-single .review-lightbox-nav,.review-lightbox.is-single .review-lightbox-count{display:none}@media(max-width:860px){.detail-tabs{padding-top:34px!important;margin-top:34px!important}.review-title{font-size:22px!important}.review-score{padding:8px 0!important}.review-card{padding:18px 0!important}.review-body{font-size:11px!important}.review-lightbox{padding:52px 14px}.review-lightbox img{max-width:100%;max-height:72vh}.review-lightbox-close{top:12px;right:12px}.review-lightbox-nav{width:34px;height:48px;background:rgba(255,255,255,.9)}.review-lightbox-prev{left:8px}.review-lightbox-next{right:8px}}
</style>`;

const reviewPatchScript = `
<script id="codex-review-lightbox">
(function(){
  const heartFive='♥♥♥♥♥';
  const heartOne='♥';
  function normalizeReviewUi(){
    document.querySelectorAll('.review-card-stars,.review-stars').forEach(el=>{el.textContent=heartFive;});
    document.querySelectorAll('.review-blue').forEach(el=>{el.textContent=heartOne;});
    document.querySelectorAll('.review-media a').forEach(anchor=>{
      anchor.removeAttribute('target');
      anchor.removeAttribute('rel');
      anchor.setAttribute('role','button');
      anchor.setAttribute('aria-label','리뷰 이미지 크게 보기');
    });
  }
  const lightbox=document.createElement('div');
  lightbox.className='review-lightbox';
  lightbox.setAttribute('aria-hidden','true');
  lightbox.innerHTML='<button class="review-lightbox-close" type="button" aria-label="리뷰 이미지 닫기">×</button><button class="review-lightbox-nav review-lightbox-prev" type="button" aria-label="이전 이미지">‹</button><img alt="리뷰 이미지 확대"><button class="review-lightbox-nav review-lightbox-next" type="button" aria-label="다음 이미지">›</button><span class="review-lightbox-count"></span>';
  document.body.appendChild(lightbox);
  const image=lightbox.querySelector('img');
  const count=lightbox.querySelector('.review-lightbox-count');
  let gallery=[]; let current=0;
  function render(){const src=gallery[current]; if(!src)return; image.src=src; count.textContent=(current+1)+' / '+gallery.length; lightbox.classList.toggle('is-single',gallery.length<2);}
  function open(anchor){const media=anchor.closest('.review-media'); gallery=[...media.querySelectorAll('a')].map(item=>item.getAttribute('href')).filter(Boolean); current=Math.max(0,gallery.indexOf(anchor.getAttribute('href'))); render(); lightbox.classList.add('is-open'); lightbox.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';}
  function close(){lightbox.classList.remove('is-open'); lightbox.setAttribute('aria-hidden','true'); image.removeAttribute('src'); document.body.style.overflow='';}
  function move(step){if(gallery.length<2)return; current=(current+step+gallery.length)%gallery.length; render();}
  document.addEventListener('click',event=>{const anchor=event.target.closest('.review-media a'); if(anchor){event.preventDefault();open(anchor);return;} if(event.target.closest('.review-lightbox-close'))close(); if(event.target.closest('.review-lightbox-prev'))move(-1); if(event.target.closest('.review-lightbox-next'))move(1); if(event.target===lightbox)close();});
  document.addEventListener('keydown',event=>{if(!lightbox.classList.contains('is-open'))return; if(event.key==='Escape')close(); if(event.key==='ArrowLeft')move(-1); if(event.key==='ArrowRight')move(1);});
  normalizeReviewUi(); setTimeout(normalizeReviewUi,300); new MutationObserver(normalizeReviewUi).observe(document.body,{childList:true,subtree:true});
})();
</script>`;

const journalMarkup = `<section class="journal-section" id="journal" aria-label="BARE journal"><div class="wrap"><div class="journal-head"><div><p class="journal-kicker">BARE JOURNAL</p><h2 class="journal-title">Stories</h2></div><a class="journal-admin" href="admin.html">Admin write</a></div><div class="journal-tabs" role="tablist" aria-label="Journal categories"></div><div class="journal-grid"></div><p class="journal-empty">아직 등록된 글이 없습니다.</p></div></section><div class="journal-modal" aria-hidden="true"><article class="journal-modal-card"><button class="journal-modal-close" type="button" aria-label="글 닫기">×</button><div class="journal-modal-content"></div></article></div>`;

const journalScript = `
<script type="module" id="codex-journal-firebase">
import { firebaseConfig } from './firebase-config.js';
const samplePosts=[
  {id:'sample-1',category:'PROLOGUE',title:'Prologue : BARE.의 시작',excerpt:'베어닷이 어떤 태도와 감각으로 시작되었는지 기록하는 임시 글입니다.',body:'이곳에는 브랜드 탄생 배경, 첫 드롭의 이유, 베어닷이 중요하게 생각하는 움직임과 핏에 대한 이야기를 적을 수 있습니다.\n\n관리자 페이지에서 Firebase 연결 후 글을 작성하면 이 샘플 대신 실제 글이 표시됩니다.',imageUrl:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',createdAt:null,published:true},
  {id:'sample-2',category:'DETAIL',title:'Detail : 작은 차이가 남기는 핏',excerpt:'원단, 라벨, 로고, 봉제 같은 디테일을 소개하는 공간입니다.',body:'제품의 소재와 마감, 착용감에 대한 이야기를 적어주세요. 사진과 함께 제품 안쪽의 섬세한 포인트를 보여주기 좋습니다.',imageUrl:'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',createdAt:null,published:true},
  {id:'sample-3',category:'BEHIND',title:'Behind : 첫 번째 드롭 노트',excerpt:'촬영, 샘플링, 프리오더 진행 과정 등을 기록하는 탭입니다.',body:'신상품 준비 과정, 촬영 현장, 프리오더 일정 등 고객에게 들려주고 싶은 이야기를 자유롭게 적을 수 있습니다.',imageUrl:'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80',createdAt:null,published:true}
];
const tabs=document.querySelector('.journal-tabs');
const grid=document.querySelector('.journal-grid');
const empty=document.querySelector('.journal-empty');
const modal=document.querySelector('.journal-modal');
const modalContent=document.querySelector('.journal-modal-content');
let posts=[]; let active='ALL';
function ready(){return firebaseConfig?.apiKey && !String(firebaseConfig.apiKey).startsWith('YOUR_');}
function dateLabel(post){const value=post.createdAt?.toDate?post.createdAt.toDate():post.createdAt?new Date(post.createdAt):null;return value?value.toLocaleDateString('ko-KR'):'';}
function categories(){return ['ALL',...[...new Set(posts.map(post=>post.category||'NOTE'))]];}
function renderTabs(){tabs.innerHTML=categories().map(cat=>'<button class="journal-tab '+(cat===active?'is-active':'')+'" type="button" data-cat="'+cat+'">'+cat+'</button>').join('');}
function renderPosts(){const visible=posts.filter(post=>(post.published!==false)&&(active==='ALL'||post.category===active));grid.innerHTML=visible.map(post=>'<a class="journal-card" href="#journal" data-id="'+post.id+'"><div class="journal-thumb">'+(post.imageUrl?'<img src="'+post.imageUrl+'" alt="'+post.title+'">':'')+'</div><div><span class="journal-date">'+dateLabel(post)+'</span><h3>'+post.title+'</h3><p>'+post.excerpt+'</p></div></a>').join('');empty.classList.toggle('is-visible',!visible.length);}
function render(){renderTabs();renderPosts();}
function openPost(id){const post=posts.find(item=>item.id===id);if(!post)return;modalContent.innerHTML=(post.imageUrl?'<img src="'+post.imageUrl+'" alt="'+post.title+'">':'')+'<span class="journal-date">'+dateLabel(post)+'</span><h3>'+post.title+'</h3><div class="journal-modal-body">'+(post.body||post.excerpt||'')+'</div>';modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}
function closePost(){modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';}
tabs?.addEventListener('click',event=>{const button=event.target.closest('.journal-tab');if(!button)return;active=button.dataset.cat;render();});
grid?.addEventListener('click',event=>{const card=event.target.closest('.journal-card');if(!card)return;event.preventDefault();openPost(card.dataset.id);});
modal?.addEventListener('click',event=>{if(event.target===modal||event.target.closest('.journal-modal-close'))closePost();});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closePost();});
async function load(){
  if(!ready()){posts=samplePosts;render();return;}
  try{
    const { initializeApp }=await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js');
    const { getFirestore, collection, query, orderBy, onSnapshot }=await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js');
    const app=initializeApp(firebaseConfig);
    const db=getFirestore(app);
    onSnapshot(query(collection(db,'brandPosts'),orderBy('createdAt','desc')),snapshot=>{posts=snapshot.docs.map(doc=>({id:doc.id,...doc.data()}));if(active!=='ALL'&&!categories().includes(active))active='ALL';render();},()=>{posts=samplePosts;render();});
  }catch(error){posts=samplePosts;render();}
}
load();
</script>`;

const aboutMarkup = `<section class="about-section" id="about" aria-label="About BARE."><div class="wrap"><div><p class="about-kicker">ABOUT BARE.</p><h2 class="about-title">Bare moves with you.</h2></div><div class="about-copy"><p>베어닷은 움직이는 순간에도 몸의 선과 편안함이 자연스럽게 살아나는 애슬레저를 지향합니다.</p><p>불필요한 장식은 덜어내고, 소재와 핏, 작은 디테일에 집중해 일상과 운동 사이를 부드럽게 이어갑니다.</p><p>이 영역은 임시 브랜드 소개 문구입니다. 추후 원하는 톤과 내용으로 자유롭게 수정할 수 있습니다.</p></div></div></section>`;

const menuHeader = `<header class="topbar" aria-label="BAREDOT navigation"><a class="logo" href="#top" aria-label="맨 위로 이동"><img src="https://framerusercontent.com/images/a3Pvzk5vHkS6uAT6JGV5VgPpTZk.png?width=1080&height=1080" alt="BAREDOT."></a><nav class="topnav"><button class="nav-trigger" type="button" data-menu="men">MEN</button><button class="nav-trigger" type="button" data-menu="women">WOMEN</button><a href="#about">ABOUT</a><a href="#journal">Journal</a><a href="#shop">Acc</a></nav><div class="mega-menu" data-menu-panel="men" aria-hidden="true"><div class="mega-body"><nav class="mega-categories"><a href="#men-all">ALL</a><a href="#men-top">TOP</a><a href="#men-bottom">BOTTOM</a></nav></div></div><div class="mega-menu" data-menu-panel="women" aria-hidden="true"><div class="mega-body"><nav class="mega-categories"><a href="#women-all">ALL</a><a href="#women-top">TOP</a><a href="#women-bottom">BOTTOM</a></nav></div></div></header>`;

function patchHtml(html) {
  const headerPattern = /<header class="topbar" aria-label="BAREDOT navigation">[\s\S]*?<\/header>/;
  let patched = html
    .replace(/<style id="codex-deploy-menu-promo">[\s\S]*?<\/style>/, '')
    .replace(/<style id="codex-review-refine">[\s\S]*?<\/style>/, '')
    .replace(/<script id="codex-review-lightbox">[\s\S]*?<\/script>/, '')
    .replace(/<script type="module" id="codex-journal-firebase">[\s\S]*?<\/script>/, '')
    .replace(/<section class="journal-section" id="journal"[\s\S]*?<div class="journal-modal"[\s\S]*?<\/div><\/article><\/div>/, '')
    .replace(/<section class="about-section" id="about"[\s\S]*?<\/section>/, '');
  patched = patched.replace('</head>', `${menuPromoStyle}\n${reviewPatchStyle}\n</head>`);
  patched = patched.replace(headerPattern, menuHeader);
  patched = patched.replace('<footer', `${journalMarkup}\n<footer`);
  patched = patched.replace('</footer>', `</footer>\n${aboutMarkup}`);
  patched = patched.replace('</body>', `${reviewPatchScript}\n${journalScript}\n</body>`);
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
