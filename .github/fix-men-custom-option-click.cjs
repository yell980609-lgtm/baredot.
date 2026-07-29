const fs=require('fs');
const workerPath='_worker.js';
let source=fs.readFileSync(workerPath,'utf8');
const marker='// bare-fix-men-custom-option-click-v1';
if(!source.includes(marker)){
source+=`\n\n${marker}\nconst bareMenCustomOptionBase=patchHtml;\npatchHtml=function(html){return bareMenCustomOptionBase(html).replace(\"matchesSelection=(item,selection)=>groups.every(group=>!selection[group.key]||String((item.options&&item.options[group.key])||item[group.key]||'')===selection[group.key])\",\"matchesSelection=(item,selection)=>groups.every(group=>!selection[group.key]||(group.key.startsWith('custom-')&&!((item.options&&item.options[group.key])||item[group.key]))||String((item.options&&item.options[group.key])||item[group.key]||'')===selection[group.key])\")};\n`;
fs.writeFileSync(workerPath,source);
}
for(const path of ['.github/fix-men-custom-option-click.cjs','.github/workflows/fix-men-custom-option-click.yml'])if(fs.existsSync(path))fs.unlinkSync(path);
