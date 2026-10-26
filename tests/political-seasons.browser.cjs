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
  for(const width of [1365,768,390,320]){
   await page.setViewportSize({width,height:900});
   await page.evaluate(()=>{selectedRegime='party';pendingAdmin107=true;create('election-ui');sits().active=[];sits().notices=[];if(constitution().minority)Object.assign(constitution().minority,{status:'resolved',resolution:'amendment',resolvedQ:s.q});pstate().current=null;pstate().queue=[];s.q=18;v3().quarterOpen=true;s.approval=85;s.stability=85;s.unemployment=6;s.inflation=3;s.debt=s.gdp*.4;pstate().judicial=70;syncElectionSeason107();changeTab('situations')});await clearNotices();
   const choices=page.locator('.situation-grid button').filter({hasText:/^支持/});assert.equal(await choices.count(),3);assert.equal(await page.locator('#content details[open]').count(),0);await fit('party season '+width);await choices.first().scrollIntoViewIfNeeded();await capture('party-season-'+width);await choices.nth(1).click();assert.equal(await page.evaluate(()=>playerFactionId107()),1);assert.equal(await page.locator('.situation-grid button:not([disabled])').count(),0);
   await page.evaluate(()=>changeTab('assembly'));await clearNotices();assert((await page.locator('.party-route-panel').innerText()).includes('新锐派'));assert((await page.locator('.faction-row').filter({has:page.locator('.player-party-badge')}).innerText()).includes('新锐派'));await fit('switched assembly '+width);await capture('party-route-'+width);
   const raw=await page.evaluate(()=>JSON.stringify(s));await page.reload();await fonts();await page.locator('#continue-game').click();assert.equal(await page.evaluate(()=>JSON.stringify(s)),raw,'exact route reload');await clearNotices();
   await page.evaluate(()=>{s.q=19;v3().quarterOpen=true;pstate().current=null;pstate().queue=[];finishQuarter();changeTab('politics')});await clearNotices();assert((await page.locator('.regional-decay-panel').innerText()).includes('2.50'));assert.equal(await page.evaluate(()=>seasons107().offsets.filter(x=>x!==0).length),1);await fit('regional panel '+width);await page.locator('.regional-decay-panel').scrollIntoViewIfNeeded();await capture('regional-decay-'+width);await page.locator('.regional-decay-panel summary').click();assert(await page.locator('.regional-decay-panel .row').first().isVisible());await fit('regional detail '+width);await capture('regional-decay-open-'+width);
   await page.evaluate(()=>showHelp());await page.locator('#guide-query').fill('选举季');assert((await page.locator('#guide-results').innerText()).includes('第18至24季度'));await page.getByRole('button',{name:'关闭治国指南',exact:true}).click();
   await page.evaluate(()=>{selectedRegime='presidential';pendingAdmin107=true;create('dem-election-ui');sits().active=[];sits().notices=[];if(constitution().minority)Object.assign(constitution().minority,{status:'resolved',resolution:'amendment',resolvedQ:s.q});pstate().current=null;pstate().queue=[];s.q=18;v3().quarterOpen=true;syncElectionSeason107();changeTab('situations')});await clearNotices();assert((await page.locator('.situation-grid').innerText()).includes('背景局势，无需处置'));assert.equal(await page.locator('.situation-grid .choices button').count(),0);await fit('democratic background '+width);
  }
  assert.deepEqual(errors,[]);console.log('PASS seasons browser: real faction choice, updated player badge and route, disabled repeat, exact reload, regional decay details, guide, background-only democracies and 1365/768/390/320px layouts.');
 }finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);server.closeAllConnections();server.close();process.exitCode=1});
