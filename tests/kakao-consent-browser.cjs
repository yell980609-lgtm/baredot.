// Run with PLAYWRIGHT_MODULE and CHROMIUM_PATH when these are installed outside the repository.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const {default:worker}=await import('../_worker.js');const original=global.fetch;
 const env={SUPABASE_SERVICE_ROLE_KEY:'test-service-key',KAKAO_REST_API_KEY:'test-kakao-key'};
 let member=null,created=0;
 global.fetch=async(url,options)=>{
  if(url==='https://kauth.kakao.com/oauth/token')return Response.json({access_token:'mock-token'});
  if(url==='https://kapi.kakao.com/v2/user/me')return Response.json({id:1234,kakao_account:{profile:{nickname:'테스트'},email:'test@example.com'}});
  if(url.endsWith('/token?grant_type=password'))return member?Response.json({user:member}):Response.json({error_code:'invalid_credentials'},{status:400});
  if(url.endsWith('/admin/users')){if(member)return Response.json({message:'User exists'},{status:422});created++;member={id:'test-member',...JSON.parse(options.body)};return Response.json(member)}
  throw Error('Unexpected external call '+url);
 };
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
 try{for(const width of [1440,390]){member=null;created=0;const p=await browser.newPage({viewport:{width,height:950}});const errors=[],posts=[];p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/*',async route=>{
   const req=route.request(),url=new URL(req.url());
   if(url.hostname==='cdn.jsdelivr.net')return route.fulfill({contentType:'application/javascript',body:'export const createClient=()=>({auth:{signInWithPassword:async()=>({error:null})}})'});
   assert.equal(url.hostname,'bare.test','No real external requests');
   if(url.pathname==='/')return route.fulfill({contentType:'text/html',body:'<h1>Home</h1>'});
   const headers=await req.allHeaders();if(req.method()==='POST')posts.push({headers,body:req.postData()});
   const response=await worker.fetch(new Request(req.url(),{method:req.method(),headers,...(req.method()==='POST'?{body:req.postData()}: {})}),env,{});
   await route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:await response.text()});
  });
  await p.goto('https://bare.test/api/auth/kakao/callback?code=test&state='+btoa(JSON.stringify({returnUrl:'/'})));
  assert.equal(created,0);assert.equal(await p.locator('[name=terms]').isChecked(),false);
  if(width===1440){await p.locator('[name=terms]').check();await p.locator('[name=privacy]').check()}else await p.locator('#all').check();
  await p.locator('button[type=submit]').click();await p.waitForURL('https://bare.test/',{timeout:10000});
  assert.equal(posts[0].headers.origin,'https://bare.test');assert(posts[0].headers.cookie.includes('__Host-bare_kakao_pending='));
  assert.equal(created,1);assert.equal(member.app_metadata.signup_consent.terms,true);assert.equal(member.app_metadata.marketing_consent.kakao.granted,width===390);
  assert.equal((await p.context().cookies()).some(c=>c.name==='__Host-bare_kakao_pending'),false);
  assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('bare_social_user')).id),'1234');
  await p.goto('https://bare.test/api/auth/kakao/callback?code=again&state='+btoa(JSON.stringify({returnUrl:'/'})));await p.waitForURL('https://bare.test/');assert.equal(posts.length,1);assert.equal(created,1);assert.deepEqual(errors,[]);
  console.log('PASS',width,'real response headers/cookies, native form POST, optional choice, protected evidence, login redirect and returning-login skip');await p.close();
 }}finally{await browser.close();global.fetch=original}
})().catch(e=>{console.error(e);process.exit(1)});
