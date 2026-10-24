/* 1.0.6 additions: parliamentary allies and three-quarter government crises. */
let pendingAdmin107=false;
function features107(){return s.features107}
function automaticCoalition107(){return ['constitutional','westminster'].includes(regime().id)}
function coalitionShare107(ids=rules103().coalition){let total=pstate().factions.reduce((n,f)=>n+f.seats,0);return total?ids.reduce((n,id)=>n+(pstate().factions[id]?.seats||0),0)/total*100:0}
function allies107(){return coalitionRegime()?rules103().coalition.filter(id=>id!==playerFactionId107()):[]}
function factionDistance107(a,b){let x=factionProfile(a),y=factionProfile(b),keys=new Set([...Object.keys(x.budget),...Object.keys(y.budget)]);return [...keys].reduce((n,k)=>n+((x.budget[k]||0)-(y.budget[k]||0))**2,0)-x.traits.filter(t=>y.traits.includes(t)).length*.5}
function initializeAllies107(){
 if(!automaticCoalition107())return;
 let p=pstate(),own=playerFactionId107(),others=p.factions.filter(f=>f.id!==own),distance=Math.min(...others.map(f=>factionDistance107(p.factions[own],f))),first=pick(others.filter(f=>factionDistance107(p.factions[own],f)===distance));
 rules103().coalition=[own,first.id];
 while(coalitionShare107()<50){let next=pick(others.filter(f=>!rules103().coalition.includes(f.id)));rules103().coalition.push(next.id)}
 for(let id of allies107()){let f=p.factions[id];f.relation=Math.round(600+rand()*100)/10;f.agendaOffset107=(f.agendaOffset107||0)+60-support(f)}
 log('联合政府成立',allies107().map(id=>p.factions[id].name).join('、')+'成为政治盟友；联合政府占 '+fmt(coalitionShare107(),0)+'% 席位。盟友关系低于50会触发三季度政府危机。');
}
const supportBeforeAllies107=support;
support=function(f){return clamp(supportBeforeAllies107(f)+(f.agendaOffset107||0),0,100)};
const initBeforeAdditions107=initPolitics;
initPolitics=function(id=selectedRegime){
 initBeforeAdditions107(id);
 if(features107())return;
 if(!creatingWorld)try{localStorage.setItem(KEY+'-pre-107-additions',JSON.stringify(s))}catch(_){}
 s.adminMode=creatingWorld?pendingAdmin107:s.adminMode===true;
 s.features107={version:1,activeAlerts:[],notices:[],lastCoalitionQ:s.q};
 let pureWarning=e=>e?.type==='situation-notice'&&(e.title.startsWith('局势出现：')||e.title==='地方秩序警告');
 let removedCurrent=pureWarning(pstate().current);pstate().queue=pstate().queue.filter(e=>!pureWarning(e));if(removedCurrent)pstate().current=pstate().queue.shift()||null;sits().notices=sits().notices.filter(e=>!pureWarning(e));
 if(removedCurrent&&!pstate().current)finishQuarter();
 if(creatingWorld)initializeAllies107();
};
function setGameEnd107(reason){if(!s.adminMode)s.ended=reason;else if(features107())features107().preventedEnd={q:s.q,reason}}
function addNotice107(id,title,text,tab='overview'){let f=features107();if(f&&!f.notices.some(n=>n.id===id))f.notices.push({id,title,text,tab})}
function startGovernmentCrisis107(){
 if(!coalitionRegime()||s.ended||activeSit('government')||!allies107().length)return null;
 let broken=allies107().filter(id=>pstate().factions[id].relation<50);if(!broken.length)return null;
 let x={id:sits().nextId++,kind:'government',start:s.q,deadline:s.q+3,opening:false,cooldowns:{},used:{},plans:{},actions:[],cost:0,original:[...rules103().coalition],broken,replacements:[],lastPenaltyQ:s.q};
 sits().active.push(x);log('政府危机',governmentText107(x));return x;
}
function governmentText107(x){return `政治盟友撤回信任。须在第 ${x.deadline} 季度到来前，将失信盟友关系恢复到60以上，或邀请新党派组建至少占50%席位的新联盟。每季支持率−1、稳定度−3。${automaticCoalition107()?'逾期将通过不信任案，结束任期。':'逾期联盟解散，盟友所属阁员离任，玩家继续执政。'}请前往${regime().body}协商；本局势没有独立处置选项。`}
function resignCoalitionMinisters107(ids){
 let p=pstate(),names=[];
 for(let [slot,item]of Object.entries(p.cabinet)){if(!item)continue;let c=p.candidates[item.candidate];if(ids.includes(c.faction)&&c.faction!==playerFactionId107()){names.push(office(slot)+' '+c.name);removeOfficial(slot)}}
 if(names.length)log('联合政府阁员集体辞职',names.join('、')+'离任；逐人按强制辞职规则计入支持、稳定、派系关系及人事承诺的后果。');
 return names;
}
function finishGovernmentCrisis107(x,reason){
 sits().active=sits().active.filter(v=>v.id!==x.id);sits().history.unshift({...x,end:s.q,reason});
 log('政府危机结束',reason);addNotice107('government-end-'+x.id,'政府危机结束',reason,'assembly');
}
function syncCoalition107(){
 if(!features107()||!coalitionRegime()||s.ended)return;
 let x=activeSit('government')||startGovernmentCrisis107();if(!x)return;
 for(let id of x.original.filter(id=>id!==playerFactionId107()))if(pstate().factions[id].relation<50&&!x.broken.includes(id))x.broken.push(id);
 let replacements=x.replacements.filter(id=>pstate().factions[id].relation>=60),newIds=[playerFactionId107(),...replacements];
 if(replacements.length&&coalitionShare107(newIds)>=50){
  let leaving=x.original.filter(id=>id!==playerFactionId107());resignCoalitionMinisters107(leaving);rules103().coalition=newIds;
  finishGovernmentCrisis107(x,'新联盟取得 '+fmt(coalitionShare107(),1)+'% 席位，旧盟友所属阁员已经离任。');return;
 }
 if(x.broken.every(id=>pstate().factions[id].relation>60)&&coalitionShare107(x.original)>=50){
  rules103().coalition=[...new Set([...x.original,...x.replacements])];finishGovernmentCrisis107(x,'失信盟友关系已恢复到60以上，原联合政府重获信任，现任阁员留任。');
 }
}
function coalitionQuarter107(){
 if(!features107()||s.ended)return;syncCoalition107();let x=activeSit('government');if(!x)return;
 if(x.lastPenaltyQ<s.q){mod({approval:-1,stability:-3});x.lastPenaltyQ=s.q;log('政府危机持续','联合政府信任尚未恢复，支持率−1、政治稳定−3。')}
 if(s.q<x.deadline)return;
 let oldAllies=rules103().coalition.filter(id=>id!==playerFactionId107());
 if(automaticCoalition107()&&!s.adminMode){finishGovernmentCrisis107(x,'三季度期限已到，议会通过政府不信任案。');setGameEnd107('政府不信任案通过：三季度内未能恢复盟友信任或建立新多数联盟。')}
 else{resignCoalitionMinisters107(oldAllies);rules103().coalition=[playerFactionId107()];finishGovernmentCrisis107(x,s.adminMode&&automaticCoalition107()?'不信任案已触发；管理员模式继续运行，联合政府解散，盟友阁员按规则离任。':'三季度内未恢复信任，联合政府解散，盟友阁员按强制辞职规则离任，玩家继续执政。')}
}
const inviteBeforeAllies107=inviteCoalition;
inviteCoalition=function(id){let m=pstate().members[id],x=activeSit('government'),before=[...rules103().coalition];if(x&&m&&!x.original.includes(m.faction)&&!before.includes(m.faction)&&pstate().factions[m.faction].relation>=70&&pstate().ap>=1&&m.last!==s.q&&!s.ended){x.replacements.push(m.faction)}inviteBeforeAllies107(id);if(x&&!rules103().coalition.includes(m?.faction))x.replacements=x.replacements.filter(f=>f!==m?.faction);syncCoalition107();record();save();render()};
const factionRowsBeforeAllies107=factionVotingRows;
factionVotingRows=function(){let html=factionRowsBeforeAllies107();for(let id of allies107()){let name=esc(pstate().factions[id].name);html=html.replace(name+'</b>',name+'</b><span class="player-party-badge ally-badge">政治盟友</span>')}return html};
const assemblyBeforeAllies107=assembly;
assembly=function(){let x=activeSit('government'),html=assemblyBeforeAllies107();return (coalitionRegime()?`<div class="card coalition-status"><b>${allies107().length?'联合政府':'单党政府'}</b><p>玩家党派与政治盟友合计 ${fmt(coalitionShare107(),1)}% 席位。${x?esc(governmentText107(x)):'与其他党团关系达到70后，可会见其总召邀请组建联合政府。'}</p>${x?`<p>当前剩余 ${Math.max(0,x.deadline-s.q)} 个季度；待恢复信任：${x.broken.map(id=>esc(pstate().factions[id].name)+'（'+fmt(pstate().factions[id].relation,1)+'）').join('、')}。新联盟已争取 ${fmt(coalitionShare107([playerFactionId107(),...x.replacements]),1)}% 席位。</p>`:''}</div>`:'')+html};
SIT_NAMES.government='政府危机';SIT_INFO.government=['政治盟友撤回对联合政府的信任。','恢复失信盟友关系至60以上，或建立至少50%席位的新联盟','支持率 −1；政治稳定 −3；三季度期限'];
const actionsBeforeAllies107=situationActions;situationActions=function(x){return x.kind==='government'?[]:actionsBeforeAllies107(x)};
const progressBeforeAllies107=situationProgress;situationProgress=function(x){return x.kind==='government'?esc(governmentText107(x))+`<br>剩余 ${Math.max(0,x.deadline-s.q)} 个季度 · 当前联盟 ${fmt(coalitionShare107(),1)}% 席位`:progressBeforeAllies107(x)};
