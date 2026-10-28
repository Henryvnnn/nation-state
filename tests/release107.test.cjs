const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),files=['game.js','political.js','governance.js','revision12.js','situations.js','release103.js','release104.js','cabinet-tasks.js','release107.js','coalition107.js','interface107.js','console107.js','action-points.js','immersion.js','constitution.js','constitutional-process.js','guide.js'];
function boot(directory=root,storage={}){let nodes={},ctx={console,setTimeout:()=>{},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},document:{getElementById:id=>nodes[id]||(nodes[id]={innerHTML:'',style:{},showModal(){this.open=true},close(){this.open=false},addEventListener(){}})}};vm.createContext(ctx);for(let f of files)if(fs.existsSync(path.join(directory,f)))vm.runInContext(fs.readFileSync(path.join(directory,f),'utf8'),ctx,{filename:f});return ctx}
const c=boot();vm.runInContext(`
function assert(v,m){if(!v)throw Error(m)}function near(a,b,m){assert(Math.abs(a-b)<1e-7,m+': '+a+' / '+b)}
function fresh107(id='presidential',seed='release107'){selectedRegime=id;pendingDifficulty=false;create(seed);if(s.constitution?.minority)Object.assign(s.constitution.minority,{status:'resolved',resolution:'amendment',resolvedQ:s.q});sits().active=[];sits().notices=[];pstate().current=null;pstate().queue=[];s.debt=s.gdp*.7;s.approval=70;s.stability=75;s.confidence=65;s.unemployment=7;pstate().judicial=65}
let seenNames=new Set(),identities=new Set(),minorityStarts=0;
for(let r of REGIMES){fresh107(r.id);let p=pstate(),regions=v3().regions,diagram=chamberSeatData107();
 assert(regions.length===8&&regions[7].isCapital&&regions[7].name===s.capital,'independent capital '+r.id);
 assert(regions.filter(z=>z.isCapital).length===1&&new Set(regions.map(z=>z.stem)).size===8,'unique geography');
 near(regions.reduce((sum,z)=>sum+z.weight,0),100,'population weight');near(regions.reduce((sum,z)=>sum+z.population,0),s.pop,'population total');
 assert(/特别行政区|特别市|特区|大市|领地/.test(regions[7].name),'capital designation');
 assert(p.members.every(m=>m.region===regions[m.regionId].name),'member geography');
 assert(regions.every(z=>p.members.some(m=>m.regionId===z.id)),'all regional demands represented');
 assert(p.cabinet.labour&&MINISTER_PROGRAMMES103.labour.options.length===3,'labour filled with a programme');
 assert(cabinetTaskOptions105('labour').length===5,'labour-specific orders');
 assert(office('labour')===(r.body==='枢密院'||['constitutional','westminster'].includes(r.id)?'劳动大臣':'劳动部长'),'regime title');
 assert(validSave(JSON.parse(JSON.stringify(s))),'new save valid '+r.id);
 assert(diagram.seats.length===100,'100 visual seats');
 assert(diagram.layout===(['constitutional','westminster'].includes(r.id)||r.body==='枢密院'?'benches':'semicircle'),'correct chamber '+r.id);
 for(let f of p.factions)assert(diagram.seats.filter(z=>z.faction===f.id).length===f.seats,'faction colour counts');
 assert(!chamberSeats107().includes('<text')&&!chamberSeats107().includes('<span'),'no visible diagram labels');
 for(let z of regions)z.demandProgress=1;regions[7].demandProgress=0;let e=regionalEvent();assert(e.region===7&&p.members[e.member].regionId===7,'capital request');p.current=e;resolvePolitical(0);near(regions[7].demandProgress,.7,'capital first batch');p.current=regionalEvent();resolvePolitical(0);assert(regions[7].demandProgress===1,'capital request completable in batches');assert(regionalEvent().type==='maintenance','no completed capital repeat');
 regions[7].termProgress=0;regions[7].development=50;let before=electionForecast().total;noteDecision('首都公共服务',{},['welfare'],7,1);near(electionForecast().total-before,s.approval*(.2*.7+.8/500)*.12,'capital contributes independently');
 s.approval=85;for(let z of regions)z.termProgress=1;holdElection();assert(v3().elections.at(-1).rows.length===8&&regions[7].lastResult!==null,'capital election results');
 assert(p.factions[playerFactionId107()].seats===Math.round(clamp(v3().elections.at(-1).total,10,85)),'election assigns player seats');
}
fresh107('federal');assert(v3().regions[0].name.endsWith('邦')&&v3().regions[1].name.endsWith('加盟共和国'),'federal non-capital suffixes');
for(let i=0;i<120;i++){fresh107('presidential','variety107-'+i);let p=pstate(),own=playerFactionId107();identities.add(own);assert(p.factions[own].seats>25,'player eligible');if(p.factions[own].seats<Math.max(...p.factions.map(f=>f.seats)))minorityStarts++;
 assert(p.rulingParty===p.factions[own].name&&rules103().coalition.join(',')===String(own),'consistent ruling identity');
 assert(Object.values(p.cabinet).every(item=>item&&p.candidates[item.candidate].faction===own),'all initial ministers from actual party');
 assert(new Set(Object.values(p.cabinet).map(item=>item.candidate)).size===cabinetSlots103().length,'no duplicate appointments');
 v3().regions.forEach(z=>seenNames.add(z.stem));
}
assert(identities.size===5&&minorityStarts>30,'random smaller parties enabled');assert(seenNames.size>700,'broad generated name space');
fresh107('presidential','reproducible107');let first=JSON.stringify({regions:v3().regions,p:pstate()});fresh107('presidential','reproducible107');assert(first===JSON.stringify({regions:v3().regions,p:pstate()}),'seed reproducibility');
for(let i=0;playerFactionId107()===0;i++)fresh107('presidential','nonzero107-'+i);
{let p=pstate(),own=playerFactionId107(),other=p.factions.find(f=>f.id!==own);s.q++;decayAgendas103();assert(p.factions[own].agendaDecay===0&&other.agendaDecay===2,'decay exempts actual player');other.relation=70;let representative=p.members.find(m=>m.id>=4&&m.faction===other.id);inviteCoalition(representative.id);assert(rules103().coalition.includes(other.id)&&cabinetEligible(p.candidates.find(x=>x.faction===other.id)),'nonzero coalition');distributeElectionSeats107(67);assert(p.factions[own].seats===67&&p.factions.reduce((a,f)=>a+f.seats,0)===100,'nonzero election distribution')}
fresh107();{let id=REFORMS.findIndex(r=>r.key==='inheritance'),gdp=s.gdp;s.reforms.push({id,key:'inheritance',ready:s.q,boost:0,completed:false,effectsApplied:false});completeReforms();near(s.debt/s.gdp*100,35,'70 to 35 debt');near(s.gdp,gdp,'GDP unchanged');let before=s.debt;completeReforms();near(s.debt,before,'no repeat payoff');assert(REFORMS[id].text.includes('50%')&&!REFORMS[id].text.includes('全部公债'),'honest levy text')}
fresh107();{let minister=pstate().candidates[pstate().cabinet.labour.candidate],loyalty=minister.loyalty;s.q++;programmeQuarter103();near(minister.loyalty,loyalty-.5,'labour loyalty loss');let q=programmeQuote('labour',0);assert(q.cost<q.a[1]&&q.progress>0,'investment discount and weighting');rules103().proposals.labour.progress=99;let unemployed=s.unemployment;advanceProgramme('labour',0);near(s.unemployment,unemployed-.7,'labour reward');assert(rules103().proposals.labour.completed,'labour complete');unemployed=s.unemployment;advanceProgramme('labour',1);near(s.unemployment,unemployed,'reward once');loyalty=minister.loyalty;s.q++;programmeQuarter103();near(minister.loyalty,loyalty,'completed no loss')}
fresh107();{let catalog=guideCatalog104();for(let q of ['政策利率','政策利率、','  政策利率。 ','“政策利率”','央行利率','基准利率'])assert(guideMatches104(q,catalog)[0].id==='rate','rate alias '+q);for(let q of ['首都','劳动部长','就业与劳动保障计划'])assert(guideMatches104(q,catalog).length,'new concepts '+q);assert(archive().includes('解释政策利率'),'chart opens explanation')}
fresh107();{let original=rand;rand=()=>.999;let disaster=startSituation('disaster');rand=original;assert(disaster.region===7&&disaster.disaster==='城市洪涝','capital disaster supported')}
let bad=JSON.parse(JSON.stringify(s));delete bad.governance;assert(!validSave(bad),'malformed migration marker rejects without throw');
console.log('PASS 1.0.7: all 12 regimes, capital demands/elections/disaster, exact seat graphics, 120 seeded worlds, random player party and coalition, inheritance, labour and guide aliases.');
`,c);

// Optional real-release migration check: BASELINE_DIR=/path/to/1.0.6 node tests/release107.test.cjs.
// Without a baseline, construct a seven-region save using the same legacy fields.
const baseline=process.env.BASELINE_DIR,old=boot(baseline||root);
vm.runInContext(`selectedRegime='presidential';create('legacy107');if(s.constitution?.minority)Object.assign(s.constitution.minority,{status:'resolved',resolution:'amendment',resolvedQ:s.q});sits().active=[];sits().notices=[];pstate().current=null;pstate().queue=[];`,old);
if(!baseline)vm.runInContext(`
 delete s.release107;delete pstate().playerFaction;pstate().rulingParty=pstate().factions[0].name;rules103().coalition=[0];delete pstate().cabinet.labour;delete rules103().proposals.labour;pstate().candidates=pstate().candidates.slice(0,60);cabinetSlots103().filter(k=>k!=='labour').forEach((k,i)=>pstate().cabinet[k]={candidate:i*5,task:'balanced'});v3().regions=v3().regions.slice(0,7);v3().regions.forEach((z,i)=>{z.weight=[22,18,16,14,12,10,8][i];z.name=['三河省','鹰隘省','新维兰省','双河省','晴川省','青峰省','远关省'][i];delete z.isCapital;delete z.stem});pstate().members.forEach((m,i)=>{m.regionId=i%7;m.region=v3().regions[m.regionId].name});
`,old);
vm.runInContext(`
 s.q=12;s.debt=s.gdp*.7;s.approval=72;pstate().ap=2;pstate().cabinet.education.task='education_research';rules103().proposals.education.progress=42;
 for(let z of v3().regions){z.termProgress=1;z.demandProgress=1;z.totalProgress=2;z.lastResult=60+z.id}
 v3().elections.push(electionForecast());pstate().current=eventFrom(v3().regions[0].name+'的项目报告',v3().regions[0].name+'已完成项目',[option('确认','无变化')]);
 let inheritance=REFORMS.findIndex(r=>r.key==='inheritance');pstate().bill={kind:'reform',id:inheritance,title:REFORMS[inheritance].name,description:'一次性清偿全部公债',offer:1};record();save();
`,old);
const before=JSON.parse(vm.runInContext('JSON.stringify(s)',old)),storage={'nation-state-v1':JSON.stringify(before)},updated=boot(root,storage),after=JSON.parse(vm.runInContext('JSON.stringify(s)',updated));
assert.equal(after.q,before.q);assert.equal(after.seed,before.seed);assert.equal(after.debt,before.debt);assert.equal(after.approval,before.approval);assert.equal(after.political.ap,2);assert.equal(after.political.playerFaction,0);
assert.deepEqual(after.political.candidates.slice(0,before.political.candidates.length),before.political.candidates,'existing people retain identities and stats');
for(let [key,item]of Object.entries(before.political.cabinet))assert.deepEqual(after.political.cabinet[key],item,'appointment preserved '+key);
for(let [key,proposal]of Object.entries(before.rules103.proposals))assert.deepEqual(after.rules103.proposals[key],proposal,'proposal preserved '+key);
for(let i=0;i<7;i++)for(let key of ['id','termProgress','demandProgress','totalProgress','lastResult'])assert.equal(after.governance.regions[i][key],before.governance.regions[i][key],'region progress preserved '+key);
assert.equal(after.governance.regions[7].termProgress,1);assert.equal(after.governance.regions[7].demandProgress,1);assert.equal(after.governance.regions[7].lastResult,null);
assert.equal(after.governance.elections[0].rows.length,7,'no invented capital vote in history');
for(let i=0;i<7;i++)for(let key of ['weight','share','fit'])assert.equal(after.governance.elections[0].rows[i][key],before.governance.elections[0].rows[i][key],'past election unaffected');
assert(after.political.current.title.startsWith(after.governance.regions[0].name));assert.match(after.political.bill.description,/50%/);assert(after.political.cabinet.labour);assert.equal(after.political.candidates.length,75);assert(storage['nation-state-v1-pre-107']);
assert(vm.runInContext('validSave(JSON.parse(JSON.stringify(s)))',updated));
const saved=storage['nation-state-v1'];boot(root,storage);assert.equal(storage['nation-state-v1'],saved,'exact reload, no repeated migration');
console.log('PASS '+(baseline?'real 1.0.6':'legacy-shaped')+' migration: party, cabinet, proposal progress, debt, AP, regional progress, historical votes and queued references preserved; new capital and labour; idempotent reload.');
