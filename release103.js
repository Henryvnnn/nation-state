/* 1.0.3 — cabinet programmes, research capacity, proportional voting and coalitions.
 * Loaded last. Monetary costs are percentage points of current GDP.
 */
const FACTION_PROFILES103={
 conservative:{name:'保守建制',traits:[0,2,4],budget:{security:2,infrastructure:1,welfare:-.5}},
 market:{name:'自由市场',traits:[2,8,1],budget:{infrastructure:1,education:.5,welfare:-1,security:-.5}},
 social:{name:'社会民主与民生',traits:[5,3,7],budget:{welfare:2,health:1.5,education:1,security:-.5}},
 local:{name:'地方自治与基层服务',traits:[0,3,6],budget:{infrastructure:2,health:1,welfare:.5}},
 green:{name:'绿色与公共教育',traits:[1,5,3],budget:{education:1.5,health:1,security:-1,infrastructure:-.5}},
 law:{name:'法治与公民权利',traits:[1,0,8],budget:{education:1,health:.5,security:-1}},
 state:{name:'国家统制',traits:[6,4,7],budget:{infrastructure:2,security:1,welfare:1}},
 reform:{name:'改革与技术治理',traits:[2,7,1],budget:{education:2,infrastructure:1,health:.5}},
 religious:{name:'传统宗教与秩序',traits:[4,0,3],budget:{security:2,welfare:1,education:-.5}}
};
function rules103(){return s.rules103}
function coalitionRegime(){return regime().democratic||regime().id==='symbolic'}
function factionProfile(f){
 let key;
 if(regime().id==='party')key=['state','reform','social','law','local'][f.id];
 else if(/教法|保守教|传统|最高教|圣地|宗教长老|教会/.test(f.name))key='religious';
 else if(/法务|公民改革|公民自由|世俗改革|民主改革|为了民主/.test(f.name))key='law';
 else if(/绿色|生态|未来|公民进步/.test(f.name))key='green';
 else if(/社会|劳动|工党|民生/.test(f.name))key='social';
 else if(/改革|开明|新兴|新锐/.test(f.name)&&regime().body==='枢密院')key='reform';
 else if(/自由|市场|工商|商人|商会|世俗团体/.test(f.name))key='market';
 else if(/自治|地方|乡村|农民|州权|地区|边疆/.test(f.name))key='local';
 else if(/集权|军方|安全|亲信/.test(f.name))key='state';
 else key=['conservative','market','social','local','law'][f.id];
 return FACTION_PROFILES103[key];
}
function cabinetEligible(c){return !!c&&(!coalitionRegime()||(rules103()?.coalition||[playerFactionId107()]).includes(c.faction))}
function cabinetSlots103(r=regime()){return [...(r.head?['head']:[]),...PORTFOLIOS.filter(x=>r.id!=='federal'||x[0]!=='deputy').map(x=>x[0])]}
function ensureCandidates103(){let p=pstate();while(p.candidates.length<75){let id=p.candidates.length;p.candidates.push({id,name:personName(),faction:id%5,trait:pick(factionProfile(p.factions[id%5]).traits),skill:45+Math.floor(rand()*46),loyalty:45+Math.floor(rand()*41),achievements:0,tenure:0})}}
function alignPeople103(){
 let p=pstate();
 // Fifteen candidates per faction cover the expanded cabinet and replacement pool.
 ensureCandidates103();
 for(let c of [...p.candidates,...p.members])c.trait=pick(factionProfile(p.factions[c.faction]).traits);
 let replaced=[];
 for(let k of cabinetSlots103()){
  let item=p.cabinet[k];if(!item||cabinetEligible(p.candidates[item.candidate]))continue;
  let c=p.candidates.find(c=>cabinetEligible(c)&&!Object.values(p.cabinet).some(i=>i?.candidate===c.id));
  if(c){replaced.push(office(k));p.cabinet[k]={candidate:c.id,task:item.task};c.tenure=0}
 }
 return replaced;
}
function migrate103(){
 if(rules103())return;
 if(!creatingWorld)try{localStorage.setItem(KEY+'-pre-103',JSON.stringify(s))}catch(_){}
 // Old queued event text is also part of the visible game, not just new templates.
 function normalizeText(obj){for(let key of Object.keys(obj)){let value=obj[key];if(typeof value==='string')obj[key]=value.replace(/≥/g,'＞').replace(/≤/g,'＜');else if(value&&typeof value==='object')normalizeText(value)}}
 normalizeText(s);
 s.rules103={version:1,research:{level:0,progress:0,educationModernized:false,lastQ:s.q},coalition:[playerFactionId107()],proposals:{},lastAgendaQ:s.q,lastProposalQ:s.q};
 let replaced=alignPeople103();
 pstate().factions.forEach(f=>f.agendaDecay=0);
 for(let k of cabinetSlots103())rules103().proposals[k]={progress:0,completed:false,spent:0,actions:[]};
 // Release migration clears obsolete relief cooldowns, but preserves paid works and their delivery dates.
 for(let x of sits()?.active||[])if(x.kind==='strike')delete x.cooldowns.relief;
 log('1.0.3 规则已启用','科研从本季度开始积累；内阁提案、比例议席与新组阁规则已启用。'+(!creatingWorld&&replaced.length?'旧存档中不符合组阁规则的 '+replaced.length+' 个职位已免费由执政党候选人接任，历史记录保留。':''));
}
// Apply personnel rules before an opening scandal chooses its responsible minister.
initPolitics=function(id=selectedRegime){initPreSituations(id);migrate103();initSituations()};

function politicalCapacity(){return 3+Math.min(3,rules103()?.research.level||0)}
function researchQuarter103(){
 let r=rules103().research;if(r.lastQ===s.q)return;r.lastQ=s.q;
 let gain=s.policies.education*(2+(r.educationModernized?1:0));r.progress+=gain;
 let levels=Math.floor((r.progress+1e-9)/100);if(levels){r.level+=levels;r.progress=Math.max(0,r.progress-levels*100);log('科研水平提升',`科研等级 ${r.level}；${actionResearchStatus()}`)}
}
const archiveBefore103=archive;
archive=function(){let r=rules103().research,m=2+(r.educationModernized?1:0);return `<div class="card research-card"><span class="tag">科研与行政能力</span><h2>科研等级 ${r.level}</h2><div class="bar"><i style="width:${r.progress}%"></i></div><p>下一级进度 ${fmt(r.progress,2)}% / 100% · 每季增加 ${fmt(s.policies.education*m,2)} 个百分点。</p><p>教育与科研 ${fmt(s.policies.education)}% × ${m}；教育现代化${r.educationModernized?'已完成，永久加速 +1':'尚未完成'}。</p><div class="row"><span>本季政治行动点总数</span><b>${politicalCapacity()}${actionMode()==='planned'?'':' / 6'}</b></div><div class="row"><span>本季度剩余行动点</span><b>${pstate().ap}</b></div><p>本局采用${ACTION_POINT_MODES[actionMode()]}。${actionModeDescription()}每积累100%科研提升一级，保留溢出进度；科研在新季度发放行动点前结算。升级前的季度不追溯计算。</p></div>`+archiveBefore103()};

// Budget preference coefficients: +1 budget point lowers the full-support requirement by this value.
function budgetRequirement(f){
 let b=pstate().bill;if(!b||b.kind!=='budget')return 60;
 let d=k=>b.policies[k]-s.policies[k];
 let requirement=60+d('income')+d('vat')/1.5+d('corporate')/2;
 for(let [k,w]of Object.entries(factionProfile(f).budget))requirement-=d(k)*w;
 return requirement;
}
const supportBase103=support;
support=function(f){return clamp(supportBase103(f)-(f.agendaDecay||0),0,100)};
function votingTendency(f){return support(f)-(budgetRequirement(f)-60)}
function factionSeatRatio(f){return clamp((votingTendency(f)-50)/10,0,1)}
votes=function(){return Math.round(pstate().factions.reduce((sum,f)=>sum+f.seats*factionSeatRatio(f),0)*1000000)/1000000};
function billStabilityPenalty(){return pstate().factions.reduce((sum,f)=>sum+Math.max(0,50-votingTendency(f))*.1,0)}
function decayAgendas103(){
 let g=rules103();if(g.lastAgendaQ===s.q)return;g.lastAgendaQ=s.q;
 for(let f of pstate().factions)if(f.id!==playerFactionId107())f.agendaDecay=Math.min(supportBase103(f),(f.agendaDecay||0)+2);
}
function preferenceText103(f){return Object.entries(factionProfile(f).budget).map(([k,w])=>`${policyMeta[k][0]}每提高 1%，门槛${w>0?' −':' +'}${Math.abs(w)}`).join('；')}
function factionVotingRows(){let p=pstate();return p.factions.map(f=>`<div class="faction-row"><div><b style="color:${factionColor107(f.id)}">${esc(f.name)}${rules103().coalition.includes(f.id)&&coalitionRegime()?' · 执政联盟':''}</b><small>${f.seats} 席 · 团体关系 ${fmt(f.relation,1)} · 议程倾向 ${fmt(support(f),1)}</small><small>全票支持门槛 ${fmt(budgetRequirement(f),2)} · 折算倾向 ${fmt(votingTendency(f),2)} · 支持席位 ${fmt(f.seats*factionSeatRatio(f),2)}</small><small>${factionProfile(f).name} · ${preferenceText103(f)}</small></div><span class="badge">${fmt(factionSeatRatio(f)*100,1)}% 支持</span><button onclick="factionTalk(${f.id})">协商</button></div>`).join('')+`<p>折算倾向 = 议程倾向 −（本案全票门槛 − 60）。折算为 50 时无席位支持，51 时支持 10%，60 时全票支持；席位按比例权重计算，不按整团投票。低于 50 的每一点，在议案通过后降低稳定度 0.1。</p><p>本案预计额外稳定损失：${fmt(billStabilityPenalty(),2)}。仅在通过时兑现，另计原有通过收益。非玩家派系每季倾向 −2；协商可抵消累计损耗。执政党也受预算偏好影响。</p><details><summary>预算门槛的计算</summary><p>以现行预算为基准：个人所得税每提高 1%、消费税每提高 1.5%、企业所得税每提高 2%，所有派系全票支持门槛各 +1；降税相反。公共支出按各派系偏好加减门槛，所有变化叠加。偏好为正表示支持增加该项投入；社会民主派福利预算 +1% 时门槛 −2。</p></details>`}
const voteBefore103=voteBill;
voteBill=function(){let p=pstate(),count=p.passed.length,penalty=billStabilityPenalty();voteBefore103();if(p.passed.length>count&&penalty>0){mod({stability:-penalty});log('议案通过后的反对压力',`低倾向派系造成额外稳定损失 ${fmt(penalty,2)}。`);checkPoliticalEnd();if(s.ended)beginSettlement(s.ended);record();save();render()}};
const dealBefore103=deal;
deal=function(id,kind){let p=pstate(),before=p.ap;dealBefore103(id,kind);if(p.ap<before){let f=p.factions[id];f.agendaDecay=Math.max(0,(f.agendaDecay||0)-8);pSave()}};
const factionTalkBefore103=factionTalk;
factionTalk=function(id){factionTalkBefore103(id);$('modal').innerHTML=$('modal').innerHTML.replace('</h2>','</h2><p>成功协商还会抵消最多 8 点累计季度倾向损耗。'+(coalitionRegime()?'组建联合政府需会见该党团总召，并将团体关系提高至 70。':'')+'</p>')};

const meetBefore103=meetMember;
meetMember=function(id){meetBefore103(id);let m=pstate().members[id];if(!m||m.id<4||m.faction===playerFactionId107()||!coalitionRegime())return;let f=pstate().factions[m.faction],joined=rules103().coalition.includes(f.id);$('modal').innerHTML+=`<div class="coalition-invite"><h3>联合政府协商</h3><p>团体关系 ${fmt(f.relation,1)} / 70。达成联合执政后，该党人物进入全部内阁职位的候选池；加入不免除每季倾向损耗。</p><button class="primary" onclick="inviteCoalition(${id})" ${joined||s.ended||f.relation<70||pstate().ap<1||m.last===s.q?'disabled':''}>${joined?'已加入联合政府':'邀请组建联合政府 · 1 行动点'}</button></div>`};
function inviteCoalition(id){let p=pstate(),m=p.members[id];if(!coalitionRegime()||!m||m.id<4||m.faction===playerFactionId107()||rules103().coalition.includes(m.faction)||p.factions[m.faction].relation<70||m.last===s.q||!spendAction('member'+id))return;m.last=s.q;rules103().coalition.push(m.faction);noteDecision('邀请'+p.factions[m.faction].name+'组建联合政府',{law:2,authority:-2,elite:1});log('联合政府成立',p.factions[m.faction].name+'的人物现可出任内阁。');$('modal').close();pSave()}
const cabinetBefore103=cabinet;
cabinet=function(){return `<div class="card" style="margin-bottom:18px"><b>组阁资格</b><p>${coalitionRegime()?'可任命：'+rules103().coalition.map(id=>esc(pstate().factions[id].name)).join('、')+'。其他党派须先由总召接受联合政府邀请。':'所有派系的人物均可任命，不设联合政府邀请。'}未完成的部门提案使主管官员每季忠诚 −0.5；更换官员保留部门进度，完成奖励只发放一次。</p></div>`+cabinetBefore103()};
const previewBefore103=appointPreview,appointBefore103=appointOfficial;
appointPreview=function(k,id){if(!cabinetSlots103().includes(k)||!cabinetEligible(pstate().candidates[id])){toast('该人物不在当前组阁范围内');return}previewBefore103(k,id)};
appointOfficial=function(k,id){if(!cabinetSlots103().includes(k)||!cabinetEligible(pstate().candidates[id])){toast('该人物不在当前组阁范围内');return}appointBefore103(k,id)};
function replacementDialog(k){if(!cabinetSlots103().includes(k))return;let p=pstate(),candidates=p.candidates.filter(c=>cabinetEligible(c)&&!Object.values(p.cabinet).some(x=>x?.candidate===c.id));modal(`<span class="tag">内阁人事</span><h2>重新任命${office(k)}</h2><p>选择候选人后查看撤换后果与新任倾向；确认任命消耗 1 行动点。</p><div class="choices">${candidates.map(c=>`<button onclick="appointPreview('${k}',${c.id})">${c.name} · ${TRAITS[c.trait].name}<small>${esc(p.factions[c.faction].name)} · 能力 ${c.skill} · 忠诚 ${fmt(c.loyalty,0)}</small></button>`).join('')}</div><button onclick="$('modal').close()">返回</button>`)}

// Each portfolio owns a persistent programme. Personnel changes cannot reset costs or farm rewards.
const MINISTER_PROGRAMMES103={
 head:{name:'政府行政现代化',fit:[0,2,6],axes:{authority:1,law:1},tags:['technology'],reward:{confidence:2,stability:2},options:[['建设跨部门数据平台',1.1,32,3,{education:.025,infrastructure:.02}],['整顿政府采购流程',.55,23,2,{education:.02,security:.015}],['扩充基层政务窗口',.4,16,1,{infrastructure:.025,welfare:.015}]]},
 deputy:{name:'跨部门协调改革',fit:[0,2,1],axes:{law:2},tags:['technology'],reward:{confidence:2,stability:1},options:[['建设统一政务系统',.85,30,3,{education:.025,infrastructure:.02}],['开展行政流程审计',.4,22,2,{education:.025}],['建立地方联络处',.3,15,1,{infrastructure:.025}]]},
 foreign:{name:'拓展国际合作网络',fit:[0,8,2],axes:{market:2,law:1},tags:['trade'],reward:{confidence:4,growth:.3},options:[['建设贸易联络中心',.9,32,3,{infrastructure:.025,education:.015}],['组织多边贸易谈判',.5,23,2,{education:.03}],['开展外交人才培训',.3,16,1,{education:.04}]]},
 defence:{name:'防务后勤现代化',fit:[4,6,2],axes:{military:3,nation:1},tags:['security'],reward:{stability:3,capitalStock:1},options:[['更新国防后勤设施',1.2,34,3,{security:.03,infrastructure:.025}],['改善边境运输网络',.75,24,2,{infrastructure:.035}],['组织灾害应急演练',.4,16,1,{security:.025,health:.015}]]},
 justice:{name:'司法服务与程序改革',fit:[1,5,0],axes:{law:3,authority:-1},tags:['welfare'],reward:{judicial:5,confidence:1},options:[['建设公开司法信息平台',.85,31,3,{education:.03,infrastructure:.02}],['增设基层法律援助站',.55,23,2,{welfare:.025,infrastructure:.015}],['培训专业司法人员',.35,16,1,{education:.04}]]},
 interior:{name:'地方行政服务提升',fit:[0,6,3],axes:{welfare:2,authority:1},tags:['security'],reward:{stability:3,approval:2},options:[['改造综合公共服务中心',.95,32,3,{infrastructure:.03,welfare:.015}],['更新居民服务登记系统',.6,24,2,{education:.025,security:.02}],['增设乡镇便民服务站',.35,16,1,{infrastructure:.025,welfare:.015}]]},
 education:{name:'教育现代化',fit:[5,3,7,1],axes:{welfare:3,law:1},tags:['technology'],reward:{human:4,unemployment:-.3,approval:2},options:[['建设现代化师范设施',1.05,32,3,{education:.03,infrastructure:.02}],['翻新城市教育设施',.75,24,2,{education:.025,infrastructure:.025}],['新增乡村基本教育机构',.45,16,1,{education:.025,infrastructure:.02,welfare:.01}]]},
 health:{name:'普惠医疗网络',fit:[3,5,7],axes:{welfare:3},tags:['welfare'],reward:{approval:4,unemployment:-.5},options:[['建设区域公共医院',1.2,34,3,{health:.025,infrastructure:.025}],['更新城市基层诊所',.7,24,2,{health:.03,infrastructure:.02}],['培训乡村医疗人员',.4,16,1,{health:.025,education:.025}]]},
 culture:{name:'公共文化振兴',fit:[3,5,0],axes:{welfare:2,nation:1},tags:['green'],reward:{approval:4,unemployment:-.2},options:[['修建国家公共文化中心',.9,32,3,{infrastructure:.025,education:.02}],['改造地方图书馆',.55,23,2,{education:.03,infrastructure:.02}],['支持社区文化团体',.3,16,1,{welfare:.025,education:.015}]]},
 labour:{name:'就业与劳动保障计划',fit:[0,1,3,5,7],axes:{welfare:3,law:2},tags:['industry','welfare'],reward:{unemployment:-.7,approval:3,stability:2},options:[['建设公共就业服务中心',.9,32,3,{welfare:.025,education:.02,infrastructure:.02}],['开展职业转岗培训',.55,24,2,{education:.035,welfare:.015}],['完善劳动争议调解网络',.35,16,1,{security:.02,welfare:.02}]]},
 environment:{name:'生态修复与清洁发展',fit:[1,5,7],axes:{green:4},tags:['green'],reward:{approval:2,capitalStock:2,confidence:1},options:[['建设流域污染治理设施',1.15,34,3,{infrastructure:.03,education:.02}],['更新城市垃圾处理系统',.7,24,2,{infrastructure:.03,health:.015}],['恢复乡村湿地与林地',.4,16,1,{education:.025,welfare:.015}]]}
};
function programmeQuote(k,index){let def=MINISTER_PROGRAMMES103[k],a=def?.options[index],item=pstate().cabinet[k];if(!a||!item)return null;let c=pstate().candidates[item.candidate],discount=Math.min(.55,Object.entries(a[4]).reduce((sum,[key,w])=>sum+s.policies[key]*w,0)),skill=.75+c.skill/200,fit=def.fit.includes(c.trait)?1.25:1;return {a,c,discount,cost:a[1]*(1-discount),skill,fit,progress:a[2]*skill*fit}}
// Completed legacy health projects received -0.3; new completions retain their actual award.
function programmeReward103(k){let pr=rules103().proposals[k],reward=MINISTER_PROGRAMMES103[k].reward;return pr?.completed?(pr.rewardApplied||(k==='health'?{...reward,unemployment:-.3}:reward)):reward}
function programmePanel(k){let pr=rules103().proposals[k],def=MINISTER_PROGRAMMES103[k];if(!pr||!pstate().cabinet[k])return '';return `<section class="minister-programme"><span class="tag">部长 / 大臣提案${pr.completed?' · 已完成':' · 待推进'}</span><h3>${def.name}</h3><div class="bar"><i style="width:${pr.progress}%"></i></div><p>进度 ${fmt(pr.progress,1)}% / 100% · 累计支出 ${fmt(pr.spent,2)} 十亿元。</p>${pr.completed?'<p>提案已完成，停止每季忠诚损失。</p>':`<p>未完成期间，现任主管每季度忠诚 −0.5。每项措施每季度一次，各消耗 1 行动点。</p><div class="choices">${def.options.map((a,i)=>{let q=programmeQuote(k,i);return `<button onclick="advanceProgramme('${k}',${i})" ${s.ended||pstate().ap<1||pstate().lastAction['programme:'+k+':'+i]===s.q?'disabled':''}>${a[0]}<small>支出 ${fmt(q.cost,3)}% GDP（基础 ${a[1]}，投资优惠 ${fmt(q.discount*100,1)}%）；进度 +${fmt(q.progress,1)}；忠诚 +${a[3]}。</small><small>基础进度 ${a[2]} × 能力 ${fmt(q.skill,3)} × 倾向契合 ${q.fit}。</small></button>`}).join('')}</div>`}<p>${pr.completed?'已获效果':'完成效果'}：${impactText(programmeReward103(k))}。${k==='education'?'科研增长系数永久从 2 提高至 3。':''}</p><details><summary>投资如何降低费用</summary><p>实际费用 = 基础费用 ×（1 − 投资折扣），折扣上限 55%；只采用已通过预算。</p>${def.options.map(a=>`<p>${a[0]}：${Object.entries(a[4]).map(([key,w])=>`${policyMeta[key][0]}每投入 1% GDP，费用降低 ${fmt(w*100,1)}%`).join('；')}。</p>`).join('')}</details></section>`}
const officialBefore103=officialPanel;
officialPanel=function(k){return officialBefore103(k)+(pstate().cabinet[k]?`<button style="margin-top:10px" onclick="replacementDialog('${k}')" ${s.ended?'disabled':''}>重新任命${office(k)}</button>`:'')+programmePanel(k)};
function advanceProgramme(k,index){
 let pr=rules103().proposals[k],def=MINISTER_PROGRAMMES103[k],q=programmeQuote(k,index);if(!pr||pr.completed||!q||!spendAction('programme:'+k+':'+index))return;
 mod({cost:q.cost});pr.spent+=s.gdp*q.cost/100;pr.progress=Math.min(100,pr.progress+q.progress);q.c.loyalty=clamp(q.c.loyalty+q.a[3],0,100);pr.actions.push({q:s.q,index,minister:q.c.id,cost:q.cost,progress:q.progress});
 noteDecision(`${office(k)}提案：${q.a[0]}`,def.axes,def.tags,null,.2);
 if(pr.progress>=100){pr.completed=true;pr.completedAt=s.q;pr.rewardApplied={...def.reward};q.c.achievements+=5;mod(pr.rewardApplied);if(k==='education')rules103().research.educationModernized=true;log('部长提案完成',def.name+'已完成。'+impactText(def.reward));pstate().reports.unshift({q:s.q,title:office(k)+'：'+def.name+'完成',text:'停止提案忠诚损耗；部门进度和成果在更换主管后保留。'+impactText(def.reward)})}
 record();save();render();
}
function programmeQuarter103(){let g=rules103();if(g.lastProposalQ===s.q)return;g.lastProposalQ=s.q;for(let [k,pr]of Object.entries(g.proposals)){let item=pstate().cabinet[k];if(item&&!pr.completed){let c=pstate().candidates[item.candidate];c.loyalty=clamp(c.loyalty-.5,0,100)}}}
const maintenance103=politicalMaintenance;
politicalMaintenance=function(){researchQuarter103();programmeQuarter103();maintenance103();decayAgendas103()};
const transitionBefore103=transitionDemocracy;
transitionDemocracy=function(x){transitionBefore103(x);rules103().coalition=[playerFactionId107()];alignPeople103();for(let k of cabinetSlots103())if(!rules103().proposals[k])rules103().proposals[k]={progress:0,completed:false,spent:0,actions:[]};log('新宪法下的组阁规则','内阁改为执政党组成；其他党派须经联合政府协商方可入阁。')};
const helpBefore103=showHelp;
showHelp=function(){helpBefore103();$('modal').innerHTML=$('modal').innerHTML.replace('</h2>','</h2><p><b>内阁、科研与立法：</b>部长提案每季忠诚 −0.5，完成后停止；投资减少提案费用，能力和倾向提高进度。国家档案可查看科研进度与每季行动额度。民主及象征性民主政体仅执政党可入阁，其他党团关系达到 70 后可由总召加入联合政府。表决采用比例席位，并显示预算门槛、折算倾向与通过后的额外稳定损失。</p>')};
const validBefore103=validSave;
validSave=function(v){
 if(!validBefore103(v))return false;let g=v.rules103;if(!g)return true;let r=g.research;
 if(g.version!==1||!r||!Number.isInteger(r.level)||r.level<0||!Number.isFinite(r.progress)||r.progress<0||r.progress>=100||typeof r.educationModernized!=='boolean'||!Number.isInteger(r.lastQ)||!Number.isInteger(g.lastAgendaQ)||!Number.isInteger(g.lastProposalQ))return false;
 if(!Array.isArray(g.coalition)||!g.coalition.includes(playerFactionId107(v.political))||new Set(g.coalition).size!==g.coalition.length||g.coalition.some(id=>!Number.isInteger(id)||!v.political.factions[id]))return false;
 if(!g.proposals||typeof g.proposals!=='object'||v.political.factions.some(f=>!Number.isFinite(f.agendaDecay)||f.agendaDecay<0||f.agendaDecay>100))return false;
 let slots=cabinetSlots103(REGIMES.find(r=>r.id===v.political.regime));
 if(slots.some(k=>!g.proposals[k]&&(k!=='labour'||v.release107)))return false;
 return Object.entries(g.proposals).every(([k,p])=>MINISTER_PROGRAMMES103[k]&&p&&Number.isFinite(p.progress)&&p.progress>=0&&p.progress<=100&&typeof p.completed==='boolean'&&p.completed===(p.progress===100)&&Number.isFinite(p.spent)&&p.spent>=0&&Array.isArray(p.actions));
};

