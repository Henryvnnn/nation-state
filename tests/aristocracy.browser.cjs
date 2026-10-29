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
  await page.goto(url);await fonts();await page.locator('#start-history').click();await page.locator('[data-regime="aristocratic"]').click();await page.fill('#seed','families-browser');await page.check('#admin-mode');await page.locator('#modal button[onclick*="create("]').click();await ready();
  await page.locator('[data-object="phone"]').first().click();
  assert((await page.locator('#nav [data-nav="assembly"]').innerText()).includes('监察机构'));
  assert.equal(await page.locator('.family-switch button').count(),2);assert.equal(await page.locator('.chamber-switch108:not(.family-switch)').count(),0);
  await page.getByRole('button',{name:'家族互动',exact:true}).click();assert.equal(await page.locator('#heading').innerText(),'家族互动');assert.equal(await page.locator('.family-card').count(),await page.evaluate(()=>houses().families.length));
  assert.equal(await page.locator('details[open]').count(),0);await shot('families-desktop');
  const f=await page.evaluate(()=>otherFamilies()[0].id);
  await page.locator('[data-family="'+f+'"] button').click();assert(await page.getByRole('button',{name:/分化继承人集团/}).isVisible());assert((await page.locator('#modal').innerText()).includes('贿赂内部人员'));
  await page.evaluate(()=>{const f=otherFamilies()[0];f.recognition=30;s.stability=90;pstate().ap=10;s.approval=100});await page.getByRole('button',{name:/分化继承人集团/}).click();assert.equal(await page.evaluate(id=>houses().families[id].recognition,f),40);await page.locator('#modal button').last().click();
  await page.locator('[data-family="'+f+'"] button').click();await page.getByRole('button',{name:/贿赂内部人员/}).click();assert((await page.locator('#modal').innerText()).includes('内部情报'));await shot('families-intelligence');
  const powers=await page.evaluate(id=>houses().families[id].powers.length,f);await page.getByRole('button',{name:/公开调查/}).click();await ready();assert.equal(await page.evaluate(id=>houses().families[id].powers.length,f),powers-1);
  await page.evaluate(id=>{houses().families[id].recognition=19;if(!houses().families[id].powers.length)houses().families[id].powers.push(rulingFamily().powers.pop());draft={...s.policies,income:s.policies.income+1};proposeBudget();familyView='council';render()},f);
  assert(await page.locator('.family-warning').isVisible());assert(await page.locator('button[onclick="voteBill() "]').count()===0);assert(await page.locator('button[onclick="voteBill()"] ').isDisabled());await shot('families-council-blocked');
  await page.evaluate(()=>{withdrawBill();familyView='families';render()});
  for(const width of [1365,768,390,320]){await page.setViewportSize({width,height:1000});await fit('families '+width);await shot('families-'+width)}
  await page.locator('.family-rules summary').first().click();await fit('expanded rules');assert((await page.locator('.family-rules').innerText()).includes('三家'));await page.locator('.family-rules summary').first().click();
  await page.setViewportSize({width:1365,height:1000});await page.locator('#page-tutorial').click();assert(await page.locator('#tutorial-controls').isVisible());assert((await page.locator('#tutorial-controls').innerText()).includes('家族互动'));let steps=0;while(await page.evaluate(()=>!!tutorial104)){await page.keyboard.press('Space');assert(++steps<10)};
  await page.evaluate(()=>showHelp());await page.fill('#guide-query','合法性承认');assert((await page.locator('#guide-results').innerText()).includes('低于20'));await page.fill('#guide-query','正规军');assert((await page.locator('#guide-results').innerText()).includes('家族势力'));await page.evaluate(()=>$('modal').close());
  await page.evaluate(()=>changeTab('overview'));assert(await page.locator('#family-central').isVisible());await page.locator('#family-central button').click();assert.equal(await page.locator('#heading').innerText(),'家族互动');
  await page.evaluate(()=>save());const saved=await page.evaluate(()=>JSON.stringify(houses()));await page.reload();await fonts();await page.locator('#continue-game').click();await ready();assert.equal(await page.evaluate(()=>JSON.stringify(houses())),saved);await page.evaluate(()=>openFamilyPage());assert.equal(await page.locator('#heading').innerText(),'家族互动');
  for(const [key,label]of [['strongman','当个贵族制下的强人'],['absolute','生民无主，臣不敢辞'],['constitutional','国事繁杂，放权于民']]){
   await page.evaluate(key=>{selectedRegime='aristocratic';create('family-future-ui-'+key);pstate().current=null;pstate().queue=[];sits().notices=[];s.stability=90;s.approval=80;pstate().ap=0;houses().central=100;checkFamilyConsequences();changeTab('situations')},key);await ready();
   const choice=page.locator('button[onclick*="\''+key+'\'"]');assert(await choice.isEnabled());await shot('families-future-'+key);await choice.click();await ready();assert.equal(await page.evaluate(()=>regime().id),key==='strongman'?'aristocratic':key);assert.equal(await page.evaluate(()=>pstate().ap),0);assert.equal(await page.evaluate(()=>!!activeSit('national-future')),false);assert(await page.evaluate(()=>validSave(s)));
  }
  await page.evaluate(()=>{selectedRegime='aristocratic';create('family-menu-ui');pstate().current=null;pstate().queue=[];sits().notices=[];changeTab('assembly');meetMember(0)});await page.getByRole('button',{name:'提出修宪',exact:true}).click();assert(!(await page.locator('#modal').innerText()).includes('修订经济模式条款'));assert(!(await page.locator('#modal').innerText()).includes('增加竞争性选举条文'));await page.evaluate(()=>$('modal').close());
  assert.deepEqual(errors,[]);console.log('PASS browser: setup, family tab/council, real interactions/intel, vote lock, overview shortcut, default collapsed rules, guide, Space tutorial, reload, all three free transitions, removed amendment UI, desktop/mobile; no page errors.');
 }finally{await browser.close();server.close()}
})().catch(error=>{console.error(error);process.exitCode=1;server.close()});
