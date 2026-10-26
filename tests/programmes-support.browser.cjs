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
  await page.goto(url);await fonts();
  for(const width of [1365,390,320]){
   await page.setViewportSize({width,height:900});await page.evaluate(()=>newDialog());
   assert(await page.locator('#model').isDisabled());assert.equal(await page.locator('#model').inputValue(),'mixed');assert.equal(await page.locator('#model option').count(),1);assert((await page.locator('label[for="model"]').innerText()).includes('暂未完工'));assert(await page.locator('#modal').evaluate(e=>e.scrollWidth<=e.clientWidth+1));await page.locator('#model').scrollIntoViewIfNeeded();await capture('economy-locked-'+width);await page.keyboard.press('Escape');
   await page.evaluate(()=>{selectedRegime='aristocratic';pendingAdmin107=true;pendingModel='socialist';create('programme-ui');s.approval=75;s.stability=85;s.confidence=60;pstate().ap=10;pstate().candidates[pstate().cabinet.culture.candidate].trait=4;cabinetSlot='culture';changeTab('cabinet')});await clearNotices();
   assert(await page.locator('.minister-programme h3').innerText()==='发扬传统贵族文化');assert((await page.locator('.minister-programme').innerText()).includes('强硬集权派'));assert.equal(await page.locator('.minister-programme .choices button').count(),3);await fit('programme '+width);await page.locator('.minister-programme').scrollIntoViewIfNeeded();await capture('aristocratic-culture-'+width);
   const before=await page.evaluate(()=>({approval:s.approval,confidence:s.confidence,ap:pstate().ap,relation:pstate().factions[pstate().candidates[pstate().cabinet.culture.candidate].faction].relation}));await page.locator('.minister-programme .choices button').nth(1).click();
   const after=await page.evaluate(()=>({approval:s.approval,confidence:s.confidence,ap:pstate().ap,relation:pstate().factions[pstate().candidates[pstate().cabinet.culture.candidate].faction].relation,risks:programmeState107().risks.length}));assert.equal(after.ap,before.ap-1);assert.equal(after.approval,before.approval-1.5);assert.equal(after.confidence,before.confidence+1);assert.equal(after.relation,Math.min(100,before.relation+5));assert.equal(after.risks,1);assert(await page.locator('.minister-programme .choices button').nth(1).isDisabled());
   const saved=await page.evaluate(()=>JSON.stringify(s));await page.reload();await fonts();await page.locator('#continue-game').click();assert.equal(await page.evaluate(()=>JSON.stringify(s)),saved);await clearNotices();await page.evaluate(()=>{cabinetSlot='culture';changeTab('cabinet')});assert(await page.locator('.minister-programme .choices button').nth(1).isDisabled());
   await page.evaluate(()=>showHelp());await page.locator('#guide-query').fill('发扬传统贵族文化');assert((await page.locator('#modal').innerText()).includes('完成效果'));await page.locator('#guide-query').fill('公众支持');assert((await page.locator('#modal').innerText()).includes('稳定−12'));await page.getByRole('button',{name:'关闭治国指南',exact:true}).click();
   await page.locator('#page-tutorial').click();assert(await page.locator('#tutorial-controls').isVisible());await page.keyboard.press('Escape');
  }
  await page.setViewportSize({width:1365,height:900});await page.evaluate(()=>{selectedRegime='symbolic';pendingAdmin107=true;create('support-ui');s.approval=19.9;save();changeTab('situations')});await clearNotices();assert(await page.evaluate(()=>!!activeSit('spring')));assert((await page.locator('#content').innerText()).includes(await page.evaluate(()=>countryStem()+'之春')));await fit('spring');await capture('guaranteed-spring');
  await page.evaluate(()=>{selectedRegime='presidential';pendingAdmin107=false;create('support-zero-ui');s.approval=0;save();render()});assert.equal(await page.evaluate(()=>tab),'settlement');assert(await page.locator('#nav [data-nav="settlement"]').isVisible());assert((await page.locator('#content').innerText()).includes('全国支持率降至 0%'));await fit('zero settlement');
  assert.deepEqual(errors,[]);console.log('PASS browser: disabled mixed economy, aristocratic proposal effects/risk/cooldown, exact reload, guide/tutorial, forced spring, zero-support settlement, 1365/390/320 widths.');
 }finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);server.closeAllConnections();server.close();process.exitCode=1});
