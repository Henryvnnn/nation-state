const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function boot(dir=root,storage={}){const nodes={},c={console,setTimeout:()=>{},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},document:{getElementById:id=>nodes[id]||(nodes[id]={innerHTML:'',textContent:'',style:{},showModal(){this.open=true},close(){this.open=false},addEventListener(){}})}};vm.createContext(c);for(const [,file]of fs.readFileSync(path.join(dir,'index.html'),'utf8').matchAll(/<script src="([^?]+)\?/g))vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),c,{filename:file});return c}
const ctx=boot();
vm.runInContext(`
function check(x,m){if(!x)throw Error(m)}
function near(a,b,m){check(Math.abs(a-b)<1e-7,m+': '+a+' / '+b)}
function fresh(id,seed='institutions',chambers='auto',system=null){selectedRegime=id;pendingChambers=chambers;pendingAdmin107=true;pendingDifficulty=false;create(seed);let n=0;while(system&&institutions().partySystem!==system){check(n<50,'party draw');create(seed+'-'+n++)}}
function calm(){sits().active=[];sits().notices=[];Object.assign(constitution().minority,{status:'resolved',resolution:'amendment',resolvedQ:s.q});pstate().current=null;pstate().queue=[];features107().notices=[];pstate().ap=100;s.approval=80;s.stability=90;s.confidence=80;s.inflation=3;s.unemployment=6;s.debt=s.gdp*.4;pstate().judicial=70}
function budget(){draft={...s.policies,income:s.policies.income+1};proposeBudget()}
const rateOriginal=billPassRate104,upperOriginal=upperSupport108,forecastOriginal=electionForecast;
function court(yes){let d=constitution().docket;constitution().judges.forEach((j,i)=>{j.chief=i===0;j.relation=0;j.boosts=i<yes?[{docketId:d.id,amount:100,until:s.q+10}]:[]})}
let counts={presTwo:0,presUpper:0,semiUpper:0,semiNational:0,notLargest:0};
for(const id of ['presidential','semi'])for(let n=0;n<160;n++){
 fresh(id,'institutions-draw-'+id+'-'+n);check(validSave(s),'world valid '+id+' '+n);let p=pstate();
 check(p.factions.reduce((x,f)=>x+f.seats,0)===100,'100 lower share');
 check(p.members.length===p.factions.length+4,'one whip per faction');
 for(const f of p.factions){check(p.members.slice(4).filter(m=>m.faction===f.id).length===1,'one representative');check(Number.isFinite(support(f)),'finite support')}
 check(Object.values(p.cabinet).filter(Boolean).every(x=>cabinetEligible(p.candidates[x.candidate])),'all cabinet eligible');
 for(const fn of [assembly,archive,guideCatalog104,judiciary,cabinet,politics])check(!/undefined|NaN/.test(fn()),'render valid '+fn.name+' '+id);
 if(id==='presidential'){
  if(hasUpper108())counts.presUpper++;
  if(twoPartyPresidency()){counts.presTwo++;check(p.factions.length===3&&p.factions[2].name==='无党籍党团','two party shape');check(['market','conservative'].includes(p.factions[0].profileKey),'first ideology');check(['law','social'].includes(p.factions[1].profileKey),'second ideology');check(new Set(p.factions.map(f=>f.profileKey)).size===3,'independent distinct');check(p.playerFaction!==2,'player major party');
   if(hasUpper108()){const u=bicameral108().upper;check(u.groups.length===3&&u.groups.every(g=>g.name===p.factions[g.id].name),'matching senate');check((upperDiagram108().match(/class="upper-seat108"/g)||[]).length===50,'50 seats');}
  }else check(p.factions.length===5,'legacy multiparty');check(rules103().coalition.length===1,'no presidential opening coalition');
 }else{
  if(hasUpper108())counts.semiUpper++;if(regime().body==='国民议会')counts.semiNational++;
  check(p.factions.length>=7,'seven parties');check(coalitionShare107()>=50&&rules103().coalition.length<=3&&rules103().coalition.length>=2,'majority with maximum three parties');
  const own=p.factions[playerFactionId107()],other=p.factions.filter(f=>f!==own),distance=Math.min(...other.map(f=>factionDistance107(own,f)));
  check(allies107().some(id=>factionDistance107(own,p.factions[id])===distance),'closest ally included');
  if(own.seats<Math.max(...p.factions.map(f=>f.seats)))counts.notLargest++;
  for(const id of allies107()){check(p.factions[id].relation>=60&&p.factions[id].relation<=70,'allies relationship');near(support(p.factions[id]),60,'ally agenda')}
 }
 const before=JSON.stringify(s);initPolitics();assembly();check(JSON.stringify(s)===before,'stable initialization');s=JSON.parse(before);initPolitics();check(validSave(s),'valid roundtrip');
 calm();for(let i=0;i<20;i++){const e=regionalEvent();check(e&&e.options.length>0,'regional event covers all districts')}
 pstate().bill={kind:'budget',policies:{...s.policies,income:s.policies.income+1}};check(Number.isFinite(billPassRate104()),'budget finite');pstate().bill={kind:'reform',id:0};check(Number.isFinite(billPassRate104()),'reform finite');pstate().bill=null;
 distributeElectionSeats107(55);check(pstate().factions.every(f=>Number.isFinite(f.seats))&&pstate().factions.reduce((n,f)=>n+f.seats,0)===100,'election supports variable parties');check(validSave(s),'valid after election allocation');
}
check(counts.presTwo>50&&counts.presTwo<110,'50% party draw');check(counts.presUpper>95&&counts.presUpper<145,'75% chamber draw');check(counts.semiUpper>50&&counts.semiUpper<110,'50% semi chambers');check(counts.semiNational>50&&counts.semiNational<110,'50% semi name');check(counts.notLargest>50,'player may not be largest');
console.log('PASS 320 seeded openings, identities, coalitions, candidate eligibility, elections, regional requests and reloads',counts);
for(const id of ['presidential','semi'])for(const mode of ['one','two'])for(let n=0;n<15;n++){fresh(id,'override-'+n,mode);check(hasUpper108()===(mode==='two'),'manual override');check(validSave(s),'manual valid')}
fresh('random','random-regime','one');check(institutions().twoChambers===!!s.bicameral108,'random regime valid');
// One-chamber ordinary laws apply immediately. Amendments go directly to court.
for(const id of ['presidential','semi'])for(const kind of ['budget','reform']){
 fresh(id,'single-'+kind,'one');calm();billPassRate104=()=>90;
 if(kind==='budget')budget();else submitReform(v3().offers[0].uid);
 const ap=pstate().ap;voteBill();check(!pstate().bill&&pstate().passed.length===1&&pstate().ap===ap-1,'single chamber enactment');check(!s.bicameral108&&validSave(s),'no hidden upper gate');
 fresh(id,'single-constitution','one');calm();billPassRate104=()=>90;proposeConstitution('amend','rights','equal');court(0);voteConstitution();check(constitution().docket.stage==='review','single court route');court(10);checkAmendmentReview107();check(constitution().rights==='equal'&&validSave(s),'single amendment complete');
}
console.log('PASS forced chamber selection, one-chamber budgets/reforms/amendments.');
for(const kind of ['budget','reform']){
 fresh('presidential','pres-two-veto','two','two');calm();billPassRate104=()=>90;upperSupport108=()=>50;if(kind==='budget')budget();else submitReform(v3().offers[0].uid);const before=JSON.stringify(s.policies);voteBill();const ap=pstate().ap;upperReview108();check(pstate().ap===ap,'review no AP');
 if(kind==='budget')check(!pstate().bill&&pstate().passed.length===0&&JSON.stringify(s.policies)===before&&!bicameral108().delayed.length,'binding budget veto');
 else{check(pstate().bill.chamber108.stage==='returned','reform returned');s.q++;voteBill();check(bicameral108().delayed.length===1&&!s.reforms.length,'reform delayed');s.q+=2;economicQuarter();check(s.reforms.length===1&&!bicameral108().delayed.length,'reform enacted after delay')}
 check(validSave(s),'veto save valid');
}
fresh('presidential','pres-multi-veto','two','multi');calm();billPassRate104=()=>90;upperSupport108=()=>50;budget();voteBill();upperReview108();check(pstate().bill.chamber108.stage==='returned','multiparty retains budget return');
console.log('PASS two-party binding budget veto and reform return/delay; multiparty return unchanged.');
// Semi-presidential crisis is survivable, uses the established three-quarter and resignation rules.
fresh('semi','semi-crisis','two');calm();s.adminMode=false;const ally=allies107()[0],originalCoalition=rules103().coalition.slice(),alliedSlots=Object.entries(pstate().cabinet).filter(([,x])=>originalCoalition.includes(pstate().candidates[x.candidate].faction)&&pstate().candidates[x.candidate].faction!==playerFactionId107()).map(([slot])=>slot);check(alliedSlots.length>0,'allied ministers exist');pstate().factions[ally].relation=49;syncCoalition107();check(activeSit('government'),'crisis starts');s.q=activeSit('government').deadline;coalitionQuarter107();check(!s.ended&&!activeSit('government')&&rules103().coalition.length===1,'semi coalition collapses without gameover');check(alliedSlots.every(k=>!pstate().cabinet[k]),'allied ministers resign');check(validSave(s),'crisis outcome valid');
fresh('semi','semi-recovery','one');calm();const bad=allies107()[0];pstate().factions[bad].relation=49;syncCoalition107();pstate().factions[bad].relation=61;syncCoalition107();check(!activeSit('government')&&coalitionShare107()>=50,'repair alliance');
console.log('PASS semi government crisis expiration and recovery.');
// Clerical costs use the vote-time adjusted agenda, not the newly enacted budget.
upperSupport108=upperOriginal;billPassRate104=rateOriginal;
for(const id of ['theorepublic','theoabsolute']){
 fresh(id,'clergy-cost');calm();check(clergyState().loyalty===100,'clergy opening100');
 const originalTendency=votingTendency,clerics=pstate().factions.filter(clergyLowerFaction);check(clerics.length>0,'clerical parties exist');
 votingTendency=f=>f.id===clerics[0].id?55:80;billPassRate104=()=>90;budget();voteBill();near(clergyState().loyalty,95,'55 costs5');
 const snap=clergyState().loyalty;voteBill();near(clergyState().loyalty,snap,'duplicate click no extra cost');
 if(id==='theorepublic'){
  const originalAgenda=upperAgenda108;upperAgenda108=g=>g.id===bicameral108().upper.groups[0].id?56:80;upperReview108();near(clergyState().loyalty,91,'56 costs4 upper');upperReview108();near(clergyState().loyalty,91,'no second upper charge');upperAgenda108=originalAgenda;
 }
 votingTendency=originalTendency;check(validSave(s),'clergy valid');
 for(const value of [40,39,20,19,1]){const c=clergyState();c.loyalty=value;s.approval=80;s.stability=90;s.q++;clergyQuarter();near(s.approval,value<40?79:80,'approval threshold '+value);near(s.stability,value<20?88:90,'stability threshold '+value);clergyQuarter();near(s.approval,value<40?79:80,'no stacked penalty');check(activeAlerts107().some(a=>a.id==='clergy-loyalty')===(value<40),'reminder threshold')}
}
// Budget changes that fail passage cannot reduce loyalty.
fresh('theorepublic','failed-bill');calm();billPassRate104=()=>0;budget();voteBill();near(clergyState().loyalty,100,'failed lower no penalty');
// Zero and resolution paths, with no automatic end in administrator mode.
fresh('theoabsolute','clergy-end');calm();s.adminMode=false;clergyState().loyalty=0;save();check(!!s.ended&&s.ended.includes('神职'),'autocracy ends');check(validSave(s),'ended save valid');
fresh('theoabsolute','clergy-admin');calm();clergyState().loyalty=0;save();check(!s.ended,'admin survives');
for(const talks of [0,60]){
 fresh('theorepublic','clergy-revolt-'+talks);calm();s.adminMode=false;clergyState().loyalty=0;sits().cooldowns.rebellion=99;save();const x=activeSit('rebellion');check(x&&x.clergyRevolt,'zero forces rebellion despite cooldown');check(!s.ended,'republic not ended by zero');const id=x.id;save();check(activeSit('rebellion').id===id,'no duplicate rebellion');
 x.strength=19;x.base=29;x.control=61;x.talks=talks;checkSituationEnds();check(regime().id==='symbolic'&&!activeSit('rebellion'),'peace or force yields symbolic');check(!bicameral108().upper.formed,'symbolic senate empty');check(validSave(s),'transition state valid');initPolitics();check(validSave(s),'transition reload valid');
}
console.log('PASS clergy vote-time deductions, thresholds, non-stacking quarterly effects, alerts, gameover/admin and both rebellion resolutions.');
`,ctx);
// Previously published saves keep their established parties and chamber structure.
if(process.env.INSTITUTIONS_BASELINE_DIR){
for(const id of ['presidential','semi','theorepublic','theoabsolute']){
 const storage={},old=boot(process.env.INSTITUTIONS_BASELINE_DIR,storage);
 vm.runInContext(`selectedRegime='${id}';pendingAdmin107=true;create('existing-institutions');save()`,old);
 const before=vm.runInContext('JSON.stringify({p:pstate().factions,u:s.bicameral108,q:s.q})',old);
 const current=boot(root,storage);
 assert(vm.runInContext('validSave(s)',current),'existing save valid');
 assert.equal(vm.runInContext('JSON.stringify({p:pstate().factions,u:s.bicameral108,q:s.q})',current),before,'existing membership preserved');
 vm.runInContext('save()',current);const saved=storage['nation-state-v1'];boot(root,storage);assert.equal(storage['nation-state-v1'],saved,'reload idempotence');
}
console.log('PASS previous saves preserve existing parties, chambers and quarterly state.');
}
vm.runInContext(`
for(const id of ['presidential','semi','theorepublic','theoabsolute'])for(const mode of (['presidential','semi'].includes(id)?['one','two']:['auto'])){
 fresh(id,'quarterly-'+id+mode,mode,id==='presidential'?'two':null);calm();billPassRate104=rateOriginal;upperSupport108=upperOriginal;
 if(s.officeUI)s.officeUI.skipUnusedAP=true;
 for(let q=1;q<=48;q++){
  s.approval=80;s.stability=90;s.inflation=3;s.unemployment=6;s.debt=s.gdp*.4;features107().skipUnusedAP=true;pstate().ap=0;
  advance();let guard=0;while(pstate().current&&guard++<50)resolvePolitical(0);
  check(s.q===q,'quarter advanced '+id+' '+mode+' '+q);check(validSave(s),'quarterly save valid '+id+' '+mode+' '+q);check(!s.ended,'admin never ends');
 }
}
console.log('PASS 288 full quarterly cycles with event decisions and elections across variable parliaments.');
`,ctx);

