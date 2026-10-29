/* 1.0.8 — collective federal government, citizen referendums and constitutional change. */
const FEDERAL_LOYALTY108=70,FEDERAL_INITIATIVE_CHANCE108=.35;
function isFederal108(){return s?.political?.regime==='federal'}
function federalCanDirect108(k){const item=pstate().cabinet[k];return !!item&&pstate().candidates[item.candidate].loyalty>=FEDERAL_LOYALTY108}
function federalAmendmentText108(){return '联邦修宪由国民院议长受理后直接送审，不需三分之二院内支持。三季度内，最高司法机关赞成达到半数（计入首席关键一票），且当前地区加权支持率超过50%，两项同时满足才会生效。释宪规则不变。'}
function initializeFederal108(){
 if(!isFederal108()||s.federal108)return;
 if(!creatingWorld)try{localStorage.setItem(KEY+'-pre-108-federal',JSON.stringify(s))}catch(_){}
 const p=pstate();s.federal108={version:1,lastAutoQ:s.q,lastTrustQ:s.q,lowSupportStreak:0,nextInitiativeQ:s.q,autoReports:[],retiredDeputy:null};
 if(p.cabinet.deputy){s.federal108.retiredDeputy={office:{...p.cabinet.deputy},proposal:rules103().proposals.deputy?JSON.parse(JSON.stringify(rules103().proposals.deputy)):null};}
 delete p.cabinet.deputy; // Preserve completed proposal benefits in the historical department record.
 if(!rules103().proposals.deputy?.completed)delete rules103().proposals.deputy;
 if(cabinetSlot==='deputy'||cabinetSlot==='head')cabinetSlot='foreign';
 const crisis=activeSit('government');if(crisis)endSituation(crisis,'联邦委员会恢复集体施政，以公民信任程序处理执政授权。');
 rules103().coalition=[playerFactionId107()];
 const d=amendmentInProgress107();if(d){
  d.procedure='federal108';d.legislativeRate=null;
  if(d.stage==='legislature'){d.stage='review';d.reviewStarted=s.q;d.reviewDeadline=s.q+3;d.route=constitution().authority==='assembly'?'assembly':'court';}
  p.bill=d.route==='assembly'?d:null;
 }
 if(!creatingWorld)addNotice107('federal-108','联邦施政安排','联邦总理协调各委员共同施政，副主席职位撤销。既有季度、项目成果和经济记录保留；委员忠诚达到70后接受总理协助。','cabinet');
}
const initBeforeFederal108=initPolitics;
initPolitics=function(...args){initBeforeFederal108(...args);initializeFederal108()};
const coalitionBeforeFederal108=coalitionRegime;
coalitionRegime=function(){return !isFederal108()&&coalitionBeforeFederal108()};
const eligibleBeforeFederal108=cabinetEligible;
cabinetEligible=function(c){return isFederal108()?!!c&&!c.judicialCareer:eligibleBeforeFederal108(c)};
const proposalQuarterBeforeFederal108=programmeQuarter103;
programmeQuarter103=function(){if(isFederal108()){rules103().lastProposalQ=s.q;return}proposalQuarterBeforeFederal108()};
const taskBeforeFederal108=setTask;
setTask=function(k,value){if(isFederal108()&&!federalCanDirect108(k))return toast('委员忠诚达到70后才会接受本季任务协调');return taskBeforeFederal108(k,value)};
const dismissPreviewBeforeFederal108=dismissPreview,dismissBeforeFederal108=dismissOfficial,replaceBeforeFederal108=replacementDialog,appointPreviewBeforeFederal108=appointPreview,appointBeforeFederal108=appointOfficial;
function federalRemovalBlocked108(k){return isFederal108()&&!!pstate().cabinet[k]}
dismissPreview=function(k){if(isFederal108())return toast('联邦总理无权要求委员辞职');return dismissPreviewBeforeFederal108(k)};
dismissOfficial=function(k){if(isFederal108())return toast('联邦总理无权要求委员辞职');return dismissBeforeFederal108(k)};
replacementDialog=function(k){if(federalRemovalBlocked108(k))return toast('在任委员不能被总理撤换');return replaceBeforeFederal108(k)};
appointPreview=function(k,id){if(federalRemovalBlocked108(k))return toast('在任委员不能被总理撤换');return appointPreviewBeforeFederal108(k,id)};
appointOfficial=function(k,id){if(federalRemovalBlocked108(k))return toast('在任委员不能被总理撤换');return appointBeforeFederal108(k,id)};
function meetCommissioner108(k){
 if(!isFederal108()||!cabinetSlots103().includes(k)||!pstate().cabinet[k]||s.ended)return;
 const c=pstate().candidates[pstate().cabinet[k].candidate];
 modal(`<span class="tag">联邦委员会 · 施政协商</span><h2>${esc(office(k))} ${esc(c.name)}</h2><p>${TRAITS[c.trait].name} · ${TRAITS[c.trait].desc}</p><p>忠诚 ${fmt(c.loyalty,1)}；达到70后解锁协助推进提案与调整本季任务。每位委员每季协商一次，消耗1行动点。</p><div class="choices"><button onclick="commissionerTalk108('${k}','consult')">协调施政分歧<small>忠诚＋6；不追加财政支出。</small></button><button onclick="commissionerTalk108('${k}','resources')">落实部门协作资源<small>忠诚＋10；支出0.15% GDP。</small></button></div><button onclick="$('modal').close()">结束会见</button>`);
}
function commissionerTalk108(k,kind){
 if(!isFederal108()||!cabinetSlots103().includes(k)||!['consult','resources'].includes(kind)||!pstate().cabinet[k]||!spendAction('commissioner:'+k))return;
 const c=pstate().candidates[pstate().cabinet[k].candidate];c.loyalty=clamp(c.loyalty+(kind==='consult'?6:10),0,100);if(kind==='resources')mod({cost:.15});
 noteDecision('与'+office(k)+'协调施政',{law:1,authority:-1},[],null,1,null,{kind:'interaction'});log('委员协商',c.name+'的忠诚提升至 '+fmt(c.loyalty,1)+'。');$('modal').close();pSave();
}
const programmePanelBeforeFederal108=programmePanel;
programmePanel=function(k){
 let html=programmePanelBeforeFederal108(k);if(!isFederal108())return html;
 html=html.replace('未完成期间，现任主管每季度忠诚 −0.5。每项措施每季度一次，各消耗 1 行动点。','未完成提案不造成季度忠诚衰减。每季度随机一位委员自主执行一项措施，财政成本与结果照常结算，不消耗总理行动点。').replace('提案已完成，停止每季忠诚损失。','提案已完成，成果持续保留。');
 if(!federalCanDirect108(k))html=html.replace(/<button onclick="advanceProgramme\(/g,'<button disabled aria-disabled="true" onclick="advanceProgramme(');
 return html.replace('<div class="choices">',`<p class="federal-lock">${federalCanDirect108(k)?'委员接受协调：可协助推进措施，每项每季一次，消耗1行动点。':'协作尚未解锁：忠诚达到70后，可协助推进下方措施。'}</p><div class="choices">`);
};
const officialBeforeFederal108=officialPanel;
officialPanel=function(k){
 let html=officialBeforeFederal108(k);if(!isFederal108())return html;
 html=html.replace(/<button[^>]*onclick="(?:dismissPreview|replacementDialog)\([^>]*>[\s\S]*?<\/button>/g,'');
 if(!federalCanDirect108(k))html=html.replace('<select id="task"','<select disabled aria-disabled="true" id="task"');
 html=html.replace('指令不消耗行动点；官员按自身倾向选择具体手段。任命司法主管或政府首脑也会立即影响司法独立。','委员按自身倾向自主施政；忠诚达到70后，才接受总理调整本季任务方向。总理无权要求在任委员辞职。');
 if(pstate().cabinet[k])html=html.replace('<section class="minister-programme">',`<button class="primary" data-commissioner-talk onclick="meetCommissioner108('${k}')" ${s.ended||pstate().ap<1||pstate().lastAction['commissioner:'+k]===s.q?'disabled':''}>与委员协商</button><section class="minister-programme">`);
 return html;
};
const cabinetBeforeFederal108=cabinet;
cabinet=function(){
 let html=cabinetBeforeFederal108();if(!isFederal108())return html;
 html=html.replace('由联邦总理直接领导内阁','联邦总理与各委员共同施政').replace('你直接分配各部门任务；部长会按照能力、倾向和忠诚度自主执行。','你是名义领袖，负责协调独立履职的委员。').replace('所有派系的人物均可任命，不设联合政府邀请。','委员候补涵盖各党派，仅可填补空缺，不得撤换在任委员。').replace('未完成的部门提案使主管官员每季忠诚 −0.5；更换官员保留部门进度，完成奖励只发放一次。','委员提案无季度忠诚衰减；每季随机推进一项未完成提案，忠诚达到70后可接受总理协助。');
 if(pstate().cabinet[cabinetSlot])html=html.replace(/<div class="section-label"><h3>候选人名册<\/h3>[\s\S]*?(?=<\/section><\/div><div class="card")/,'');
 return html;
};
function federalProgrammeQuarter108(){
 if(!isFederal108()||s.ended)return;const state=s.federal108;if(!state||state.lastAutoQ>=s.q)return;state.lastAutoQ=s.q;
 const choices=cabinetSlots103().flatMap(k=>{const pr=rules103().proposals[k];return pstate().cabinet[k]&&pr&&!pr.completed?[{k,options:programmeDefinition107(k).options.map((_,i)=>i).filter(i=>pstate().lastAction['programme:'+k+':'+i]!==s.q)}]:[]}).filter(x=>x.options.length);
 if(!choices.length)return;
 const choice=pick(choices),index=pick(choice.options),outcome=executeProgramme107(choice.k,index,true);if(!outcome)return;
 const c=pstate().candidates[pstate().cabinet[choice.k].candidate],report={q:s.q,title:office(choice.k)+'自主推进提案',text:`${c.name}选择“${outcome.option}”，支出 ${fmt(outcome.cost,3)}% GDP，推进 ${fmt(outcome.progress,1)} 个百分点${outcome.completed?'，提案完成':''}。`,slot:choice.k,index};
 state.autoReports.unshift(report);state.autoReports=state.autoReports.slice(0,48);pstate().reports.unshift(report);log(report.title,report.text);
}

// Ordinary law: a strict parliamentary majority plus at least 50% nationwide approval.
const thresholdBeforeFederal108=threshold;
threshold=function(){return isFederal108()&&!amendmentInProgress107()?50:thresholdBeforeFederal108()};
const voteBillBeforeFederal108=voteBill;
voteBill=function(){
 const p=pstate(),b=p.bill;if(!isFederal108()||!b||b.kind==='constitution')return voteBillBeforeFederal108();
 if(!['budget','reform','federal-confidence'].includes(b.kind)||s.ended)return;
 if(b.kind==='federal-confidence')return voteFederalConfidence108();
 const rate=billPassRate104();
 if(rate<=50){if(!spendAction('vote'))return;mod({approval:-2,stability:-1});p.confidenceLoss++;log('议程受阻',b.title+'院内支持率 '+fmt(rate,2)+'%，必须超过50%。');toast('尚未取得国民院过半支持，提案保留');pSave();return}
 if(s.approval<50){
  if(!spendAction('vote'))return;
  const text=`${b.title}虽获国民院 ${fmt(rate,2)}% 支持，但全国支持率仅为 ${fmt(s.approval,1)}%，未达到50%。公民复决否决法案，原预算与改革状态保持不变；草案保留，可在争取民意后重新表决。`;
  log('公民复决公投否决新法案',text);pushEvent(eventFrom('公民复决公投否决新法案',text,[option('接受复决结果','草案保留，继续争取公民支持。')],'federal-referendum'));pSave();showPoliticalEvent();return;
 }
 return voteBillBeforeFederal108();
};
const assemblyBeforeFederal108=assembly;
assembly=function(){
 let html=assemblyBeforeFederal108();if(!isFederal108())return html;
 html=html.replace('所需院内支持率 50%；按各党席位加权计算支持比例，达到门槛即可通过。',`院内支持率须超过50%，全国支持率须达到50%。当前全国支持率 ${fmt(s.approval,1)}%。两项均满足，预算或改革才会生效。`);
 const b=pstate().bill;if(b?.kind==='federal-confidence')html=html.replace(/<section class="card"><h3>政府议程<\/h3>[\s\S]*?<\/section>/,`<section class="card" id="federal-confidence-bill"><span class="tag">公民信任程序</span><h2>政府信任案</h2><div class="big-number">${fmt(billPassRate104(),2)}<small>% 院内支持率</small></div><p>院内支持率超过50%即可通过，全国支持率＋5个百分点；本次危机仅可求助一次。未通过时可在期限内继续协商并再次表决。</p><button class="primary" onclick="voteBill()" ${s.ended?'disabled':''}>提交表决 · 1 行动点</button> <button onclick="withdrawBill()">撤回</button></section>`);
 return `<section class="card"><h3>公民与国民院共同授权</h3><p>预算、结构性改革：院内支持率超过50%，且全国支持率达到50%。</p><details><summary>查看联邦施政细则</summary><p>${federalAmendmentText108()}</p><p>全国支持率连续两季低于30%后，每个仍低于30%的季度有35%概率触发公民倡议公投；公众信任危机须在四季度内恢复至40%。</p></details></section>`+html;
};

SIT_NAMES['public-trust']='公众信任危机';
SIT_INFO['public-trust']=['公民倡议要求解散联邦委员会，政府须重新争取全国信任。','四季度内全国支持率达到40%；到期仍不足40%则结束执政','无额外固定季度损耗；其他经济、政治与局势影响照常结算'];
const startBeforeFederal108=startSituation;
startSituation=function(kind,opening=false){
 if(kind==='public-trust'&&!isFederal108())return null;
 const x=startBeforeFederal108(kind,opening);if(x&&kind==='public-trust')Object.assign(x,{opening:false,deadline:s.q+4,appealUsed:false});return x;
};
const endSituationBeforeFederal108=endSituation;
endSituation=function(x,reason){if(x.kind==='public-trust'&&sits().active.includes(x)){if(pstate().bill?.kind==='federal-confidence'&&pstate().bill.crisisId===x.id)pstate().bill=null;if(s.federal108){s.federal108.lowSupportStreak=0;s.federal108.nextInitiativeQ=s.q+4}}return endSituationBeforeFederal108(x,reason)};
function startFederalTrust108(){
 if(!isFederal108()||s.ended||activeSit('public-trust'))return null;
 const x=startSituation('public-trust',true);if(!x)return null;
 Object.assign(x,{opening:false,deadline:s.q+4,appealUsed:false});
 notice('公民倡议公投解散委员会',`全国支持率连续两季度低于30%，公民倡议已经启动。公众信任危机持续四季度：须在第 ${x.deadline} 季度开始时核验前将全国支持率恢复至40%。可在局势页一次性求助国民院，政府信任案获过半支持后增加5个百分点全国支持率。`,{federalSpecial:true});return x;
}
function finishFederalTrust108(x,success,reason){
 if(pstate().bill?.kind==='federal-confidence'&&pstate().bill.crisisId===x.id)pstate().bill=null;
 s.federal108.lowSupportStreak=0;s.federal108.nextInitiativeQ=s.q+4;endSituation(x,reason);
 if(!success)setGameEnd107('公民倡议公投解散委员会：四季度内未将全国支持率恢复至40%。');
}
function checkFederalTrust108(deadline=false){
 if(!isFederal108()||s.ended)return;const x=activeSit('public-trust');if(!x)return;
 if(s.approval>=40)finishFederalTrust108(x,true,'全国支持率恢复至 '+fmt(s.approval,1)+'%，公众信任危机解除。');
 else if(deadline&&s.q>=x.deadline)finishFederalTrust108(x,false,'四季度期限已到，全国支持率仍低于40%，公民复决解散委员会。'+(s.adminMode?'管理员模式继续运行。':''));
}
function federalTrustQuarter108(){
 if(!isFederal108()||s.ended)return;const state=s.federal108;if(!state||state.lastTrustQ>=s.q)return;state.lastTrustQ=s.q;
 const hadCrisis=!!activeSit('public-trust');checkFederalTrust108(true);if(hadCrisis||s.ended)return;
 state.lowSupportStreak=s.approval<30?state.lowSupportStreak+1:0;
 if(state.lowSupportStreak>=2&&s.q>=state.nextInitiativeQ&&rand()<FEDERAL_INITIATIVE_CHANCE108)startFederalTrust108();
}
const actionsBeforeFederal108=situationActions;
situationActions=function(x){if(isFederal108()&&x.kind==='scandal')return actionsBeforeFederal108(x).filter(a=>a.key!=='dismiss');return x.kind==='public-trust'?[{key:'appeal',label:'求助国民院',detail:'本次危机限一次，消耗1行动点。提交政府信任案，院内支持率超过50%后，全国支持率＋5个百分点。需先处理其他待审议案。',once:true}]:actionsBeforeFederal108(x)};
const situationActBeforeFederal108=situationAct;
situationAct=function(id,key){
 const x=activeSit('public-trust');if(!x||x.id!==id)return situationActBeforeFederal108(id,key);
 if(!isFederal108()||s.ended||key!=='appeal'||x.appealUsed)return;
 if(pstate().bill||constitution().docket)return toast('请先完成或撤回当前议案，再提交政府信任案');
 if(!spendAction('federal-appeal:'+id))return;
 x.appealUsed=true;x.used.appeal=true;x.actions.push({q:s.q,key,label:'求助国民院'});
 pstate().bill={kind:'federal-confidence',title:'政府信任案',description:'请求国民院公开确认委员会的施政授权。',crisisId:id};
 log('政府信任案提交','国民院将审议政府信任案，取得过半支持后全国支持率＋5个百分点。');tab='assembly';pSave();
};
function voteFederalConfidence108(){
 const b=pstate().bill,x=activeSit('public-trust');if(!isFederal108()||b?.kind!=='federal-confidence'||!x||x.id!==b.crisisId||!spendAction('federal-confidence-vote'))return;
 const rate=billPassRate104();if(rate>50){pstate().bill=null;mod({approval:5});pstate().passed.push({title:'政府信任案',q:s.q,votes:rate,passRate:rate});log('政府信任案通过','院内支持率 '+fmt(rate,2)+'%，全国支持率＋5个百分点。');checkFederalTrust108();}
 else{log('政府信任案暂未通过','院内支持率 '+fmt(rate,2)+'%，须超过50%；议案保留。');toast('继续协商争取过半院内支持');}
 pSave();
}
const situationProgressBeforeFederal108=situationProgress;
situationProgress=function(x){
 if(x.kind==='public-trust')return `全国支持率 ${fmt(s.approval,1)}% / 目标40%。<br>剩余 ${Math.max(0,x.deadline-s.q)} 季度，第 ${x.deadline} 季度开始时核验。<br>${x.appealUsed?'已经求助国民院，不能再次求助。':'可一次性求助国民院。'}`;
 if(x.kind==='amendment'&&amendmentInProgress107()?.procedure==='federal108')return federalAmendmentProgress108();
 return situationProgressBeforeFederal108(x);
};
const maintenanceBeforeFederal108=politicalMaintenance;
politicalMaintenance=function(){maintenanceBeforeFederal108();federalProgrammeQuarter108();federalTrustQuarter108()};
const saveBeforeFederal108=save;
save=function(){if(s?.federal108)checkFederalTrust108();return saveBeforeFederal108()};

const situationsBeforeFederal108=situationsPage;
situationsPage=function(){let html=situationsBeforeFederal108();if(isFederal108())html=html.replace(SIT_INFO.amendment[0],federalAmendmentText108()).replace(SIT_INFO.amendment[1],'司法赞成达到半数，且加权支持率超过50%；三季度内同时满足');return html};

function federalGuide108(entries){
 const add=(id,title,aliases,text)=>entries.push({id,title,aliases:[title,...aliases],text,category:'联邦委员会制'});
 add('public-trust','公众信任危机',['公民倡议','解散委员会','政府信任案','求助国民院'],'仅联邦委员会制：全国支持率连续两季度低于30%后，每个仍低于30%的季度有35%概率触发。四季度内恢复至40%即解除，到期仍不足则游戏结束；本局势不额外扣指标。可以一次性求助国民院（1行动点），再表决政府信任案（1行动点）；院内支持率超过50%则全国支持率增加5个百分点。失败可继续协商，成功不能重复领取，撤回后也不能再次求助。管理员模式保留后果但不结束游戏。');
 add('federal-referendum','公民复决',['公民复决公投','公民复决公投否决新法案'],'仅联邦委员会制：预算、结构性改革须同时取得严格超过50%的院内支持率和达到50%的全国支持率。院内通过而全国支持不足时，公投否决；预算与改革不生效、不支付改革成本，已消耗的表决行动点不退，草案保留。政府信任案与释宪不受此民意门槛限制。');
 add('centralize-amendment','政府集权化',[],'联邦委员会制专属修宪案。司法审查达到半数、公民加权支持率超过50%后转为半总统制；没有三分之二院内门槛。保留季度、经济、人物和项目成果，新增总理与副总理职位，失去新组阁资格者按原有离任规则离任。');
 add('commissioner-cooperation','委员协作',['与委员协商','联邦委员','委员忠诚','委员提案'],'联邦总理无权要求在任委员辞职。未完成的委员提案没有季度忠诚衰减，每季随机一名委员自主执行一项未完成提案选项，成本、进度、收益和风险照常结算，不消耗总理行动点，也不计为玩家主动意识形态决策。忠诚达到70后解锁手动推进与调整任务方向。每位委员每季协商一次：普通协调忠诚＋6；投入0.15% GDP协作资源忠诚＋10；各耗1行动点。');
 if(!isFederal108())return;
 const descriptions={
  'pass-rate':'院内支持率按各党派席位与议程倾向加权。联邦预算、结构性改革须严格超过50%，且全国支持率达到50%；政府信任案只要求院内超过50%。释宪规则不变。'+federalAmendmentText108(),
  cabinet:'你担任名义领袖联邦总理并兼管财政，各委员集体施政；不设副主席，不得撤换在任委员。只可补缺任命；忠诚达到70后可协调任务与协助提案。',
  loyalty:'委员的合作意愿。未完成提案不会逐季扣忠诚；事件仍可能改变忠诚。达到70时解锁手动提案选项与任务方向；低于70重新锁定。协商与推进提案可提高忠诚。',
  coalition:'联邦实行委员共治，各党派的合资格人员都可以补缺；不使用联合政府邀请或政治盟友辞职机制。',
  task:'委员自主决定本部门方向；忠诚达到70后，总理可协调任务方向（无行动点消耗）。任务执行结果仍受能力、倾向和忠诚影响。',
  programme:'委员按倾向与政体提出持续议程。每季随机一名委员自主选择一项措施，不消耗玩家行动点，财政成本与后果照常结算。忠诚达到70后才可手动协助，每项每季一次、1行动点。未完成不会逐季扣忠诚。',
  dismiss:'联邦总理无权要求在任委员辞职；某些事件仍可能导致委员自行离任。',
  replace:'联邦总理不得撤换在任委员。职位因事件出现空缺时，才可从合资格候选人中补缺。',
  appoint:'只可补缺任命，不能借任命撤换在任委员；候选人可来自各党派，但不得兼任司法或其他政府职位。消耗1行动点。',
  'constitutional-docket':federalAmendmentText108(),constitution:'国家档案记载现行政体、任期、经济模式、司法机关等根本条款。'+federalAmendmentText108(),
  'constitutional-transfer':'移交最高司法权仍须依联邦修宪程序，生效时司法独立−20、稳定−10、支持＋10。移交后由国民院承担司法审查，半数审查门槛与加权支持率条件保留。',
  'pluralism-amendment':'长期少数群体问题仍存在且未选强制措施时，加权支持达到80%、稳定达到60可提出社会多元修正案。联邦制直接进入司法审查，三季度内司法赞成达到半数且加权支持超过50%才生效，成功后解决长期问题。'
 };
 for(let i=entries.length-1;i>=0;i--){const e=entries[i];if(e.id==='office-deputy'||e.id.startsWith('programme-deputy')){entries.splice(i,1);continue}if(descriptions[e.id])e.text=descriptions[e.id];
  if(e.id.startsWith('office-')&&e.id!=='office-head')e.text=e.text.replace('可以任命、安排任务、推进部门提案或要求辞职','只能补缺任命；忠诚达到70后可协调任务、协助提案，不能要求辞职');
  e.text=e.text.replace(/未完成每季度主管忠诚−0.5|未完成每季忠诚−0.5/g,'未完成不会造成季度忠诚衰减');
 }
}

// Amendments begin directly in review; public weighted support is checked at enactment.
const extraTargetBeforeFederal108=validExtraAmendmentTarget107;
validExtraAmendmentTarget107=function(d){return d.action==='centralize'&&d.target==='semi'&&d.sourceRegime==='federal'||extraTargetBeforeFederal108(d)};
const specBeforeFederal108=constitutionalSpec;
constitutionalSpec=function(mode,action,target){
 if(mode==='amend'&&action==='centralize'&&target==='semi'&&isFederal108())return {mode,action,target,stance:'authority',title:'政府集权化',description:'以总统与总理分工的半总统制替代委员共治。生效后玩家成为总统，新增总理和副总理职位；人物、预算、季度和已完成成果保留，现任委员按新组阁规则转任或离任。',values:{},axes:{authority:5,law:-2,elite:2},costText:'通过后转为半总统制；失去入阁资格者按原有离任规则计入后果。'};
 return specBeforeFederal108(mode,action,target);
};
const choicesBeforeFederal108=constitutionalChoices;
constitutionalChoices=function(mode){const choices=choicesBeforeFederal108(mode);if(isFederal108()&&mode==='amend')choices.push(constitutionalSpec(mode,'centralize','semi'));return choices};
const menuBeforeFederal108=constitutionalMenu;
constitutionalMenu=function(mode='interpret'){menuBeforeFederal108(mode);if(isFederal108()&&mode==='amend')$('modal').innerHTML=$('modal').innerHTML.replace(/所有修宪均从这里发起：[\s\S]*?修宪不能强行颁行。/,`提出消耗1行动点，进入宪法修订局势。${federalAmendmentText108()}`)};
const memberBeforeFederal108=meetMember;
meetMember=function(id){memberBeforeFederal108(id);if(isFederal108()&&id===0)$('modal').innerHTML=$('modal').innerHTML.replace(/所有修宪均由[\s\S]*?不能强行修宪。/,federalAmendmentText108())};
const proposeBeforeFederal108=proposeConstitution;
proposeConstitution=function(mode,action,target){
 if(!isFederal108()||mode!=='amend')return proposeBeforeFederal108(mode,action,target);
 const c=constitution(),spec=constitutionalSpec(mode,action,target);if(s.ended||!spec)return toast('此修宪选项尚未开放或已失效');
 if(c.docket||pstate().bill)return toast('请先完成或撤回当前议案');if(!spendAction())return;
 const d={...spec,id:c.nextDocket++,kind:'constitution',procedure:'federal108',stage:'review',route:c.authority==='assembly'?'assembly':'court',created:s.q,sourceRegime:'federal',reviewStarted:s.q,reviewDeadline:s.q+3,legislativeRate:null};
 if(action==='pluralism')d.admission={weighted:electionForecast().total,stability:s.stability};
 c.docket=d;pstate().bill=d.route==='assembly'?d:null;const x=startSituation('amendment');d.situationId=x.id;
 noteDecision('提出'+d.title,{law:1},[],null,1,null,{kind:'procedure'});log('联邦修宪送审',d.title+'直接进入司法审查，另须公民加权支持率超过50%。');$('modal').close();tab=d.route==='court'?'judiciary':'assembly';pSave();
};
const reviewBeforeFederal108=checkAmendmentReview107;
checkAmendmentReview107=function(){
 const d=amendmentInProgress107();if(d?.procedure!=='federal108')return reviewBeforeFederal108();
 if(checkingAmendment107||s.ended)return;checkingAmendment107=true;
 try{
  const judicial=d.route==='court'?courtTally107(d).total>0&&courtTally107(d).rate>=50:reviewRate107(d)>=50,weighted=electionForecast().total;
  if(judicial&&weighted>50)finishAmendment107(true,'最高司法机关通过审查，公民加权支持率 '+fmt(weighted,2)+'% 超过50%，联邦修宪成功。');
  else if(s.q>=d.reviewDeadline)finishAmendment107(false,'三季度期限已到，'+(!judicial?'最高司法机关赞成未达到半数':'公民加权支持率未超过50%')+'，修宪失败。');
 }finally{checkingAmendment107=false}
};
function federalAmendmentProgress108(){const d=amendmentInProgress107();if(!d)return '';return `最高司法机关支持率 ${fmt(reviewRate107(d),2)}% / 需要达到50%；公民加权支持率 ${fmt(electionForecast().total,2)}% / 需要超过50%。<br>剩余 ${Math.max(0,d.reviewDeadline-s.q)} 季度；第 ${d.reviewDeadline} 季度开始时核验。两项须同时满足；全国支持率不能替代地区加权支持率。`}
const docketBeforeFederal108=constitutionalDocketHTML;
constitutionalDocketHTML=function(){
 const d=amendmentInProgress107();if(d?.procedure==='federal108')return `<section id="constitutional-docket" class="card constitution-docket"><span class="tag">联邦宪法修订 · 司法与公民复决</span><h2>${esc(d.title)}</h2><p>${esc(d.description)}</p><p>${esc(d.costText)}</p><div class="note">${federalAmendmentProgress108()}</div><p>${d.route==='court'?courtBallotText107(d):'最高司法权现由国民院行使；审查须达到半数，不需三分之二。'}</p><p>本局势没有处置选项，送审后不能撤回；满足两项门槛即自动生效。</p><button onclick="changeTab('${d.route==='court'?'judiciary':'assembly'}');$('modal').close()">前往审查机关</button></section>`;
 let html=docketBeforeFederal108();if(isFederal108())html=html.replace('先立法审议、再司法审查。','直接进行司法审查，并核验公民加权支持。');return html;
};
const amendmentHTMLBeforeFederal108=amendmentDocketHTML107;
amendmentDocketHTML107=function(){return amendmentInProgress107()?.procedure==='federal108'?constitutionalDocketHTML():amendmentHTMLBeforeFederal108()};
function enactFederalCentralization108(){
 const p=pstate(),stem=countryStem();p.regime='semi';s.name=stem+regime().suffix;constitution().competitiveClause=true;
 p.members.forEach((m,i)=>m.role=i<4?memberRole(i):p.factions[m.faction].name+'党团总召');
 rules103().coalition=[playerFactionId107()];p.cabinet.head=null;p.cabinet.deputy=null;
 for(const slot of ['head','deputy'])if(!rules103().proposals[slot])rules103().proposals[slot]={progress:0,completed:false,spent:0,actions:[]};
 for(const [k,item]of Object.entries(p.cabinet))if(item&&!cabinetEligible(p.candidates[item.candidate]))removeOfficial(k);
 initializeProgrammes107();cabinetSlot='head';
 const crisis=activeSit('public-trust');if(crisis)finishFederalTrust108(crisis,true,'半总统制宪法生效，联邦委员会及其解散程序终止。');
 sits().transition={q:s.q,from:'federal',to:'semi',constitutional:true};log('政府集权化完成','半总统制正式生效，玩家改任总统；请任命总理与副总理。既有季度、宪法任期和经济历史保留。');
}

const validBeforeFederal108=validSave;
validSave=function(v){
 const b=v?.political?.bill,trust=b?.kind==='federal-confidence',copy=trust?{...v,political:{...v.political,bill:null}}:v;
 if(!validBeforeFederal108(copy))return false;
 const state=v.federal108,crises=v.situations?.active.filter(x=>x.kind==='public-trust')||[];
 if(!state)return !trust&&!crises.length;
 if(state.version!==1||!['lastAutoQ','lastTrustQ','lowSupportStreak','nextInitiativeQ'].every(k=>Number.isInteger(state[k])&&state[k]>=0)||state.lastAutoQ>v.q||state.lastTrustQ>v.q||!Array.isArray(state.autoReports)||state.autoReports.some(r=>!Number.isInteger(r.q)||r.q>v.q||typeof r.title!=='string'||typeof r.text!=='string'||!PORTFOLIOS.some(p=>p[0]===r.slot)||!Number.isInteger(r.index)))return false;
 if(v.political.regime==='federal'&&Object.hasOwn(v.political.cabinet,'deputy'))return false;
 if(crises.length>1||crises.length&&v.political.regime!=='federal')return false;
 if(crises.some(x=>x.deadline!==x.start+4||typeof x.appealUsed!=='boolean'||!!x.used.appeal!==x.appealUsed))return false;
 if(trust&&(!crises.some(x=>x.id===b.crisisId&&x.appealUsed)||v.constitution.docket||typeof b.title!=='string'||typeof b.description!=='string'))return false;
 const d=v.constitution.docket;if(d?.action==='centralize'&&(v.political.regime!=='federal'||d.procedure!=='federal108'||d.target!=='semi'))return false;
 return true;
};
