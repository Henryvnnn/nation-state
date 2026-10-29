/* Decision-only ideology assessment. Economic outcomes remain in the historical charts. */
const DECISION_WEIGHTS107={
 budget:{name:'财政预算',weight:12,cap:24},amendment:{name:'生效修宪',weight:12,cap:24},
 faction:{name:'党内路线',weight:10,cap:10},head:{name:'政府首脑任命',weight:10,cap:20},
 minister:{name:'部长任免',weight:5,cap:15},programme:{name:'部长议程',weight:6,cap:18},
 coercion:{name:'重大强制或和解决定',weight:6,cap:18},interpretation:{name:'释宪',weight:4,cap:8},
 judicial:{name:'司法决定',weight:3,cap:6},coalition:{name:'联合政府',weight:3,cap:6},
 reform:{name:'结构性改革',weight:2,cap:6},situation:{name:'一般局势处置',weight:2,cap:6},
 task:{name:'主动任务指令',weight:1,cap:3},event:{name:'普通事件与协商',weight:1,cap:6},
 procedure:{name:'程序性步骤',weight:0,cap:0},automatic:{name:'例行施政与结果',weight:0,cap:0}
};
function decisionAxes107(axes){return Object.fromEntries(Object.entries(axes||{}).filter(([k,v])=>AXES.includes(k)&&Number.isFinite(v)).map(([k,v])=>[k,clamp(v,-4,4)]))}
function legacyDecisionKind107(d){
 const label=d.label||'';
 if(/执行：|^完成|^兑现承诺$|^未兑现承诺$|^撤换/.test(label))return 'automatic';
 if(/^提出|^议事机关通过|^议程表决失败/.test(label))return 'procedure';
 if(label==='通过财政预算')return 'budget';
 if(/^转向|^继续支持/.test(label))return 'faction';
 if(/^任命法官|^司法互动|法官施压|贿赂法官|司法政治交换|公开法律论证/.test(label))return 'judicial';
 if(/^任命/.test(label))return /为.*(宰相|首相|总理)$/.test(label)&&!/副/.test(label)?'head':'minister';
 if(/强行颁行|镇压|强制迁徙|强制同化|禁止一切抗议/.test(label))return 'coercion';
 if(/^修订|^社会多元修正案|^增加竞争性选举/.test(label))return 'amendment';
 if(/^关于/.test(label))return 'interpretation';
 if(/^启动/.test(label))return 'reform';
 if(/组建联合政府/.test(label))return 'coalition';
 if(/任务：/.test(label))return 'task';
 if(/提案：/.test(label))return 'programme';
 return 'event';
}
function situationAssessmentKind107(x,key){
 if(x.kind==='spring'&&['dialogue','release','reform','constitution','crackdown'].includes(key)||x.kind==='justice'&&['revoke','control','ban'].includes(key)||x.kind==='rebellion'&&['talk','amnesty','limited','emergency'].includes(key)||x.kind==='scandal'&&['investigate','suppress'].includes(key))return 'coercion';
 return 'situation';
}
function eventAssessmentKind107(e,o){
 if(/镇压|禁止.*抗议|武力清场|紧急状态|强制迁徙|强制同化/.test(o.label))return 'coercion';
 if(/抗议|示威|动乱|镇压|叛乱|民主化/.test(e.title)&&/对话|谈判|拒绝.*镇压|和平|赦免|释放/.test(o.label))return 'coercion';
 return e.type==='minister'?'programme':'event';
}
function budgetDecisionEvidence107(before,after){
 const changes=[],sums={},masses={},fiscal={};let size=0;
 const add=(axis,value,mass)=>{sums[axis]=(sums[axis]||0)+value*mass;masses[axis]=(masses[axis]||0)+mass};
 const fiscalAdd=(key,value,mass)=>{fiscal[key]??={sum:0,mass:0};fiscal[key].sum+=value*mass;fiscal[key].mass+=mass};
 for(const k of activePolicyKeys107()){
  if(!Number.isFinite(before[k])||!Number.isFinite(after[k])||Math.abs(after[k]-before[k])<1e-8)continue;
  const min=policyMeta[k][1],max=budgetCap(k),range=Math.max(1,max-min),delta=Math.min(1,Math.abs(after[k]-before[k])/range),position=clamp((after[k]-min)/range,0,1);
  changes.push({key:k,name:policyInfo107(k)[0],before:before[k],after:after[k],min,max});size+=delta;
  if(taxKeys107().includes(k)){const mass=delta*TAX_BASES107[k];add('market',4-position*8,mass);fiscalAdd('tax',position,mass);if(k==='tariff')add('nation',position*8-4,delta)}
  if(['health','welfare','education'].includes(k)){const mass=delta*({health:.35,welfare:.5,education:.15})[k];add('welfare',position*8-4,mass);if(k!=='education')fiscalAdd('services',position,mass)}
  if(['infrastructure','education'].includes(k))fiscalAdd('investment',position,delta);
  if(k==='security'){add('military',(position*8-4)*.5,delta);fiscalAdd('security',position,delta)}
 }
 return {axes:Object.fromEntries(Object.keys(sums).map(k=>[k,sums[k]/masses[k]])),weight:changes.length?Math.min(12,size*8):0,changes,fiscal:Object.fromEntries(Object.entries(fiscal).map(([k,v])=>[k,{score:v.sum/v.mass,mass:v.mass}]))};
}
function annotateDecision107(entry,meta){
 const kind=meta?.kind||legacyDecisionKind107(entry),rule=DECISION_WEIGHTS107[kind]||DECISION_WEIGHTS107.event;
 let item={version:2,kind:DECISION_WEIGHTS107[kind]?kind:'event',axes:decisionAxes107(entry.axes),weight:rule.weight};
 if(meta?.kind==='budget')Object.assign(item,budgetDecisionEvidence107(meta.before,meta.after));
 if(Number.isFinite(meta?.weight))item.weight=clamp(meta.weight,0,rule.weight);
 if(meta?.identity)item.identity=String(meta.identity);
 if(!Object.keys(item.axes).length)item.weight=0;
 entry.assessment107=item;
}
function decisionEvidence107(){
 return v3().decisions.map((d,index)=>{
  if(d.assessment107)return {q:d.q,label:d.label,index,...d.assessment107,legacy:false};
  const kind=legacyDecisionKind107(d),rule=DECISION_WEIGHTS107[kind],axes=decisionAxes107(d.axes);
  // Historical programme steps lack exact credited progress: keep a conservative per-step weight.
  return {q:d.q,label:d.label,index,kind,axes,weight:Object.keys(axes).length?(kind==='programme'?1:rule.weight):0,legacy:true};
 });
}
function decisionProfile107(records){
 const categories={};for(const d of records)if(d.weight>0)categories[d.kind]=(categories[d.kind]||0)+d.weight;
 const scales=Object.fromEntries(Object.entries(categories).map(([kind,weight])=>[kind,Math.min(1,DECISION_WEIGHTS107[kind].cap/weight)]));
 const totals=AXES.map(()=>0),weights=AXES.map(()=>0),fiscal={};
 for(const d of records){const w=d.weight*(scales[d.kind]||0);if(!w)continue;
  AXES.forEach((key,i)=>{if(Object.prototype.hasOwnProperty.call(d.axes,key)){totals[i]+=d.axes[key]*w;weights[i]+=w}});
  for(const [key,x]of Object.entries(d.fiscal||{})){const mass=x.mass*w;fiscal[key]??={sum:0,mass:0};fiscal[key].sum+=x.score*mass;fiscal[key].mass+=mass}
 }
 return {vector:totals.map((v,i)=>weights[i]?clamp(50+v/weights[i]*12.5,0,100):50),weights,categories:Object.entries(categories).map(([kind,raw])=>({kind,name:DECISION_WEIGHTS107[kind].name,raw,effective:raw*scales[kind]})),fiscal:Object.fromEntries(Object.entries(fiscal).map(([k,x])=>[k,x.sum/x.mass])),scales};
}
function decisionDiagnosis107(profile){
 const x=profile.fiscal,labels=[];
 if(x.tax>=.75&&x.services<=.25)labels.push('财政汲取','民生紧缩');
 else{if(x.tax>=.75)labels.push('高税收取向');else if(x.tax<=.25)labels.push('低税收取向');if(x.services>=.75)labels.push('民生扩张');else if(x.services<=.25)labels.push('民生紧缩')}
 if(x.investment>=.75)labels.push('生产与科研投资优先');
 if(profile.weights[2]&&profile.vector[2]>=75)labels.push('行政集中');
 if(profile.weights[3]&&profile.vector[3]>=75)labels.push('法治制衡');
 if(profile.weights[3]&&profile.vector[3]<=25)labels.push('弱化司法约束');
 return labels.length?labels:['依已记录决策形成的治理画像'];
}
assessment=function(){
 const records=decisionEvidence107(),profile=decisionProfile107(records),observed=profile.weights.filter(w=>w>0).length;
 // The regime only selects the pre-existing label catalogue, never the score/vector.
 const list=regime().democratic?DEMO_IDEOLOGIES:[...NONDEMO_IDEOLOGIES,...(v3().socialist?SOCIALIST_IDEOLOGIES:[])];
 const axisWeights=profile.weights.map(w=>Math.min(12,w)),total=axisWeights.reduce((a,b)=>a+b,0);
 const fits=list.map(([name,target])=>{const distance=total?Math.sqrt(target.reduce((sum,t,i)=>sum+(t-profile.vector[i])**2*axisWeights[i],0)/total):100;return {name,percent:total?clamp(Math.round(100-distance*1.2),0,100):0,distance}}).sort((a,b)=>a.distance-b.distance||a.name.localeCompare(b.name,'zh'));
 const avg=k=>{const vals=s.history.map(h=>h[k]).filter(Number.isFinite);return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0};
 const evidence=records.filter(d=>d.weight>0).map(d=>({...d,effective:d.weight*profile.scales[d.kind]})).sort((a,b)=>b.effective-a.effective||b.q-a.q||b.index-a.index);
 const sufficient=observed>=3&&profile.categories.reduce((a,c)=>a+c.effective,0)>=8;
 return {version:2,fits:total?fits.slice(0,3):[],all:fits,vector:profile.vector,axisWeights:profile.weights,observed,decisions:evidence.length,recorded:records.length,categories:profile.categories,diagnosis:decisionDiagnosis107(profile),fiscal:profile.fiscal,evidence:evidence.slice(0,12),legacyCount:evidence.filter(d=>d.legacy).length,sufficient,strongFit:sufficient&&fits[0]?.percent>=75,averages:{approval:avg('approval'),unemployment:avg('unemployment'),stability:avg('stability')}};
};
function initializeDecisionAssessment107(){
 if(!s.decisionAssessment107)s.decisionAssessment107={version:2,startedQ:s.q};
 if(v3().settlement&&v3().settlement.assessment?.version!==2)v3().settlement.assessment=assessment();
}
const initBeforeDecisionAssessment107=initPolitics;
initPolitics=function(){initBeforeDecisionAssessment107();initializeDecisionAssessment107()};
function assessmentChangesHTML107(d){return (d.changes||[]).map(x=>`${esc(x.name)} ${fmt(x.before,1)}% → ${fmt(x.after,1)}%`).join('；')}
settlementPage=function(){
 const g=v3(),report=g.settlement||{q:s.q,reason:'任期进行中',assessment:assessment(),final:snapshot()},a=report.assessment;
 return `<div class="political-banner"><div><span class="tag">任期结算 / ${esc(regime().name)}</span><h2>${fmt(report.q/6)} 年，${report.q} 个季度的选择。</h2><p>${esc(report.reason)} · 已纳入 ${a.decisions} 项主动决策。</p></div><button onclick="newDialog()">开启新历史 →</button></div><section class="card assessment-diagnosis"><span class="tag">施政特征</span><h2>${a.decisions?a.diagnosis.map(esc).join(' · '):'尚无可评估的主动决策'}</h2><p>${!a.decisions?'需要有实际的政策选择，才能形成治理画像。':!a.sufficient?'已记录的决策覆盖面有限，以下标签仅供比较。':a.strongFit?'下列倾向与已记录决策最为接近。':'现有倾向标签与这组决策的契合有限，以下仅列出相对接近者。'}</p></section><div class="section-label"><h3>统治倾向契合度</h3><span>仅依据主动选择 · 已有 ${a.observed}/9 维决策依据</span></div>${a.fits.length&&!a.strongFit?'<details class="assessment-comparison"><summary>查看三个相对接近的倾向 · 仅供比较</summary>':''}<div class="cards3 ideology-cards">${a.fits.map((f,i)=>`<div class="card"><span class="tag">${i+1} / 相对接近</span><div class="big-number">${f.percent}<small>%</small></div><h2>${esc(f.name)}</h2><div class="bar"><i style="width:${f.percent}%"></i></div><p>${f.percent>=75&&a.sufficient?'较高契合':f.percent>=50?'部分契合':'低契合'}</p></div>`).join('')}</div>${a.fits.length&&!a.strongFit?'</details>':''}<div class="grid"><section class="card"><h3>评估依据</h3><p>画像来自你实际作出的调整、任命与选择。开局配置、未调整政策、官员自主施政和经济自然变化不计入倾向评分。</p>${AXES.map((k,i)=>`<div class="row"><span>${AXIS_NAMES[i]}</span><b>${a.axisWeights[i]>0?fmt(a.vector[i],0)+'/100':'暂无依据'}</b></div>`).join('')}<details class="assessment-rules"><summary>查看权重与计算细则</summary><p>大幅预算调整、生效修宪权重最高12；党内路线和政府首脑任命10；部长任免5、完整部长议程6、重大镇压或和解决定6；释宪4、司法决定3；改革和一般局势2；普通事件与主动任务指令1。预算按实际调整幅度计权，未改动项目不作为证据。</p><p>部长议程按本次实际推进比例分摊6点权重，达到100%后不重复计入。提交、表决等程序步骤及提案完成本身不重复加分；未变更预算不形成新证据。</p><p>各类记录先按权重汇总，再限制其累计影响，避免大量普通事件淹没重大决策。各维只平均涉及该维的记录；缺乏依据的维度不参与匹配。</p>${a.categories.map(c=>`<div class="row"><span>${esc(c.name)}</span><b>${fmt(c.effective,2)} / 上限${DECISION_WEIGHTS107[c.kind].cap}</b></div>`).join('')}<p>契合度＝100−决策维度加权均方根距离×1.2，最低0。每维比较权重最多12；三项契合度无需合计100%。政体仅限定可用倾向列表，不为任何维度预设立场。财政汲取描述高税收配合低民生支出的政策组合。</p></details>${a.legacyCount?'<details><summary>查看早期决策记录说明</summary><p>早期记录缺少部分预算前后值和明确分类，仅使用当时保存的决策方向；不根据当前税率、初始数据或最终指标反推缺失选择。早期部长议程步骤以保守权重计入。</p></details>':''}<details><summary>查看任期平均指标</summary><p>平均支持 ${fmt(a.averages.approval)}%，平均失业 ${fmt(a.averages.unemployment)}%，平均稳定 ${fmt(a.averages.stability)}。这些结果用于回顾任期，不参与意识形态匹配。</p></details></section><section class="card"><h3>主要决策依据</h3><p>按实际评估权重排序。</p>${a.evidence.map(d=>`<div class="news"><div><time>第${d.q}季度</time><h4>${esc(d.label)}</h4><p>${DECISION_WEIGHTS107[d.kind].name} · 权重 ${fmt(d.effective,2)}${d.legacy?' · 早期记录':''}</p>${d.changes?.length?`<details><summary>查看预算调整</summary><p>${assessmentChangesHTML107(d)}</p></details>`:''}<p>${Object.entries(d.axes).map(([k,v])=>`${AXIS_NAMES[AXES.indexOf(k)]} ${fmt(50+v*12.5,0)}/100`).join(' · ')}</p></div></div>`).join('')||'<p>尚无主动决策记录。</p>'}<details><summary>查看全部可用倾向与契合度</summary>${a.all.map(f=>`<div class="row"><span>${esc(f.name)}</span><b>${a.decisions?f.percent+'%':'暂无依据'}</b></div>`).join('')}</details></section></div>${historyCharts107(report.final)}`;
};
const validBeforeDecisionAssessment107=validSave;
validSave=function(v){
 if(!validBeforeDecisionAssessment107(v))return false;
 const state=v.decisionAssessment107;if(state&&(state.version!==2||!Number.isInteger(state.startedQ)||state.startedQ<0))return false;
 return (v.governance?.decisions||[]).every(d=>{const a=d.assessment107;if(!a)return true;if(a.version!==2||!DECISION_WEIGHTS107[a.kind]||!Number.isFinite(a.weight)||a.weight<0||a.weight>12||!a.axes||Object.entries(a.axes).some(([k,n])=>!AXES.includes(k)||!Number.isFinite(n)||Math.abs(n)>4))return false;if(a.changes&&(!Array.isArray(a.changes)||a.changes.some(x=>!policyMeta[x.key]||typeof x.name!=='string'||!['before','after','min','max'].every(k=>Number.isFinite(x[k])))))return false;return !a.fiscal||Object.entries(a.fiscal).every(([k,x])=>['tax','services','investment','security'].includes(k)&&Number.isFinite(x.score)&&x.score>=0&&x.score<=1&&Number.isFinite(x.mass)&&x.mass>0)});
};
