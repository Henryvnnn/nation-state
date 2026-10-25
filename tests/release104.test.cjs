const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..'),files=['game.js','political.js','governance.js','revision12.js','situations.js','release103.js','release104.js','cabinet-tasks.js','release107.js','coalition107.js','interface107.js','console107.js','action-points.js','immersion.js','constitution.js','constitutional-process.js','guide.js'];let storage={};
function boot(){let nodes={},ctx={console,setTimeout:()=>{},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},document:{getElementById:id=>nodes[id]||(nodes[id]={innerHTML:'',style:{},showModal(){this.open=true},close(){this.open=false},addEventListener(){}})}};vm.createContext(ctx);for(let f of files)vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});return ctx}
let ctx=boot();
vm.runInContext(`
function assert(v,m){if(!v)throw Error(m)}function near(a,b,m){assert(Math.abs(a-b)<1e-7,m+': '+a+' / '+b)}
function fresh104(id='presidential',seed='r104'){selectedRegime=id;pendingDifficulty=false;create(seed);if(s.constitution?.minority)Object.assign(s.constitution.minority,{status:'resolved',resolution:'amendment',resolvedQ:s.q});sits().active=[];sits().history=[];sits().notices=[];pstate().current=null;pstate().queue=[];s.inflation=3;s.unemployment=6;s.stability=80;s.approval=75;s.debt=s.gdp*.4;pstate().judicial=75}
fresh104();{
 let x=startSituation('olympics');assert(x&&sits().olympicsApplied,'bid consumed');assert(!startSituation('olympics'),'duplicate blocked');
 assert(situationsPage().includes('成功申办与赛后收益'),'benefit UI');assert(situationsPage().includes('支持 +6'),'success payoff');
 situationAct(x.id,'cancel');s.q=20;assert(!startSituation('olympics'),'cancel cannot rebid');assert(sits().history.some(x=>x.kind==='olympics'),'cancel history');
 for(let i=0;i<40;i++)randomSituations();assert(!sits().notices.some(e=>e.situationAction==='olympic-bid'),'no future invitation');
}
for(let outcome of ['success','failure','overrun']){fresh104();let x=startSituation('olympics');x.progress=outcome==='failure'?0:100;x.quality=80;x.overrun=outcome==='overrun'?50:0;s.q=8;situationQuarter();assert(!activeSit('olympics'),'Olympic concluded');assert(!startSituation('olympics'),'all results consume chance');assert(sits().history[0].reason.includes('支持'),'result describes payoff')}
fresh104();{
 let e={type:'situation-notice',situationAction:'olympic-bid',title:'奥运申办邀请',text:'申办',options:[option('接受','成本',{cost:.3}),option('拒绝','无成本')]};
 pstate().current=JSON.parse(JSON.stringify(e));let debt=s.debt;resolvePolitical(1);assert(!sits().olympicsApplied,'decline keeps chance');near(s.debt,debt,'decline no fee');
 pstate().current=JSON.parse(JSON.stringify(e));resolvePolitical(0);assert(sits().olympicsApplied,'accept consumes');near(s.debt,debt+s.gdp*.003,'fee once');
 let paid=s.debt;pstate().current=JSON.parse(JSON.stringify(e));resolvePolitical(0);near(s.debt,paid,'stale offer no duplicate cost');
 delete s.release104;delete sits().olympicsApplied;initPolitics();assert(sits().olympicsApplied,'legacy active Olympics remembered');
 endSituation(activeSit('olympics'),'已举办');delete s.release104;delete sits().olympicsApplied;initPolitics();assert(sits().olympicsApplied,'legacy history remembered');
}
// Name diversity across all 69 actors, reproducibility and migration of ID-linked records.
for(let i=0;i<25;i++){fresh104('presidential','names104-'+i);let people=[...pstate().members,...pstate().candidates],names=people.map(x=>x.name);assert(new Set(names).size===names.length,'unique names');assert(new Set(names.map(n=>n[0])).size===names.length,'unique surnames');assert(new Set(names.map(n=>n[1])).size>60,'given first diverse');assert(new Set(names.map(n=>n[2])).size>60,'given last diverse')}
fresh104('party','same104');let generated=JSON.stringify(pstate().candidates.map(c=>c.name));fresh104('party','same104');assert(JSON.stringify(pstate().candidates.map(c=>c.name))===generated,'seeded names');
{
 let c=pstate().candidates[0],old=c.name,skill=c.skill,position=JSON.stringify(pstate().cabinet);pstate().reports=[{q:0,title:old+'的报告',text:old+'完成任务'}];delete s.release104;initPolitics();assert(c.name!==old&&c.skill===skill&&JSON.stringify(pstate().cabinet)===position,'rename keeps identity and statistics');assert(pstate().reports[0].title.includes(c.name),'report identity updated');let renamed=JSON.stringify(s);initPolitics();assert(JSON.stringify(s)===renamed,'rename runs once');
}
fresh104();{
 let p=pstate(),c=p.candidates[p.cabinet.education.candidate],loyalty=c.loyalty;s.q=1;programmeQuarter103();near(c.loyalty,loyalty-.5,'half-point loyalty');programmeQuarter103();near(c.loyalty,loyalty-.5,'once per quarter');
 p.bill={kind:'budget',title:'预算',description:'测试',policies:{...s.policies}};let html=assembly();assert(html.includes('% 院内支持率')&&html.includes('所需院内支持率 51%'),'percentage UI');assert(!html.includes('通过所需'),'old seats removed');assert(html.includes('<summary data-guide="faction-details">查看细则'),'details collapsed');assert(!html.includes('faction-details" open'),'details not expanded');
 p.factions.forEach(f=>f.seats*=2);near(billPassRate104(),votes()/200*100,'normalization');
}
// Every available mechanism catalog is searchable and synonyms share canonical entries.
for(let regimeInfo of REGIMES){fresh104(regimeInfo.id);let catalog=guideCatalog104();assert(catalog.length>250,'comprehensive catalog');let before=JSON.stringify(s);guideCatalog104();assert(before===JSON.stringify(s),'reference generation read-only');
 for(let query of ['稳定','稳定度','政治稳定'])assert(guideMatches104(query,catalog)[0].id==='stability','stability alias');
 for(let query of ['奥运','奥运会','奥运申办'])assert(guideMatches104(query,catalog)[0].id==='olympics','Olympic alias');
 for(let r of REFORMS)assert(guideMatches104(r.name,catalog).length,'all reforms');for(let t of TRAITS)assert(guideMatches104(t.name,catalog).length,'all traits');for(let p of Object.values(MINISTER_PROGRAMMES103)){assert(guideMatches104(p.name,catalog).length,'all programmes');for(let a of p.options)assert(guideMatches104(a[0],catalog).length,'all programme options')}
 for(let r of REGIMES)assert(guideMatches104(r.name,catalog).length,'all regimes');assert(!guideMatches104('不存在的词语XYZ',catalog).length,'unknown term');assert(!guideMatches104(pstate().candidates[0].name,catalog).length,'random names excluded');
 showHelp();searchGuide104('稳定');assert($('guide-results').innerHTML.includes('低于20'),'stability threshold explained');searchGuide104('不存在的词语XYZ');assert($('guide-results').innerHTML.includes('该概念不存在于此游戏，请检查输入是否正确'),'unknown message');
 assert(tutorialSteps104().some(x=>x.id==='guide')&&tutorialSteps104('page','overview').some(x=>x.id==='regime'),'tour includes guide/regime');
 assert(guideMatches104('最高领袖',catalog)[0].text.includes('没有任期'),'role-specific definition');
 assert(validSave(JSON.parse(JSON.stringify(s))),'new save valid');
}
fresh104();startSituation('olympics');s.rules103.research.progress=37;record();save();
console.log('PASS 1.0.4: one Olympic application per game, decline/cancel/success/failure/overrun paths, stale invitation guard, old-save migration, seeded name diversity, ID continuity, percentage passage, compact faction details, 0.5 loyalty, 250+ searchable concepts, synonyms and all regimes.');
`,ctx);
let saved=storage['nation-state-v1'];boot();assert.equal(storage['nation-state-v1'],saved);console.log('PASS exact reload: names and Olympic allowance remain stable');
