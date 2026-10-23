// Optional browser smoke test: install playwright, then run node tests/browser104.test.cjs.
// CHROMIUM_PATH can select an existing Chromium executable.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),fontRoot=process.env.NATION_TEST_FONT_ROOT;
(async()=>{
 const server=http.createServer((req,res)=>{let pathname=new URL(req.url,'http://localhost').pathname,base=fontRoot&&pathname.startsWith('/__qa_fonts__/')?fontRoot:root,file=path.join(base,base===fontRoot?pathname.replace('/__qa_fonts__/',''):pathname==='/'?'index.html':pathname);if(!file.startsWith(base+path.sep)){res.writeHead(403);res.end();return}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end();return}res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'application/octet-stream');res.end(data)})});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  for(let viewport of [{width:1365,height:900},{width:390,height:844}]){
   browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-zygote','--single-process']});
   const page=await browser.newPage({viewport}),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'domcontentloaded'});
   if(fontRoot){let css=fs.readFileSync(path.join(fontRoot,'400.css'),'utf8').replaceAll('./files/','http://127.0.0.1:'+server.address().port+'/__qa_fonts__/files/');await page.addStyleTag({content:css});await page.evaluate(()=>document.fonts.ready)}
   await page.evaluate(()=>{selectedRegime='theorepublic';create('browser104');pstate().current=null;pstate().queue=[];tab='budget';draft.income+=1;render()});
   // Search input and aliases use the live DOM, not an HTML string stub.
   await page.click('#guide-open');await page.fill('#guide-query','稳定');const stability=await page.locator('#guide-results').textContent();await page.fill('#guide-query','稳定度');assert.equal(await page.locator('#guide-results').textContent(),stability);
   await page.fill('#guide-query','不存在的词XYZ');assert.match(await page.locator('#guide-results').textContent(),/该概念不存在于此游戏，请检查输入是否正确/);await page.click('.guide-close');
   const original=await page.evaluate(()=>JSON.stringify({s,draft,tab,cabinetSlot}));
   await page.click('#tutorial-start');assert(await page.locator('#tutorial-skip').isVisible());
   await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>tutorial104.steps[tutorial104.index].id),'country');await page.keyboard.press('ArrowLeft');assert.equal(await page.evaluate(()=>tutorial104.index),0);
   const quarter=await page.evaluate(()=>s.q);await page.evaluate(()=>$('advance').click());assert.equal(await page.evaluate(()=>s.q),quarter,'underlying actions blocked during tour');
   let visited=[],limit=0;
   while(await page.evaluate(()=>!!tutorial104)){
    const step=await page.evaluate(()=>({id:tutorial104.steps[tutorial104.index].id,page:tab,target:!!tutorial104.target}));visited.push(step);assert(step.target);
    const panel=await page.locator('#tutorial-controls').boundingBox(),skip=await page.locator('#tutorial-skip').boundingBox();assert(panel.x>=0&&panel.x+panel.width<=viewport.width+1,'panel within viewport');assert(skip.y+skip.height<=viewport.height,'skip stays visible');
    if(step.id==='regime')assert.match(await page.locator('#tutorial-controls').textContent(),/神权君主立宪/);
    if(step.id==='player')assert.match(await page.locator('#tutorial-controls').textContent(),/最高领袖掌握重大国务决策权，没有任期/);
    if(step.id==='faction-details'){
     assert(!(await page.locator('.faction-details').first().getAttribute('open')),'details initially collapsed');
     await page.screenshot({path:'/tmp/nation104-party-tour-'+viewport.width+'.png'});
    }
    await page.locator('#tutorial-controls .primary').click();if(++limit>150)throw Error('tutorial did not finish');
   }
   assert.equal(await page.evaluate(()=>JSON.stringify({s,draft,tab,cabinetSlot})),original,'walkthrough must not mutate game or draft');
   for(let required of ['overview','assembly','cabinet','judiciary','politics','budget','reforms','situations','archive','settlement'])assert(visited.some(s=>s.page===required),'tour page '+required);
   for(let required of ['regime','player','stability','pass-rate','negotiate','programme','research','export','import','guide'])assert(visited.some(s=>s.id===required),'tour concept '+required);
   // Skip and Escape must restore the exact page and pending event modal.
   await page.click('#tutorial-start');await page.click('#tutorial-skip');assert.equal(await page.evaluate(()=>tab),'budget');
   await page.evaluate(()=>{pstate().current=eventFrom('待处理事务','此事尚未决定',[option('确认','无即时变化')]);showPoliticalEvent();startTutorial()});await page.keyboard.press('Escape');assert(await page.locator('#modal').isVisible());assert.match(await page.locator('#modal').textContent(),/待处理事务/);assert.equal(await page.evaluate(()=>pstate().current.title),'待处理事务');
   await page.evaluate(()=>$('modal').close());await page.click('#guide-open');await page.fill('#guide-query','奥运');await page.screenshot({path:'/tmp/nation104-guide-'+viewport.width+'.png'});
   assert.deepEqual(errors,[]);console.log('PASS browser '+viewport.width+'px: '+visited.length+' tutorial steps, live search, overlays, restore, skip and Escape; no page errors.');await page.close();await browser.close();
  }
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve))}
})().catch(e=>{console.error(e);process.exitCode=1});
