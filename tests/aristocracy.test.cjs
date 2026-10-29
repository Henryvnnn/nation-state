const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function boot(dir=root,storage={}){const nodes={},c={console,setTimeout:()=>{},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},document:{getElementById:id=>nodes[id]||(nodes[id]={innerHTML:'',textContent:'',style:{},showModal(){this.open=true},close(){this.open=false},addEventListener(){}})}};vm.createContext(c);for(const [,file]of fs.readFileSync(path.join(dir,'index.html'),'utf8').matchAll(/<script src="([^?]+)\?/g))vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),c,{filename:file});return c}
const ctx=boot();
vm.runInContext(`
function check(x,m){if(!x)throw Error(m)}
function near(a,b,m){check(Math.abs(a-b)<1e-7,m+': '+a+' / '+b)}
function fresh(seed='house-tests',id='aristocratic'){selectedRegime=id;pendingAdmin107=true;pendingChambers='two';create(seed)}
function calm(){sits().active=sits().active.filter(x=>MINORITY_KINDS107.includes(x.kind));sits().notices=[];pstate().current=null;pstate().queue=[];pstate().ap=50;s.approval=80;s.stability=90;s.confidence=80;s.inflation=3;s.unemployment=6;s.debt=s.gdp*.3;pstate().judicial=70;features107().noticeCollapsed=true}
const originalRate=billPassRate104,originalRand=rand;
function approvalReady(){billPassRate104=()=>100;pstate().ap=50;delete pstate().lastAction.vote}
function nonplayer(){return otherFamilies()[0]}
function resetRules(){billPassRate104=originalRate;rand=originalRand}
let counts={4:0,5:0,6:0};
for(let n=0;n<150;n++){
 fresh('house-seed-'+n);const a=houses();counts[a.families.length]++;
 check(validSave(s),'new valid '+n);check(a.families.length>=4&&a.families.length<=6,'4–6 houses');check(new Set(a.families.map(f=>f.region)).size===a.families.length,'different regions');check(new Set(a.families.map(f=>f.name)).size===a.families.length,'unique names');
 const powers=a.families.flatMap(f=>f.powers);check(powers.length===15&&new Set(powers).size===15,'all powers exactly once');check(a.families.every(f=>f.powers.length),'initial active houses');near(a.central,rulingFamily().powers.length*5,'opening central');check(a.families.every(f=>f.recognition>=80&&f.recognition<=100),'initial recognition');near(rulingFamily().recognition,100,'player recognition');
 check(pstate().factions.reduce((n,f)=>n+f.seats,0)===100,'all seats');check(pstate().factions[3].seats<=8&&pstate().factions[4].seats<=7,'minor factions');check(a.families.every(f=>f.faction<3),'no civic or clerical link');check(a.families.find(f=>f.powers.includes('army')).faction===0,'army conservative link');
 for(const fn of [assembly,overview,familyPage,archive])check(!/NaN|undefined/.test(fn()),'valid html '+fn.name);
 const saved=JSON.stringify(s);initPolitics();render();check(JSON.stringify(s)===saved,'read-only stable');s=JSON.parse(saved);initPolitics();check(JSON.stringify(s)===saved&&validSave(s),'load stable');
 const rng=s.rng;changeRecognition(rulingFamily(),-100);near(rulingFamily().recognition,100,'own immutable');check(s.rng===rng,'read-only rng');
}
check(Object.values(counts).every(n=>n>0),'all sizes generated');console.log('PASS world generation',counts);
// Recognition thresholds, stacking, parliament lock, recovery and game failure.
fresh();calm();const f1=nonplayer(),f2=otherFamilies()[1];f1.recognition=40;f2.recognition=39;const a=s.approval,st=s.stability;s.q++;familyQuarter();near(s.approval,a-1,'two family support loss');near(s.stability,st-2,'two family stability loss');familyQuarter();near(s.approval,a-1,'quarter idempotent');check(activeAlerts107().filter(x=>x.id.startsWith('family-recognition:')).length===2,'red alerts');
f1.recognition=19;draft={...s.policies,income:s.policies.income+1};proposeBudget();const locked=JSON.stringify(s.policies),ap=pstate().ap;voteBill();check(JSON.stringify(s.policies)===locked&&pstate().ap===ap&&pstate().bill,'locked no cost or enactment');f1.recognition=20;approvalReady();voteBill();check(!pstate().bill&&JSON.stringify(s.policies)!==locked,'20 restores voting');resetRules();
f1.recognition=40;f2.faction=f1.faction;f2.recognition=0;near(familyFactionPenalty(pstate().factions[f1.faction]),30,'combined agenda penalty');
fresh('failure');calm();otherFamilies().slice(0,3).forEach(f=>f.recognition=0);checkFamilyConsequences();check(!s.ended,'admin immunity');s.adminMode=false;checkFamilyConsequences();check(!!s.ended,'three zero failure');
// Inactive houses have no demands, pressure, vote blocks or loss condition.
fresh('inactive');calm();const inactive=nonplayer();inactive.recognition=0;const player=rulingFamily();player.powers.push(...inactive.powers);inactive.powers=[];check(!familyBlocked()&&!familyLow().length,'inactive ignored');const rng=s.rng,apInactive=pstate().ap;familyAction(inactive.id,'divide');check(s.rng===rng&&pstate().ap===apInactive,'inactive no interaction');check(validSave(s),'inactive valid');
// Bribery endpoints, immediate follow-up, one-shot handling and acquisition.
fresh('bribe');calm();let f=nonplayer();f.recognition=50;s.approval=0;near(familyBribeChance(),.5,'50 percent floor');s.approval=100;near(familyBribeChance(),1,'100 percent ceiling');s.approval=70;near(familyBribeChance(),.85,'linear success');rand=()=>.999;let debt=s.debt;familyAction(f.id,'bribe');check(!f.intel,'failed bribe');near(s.debt-debt,s.gdp*.0035,'bribe charged');
s.q++;rand=()=>0;familyAction(f.id,'bribe');check(f.intel&&pstate().current.type==='family-intel','followup event');const powers=f.powers.length,central=familyCentral();resolvePolitical(1);check(f.powers.length===powers-1&&rulingFamily().powers.length*5===central+5,'acquired power');near(familyCentral(),central+5,'central acquisition');near(f.recognition,20,'investigation penalty');check(!f.intel,'intel consumed');check(validSave(s),'post investigation valid');rand=originalRand;
// Last power retirement removes already queued requests, then survives reload.
fresh('retirement');calm();f=nonplayer();while(f.powers.length>1)rulingFamily().powers.push(f.powers.pop());f.recognition=0;pstate().queue.push(familyRequest(f));seizeFamilyPower(f);check(!familyActive(f)&&!familyBlocked()&&!familyLow().includes(f),'fully retired');check(!pstate().queue.some(e=>e.family===f.id),'no stale queued demand');check(validSave(s),'retired valid');
// Political requests use real event application, exactly one extra each quarter.
fresh('requests');calm();s.q=1;queueQuarterEvents();let queuedHouseEvents=[pstate().current,...pstate().queue];check(queuedHouseEvents.filter(e=>e.type==='family-request').length===1,'quarter family request');check(v3().eventsGenerated===3,'three base events unchanged');const request=queuedHouseEvents.find(e=>e.type==='family-request'),target=houses().families[request.family],old=target.recognition;pstate().current=request;pstate().queue=[];resolvePolitical(1);near(target.recognition,old-10,'refusal');queueQuarterEvents();check(![pstate().current,...pstate().queue].some(e=>e?.type==='family-request'),'request not duplicated');
// Alliances, divisions, caps, costs and repeat protection.
fresh('actions');calm();f=nonplayer();f.recognition=35;houses().central=30;const stability=s.stability;familyAction(f.id,'divide');near(f.recognition,45,'divide recognition');near(s.stability,stability-3,'divide stability');const apUsed=pstate().ap;familyAction(f.id,'divide');near(pstate().ap,apUsed,'repeat blocked');familyAction(f.id,'ally');near(f.recognition,70,'alliance recognition');near(familyCentral(),20,'alliance central');
// Reform opposition on passage; central rewards on completion, never on viewing/submitting.
fresh('reforms');calm();const rid=REFORMS.findIndex(r=>r.key==='nationalize'),uid=v3().nextOffer++;v3().offers.push({uid,catalog:rid,kept:false});const affected=otherFamilies().filter(f=>familyReformOpposition(f,'nationalize')),before=affected.map(f=>f.recognition),initialCentral=familyCentral();reformDetail(uid);submitReform(uid);near(familyCentral(),initialCentral,'no proposal reward');approvalReady();voteBill();affected.forEach((f,i)=>near(f.recognition,before[i]-10,'opposition once'));near(familyCentral(),initialCentral,'no start reward');s.q=s.reforms.find(x=>x.id===rid).ready;completeReforms();near(familyCentral(),initialCentral+5,'completion central');completeReforms();near(familyCentral(),initialCentral+5,'no duplicate completion');resetRules();
// Amendments: removal at source, direct calls rejected, valid allowed amendment reward.
for(const r of REGIMES){fresh('amend-'+r.id,r.id);check(!constitutionalChoices('amend').some(x=>x.action==='economy'),'economy option removed '+r.id);check(!constitutionalSpec('amend','economy','socialist'),'economy direct spec removed');if(r.id==='aristocratic')check(!constitutionalSpec('amend','competitive','enabled'),'aristocrat competitive removed');else if(!regime().democratic)check(!!constitutionalSpec('amend','competitive','enabled'),'other competitive retained '+r.id)}
fresh('amend-reward');calm();const c0=familyCentral();proposeConstitution('amend','rights','equal');near(familyCentral(),c0,'amend submitted no reward');approvalReady();constitution().judges.forEach(j=>{j.relation=100;j.boosts=[{docketId:constitution().docket.id,amount:100,until:s.q+5}]});voteConstitution();check(!constitution().docket,'actual amendment passed');near(familyCentral(),c0+10,'amend success reward');check(validSave(s),'amend valid');resetRules();
// All three future decisions free at zero AP; strongman ends every family penalty.
for(const choice of ['strongman','absolute','constitutional']){
 fresh('future-'+choice);calm();houses().central=100;checkFamilyConsequences();const sit=activeSit('national-future');check(sit&&houses().offered,'future created');check(situationActions(sit).length===3,'three options');pstate().ap=0;check(situationActions(sit).every(a=>!unavailable(sit,a)),'free choices enabled');const q=s.q,gdp=s.gdp,history=s.history.length;situationAct(sit.id,choice);near(pstate().ap,0,'free decision');check(!activeSit('national-future'),'future closed');check(regime().id===(choice==='strongman'?'aristocratic':choice),'chosen regime');near(s.q,q,'quarters retained');near(s.gdp,gdp,'economy retained');check(s.history.length===history,'history retained');check(validSave(s),'future save valid '+choice);
 if(choice==='strongman'){houses().families.filter(f=>f.id!==houses().player).forEach(f=>f.recognition=0);const before=JSON.stringify(houses());check(!familyBlocked()&&!familyLow().length,'no strongman penalties');s.q++;familyQuarter();check(JSON.stringify(houses())===before,'frozen calculations');checkFamilyConsequences();check(!activeSit('national-future')&&!s.ended,'never retrigger or fail');}
 if(choice==='constitutional'){check(hasUpper108()&&bicameral108().upper.formed,'constitutional upper');check(coalitionShare107()>=50,'constitutional coalition');check(!pstate().cabinet.head,'no chancellor');check(Object.values(pstate().cabinet).filter(Boolean).every(x=>cabinetEligible(pstate().candidates[x.candidate])),'cabinet aligned');}
}

// Full-quarter event processing, reloads and regional refreshes over a complete standard term.
for(let seed=0;seed<3;seed++){
 fresh('house-long-'+seed);calm();let familyCount=0;
 for(let q=1;q<=48;q++){
  s.approval=80;s.stability=90;s.confidence=80;s.inflation=3;s.unemployment=6;s.debt=s.gdp*.3;pstate().judicial=70;pstate().ap=0;
  advance();check(s.q===q,'quarter advanced');let safety=0,seen=0;
  while(pstate().current){const e=pstate().current;if(e.type==='family-request'){seen++;familyCount++}resolvePolitical(e.type==='family-request'&&q%4===0?1:0);check(++safety<40,'event queue terminates')}
  check(seen===1,'one request each live quarter');check(!v3().quarterOpen,'quarter finalized');check(validSave(s),'quarter save valid '+seed+' '+q);s=JSON.parse(JSON.stringify(s));initPolitics();
 }
 check(familyCount===48,'48 family events');
}
console.log('PASS 144 complete quarterly cycles, each with exactly one family request, refreshes, serialization and reloads.');
console.log('PASS thresholds, cumulative penalties, vote locks/recovery, admin/failure, inactive immunity, interactions, requests, reform/amendment timing, three free future branches, validated saves.');
`,ctx,{timeout:120000});
// Existing saves: deterministic addition without rerolling economics or random stream.
if(process.env.FAMILIES_BASELINE_DIR){
 const old=boot(process.env.FAMILIES_BASELINE_DIR);vm.runInContext('selectedRegime="aristocratic";pendingAdmin107=true;create("legacy-houses");s.q=9;record();',old);
 const raw=vm.runInContext('JSON.stringify(s)',old);ctx.legacy=raw;
 vm.runInContext(`s=JSON.parse(legacy);check(validSave(s),'legacy accepted');const legacyRng=s.rng,economy=JSON.stringify([s.gdp,s.debt,s.policies,s.effective,s.approval,s.stability,s.reforms]);initPolitics();check(s.rng===legacyRng,'legacy rng unchanged');check(JSON.stringify([s.gdp,s.debt,s.policies,s.effective,s.approval,s.stability,s.reforms])===economy,'legacy economics unchanged');check(validSave(s),'legacy migrated valid');const saved=JSON.stringify(s);initPolitics();check(JSON.stringify(s)===saved,'migration one time');`,ctx);
 console.log('PASS continuing-save initialization and reload');
 for(const [regimeId,action]of [['aristocratic','competitive'],['aristocratic','economy'],['presidential','economy']]){
  vm.runInContext('selectedRegime='+JSON.stringify(regimeId)+';create("removed-pending");proposeConstitution("amend",'+JSON.stringify(action)+','+JSON.stringify(action==='economy'?'socialist':'enabled')+');',old);
  ctx.pendingLegacy=vm.runInContext('JSON.stringify(s)',old);
  vm.runInContext('s=JSON.parse(pendingLegacy);check(validSave(s),"old docket loads");initPolitics();check(!constitution().docket&&!activeSit("amendment"),"removed pending docket cleared safely");check(validSave(s),"cleared docket remains valid");',ctx);
 }
 console.log('PASS removed pending amendments cancel without applying obsolete effects.');

}
