const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..');let storage={};
function boot(){let nodes={},ctx={console,setTimeout:()=>{},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},document:{getElementById:id=>nodes[id]||(nodes[id]={innerHTML:'',style:{},showModal(){this.open=true},close(){this.open=false},addEventListener(){}})}};vm.createContext(ctx);for(let f of ['game.js','political.js','governance.js','revision12.js','situations.js','release103.js','release104.js','cabinet-tasks.js','release107.js','coalition107.js','interface107.js','console107.js','action-points.js','immersion.js','constitution.js','guide.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});return ctx}
let ctx=boot();
vm.runInContext(`
function assert(v,m){if(!v)throw Error(m)}
function near(a,b,m){assert(Math.abs(a-b)<1e-7,m+': '+a+' vs '+b)}
function fresh103(id='presidential'){
 selectedRegime=id;pendingDifficulty=false;pendingModel='auto';create('release103-'+id);
 s.situations.active=[];s.situations.notices=[];s.inflation=3;s.unemployment=6;s.debt=s.gdp*.4;s.approval=75;s.stability=80;s.q=0;pstate().judicial=75;pstate().current=null;pstate().queue=[];
}
// Strike: repeated relief in the same quarter consumes AP and funds, not cooldowns.
fresh103();{
 let x=startSituation('strike',true),debt=s.debt;pstate().ap=3;
 situationAct(x.id,'relief');situationAct(x.id,'relief');situationAct(x.id,'relief');
 near(s.unemployment,10.5,'three relief rounds');near(s.debt-debt,s.gdp*.06,'relief cost');assert(pstate().ap===0,'relief uses AP');
 situationAct(x.id,'relief');near(s.unemployment,10.5,'no free relief');
 pstate().ap=3;situationAct(x.id,'works');assert(x.worksDue===4&&x.cooldowns.works===4,'four-quarter works');
 let cap=s.capitalStock;for(let q=1;q<4;q++){s.q=q;situationQuarter();assert(x.worksDue===4,'works not early');assert(unavailable(x,situationActions(x).find(a=>a.key==='works')),'works blocked')}
 s.q=4;situationQuarter();near(s.capitalStock,cap+5,'works delivered');assert(!x.worksDue,'works timer cleared');
 situationAct(x.id,'works');assert(x.worksDue===8,'works repeat at four quarters');
 s.unemployment=5;checkSituationEnds();assert(activeSit('strike'),'strict strike boundary');s.unemployment=4.99;checkSituationEnds();assert(!activeSit('strike'),'strict strike end');
}
// Budget requirements: tax deltas are additive, reversible and apply to all factions.
fresh103();{
 let p=pstate(),f=p.factions[2];f.name='社会民主党';p.bill={kind:'budget',description:'测试方案',title:'测试预算',policies:{...s.policies}};
 near(budgetRequirement(f),60,'neutral baseline');
 for(let [key,step]of [['income',1],['vat',1.5],['corporate',2]]){p.bill.policies={...s.policies,[key]:s.policies[key]+step};near(budgetRequirement(f),61,'tax increase '+key);p.bill.policies[key]=s.policies[key]-step;near(budgetRequirement(f),59,'tax cut '+key)}
 p.bill.policies={...s.policies,welfare:s.policies.welfare+1};near(budgetRequirement(f),58,'social welfare increase');
 p.bill.policies.welfare=s.policies.welfare-1;near(budgetRequirement(f),62,'social welfare cut');
 p.factions[0].name='社会民主党';near(budgetRequirement(p.factions[0]),62,'ruling party preferences');
 p.bill.policies={...s.policies,income:s.policies.income+1,vat:s.policies.vat+1.5,corporate:s.policies.corporate+2,welfare:s.policies.welfare+1};near(budgetRequirement(f),61,'additive budget shifts');
 assert(!assembly().includes('NaN')&&!assembly().includes('undefined'),'finite budget UI');assert(assembly().includes('社会保障'),'translated preferences');
}
// Proportional votes: no floor-to-whole-seat discontinuity; below-50 penalties add.
fresh103();{
 let p=pstate();for(let f of p.factions){f.relation=50;f.agendaDecay=0}for(let m of p.members)m.relation=50;
 near(votes(),0,'50 tendency zero votes');for(let f of p.factions)f.relation=51;for(let m of p.members)m.relation=51;near(votes(),10,'51 tendency 10 percent');
 for(let f of p.factions)f.relation=60;for(let m of p.members)m.relation=60;near(votes(),100,'60 full support');
 [49,49,46,60,60].forEach((v,i)=>{p.factions[i].relation=v;p.members.filter(m=>m.faction===i).forEach(m=>m.relation=v)});near(billStabilityPenalty(),.6,'0.1+0.1+0.4');
 p.bill={kind:'budget',description:'测试方案',title:'通过压力测试',policies:{...s.policies}};
 [49,49,46,100,100].forEach((target,i)=>{let affinity=[5,-2,2,0,0][i];p.factions[i].relation=target-affinity;p.members.filter(m=>m.faction===i).forEach(m=>m.relation=target-affinity)});
 p.factions.forEach((f,i)=>f.seats=[10,10,10,40,30][i]);let stability=s.stability;voteBill();near(s.stability,stability+1-.6,'penalty applied only after passing');assert(p.passed.length===1,'bill passed');
 s.q++;p.ap=3;p.bill={kind:'budget',description:'测试方案',title:'失败压力测试',policies:{...s.policies}};p.factions.forEach(f=>f.relation=10);p.members.forEach(m=>m.relation=10);stability=s.stability;voteBill();near(s.stability,stability-1,'failure has only original penalty');
}
fresh103();{
 let p=pstate(),own=playerFactionId107(),opposition=p.factions.find(f=>f.id!==own).id,initial=p.factions.map(f=>support(f));s.q=1;decayAgendas103();near(support(p.factions[own]),initial[own],'ruling party exempt');for(let i=0;i<5;i++)if(i!==own)near(support(p.factions[i]),initial[i]-2,'opposition drift');decayAgendas103();near(support(p.factions[opposition]),initial[opposition]-2,'drift once per quarter');
 for(let q=2;q<=8;q++){s.q=q;decayAgendas103()}let old=p.factions[opposition].agendaDecay;deal(opposition,'grant');near(p.factions[opposition].agendaDecay,old-8,'negotiation recovers drift');
}
// Cabinet qualification, leader-only coalition invitation, party-linked traits.
for(let r of REGIMES){fresh103(r.id);let p=pstate();assert(p.candidates.length===75,'expanded candidates');assert(new Set(Object.values(p.cabinet).map(i=>i.candidate)).size===Object.keys(p.cabinet).length,'no duplicate ministers');assert(p.candidates.every(c=>factionProfile(p.factions[c.faction]).traits.includes(c.trait)),'traits follow party');
 if(coalitionRegime()){
  assert(Object.values(p.cabinet).every(i=>p.candidates[i.candidate].faction===playerFactionId107()),'single-party initial government');assert(p.candidates.filter(c=>cabinetEligible(c)&&!Object.values(p.cabinet).some(i=>i.candidate===c.id)).length>=2,'replacement candidates');
  let initialCoalitionSize=rules103().coalition.length,opposition=p.factions.find(f=>!rules103().coalition.includes(f.id)).id,candidate=p.candidates.find(c=>c.faction===opposition),before=p.ap;appointOfficial('education',candidate.id);assert(p.ap===before,'outside appointment blocked');
  let rep=p.members.find(m=>m.id>=4&&m.faction===opposition);p.factions[opposition].relation=69.9;inviteCoalition(rep.id);assert(rules103().coalition.length===initialCoalitionSize,'below70 blocked');p.factions[opposition].relation=70;inviteCoalition(0);assert(rules103().coalition.length===initialCoalitionSize,'speaker cannot invite');
  inviteCoalition(rep.id);assert(rules103().coalition.includes(opposition)&&p.ap===before-1,'70 coalition allowed');assert(cabinetEligible(candidate),'coalition candidate eligible');appointOfficial('education',candidate.id);assert(p.cabinet.education.candidate===candidate.id,'coalition appointment');
  let ap=p.ap;inviteCoalition(rep.id);assert(p.ap===ap,'no duplicate invitation');
 }else{assert(p.candidates.every(cabinetEligible),'all factions eligible');let rep=p.members.find(m=>m.id>=4&&m.faction===1);p.factions[1].relation=100;inviteCoalition(rep.id);assert(rules103().coalition.length===1,'no nondem coalition');meetMember(rep.id);assert(!$('modal').innerHTML.includes('邀请组建联合政府'),'no nondem coalition UI')}
 assert(validSave(JSON.parse(JSON.stringify(s))),'valid cabinet save '+r.id);
}
// Research overflow, modernization multiplier, quarterly AP reset and cap.
fresh103();{
 s.policies.education=8;let r=rules103().research;s.q=1;researchQuarter103();near(r.progress,16,'8 x 2');researchQuarter103();near(r.progress,16,'research once per quarter');
 r.educationModernized=true;s.q=2;researchQuarter103();near(r.progress,40,'8 x 3');r.progress=95;s.q=3;researchQuarter103();assert(r.level===1&&politicalCapacity()===4,'research grants AP');near(r.progress,19,'research overflow');
 r.level=5;s.q=4;politicalMaintenance();assert(pstate().ap===6,'AP cap6');assert(archive().includes('每季度政治行动点总数'),'archive AP');
}
// Minister programme costs, progress and loyalty; no duplicate or repeat completion rewards.
fresh103();{
 let p=pstate(),pr=rules103().proposals.education,c=p.candidates[p.cabinet.education.candidate];s.policies.education=8;s.policies.infrastructure=4;c.skill=80;c.trait=5;c.loyalty=50;
 let quote=programmeQuote('education',1);near(quote.cost,.75*(1-.025*8-.025*4),'discounted 0.75 GDP');near(quote.progress,24*1.15*1.25,'weighted progress');
 let debt=s.debt;advanceProgramme('education',1);near(s.debt-debt,s.gdp*quote.cost/100,'funded programme');near(pr.progress,quote.progress,'programme actual progress');near(c.loyalty,52,'option loyalty +2');
 let progress=pr.progress,ap=p.ap;advanceProgramme('education',1);near(pr.progress,progress,'cannot repeat option same quarter');assert(p.ap===ap,'duplicate no AP');
 s.q=1;programmeQuarter103();near(c.loyalty,51.5,'unfinished penalty');programmeQuarter103();near(c.loyalty,51.5,'once per quarter loyalty');
 for(let q=2;!pr.completed;q++){s.q=q;p.ap=3;advanceProgramme('education',0);assert(q<12,'bounded completion')}
 assert(rules103().research.educationModernized&&pr.progress===100,'education unlock');let human=s.human;debt=s.debt;p.ap=3;advanceProgramme('education',2);near(s.human,human,'no duplicate reward');near(s.debt,debt,'no extra completed cost');
 let loyalty=c.loyalty;s.q++;programmeQuarter103();near(c.loyalty,loyalty,'completed no loyalty loss');
 let replacement=p.candidates.find(c=>cabinetEligible(c)&&!Object.values(p.cabinet).some(i=>i.candidate===c.id));appointOfficial('education',replacement.id);assert(pr.completed&&rules103().research.educationModernized,'replacement retains completion');
 for(let k of cabinetSlots103())for(let i=0;i<3;i++){let x=programmeQuote(k,i);assert(x.cost>0&&x.progress>0&&x.a[3]>=1&&x.a[3]<=3,'valid programme '+k);}
}
// Canonical effect summaries: every programme metric is displayed once; health matches its reward.
fresh103();{
 for(let [key,def]of Object.entries(MINISTER_PROGRAMMES103)){
  let summary=programmePanel(key).split('完成效果：')[1].split('。')[0];
  for(let metric of Object.keys(def.reward)){let label=EFFECT_LABELS106[metric];if(label)assert(summary.split(label).length-1===1,'one effect label '+key+' '+metric)}
  assert(!summary.includes('；失业 '),'no appended unemployment alias');
 }
 assert(impactText({unemployment:-.5})==='失业率 -0.5 个百分点','canonical concise unemployment');
 assert(impactText({cost:.035}).includes('0.035'),'small fiscal values retained');
 for(let values of [REFORMS.find(r=>r.key==='culture').values,MINISTER_PROGRAMMES103.health.reward]){
  assert(impactText(values).split('失业率').length===2,'one unemployment effect in reform/programme');
  assert(departmentImpact105(values).split('失业率').length===2,'one unemployment effect in task report');
 }
 let pr=rules103().proposals.health;pr.progress=99;let unemployment=s.unemployment,approval=s.approval;
 advanceProgramme('health',0);near(s.unemployment,unemployment-.5,'new health reward -0.5');near(s.approval,approval+4,'health approval unchanged');
 assert(pr.completed&&pr.rewardApplied.unemployment===-.5,'actual award persisted');
 assert(programmePanel('health').includes('已获效果：支持 +4 · 失业率 -0.5 个百分点'),'completed panel matches award');
 let reported=pstate().reports[0].text;assert(reported.includes('失业率 -0.5')&&reported.split('失业率').length===2,'report matches award once');
 assert(guideMatches104('普惠医疗网络',guideCatalog104())[0].text.includes('失业率 -0.5'),'guide matches current reward');
 unemployment=s.unemployment;pstate().ap=3;advanceProgramme('health',1);near(s.unemployment,unemployment,'no repeat reward');
 delete pr.rewardApplied;assert(programmePanel('health').includes('失业率 -0.3'),'legacy completed award stays accurate');
 near(s.unemployment,unemployment,'legacy description does not grant extra reward');
}
// Legacy migration is deterministic and nonpunitive; reload preserves all new state.
fresh103();{
 let p=pstate();p.cabinet.education={candidate:1,task:'technology'};let history=JSON.stringify(s.history),dismissals=p.memory.dismissals,stability=s.stability,approval=s.approval;delete s.rules103;p.candidates=p.candidates.slice(0,24);Object.keys(p.cabinet).forEach((k,i)=>p.cabinet[k]={candidate:i,task:'balanced'});
 s.q=20;initPolitics();assert(rules103().research.level===0&&rules103().research.lastQ===20,'no retroactive research');near(s.stability,stability,'migration no stability penalty');near(s.approval,approval,'migration no approval penalty');assert(p.memory.dismissals===dismissals,'migration no dismissals');assert(JSON.stringify(s.history)===history,'migration history retained');
 let snap=JSON.stringify(s);initPolitics();assert(JSON.stringify(s)===snap,'migration idempotent');assert(validSave(JSON.parse(snap)),'migrated valid');
 s.rules103.research.progress=NaN;assert(!validSave(s),'reject bad research');s.rules103.research.progress=42;
 p.factions[1].relation=70;inviteCoalition(p.members.find(m=>m.id>=4&&m.faction===1).id);advanceProgramme('education',1);record();save();
}
for(let tabName of ['overview','assembly','cabinet','archive','situations']){tab=tabName;render();let html=$('content').innerHTML;assert(!/NaN|undefined|≥|≤/.test(html),'clean UI '+tabName)}
console.log('PASS 1.0.3: strike cooldowns, strict boundaries, three tax formulas, spending preferences, fractional seats, additive post-passage penalty, agenda decay, all-regime cabinet eligibility, coalition thresholds, party-linked traits, research progression/cap, minister projects, costs, loyalty, migration and UI.');
`,ctx);
let saved=storage['nation-state-v1'];boot();assert.equal(storage['nation-state-v1'],saved);console.log('PASS 1.0.3 exact save reload');
