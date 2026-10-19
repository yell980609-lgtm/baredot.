// Display the supplied campaign artwork without cropping or altering the images.
export const homeBrandCardsStyle=`<style id="bare-home-brand-cards-style">
.home-brand-cards{padding:0 0 64px;background:#fff}
.home-view .home-brand-cards>.wrap{width:min(1120px,calc(100% - 36px))!important;margin-inline:auto}
.home-brand-cards-head{width:70%;margin:0 auto 24px}
.home-brand-cards-grid{display:grid;width:70%;margin-inline:auto;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;align-items:start}
.home-brand-card{margin:0;min-width:0}
.home-brand-card img{display:block;width:100%;height:auto}
@media(max-width:860px){.home-brand-cards{padding-bottom:44px}.home-view .home-brand-cards>.wrap{width:calc(100% - 32px)!important}.home-brand-cards-grid{gap:4.2px}}
</style>`;
export function renderHomeBrandCards(signature,cards){
 if(!signature||!Array.isArray(cards)||cards.length!==2||cards.some(card=>!card.src))return;
 let section=document.getElementById('home-brand-cards');
 if(!section){section=document.createElement('section');section.id='home-brand-cards';section.className='home-brand-cards';section.setAttribute('aria-labelledby','home-brand-cards-title');section.innerHTML='<div class="wrap"><div class="home-brand-cards-head"><h2 class="home-box-heading" id="home-brand-cards-title">OUR DIRECTION</h2></div><div class="home-brand-cards-grid"></div></div>';}
 signature.closest('.home-view').appendChild(section);
 const fragment=document.createDocumentFragment();
 for(const card of cards){const figure=document.createElement('figure');figure.className='home-brand-card';const image=document.createElement('img');image.src=card.src;image.alt=card.alt;image.width=card.width||1241;image.height=card.height||1748;image.loading='lazy';image.decoding='async';figure.appendChild(image);fragment.appendChild(figure)}
 section.querySelector('.home-brand-cards-grid').replaceChildren(fragment);
}
