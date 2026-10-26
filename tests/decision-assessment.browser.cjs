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
   await page.evaluate(()=>{selectedRegime='theoabsolute';pendingAdmin107=true;create('assessment-tax-ui');pstate().ap=100;pstate().current=null;pstate().queue=[];features107().notices=[];pstate().factions[0].name='社会民主党';pstate().factions[1].name='自由市场党';pstate().factions[2].name='传统宗教派';changeTab('budget');changePolicy('property',8);changePolicy('tariff',7);changePolicy('tithe',6)});await clearNotices();
   await page.locator('button[onclick="applyPolicy()"]').click();await clearNotices();
   const thresholds=await page.evaluate(()=>pstate().factions.slice(0,3).map(f=>budgetRequirement(f)));assert(thresholds[0]<thresholds[1]);assert(thresholds[2]<thresholds[1]);
   assert.equal(await page.locator('#content details[open]').count(),0);
   await page.locator('.faction-details summary').first().click();const text=await page.locator('.faction-details').first().innerText();assert(text.includes('土地税每提高1个百分点，门槛−1.5'));await fit('tax faction detail '+width);await page.locator('.faction-row').first().scrollIntoViewIfNeeded();await capture('faction-tax-preferences-'+width);
   await page.evaluate(()=>{selectedRegime='presidential';pendingAdmin107=true;create('fiscal-assessment-ui');pstate().ap=100;pstate().current=null;pstate().queue=[];features107().notices=[];for(const k of taxKeys107())draft[k]=budgetCap(k);for(const k of CONSTITUTION_BUDGETS)draft[k]=['education','infrastructure'].includes(k)?budgetCap(k):policyMeta[k][1];proposeBudget();const old=billPassRate104;billPassRate104=()=>100;try{voteBill()}finally{billPassRate104=old}s.adminMode=false;beginSettlement('本届任期结束');save();render()});await clearNotices();
   assert((await page.locator('.assessment-diagnosis').innerText()).includes('财政汲取 · 民生紧缩'));
   assert.equal(await page.locator('#content details[open]').count(),0);assert(!(await page.locator('.ideology-cards').isVisible()),'weak labels default collapsed');assert.equal(await page.locator('.history-chart').count(),12);await page.locator('.assessment-diagnosis').scrollIntoViewIfNeeded();await fit('assessment summary '+width);await capture('decision-assessment-'+width);
   await page.locator('.assessment-comparison summary').click();assert(await page.locator('.ideology-cards').isVisible());assert.equal(await page.locator('.ideology-cards .card').count(),3);await fit('relative matches '+width);
   await page.locator('.assessment-rules summary').click();assert((await page.locator('.assessment-rules').innerText()).includes('政府首脑任命10'));await fit('assessment weights '+width);
   const changes=page.locator('#content details').filter({has:page.locator('summary').filter({hasText:'查看预算调整'})});await changes.locator('summary').click();assert((await changes.innerText()).includes('财产税'));await changes.scrollIntoViewIfNeeded();await fit('budget evidence '+width);await capture('budget-decision-evidence-'+width);
   const raw=await page.evaluate(()=>JSON.stringify(s));await page.reload();await fonts();await page.locator('#continue-game').click();await clearNotices();assert.equal(await page.evaluate(()=>JSON.stringify(s)),raw);await page.evaluate(()=>changeTab('settlement'));assert.equal(await page.locator('#content details[open]').count(),0);assert((await page.locator('.assessment-diagnosis').innerText()).includes('财政汲取'));
   await page.evaluate(()=>showHelp());await page.locator('#guide-query').fill('统治倾向');const help=await page.locator('#guide-results').innerText();assert(help.includes('仅依据玩家实际作出的决策'));assert(!help.includes('70%'));await page.getByRole('button',{name:'关闭治国指南',exact:true}).click();
  }
  assert.deepEqual(errors,[]);console.log('PASS decision assessment browser: differentiated tax details, fiscal regression, collapsed low-fit comparison, weights and changed-value evidence, all 12 charts, exact final-save reload, updated guide and 1365/768/390/320px layouts.');
 }finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);server.closeAllConnections();server.close();process.exitCode=1});
