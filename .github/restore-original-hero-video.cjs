const fs = require('fs');
const file = '_worker.js';
let source = fs.readFileSync(file, 'utf8');
const marker = 'bare-restore-original-hero-video-v1';
if (!source.includes(marker)) {
  source += String.raw`

// bare-restore-original-hero-video-v1
const bareOriginalHeroVideoBase=patchHtml;
patchHtml=function(html){return bareOriginalHeroVideoBase(html).replace(/assets\/hero-comp-1-21\.mp4/g,'assets/hero-original-web.mp4')};
`;
  fs.writeFileSync(file, source);
}
for (const path of ['.github/restore-original-hero-video.cjs', '.github/workflows/restore-original-hero-video.yml']) {
  try { fs.unlinkSync(path); } catch (_) {}
}
