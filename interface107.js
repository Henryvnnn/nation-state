/* 1.0.6 additions: live history charts and non-blocking government reminders. */
const EXTRA_SERIES107=[['forecast','当前加权选票预测','%'],['eventsChosen','本季已回复事件','件'],['human','人力资本','/100'],['capitalStock','基础设施资本','/100'],['researchLevel','科研等级','级'],['researchProgress','科研进度','%'],['politicalCapacity','每季度政治行动点总数','点']];
const snapshotBeforeCharts107=snapshot;
snapshot=function(){return {...snapshotBeforeCharts107(),...(v3()?.regions?.length?{forecast:electionForecast().total,eventsChosen:v3().eventsChosen}:{}),human:s.human,capitalStock:s.capitalStock,...(rules103()?{researchLevel:rules103().research.level,researchProgress:rules103().research.progress,politicalCapacity:politicalCapacity()}:{} )}};
function chartSeries107(key){return [...SERIES,...EXTRA_SERIES107].find(row=>row[0]===key)}
function historyCharts107(final=snapshot()){return `<div class="section-label" id="history-charts"><h3>完整任期指标</h3><span>每季度记录 · 点击查看大图</span></div><div class="charts-grid">${SERIES.map(([key,name,unit])=>`<article class="card history-card"><div class="section-label" style="margin-top:0"><h3><button class="chart-title" onclick="openMetricChart107('${key}')">${name} ↗</button>${key==='rate'?` <button class="concept-info" aria-label="解释政策利率" onclick="openGuideConcept107('政策利率')">ⓘ</button>`:''}</h3><span>${Number.isFinite(final[key])?fmt(final[key]):'—'} ${unit}</span></div><button class="chart-surface" aria-label="查看${name}折线图" onclick="openMetricChart107('${key}')">${seriesChart(key,name,unit)}</button></article>`).join('')}</div>`}
seriesChart=function(key,label,unit='%',height=170){
 let history=s.history,values=history.map(h=>h[key]).filter(Number.isFinite);if(!values.length)return '<p>该指标暂无历史数据，后续季度开始记录。</p>';
 let lo=values.reduce((a,b)=>Math.min(a,b),Infinity),hi=values.reduce((a,b)=>Math.max(a,b),-Infinity),span=hi-lo,pad=span<1?.5:span*.12;lo-=pad;hi+=pad;
 let start=history[0].q,end=history.at(-1).q,x=q=>55+(q-start)/Math.max(1,end-start)*535,y=v=>height-30-(v-lo)/(hi-lo)*(height-52),paths=[],run=[],last=null;
 for(let h of history){if(Number.isFinite(h[key])){let point={x:x(h.q),y:y(h[key]),q:h.q,value:h[key]};run.push(point);last=point}else if(run.length){paths.push(run);run=[]}}if(run.length)paths.push(run);
 return `<svg viewBox="0 0 620 ${height}" class="history-chart" role="img" aria-label="${label}完整历史折线图">${[0,1,2].map(i=>{let value=lo+(hi-lo)*i/2;return `<line x1="55" y1="${y(value)}" x2="590" y2="${y(value)}" stroke="var(--line)"/><text x="2" y="${y(value)+4}">${fmt(value,span<5?1:Math.abs(value)>999?0:1)}</text>`}).join('')}${paths.map(points=>`<polyline points="${points.map(p=>p.x+','+p.y).join(' ')}" stroke="var(--green)" stroke-width="2.5" fill="none"/>${points.length===1?`<circle cx="${points[0].x}" cy="${points[0].y}" r="3.5" fill="var(--green)"/>`:''}`).join('')}${last?`<circle cx="${last.x}" cy="${last.y}" r="4" fill="var(--green)"><title>第${last.q}季度：${fmt(last.value,2)} ${unit}</title></circle>`:''}<text x="55" y="${height-6}">第 ${start} 季度</text><text x="500" y="${height-6}">第 ${end} 季度</text></svg>`;
};
function openMetricChart107(key){
 let spec=chartSeries107(key);if(!spec)return;let [_,name,unit]=spec,history=s.history.filter(h=>Number.isFinite(h[key])),current=snapshot()[key],first=history[0]?.[key],change=Number.isFinite(first)?current-first:0;
 let dialog=$('chart-modal');dialog.innerHTML=`<div class="chart-modal-header"><div><span class="tag">国家指标 / 季度走势</span><h2>${name}</h2></div><button onclick="$('chart-modal').close()" aria-label="关闭指标图表">关闭</button></div><div class="chart-summary"><strong>${Number.isFinite(current)?fmt(current,2):'—'}<small> ${unit}</small></strong><span>较首次记录 ${change>0?'+':''}${fmt(change,2)} ${unit}</span></div>${seriesChart(key,name,unit,300)}<p class="note">与国家档案使用相同的季度记录；同一季度内显示最近一次决策后的数值。旧存档未记录的历史不会补造。</p>`;if(!dialog.open)dialog.showModal();
 dialog.onclick=e=>{if(e.target===dialog&&typeof dialog.getBoundingClientRect==='function'){let r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}};
}
const METRIC_KEYS107={'公众支持':'approval','全国支持率':'approval','支持率':'approval','政府支持率':'approval','政治稳定':'stability','国家稳定':'stability','司法独立':'judicial','实际年化增长':'growth','实际 GDP 增长':'growth','GDP 增长':'growth','失业率':'unemployment','通胀':'inflation','通货膨胀':'inflation','债务 / GDP':'debt','政府债务 / GDP':'debt','投资者信心':'confidence','政策利率':'rate','当前加权选票预测':'forecast','本季已回复事件':'eventsChosen'};
const metricBeforeCharts107=metric;
metric=function(label,n,unit,sub,good=true){let key=METRIC_KEYS107[label],html=metricBeforeCharts107(label,n,unit,sub,good);if(key)html=html.replace('<div class="card">',`<div class="card metric-chart" data-metric="${key}" role="button" tabindex="0" aria-label="查看${label}折线图" onclick="openMetricChart107('${key}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openMetricChart107('${key}')}">`);return html};
const archiveBeforeCharts107=archive;archive=function(){return archiveBeforeCharts107()+historyCharts107()};
const settlementBeforeCharts107=settlementPage;settlementPage=function(){return s.ended?settlementBeforeCharts107():'<div class="card"><h2>任期尚未结束</h2><p>任期评估在游戏结束后开放。当前指标走势可在国家档案查看。</p><button onclick="changeTab(\'archive\')">查看国家档案</button></div>'};

function activeAlerts107(){
 if(!features107()||s.ended)return [];let alerts=[],add=(id,title,text,tabs,metric=null,slot=null)=>alerts.push({id,title,text,tabs,metric,slot});
 for(let slot of cabinetSlots103()){let item=pstate().cabinet[slot];if(!item)add('vacant:'+slot,office(slot)+'空缺','请在内阁与人事中任命接替者，职位空缺会影响行政运转。',['cabinet'],null,slot);else{let c=pstate().candidates[item.candidate];if(c.loyalty<35)add('loyal:'+slot,office(slot)+'忠诚度偏低',c.name+'忠诚度为 '+fmt(c.loyalty,1)+'。低于35亮起预警；事件冲突使忠诚低于30时可能辞职。',['cabinet'],null,slot)}}
 for(let x of sits().active)add('situation:'+x.id,'未解决局势：'+SIT_NAMES[x.kind],x.kind==='government'?governmentText107(x):'该局势仍在持续，请查看结束条件与每季度影响。',['situations']);
 if(electionForecast().total<50)add('forecast','加权选票不足50%',`当前预测 ${fmt(electionForecast().total,1)}%。回应地方诉求、改善发展与全国支持，可提高加权选票。`,['politics'],'forecast');
 if(s.q%6===5&&v3().offers.some(o=>!o.kept&&pstate().bill?.offer!==o.uid))add('reforms','改革草案将在下季度刷新','尚未查看和保留的改革草案将在下季度改革窗口确认后替换。已查看、已提交与执行中的项目保留。',['reforms']);
 if(s.approval<50)add('approval','全国支持率不足50%',`当前公众支持 ${fmt(s.approval,1)}%。民意影响选举、地区选票与稳定。`,['overview','politics'],'approval');
 if(s.stability<35)add('stability','政治稳定偏低，存在叛乱风险','稳定度低于35；持续低位并伴随地方失信可能触发叛乱。低于20会结束普通模式的游戏。',['overview'],'stability');
 if(s.unemployment>8)add('unemployment','失业率超过8%','就业压力接近大罢工触发区间；失业率达到10%会触发全国大罢工。',['overview'],'unemployment');
 if(s.inflation>45)add('inflation','通胀超过45%','通胀达到50%会触发经济危机，请关注预算与危机处置。',['overview'],'inflation');
 if(s.debt/s.gdp*100>90)add('debt','债务 / GDP 超过90%','债务率达到100%会触发经济危机，请关注赤字、融资成本与偿债措施。',['overview'],'debt');
 if(pstate().judicial<30&&!sits().judicialBan)add('judicial','司法独立偏低','独立度低于30，接近司法公平事件的触发区间；降低至20或更低会触发该局势。',['overview'],'judicial');
 return alerts;
}
// Pure warnings use the reminder channel; they never become mandatory quarterly choices.
const noticeBeforeReminders107=notice;
notice=function(title,text,extra={}){if(title.startsWith('局势出现：')||title==='地方秩序警告')return;noticeBeforeReminders107(title,text,extra)};
function refreshAlerts107(){let f=features107();if(!f)return;let alerts=activeAlerts107(),ids=alerts.map(a=>a.id),previous=f.activeAlerts;f.notices=f.notices.filter(n=>!n.id.startsWith('alert:')||ids.includes(n.id.slice(6)));for(let a of alerts)if(!previous.includes(a.id))addNotice107('alert:'+a.id,a.title,a.text,a.tabs[0]);f.activeAlerts=ids}
function dismissNotices107(){features107().notices=[];save();renderNotices107()}
function renderNotices107(){let node=$('alert-notice'),notices=features107()?.notices||[];node.hidden=!notices.length||!!s.ended;if(node.hidden){node.innerHTML='';return}node.innerHTML=`<div class="notice-header"><b>执政提醒 · ${notices.length}</b><button onclick="dismissNotices107()" aria-label="关闭执政提醒">知道了</button></div><div class="notice-list">${notices.map(n=>`<article><b>${esc(n.title)}</b><p>${esc(n.text)}</p><button onclick="changeTab('${n.tab}')">前往处理 →</button></article>`).join('')}</div><small>提醒不阻止推进季度；问题解决后红点自动消失。</small>`}
function redDot107(text){return `<span class="attention-dot" role="img" aria-label="${esc(text)}" title="${esc(text)}"></span>`}
function decorateAlerts107(){
 if(!document.querySelectorAll)return;let alerts=activeAlerts107();
 for(let node of document.querySelectorAll('#content [data-metric]')){let match=alerts.filter(a=>a.metric===node.dataset.metric);if(match.length){node.classList.add('attention-target');node.insertAdjacentHTML('beforeend',redDot107(match.map(a=>a.title).join('；')))}}
 for(let slot of cabinetSlots103()){let a=alerts.filter(a=>a.slot===slot),node=document.querySelector(`.office[onclick*="'${slot}'"]`);if(a.length&&node){node.classList.add('attention-target');node.insertAdjacentHTML('beforeend',redDot107(a.map(a=>a.title).join('；')))}}
}
const saveBeforeAdditions107=save;
save=function(){if(s?.governance&&features107()){syncCoalition107();refreshAlerts107();record()}saveBeforeAdditions107()};
function visibleTabs107(){return [...politicalTabs,['situations','⚑','局势'],...(s.ended?[['settlement','◷','任期评估']]:[]),...(s.adminMode?[['console','⌨','控制台']]:[])]}
render=function(){
 initPolitics();let r=regime(),list=visibleTabs107();if(!list.some(row=>row[0]===tab))tab='overview';
 $('heading').textContent=tab==='assembly'?r.body:tab==='judiciary'?r.court:list.find(row=>row[0]===tab)[2];$('date').textContent=date()+(s.adminMode?' · 管理员模式':'');
 $('advance').innerHTML=s.ended?'查看任期结算 →':pstate().current?'回复季度事件 →':v3().settlementDue?'选择结算或继续 →':'推进季度 →';
 let alerts=activeAlerts107();$('nav').innerHTML=list.map(row=>{let matches=alerts.filter(a=>a.tabs.includes(row[0]));return `<button class="nav-item ${tab===row[0]?'active':''}" data-nav="${row[0]}" onclick="changeTab('${row[0]}')"><span>${row[1]}</span>${row[0]==='assembly'?r.body:row[2]}${row[0]==='situations'?' · '+sits().active.length:''}${matches.length?redDot107(matches.map(a=>a.title).join('；')):''}</button>`}).join('');
 $('content').innerHTML=({overview,assembly,cabinet,judiciary,politics,budget,reforms:policies,archive,settlement:settlementPage,situations:situationsPage,console:consolePage107})[tab]();decorateAlerts107();renderNotices107();
};
const validBeforeAdditions107=validSave;
validSave=function(v){if(!validBeforeAdditions107(v))return false;if(v.adminMode!==undefined&&typeof v.adminMode!=='boolean')return false;let f=v.features107;if(!f)return true;if(f.version!==1||!Array.isArray(f.activeAlerts)||!f.activeAlerts.every(x=>typeof x==='string')||!Array.isArray(f.notices)||f.notices.some(n=>typeof n.id!=='string'||typeof n.title!=='string'||typeof n.text!=='string'))return false;return (v.situations?.active||[]).filter(x=>x.kind==='government').every(x=>Number.isInteger(x.deadline)&&x.deadline>x.start&&Number.isFinite(x.lastPenaltyQ)&&['original','broken','replacements'].every(k=>Array.isArray(x[k])&&x[k].every(id=>Number.isInteger(id)&&!!v.political.factions[id])))};
