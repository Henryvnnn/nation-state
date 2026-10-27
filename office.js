/* Presentation adapter: every decision uses the existing simulation and save format. */
(function(){
 'use strict';
 if(typeof window==='undefined'||!document.getElementById('nation-office'))return;
 const root=$('nation-office'),scene=root.querySelector('.of-scene'),world=root.querySelector('.of-world');
 const overlay=$('office-overlay'),content=$('content');
 const groupsForPages={overview:'archives',archive:'archives',centralbank:'archives',settlement:'archives',budget:'files',reforms:'files',situations:'files',assembly:'phone',cabinet:'phone',judiciary:'phone',politics:'map',console:'archives'};
 const themes={constitutional:'palace',westminster:'palace',absolute:'palace',aristocratic:'palace',presidential:'republic',semi:'republic',federal:'republic',symbolic:'republic',tyranny:'republic',party:'party',theorepublic:'theocratic',theoabsolute:'theocratic'};
 const ui={open:false,section:'archives',custom:null,lastTab:'overview',initializing:false,focus:null,region:0,tourReturn:null};
 const $all=(selector)=>document.querySelectorAll(selector);
 const baseRender=render,baseCreate=create,baseChangeTab=changeTab,baseNewDialog=newDialog;
 const baseAdvance=advance;
 let advanceConfirmation=null;
 const baseStartTutorial=startTutorial,baseStopTutorial=stopTutorial,baseTutorialSteps=tutorialSteps104;
 const baseGuideCatalog=guideCatalog104;
 const baseNotices=renderNotices107;

 function hasState(){return !!s?.governance&&!!s?.political}
 function advancingQuarter(){return hasState()&&!s.ended&&!pstate().current&&s.pending===null&&!v3().settlementDue&&(s.adminMode||!regime().democratic||!constitutionalTermLimit()||s.q<constitutionalTermLimit())}
 advance=function(){
  if(!hasState())return;
  if(!advancingQuarter()||pstate().ap<=0||s.officePreferences?.skipUnusedActionWarning===true){baseAdvance();return}
  advanceConfirmation={state:s,q:s.q};
  modal(`<section class="quarter-confirmation" aria-labelledby="quarter-confirm-title"><span class="tag">季度交接</span><h2 id="quarter-confirm-title">还有未使用的行动点</h2><p>本季还剩 <strong>${fmt(pstate().ap,Number.isInteger(pstate().ap)?0:1)} 点政治行动点</strong>。进入下一季度后，未使用的行动点不会保留。</p><p>确定进入下一季度吗？</p><div class="quarter-confirm-actions"><button onclick="officeUI.cancelAdvance()">继续处理本季事务</button><button class="primary" onclick="officeUI.confirmAdvance()">仍然进入下一季度 →</button></div><label class="quarter-confirm-preference"><input type="checkbox" id="skip-quarter-reminder" onchange="officeUI.setQuarterReminder(this.checked)"><span>本局不再提示</span></label></section>`);
 };
 function titleStatus(){
  let saved=null;try{saved=s||JSON.parse(localStorage.getItem(KEY)||'null')}catch(_){}
  $('continue-game').hidden=!saved;
  $('continue-game').innerHTML=(saved?.ended?'查看任期档案':'继续执政')+' <span aria-hidden="true">→</span>';
  $('start-save-label').textContent=saved?.name?`${saved.name} · 第 ${saved.q} 季度 · 本地存档`:'';
 }
 function enter(){
  document.body.classList.remove('at-title');$('start-screen').hidden=true;root.hidden=false;
  requestAnimationFrame(()=>{placeArt();toolbarHeight()});
 }
 function openWorkspace(){
  ui.open=true;overlay.hidden=false;document.body.classList.add('office-open');
  scene.inert=true;root.querySelector('.of-pocket').inert=true;root.querySelector('.office-footbar').inert=true;
 }
 function closeWorkspace(){
  ui.open=false;overlay.hidden=true;document.body.classList.remove('office-open');
  scene.inert=false;root.querySelector('.of-pocket').inert=false;root.querySelector('.office-footbar').inert=false;
  $all('.of-object.is-active').forEach(el=>el.classList.remove('is-active'));
  ui.focus?.focus?.({preventScroll:true});
 }
 function toolbarHeight(){document.documentElement.style.setProperty('--office-toolbar-height',root.querySelector('.office-toolbar').getBoundingClientRect().height+'px')}
 function openCustom(name){
  if(!hasState())return;ui.custom=name;ui.section='files';tab='overview';ui.lastTab=tab;openWorkspace();render();overlay.scrollTop=0;
 }
 function openObject(name){
  if(!hasState())return;
  if(name==='guide'){showHelp();return}
  ui.focus=document.activeElement;
  if(name==='files'){openCustom('events');return}
  if(name==='calendar'){openCustom('calendar');return}
  changeTab(({phone:'assembly',archives:'overview',map:'politics'})[name]||'overview');
 }
 function eventsPage(){
  const p=pstate(),g=v3(),e=p.current,queue=p.queue||[],brief=governmentBriefings(6);
  return `<div class="office-document-spread"><article class="card office-letter"><div class="office-letter-meta"><span>${esc(executiveName())} · 待批公文</span><span>${date()}</span></div><span class="tag">本季已回复 ${g.eventsChosen} 件 · 每季至少 3 件</span><h2>${e?esc(e.title):'本季文件已归档。'}</h2><p>${e?esc(e.text):'预算、改革与持续局势仍可在本文件夹中处理。下一季度的事件将在季度交接时送达。'}</p>${e?'<button class="primary" onclick="showPoliticalEvent()">展开文件并批示 →</button>':'<button class="primary" onclick="advance()">进入下一季度 →</button>'}<div class="office-letter-sign"><span>${esc(executiveName())}<br>呈请裁示</span><span class="office-seal" aria-hidden="true">国务</span></div>${queue.length?`<details><summary>后续待批文件 · ${queue.length} 件</summary>${queue.map(x=>`<div class="row"><span>${esc(x.title||'季度公文')}</span><small>依次呈送</small></div>`).join('')}</details>`:''}</article><div class="office-margin"><h3>本季议程</h3><button class="office-docket" onclick="changeTab('budget')">财政与预算<small>调整税收、支出与财政规则</small></button><button class="office-docket" onclick="changeTab('reforms')">结构性改革<small>${g.offers.length} 份可选草案 · ${s.reforms.filter(x=>!x.completed).length} 项执行中</small></button><button class="office-docket" onclick="changeTab('situations')">持续局势<small>${sits().active.length} 项 · 查看条件与处置方案</small></button><button class="office-docket" onclick="officeUI.constitution()">宪制议程<small>${constitution().docket?esc(constitution().docket.title):'修宪、释宪与审议进度'}</small></button>${p.bill?`<div class="note">待表决：${esc(p.bill.title)}<br><button onclick="changeTab('assembly')">联系${esc(regime().body)} →</button></div>`:''}</div></div><div class="section-label"><h3>${esc(executiveName())}简报</h3><span>最近国务记录</span></div><div class="office-briefs">${brief.map(l=>`<article class="card"><small>${date(l.q)}</small><h3>${esc(l.title)}</h3><p>${esc(l.text)}</p></article>`).join('')}</div>`;
 }
 function constitutionPage(){
  return `<div class="political-banner"><div><span class="tag">宪法与国家制度</span><h2>让制度为议程赋予效力。</h2><p>${isFederal108()?federalAmendmentText108():`修宪先由${esc(regime().body)}议长或主席受理，取得三分之二院内支持后进入司法审查；释宪由当前有权机关受理。实际门槛、费用与可选条款以互动中的说明为准。`}</p></div></div>${constitutionalDocketHTML()}<div class="grid"><article class="card"><span class="tag">宪法修订</span><h2>联系议长 / 主席</h2><p>${isFederal108()?'选择修宪条款，争取司法赞成与公民加权支持。':'选择修宪条款、争取院内支持并推进三季度司法审查。'}</p><button class="primary" onclick="officeUI.constitutionContact('amend')">联系${esc(regime().body+memberRole(0))} →</button></article><article class="card"><span class="tag">宪法解释</span><h2>请求释宪</h2><p>就改革费用、政党关系或公共预算上限提出申请。</p><button onclick="officeUI.constitutionContact('interpret')">联系有权受理机关 →</button></article></div><div class="office-actions"><button onclick="changeTab('judiciary')">司法审查与法官</button><button onclick="changeTab('archive')">查看重要宪法条目</button></div>`;
 }
 function calendarPage(){
  const g=v3(),limit=s.adminMode?null:constitutionalTermLimit(),events=(pstate().current?1:0)+pstate().queue.length;
  return `<div class="office-document-spread"><article class="card office-letter"><span class="tag">季度交接 / ${date()}</span><h2>${s.ended?'本届任期已经结束':events?'先批复本季国务文件':'准备进入下一季度。'}</h2><div class="big-number">${s.q}<small> / ${limit||'∞'} 季度</small></div><p>季度交接将结算经济与预算、内阁施政、科研、改革和持续局势，并发放下一季度的政治行动点。</p><p>${esc(actionModeDescription())}</p><div class="row"><span>本季待回复文件</span><b>${events} 件</b></div><div class="row"><span>持续局势</span><b>${sits().active.length} 项</b></div><div class="row"><span>下一批改革草案</span><b>${6-s.q%6} 季度后</b></div><button class="primary" onclick="advance()">${s.ended?'查看任期评估':events?'回复季度事件':'进入下一季度'} →</button></article><div class="office-margin"><h3>交接前检查</h3>${activeAlerts107().slice(0,8).map(a=>`<button class="office-docket" onclick="changeTab('${a.tabs[0]}')">${esc(a.title)}<small>${esc(a.text)}</small></button>`).join('')||'<p>当前没有需要提醒的风险。</p>'}<p class="note">执政提醒不会阻止推进季度；待批季度事件需要先回复。</p></div></div>`;
 }
 function mapSheet(){
  const regions=v3().regions,positions=[[34,22],[50,32],[69,28],[73,49],[53,63],[30,61],[17,42],[50,46]];
  return `<section class="office-map-sheet card"><div class="office-map-picture"><img src="assets/office/map.webp" alt="虚构国家的地区示意图，编号对应右侧地区目录" width="1200" height="800">${regions.map((z,i)=>`<button class="office-map-pin ${z.isCapital?'capital':''}" style="left:${positions[i%8][0]}%;top:${positions[i%8][1]}%" onclick="officeUI.region(${i})" aria-label="查看${esc(z.name)}">${z.isCapital?'★':i+1}</button>`).join('')}<small>行政地区示意 · 不代表实际面积</small></div><div class="office-region-index"><h3>地区目录</h3>${regions.map((z,i)=>`<button data-map-region="${i}" onclick="officeUI.region(${i})"><span><b>${z.isCapital?'★':i+1}</b> ${esc(z.name)}</span><small>${(z.demandProgress??z.termProgress)>=1?'诉求已完成':'诉求待落实'} · 预测 ${fmt(regionalEstimate(z).share)}%</small></button>`).join('')}</div></section>`;
 }
 function decoratePage(){
  content.dataset.officePage=ui.custom||tab;
  if(tab==='politics'&&!ui.custom){
   content.insertAdjacentHTML('afterbegin',mapSheet());
   content.querySelectorAll('.region-grid>article').forEach((el,i)=>{el.id='office-region-'+i;el.dataset.regionIndex=i});
  }
  if(['assembly','cabinet','judiciary'].includes(tab)&&!ui.custom){
   content.querySelectorAll('.person,.candidate,.minister-detail').forEach((el,i)=>el.classList.add('office-person-card'));
  }
  if(tab==='reforms'&&!ui.custom)content.querySelectorAll('button[onclick^="reformDetail("]').forEach((el,i)=>{el.closest('.card').dataset.folio=String(i+1).padStart(2,'0')});
 }
 function updateNavigation(){
  $('office-workspace').dataset.section=ui.section;
  $all('#nav [data-nav]').forEach(el=>{el.hidden=groupsForPages[el.dataset.nav]!==ui.section;if(ui.custom)el.classList.remove('active')});
  if(ui.section==='files'){
   $('nav').insertAdjacentHTML('afterbegin',`<button class="nav-item ${ui.custom==='events'?'active':''}" data-office-page="events" onclick="officeUI.events()">待批文件${pstate().current?redDot107('有待回复的季度事件'):''}</button>`);
   $('nav').insertAdjacentHTML('beforeend',`<button class="nav-item ${ui.custom==='constitution'?'active':''}" data-office-page="constitution" onclick="officeUI.constitution()">宪制议程</button><button class="nav-item ${ui.custom==='calendar'?'active':''}" data-office-page="calendar" onclick="officeUI.calendar()">季度交接</button>`);
  }
  $('page-tutorial').hidden=false;
 }
 function updateDesk(){
  if(!hasState())return;
  const r=regime();world.dataset.theme=themes[r.id]||'republic';world.dataset.regime=r.id;
  $('office-country').textContent=s.name;$('office-institution').textContent=executiveName()+' · '+r.player;$('office-date').textContent=date();
  $('office-ap').textContent=pstate().ap+' / '+politicalCapacity();$('office-approval').textContent=fmt(s.approval)+'%';$('office-stability').textContent=fmt(s.stability);
  $('office-quarter').textContent=`第 ${s.q} / ${s.adminMode||!constitutionalTermLimit()?'∞':constitutionalTermLimit()} 季度`;
  $('office-console').hidden=!s.adminMode;
  $('office-folio').textContent=String(s.q).padStart(3,'0')+' / '+date();
  const pending=(pstate().current?1:0)+pstate().queue.length,count=$('office-file-count');count.hidden=!pending;count.textContent=pending;
  const alerts=activeAlerts107();$('office-memo').textContent=pstate().current?'待批：'+pstate().current.title:alerts.length?'国务备忘：'+alerts[0].title:'国务备忘：'+s.lastNews;
  const advanceLabel=s.ended?'查看任期结算 →':pstate().current?'回复季度事件 →':v3().settlementDue?'选择结算或继续 →':'进入下一季度 →';
  $('desk-advance').textContent=advanceLabel;$('advance').textContent=advanceLabel;
  $all('[data-office-metric]').forEach(el=>{el.querySelectorAll('.attention-dot').forEach(dot=>dot.remove());const matches=alerts.filter(a=>a.metric===el.dataset.officeMetric);if(matches.length)el.insertAdjacentHTML('beforeend',redDot107(matches.map(a=>a.title).join('；')))});
  for(const key of ['files','phone','archives','map']){
   const matches=alerts.filter(a=>a.tabs.some(t=>groupsForPages[t]===key));
   $all(`[data-object="${key}"]`).forEach(el=>{el.querySelector('.office-object-dot')?.remove();if(matches.length){const dot=document.createElement('span');dot.className='office-object-dot';dot.setAttribute('role','img');dot.setAttribute('aria-label',matches.map(a=>a.title).join('；'));(el.querySelector('.of-object-label')||el).appendChild(dot)}});
  }
  $all('.of-object').forEach(el=>el.classList.toggle('is-active',ui.open&&el.dataset.object===(ui.custom==='calendar'?'calendar':ui.section)));
 }
 render=function(){
  if(!hasState()){baseRender();return}
  if(tab!==ui.lastTab){ui.custom=null;ui.section=groupsForPages[tab]||'archives';if(!ui.initializing)openWorkspace()}
  ui.lastTab=tab;baseRender();
  if(ui.custom){$('content').innerHTML=ui.custom==='events'?eventsPage():ui.custom==='constitution'?constitutionPage():calendarPage();$('heading').textContent=({events:'待批文件',constitution:'宪制议程',calendar:'季度交接'})[ui.custom]}
  decoratePage();updateNavigation();updateDesk();
  if(s.ended&&!ui.initializing&&tab==='settlement')openWorkspace();
 };
 changeTab=function(next){
  if(!hasState())return;ui.custom=null;ui.section=groupsForPages[next]||'archives';ui.lastTab=next;openWorkspace();baseChangeTab(next);overlay.scrollTop=0;
 };
 create=function(seed){
  advanceConfirmation=null;
  ui.initializing=true;ui.custom=null;ui.lastTab='overview';ui.section='archives';tab='overview';closeWorkspace();enter();
  try{baseCreate(seed)}finally{ui.initializing=false}
  render();titleStatus();
 };
 newDialog=function(){baseNewDialog();$('modal').dataset.officeKind='setup'};
 renderNotices107=function(){baseNotices();if(document.body.classList.contains('at-title')){$('alert-notice').hidden=true;$('alert-dock').hidden=true}};
 $('modal').addEventListener('close',()=>{delete $('modal').dataset.officeKind;advanceConfirmation=null});

 guideCatalog104=function(){
  const entries=baseGuideCatalog().map(entry=>({...entry,aliases:[...entry.aliases]}));
  const text={
   advance:'点击“进入下一季度”结算经济、官员施政、科研与持续局势，并发放新一季行动点。还有剩余行动点时会先询问是否继续；右下角可勾选“本局不再提示”，该设置保存在本局存档，新历史恢复提示。待决事件、结算和结束页面按原流程处理。',
   tutorial:'顶部的入门教程简要介绍政体、受托机构、任期、执政目标、9维评估、桌面入口与分板块学习方法。按空格进入下一步，或用左右方向键浏览，右下角跳过或Esc退出。',
   'page-tutorial':'从办公桌的文件、电话、档案或地图进入所需板块，再点击纸页右上方的“本页教程”。按空格进入下一步；只介绍当前板块，不执行政策或消耗行动点。',
   console:'仅在创建新世界时选择管理员模式后开放，入口位于办公室顶部，也可从档案打开。可调整数据和触发局势，保留正常模拟，但取消所有失败结局和回合上限；开启新历史才会替换本局。',
   'new-world':'在主菜单点击“开启新历史”，可设置种子、政体、经济制度、困难模式与行动点规则。生成国家会替换当前进度，保留旧进度请先到档案中的国家档案导出存档。'
  };
  for(const entry of entries){if(text[entry.id])entry.text=text[entry.id];if(entry.id==='advance'){entry.title='进入下一季度';entry.aliases.push('进入下一季度','本局不再提示','行动点提醒')}}
  for(const [id,title,aliases,body]of [
   ['office-desk','办公桌',['办公室','桌面'],'点击桌上的文件、电话、档案、地图处理国务。桌面下按数字1至4也可打开；收回桌面或Esc可返回。办公室陈设随政体变化。'],
   ['office-files','文件',['待批文件','公文'],'处理本季事件、财政预算、结构性改革和持续局势，也可从宪制议程联系修宪、释宪的受理机关。'],
   ['office-phone','电话',[],'联系议事机关、内阁和最高司法机关。会见、协商、任免、任务和提案继续使用现有行动点与表决规则。'],
   ['office-map','地图',['地区目录'],'查看全部地区、地方诉求、完成进度及选举预测。点击编号或目录定位地区；示意图不表示真实面积。'],
   ['office-calendar','季度交接',['台历'],'检查待批事件和执政提醒，再推进下一季度。经济、内阁、改革与局势按原规则结算，未回复的季度事件须先处理。']
  ])entries.push({id,title,aliases:[title,...aliases],text:body,category:'页面与操作'});
  return entries;
 };

 tutorialSteps104=function(scope='intro',page=tab){
  if(scope==='page'&&ui.custom){
   const name=ui.custom;
   return [{page,selector:'#heading',title:({events:'批阅国务文件',constitution:'宪制议程',calendar:'季度交接'})[name],text:name==='events'?'这里呈送真实的季度事件。展开文件后选择批示，后果计入国家指标与任期评估。':name==='constitution'?'这里整理修宪和释宪入口。修宪联系议长或主席，释宪联系当前有权受理的机关；原有表决与司法审查规则继续适用。':'季度交接将结算施政与经济，并发放新一季行动点。尚未批复的季度事件需要先回复。'}, {page,selector:'#nav',title:'文件分类',text:'在这里切换财政预算、结构性改革、持续局势和宪制议程；已打开的草案与执行项目按原规则保留。'}, {page,selector:'#guide-open',title:'随时查阅规则',text:'不清楚的概念可在治国指南中搜索。空格完成本页教程。'}];
  }
  let steps=baseTutorialSteps(scope,page).map(step=>({...step}));
  steps.forEach(step=>{if(step.id==='advance')step.text='进入下一季度会结算经济与施政，并发放行动点。剩余行动点不会结转，系统会先询问是否继续；勾选本局不再提示可关闭本局提醒。待决事件须先回复。';if(step.id==='page-tutorial')step.text='点击桌面物品进入需要了解的板块，再使用纸页右上方的“本页教程”。文件处理政策，电话联系人物，档案查看指标，地图查看地方与选举。';if(step.id==='tour-roadmap')step.text='办公桌上的文件、电话、档案和地图是主要入口。各页右上方都有本页教程；按空格进入下一步，右下角可跳过。';if(step.id==='new-world'){step.selector='button[onclick="officeUI.menu()"]';step.text='返回主菜单后可继续本局，或点击开启新历史重新生成国家。保留旧进度请先在国家档案导出存档。'}});
  if(scope==='intro')steps.splice(5,0,{page:'overview',id:'office-objects',selector:'.office-close',title:'从办公桌处理国务',text:'文件：事件、预算、改革、局势与宪制议程。电话：议会、内阁和司法机关。档案：国家数据与存档。地图：地区诉求和选举。点击“收回桌面”再选择其他物品，也可按数字1至4打开。'});
  return steps;
 };
 startTutorial=function(scope='intro'){
  if(!hasState()||tutorial104)return;
  ui.tourReturn={open:ui.open,custom:ui.custom,section:ui.section,tab};
  if(scope==='intro')changeTab('overview');else if(!ui.open)changeTab('overview');
  baseStartTutorial(scope);
 };
 stopTutorial=function(){
  const previous=ui.tourReturn;baseStopTutorial();ui.tourReturn=null;
  if(previous){ui.custom=previous.custom;ui.section=previous.section;tab=previous.tab;ui.lastTab=tab;render();if(!previous.open)closeWorkspace()}
 };
 window.officeUI={
  cancelAdvance(){advanceConfirmation=null;$('modal').close()},
  setQuarterReminder(skip){if(!advanceConfirmation||advanceConfirmation.state!==s)return;s.officePreferences={...s.officePreferences,skipUnusedActionWarning:!!skip};save()},
  confirmAdvance(){const pending=advanceConfirmation;advanceConfirmation=null;if(!pending||pending.state!==s||pending.q!==s.q)return;$('modal').close();baseAdvance()},
  open:openObject,close:closeWorkspace,events:()=>openCustom('events'),constitution:()=>openCustom('constitution'),calendar:()=>openCustom('calendar'),
  resume(){
   if(hasState()){enter();render();closeWorkspace();if(s.ended)changeTab('settlement');return}
   ui.initializing=true;enter();try{bootGame()}finally{ui.initializing=false}render();closeWorkspace();if(s?.ended)changeTab('settlement');
  },
  menu(){
   if(tutorial104)stopTutorial();if(hasState())save();$('modal').close();$('chart-modal').close();closeWorkspace();root.hidden=true;$('start-screen').hidden=false;document.body.classList.add('at-title');$('alert-notice').hidden=true;$('alert-dock').hidden=true;titleStatus();window.scrollTo(0,0);
  },
  exit(){modal('<span class="tag">国策 / NATION · STATE</span><h2>可以安心离开。</h2><p>已有进度保存在当前浏览器中。你可以关闭此标签页，或返回开始界面。</p><button class="primary" onclick="$(\'modal\').close()">返回开始界面</button>')},
  constitutionContact(mode){if(mode==='amend'||constitutionalRoute()==='assembly'){changeTab('assembly');meetMember(0)}else{changeTab('judiciary');openChiefJudge107()}},
  region(index){ui.region=index;const el=$('office-region-'+index);if(!el)return;content.querySelectorAll('.office-selected-region').forEach(n=>n.classList.remove('office-selected-region'));el.classList.add('office-selected-region');el.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})},
  state(){return {...ui,focus:null,tourReturn:null}}
 };
 document.addEventListener('click',e=>{const object=e.target.closest('[data-object]');if(object&&!tutorial104)openObject(object.dataset.object)});
 document.addEventListener('keydown',e=>{
  if(tutorial104||$('modal').open||$('chart-modal').open||document.body.classList.contains('at-title')||e.ctrlKey||e.metaKey||e.altKey||['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;
  if(e.key==='Escape'&&ui.open){e.preventDefault();closeWorkspace()}
  if(['1','2','3','4'].includes(e.key)){e.preventDefault();openObject(['files','phone','archives','map'][+e.key-1])}
 });
 overlay.addEventListener('click',e=>{if(e.target===overlay&&!tutorial104)closeWorkspace()});
 // Accurate silhouette hit areas and a single outline around each whole object group.
  // Coordinates describe the interactive silhouettes in the original artwork.
 const hitShapes={
  files:[[660,695],[665,673],[673,674],[674,660],[691,659],[690,649],[721,648],[724,641],[735,642],[742,648],[1033,627],[1217,833],[1211,836],[1225,850],[1212,855],[1225,866],[1213,870],[1225,886],[708,936],[697,931],[689,917]],
  pen:[[1124,670],[1135,673],[1157,684],[1161,687],[1195,716],[1206,723],[1219,738],[1279,790],[1294,800],[1299,817],[1312,837],[1304,838],[1289,827],[1283,826],[1268,818],[1264,807],[1200,750],[1183,741],[1168,723],[1143,699],[1134,691]],
  phone:[[1330,659],[1374,617],[1404,584],[1400,572],[1390,589],[1377,596],[1352,597],[1345,590],[1340,560],[1348,533],[1363,521],[1396,514],[1460,511],[1530,518],[1590,533],[1645,554],[1655,566],[1666,609],[1661,636],[1644,642],[1605,636],[1600,654],[1614,676],[1612,696],[1551,759],[1528,762],[1330,703],[1327,687]],
  cord:[[1602,633],[1622,642],[1645,662],[1654,667],[1662,660],[1672,639],[1672,694],[1655,692],[1642,682],[1622,664],[1606,654]],
  archives:[[0,568],[248,516],[484,539],[491,551],[490,606],[479,616],[491,624],[491,697],[487,711],[179,821],[0,773]],
  map:[[215,0],[530,73],[529,348],[211,350]],
  calendar:[[508,593],[532,499],[537,489],[549,489],[554,478],[563,475],[570,484],[581,481],[584,473],[594,474],[600,480],[612,476],[616,470],[625,475],[638,474],[641,468],[650,474],[661,474],[665,468],[677,472],[690,480],[718,604],[715,612],[562,640],[516,619],[523,598]],
  guide:[[161,840],[353,731],[533,761],[527,791],[539,801],[411,938],[166,881],[158,867]]
 };
 const groups={files:['files','pen'],phone:['phone','cord'],archives:['archives'],map:['map'],calendar:['calendar'],guide:['guide']};
 function placeArt(){const box=scene.getBoundingClientRect(),sw=box.width,sh=box.height;Object.entries(groups).forEach(([key,parts])=>{const button=scene.querySelector('[data-object="'+key+'"]'),points=parts.flatMap(x=>hitShapes[x]),xmin=Math.min(...points.map(p=>p[0])),ymin=Math.min(...points.map(p=>p[1])),xmax=Math.max(...points.map(p=>p[0])),ymax=Math.max(...points.map(p=>p[1]));button.style.left=xmin/1672*100+'%';button.style.top=ymin/941*100+'%';button.style.width=(xmax-xmin)/1672*100+'%';button.style.height=(ymax-ymin)/941*100+'%';parts.forEach(part=>{let el=button.querySelector('[data-piece="'+part+'"]');if(!el){el=document.createElement('span');el.className='of-art-piece';el.dataset.piece=part;button.insertBefore(el,button.firstChild)}let ps=hitShapes[part],x0=Math.min(...ps.map(p=>p[0])),y0=Math.min(...ps.map(p=>p[1])),x1=Math.max(...ps.map(p=>p[0])),y1=Math.max(...ps.map(p=>p[1]));el.style.left=(x0-xmin)/(xmax-xmin)*100+'%';el.style.top=(y0-ymin)/(ymax-ymin)*100+'%';el.style.width=(x1-x0)/(xmax-xmin)*100+'%';el.style.height=(y1-y0)/(ymax-ymin)*100+'%';el.style.clipPath='polygon('+ps.map(([x,y])=>((x-x0)/(x1-x0)*100)+'% '+((y-y0)/(y1-y0)*100)+'%').join(',')+')';el.style.backgroundSize=sw+'px '+sh+'px';el.style.backgroundPosition=(-x0/1672*sw)+'px '+(-y0/941*sh)+'px';});});}
 new ResizeObserver(placeArt).observe(scene);placeArt();

 new ResizeObserver(toolbarHeight).observe(root.querySelector('.office-toolbar'));
 titleStatus();
})();
