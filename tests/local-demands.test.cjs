const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function boot(directory=root,storage={}){
 const nodes={},ctx={console,setTimeout:()=>{},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},document:{getElementById:id=>nodes[id]||(nodes[id]={innerHTML:'',style:{},showModal(){this.open=true},close(){this.open=false},addEventListener(){}})}};
 vm.createContext(ctx);for(const [,f]of fs.readFileSync(path.join(directory,'index.html'),'utf8').matchAll(/<script src="([^?]+)\?/g))vm.runInContext(fs.readFileSync(path.join(directory,f),'utf8'),ctx,{filename:f});return ctx;
}
const fixture=`
function check(v,m){if(!v)throw Error(m)}function near(a,b,m){check(Math.abs(a-b)<1e-8,m+': '+a+' / '+b)}
function fresh(){selectedRegime='party';pendingAdmin107=true;create('local-pace');sits().active=[];sits().notices=[];if(constitution().minority)Object.assign(constitution().minority,{status:'resolved',resolution:'amendment',resolvedQ:s.q});pstate().current=null;pstate().queue=[];pstate().ap=100;s.approval=80;s.stability=90;s.debt=s.gdp*.4;for(const z of v3().regions){z.demandProgress=0;z.termProgress=0;z.totalProgress=0}}
function onlyRegion(id=0){for(const z of v3().regions)z.demandProgress=z.id===id?0:1}
`;
const c=boot();vm.runInContext(fixture+`
fresh();let z=v3().regions[0],m=pstate().members.find(m=>m.regionId===z.id);check(m,'regional official');memberAnswer(m.id,'fund');near(z.demandProgress,.7,'member project no longer instantly completes');near(z.termProgress,.7,'election credit follows progress');check(v3().regions.every(r=>r.id===z.id||r.demandProgress===0),'targeted project stays local');
fresh();const realVote=billPassRate104;billPassRate104=()=>100;pstate().bill={kind:'budget',title:'科研追加预算',policies:{...s.policies,education:s.policies.education+1}};voteBill();billPassRate104=realVote;for(const r of v3().regions)near(r.demandProgress,regionMatchesTags107(r,['technology'])?.35:0,'passed budget progresses matching regions');
fresh();let task=DEPARTMENT_TASKS105.education.find(t=>t.tags?.length);pstate().cabinet={education:{...pstate().cabinet.education,task:task.id}};let random=rand;rand=()=>0;runCabinet();rand=random;
for(const r of v3().regions){const expected=regionMatchesTags107(r,task.tags)?.084:0;near(r.demandProgress,expected,'department progress counted once');near(r.termProgress,expected,'department election credit consistent')}
for(let q=2;q<=11;q++){s.q=q;random=rand;rand=()=>0;runCabinet();rand=random}for(const r of v3().regions.filter(r=>regionMatchesTags107(r,task.tags)))near(r.demandProgress,.924,'eleven successful tasks still below completion');
s.q=12;random=rand;rand=()=>0;runCabinet();rand=random;check(v3().regions.filter(r=>regionMatchesTags107(r,task.tags)).every(r=>r.demandProgress===1),'sustained tasks can complete within twelve quarters');
fresh();pstate().cabinet={deputy:{...pstate().cabinet.deputy,task:'industry'}};random=rand;rand=()=>0;runCabinet();rand=random;for(const r of v3().regions)near(r.demandProgress,regionMatchesTags107(r,['industry'])?.084:0,'leadership assignment advances once');
fresh();task=DEPARTMENT_TASKS105.education.find(t=>t.tags?.length);pstate().cabinet={education:{...pstate().cabinet.education,task:task.id}};Object.assign(pstate().candidates[pstate().cabinet.education.candidate],{skill:50,loyalty:50});random=rand;rand=()=>.999;runCabinet();rand=random;check(v3().regions.every(r=>r.demandProgress===0),'failed task earns no local progress');
fresh();let def=programmeDefinition107('education');advanceProgramme('education',0);for(const r of v3().regions)near(r.demandProgress,regionMatchesTags107(r,def.tags)?.14:0,'minister proposal local contribution');
fresh();onlyRegion();let e=regionalEvent(),debt=s.debt;check(e.options[0].detail.includes('70.0'),'displayed first-batch progress');pstate().current=e;resolvePolitical(0);near(v3().regions[0].demandProgress,.7,'first batch 70 percent');near((s.debt-debt)/s.gdp*100,.56,'first batch proportional cost');e=regionalEvent();near(e.options[0].progress,.3,'tail only fills remainder');pstate().current=e;resolvePolitical(0);near(v3().regions[0].demandProgress,1,'second batch completes');check(regionalEvent().type==='maintenance','completed requests excluded');
fresh();onlyRegion();pstate().current=regionalEvent();resolvePolitical(1);near(v3().regions[0].demandProgress,.28,'phased review advances 28 percent');v3().regions[0].demandProgress=.9;e=regionalEvent();near(e.options[1].progress,.1,'small remainder does not overpromise');
fresh();onlyRegion();pstate().current=campaignEvent();resolvePolitical(0);near(v3().regions[0].demandProgress,.7,'campaign project also staged');pstate().current=campaignEvent();resolvePolitical(0);near(v3().regions[0].demandProgress,1,'campaign remainder can finish');check(campaignEvent().type==='campaign-complete','no repeated campaign fulfillment');
fresh();let speaker=pstate().candidates[pstate().cabinet.education.candidate];speaker.trait=3;pstate().cabinet={education:pstate().cabinet.education};pstate().current=ministerEvent();resolvePolitical(1);for(const r of v3().regions)near(r.demandProgress,regionMatchesTags107(r,['welfare'])?.35:0,'minister limited pilot matches stated 35 percent');
fresh();onlyRegion();v3().regions[0].demandProgress=.56;v3().regions[0].termProgress=.8;s.q=12;refreshLocalDemands();near(v3().localHistory.at(-1).regions[0].completed,.56,'refresh archives actual progress');near(v3().regions[0].demandProgress,0,'refresh clears current demands');near(v3().regions[0].termProgress,.8,'election credit retained');
console.log('PASS local pace: real member/budget/cabinet/proposal actions, no double credit, 12-quarter completion, staged projects and costs, matching election credit, refresh and no duplicate requests.');
`,c);
if(process.env.BASELINE_DIR){
 const old=boot(path.resolve(process.env.BASELINE_DIR));vm.runInContext(fixture+`fresh();onlyRegion();v3().regions[0].demandProgress=.35;v3().regions[0].termProgress=.45;pstate().current=regionalEvent();save()`,old);
 const raw=vm.runInContext('JSON.stringify(s)',old),store={'nation-state-v1':raw},updated=boot(root,store);
 assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(s)',updated)),JSON.parse(raw),'existing save and queued promise preserved exactly');
 vm.runInContext('resolvePolitical(0)',updated);assert.equal(vm.runInContext('v3().regions[0].demandProgress',updated),1,'old explicitly promised remainder is honored');
 console.log('PASS prior-save compatibility: exact progress preservation and pre-update queued project commitment honored.');
}
