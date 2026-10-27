/* 1.0.7 — constitutional institutions, individual judges and constitutional proceedings. */
const JUDICIAL_VIEWS = [
 {name:'社会进步',color:'#49a6a0',text:'支持平等权利和进步社会议题；并不自动赞成其他制度修改。'},
 {name:'政治自由',color:'#70a8d3',text:'支持政治自由、独立司法与权力制衡。'},
 {name:'墨守成规',color:'#b9a98e',text:'重视既有宪法文本，对一切修宪尤其谨慎。'},
 {name:'政治保守',color:'#a083bf',text:'反对削弱既有政治权威的修宪与释宪。'},
 {name:'社会保守',color:'#d29565',text:'维护传统社会秩序，反对进步社会议题。'}
];
const CONSTITUTION_BUDGETS=['education','health','welfare','infrastructure','security'];
const JUDGE_TITLES={
 constitutional:['法官','首席大法官'],presidential:['法官','首席大法官'],
 semi:['宪法委员','宪法委员会主席'],westminster:['法官','首席大法官'],
 federal:['联邦大法官','联邦首席大法官'],theorepublic:['宗教宪法法官','首席宗教宪法大法官'],
 symbolic:['法官','首席大法官'],party:['审判员','最高人民法院院长'],
 absolute:['王国审判官','王国首席审判官'],aristocratic:['贵族裁判官','最高裁判长'],
 tyranny:['国家裁判官','国家首席裁判长'],theoabsolute:['教法审判官','首席教法审判长']
};
function constitution(){return s.constitution}
function constitutionBaseRegime(){return REGIMES.find(r=>r.id===pstate().regime)||REGIMES[0]}
const regimeBeforeConstitution=regime;
regime=function(){let r=regimeBeforeConstitution();return s.constitution?.authority==='assembly'?{...r,court:r.body}:r};
function constitutionalRoute(){return regime().body==='枢密院'||constitution().authority==='assembly'?'assembly':'court'}
function judgeTitle(j){return JUDGE_TITLES[pstate().regime][j.chief?1:0]}
function constitutionalTermText(){return constitutionalTermLimit()?`最多 ${constitutionalTermLimit()/TERM} 届，共 ${constitutionalTermLimit()} 季度`:'无宪法任期上限；48 季度后可按提示延长'}
function initializeConstitution(){
 if(s.constitution)return;
 // A separate deterministic stream adds characters without rerolling existing world events.
 const priorRng=s.rng;
 try{
  s.rng=hash(s.seed+'|constitution107');
  let count=5+Math.floor(rand()*6),minority=1+Math.floor(rand()*Math.floor((count-1)/2));
  let views=Array.from({length:count},(_,i)=>i<minority?Math.floor(rand()*2):((roll)=>roll<(regime().id==='federal'?.8:.7)?2:roll<.85?3:4)(rand()));
  for(let i=views.length-1;i>0;i--){let j=Math.floor(rand()*(i+1));[views[i],views[j]]=[views[j],views[i]]}
  s.constitution={version:1,judges:[],authority:'court',termLimit:regime().democratic?48:0,
   economicModel:v3().socialist?'socialist':'mixed',rights:'traditional',budgetCaps:{},reformDiscounts:{},
   docket:null,nextDocket:1,risks:[],history:[]};
  for(let key of CONSTITUTION_BUDGETS)constitution().budgetCaps[key]=policyMeta[key][2];
  const chief=Math.floor(rand()*count);
  for(let i=0;i<count;i++)constitution().judges.push({id:i,name:personName(),trait:views[i],chief:i===chief,relation:40+Math.floor(rand()*21),boosts:[]});
 }finally{s.rng=priorRng}
}
const initBeforeConstitution=initPolitics;
initPolitics=function(){
 if(!s.constitution&&!creatingWorld&&s.political)try{localStorage.setItem(KEY+'-pre-constitution107',JSON.stringify(s))}catch(_){}
 initBeforeConstitution();initializeConstitution();
};
const baseBudgetCap107=budgetCap;
budgetCap=function(key){return s?.constitution?.budgetCaps?.[key]??baseBudgetCap107(key)};
constitutionalTermLimit=function(){return s?.constitution?.termLimit??(regime().democratic?48:0)};
reformStartCost=function(id,offer){return Math.round(REFORMS[id].cost*(1-(s?.constitution?.reformDiscounts?.[offer]||0))*10000)/10000};

function constitutionalSpec(mode,action,target){
 let c=constitution(),r=regime(),spec={mode,action,target:String(target),stance:'neutral',axes:{law:1},values:{},costText:''};
 if(mode==='interpret'){
  spec.values={approval:-1,stability:-2};spec.costText='通过时公众支持 −1、政治稳定 −2。';
  if(action==='budget'&&CONSTITUTION_BUDGETS.includes(target)&&budgetCap(target)<100){
   spec.title=({welfare:'关于国家对劳动者的义务',education:'关于受教育权与科研职责',health:'关于公民健康保障',infrastructure:'关于公共设施供给',security:'关于公共秩序保障'})[target];
   spec.description=`${policyMeta[target][0]}预算上限从 ${budgetCap(target)}% 提高至 ${budgetCap(target)+1}%。只改变本局上限，实际支出仍需预算表决。`;
   spec.stance=['welfare','education','health'].includes(target)?'social':target==='security'?'authority':'neutral';
   spec.axes={law:1,welfare:target==='security'?0:1,authority:target==='security'?1:0};
  }else if(action==='reform'){
   let offer=v3().offers.find(x=>x.uid===Number(target));
   if(!offer||s.reforms.some(x=>x.id===offer.catalog)||(c.reformDiscounts[target]||0)>=.5)return null;
   let discount=Math.min(.5,(c.reformDiscounts[target]||0)+.25),ref=REFORMS[offer.catalog];
   spec.title='关于'+ref.name+'的公共利益解释';spec.catalog=offer.catalog;
   spec.description=`保留这份未启动草案；启动成本由 ${fmt(reformStartCost(offer.catalog,offer.uid),2)}% GDP 降至 ${fmt(ref.cost*(1-discount),2)}% GDP。每次减免原价的 25%，累计最多减免 50%；通过后仍需另交改革案。`;
   spec.discount=discount;
  }else if(action==='relations'&&pstate().factions[Number(target)]){
   spec.title='关于政治团体参与公共事务的解释';spec.description=`${pstate().factions[Number(target)].name}团体关系 +10（最高 100）。不直接改变席位。`;
   spec.stance='liberal';spec.axes={authority:-2,law:1};
  }else return null;
 }else if(mode==='amend'){
  if(action==='court'&&['court','assembly'].includes(target)&&target!==c.authority){
   let transfer=target==='assembly';spec.title='修订最高司法机关条款';
   spec.description=transfer?`将最高司法权移交${r.body}；之后向${r.body}${memberRole(0)}提出修宪或释宪，由院内支持率表决。`:`将最高司法权恢复至${constitutionBaseRegime().court}。枢密院政体仍由枢密院处理宪制事项。`;
   spec.values=transfer?{judicial:-20,stability:-10,approval:10}:{judicial:20,stability:-4,approval:3};
   spec.stance=transfer?'authority':'liberal';spec.axes={law:transfer?-4:4,authority:transfer?3:-3,elite:transfer?2:-2};
  }else if(action==='term'&&r.democratic&&['0','48','72'].includes(String(target))&&Number(target)!==c.termLimit){
   spec.title='修订任期限制条款';spec.description=Number(target)?`宪法执政期限改为 ${Number(target)/TERM} 届（${target} 季度），已执政季度不清零。`:'取消宪法任期上限；保留每 24 季度的选举和失去支持时的失败条件。48 季度起每 12 季度询问是否结算。';
   let extendsTerm=Number(target)===0||(c.termLimit!==0&&Number(target)>c.termLimit);
   spec.stance=extendsTerm?'authority':'liberal';spec.values={approval:-3,stability:-4};spec.axes={authority:extendsTerm?3:-3,elite:extendsTerm?2:-2};
  }else if(action==='economy'&&['mixed','socialist'].includes(target)&&target!==c.economicModel){
   spec.title='修订经济模式条款';spec.description=target==='socialist'?'确立社会主义经济方向，公共所有与劳动保障优先；影响经济模式档案和非民主国家任期评估范围。':'确立混合经济方向，允许公共与私人部门并存；影响经济模式档案和任期评估范围。';
   spec.stance=target==='socialist'?'social':'neutral';spec.values=target==='socialist'?{approval:3,confidence:-5,stability:-3}:{approval:-2,confidence:5,stability:-3};spec.axes={market:target==='socialist'?-4:3,welfare:target==='socialist'?2:0};
  }else if(action==='rights'&&['equal','traditional'].includes(target)&&target!==c.rights){
   spec.title='修订公民权利条款';spec.description=target==='equal'?'明确平等保护与社会权利，强化公共服务的平等可及原则。':'恢复传统社会秩序优先的宪法条款。';
   spec.stance=target==='equal'?'social':'traditional';spec.values=target==='equal'?{judicial:5,approval:3,stability:-3}:{judicial:-5,approval:-2,stability:3};spec.axes={welfare:target==='equal'?4:-4,law:target==='equal'?2:-2};
  }else return null;
  spec.costText='通过效果：'+impactText(spec.values)+'。';
 }else return null;
 return spec;
}
function constitutionalChoices(mode){
 let all=[],add=(action,target)=>{let x=constitutionalSpec(mode,action,target);if(x)all.push(x)};
 if(mode==='interpret'){
  CONSTITUTION_BUDGETS.forEach(k=>add('budget',k));v3().offers.forEach(o=>add('reform',String(o.uid)));pstate().factions.forEach(f=>add('relations',String(f.id)));
 }else{
  ['assembly','court'].forEach(t=>add('court',t));['48','72','0'].forEach(t=>add('term',t));['socialist','mixed'].forEach(t=>add('economy',t));['equal','traditional'].forEach(t=>add('rights',t));
 }
 return all;
}
function constitutionalMenu(mode='interpret'){
 if(s.ended)return;
 if(constitution().docket){modal(`<h2>已有宪制议案待审</h2>${constitutionalDocketHTML()}<button onclick="$('modal').close()">返回</button>`);return}
 let route=constitutionalRoute(),name=mode==='amend'?'修宪':'释宪';
 modal(`<span class="tag">${esc(route==='court'?regime().court:regime().body)} · ${name}</span><h2>请求${name}</h2><p>提出议案消耗 1 行动点；表决另需 1 行动点。${route==='court'?'赞成法官须超过半数；修宪的基础意愿比释宪低 20 点。':'由权力机关提出议案，院内支持率必须超过 50%。'}具体效果只在通过时兑现。</p><div class="choices constitution-choices">${constitutionalChoices(mode).map(x=>`<button onclick="proposeConstitution('${mode}','${x.action}','${x.target}')"><strong>${esc(x.title)}</strong><small>${esc(x.description)} ${esc(x.costText)}</small></button>`).join('')}</div><button onclick="$('modal').close()">返回</button>`);
}
function proposeConstitution(mode,action,target){
 if(s.ended)return;
 let c=constitution(),spec=constitutionalSpec(mode,action,target);
 if(!spec)return toast('此宪制选项已失效，请重新选择');
 if(c.docket||pstate().bill)return toast('请先完成或撤回当前议案');
 if(!spendAction())return;
 let docket={...spec,id:c.nextDocket++,kind:'constitution',route:constitutionalRoute(),created:s.q};
 c.docket=docket;
 if(action==='reform')v3().offers.find(x=>x.uid===Number(target)).kept=true;
 if(docket.route==='assembly')pstate().bill=docket;
 noteDecision('提出'+spec.title,{law:0},[],null,1,null,{kind:'procedure'});log('宪制议案提出',spec.title+'；由'+(docket.route==='court'?regime().court:regime().body)+'审议。');
 $('modal').close();tab=docket.route==='court'?'judiciary':'assembly';pSave();
}
function judgeWillingness(j,docket=constitution().docket){
 if(!docket||j.vacant)return null;
 let base=docket.mode==='amend'?34:54,stance=docket.stance;
 const affinity=[{social:30,liberal:10,authority:-18,traditional:-30,neutral:2},{liberal:32,authority:-32,social:12,traditional:-12,neutral:5},{neutral:0},{liberal:-30,authority:27,social:-3,traditional:8,neutral:5},{social:-30,traditional:28,liberal:-4,authority:6,neutral:5}];
 let conservative=j.trait===2?(docket.mode==='amend'?-18:-5):0;
 let boost=j.boosts.filter(x=>x.docketId===docket.id&&x.until>=s.q).reduce((n,x)=>n+x.amount,0);
 return clamp(base+(affinity[j.trait][stance]||0)+conservative+(j.relation-50)*.2+boost,0,100);
}
function activeJudges107(){return constitution().judges.filter(j=>!j.vacant)}
function courtVoteCount(){return activeJudges107().filter(j=>judgeWillingness(j)>=60).length}
function courtTally107(d=constitution().docket){
 const judges=activeJudges107(),baseYes=d?judges.filter(j=>judgeWillingness(j,d)>=60).length:0,baseNo=judges.length-baseYes;
 const tied=!!d&&judges.length>0&&baseYes===baseNo,chief=judges.find(j=>j.chief);
 const casting=tied&&chief?(judgeWillingness(chief,d)>=60?'yes':'no'):null;
 const yes=baseYes+(casting==='yes'?1:0),no=baseNo+(casting==='no'?1:0),total=yes+no;
 return {baseYes,baseNo,seated:judges.length,yes,no,total,tied,casting,chiefName:chief?.name||null,rate:total?yes/total*100:0,passed:total>0&&yes>no};
}
function courtBallotText107(d=constitution().docket){
 const t=courtTally107(d);return `在任法官 ${t.seated} 人；普通票 ${t.baseYes} 票赞成、${t.baseNo} 票反对。`+(t.casting?`${esc(t.chiefName)}行使关键一票，投${t.casting==='yes'?'赞成':'反对'}；最终 ${t.yes} 比 ${t.no}。`:t.tied?'当前平票且首席空缺，须完成补缺后产生关键一票。':'每位法官意愿达到 60 时投赞成票，平票时首席依本案意愿额外投一票。');
}
function openChiefJudge107(){const chief=activeJudges107().find(j=>j.chief);if(chief)return meetJudge(chief.id);if(typeof judgeNominations107==='function')return judgeNominations107();toast('首席职位空缺，请先完成法官补缺。')}

function judgeSeatChart(){
 let judges=constitution().judges.slice().sort((a,b)=>(a.vacant?9:a.trait)-(b.vacant?9:b.trait)),n=judges.length;
 let seats=judges.map((j,i)=>{let angle=Math.PI-i*Math.PI/(n-1),x=180+135*Math.cos(angle),y=160-125*Math.sin(angle),yes=constitution().docket&&judgeWillingness(j)>=60;
  return `<g class="judge-seat" data-judge-seat="${j.id}"><title>${j.vacant?'空缺 · 原任 '+esc(j.name):esc(j.name)+' · '+judgeTitle(j)+' · '+JUDICIAL_VIEWS[j.trait].name+(constitution().docket?' · '+(yes?'赞成':'反对'):'')}</title><circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="15" fill="${j.vacant?'#cbc6b6':JUDICIAL_VIEWS[j.trait].color}" stroke="${j.chief?'#f3dfac':'#25352e'}" stroke-width="${j.chief?4:1}" ${j.vacant?'stroke-dasharray="3 3"':''}/>${j.chief?`<text x="${x.toFixed(2)}" y="${(y+5).toFixed(2)}" text-anchor="middle" fill="#18231c" font-size="16">★</text>`:''}</g>`}).join('');
 return `<svg class="judge-semicircle" viewBox="0 0 360 190" role="img" aria-label="${n} 个法官席位；星号表示首席，灰色虚线表示空缺">${seats}</svg><div class="judge-legend">${JUDICIAL_VIEWS.map((v,i)=>`<span><i style="background:${v.color}"></i>${v.name} <b>${judges.filter(j=>!j.vacant&&j.trait===i).length} 席</b></span>`).join('')}${judges.some(j=>j.vacant)?`<span>空缺 <b>${judges.filter(j=>j.vacant).length} 席</b></span>`:''}</div>`;
}
function constitutionalDocketHTML(){
 let d=constitution().docket,route=constitutionalRoute();if(d?.mode==='amend'&&typeof amendmentDocketHTML107==='function')return amendmentDocketHTML107();
 if(!d)return `<div id="constitutional-docket" class="card"><span class="tag">宪制议程</span><h3>暂无待审议案</h3><p>${route==='court'?`与${esc(JUDGE_TITLES[pstate().regime][1])}互动，提出修宪或释宪。`:`与${esc(regime().body+memberRole(0))}互动，提出修宪或释宪。`}</p><button onclick="${route==='court'?'openChiefJudge107()':'meetMember(0)'}">前往互动 →</button></div>`;
 let count=d.route==='court'?courtVoteCount():null,rate=d.route==='court'?courtTally107(d).rate:billPassRate104();
 return `<section id="constitutional-docket" class="card constitution-docket"><span class="tag">${d.mode==='amend'?'修宪案':'释宪案'} · ${d.route==='court'?'法官表决':esc(regime().body)+'审议'}</span><h2>${esc(d.title)}</h2><p>${esc(d.description)}</p><p class="note">${esc(d.costText)}</p><div class="big-number">${fmt(rate,1)}<small>% ${d.route==='court'?'法官支持率':'院内支持率'}</small></div><p>${d.route==='court'?courtBallotText107(d):'支持比例按各党派席位及议程倾向加权。'}${d.route==='court'?'计入关键一票后须赞成票过半。空缺不参与投票；无人任职时不能通过。':'必须超过 50% 才能通过，恰好 50% 不通过。'}</p><div class="constitution-actions"><button class="primary" onclick="voteConstitution()" ${s.ended?'disabled':''}>提交表决 · 1 行动点</button><button onclick="withdrawConstitution()" ${s.ended?'disabled':''}>撤回议案</button>${regime().body==='枢密院'?'<button class="danger" onclick="forceConstitutionPreview()">强行颁行…</button>':''}</div></section>`;
}
function meetJudge(id){
 let j=constitution().judges.find(x=>x.id===id);if(!j||j.vacant||s.ended)return;
 let d=constitution().docket?.route==='court'?constitution().docket:null,w=judgeWillingness(j,d),busy=pstate().lastAction['judge:'+id]===s.q;
 modal(`<span class="tag">${esc(constitutionBaseRegime().court)} · ${judgeTitle(j)}</span><h2>${esc(j.name)}</h2><p><b style="color:${JUDICIAL_VIEWS[j.trait].color}">${JUDICIAL_VIEWS[j.trait].name}</b> · 关系 ${fmt(j.relation,0)}</p><p>${JUDICIAL_VIEWS[j.trait].text}</p>${d?`<p>对“${esc(d.title)}”的意愿：<b>${fmt(w,1)} / 100</b>。${w>=60?'预计赞成':'预计反对'}；60 点起投赞成票。游说加成仅用于这份议案，持续至第 ${s.q+3} 季度（当前已有加成各按原到期日计算）。</p>`:'<p>尚无宪制议案。可以先公开会谈，改善关系。</p>'}${j.chief&&constitutionalRoute()==='court'?'<div class="constitution-actions"><button onclick="constitutionalMenu(\'interpret\')">请求释宪</button></div>':''}<div class="choices">${[
  ['hearing','公开法律论证',d?'1 行动点；本案意愿 +12，关系 +3，司法独立 +1。':'1 行动点；关系 +6，司法独立 +1。'],
  ['bribe','秘密贿赂','1 行动点、0.18% GDP；本案意愿 +26。下一季度有 3% 概率引发政治丑闻。'],
  ['exchange','政治交换','1 行动点；公众支持 −1、稳定 −1，本案意愿 +20。下一季度有 2% 概率引发政治丑闻。'],
  ['pressure','施加司法压力','1 行动点；司法独立 −2、公众支持 −1，本案意愿 +24。下一季度有 3% 概率追加特别事件，司法独立再 −10。']
 ].map(([key,title,detail])=>`<button onclick="influenceJudge(${id},'${key}')" ${busy||(!d&&key!=='hearing')?'disabled':''}>${title}<small>${detail}</small></button>`).join('')}</div><p>每位法官每季度可互动一次；公开论证没有丑闻风险。所有决定记入任期评估。</p><button onclick="$('modal').close()">返回</button>`);
}
function influenceJudge(id,method){
 let c=constitution(),j=c.judges.find(x=>x.id===id),d=c.docket?.route==='court'?c.docket:null;
 if(!j||j.vacant||!['hearing','bribe','exchange','pressure'].includes(method)||(!d&&method!=='hearing')||!spendAction('judge:'+id))return;
 let amount={hearing:12,bribe:26,exchange:20,pressure:24}[method];
 if(d)j.boosts.push({docketId:d.id,amount,until:s.q+3});
 j.relation=clamp(j.relation+(method==='hearing'?(d?3:6):method==='pressure'?-3:1),0,100);
 const effects={hearing:{judicial:1},bribe:{cost:.18},exchange:{approval:-1,stability:-1},pressure:{judicial:-2,approval:-1}};
 mod(effects[method]);
 if(method!=='hearing')c.risks.push({due:s.q+1,kind:method==='pressure'?'pressure':'scandal',chance:method==='exchange'?.02:.03,judgeName:j.name,method});
 if(method==='pressure')pstate().memory.judicialPressure++;
 noteDecision(({hearing:'公开法律论证',bribe:'贿赂法官',exchange:'司法政治交换',pressure:'向法官施压'})[method],method==='hearing'?{law:2,authority:-1}:{law:-3,authority:2});
 log('法官互动',j.name+'：'+({hearing:'公开论证',bribe:'秘密贿赂',exchange:'政治交换',pressure:'司法压力'})[method]+(d?'；本案意愿增加 '+amount+'。':'。'));
 $('modal').close();pSave();checkPoliticalEnd();
}
function withdrawConstitution(){
 let c=constitution();if(!c.docket||s.ended)return;
 log('撤回宪制议案',c.docket.title);c.docket=null;if(pstate().bill?.kind==='constitution')pstate().bill=null;
 c.judges.forEach(j=>j.boosts=[]);$('modal').close();pSave();
}
function forceConstitutionPreview(){
 if(regime().body!=='枢密院'||!constitution().docket||s.ended)return;
 let amend=constitution().docket.mode==='amend';modal(`<h2>强行颁行${amend?'修宪案':'释宪案'}</h2><p>绕过表决，额外消耗 1 行动点、公众支持 ${amend?12:8} 点、政治稳定 ${amend?10:8} 点；同时兑现议案本身的效果。可能导致统治终结。</p><button class="danger" onclick="voteConstitution(true)">确认强行颁行</button> <button onclick="$('modal').close()">返回</button>`);
}
function voteConstitution(force=false){
 let c=constitution(),d=c.docket;if(!d||s.ended||(force&&regime().body!=='枢密院'))return;
 // Re-check targets so withdrawn/started reforms never receive retroactive discounts.
 let spec=constitutionalSpec(d.mode,d.action,d.target);
 if(!spec){toast('议案目标已失效，请撤回后重新提出');return}
 if(!spendAction('constitutional-vote'))return;
 let ballot=d.route==='court'?courtTally107(d):null,rate=ballot?ballot.rate:billPassRate104();
 if(!force&&rate<=50){log('宪制议案未通过',d.title+'获得 '+fmt(rate,1)+'% 支持，必须超过 50%。议案保留。');toast('未过半数，请继续争取支持');$('modal').close();pSave();return}
 let penalty=d.route==='assembly'&&!force?billStabilityPenalty():0;
 if(force){let amend=d.mode==='amend';mod({approval:amend?-12:-8,stability:amend?-10:-8});noteDecision('强行颁行宪制议案',{authority:4,law:-3,elite:2},[],null,1,null,{kind:'coercion'})}
 mod(spec.values);if(penalty)mod({stability:-penalty});
 if(d.action==='budget')c.budgetCaps[d.target]++;
 if(d.action==='reform')c.reformDiscounts[d.target]=spec.discount;
 if(d.action==='relations'){let f=pstate().factions[Number(d.target)];f.relation=clamp(f.relation+10,0,100)}
 if(d.action==='court')c.authority=d.target;
 if(d.action==='term'){c.termLimit=Number(d.target);v3().settlementDue=false}
 if(d.action==='economy'){c.economicModel=d.target;v3().socialist=d.target==='socialist'}
 if(d.action==='rights')c.rights=d.target;
 noteDecision(spec.title,spec.axes,[],null,1,null,{kind:d.mode==='amend'?'amendment':'interpretation',identity:'constitution:'+d.id});
 c.history.push({q:s.q,title:spec.title,description:spec.description,effects:spec.costText,route:d.route,rate,forced:force,...(ballot?{ballot}: {})});
 pstate().passed.push({title:spec.title,q:s.q,votes:rate,passRate:rate});
 log(force?'宪制法令颁行':'宪制议案通过',spec.title+'。'+spec.description+' '+spec.costText+(penalty?' 反对派影响：稳定 −'+fmt(penalty,1)+'。':''));
 c.docket=null;c.judges.forEach(j=>j.boosts=[]);if(pstate().bill?.kind==='constitution')pstate().bill=null;
 $('modal').close();checkPoliticalEnd();record();pSave();if(s.ended){beginSettlement(s.ended);save();endDialog()}else toast('宪制议案已生效');
}

const judiciaryBeforeConstitution=judiciary;
const overviewBeforeConstitution=overview;
overview=function(){return overviewBeforeConstitution().replace('两届任期共 48 季度',constitutionalTermText())};
judiciary=function(){
 let c=constitution(),legacy=judiciaryBeforeConstitution(),split=legacy.indexOf('<div class="split"'),route=constitutionalRoute();
 let roster=`<div class="grid constitutional-grid"><section id="constitutional-court" class="card"><span class="tag">${esc(constitutionBaseRegime().court)} · ${c.judges.length} 席</span><h2>法官席位与倾向</h2>${judgeSeatChart()}<p>普通表决每人一票，★ 为${JUDGE_TITLES[pstate().regime][1]}，平票时另投关键一票。墨守成规在开局更常见；开局自由倾向合计少于半数，之后可随任命改变。</p>${route==='assembly'?`<p class="note">宪制事项由${esc(regime().body)}表决，此处法官不参与宪制表决。</p>`:''}</section>${constitutionalDocketHTML()}</div><div class="section-label"><h3>法官名录</h3><span>逐人互动 · 每人每季一次</span></div><div class="member-grid judge-roster">${c.judges.map(j=>j.vacant?`<article class="card person judge-vacancy" data-vacant-judge="${j.id}"><span class="tag">第 ${j.id+1} 席 · 空缺</span><h3>等待补缺任命</h3><p>${esc(j.name)} · ${esc(j.departureReason||'离任')}</p><button onclick="judgeNominations107(${j.id})" ${s.ended?'disabled':''}>查看法官备选池</button></article>`:`<article class="card person"><span class="tag">${judgeTitle(j)}</span><h3>${esc(j.name)}</h3><p style="color:${JUDICIAL_VIEWS[j.trait].color}">${JUDICIAL_VIEWS[j.trait].name}</p><p>${JUDICIAL_VIEWS[j.trait].text}</p>${Number.isInteger(j.politicalTrait)?`<small>任前政治倾向：${TRAITS[j.politicalTrait].name}</small>`:''}<div class="row"><span>关系</span><b>${fmt(j.relation,0)}</b></div>${c.docket&&c.docket.route==='court'?`<div class="row"><span>本案意愿</span><b>${fmt(judgeWillingness(j),1)} · ${judgeWillingness(j)>=60?'赞成':'反对'}</b></div>`:''}<button onclick="meetJudge(${j.id})" ${s.ended?'disabled':''}>${j.chief&&route==='court'?'会见 / 释宪':'会见法官'}</button></article>`).join('')}</div>`;
 return legacy.slice(0,split)+roster+legacy.slice(split);
};
const archiveBeforeConstitution=archive;
archive=function(){let c=constitution(),r=regime();return `<section id="constitution-articles" class="card constitution-articles"><span class="tag">国家根本规则</span><h2>重要宪法条目内容</h2>${[
 ['政体',r.name],['最高国家职务',r.player],['任期限制',constitutionalTermText()],['经济模式',c.economicModel==='socialist'?'社会主义经济':'混合所有制经济'],['最高司法机关',r.court],['宪制审议机关',constitutionalRoute()==='court'?r.court:r.body],['公民权利',c.rights==='equal'?'平等保护与社会权利':'传统社会秩序'],['公共预算上限',CONSTITUTION_BUDGETS.map(k=>policyMeta[k][0]+' '+budgetCap(k)+'%').join(' · ')]
 ].map(([a,b])=>`<div class="row"><span>${a}</span><b>${esc(b)}</b></div>`).join('')}<p>修宪改变根本条款；释宪可以扩展预算权限、减免未启动改革成本或改善团体关系。政体条目记载当前制度，本版不通过此菜单更换政体。</p><button onclick="changeTab('${constitutionalRoute()==='court'?'judiciary':'assembly'}')">前往宪制审议机关 →</button><details><summary>宪制沿革 · ${c.history.length} 项</summary>${c.history.slice().reverse().map(h=>`<div class="news"><time>${date(h.q)}</time><div><h4>${esc(h.title)}${h.forced?' · 强行颁行':''}</h4><p>${esc(h.description)} ${esc(h.effects)}</p></div></div>`).join('')||'<p>尚无通过的修宪或释宪。</p>'}</details></section>`+archiveBeforeConstitution()};
const assemblyBeforeConstitution=assembly;
assembly=function(){let html=assemblyBeforeConstitution();if(pstate().bill?.kind==='constitution')html=html.replace(/<section class="card"><h3>政府议程<\/h3>[\s\S]*?<\/section>/,constitutionalDocketHTML());return html};
const memberBeforeConstitution=meetMember;
meetMember=function(id){memberBeforeConstitution(id);if(id===0&&constitutionalRoute()==='assembly'&&!s.ended)$('modal').innerHTML+=`<section class="constitution-member"><h3>宪制议程</h3><p>${esc(regime().body)}提出修宪／释宪议案，院内支持率必须超过 50% 才能通过。${regime().body==='枢密院'?'也可付出支持与稳定代价强行颁行。':''}</p><button onclick="constitutionalMenu('interpret')">请求释宪</button> <button onclick="constitutionalMenu('amend')">提出修宪</button></section>`};
const thresholdBeforeConstitution=threshold;
threshold=function(){return pstate().bill?.kind==='constitution'?50:thresholdBeforeConstitution()};
const voteBeforeConstitution=voteBill;
voteBill=function(){if(pstate().bill?.kind==='constitution')return voteConstitution();return voteBeforeConstitution()};
const withdrawBeforeConstitution=withdrawBill;
withdrawBill=function(){if(pstate().bill?.kind==='constitution')return withdrawConstitution();return withdrawBeforeConstitution()};
const budgetBeforeConstitution=proposeBudget;
proposeBudget=function(){if(constitution().docket)return toast('请先完成或撤回当前宪制议案');for(let k in policyMeta)draft[k]=clamp(draft[k],policyMeta[k][1],budgetCap(k));return budgetBeforeConstitution()};
const reformBeforeConstitution=submitReform;
submitReform=function(uid){if(constitution().docket)return toast('请先完成或撤回当前宪制议案');return reformBeforeConstitution(uid)};
// A democratic transition enacts a new constitution rather than inheriting unlimited rule.
const transitionBeforeConstitution=transitionDemocracy;
transitionDemocracy=function(x){
 let c=constitution();if(c){
  if(c.docket)log('宪制议案撤回','民主转型制定新宪法，原待审宪制议案终止。');
  c.docket=null;if(pstate().bill?.kind==='constitution')pstate().bill=null;
  c.judges.forEach(j=>j.boosts=[]);c.termLimit=48;c.economicModel='mixed';c.authority='court';c.rights='equal';
 }
 return transitionBeforeConstitution(x);
};

const queueBeforeConstitution=queueQuarterEvents;
queueQuarterEvents=function(){
 queueBeforeConstitution();let c=constitution(),due=c.risks.filter(x=>x.due<=s.q);c.risks=c.risks.filter(x=>x.due>s.q);
 c.judges.forEach(j=>j.boosts=j.boosts.filter(x=>x.until>=s.q));
 for(let risk of due){
  if(rand()>=risk.chance)continue;
  if(risk.kind==='pressure'){
   let e=eventFrom('追加特别事件：司法施压曝光',`${risk.judgeName}收到的行政施压文件外泄。社会质疑司法机关受到操控，司法独立将下降 10 点。此事件额外出现，不替代本季度三个常规事件。`,[option('承担干预后果','司法独立 −10。',{judicial:-10},{law:-2,authority:1})]);
   e.constitutionalSpecial=true;pushEvent(e);
  }else{
   if(!activeSit('scandal'))sits().cooldowns.scandal=0;let started=startSituation('scandal'),x=started||activeSit('scandal');
   // The judiciary is the source; do not falsely identify an unrelated minister as the judge.
   let e=eventFrom('追加特别事件：司法交易曝光',`${risk.judgeName}的${risk.method==='bribe'?'秘密收款':'政治交换'}被披露。${started?'政治丑闻局势已经开始。':activeSit('scandal')?'现有政治丑闻因司法交易进一步发酵。':'司法交易损害政府公信力，现处于政治丑闻冷却期。'}`,[option('回应调查','公众支持 −3、政治稳定 −2。',{approval:-3,stability:-2},{law:-2})]);
   if(x){x.judicialSource=risk.judgeName;x.theme='司法交易与权力干预案';let responsible=pstate().cabinet.justice?'justice':pstate().cabinet.head?'head':x.slot;if(pstate().cabinet[responsible]){x.slot=responsible;x.candidate=pstate().cabinet[responsible].candidate;x.faction=pstate().candidates[x.candidate].faction}log('政治丑闻：司法交易',risk.judgeName+'的司法交易成为丑闻导火索，政府须承担政治责任。')}
   e.constitutionalSpecial=true;pushEvent(e);
  }
 }
};

const validBeforeConstitution=validSave;
validSave=function(v){
 try{
  let copy=v,bill=v?.political?.bill,c=v?.constitution;
  if(bill?.kind==='constitution')copy={...v,political:{...v.political,bill:null}};
  if(!validBeforeConstitution(copy))return false;
  if(!c)return bill?.kind!=='constitution';
  const finite=(x,min,max)=>Number.isFinite(x)&&x>=min&&x<=max;
  if(c.version!==1||!['court','assembly'].includes(c.authority)||![0,48,72].includes(c.termLimit)||!['mixed','socialist'].includes(c.economicModel)||!['equal','traditional'].includes(c.rights))return false;
  if(!Array.isArray(c.judges)||c.judges.length<5||c.judges.length>10||(v.judicialStaff?c.judges.filter(j=>!j.vacant&&j.chief===true).length!==(v.judicialStaff.chiefPending?0:1):c.judges.filter(j=>j.chief===true).length!==1||c.judges.filter(j=>j.trait<2).length*2>=c.judges.length))return false;
  if(c.judges.some((j,i)=>j.id!==i||!Number.isInteger(j.trait)||!JUDICIAL_VIEWS[j.trait]||typeof j.name!=='string'||j.name.length>50||typeof j.chief!=='boolean'||!finite(j.relation,0,100)||!Array.isArray(j.boosts)||j.boosts.some(b=>!Number.isInteger(b.docketId)||!finite(b.amount,0,100)||!Number.isInteger(b.until))))return false;
  if(new Set(c.judges.map(j=>j.name)).size!==c.judges.length)return false;
  if(!c.budgetCaps||CONSTITUTION_BUDGETS.some(k=>!Number.isInteger(c.budgetCaps[k])||!finite(c.budgetCaps[k],policyMeta[k][2],100)))return false;
  if(!c.reformDiscounts||Object.entries(c.reformDiscounts).some(([k,x])=>!/^\d+$/.test(k)||![.25,.5].includes(x)))return false;
  if(!Number.isInteger(c.nextDocket)||c.nextDocket<1||!Array.isArray(c.history)||!Array.isArray(c.risks))return false;
  if(c.history.some(h=>!Number.isInteger(h.q)||typeof h.title!=='string'||typeof h.description!=='string'||typeof h.effects!=='string'||!finite(h.rate,0,100)||!['court','assembly'].includes(h.route)||typeof h.forced!=='boolean'))return false;
  if(c.risks.some(x=>!Number.isInteger(x.due)||x.due<0||!['pressure','scandal'].includes(x.kind)||!['bribe','exchange','pressure'].includes(x.method)||![.02,.03].includes(x.chance)||typeof x.judgeName!=='string'))return false;
  let d=c.docket;
  if(d){
   if(d.kind!=='constitution'||!Number.isInteger(d.id)||d.id<1||d.id>=c.nextDocket||!Number.isInteger(d.created)||!['court','assembly'].includes(d.route)||!['interpret','amend'].includes(d.mode)||!['neutral','social','liberal','authority','traditional'].includes(d.stance)||typeof d.title!=='string'||typeof d.description!=='string'||typeof d.target!=='string')return false;
   let validTarget=d.mode==='interpret'?(d.action==='budget'&&CONSTITUTION_BUDGETS.includes(d.target))||(d.action==='relations'&&/^\d$/.test(d.target)&&!!v.political.factions[+d.target])||(d.action==='reform'&&/^\d+$/.test(d.target)&&v.governance.offers.some(o=>o.uid===+d.target&&o.catalog===d.catalog)&&!v.reforms.some(r=>r.id===d.catalog)):(d.action==='court'&&['court','assembly'].includes(d.target))||(d.action==='term'&&['0','48','72'].includes(d.target))||(d.action==='economy'&&['mixed','socialist'].includes(d.target))||(d.action==='rights'&&['equal','traditional'].includes(d.target));
   if(!validTarget&&!(d.mode==='amend'&&typeof validExtraAmendmentTarget107==='function'&&validExtraAmendmentTarget107(d)))return false;
   if(d.route==='assembly'&&(!bill||bill.kind!=='constitution'||JSON.stringify(bill)!==JSON.stringify(d)))return false;
   if(d.route==='court'&&bill)return false;
  }else if(bill?.kind==='constitution')return false;
  return true;
 }catch(_){return false}
};

function constitutionGuideEntries(){
 const entry=(id,title,aliases,text)=>({id,title,aliases:[title,...aliases],text,category:'宪法与司法'});
 return [
  entry('constitution','宪法',['重要宪法条目内容','宪法条目','根本法'],'国家档案中的根本规则，记载政体、任期限制、经济模式、最高司法机关、公民权利和预算上限。修宪可以改变已开放的条款；当前政体为档案记录，不在此菜单中更换。'),
  entry('judges','法官席位',['法官','大法官','首席大法官',...Object.values(JUDGE_TITLES).flat()],'每局随机 5—10 席，其中一位首席，每人一票。社会进步与政治自由两类合计少于半数。扇形座位颜色显示倾向，星号表示首席。'),
  entry('constitutional-docket','修宪与释宪',['修宪','释宪','宪制议案','请求释宪','提出修宪'],'与首席法官互动提出议案；若最高司法权移交权力机关，则与议长／主席互动。枢密院国家由主席处理。提出和表决各花 1 行动点；支持必须超过 50%。未通过时议案保留；同一时间只审一项议程。修宪基础意愿比释宪低 20 点。'),
  entry('judge-interaction','法官互动',['贿赂','政治交换','司法压力','公开法律论证','法官支持率','法官意愿'],'每位法官每季可互动一次。意愿达到 60 则投赞成票；游说加成仅对当前议案有效，至操作季度加 3 季度后失效。公开论证无风险；贿赂／政治交换下一季分别有 3%／2% 概率触发政治丑闻；施压下一季有 3% 概率追加司法独立 −10 的特殊事件，不占三个常规事件名额。'),
  entry('constitutional-budget','预算上限',['公共预算上限','国家对劳动者的义务'],'释宪可使选定公共预算的上限增加 1 个百分点，最高为 100%。不会自动增加实际预算；仍需在财政页面提出预算案。释宪通过时支持 −1、稳定 −2。'),
  entry('constitutional-reform','改革成本减免',['释宪减免','公共利益解释'],'仅能选择当前改革窗口中尚未启动的草案。释宪会保留草案，每次减少原价的 25%，累计最多 50%。实际减免在改革正式表决通过并启动时兑现。已启动或完成的改革不能补领减免。'),
  entry('constitutional-transfer','最高司法权移交',['最高司法机关条款','司法权移交'],'修宪把最高司法机关改为议会／最高人民会议／枢密院时，司法独立 −20、稳定 −10、支持 +10；后续修宪和释宪改由该机关表决。也可修宪恢复法院权威。'),
  entry('constitutional-force','强行颁行',['强行修宪','强行释宪'],'仅枢密院政体可用。无需过半数，但额外花费 1 行动点：释宪支持 −8、稳定 −8；修宪支持 −12、稳定 −10。仍兑现议案本身的效果，并影响任期评估。'),
  ...JUDICIAL_VIEWS.map((v,i)=>entry('judge-view-'+i,v.name,[],v.text))
 ];
}
