const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),files=['game.js','political.js','governance.js','revision12.js','situations.js','release103.js','release104.js','cabinet-tasks.js','release107.js','coalition107.js','interface107.js','console107.js','action-points.js','immersion.js','constitution.js','constitutional-process.js','guide.js'];
function boot(storage={},directory=root){let nodes={},c={console,setTimeout:()=>{},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},document:{getElementById:id=>nodes[id]||(nodes[id]={innerHTML:'',style:{},showModal(){this.open=true},close(){this.open=false},addEventListener(){}})}};vm.createContext(c);for(let f of files)if(fs.existsSync(path.join(directory,f)))vm.runInContext(fs.readFileSync(path.join(directory,f),'utf8'),c,{filename:f});return c}
const storage={},c=boot(storage);
vm.runInContext(`
function check(v,m){if(!v)throw Error(m)}
function fresh(mode='fixed',seed='action-tests',reg='presidential'){pendingActionMode=mode;pendingAdmin107=true;selectedRegime=reg;create(seed);if(s.constitution?.minority)Object.assign(s.constitution.minority,{status:'resolved',resolution:'amendment',resolvedQ:s.q});sits().active=[];sits().notices=[];pstate().current=null;pstate().queue=[];features107().notices=[]}
for(let regimeItem of REGIMES)for(let mode of Object.keys(ACTION_POINT_MODES)){
 fresh(mode,'ap-'+regimeItem.id,regimeItem.id);check(actionMode()===mode,'mode selected');check(validSave(JSON.parse(JSON.stringify(s))),'valid new save');
 let points=pstate().ap;check(points>0&&points<7,'opening points');let state=JSON.stringify(s);for(let i=0;i<5;i++){render();politicalCapacity();guideCatalog104()}check(JSON.stringify(s)===state,'render/read never reroll');
 pstate().ap=0;save();render();check(pstate().ap===0,'spent points stay spent');
}
fresh('fixed');for(let level of [0,1,2,3,8]){rules103().research.level=level;s.q++;check(grantActionPoints()===Math.min(6,3+level),'fixed cap unchanged')}
fresh('random');let observed=new Set();for(let level of [0,1,4,5,12]){rules103().research.level=level;for(let i=0;i<200;i++){s.q++;let points=grantActionPoints();check(points>Math.min(5,level)&&points<7,'random bounds');if(level===0)observed.add(points);let rng=s.rng;check(grantActionPoints()===points&&s.rng===rng,'same-quarter allocation cached')}}check(observed.size===6,'all die faces reachable');
let plans=new Set();for(let seed=0;seed<30;seed++){
 fresh('planned','plan-'+seed);let first=JSON.stringify(s.actionPoints.plans[0]);plans.add(first);check(s.actionPoints.plans[0].length===48,'48 future quarters');for(let n=1;n<7;n++)check(s.actionPoints.plans[0].filter(x=>x===n).length===8,'balanced schedule');
 let copy=[...s.actionPoints.plans[0]];for(let q=1;q<49;q++){s.q=q;for(let i=0;i<q%5;i++)rand();check(grantActionPoints()===copy[q-1],'plan independent of event RNG')}
 s.q=49;check(grantActionPoints()===s.actionPoints.plans[1][0],'extended block');let block=JSON.stringify(s.actionPoints.plans[1]);fresh('planned','plan-'+seed);s.q=49;check(grantActionPoints()===JSON.parse(block)[0]&&JSON.stringify(s.actionPoints.plans[0])===first,'same seed same plans');
}check(plans.size===30,'distinct seeded schedules');
let matchingSeed;for(let n=0;n<40;n++){fresh('planned','example-'+n);if(s.actionPoints.plans[0][9]===2){matchingSeed=n;break}}check(matchingSeed!==undefined,'example plan found');
s.q=8;rules103().research.progress=84;rules103().research.lastQ=8;s.policies.education=8;s.q=9;researchQuarter103();check(rules103().research.level===1&&rules103().research.progress===0,'research unlock at quarter9');grantActionPoints();s.q=10;check(grantActionPoints()===3,'quarter10 base2 plus research1');
rules103().research.level=9;s.q=11;check(grantActionPoints()===s.actionPoints.plans[0][10]+9&&politicalCapacity()>6,'planned bonus not capped');
let before=JSON.stringify(s.actionPoints);for(let mode of ['intro','page'])for(let page of ['overview','assembly','cabinet','judiciary','politics','budget','reforms','situations','archive','console']){
 let steps=tutorialSteps104(mode,page);check(steps.length>1,'tutorial populated');check(steps.every(x=>x.page===(mode==='intro'?'overview':page)),'page scope');check(mode==='intro'?steps.length===7:steps.every(x=>x.id!=='welcome'),'split intro');
}check(JSON.stringify(s.actionPoints)===before,'tutorial never consumes roll');check(guideMatches104('伪随机')[0].text.includes('超过6'),'guide knows additive mode');check(actionTutorialText().includes('伪随机行动点'),'tutorial matches mode');
fresh('random');rules103().research.progress=99;s.policies.education=8;s.q=1;politicalMaintenance();check(rules103().research.level===1&&pstate().ap>1,'research applied before maintenance allocation');
fresh('planned');let good=JSON.parse(JSON.stringify(s));check(validSave(good),'valid plan');let bad=JSON.parse(JSON.stringify(good));bad.actionPoints.plans[0][0]=9;check(!validSave(bad),'invalid plan rejected');bad=JSON.parse(JSON.stringify(good));bad.actionPoints.rolls[0].total+=1;check(!validSave(bad),'invalid total rejected');
fresh('planned','persist-plan');s.q=10;pstate().ap=grantActionPoints()-1;save();
`,c);
let key=vm.runInContext('KEY',c),saved=storage[key];boot(storage);assert.equal(storage[key],saved,'mode, plan, spent points and RNG exact on reload');
const baseline=process.env.BASELINE_DIR;
if(baseline){let oldStore={},old=boot(oldStore,baseline);vm.runInContext("selectedRegime='presidential';create('old-fixed-migration');rules103().research.level=2;pstate().ap=1;save()",old);let oldKey=vm.runInContext('KEY',old),original=JSON.parse(oldStore[oldKey]);let upgraded=boot(oldStore);assert.equal(vm.runInContext('actionMode()',upgraded),'fixed');assert.equal(vm.runInContext('pstate().ap',upgraded),1);assert.equal(vm.runInContext('politicalCapacity()',upgraded),5);const actual=JSON.parse(oldStore[oldKey]);delete actual.actionPoints;assert.deepEqual(actual,original,'only mode metadata added to existing save');}
console.log('PASS action modes: 12 regimes, bounded uniform draws, balanced frozen 48-quarter plans, research timing/additive example, continuation, read/reload immunity, split tutorial scope, validation and fixed-mode migration');
