const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const {trackingScript}=await import('../analytics.js');
 const {META_PIXEL_ID}=await import('../meta-pixel.js');
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const fixture='<!doctype html><html><body><h1>BARE.</h1>'+trackingScript+'</body></html>';
 async function open({url='https://baredot.pages.dev/',stored={},privacy,ready=false,width=1440,blocked=false,duplicate=false,delayed=false}={}){
  const context=await browser.newContext({viewport:{width,height:960}});await context.addInitScript(({stored,privacy})=>{for(const [key,value] of Object.entries(stored))localStorage.setItem(key,JSON.stringify(value));if(privacy)Object.defineProperty(navigator,privacy,{get:()=>privacy==='doNotTrack'?'1':true})},{stored,privacy});
  const page=await context.newPage(),requests=[],errors=[],events=[];let releaseMeta;page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',async route=>{const req=route.request(),u=new URL(req.url());if(u.hostname==='connect.facebook.net'){requests.push(req.url());if(blocked)return route.abort();if(delayed)await new Promise(resolve=>releaseMeta=resolve);return route.fulfill({contentType:'application/javascript',body:`window.__metaObserved=Array.from(fbq.queue,args=>Array.from(args));fbq.callMethod=function(){window.__metaObserved.push(Array.from(arguments))};`})}if(u.hostname==='www.facebook.com')throw Error('Unexpected real Meta event in test');if(u.pathname==='/api/analytics/status')return route.fulfill({json:{ready}});if(u.pathname==='/api/analytics/event'){events.push(req.postDataJSON());return route.fulfill({status:204})}return route.fulfill({contentType:'text/html',body:duplicate?fixture.replace('</body>',trackingScript+'</body>'):fixture})});
  await page.goto(url,{waitUntil:delayed?'domcontentloaded':'load'});await page.waitForTimeout(280);return {context,page,requests,errors,events,release:()=>releaseMeta?.()};
 }
 const views=page=>page.evaluate(()=>(window.__metaObserved||[]).filter(c=>c[0]==='track'&&c[1]==='PageView').length);
 const accepted={bare_analytics_consent:'accepted',bare_meta_pixel_consent:'accepted'};
 try{
  for(const width of [1440,390]){
   const t=await open({width,ready:false});assert.equal(t.requests.length,0);await t.page.locator('[data-consent=accepted]').click();await t.page.waitForFunction(()=>window.__metaObserved?.some(c=>c[0]==='track'));assert.equal(await views(t.page),1);assert.equal(t.requests.length,1);const init=await t.page.evaluate(()=>__metaObserved.filter(c=>c[0]==='init'));assert.deepEqual(init,[['init',META_PIXEL_ID]]);assert(await t.page.evaluate(()=>__metaObserved.some(c=>c[0]==='set'&&c[1]==='autoConfig'&&c[2]===false)));assert.equal(t.events.length,0,'Meta must not depend on analytics DB readiness');
   await t.page.evaluate(()=>location.hash='#product-db-top');await t.page.waitForFunction(()=>__metaObserved.filter(c=>c[0]==='track').length===2);await t.page.evaluate(()=>dispatchEvent(new HashChangeEvent('hashchange')));await t.page.waitForTimeout(280);assert.equal(await views(t.page),2);await t.page.evaluate(()=>window.bareDisableMetaPixel());await t.page.evaluate(()=>location.hash='#women-all');await t.page.waitForTimeout(280);assert.equal(await views(t.page),2);assert(await t.page.evaluate(()=>__metaObserved.some(c=>c[0]==='consent'&&c[1]==='revoke')));assert.deepEqual(t.errors,[]);await t.context.close();console.log('PASS',width,'fresh consent, pixel ID, one init, PageView/hash dedup, DB independence and withdrawal');
  }
  let t=await open({stored:{bare_analytics_consent:'accepted'},ready:true});assert.equal(t.requests.length,0);assert.equal(await t.page.locator('.bare-analytics-consent').count(),1);await t.page.locator('[data-consent=rejected]').click();await t.page.evaluate(()=>location.hash='#product-db-top');await t.page.waitForTimeout(280);assert.equal(t.requests.length,0);await t.context.close();
  t=await open({stored:{bare_analytics_consent:'rejected'}});assert.equal(t.requests.length,0);assert.equal(await t.page.locator('.bare-analytics-consent').count(),0);await t.context.close();
  for(const privacy of ['doNotTrack','globalPrivacyControl']){t=await open({stored:accepted,privacy});assert.equal(t.requests.length,0);await t.context.close()}
  for(const path of ['/admin/orders','/member/login.html','/order/usd-success?paymentKey=secret','/review#token=private','/cart/usd','/sandbox','/?email=private@example.com','/#token=secret']){t=await open({url:'https://baredot.pages.dev'+path,stored:accepted});assert.equal(t.requests.length,0,path);await t.context.close()}
  for(const host of ['paypal-sandbox.baredot.pages.dev','1234.baredot.pages.dev','localhost']){t=await open({url:'https://'+host+'/',stored:accepted});assert.equal(t.requests.length,0,host);await t.context.close()}
  t=await open({stored:accepted,duplicate:true});assert.equal(t.requests.length,1);assert.equal(await views(t.page),1);await t.context.close();
  t=await open({stored:accepted,delayed:true});assert.equal(t.requests.length,1);await t.page.evaluate(()=>window.bareDisableMetaPixel());t.release();await t.page.waitForFunction(()=>window.__metaObserved);assert.equal(await views(t.page),0,'withdrawal must discard queued views while Meta is still loading');await t.context.close();
  t=await open({stored:accepted,blocked:true});assert.equal(t.requests.length,1);assert.deepEqual(t.errors,[]);await t.context.close();
  console.log('PASS existing analytics consent is not advertising consent, rejection, DNT/GPC, sensitive routes/query/token, preview exclusion, duplicate injection and ad blocker');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
