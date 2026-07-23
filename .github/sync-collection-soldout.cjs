const fs = require('fs');
const workerPath = '_worker.js';
let source = fs.readFileSync(workerPath, 'utf8');
const before = "const data=productData[card.getAttribute('href')];if(!data?.dynamic)return;const variants=Array.isArray(data.variants)?data.variants:[],soldout=data.status==='soldout'||(variants.length>0&&!variants.some(item=>item.active!==false&&!item.soldout&&Number(item.stock||0)>0));";
const after = "const home=[...document.querySelectorAll('.shop-section .product-card')].find(item=>item.getAttribute('href')===card.getAttribute('href')),soldout=home?.classList.contains('is-soldout')||false;";
if (!source.includes(before)) throw new Error('Previous collection sold-out logic was not found');
source = source.replace(before, after);
source += "\n/* bare-collection-soldout-sync-v2 */\n";
fs.writeFileSync(workerPath, source);
for (const path of ['.github/sync-collection-soldout.cjs', '.github/workflows/sync-collection-soldout.yml']) {
  if (fs.existsSync(path)) fs.unlinkSync(path);
}
