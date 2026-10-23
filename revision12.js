/* Release 1.2: regime-specific factions, twelve-quarter local mandates, challenge balance. */
const LOCAL_DEMANDS={
industry:['更新工厂并稳定工业就业','改善工业园物流与生产安全','扶持本地供应链和工人再培训'],
agriculture:['修复灌溉设施并稳定农户收入','建设粮仓与农产品冷链','支持农业合作社和乡村道路'],
technology:['扩大科研资助与技术人才培养','建设创新孵化器和数字基础设施','推动大学成果转化与青年就业'],
trade:['简化通关并改善港口效率','保障中小出口商融资','提高金融透明度并拓展海外市场'],
welfare:['扩充基层医疗和社会保障','改善养老照护与低收入家庭服务','缓解住房成本与公共服务排队'],
green:['保护森林水源与地方文化','治理污染并发展清洁能源','修复生态旅游设施与传统聚落'],
security:['改善边境交通与基本治安','建设灾害避难设施与应急网络','整顿地方安全机构并保障边民生活']};
function countryStem(){let suffixes=REGIMES.map(r=>r.suffix).sort((a,b)=>b.length-a.length);let x=s.name;for(let a of suffixes)if(x.endsWith(a))return x.slice(0,-a.length);return x}
function factionNames12(){let r=regime(),n=countryStem(),g=v3(),p=pstate();
 if(r.id==='party'){
  p.rulingParty=pick(g.socialist?['共产党',n+'共产党','人民劳动党',n+'劳动党','社会主义工人党']:['国民建设党',n+'国民党','民族复兴党','人民发展党']);
  return [p.rulingParty+'主流派',p.rulingParty+'新锐派',p.rulingParty+'改革派','民主党派','无党籍团体'];
 }
 const pools={
 absolute:[['王廷亲政派','王室忠诚派'],['地方贵族派','世袭领主派'],['开明乡绅派','宫廷改革派'],['自治市民派','商会自治派'],['法务官僚派','传统教团派']],
 aristocratic:[['大贵族联合派','元老家族派'],['地方贵族派','边疆领主派'],['开明乡绅派','新兴贵族派'],['自治市民派','自由城市派'],['法务官僚派','教会地产派']],
 tyranny:[['执政亲信派','中央集权派'],['军方强硬派','安全官僚派'],['地方贵族派','地方实力派'],['自治市民派','工商实业派'],['开明乡绅派','技术改革派']],
 theoabsolute:[['最高教团','教法学家'],['保守教士','传统经学院'],['开明教士','宗教改革学者'],['世俗团体','城市商人'],['地方宗教长老','圣地管理者']],
 constitutional:[['王国保守党','宪政保守党'],['自由改革党','自由民主党'],['社会民主党','工党'],['地方自治党','乡村人民党'],['绿色未来党','公民改革阵线']],
 westminster:[['联合保守党','国民保守党'],['自由民主党','自由改革党'],['工党','劳动合作党'],['地方自治党','乡村联盟党'],['绿色党','公民进步党']],
 federal:[['联邦团结党','联邦民主党'],['自由联邦党','市场改革党'],['社会民主党','劳动进步党'],['州权自治党','地区合作阵线'],['绿色公民党','为了联邦未来']],
 presidential:[['共和建设党','国家团结党'],['自由民主党','自由进步党'],['社会民主党','人民劳动党'],['地方自治阵线','农民民主党'],['公民改革党','绿色未来党']],
 semi:[['民主共和党','国民复兴党'],['自由中间党','自由改革党'],['社会民主党','民主劳动党'],['地区进步党','乡村人民党'],['生态共和党','为了民主改革']],
 theorepublic:[['信仰与建设党','宗教共和党'],['教法守护阵线','传统信仰党'],['社会公正党','民生发展党'],['地方协商党','民族团结阵线'],['世俗改革党','公民自由党']],
 symbolic:[['国家复兴党','人民统一党'],['建设合作党','发展联盟党'],['劳动团结党','社会进步党'],['地方发展党','乡村建设党'],['公民改革党','民主改革阵线']]
 };
 let names=pools[r.id].map(pool=>pick(pool));
 if(r.body!=='枢密院'&&rand()<.7)names[0]=n+names[0];
 p.rulingParty=names[0];return names;
}
function demandText(z){return LOCAL_DEMANDS[z.sector][z.demandVariant]}
function unfinishedRegions(){return v3().regions.filter(z=>z.demandProgress<1&&!s.situations?.active.some(x=>x.kind==='disaster'&&x.region===z.id))}
function migrate12(){let g=v3();if(g.release==='1.2')return;let p=pstate(),oldNames=p.factions.map(f=>f.name),names=factionNames12();
 p.factions.forEach((f,i)=>{f.name=names[i];if(regime().id==='party')f.seats=[35,22,25,16,2][i];else if(regime().id==='symbolic'&&s.q===0)f.seats=[60,15,12,8,5][i]});
 p.members.forEach(m=>{if(m.id>=4)m.role=names[m.faction]+(regime().body==='议会'?'党团总召':'首席代表')});
 for(let e of [p.current,...p.queue].filter(Boolean))for(let key of ['title','text'])if(typeof e[key]==='string')oldNames.forEach((name,i)=>{e[key]=e[key].split(name).join(names[i])});
 g.release='1.2';g.localCycle=Math.floor(s.q/12);g.localRefreshAt=s.q-s.q%12;g.localHistory=[];g.pressure=null;
 for(let z of g.regions){z.demandProgress=clamp(z.termProgress,0,1);z.demandVariant=Math.floor(rand()*3)}
 log('1.2 版本生效','政体派别与席位已校正；地方诉求每 12 季度换届；启用执政损耗、地方履约和财政压力。');
}
const initBefore12=initPolitics;initPolitics=function(id=selectedRegime){initBefore12(id);migrate12()};
const decisionBefore12=noteDecision;noteDecision=function(label,axes={},tags=[],region=null,amount=1){decisionBefore12(label,axes,tags,region,amount);for(let z of v3().regions)if((region===null||z.id===region)&&tags.includes(z.sector))z.demandProgress=clamp(z.demandProgress+amount,0,1)};
// Autonomous administrative tasks also advance the current local mandate.
const cabinetBefore12=runCabinet;runCabinet=function(){let before=v3().regions.map(z=>z.totalProgress);cabinetBefore12();for(let z of v3().regions)z.demandProgress=clamp(z.demandProgress+z.totalProgress-before[z.id],0,1)};
function localReviewEvent(){return eventFrom('地方履约后的资源分配','本轮各地诉求均已完成。地方代表转而讨论项目维护费用；此次决定不会重复发放地方履约奖励。',[
 option('承担设施维护费用','支出 0.25% GDP；稳定 +1。',{cost:.25,stability:1},{welfare:1}),
 option('实行使用者付费','支持 -1；信心 +1。',{approval:-1,confidence:1},{market:2}),
 option('推迟维护，保留财政空间','稳定 -2；发展项目可能受损。',{stability:-2,capitalStock:-.3},{market:1,welfare:-1})],'maintenance')}
regionalEvent=function(){let available=unfinishedRegions();if(!available.length)return localReviewEvent();let z=pick(available),members=pstate().members.filter(m=>m.regionId===z.id),m=pick(members);let remaining=1-z.demandProgress;return {type:'regional',region:z.id,member:m.id,faction:m.faction,title:z.name+'的新一轮地方诉求',text:`${m.role}${m.name}（${TRAITS[m.trait].name}）要求“${demandText(z)}”。当前完成 ${fmt(z.demandProgress*100,0)}%。完成后，本轮不再提出同一诉求。`,options:[
 {...option('落实剩余项目','支出 '+fmt(.8*remaining,2)+'% GDP；支持 +1；个人关系 +8；派系关系 +5；完成剩余诉求。',{cost:.8*remaining,approval:1},{welfare:2,nation:1},[z.sector]),member:8,faction:5,progress:remaining},
 {...option('分期实施并公开审查','支出 0.25% GDP；司法独立 +1；个人关系 +3；推进 40% 地方诉求。',{cost:.25,judicial:1},{law:2},[z.sector]),member:3,progress:Math.min(.4,remaining)},
 {...option('拒绝追加资源','支持 -2；稳定 -1；个人关系 -8；派系关系 -5。',{approval:-2,stability:-1},{market:2,welfare:-1}),member:-8,faction:-5}
 ]}}
const campaignBefore12=campaignEvent;campaignEvent=function(){let available=unfinishedRegions();if(!available.length){let e=campaignBefore12();e.type='campaign-complete';e.text='所有地区本轮诉求已完成，但选民仍关注债务、民生与内阁稳定。';e.options[0]=option('公布履约账目并接受质询','支持 +1；司法独立 +1；信心 -1。',{approval:1,judicial:1,confidence:-1},{law:2});return e}let e=campaignBefore12(),z=available.reduce((a,b)=>regionalEstimate(a).share<regionalEstimate(b).share?a:b);e.region=z.id;e.text=`选举临近，${z.name}仍要求“${demandText(z)}”。该地区本轮完成 ${fmt(z.demandProgress*100,0)}%，全国预测 ${fmt(electionForecast().total)}%。`;e.options[0]=option('兑现该地区剩余诉求','支出 0.9% GDP；支持 +1；完成该地区本轮剩余诉求。',{cost:.9,approval:1},{welfare:2,populism:2},[z.sector]);e.options[0].progress=1-z.demandProgress;return e};
function refreshLocalDemands(){let g=v3();if(g.localRefreshAt===s.q)return;g.localHistory.push({q:s.q,regions:g.regions.map(z=>({id:z.id,name:z.name,demand:demandText(z),completed:z.demandProgress}))});g.localRefreshAt=s.q;g.localCycle++;for(let z of g.regions){z.demandVariant=(z.demandVariant+1+Math.floor(rand()*2))%3;z.demandProgress=0}log('地方诉求换届','新任期，地方团体提出新的诉求。新一轮持续 12 季度；过去的履约仍计入本届选情与执政档案。')}
const queueBefore12=queueQuarterEvents;queueQuarterEvents=function(){queueBefore12();if(s.q%12===0)pushEvent({type:'local-refresh',title:'新任期，地方团体提出新的诉求',text:'地方团体每 12 季度更新一次工作议程，与国家的 24 季度选举任期分开。本季结算完成后公布新诉求；已经完成的项目记入履约档案，仍影响本届选情。',options:[option('确认地方换届并公布新诉求','保留历史履约成绩；新一轮地方诉求进度从零开始。')]})};
const finishBefore12=finishQuarter;finishQuarter=function(){let wasOpen=v3().quarterOpen;finishBefore12();if(wasOpen&&!v3().quarterOpen&&!s.ended&&s.q%12===0)refreshLocalDemands()};
// A previously queued request may become obsolete after another choice or a reform.
function replaceCompletedRequest(){let p=pstate(),e=p.current;if(e&&['regional','election'].includes(e.type)&&e.region!==undefined&&v3().regions[e.region].demandProgress>=1)p.current=e.type==='regional'?regionalEvent():campaignEvent()}
const showBefore12=showPoliticalEvent;showPoliticalEvent=function(){replaceCompletedRequest();showBefore12()};
const resolveBefore12=resolvePolitical;resolvePolitical=function(i){let old=pstate().current;replaceCompletedRequest();if(old!==pstate().current){showPoliticalEvent();return}resolveBefore12(i)};
function governingPressure(){let g=v3(),age=s.q-g.localRefreshAt,unmet=g.regions.reduce((a,z)=>a+(s.situations?.active.some(x=>x.kind==='disaster'&&x.region===z.id)?0:(1-z.demandProgress)*z.weight/100),0);let local=age>=6?unmet*2.2:0;let debtRatio=s.debt/s.gdp*100,stress=clamp((debtRatio-70)*.035,0,3)+clamp((-balance()-4)*.25,0,2);let approval=.6+local*.5+stress*.2,stability=.2+local*.4+stress*.35;mod({approval:-approval,stability:-stability,confidence:-stress*.7});g.pressure={q:s.q,approval,stability,local,stress};log('执政压力报告',`支持 -${fmt(approval)}、稳定 -${fmt(stability)}。基础执政损耗、地方未履约压力 ${fmt(local)}、财政压力 ${fmt(stress)}。提高地区履约、控制赤字与负债可以减轻压力；非玩家派系议程倾向每季下降 2 点。`)}
const maintenanceBefore12=politicalMaintenance;politicalMaintenance=function(){maintenanceBefore12();if(!s.ended){governingPressure();checkPoliticalEnd()}};
const politicsBefore12=politics;politics=function(){let html=politicsBefore12();let g=v3();for(let z of g.regions){html=html.replace(PROFILES[z.id].need,demandText(z));}return `<div class="card" style="margin-bottom:20px"><h3>地方诉求 · 第 ${g.localCycle+1} 轮</h3><p>每 12 季度轮换，距下次换届 ${12-s.q%12} 季度。下方旧有的“本届兑现”用于 24 季度选举，本面板显示当前地方工作进度。第 6 季度起，未完成诉求会增加支持和稳定损耗。</p>${g.regions.map(z=>`<div class="row"><span>${z.name} · ${demandText(z)}</span><b>${z.demandProgress>=1?'✓ 本轮已完成':fmt(z.demandProgress*100,0)+'%'}</b></div>`).join('')}<details><summary>历轮地方履约档案</summary>${g.localHistory.map(h=>`<p>第 ${h.q} 季度：${h.regions.map(z=>`${z.name} ${fmt(z.completed*100,0)}%`).join(' · ')}</p>`).join('')||'<p>首轮尚未结束。</p>'}</details></div>`+html};
const assemblyBefore12=assembly;assembly=function(){let r=regime(),intro=r.id==='party'?`执政党：${pstate().rulingParty}。玩家领导主流派；主流派、新锐派、改革派合计 82 席，另外为民主党派 16 席、无党籍团体 2 席。党内分歧仍需协商。`:r.body==='枢密院'?'枢密院按身份、信仰与利益集团组织，不采用政党竞争结构。':`玩家所属政治力量：${pstate().rulingParty}。`;return `<div class="card" style="margin-bottom:20px"><p>${intro}</p></div>`+assemblyBefore12()};
const overviewBefore12=overview;overview=function(){let p=v3().pressure;return overviewBefore12()+`<div class="card" style="margin-top:20px"><h3>1.0.4 · 执政挑战</h3><p>每季基础支持损耗 0.6、稳定损耗 0.2；地方诉求进入第 6 季度后，未履约追加压力。债务率超过 70% 或赤字超过 4% GDP 会增加财政压力。非玩家派系议程倾向每季下降 2 点，内阁日常收益已下调。</p>${p?`<p>本季压力：支持 −${fmt(p.approval)} · 稳定 −${fmt(p.stability)} · 地方压力 ${fmt(p.local)} · 财政压力 ${fmt(p.stress)}。</p>`:''}</div>`};
const helpBefore12=showHelp;showHelp=function(){helpBefore12();$('modal').innerHTML=$('modal').innerHTML.replace('</h2>','</h2><p><b>1.0.4 更新：</b>一党独大制以执政党内派别为主；世俗枢密院采用派系，神权枢密院采用宗教与社会群体。地方每 12 季度更新诉求，已完成地区不再重复提出同一要求。支持、稳定与派系关系会因执政损耗而下降，地方失信与高负债将加重压力。</p>')};
// Economic and international choices no longer grant large simultaneous free benefits.
function balanceEvent12(e){for(let o of e.options){let v=o.values||{};for(let key of ['approval','stability','confidence'])if(v[key]>0)v[key]=Math.min(v[key],key==='confidence'?2:1);if(v.cost>0)v.cost=+(v.cost*1.35).toFixed(3);o.detail=impactText(v)+'。';}return e}
const economyEventBefore12=economicEvent;economicEvent=function(){return balanceEvent12(economyEventBefore12())};
const extraBefore12=extraEvent;extraEvent=function(){return balanceEvent12(extraBefore12())};

