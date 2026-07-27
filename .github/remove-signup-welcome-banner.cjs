const fs = require('fs');
const file = '_worker.js';
let source = fs.readFileSync(file, 'utf8');
const marker = 'bare-signup-remove-welcome-banner-v1';
if (!source.includes(marker)) {
  source += String.raw`

// bare-signup-remove-welcome-banner-v1
const bareSignupNoWelcomeBase=signupPage;
signupPage=function(){return bareSignupNoWelcomeBase().replace(/<style id="bare-member-welcome-style">[\s\S]*?<\/style>/g,'').replace(/<a class="member-welcome-banner"[\s\S]*?<\/a>/g,'')};
`;
  fs.writeFileSync(file, source);
}
for (const path of ['.github/remove-signup-welcome-banner.cjs', '.github/workflows/remove-signup-welcome-banner.yml']) {
  try { fs.unlinkSync(path); } catch (_) {}
}
