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
 async function clearNotices(){await page.evaluate(()=>dismissNotices107())}
 async function capture(name){await page.screenshot({path:path.join(shots,'nation-office-'+name+'.png'),fullPage:false,animations:'disabled'})}
 async function fit(label){const result=await page.evaluate(()=>({viewport:innerWidth,body:document.documentElement.scrollWidth,paper:document.getElementById('office-workspace').scrollWidth,paperWidth:document.getElementById('office-workspace').clientWidth}));assert(result.body<=result.viewport+1,label+' body overflow '+JSON.stringify(result));if(await page.locator('#office-overlay').isVisible())assert(result.paper<=result.paperWidth+1,label+' paper overflow '+JSON.stringify(result))}



 try{
  await page.goto(url);await fonts();
  for(const width of [1365,768,390,320]){
   await page.setViewportSize({width,height:900});
   const data=await page.evaluate(()=>{selectedRegime='presidential';pendingAdmin107=false;pendingDifficulty=false;for(let i=0;i<80;i++){create('social-local-preview-'+i);if(s.regionalStart107.profile==='social')break}changeTab('politics');return {profile:s.regionalStart107.profile,rows:electionForecast().rows,opening:s.regionalStart107.rows,forecast:electionForecast().total}});await clearNotices();assert.equal(data.profile,'social');
   assert(Math.max(...data.rows.map(r=>r.share))>=51&&Math.min(...data.rows.map(r=>r.share))<=25);
   assert.equal(await page.locator('.regional-origin-details').count(),8);assert.equal(await page.locator('#content details[open]').count(),0);
   for(const row of data.rows){assert((await page.locator('[data-map-region="'+row.id+'"] small').innerText()).includes(row.share.toFixed(1)+'%'));const card=page.locator('.region-grid>article').nth(row.id);assert((await card.locator('.row').filter({hasText:'当前票率预测'}).innerText()).includes(row.share.toFixed(1)+'%'))}
   await page.locator('.office-map-sheet').scrollIntoViewIfNeeded();await fit('map distribution '+width);await capture('regional-start-map-'+width);
   await page.locator('[data-map-region="0"]').click();const region=page.locator('.region-grid>article').first();await region.locator('.regional-origin-details summary').click();const details=await region.locator('.regional-origin-details').innerText();assert(details.includes('社会民主与民生'));assert(details.includes(data.opening[0].support.toFixed(1)+'%'));await region.scrollIntoViewIfNeeded();await fit('region origin '+width);await capture('regional-start-details-'+width);
   const raw=await page.evaluate(()=>JSON.stringify(s));await page.reload();await fonts();await page.locator('#continue-game').click();assert.deepEqual(await page.evaluate(()=>JSON.parse(JSON.stringify(s))),JSON.parse(raw),'exact reload');await page.evaluate(()=>changeTab('politics'));await clearNotices();assert.equal(await page.locator('#content details[open]').count(),0);
   await page.locator('#page-tutorial').click();let count=0,seen=false;while(await page.locator('#tutorial-controls').count()){seen ||= (await page.locator('#tour-title').innerText())==='地方政治基础';await page.keyboard.press('Space');assert(++count<50)}assert(seen,'local foundation tutorial');assert.equal(await page.locator('#content details[open]').count(),0,'tutorial never expands details');
   await page.evaluate(()=>showHelp());await page.locator('#guide-query').fill('开局民意修正');assert((await page.locator('#guide-results').innerText()).includes('21%至55%'));await page.getByRole('button',{name:'关闭治国指南',exact:true}).click();
  }
  assert.deepEqual(errors,[]);console.log('PASS regional browser: social-party map spread, directory/card/forecast agreement, collapsed initial-basis details, exact reload, page tutorial, guide and 1365/768/390/320px layouts.');
 }finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);server.closeAllConnections();server.close();process.exitCode=1});
