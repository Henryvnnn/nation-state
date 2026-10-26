/* Quarterly local sentiment, election seasons and governing-party routes. */
const PARTY_ROUTES107=[
 {name:'正统派 / 元老派',support:1,stability:-1,growth:0,spring:0,text:'季度地区支持衰退为6个百分点，政治稳定衰退为1点；部长议程成果可继续减免。'},
 {name:'新锐派 / 青年派',support:0,stability:.5,growth:1,spring:0,text:'每季度实际年化增长额外提高1个百分点，按经济增长上下限结算；政治稳定衰退增加0.5点。'},
 {name:'改革派',support:-2,stability:0,growth:0,spring:.05,text:'季度地区支持衰退减少2个百分点；每季度民主化运动触发概率增加5个百分点，仍遵守同类局势与冷却限制。'}
];
const DECAY_CRISIS_KINDS107=['strike','justice','economy','scandal','disaster','rebellion','spring','government'];
SIT_NAMES.electionSeason='选举季';
SIT_INFO.electionSeason=['换届议程进入最后阶段，地方民意、执政表现和政治路线受到集中检视。','本届换届季度结算后结束；每24季度重复，首轮18—24季度，次轮42—48季度','背景局势，无额外固定损耗；一党独大制可在每个选举季确认一次党内路线'];
function seasons107(){return s.politicalSeasons107}
function partyRoute107(){return regime().id==='party'?PARTY_ROUTES107[playerFactionId107()]||PARTY_ROUTES107[0]:null}
function partyGrowthBonus107(){return partyRoute107()?.growth||0}
function initializeSeasons107(){
 if(!s.politicalSeasons107)s.politicalSeasons107={version:1,installedQ:s.q,lastDecayQ:s.q,lastSpringRollQ:s.q,blockedQ:s.q,blocked:[],offsets:v3().regions.map(()=>0),reports:[],switches:[],closedSeasons:[]};
 syncElectionSeason107();
}
function electionWindow107(){
 if(s.ended||!(regime().election||regime().id==='party')||s.q<18)return null;
 const deadline=Math.ceil(s.q/24)*24;
 return s.q>=deadline-6&&!(s.q===deadline&&!v3().quarterOpen)?{start:deadline-6,deadline}:null;
}
function closeElectionSeason107(x,reason){
 if(!x||!sits().active.includes(x))return;
 sits().history.push({...JSON.parse(JSON.stringify(x)),end:s.q,reason});sits().active=sits().active.filter(a=>a.id!==x.id);
 if(!seasons107().closedSeasons.includes(x.deadline))seasons107().closedSeasons.push(x.deadline);
 log('选举季结束',reason);
}
function syncElectionSeason107(){
 if(!seasons107()||!sits())return;
 const window=electionWindow107(),active=activeSit('electionSeason');
 if(active&&(!window||active.deadline!==window.deadline))closeElectionSeason107(active,'本轮换届阶段结束，既有民意记录与党内路线保留。');
 if(window&&!activeSit('electionSeason')&&!seasons107().closedSeasons.includes(window.deadline)){
  sits().active.push({id:sits().nextId++,kind:'electionSeason',start:window.start,deadline:window.deadline,opening:false,cooldowns:{},used:{},cost:0,actions:[],plans:{},chosen:null});
  log('选举季开始',`第 ${window.start} 至 ${window.deadline} 季度为本届换届阶段。`+(regime().id==='party'?'可支持党内正统、新锐或改革路线，每个选举季限一次。':'关注地区民意与选举预测；此局势没有处置选项。'));
 }
}
const initBeforeSeasons107=initPolitics;
initPolitics=function(...args){initBeforeSeasons107(...args);initializeSeasons107()};
function decayBlockers107(){return sits().active.filter(x=>x.kind==='olympics'||DECAY_CRISIS_KINDS107.includes(x.kind)||MINORITY_KINDS107.includes(x.kind)&&x.method).map(x=>x.kind)}
function rememberDecayBlockers107(){
 const state=seasons107();if(!state)return;
 if(state.blockedQ!==s.q){state.blockedQ=s.q;state.blocked=[]}
 state.blocked=[...new Set([...state.blocked,...decayBlockers107()])];
}
const startBeforeSeasons107=startSituation;
startSituation=function(kind,...args){
 if(kind==='electionSeason'){syncElectionSeason107();return activeSit(kind)||null}
 const result=startBeforeSeasons107(kind,...args);if(v3()?.quarterOpen)rememberDecayBlockers107();return result;
};
const endBeforeSeasons107=endSituation;
endSituation=function(x,reason){if(x?.kind==='electionSeason')return closeElectionSeason107(x,reason);if(v3()?.quarterOpen)rememberDecayBlockers107();return endBeforeSeasons107(x,reason)};
function programmeDecayBenefit107(pr){
 if(!pr?.completed||!Number.isInteger(pr.design?.trait))return {support:0,stability:0};
 const trait=pr.design.trait;return {support:[0,1,4,5,6,7].includes(trait)?.5:0,stability:[0,4,6].includes(trait)?.25:0};
}
function quarterlyDecayRates107(){
 const benefit=Object.values(rules103().proposals).reduce((sum,pr)=>{const b=programmeDecayBenefit107(pr);return {support:sum.support+b.support,stability:sum.stability+b.stability}},{support:0,stability:0}),route=partyRoute107();
 return {support:Math.max(0,5+(route?.support||0)-benefit.support),stability:Math.max(0,2+(route?.stability||0)-benefit.stability),benefit};
}
const estimateBeforeSeasons107=regionalEstimate;
regionalEstimate=function(z){const result=estimateBeforeSeasons107(z),offset=seasons107()?.offsets[z.id]||0;return {...result,baseShare:result.share,sentimentOffset:offset,share:clamp(result.share+offset,1,99)}};
function regionalDecayQuarter107(){
 if(!seasons107()||s.ended||s.q<=seasons107().lastDecayQ)return;
 rememberDecayBlockers107();const state=seasons107(),rates=quarterlyDecayRates107(),blocked=state.blockedQ===s.q?[...state.blocked]:[];
 state.lastDecayQ=s.q;
 const report={q:s.q,region:null,support:0,stability:0,blocked,rates:{support:rates.support,stability:rates.stability}};
 if(!blocked.length){
  if(rates.support>0){const region=pick(v3().regions);report.region=region.id;const before=regionalEstimate(region).share;state.offsets[region.id]=Math.max(-99,state.offsets[region.id]-rates.support);report.support=before-regionalEstimate(region).share}
  const before=s.stability;mod({stability:-rates.stability});report.stability=before-s.stability;
  log('季度地方民意报告',`${report.region===null?'地区支持衰退已获完全减免':v3().regions[report.region].name+'支持率 −'+fmt(report.support,1)+' 个百分点'}；政治稳定 −${fmt(report.stability,2)}。`);
 }else log('季度地方民意报告',`本季度有${blocked.map(kind=>SIT_NAMES[kind]).join('、')}，暂停额外地区支持与政治稳定衰退。`);
 state.reports.unshift(report);state.reports=state.reports.slice(0,240);checkPoliticalEnd();
}
const economyBeforeSeasons107=economicQuarter;
economicQuarter=function(){rememberDecayBlockers107();economyBeforeSeasons107();rememberDecayBlockers107()};
const queueBeforeSeasons107=queueQuarterEvents;
queueQuarterEvents=function(){syncElectionSeason107();queueBeforeSeasons107();rememberDecayBlockers107()};
const finishBeforeSeasons107=finishQuarter;
finishQuarter=function(){
 if(v3().quarterOpen&&!pstate().current&&!s.ended){regionalDecayQuarter107();if(s.ended){v3().quarterOpen=false;record();beginSettlement(s.ended);syncElectionSeason107();return}}
 finishBeforeSeasons107();syncElectionSeason107();
};
function springChanceSeason107(){return (s.q>=12&&sits().democracyPressure>=40?.15:0)+(partyRoute107()?.spring||0)}
function rollSpringSeason107(){
 const state=seasons107();if(!state||state.lastSpringRollQ>=s.q)return;state.lastSpringRollQ=s.q;
 if(s.ended||regime().democratic||activeSit('spring')||sits().cooldowns.spring>s.q)return;
 const chance=springChanceSeason107();if(chance>0&&rand()<chance)startSituation('spring');
}
function factionExitSeats107(id){const seats=pstate().factions[id]?.seats||0;return Math.max(0,Math.min(seats-1,Math.round(seats*.2)))}
function partyChoiceDetail107(id){
 const own=playerFactionId107(),route=PARTY_ROUTES107[id];
 return (id===own?'维持当前路线：本派团体关系 +3、议程倾向修正 +2。':`转移所属派系：原派团体关系 −15、议程倾向修正 −10；新派团体关系 +15、议程倾向修正 +10。原派席位占比下降 ${factionExitSeats107(own)} 个百分点，分配给其余党内派系及少量无党籍代表。`)+route.text+' 消耗1行动点，每个选举季限一次。';
}
const actionsBeforeSeasons107=situationActions;
situationActions=function(x){if(x.kind!=='electionSeason')return actionsBeforeSeasons107(x);return regime().id==='party'?[0,1,2].map(id=>({key:'back-faction-'+id,label:'支持'+pstate().factions[id].name,detail:partyChoiceDetail107(id),values:{},axes:{},once:true})):[]};
const unavailableBeforeSeasons107=unavailable;
unavailable=function(x,a){if(x.kind==='electionSeason')return s.ended||regime().id!=='party'||x.chosen!==null||!electionWindow107()||pstate().ap<1;return unavailableBeforeSeasons107(x,a)};
function supportPartyRoute107(x,id){
 if(!Number.isInteger(id)||id<0||id>2||!sits().active.includes(x)||x.kind!=='electionSeason'||unavailable(x,{})||!spendAction('party-route:'+x.deadline))return;
 const p=pstate(),old=playerFactionId107(),previous=p.factions[old],next=p.factions[id],moved=old!==id,allocation={};
 x.chosen=id;
 if(moved){
  previous.relation=clamp(previous.relation-15,0,100);next.relation=clamp(next.relation+15,0,100);
  previous.agendaOffset107=(previous.agendaOffset107||0)-10;next.agendaOffset107=(next.agendaOffset107||0)+10;
  const lost=factionExitSeats107(old),independent=lost>=5?Math.max(1,Math.floor(lost*.1)):0,recipients=[0,1,2].filter(n=>n!==old),remaining=lost-independent;
  previous.seats-=lost;const extra=remaining%2?recipients[Math.floor(rand()*2)]:-1;
  for(const recipient of recipients){const gain=Math.floor(remaining/2)+(recipient===extra?1:0);p.factions[recipient].seats+=gain;allocation[recipient]=gain}
  p.factions[4].seats+=independent;if(independent)allocation[4]=independent;
  p.playerFaction=id;rules103().coalition=[id];
 }else{next.relation=clamp(next.relation+3,0,100);next.agendaOffset107=(next.agendaOffset107||0)+2}
 const label=(moved?'转向':'继续支持')+next.name;
 x.actions.push({q:s.q,key:'back-faction-'+id,label});x.used['back-faction-'+id]=true;
 seasons107().switches.push({q:s.q,deadline:x.deadline,from:old,to:id,allocation});
 noteDecision(label,id===0?{authority:3,elite:2}:id===1?{market:2,nation:2}:{law:3,authority:-2});
 log('党内路线确认',label+'。'+(moved?'流失的席位占比分配：'+Object.entries(allocation).map(([i,n])=>p.factions[i].name+' +'+n+' 个百分点').join('、')+'；民主党派席位不变。':'未调整席位。'));
 record();save();render();
}
const actBeforeSeasons107=situationAct;
situationAct=function(id,key){const x=sits().active.find(a=>a.id===id);if(x?.kind==='electionSeason'){const match=/^back-faction-([012])$/.exec(key);if(match)supportPartyRoute107(x,Number(match[1]));return}return actBeforeSeasons107(id,key)};
const progressBeforeSeasons107=situationProgress;
situationProgress=function(x){if(x.kind!=='electionSeason')return progressBeforeSeasons107(x);return `<div class="election-season-progress"><p>第 ${x.start}—${x.deadline} 季度 · ${Math.max(0,x.deadline-s.q)} 季度后换届结算</p><p>全国加权选票预测 ${fmt(electionForecast().total,1)}%。${regime().id==='party'?x.chosen===null?'本季可选择支持党内三派之一；民主党派与无党籍团体不能成为玩家所属派系。':'本轮已确认：'+esc(pstate().factions[x.chosen].name)+'。':'背景局势，无需处置。'}</p></div>`};
const alertsBeforeSeasons107=activeAlerts107;
activeAlerts107=function(){const background=activeSit('electionSeason');return alertsBeforeSeasons107().filter(a=>!background||a.id!=='situation:'+background.id)};
function decayPanel107(){
 const rates=quarterlyDecayRates107(),last=seasons107().reports[0],blockers=[...new Set([...(seasons107().blockedQ===s.q&&v3().quarterOpen?seasons107().blocked:[]),...decayBlockers107()])];
 return `<section class="card regional-decay-panel"><div class="section-label"><h3>季度地方民意</h3><span>${blockers.length?'本季暂停额外衰退':'季末结算'}</span></div><p>每季度随机一个地区支持率 −${fmt(rates.support,1)} 个百分点；全国政治稳定 −${fmt(rates.stability,2)}。</p>${blockers.length?`<p>暂停原因：${blockers.map(k=>esc(SIT_NAMES[k])).join('、')}。</p>`:''}<p>已完成部长议程减免：地区支持 ${fmt(rates.benefit.support,1)} 个百分点，政治稳定 ${fmt(rates.benefit.stability,2)} 点。</p>${last?`<p>上次结算 · 第 ${last.q} 季度：${last.blocked.length?'因局势暂停额外衰退':(last.region===null?'地区支持无衰退':esc(v3().regions[last.region].name)+'支持率 −'+fmt(last.support,1)+' 个百分点')+'，政治稳定 −'+fmt(last.stability,2)}。</p>`:''}<details><summary>查看地区累计修正与减免细则</summary><p>地区衰退直接以百分点扣减当前地区支持预测，不直接扣全国公众支持；按人口权重影响全国选票。每季度只抽取一个地区，每季仅结算一次。奥运、短期危机或正在执行强制政策的长期局势暂停额外衰退；本季度中途结束仍豁免本季。未实施强制政策的长期少数群体问题、修宪和选举季不暂停。</p><p>强硬集权、国家统制、务实协调议程每项减免地区支持0.5个百分点与稳定0.25点；市场社会、法治改革、社会民主议程每项减免地区支持0.5个百分点。按原提案倾向累计，最低降至零，换人不会重复奖励或取消成果。</p>${v3().regions.map(z=>`<div class="row"><span>${esc(z.name)}</span><b>累计 ${fmt(seasons107().offsets[z.id],1)} 个百分点 · 当前 ${fmt(regionalEstimate(z).share,1)}%</b></div>`).join('')}</details></section>`;
}
const politicsBeforeSeasons107=politics;
politics=function(){return decayPanel107()+politicsBeforeSeasons107()};
const assemblyBeforeSeasons107=assembly;
assembly=function(){return (regime().id==='party'?`<section class="card party-route-panel"><h3>当前党内路线 · ${esc(partyRoute107().name)}</h3><p>${esc(partyRoute107().text)}</p><details><summary>查看换届路线规则</summary><p>每届第18—24季度，可在选举季支持一次党内派系。转移后原派失去约20%的现有席位，其余党内派系近乎均分，余数随机分配，约一成流向无党籍团体；民主党派不参与分配。席位占比合计保持100%。</p><p>所属派系变化后，议程损耗豁免和玩家所属标记同步转移；同党其他派系的部长继续任职。</p></details></section>`:'')+assemblyBeforeSeasons107()};
const programmePanelBeforeSeasons107=programmePanel;
programmePanel=function(k){const html=programmePanelBeforeSeasons107(k),pr=rules103().proposals[k],b=programmeDecayBenefit107({...pr,completed:true});if(!html||!b.support&&!b.stability)return html;return html.replace('<details>',`<p>${pr.completed?'已获长期减免':'完成后的长期减免'}：每季度地区支持衰退减少 ${fmt(b.support,1)} 个百分点${b.stability?'，政治稳定衰退减少 '+fmt(b.stability,2)+' 点':''}。</p><details>`)};
function seasonsGuide107(add){
 add('electionSeason','选举季',['选举季局势','换届季','党内换届'],'有选举的政体与一党独大制，在每届第18至24季度进入选举季，第24季度结算后结束；第二届为第42至48季度。一般政体仅作背景，无处置选项。一党独大制可花费1行动点确认一次党内路线，限正统、新锐、改革三派；不能选择民主党派或无党籍团体。转移派系使原派关系−15、议程倾向修正−10，新派关系+15、议程倾向修正+10；原派约20%的现有席位转给其余党内派系及少量无党籍团体。','局势与处置');
 add('quarterly-regional-decay','季度地方民意',['地区支持衰退','省份支持率','地方衰退','季度衰退','季度民意修正','季度民意累计修正'],'每季度季末随机一个地区支持率下降5个百分点，全国政治稳定下降2点，不直接扣全国公众支持。奥运筹备与举办、经济危机、大罢工、司法公平、政治丑闻、灾害、叛乱、民主化运动、政府危机与强制少数群体政策暂停额外衰退；中途结束仍豁免本季。未执行强制政策的长期问题、修宪、选举季不暂停。','地区与选举');
 add('programme-decay-relief','议程衰退减免',['长期减免','部长议程减免'],'强硬集权、国家统制、务实协调倾向的部长议程，每完成一项减少季度地区支持衰退0.5个百分点和稳定衰退0.25点；市场社会、法治改革、社会民主议程每项减少地区支持衰退0.5个百分点。按提案原倾向计入，成果永久保留且不重复领取；衰退最低降至零。','内阁与人事');
 add('party-routes','党内路线',['正统派','元老派','主流派','新锐派','青年派','改革派'],'一党独大制的前三个派系分别对应正统、新锐、改革路线。正统：稳定基础衰退1点、地区支持衰退6个百分点；新锐：实际年化增长每季度额外+1个百分点，稳定基础衰退2.5点；改革：地区支持基础衰退3个百分点，民主化运动每季度触发概率额外+5个百分点，原15%条件成立时合计20%。部长议程减免另计，危机与奥运暂停衰退时路线额外衰退一并暂停。','立法与政治');
}
const consoleFieldsBeforeSeasons107=consoleFields107;
consoleFields107=function(){const fields=consoleFieldsBeforeSeasons107(),clock=fields.find(f=>f.key==='q');if(clock){const setClock=clock.set;clock.set=value=>{setClock(value);const state=seasons107();state.lastDecayQ=Math.min(state.lastDecayQ,value);state.lastSpringRollQ=Math.min(state.lastSpringRollQ,value);state.blockedQ=value;state.blocked=[];syncElectionSeason107()}}return [...fields,...v3().regions.map(z=>({key:'region.'+z.id+'.sentimentOffset',group:'地区与地方诉求',label:z.name+' · 季度民意累计修正（百分点）',get:()=>seasons107().offsets[z.id],set:value=>seasons107().offsets[z.id]=value,min:-99,max:0,integer:false}))]};
const validBeforeSeasons107=validSave;
validSave=function(v){
 if(!validBeforeSeasons107(v))return false;const x=v.politicalSeasons107;if(!x)return true;
 if(x.version!==1||!['installedQ','lastDecayQ','lastSpringRollQ','blockedQ'].every(k=>Number.isInteger(x[k]))||!Array.isArray(x.blocked)||x.blocked.some(k=>!SIT_NAMES[k])||!Array.isArray(x.offsets)||x.offsets.length!==v.governance.regions.length||x.offsets.some(n=>!Number.isFinite(n)||n>0||n< -99)||!Array.isArray(x.reports)||!Array.isArray(x.switches)||!Array.isArray(x.closedSeasons)||x.closedSeasons.some(n=>!Number.isInteger(n)||n<24||n%24))return false;
 if(x.reports.some(r=>!Number.isInteger(r.q)||r.region!==null&&!v.governance.regions[r.region]||!Array.isArray(r.blocked)||r.blocked.some(k=>!SIT_NAMES[k])||![r.support,r.stability,r.rates?.support,r.rates?.stability].every(n=>Number.isFinite(n)&&n>=0)))return false;
 if(x.switches.some(r=>!Number.isInteger(r.q)||!Number.isInteger(r.deadline)||![r.from,r.to].every(id=>Number.isInteger(id)&&id>=0&&id<=2)||!r.allocation||Object.entries(r.allocation).some(([id,n])=>![0,1,2,4].includes(+id)||!Number.isInteger(n)||n<0)))return false;
 return v.situations.active.filter(a=>a.kind==='electionSeason').every(a=>Number.isInteger(a.deadline)&&a.deadline%24===0&&a.start===a.deadline-6&&(a.chosen===null||[0,1,2].includes(a.chosen)));
};
