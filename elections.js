/* Electoral mandates, legislative renewal and policy-aware campaigns. */
const ELECTORAL_REGION_AXES={
 industry:{welfare:1,market:-.6,nation:.5},agriculture:{welfare:.8,nation:.5,elite:.2},
 technology:{law:1,market:.5,welfare:.4,authority:-.6},trade:{market:1,law:.5,nation:-.4},
 welfare:{welfare:1,law:.3},green:{green:1,law:.6,authority:-.4},
 security:{nation:1,military:.8,authority:.5},capital:{welfare:.7,law:.8,authority:-.3}
};
function electoral(){return s?.electoral}
function electoralEligible(){return regime().democratic||['symbolic','theorepublic'].includes(regime().id)}
function electoralTermStart(){return Math.max(0,Math.floor(Math.max(0,s.q-1)/24)*24,electoral()?.completed.includes(s.q)?s.q:0)}
function electoralWeights(){return regime().democratic?[.6,.2,.2]:[.8,.1,.1]}
function initializeElectoral(){
 if(electoral())return;
 const completed=v3().elections.map(e=>e.q),last=Math.max(0,...completed),next=v3().decisions.findIndex(d=>d.q>last);
 s.electoral={version:1,installedQ:s.q,campaign:[],topics:[],completed,decisionStart:completed.length?(next<0?v3().decisions.length:next):0,senateCarry:null};
}
const initBeforeElectoral=initPolitics;
initPolitics=function(...args){initBeforeElectoral(...args);initializeElectoral()};
function electoralProfileKey(f){return Object.keys(FACTION_PROFILES103).find(k=>FACTION_PROFILES103[k]===factionProfile(f))||'conservative'}
function electoralPolicyEvidence(){
 const start=electoralTermStart();return v3().decisions.slice(electoral()?.decisionStart||0).filter(d=>d.q>=start&&d.q<=s.q).map(d=>({decision:d,evidence:d.assessment107||{kind:legacyDecisionKind107(d),axes:d.axes,weight:1}})).filter(x=>['budget','reform','amendment','interpretation','programme'].includes(x.evidence.kind)&&x.evidence.weight>0);
}
function electoralAlignment(axes,target){
 let sum=0,mass=0;for(const [key,weight]of Object.entries(target)){if(!Number.isFinite(axes?.[key]))continue;sum+=clamp(axes[key],-4,4)*weight;mass+=Math.abs(weight)}
 return mass?clamp(sum/(4*mass),-1,1):0;
}
function electoralPolicyScore(z,evidence=electoralPolicyEvidence()){
 if(!evidence.length)return 50;
 let sum=0,mass=0;for(const {decision:d,evidence:e}of evidence){if(d.region!==null&&d.region!==undefined&&d.region!==z.id)continue;
  const weight=Math.min(12,e.weight),match=electoralAlignment(e.axes,ELECTORAL_REGION_AXES[z.sector]||ELECTORAL_REGION_AXES.capital),tag=regionMatchesTags107(z,d.tags||[])?8:0;
  sum+=(50+match*35+tag)*weight;mass+=weight;
 }return clamp(mass?sum/mass:50,0,100);
}
function electoralCampaignScore(z){
 const start=electoralTermStart(),items=(electoral()?.campaign||[]).filter(x=>(x.q>start||start===0)&&x.q<=s.q&&x.regime===regime().id);
 return clamp(50+items.reduce((sum,x)=>sum+x.momentum*(x.tags.length?(regionMatchesTags107(z,x.tags)?1:.35):1),0),0,100);
}
function electoralCoalition(){return coalitionRegime()?[...new Set([playerFactionId107(),...rules103().coalition])]:[playerFactionId107()]}
function electoralPartyTarget(f){
 const traits=factionProfile(f).traits,axes={};for(const trait of traits)for(const [key,value]of Object.entries(TRAIT_AXES[trait]||{}))axes[key]=(axes[key]||0)+value/traits.length;return axes;
}
function electoralPartyWeight(f,z,evidence){
 const key=electoralProfileKey(f),affinity=REGIONAL_AFFINITIES107[key]?.[z.id]||0,target=electoralPartyTarget(f);
 let sum=0,mass=0;for(const {evidence:e}of evidence){sum+=electoralAlignment(e.axes,target)*e.weight;mass+=e.weight}
 const policy=mass?sum/mass:0;
 const officials=Object.values(pstate().cabinet).filter(Boolean).map(x=>pstate().candidates[x.candidate]).filter(c=>c.faction===f.id),merit=officials.length?officials.reduce((n,c)=>n+c.achievements,0)/officials.length:0;
 const campaign=(electoral()?.campaign||[]).filter(x=>(x.q>electoralTermStart()||electoralTermStart()===0)&&x.q<=s.q&&x.regime===regime().id),campaignFit=campaign.length?campaign.reduce((n,x)=>n+electoralAlignment(x.axes,target),0)/campaign.length:0;
 return Math.max(.05,f.seats)*(1+affinity/30)*clamp(1+policy*.35+clamp(merit,-20,20)/100+campaignFit*.2,.25,2);
}
function legislativeForecast(){
 const raw=electionForecast(),weights=electoralWeights(),coalition=electoralCoalition(),p=pstate(),evidence=electoralPolicyEvidence();
 const clergy=regime().id==='theorepublic'?clamp(((clergyState()?.loyalty??100)-50)*.04,-2,2):0;
 const rows=raw.rows.map(row=>{
  const z=v3().regions[row.id],policy=electoralPolicyScore(z,evidence),campaign=electoralCampaignScore(z),vote=clamp(row.share*weights[0]+policy*weights[1]+campaign*weights[2]+clergy,0,100),party=p.factions.map(f=>({id:f.id,share:0}));
  const yes=p.factions.filter(f=>coalition.includes(f.id)),no=p.factions.filter(f=>!coalition.includes(f.id));
  for(const [list,total]of [[yes,no.length?vote:100],[no,100-vote]]){
   const strengths=list.map(f=>electoralPartyWeight(f,z,evidence)),sum=strengths.reduce((a,b)=>a+b,0);
   list.forEach((f,i)=>party[f.id].share=sum?total*strengths[i]/sum:0);
  }
  return {id:z.id,name:z.name,weight:z.weight,local:row.share,policy,campaign,clergy,vote,party};
 });
 const party=p.factions.map(f=>({id:f.id,name:f.name,color:factionColor107(f),share:rows.reduce((n,z)=>n+z.party[f.id].share*z.weight/100,0)}));
 const seats=allocateUnits107(party.map(f=>f.share),100);party.forEach((f,i)=>f.seats=seats[i]);
 const mean=key=>rows.reduce((n,z)=>n+z[key]*z.weight/100,0);
 return {q:s.q,regime:regime().id,weights,coalition,player:playerFactionId107(),rows,party,local:mean('local'),policy:mean('policy'),campaign:mean('campaign'),clergy,vote:mean('vote')};
}
function electoralSnapshotLower(){return pstate().factions.map(f=>({id:f.id,name:f.name,share:f.seats,color:factionColor107(f)}))}
function electoralSnapshotUpper(){const u=hasUpper108()?bicameral108()?.upper:null;return u?{name:upperName108(),formed:u.formed,groups:u.groups.map(g=>({id:g.id,name:g.name,share:g.share,color:UPPER_VIEWS108[g.view].color}))}:null}
function electoralTickets(){return [...new Set([pstate().bill,constitution().docket,...(bicameral108()?.delayed||[])].map(b=>b?.chamber108).filter(Boolean))]}
function electoralRemapAgreements(previous,members){
 for(const t of electoralTickets()){
  const seen=new Set();t.agreements=t.agreements.flatMap(a=>{const old=previous.find(m=>m.id===a.member),next=old&&members.find(m=>m.speaker===old.speaker&&(m.speaker||m.group===old.group));if(!next)return [];
   const key=next.speaker?'speaker':next.id+':'+a.q;if(seen.has(key))return [];seen.add(key);return [{...a,member:next.id}];
  });
 }
}
function electoralRenewUpperMembers(u){
 const old=u.members;populateUpperMembers108(u);
 u.members=u.members.map(m=>{const previous=old.find(x=>x.speaker===m.speaker&&(m.speaker?u.groups.some(g=>g.id===x.group&&g.share>0):x.group===m.group));return previous?{...previous,id:m.id}:m});
 electoralRemapAgreements(old,u.members);
}
function renewElectoralUpper(report){
 if(!hasUpper108())return;
 const u=bicameral108().upper,id=regime().id;
 if(id==='theorepublic'){report.upperRule='宪法监护委员会不换届，构成与任职人员保留。';return}
 if(id==='symbolic'){
  electoral().senateCarry={q:s.q,members:u.members.map(m=>({id:m.id,group:m.group,speaker:m.speaker}))};
  u.formed=false;u.groups=[];u.members=[];u.playerGroup=null;u.draft={establishment:0,progressive:0,conservative:0};delete u.partyShares;
  report.upperRule='本届参议院任期结束，请重新组建参议院。';addNotice107('senate-renewal-'+s.q,'组建新一届参议院','请在参议院分配三类倾向，合计100%后确认组建。','assembly');return;
 }
 const equal=report.rows[0].party.map((p,i)=>report.rows.reduce((n,z)=>n+z.party[i].share/report.rows.length,0));
 const two=twoPartyPresidency(),target=new Map(u.groups.map(g=>[g.id,0]));
 if(two){for(const g of u.groups)target.set(g.id,(report.party[g.id].share+equal[g.id])*.5);report.upperRule='各地区人口权重与等额地区权重各占50%，参议院独立计票。'}
 else{
  for(const f of pstate().factions){const view=linkedUpperView108(f),g=u.groups.find(g=>g.view===view)||u.groups.find(g=>g.view==='establishment')||u.groups[0];target.set(g.id,target.get(g.id)+(id==='federal'?equal[f.id]:f.seats))}
  if(id==='federal')report.upperRule='各地区等额计票，联邦院体现地区代表性。';
  else{const portion=id==='constitutional'?.3:.6;for(const g of u.groups)target.set(g.id,target.get(g.id)*portion+g.share*(1-portion));report.upperRule=id==='constitutional'?'本次选情占30%、原有构成占70%；贵族至少50%，贵族保守派至少40%。':'本次选情占60%、原有构成占40%。'}
 }
 let seats=allocateUnits107(u.groups.map(g=>target.get(g.id)),50);
 if(id==='constitutional'){
  const index=u.groups.findIndex(g=>g.view==='conservative');if(seats[index]<20){const other=u.groups.map((g,i)=>i).filter(i=>i!==index),shares=allocateUnits107(other.map(i=>seats[i]),30);seats[index]=20;other.forEach((i,n)=>seats[i]=shares[n])}
 }
 for(let i=0;i<u.groups.length;i++){
  const g=u.groups[i];g.share=seats[i]*2;
  let linked=two?pstate().factions.filter(f=>f.id===g.id):pstate().factions.filter(f=>linkedUpperView108(f)===g.view);
  if(!linked.length)linked=pstate().factions.filter(f=>g.lowerShares.some(x=>x.id===f.id));if(!linked.length)linked=pstate().factions;
  const shares=allocateUnits107(linked.map(f=>Math.max(.01,f.seats)),g.share);g.lowerShares=linked.map((f,n)=>({id:f.id,share:shares[n]})).filter(x=>x.share>0);g.playerShare=g.lowerShares.find(x=>x.id===playerFactionId107())?.share||0;
 }
 if(id==='constitutional')u.nobleShare=Math.max(50,u.groups.find(g=>g.view==='conservative').share);
 u.term++;electoralRenewUpperMembers(u);
}
function startElectoralGovernmentCrisis(){
 if(s.ended||!['constitutional','westminster','semi'].includes(regime().id)||coalitionShare107()>=50)return;
 let x=activeSit('government');if(x){x.seatDeficit=true;return x}
 x={id:sits().nextId++,kind:'government',start:s.q,deadline:s.q+3,opening:false,cooldowns:{},used:{},plans:{},cost:0,actions:[],original:[...rules103().coalition],broken:allies107().filter(id=>pstate().factions[id].relation<50),replacements:[],lastPenaltyQ:s.q,seatDeficit:true};
 sits().active.push(x);log('换届后政府危机',governmentText107(x));return x;
}
const governmentTextBeforeElectoral=governmentText107;
governmentText107=function(x){return x.seatDeficit?`换届后执政力量席位不足50%。须在第${x.deadline}季度到来前，争取其他党派加入，组成至少占50%席位的执政联盟；失信盟友仍须恢复信任。每季公众支持−1、政治稳定−3。${automaticCoalition107()?'逾期议会通过不信任案，任期结束。':'逾期联合政府解散，盟友所属阁员离任，总统继续执政。'}请前往${regime().body}协商。`:governmentTextBeforeElectoral(x)};
const syncCoalitionBeforeElectoral=syncCoalition107;
syncCoalition107=function(){
 const x=activeSit('government');if(!x?.seatDeficit)return syncCoalitionBeforeElectoral();
 if(s.ended)return;
 for(const id of x.original.filter(id=>id!==playerFactionId107()))if(pstate().factions[id].relation<50&&!x.broken.includes(id))x.broken.push(id);
 const accepted=rules103().coalition.filter(id=>id===playerFactionId107()||pstate().factions[id].relation>=(x.broken.includes(id)?60.000001:x.original.includes(id)?50:60));
 if(coalitionShare107(accepted)<50)return;
 const leaving=x.original.filter(id=>id!==playerFactionId107()&&!accepted.includes(id));rules103().coalition=accepted;resignCoalitionMinisters107(leaving);
 finishGovernmentCrisis107(x,'新一届执政联盟占'+fmt(coalitionShare107(),0)+'%席位。'+(leaving.length?'退出联盟的党派所属阁员已离任。':'现有阁员继续任职。'));
};
const holdElectionBeforeElectoral=holdElection;
holdElection=function(){
 if(!electoralEligible())return holdElectionBeforeElectoral();initializeElectoral();if(electoral().completed.includes(s.q))return;
 const result=electionForecast(),report=legislativeForecast(),g=v3();result.won=result.total>50;report.beforeLower=electoralSnapshotLower();report.beforeUpper=electoralSnapshotUpper();report.lowerName=regime().body;
 electoral().completed.push(s.q);pstate().factions.forEach((f,i)=>f.seats=report.party[i].seats);report.afterLower=electoralSnapshotLower();
 renewElectoralUpper(report);report.afterUpper=electoralSnapshotUpper();report.coalitionShare=coalitionShare107(report.coalition);result.legislature=report;g.elections.push(result);electoral().decisionStart=g.decisions.length;
 for(const row of result.rows){const z=g.regions[row.id];z.lastResult=row.share;z.termProgress=0}g.termActions={};
 if(regime().democratic){if(!result.won){setGameEnd107(`选举失利：全国加权得票率${fmt(result.total)}%，未超过50%。`)}else{s.mandates++;log('全国选举结果',`全国加权得票率${fmt(result.total)}%，赢得第${s.mandates}次选举。`)}}
 else{const change=(result.total-50)*.2;mod({stability:change});log('全国选举与权力评议',`地方加权认同${fmt(result.total)}%，政治稳定变化${fmt(change)}。`)}
 const final=regime().democratic&&!s.adminMode&&constitutionalTermLimit()>0&&s.q>=constitutionalTermLimit();
 if(!s.ended&&!final)startElectoralGovernmentCrisis();
 log('新一届立法机构构成',report.afterLower.map(f=>f.name+' '+f.share+'%').join('、')+'。');
 addNotice107('legislature-result-'+s.q,'新一届立法机构构成',`${regime().body}已完成席位分配。${report.upperRule||'本局采用一院制。'}可在民意与选举查阅换届报告。`,'politics');
 record();if(s.ended)beginSettlement(s.ended);
};
const formSenateBeforeElectoral=formSenate108;
formSenate108=function(){const carry=electoral()?.senateCarry,formed=bicameral108()?.upper.formed;formSenateBeforeElectoral();if(formed||!carry||!bicameral108()?.upper.formed)return;
 electoralRemapAgreements(carry.members,bicameral108().upper.members);const report=v3().elections.find(e=>e.q===carry.q)?.legislature;if(report){report.afterUpper=electoralSnapshotUpper();report.upperRule='新一届参议院已组建。'}electoral().senateCarry=null;save();render();
};
function electoralHasConstitution(pattern){return constitution().history.some(h=>h.result!=='failed'&&pattern.test(h.title))}
function electoralChoice(label,values,axes,momentum,tags=[]){return {...option(label,impactText(values)+'；'+(tags.length?'相关地区':'各地区')+'竞选表现'+(momentum>=0?'＋':'')+momentum+'。',values,axes,tags),campaign:{momentum,tags}}}
function electoralTopics(){
 const list=[],add=(key,title,text,tags,choices,history=false)=>list.push({key,title,text,tags,choices,history});
 add('debate','全国电视辩论','主持人要求你用具体账目说明下届施政重点。对手准备从就业、税负和兑现承诺的记录发起质询。',[],[
 ['公布施政账目并接受连续质询',{confidence:2,judicial:1,stability:-1},{law:3},4],['以新一轮民生计划回应',{cost:.35,approval:1,inflation:.2},{welfare:3,populism:1},6],['将辩论重点放在国家秩序',{stability:2,approval:-1},{authority:2,nation:2},-2]]);
 add('workers','厂区门前的竞选演说','工会把讲台搭在换班通道旁。工人关心的不只是新增岗位，还包括培训、薪资和长期合同。',['industry'],[
 ['安排转岗培训与就业服务',{cost:.3,unemployment:-.15},{welfare:2,market:-1},6],['邀请企业提出扩产承诺',{confidence:2,approval:-1},{market:3},2],['拒绝在选举期间追加开支',{confidence:1,approval:-1},{market:2,welfare:-2},-4]]);
 add('rural','乡村集市里的候选人','农产品收购商与小农户在集市上分别提出诉求，地方代表希望你给出下一季的安排。',['agriculture'],[
 ['补充乡村运输与灌溉资金',{cost:.3,capitalStock:.5},{welfare:2,nation:1},6],['协调合作社与采购商签订长约',{cost:.1,confidence:1},{market:1,law:1},3],['把资金优先留给全国重点项目',{confidence:2,approval:-1},{authority:2},-4]]);
 add('youth','第一次投票的年轻人','大学礼堂里，首次投票的学生追问就业机会、租房负担和公共表达空间。',['technology','capital'],[
 ['开放青年质询并设立就业实习计划',{cost:.25,judicial:1},{law:2,welfare:2},6],['让企业联合举办招聘活动',{confidence:2},{market:3},2],['强调青年应服从既定国家目标',{stability:1,approval:-1},{authority:3},-5]]);
 add('prices','家庭餐桌上的选举','居民把最近几季的账单带到市民大会。支持者和批评者都要求说明物价与工资的差距。',['welfare','capital'],[
 ['向困难家庭发放定向补助',{cost:.4,inflation:.2,approval:1},{welfare:3},6],['公布物价数据与分期改善计划',{confidence:2,approval:-1},{law:2,market:1},1],['要求零售企业暂时限制利润',{confidence:-3,stability:1},{market:-3,authority:2},4]]);
 add('business','商会的竞选问卷','地方商会要求各党就税制连续性、审批透明度和贸易准入作出公开答复。',['trade'],[
 ['公布一致适用的审批与税务指引',{cost:.1,confidence:2,judicial:1},{law:2,market:2},5],['承诺优先照顾重点企业',{confidence:3,approval:-1},{elite:3,authority:1},3],['拒绝为商业团体单独作出承诺',{approval:1,confidence:-2},{welfare:2,elite:-2},-3]]);
 add('clinics','诊所候诊室里的民意','医护人员带着排班表参加竞选座谈。居民希望等待时间缩短，也担心临时承诺无法持续。',['welfare'],[
 ['增设基层诊疗班次',{cost:.35,unemployment:-.1},{welfare:3},6],['公开候诊数据并调整现有资源',{cost:.1,confidence:1},{law:2},3],['坚持原有拨款，避免新增义务',{confidence:2,approval:-1},{market:2,welfare:-2},-4]]);
 add('border','边境地区的竞选访问','边境居民要求交通与治安投入，驻军家庭希望长期服役者得到照顾。',['security'],[
 ['拨款修缮边境道路和生活设施',{cost:.35,stability:1,capitalStock:.5},{military:2,welfare:1},6],['承诺严格审查边境贸易',{confidence:-2,stability:2},{nation:3,authority:2},3],['把资源集中在内地增长地区',{confidence:2,approval:-1},{market:2},-5]]);
 add('housing','首都街区的租房议题','租户组织和房产协会同时递交公开信。首都的通勤、住房与服务压力成为竞选焦点。',['capital'],[
 ['安排公共住房维修与交通接驳',{cost:.35,unemployment:-.1},{welfare:3},6],['协调私人房源并公开租约规范',{cost:.1,confidence:1,judicial:1},{market:2,law:2},3],['将争议交给市场自行消化',{confidence:2,approval:-1},{market:3,welfare:-2},-5]]);
 add('environment','湖畔的候选人论坛','旅游业者、护林人和能源企业争论开发边界。当地选民要求你解释增长与生态之间的取舍。',['green'],[
 ['组织公开环境评估并补偿受影响居民',{cost:.25,judicial:1},{green:3,law:2},6],['优先推动开发以扩大就业',{confidence:2,stability:1},{market:2,green:-2},-3],['安排分阶段试点与地方监督',{cost:.15,confidence:1},{green:1,law:2},3]]);
 add('local-media','地方报纸的联合专访','多家地方报纸拒绝接受统一新闻稿，希望就未兑现的承诺进行联合采访。',[],[
 ['接受专访并公开履约时间表',{judicial:2,stability:-1},{law:3},4],['投入资金补办最受关注的公共服务',{cost:.3,approval:1},{welfare:2,populism:2},5],['限制采访范围，统一竞选口径',{stability:2,judicial:-2},{authority:3,law:-2},-4]]);
 add('debts','债券市场旁听竞选','投资者关注各党竞选计划的筹资来源，选民则担心偿债压力挤压基本公共服务。',[],[
 ['公开分年财务安排',{confidence:3,approval:-1},{law:2,market:1},2],['以临时借款保障民生承诺',{cost:.45,approval:1,confidence:-2},{welfare:3,populism:2},6],['把偿债优先于新增民生项目',{cost:-.2,approval:-2},{market:3,welfare:-3},-4]]);
 add('coalition-voices','盟友与对手的联合采访','各党争论本届政绩应归于谁。地方记者要求你说明不同政治力量在施政中的作用。',[],[
 ['承认合作各方的贡献',{relation:1,stability:1},{law:1,elite:1},3],['将政绩集中归于自己的领导',{relation:-2,approval:1},{authority:2,populism:2},4],['回避党派争议，强调行政连续性',{confidence:1},{elite:2},0]]);
 add('observers','投票站观察员的申请','公民团体希望观察投票站准备工作；地方官员担心公开检查增加组织负担。',[],[
 ['允许观察并公布投票流程',{cost:.12,judicial:2},{law:3,authority:-2},5],['只开放经过筛选的投票站',{stability:1},{authority:1},1],['拒绝外部观察',{stability:2,judicial:-2,approval:-1},{authority:3,law:-3},-5]]);
 const reformText={
 nationalize:['国有企业职工的公开信','国有化改革改变了企业的所有权。职工希望保障能落实到车间，商界则质疑新企业的经营效率。'],
 privatize:['改制工厂的旧工牌','曾经的国企职工在竞选会场举起旧工牌。投资者强调改革带来的活力，工人要求回应转岗与福利问题。'],
 inheritance:['遗产税之后的家族账簿','特别征收减轻了公债负担。受影响家庭在选举期间要求说明税负公平，支持者则要求公布偿债去向。'],
 green:['新电网与旧村庄','绿色能源改革进入地方议程，受益企业与受建设影响的村庄要求候选人给出不同承诺。'],
 culture:['文化舞台上的竞选争论','国家文化资助成为公共讨论的焦点。创作者希望保持表达空间，地方社群要求公平获得资金。'],
 sports:['体育投资该由谁受益','体育改革受到选民关注：竞技成绩、基层场地与维护费用，哪一项更应该优先？'],
 education:['职业学校毕业生的提问','教育与技能改革已经启动，第一批参与者要求你说明学历、技能和实际岗位之间的距离。'],
 fund:['主权基金的公开账目','主权基金成为竞选议题。有人要求尽快分享收益，也有人担心选举承诺侵蚀长期资产。'],
 autonomy:['地方自治承诺的边界','地区自治改革改变了地方对中央的期待。竞选团体要求明确文化管理和公共服务的权限。'],
 command:['统筹项目与地方选择','国家投资统筹改革推动了重点项目，地方企业则追问谁能参与决策、谁承担调整成本。']
 };
 for(const x of s.reforms){const r=REFORMS[x.id];if(!r)continue;const [title,text]=reformText[r.key]||[r.name+'的选前答辩',`“${r.name}”已经通过。受益群体要求继续推进，批评者要求政府说明投入与成效。`];
  add('reform-'+r.key,title,text+(x.completed?'项目已完成，选民正在检视实际成果。':'项目仍在执行，选民追问兑现安排。'),r.tags,[
   ['公开执行账目并邀请受影响群体质询',{cost:.1,judicial:1,confidence:1},{law:3},4],
   ['补充过渡保障与地方配套',{cost:.4,approval:1,confidence:-1},{welfare:3},7],
   ['坚持既定方案，不追加拨款',{confidence:2,approval:-1},r.axes,-3]
  ],true);
 }
 if(electoralHasConstitution(/社会多元修正案/))add('pluralism-march','少数群体的民权游行','社会多元修正案通过后，少数群体组织在首都举行民权游行，要求平等条款落实到学校、就业和公共服务。传统团体对游行表达不满。',['green','capital','technology'],[
  ['保护和平游行，并公布平等服务实施安排',{cost:.25,judicial:2,stability:-1},{law:4,welfare:2,authority:-2},7],
  ['会见代表，分阶段落实修正案',{cost:.1,stability:1},{law:2,welfare:1},3],
  ['限制游行，优先安抚传统团体',{judicial:-3,stability:2,approval:-2},{authority:3,law:-3},-6]
 ],true);
 if(electoralHasConstitution(/修订最高司法机关条款/))add('court-charter','最高司法权归属的竞选争论',`此前的最高司法机关条款修订成为竞选焦点。现由${regime().court}行使最高司法权，法律界要求你说明监督与问责的边界。`,[],[
  ['公开解释权力边界并接受法律界质询',{judicial:2,stability:-1},{law:3},5],['强调宪法程序已经完成',{confidence:1},{law:1,elite:1},1],['以行政权威终结争论',{stability:2,judicial:-2},{authority:3},-4]
 ],true);
 if(electoralHasConstitution(/修订任期限制条款/))add('term-limits','任期条款与留任资格','任期限制曾被修订。竞选集会上，支持者强调施政连续性，对手质疑权力交接的可信度。',[],[
  ['公布任期规则并接受公开监督',{judicial:2,stability:-1},{law:3},5],['以长期项目需要连续领导为由辩护',{confidence:2},{elite:2,authority:2},1],['压制有关任期的批评',{approval:-2,judicial:-3,stability:2},{authority:4,law:-3},-6]
 ],true);
 if(electoralHasConstitution(/修订公民权利条款/))add('civil-rights','宪法里的权利，生活里的待遇','公民权利条款修订之后，公益团体带来具体个案，要求候选人解释宪法承诺如何落实。',['capital','welfare'],[
  ['安排公开个案复核',{cost:.18,judicial:2},{law:3,welfare:1},6],['承诺按现有程序逐项处理',{confidence:1},{law:1},2],['要求团体停止借个案干扰选举',{stability:2,approval:-1,judicial:-2},{authority:3},-5]
 ],true);
 const interpretations=constitution().history.filter(h=>h.result!=='failed'&&/^关于/.test(h.title));
 for(const h of interpretations){const key='interpret-'+h.title;if(list.some(t=>t.key===key))continue;
  add(key,'释宪裁决的选前追问',`“${h.title}”已经获得通过。支持者要求落实裁决，批评者担心政府借解释宪法扩大政策空间。`,[],[
   ['公开裁决依据与执行账目',{cost:.1,judicial:1,confidence:1},{law:3},4],['增加落实裁决所需的配套资金',{cost:.3,approval:1},{welfare:2},6],['只强调裁决权威，拒绝进一步说明',{stability:1,approval:-1},{authority:3},-4]
  ],true);
 }
 return list;
}
function electoralCampaignEvent(){
 const topics=electoralTopics(),seen=electoral().topics,start=electoralTermStart();
 const count=t=>seen.filter(x=>(x.q>start||start===0)&&x.key===t.key).length,last=t=>Math.max(-100,...seen.filter(x=>x.key===t.key).map(x=>x.q));
 let available=topics.filter(t=>last(t)!==s.q),freshHistory=available.filter(t=>t.history&&count(t)===0);
 if(freshHistory.length)available=freshHistory;
 else{const least=Math.min(...available.map(count));available=available.filter(t=>count(t)===least)}
 const t=pick(available);electoral().topics.push({q:s.q,key:t.key});
 return {type:'campaign',electoralRegular:true,electoralCampaign:true,campaignKey:t.key,title:t.title,text:t.text,options:t.choices.map(([label,values,axes,momentum])=>electoralChoice(label,values,axes,momentum,t.tags))};
}
function electionRegularEvents(){
 if(!electoralEligible()||!electionWindow107())return null;
 const other=rand()<.5?economicEvent():extraEvent();other.electoralRegular=true;
 return [electoralCampaignEvent(),electoralCampaignEvent(),other];
}
const pushEventBeforeElectoral=pushEvent;
pushEvent=function(e){if(electoral()&&electoralEligible()&&electionWindow107()&&!e.electoralRegular)e.constitutionalSpecial=true;return pushEventBeforeElectoral(e)};
const queueBeforeElectoral=queueQuarterEvents;
queueQuarterEvents=function(){
 const p=pstate(),previous=new Set([p.current,...p.queue].filter(Boolean)),campaign=electoralEligible()&&!!electionWindow107();queueBeforeElectoral();
 if(campaign)for(const e of [p.current,...p.queue].filter(Boolean))if(!previous.has(e)&&!e.electoralRegular)e.constitutionalSpecial=true;
};
const resolveBeforeElectoral=resolvePolitical;
resolvePolitical=function(i){
 const e=pstate().current,o=e?.options[i];if(e?.electoralCampaign&&o?.campaign&&!s.ended&&!e.campaignResolved){
  e.campaignResolved=true;electoral().campaign.push({q:s.q,regime:regime().id,key:e.campaignKey,label:o.label,momentum:o.campaign.momentum,tags:[...o.campaign.tags],axes:{...o.axes}});
 }
 return resolveBeforeElectoral(i);
};
function electoralSeatBar(groups,label){return `<svg class="electoral-seat-bar" viewBox="0 0 500 24" preserveAspectRatio="none" role="img" aria-label="${esc(label)}">${groups.map((g,i)=>`<rect x="${groups.slice(0,i).reduce((n,f)=>n+f.share,0)*5}" y="0" width="${g.share*5}" height="24" fill="${esc(g.color)}"><title>${esc(g.name)} ${g.share}%</title></rect>`).join('')}</svg>`}
function electoralComparison(before,after,title){
 return `<section class="electoral-chamber"><h4>${esc(title)}</h4><small>选前</small>${electoralSeatBar(before,'选前席位占比')}<small>选后</small>${after?electoralSeatBar(after,'选后席位占比'):'<p>等待组建新一届参议院</p>'}<div class="table-wrap"><table><thead><tr><th>党派／团体</th><th>选前</th><th>选后</th><th>变化</th></tr></thead><tbody>${(after||before).map(f=>{const old=before.find(g=>g.id===f.id)?.share||0,delta=f.share-old;return `<tr><td><i class="electoral-color" style="background:${esc(f.color)}"></i>${esc(f.name)}</td><td>${old}%</td><td>${after?f.share+'%':'待组建'}</td><td>${after?(delta>0?'+':'')+delta+'个百分点':'—'}</td></tr>`}).join('')}</tbody></table></div></section>`;
}
function electoralReportHTML(r){
 return `<article class="electoral-result" data-election-quarter="${r.q}"><p>第${r.q}季度 · ${esc(r.lowerName)} · 当选时执政力量席位占比${fmt(r.coalitionShare,0)}%</p><div class="electoral-chambers">${electoralComparison(r.beforeLower,r.afterLower,r.lowerName)}${r.beforeUpper?electoralComparison(r.beforeUpper.groups,r.afterUpper?.formed?r.afterUpper.groups:null,r.beforeUpper.name):''}</div>${r.upperRule?`<p>${esc(r.upperRule)}</p>`:''}<details><summary>查看各地区政党得票与计算细则</summary><p>执政阵营地区得票＝地方支持×${r.weights[0]*100}%＋政策契合×${r.weights[1]*100}%＋竞选表现×${r.weights[2]*100}%${r.regime==='theorepublic'?'＋神职人员忠诚度修正':''}。再按人口权重汇总全国结果，分配下院席位。各项得分均为0至100。</p><p>全国分项：地方加权支持${fmt(r.local,2)}%，政策契合${fmt(r.policy,2)}，竞选表现${fmt(r.campaign,2)}${r.regime==='theorepublic'?'，神职修正'+(r.clergy>=0?'+':'')+fmt(r.clergy,2)+'个百分点':''}；执政阵营议会得票${fmt(r.vote,2)}%。</p><div class="table-wrap"><table><thead><tr><th>地区</th><th>人口权重</th><th>地方支持</th><th>政策契合</th><th>竞选表现</th>${r.party.map(f=>`<th>${esc(f.name)}</th>`).join('')}</tr></thead><tbody>${r.rows.map(z=>`<tr><td>${esc(z.name)}</td><td>${z.weight}%</td><td>${fmt(z.local,1)}%</td><td>${fmt(z.policy,1)}</td><td>${fmt(z.campaign,1)}</td>${z.party.map(f=>`<td>${fmt(f.share,1)}%</td>`).join('')}</tr>`).join('')}</tbody></table></div></details></article>`;
}
function electoralResultsHTML(){
 const list=v3().elections.filter(e=>e.legislature);if(!list.length)return '';
 return `<section class="card electoral-results" id="electoral-results"><span class="tag">全国大选 · 立法机构换届</span><h3>新一届立法机构构成</h3>${electoralReportHTML(list.at(-1).legislature)}${list.length>1?`<details><summary>查看历届席位变化</summary>${list.slice(0,-1).reverse().map(e=>`<details><summary>第${e.q}季度换届</summary>${electoralReportHTML(e.legislature)}</details>`).join('')}</details>`:''}</section>`;
}
function electoralForecastHTML(){
 if(!electoralEligible()||s.ended)return '';const f=legislativeForecast(),share=f.party.filter(p=>f.coalition.includes(p.id)).reduce((n,p)=>n+p.seats,0);
 return `<section class="card electoral-forecast" id="legislative-forecast"><span class="tag">${esc(regime().body)} · 换届预测</span><h3>议会选票与执政联盟</h3><p>地方加权支持${f.weights[0]*100}% · 政策契合${f.weights[1]*100}% · 选举期间决定${f.weights[2]*100}%</p><div class="row"><span>执政阵营议会得票预测</span><b>${fmt(f.vote,1)}%</b></div><div class="row"><span>执政力量席位占比预测</span><b>${share}%</b></div><details><summary>查看各党预测与计算细则</summary><p>民主国家是否连任仍看全国加权得票是否超过50%。议会选票另按上述权重计算；中性的政策契合与竞选表现均为50分。执政党与盟友按各自地方基础、政策契合、在任官员成果和竞选立场分配阵营选票。</p>${f.regime==='theorepublic'?`<p>神职人员忠诚度修正：${f.clergy>=0?'+':''}${fmt(f.clergy,2)}个百分点；忠诚度50时为0，最低−2、最高＋2。宪法监护委员会不换届。</p>`:''}<div class="table-wrap"><table><thead><tr><th>党派</th><th>预计得票</th><th>预计席位占比</th></tr></thead><tbody>${f.party.map(p=>`<tr><td>${esc(p.name)}${p.id===f.player?' · 玩家所属':f.coalition.includes(p.id)?' · 政治盟友':''}</td><td>${fmt(p.share,1)}%</td><td>${p.seats}%</td></tr>`).join('')}</tbody></table></div><p>下院按全国政党得票比例分配100份席位权重，整数余数按小数部分从大到小补足。已通过的法案保留效力，尚待表决的议案按换届后的构成计票。</p></details></section>`;
}
const politicsBeforeElectoral=politics;
politics=function(){return electoralForecastHTML()+electoralResultsHTML()+politicsBeforeElectoral()};
const archiveBeforeElectoral=archive;
archive=function(){return archiveBeforeElectoral()+(v3().elections.some(e=>e.legislature)?`<section class="card"><h3>立法机构换届档案</h3><details><summary>查看历次选举与席位变化</summary>${v3().elections.filter(e=>e.legislature).slice().reverse().map(e=>`<details><summary>第${e.q}季度换届</summary>${electoralReportHTML(e.legislature)}</details>`).join('')}</details></section>`:'')};
function electionsGuide(entries){
 const add=(id,title,aliases,text)=>entries.push({id,title,aliases:[title,...aliases],text,category:'选举与换届'});
 add('legislative-election','议会换届',['下院席位','席位重新分配','议会得票','议会选票','立法机构换届'],'每24季度大选后重分下院席位。民主国家采用60%地方加权支持、20%政策契合、20%竞选表现；象征性民主与神权共和采用80%、10%、10%。各地区结果按人口权重汇总，政党得票按比例分配为整数席位占比，总和100%。全国加权得票仍单独决定民主国家是否连任。');
 add('policy-fit','政策契合',['政策契合程度'],'本届已经作出的预算调整、结构性改革、修宪、释宪与部长议程，按其方向与地区产业、社会诉求的吻合程度评分。程序性提案、未通过的修宪和初始政策不算新增政绩。无记录时为50分，范围0至100。');
 add('campaign-performance','竞选表现',['选举期间的决定','竞选表现分数','竞选事件'],'每届从50分起计。选举事件的回复累积改变相关地区的分数，范围0至100；带有地区标签的选择，对其他地区按35%计入。新一届重新计分。选举季每季度两件选举事件、一件其他常规事件，特殊事件另加。话题会回顾已通过的改革、修宪与释宪，并优先选择本届尚未讨论的相关议题。');
 add('upper-renewal','上院换届',['参议院换届','上议院换届','联邦院换届','组建新一届参议院'],'一般上院采用60%本次选情与40%原有构成；君主立宪上议院采用30%与70%，贵族至少50%、贵族保守派至少40%。总统制两党制参议院将人口权重与等额地区权重各计50%；联邦院各地区等额计票。换届上院50席，每席2%。宪法监护委员会不换届；象征性民主重新开放参议院组建，沿用三类倾向、1%输入与原有一次性影响，不消耗行动点。');
 add('clergy-election','神职人员与选举',['神职人员选举影响','神职选举修正'],'仅神权共和制：神职人员忠诚度对下院执政阵营得票作小幅修正，等于（忠诚度−50）×0.04个百分点，范围−2至＋2。不会改变宪法监护委员会构成。');
 add('electoral-coalition','换届后组阁',['换届后政府危机','选举后联合政府'],'玩家党派与盟友分别计票，席位不会全部归于玩家党。君主立宪、西敏和半总统制换届后执政力量不足50%时进入三季度政府危机；前两者到期失去执政资格，半总统制联盟解散并按原规则处理阁员离任。原联盟扩充后重获多数可保留现任阁员，退出联盟的党派所属阁员按既有规则离任。');
 const season=entries.find(e=>e.id==='election-season');if(season)season.text+=' 民主国家、象征性民主与神权共和在选举季每季固定两件选举事件加一件其他常规事件；特殊事件另加。';
}
function electionsTutorial(steps,scope,page){
 if(scope!=='intro'&&page==='politics'&&electoralEligible())steps.splice(Math.max(0,steps.length-1),0,{page,id:'legislative-election',selector:'#legislative-forecast',title:'议会选票与席位',text:'连任结果和议会席位分别计算。这里显示本局权重及执政力量的席位预测；展开细则可查看各党得票。大选后，下方保留两院席位变化和地区计票。'});
 return steps;
}
const validBeforeElectoral=validSave;
validSave=function(v){
 if(!validBeforeElectoral(v))return false;const e=v.electoral;if(!e)return true;
 try{
  const number=(x,a=0,b=100)=>Number.isFinite(x)&&x>=a&&x<=b,int=(x,a=0,b=v.q)=>Number.isInteger(x)&&number(x,a,b),text=x=>typeof x==='string'&&x.length<500;
  if(e.version!==1||!int(e.installedQ)||!int(e.decisionStart,0,v.governance.decisions.length)||!Array.isArray(e.campaign)||!Array.isArray(e.topics)||!Array.isArray(e.completed)||new Set(e.completed).size!==e.completed.length||e.completed.some(q=>!int(q)||q%24!==0))return false;
  if(e.campaign.some(x=>!int(x.q)||!REGIMES.some(r=>r.id===x.regime)||!text(x.key)||!text(x.label)||!number(x.momentum,-20,20)||!Array.isArray(x.tags)||x.tags.some(t=>!text(t))||!x.axes||Object.entries(x.axes).some(([k,n])=>!AXES.includes(k)||!number(n,-10,10))))return false;
  if(e.topics.some(x=>!int(x.q)||!text(x.key)))return false;
  if(e.senateCarry!==null&&(!e.senateCarry||!int(e.senateCarry.q)||!Array.isArray(e.senateCarry.members)||e.senateCarry.members.some(m=>!int(m.id,0,20)||!int(m.group,0,20)||typeof m.speaker!=='boolean')))return false;
  const snapshot=(a,empty=false)=>Array.isArray(a)&&(empty&&a.length===0||a.length>0&&a.reduce((n,x)=>n+x.share,0)===100)&&new Set(a.map(x=>x.id)).size===a.length&&a.every(x=>int(x.id,0,20)&&text(x.name)&&int(x.share,0,100)&&/^#[0-9a-f]{3,8}$/i.test(x.color));
  for(const result of v.governance.elections){const r=result.legislature;if(!r)continue;
   if(!int(r.q)||r.q!==result.q||!REGIMES.some(x=>x.id===r.regime)||!Array.isArray(r.weights)||r.weights.length!==3||r.weights.some(x=>!number(x,0,1))||Math.abs(r.weights.reduce((a,b)=>a+b,0)-1)>1e-9||!snapshot(r.beforeLower)||!snapshot(r.afterLower))return false;
   if(!['local','policy','campaign','vote','coalitionShare'].every(k=>number(r[k]))||!number(r.clergy,-2,2)||!int(r.player,0,r.afterLower.length-1)||!Array.isArray(r.coalition)||r.coalition.some(id=>!int(id,0,r.afterLower.length-1)))return false;
   if(!Array.isArray(r.party)||r.party.length!==r.afterLower.length||r.party.some((p,i)=>p.id!==i||!text(p.name)||!number(p.share)||!int(p.seats,0,100))||Math.abs(r.party.reduce((n,p)=>n+p.share,0)-100)>1e-6||r.party.reduce((n,p)=>n+p.seats,0)!==100)return false;
   if(!Array.isArray(r.rows)||r.rows.length!==v.governance.regions.length||r.rows.reduce((n,z)=>n+z.weight,0)!==100||r.rows.some((z,i)=>z.id!==i||!text(z.name)||!['weight','local','policy','campaign','vote'].every(k=>number(z[k]))||!number(z.clergy,-2,2)||!Array.isArray(z.party)||z.party.length!==r.party.length||z.party.some((f,j)=>f.id!==j||!number(f.share))||Math.abs(z.party.reduce((n,f)=>n+f.share,0)-100)>1e-6))return false;
   for(const upper of [r.beforeUpper,r.afterUpper])if(upper!==null&&(!upper||!text(upper.name)||typeof upper.formed!=='boolean'||!snapshot(upper.groups,!upper.formed)))return false;
  }
  return true;
 }catch(_){return false}
};
