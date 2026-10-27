const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const files=[...fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/<script src="([^?]+)\?/g)].map(x=>x[1]);
function boot(storage={}){
 const nodes={},c={console,setTimeout:()=>{},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},document:{getElementById:id=>nodes[id]||(nodes[id]={innerHTML:'',style:{},showModal(){this.open=true},close(){this.open=false},addEventListener(){}})}};
 vm.createContext(c);for(const f of files)vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c,{filename:f});return c;
}
const storage={},c=boot(storage);
vm.runInContext(`
function check(x,m){if(!x)throw Error(m)}
function fresh(reg,seed='personnel'){selectedRegime=reg;pendingDifficulty=true;pendingAdmin107=true;create(seed+'-'+reg)}
let seen=new Set(),rareTotal=0,rareHonours=0,openingScandals=0;
for(const r of REGIMES)for(let n=0;n<20;n++){
 fresh(r.id,'roster-'+n);let p=pstate(),people=personnelRoster107();
 for(const key of OFFICE_KEYS107){const title=office(key);check((key==='head'&&!r.head||key==='deputy'&&r.id==='federal')?title===null:typeof title==='string'&&title.length>0,'complete offices '+r.id+' '+key)}
 check(validSave(JSON.parse(JSON.stringify(s))),'valid save '+r.id);
 check(new Set(people.map(x=>x.name)).size===people.length,'unique display names');
 check(new Set(people.map(x=>x.baseName)).size===people.length,'unique identities');
 check(p.members.length===9&&p.members.every((m,i)=>m.id===i),'stable member IDs');
 for(const f of p.factions)check(p.members.slice(4).filter(m=>m.faction===f.id).length===1,'one representative per faction');
 for(const person of people){
  if(person.honour)seen.add(person.honour.title);
  if(!NOBLE_REGIMES107.includes(r.id)&&!RELIGIOUS_REGIMES107.includes(r.id))check(person.honour===null,'no unsupported titles');
  if(honourFaction107(person)==='secular')check(person.honour===null,'secular faction never titled');
  if(['merchant','technocrat'].includes(honourFaction107(person))){rareTotal++;if(person.honour){rareHonours++;check(person.honour.rank===1,'rare honours lowest grade')}}
  if(person.honour?.kind==='religious')check(person.honour.tradition===s.personnel107.religiousTradition,'coherent religious tradition');
 }
 const slots=cabinetSlots103(),holders=slots.map(k=>p.cabinet[k]).filter(Boolean);
 check(new Set(holders.map(x=>x.candidate)).size===holders.length,'no double appointment');
 check(holders.every(x=>cabinetEligible(p.candidates[x.candidate])),'coalition eligibility respected');
 if(s.personnel107.openingAssigned){
  const senior=p.candidates[p.cabinet[r.head?'head':'deputy'].candidate];
  check(p.candidates.filter(cabinetEligible).every(c=>(c.honour?.rank||0)<=(senior.honour?.rank||0)),'highest eligible rank leads government');
  const chief=constitution().judges.find(j=>j.chief);check(constitution().judges.every(j=>(j.honour?.rank||0)<=(chief.honour?.rank||0)),'highest judicial rank leads court');
  for(let i=1;i<4;i++)check((p.members[i-1].honour?.rank||0)>=(p.members[i].honour?.rank||0),'assembly leadership order');
 }
 check(constitution().judges.filter(j=>j.chief).length===1,'one chief');
 check(constitution().judges.filter(j=>j.trait<2).length*2<constitution().judges.length,'judicial minorities preserved');
 for(const sit of sits().active)if(sit.kind==='scandal'&&sit.opening){openingScandals++;check(sit.candidate===p.cabinet[sit.slot].candidate,'scandal actual incumbent');check(sit.faction===p.candidates[sit.candidate].faction,'scandal actual faction')}
 const before=JSON.stringify(s);cabinet();assembly();judiciary();guideCatalog104();initPolitics();check(JSON.stringify(s)===before,'render and init idempotent');
 const catalog=guideCatalog104();check(catalog.every(e=>typeof e.title==='string'&&e.aliases.every(a=>typeof a==='string')),'guide titles and aliases are strings');for(const key of OFFICE_KEYS107.filter(k=>k!=='head'&&office(k)))check(guideMatches104(office(key),catalog).length,'all official titles searchable');
}
check(rareTotal>500&&rareHonours>0&&rareHonours/rareTotal<.05,'rare faction frequency');
check(openingScandals>20,'opening scandal coverage');
for(const title of ['伯爵','公爵','爵士','枢机','主教','大宗本','教长'])check(seen.has(title),'title variety '+title);
fresh('party');check(office('foreign')==='外交事务委员会主任'&&office('labour')==='劳动总局局长','one-party examples');check(cabinet().includes('国家财政委员会主任'),'player treasury label');
fresh('constitutional');check(office('foreign')==='外务大臣','constitutional example');
fresh('theoabsolute');check(office('labour')==='人力和社会部部长','theocratic example');
// Low-rank people remain valid appointments after the opening distribution.
{const p=pstate(),c=p.candidates.filter(cabinetEligible).find(c=>!Object.values(p.cabinet).some(x=>x?.candidate===c.id)&&!c.honour);check(c,'untitled candidate exists');p.ap=10;appointOfficial('foreign',c.id);check(p.cabinet.foreign.candidate===c.id,'player not restricted by precedence')}
// The same seed regenerates identical names, titles and first appointments.
fresh('absolute','repeat');let generated=JSON.stringify({people:personnelRoster107(),cabinet:pstate().cabinet});fresh('absolute','repeat');check(JSON.stringify({people:personnelRoster107(),cabinet:pstate().cabinet})===generated,'seed repeat');
// Updating an ongoing save adds distinctions only: no reappointment or RNG changes.
fresh('absolute','migration');s.q=7;pstate().ap=1;let legacy=JSON.parse(JSON.stringify(s));delete legacy.personnel107;
for(const person of [...legacy.political.members,...legacy.political.candidates,...legacy.constitution.judges]){person.name=person.baseName;delete person.baseName;delete person.honour}
s=legacy;const original=JSON.stringify(s);creatingWorld=false;initPolitics();
check(!s.personnel107.openingAssigned,'no old-save reappointment');check(localStorage.getItem(KEY+'-pre-personnel107')===original,'exact migration backup');
let migrated=JSON.parse(JSON.stringify(s));delete migrated.personnel107;
for(const person of [...migrated.political.members,...migrated.political.candidates,...migrated.constitution.judges]){person.name=person.baseName;delete person.baseName;delete person.honour}
check(JSON.stringify(migrated)===original,'every old gameplay field unchanged');
let after=JSON.stringify(s);initPolitics();check(JSON.stringify(s)===after,'no duplicate title');check(validSave(s),'migrated save valid');save();
`,c);
const saved=storage['nation-state-v1'];boot(storage);assert.equal(storage['nation-state-v1'],saved,'exact reload');
vm.runInContext(`
for(const source of ['absolute','theoabsolute','party','symbolic'])for(const roll of [.1,.9]){
 fresh(source,'transition');const before=JSON.stringify(personnelRoster107().map(x=>({id:x.id,name:x.name,base:x.baseName,honour:x.honour})));let random=rand;rand=()=>roll;enactCompetitiveElections107(source);rand=random;
 check(JSON.stringify(personnelRoster107().map(x=>({id:x.id,name:x.name,base:x.baseName,honour:x.honour})))===before,'transition preserves titles and identity');
 check(office('foreign')===OFFICE_TITLES107[regime().id][3],'transition office follows regime');check(validSave(s),'valid after transition');
}
fresh('absolute','validation');let malformed=JSON.parse(JSON.stringify(s));malformed.political.candidates[0].honour={kind:'nobility',rank:99,title:'公爵'};check(!validSave(malformed),'invalid honours rejected');
console.log('PASS personnel: 240 worlds / 12 regimes; office titles, all three religious traditions, faction exclusions and rare rate, ranked appointments, one representative, coalition eligibility, chief judges, opening scandals, exact old-save migration/reload, free later appointments and constitutional transitions.');
`,c);
