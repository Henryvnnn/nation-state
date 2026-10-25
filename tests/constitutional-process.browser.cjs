const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),fontRoot=process.env.NATION_TEST_FONT_ROOT;
(async()=>{
 const server=http.createServer((req,res)=>{let name=new URL(req.url,'http://localhost').pathname,isFont=fontRoot&&name.startsWith('/__fonts__/'),base=isFont?fontRoot:root,file=path.join(base,isFont?name.replace('/__fonts__/',''):name==='/'?'index.html':name);if(!file.startsWith(base+path.sep)){res.writeHead(403);return res.end()}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end()}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream');res.end(data)})});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{for(const viewport of [{width:1365,height:1000},{width:390,height:844}]){
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-zygote','--single-process']});
  const page=await browser.newPage({viewport}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'domcontentloaded'});
  if(fontRoot){let css=fs.readFileSync(path.join(fontRoot,'400.css'),'utf8').replaceAll('./files/','http://127.0.0.1:'+server.address().port+'/__fonts__/files/');await page.addStyleTag({content:css});await page.evaluate(()=>document.fonts.ready)}

  const shot=async name=>{if(process.env.QA_SCREENSHOT_DIR){fs.mkdirSync(process.env.QA_SCREENSHOT_DIR,{recursive:true});await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(process.env.QA_SCREENSHOT_DIR,`${name}-${viewport.width}.png`),fullPage:true})}};
  await page.evaluate(()=>{selectedRegime='presidential';pendingAdmin107=true;create('process-ui');$('modal').close();pstate().current=null;pstate().queue=[];sits().notices=[];sits().active=sits().active.filter(x=>MINORITY_KINDS107.includes(x.kind));pstate().ap=100;features107().noticeCollapsed=true;pstate().factions.forEach((f,i)=>{f.relation=100;f.agendaDecay=0;if(i<3)f.name=['社会民主党','自由民主党','国民党'][i]});pstate().members.forEach(m=>m.relation=100);save();changeTab('assembly')});
  assert(await page.evaluate(()=>chamberSeatData107().seats.every(x=>x.color===factionColor107(x.faction))));
  assert.equal(await page.evaluate(()=>factionColor107(0)),'#c33874');assert.equal(await page.evaluate(()=>factionColor107(1)),'#c5a126');assert.equal(await page.evaluate(()=>factionColor107(2)),'#396bc1');
  await shot('party-colors');
  await page.locator('[data-nav="judiciary"]').click();await page.getByRole('button',{name:'会见 / 释宪',exact:true}).click();assert.equal(await page.getByRole('button',{name:'提出修宪',exact:true}).count(),0);await page.evaluate(()=>$('modal').close());
  await page.locator('[data-nav="assembly"]').click();await page.locator('button[onclick="meetMember(0)"]').click();await page.getByRole('button',{name:'提出修宪',exact:true}).click();assert((await page.locator('#modal').innerText()).includes('社会多元修正案 · 尚未开放'));await page.getByRole('button',{name:/修订公民权利条款/}).click();
  await page.evaluate(()=>{constitution().judges.forEach(j=>{j.relation=0;j.boosts=[]});render()});
  assert((await page.locator('#constitutional-docket').innerText()).includes('三分之二'));await page.getByRole('button',{name:'提交议会表决 · 1 行动点',exact:true}).click();
  assert.equal(await page.evaluate(()=>amendmentInProgress107()?.stage),'review');await page.locator('[data-nav="situations"]').click();let amendment=page.locator('.situation-grid article').filter({has:page.getByRole('heading',{name:'宪法修订',exact:true})});assert.equal(await amendment.locator('.choices button').count(),0);await shot('amendment-situation');
  await page.locator('[data-nav="judiciary"]').click();await shot('judicial-review');
  const judge=await page.evaluate(()=>{let d=constitution().docket,need=Math.ceil(constitution().judges.length/2);constitution().judges.forEach((j,i)=>j.boosts=i<need-1?[{docketId:d.id,amount:100,until:s.q+3}]:[]);let j=constitution().judges[need-1];j.boosts=[{docketId:d.id,amount:59-judgeWillingness(j),until:s.q+3}];render();return j.id});
  await page.locator(`button[onclick="meetJudge(${judge})"]`).click();await page.getByRole('button',{name:/公开法律论证/}).click();assert.equal(await page.evaluate(()=>constitution().rights),'equal');assert.equal(await page.evaluate(()=>!!activeSit('amendment')),false);
  await page.locator('#guide-open').click();await page.fill('#guide-query','社会多元');assert((await page.locator('#guide-results').innerText()).includes('80%'));await page.locator('.guide-close').click();
  await page.evaluate(()=>{selectedRegime='absolute';create('forced-ui');$('modal').close();pstate().current=null;pstate().queue=[];sits().notices=[];sits().active=sits().active.filter(x=>MINORITY_KINDS107.includes(x.kind));pstate().ap=100;features107().noticeCollapsed=true;s.confidence=80;save();changeTab('situations')});
  await page.getByRole('button',{name:/^强制迁徙/}).click();assert((await page.locator('#modal').innerText()).includes('无法取消'));await page.getByRole('button',{name:'确认开始，无法取消',exact:true}).click();assert.equal(await page.evaluate(()=>s.confidence),60);assert.equal(await page.locator('.situation-grid .choices button').count(),0);
  await page.evaluate(()=>{s.q++;minorityQuarter107();save();render()});let before=await page.evaluate(()=>({confidence:s.confidence,elapsed:minoritySituation107().elapsed,ap:pstate().ap}));assert.equal(before.elapsed,1);await page.reload({waitUntil:'domcontentloaded'});
  if(fontRoot){let css=fs.readFileSync(path.join(fontRoot,'400.css'),'utf8').replaceAll('./files/','http://127.0.0.1:'+server.address().port+'/__fonts__/files/');await page.addStyleTag({content:css});await page.evaluate(()=>document.fonts.ready)}
  await page.evaluate(()=>{features107().noticeCollapsed=true;$('modal').close();changeTab('situations')});assert.deepEqual(await page.evaluate(()=>({confidence:s.confidence,elapsed:minoritySituation107().elapsed,ap:pstate().ap})),before);assert((await page.locator('#content').innerText()).includes('剩余 19 季度'));await shot('long-term-issue');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow');assert.deepEqual(errors,[]);
  console.log('PASS constitutional process browser '+viewport.width+'px: semantic colors, chair-only amendments, live weighted legislative vote, court deadline UI, no situation shortcuts, judge lobbying auto-enactment, guide, irreversible policy confirmation/cost/reload, no JS errors or overflow.');
  await browser.close();browser=null;
 }}finally{if(browser)await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
