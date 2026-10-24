const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const files=[...fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/<script src="([^?]+)\?/g)].map(x=>x[1]);
function boot(storage={},directory=root){
 let nodes={},c={console,setTimeout:()=>{},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},document:{getElementById:id=>nodes[id]||(nodes[id]={innerHTML:'',style:{},showModal(){this.open=true},close(){this.open=false},addEventListener(){}})}};
 vm.createContext(c);for(let f of files)if(fs.existsSync(path.join(directory,f)))vm.runInContext(fs.readFileSync(path.join(directory,f),'utf8'),c,{filename:f});return c;
}
const storage={},c=boot(storage);
vm.runInContext(`
function check(x,m){if(!x)throw Error(m)}
function near(a,b,m){check(Math.abs(a-b)<.00001,m+': '+a+' vs '+b)}
function fresh(reg='presidential',seed='constitution-test'){
 selectedRegime=reg;pendingAdmin107=true;pendingModel=false;create(seed);sits().active=[];sits().notices=[];pstate().current=null;pstate().queue=[];features107().notices=[];pstate().ap=100;s.approval=75;s.stability=80;
}
function majority(){constitution().judges.forEach(j=>j.boosts.push({docketId:constitution().docket.id,until:s.q+3,amount:100}))}
function nextVote(){s.q++;pstate().ap=100}
for(let r of REGIMES)for(let i=0;i<8;i++){
 fresh(r.id,'court-'+r.id+'-'+i);let c=constitution();
 check(c.judges.length>=5&&c.judges.length<=10,'5 to 10 total seats');check(c.judges.filter(j=>j.chief).length===1,'one chief included');check(c.judges.filter(j=>j.trait<2).length*2<c.judges.length,'combined liberal minority');
 check(new Set([...pstate().members,...pstate().candidates,...c.judges].map(j=>j.name)).size===pstate().members.length+pstate().candidates.length+c.judges.length,'unique names across all institutions');
 check(validSave(JSON.parse(JSON.stringify(s))),'valid generated save');let before=JSON.stringify(s);judiciary();archive();guideCatalog104();check(JSON.stringify(s)===before,'render does not mutate or reroll');
 let judgeState=JSON.stringify(c.judges);fresh(r.id,'court-'+r.id+'-'+i);check(JSON.stringify(constitution().judges)===judgeState,'seed reproducible judges');
 check(constitutionalRoute()===(r.body==='枢密院'?'assembly':'court'),'regime-specific route');
 meetJudge(c.judges.find(j=>j.chief).id);check($('modal').innerHTML.includes(JUDGE_TITLES[r.id][1]),'regime-specific chief title');
}
fresh();let j=constitution().judges[0];let neutral={id:999,mode:'interpret',stance:'neutral'},amend={...neutral,mode:'amend'};
check(judgeWillingness(j,neutral)>judgeWillingness(j,amend),'amendments harder');
proposeConstitution('interpret','budget','welfare');check(constitution().docket&&pstate().ap===99,'proposal AP');
check(validSave(JSON.parse(JSON.stringify(s))),'pending court docket serializes');
let approval=s.approval,stable=s.stability,oldWelfare=s.policies.welfare;majority();voteConstitution();
check(budgetCap('welfare')===21,'one percentage-point cap increase');check(s.policies.welfare===oldWelfare,'no automatic spending increase');near(s.approval,approval-1,'interpretation approval cost');near(s.stability,stable-2,'interpretation stability cost');
check(slider('welfare').includes('max="21"'),'slider uses new ceiling');draft.welfare=21;proposeBudget();check(pstate().bill.policies.welfare===21,'expanded budget proposed');withdrawBill();
nextVote();proposeConstitution('amend','court','assembly');majority();let oldJud=pstate().judicial,oldStab=s.stability,oldAp=s.approval;voteConstitution();
near(pstate().judicial,Math.max(0,oldJud-20),'transfer independence');near(s.stability,oldStab-10,'transfer stability');near(s.approval,Math.min(100,oldAp+10),'transfer support');
check(regime().court===regime().body&&constitutionalRoute()==='assembly','transfer reroutes judiciary');meetMember(0);check($('modal').innerHTML.includes('constitutionalMenu'),'speaker has constitution actions');
nextVote();proposeConstitution('interpret','relations','1');check(pstate().bill.kind==='constitution','assembly bill queued');check(validSave(JSON.parse(JSON.stringify(s))),'pending assembly bill serializes');check(assembly().includes('必须超过 50%'),'assembly rule UI');
let originalRate=billPassRate104;billPassRate104=()=>50;voteBill();check(constitution().docket,'exactly half fails');nextVote();billPassRate104=()=>50.01;let rel=pstate().factions[1].relation;voteBill();near(pstate().factions[1].relation,Math.min(100,rel+10),'party relations enacted');check(!pstate().bill&&!constitution().docket,'docket cleared once');billPassRate104=originalRate;
fresh('federal');constitution().authority='assembly';proposeConstitution('interpret','budget','education');billPassRate104=()=>51;check(threshold()===50,'constitutional threshold independent of ordinary federal bills');voteBill();check(budgetCap('education')===13,'federal constitutional bill passes 51');billPassRate104=originalRate;
fresh();let o=v3().offers[0],base=REFORMS[o.catalog].cost;proposeConstitution('interpret','reform',String(o.uid));check(o.kept,'pending interpretation preserves offer');majority();voteConstitution();near(reformStartCost(o.catalog,o.uid),base*.75,'reform discounted quote');nextVote();submitReform(o.uid);billPassRate104=()=>100;let debt=s.debt;voteBill();near(s.debt-debt,s.gdp*base*.75/100,'actual reform charge discounted');check(s.reforms.some(x=>x.id===o.catalog),'reform starts');check(!constitutionalSpec('interpret','reform',String(o.uid)),'cannot discount started reform');billPassRate104=originalRate;
fresh('absolute');proposeConstitution('amend','rights','equal');let prior=s.stability;voteConstitution(true);check(constitution().rights==='equal','autocratic forced amendment');near(s.stability,prior-13,'force plus substantive costs');check(constitution().history[0].forced,'forced recorded');
fresh('symbolic');proposeConstitution('amend','rights','equal');let ap=pstate().ap;voteConstitution(true);check(constitution().docket&&pstate().ap===ap,'symbolic democracy cannot force');
fresh();proposeConstitution('interpret','budget','welfare');let id=constitution().judges[0].id;influenceJudge(id,'pressure');check(constitution().risks.length===1&&constitution().risks[0].due===s.q+1,'risk scheduled next quarter');check(validSave(JSON.parse(JSON.stringify(s))),'influenced state valid');
let rng=rand;rand=()=>0;queueQuarterEvents();check(constitution().risks.length===1,'no same-quarter pressure risk');pstate().current=null;pstate().queue=[];s.q++;queueQuarterEvents();rand=rng;
let all=[pstate().current,...pstate().queue];check(v3().eventsGenerated===3,'three normal generated');let pressureEvent=all.find(e=>e.constitutionalSpecial&&e.title.includes('司法施压'));check(pressureEvent,'additional pressure event');check(all.filter(e=>!e.constitutionalSpecial&&e.type!=='reform-window').length>=3,'normal events retained');check(!constitution().risks.length,'risk consumed once');
let jd=pstate().judicial;v3().quarterOpen=false;v3().eventsChosen=0;pstate().current=pressureEvent;pstate().queue=[];resolvePolitical(0);near(pstate().judicial,Math.max(0,jd-10),'special event deducts independence');check(v3().eventsChosen===0,'special excluded from normal count');
fresh();proposeConstitution('interpret','budget','welfare');influenceJudge(0,'bribe');rand=()=>0;s.q++;queueQuarterEvents();rand=rng;check(activeSit('scandal'),'bribe next-quarter scandal');check(activeSit('scandal').judicialSource===constitution().judges[0].name,'scandal attributed to judge');check(validSave(JSON.parse(JSON.stringify(s))),'scandal save valid');
fresh();proposeConstitution('interpret','budget','welfare');influenceJudge(0,'hearing');let boost=judgeWillingness(constitution().judges[0]);s.q+=4;check(judgeWillingness(constitution().judges[0])<boost,'lobby expires');check(!constitution().risks.length,'public argument no scandal risk');
fresh();s.q=47;proposeConstitution('amend','term','72');majority();voteConstitution();s.adminMode=false;s.q=48;v3().quarterOpen=true;v3().settlementDue=false;holdElection=()=>{};finishQuarter();check(!s.ended&&!v3().settlementDue,'extended term survives quarter 48');s.q=72;v3().quarterOpen=true;finishQuarter();check(s.ended,'extended term settles quarter 72');
fresh();proposeConstitution('amend','term','0');majority();voteConstitution();s.adminMode=false;s.q=48;v3().quarterOpen=true;finishQuarter();check(!s.ended&&v3().settlementDue,'unlimited term has optional settlement');
fresh('absolute');proposeConstitution('amend','court','assembly');let movement=startSituation('spring');transitionDemocracy(movement);check(constitution().termLimit===48&&constitution().authority==='court'&&!constitution().docket&&!pstate().bill,'democratic transition replaces constitutional order');check(validSave(JSON.parse(JSON.stringify(s))),'transition save valid');
fresh();proposeConstitution('amend','economy','socialist');majority();voteConstitution();check(v3().socialist&&constitution().economicModel==='socialist','economic model enacted');check(v3().axisSum.market<0&&v3().axisSum.welfare>0,'choices affect real assessment axes');
fresh();let good=JSON.parse(JSON.stringify(s));for(let corrupt of [v=>v.constitution.judges[1].chief=true,v=>v.constitution.budgetCaps.welfare=NaN,v=>v.constitution.judges.forEach(j=>j.trait=0),v=>v.constitution.risks.push({due:1,kind:'pressure',method:'pressure',chance:1,judgeName:'x'})]){let v=JSON.parse(JSON.stringify(good));corrupt(v);check(!validSave(v),'corrupted constitution rejected')}
fresh();check(budgetCap('welfare')===20,'new world resets modified ceiling');
console.log('PASS constitution: 96 seeded worlds; chief/minority/names; routes; strict majority; budget/discount actual effects; autocracy; delayed extra events; assessment; term changes; validation.');
`,c);
// Migrate a genuine 1.0.6 runtime save, including an already pending budget and spent AP.
const baseline=process.env.BASELINE_DIR||'/tmp/nation-state-pre-constitution';
if(!fs.existsSync(path.join(baseline,'game.js'))){console.log('Legacy-runtime migration skipped: set BASELINE_DIR to a 1.0.6 checkout.');process.exit(0)}
const oldStorage={},old=boot(oldStorage,baseline);
vm.runInContext(`selectedRegime='presidential';pendingAdmin107=true;create('migration107');pstate().current=null;pstate().queue=[];pstate().ap=1;draft.income+=1;proposeBudget();save()`,old);
const before=JSON.parse(vm.runInContext('JSON.stringify(s)',old));
const restored=boot(oldStorage);const after=JSON.parse(vm.runInContext('JSON.stringify(s)',restored));
assert.equal(after.political.ap,before.political.ap);assert.deepEqual(after.political.bill,before.political.bill);assert.deepEqual(after.political.cabinet,before.political.cabinet);assert.equal(after.rng,before.rng);assert.equal(after.history.length,before.history.length);assert.ok(after.constitution.judges.length>=5);
assert.ok(Object.keys(oldStorage).some(k=>k.endsWith('-pre-constitution107')));
vm.runInContext(`withdrawBill();pstate().ap=100;proposeConstitution('interpret','budget','welfare');constitution().judges.forEach(j=>j.boosts.push({docketId:constitution().docket.id,amount:100,until:s.q+3}));voteConstitution();s.q++;proposeConstitution('interpret','budget','education');save()`,restored);
const snapshot=vm.runInContext('JSON.stringify(s)',restored),reloaded=boot(oldStorage);
assert.equal(vm.runInContext('JSON.stringify(s)',reloaded),snapshot);assert.equal(vm.runInContext("budgetCap('welfare')",reloaded),21);
console.log('PASS genuine 1.0.6 migration and exact reload: pending budgets, cabinet, AP, RNG/history preserved; pending constitutional docket and raised caps persist.');
