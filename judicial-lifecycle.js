/* Judicial careers, vacancies and quarterly succession. */
const JUDGE_TRAIT_PATHS107={
 0:[[2,.75],[4,.25]], // pragmatic coordination
 1:[[1,.75],[0,.25]], // rule-of-law reform
 2:[[2,.65],[3,.35]], // fiscal technocracy
 3:[[0,.5],[2,.5]],  // public-service expansion
 4:[[3,1]],          // hard-line centralization
 5:[[0,.7],[1,.3]],  // social democracy
 6:[[3,.75],[2,.25]],// state direction
 7:[[0,.5],[1,.5]],  // market socialism
 8:[[1,.65],[2,.35]] // free trade
};
const JUDGE_DEPARTURES107=['任上病故','因病辞职','主动退休'];
function judicialStaff107(){return s.judicialStaff}
function initializeJudicialStaff107(){
 if(s.judicialStaff)return;
 if(!creatingWorld)try{localStorage.setItem(KEY+'-pre-judicial107',JSON.stringify(s))}catch(_){}
 s.judicialStaff={version:1,lastRollQ:s.q,reserve:[],nextReserve:1,history:[],pendingEvents:[],chiefPending:false};
}
const initBeforeJudicialStaff107=initPolitics;
initPolitics=function(...args){initBeforeJudicialStaff107(...args);initializeJudicialStaff107()};
const eligibleBeforeJudicialStaff107=cabinetEligible;
cabinetEligible=function(c){return !!c&&!c.judicialCareer&&eligibleBeforeJudicialStaff107(c)};
function judicialNomineeSource107(key){
 if(typeof key!=='string'||!/^([cr])\d+$/.test(key))return null;
 return key[0]==='c'?pstate().candidates.find(c=>c.id===Number(key.slice(1))):judicialStaff107().reserve.find(c=>c.id===Number(key.slice(1)));
}
function eligibleForCourt107(c){
 if(!c||c.judicialCareer)return false;
 const base=c.baseName||c.name;
 if(pstate().members.some(m=>(m.baseName||m.name)===base))return false;
 if(Object.values(pstate().cabinet).some(item=>item&&(pstate().candidates[item.candidate]?.baseName||pstate().candidates[item.candidate]?.name)===base))return false;
 return !activeJudges107().some(j=>(j.baseName||j.name)===base);
}
function judicialNominees107(){return [...pstate().candidates.map(c=>({key:'c'+c.id,person:c})),...judicialStaff107().reserve.map(c=>({key:'r'+c.id,person:c}))].filter(x=>eligibleForCourt107(x.person))}
function replenishJudicialNominees107(){
 const staff=judicialStaff107();if(judicialNominees107().length>=10)return;
 // Refills use a separate stream, so viewing or replenishing the pool cannot reroll economic events.
 const oldRng=s.rng;
 try{s.rng=hash(s.seed+'|judicial-reserve|'+staff.nextReserve);
  for(let i=0;i<15;i++){
   const id=staff.nextReserve++,faction=i%pstate().factions.length,c={id,name:personName(),faction,trait:pick(factionProfile(pstate().factions[faction]).traits),skill:50+Math.floor(rand()*41),loyalty:45+Math.floor(rand()*31),achievements:0,tenure:0};
   assignHonour107(c,'judicial-reserve');staff.reserve.push(c);
  }
 }finally{s.rng=oldRng}
}
function judgeTraitText107(trait){return (JUDGE_TRAIT_PATHS107[trait]||JUDGE_TRAIT_PATHS107[0]).map(([view,probability])=>Math.round(probability*100)+'% '+JUDICIAL_VIEWS[view].name).join(' / ')}
function departJudge107(id,reason){
 const j=constitution().judges.find(j=>j.id===id);if(!j||j.vacant||!JUDGE_DEPARTURES107.includes(reason)||s.ended)return false;
 const staff=judicialStaff107(),person=JSON.parse(JSON.stringify(j)),wasChief=j.chief;
 staff.history.push({type:'departure',q:s.q,seat:id,reason,person});
 Object.assign(j,{vacant:true,chief:false,boosts:[],departureReason:reason,departureQ:s.q});
 if(wasChief)staff.chiefPending=true;
 const title=judgeTitle(person)+' '+person.name+' '+reason;
 const text=`${constitutionBaseRegime().court}通报：${person.name}${reason}，第 ${id+1} 席现已空缺。请从未担任政府或议事机关职务的备选人员中任命接替者，消耗 1 政治行动点。${wasChief?'首席职位同时空缺；完成一次补缺任命后，将从全部现任法官中随机产生新首席。':''}`;
 log('司法人员变动',title);staff.pendingEvents.push({title,text});replenishJudicialNominees107();return true;
}
function judicialTurnoverQuarter107(){
 const staff=judicialStaff107();if(!staff||s.ended||s.q<=staff.lastRollQ)return;staff.lastRollQ=s.q;
 const judges=activeJudges107();if(!judges.length||rand()>=.05)return;
 const judge=judges[Math.floor(rand()*judges.length)],reason=JUDGE_DEPARTURES107[Math.floor(rand()*3)];departJudge107(judge.id,reason);
}
const maintenanceBeforeJudicialStaff107=politicalMaintenance;
politicalMaintenance=function(){judicialTurnoverQuarter107();maintenanceBeforeJudicialStaff107()};
const queueBeforeJudicialStaff107=queueQuarterEvents;
queueQuarterEvents=function(){
 queueBeforeJudicialStaff107();const staff=judicialStaff107();
 for(const report of staff.pendingEvents.splice(0)){
  const e=eventFrom('司法特别报告：'+report.title,report.text,[option('确认报告，安排法官补缺','在最高司法机关选择接替者；本报告不占本季度三个常规事件名额。')]);e.constitutionalSpecial=true;e.type='judicial-departure';pushEvent(e);
 }
};
function judgeNominations107(seat=null){
 if(s.ended)return;
 const vacancies=constitution().judges.filter(j=>j.vacant);if(!vacancies.length){toast('当前没有法官空缺');return}
 if(seat===null||!vacancies.some(j=>j.id===seat))seat=vacancies[0].id;
 const pool=judicialNominees107();
 modal(`<section class="judicial-nominations"><span class="tag">${esc(constitutionBaseRegime().court)} · 第 ${seat+1} 席</span><h2>法官备选池</h2><p>可任命任何党派的未任职人员，包括未加入联合政府的党派。任命消耗 1 行动点；进入司法系统后永久退出政府候选名单，也不能兼任议事机关职务。司法倾向按下列概率在确认任命时确定。</p><div class="choices">${pool.map(({key,person:c})=>`<button data-judicial-nominee="${key}" onclick="judgeAppointmentPreview107(${seat},'${key}')"><strong>${esc(c.name)} · ${TRAITS[c.trait].name}</strong><small>${esc(pstate().factions[c.faction].name)} · 能力 ${c.skill}<br>就任后的司法倾向：${judgeTraitText107(c.trait)}</small></button>`).join('')||'<p>当前无合资格候选人。</p>'}</div><button onclick="$('modal').close()">返回</button></section>`);
}
function judgeAppointmentPreview107(seat,key){
 const c=judicialNomineeSource107(key),j=constitution().judges[seat];if(s.ended||!j?.vacant||!eligibleForCourt107(c)){toast('该席位或候选人已不符合任命条件');return}
 modal(`<span class="tag">司法任命 · 第 ${seat+1} 席</span><h2>任命${esc(c.name)}为${esc(JUDGE_TITLES[pstate().regime][0])}</h2><p>${esc(pstate().factions[c.faction].name)} · ${TRAITS[c.trait].name}</p>${honourDescription107(c)}<p>司法倾向：${judgeTraitText107(c.trait)}。结果在确认时确定，刷新或读档不会重抽。人物的原姓名和称号保留。</p><p>消耗 1 政治行动点；不改变司法独立度。此人将永久退出政府任命候选名单。${judicialStaff107().chiefPending?'补缺后，从全体现任法官中等概率抽取新首席。':''}</p><button onclick="judgeNominations107(${seat})">返回候选池</button> <button class="primary" onclick="appointJudge107(${seat},'${key}')">确认任命法官 · 1 行动点</button>`);
}
function appointJudge107(seat,key){
 const c=judicialNomineeSource107(key),old=constitution().judges[seat];if(s.ended||!old?.vacant||!eligibleForCourt107(c))return;
 if(!spendAction())return;
 let roll=rand(),paths=JUDGE_TRAIT_PATHS107[c.trait]||JUDGE_TRAIT_PATHS107[0],view=paths.at(-1)[0];
 for(const [value,probability]of paths){if(roll<probability){view=value;break}roll-=probability}
 c.judicialCareer=true;
 const judge={id:seat,name:c.name,baseName:c.baseName||c.name,honour:c.honour??null,trait:view,politicalTrait:c.trait,faction:c.faction,sourceKey:key,chief:false,vacant:false,relation:clamp(c.loyalty,0,100),boosts:[],appointedQ:s.q};
 constitution().judges[seat]=judge;delete pstate().lastAction['judge:'+seat];
 const staff=judicialStaff107();staff.history.push({type:'appointment',q:s.q,seat,person:JSON.parse(JSON.stringify(judge))});
 log('法官任命',judge.name+'就任'+JUDGE_TITLES[pstate().regime][0]+'，原倾向为'+TRAITS[c.trait].name+'，司法倾向为'+JUDICIAL_VIEWS[view].name+'。');
 if(staff.chiefPending){const active=activeJudges107(),chief=active[Math.floor(rand()*active.length)];active.forEach(j=>j.chief=j===chief);staff.chiefPending=false;staff.history.push({type:'chief',q:s.q,seat:chief.id,person:JSON.parse(JSON.stringify(chief))});log('司法首席产生',chief.name+'从全体现任法官中被随机选为'+JUDGE_TITLES[pstate().regime][1]+'。')}
 replenishJudicialNominees107();noteDecision('任命法官'+judge.name,TRAIT_AXES[c.trait]);$('modal').close();pSave();
}
const alertsBeforeJudicialStaff107=activeAlerts107;
activeAlerts107=function(){const alerts=alertsBeforeJudicialStaff107();if(!s.ended&&s.judicialStaff){const count=constitution().judges.filter(j=>j.vacant).length;if(count)alerts.push({id:'judicial-vacancy',title:'最高司法机关有 '+count+' 席空缺',text:'请在最高司法机关的法官备选池任命接替者。'+(judicialStaff107().chiefPending?'首席空缺，完成补缺后随机产生新首席。':''),tabs:['judiciary'],metric:null,slot:null})}return alerts};
const judiciaryBeforeStaff107=judiciary;
judiciary=function(){
 const staff=judicialStaff107(),vacancies=constitution().judges.filter(j=>j.vacant);
 const controls=`<section class="card judicial-staff" id="judicial-personnel"><div class="section-label"><h3>司法人事</h3><span>在任 ${activeJudges107().length} / 法定 ${constitution().judges.length} 席</span></div><p>每季度有 5% 概率出现一位法官离任，病故、病辞和退休各占三分之一。空缺不计入投票人数。${staff.chiefPending?'目前首席空缺；补缺后将在现任法官中随机选任。':''}</p>${vacancies.length?`<button class="primary" onclick="judgeNominations107()" ${s.ended?'disabled':''}>补缺任命 · ${vacancies.length} 席</button>`:'<span class="tag">法官席位齐备</span>'}<details><summary>法官人事档案 · ${staff.history.length} 项</summary>${staff.history.slice().reverse().map(h=>`<div class="news"><time>${date(h.q)}</time><div><h4>${esc(h.person.name)} · ${h.type==='departure'?h.reason:h.type==='chief'?'出任司法首席':'就任法官'}</h4><p>第 ${h.seat+1} 席${h.type==='appointment'?' · '+JUDICIAL_VIEWS[h.person.trait].name:''}</p></div></div>`).join('')||'<p>尚无任内人事变动。</p>'}</details></section>`;
 return controls+judiciaryBeforeStaff107();
};
const validBeforeJudicialStaff107=validSave;
validSave=function(v){
 try{
  if(!validBeforeJudicialStaff107(v))return false;const staff=v.judicialStaff;if(!staff)return true;
  if(staff.version!==1||!Number.isInteger(staff.lastRollQ)||staff.lastRollQ<0||staff.lastRollQ>v.q||typeof staff.chiefPending!=='boolean'||!Array.isArray(staff.reserve)||!Array.isArray(staff.history)||!Array.isArray(staff.pendingEvents)||!Number.isInteger(staff.nextReserve)||staff.nextReserve<1)return false;
  const judges=v.constitution.judges,baseName=p=>p.baseName||p.name,active=judges.filter(j=>!j.vacant),activeGovernment=Object.values(v.political.cabinet).filter(Boolean).map(item=>v.political.candidates[item.candidate]);
  if(judges.some(j=>j.vacant!==undefined&&typeof j.vacant!=='boolean'||j.vacant&&(j.chief||!JUDGE_DEPARTURES107.includes(j.departureReason)||!Number.isInteger(j.departureQ)||j.departureQ>v.q)))return false;
  if(!staff.chiefPending&&!active.length||staff.chiefPending&&!judges.some(j=>j.vacant))return false;
  if(new Set(staff.reserve.map(c=>c.id)).size!==staff.reserve.length||staff.reserve.some(c=>!Number.isInteger(c.id)||c.id<1||c.id>=staff.nextReserve||typeof c.name!=='string'||c.name.length>50||!v.political.factions[c.faction]||!TRAITS[c.trait]||!Number.isFinite(c.skill)||!Number.isFinite(c.loyalty)))return false;
  const keys=new Set();
  for(const j of active){
   if(activeGovernment.some(c=>baseName(c)===baseName(j))||v.political.members.some(m=>baseName(m)===baseName(j)))return false;
   if(j.sourceKey!==undefined){
    if(typeof j.sourceKey!=='string'||!/^([cr])\d+$/.test(j.sourceKey)||keys.has(j.sourceKey))return false;keys.add(j.sourceKey);
    const source=(j.sourceKey[0]==='c'?v.political.candidates:staff.reserve).find(c=>c.id===Number(j.sourceKey.slice(1)));
    if(!source?.judicialCareer||baseName(source)!==baseName(j)||!TRAITS[j.politicalTrait]||!JUDGE_TRAIT_PATHS107[j.politicalTrait].some(([view])=>view===j.trait))return false;
   }
  }
  const careerSources=[...v.political.candidates,...staff.reserve];
  if(careerSources.some(c=>c.judicialCareer!==undefined&&typeof c.judicialCareer!=='boolean')||activeGovernment.some(c=>c.judicialCareer)||careerSources.some(c=>c.judicialCareer&&v.political.members.some(m=>baseName(m)===baseName(c))))return false;
  if(staff.history.some(h=>!['departure','appointment','chief'].includes(h.type)||!Number.isInteger(h.q)||h.q<0||h.q>v.q||!judges[h.seat]||typeof h.person?.name!=='string'||h.type==='departure'&&!JUDGE_DEPARTURES107.includes(h.reason)))return false;
  if(staff.pendingEvents.some(e=>typeof e.title!=='string'||typeof e.text!=='string'))return false;
  return true;
 }catch(_){return false}
};
