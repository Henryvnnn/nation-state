/* 1.0.8 — two independent chambers and explicit, persistent legislative stages. */
const CHAMBERS108={constitutional:['下议院','上议院'],westminster:['众议院','参议院'],presidential:['众议院','参议院'],semi:['众议院','参议院'],symbolic:['众议院','参议院'],federal:['国民院','联邦院'],theorepublic:['国民议会','宪法监护委员会']};
for(const r of REGIMES)if(CHAMBERS108[r.id])r.body=CHAMBERS108[r.id][0];
const UPPER_VIEWS108={
 establishment:{name:'建制保守',color:'#60748a',text:'对预算没有特别偏好；谨慎对待结构性改革。'},
 progressive:{name:'社会进步',color:'#c33874',text:'支持左派改革与加税，反对福利削减和私有化。'},
 conservative:{name:'共和保守',color:'#396bc1',text:'支持减税、福利紧缩与市场化，反对国有化等左派改革。'},
 clerical:{name:'教法保守',color:'#b18b55',text:'反对文化、体育、科技与市场化改革；要求提高关税、降低其他税收，保持福利平稳。'}
};
let chamberView108='lower';
function bicameral108(){return s?.bicameral108}
function hasUpper108(){return !!CHAMBERS108[pstate()?.regime]}
function upperName108(){return CHAMBERS108[pstate().regime]?.[1]||'上院'}
function upperViewName108(key){return key==='conservative'&&regime().id==='constitutional'?'贵族保守':UPPER_VIEWS108[key].name}
function upperOfficerTitle108(speaker=false){return regime().id==='theorepublic'?(speaker?'监护委员会主席':'监护团体首席代表'):regime().id==='constitutional'?(speaker?'上议院议长':'派系领袖'):regime().id==='federal'?(speaker?'联邦院议长':'联邦院党团代表'):(speaker?'参议院议长':'参议院党鞭')}
function linkedUpperView108(f){
 const key=factionColorKey107(f);
 if(regime().id==='theorepublic'&&['conservative','religious','state'].includes(key))return 'clerical';
 if(['social','green','law'].includes(key))return 'progressive';
 if(key==='market'||regime().id==='constitutional'&&key==='conservative')return 'conservative';
 return 'establishment';
}
function upperGroupNames108(view){
 const religious=regime().id==='theorepublic';
 return ({establishment:religious?['教务协调会','宗教建制团','经学秩序会','教区协调团','稳健教务会']:['国家复兴阵线','宪制守护团','稳健联合','秩序协调会','建制协商团'],progressive:religious?['民生教士会','社会关怀团','开明教士联合','公义教务会','慈善教区联合']:['劳工联盟','进步联合','社会协进会','公共福祉团','平等议事团'],conservative:regime().id==='constitutional'?['世袭贵族联合','领地贵族团','传统贵族会','贵族守宪团','领主协商会']:['共和守成会','传统共和团','自由经济联合','财产保障会','稳健共和团'],clerical:['虔教徒委员会','教法守护团','传统经学会','圣典监护团','正统教士会']})[view];
}
function independentUpperName108(view,used){
 const pool=upperGroupNames108(view),start=hash(s.seed+'|upper-bloc|'+regime().id+'|'+view)%pool.length;
 for(let i=0;i<pool.length;i++){const name=pool[(start+i)%pool.length];if(!used.has(name)){used.add(name);return name}}
 const base=upperName108()+upperViewName108(view)+'党团';let name=base,n=2;while(used.has(name))name=base+'第'+n+++'组';used.add(name);return name;
}
// A chamber has one bloc per ideology, not one bloc per lower-party/ideology pair.
// Preserve source shares as metadata; they never create extra blocs or representatives.
function consolidateUpperBlocs108(u,migrate=false){
 if(!u.formed)return;
 const oldGroups=u.groups,oldMembers=u.members,player=playerFactionId107(),used=new Set(pstate().factions.map(f=>f.name)),idMap=new Map();
 u.groups=Object.keys(UPPER_VIEWS108).flatMap((view,id)=>{
  const parts=oldGroups.filter(g=>g.view===view&&g.share>0),share=parts.reduce((n,g)=>n+g.share,0);if(!share)return [];
  const mean=fn=>parts.reduce((n,g)=>n+g.share*fn(g),0)/share,lower=new Map();
  for(const g of parts){idMap.set(g.id,id);for(const x of g.lowerShares||[{id:g.lowerId,share:g.share}])lower.set(x.id,(lower.get(x.id)||0)+x.share)}
  return [{id,lowerId:null,lowerShares:[...lower].map(([id,share])=>({id,share})),name:independentUpperName108(view,used),view,share,playerShare:lower.get(player)||0,relation:mean(g=>g.relation),agenda:mean(g=>g.agenda),decay:mean(g=>g.decay)}];
 });
 u.playerGroup=regime().id==='symbolic'?u.groups.reduce((a,b)=>a.playerShare>=b.playerShare?a:b).id:idMap.get(u.playerGroup)??u.groups.reduce((a,b)=>a.playerShare>=b.playerShare?a:b).id;
 if(!oldMembers.length){populateUpperMembers108(u);return}
 const memberMap=new Map(),chair=oldMembers.find(m=>m.speaker);
 u.members=[{...chair,id:0,group:idMap.get(chair.group)}];memberMap.set(chair.id,0);
 for(const g of u.groups){
  const reps=oldMembers.filter(m=>!m.speaker&&idMap.get(m.group)===g.id).sort((a,b)=>oldGroups.find(g=>g.id===b.group).share-oldGroups.find(g=>g.id===a.group).share);
  const id=u.members.length;u.members.push({...reps[0],id,group:g.id});for(const m of reps)memberMap.set(m.id,id);
 }
 if(!migrate)return;
 // Pending bills may be shared in memory or separate copies after a save reload.
 const tickets=new Set([pstate().bill,constitution().docket,...bicameral108().delayed].map(b=>b?.chamber108).filter(Boolean));
 for(const t of tickets){
  if(t.sourceRegime!==regime().id)continue;
  const temp={},agreements=[],seen=new Set();
  for(const g of u.groups){const bonus=oldGroups.filter(x=>x.view===g.view).reduce((n,x)=>n+x.share*(t.temp[x.id]||0),0)/g.share;if(bonus)temp[g.id]=bonus}
  for(const a of t.agreements){const member=memberMap.get(a.member);if(member===undefined)continue;const key=member===0?'speaker':member+':'+a.q;if(!seen.has(key)){agreements.push({...a,member});seen.add(key)}}
  t.temp=temp;t.agreements=agreements;
 }
 // Retain the per-quarter personnel replacement limit after office IDs change.
 const last=pstate().lastAction,limits=new Map();
 for(const [oldId,id]of memberMap){const q=last['upper-personnel:'+oldId];if(q!==undefined)limits.set(id,Math.max(q,limits.get(id)??-1))}
 for(const key of Object.keys(last))if(key.startsWith('upper-personnel:'))delete last[key];for(const [id,q]of limits)last['upper-personnel:'+id]=q;
}
function migrateUpperBlocs108(){
 const state=bicameral108();if(state.version===1){consolidateUpperBlocs108(state.upper,true);state.version=2}
 const used=new Set(pstate().factions.map(f=>f.name));for(const g of state.upper.groups){if(used.has(g.name))g.name=independentUpperName108(g.view,used);else used.add(g.name)}
 // JSON reload duplicates these references. Keep later negotiations on the same docket.
 const d=constitution().docket,b=pstate().bill;if(d?.mode==='amend'&&['upper','returned'].includes(d.stage)&&b?.chamber108?.id===d.chamber108?.id)pstate().bill=d;
}
// Preserve the player's mirrored share wherever compatible with mandated composition.
function constrainedShares108(groups,ids,target,player){
 const chosen=groups.filter(g=>ids.includes(g.id)),others=groups.filter(g=>!ids.includes(g.id));
 const distribute=(list,total)=>{let fixed=list.find(g=>g.id===player),rest=list.filter(g=>g!==fixed);if(fixed&&rest.length&&fixed.share<=total){const n=allocateUnits107(rest.map(g=>g.share),total-fixed.share);rest.forEach((g,i)=>g.share=n[i])}else{const n=allocateUnits107(list.map(g=>g.share),total);list.forEach((g,i)=>g.share=n[i])}};
 distribute(chosen,target);distribute(others,100-target);
}
function populateUpperMembers108(u){
 u.members=[];
 const nobles=regime().id==='constitutional',religious=regime().id==='theorepublic';
 function add(group,speaker){
  const id=u.members.length,baseName=personName();
  let honour=null;
  if(religious){const tradition=s.personnel107.religiousTradition,rank=speaker?5:2+Math.floor(rand()*3);honour={title:RELIGIOUS_HONOURS107[tradition].titles[rank-1],kind:'religious',rank,tradition}}
  else if(nobles&&(speaker||group.view==='conservative'||rand()<.6)){honour={...NOBLE_HONOURS107[speaker?6:2+Math.floor(rand()*4)]}}
  else if(regime().id==='westminster'&&rand()<.25)honour={...NOBLE_HONOURS107[1+Math.floor(rand()*3)]};
  u.members.push({id,baseName,name:baseName+(honour?.title||''),honour,group:group.id,speaker,relation:group.relation,last:-1});
 }
 const chair=u.groups.find(g=>g.share>0&&(g.view==='clerical'||g.view==='conservative'))||u.groups.reduce((a,b)=>a.share>b.share?a:b);
 add(chair,true);for(const g of u.groups)if(g.share>0)add(g,false);
}
function initializeBicameral108(){
 if(!hasUpper108())return;
 const previous=bicameral108();if(previous?.regime===regime().id){migrateUpperBlocs108();return}
 const priorRng=s.rng;
 try{
  if(!previous&&!creatingWorld)try{localStorage.setItem(KEY+'-pre-bicameral108',JSON.stringify(s))}catch(_){}
  s.rng=hash(s.seed+'|bicameral108|'+regime().id);
  const p=pstate(),symbolic=regime().id==='symbolic';
  s.bicameral108={version:2,regime:regime().id,nextBill:previous?.nextBill||1,history:previous?.history||[],delayed:previous?.delayed||[],upper:{formed:!symbolic,groups:[],members:[],playerGroup:playerFactionId107(),lastAgendaQ:s.q,term:0,nobleShare:0,clergyShare:0}};
  const u=bicameral108().upper;
  u.groups=p.factions.map(f=>({id:f.id,lowerId:f.id,view:linkedUpperView108(f),share:factionSeatShare107(f),relation:50+Math.floor(rand()*21),agenda:54+Math.floor(rand()*9),decay:0}));
  if(regime().id==='constitutional'){
   let g=u.groups.find(g=>g.view==='conservative');if(!g){g=u.groups.find(g=>g.id!==u.playerGroup);g.view='conservative';g.name='世袭贵族联合'}
   if(g.share<40)constrainedShares108(u.groups,[g.id],40,u.playerGroup);
   u.nobleShare=Math.max(50,u.groups.filter(g=>g.view==='conservative').reduce((n,g)=>n+g.share,0));
  }
  if(regime().id==='theorepublic'){
   let ids=u.groups.filter(g=>g.view==='clerical').map(g=>g.id);
   if(!ids.length){const g=u.groups.find(g=>g.id!==u.playerGroup);g.view='clerical';g.name='虔教徒委员会';ids=[g.id]}
   if(ids.length===u.groups.length){const g=u.groups.find(g=>g.id!==u.playerGroup);g.view='establishment';g.name='教务协调会';ids=ids.filter(i=>i!==g.id)}
   const sum=u.groups.filter(g=>ids.includes(g.id)).reduce((n,g)=>n+g.share,0),target=sum>=60&&sum<=80?sum:60+Math.floor(rand()*21);
   constrainedShares108(u.groups,ids,target,u.playerGroup);u.clergyShare=100;
  }
  if(symbolic){u.groups=[];u.playerGroup=null;u.draft={establishment:0,progressive:0,conservative:0}}else consolidateUpperBlocs108(u);
  // Ongoing judicial reviews are grandfathered; no repeat legislative vote or clock reset.
  if(!creatingWorld&&!previous)addNotice107('bicameral108','两院议事安排',`${regime().body}与${upperName108()}分别议事。预算、改革及新修宪案增加另一院复审；已进入司法审查的旧案继续按原期限办理。`,'assembly');
  chamberView108='lower';
 }finally{s.rng=priorRng}
}
const initBeforeBicameral108=initPolitics;
initPolitics=function(...args){initBeforeBicameral108(...args);initializeBicameral108()};
function upperBill108(){const d=amendmentInProgress107();return d?.stage==='upper'?d:pstate().bill?.chamber108?.stage==='upper'?pstate().bill:null}
function upperTaxShift108(b){return (b.policies.income-s.policies.income)+(b.policies.vat-s.policies.vat)/1.5+(b.policies.corporate-s.policies.corporate)/2+(b.policies.property-s.policies.property)+(b.policies.tariff-s.policies.tariff)/2}
function upperAffinity108(g,b=upperBill108()){
 if(!b)return 0;
 if(b.kind==='budget'){
  const tax=upperTaxShift108(b),welfare=b.policies.welfare-s.policies.welfare,health=b.policies.health-s.policies.health;
  if(g.view==='progressive')return tax+welfare*2+health;
  if(g.view==='conservative')return -tax-welfare*2-health;
  if(g.view==='clerical')return (b.policies.tariff-s.policies.tariff)*2-(tax-(b.policies.tariff-s.policies.tariff)/2)-Math.abs(welfare)*2;
  return 0;
 }
 if(b.kind==='reform'){
  const r=REFORMS[b.id],left=r.axes.market<0||r.axes.welfare>=3,right=r.axes.market>=3;
  if(g.view==='establishment')return -6;
  if(g.view==='progressive')return right?-14:left?8:0;
  if(g.view==='conservative')return left?-14:right?8:0;
  if(g.view==='clerical')return ['sports','culture'].includes(r.key)||r.tags.includes('technology')||r.key==='coops'||r.axes.market>0?-18:0;
 }
 if(b.mode==='amend')return g.view==='establishment'?-8:g.view==='progressive'?(['social','liberal'].includes(b.stance)?8:-12):g.view==='clerical'?(['social','liberal'].includes(b.stance)?-18:4):['authority','traditional'].includes(b.stance)?6:-10;
 return 0;
}
function upperAgenda108(g,b=upperBill108()){return clamp(clamp(g.agenda-g.decay+(g.relation-60)*.65+upperAffinity108(g,b),0,100)+(b?.chamber108?.temp[g.id]||0),0,100)}
function upperRatio108(g,b=upperBill108()){return clamp((upperAgenda108(g,b)-50)/10,0,1)}
function upperSupport108(b=upperBill108()){const u=bicameral108()?.upper;return u?.formed?u.groups.reduce((n,g)=>n+g.share*upperRatio108(g,b),0):0}
function chamberTicket108(b,rate,penalty=0){return {id:bicameral108().nextBill++,stage:'upper',lowerRate:rate,penalty,upperRate:null,temp:{},agreements:[],sourceRegime:regime().id}}
function archiveChamberVote108(b,result){bicameral108().history.push({q:s.q,title:b.title,kind:b.kind,result,lowerRate:b.chamber108?.lowerRate??null,upperRate:b.chamber108?.upperRate??null})}
function switchChamber108(view){if(!hasUpper108())return;chamberView108=view==='upper'?'upper':'lower';tab='assembly';render()}
function upperReview108(){
 if(s.ended||!hasUpper108())return;const u=bicameral108().upper,b=upperBill108();if(!b)return;if(!u.formed)return toast('请先组建参议院');
 const rate=upperSupport108(b);b.chamber108.upperRate=rate;
 if(rate>50){
  b.chamber108.stage='approved';archiveChamberVote108(b,'upper-approved');log(upperName108()+'复审通过',`${b.title}院内支持率 ${fmt(rate,2)}%。`);
  if(b.mode==='amend')beginJudicialAfterUpper108(b);else finalizeOrdinary108(b);
 }else if(regime().id==='theorepublic'&&b.kind!=='budget'){
  archiveChamberVote108(b,'vetoed');if(b.mode==='amend')finishAmendment107(false,'宪法监护委员会驳回修宪案，议案流案。');else{pstate().bill=null;log('改革案流案',b.title+'被宪法监护委员会驳回，原改革草案保留。');notice('宪法监护委员会驳回议案',b.title+'未能获得过半支持，议案流案；已付协商成本不退还。')}
 }else{
  b.chamber108.stage='returned';if(b.mode==='amend')b.stage='returned';pstate().bill=b;archiveChamberVote108(b,'returned');chamberView108='lower';
  log('议案退回'+regime().body,`${b.title}仅获${upperName108()} ${fmt(rate,2)}% 支持。须由${regime().body}再次表决，消耗1行动点。`);
  notice('议案退回'+regime().body,`${b.title}须重新取得${b.mode==='amend'&&!isFederal108()?'三分之二':'过半'}院内支持。${regime().id==='presidential'?'复议通过的议案延缓两个季度实施；修宪仍须司法审查，通过后再延缓两个季度生效。':'复议通过后不再重复提交上院；修宪随后进入司法审查。'}`);
 }
 pSave();
}
// One enactment function preserves all existing costs, regional effects and decision weights.
function enactOrdinary108(b){
 const p=pstate(),rate=b.chamber108.lowerRate;
 if(b.kind==='budget'){
  const before={...s.policies};if(spend(b.policies)<spend())p.memory.cuts++;
  s.policies={...b.policies};draft={...s.policies};
  const axes={market:clamp(budgetMarketShift107(before,s.policies)/3,-4,4),welfare:clamp(s.policies.welfare-before.welfare+s.policies.health-before.health,-4,4),military:clamp(s.policies.security-before.security,-3,3)},tags=[];
  if(s.policies.education>before.education)tags.push('technology');if(s.policies.infrastructure>before.infrastructure)tags.push('industry','agriculture');if(s.policies.welfare>before.welfare||s.policies.health>before.health)tags.push('welfare');
  noteDecision('通过财政预算',axes,tags,null,.5,null,{kind:'budget',before,after:{...s.policies}});
 }else{
  const r=REFORMS[b.id];if(!r||s.reforms.some(x=>x.id===b.id))return;
  mod({cost:reformStartCost(b.id,b.offer)});s.reforms.push({id:b.id,key:r.key,ready:s.q+r.lag,boost:r.boost,completed:false,effectsApplied:false});v3().offers=v3().offers.filter(x=>x.uid!==b.offer);
  noteDecision('启动'+r.name,r.axes,r.tags,null,1,null,{kind:'reform',identity:'reform:'+r.key});if(r.key==='inheritance')v3().inheritanceUsed=true;
 }
 p.passed.push({title:b.title,q:s.q,votes:rate,passRate:rate,upperRate:b.chamber108.upperRate});mod({approval:1,stability:1-b.chamber108.penalty});p.confidenceLoss=0;
 archiveChamberVote108(b,'enacted');log('议程生效',b.title+'已完成两院程序，开始实施。');toast('议程已生效');checkPoliticalEnd();if(s.ended)beginSettlement(s.ended);record();
}
function finalizeOrdinary108(b,returned=false){
 if(isFederal108()&&s.approval<50){
  b.chamber108.stage='referendum';pstate().bill=b;
  const text=`${b.title}已完成两院审议，但全国支持率 ${fmt(s.approval,1)}% 未达到50%，公民复决否决本案。草案保留；提高全国支持后可免费重新核验。`;
  pushEvent(eventFrom('公民复决公投否决新法案',text,[option('接受复决结果','原预算与改革状态不变，已付协商成本保留。')],'federal-referendum'));log('公民复决公投否决新法案',text);showPoliticalEvent();return;
 }
 if(returned&&regime().id==='presidential'){
  b.chamber108.stage='delayed';b.enactAt108=s.q+2;bicameral108().delayed.push(JSON.parse(JSON.stringify(b)));pstate().bill=null;
  archiveChamberVote108(b,'scheduled');notice('议案延缓实施',b.title+'将在第 '+b.enactAt108+' 季度开始时生效；届时支付改革费用并开始计算执行期。预算生效前继续使用现行预算。');return;
 }
 pstate().bill=null;enactOrdinary108(b);
}
function retryReferendum108(){const b=pstate().bill;if(s.ended||!isFederal108()||b?.chamber108?.stage!=='referendum')return;if(s.approval<50)return toast('全国支持率尚未达到50%');finalizeOrdinary108(b);pSave()}
const voteBillBeforeBicameral108=voteBill;
voteBill=function(){
 const b=pstate().bill;if(!hasUpper108()||!b||!['budget','reform'].includes(b.kind))return voteBillBeforeBicameral108();
 if(s.ended)return;if(b.chamber108?.stage==='upper')return toast('请前往'+upperName108()+'手动复审');if(b.chamber108?.stage==='referendum')return retryReferendum108();
 if(!spendAction('vote'))return;
 const rate=billPassRate104();if(rate<=50){mod({approval:-2,stability:-1});pstate().confidenceLoss++;noteDecision('议程表决失败',{authority:0});log('议程受阻',b.title+'院内支持率 '+fmt(rate,2)+'%，未超过50%。');pSave();return}
 if(b.chamber108?.stage==='returned'){b.chamber108.lowerRate=rate;b.chamber108.penalty=billStabilityPenalty();finalizeOrdinary108(b,true)}
 else{b.chamber108=chamberTicket108(b,rate,billStabilityPenalty());chamberView108='upper';log('议案送交复审',b.title+'获'+regime().body+' '+fmt(rate,2)+'%支持，送交'+upperName108()+'。');}
 pSave();
};
const submitBeforeBicameral108=submitReform;
submitReform=function(uid){if(hasUpper108()&&constitution().docket)return toast('请先完成或撤回宪制议案');const offer=v3().offers.find(o=>o.uid===uid);if(offer&&bicameral108()?.delayed.some(b=>b.kind==='reform'&&b.id===offer.catalog))return toast('此改革已通过，正在等待生效');if(hasUpper108())chamberView108='lower';return submitBeforeBicameral108(uid)};
const budgetBeforeBicameral108=proposeBudget;
proposeBudget=function(){if(hasUpper108()&&constitution().docket)return toast('请先完成或撤回宪制议案');if(bicameral108()?.delayed.some(b=>b.kind==='budget'))return toast('已有预算等待生效，实施后才能提交下一份预算');if(hasUpper108())chamberView108='lower';return budgetBeforeBicameral108()};
const withdrawBeforeBicameral108=withdrawBill;
withdrawBill=function(){if(hasUpper108()&&pstate().bill?.chamber108)archiveChamberVote108(pstate().bill,'withdrawn');return withdrawBeforeBicameral108()};

function bicameralAmendmentText108(){return isFederal108()?`联邦修宪由国民院议长受理，直接送联邦院手动复审，不需国民院三分之二支持。复审通过后启动三季度司法审查，司法赞成达到半数且地区加权支持率超过50%才可生效。若被退回，国民院过半复议后送审。释宪不经两院复审。`:`修宪先在${regime().body}取得三分之二院内支持，再交${upperName108()}手动复审；复审获过半支持后，才开始三季度最高司法机关审查。${regime().id==='theorepublic'?'监护委员会可以驳回修宪案，导致流案。':`退回后可由${regime().body}再次取得三分之二支持，直接送司法审查。`}${regime().id==='presidential'?'退回后重获通过的修宪案，在司法通过后再延缓两个季度生效。':''}释宪不增加上院程序。`}
federalAmendmentText108=function(){return bicameralAmendmentText108()};
const menuBeforeBicameral108=constitutionalMenu;
constitutionalMenu=function(mode='interpret'){menuBeforeBicameral108(mode);if(hasUpper108()&&mode==='amend')$('modal').innerHTML=$('modal').innerHTML.replace(/<h2>提出修宪<\/h2><p>[\s\S]*?<\/p>/,`<h2>提出修宪</h2><p>提出消耗1行动点，进入宪法修订局势。${bicameralAmendmentText108()}</p>`)};
const memberBeforeBicameral108=meetMember;
meetMember=function(id){if(hasUpper108()){chamberView108='lower';if(tab==='assembly')render()}memberBeforeBicameral108(id);if(hasUpper108()&&id===0)$('modal').innerHTML=$('modal').innerHTML.replace(/(<section class="constitution-member"><h3>宪制议程<\/h3>)<p>[\s\S]*?<\/p>/,`$1<p>${bicameralAmendmentText108()}</p>`)};
const proposeBeforeBicameral108=proposeConstitution;
proposeConstitution=function(mode,action,target){
 if(!hasUpper108()||mode!=='amend'){if(hasUpper108())chamberView108='lower';return proposeBeforeBicameral108(mode,action,target)}
 const c=constitution(),spec=constitutionalSpec(mode,action,target);if(s.ended||!spec)return toast('此修宪选项尚未开放或已失效');
 if(c.docket||pstate().bill)return toast('请先完成或撤回当前议案');if(!spendAction())return;
 const federal=isFederal108(),d={...spec,id:c.nextDocket++,kind:'constitution',stage:federal?'upper':'legislature',route:'assembly',created:s.q,sourceRegime:regime().id,reviewStarted:null,reviewDeadline:null,legislativeRate:null,bicameralVersion108:1};
 if(federal){d.procedure='federal108';d.chamber108=chamberTicket108(d,null)}
 if(action==='pluralism')d.admission={weighted:electionForecast().total,stability:s.stability};
 c.docket=d;pstate().bill=d;d.situationId=startSituation('amendment').id;
 noteDecision('提出'+d.title,{law:1},[],null,1,null,{kind:'procedure'});log('修宪提案',d.title+'已交'+(federal?upperName108():regime().body)+'审议。');
 $('modal').close();tab='assembly';chamberView108=federal?'upper':'lower';pSave();
};
function beginJudicialAfterUpper108(d){
 d.stage='review';d.reviewStarted=s.q;d.reviewDeadline=s.q+3;d.route=constitution().authority==='assembly'?'assembly':'court';
 pstate().bill=d.route==='assembly'?d:null;d.chamber108.stage='judicial';
 log('修宪案进入司法审查',d.title+'已完成立法复审，司法期限至第 '+d.reviewDeadline+' 季度开始时。');checkAmendmentReview107();
}
const voteConstitutionBeforeBicameral108=voteConstitution;
voteConstitution=function(force=false){
 const d=amendmentInProgress107();if(!hasUpper108()||!d||!d.bicameralVersion108&&!['legislature','returned'].includes(d.stage))return voteConstitutionBeforeBicameral108(force);
 if(s.ended||force)return;if(d.stage==='upper')return toast('请到'+upperName108()+'手动复审');if(d.stage==='review'){checkAmendmentReview107();pSave();return}
 if(!constitutionalSpec('amend',d.action,d.target))return toast('此修宪目标已失效，请撤回');
 if(!spendAction('amendment-legislative-vote'))return;const rate=billPassRate104(),passes=isFederal108()?rate>50:rate+1e-9>=100*2/3;
 if(!passes){toast('未达到修宪表决门槛，议案保留');pSave();return}
 const penalty=billStabilityPenalty();if(penalty)mod({stability:-penalty});d.bicameralVersion108=1;if(!isFederal108())d.legislativeRate=rate;
 if(d.stage==='returned'){d.chamber108.lowerRate=rate;if(regime().id==='presidential')d.executionDelay108=2;beginJudicialAfterUpper108(d)}
 else{d.stage='upper';d.chamber108=chamberTicket108(d,rate);pstate().bill=d;chamberView108='upper';log('修宪案送交复审',d.title+'已获三分之二支持，送交'+upperName108()+'；司法审查尚未开始计时。')}
 $('modal').close();pSave();
};
const checkReviewBeforeBicameral108=checkAmendmentReview107;
checkAmendmentReview107=function(){const d=amendmentInProgress107();if(d&&(d.stage!=='review'||d.ratified108))return;return checkReviewBeforeBicameral108()};
const finishAmendmentBeforeBicameral108=finishAmendment107;
finishAmendment107=function(success,reason){
 const d=amendmentInProgress107();if(success&&d?.executionDelay108===2&&!d.ratified108){d.ratified108={due:s.q+2,reason};d.chamber108.stage='delayed';notice('修宪案延缓生效',d.title+'已通过司法审查，将在第 '+d.ratified108.due+' 季度生效；无需再次表决。');return}
 if(d?.chamber108)archiveChamberVote108(d,success?'amendment-enacted':'amendment-failed');
 const result=finishAmendmentBeforeBicameral108(success,reason);initializeBicameral108();return result;
};
const withdrawConstitutionBeforeBicameral108=withdrawConstitution;
withdrawConstitution=function(){const d=amendmentInProgress107();if(d?.stage==='upper'||d?.stage==='returned'){if(s.ended)return;finishAmendment107(false,'政府在立法复审阶段撤回修宪案。');$('modal').close();pSave();return}return withdrawConstitutionBeforeBicameral108()};
const thresholdBeforeBicameral108=threshold;
threshold=function(){if(hasUpper108()){const d=amendmentInProgress107();if(d?.stage==='returned')return isFederal108()?50:100*2/3;if(!d&&pstate().bill?.kind!=='constitution')return 50}return thresholdBeforeBicameral108()};
const transitionBeforeBicameral108=transitionDemocracy;
transitionDemocracy=function(...args){const result=transitionBeforeBicameral108(...args);initializeBicameral108();return result};

// Representative agreements are paid once per bill, never permanent agenda increases.
function upperDemands108(person,b=upperBill108()){
 if(!b)return [];if(person.speaker)return [
  {key:'conference',label:'召开跨团体审议会议',bonus:5,values:{cost:.65,stability:-1},axes:{law:1,elite:1}},
  {key:'guarantees',label:'接受全院联合监督安排',bonus:10,values:{cost:1.1,approval:-3,confidence:-2},axes:{law:2,authority:-1,elite:2}}
 ];
 const g=bicameral108().upper.groups.find(g=>g.id===person.group),view=g.view;
 return [{key:'agreement',label:view==='establishment'?'通过地方商会补偿措施':view==='progressive'?'设立劳动者与公共服务保障金':view==='clerical'?'保障地方教务与慈善基金':'设置财产保障与转型补偿条款',bonus:15,values:view==='progressive'?{cost:.4,confidence:-1}:view==='clerical'?{cost:.35,judicial:-1}:view==='conservative'?{cost:.35,approval:-1}:{cost:.3},axes:view==='progressive'?{welfare:2}:view==='clerical'?{authority:1,law:-1}:view==='conservative'?{market:1,elite:1}:{elite:1}}];
}
function meetUpper108(id){
 const u=bicameral108()?.upper,m=u?.members.find(x=>x.id===id);if(!m)return;const g=u.groups.find(g=>g.id===m.group),b=upperBill108(),accepted=b?.chamber108.agreements.some(a=>a.member===id&&(m.speaker||a.q===s.q));
 modal(`<span class="tag">${upperOfficerTitle108(m.speaker)}</span><h2>${esc(m.name)}</h2><p>${esc(g.name)} · ${upperViewName108(g.view)} · 个人关系 ${fmt(m.relation,1)}</p><p>${UPPER_VIEWS108[g.view].text}</p>${honourDescription107(m)}${b?`<h3>本案修订要求 · ${esc(b.title)}</h3><div class="choices">${upperDemands108(m,b).map(a=>`<button onclick="acceptUpperDemand108(${id},'${a.key}')" ${s.ended||accepted||pstate().ap<1?'disabled':''}>${a.label}<small>${impactText(a.values)}；${m.speaker?'所有团体':'本团体'}本案临时议程倾向＋${a.bonus}。1行动点；${m.speaker?'议长每案限一项':'代表每季可接受一项，可继续本案协商'}。</small></button>`).join('')}</div>${accepted?'<p>已接受本次修订条件，加成持续至结案。</p>':''}`:'<p>收到待复审议案后，对方将提出具体修订要求。</p>'}${regime().id==='symbolic'?`<details><summary>人事安排</summary><p>撤换消耗1行动点、全国支持−1、政治稳定−1；职位所属倾向与席位比例不变。</p><button onclick="replaceUpperMember108(${id})" ${s.ended?'disabled':''}>解除现职并任命接替者</button></details>`:''}<button onclick="$('modal').close()">结束会见</button>`);
}
function acceptUpperDemand108(id,key){
 const b=upperBill108(),m=bicameral108()?.upper.members.find(m=>m.id===id),a=m&&upperDemands108(m,b).find(a=>a.key===key);
 if(!a||!b||s.ended||b.chamber108.agreements.some(x=>x.member===id&&(m.speaker||x.q===s.q))||!spendAction())return;
 mod(a.values);for(const g of bicameral108().upper.groups)if(m.speaker||g.id===m.group)b.chamber108.temp[g.id]=Math.min(100,(b.chamber108.temp[g.id]||0)+a.bonus);
 b.chamber108.agreements.push({member:id,key,bonus:a.bonus,q:s.q});noteDecision('接受'+upperName108()+'修订条件：'+a.label,a.axes,[],null,1,null,{kind:'interaction'});
 log('立法协商',`${m.name}提出的“${a.label}”获接受；仅提高${b.title}的临时议程倾向。`);$('modal').close();pSave();
}
function replaceUpperMember108(id){
 const u=bicameral108()?.upper,m=u?.members.find(m=>m.id===id);if(regime().id!=='symbolic'||!m||!spendAction('upper-personnel:'+id))return;
 const name=personName();mod({approval:-1,stability:-1});m.baseName=name;m.name=name;m.honour=null;
 // Stable office ID retains this bill's agreement cap, preventing replacement exploits.
 noteDecision('任命'+upperOfficerTitle108(m.speaker),{authority:1,elite:1},[],null,1,null,{kind:'interaction'});$('modal').close();pSave();
}
function symbolicEffects108(d){return {stability:d.establishment*.1-d.conservative*.1,approval:-d.establishment*.1+d.progressive*.1,confidence:-d.progressive*.1+d.conservative*.2,relation:-d.progressive*.1}}
function symbolicSet108(key,value){const u=bicameral108()?.upper;if(regime().id!=='symbolic'||!u||u.formed||!Object.hasOwn(u.draft,key))return;u.draft[key]=clamp(Math.trunc(Number(value)||0),0,100);save();const node=$('upper-composition-result');if(node)node.innerHTML=symbolicPreview108();const field=$('upper-input-'+key);if(field)field.value=u.draft[key]}
function symbolicPreview108(){const d=bicameral108().upper.draft,total=Object.values(d).reduce((a,b)=>a+b,0),e=symbolicEffects108(d);return `<b>已分配 ${total}% / 100%</b><p>${impactText(e)}。</p><p>以上为组建时的一次性影响；全部下院党派关系均受影响。</p><button class="primary" onclick="formSenate108()" ${total!==100||s.ended?'disabled':''}>组建新一届参议院</button>`}
function formSenate108(){
 const u=bicameral108()?.upper;if(regime().id!=='symbolic'||!u||u.formed||s.ended||Object.values(u.draft).reduce((a,b)=>a+b,0)!==100)return;
 const prior=s.rng;s.rng=hash(s.seed+'|symbolic-senate108');
 try{
  const player=playerFactionId107(),share=factionSeatShare107(pstate().factions[player]),views=Object.keys(u.draft),others=pstate().factions.filter(f=>f.id!==player),otherWeights=others.map(()=>1+rand()*4),otherShares=allocateUnits107(otherWeights,100-share);
  u.partyShares=pstate().factions.map(f=>({id:f.id,share:f.id===player?share:otherShares[others.findIndex(x=>x.id===f.id)]}));
  u.groups=[];const rows=views.map(k=>u.draft[k]);
  // Preserve party correlations internally, then combine each ideology into one bloc.
  const parties=[u.partyShares.find(x=>x.id===player),...u.partyShares.filter(x=>x.id!==player)];
  for(const party of parties){const alloc=allocateUnits107(rows,party.share);for(let i=0;i<views.length;i++)if(alloc[i]){const view=views[i];u.groups.push({id:u.groups.length,lowerId:party.id,view,share:alloc[i],relation:60,agenda:60,decay:0});rows[i]-=alloc[i]}}

  u.formed=true;u.term=1;u.playerGroup=null;consolidateUpperBlocs108(u);mod(symbolicEffects108(u.draft));
  noteDecision('组建参议院',{authority:(u.draft.establishment-u.draft.progressive)/25,welfare:(u.draft.progressive-u.draft.conservative)/25,market:u.draft.conservative/25},[],null,1,null,{kind:'coalition'});
  log('参议院组建',`50席依三类倾向组成；玩家党籍占比${share}%，与众议院对应。`);record();
 }finally{s.rng=prior}
 pSave();
}
const maintenanceBeforeBicameral108=politicalMaintenance;
politicalMaintenance=function(){
 const state=bicameral108();if(state&&state.upper.lastAgendaQ<s.q){const u=state.upper;u.lastAgendaQ=s.q;for(const g of u.groups)if(g.id!==u.playerGroup)g.decay=Math.min(100,g.decay+2)}
 maintenanceBeforeBicameral108();
};

const economicBeforeBicameral108=economicQuarter;
economicQuarter=function(){const state=bicameral108();
 // Apply scheduled laws before this quarter's cabinet activity, once only.
 if(state&&!s.ended){const due=state.delayed.filter(b=>b.enactAt108<=s.q);state.delayed=state.delayed.filter(b=>b.enactAt108>s.q);for(const b of due)enactOrdinary108(b);}
 const d=amendmentInProgress107();if(d?.ratified108&&s.q>=d.ratified108.due&&!s.ended)finishAmendment107(true,d.ratified108.reason+'延缓期届满，条款生效。');
 economicBeforeBicameral108();
};

function upperDiagram108(){
 const u=bicameral108().upper,units=u.formed?u.groups.flatMap(g=>Array.from({length:g.share},()=>g)):Array(100).fill(null),benches=['constitutional','westminster'].includes(regime().id),points=[];
 if(benches){for(let i=0;i<50;i++)points.push({x:28+(i<25?0:174)+(i%5)*16,y:22+Math.floor(i%25/5)*20})}
 else{[12,17,21].forEach((count,row)=>{for(let i=0;i<count;i++){const angle=Math.PI-(i+.5)/count*Math.PI,radius=66+row*25;points.push({x:132+radius*Math.cos(angle),y:132-radius*Math.sin(angle),angle,row})}});points.sort((a,b)=>b.angle-a.angle||a.row-b.row)}
 const defs=[],shapes=points.map((p,i)=>{const a=units[i*2],b=units[i*2+1],ca=a?UPPER_VIEWS108[a.view].color:'#c8c1ac',cb=b?UPPER_VIEWS108[b.view].color:ca;let fill=ca;
  if(ca!==cb){const id='upper-seat108-'+i;defs.push(`<linearGradient id="${id}"><stop offset="50%" stop-color="${ca}"/><stop offset="50%" stop-color="${cb}"/></linearGradient>`);fill='url(#'+id+')'}
  const title=a?`${a.name}${a!==b?' / '+b.name:''}`:'空缺';return benches?`<rect class="upper-seat108" x="${p.x}" y="${p.y}" width="10" height="10" rx="1" fill="${fill}"><title>${esc(title)}</title></rect>`:`<circle class="upper-seat108" cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="5" fill="${fill}"><title>${esc(title)}</title></circle>`;
 });
 return `<div class="seat-strip seat-chamber upper-seat-chart" data-layout="${benches?'benches':'semicircle'}"><svg viewBox="0 0 ${benches?'300 130':'264 148'}" role="img" aria-label="${upperName108()}50席${u.formed?'倾向分布':'空缺'}图"><defs>${defs.join('')}</defs>${shapes.join('')}</svg></div>`;
}
function chamberSwitch108(){return `<nav class="chamber-switch108" aria-label="选择议院"><button onclick="switchChamber108('lower')" aria-pressed="${chamberView108==='lower'}" class="${chamberView108==='lower'?'primary':''}">${regime().body}</button><button onclick="switchChamber108('upper')" aria-pressed="${chamberView108==='upper'}" class="${chamberView108==='upper'?'primary':''}">${upperName108()}${upperBill108()?redDot107('有待复审议案'):''}</button></nav>`}
function upperRules108(){return `<details class="upper-rules108"><summary>查看两院审议细则</summary><p>预算和结构性改革：${regime().body}院内支持率超过50%后送交${upperName108()}，手动点击复审且不消耗行动点；复审同样须超过50%。未完成程序前，现行预算不变，改革不扣启动费用、不计算执行期。</p><p>${regime().id==='theorepublic'?'宪法监护委员会驳回改革和修宪即流案；预算退回国民议会，复议过半后直接生效。':`未通过则退回${regime().body}；复议消耗1行动点，普通议案过半、修宪三分之二后不再返回上院。${regime().id==='presidential'?'总统制被退回的预算和改革再通过后延缓两季度；修宪司法通过后延缓两季度生效。':''}`}</p><p>${bicameralAmendmentText108()}</p>${isFederal108()?'<p>联邦预算与改革完成两院程序后，仍需全国支持率达到50%。公民复决未通过时草案保留，提高民意后可免费重新核验。</p>':''}<p>上院折算倾向50时无支持，51时支持本团体10%，60时全票支持，按席位占比加权。低于50不额外扣稳定。议长每案可选择一项全体加成（最多10），各代表每季可接受一项条件、继续争取本案支持；接受条件消耗1行动点，已付代价不因撤案退回。非玩家团体议程倾向每季−2。</p><p>50个席位标识合计100%权重，每个标识代表2%；出现奇数比例时用分色准确显示边界，不改变票数。</p></details>`}
function upperDocket108(){const b=upperBill108();return `<section class="card" id="upper-docket108"><span class="tag">${upperName108()} · 复审</span>${b?`<h2>${esc(b.title)}</h2><p>${esc(b.description)}</p><div class="big-number" data-guide="upper-support"><b>${fmt(upperSupport108(b),2)}</b><small>% 院内支持率</small></div><p>超过50%通过。请先与议长或代表协商，再决定是否启动复审表决。</p><button class="primary" onclick="upperReview108()" ${s.ended||!bicameral108().upper.formed?'disabled':''}>进行复审 · 不消耗行动点</button> <button onclick="${b.mode==='amend'?'withdrawConstitution':'withdrawBill'}()">撤回议案</button>`:'<h2>暂无待复审议案</h2><p>下院通过的预算、结构性改革与宪法修正案将在此接收。</p>'}${upperRules108()}</section>`}
function upperPage108(){
 const u=bicameral108().upper;
 const composition=regime().id==='constitutional'?`贵族组成 ${u.nobleShare}% · 贵族保守派至少40%`:regime().id==='theorepublic'?'全部席位由教士组成 · 教法保守派占60%—80%':regime().id==='symbolic'?'任命制参议院 · 按政治倾向配置':'本院独立议事 · 与下院分开协商';
 return `<div class="political-banner"><div><span class="tag">${regime().name}</span><h2>${upperName108()}</h2><p>${composition}</p></div><div class="action-count"><b>50</b><span>本院席位${u.formed?'':' · 全部空缺'}</span></div></div><div class="grid"><section class="card">${upperDiagram108()}${u.formed?u.groups.filter(g=>g.share>0).map(g=>`<div class="faction-row upper-faction108"><div><b style="color:${UPPER_VIEWS108[g.view].color}">${esc(g.name)}</b>${g.id===u.playerGroup?'<span class="player-party-badge">玩家所属</span>':''}<small>席位占比${g.share}% · 团体关系 ${fmt(g.relation,1)} · 议程倾向 ${fmt(upperAgenda108(g),1)}</small><small>${upperViewName108(g.view)}</small><details><summary>查看细则</summary><p>${UPPER_VIEWS108[g.view].text}</p><p>基础倾向 ${fmt(g.agenda-g.decay+(g.relation-60)*.65,1)} · 本案政策偏好 ${fmt(upperAffinity108(g),1)} · 本案协商加成 ${fmt(upperBill108()?.chamber108.temp[g.id]||0,1)}。</p><p>院内支持率贡献 ${fmt(g.share*upperRatio108(g),2)} 个百分点。本院按政治倾向组成独立党团，与下院分开协商。</p></details></div><span class="badge">${fmt(upperRatio108(g)*100,1)}% 支持</span></div>`).join(''):`<h3>组建参议院</h3><p>分配三类倾向，合计100%后确认组建。社会进步在此代表社会民主路线。</p><div class="upper-composition108">${Object.entries(u.draft).map(([key,value])=>`<label><span>${upperViewName108(key)}${key==='progressive'?'（社会民主）':''}</span><div><button aria-label="减少${upperViewName108(key)}" onclick="symbolicSet108('${key}',bicameral108().upper.draft.${key}-1)">−</button><input id="upper-input-${key}" type="number" min="0" max="100" step="1" value="${value}" aria-label="${upperViewName108(key)}席位占比" oninput="symbolicSet108('${key}',this.value)"><span>%</span><button aria-label="增加${upperViewName108(key)}" onclick="symbolicSet108('${key}',bicameral108().upper.draft.${key}+1)">＋</button></div></label>`).join('')}</div><div id="upper-composition-result" aria-live="polite">${symbolicPreview108()}</div>`}</section>${upperDocket108()}</div>${u.formed?`<div class="section-label"><h3>主要成员</h3><span>通过人员获取本案修订要求</span></div><div class="member-grid">${u.members.map(m=>{const g=u.groups.find(g=>g.id===m.group);return `<article class="card person"><span class="tag">${upperOfficerTitle108(m.speaker)}</span><h3>${esc(m.name)}</h3><p>${esc(g.name)} · ${upperViewName108(g.view)}</p><p>${UPPER_VIEWS108[g.view].text}</p><button onclick="meetUpper108(${m.id})">会见 / 修订要求</button></article>`}).join('')}</div>`:''}`;
}
function lowerPendingCard108(){const b=pstate().bill;if(!b?.chamber108||b.kind==='constitution')return '';const stage=b.chamber108.stage;
 return `<section class="card" id="lower-docket108"><span class="tag">${regime().body} · ${stage==='upper'?'已送交复审':stage==='returned'?'退回复议':'公民复决'}</span><h2>${esc(b.title)}</h2><p>${esc(b.description)}</p>${stage==='upper'?`<p>本院已通过，政策尚未生效。正在等待${upperName108()}复审。</p><button class="primary" onclick="switchChamber108('upper')">前往${upperName108()}复审</button>`:stage==='referendum'?`<p>两院程序已完成，全国支持率 ${fmt(s.approval,1)}% / 需要50%。</p><button class="primary" onclick="retryReferendum108()" ${s.approval<50?'disabled':''}>重新核验公民复决 · 不消耗行动点</button>`:`<div class="big-number" data-guide="pass-rate">${fmt(billPassRate104(),2)}<small>% 院内支持率</small></div><p>重新获得过半支持即可完成立法。${regime().id==='presidential'?'通过后延缓两个季度生效。':''}</p><button class="primary" onclick="voteBill()">重新表决 · 1 行动点</button>`} <button onclick="withdrawBill()">撤回议案</button>${upperRules108()}</section>`;
}
const assemblyBeforeBicameral108=assembly;
assembly=function(){
 if(!hasUpper108())return assemblyBeforeBicameral108();
 if(chamberView108==='upper')return chamberSwitch108()+upperPage108();
 let html=assemblyBeforeBicameral108().replace('两项均满足，预算或改革才会生效。','国民院通过后须送联邦院复审，最终生效时核验全国支持率。'),card=lowerPendingCard108();if(card)html=html.replace(/<section class="card"><h3>政府议程<\/h3>[\s\S]*?<\/section>/,card);
 html=html.replace('所需院内支持率 50%；按各党席位加权计算支持比例，达到门槛即可通过。',`本院支持率须超过50%；通过后送${upperName108()}复审，完成全部程序才生效。`).replace('方案通过'+regime().body+'审议后才会执行。',`方案通过${regime().body}后，仍须完成${upperName108()}复审。`).replace('达到 50% 即通过','超过50%才通过');
 return chamberSwitch108()+html+(bicameral108().delayed.length?`<section class="card"><h3>等待生效</h3>${bicameral108().delayed.map(b=>`<p>${esc(b.title)} · 第${b.enactAt108}季度生效 · 剩余${Math.max(0,b.enactAt108-s.q)}季度</p>`).join('')}</section>`:'');
};
const docketBeforeBicameral108=constitutionalDocketHTML;
constitutionalDocketHTML=function(){
 const d=amendmentInProgress107();if(!hasUpper108())return docketBeforeBicameral108();
 if(!d||!['upper','returned'].includes(d.stage)&&!d.ratified108)return docketBeforeBicameral108().replace('通过后才启动三季度司法审查期限。','通过后先送'+upperName108()+'复审，复审结束后才启动三季度司法审查期限。').replace('第二阶段 / 司法审查','最终阶段 / 司法审查').replace('先立法审议、再司法审查。','先完成两院立法程序、再司法审查。');
 return `<section class="card constitution-docket" id="constitutional-docket"><span class="tag">宪法修订 · ${d.ratified108?'等待生效':d.stage==='upper'?upperName108()+'复审':regime().body+'复议'}</span><h2>${esc(d.title)}</h2><p>${esc(d.description)}</p>${d.ratified108?`<p>司法审查已通过；第${d.ratified108.due}季度生效，剩余${Math.max(0,d.ratified108.due-s.q)}季度。</p>`:d.stage==='upper'?`<p>司法审查尚未开始计时。请前往${upperName108()}协商并手动复审，不消耗复审行动点。</p><button class="primary" onclick="switchChamber108('upper');$('modal').close()">前往${upperName108()}</button>`:`<p>当前院内支持率 ${fmt(billPassRate104(),2)}%；须${isFederal108()?'超过50%':'取得三分之二支持'}。通过后不再复审，直接送司法审查。</p><button class="primary" onclick="voteConstitution()">重新表决 · 1 行动点</button>`}${d.ratified108?'':' <button onclick="withdrawConstitution()">撤回修宪案</button>'}${upperRules108()}</section>`;
};
const amendmentHTMLBeforeBicameral108=amendmentDocketHTML107;
amendmentDocketHTML107=function(){const d=amendmentInProgress107();return hasUpper108()&&(d?.stage==='upper'||d?.stage==='returned'||d?.ratified108)?constitutionalDocketHTML():amendmentHTMLBeforeBicameral108()};
const progressBeforeBicameral108=situationProgress;
situationProgress=function(x){const d=amendmentInProgress107();if(x.kind==='amendment'&&hasUpper108()&&d){if(d.ratified108)return `修宪已获审查通过，第${d.ratified108.due}季度生效。`;if(d.stage==='upper')return `${upperName108()}复审中：院内支持率 ${fmt(upperSupport108(d),2)}%，须超过50%。请在该院页面手动复审，不消耗行动点。司法期限尚未开始。`;if(d.stage==='returned')return `已退回${regime().body}，须再次取得${isFederal108()?'过半':'三分之二'}院内支持；重新表决消耗1行动点。`;}return progressBeforeBicameral108(x)};
const alertsBeforeBicameral108=activeAlerts107;
activeAlerts107=function(){const out=alertsBeforeBicameral108();if(hasUpper108()&&bicameral108()&&!s.ended){if(!bicameral108().upper.formed)out.push({id:'upper-empty108',title:'参议院尚未组建',text:'请分配三类倾向的席位，合计100%后组建参议院。',tabs:['assembly'],metric:null});if(upperBill108())out.push({id:'upper-review108',title:upperName108()+'有待复审议案',text:'请会见本院议长或代表，手动启动复审；复审不消耗行动点。',tabs:['assembly'],metric:null})}return out};
const archiveBeforeBicameral108=archive;
archive=function(){return archiveBeforeBicameral108()+(hasUpper108()?`<section class="card"><h3>两院议事档案</h3><p>${regime().body} · ${upperName108()}（50席）</p><details><summary>查看立法记录</summary>${bicameral108().history.slice(-30).reverse().map(h=>`<div class="row"><span>${date(h.q)} · ${esc(h.title)}</span><b>${({'upper-approved':'复审通过',returned:'退回下院',vetoed:'流案',enacted:'已生效',scheduled:'延缓实施',withdrawn:'已撤回','amendment-enacted':'修宪生效','amendment-failed':'修宪失败'})[h.result]||h.result}</b></div>`).join('')||'<p>尚无两院立法记录。</p>'}</details></section>`:'')};

const validBeforeBicameral108=validSave;
validSave=function(v){
 try{
  const state=v?.bicameral108;if(!state)return validBeforeBicameral108(v);
  const finite=(x,min=0,max=100)=>Number.isFinite(x)&&x>=min&&x<=max,integer=(x,min=0,max=100)=>Number.isInteger(x)&&x>=min&&x<=max;
  if(![1,2].includes(state.version)||!CHAMBERS108[state.regime]||state.regime!==v.political.regime||!integer(state.nextBill,1,1e9)||!Array.isArray(state.delayed)||!Array.isArray(state.history))return false;
  const u=state.upper;if(!u||typeof u.formed!=='boolean'||!Array.isArray(u.groups)||u.groups.length>(state.version===1?15:state.regime==='theorepublic'?4:3)||!Array.isArray(u.members)||!integer(u.lastAgendaQ,0,v.q)||!integer(u.term,0,1e6)||!integer(u.nobleShare)||!integer(u.clergyShare))return false;
  if(!u.formed){if(state.regime!=='symbolic'||u.groups.length||u.members.length||!u.draft||Object.keys(u.draft).length!==3||!['establishment','progressive','conservative'].every(k=>integer(u.draft[k])))return false}
  else{
   if(!u.groups.length||u.groups.reduce((n,g)=>n+g.share,0)!==100||new Set(u.groups.map(g=>g.id)).size!==u.groups.length||u.groups.some(g=>!integer(g.id,0,20)||!UPPER_VIEWS108[g.view]||!integer(g.share)||!finite(g.relation)||!finite(g.agenda)||!finite(g.decay)||typeof g.name!=='string'||!g.name.length||g.name.length>60))return false;
   if(state.version===2){
    const lowerIds=new Set(v.political.factions.map(f=>f.id)),lowerNames=new Set(v.political.factions.map(f=>f.name));
    if(new Set(u.groups.map(g=>g.view)).size!==u.groups.length||new Set(u.groups.map(g=>g.name)).size!==u.groups.length||!u.groups.some(g=>g.id===u.playerGroup)||u.groups.some(g=>lowerNames.has(g.name)||state.regime!=='theorepublic'&&g.view==='clerical'||g.lowerId!==null||!integer(g.share,1)||!Array.isArray(g.lowerShares)||new Set(g.lowerShares.map(x=>x.id)).size!==g.lowerShares.length||g.lowerShares.some(x=>!lowerIds.has(x.id)||!integer(x.share,1))||g.lowerShares.reduce((n,x)=>n+x.share,0)!==g.share||!integer(g.playerShare)||g.playerShare>g.share))return false;
   }
   if(u.members.length!==u.groups.filter(g=>g.share>0).length+1||u.members.filter(m=>m.speaker).length!==1||u.members.some((m,i)=>m.id!==i||typeof m.speaker!=='boolean'||!u.groups.some(g=>g.id===m.group&&g.share>0)||!finite(m.relation)||!Number.isInteger(m.last)||typeof m.baseName!=='string'||m.name!==m.baseName+(m.honour?.title||'')))return false;
   const names=[...v.political.members,...v.political.candidates,...v.constitution.judges,...(v.judicialStaff?.reserve||[])].map(p=>p.baseName||p.name);
   if(new Set(u.members.map(m=>m.baseName)).size!==u.members.length||u.members.some(m=>names.includes(m.baseName)))return false;
   if(state.regime==='constitutional'&&(u.nobleShare<50||!u.groups.some(g=>g.view==='conservative'&&g.share>=40)))return false;
   if(state.regime==='theorepublic'){const share=u.groups.filter(g=>g.view==='clerical').reduce((n,g)=>n+g.share,0);if(u.clergyShare!==100||share<60||share>80||u.members.some(m=>m.honour?.kind!=='religious'))return false}
   if(state.regime==='symbolic'&&(!Array.isArray(u.partyShares)||u.partyShares.reduce((n,x)=>n+x.share,0)!==100||u.groups.some(g=>!integer(g.playerShare)||g.playerShare>g.share)||u.partyShares.some(x=>u.groups.reduce((n,g)=>n+(state.version===1?(g.lowerId===x.id?g.share:0):g.lowerShares.filter(y=>y.id===x.id).reduce((n,y)=>n+y.share,0)),0)!==x.share)||Object.entries(u.draft).some(([view,share])=>u.groups.filter(g=>g.view===view).reduce((n,g)=>n+g.share,0)!==share)))return false;
  }
  const validBill=b=>{
   const t=b?.chamber108;if(!t||!integer(t.id,1,state.nextBill-1)||!['upper','returned','approved','referendum','delayed','judicial'].includes(t.stage)||!CHAMBERS108[t.sourceRegime]||!t.temp||!Array.isArray(t.agreements)||t.agreements.some(a=>!integer(a.member,0,20)||!integer(a.q,0,v.q)||![5,10,15].includes(a.bonus))||new Set(t.agreements.map(a=>a.member===0?'speaker':a.member+':'+a.q)).size!==t.agreements.length||Object.values(t.temp).some(n=>!finite(n,0,100))||!finite(t.penalty,0,100)||t.lowerRate!==null&&!finite(t.lowerRate)||t.upperRate!==null&&!finite(t.upperRate))return false;
   if(b.kind==='budget')return b.policies&&Object.keys(policyMeta).every(k=>Number.isFinite(b.policies[k]));
   if(b.kind==='reform')return !!REFORMS[b.id]&&Number.isInteger(b.offer);
   return b.kind==='constitution'&&b.mode==='amend';
  };
  for(const b of state.delayed)if(!validBill(b)||!['budget','reform'].includes(b.kind)||b.chamber108.stage!=='delayed'||!integer(b.enactAt108,0,1e9))return false;
  if(new Set(state.delayed.map(b=>b.chamber108.id)).size!==state.delayed.length)return false;
  const d=v.constitution.docket,b=v.political.bill;
  if(b?.chamber108&&!validBill(b)||d?.chamber108&&!validBill(d))return false;
  let copy=v;
  if(d?.bicameralVersion108){
   if(d.bicameralVersion108!==1||!['legislature','upper','returned','review'].includes(d.stage))return false;
   if(['upper','returned'].includes(d.stage)){
    if(!validBill(d)||d.chamber108.stage!==d.stage||d.reviewStarted!==null||d.reviewDeadline!==null||JSON.stringify(d)!==JSON.stringify(b))return false;
    if(d.sourceRegime!=='federal'&&(!finite(d.legislativeRate)||d.legislativeRate+1e-9<100*2/3))return false;
    const normalized={...d,stage:'legislature',route:'assembly',legislativeRate:null};copy={...v,political:{...v.political,bill:normalized},constitution:{...v.constitution,docket:normalized}};
   }
   if(d.ratified108&&(!integer(d.ratified108.due,2,1e9)||d.executionDelay108!==2||d.stage!=='review'||typeof d.ratified108.reason!=='string'))return false;
  }
  return validBeforeBicameral108(copy);
 }catch(_){return false}
};
function bicameralGuide108(entries){
 if(!hasUpper108())return;
 const add=(id,title,aliases,text)=>entries.push({id,title,aliases:[title,...aliases],text,category:'两院立法'});
 add('bicameral','两院制',Object.values(CHAMBERS108).flat(),`${regime().body}与${upperName108()}分别议事。第二院固定50席，两院团体关系、议程倾向和院内支持率独立；颜色对应各自政治倾向。君主立宪、西敏议会采用方形座席表，其余采用扇形。第二院按倾向组成至多三个独立党团，神权共和至多四个，名称不与下院重名。贵族与教士构成的硬性要求优先于下院席位映射。`);
 add('upper-support','上院院内支持率',['上院支持率','上院议程倾向','临时议程倾向'],`倾向50对应0%本团体支持，51对应10%，60对应全票，按席位占比加权；严格超过50%通过。议长和代表提出的修订要求各消耗1行动点，仅对当前议案加成，结案清除。议长每案全体加成最多10；代表每季可接受一项条件、本团体本案加成15，可跨季继续协商，累计临时加成最高100。低于50没有额外稳定惩罚。非玩家团体每季议程倾向−2。`);
 add('upper-review','上院复审',['复审','退回复议','两院审议'],`预算、改革先获下院过半支持，再手动点击第二院复审，不消耗复审行动点。复审失败退回下院，重投耗1行动点；重新通过后无需再送上院。总统制退回重投的议案延缓两个季度实施。神权共和的改革和修宪被驳回即流案，预算仍可退回复议。${isFederal108()?'联邦最终生效时还需全国支持率达到50%。':''}`);
 add('upper-composition','参议院组建',['组建新一届参议院','建制保守','共和保守','贵族保守','教法保守'],`象征性民主开局参议院50席空缺，三种倾向合计100%后组建。每1%建制保守：稳定＋0.1、支持−0.1；社会进步（社会民主）：支持＋0.1、信心−0.1、全部下院党派关系−0.1；共和保守：信心＋0.2、稳定−0.1。每种非零倾向只形成一个独立党团，最多三个，不按下院党籍继续拆分；党籍关联仅在内部保留。只有该政体可更换上院人员，其他政体不能任免。`);
 for(const e of entries){
  if(e.id==='constitutional-docket')e.text=bicameralAmendmentText108();
  if(e.id==='constitution')e.text='国家档案记载现行根本条款。'+bicameralAmendmentText108();
  if(['constitutional-transfer','pluralism-amendment','centralize-amendment'].includes(e.id))e.text=e.text.replace(/先获议事机关三分之二支持，再经当前最高司法机关半数赞成|联邦制直接进入司法审查|司法审查达到半数、公民加权支持率超过50%后|两项条件恰好达到也符合；进入修宪程序后不再反复核验。须依次通过议事机关三分之二与司法半数门槛/g,'完成两院立法程序后进入司法审查')+' '+bicameralAmendmentText108();
  if(e.id==='pass-rate')e.text='两院各自按团体席位权重计算院内支持率，普通议案都须严格超过50%。上院不适用低倾向稳定惩罚。'+bicameralAmendmentText108();
  if(e.id==='federal-referendum')e.text='联邦预算和改革先经国民院过半、联邦院复审（可退回国民院过半重投），再核验全国支持率达到50%。全国支持不足时公民复决否决，草案保留；民意恢复后免费重新核验。政府信任案、释宪不走两院程序。';
 }
}
function bicameralTutorial108(steps,scope,page){
 if(!hasUpper108()||scope==='intro'||page!=='assembly')return steps;
 const items=[{page:'assembly',id:'bicameral',selector:'.chamber-switch108',text:`这里切换${regime().body}与${upperName108()}。两院的关系和支持分别计算。`,title:'两院议事'}];
 if(chamberView108==='upper')return [...items,{page:'assembly',id:'bicameral',selector:'.upper-seat-chart',text:'50个席位标识显示本院政治倾向，颜色与下方团体对应。',title:'本院构成'},{page:'assembly',id:'upper-composition',selector:'.upper-composition108',text:'三种倾向合计100%后才能组建参议院，下面会实时预告代价与收益。',title:'组建参议院'},{page:'assembly',id:'upper-support',selector:'.upper-faction108',text:'这里显示席位占比、关系与本案议程倾向；查看细则默认收起。',title:'团体立场'},{page:'assembly',id:'upper-review',selector:'#upper-docket108',text:'先通过议长与代表协商，再手动点击复审；复审不消耗行动点，但失败可能退回或流案。',title:'手动复审'},{page:'assembly',id:'upper-support',selector:'button[onclick^="meetUpper108("]',text:'会见人员可获取修订要求；接受条件付出代价，只提高本案倾向。',title:'协商条件'}];
 for(const step of steps){if(step.id==='pass-rate')step.text='本院普通议案超过50%通过后，还须送另一院复审。修宪通常先需三分之二；联邦制从联邦院复审开始。';}
 return [...items,...steps];
}

const situationsBeforeBicameral108=situationsPage;
situationsPage=function(){const html=situationsBeforeBicameral108();return hasUpper108()?html.replace(SIT_INFO.amendment[0],bicameralAmendmentText108()).replace(SIT_INFO.amendment[1],'完成两院立法程序后，才核验三季度司法审查条件'):html};
// Every entry point that changes the constitution must also install its chamber structure.
const competitiveBeforeBicameral108=enactCompetitiveElections107;
enactCompetitiveElections107=function(...args){const result=competitiveBeforeBicameral108(...args);initializeBicameral108();return result};
const centralizeBeforeBicameral108=enactFederalCentralization108;
enactFederalCentralization108=function(...args){const result=centralizeBeforeBicameral108(...args);initializeBicameral108();return result};
