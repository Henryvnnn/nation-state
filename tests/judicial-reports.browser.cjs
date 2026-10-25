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
   await page.setViewportSize({width,height:900});
   await page.evaluate(()=>{selectedRegime='presidential';pendingAdmin107=true;create('court-browser');pstate().current=null;pstate().queue=[];s.q=1;const chief=activeJudges107().find(j=>j.chief);departJudge107(chief.id,'主动退休');save();changeTab('judiciary')});await clearNotices();
   assert(await page.locator('#judicial-personnel').isVisible());assert((await page.locator('#content').innerText()).includes('目前首席空缺'));await fit('vacancy '+width);await capture('judicial-vacancy-'+width);
   await page.getByRole('button',{name:/补缺任命 ·/}).click();const candidates=page.locator('[data-judicial-nominee]');assert(await candidates.count()>10);await candidates.first().click();assert((await page.locator('#modal').innerText()).includes('司法倾向'));await capture('judicial-appointment-'+width);
   await page.getByRole('button',{name:'确认任命法官 · 1 行动点',exact:true}).click();assert(await page.evaluate(()=>!constitution().judges.some(j=>j.vacant)&&activeJudges107().filter(j=>j.chief).length===1));assert(await page.evaluate(()=>validSave(s)));await fit('appointed '+width);
   const save=await page.evaluate(()=>JSON.stringify(s));await page.reload();await fonts();await page.locator('#continue-game').click();assert.equal(await page.evaluate(()=>JSON.stringify(s)),save);await clearNotices();
   await page.locator('[data-object="archives"]:visible').first().click();await page.locator('#nav [data-nav="centralbank"]').click();assert(await page.locator('#central-bank-advice').isVisible());assert((await page.locator('#content').innerText()).includes('尚无季度政策报告'));assert.equal(await page.locator('#office-sections').count(),0);
   await page.evaluate(()=>{for(let i=0;i<3;i++){s.q++;economicQuarter();record()}save();render()});await clearNotices();assert.equal(await page.locator('.bank-report').count(),3);await fit('reports '+width);await capture('central-bank-'+width);
   const before=await page.evaluate(()=>JSON.stringify(s));await page.locator('#page-tutorial').click();assert(await page.locator('#tutorial-controls').isVisible());assert((await page.locator('#tutorial-controls').innerText()).includes('央行'));await page.keyboard.press('Space');await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>JSON.stringify(s)),before,'tutorial pure');
   await page.evaluate(()=>showHelp());await page.locator('#guide-query').fill('关键一票');assert((await page.locator('#guide-results').innerText()).includes('首席额外投一票'));await page.getByRole('button',{name:'关闭治国指南',exact:true}).click();
   await page.locator('#nav [data-nav="archive"]').click();await page.locator('#central-bank-entry button').click();assert.equal(await page.locator('#heading').innerText(),'央行报告');
  }
  assert.deepEqual(errors,[]);console.log('PASS judicial/report browser: 1365/390/320px; vacancy pool, confirmed appointment and chief; exact reload; archive navigation; real monetary reports; tutorial, guide and no overflow.');
 }finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);server.closeAllConnections();server.close();process.exitCode=1});
