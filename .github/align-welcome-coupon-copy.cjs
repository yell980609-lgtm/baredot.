const fs = require('fs');
const file = '_worker.js';
let source = fs.readFileSync(file, 'utf8');
const marker = 'bare-welcome-coupon-copy-v1';
if (!source.includes(marker)) {
  source = source
    .replace('가입 즉시 자동 적용</span>', '가입 즉시 쿠폰함 지급</span>')
    .replace('무료배송 혜택까지 자동 적용</span>', '무료배송 쿠폰까지 함께 지급</span>');
  source += '\n\n// bare-welcome-coupon-copy-v1\n';
  fs.writeFileSync(file, source);
}
for (const path of ['.github/align-welcome-coupon-copy.cjs', '.github/workflows/align-welcome-coupon-copy.yml']) {
  try { fs.unlinkSync(path); } catch (_) {}
}
