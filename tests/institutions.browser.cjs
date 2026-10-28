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
  await page.goto(url);await fonts();await page.locator('#start-history').click();
  assert(await page.locator('#chamber-mode').isDisabled());
  await page.locator('[data-regime="presidential"]').click();assert(await page.locator('#chamber-mode').isEnabled());
  assert((await page.locator('#chamber-mode-help').innerText()).includes('四分之三'));
  await page.selectOption('#chamber-mode','one');await page.locator('[data-regime="absolute"]').click();assert(await page.locator('#chamber-mode').isDisabled());assert.equal(await page.evaluate(()=>pendingChambers),'auto');
  await page.locator('[data-regime="semi"]').click();await page.selectOption('#chamber-mode','one');await page.fill('#seed','ui-semi-single');await page.check('#admin-mode');
  await shot('institutions-world-choice');await page.locator('#modal button[onclick*="create("]').click();await ready();
  assert.equal(await page.evaluate(()=>regime().id),'semi');assert.equal(await page.evaluate(()=>hasUpper108()),false);
  await page.evaluate(()=>changeTab('assembly'));assert.equal(await page.locator('.chamber-switch108').count(),0);assert.equal(await page.locator('.faction-row').count(),7);
  assert((await page.locator('#institution-summary').innerText()).includes('一院制'));await shot('institutions-semi-single');
  await page.evaluate(()=>changeTab('cabinet'));assert(await page.evaluate(()=>Object.values(pstate().cabinet).filter(Boolean).every(x=>cabinetEligible(pstate().candidates[x.candidate]))));
  await page.reload();await fonts();if(await page.locator('#continue-game').isVisible())await page.locator('#continue-game').click();await ready();assert.equal(await page.evaluate(()=>hasUpper108()),false);
  await page.evaluate(()=>{selectedRegime='presidential';pendingChambers='two';pendingAdmin107=true;let n=0;do{create('ui-two-party-'+n++)}while(!twoPartyPresidency());changeTab('assembly')});await ready();
  const names=await page.evaluate(()=>pstate().factions.map(f=>f.name));await page.getByRole('button',{name:'参议院',exact:true}).click();
  assert.equal(await page.locator('.upper-faction108').count(),3);assert.deepEqual(await page.locator('.upper-faction108 b').allTextContents(),names);assert.equal(await page.locator('.upper-seat108').count(),50);
  assert.equal(await page.locator('details[open]').count(),0);await shot('institutions-presidential-two');
  await page.evaluate(()=>{selectedRegime='theorepublic';pendingChambers='auto';create('ui-clergy');clergyState().loyalty=19;save();chamberView108='upper';changeTab('assembly')});await ready();
  assert(await page.locator('#clergy-loyalty').isVisible());assert((await page.locator('#clergy-loyalty').innerText()).includes('19.0%'));assert.equal(await page.locator('#clergy-loyalty details[open]').count(),0);
  assert(await page.evaluate(()=>activeAlerts107().some(a=>a.id==='clergy-loyalty')));
  for(const width of [1365,390,320]){await page.setViewportSize({width,height:1000});await fit('clergy '+width);await shot('institutions-clergy-'+width)}
  await page.locator('#clergy-loyalty summary').click();assert((await page.locator('#clergy-loyalty details').innerText()).includes('象征性民主制'));await fit('clergy expanded');
  await page.setViewportSize({width:1365,height:1000});await page.evaluate(()=>startTutorial('page'));assert(await page.locator('#tutorial-controls').isVisible());assert((await page.locator('#tutorial-controls').innerText()).includes('神职人员忠诚度'));await page.keyboard.press('Space');await page.evaluate(()=>stopTutorial());
  await page.evaluate(()=>showHelp());await page.fill('#guide-query','神职人员忠诚度');assert((await page.locator('#guide-results').innerText()).includes('低于40'));await page.locator('#modal').evaluate(d=>d.close());
  await page.evaluate(()=>{chamberView108='upper';clergyState().loyalty=39;save();renderNotices107()});assert(await page.evaluate(()=>features107().notices.some(n=>n.id==='alert:clergy-loyalty')));
  assert.deepEqual(errors,[]);console.log('PASS browser: actual setup selection, single-chamber seven-party UI, same-name three-party senate, clergy card/reminders/tutorial/search, reload, 1365/390/320 layout; no browser errors.');
 }finally{await browser.close();server.close()}
})().catch(error=>{console.error(error);process.exitCode=1;server.close()});
