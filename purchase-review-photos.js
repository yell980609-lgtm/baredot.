// Only a delivered buyer's signed review link may upload. No storage credentials reach the browser.
const reply=(message,status)=>Response.json({message},{status,headers:{'cache-control':'no-store'}});
const bucket='purchase-review-photos',maxBytes=5*1024*1024;
const proofMessage=(order,item,url)=>'review-photo-v1:'+JSON.stringify([order,item,url]);
export async function uploadReviewPhoto(request,env,orderId,{rest,sign,base,headers,fetch:fetcher=fetch}){
 try{
 if(Number(request.headers.get('content-length')||0)>maxBytes+16384)return reply('사진은 장당 5MB 이하로 첨부해주세요.',400);
 const reader=request.body?.getReader();if(!reader)return reply('사진을 선택해주세요.',400);const chunks=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes+16384){await reader.cancel();return reply('사진은 장당 5MB 이하로 첨부해주세요.',400)}chunks.push(value)}
 const limited=new Response(new Blob(chunks),{headers:{'Content-Type':request.headers.get('content-type')||''}});
 const form=await limited.formData(),file=form.get('file'),itemId=form.get('itemId');
 if(!file||typeof file.arrayBuffer!=='function'||file.size>maxBytes||!file.size)return reply('사진은 장당 5MB 이하로 첨부해주세요.',400);
 const items=await rest(env,'order_items?select=id&order_id=eq.'+encodeURIComponent(orderId)+'&id=eq.'+encodeURIComponent(itemId)+'&limit=1');
 if(!items.length)return reply('구매 상품을 확인해주세요.',403);
 const written=await rest(env,'bare_purchase_reviews?select=id&order_item_id=eq.'+encodeURIComponent(itemId)+'&limit=1');if(written.length)return reply('이미 리뷰를 작성한 상품입니다.',409);
 await rest(env,'bare_purchase_reviews?select=media&limit=0');
 const bytes=new Uint8Array(await file.arrayBuffer());let type,ext;
 if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255){type='image/jpeg';ext='jpg'}
 else if([137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n)){type='image/png';ext='png'}
 else if(new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP'){type='image/webp';ext='webp'}
 else return reply('JPG, PNG, WebP 사진만 첨부할 수 있습니다.',400);
 const root=base(env),auth=headers(env),bucketUrl=root+'/storage/v1/bucket/'+bucket;
 const check=await fetcher(bucketUrl,{headers:auth});if(check.status===404){const created=await fetcher(root+'/storage/v1/bucket',{method:'POST',headers:{...auth,'Content-Type':'application/json'},body:JSON.stringify({id:bucket,name:bucket,public:true,file_size_limit:maxBytes,allowed_mime_types:['image/jpeg','image/png','image/webp']})});if(!created.ok&&created.status!==409)throw Error('bucket')}else if(!check.ok)throw Error('bucket');
 const prefix=(await sign(env,'review-photo-folder:'+orderId+':'+itemId)).slice(0,40);
 const list=await fetcher(root+'/storage/v1/object/list/'+bucket,{method:'POST',headers:{...auth,'Content-Type':'application/json'},body:JSON.stringify({prefix,limit:21})});if(!list.ok)throw Error('list');if((await list.json()).length>=20)return reply('사진 업로드 횟수를 초과했습니다. 고객센터에 문의해주세요.',429);
 const path=prefix+'/'+crypto.randomUUID()+'.'+ext;
 const uploaded=await fetcher(root+'/storage/v1/object/'+bucket+'/'+path,{method:'POST',headers:{...auth,'Content-Type':type,'x-upsert':'false'},body:bytes});if(!uploaded.ok)throw Error('upload');
 const url=root+'/storage/v1/object/public/'+bucket+'/'+path,proof=await sign(env,proofMessage(orderId,itemId,url));
 return Response.json({url,proof},{headers:{'cache-control':'no-store'}});
 }catch{return reply('사진을 업로드하지 못했습니다. 잠시 후 다시 시도해주세요.',503)}
}
export async function validateReviewPhotos(env,order,item,media,sign){
 if(media===undefined)return [];if(!Array.isArray(media)||media.length>5)return null;
 const urls=[];for(const photo of media){if(!photo||typeof photo.url!=='string'||photo.url.length>1000||typeof photo.proof!=='string'||photo.proof.length!==64)return null;const expected=await sign(env,proofMessage(order,item,photo.url));let diff=0;for(let i=0;i<64;i++)diff|=expected.charCodeAt(i)^photo.proof.charCodeAt(i);if(diff||urls.includes(photo.url))return null;urls.push(photo.url)}return urls;
}
