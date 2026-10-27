/* 1.0.7 additions: semantic party colors, two-stage amendments and long-term minority issues. */
const PARTY_COLORS107={conservative:'#396bc1',market:'#c5a126',social:'#c33874',local:'#3c9990',green:'#488c50',law:'#63a3d1',state:'#be4948',reform:'#8771ba',religious:'#b18b55'};
function factionColorKey107(f){
 if(!f)return 'local';
 if(regime().id==='party')return Object.entries(FACTION_PROFILES103).find(([,profile])=>profile===factionProfile(f))?.[0]||'state';
 if(/社会民主|劳动|工党|社会公正|社会进步/.test(f.name))return 'social';
 if(/自由民主|自由改革|自由进步|自由中间|自由联邦/.test(f.name))return 'market';
 if(/国民|国家团结|国家复兴|民族复兴|共和建设|民主共和|保守党/.test(f.name))return 'conservative';
 return Object.entries(FACTION_PROFILES103).find(([,profile])=>profile===factionProfile(f))?.[0]||'conservative';
}
factionColor107=function(id){let f=typeof id==='object'?id:pstate()?.factions[id];return PARTY_COLORS107[factionColorKey107(f)]};

const MINORITY_KINDS107=['religious-minority','ethnic-minority'];
SIT_NAMES.amendment='宪法修订';
SIT_INFO.amendment=['修宪案必须先取得议事机关三分之二的院内支持，再提交最高司法机关审查。','议事机关达到三分之二；司法审查在三季度内达到半数','无固定季度损耗；本局势没有处置选项，请到相应机关推进'];
SIT_NAMES['religious-minority']='宗教少数派问题';
SIT_NAMES['ethnic-minority']='少数民族问题';
SIT_INFO['religious-minority']=['宗教少数群体就信仰自由、公职准入和公共服务待遇提出长期诉求。','通过社会多元修正案；非民主国家也可执行不可撤销的强制措施','未选择强制措施时不额外扣减指标；具体代价见当前处置阶段'];
SIT_INFO['ethnic-minority']=['少数族群就语言使用、政治代表和公共服务的平等可及提出长期诉求。','通过社会多元修正案；非民主国家也可执行不可撤销的强制措施','未选择强制措施时不额外扣减指标；具体代价见当前处置阶段'];
function minoritySituation107(){let m=constitution()?.minority;return m?sits().active.find(x=>x.id===m.situationId&&x.kind===m.kind):null}
function minorityGate107(){return electionForecast().total>=80&&s.stability>=60}
function amendmentInProgress107(){let d=constitution()?.docket;return d?.mode==='amend'?d:null}
function validExtraAmendmentTarget107(d){return ['competitive','pluralism'].includes(d.action)&&d.target==='enabled'}

const regimeBeforeProcedure107=regime;
regime=function(){let r=regimeBeforeProcedure107();return r.id==='theorepublic'&&s.constitution?.competitiveClause?{...r,democratic:true}:r};
const initBeforeProcedure107=initPolitics;
initPolitics=function(){
 const migrating=!!s.constitution&&!s.constitution.procedureVersion&&!creatingWorld;
 if(migrating)try{localStorage.setItem(KEY+'-pre-107-procedure',JSON.stringify(s))}catch(_){}
 initBeforeProcedure107();
 let c=constitution();if(c.procedureVersion===2)return;
 c.procedureVersion=2;c.competitiveClause=regime().democratic;
 // Add the new persistent issue without rerolling the existing world's random stream.
 const priorRng=s.rng;
 try{
  s.rng=hash(s.seed+'|minority-issue107');
  let kind=rand()<.5?MINORITY_KINDS107[0]:MINORITY_KINDS107[1],x=startSituation(kind,true);
  Object.assign(x,{method:null,elapsed:0,selectedQ:null,lastTick:s.q});
  c.minority={kind,situationId:x.id,status:'active',resolution:null,resolvedQ:null};
  if(migrating)notice('长期问题进入施政议程',situationTitle(x)+'已加入局势页面；此前季度不追溯任何损耗。');
  let d=c.docket;
  if(d?.mode==='amend'){
   Object.assign(d,{route:'assembly',stage:'legislature',sourceRegime:pstate().regime,reviewStarted:null,reviewDeadline:null,legislativeRate:null});
   pstate().bill=d;let situation=startSituation('amendment',true);d.situationId=situation.id;
   notice('修宪程序调整','现有修宪案已转交'+regime().body+'，须先获得三分之二院内支持；已投入的行动点和法官关系保留。');
  }
 }finally{s.rng=priorRng}
};

const specBeforeProcedure107=constitutionalSpec;
constitutionalSpec=function(mode,action,target){
 if(mode!=='amend')return specBeforeProcedure107(mode,action,target);
 let x=minoritySituation107(),c=constitution();
 if(action==='competitive'&&target==='enabled'&&!regime().democratic){
  let targets=['symbolic','party'].includes(regime().id)?'总统制或半总统制':regime().id==='theoabsolute'?'神权共和制或总统制':'君主立宪制或西敏议会制';
  return {mode,action,target,stance:'liberal',title:'增加竞争性选举条文',description:`确立竞争性选举，修宪成功后各以 50% 概率转为${targets}。保留执政时间、人物成果和经济数据；按新政体重组执政联盟，不符合入阁资格的官员按现行离任规则离任。`,values:{},axes:{authority:-4,law:4,elite:-2},costText:'通过后执行政体转型；不会额外扣减固定的支持或稳定，但内阁离任仍有正常后果。'};
 }
 if(action==='pluralism'&&target==='enabled'&&x&&!x.method&&(minorityGate107()||c.docket?.action==='pluralism'&&c.docket.admission?.weighted>=80&&c.docket.admission?.stability>=60)){
  return {mode,action,target,stance:'social',title:'社会多元修正案',description:`保障少数群体平等的信仰、语言与公共参与权利，完成全部修宪程序后结束“${situationTitle(x)}”。提出时要求加权支持度达到 80%、政治稳定达到 60；进入程序后不反复核验这两个触发条件。`,values:{},axes:{law:4,authority:-3,welfare:2},costText:'完整程序通过后结束长期问题，不追加固定财政成本。'};
 }
 return specBeforeProcedure107(mode,action,target);
};
const choicesBeforeProcedure107=constitutionalChoices;
constitutionalChoices=function(mode){let out=choicesBeforeProcedure107(mode);if(mode==='amend')for(let action of ['competitive','pluralism']){let spec=constitutionalSpec(mode,action,'enabled');if(spec)out.push(spec)}return out};

const menuBeforeProcedure107=constitutionalMenu;
constitutionalMenu=function(mode='interpret'){
 if(mode!=='amend')return menuBeforeProcedure107(mode);
 if(s.ended)return;
 if(constitution().docket){modal(`<h2>已有宪制议案待审</h2>${constitutionalDocketHTML()}<button onclick="$('modal').close()">返回</button>`);return}
 let issue=minoritySituation107(),gate=issue&&!issue.method&&!minorityGate107();
 modal(`<span class="tag">${esc(regime().body)} · ${memberRole(0)}</span><h2>提出修宪</h2><p>所有修宪均从这里发起：提出消耗 1 行动点，并进入“宪法修订”局势。先在${esc(regime().body)}获得至少三分之二院内支持，再交最高司法机关审查；审查开始后三季度内须达到半数赞成。修宪不能强行颁行。</p><div class="choices constitution-choices">${constitutionalChoices(mode).map(x=>`<button onclick="proposeConstitution('amend','${x.action}','${x.target}')"><strong>${esc(x.title)}</strong><small>${esc(x.description)} ${esc(x.costText)}</small></button>`).join('')}${gate?`<button disabled><strong>社会多元修正案 · 尚未开放</strong><small>当前加权支持度 ${fmt(electionForecast().total,1)}% / 需要 80%；政治稳定 ${fmt(s.stability,1)} / 需要 60。须在长期局势尚未开始强制措施时提出。</small></button>`:''}</div><button onclick="$('modal').close()">返回</button>`);
};
const proposeBeforeProcedure107=proposeConstitution;
proposeConstitution=function(mode,action,target){
 if(mode!=='amend')return proposeBeforeProcedure107(mode,action,target);
 let c=constitution(),spec=constitutionalSpec(mode,action,target);if(s.ended||!spec)return toast('此修宪选项尚未开放或已失效');
 if(c.docket||pstate().bill)return toast('请先完成或撤回当前议案');
 if(!spendAction())return;
 let d={...spec,id:c.nextDocket++,kind:'constitution',mode:'amend',route:'assembly',stage:'legislature',created:s.q,sourceRegime:pstate().regime,reviewStarted:null,reviewDeadline:null,legislativeRate:null};
 if(action==='pluralism')d.admission={weighted:electionForecast().total,stability:s.stability};
 c.docket=d;pstate().bill=d;let situation=startSituation('amendment');d.situationId=situation.id;
 noteDecision('提出'+d.title,{law:1},[],null,1,null,{kind:'procedure'});log('修宪提案',d.title+'已交'+regime().body+'，须取得三分之二院内支持。');
 $('modal').close();tab='assembly';pSave();
};
function reviewRate107(d=amendmentInProgress107()){
 if(!d||d.stage!=='review')return 0;
 return d.route==='court'?courtTally107(d).rate:billPassRate104();
}
function amendmentDocketHTML107(){
 let d=amendmentInProgress107();if(!d)return '';
 let first=d.stage==='legislature',rate=first?billPassRate104():reviewRate107(d),body=regime().body;
 return `<section id="constitutional-docket" class="card constitution-docket"><span class="tag">宪法修订 · ${first?'第一阶段 / '+esc(body):'第二阶段 / 司法审查'}</span><h2>${esc(d.title)}</h2><p>${esc(d.description)}</p><p class="note">${esc(d.costText)}</p><div class="big-number">${fmt(rate,2)}<small>% ${first||d.route==='assembly'?'院内支持率':'法官支持率'}</small></div>${first?`<p>本阶段须达到三分之二院内支持（精确门槛为 66⅔%，不是四舍五入后的 66.67%）。通过后才启动三季度司法审查期限。</p><button class="primary" onclick="voteConstitution()" ${s.ended?'disabled':''}>提交议会表决 · 1 行动点</button> <button onclick="withdrawConstitution()" ${s.ended?'disabled':''}>撤回修宪案</button>`:`<p>${d.route==='court'?courtBallotText107(d):`现行宪法把最高司法权交给${esc(body)}，由该机关行使审查权。`}${d.route==='court'?'计入关键一票后赞成票须过半。空缺不参与表决。':'由议事机关审查时达到半数即可通过，恰好50%也通过，不适用大法官关键一票。'}</p><p><b>剩余 ${Math.max(0,d.reviewDeadline-s.q)} 季度</b>；第 ${d.reviewDeadline} 季度开始时先核验票数，仍未通过审查即自动失败。满足上述审查规则即立即成功，无需再次花行动点表决。</p><button onclick="changeTab('${d.route==='court'?'judiciary':'assembly'}');$('modal').close()">前往审查机关 →</button>`}<p>本局势没有处置选项；送审后不能撤回。${first?'在本页与党派和议员协商争取支持。':'通过法官互动争取赞成票。'}</p></section>`;
}
const docketBeforeProcedure107=constitutionalDocketHTML;
constitutionalDocketHTML=function(){
 let d=constitution().docket;if(d?.mode==='amend')return amendmentDocketHTML107();if(d)return docketBeforeProcedure107();
 let court=constitutionalRoute()==='court';return `<section id="constitutional-docket" class="card"><span class="tag">宪制议程</span><h3>暂无待审议案</h3><p>修宪须与${esc(regime().body+memberRole(0))}互动提出，先立法审议、再司法审查。释宪仍由${esc(court?JUDGE_TITLES[pstate().regime][1]:regime().body+memberRole(0))}受理。</p><div class="constitution-actions"><button onclick="meetMember(0)">会见${esc(memberRole(0))} / 修宪 →</button><button onclick="${court?'openChiefJudge107()':'meetMember(0)'}">前往释宪互动 →</button></div></section>`;
};
meetMember=function(id){
 if(id===0&&tab!=='assembly'){tab='assembly';render()}memberBeforeConstitution(id);if(id!==0||s.ended)return;
 $('modal').innerHTML+=`<section class="constitution-member"><h3>宪制议程</h3><p>所有修宪均由${esc(regime().body)}发起，先取得三分之二院内支持，再由最高司法机关在三季度内审查；不能强行修宪。</p><button onclick="constitutionalMenu('amend')">提出修宪</button>${constitutionalRoute()==='assembly'?` <button onclick="constitutionalMenu('interpret')">请求释宪</button>`:''}</section>`;
};
const assemblyBeforeProcedure107=assembly;
assembly=function(){let html=assemblyBeforeProcedure107(),d=amendmentInProgress107();if(d&&d.stage==='review'&&!pstate().bill)html=html.replace(/<section class="card"><h3>政府议程<\/h3>[\s\S]*?<\/section>/,amendmentDocketHTML107());return html};
const thresholdBeforeProcedure107=threshold;
threshold=function(){return amendmentInProgress107()?.stage==='legislature'?100*2/3:thresholdBeforeProcedure107()};
const forceBeforeProcedure107=forceConstitutionPreview;
forceConstitutionPreview=function(){if(amendmentInProgress107())return toast('修宪须完成议会与司法程序，不能强行颁行');return forceBeforeProcedure107()};
const withdrawBeforeProcedure107=withdrawConstitution;
withdrawConstitution=function(){let d=amendmentInProgress107();if(!d)return withdrawBeforeProcedure107();if(s.ended)return;if(d.stage==='review')return toast('已送司法审查，不能撤回');finishAmendment107(false,'政府在议会阶段撤回了修宪案。');$('modal').close();pSave()};

const voteBeforeProcedure107=voteConstitution;
voteConstitution=function(force=false){
 let d=amendmentInProgress107();if(!d)return voteBeforeProcedure107(force);
 if(s.ended)return;if(force)return toast('所有修宪均须完成两阶段程序');
 if(d.stage==='review'){checkAmendmentReview107();pSave();return}
 let spec=constitutionalSpec('amend',d.action,d.target);if(!spec)return toast('修宪目标已失效，请撤回后重新提出');
 if(!spendAction('amendment-legislative-vote'))return;
 let rate=billPassRate104();
 if(rate+1e-9<100*2/3){log('修宪议案受阻',d.title+'院内支持率 '+fmt(rate,2)+'%，不足三分之二，议案保留。');toast('尚未取得三分之二院内支持');pSave();return}
 let penalty=billStabilityPenalty();if(penalty)mod({stability:-penalty});
 d.legislativeRate=rate;d.stage='review';d.reviewStarted=s.q;d.reviewDeadline=s.q+3;d.route=constitution().authority==='assembly'?'assembly':'court';
 pstate().bill=d.route==='assembly'?d:null;
 noteDecision('议事机关通过'+d.title,{law:1},[],null,1,null,{kind:'procedure'});log('修宪案进入司法审查',d.title+'获 '+fmt(rate,2)+'% 院内支持。第 '+d.reviewDeadline+' 季度开始时截止审查，法院审查计入首席关键一票后须过半；议事机关审查仍以半数为门槛。');
 checkAmendmentReview107();$('modal').close();pSave();
};
let checkingAmendment107=false;
function checkAmendmentReview107(){
 if(checkingAmendment107||s.ended)return;
 let d=amendmentInProgress107();if(!d||d.stage!=='review')return;
 checkingAmendment107=true;
 try{
  if(d.route==='court'?courtTally107(d).passed:reviewRate107(d)+1e-9>=50)finishAmendment107(true,'最高司法机关审查通过，修宪成功。'+(d.route==='court'?courtBallotText107(d):''));
  else if(s.q>=d.reviewDeadline)finishAmendment107(false,'三季度审查期限已到，最高司法机关尚未通过审查，修宪失败。');
 }finally{checkingAmendment107=false}
}
function finishAmendment107(success,reason){
 let c=constitution(),d=amendmentInProgress107();if(!d)return;
 let spec=constitutionalSpec('amend',d.action,d.target),rate=d.stage==='review'?reviewRate107(d):billPassRate104(),ballot=d.stage==='review'&&d.route==='court'?courtTally107(d):null;
 if(success&&!spec){success=false;reason='修宪目标已失效，修宪失败。'}
 // Clear first: transition code and nested saves must never enact this proposal twice.
 c.docket=null;if(pstate().bill?.kind==='constitution')pstate().bill=null;c.judges.forEach(j=>j.boosts=[]);
 if(success){
  mod(spec.values);
  if(d.action==='centralize')enactFederalCentralization108();
  if(d.action==='court')c.authority=d.target;
  if(d.action==='term'){c.termLimit=Number(d.target);v3().settlementDue=false}
  if(d.action==='economy'){c.economicModel=d.target;v3().socialist=d.target==='socialist'}
  if(d.action==='rights')c.rights=d.target;
  if(d.action==='pluralism'){c.rights='equal';resolveMinority107('amendment','社会多元修正案正式生效，长期诉求获得宪法保障。')}
  if(d.action==='competitive')enactCompetitiveElections107(d.sourceRegime);
  noteDecision(spec.title,spec.axes,[],null,1,null,{kind:'amendment',identity:'amendment:'+d.id});pstate().passed.push({title:spec.title,q:s.q,votes:d.legislativeRate,passRate:d.legislativeRate});
 }
 c.history.push({q:s.q,title:d.title,description:success?spec.description:reason,effects:success?spec.costText:'未生效；不兑现修宪效果。',route:d.route,rate,forced:false,result:success?'passed':'failed',legislativeRate:d.legislativeRate,...(ballot?{ballot}: {})});
 let sit=sits().active.find(x=>x.id===d.situationId&&x.kind==='amendment');if(sit)endSituation(sit,reason);
 log(success?'修宪成功':'修宪失败',d.title+'：'+reason);toast(success?'修宪成功，宪法条款已生效':'修宪失败，原有条款保留');
 checkPoliticalEnd();record();
}
function enactCompetitiveElections107(source){
 let c=constitution(),p=pstate(),stem=countryStem(),choices=['symbolic','party'].includes(source)?['presidential','semi']:source==='theoabsolute'?['theorepublic','presidential']:['constitutional','westminster'];
 let target=choices[rand()<.5?0:1];p.regime=target;c.competitiveClause=true;c.termLimit=48;s.name=stem+regime().suffix;
 const names=factionNames12();p.factions.forEach((f,i)=>f.name=names[i]);p.rulingParty=p.factions[playerFactionId107()].name;
 p.members.forEach((m,i)=>m.role=i<4?memberRole(i):names[m.faction]+'党团总召');
 // Preserve achievements, loyalty and identities; align only incompatible political labels.
 for(let person of [...p.candidates,...p.members]){let traits=factionProfile(p.factions[person.faction]).traits;if(!traits.includes(person.trait))person.trait=traits[0]}
 let crisis=activeSit('government');if(crisis)endSituation(crisis,'竞争性选举条文生效，依新政体重组政府。');
 rules103().coalition=[playerFactionId107()];initializeAllies107();
 if(!regime().head)delete p.cabinet.head;else if(!Object.prototype.hasOwnProperty.call(p.cabinet,'head'))p.cabinet.head=null;
 for(let [slot,item] of Object.entries(p.cabinet))if(item&&!cabinetEligible(p.candidates[item.candidate]))removeOfficial(slot);
 sits().transition={q:s.q,from:source,to:target,constitutional:true};sits().democracyPressure=0;v3().settlementDue=false;
 let movement=activeSit('spring');if(movement)endSituation(movement,'竞争性选举条文生效，国家转入'+regime().name+'。');
 log('政体转型',source+'的竞争性选举修正案通过；国家转为'+regime().name+'。既有季度、经济数据和人物成果保留，之后按民主选举与任期规则运行。');
}

const actionsBeforeProcedure107=situationActions;
situationActions=function(x){
 if(x.kind==='amendment')return [];
 if(!MINORITY_KINDS107.includes(x.kind))return actionsBeforeProcedure107(x);
 if(x.method||regime().democratic)return [];
 return [
  {key:'forced-migration',label:'强制迁徙',detail:'1 行动点；一旦开始无法取消。持续 20 季度，每季支持 −2、稳定 −2、实际年化增长率 −0.5 个百分点；开始时信心一次性 −20。',values:{},axes:{authority:4,law:-4,nation:3}},
  {key:'forced-assimilation',label:'强制同化',detail:'1 行动点；一旦开始无法取消。持续 25 季度，每季支持 −1、稳定 −2、信心 −0.5。',values:{},axes:{authority:4,law:-4,nation:3}}
 ];
};
const actBeforeProcedure107=situationAct;
situationAct=function(id,key){let x=sits().active.find(x=>x.id===id);if(!x||!MINORITY_KINDS107.includes(x.kind))return actBeforeProcedure107(id,key);if(!situationActions(x).some(a=>a.key===key)||s.ended)return;
 let option=situationActions(x).find(a=>a.key===key);modal(`<span class="tag">${situationTitle(x)}</span><h2>确认${option.label}</h2><p>${option.detail}</p><p>选择后不能撤回、切换措施或通过修宪提前终止；若政体在执行期间改变，既定执行期仍继续。当前社会多元修宪程序也会终止。</p><button class="danger" onclick="startMinorityPolicy107(${id},'${key}')">确认开始，无法取消</button> <button onclick="$('modal').close()">返回</button>`);
};
function startMinorityPolicy107(id,key){
 let x=minoritySituation107();if(!x||x.id!==id||x.method||regime().democratic||s.ended||!['forced-migration','forced-assimilation'].includes(key))return;
 if(!spendAction('minority-plan:'+id))return;
 x.method=key;x.elapsed=0;x.selectedQ=s.q;x.lastTick=s.q;x.duration=key==='forced-migration'?20:25;
 x.used[key]=true;x.actions.push({q:s.q,key,label:key==='forced-migration'?'强制迁徙':'强制同化'});
 if(key==='forced-migration')mod({confidence:-20});
 noteDecision(situationTitle(x)+'：'+(key==='forced-migration'?'强制迁徙':'强制同化'),{authority:4,law:-4,nation:3},[],null,1,null,{kind:'coercion',identity:'minority:'+x.id});
 if(amendmentInProgress107()?.action==='pluralism')finishAmendment107(false,'政府选择不可撤销的强制措施，社会多元修正案终止。');
 log('长期处置开始',situationTitle(x)+'进入'+x.duration+'季度执行期；从下一季度起计入每季损耗。');$('modal').close();pSave();
}
function resolveMinority107(resolution,reason){
 let x=minoritySituation107(),m=constitution().minority;if(!x||m.status==='resolved')return;
 m.status='resolved';m.resolution=resolution;m.resolvedQ=s.q;endSituation(x,reason);
}
function minorityQuarter107(){
 let x=minoritySituation107();if(!x?.method||x.lastTick>=s.q||s.ended)return;
 x.lastTick=s.q;x.elapsed++;
 if(x.method==='forced-migration'){mod({approval:-2,stability:-2});s.growth=clamp(s.growth-.5,-20,15);s.gdp*=1-.5/600}
 else mod({approval:-1,stability:-2,confidence:-.5});
 if(x.elapsed>=x.duration)resolveMinority107(x.method,'既定 '+x.duration+' 季度执行期结束，局势归档；经济、民意和制度历史不会重置。');
 checkPoliticalEnd();
}
const quarterBeforeProcedure107=situationQuarter;
situationQuarter=function(){quarterBeforeProcedure107();minorityQuarter107();checkAmendmentReview107()};
const saveBeforeProcedure107=save;
save=function(){if(s.constitution?.procedureVersion===2)checkAmendmentReview107();return saveBeforeProcedure107()};
const progressBeforeProcedure107=situationProgress;
situationProgress=function(x){
 if(x.kind==='amendment'){let d=amendmentInProgress107();if(!d)return '本修宪程序已经结案。';return d.stage==='legislature'?`议会阶段：院内支持率 ${fmt(billPassRate104(),2)}%，目标为三分之二。<br>法案：${esc(d.title)}。立法通过后才开始司法审查计时。`:`司法审查：赞成比例 ${fmt(reviewRate107(d),1)}%。${d.route==='court'?courtBallotText107(d)+'计入关键一票后须过半。':'院内支持率达到半数即可通过。'}<br>剩余 ${Math.max(0,d.reviewDeadline-s.q)} 季度；第 ${d.reviewDeadline} 季度开始时截止。<br>无需在局势页操作；到审查机关争取支持。`}
 if(MINORITY_KINDS107.includes(x.kind)){
  if(x.method)return `<b>${x.method==='forced-migration'?'强制迁徙':'强制同化'}执行中 · 不可取消</b><br>已执行 ${x.elapsed} / ${x.duration} 季度，剩余 ${x.duration-x.elapsed} 季度。<br>${x.method==='forced-migration'?'每季度公众支持 −2、稳定 −2、实际年化增长率 −0.5 个百分点。开始时的信心 −20 已执行，不会重复扣减。':'每季度公众支持 −1、稳定 −2、信心 −0.5。'}<br>执行期间不能改选其他路径。`;
  return `社会多元修正案：${minorityGate107()?'已达到提出条件':'尚未达到提出条件'}。<br>当前加权支持度 ${fmt(electionForecast().total,1)}% / 需要 80%；政治稳定 ${fmt(s.stability,1)} / 需要 60。<br>请与${esc(regime().body+memberRole(0))}互动提出修宪。${regime().democratic?'本政体只能通过修宪解决。':'本政体也可选择下方不可撤销的强制措施。'}<br>未采取强制措施时，本局势本身不扣减季度指标。`;
 }
 return progressBeforeProcedure107(x);
};
const endBeforeProcedure107=endSituation;
endSituation=function(x,reason){let before=sits().notices.length;endBeforeProcedure107(x,reason);if(x.kind==='amendment'||MINORITY_KINDS107.includes(x.kind))for(let n of sits().notices.slice(before))n.constitutionalSpecial=true};
const startBeforeProcedure107=startSituation;
startSituation=function(kind,opening=false){
 if(kind==='amendment'&&!amendmentInProgress107())return null;
 if(MINORITY_KINDS107.includes(kind)&&constitution()?.minority)return null;
 let count=sits()?.notices.length||0,result=startBeforeProcedure107(kind,opening);
 if(kind==='amendment'||MINORITY_KINDS107.includes(kind))for(let n of sits().notices.slice(count))n.constitutionalSpecial=true;
 return result;
};
const transitionBeforeProcedure107=transitionDemocracy;
transitionDemocracy=function(x){
 if(amendmentInProgress107())finishAmendment107(false,'民主化运动启动新制宪程序，原修宪提案终止。');
 let result=transitionBeforeProcedure107(x);constitution().competitiveClause=true;return result;
};

const archiveBeforeProcedure107=archive;
archive=function(){let html=archiveBeforeProcedure107();return html.replace('政体条目记载当前制度，本版不通过此菜单更换政体。','非民主国家可通过竞争性选举修正案转型，人物与执政历史保留。').replace('<p>修宪改变根本条款；',`<div class="row"><span>竞争性选举条文</span><b>${constitution().competitiveClause?'已确立':'尚未确立'}</b></div><p>修宪改变根本条款；`)};
const newWorldBeforeProcedure107=newDialog;
newDialog=function(){newWorldBeforeProcedure107();$('modal').innerHTML+=`<p class="note">长期问题：所有新世界额外抽取“宗教少数派问题”或“少数民族问题”，各 50% 概率；不占普通模式一个、困难模式两个开局危机的名额。</p>`};

const validBeforeProcedure107=validSave;
validSave=function(v){
 if(!validBeforeProcedure107(v))return false;
 let c=v.constitution;if(!c?.procedureVersion)return true;
 if(c.procedureVersion!==2||typeof c.competitiveClause!=='boolean'||!c.minority)return false;
 let m=c.minority,active=v.situations.active;
 if(!MINORITY_KINDS107.includes(m.kind)||!Number.isInteger(m.situationId)||!['active','resolved'].includes(m.status))return false;
 let problems=active.filter(x=>MINORITY_KINDS107.includes(x.kind));
 if(m.status==='active'){
  if(problems.length!==1||problems[0].id!==m.situationId||problems[0].kind!==m.kind)return false;
  let x=problems[0];if(!Number.isInteger(x.elapsed)||x.elapsed<0||!Number.isInteger(x.lastTick)||![null,'forced-migration','forced-assimilation'].includes(x.method))return false;
  if(x.method){if(x.duration!==(x.method==='forced-migration'?20:25)||x.elapsed>=x.duration||!Number.isInteger(x.selectedQ)||x.selectedQ>v.q||x.lastTick>v.q)return false}
  else if(x.elapsed!==0||x.selectedQ!==null)return false;
 }else if(problems.length||!['amendment','forced-migration','forced-assimilation'].includes(m.resolution)||!Number.isInteger(m.resolvedQ)||m.resolvedQ>v.q)return false;
 let d=c.docket?.mode==='amend'?c.docket:null,situations=active.filter(x=>x.kind==='amendment');
 if(!d)return situations.length===0;
 if(situations.length!==1||situations[0].id!==d.situationId||!['legislature','review'].includes(d.stage)||!REGIMES.some(r=>r.id===d.sourceRegime))return false;
 if(d.stage==='legislature'){if(d.route!=='assembly'||d.reviewStarted!==null||d.reviewDeadline!==null||d.legislativeRate!==null)return false}
 else if(!Number.isInteger(d.reviewStarted)||d.reviewStarted>v.q||d.reviewDeadline!==d.reviewStarted+3)return false;
 else if(d.procedure==='federal108'){if(d.sourceRegime!=='federal'||v.political.regime!=='federal'||d.legislativeRate!==null)return false}
 else if(!Number.isFinite(d.legislativeRate)||d.legislativeRate+1e-9<100*2/3||d.legislativeRate>100)return false;
 if(d.action==='pluralism'&&(!d.admission||!Number.isFinite(d.admission.weighted)||d.admission.weighted<80||d.admission.weighted>100||!Number.isFinite(d.admission.stability)||d.admission.stability<60||d.admission.stability>100||m.status!=='active'||problems[0].method))return false;
 return true;
};

const guideBeforeProcedure107=constitutionGuideEntries;
constitutionGuideEntries=function(){
 let entries=guideBeforeProcedure107();
 const amendText='所有修宪从议事机关的议长／主席处提出，消耗1行动点并进入宪法修订局势。先取得至少三分之二院内支持（表决1行动点），再提交最高司法机关。送审后最多3季度，赞成达到半数立即成功；到第3季度开始时仍不足半数则失败。恰好50%的司法赞成票也能通过。局势无特殊处置选项；不能强行修宪。释宪保留原路径和超过50%的门槛。';
 for(let e of entries){
  if(e.id==='constitution')e.text='国家档案记载政体、竞争性选举条文、任期、经济模式、司法机关、公民权利与预算上限。所有修宪先经议事机关三分之二表决，再经三季度司法审查。非民主国家可通过竞争性选举条文转型。';
  if(e.id==='constitutional-docket'){e.title='修宪与释宪';e.text=amendText;e.aliases.push('宪法修订','司法审查')}
  if(e.id==='constitutional-force'){e.title='强行释宪';e.aliases=['强行释宪','强行颁行','强行修宪'];e.text='仅枢密院政体可强行释宪，额外花费1行动点、支持8点、稳定8点，再兑现释宪本身效果。修宪一律完成两阶段程序，不能强行颁行。'}
  if(e.id==='constitutional-transfer')e.text='移交最高司法权的修宪同样需要先获议事机关三分之二支持，再经当前最高司法机关半数赞成。生效时司法独立−20、稳定−10、支持+10。移交后，释宪及后续修宪的司法审查由获授最高司法权的机关办理。';
 }
 const add=(id,title,aliases,text,category='宪法与司法')=>entries.push({id,title,aliases:[title,...aliases],text,category});
 add('competitive-amendment','增加竞争性选举条文',['竞争性选举','政体转型'],'非民主国家固定提供此修宪项。成功后：象征性民主／一党制各以50%概率转为总统制或半总统制；神权专制各以50%概率转为神权共和制或总统制；其他非民主政体各以50%概率转为君主立宪制或西敏议会制。保留历史与人物成果；按新体制重组联盟，失去入阁资格者正常离任。');
 add('minority-issue','长期少数群体问题',['宗教少数派问题','少数民族问题','长期局势'],'所有新世界额外抽取一个，两类各50%，不占普通／困难危机名额。旧档补充一次，不追溯损耗。民主国家须通过社会多元修正案解决；非民主国家也可执行强制迁徙或强制同化。未选择强制措施时，这个局势不额外扣减指标。','局势与处置');
 add('pluralism-amendment','社会多元修正案',['社会多元','多元修宪'],'长期少数群体问题仍存在、尚未选择强制措施，且加权支持度达到80%、政治稳定达到60时可提出。两项条件恰好达到也符合；进入修宪程序后不再反复核验。须依次通过议事机关三分之二与司法半数门槛，成功即结束长期问题。');
 add('forced-migration','强制迁徙',[],'仅非民主国家可在长期问题局势中选择，1行动点，确认后不可撤回或切换。信心立即一次性−20；从下一季度起执行20季度，每季支持−2、稳定−2、实际年化增长率−0.5个百分点。执行期满局势结束，已产生的后果保留。转型为民主后也不能提前终止。','局势与处置');
 add('forced-assimilation','强制同化',[],'仅非民主国家可选择，1行动点，确认后不可撤回或切换。下一季度起执行25季度，每季支持−1、稳定−2、信心−0.5。没有额外的一次性信心扣减；期限届满局势结束，转型或存档刷新不会取消既定措施。','局势与处置');
 add('party-colors','政党颜色',['党派颜色','议会颜色','席位颜色'],'座席、党派名称与人物标识使用一致的政治路线配色：社会民主／劳动派为梅红，自由民主／自由市场派为黄色，国民／保守派为蓝色，绿色派为绿色，法治自由派为浅蓝，国家统制派为红色，地方自治派为青绿，技术改革派为紫色，传统宗教派为赭金。颜色由名称与政治路线决定，不由列表顺序决定。','立法与政治');
 return entries;
};
