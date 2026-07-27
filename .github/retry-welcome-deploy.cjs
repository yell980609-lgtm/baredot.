const fs=require('fs');
const file='_worker.js';
let source=fs.readFileSync(file,'utf8');
if(!source.includes('bare-welcome-pack-redeploy-v1'))source+='\n/* bare-welcome-pack-redeploy-v1 */\n';
fs.writeFileSync(file,source);
for(const path of ['.github/retry-welcome-deploy.cjs','.github/workflows/retry-welcome-deploy.yml'])if(fs.existsSync(path))fs.unlinkSync(path);
