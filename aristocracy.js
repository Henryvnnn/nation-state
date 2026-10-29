/* Aristocratic houses, recognition and central authority. */
const HOUSE_POWERS={
 food:{name:'食品',sectors:['agriculture','welfare'],profile:'local',opposes:['competition','nationalize','farm','coops'],request:['粮食采购专营权','要求延续粮食采购与供应特许，以保障家族粮仓和加工产业的收益。',{approval:-2,inflation:1},0]},
 medical:{name:'医疗',sectors:['welfare','technology','capital'],profile:'reform',opposes:['nationalize','health'],request:['医疗承包补助','要求为家族医院追加公共采购与运营补助。',{cost:.55},0]},
 imports:{name:'进出口业',sectors:['trade','security'],profile:'reform',opposes:['nationalize','competition','command'],request:['口岸特许续期','要求保留口岸承包与通关特许，并减少中央监管。',{approval:-1},-3]},
 goods:{name:'日用品',sectors:['industry','trade','welfare'],profile:'local',opposes:['nationalize','competition','coops'],request:['消费品采购合同','要求优先向家族企业采购政府日用品。',{cost:.35,approval:-1},0]},
 publishing:{name:'出版',sectors:['technology','capital'],profile:'reform',opposes:['culture','education','competition'],request:['出版资格保护','要求维持家族出版机构的优先准入权。',{approval:-2,stability:-1},0]},
 construction:{name:'建筑',sectors:['industry','capital','security'],profile:'local',opposes:['nationalize','competition','digital','command'],request:['公共工程承包','要求将一批公共工程交由家族建筑商承办。',{cost:.6},0]},
 entertainment:{name:'娱乐',sectors:['green','trade','capital'],profile:'reform',opposes:['culture','sports','competition'],request:['典礼与演出补助','要求追加家族剧院、演出团体与大型典礼的经费。',{cost:.4,approval:-1},0]},
 army:{name:'正规军',sectors:['security','industry'],profile:'conservative',opposes:['defence','command'],request:['军官任免保留权','要求保留家族对军官职位与部队补给的影响。',{stability:-1},-4]},
 guard:{name:'贵族卫队',sectors:['security','agriculture'],profile:'conservative',opposes:['defence','command','courts'],request:['卫队军饷补贴','要求国库分担家族卫队的军饷与装备开支。',{cost:.45,approval:-1},0]},
 police:{name:'警察',sectors:['capital','welfare','security'],profile:'conservative',opposes:['courts','digital','command'],request:['地方治安自主权','要求维持家族对当地警务职位的任用权。',{approval:-1},-3]},
 local:{name:'地方官僚',sectors:['agriculture','green','security'],profile:'local',opposes:['digital','command'],request:['地方职位保护','要求保留地方行政职位的家族提名程序。',{stability:-1},-3]},
 central:{name:'中央官僚',sectors:['capital','technology'],profile:'conservative',opposes:['digital','command','competition'],request:['行政津贴追加','要求扩大由家族控制部门的行政津贴。',{cost:.4,approval:-1},0]},
 education:{name:'教育',sectors:['technology','capital','welfare'],profile:'reform',opposes:['education','research'],request:['家族学府资助','要求追加家族学府经费并保留招生名额。',{cost:.5},0]},
 energy:{name:'能源开采',sectors:['industry','security','green'],profile:'local',opposes:['green','nationalize','command'],request:['能源特许经营','要求扩大能源开采特许并减少上缴收入。',{cost:.3,inflation:.5},-2]},
 minerals:{name:'矿物开采',sectors:['industry','security'],profile:'local',opposes:['green','nationalize','command'],request:['矿业管理豁免','要求保留矿业收益与地方经营监管权。',{approval:-2},-3]}
};
const HOUSE_STATE_REFORMS=['command','culture','research','digital','nationalize','fund','defence','health'];
let familyView='council';
function aristocratic(){return pstate()?.regime==='aristocratic'}
function houses(){return s?.aristocracy}
function familyRulesActive(){return aristocratic()&&!!houses()&&!houses().resolution}
function familyActive(f){return !!f&&f.powers.length>0}
function rulingFamily(){return houses()?.families.find(f=>f.id===houses().player)}
function otherFamilies(){return familyRulesActive()?houses().families.filter(f=>f.id!==houses().player&&familyActive(f)):[]}
function familyCentral(){return houses()?.central??0}
function familyRecognition(f){return f.id===houses().player?100:f.recognition}
function familyBlocked(){return otherFamilies().some(f=>f.recognition<20)}
function familyLow(){return otherFamilies().filter(f=>f.recognition<=40)}
function familyRandom(){let n=hash(s.seed+'|aristocratic-houses');return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296}}
function familyWeighted(items,weight,random){let total=items.reduce((n,x)=>n+weight(x),0),roll=random()*total;for(const x of items){roll-=weight(x);if(roll<0)return x}return items.at(-1)}
function familyProfile(f){return PROFILES[v3().regions[f.region].id]}
function familyDescription(f){const z=v3().regions[f.region],p=familyProfile(f);return `发迹于${z.name}的${p.geo}，当地以${p.industry}为主。家族依靠${f.powers.map(k=>HOUSE_POWERS[k].name).join('、')||'既有领地声望'}建立影响；${p.base}构成其地方社会基础。`}
function initializeFamilies(){
 if(!aristocratic()||houses())return;
 const random=familyRandom(),choose=arr=>arr[Math.floor(random()*arr.length)],p=pstate();
 const oldNames=p.factions.map(f=>f.name),names=[choose(['大贵族联合派','元老家族派']),choose(['地方贵族派','领地自治派']),choose(['开明乡绅派','新兴贵族派']),'自治市民派','教士派'];
 const civic=4+Math.floor(random()*5),clergy=3+Math.floor(random()*5),shares=allocateUnits107([1+random(),1+random(),1+random()],100-civic-clergy).concat([civic,clergy]);
 p.factions.forEach((f,i)=>{f.name=names[i];f.seats=shares[i];f.profileKey=['conservative','local','reform','law','religious'][i];delete f.ideologyLabel});
 p.rulingParty=p.factions[playerFactionId107()].name;
 p.members.forEach((m,i)=>m.role=i<4?memberRole(i):p.factions[m.faction].name+'首席代表');
 for(const e of [p.current,...p.queue].filter(Boolean))for(const k of ['title','text'])if(typeof e[k]==='string')oldNames.forEach((name,i)=>e[k]=e[k].split(name).join(names[i]));
 const regions=v3().regions.map(z=>z.id);for(let i=regions.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[regions[i],regions[j]]=[regions[j],regions[i]]}
 const count=4+Math.floor(random()*3),used=new Set(),families=[];
 for(let id=0;id<count;id++){
  let name;do{name=choose(['阿','维','艾','诺','塞','洛','奥','卡','塔','米','索','伊','赫','贝','托','莫'])+choose(['尔','莱','伦','瑞','拉','萨','维','迪','斯','尼','恩','罗'])+choose(['顿','安','亚','德','纳','恩','里','文','克','林','尔','斯'])+'家族'}while(used.has(name));used.add(name);
  families.push({id,name,region:regions[id],powers:[],recognition:80+Math.floor(random()*21),faction:0,intel:null});
 }
 const remaining=Object.keys(HOUSE_POWERS);
 // Guarantee every house a regional foothold, then distribute the remaining sectors.
 for(const f of families){const sector=v3().regions[f.region].sector,regional=remaining.filter(k=>HOUSE_POWERS[k].sectors.includes(sector)),k=choose(regional.length?regional:remaining);f.powers.push(k);remaining.splice(remaining.indexOf(k),1)}
 for(const k of remaining){const f=familyWeighted(families,f=>(HOUSE_POWERS[k].sectors.includes(v3().regions[f.region].sector)?8:1)/(1+f.powers.length*.6),random);f.powers.push(k)}
 for(const f of families){f.faction=f.powers.includes('army')?0:familyWeighted(p.factions.slice(0,3),g=>1+f.powers.filter(k=>HOUSE_POWERS[k].profile===g.profileKey).length*4,random).id}
 const player=Math.floor(random()*count);families[player].recognition=100;
 s.aristocracy={version:1,player,families,central:families[player].powers.length*5,resolution:null,offered:false,lastQuarter:s.q,lastEventQ:s.q,history:[],reformsSeen:s.reforms.map(x=>x.id),completedSeen:s.reforms.filter(x=>x.completed).map(x=>x.id),amendmentsSeen:[]};
 familyView='council';
}
function familyRecord(text){houses().history.push({q:s.q,text});log('家族政务',text)}
function changeRecognition(f,amount){if(!familyRulesActive()||!familyActive(f)||f.id===houses().player)return;f.recognition=clamp(f.recognition+amount,0,100)}
function changeCentral(amount){if(familyRulesActive())houses().central=clamp(houses().central+amount,0,100)}
function familyFactionPenalty(faction){return otherFamilies().filter(f=>f.faction===faction.id).reduce((n,f)=>n+Math.max(0,80-f.recognition)*.25,0)}
const supportBeforeFamilies=support;
support=function(f){return clamp(supportBeforeFamilies(f)-familyFactionPenalty(f),0,100)};
SIT_NAMES['national-future']='重新决定国家未来';
SIT_INFO['national-future']=['中央权力已经整合，贵族秩序来到新的转折点。','选择国家未来的统治安排','无固定季度损耗；三个选项均不消耗行动点'];
function checkFamilyConsequences(){
 if(!familyRulesActive()||s.ended)return;
 rulingFamily().recognition=100;
 if(otherFamilies().filter(f=>f.recognition===0).length>=3){setGameEnd107('统治合法性崩溃：三个或更多仍有势力的家族完全撤回承认。');if(s.ended)return}
 if(familyCentral()>=100&&!houses().offered)startSituation('national-future');
}
const startSituationBeforeFamilies=startSituation;
startSituation=function(kind,opening=false){
 if(kind!=='national-future')return startSituationBeforeFamilies(kind,opening);
 if(!familyRulesActive()||houses().offered||familyCentral()<100&&!s.adminMode)return null;
 const x=startSituationBeforeFamilies(kind,opening);if(x)houses().offered=true;return x;
};
const situationsPageBeforeFamilies=situationsPage;
situationsPage=function(){return situationsPageBeforeFamilies().replace('处置措施消耗 1 政治行动点','一般处置措施消耗 1 政治行动点；国家未来选择不消耗行动点')};
const initBeforeFamilies=initPolitics;
initPolitics=function(...args){initBeforeFamilies(...args);initializeFamilies();const d=amendmentInProgress107();if(d&&(d.action==='economy'||aristocratic()&&d.action==='competitive'))finishAmendment107(false,'该修宪事项已不再开放，原有条款保留。');if(houses()&&!aristocratic()&&!houses().resolution){houses().resolution='departed';purgeFamilyEvents();const x=activeSit('national-future');if(x)endSituation(x,'国家已转入新的政体，家族政治议程终止。')}};
const endBeforeFamilies=checkPoliticalEnd;
checkPoliticalEnd=function(){checkFamilyConsequences();if(!s.ended)endBeforeFamilies()};
const saveBeforeFamilies=save;
save=function(){checkFamilyConsequences();if(s?.ended&&v3()&&!v3().settlement)beginSettlement(s.ended);return saveBeforeFamilies()};
function familyQuarter(){
 if(!familyRulesActive()||s.ended||houses().lastQuarter>=s.q)return;houses().lastQuarter=s.q;
 const low=familyLow();if(low.length){mod({approval:-.5*low.length,stability:-low.length});familyRecord(`${low.map(f=>f.name).join('、')}降低政治配合：全国支持率 −${fmt(low.length*.5,1)}，政治稳定 −${low.length}。`)}checkPoliticalEnd();
}
const maintenanceBeforeFamilies=politicalMaintenance;
politicalMaintenance=function(){maintenanceBeforeFamilies();familyQuarter()};
function familyRequest(f){
 const power=pick(f.powers),spec=HOUSE_POWERS[power],r=spec.request;
 return {type:'family-request',family:f.id,power,created:s.q,constitutionalSpecial:true,title:f.name+'：'+r[0],text:`${v3().regions[f.region].name}的${f.name}控制着${spec.name}。${r[1]}该家族当前合法性承认为 ${fmt(f.recognition,0)}。`,options:[
 {...option('同意家族要求',impactText(r[2])+`${r[3]?`；中央集权度 ${r[3]}`:''}；合法性承认 +5。`,r[2],{elite:2,authority:-1}),familyRecognition:5,familyCentral:r[3]},
 {...option('拒绝特许要求','该家族合法性承认 −10。',{}, {authority:2,elite:-1}),familyRecognition:-10,familyCentral:0}
 ]};
}
const queueBeforeFamilies=queueQuarterEvents;
queueQuarterEvents=function(){queueBeforeFamilies();if(!familyRulesActive()||s.ended||houses().lastEventQ>=s.q)return;houses().lastEventQ=s.q;const available=otherFamilies();if(available.length)pushEvent(familyRequest(pick(available)))};
function purgeFamilyEvents(id=null){
 const p=pstate(),remove=e=>e&&['family-request','family-intel'].includes(e.type)&&(id===null||e.family===id);
 p.queue=p.queue.filter(e=>!remove(e));if(remove(p.current))p.current=p.queue.shift()||null;
 for(const f of houses()?.families||[])if(id===null||f.id===id)f.intel=null;
}
function familyIntelEvent(f){return {type:'family-intel',family:f.id,intelQ:f.intel.q,constitutionalSpecial:true,title:f.name+'的内部情报',text:`内部人员提供了${f.name}在特许经营、职位分配与公共采购中的负面材料。你可以利用材料迫使家族承认统治，或公开调查并收回一项势力。`,options:[option('要挟家族','合法性承认 +15；不改变家族势力。',{}, {authority:3,law:-2,elite:1}),option('公开调查','随机夺取该家族的一项势力，转入玩家家族；中央集权度 +5；该家族合法性承认 −30。',{}, {authority:2,law:2,elite:-2})]}}
function familyBribeChance(){return .5+clamp(s.approval,0,100)/200}
function familyAction(id,key){
 const f=houses()?.families[id];if(!familyRulesActive()||s.ended||!familyActive(f)||f.id===houses().player||!['divide','bribe','ally'].includes(key))return;
 if(key==='bribe'&&f.intel)return toast('请先处理这份家族情报');
 if(!spendAction('family:'+id+':'+key))return;
 if(key==='divide'){changeRecognition(f,10);mod({stability:-3});noteDecision('分化'+f.name+'继承人集团',{authority:3,elite:1},[],null,1,null,{kind:'coercion'});familyRecord(f.name+'继承人集团被分化：合法性承认 +10，政治稳定 −3。')}
 if(key==='ally'){changeRecognition(f,25);changeCentral(-10);noteDecision('同'+f.name+'结盟',{authority:-3,elite:3},[],null,1,null,{kind:'coalition'});familyRecord('与'+f.name+'结盟：合法性承认 +25，中央集权度 −10。')}
 if(key==='bribe'){
  mod({cost:.35});noteDecision('贿赂'+f.name+'内部人员',{law:-3,authority:2},[],null,1,null,{kind:'coercion'});
  if(rand()<familyBribeChance()){f.intel={q:s.q};const e=familyIntelEvent(f),p=pstate();if(p.current)p.queue.unshift(p.current);p.current=e;familyRecord('获得'+f.name+'的内部情报，待决定如何使用。')}
  else{familyRecord('对'+f.name+'内部人员的接触未获得可靠材料；已支出 0.35% GDP。');toast('未获得可靠情报')}
 }
 checkPoliticalEnd();pSave();if(s.ended)return endDialog();if(key==='bribe'&&f.intel)showPoliticalEvent();else openFamily(id);
}
function seizeFamilyPower(f){
 if(!familyRulesActive()||!familyActive(f)||f.id===houses().player)return null;
 const key=pick(f.powers);f.powers=f.powers.filter(k=>k!==key);rulingFamily().powers.push(key);changeCentral(5);
 if(familyActive(f))changeRecognition(f,-30);else{f.recognition=clamp(f.recognition-30,0,100);f.intel=null;pstate().queue=pstate().queue.filter(e=>!(['family-request','family-intel'].includes(e.type)&&e.family===f.id))}
 familyRecord(`公开调查${f.name}，${HOUSE_POWERS[key].name}转归${rulingFamily().name}；中央集权度 +5。${familyActive(f)?'该家族合法性承认 −30。':'该家族已失去全部势力，退出政治互动与合法性计算。'}`);return key;
}
const resolveBeforeFamilies=resolvePolitical;
resolvePolitical=function(i){
 const e=pstate().current,o=e?.options[i];if(!o||s.ended)return;
 if(['family-request','family-intel'].includes(e.type)){
  const f=houses()?.families[e.family],live=familyRulesActive()&&familyActive(f)&&f.id!==houses().player&&(e.type!=='family-intel'||f.intel?.q===e.intelQ);
  if(!live){e.options[i]={...option('归档失效的家族事项','该家族事项已结束，不产生费用或政治影响。')};return resolveBeforeFamilies(i)}
  if(e.type==='family-request'){changeRecognition(f,o.familyRecognition);changeCentral(o.familyCentral);familyRecord(f.name+'：'+o.label+'，合法性承认 '+(o.familyRecognition>0?'+':'')+o.familyRecognition+'。')}
  else{f.intel=null;if(i===0){changeRecognition(f,15);familyRecord('要挟'+f.name+'：合法性承认 +15。')}else if(i===1)seizeFamilyPower(f)}
 }
 return resolveBeforeFamilies(i);
};
function familyReformOpposition(f,key){return familyRulesActive()&&familyActive(f)&&f.id!==houses().player&&(key==='inheritance'||f.powers.some(k=>HOUSE_POWERS[k].opposes.includes(key)))}
function familyReformEffects(){
 if(!familyRulesActive())return;const a=houses();
 for(const x of s.reforms){const r=REFORMS[x.id];if(!a.reformsSeen.includes(x.id)){a.reformsSeen.push(x.id);for(const f of otherFamilies())if(familyReformOpposition(f,r.key)){const loss=r.key==='inheritance'?18:10;changeRecognition(f,-loss);familyRecord(r.name+'触及'+f.name+'的既有利益，合法性承认 −'+loss+'。')}}
  if(x.completed&&!a.completedSeen.includes(x.id)){a.completedSeen.push(x.id);if(HOUSE_STATE_REFORMS.includes(r.key)){changeCentral(5);familyRecord(r.name+'完成：中央集权度 +5。')}}
 }
}
const completeBeforeFamilies=completeReforms;
completeReforms=function(){completeBeforeFamilies();familyReformEffects()};
function familyVoteGuard(){if(!familyBlocked())return false;toast('家族合法性承认低于20，枢密院暂停表决；请先处理家族关系。');return true}
const voteBillBeforeFamilies=voteBill;
voteBill=function(){if(familyVoteGuard())return;const result=voteBillBeforeFamilies();familyReformEffects();checkFamilyConsequences();if(familyRulesActive())pSave();return result};
const voteConstitutionBeforeFamilies=voteConstitution;
voteConstitution=function(force=false){const d=constitution().docket;if(d?.route==='assembly'&&familyVoteGuard())return;return voteConstitutionBeforeFamilies(force)};
const reviewRateBeforeFamilies=reviewRate107;
reviewRate107=function(d=amendmentInProgress107()){return d?.route==='assembly'&&familyBlocked()?0:reviewRateBeforeFamilies(d)};
const finishAmendmentBeforeFamilies=finishAmendment107;
finishAmendment107=function(success,reason){
 const d=amendmentInProgress107(),active=familyRulesActive(),n=constitution().history.length;
 const result=finishAmendmentBeforeFamilies(success,reason);
 if(active&&success&&d&&['court','rights','pluralism'].includes(d.action)&&!houses().amendmentsSeen.includes(d.id)&&constitution().history.slice(n).some(h=>h.result==='passed'&&h.title===d.title)){
  houses().amendmentsSeen.push(d.id);changeCentral(10);familyRecord(d.title+'生效：中央集权度 +10。');checkFamilyConsequences();record();
 }
 return result;
};
const specBeforeFamilies=constitutionalSpec;
constitutionalSpec=function(mode,action,target){const spec=specBeforeFamilies(mode,action,target);if(spec&&mode==='amend'&&familyRulesActive()&&['court','rights','pluralism'].includes(action))return {...spec,costText:spec.costText+' 贵族制：生效后中央集权度 +10。'};return spec};
function finishFamilyFuture(key){
 if(!familyRulesActive()||!activeSit('national-future')||!['strongman','absolute','constitutional'].includes(key)||s.ended)return;
 const a=houses(),x=activeSit('national-future');a.resolution=key;purgeFamilyEvents();
 const label=({strongman:'当个贵族制下的强人',absolute:'生民无主，臣不敢辞',constitutional:'国事繁杂，放权于民'})[key];
 noteDecision(label,key==='strongman'?{authority:4,elite:3}:key==='absolute'?{authority:4,nation:2}:{authority:-4,law:4,elite:-2},[],null,1,null,{kind:'amendment',identity:'aristocratic-future'});
 if(key!=='strongman')transitionFamilyRegime(key);
 endSituation(x,key==='strongman'?'贵族制继续存在。中央集权度与家族合法性承认停止计算，家族不再阻碍表决或导致统治结束。':'国家转为'+regime().name+'，既有经济、季度和人物成果保留。');
 a.history.push({q:s.q,text:'国家未来：'+label+'。'});checkPoliticalEnd();record();save();render();$('modal').close();if(s.ended)endDialog();
}
function transitionFamilyRegime(target){
 const p=pstate(),c=constitution(),stem=countryStem();if(amendmentInProgress107())finishAmendment107(false,'国家制度重组，原修宪提案终止。');
 if(p.bill||c.docket)log('议案撤回','国家制度重组，待决议案撤回，可按新制度重新提出。');p.bill=null;c.docket=null;c.judges.forEach(j=>j.boosts=[]);
 p.regime=target;c.competitiveClause=target==='constitutional';c.termLimit=target==='constitutional'?48:0;s.name=stem+REGIMES.find(r=>r.id===target).suffix;
 const names=factionNames12();p.factions.forEach((f,i)=>{f.name=names[i];delete f.profileKey;delete f.ideologyLabel});p.rulingParty=p.factions[playerFactionId107()].name;
 p.members.forEach((m,i)=>m.role=i<4?memberRole(i):p.factions[m.faction].name+(target==='constitutional'?'党团总召':'首席代表'));
 rules103().coalition=[playerFactionId107()];initializeAllies107();if(!regime().head){if(p.cabinet.head)removeOfficial('head');delete p.cabinet.head}
 for(const [slot,item]of Object.entries(p.cabinet))if(item&&!cabinetEligible(p.candidates[item.candidate]))removeOfficial(slot);
 sits().transition={q:s.q,from:'aristocratic',to:target,aristocratic:true};sits().democracyPressure=0;v3().settlementDue=false;
 ensureInstitutions();initializeBicameral108();initializeTaxation107();familyView='council';
 if(target==='constitutional'){const movement=activeSit('spring');if(movement)endSituation(movement,'君主立宪制度确立，国家进入竞争性选举。')}
 log('国家制度重组','国家转为'+regime().name+'，执政季度、历史、改革和经济数据保留，按新制度运行。');
}
const situationActionsBeforeFamilies=situationActions;
situationActions=function(x){return x.kind==='national-future'?[
 {key:'strongman',label:'当个贵族制下的强人',detail:'不消耗行动点。保留贵族制，停止中央集权度和合法性承认计算；家族相关惩罚与表决封锁解除，本局不再触发此局势。',values:{}},
 {key:'absolute',label:'生民无主，臣不敢辞',detail:'不消耗行动点。转为君主专制，结束家族政治机制，保留经济与执政历史。',values:{}},
 {key:'constitutional',label:'国事繁杂，放权于民',detail:'不消耗行动点。转为君主立宪制，组建两院与执政联盟；不符合新制度的阁员按正常规则离任，累计任期保留。',values:{}}
 ]:situationActionsBeforeFamilies(x)};
const unavailableBeforeFamilies=unavailable;
unavailable=function(x,a){return x.kind==='national-future'?s.ended||!familyRulesActive():unavailableBeforeFamilies(x,a)};
const situationActBeforeFamilies=situationAct;
situationAct=function(id,key){const x=sits().active.find(z=>z.id===id);if(x?.kind==='national-future')return finishFamilyFuture(key);return situationActBeforeFamilies(id,key)};
const progressBeforeFamilies=situationProgress;
situationProgress=function(x){return x.kind==='national-future'?`中央集权度曾达到100，国家整合已经完成。请在下方选择未来安排，三项均不消耗行动点。`:progressBeforeFamilies(x)};
function familyRulesHTML(){return `<details class="family-rules"><summary>查看家族政治细则</summary><p>玩家家族的合法性承认固定100。其他仍有势力的家族从80—100开始；承认达到40或更低时，每家每季度全国支持率 −0.5、政治稳定 −1，按家族数叠加。任何一家低于20，枢密院暂停所有表决；恢复到20即可解除封锁。三家或更多归零时统治结束。</p><p>每家承认低于80的部分，每点降低其勾连派系0.25点议程倾向，多家累加。自治市民与教士派系不接受家族勾连。失去全部势力的家族退出互动、事件、表决压力及合法性计算。</p><p>每季度追加一个来自仍有势力的其他家族的要求，不替代三件常规事件。接受的代价由其势力决定；拒绝使承认 −10，接受使承认 +5。各项主动家族互动消耗1行动点，同一家族同项互动每季一次；情报后续选择不消耗行动点。</p><p>分化继承人集团：承认 +10、稳定 −3。贿赂内部人员：支出0.35% GDP，成功率为50%加全国支持率的一半，范围50%—100%；要挟使承认 +15，公开调查夺取一项势力并使承认 −30。结盟：承认 +25、中央集权度 −10。</p><p>中央集权度从0起算，玩家家族每项势力贡献5点；指定修宪生效每案 +10，国家导向改革完成每案 +5。达到100开启“重新决定国家未来”，可选择贵族强人统治、君主专制或君主立宪制（无行动点消耗）。</p></details>`}
function familyCentralCard(showLink=true){const a=houses();return `<section class="card family-central" id="family-central"><div class="section-label"><h3>中央集权度</h3><span>${a.resolution?'政治整合已结束':'国家权力整合'}</span></div><div class="big-number">${fmt(a.central,0)}<small> / 100</small></div><div class="bar"><i style="width:${a.central}%"></i></div><p>玩家所属：<b>${esc(rulingFamily().name)}</b> · 掌握 ${rulingFamily().powers.length} 项家族势力</p>${a.resolution?'<p>中央集权度与家族合法性承认已停止计算，家族不再造成政治惩罚。</p>':''}${showLink?'<button onclick="openFamilyPage()">查看家族互动 →</button>':''}${familyRulesHTML()}</section>`}
function familyWarning(){const low=familyLow(),blocked=familyBlocked();if(!low.length)return '';return `<section class="card family-warning"><h3>${blocked?'枢密院表决暂停':'家族承认下降'}</h3><p>${low.map(f=>esc(f.name)+' '+fmt(f.recognition,0)).join(' · ')}。每季全国支持率 −${fmt(low.length*.5,1)}、政治稳定 −${low.length}。</p>${blocked?'<p>至少一家承认低于20。请先改善关系或收回其全部势力，再提交表决。</p>':''}<button onclick="openFamilyPage()">处理家族关系 →</button></section>`}
function openFamilyPage(){if(!aristocratic())return;familyView='families';changeTab('assembly')}
function switchFamilyPage(view){if(!aristocratic())return;familyView=view==='families'?'families':'council';tab='assembly';render()}
function familySwitch(){return `<nav class="chamber-switch108 family-switch" aria-label="监察机构页面"><button onclick="switchFamilyPage('council')" aria-pressed="${familyView==='council'}" class="${familyView==='council'?'primary':''}">${esc(regime().body)}</button><button onclick="switchFamilyPage('families')" aria-pressed="${familyView==='families'}" class="${familyView==='families'?'primary':''}">家族互动${familyLow().length?redDot107('家族合法性承认不足'):''}</button></nav>`}
function familyPage(){return `${familyCentralCard(false)}${familyWarning()}<div class="family-grid">${houses().families.map(f=>{const active=familyActive(f),own=f.id===houses().player;return `<article class="card family-card ${active?'':'family-inactive'}" data-family="${f.id}"><span class="tag">${esc(v3().regions[f.region].name)}</span><h3>${esc(f.name)} ${own?'<span class="player-party-badge">玩家所属</span>':''}</h3><p>${esc(familyDescription(f))}</p><div class="family-powers">${f.powers.map(k=>`<span class="tag">${HOUSE_POWERS[k].name}</span>`).join('')||'<span>已失去全部家族势力</span>'}</div><p><b>合法性承认 ${active?fmt(familyRecognition(f),0):'—'}${own?' · 固定':''}</b>${!active?' · 不参与计算':''}</p><p>勾连派系：${esc(pstate().factions[f.faction].name)}</p><details><summary>查看家族立场</summary><p>反对触及既有控制权的改革：${!familyRulesActive()?'家族合法性承认已停止计算':!active?'已退出家族政治计算':own?'玩家家族不因改革降低合法性承认':REFORMS.filter(r=>familyReformOpposition(f,r.key)).map(r=>r.name).join('、')||'暂无直接利益冲突'}。相关改革获准启动时承认 −10；遗产税特别征收为 −18。</p><p>${active?'关联派系的议程压力按家族承认实时计算。':'该家族已退出政治互动，不再施加任何家族压力。'}</p></details><button onclick="openFamily(${f.id})" ${!active||own||!familyRulesActive()||s.ended?'disabled':''}>${own?'玩家家族':!active?'已退出政治互动':houses().resolution?'政治整合已结束':f.intel?'会见家族 · 有待处理情报':'会见家族'}</button></article>`}).join('')}</div><section class="card"><details><summary>家族政务档案</summary>${houses().history.slice().reverse().map(h=>`<p>第 ${h.q} 季度 · ${esc(h.text)}</p>`).join('')||'<p>尚无家族交涉记录。</p>'}</details></section>`}
function openFamily(id){const f=houses()?.families[id];if(!familyRulesActive()||!familyActive(f)||f.id===houses().player||s.ended)return;
 const used=key=>pstate().lastAction['family:'+id+':'+key]===s.q||pstate().ap<1;
 modal(`<span class="tag">${esc(v3().regions[f.region].name)} · 家族交涉</span><h2>${esc(f.name)}</h2><p>合法性承认 ${fmt(f.recognition,0)} · 勾连${esc(pstate().factions[f.faction].name)}</p><div class="choices"><button onclick="familyAction(${id},'divide')" ${used('divide')?'disabled':''}><strong>分化继承人集团</strong><small>1行动点；合法性承认 +10，政治稳定 −3。</small></button><button onclick="familyAction(${id},'bribe')" ${used('bribe')||f.intel?'disabled':''}><strong>贿赂内部人员</strong><small>1行动点；支出0.35% GDP；当前成功率 ${fmt(familyBribeChance()*100,1)}%。成功后选择要挟或公开调查。${f.intel?'已有情报待处理。':''}</small></button><button onclick="familyAction(${id},'ally')" ${used('ally')?'disabled':''}><strong>同家族结盟</strong><small>1行动点；合法性承认 +25，中央集权度 −10。</small></button></div><button onclick="$('modal').close()">返回</button>`);
}
const assemblyBeforeFamilies=assembly;
assembly=function(){if(!aristocratic())return assemblyBeforeFamilies();if(familyView==='families')return familySwitch()+familyPage();let html=assemblyBeforeFamilies();if(familyBlocked())html=html.replace(/<button([^>]*onclick="(?:voteBill\(\)|voteConstitution\([^"<]*\))"[^>]*)>/g,'<button$1 disabled>');return familySwitch()+familyWarning()+html};
const overviewBeforeFamilies=overview;
overview=function(){return overviewBeforeFamilies()+(aristocratic()?familyCentralCard():'')};
const archiveBeforeFamilies=archive;
archive=function(){return archiveBeforeFamilies().replace('非民主国家可通过竞争性选举修正案转型，人物与执政历史保留。',aristocratic()?'贵族制通过中央集权度达到100后的国家未来局势决定制度转型。':'非民主国家可通过已开放的竞争性选举修正案转型，人物与执政历史保留。')};
const reformDetailBeforeFamilies=reformDetail;
reformDetail=function(uid){reformDetailBeforeFamilies(uid);if(!familyRulesActive())return;const offer=v3().offers.find(o=>o.uid===uid),r=offer&&REFORMS[offer.catalog];if(!r)return;const affected=otherFamilies().filter(f=>familyReformOpposition(f,r.key));$('modal').innerHTML+=`<details><summary>查看家族与中央权力影响</summary><p>${affected.length?affected.map(f=>esc(f.name)).join('、')+'在改革获准启动时合法性承认 −'+(r.key==='inheritance'?18:10)+'。':'没有家族因这项改革降低承认。'}</p><p>${HOUSE_STATE_REFORMS.includes(r.key)?'改革完成时中央集权度 +5。':'本案不增加中央集权度。'}</p></details>`};
const alertsBeforeFamilies=activeAlerts107;
activeAlerts107=function(){const out=alertsBeforeFamilies();for(const f of familyLow())out.push({id:'family-recognition:'+f.id,title:f.name+'的合法性承认下降',text:`当前 ${fmt(f.recognition,0)}。每季全国支持率 −0.5、稳定 −1；低于20封锁枢密院表决，三个有势力家族归零将结束统治。`,tabs:['assembly'],metric:null});return out};
const consoleBeforeFamilies=consoleFields107;
consoleFields107=function(){const out=consoleBeforeFamilies();if(familyRulesActive()){out.push({key:'families.central',group:'政治与行政',label:'中央集权度',get:()=>familyCentral(),set:v=>houses().central=v,min:0,max:100,integer:false});for(const f of otherFamilies())out.push({key:'families.recognition.'+f.id,group:'政治与行政',label:f.name+'合法性承认',get:()=>f.recognition,set:v=>f.recognition=v,min:0,max:100,integer:false})}return out};
function familiesGuide(entries){
 const add=(id,title,aliases,text)=>entries.push({id,title,aliases:[title,...aliases],text,category:'家族政治'});
 add('families','家族互动',['家族','贵族家族'],'贵族制在电话的监察机构内，与枢密院并列。开局生成4—6个来自不同地区的家族，玩家随机属于其中一家。各家控制的产业和机关决定诉求、反对的改革与关联派系。失去全部势力的家族退出互动，不再造成家族压力。');
 add('family-powers','家族势力',Object.values(HOUSE_POWERS).map(p=>p.name),'家族控制的产业与机关，共15项，每项由一个家族掌握。公开调查可将目标家族随机一项势力转入玩家家族，使中央集权度增加5。全部势力失去后，该家族不再提出要求、影响派系或参与合法性与失败计算。');
 add('family-recognition','合法性承认',['家族合法性','家族承认'],'玩家家族固定100，其他家族初始80—100。40或更低时，每家每季度支持率−0.5、稳定−1；低于20暂停枢密院表决；三个有势力家族归零时统治结束。低于80的每一点，降低关联派系0.25议程倾向，多家累加。恢复到20解除封锁，高于40解除季度损耗。');
 add('central-authority','中央集权度',['中央集权','国家权力整合'],'从0起算，开局玩家家族每项势力加5。最高司法机关、公民权利、社会多元修宪每案生效加10；国家投资统筹、文化、科研网络、数字行政、国有化、主权基金、防务和普惠医疗改革每项完成加5。结盟减10，部分家族要求也会降低。达到100触发“重新决定国家未来”，三项选择均不消耗行动点。');
 add('family-interactions','家族交涉',['分化继承人集团','贿赂内部人员','同家族结盟','要挟家族','公开调查'],'分化：承认+10、稳定−3。贿赂：支出0.35% GDP，成功率50%加全国支持率一半；成功后要挟增加15承认，或公开调查夺取一项势力并降低30承认。结盟：承认+25、中央集权度−10。主动互动每项1行动点，每家每项每季一次；情报后续回复无行动点消耗。');
 add('national-future','重新决定国家未来',['当个贵族制下的强人','生民无主，臣不敢辞','国事繁杂，放权于民'],'贵族制中央集权度达到100后开启，本局一次。保留贵族制会停止中央集权度与合法性承认计算，家族不再封锁投票或导致统治结束；也可转为君主专制或君主立宪制。选择不耗行动点，经济、改革与累计执政季度保留，转型后按新制度处理阁员与选举。');
 const competitive=entries.find(e=>e.id==='competitive-amendment');if(competitive)competitive.text=competitive.text.replace('非民主国家固定提供此修宪项。','除贵族制外的非民主国家提供此修宪项；贵族制通过中央集权度完成制度转型。');
 const c=entries.find(e=>e.id==='constitution');if(c)c.text+=' 经济模式修宪不开放；贵族制的制度转型由中央集权度达到100后决定。';
}
function familiesTutorial(steps,scope,page){
 if(scope==='intro'||!aristocratic())return steps;
 const entry={page,id:'families',selector:'.family-switch',title:'枢密院与家族互动',text:'这里切换枢密院和家族互动。枢密院负责议案，家族承认决定政治配合与表决能否进行。'};
 if(page==='assembly'&&familyView==='families')return [entry,{page,id:'central-authority',selector:'#family-central',text:'中央集权度来自玩家家族势力、已生效修宪和已完成国家导向改革。达到100，可决定国家未来（无行动点消耗）。'},{page,id:'families',selector:'.family-card',text:'这里显示家族地区、控制的势力、合法性承认和关联派系。点击会见家族进行交涉，细则可手动展开。'},{page,id:'guide',selector:'#guide-open',text:'更详细的阈值、代价和规则可在治国指南中搜索。',title:'查阅家族规则'}];
 if(page==='assembly')return [entry,...steps];if(page==='overview')steps.splice(1,0,{page,id:'central-authority',selector:'#family-central',text:'中央集权度追踪贵族制的国家权力整合；可从这里进入家族页面。'});return steps;
}
const validBeforeFamilies=validSave;
validSave=function(v){
 if(!validBeforeFamilies(v))return false;const a=v.aristocracy;if(!a)return true;
 const finite=(n,min,max)=>Number.isFinite(n)&&n>=min&&n<=max;
 if(a.version!==1||!Array.isArray(a.families)||a.families.length<4||a.families.length>6||!Number.isInteger(a.player)||!a.families[a.player]||!finite(a.central,0,100)||![null,'strongman','absolute','constitutional','departed'].includes(a.resolution)||typeof a.offered!=='boolean'||!Number.isInteger(a.lastQuarter)||a.lastQuarter>v.q||!Number.isInteger(a.lastEventQ)||a.lastEventQ>v.q)return false;
 if(!Array.isArray(a.history)||a.history.some(h=>!Number.isInteger(h.q)||h.q>v.q||typeof h.text!=='string'))return false;
 for(const key of ['reformsSeen','completedSeen','amendmentsSeen'])if(!Array.isArray(a[key])||a[key].some(x=>!Number.isInteger(x)))return false;
 if(a.families.some((f,i)=>f.id!==i||typeof f.name!=='string'||f.name.length>40||!Number.isInteger(f.region)||!v.governance.regions[f.region]||!Array.isArray(f.powers)||f.powers.some(k=>typeof k!=='string'||!Object.hasOwn(HOUSE_POWERS,k))||!finite(f.recognition,0,100)||!Number.isInteger(f.faction)||f.faction<0||f.faction>2||f.intel&&(!Number.isInteger(f.intel.q)||f.intel.q>v.q)))return false;
 const powers=a.families.flatMap(f=>f.powers);if(powers.length!==15||new Set(powers).size!==15||new Set(a.families.map(f=>f.name)).size!==a.families.length||new Set(a.families.map(f=>f.region)).size!==a.families.length||a.families[a.player].recognition!==100)return false;
 if(v.situations.active.some(x=>x.kind==='national-future')&&(!a.offered||a.resolution||v.political.regime!=='aristocratic'))return false;
 return true;
};
