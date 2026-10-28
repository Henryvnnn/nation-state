/* Five ordinary tax bases, with a flat religious levy in both theocratic regimes. */
const TAX_KEYS107=['income','corporate','vat','property','tariff'];
const RELIGIOUS_TAX_NAMES107=['什一税','教会税','寺院捐'];
const TAX_NAMES107={
 constitutional:['国民所得税','公司利得税','消费税','地产税','进口关税'],
 presidential:['个人所得税','企业所得税','消费税','财产税','进口关税'],
 semi:['个人所得税','企业所得税','消费税','不动产税','进口关税'],
 westminster:['个人所得税','公司利得税','增值税','地产税','关税'],
 federal:['联邦个人所得税','联邦企业所得税','国内消费税','不动产税','进口关税'],
 theorepublic:['国民所得税','企业所得税','商品消费税','土地财产税','进口关税'],
 party:['个人所得税','企业利润税','商品流转税','土地使用税','进口关税'],
 symbolic:['个人所得税','企业所得税','商品消费税','财产税','关税'],
 absolute:['臣民所得税','商业利得税','货物税','田产税','关税'],
 aristocratic:['居民所得税','商业利得税','货物税','土地财产税','关税'],
 tyranny:['国民所得税','企业利润税','商品税','土地税','进口关税'],
 theoabsolute:['世俗所得税','商事利得税','货物税','土地税','关税']
};
const TAX_BASES107={income:.48,corporate:.19,vat:.62,property:.2,tariff:.2,tithe:.4};
const TAX_VOTE_STEPS107={income:1,corporate:2,vat:1.5,property:1,tariff:2,tithe:1};
// Net change in the full-support threshold per tax-specific step; negative means support.
const FACTION_TAX_PREFERENCES107={
 conservative:{property:1.5,tariff:-.5,tithe:-.75},
 market:{property:1.5,tariff:1.5,tithe:1},
 social:{property:-1.5,tariff:.25,tithe:1},
 local:{property:1,tariff:-.25,tithe:.5},
 green:{property:-.75,tariff:.5,tithe:1},
 law:{property:.25,tariff:.5,tithe:1.5},
 state:{property:-.75,tariff:-1,tithe:.25},
 reform:{property:-.5,tariff:1,tithe:.5},
 religious:{property:.25,tariff:-.25,tithe:-2}
};
function factionTaxPreferences107(f){const profile=factionProfile(f),key=Object.keys(FACTION_PROFILES103).find(k=>FACTION_PROFILES103[k]===profile);return FACTION_TAX_PREFERENCES107[key]||FACTION_TAX_PREFERENCES107.conservative}
function taxPreferenceText107(f){const preferences=factionTaxPreferences107(f);return taxKeys107().filter(k=>preferences[k]!==undefined).map(k=>`${policyInfo107(k)[0]}每提高${TAX_VOTE_STEPS107[k]}个百分点，门槛${preferences[k]>0?'＋':'−'}${Math.abs(preferences[k])}`).join('；')+'；降税时反向计算。'}
Object.assign(policyMeta,{
 property:['财产税',0,20,'向土地与不动产征税。提高税率增加收入，也会抑制投资并损害支持。'],
 tariff:['进口关税',0,30,'对进口商品征税。提高税率增加收入，但推高进口成本、拖累增长与民意；开放程度越高，增长代价越大。'],
 tithe:['宗教税',0,10,'按固定比例征收，税率可在0%至10%之间调整；0%即停止征收。提高税率增加财政收入，也会加重民众负担。']
});
function religiousTaxName107(seed=s.seed){return RELIGIOUS_TAX_NAMES107[Math.floor(hash(seed+'|religious-tax107')/4294967296*3)]}
function hasReligiousTax107(){return ['theorepublic','theoabsolute'].includes(s?.political?.regime)}
function taxKeys107(){return hasReligiousTax107()?[...TAX_KEYS107,'tithe']:TAX_KEYS107.slice()}
function activePolicyKeys107(){return [...taxKeys107(),...CONSTITUTION_BUDGETS]}
function policyInfo107(key){
 const m=policyMeta[key];if(!m)return null;let i=TAX_KEYS107.indexOf(key);
 const name=i>=0?(TAX_NAMES107[s?.political?.regime]||TAX_NAMES107.presidential)[i]:key==='tithe'?(s?.taxation107?.religiousName||religiousTaxName107()):m[0];
 return [name,m[1],m[2],m[3]];
}
function fillTaxFields107(p,tithe=0){if(!p)return;for(const [key,value]of Object.entries({property:5,tariff:5,tithe}))if(p[key]===undefined)p[key]=value;return p}
function initializeTaxation107(){
 if(!s?.political)return;
 if(s.taxation107?.religiousName==='贡税')s.taxation107.religiousName='寺院捐';
 if(!s.taxation107){
  const tithe=creatingWorld&&hasReligiousTax107()?5:0;
  s.taxation107={version:1,religiousName:religiousTaxName107(),regime:pstate().regime};
  fillTaxFields107(s.policies,tithe);fillTaxFields107(s.effective,tithe);fillTaxFields107(draft,tithe);
  if(pstate().bill?.kind==='budget')fillTaxFields107(pstate().bill.policies);
  // The two ordinary bases split the old fixed 3% receipt: 1% + 5×.2 + 5×.2.
  // Existing budgets keep their revenue; only a new theocracy starts with a levy.
  if(creatingWorld&&tithe){s.baselineRevenue+=tithe*TAX_BASES107.tithe;s.lastBalance=balance()}
 }
 if(s.taxation107.regime!==pstate().regime){
  s.taxation107.regime=pstate().regime;
  if(!hasReligiousTax107())for(const p of [s.policies,s.effective,draft,pstate().bill?.kind==='budget'?pstate().bill.policies:null])if(p)p.tithe=0;
 }
}
const initBeforeTaxation107=initPolitics;
initPolitics=function(){initBeforeTaxation107();initializeTaxation107()};
const capBeforeTaxation107=budgetCap;
budgetCap=function(key){return key==='tithe'?(hasReligiousTax107()?10:0):capBeforeTaxation107(key)};
function taxRate107(p,key){let value=p?.[key]??(['property','tariff'].includes(key)?5:0);return key==='tithe'?(hasReligiousTax107()?clamp(value,0,10):0):value}
revenue=function(p=s.policies){return 1+taxKeys107().reduce((total,k)=>total+taxRate107(p,k)*TAX_BASES107[k],0)};
function taxEconomicEffects107(p){
 const property=taxRate107(p,'property')-5,tariff=taxRate107(p,'tariff')-5,tithe=taxRate107(p,'tithe');
 return {growth:-property*.015-tariff*types[s.type].open*.04,inflation:tariff*.02,approval:-property*.12-tariff*.1-tithe*.25};
}
function budgetMarketShift107(before,after){return (before.income-after.income)+(before.corporate-after.corporate)*.5+(before.vat-after.vat)*.3+(taxRate107(before,'property')-taxRate107(after,'property'))*.5+(taxRate107(before,'tariff')-taxRate107(after,'tariff'))*.5+(taxRate107(before,'tithe')-taxRate107(after,'tithe'))*.3}
function assessmentTaxLoad107(){return s.policies.income+s.policies.corporate+s.policies.vat+(taxRate107(s.policies,'property')-5)*.5+(taxRate107(s.policies,'tariff')-5)*.5+taxRate107(s.policies,'tithe')*.5}
function taxVotingText107(){return TAX_KEYS107.slice(0,3).map(k=>`${policyInfo107(k)[0]}每提高${TAX_VOTE_STEPS107[k]}个百分点`).join('、')+'，全票门槛各＋1，降税相反。财产／土地税、关税和可征收的宗教税按各派系偏好增减门槛；详见各派系的“查看细则”。'}
const requirementBeforeTaxation107=budgetRequirement;
budgetRequirement=function(f){const base=requirementBeforeTaxation107(f),b=pstate().bill;if(b?.kind!=='budget')return base;const pref=factionTaxPreferences107(f);return base+['property','tariff','tithe'].reduce((sum,k)=>sum+(taxRate107(b.policies,k)-taxRate107(s.policies,k))/TAX_VOTE_STEPS107[k]*pref[k],0)};
const preferenceBeforeTaxation107=preferenceText103;
preferenceText103=function(f){return preferenceBeforeTaxation107(f)+'；'+taxPreferenceText107(f)};
function taxRevenueText107(){return taxKeys107().map(k=>`${policyInfo107(k)[0]}税率×${TAX_BASES107[k]}`).join('＋')+'＋其他收入1%。'}
budgetSummary=function(p){
 return `<div class="row"><span data-guide="revenue">预计财政收入</span><b>${fmt(revenue(p))}% GDP</b></div><div class="row"><span data-guide="spending">公共支出（含固定行政 3%）</span><b>${fmt(spend(p))}% GDP</b></div><div class="row"><span data-guide="interest">利息支出</span><b>${fmt(interest())}% GDP</b></div><div class="row"><span data-guide="balance">预计${balance(p)>=0?'盈余':'赤字'}</span><b class="${balance(p)>=0?'good':'bad'}">${fmt(balance(p))}% GDP</b></div><details class="tax-breakdown"><summary>查看税收细则</summary><p>各税率针对各自税基，不能直接相加作为收入占GDP比例。按当前GDP年化估算：</p>${taxKeys107().map(k=>`<div class="row"><span>${esc(policyInfo107(k)[0])}</span><b>${fmt(taxRate107(p,k)*TAX_BASES107[k],2)}% GDP</b></div>`).join('')}<div class="row"><span>其他收入</span><b>1.00% GDP</b></div><p>${esc(taxRevenueText107())}</p><p>${esc(taxVotingText107())}执政党同样按自身偏好计算，公共预算偏好另计。</p><p>预算通过后改变财政收支；投资、价格与民意影响每季度传导约35%。财产税与关税以5%为中性基准；财产税每高1个百分点，增长目标−0.015、民意目标−0.12。关税每高1个百分点，增长目标−0.04×经济开放系数、当季通胀压力＋0.02、民意目标−0.1；低于基准时相反。${hasReligiousTax107()?'宗教税每提高1个百分点，财政收入＋0.4% GDP、民意目标−0.25。三种宗教税名称效果相同；税率上限固定10%，不随公共预算释宪扩展。':''}</p></details>`;
};
const changeBeforeTaxation107=changePolicy;
changePolicy=function(k,v){if(!activePolicyKeys107().includes(k)||!Number.isFinite(+v))return;return changeBeforeTaxation107(k,v)};
const budgetBeforeTaxation107=proposeBudget;
proposeBudget=function(){initializeTaxation107();fillTaxFields107(draft);for(const k of Object.keys(policyMeta)){if(!Number.isFinite(draft[k]))return toast('预算草案存在无效数值');draft[k]=clamp(draft[k],policyMeta[k][1],budgetCap(k))}return budgetBeforeTaxation107()};
// Older releases captured the original function in this button alias.
applyPolicy=function(){return proposeBudget()};
const consoleBeforeTaxation107=consoleFields107;
consoleFields107=function(){return consoleBeforeTaxation107().filter(f=>!/^policies\.|^effective\./.test(f.key)||activePolicyKeys107().includes(f.key.split('.')[1])).map(f=>{if(!/^policies\.|^effective\./.test(f.key))return f;const k=f.key.split('.')[1];f.label=policyInfo107(k)[0]+'（%）';if(TAX_KEYS107.includes(k)||k==='tithe')f.group=f.key.startsWith('policies.')?'已通过税收政策':'实际生效税收政策';if(['property','tariff','tithe'].includes(k)){f.min=policyMeta[k][1];f.max=budgetCap(k);const set=f.set;f.set=value=>set(clamp(value,f.min,f.max))}return f})};
const validBeforeTaxation107=validSave;
validSave=function(v){
 if(!v?.policies||!v.effective)return false;
 const meta=v.taxation107;
 if(meta&&(meta.version!==1||(!RELIGIOUS_TAX_NAMES107.includes(meta.religiousName)&&meta.religiousName!=='贡税')||!REGIMES.some(r=>r.id===meta.regime)))return false;
 const sets=[v.policies,v.effective,...(v.political?.bill?.kind==='budget'?[v.political.bill.policies]:[])];
 for(const p of sets){if(!p)return false;for(const k of ['property','tariff','tithe']){if(p[k]===undefined){if(meta)return false}else if(!Number.isFinite(p[k])||p[k]<0||p[k]>policyMeta[k][2])return false}}
 // Validate a copy so opening/importing a legacy save never modifies the input.
 const copy={...v,policies:fillTaxFields107({...v.policies}),effective:fillTaxFields107({...v.effective})};
 if(v.political?.bill?.kind==='budget')copy.political={...v.political,bill:{...v.political.bill,policies:fillTaxFields107({...v.political.bill.policies})}};
 return validBeforeTaxation107(copy);
};
