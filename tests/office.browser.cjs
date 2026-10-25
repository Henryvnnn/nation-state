const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),baseline=process.env.BASELINE_DIR?path.resolve(process.env.BASELINE_DIR):null;
const shots=process.env.NATION_SCREENSHOTS_DIR||require('node:os').tmpdir();
fs.mkdirSync(shots,{recursive:true});
const fontRoot=process.env.NATION_TEST_FONT_ROOT;
const server=http.createServer((req,res)=>{
 const u=new URL(req.url,'http://localhost').pathname;
 const base=u.startsWith('/classic/')?baseline:u.startsWith('/fonts/')?fontRoot:root;
 if(!base){res.writeHead(404);return res.end()}
 const relative=u.startsWith('/classic/')?u.slice(9):u.startsWith('/fonts/')?u.slice(7):u.slice(1);
 const file=path.resolve(base,relative||'index.html');if(!file.startsWith(base+path.sep)){res.writeHead(403);return res.end()}
 fs.readFile(file,(e,b)=>{if(e){res.writeHead(404);return res.end()}res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html;charset=utf-8':file.endsWith('.webp')?'image/webp':file.endsWith('.png')?'image/png':'application/octet-stream');res.end(b)});
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-zygote','--single-process']});
 const page=await browser.newPage({viewport:{width:1365,height:900}}),errors=[];
 page.on('pageerror',e=>{errors.push(e.stack);console.error('BROWSER ERROR',page.url(),e.stack)});
 const url='http://127.0.0.1:'+server.address().port;
 async function fonts(){if(fontRoot){await page.addStyleTag({content:fs.readFileSync(path.join(fontRoot,'400.css'),'utf8').replaceAll('./files/',url+'/fonts/files/')});await page.evaluate(()=>document.fonts.ready)}}
 async function clearNotices(){await page.evaluate(()=>{if(s?.features107)s.features107.noticeCollapsed=true;renderNotices107()})}
 async function capture(name){await page.screenshot({path:path.join(shots,'nation-office-'+name+'.png'),fullPage:false,animations:'disabled'})}
 async function fit(label){const result=await page.evaluate(()=>({viewport:innerWidth,body:document.documentElement.scrollWidth,paper:document.getElementById('office-workspace').scrollWidth,paperWidth:document.getElementById('office-workspace').clientWidth}));assert(result.body<=result.viewport+1,label+' body overflow '+JSON.stringify(result));if(await page.locator('#office-overlay').isVisible())assert(result.paper<=result.paperWidth+1,label+' paper overflow '+JSON.stringify(result))}
 try{
  await page.goto(url);await fonts();assert(await page.locator('#start-screen').isVisible());assert.equal(await page.evaluate(()=>localStorage.getItem(KEY)),null,'title creates no world');
  await capture('start');await page.locator('#start-history').click();assert.equal(await page.locator('#modal [data-regime]').count(),13);await page.keyboard.press('Escape');assert(!(await page.locator('#modal').isVisible()));assert.equal(await page.evaluate(()=>localStorage.getItem(KEY)),null,'cancel preserves storage');
  await page.locator('#start-history').click();await page.locator('#modal [data-regime="presidential"]').click();await page.locator('#seed').fill('office-ui-integration');await page.locator('#admin-mode').check();await page.getByRole('button',{name:'生成国家 →',exact:true}).click();await clearNotices();
  assert(await page.locator('#nation-office').isVisible());assert(!(await page.locator('#start-screen').isVisible()));assert.equal(await page.evaluate(()=>v3().offers.length),6);assert.equal(await page.evaluate(()=>v3().regions.length),8);
  await page.locator('.of-files-object .of-file-pen').click();assert.equal(await page.locator('#heading').textContent(),'待批文件');assert(await page.locator('.office-letter').isVisible());assert.equal(await page.locator('#office-sections [aria-pressed="true"]').getAttribute('data-section'),'files');await capture('files');await page.locator('#nav [data-nav="reforms"]').click();assert.equal(await page.locator('#content button[onclick^="reformDetail("]').count(),6);await capture('reforms');
  const rulesBefore=await page.evaluate(()=>JSON.stringify(s));
  for(const next of ['overview','archive','budget','reforms','situations','assembly','cabinet','judiciary','politics','console']){
   await page.evaluate(t=>changeTab(t),next);assert(await page.locator('#content').isVisible());assert.equal(await page.locator('#content').getAttribute('data-office-page'),next);await fit(next);
   if(['assembly','cabinet','judiciary','politics','archive','budget','situations'].includes(next))await capture(next);
  }
  assert.equal(await page.evaluate(()=>JSON.stringify(s)),rulesBefore,'view navigation never mutates simulation');
  await page.evaluate(()=>changeTab('politics'));await page.locator('[data-map-region="7"]').click();assert(await page.locator('#office-region-7').evaluate(e=>e.classList.contains('office-selected-region')));
  await page.evaluate(()=>changeTab('budget'));await page.locator('#p-income').fill('25');assert.equal(await page.evaluate(()=>draft.income),25);await page.locator('#content button[onclick="proposeBudget()"],#content button[onclick="applyPolicy()"]').click();assert.equal(await page.evaluate(()=>pstate().bill.kind),'budget');assert.equal(await page.evaluate(()=>tab),'assembly');assert(await page.locator('button[onclick="voteBill()"]').isVisible());
  await page.evaluate(()=>{withdrawBill();changeTab('reforms')});await page.locator('button[onclick^="reformDetail("]').first().click();assert(await page.locator('#modal').isVisible());await page.getByRole('button',{name:'提交改革议案',exact:true}).click();assert.equal(await page.evaluate(()=>pstate().bill.kind),'reform');assert.equal(await page.evaluate(()=>tab),'assembly');await page.evaluate(()=>withdrawBill());
  await page.evaluate(()=>officeUI.constitution());assert(await page.getByRole('button',{name:/联系.*议长/}).isVisible());await page.getByRole('button',{name:/联系.*议长/}).click();assert(await page.locator('#modal button[onclick="constitutionalMenu(\'amend\')"]').isVisible());await page.evaluate(()=>$('modal').close());
  await page.evaluate(()=>changeTab('judiciary'));assert.equal(await page.locator('.judge-roster .person').count(),await page.evaluate(()=>constitution().judges.length));await page.locator('#content button[onclick^="meetJudge("]').first().click();assert(await page.locator('#modal button[onclick*="influenceJudge"]').count()>0);await page.evaluate(()=>$('modal').close());
  await page.evaluate(()=>{changeTab('overview');openMetricChart107('approval')});assert(await page.locator('#chart-modal .history-chart').isVisible());await page.locator('#chart-modal button').first().click();
  await page.evaluate(()=>showHelp());await page.locator('#guide-query').fill('政策利率');assert((await page.locator('#modal').textContent()).includes('中央银行'));await page.evaluate(()=>$('modal').close());
  const beforeTour=await page.evaluate(()=>JSON.stringify({s,draft,tab}));await page.locator('#tutorial-start').click();let steps=0;while(await page.evaluate(()=>!!tutorial104)){await page.keyboard.press('Space');if(++steps>15)throw Error('Intro failed to end')};assert(steps>=8);assert.equal(await page.evaluate(()=>JSON.stringify({s,draft,tab})),beforeTour,'intro preserves all game state');
  await page.evaluate(()=>changeTab('politics'));await page.locator('#page-tutorial').click();steps=0;while(await page.evaluate(()=>!!tutorial104)){await page.keyboard.press('Space');if(++steps>40)throw Error('Page tour failed')};assert(steps>5);
  await page.evaluate(()=>officeUI.events());await page.locator('#page-tutorial').click();steps=0;while(await page.evaluate(()=>!!tutorial104)){await page.keyboard.press('Space');if(++steps>5)throw Error('Custom tour failed')};assert.equal(steps,3);
  await page.evaluate(()=>officeUI.close());await page.locator('.of-files-object .of-object-label').hover();const glow=await page.locator('.of-files-object').evaluate(e=>getComputedStyle(e).filter);assert(glow.includes('drop-shadow'));await capture('desk');
  await page.evaluate(()=>advance());assert.equal(await page.evaluate(()=>s.q),1);let replies=0;while(await page.evaluate(()=>!!pstate().current)){await page.locator('#modal .choices button').first().click();if(++replies>20)throw Error('Event queue stuck')};assert(replies>=3);assert.equal(await page.evaluate(()=>v3().eventsChosen),replies);assert(await page.evaluate(()=>validSave(s)));
  await page.evaluate(()=>{officeUI.menu()});assert(await page.locator('#continue-game').isVisible());const saved=await page.evaluate(()=>localStorage.getItem(KEY));await page.reload();await fonts();assert(await page.locator('#start-screen').isVisible());assert.equal(await page.evaluate(()=>localStorage.getItem(KEY)),saved);await page.locator('#continue-game').click();assert.equal(await page.evaluate(()=>JSON.stringify(s)),saved,'reload preserves save exactly');await clearNotices();
  // Compare every old page action with the corresponding new page, using the identical old save.
  if(baseline){
  await page.goto(url+'/classic/');await fonts();await page.evaluate(()=>{selectedRegime='party';pendingAdmin107=true;create('legacy-exact-parity')});
  const old=await page.evaluate(()=>({save:JSON.stringify(s),pages:Object.fromEntries(['overview','budget','reforms','assembly','cabinet','judiciary','politics','archive','situations','console'].map(t=>{changeTab(t);return[t,[...document.querySelectorAll('#content [onclick]')].map(e=>e.getAttribute('onclick')).sort()]}))}));
  await page.goto(url);await fonts();assert(await page.locator('#continue-game').isVisible());await page.locator('#continue-game').click();assert.deepEqual(await page.evaluate(()=>JSON.parse(JSON.stringify(s))),JSON.parse(old.save),'classic save loads unchanged');await clearNotices();
  for(const [t,actions]of Object.entries(old.pages)){await page.evaluate(t=>changeTab(t),t);const actual=await page.locator('#content [onclick]').evaluateAll(els=>els.map(e=>e.getAttribute('onclick')));for(const action of actions)assert(actual.includes(action),t+' missing original action '+action)}
  }else console.log('SKIP classic comparison: set BASELINE_DIR to the v1.0.7-classic checkout.');
  const regimeIds=await page.evaluate(()=>REGIMES.map(r=>r.id));
  for(const id of regimeIds){await page.evaluate(id=>{selectedRegime=id;pendingAdmin107=true;pendingActionMode='fixed';create('regime-office-'+id)},id);await clearNotices();assert.equal(await page.evaluate(()=>v3().offers.length),6);await page.evaluate(()=>changeTab('assembly'));assert(await page.locator('#heading').innerText()===await page.evaluate(()=>regime().body));await fit(id);await page.evaluate(()=>officeUI.close());if(['absolute','party','theoabsolute'].includes(id))await capture('desk-'+id)}
  for(const width of [1024,736,390,320]){
   await page.setViewportSize({width,height:900});await page.evaluate(()=>{selectedRegime='presidential';pendingAdmin107=true;create('responsive-office')});await clearNotices();await fit('desk '+width);await capture('desk-'+width);
   for(const next of ['overview','budget','reforms','assembly','cabinet','judiciary','politics','archive','situations','console']){await page.evaluate(t=>changeTab(t),next);await fit(next+' '+width);if(['cabinet','politics','reforms'].includes(next)&&width<=390)await capture(next+'-'+width)}
   await page.evaluate(()=>officeUI.events());await fit('files '+width);await page.evaluate(()=>officeUI.constitution());await fit('constitution '+width);await page.evaluate(()=>officeUI.calendar());await fit('calendar '+width);
   await page.evaluate(()=>newDialog());assert(await page.locator('#modal').evaluate(e=>e.scrollWidth<=e.clientWidth+1));await page.keyboard.press('Escape');
  }
  await page.setViewportSize({width:1365,height:900});
  await page.evaluate(()=>{selectedRegime='presidential';pendingAdmin107=false;create('settlement-office');changeTab('archive')});await clearNotices();
  assert.equal(await page.locator('#nav [data-nav="settlement"]').count(),0);assert.equal(await page.locator('#office-console').isVisible(),false);
  await page.evaluate(()=>{s.approval=40;for(let i=0;i<5;i++)render()});assert.equal(await page.locator('[data-office-metric="approval"] .attention-dot').count(),1,'HUD risk dots do not accumulate');
  assert((await page.evaluate(()=>guideCatalog104().find(x=>x.id==='console').text)).includes('顶部'));
  await page.evaluate(()=>{beginSettlement('界面结算检查');render()});assert(await page.locator('#office-overlay').isVisible());assert(await page.locator('#nav [data-nav="settlement"]').isVisible());assert.equal(await page.locator('#content .ideology-cards .card').count(),3);assert.equal(await page.locator('#content .history-chart').count(),12);await fit('settlement');await capture('settlement');
  await page.evaluate(()=>officeUI.menu());await page.reload();await fonts();await page.locator('#continue-game').click();assert.equal(await page.evaluate(()=>tab),'settlement');assert(await page.locator('#office-overlay').isVisible());
  assert.deepEqual(errors,[]);console.log('PASS office browser: title and unchanged setup, 12 regimes, 6 reforms, optional classic action/save parity, final assessment, budgets/reforms/court, 3 quarterly events, charts/guide/tutorials, reload, silhouette glow, 1365/1024/736/390/320 widths.');
 }finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);server.closeAllConnections();server.close();process.exitCode=1});
