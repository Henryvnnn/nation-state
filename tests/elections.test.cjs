const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function boot(directory=root,storage={}){const nodes={},ctx={console,setTimeout:()=>{},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},document:{getElementById:id=>nodes[id]||(nodes[id]={innerHTML:'',style:{},showModal(){this.open=true},close(){this.open=false},addEventListener(){}})}};vm.createContext(ctx);for(const [,f]of fs.readFileSync(path.join(directory,'index.html'),'utf8').matchAll(/<script src="([^?]+)\?/g))vm.runInContext(fs.readFileSync(path.join(directory,f),'utf8'),ctx,{filename:f});return ctx}
const fixture=`
function check(v,m){if(!v)throw Error(m)}function near(a,b,m){check(Math.abs(a-b)<1e-6,m+': '+a+' / '+b)}
function fresh(id='presidential',seed='elections-test',chambers='auto'){selectedRegime=id;pendingChambers=chambers;pendingAdmin107=true;create(seed);sits().active=[];sits().notices=[];if(constitution().minority)Object.assign(constitution().minority,{status:'resolved',resolution:'amendment',resolvedQ:s.q});pstate().current=null;pstate().queue=[];pstate().ap=100;s.approval=90;s.stability=95;s.confidence=80;s.inflation=3;s.unemployment=6;s.debt=s.gdp*.4;pstate().judicial=70;for(const z of v3().regions){z.termProgress=1;z.demandProgress=1}features107().notices=[]}
function drain(){let n=0;while(pstate().current){resolvePolitical(0);check(++n<40,'bounded queue')}}
`;
const storage={},ctx=boot(root,storage);
vm.runInContext(fixture+`
for(const id of ['constitutional','westminster','presidential','semi','federal','theorepublic','symbolic'])for(let i=0;i<15;i++){
 fresh(id,'renewal-'+id+'-'+i,i%3===0?'one':i%3===1?'two':'auto');s.q=24;v3().quarterOpen=true;
 if(id==='symbolic'){bicameral108().upper.draft={establishment:40,progressive:30,conservative:30};formSenate108()}
 const upper=JSON.stringify(bicameral108()?.upper),rels=pstate().factions.map(f=>f.relation),judges=JSON.stringify(constitution().judges),report=legislativeForecast();
 const weights=id==='theorepublic'||id==='symbolic'?[.8,.1,.1]:[.6,.2,.2];check(JSON.stringify(report.weights)===JSON.stringify(weights),'weights '+id);
 for(const row of report.rows){near(row.vote,Math.max(0,Math.min(100,row.local*weights[0]+row.policy*weights[1]+row.campaign*weights[2]+row.clergy)),'exact weighted sum');near(row.party.reduce((n,x)=>n+x.share,0),100,'regional party total')}
 const before=JSON.stringify(s);legislativeForecast();politics();archive();guideCatalog104();check(JSON.stringify(s)===before,'render does not mutate '+id);
 holdElection();check(v3().elections.length===1&&v3().elections[0].legislature,'report saved '+id);check(pstate().factions.reduce((n,f)=>n+f.seats,0)===100,'lower total');check(pstate().factions.every(f=>Number.isInteger(f.seats)&&f.seats>=0),'integer lower');check(JSON.stringify(pstate().factions.map(f=>f.relation))===JSON.stringify(rels),'relations preserved');check(JSON.stringify(constitution().judges)===judges,'judges unchanged');
 if(id==='theorepublic')check(JSON.stringify(bicameral108().upper)===upper,'guardians untouched');
 if(hasUpper108()&&!['theorepublic','symbolic'].includes(id)){check(bicameral108().upper.groups.reduce((n,g)=>n+g.share,0)===100,'upper total');check(bicameral108().upper.groups.every(g=>g.share%2===0),'50 actual upper seats');if(id==='constitutional')check(bicameral108().upper.nobleShare>=50&&bicameral108().upper.groups.find(g=>g.view==='conservative').share>=40,'noble constraints')}
 check(validSave(s),'renewal save valid '+id+' '+i);const once=JSON.stringify(s);holdElection();check(JSON.stringify(s)===once,'no repeat election');
 if(id==='symbolic'){check(!bicameral108().upper.formed&&!bicameral108().upper.members.length,'senate vacant');let debt=s.debt,ap=pstate().ap,approval=s.approval;const t=bicameral108().upper.term;bicameral108().upper.draft={establishment:30,progressive:40,conservative:30};formSenate108();check(bicameral108().upper.formed&&bicameral108().upper.term===t+1,'new symbolic term');near(pstate().ap,ap,'no AP');near(s.debt,debt,'no new money fee');near(s.approval,Math.min(100,approval+1),'one-time existing effect');const once=JSON.stringify(s);formSenate108();check(JSON.stringify(s)===once,'no duplicate senate rewards');check(validSave(s),'formed senate save');check(v3().elections[0].legislature.afterUpper.formed,'report formation recorded')}
}
console.log('PASS 105 worlds: formulas, lower and upper totals, regime rules, untouched guardians, symbolic reformation, pure forecast, persistent reports and idempotence');
`,ctx);
vm.runInContext(`
{
// Two election stories plus one other event, including the voting quarters themselves.
for(const id of ['constitutional','westminster','presidential','semi','federal','theorepublic','symbolic'])for(const q of [18,19,20,21,22,23,24,42,48]){
 fresh(id,'events-'+id+'-'+q);s.q=q;v3().quarterOpen=true;constitution().risks.push({due:q,kind:'pressure',method:'pressure',chance:1,judgeName:'测试法官'});
 const original=rand;rand=()=>0;queueQuarterEvents();rand=original;
 pushEvent(eventFrom('公民复决的追加报告','额外发生的报告',[option('确认','')],'federal-referendum'));
 const all=[pstate().current,...pstate().queue].filter(Boolean),regular=all.filter(e=>!e.constitutionalSpecial);
 check(regular.length===3,'exactly three regular '+id+' '+q);check(regular.filter(e=>e.electoralCampaign).length===2,'two campaign '+q);check(regular.filter(e=>!e.electoralCampaign).length===1,'one other '+q);check(new Set(regular.filter(e=>e.electoralCampaign).map(e=>e.campaignKey)).size===2,'distinct stories');check(all.some(e=>e.constitutionalSpecial&&e.title.includes('司法施压')),'special retained');check(v3().eventsGenerated===3,'regular quota');
 drain();check(v3().eventsChosen===3,'only regular replies counted');check(electoral().campaign.length===2,'two choices persisted');check(validSave(s),'events save '+id+' '+q);
}
for(const q of [17,25,41,49]){fresh();s.q=q;v3().quarterOpen=true;queueQuarterEvents();check(![pstate().current,...pstate().queue].some(e=>e?.electoralCampaign),'no campaign outside season '+q)}
fresh('party');s.q=18;v3().quarterOpen=true;queueQuarterEvents();check(![pstate().current,...pstate().queue].some(e=>e?.electoralCampaign),'party routes retained');
fresh();s.q=18;v3().quarterOpen=true;check(!electoralTopics().some(t=>t.key==='pluralism-march'),'unpassed pluralism absent');constitution().history.push({q:17,title:'社会多元修正案',result:'failed'});check(!electoralTopics().some(t=>t.key==='pluralism-march'),'failed pluralism absent');constitution().history.push({q:17,title:'社会多元修正案',result:'passed'});const march=electoralCampaignEvent();check(march.campaignKey==='pluralism-march'&&march.title==='少数群体的民权游行','passed amendment story prioritized');
const reform=REFORMS.findIndex(r=>r.key==='nationalize');s.reforms.push({id:reform,key:'nationalize',ready:19,completed:false,effectsApplied:false,boost:0});check(electoralTopics().some(t=>t.key==='reform-nationalize'&&t.text.includes('仍在执行')),'ongoing reform accurately described');s.reforms.at(-1).completed=true;check(electoralTopics().find(t=>t.key==='reform-nationalize').text.includes('已完成'),'completed reform flavor');constitution().history.push({q:17,title:'关于国家对劳动者的义务'});check(electoralTopics().some(t=>t.key.startsWith('interpret-')),'interpretation history flavor');
fresh();s.q=18;v3().quarterOpen=true;pstate().current=electoralCampaignEvent();pstate().queue=[eventFrom('特别报告','测试',[option('确认','')])];pstate().queue[0].constitutionalSpecial=true;const ap=pstate().ap,choice=pstate().current.options[0],z=v3().regions[0];resolvePolitical(0);check(electoral().campaign.length===1,'choice recorded');near(pstate().ap,ap,'event replies no AP');check(electoralCampaignScore(z)!==50,'campaign score changes');resolvePolitical(0);check(electoral().campaign.length===1,'special does not score');s.q=24;holdElection();near(electoralCampaignScore(z),50,'campaign reset after vote');near(electoralPolicyScore(z),50,'policy term reset');noteDecision('通过财政预算',{welfare:3},['welfare'],null,1,null,{kind:'reform'});check(electoralPolicyScore(v3().regions[4])>50,'post-election same-quarter decision belongs to new term');
fresh('theorepublic');s.q=24;clergyState().loyalty=100;const high=legislativeForecast();clergyState().loyalty=0;const low=legislativeForecast();near(high.clergy,2,'clergy upper bound');near(low.clergy,-2,'clergy lower bound');near(high.vote-low.vote,4,'small clergy influence');
fresh();s.q=24;const neutral=electoralPolicyScore(v3().regions[0]);noteDecision('启动国有化重要企业',{market:-4,welfare:3},['industry'],null,1,null,{kind:'reform'});check(electoralPolicyScore(v3().regions[0])>neutral,'industrial policy affects fit');check(electoralPolicyScore(v3().regions[0])>electoralPolicyScore(v3().regions[3]),'regional policy differences');
console.log('PASS campaign quota in all voting regimes across 63 season quarters, special additions, history-gated flavor, scoring, no AP, new-term reset and clergy influence');
}
`,ctx);
vm.runInContext(`{
// Coalition arithmetic uses individual party strengths, rather than giving all seats to the leader.
fresh('semi');s.q=24;const f=legislativeForecast(),own=playerFactionId107();check(f.coalition.length>=2,'opening coalition');check(f.party[own].share<f.vote,'allied votes not confiscated');check(f.party.filter(p=>f.coalition.includes(p.id)&&p.id!==own).every(p=>p.share>0),'allies receive own votes');
for(const id of ['constitutional','westminster','semi']){
 fresh(id,'crisis-'+id);s.q=24;const own=playerFactionId107(),ally=pstate().factions.find(f=>f.id!==own),incoming=pstate().factions.find(f=>f.id!==own&&f.id!==ally.id);rules103().coalition=[own,ally.id];
 pstate().factions.forEach(f=>f.seats=0);pstate().factions[own].seats=30;ally.seats=15;incoming.seats=55;ally.relation=65;incoming.relation=75;
 const x=startElectoralGovernmentCrisis(),cabinet=JSON.stringify(pstate().cabinet);check(x&&x.deadline===27,'three-quarter minority crisis '+id);
 const rep=pstate().members.find(m=>m.id>=4&&m.faction===incoming.id);inviteCoalition(rep.id);check(!activeSit('government'),'expansion resolves crisis '+id);check(rules103().coalition.includes(ally.id)&&rules103().coalition.includes(incoming.id),'existing ally retained');check(JSON.stringify(pstate().cabinet)===cabinet,'no dismissal on expansion');
 fresh(id,'expire-'+id);s.q=24;s.adminMode=false;rules103().coalition=[playerFactionId107()];const player=pstate().factions[playerFactionId107()],others=pstate().factions.filter(f=>f!==player);player.seats=30;const seats=allocateUnits107(others.map(()=>1),70);others.forEach((f,i)=>f.seats=seats[i]);startElectoralGovernmentCrisis();s.q=27;coalitionQuarter107();check(!!s.ended===(id!=='semi'),'regime-specific expiry '+id);check(!activeSit('government'),'crisis closed');s.q++;syncCoalition107();check(!activeSit('government'),'no repeated minority crisis after timeout');
}
// Pending paid agreements, approved laws and judicial clocks survive the election.
for(const id of ['presidential','symbolic','theorepublic']){
 fresh(id,'pending-'+id,'two');if(id==='symbolic'){bicameral108().upper.draft={establishment:40,progressive:30,conservative:30};formSenate108()}
 draft={...s.policies,income:s.policies.income+1};proposeBudget();const rate=billPassRate104;billPassRate104=()=>90;voteBill();billPassRate104=rate;check(upperBill108(),'upper budget pending');
 const b=pstate().bill;b.chamber108.temp[0]=5;b.chamber108.agreements.push({member:0,q:s.q,bonus:5});const before=JSON.stringify(b),policy=JSON.stringify(s.policies),debt=s.debt;
 s.q=24;holdElection();check(pstate().bill===b&&b.chamber108.stage==='upper','same pending bill');check(JSON.stringify(s.policies)===policy&&s.debt===debt,'no premature policy or charge');check(b.chamber108.temp[0]===5,'paid bloc concession retained');check(validSave(s),'pending bill valid through renewal '+id);
 if(id==='symbolic'){const ap=pstate().ap;upperReview108();check(pstate().bill===b&&pstate().ap===ap,'vacant senate cannot review');bicameral108().upper.draft={establishment:20,progressive:60,conservative:20};formSenate108();check(b.chamber108.temp[0]===5&&b.chamber108.agreements.length===1,'concession survives appointment');check(validSave(s),'pending bill after appointment')}
}
// Extreme votes can leave an upper group with zero seats without making the save invalid.
fresh('presidential','two-party-zero','two');for(let i=0;!twoPartyPresidency()&&i<100;i++)fresh('presidential','two-party-zero-'+i,'two');check(twoPartyPresidency(),'two-party fixture');s.q=24;const zero=legislativeForecast();zero.party.forEach((p,i)=>{p.share=i===0?100:0;p.seats=i===0?100:0});zero.rows.forEach(z=>z.party.forEach((p,i)=>p.share=i===0?100:0));pstate().factions.forEach((f,i)=>f.seats=i===0?100:0);renewElectoralUpper(zero);check(bicameral108().upper.groups.some(g=>g.share===0),'zero-seat bloc');check(validSave(s),'zero-seat Senate valid');
// Forecasts respond to campaign and policy without changing the independent retention ballot.
fresh();s.q=23;const raw=electionForecast().total,base=legislativeForecast().vote;electoral().campaign.push({q:23,regime:regime().id,key:'test',label:'选举决定',momentum:10,tags:[],axes:{law:2}});near(legislativeForecast().vote-base,2,'20 percent campaign coefficient');near(electionForecast().total,raw,'retention ballot unchanged');
console.log('PASS coalition shares, majority loss/recovery/expiry, pending review and paid concessions, zero-seat blocs, distinct retention ballot');
}`,ctx);
// Save in the middle of a voting quarter, restore the exact queue, and finish once.
vm.runInContext(`fresh('symbolic','reload-campaign');s.q=24;v3().quarterOpen=true;queueQuarterEvents();resolvePolitical(0);save()`,ctx);
const queued=storage['nation-state-v1'],restored=boot(root,storage);assert.equal(storage['nation-state-v1'],queued,'reload leaves queue and campaign score intact');vm.runInContext(fixture+'drain();save();check(v3().elections.length===1,"one election after reload");check(validSave(s),"restored election valid")',restored);
const completed=storage['nation-state-v1'];boot(root,storage);assert.equal(storage['nation-state-v1'],completed,'completed election is stable across reload');
// The actual quarter pipeline, including event selection, two full terms and all seven election regimes.
vm.runInContext(`{
 for(const id of ['constitutional','westminster','presidential','semi','federal','theorepublic','symbolic']){
  fresh(id,'full-terms-'+id);for(let q=1;q<=48;q++){
   if(id==='symbolic'&&!bicameral108().upper.formed){bicameral108().upper.draft={establishment:40,progressive:30,conservative:30};formSenate108()}
   s.approval=90;s.stability=95;s.confidence=80;s.inflation=3;s.unemployment=6;s.debt=s.gdp*.4;pstate().ap=0;advance();check(s.q===q,'advance '+id+' '+q);drain();check(validSave(s),'full-cycle save '+id+' '+q);
  }check(v3().elections.length===2&&v3().elections.every(e=>e.legislature),'two election reports '+id);
 }console.log('PASS 336 actual quarters: all seven election regimes, both terms, event queues, valid saves and persistent reports');
}`,ctx);
if(process.env.ELECTION_BASELINE_DIR){
 const legacyStore={},old=boot(path.resolve(process.env.ELECTION_BASELINE_DIR),legacyStore);vm.runInContext(fixture+`fresh('semi','electoral-legacy');s.q=19;v3().quarterOpen=true;queueQuarterEvents();save()`,old);const before=JSON.parse(legacyStore['nation-state-v1']);const migrated=boot(root,legacyStore);const after=JSON.parse(legacyStore['nation-state-v1']);delete after.electoral;assert.deepEqual(after,before,'legacy state preserved, including queued events and RNG');vm.runInContext(fixture+'drain();check(validSave(s),"legacy queued events still work")',migrated);console.log('PASS existing save compatibility without changing old queues, RNG, economy or history');
}
vm.runInContext(`{
 // Verify numerical upper formulas, including small-region representation.
 for(const id of ['constitutional','westminster','presidential','semi','federal']){
  fresh(id,'upper-formula-'+id,'two');s.q=24;const r=legislativeForecast(),u=bicameral108().upper,old=u.groups.map(g=>({...g}));pstate().factions.forEach((f,i)=>f.seats=r.party[i].seats);
  const equal=r.party.map((p,i)=>r.rows.reduce((n,z)=>n+z.party[i].share/r.rows.length,0)),target=old.map(()=>0);
  if(twoPartyPresidency())old.forEach((g,i)=>target[i]=(r.party[g.id].share+equal[g.id])*.5);
  else{for(const f of pstate().factions){let n=old.findIndex(g=>g.view===linkedUpperView108(f));if(n<0)n=old.findIndex(g=>g.view==='establishment');if(n<0)n=0;target[n]+=id==='federal'?equal[f.id]:f.seats}if(id!=='federal')old.forEach((g,i)=>target[i]=target[i]*(id==='constitutional'?.3:.6)+g.share*(id==='constitutional'?.7:.4))}
  const expected=allocateUnits107(target,50);if(id==='constitutional'){const n=old.findIndex(g=>g.view==='conservative');if(expected[n]<20){const others=old.map((g,i)=>i).filter(i=>i!==n),rest=allocateUnits107(others.map(i=>expected[i]),30);expected[n]=20;others.forEach((i,k)=>expected[i]=rest[k])}}
  renewElectoralUpper(r);u.groups.forEach((g,i)=>near(g.share,expected[i]*2,'upper numerical formula '+id));
 }
 fresh('presidential','judicial-clock','two');s.q=23;pstate().ap=100;constitution().judges.forEach(j=>j.trait=2);proposeConstitution('amend','rights','equal');const rate=billPassRate104,upper=upperSupport108;billPassRate104=()=>100;upperSupport108=()=>100;voteConstitution();upperReview108();billPassRate104=rate;upperSupport108=upper;check(constitution().docket?.stage==='review','court review fixture');const deadline=constitution().docket.reviewDeadline,id=constitution().docket.id;s.q=24;holdElection();check(constitution().docket.id===id&&constitution().docket.reviewDeadline===deadline,'court clock unchanged by election');
 fresh('presidential','win-but-minority','one');s.q=24;const forecast=electionForecast;const known=forecast();electionForecast=()=>({...known,total:55,rows:known.rows.map(z=>({...z,share:55}))});electoral().campaign.push({q:23,regime:'presidential',key:'poor-campaign',label:'糟糕的竞选决定',momentum:-20,tags:[],axes:{}});s.adminMode=false;holdElection();electionForecast=forecast;check(!s.ended&&v3().elections[0].won,'president retained');check(v3().elections[0].legislature.coalitionShare<50,'winning retention does not guarantee legislative majority');
 const good=JSON.parse(JSON.stringify(s));for(const corrupt of [x=>x.electoral.decisionStart=-1,x=>x.electoral.campaign[0].momentum=Infinity,x=>x.governance.elections[0].legislature.afterLower[0].share=1000,x=>x.governance.elections[0].legislature.rows[0].party[0].share=999]){const bad=JSON.parse(JSON.stringify(good));corrupt(bad);check(!validSave(bad),'corrupt electoral state rejected')}
 console.log('PASS exact upper formulas, continuing constitutional review clocks, presidential minority outcome and save validation');
}`,ctx);
