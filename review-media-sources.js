// Review links can come from older imports as well as the admin URL field.
export function reviewImageUrl(value){
 const raw=typeof value==='string'?value:value?.url||value?.src||'';
 let src=String(raw).trim().replace(/&amp;/gi,'&');
 if(src.startsWith('//'))src='https:'+src;
 if(src.startsWith('http://'))src='https://'+src.slice(7);
 if(/^\.?\/?assets\//.test(src))src='/'+src.replace(/^\.?\//,'');
 if(!src||!(/^(https:\/\/|\/)/i.test(src)))return '';
 return src;
}
export function withReviewMediaSources(html){
 const helpers='<script id="bare-review-media-sources">window.bareReviewImageUrl='+reviewImageUrl.toString()+';</script>';
 return html.replace('</head>',helpers+'</head>')
 .replace(`<img src="'+safe(src)+'" alt="'+safe(review.author)`,`<img referrerpolicy="no-referrer" src="'+safe(window.bareReviewImageUrl(src))+'" alt="'+safe(review.author)`)
 .replace(`<img src="'+(review.poster||src)+'" alt="'+review.author`,`<img referrerpolicy="no-referrer" src="'+window.bareReviewImageUrl(review.poster||src)+'" alt="'+review.author`)
 .replace(`<img src="'+src+'" alt="'+review.author`,`<img referrerpolicy="no-referrer" src="'+window.bareReviewImageUrl(src)+'" alt="'+review.author`)
 .replace('image.src=items[index].src;','image.referrerPolicy="no-referrer";image.src=items[index].src;');
}
