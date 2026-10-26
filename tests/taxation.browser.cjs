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
  for(const width of [1365,768,390,320])for(const id of ['presidential','party','absolute','theoabsolute']){
   await page.setViewportSize({width,height:900});
   await page.evaluate(id=>{selectedRegime=id;pendingAdmin107=true;create('tax-ui-'+id);pstate().ap=100;pstate().current=null;pstate().queue=[];sits().notices=[];features107().notices=[];changeTab('budget')},id);await clearNotices();
   const taxKeys=await page.evaluate(()=>taxKeys107());
   assert.equal(await page.locator('.policy input[type="range"]').count(),taxKeys.length+5);
   assert.equal(await page.locator('#p-tithe').count(),id==='theoabsolute'?1:0);
   assert.equal(await page.locator('#content details[open]').count(),0);
   const state=await page.evaluate(()=>JSON.stringify(s));
   await page.locator('#p-property').focus();await page.locator('#p-property').press('ArrowRight');
   assert.equal(await page.evaluate(()=>draft.property),5.5);assert.equal(await page.evaluate(()=>JSON.stringify(s)),state,'draft action does not enact');
   await page.locator('#p-tariff').press('End');assert.equal(await page.evaluate(()=>draft.tariff),30);
   if(id==='theoabsolute'){
    await page.locator('#p-tithe').press('End');assert.equal(await page.evaluate(()=>draft.tithe),10);await page.locator('#p-tithe').press('Home');assert.equal(await page.evaluate(()=>draft.tithe),0);
    const text=await page.locator('label[for="p-tithe"]').innerText();assert(/什一税|教会税|贡税/.test(text));
   }
   await page.locator('#p-property').scrollIntoViewIfNeeded();await fit('tax sliders '+id+' '+width);await capture('taxes-'+id+'-'+width);
   const overlaps=await page.locator('.policy label').evaluateAll(labels=>labels.map(el=>{const value=el.querySelector('b').getBoundingClientRect(),box=el.getBoundingClientRect();const range=document.createRange();range.selectNodeContents(el.firstChild);const label=range.getBoundingClientRect();return {bad:label.right>value.left+1||value.right>box.right+1,text:el.textContent}}).filter(x=>x.bad));assert.deepEqual(overlaps,[],'labels avoid values '+id+' '+width);
   await page.locator('.tax-breakdown summary').click();assert(await page.locator('.tax-breakdown .row').first().isVisible());await fit('tax details '+id+' '+width);
   await page.locator('button[onclick="applyPolicy()"]').click();assert.equal(await page.evaluate(()=>pstate().bill.kind),'budget');assert.equal(await page.evaluate(()=>s.policies.property),5);
   await page.evaluate(()=>{for(const f of pstate().factions){f.relation=100;f.agendaDecay=0;f.agendaOffset107=200}for(const m of pstate().members)m.relation=100;render()});await clearNotices();await page.locator('button[onclick="voteBill()"]').click();assert.equal(await page.evaluate(()=>s.policies.property),5.5);assert.equal(await page.evaluate(()=>s.policies.tariff),30);assert.equal(await page.evaluate(()=>pstate().bill),null);
   const saved=await page.evaluate(()=>JSON.stringify(s));await page.reload();await fonts();await page.locator('#continue-game').click();assert.equal(await page.evaluate(()=>JSON.stringify(s)),saved,'exact reload');
   await page.evaluate(()=>changeTab('budget'));await clearNotices();assert.equal(await page.locator('#content details[open]').count(),0);await page.locator('#page-tutorial').click();
   let iterations=0,seenProperty=false,seenTariff=false,seenReligion=false;
   while(await page.locator('#tutorial-controls').count()){
    const title=await page.locator('#tour-title').innerText();seenProperty ||= /财产税|田产税|土地税|土地使用税/.test(title);seenTariff ||= /关税/.test(title);seenReligion ||= /什一税|教会税|贡税/.test(title);
    await page.keyboard.press('Space');assert(++iterations<40,'tutorial bounded');
   }
   assert(seenProperty&&seenTariff,'new taxes taught');assert.equal(seenReligion,id==='theoabsolute','regime-specific tutorial');
   await page.evaluate(()=>showHelp());await page.locator('#guide-query').fill(id==='theoabsolute'?'什一税':'土地使用税');assert(!(await page.locator('#guide-results').innerText()).includes('该概念不存在'));await page.getByRole('button',{name:'关闭治国指南',exact:true}).click();
  }
  assert.deepEqual(errors,[]);console.log('PASS tax browser: actual range controls, no premature policy enactment, submit/vote/reload, collapsed details, guide aliases, Space-key tutorials, exclusive religious levy and label/overflow checks at 1365/768/390/320px.');
 }finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);server.closeAllConnections();server.close();process.exitCode=1});
