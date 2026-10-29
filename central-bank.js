/* Actual quarterly monetary decisions and current fiscal advice. */
function centralBank107(){return s.centralBank107}
function initializeCentralBank107(){
 if(s.centralBank107)return;
 const reports=[];
 if(!creatingWorld){
  const points=s.history.filter(h=>Number.isInteger(h.q)&&Number.isFinite(h.rate)).slice().sort((a,b)=>a.q-b.q);
  for(let i=1;i<points.length;i++)if(points[i].q===points[i-1].q+1){
   const h=points[i];reports.push({q:h.q,kind:'legacy',before:points[i-1].rate,after:h.rate,inflation:Number.isFinite(h.inflation)?h.inflation:null,growth:Number.isFinite(h.growth)?h.growth:null,unemployment:Number.isFinite(h.unemployment)?h.unemployment:null});
  }
 }
 s.centralBank107={version:1,startedQ:s.q,reports};
}
const initBeforeCentralBank107=initPolitics;
initPolitics=function(...args){initBeforeCentralBank107(...args);initializeCentralBank107()};
const economicBeforeReports107=economicQuarter;
economicQuarter=function(){
 const before=s.rate;economicBeforeReports107();
 const bank=centralBank107();if(!bank||bank.reports.some(r=>r.q===s.q))return;
 const potential=types[s.type].potential+(s.capitalStock-50)*.022+(s.human-50)*.025+s.reforms.reduce((a,r)=>a+(s.q>=r.ready?r.boost:0),0);
 bank.reports.push({q:s.q,kind:'decision',before,after:s.rate,inflation:s.inflation,growth:s.growth,unemployment:s.unemployment,potential,outputGap:s.growth-potential,debt:s.debt/s.gdp*100,confidence:s.confidence,yield:s.yield,balance:balance()});
};
function monetaryAction107(r){const delta=r.after-r.before;return Math.abs(delta)<.0000001?'维持政策利率':delta>0?'上调政策利率':'下调政策利率'}
function monetaryReason107(r){
 if(r.kind==='legacy')return '历史指标摘录（非原始决策报告）。仅能确认相邻季度记录中的利率与指标，无法还原当时的决策理由或季度内调整。';
 return `央行按本季通胀 ${fmt(r.inflation)}% 与产出缺口 ${r.outputGap>0?'+':''}${fmt(r.outputGap)} 个百分点自主调整利率，并保留上一季利率的惯性。${r.after>r.before?'借贷成本随政策利率上升，经济扩张将面临额外压力。':r.after<r.before?'政策利率下调可缓解借贷压力，效果会随经济模拟逐步体现。':'本季计算结果维持利率不变。'}${r.inflation>20&&r.growth<0?'高通胀与经济收缩同时存在，货币政策面临取舍。':''}`;
}
function centralBankAdvice107(){
 const advice=[];const debt=s.debt/s.gdp*100,fiscal=balance();
 if(s.inflation>20)advice.push(['控制通胀压力',`当前通胀为 ${fmt(s.inflation)}%。优先处理推高物价的局势与政策；债务货币化和量化宽松会再提高通胀。加大支出前，应同时评估赤字与央行加息的影响。`]);
 else if(s.inflation>5)advice.push(['留意物价与支出节奏',`通胀为 ${fmt(s.inflation)}%，扩张支出宜分步推进，避免需求压力与利率上调互相抵消。`]);
 else if(s.inflation<0)advice.push(['应对通缩与需求不足','物价正在下降。可结合财政空间调整民生与基础设施支出，避免仅为压低债务率而加剧经济收缩。']);
 if(s.unemployment>8)advice.push(['把就业列为优先事项',`失业率为 ${fmt(s.unemployment)}%。检查大罢工局势、劳动部门提案及教育与基建投入；已承诺的连续季度支出需维持到期才会兑现。`]);
 if(s.growth<0)advice.push(['缓解经济收缩',`实际年化增长为 ${fmt(s.growth)}%。评估正在实施的改革和局势损耗，在融资能力允许时改善就业与公共投资，避免同时削减多项支出。`]);
 if(debt>90||fiscal<-3)advice.push(['管理偿债与融资压力',`债务 / GDP 为 ${fmt(debt)}%，财政${fiscal<0?'赤字':'盈余'}为 ${fmt(Math.abs(fiscal))}% GDP。新承诺会影响公债与市场信心；若处于经济危机，需同时降低债务率和通胀。`]);
 if(s.confidence<40)advice.push(['恢复市场信心',`投资者信心为 ${fmt(s.confidence)}。当前债券收益率 ${fmt(s.yield)}% 同时包含政策利率和风险溢价；仅等候央行降息未必能解决融资问题。`]);
 if(!advice.length)advice.push(['保持政策连续性','当前主要指标尚未触及本报告的高风险提示。可保持预算稳定，按期推进结构性改革，并为下一次经济冲击保留财政空间。']);
 return advice;
}
function centralBankPage107(){
 const reports=centralBank107().reports.slice().reverse();
 const datum=(label,value,unit='%')=>`<div class="row"><span>${label}</span><b>${Number.isFinite(value)?fmt(value)+unit:'未记录'}</b></div>`;
 return `<section class="political-banner bank-header"><div><span class="tag">档案 · 货币政策</span><h2>央行政策报告</h2></div><button onclick="openMetricChart107('rate')">政策利率走势 ↗</button></section><section class="card" id="central-bank-advice"><div class="section-label"><h3>本季度央行建议</h3><span>${date()} · 随当前国情更新</span></div>${centralBankAdvice107().map(([title,text])=>`<article class="bank-advice"><h4>${title}</h4><p>${text}</p></article>`).join('')}</section><section class="card" id="central-bank-reports"><div class="section-label"><h3>历季政策处理报告</h3><span>${reports.length} 份 · 最新在前</span></div><p>正式报告记录每季经济结算时的央行决定；之后的事件、部长行动或局势可能继续改变指标，因此报告数据可能与季末图表不同。</p>${reports.map(r=>`<details class="bank-report"><summary><span>${date(r.q)} · ${r.kind==='legacy'?'历史指标摘录':monetaryAction107(r)}</span><b>${fmt(r.before,2)}% → ${fmt(r.after,2)}%</b></summary><p>${monetaryReason107(r)}</p><div class="bank-report-metrics">${datum('利率变化',r.after-r.before,' 个百分点')}${datum('通胀',r.inflation)}${datum('实际年化增长',r.growth)}${datum('失业率',r.unemployment)}${r.kind==='decision'?datum('债务 / GDP',r.debt)+datum('债券收益率',r.yield)+datum('财政余额',r.balance)+datum('投资者信心',r.confidence,' / 100'):''}</div></details>`).join('')||'<div class="bank-empty"><h4>尚无季度政策报告</h4><p>进入下一季度后，央行将按经济情况调整利率并在此留下报告。本季建议已可查看。</p></div>'}</section>`;
}
politicalTabs.push(['centralbank','▥','央行报告']);
const archiveBeforeBank107=archive;
archive=function(){return `<section class="card" id="central-bank-entry"><div class="section-label"><h3>央行政策档案</h3><span>政策利率 ${fmt(s.rate,2)}%</span></div><p>查阅历季货币政策记录与本季度建议。</p><button onclick="changeTab('centralbank')">查阅央行报告 →</button></section>`+archiveBeforeBank107()};
const validBeforeBank107=validSave;
validSave=function(v){
 if(!validBeforeBank107(v))return false;const bank=v.centralBank107;if(!bank)return true;
 try{
  if(bank.version!==1||!Number.isInteger(bank.startedQ)||bank.startedQ<0||bank.startedQ>v.q||!Array.isArray(bank.reports))return false;
  let last=-1;return bank.reports.every(r=>{if(!Number.isInteger(r.q)||r.q<=last||r.q>v.q||!['legacy','decision'].includes(r.kind)||!Number.isFinite(r.before)||!Number.isFinite(r.after))return false;last=r.q;return ['inflation','growth','unemployment'].every(k=>Number.isFinite(r[k])||r.kind==='legacy'&&r[k]===null)&&(r.kind==='legacy'||['potential','outputGap','debt','confidence','yield','balance'].every(k=>Number.isFinite(r[k])))})
 }catch(_){return false}
};
function judicialReportsGuide107(entries){
 const add=(id,title,aliases,text,category='宪法与司法')=>entries.push({id,title,aliases:[title,...aliases],text,category});
 for(const e of entries){
  if(e.id==='judges')e.text='每局法定5—10席，包含一位首席。开局社会进步与政治自由合计少于半数，其余法官中墨守成规占70%的抽取权重。补缺后构成可以变化。空缺不投票；扇形图灰色为待补席位，星号为首席。';
  if(e.id==='constitutional-docket')e.text='修宪一律向议事机关议长／主席提出，1行动点；取得至少三分之二院内支持后，进入最多3季度的司法审查。法院以赞成多于反对为通过；普通票平票时由首席额外投关键一票。首席暂缺的平票不能通过。若最高司法权属于议事机关，审查仍按至少50%院内支持，不设关键票。释宪从有权机关提出，法院同样适用关键票；议事机关释宪仍须超过50%。';
  if(e.id==='constitutional-transfer')e.text='修宪先获议事机关三分之二支持，再按现行司法规则通过审查。移交最高司法权后，司法独立−20、稳定−10、支持+10；后续修宪审查与释宪由获授权机关办理，不使用首席关键票。可再修宪恢复法院权威。';
  if(e.id==='pluralism-amendment')e.text=e.text.replace('司法半数门槛','司法审查（法院平票时由首席投关键票）');
 }
 add('judicial-personnel','法官补缺',['法官备选池','任命法官','司法人事','法官辞任','任上病故','因病辞职','主动退休'],'每季度有5%概率随机一位现任法官离任，三种原因各占三分之一。报告不占三个常规事件。补缺消耗1行动点，候选人不得兼任政府或议事机关官员；可选非执政联盟人物。就任后永久退出政府候选名单，也不得进入议事机关。首席离任后，完成补缺时从全体现任法官中随机产生新首席。');
 add('judicial-mapping','司法倾向转换',['任前政治倾向'],'新任法官依据原政治倾向抽取司法倾向；任命前展示概率。强硬集权派必为政治保守；民生扩张派各以50%成为社会进步或墨守成规；市场社会派各以50%成为社会进步或政治自由。倾向在确认时确定，任命后不会因刷新重抽。');
 add('casting-vote','关键一票',['首席关键票','平票裁决'],'法院普通赞成与反对票恰好相等时，首席额外投一票；其本案意愿达到60即投赞成，否则投反对。释宪与修宪审查都适用；最高司法权属于议事机关时不适用。空缺不计票，首席空缺时没有关键票。');
 add('centralbank','央行报告',['央行政策报告','央行政策档案','历季政策处理报告','货币政策报告'],'从办公桌档案进入。记录央行每季度的利率调整、当时的通胀、增长、就业及融资指标。利率自主反应；之后事件可能使季末数据不同。旧档可恢复的指标单独标为历史摘录，不补造原始报告。','经济与财政');
 add('bank-advice','本季度央行建议',['央行建议','中央银行建议'],'根据当前通胀、就业、增长、债务、财政余额与信心，提示游戏中的政策取舍。建议随本季选择更新，查阅不消耗行动点。','经济与财政');
}
