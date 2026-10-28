const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..'),shots=process.env.NATION_SCREENSHOTS_DIR||'/tmp',fontRoot=process.env.NATION_TEST_FONT_ROOT;
const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost'),fonts=url.pathname.startsWith('/fonts/'),base=fonts?fontRoot:root;if(!base){res.writeHead(404);return res.end()}const f=path.resolve(base,fonts?url.pathname.slice(7):url.pathname.slice(1)||'index.html');if(!f.startsWith(base+'/')){res.writeHead(403);return res.end()}fs.readFile(f,(e,b)=>{if(e){res.writeHead(404);return res.end()}res.setHeader('Content-Type',f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':f.endsWith('.html')?'text/html;charset=utf-8':f.endsWith('.png')?'image/png':f.endsWith('.webp')?'image/webp':'application/octet-stream');res.end(b)})});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--no-zygote','--single-process','--disable-dev-shm-usage','--disable-gpu']});
 const page=await browser.newPage({viewport:{width:1365,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.stack));
 await page.route(/fonts\.googleapis\.com|fonts\.gstatic\.com/,r=>r.abort());const url='http://127.0.0.1:'+server.address().port;
 async function fonts(){if(fontRoot){await page.addStyleTag({content:fs.readFileSync(path.join(fontRoot,'400.css'),'utf8').replaceAll('./files/',url+'/fonts/files/')});await page.evaluate(()=>document.fonts.ready)}}
 async function fit(label){const m=await page.evaluate(()=>({body:document.documentElement.scrollWidth,width:innerWidth,paper:$('office-workspace').scrollWidth,available:$('office-workspace').clientWidth}));assert(m.body<=m.width+1&&m.paper<=m.available+1,label+JSON.stringify(m))}
 async function shot(name){fs.mkdirSync(shots,{recursive:true});await page.screenshot({path:path.join(shots,name+'.png'),fullPage:false})}
 async function ready(){await page.evaluate(()=>{if($('modal').open)$('modal').close();pstate().current=null;pstate().queue=[];sits().notices=[];features107().noticeCollapsed=true;renderNotices107()})}

 try{
  await page.goto(url);await fonts();
  await page.evaluate(()=>{selectedRegime='constitutional';pendingAdmin107=true;create('bicameral-browser');s.approval=80;s.stability=90;pstate().ap=100;changeTab('assembly')});await ready();
  assert.equal(await page.locator('.chamber-switch108 button').count(),2);
  assert.equal(await page.locator('.seat-chamber rect').count(),100);
  await page.getByRole('button',{name:'上议院',exact:true}).click();
  assert.equal(await page.locator('.upper-seat108').count(),50);assert.equal(await page.locator('.upper-seat-chart rect').count(),50);assert.equal(await page.locator('.upper-faction108 button').count(),0);
  assert.equal(await page.locator('details[open]').count(),0);
  for(const width of [1365,390,320]){await page.setViewportSize({width,height:1000});await fit('upper '+width);await shot('bicameral-upper-'+width)}
  await page.setViewportSize({width:1365,height:1000});
  await page.evaluate(()=>{chamberView108='lower';for(const f of pstate().factions){f.relation=100;f.agendaOffset107=150}pstate().members.forEach(m=>m.relation=100);draft={...s.policies,income:s.policies.income+1};proposeBudget()});await ready();
  const income=await page.evaluate(()=>s.policies.income);await page.locator('button[onclick="voteBill()"]:visible').click();assert.equal(await page.evaluate(()=>s.policies.income),income);assert(await page.locator('#upper-docket108').isVisible());
  await page.locator('button[onclick="meetUpper108(0)"]').click();assert((await page.locator('#modal').innerText()).includes('本案修订要求'));const ap=await page.evaluate(()=>pstate().ap);await page.getByRole('button',{name:/召开跨团体审议会议/}).click();assert.equal(await page.evaluate(()=>pstate().ap),ap-1);
  let saved=await page.evaluate(()=>{save();return JSON.stringify(s)});await page.reload();await fonts();await page.locator('#continue-game').click();assert.equal(await page.evaluate(()=>JSON.stringify(s)),saved,'upper bill and agreement reload exact');await ready();
  await page.evaluate(()=>{bicameral108().upper.groups.forEach(g=>{g.agenda=100;g.decay=0;g.relation=100});switchChamber108('upper')});await ready();const upperAP=await page.evaluate(()=>pstate().ap);await page.getByRole('button',{name:'进行复审 · 不消耗行动点',exact:true}).click();assert.equal(await page.evaluate(()=>pstate().ap),upperAP);assert.equal(await page.evaluate(()=>s.policies.income),income+1);
  await page.locator('#page-tutorial').click();let texts=[],count=0;while(await page.locator('#tutorial-controls').count()){texts.push(await page.locator('#tutorial-controls').innerText());await page.keyboard.press('Space');assert(++count<70)}assert(texts.join('|').includes('复审'));assert(texts.join('|').includes('50个'));
  await page.evaluate(()=>showHelp());await page.locator('#guide-query').fill('上院复审');assert((await page.locator('#guide-results').innerText()).includes('总统制'));await page.getByRole('button',{name:'关闭治国指南'}).click();
  await page.evaluate(()=>{selectedRegime='symbolic';pendingAdmin107=true;create('symbolic-browser');pstate().ap=100;changeTab('assembly');switchChamber108('upper')});await ready();
  assert.equal(await page.locator('.upper-seat108').count(),50);assert(await page.getByRole('button',{name:'组建新一届参议院'}).isDisabled());
  await page.locator('#upper-input-establishment').fill('30');await page.locator('#upper-input-progressive').fill('40');await page.locator('#upper-input-conservative').fill('29');assert(await page.getByRole('button',{name:'组建新一届参议院'}).isDisabled());await page.getByRole('button',{name:'增加共和保守',exact:true}).click();assert(await page.getByRole('button',{name:'组建新一届参议院'}).isEnabled());assert((await page.locator('#upper-composition-result').innerText()).includes('100%'));
  for(const width of [1365,390,320]){await page.setViewportSize({width,height:1000});await fit('symbolic '+width);await shot('bicameral-symbolic-'+width)}
  await page.getByRole('button',{name:'组建新一届参议院'}).click();assert.equal(await page.locator('.member-grid .person').count(),await page.evaluate(()=>bicameral108().upper.members.length));assert(await page.evaluate(()=>validSave(s)));
  await page.setViewportSize({width:1365,height:1000});
  await page.evaluate(()=>{selectedRegime='federal';pendingAdmin107=true;create('federal-upper-browser');pstate().ap=100;changeTab('assembly');meetMember(0)});await page.getByRole('button',{name:'提出修宪',exact:true}).click();assert((await page.locator('#modal').innerText()).includes('不需国民院三分之二'));await page.getByRole('button',{name:/政府集权化/}).click();await ready();assert.equal(await page.evaluate(()=>constitution().docket.stage),'upper');assert(await page.locator('#upper-docket108').isVisible());assert.equal(await page.evaluate(()=>constitution().docket.reviewDeadline),null);
  saved=await page.evaluate(()=>{save();return JSON.stringify(s)});await page.reload();await fonts();await page.locator('#continue-game').click();assert.equal(await page.evaluate(()=>JSON.stringify(s)),saved,'amendment upper exact reload');await ready();
  for(const id of await page.evaluate(()=>REGIMES.map(r=>r.id))){await page.evaluate(id=>{selectedRegime=id;pendingAdmin107=true;create('chamber-smoke-'+id)},id);await ready();for(const t of ['assembly','cabinet','judiciary','budget','reforms','politics','archive','centralbank'])await page.evaluate(t=>changeTab(t),t);assert(await page.evaluate(()=>validSave(s)),id+' valid');}
  // The archive silhouette must not include the desk below its lower-right edge.
  await page.evaluate(()=>{selectedRegime='theorepublic';pendingAdmin107=true;create('archive-glow-check');officeUI.close()});await ready();await page.locator('[data-object="archives"].of-object').hover();await page.waitForTimeout(250);assert((await page.locator('[data-object="archives"].of-object').evaluate(e=>getComputedStyle(e).filter)).includes('drop-shadow'));await shot('bicameral-archive-glow');
  const clip=await page.locator('[data-piece="archives"]').evaluate(e=>e.style.clipPath);assert(clip.includes('polygon('));
  assert.deepEqual(errors,[]);console.log('PASS browser: real chamber switch, exact seat drawings, budget staging and representative talks, free review, symbolic live inputs and formation, tutorials/guide, federal amendment clock, exact reload, all regime smoke, desktop/mobile layout and archive hover.');
 }finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);server.closeAllConnections();server.close();process.exitCode=1});
