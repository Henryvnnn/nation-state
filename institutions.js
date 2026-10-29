/* Parliamentary configurations and clerical legitimacy. */
let pendingChambers='auto';
const INSTITUTION_PARTIES={
 conservative:['国民保守党','共和党','国家保守党'],market:['自由党','自由民主党','自由进步党'],
 social:['社会民主党','工党','民主劳动党'],law:['社会自由党','公民自由党','自由公民党'],
 local:['地方自治党','地区联盟党','农民民主党'],green:['生态绿党','绿色未来党','绿色联盟党'],
 reform:['公民改革党','民主革新党','改革进步党'],state:['国家建设党','发展团结党','公共建设党']
};
function institutions(){return s?.institutions}
function twoPartyPresidency(){return pstate()?.regime==='presidential'&&institutions()?.regime==='presidential'&&institutions().partySystem==='two'}
const regimeBeforeInstitutions=regime;
regime=function(){const r=regimeBeforeInstitutions(),i=institutions();return i?.regime===r.id?{...r,body:i.lowerName}:r};
function makeInstitutionConfig(fresh=false){
 const id=pstate().regime,eligible=['presidential','semi'].includes(id),manual=fresh&&selectedRegime===id&&eligible&&['one','two'].includes(pendingChambers);
 return {version:1,regime:id,origin:fresh?'new':'continued',partySystem:id==='presidential'&&fresh&&rand()<.5?'two':'multi',
  twoChambers:eligible?(fresh?(manual?pendingChambers==='two':rand()<(id==='presidential'?.75:.5)):!!s.bicameral108):!!CHAMBERS108[id],
  lowerName:id==='semi'&&fresh?pick(['众议院','国民议会']):REGIMES.find(r=>r.id===id).body,
  ...(RELIGIOUS_REGIMES107.includes(id)?{clergy:{loyalty:100,lastQ:s.q,rebellionId:null,history:[]}}:{})};
}
function uniqueInstitutionParty(key,used){let name=pick(INSTITUTION_PARTIES[key].filter(n=>!used.has(n)));if(!name)name=countryStem()+INSTITUTION_PARTIES[key][0];used.add(name);return name}
function rebuildOpeningParties(specs){
 const p=pstate(),used=new Set();p.factions=specs.map((x,id)=>({id,name:x.name||uniqueInstitutionParty(x.key,used),profileKey:x.key,ideologyLabel:x.label||FACTION_PROFILES103[x.key].name,seats:x.seats,relation:50,pledge:null}));
 p.candidates.forEach((c,i)=>c.faction=i%specs.length);
 const old=p.members.slice(),officers=old.slice(0,4);officers.forEach((m,i)=>m.faction=i%specs.length);p.members=officers;
 for(const f of p.factions){const prior=old[4+f.id];p.members.push(prior?{...prior,faction:f.id}:{id:p.members.length,name:personName(),faction:f.id,trait:0,relation:50+Math.floor(rand()*16),last:-1})}
 p.members.forEach((m,id)=>{m.id=id;m.regionId=id%v3().regions.length;m.region=v3().regions[m.regionId].name;m.role=id<4?memberRole(id):p.factions[m.faction].name+'党团总召'});
 p.playerFaction=pick(p.factions.filter(f=>f.seats>=Math.min(...p.factions.map(f=>f.seats).sort((a,b)=>b-a).slice(0,twoPartyPresidency()?2:3)))).id;
 p.factions.forEach(f=>f.relation=f.id===p.playerFaction?67:50);p.rulingParty=p.factions[p.playerFaction].name;
}
const democraticPartyBeforeInstitutions=initializeDemocraticParty107;
initializeDemocraticParty107=function(){
 if(!creatingWorld)return democraticPartyBeforeInstitutions();
 s.institutions=makeInstitutionConfig(true);
 if(twoPartyPresidency()){
  const first=pick(['market','conservative']),second=pick(['law','social']),other=pick(Object.keys(INSTITUTION_PARTIES).filter(k=>k!==first&&k!==second));
  const independent=2+Math.floor(rand()*7),firstShare=42+Math.floor(rand()*13);
  rebuildOpeningParties([{key:first,label:first==='market'?'自由主义':'保守主义',seats:firstShare},{key:second,label:second==='law'?'社会自由主义':'社会民主主义',seats:100-firstShare-independent},{key:other,name:'无党籍党团',seats:independent}]);
 }else if(regime().id==='semi'){
  const keys=shuffled107(['conservative','market','social','law','local','green','reform']),seats=shuffled107(pick([[29,26,22,8,6,5,4],[31,25,21,9,6,5,3],[28,27,23,8,6,5,3]]));
  rebuildOpeningParties(keys.map((key,i)=>({key,seats:seats[i]})));
 }else democraticPartyBeforeInstitutions();
};
function institutionAffinity(f,bill){
 if(!bill)return 0;const key=f.profileKey;
 if(bill.kind==='reform'){
  const r=REFORMS[bill.id];if(!r)return 0;
  if(['social','green','law'].includes(key))return (r.axes.welfare||0)*1.2-(r.axes.market||0)*.5;
  if(key==='market')return (r.axes.market||0)*1.5;
  if(key==='state')return (r.axes.authority||0)+(r.axes.market||0)*-1;
  return key==='reform'?5:key==='local'?2:1;
 }
 return {conservative:5,market:-2,social:2,law:0,local:0,green:0,reform:1,state:3}[key]||0;
}
function closestSemiCoalition(){
 const p=pstate(),own=playerFactionId107(),party=p.factions[own],others=p.factions.filter(f=>f.id!==own).map(f=>({f,d:factionDistance107(party,f),tie:rand()})).sort((a,b)=>a.d-b.d||a.tie-b.tie).map(x=>x.f);
 const ids=[own,others[0].id];if(coalitionShare107(ids)<50){const next=others.slice(1).find(f=>coalitionShare107([...ids,f.id])>=50);if(next)ids.push(next.id);else return [own,...others.slice().sort((a,b)=>b.seats-a.seats).slice(0,2).map(f=>f.id)]}return ids;
}
const alignBeforeInstitutions=alignPeople103;
alignPeople103=function(){
 const opening=creatingWorld&&regime().id==='semi'&&institutions()?.origin==='new'&&!institutions().coalitionPrepared;
 if(opening){rules103().coalition=closestSemiCoalition();institutions().coalitionPrepared=true}
 const result=alignBeforeInstitutions();
 if(opening){
  const used=new Set(),coalition=rules103().coalition;
  cabinetSlots103().forEach((slot,i)=>{const c=pstate().candidates.find(c=>c.faction===coalition[i%coalition.length]&&!used.has(c.id));if(c){used.add(c.id);pstate().cabinet[slot]={candidate:c.id,task:'balanced'}}});
 }
 return result;
};
const alliesBeforeInstitutions=initializeAllies107;
initializeAllies107=function(){
 if(regime().id!=='semi')return alliesBeforeInstitutions();
 if(!institutions()?.coalitionPrepared)rules103().coalition=closestSemiCoalition();
 for(const id of allies107()){const f=pstate().factions[id];f.relation=Math.round(600+rand()*100)/10;f.agendaOffset107=(f.agendaOffset107||0)+60-support(f)}
 log('联合政府成立',allies107().map(id=>pstate().factions[id].name).join('、')+'加入执政联盟，联盟席位占比'+fmt(coalitionShare107(),0)+'%。总理与阁员由联盟党派出任；盟友失信将引发政府危机。');
};
function ensureInstitutions(){
 if(!s?.political)return;
 if(institutions()?.regime===pstate().regime)return;
 const prior=institutions();s.institutions=makeInstitutionConfig(false);
 // A continuing legislature keeps its membership and established chamber structure.
 if(prior&&['presidential','semi'].includes(pstate().regime)){institutions().twoChambers=!!s.bicameral108||rand()<(pstate().regime==='presidential'?.75:.5);if(pstate().regime==='semi')institutions().lowerName=pick(['众议院','国民议会'])}
 if(!institutions().twoChambers&&s.bicameral108){institutions().formerUpper=s.bicameral108;delete s.bicameral108;chamberView108='lower'}
}
function buildTwoPartySenate(u){
 const p=pstate();u.groups=p.factions.map(f=>{const original=u.groups.find(g=>g.lowerId===f.id)||{},view=f.id===2?'establishment':f.profileKey==='social'||f.profileKey==='law'?'progressive':'conservative';return {id:f.id,lowerId:null,lowerShares:[{id:f.id,share:factionSeatShare107(f)}],name:f.name,view,share:factionSeatShare107(f),playerShare:f.id===playerFactionId107()?factionSeatShare107(f):0,relation:original.relation??60,agenda:original.agenda??58,decay:0}});
 u.playerGroup=playerFactionId107();populateUpperMembers108(u);
}
// World creation controls. A random regime never inherits a manual chamber override.
const pickerBeforeInstitutions=regimePicker;
regimePicker=function(){return pickerBeforeInstitutions()+`<fieldset class="chamber-choice"><legend>议会院制</legend><label for="chamber-mode">院制安排</label><select id="chamber-mode" disabled onchange="pendingChambers=this.value"><option value="auto">随机决定</option><option value="one">一院制</option><option value="two">两院制</option></select><p id="chamber-mode-help" class="note">先选择总统制或半总统制，方可指定院制；其他政体沿用本制安排。</p></fieldset>`};
const selectRegimeBeforeInstitutions=selectRegimeCard;
selectRegimeCard=function(id){selectRegimeBeforeInstitutions(id);const node=$('chamber-mode'),enabled=['presidential','semi'].includes(id);node.disabled=!enabled;if(!enabled){node.value='auto';pendingChambers='auto'}$('chamber-mode-help').textContent=id==='presidential'?'随机院制：四分之三为两院制，四分之一为一院制。党制另行抽取，两党制与多党制各占一半。':id==='semi'?'随机院制：一院制与两院制各占一半。开局至少七党，由与你路线接近的党派组成不超过三党的多数联盟。':'先选择总统制或半总统制，方可指定院制；其他政体沿用本制安排。'};
const dialogBeforeInstitutions=newDialog;
newDialog=function(){pendingChambers='auto';dialogBeforeInstitutions()};

function clergyState(){return RELIGIOUS_REGIMES107.includes(pstate()?.regime)?institutions()?.clergy:null}
function clergyLowerFaction(f){return factionProfile(f)===FACTION_PROFILES103.religious||/教|信仰|经学|圣地|宗教/.test(f.name)}
function clergyBillDetails(b,chamber){
 if(!clergyState())return [];
 const groups=chamber==='upper'?bicameral108().upper.groups:pstate().factions.filter(clergyLowerFaction);
 return groups.map(g=>({name:g.name,agenda:chamber==='upper'?upperAgenda108(g,b):votingTendency(g)})).filter(g=>g.agenda<60).map(g=>({...g,loss:60-g.agenda}));
}
function clergyBillPassed(b,chamber){
 const c=clergyState();if(!c)return;const details=clergyBillDetails(b,chamber),loss=details.reduce((n,g)=>n+g.loss,0);if(!loss)return;
 c.loyalty=clamp(c.loyalty-loss,0,100);c.history.push({q:s.q,title:b.title,chamber,loss,details});
 log('神职人员忠诚度下降',`${b.title}在${chamber==='upper'?upperName108():regime().body}通过；${details.map(g=>g.name+'本案倾向'+fmt(g.agenda,1)+'，忠诚度−'+fmt(g.loss,1)).join('；')}。当前忠诚度${fmt(c.loyalty,1)}%。`);
}
function checkClergyConsequences(){
 const c=clergyState();if(!c||creatingWorld||s.ended||c.loyalty>0)return;
 if(regime().id==='theoabsolute'){setGameEnd107('神职人员忠诚度归零：宗教权力基础瓦解，统治终结。');return}
 let x=activeSit('rebellion');if(!x){delete sits().cooldowns.rebellion;x=startSituation('rebellion')}
 if(x){if(!x.clergyRevolt){x.clergyRevolt=true;log('神职集团决裂','神职人员忠诚度归零，宗教政治冲突演变为叛乱。平息这场叛乱后，国家将转为象征性民主制。')}c.rebellionId=x.id}
}
function clergyQuarter(){
 const c=clergyState();if(!c||s.ended||creatingWorld)return;
 if(c.lastQ<s.q){c.lastQ=s.q;if(c.loyalty<40){const stability=c.loyalty<20?2:0;mod({approval:-1,stability:-stability});log('神职集团离心',`神职人员忠诚度${fmt(c.loyalty,1)}%，本季度全国支持率−1${stability?'、政治稳定−2':''}。`)}}
 checkClergyConsequences();
}
function clergyRulesText(){return '初始忠诚度100%。法案在本院通过时，各神职团体本案倾向低于60的差额逐团累计扣除忠诚度；预算计入税收与支出偏好，上院计入本案协商加成。未通过或撤回的法案不扣减；同一法案后续生效不重复扣减。低于40：每季全国支持率−1；低于20：每季全国支持率−1、政治稳定−2。'+(regime().id==='theoabsolute'?'降至0：普通模式下统治结束。':'降至0：触发叛乱；无论以谈判或安全行动平息，国家随后转为象征性民主制。')}
function clergyCard(){const c=clergyState();if(!c)return '';return `<section id="clergy-loyalty" class="card ${c.loyalty<40?'attention-target':''}"><div class="section-label"><h3>神职人员忠诚度</h3><strong>${fmt(c.loyalty,1)}%</strong></div>${c.loyalty<40?redDot107('神职集团离心'):''}<div class="bar"><i style="width:${c.loyalty}%"></i></div><details><summary>查看忠诚度细则</summary><p>${clergyRulesText()}</p>${c.history.slice(-3).reverse().map(h=>`<p>第${h.q}季度 · ${esc(h.title)} · 忠诚度−${fmt(h.loss,1)}</p>`).join('')}</details></section>`}
const assemblyBeforeInstitutions=assembly;
assembly=function(){let html=assemblyBeforeInstitutions();if(regime().id==='theoabsolute'||regime().id==='theorepublic'&&chamberView108==='upper')html=clergyCard()+html;if(['presidential','semi'].includes(regime().id))html=`<p class="note" id="institution-summary">${institutions()?.partySystem==='two'?'两党制':'多党制'} · ${hasUpper108()?'两院制':'一院制'}${regime().id==='semi'?' · 联合政府席位占比'+fmt(coalitionShare107(),0)+'%':''}</p>`+html;return html};
const upperRulesBeforeInstitutions=upperRules108;
upperRules108=function(){let html=upperRulesBeforeInstitutions();if(twoPartyPresidency())html=html.replace(`未通过则退回${regime().body}；`, `参议院否决预算案后，该预算案直接流案，现行预算继续执行。改革和修宪未通过则退回${regime().body}；`).replace('被退回的预算和改革','被退回的改革');return html};
const upperPageBeforeInstitutions=upperPage108;
upperPage108=function(){let html=upperPageBeforeInstitutions();return twoPartyPresidency()?html.replace('本院按政治倾向组成独立党团，与下院分开协商。','两院使用相同党名，本院的关系、倾向和本案协商独立计算。'):html};
const alertsBeforeInstitutions=activeAlerts107;
activeAlerts107=function(){const alerts=alertsBeforeInstitutions(),c=clergyState();if(c&&c.loyalty<40&&!s.ended)alerts.push({id:'clergy-loyalty',title:'神职人员忠诚度不足40%',text:`当前忠诚度${fmt(c.loyalty,1)}%。`+clergyRulesText(),tabs:['assembly'],metric:'clergyLoyalty',slot:null});return alerts};
const maintenanceBeforeInstitutions=politicalMaintenance;
politicalMaintenance=function(){maintenanceBeforeInstitutions();clergyQuarter()};
const saveBeforeInstitutions=save;
save=function(){checkClergyConsequences();if(s?.ended&&v3()&&!v3().settlement)beginSettlement(s.ended);return saveBeforeInstitutions()};
const endBeforeInstitutions=endSituation;
endSituation=function(x,reason){const convert=x.kind==='rebellion'&&x.clergyRevolt&&regime().id==='theorepublic'&&sits().active.includes(x)&&!s.ended;endBeforeInstitutions(x,reason);if(convert)endClericalRepublic()};
function endClericalRepublic(){
 if(amendmentInProgress107())finishAmendment107(false,'政体重组，未完成的修宪案终止。');
 const p=pstate(),c=constitution(),stem=countryStem();p.bill=null;c.docket=null;c.judges.forEach(j=>j.boosts=[]);
 const crisis=activeSit('government');if(crisis)finishGovernmentCrisis107(crisis,'国家权力结构重组，原联合政府解散。');
 p.regime='symbolic';c.competitiveClause=false;s.name=stem+REGIMES.find(r=>r.id==='symbolic').suffix;
 const names=factionNames12();p.factions.forEach((f,i)=>{f.name=names[i];delete f.profileKey;delete f.ideologyLabel});p.rulingParty=p.factions[playerFactionId107()].name;
 p.members.forEach((m,i)=>m.role=i<4?memberRole(i):p.factions[m.faction].name+'党团总召');
 rules103().coalition=[playerFactionId107()];for(const [slot,item]of Object.entries(p.cabinet))if(item&&!cabinetEligible(p.candidates[item.candidate]))removeOfficial(slot);
 sits().transition={q:s.q,from:'theorepublic',to:'symbolic',clerical:true};v3().settlementDue=false;
 ensureInstitutions();initializeBicameral108();initializeTaxation107();
 log('宗教政权重组','叛乱已经平息，国家转为象征性民主制。总统接掌国务，参议院等待组建。');notice('国家转为象征性民主制','神职集团失去政治主导地位。总统接掌国务，现有执政历程与地区事务继续；请组建参议院并补齐内阁空缺。');
}
const consoleFieldsBeforeInstitutions=consoleFields107;
consoleFields107=function(){const rows=consoleFieldsBeforeInstitutions(),c=clergyState();if(c)rows.push({key:'clergy.loyalty',group:'政治与行政',label:'神职人员忠诚度',get:()=>c.loyalty,set:value=>c.loyalty=value,min:0,max:100,integer:false});return rows};
function institutionsGuide(entries){
 const add=(id,title,aliases,text)=>entries.push({id,title,aliases:[title,...aliases],text,category:'立法与政治'});
 add('chamber-configuration','议会院制',['一院制','随机院制','院制安排'],'总统制新世界随机有75%为两院制、25%为一院制；半总统制两种各50%。创建新历史时先明确选定这两种政体之一，才能指定院制。一院制预算与改革仅需本院通过，修宪按本院三分之二、最高司法机关审查推进。');
 add('presidential-parties','总统制党制',['两党制','多党制','无党籍党团'],'总统制开局两党制、多党制各50%，与院制独立抽取。两党制由自由主义或保守主义政党、社会自由主义或社会民主主义政党，以及倾向不同的无党籍党团组成。若设参议院，两院使用相同三党团名称，关系和议程独立；参议院可直接否决预算，改革只能退回，退回后通过的改革延缓两季度实施。多党制沿用通常两院规则。');
 add('semi-coalition','半总统制联合政府',['半总统制议会','国民议会'],'半总统制新世界至少七党，众议院或国民议会名称各50%。你属于相对较大的党派，开局与路线接近的党组成至少50%席位、总数不超过三党的联盟。总理与阁员均来自联盟；失信触发三季度政府危机。到期未解决则联盟解散、盟友阁员依强制离任规则辞职，不因此直接结束任期。');
 add('clergy-loyalty','神职人员忠诚度',['神职忠诚','神职集团','神职人员'],'神权共和制在宪法监护委员会、神权专制在枢密院显示，初始100%。法案在各院通过时，宗教党派／神职团体倾向不足60的差额逐团累计扣除；全部由教士组成的监护委员会各团体都计入。预算使用本案折算倾向，上院包括协商加成。低于40每季支持率−1；低于20每季支持率−1、稳定−2，前一档不重复叠加。归零时神权专制结束统治，神权共和触发叛乱，平息后转为象征性民主制。低于40出现执政提醒。');
 const ally=entries.find(e=>e.id==='political-ally');if(ally)ally.text=ally.text.replace('其他民主与象征性民主开局为单党政府。','半总统制开局也组成最多三党的多数联盟。其余民主与象征性民主开局为单党政府。');
 if(twoPartyPresidency()){
  const entry=entries.find(e=>e.id==='bicameral');if(entry)entry.text=entry.text.replace('第二院按倾向组成至多三个独立党团，神权共和至多四个，名称不与下院重名。','本局为总统制两党格局，两院均为两个主要政党与一个无党籍党团，名称相同，关系与议程独立。');
  const review=entries.find(e=>e.id==='upper-review');if(review)review.text+=' 本局两党制参议院具有预算否决权，预算被否决后直接流案，不退回下院；改革仍按退回和延缓规则办理。';
 }
}
const validBeforeInstitutions=validSave;
validSave=function(v){
 if(!validBeforeInstitutions(v))return false;const i=v.institutions;if(!i)return true;
 if(i.version!==1||i.regime!==v.political.regime||!['new','continued'].includes(i.origin)||!['two','multi'].includes(i.partySystem)||typeof i.twoChambers!=='boolean'||typeof i.lowerName!=='string'||!i.lowerName.length)return false;
 const p=v.political;if(p.factions.some((f,id)=>f.id!==id||f.profileKey&&!FACTION_PROFILES103[f.profileKey])||new Set(p.factions.map(f=>f.name)).size!==p.factions.length)return false;
 if(i.regime==='semi'&&i.origin==='new'&&(p.factions.length<7||!['众议院','国民议会'].includes(i.lowerName)))return false;
 if(i.partySystem==='two'){
  if(i.regime!=='presidential'||p.factions.length!==3||p.factions[2].name!=='无党籍党团'||new Set(p.factions.map(f=>f.profileKey)).size!==3)return false;
  if(i.twoChambers){const u=v.bicameral108?.upper;if(!u||u.groups.length!==3||u.groups.some(g=>g.name!==p.factions[g.id]?.name||(g.share>0?(g.lowerShares.length!==1||g.lowerShares[0].id!==g.id):g.lowerShares.length!==0)))return false}
 }
 if(i.twoChambers!==!!v.bicameral108)return false;
 if(RELIGIOUS_REGIMES107.includes(i.regime)){
  const c=i.clergy;if(!c||!Number.isFinite(c.loyalty)||c.loyalty<0||c.loyalty>100||!Number.isInteger(c.lastQ)||c.lastQ>v.q||!Array.isArray(c.history)||c.history.some(h=>!Number.isFinite(h.loss)||h.loss<=0||!['upper','lower'].includes(h.chamber)))return false;
  if(c.rebellionId!==null&&!Number.isInteger(c.rebellionId))return false;
 }
 return true;
};
function institutionsTutorial(steps,scope,page){
 if(scope==='intro'||page!=='assembly')return steps;
 const additions=[];
 if(['presidential','semi'].includes(regime().id))additions.push({page:'assembly',id:'chamber-configuration',selector:'#institution-summary',title:'本国议会安排',text:regime().id==='semi'?'这里显示本国院制与联合政府席位。联盟阁员可以入阁；盟友失信会触发三季度政府危机。':twoPartyPresidency()?'本国由两个主要政党和无党籍党团组成。若设参议院，两院党名相同；参议院否决预算会使该预算案流案。':'本国采用多党制。院制决定议案是否还需送交参议院复审。'});
 if(clergyState()&&(regime().id==='theoabsolute'||chamberView108==='upper'))additions.push({page:'assembly',id:'clergy-loyalty',selector:'#clergy-loyalty',title:'神职人员忠诚度',text:'神职团体不满的法案获通过，会降低这项忠诚度。低于40开始损害民意；展开细则可查看各阶段后果与最近扣减记录。'});
 return [...additions,...steps];
}
