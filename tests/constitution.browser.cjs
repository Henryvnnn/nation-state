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
  await page.evaluate(()=>{selectedRegime='presidential';pendingAdmin107=true;create('constitution-browser');$('modal').close();pstate().current=null;pstate().queue=[];sits().active=[];pstate().ap=100;tab='judiciary';features107().noticeCollapsed=true;save();render()});
  const n=await page.evaluate(()=>constitution().judges.length);assert.equal(await page.locator('[data-judge-seat]').count(),n);assert.equal(await page.locator('.judge-roster article').count(),n);
  assert(await page.locator('#constitutional-court').isVisible());
  await page.getByRole('button',{name:'会见 / 修宪与释宪',exact:true}).click();await page.getByRole('button',{name:'请求释宪',exact:true}).click();
  await page.getByRole('button',{name:/关于国家对劳动者的义务/}).click();assert(await page.locator('#constitutional-docket').textContent().then(x=>x.includes('社会保障预算上限从 20% 提高至 21%')));
  const id=await page.evaluate(()=>constitution().judges.find(j=>!j.chief).id);await page.locator(`button[onclick="meetJudge(${id})"]`).click();await page.getByRole('button',{name:/公开法律论证/}).click();
  assert(await page.evaluate(id=>constitution().judges[id].boosts.length===1,id));
  await page.evaluate(()=>{constitution().judges.forEach(j=>j.boosts.push({docketId:constitution().docket.id,amount:100,until:s.q+3}));render()});
  await page.getByRole('button',{name:'提交表决 · 1 行动点',exact:true}).click();assert.equal(await page.evaluate(()=>budgetCap('welfare')),21);
  await page.locator('[data-nav="budget"]').click();assert.equal(await page.locator('#p-welfare').getAttribute('max'),'21');
  await page.locator('[data-nav="archive"]').click();assert((await page.locator('#constitution-articles').innerText()).includes('社会保障 21%'));
  await page.locator('#guide-open').click();await page.fill('#guide-query','大法官');assert((await page.locator('#guide-results').textContent()).includes('5—10'));await page.fill('#guide-query','释宪');assert((await page.locator('#guide-results').textContent()).includes('修宪与释宪'));await page.locator('.guide-close').click();
  await page.locator('[data-nav="judiciary"]').click();await page.locator('#page-tutorial').click();let steps=0;while(await page.evaluate(()=>!!tutorial104)){await page.keyboard.press('Space');if(++steps>30)throw Error('judiciary tutorial did not finish')}assert(steps>=5);
  await page.evaluate(()=>{s.q++;pstate().ap=100;render()});
  await page.getByRole('button',{name:'会见 / 修宪与释宪',exact:true}).click();await page.getByRole('button',{name:'提出修宪',exact:true}).click();await page.getByRole('button',{name:/修订最高司法机关条款/}).click();
  await page.evaluate(()=>{constitution().judges.forEach(j=>j.boosts.push({docketId:constitution().docket.id,amount:100,until:s.q+3}));render()});await page.getByRole('button',{name:'提交表决 · 1 行动点',exact:true}).click();
  assert.equal(await page.evaluate(()=>regime().court),'议会');await page.locator('[data-nav="assembly"]').click();await page.locator('button[onclick="meetMember(0)"]').click();await page.getByRole('button',{name:'请求释宪',exact:true}).click();await page.getByRole('button',{name:/关于受教育权与科研职责/}).click();
  assert((await page.locator('#constitutional-docket').innerText()).includes('院内支持率'));assert.equal(await page.locator('#constitutional-docket').count(),1);
  await page.reload({waitUntil:'domcontentloaded'});if(fontRoot){let css=fs.readFileSync(path.join(fontRoot,'400.css'),'utf8').replaceAll('./files/','http://127.0.0.1:'+server.address().port+'/__fonts__/files/');await page.addStyleTag({content:css});await page.evaluate(()=>document.fonts.ready)}await page.evaluate(()=>{features107().noticeCollapsed=true;$('modal').close();changeTab('assembly')});assert((await page.locator('#constitutional-docket').innerText()).includes('关于受教育权'));
  await page.getByRole('button',{name:'撤回议案',exact:true}).click();assert.equal(await page.evaluate(()=>constitution().docket),null);
  await page.evaluate(()=>{selectedRegime='absolute';create('privy-browser');$('modal').close();pstate().current=null;pstate().queue=[];pstate().ap=100;features107().noticeCollapsed=true;changeTab('assembly')});
  await page.locator('button[onclick="meetMember(0)"]').click();await page.getByRole('button',{name:'提出修宪',exact:true}).click();await page.getByRole('button',{name:/修订公民权利条款/}).click();await page.getByRole('button',{name:'强行颁行…',exact:true}).click();await page.getByRole('button',{name:'确认强行颁行',exact:true}).click();assert.equal(await page.evaluate(()=>constitution().rights),'equal');
  await page.evaluate(()=>{features107().noticeCollapsed=true;changeTab('judiciary')});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow');assert.deepEqual(errors,[]);
  if(process.env.QA_SCREENSHOT_DIR){fs.mkdirSync(process.env.QA_SCREENSHOT_DIR,{recursive:true});await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(process.env.QA_SCREENSHOT_DIR,`constitution-${viewport.width}.png`),fullPage:true});await page.screenshot({path:path.join(process.env.QA_SCREENSHOT_DIR,`constitution-top-${viewport.width}.png`)})}
  console.log('PASS constitution browser '+viewport.width+'px: chief/judge UI, proposal and voting, actual budget cap, archive, search, Space tutorial, judicial transfer, speaker flow, reload, forced enactment, no JS errors/overflow.');
  await browser.close();browser=null;
 }}finally{if(browser)await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
