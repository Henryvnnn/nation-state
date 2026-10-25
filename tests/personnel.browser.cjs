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
  await page.goto(url);await fonts();assert(await page.locator('.start-disclaimer').isVisible());assert((await page.locator('.start-disclaimer').innerText()).includes('虚构并随机生成'));
  for(const width of [1365,390,320]){await page.setViewportSize({width,height:900});await fit('title '+width);await capture('personnel-start-'+width)}
  for(const reg of ['party','absolute','aristocratic','constitutional','westminster','theorepublic','theoabsolute']){
   await page.setViewportSize({width:1365,height:900});await page.evaluate(reg=>{selectedRegime=reg;pendingAdmin107=true;create('personnel-ui-'+reg);changeTab('cabinet')},reg);await clearNotices();
   const offices=await page.evaluate(()=>cabinetSlots103().map(office));const visible=await page.locator('.office b').allTextContents();assert.deepEqual(visible,offices);await fit(reg+' cabinet');await capture('personnel-'+reg);
   const named=await page.evaluate(()=>pstate().candidates.filter(cabinetEligible).some(c=>c.honour));
   if(named){assert(await page.locator('#content .person-honour').isVisible());assert((await page.locator('#content .person-honour').innerText()).includes('礼序等级'))}
   await page.evaluate(()=>showHelp());await page.locator('#guide-query').fill(await page.evaluate(()=>office('foreign')));assert((await page.locator('#modal').innerText()).includes('对外谈判'));await page.getByRole('button',{name:'关闭治国指南',exact:true}).click();
   for(const width of [390,320]){await page.setViewportSize({width,height:900});await fit(reg+' cabinet '+width);await capture('personnel-'+reg+'-'+width)}
   await page.setViewportSize({width:1365,height:900});await page.evaluate(()=>changeTab('assembly'));await fit(reg+' assembly');
   const member=await page.evaluate(()=>pstate().members.find(m=>m.honour)?.id??0);await page.locator('button[onclick="meetMember('+member+')"]').click();assert(await page.locator('#modal').isVisible());await fit(reg+' member');await page.keyboard.press('Escape');
  }
  assert.deepEqual(errors,[]);console.log('PASS personnel browser: visible disclaimer at 3 widths, seven titled/special-office regimes, all office cards, honour details, guide search and modal interactions, no overflow or JS errors.');
 }finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);server.closeAllConnections();server.close();process.exitCode=1});
