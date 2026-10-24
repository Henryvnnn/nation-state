// Current-version browser regression: install playwright, then run node tests/browser104.test.cjs.
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
   await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>tutorial104.steps[tutorial104.index].id),'tour-roadmap');await page.keyboard.press('ArrowLeft');assert.equal(await page.evaluate(()=>tutorial104.index),0);
   const quarter=await page.evaluate(()=>s.q);await page.evaluate(()=>$('advance').click());assert.equal(await page.evaluate(()=>s.q),quarter,'underlying actions blocked during tour');
   let visited=[],limit=0;
   while(await page.evaluate(()=>!!tutorial104)){
    const step=await page.evaluate(()=>({id:tutorial104.steps[tutorial104.index].id,page:tab,target:!!tutorial104.target}));visited.push(step);assert(step.target);
    const panel=await page.locator('#tutorial-controls').boundingBox(),skip=await page.locator('#tutorial-skip').boundingBox();assert(panel.x>=0&&panel.x+panel.width<=viewport.width+1,'panel within viewport');assert(skip.y+skip.height<=viewport.height,'skip stays visible');
    if(step.id==='welcome'){assert.match(await page.locator('#tutorial-controls').textContent(),/欢迎您，最高领袖。受最高领袖办公室委托/);await page.screenshot({path:'/tmp/nation105-welcome-'+viewport.width+'.png'})}
    if(step.id==='tour-duration')assert.match(await page.locator('#tutorial-controls').textContent(),/手动延长/);
    if(step.id==='tour-assessment')assert.match(await page.locator('#tutorial-controls').textContent(),/9维任期评估报告/);
    if(step.id==='regime')assert.match(await page.locator('#tutorial-controls').textContent(),/神权君主立宪/);
    if(step.id==='player')assert.match(await page.locator('#tutorial-controls').textContent(),/最高领袖掌握重大国务决策权，没有任期/);
    if(step.id==='faction-details'){
     assert(!(await page.locator('.faction-details').first().getAttribute('open')),'details initially collapsed');
     await page.screenshot({path:'/tmp/nation104-party-tour-'+viewport.width+'.png'});
    }
    await page.locator('#tutorial-controls .primary').click();if(++limit>150)throw Error('tutorial did not finish');
   }
   assert.equal(await page.evaluate(()=>JSON.stringify({s,draft,tab,cabinetSlot})),original,'walkthrough must not mutate game or draft');
   assert.equal(visited.length,7,'short intro');assert(visited.every(step=>step.page==='overview'),'intro only');
   for(let required of ['welcome','tour-roadmap','tour-duration','tour-mission','tour-assessment','guide','page-tutorial'])assert(visited.some(s=>s.id===required),'intro concept '+required);
   for(let section of ['overview','assembly','cabinet','judiciary','politics','budget','reforms','situations','archive']){
    await page.evaluate(section=>changeTab(section),section);const initial=await page.evaluate(()=>JSON.stringify({s,draft,tab,cabinetSlot}));await page.locator('#page-tutorial').click();let count=0,ids=[];
    while(await page.evaluate(()=>!!tutorial104)){
     assert.equal(await page.evaluate(()=>tab),section,'page tutorial stays in selected section');const id=await page.evaluate(()=>tutorial104.steps[tutorial104.index].id);ids.push(id);
     const panel=await page.locator('#tutorial-controls').boundingBox();assert(panel.x>=0&&panel.x+panel.width<=viewport.width+1,'page tour fits screen');
     await page.locator('#tutorial-controls .primary').click();if(++count>60)throw Error('page tour did not finish');
    }
    assert(count>1,'page-specific contents');assert(!ids.includes('welcome'),'no repeated intro');assert.equal(await page.evaluate(()=>JSON.stringify({s,draft,tab,cabinetSlot})),initial,'page tour leaves state unchanged');
    if(section==='overview')for(let id of ['regime','player','ap','stability'])assert(ids.includes(id),'overview concept '+id);
    if(section==='assembly')for(let id of ['pass-rate','negotiate','faction-details'])assert(ids.includes(id),'assembly concept '+id);
    if(section==='archive')for(let id of ['research','export','import','charts'])assert(ids.includes(id),'archive concept '+id);
   }
   await page.evaluate(()=>changeTab('budget'));
   // Skip and Escape must restore the exact page and pending event modal.
   await page.click('#tutorial-start');await page.click('#tutorial-skip');assert.equal(await page.evaluate(()=>tab),'budget');
   await page.evaluate(()=>{pstate().current=eventFrom('待处理事务','此事尚未决定',[option('确认','无即时变化')]);showPoliticalEvent();startTutorial()});await page.keyboard.press('Escape');assert(await page.locator('#modal').isVisible());assert.match(await page.locator('#modal').textContent(),/待处理事务/);assert.equal(await page.evaluate(()=>pstate().current.title),'待处理事务');
   await page.evaluate(()=>$('modal').close());await page.click('#guide-open');await page.fill('#guide-query','奥运');await page.screenshot({path:'/tmp/nation104-guide-'+viewport.width+'.png'});
   await page.evaluate(()=>{$('modal').close();tab='cabinet';cabinetSlot='foreign';render()});
   assert.deepEqual(await page.locator('#task option').allTextContents(),['自主判断','改善本部门财政','民粹型外交','稳健型外交','经济扩张型外交']);
   const ap=await page.evaluate(()=>pstate().ap);await page.selectOption('#task','foreign_trade');
   assert.match(await page.locator('[data-office-task="foreign"]').textContent(),/本季任务：经济扩张型外交/);assert.match(await page.locator('.task-brief').textContent(),/就业调整/);assert.equal(await page.evaluate(()=>pstate().ap),ap);
   await page.locator('.cabinet-layout').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/nation105-cabinet-'+viewport.width+'.png'});
   if(viewport.width===390){await page.locator('#task').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/nation105-task-390.png'})}
   await page.locator('.office[onclick*="education"]').click();assert.equal(await page.locator('#task option').count(),5);assert((await page.locator('#task option').allTextContents()).includes('发展职业教育'));
   await page.locator('.office[onclick*="head"]').click();assert.equal(await page.locator('#task option').count(),9);assert((await page.locator('#task option').allTextContents()).includes('稳健财政'));
   await page.reload({waitUntil:'domcontentloaded'});assert.equal(await page.evaluate(()=>pstate().cabinet.foreign.task),'foreign_trade','saved instruction survives reload');
   await page.evaluate(()=>{$('modal').close();selectedRegime='absolute';create('welcome105');startTutorial()});assert.match(await page.locator('#tutorial-controls').textContent(),/欢迎您，陛下。受枢密院委托/);await page.keyboard.press('Escape');
   if(fontRoot){let css=fs.readFileSync(path.join(fontRoot,'400.css'),'utf8').replaceAll('./files/','http://127.0.0.1:'+server.address().port+'/__qa_fonts__/files/');await page.addStyleTag({content:css});await page.evaluate(()=>document.fonts.ready)}
   // 1.0.7: inspect both diagrams, the independent capital and the new ministry in the live UI.
   for(let id of ['presidential','westminster','absolute','party']){
    await page.evaluate(id=>{selectedRegime=id;create('visual107-'+id);pstate().current=null;pstate().queue=[];$('modal').close();changeTab('assembly')},id);
    assert.equal(await page.locator('.seat-chamber circle').count(),100);assert.equal(await page.locator('.seat-chamber text').count(),0);
    const layout=await page.locator('.seat-chamber').getAttribute('data-layout');assert.equal(layout,['westminster','absolute'].includes(id)?'benches':'semicircle');
    const bounds=await page.locator('.seat-chamber').boundingBox();assert(bounds.x>=0&&bounds.x+bounds.width<=viewport.width+1,'seat graph fits screen');
    await page.locator('.seat-chamber').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/nation107-'+id+'-'+viewport.width+'.png'});
   }
   await page.evaluate(()=>changeTab('politics'));assert.equal(await page.locator('.region-grid article').count(),8);
   assert.match(await page.locator('.region-grid article').last().textContent(),/首都地区/);await page.locator('.region-grid article').last().scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/nation107-capital-'+viewport.width+'.png'});
   await page.evaluate(()=>{changeTab('cabinet');cabinetSlot='labour';render()});assert.equal(await page.locator('#task option').count(),5);assert.match(await page.locator('.minister-programme h3').textContent(),/就业与劳动保障计划/);await page.selectOption('#task','labour_employment');assert.match(await page.locator('[data-office-task="labour"]').textContent(),/就业促进/);
   await page.evaluate(()=>changeTab('archive'));await page.getByRole('button',{name:'解释政策利率',exact:true}).click();assert.match(await page.locator('#guide-results').textContent(),/玩家不能直接设定/);await page.fill('#guide-query','政策利率、');assert.match(await page.locator('#guide-results').textContent(),/国债收益率/);await page.screenshot({path:'/tmp/nation107-rate-'+viewport.width+'.png'});await page.locator('.guide-close').click();
   assert.deepEqual(errors,[]);console.log('PASS browser '+viewport.width+'px: '+visited.length+' tutorial steps, regime preface, live search, overlays, unchanged state, portfolio options, live task status and saved directions; no page errors.');await page.close();await browser.close();
  }
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve))}
})().catch(e=>{console.error(e);process.exitCode=1});
