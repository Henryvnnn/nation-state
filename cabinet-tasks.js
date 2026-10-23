/* 1.0.5 — portfolio-specific standing orders. Values are per-quarter baselines. */
const LEADERSHIP_TASKS105=Object.keys(TASKS);
const DEPARTMENT_TASKS105={
 foreign:[
  {id:'foreign_populist',name:'民粹型外交',text:'以强硬公开表态凝聚国内支持，但增加外交摩擦。',values:{approval:.65,confidence:-.45,stability:-.1,cost:.04},axes:{populism:2,nation:2},traits:[3,4,6]},
  {id:'foreign_prudent',name:'稳健型外交',text:'以持续谈判缓解紧张，增加稳定与信心，需承担外交协调支出。',values:{stability:.35,confidence:.35,cost:.06},axes:{law:1,elite:1},traits:[0,1,5]},
  {id:'foreign_trade',name:'经济扩张型外交',text:'组织贸易与投资谈判，提振信心和短期增长；开放竞争会带来就业调整。',values:{confidence:.6,growth:.08,unemployment:.06,cost:.1},axes:{market:2,nation:-1},tags:['trade'],traits:[7,8]}
 ],
 defence:[
  {id:'defence_readiness',name:'国防整备',text:'改善训练与后勤，提高稳定，但增加军费和市场担忧。',values:{stability:.55,confidence:-.15,cost:.16},axes:{military:2,nation:1},tags:['security'],traits:[4,6]},
  {id:'defence_civil',name:'军民协同建设',text:'开展救灾训练与军民基础设施协作，增加就业和基建资本，财政负担较重。',values:{capitalStock:.2,unemployment:-.08,approval:.2,cost:.18},axes:{military:1,welfare:1},tags:['industry'],traits:[3,5,7]},
  {id:'defence_professional',name:'军队专业化',text:'以公开采购和职业训练改善纪律、稳定与信心，需要持续投入。',values:{stability:.3,confidence:.3,judicial:.15,cost:.12},axes:{military:1,law:1,elite:1},traits:[0,1,8]}
 ],
 justice:[
  {id:'justice_independent',name:'保障司法独立',text:'保障审判程序与监督，提高独立和信心，但既得利益阻力会降低短期稳定。',values:{judicial:.8,confidence:.15,stability:-.2,cost:.06},axes:{law:2,authority:-1},traits:[1,8]},
  {id:'justice_aid',name:'扩大法律援助',text:'为低收入居民提供诉讼服务，改善支持与法治，需要公共支出。',values:{approval:.45,judicial:.3,cost:.1},axes:{law:1,welfare:2},tags:['welfare'],traits:[0,3,5,7]},
  {id:'justice_control',name:'强化行政司法协同',text:'强化行政机关对司法流程的协调，提升短期稳定，但削弱独立与公众信任。',values:{stability:.6,judicial:-.65,approval:-.3,cost:.04},axes:{authority:2,law:-2},traits:[4,6]}
 ],
 interior:[
  {id:'interior_service',name:'改善地方公共服务',text:'增加基层服务和救助，改善支持、稳定与地方民生，需持续拨款。',values:{approval:.4,stability:.25,cost:.14},axes:{welfare:2,authority:-1},tags:['welfare'],traits:[3,5,7]},
  {id:'interior_security',name:'强化治安管控',text:'集中资源维持治安，稳定提升较快，但损害支持和司法独立。',values:{stability:.65,approval:-.25,judicial:-.3,cost:.1},axes:{authority:2,law:-1},tags:['security'],traits:[4,6]},
  {id:'interior_admin',name:'简化行政流程',text:'整顿办事程序和地方审批，提升信心与稳定，承担行政改造费用。',values:{confidence:.35,stability:.2,cost:.06},axes:{law:1,elite:1},traits:[0,1,8]}
 ],
 education:[
  {id:'education_basic',name:'普及基础教育',text:'增加城乡基础教育供给，提升人力资本和支持，需要持续投入。',values:{human:.4,approval:.25,cost:.16},axes:{welfare:2},tags:['welfare','agriculture'],traits:[0,3,5]},
  {id:'education_research',name:'推进科研合作',text:'推动高校与企业研究合作，提高人力资本和信心，同时承担研发费用。',values:{human:.5,confidence:.3,cost:.2},axes:{market:1,elite:2},tags:['technology'],traits:[1,6,8]},
  {id:'education_vocational',name:'发展职业教育',text:'提供职业培训与转岗课程，降低失业、提高人力资本，需培训经费。',values:{human:.2,unemployment:-.14,cost:.12},axes:{welfare:1,market:1},tags:['industry'],traits:[7]}
 ],
 health:[
  {id:'health_primary',name:'强化基层医疗',text:'扩充基层诊疗与护理服务，提高支持和稳定，需要卫生支出。',values:{approval:.5,stability:.25,cost:.18},axes:{welfare:2},tags:['welfare','agriculture'],traits:[3,5,7]},
  {id:'health_prevention',name:'疾病预防与卫生教育',text:'加强预防接种与健康教育，提高人力资本和稳定，需持续投入。',values:{human:.25,stability:.3,cost:.1},axes:{welfare:1,elite:1},traits:[0,1,6]},
  {id:'health_efficiency',name:'优化医院运营',text:'合并低效采购和管理流程，节约支出、提振信心，但会增加短期失业与不满。',values:{cost:-.1,confidence:.25,unemployment:.06,approval:-.25},axes:{market:1,elite:1},traits:[4,8]}
 ],
 culture:[
  {id:'culture_public',name:'普惠文化服务',text:'资助社区文化设施和公共活动，提高支持、文化基础与就业，需公共投入。',values:{approval:.45,culture:.08,unemployment:-.05,cost:.12},axes:{welfare:1,populism:1},tags:['culture'],traits:[0,3,5,7]},
  {id:'culture_heritage',name:'保护文化遗产',text:'修缮遗产并支持地方传承，增加文化基础和稳定，需要维护费用。',values:{culture:.12,stability:.3,cost:.12},axes:{nation:1,green:1},tags:['culture'],traits:[4,6]},
  {id:'culture_exchange',name:'拓展文化交流',text:'支持文化出口与交流活动，增加文化基础、信心和短期增长，需推广经费。',values:{culture:.06,confidence:.35,growth:.04,cost:.1},axes:{market:1,law:1},tags:['trade','culture'],traits:[1,8]}
 ],
 labour:[
  {id:'labour_employment',name:'就业促进',text:'提供就业匹配和企业招工支持，降低失业、改善支持，需要就业服务经费。',values:{unemployment:-.18,approval:.3,cost:.18},axes:{welfare:2,nation:1},tags:['industry','welfare'],traits:[4,6]},
  {id:'labour_rights',name:'劳动权益保障',text:'加强劳动监察与工时保障，提高支持和稳定，但增加企业合规压力与财政支出。',values:{approval:.45,stability:.25,confidence:-.2,cost:.1},axes:{welfare:2,law:1},tags:['welfare','industry'],traits:[3,5]},
  {id:'labour_mediation',name:'劳资协商',text:'通过协商缓解劳资争议，改善稳定、投资信心和就业，需要协调经费。',values:{stability:.35,confidence:.2,unemployment:-.05,cost:.06},axes:{law:1,welfare:1},tags:['industry'],traits:[0,1,7,8]}
 ],
 environment:[
  {id:'environment_restore',name:'生态修复',text:'修复水土与公共绿地，增加基建资本和支持，但治理费用较高。',values:{capitalStock:.3,approval:.25,cost:.16},axes:{green:2,welfare:1},tags:['green','agriculture'],traits:[0,3,5]},
  {id:'environment_enforce',name:'严格环保执法',text:'提高环保标准与治理能力；短期停产整顿会降低增长并增加失业。',values:{capitalStock:.35,approval:.15,growth:-.06,unemployment:.08,cost:.08},axes:{green:2,law:1,authority:1},tags:['green'],traits:[1,4,6]},
  {id:'environment_transition',name:'推动绿色产业转型',text:'支持清洁产业和转岗，增加就业、信心与基建资本，财政投入最高。',values:{capitalStock:.2,confidence:.25,unemployment:-.1,cost:.2},axes:{green:2,market:1},tags:['green','technology'],traits:[7,8]}
 ]
};
const DEPARTMENT_ECONOMY105={id:'department_economy',name:'改善本部门财政',text:'审计本部门采购、压缩低效开支，以节约财政和提高信心为主；服务收缩会降低支持。',values:{cost:-.12,confidence:.25,approval:-.35},axes:{market:1,welfare:-1},traits:[2]};
for(let task of [DEPARTMENT_ECONOMY105,...Object.values(DEPARTMENT_TASKS105).flat()])TASKS[task.id]=task.name;
function cabinetTaskOptions105(k){return (DEPARTMENT_TASKS105[k]?['balanced','department_economy',...DEPARTMENT_TASKS105[k].map(t=>t.id)]:LEADERSHIP_TASKS105).map(id=>[id,TASKS[id]])}
function departmentTask105(k,item,c){
 let choices=DEPARTMENT_TASKS105[k];if(!choices)return null;
 if(item.task==='department_economy'||item.task==='balanced'&&c.trait===2)return DEPARTMENT_ECONOMY105;
 return choices.find(t=>t.id===item.task)||(item.task==='balanced'?choices.find(t=>t.traits.includes(c.trait))||choices[0]:null);
}
function departmentScale105(c){return clamp((.4+c.skill/140)*(.6+c.loyalty/200),.35,1.5)}
function departmentValues105(task,c){return Object.fromEntries(Object.entries(task.values).map(([k,v])=>[k,v*departmentScale105(c)]))}
function departmentImpact105(values){return formatEffectText106(values,{costLabel:'财政支出',costUnit:'% GDP',empty:'无额外指标变化'})}
function taskStatus105(k,item){return item?`<small class="office-task" data-office-task="${k}">本季任务：${esc(TASKS[item.task]||TASKS.balanced)}</small>`:''}
function taskExplanation105(k){
 let item=pstate().cabinet[k],c=item?pstate().candidates[item.candidate]:null;if(!c)return '';
 let task=departmentTask105(k,item,c);if(!task)return '';
 return `<div class="task-brief"><b>${item.task==='balanced'?'自主判断 · 当前倾向：':''}${task.name}</b><p>${task.text}</p><p>按当前能力与忠诚，任务成功时的额外效果：${departmentImpact105(departmentValues105(task,c))}。</p><small>方向持续至再次更改，每次推进季度执行一次。另计官员倾向与部门基础效果；执行受阻时效果与财政节约降至30%，投入仍全额支出。${task.values.growth?'增长影响持续1季度。':''}${k==='education'?'此处的人力资本不同于科研等级；科研进度仍由教育预算与教育现代化提案计算。':''}</small></div>`;
}
function recordDepartmentTask105(k,task,success){noteDecision(`${office(k)}执行：${task.name}`,Object.fromEntries(Object.entries(task.axes).map(([axis,v])=>[axis,v*(success?1:.3)])),success?task.tags||[]:[],null,.12)}
const LEGACY_DEPARTMENT_TASKS105={
 foreign:{social:'foreign_populist',order:'foreign_prudent',law:'foreign_prudent',industry:'foreign_trade',agriculture:'foreign_trade',technology:'foreign_trade',green:'foreign_prudent'},
 defence:{social:'defence_civil',order:'defence_readiness',law:'defence_professional',industry:'defence_civil',agriculture:'defence_civil',technology:'defence_professional',green:'defence_civil'},
 justice:{social:'justice_aid',order:'justice_control',law:'justice_independent',industry:'justice_aid',agriculture:'justice_aid',technology:'justice_independent',green:'justice_aid'},
 interior:{social:'interior_service',order:'interior_security',law:'interior_admin',industry:'interior_admin',agriculture:'interior_service',technology:'interior_admin',green:'interior_service'},
 education:{social:'education_basic',order:'education_basic',law:'education_basic',industry:'education_vocational',agriculture:'education_basic',technology:'education_research',green:'education_basic'},
 health:{social:'health_primary',order:'health_prevention',law:'health_prevention',industry:'health_efficiency',agriculture:'health_primary',technology:'health_prevention',green:'health_prevention'},
 culture:{social:'culture_public',order:'culture_heritage',law:'culture_exchange',industry:'culture_exchange',agriculture:'culture_heritage',technology:'culture_exchange',green:'culture_heritage'},
 labour:{social:'labour_rights',order:'labour_mediation',law:'labour_rights',industry:'labour_employment',agriculture:'labour_employment',technology:'labour_employment',green:'labour_mediation'},
 environment:{social:'environment_restore',order:'environment_enforce',law:'environment_enforce',industry:'environment_transition',agriculture:'environment_restore',technology:'environment_transition',green:'environment_restore'}
};
function migrate105(){
 if(s.release105)return;
 if(!creatingWorld)try{localStorage.setItem(KEY+'-pre-105',JSON.stringify(s))}catch(_){}
 for(let [k,item]of Object.entries(pstate().cabinet))if(item&&DEPARTMENT_TASKS105[k]&&!cabinetTaskOptions105(k).some(([id])=>id===item.task))item.task=item.task==='economy'?'department_economy':LEGACY_DEPARTMENT_TASKS105[k][item.task]||'balanced';
 s.release105={version:1};log('1.0.5 更新','议案指标改称院内支持率；教程增加政体欢迎说明，部长任务按职责分工。旧任务已对应迁移，政府首脑与副职任务保留。');
}
const initBefore105=initPolitics;initPolitics=function(id=selectedRegime){initBefore105(id);migrate105()};
const setTaskBefore105=setTask;
setTask=function(k,value){
 let item=pstate().cabinet[k];if(s.ended||!item||!cabinetTaskOptions105(k).some(([id])=>id===value))return;
 if(!DEPARTMENT_TASKS105[k])setTaskBefore105(k,value);else{item.task=value;save();toast('任务方向已更新，下季度执行；实际施政计入任期评估')}
 render();document.querySelector?.('#task')?.focus?.({preventScroll:true});
};
const validBefore105=validSave;
validSave=function(v){return validBefore105(v)&&(!v.release105||v.release105.version===1&&Object.entries(v.political.cabinet).every(([k,item])=>!item||cabinetTaskOptions105(k).some(([id])=>id===item.task)))};
