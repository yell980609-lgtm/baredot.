const fs = require('fs');
const workerPath = '_worker.js';
let source = fs.readFileSync(workerPath, 'utf8');
const before = "function card(product){const hash=route(product),images=imageUrls(product),soldout=product.status==='soldout'||Number(product.stock||0)<=0,price=Number(product.price||0),compare=Number(product.compare_price||0),sale=compare>price;";
const after = "function card(product){const hash=route(product),images=imageUrls(product),variants=Array.isArray(product.variants)?product.variants:[],soldout=product.status==='soldout'||(variants.length>0&&!variants.some(item=>item.active!==false&&!item.soldout&&Number(item.stock||0)>0)),price=Number(product.price||0),compare=Number(product.compare_price||0),sale=compare>price;";
if (!source.includes(before)) throw new Error('Expected storefront card stock logic was not found');
source = source.replace(before, after);
source += "\n/* bare-storefront-stock-fix-v1 */\n";
fs.writeFileSync(workerPath, source);
for (const path of ['.github/fix-storefront-stock.cjs', '.github/workflows/fix-storefront-stock.yml']) {
  if (fs.existsSync(path)) fs.unlinkSync(path);
}
