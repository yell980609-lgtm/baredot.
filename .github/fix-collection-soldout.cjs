const fs = require('fs');
const workerPath = '_worker.js';
let source = fs.readFileSync(workerPath, 'utf8');
const before = 'const originalRenderOptions=renderOptions;';
const after = "const originalRenderCollection=renderCollection;renderCollection=function(){originalRenderCollection();document.querySelectorAll('.collection-view .product-card').forEach(card=>{const data=productData[card.getAttribute('href')];if(!data?.dynamic)return;const variants=Array.isArray(data.variants)?data.variants:[],soldout=data.status==='soldout'||(variants.length>0&&!variants.some(item=>item.active!==false&&!item.soldout&&Number(item.stock||0)>0));card.classList.toggle('is-soldout',soldout);const image=card.querySelector('.product-image'),badge=image?.querySelector('.db-soldout-badge');if(soldout&&!badge)image?.insertAdjacentHTML('beforeend','<span class=\\\"db-soldout-badge\\\">SOLD OUT</span>');if(!soldout)badge?.remove()})};const originalRenderOptions=renderOptions;";
if (!source.includes(before)) throw new Error('Collection render hook was not found');
source = source.replace(before, after);
source += "\n/* bare-collection-soldout-fix-v1 */\n";
fs.writeFileSync(workerPath, source);
for (const path of ['.github/fix-collection-soldout.cjs', '.github/workflows/fix-collection-soldout.yml']) {
  if (fs.existsSync(path)) fs.unlinkSync(path);
}
