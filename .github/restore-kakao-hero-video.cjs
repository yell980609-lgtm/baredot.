const fs = require('fs');

const workerPath = '_worker.js';
let source = fs.readFileSync(workerPath, 'utf8');
const marker = '// bare-restore-kakao-hero-video-v1';

if (!source.includes(marker)) {
  source += `\n\n${marker}\nconst bareKakaoHeroVideoBase=patchHtml;\npatchHtml=function(html){return bareKakaoHeroVideoBase(html).replace(/assets\\/hero-original-web\\.mp4/g,'assets/KakaoTalk_20260525_182952322.mp4').replace(/assets\\/hero-comp-1-21\\.mp4/g,'assets/KakaoTalk_20260525_182952322.mp4')};\n`;
  fs.writeFileSync(workerPath, source);
}

for (const path of [
  '.github/restore-kakao-hero-video.cjs',
  '.github/workflows/restore-kakao-hero-video.yml'
]) {
  if (fs.existsSync(path)) fs.unlinkSync(path);
}
