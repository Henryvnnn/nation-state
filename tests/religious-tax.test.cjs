const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function boot(directory=root,storage={}){const nodes={},ctx={console,setTimeout:()=>{},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},document:{getElementById:id=>nodes[id]||(nodes[id]={innerHTML:'',textContent:'',style:{},showModal(){this.open=true},close(){this.open=false},addEventListener(){}})}};vm.createContext(ctx);for(const [,f]of fs.readFileSync(path.join(directory,'index.html'),'utf8').matchAll(/<script src="([^?]+)\?/g))vm.runInContext(fs.readFileSync(path.join(directory,f),'utf8'),ctx,{filename:f});return ctx}
const c=boot();
vm.runInContext(`
function check(v,m){if(!v)throw Error(m)}function near(a,b,m){check(Math.abs(a-b)<1e-8,m+': '+a+' / '+b)}
function fresh(id,seed='religious-tax-regression'){selectedRegime=id;pendingAdmin107=true;create(seed);pstate().current=null;pstate().queue=[];sits().notices=[];pstate().ap=100;s.approval=80;s.stability=90;s.debt=s.gdp*.4;}
const originalRate=billPassRate104;billPassRate104=()=>95;
for(const id of ['theorepublic','theoabsolute']){
 fresh(id);check(hasReligiousTax107()&&taxKeys107().length===6,'both regimes eligible');check(RELIGIOUS_TAX_NAMES107.join('/')==='什一税/教会税/寺院捐','canonical names');
 for(const alias of RELIGIOUS_TAX_NAMES107)check(guideMatches104(alias,guideCatalog104()).some(e=>e.id==='policy-tithe'),'synonym '+alias);
 const before=s.policies.tithe,effective=s.effective.tithe;changePolicy('tithe',10);proposeBudget();check(s.policies.tithe===before,'draft inert');
 const religious=pstate().factions.find(f=>factionProfile(f)===FACTION_PROFILES103.religious);check(religious,'religious faction');near(budgetRequirement(religious),50,'raising5 boosts religious lower support10');
 near(revenue(pstate().bill.policies)-revenue(),2,'raising5 adds2 GDP revenue');voteBill();
 if(id==='theorepublic'){
  check(!!upperBill108()&&s.policies.tithe===before,'guardian review required');const bill=upperBill108();
  for(const [view,coefficient]of Object.entries({establishment:0,progressive:-1,conservative:.75,clerical:2})){near(upperAffinity108({view},bill),coefficient*5,'upper preference '+view);const reduced={...bill,policies:{...bill.policies,tithe:0}};near(upperAffinity108({view},reduced),-coefficient*5,'upper reversed '+view)}
  for(const g of bicameral108().upper.groups){g.agenda=100;g.relation=100;g.decay=0}upperReview108();
 }
 near(s.policies.tithe,10,'levy enacted');near(s.effective.tithe,effective,'no instant lagged tax');check(validSave(s),'valid after enactment');
 s.q++;economicQuarter();near(s.effective.tithe,6.75,'gradual pass through');
 s.q++;pstate().ap=100;draft={...s.policies,tithe:0};proposeBudget();voteBill();if(id==='theorepublic'){for(const g of bicameral108().upper.groups){g.agenda=100;g.relation=100;g.decay=0}upperReview108()}near(s.policies.tithe,0,'stop collection through budget');check(validSave(s),'stop valid');
}
const targets=new Set();for(let n=0;n<20;n++){
 fresh('theoabsolute','tax-transition-'+n);s.policies.tithe=9;s.effective.tithe=8;draft={...s.policies};enactCompetitiveElections107('theoabsolute');initPolitics();targets.add(regime().id);
 const religious=regime().id==='theorepublic';near(s.policies.tithe,religious?9:0,'transition approved rate');near(s.effective.tithe,religious?8:0,'transition effective rate');check(hasReligiousTax107()===religious,'transition eligibility');check(validSave(s),'transition saved');
}check(targets.has('theorepublic')&&targets.has('presidential'),'both transition paths exercised');
fresh('theorepublic');s.policies.tithe=8;s.effective.tithe=7;endClericalRepublic();check(!hasReligiousTax107()&&s.policies.tithe===0&&s.effective.tithe===0&&validSave(s),'symbolic transition stops levy');
console.log('PASS both theocracies: six tax controls, three aliases, real budgets/lower and upper preferences, economic lag, zero-rate and transition paths.');
`,c);
if(process.env.RELIGIOUS_TAX_BASELINE_DIR){
 for(const id of ['theorepublic','theoabsolute'])for(const stage of ['ordinary','upper']){
  if(id==='theoabsolute'&&stage==='upper')continue;
  const storage={},old=boot(process.env.RELIGIOUS_TAX_BASELINE_DIR,storage);
  vm.runInContext(`selectedRegime='${id}';pendingAdmin107=true;create('old-religious-tax');s.taxation107.religiousName='贡税';s.policies.tithe=${id==='theorepublic'?0:7.5};s.effective.tithe=${id==='theorepublic'?0:6};draft={...s.policies,property:7};proposeBudget();if('${stage}'==='upper'){billPassRate104=()=>95;voteBill()}save()`,old);
  const oldState=JSON.parse(vm.runInContext('JSON.stringify(s)',old)),oldRng=oldState.rng;
  const updated=boot(root,storage);const current=JSON.parse(vm.runInContext('JSON.stringify(s)',updated));
  assert.equal(current.taxation107.religiousName,'寺院捐','canonical saved name');assert.equal(current.rng,oldRng,'no reroll');
  assert.deepEqual(current.policies,oldState.policies,'current rates untouched');assert.deepEqual(current.effective,oldState.effective,'effective rates untouched');assert.deepEqual(current.political.bill,oldState.political.bill,'pending bill untouched');
  assert(vm.runInContext(`validSave(s)&&budget().includes('id="p-tithe"')&&budgetCap('tithe')===10`,updated),'existing game unlocks without restart');
  const immutable=JSON.stringify(oldState);assert(vm.runInContext('validSave('+immutable+')',updated),'old import accepted');assert.equal(JSON.stringify(oldState),immutable,'validation read-only');
  vm.runInContext('save()',updated);const saved=storage['nation-state-v1'];boot(root,storage);assert.equal(storage['nation-state-v1'],saved,'reload idempotent');
 }
 console.log('PASS existing games/imports: sixth tax appears without restarting, previous rates and pending reviews preserved, old name normalized, repeat reload stable.');
}
