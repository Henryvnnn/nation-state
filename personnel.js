/* Regime-specific offices, personal distinctions and initial precedence. */
const OFFICE_KEYS107=['head','deputy','finance','foreign','defence','justice','interior','labour','education','health','culture','environment'];
const OFFICE_TITLES107={
 presidential:['总理','副总理','财政部长','外交部长','国防部长','司法部长','内政部长','劳动部长','教育部长','卫生部长','文化部长','环境部长'],
 semi:['总理','副总理','经济与财政部长','外交与合作部长','国防部长','司法与法务部长','内政与地方事务部长','劳动与就业部长','教育与科研部长','公共卫生部长','文化与传播部长','生态转型部长'],
 constitutional:[null,'副首相','财政大臣','外务大臣','防务大臣','司法大臣','内务大臣','劳动与社会保障大臣','教育与科学大臣','卫生大臣','文化与遗产大臣','环境与国土大臣'],
 westminster:[null,'副首相','财政大臣','外交与联邦事务大臣','国防大臣','司法大臣','内政大臣','就业与养老金大臣','教育大臣','卫生与社会照护大臣','文化与体育大臣','环境与乡村事务大臣'],
 federal:[null,null,'联邦财政委员','联邦外事委员','联邦防务委员','联邦司法委员','联邦内务委员','联邦劳动与社会事务委员','联邦教育与科研委员','联邦卫生委员','联邦文化委员','联邦环境与能源委员'],
 party:['政务院总理','政务院副总理','国家财政委员会主任','外交事务委员会主任','国防委员会主任','法制工作委员会主任','内务管理总局局长','劳动总局局长','教育与科学委员会主任','公共卫生总局局长','文化事务委员会主任','生态环境总局局长'],
 symbolic:['总理','第一副总理','财政与发展部长','对外事务部长','国防与安全部长','司法行政部长','内政与行政管理部长','劳动与社会事务部长','教育与人才发展部长','国家卫生部长','文化与公共传播部长','环境与资源部长'],
 absolute:['御前宰相','副宰相','王室财政大臣','外务大臣','军务大臣','掌玺司法大臣','内务大臣','劳务与民生大臣','学务大臣','医务大臣','礼仪与文化大臣','山林与水土大臣'],
 aristocratic:['联邦宰相','副宰相','财赋总监','外事大臣','联防大臣','律政大臣','领地事务大臣','劳工与行会事务大臣','学务总监','医务总监','文化与典礼大臣','土地与水务大臣'],
 tyranny:['国务宰相','副宰相','国库总监','对外事务总监','军事事务总监','司法总监','内务总监','劳动事务总监','教育与技术总监','公共卫生总监','文化事务总监','资源与环境总监'],
 theorepublic:['总理','副总理','财政与公共基金部长','外交与宗教联络部长','国防部长','司法与教法事务部长','内政与地方事务部长','劳动与社会关怀部长','教育与学术事务部长','卫生与慈善部长','文化与宗教事务部长','环境与公共资源部长'],
 theoabsolute:['教廷国务宰相','国务副宰相','财赋与公共基金部长','外务与教际事务部长','圣地防务部长','司法与教法事务部长','内政与教区事务部长','人力和社会部部长','教育与经学院事务部长','卫生与救济部长','文化与礼仪部长','土地与环境部长']
};
const officeBeforePersonnel107=office;
office=function(key){const i=OFFICE_KEYS107.indexOf(key),names=OFFICE_TITLES107[regime().id];return i<0?officeBeforePersonnel107(key):names[i]};
const NOBLE_REGIMES107=['absolute','constitutional','westminster','aristocratic','tyranny'];
const RELIGIOUS_REGIMES107=['theorepublic','theoabsolute'];
// These are fictional in-game orders of precedence, not a ranking of real religions.
const NOBLE_HONOURS107=[null,{title:'爵士',kind:'decoration',rank:1},{title:'男爵',kind:'nobility',rank:2},{title:'子爵',kind:'nobility',rank:3},{title:'伯爵',kind:'nobility',rank:4},{title:'侯爵',kind:'nobility',rank:5},{title:'公爵',kind:'nobility',rank:6}];
const RELIGIOUS_HONOURS107={
 church:{name:'教会传统',titles:['执事','神父','主教','大主教','枢机']},
 order:{name:'教团传统',titles:['助祭','教士','教长','大教长','教团长老']},
 school:{name:'宗门传统',titles:['侍教','讲经师','宗本','大宗本','护法长老']}
};
function personnelRandom107(key){let n=hash(s.seed+'|personnel107|'+key);return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296}}
function personnelRoster107(){return [...pstate().members,...pstate().candidates,...(s.constitution?.judges||[])]}
function honourFaction107(person){
 const name=pstate().factions[person.faction]?.name||'';
 if(/世俗|公民自由|自治市民|自由城市|无党籍/.test(name))return 'secular';
 if(/商人|工商|商会|实业|财团/.test(name))return 'merchant';
 if(/技术|官僚|法务/.test(name))return 'technocrat';
 if(/贵族|王廷|王室|领主|乡绅|家族|宫廷/.test(name))return 'noble';
 return 'other';
}
function honourChance107(person,group){
 const r=regime().id,category=honourFaction107(person);
 if(NOBLE_REGIMES107.includes(r)){
  if(category==='secular')return 0;
  if(category==='merchant'||category==='technocrat')return .025;
  if(['constitutional','westminster'].includes(r))return group==='judges'?.12:.26;
  return category==='noble'?.92:group==='judges'?.6:.58;
 }
 if(RELIGIOUS_REGIMES107.includes(r)){
  if(category==='secular')return 0;
  if(category==='merchant'||category==='technocrat')return .025;
  return group==='judges'?.95:/教|宗|经学|圣地|信仰/.test(pstate().factions[person.faction]?.name||'')?.93:.42;
 }
 return 0;
}
function assignHonour107(person,group){
 if(person.honour!==undefined)return;
 person.baseName=person.name;
 const random=personnelRandom107(group+'|'+person.id+'|'+person.baseName),chance=honourChance107(person,group);
 person.honour=null;
 if(random()<chance){
  const noble=NOBLE_REGIMES107.includes(regime().id),category=honourFaction107(person);
  const weights=noble?(category==='noble'?[10,20,23,24,16,7]:[42,25,16,10,5,2]):group==='judges'?[5,15,30,32,18]:[23,29,25,17,6];
  let roll=random()*100,rank=1;while(rank<weights.length&&roll>=weights[rank-1]){roll-=weights[rank-1];rank++}
  if(category==='merchant'||category==='technocrat')rank=1;
  if(noble)person.honour={...NOBLE_HONOURS107[rank]};
  else{const tradition=s.personnel107.religiousTradition;person.honour={title:RELIGIOUS_HONOURS107[tradition].titles[rank-1],kind:'religious',rank,tradition}}
 }
 person.name=person.baseName+(person.honour?.title||'');
}
function precedence107(a,b){return (b.honour?.rank||0)-(a.honour?.rank||0)||(b.skill||b.relation||0)-(a.skill||a.relation||0)||a.id-b.id}
function assignOpeningOffices107(){
 const p=pstate();
 if(!personnelRoster107().some(person=>person.honour))return;
 // Reserve one representative for every faction, then fill the four leadership posts.
 const remaining=p.members.slice().sort(precedence107),leaders=[];
 for(let i=0;i<4;i++){
  const index=remaining.findIndex(person=>remaining.filter(other=>other.faction===person.faction).length>1);
  if(index<0)break;leaders.push(remaining.splice(index,1)[0]);
 }
 if(leaders.length===4){
  p.members=[...leaders,...p.factions.map(f=>remaining.find(person=>person.faction===f.id))];
  const ids=new Map();p.members.forEach((person,i)=>{ids.set(person.id,i);person.id=i;person.role=i<4?memberRole(i):p.factions[person.faction].name+(regime().body==='议会'?'党团总召':'首席代表')});
  for(const event of [p.current,...p.queue].filter(Boolean))if(Number.isInteger(event.member))event.member=ids.get(event.member)??event.member;
 }
 // Precedence affects first appointments only; later player appointments stay unrestricted.
 const pool=p.candidates.filter(cabinetEligible).sort(precedence107);
 for(const slot of cabinetSlots103()){const c=pool.shift();p.cabinet[slot]=c?{candidate:c.id,task:'balanced'}:null}
 const judges=constitution().judges.slice().sort(precedence107);
 if(judges.length){constitution().judges.forEach(j=>j.chief=j.id===judges[0].id)}
 // Opening scandals must still point at the actual holder of the implicated office.
 for(const sit of s.situations?.active||[])if(sit.kind==='scandal'&&sit.opening){const id=p.cabinet[sit.slot]?.candidate;if(id!==undefined){sit.candidate=id;sit.faction=p.candidates[id].faction}}
 s.personnel107.openingAssigned=true;
}
function initializePersonnel107(){
 if(s.personnel107)return;
 if(!creatingWorld)try{localStorage.setItem(KEY+'-pre-personnel107',JSON.stringify(s))}catch(_){}
 const traditions=Object.keys(RELIGIOUS_HONOURS107),random=personnelRandom107('tradition');
 s.personnel107={version:1,originRegime:regime().id,religiousTradition:traditions[Math.floor(random()*traditions.length)],openingAssigned:false};
 for(const [group,people]of [['members',pstate().members],['candidates',pstate().candidates],['judges',constitution().judges]])for(const person of people)assignHonour107(person,group);
 if(creatingWorld)assignOpeningOffices107();
}
const initBeforePersonnel107=initPolitics;
initPolitics=function(...args){initBeforePersonnel107(...args);initializePersonnel107()};
function honourDescription107(person){
 const h=person?.honour;if(!h)return '';
 const kind=h.kind==='religious'?'教职':h.kind==='nobility'?'爵位':'授勋称号';
 return `<p class="person-honour" data-guide="honours">${kind}：${esc(h.title)} · 礼序等级 ${h.rank}<br><small>等级影响开局职位排序；后续任命由你决定，能力与政治倾向另行计算。</small></p>`;
}
const panelBeforePersonnel107=officialPanel;
officialPanel=function(key){let html=panelBeforePersonnel107(key),item=pstate().cabinet[key],person=item?pstate().candidates[item.candidate]:null;return html.replace('</h2>','</h2>'+honourDescription107(person))};
// Runtime institution names stay dynamic after a constitutional change.
const cabinetBeforePersonnel107=cabinet;
cabinet=function(){return cabinetBeforePersonnel107().replace('财政部长 / 大臣',office('finance')).replace('财政部长由玩家直接操控。',office('finance')+'由玩家直接操控。').replace('任命'+regime().head+'，管理你的政府','任命'+office('head')+'，管理你的政府')};
const meetBeforePersonnel107=meetMember;
meetMember=function(id){meetBeforePersonnel107(id);$('modal').innerHTML=$('modal').innerHTML.replace('</h2>','</h2>'+honourDescription107(pstate().members[id]))};
const meetJudgeBeforePersonnel107=meetJudge;
meetJudge=function(id){if(!constitution().judges.some(j=>j.id===id&&!j.vacant))return;meetJudgeBeforePersonnel107(id);$('modal').innerHTML=$('modal').innerHTML.replace('</h2>','</h2>'+honourDescription107(constitution().judges.find(j=>j.id===id)))};
const validBeforePersonnel107=validSave;
validSave=function(v){
 if(!validBeforePersonnel107(v))return false;
 if(!v.personnel107)return true;
 if(!v.political||!v.constitution||!Array.isArray(v.constitution.judges))return false;
 const meta=v.personnel107;if(meta.version!==1||!REGIMES.some(r=>r.id===meta.originRegime)||!Object.prototype.hasOwnProperty.call(RELIGIOUS_HONOURS107,meta.religiousTradition)||typeof meta.openingAssigned!=='boolean')return false;
 const people=[...v.political.members,...v.political.candidates,...v.constitution.judges];
 return people.every(person=>{
  if(typeof person.baseName!=='string'||!person.baseName.length||person.baseName.length>40)return false;
  const h=person.honour;if(h===null)return person.name===person.baseName;
  if(!h||!Number.isInteger(h.rank)||h.rank<1||typeof h.title!=='string'||!['religious','nobility','decoration'].includes(h.kind))return false;
  const valid=h.kind==='religious'?RELIGIOUS_REGIMES107.includes(meta.originRegime)&&h.tradition===meta.religiousTradition&&RELIGIOUS_HONOURS107[h.tradition]?.titles[h.rank-1]===h.title:
   NOBLE_REGIMES107.includes(meta.originRegime)&&NOBLE_HONOURS107[h.rank]?.kind===h.kind&&NOBLE_HONOURS107[h.rank]?.title===h.title;
  return !!valid&&person.name===person.baseName+h.title;
 });
};

function personnelGuide107(entries){
 const add=(id,title,aliases,text,category)=>entries.push({id,title,aliases:[title,...aliases],text,category});
 add('honours','人物称号',['荣誉称号','授勋称号','爵位','教职','礼序等级',...NOBLE_HONOURS107.filter(Boolean).map(h=>h.title),...Object.values(RELIGIOUS_HONOURS107).flatMap(x=>x.titles)],'君主专制、君主立宪制、西敏议会制、贵族制和僭主制可能出现爵位与授勋称号；世俗派系不生成，商人或技术官僚派系仅有2.5%概率获最低级称号。神权国家按本局宗教传统生成教职。新开局在组阁资格和每派一位代表等条件内，按礼序等级优先分配首脑、机关负责人及内阁岗位，同级再参考能力或关系。爵位顺序为爵士、男爵、子爵、伯爵、侯爵、公爵；教职顺序为本局对应传统的1至5级，仅是虚构游戏的礼序。等级不改变人物能力、忠诚或政治倾向，后续任命仍由玩家决定。旧存档只补充称号，不重新分配职位；转型保留原有个人荣誉。','政体与职务');
 add('office-head',office('head')||'政府首脑',['政府首脑',...Object.values(OFFICE_TITLES107).map(row=>row[0]).filter(Boolean)],'总理或宰相协调内阁并自主施政，任免仍遵守行动点和政治后果规则。新开局在合资格人物中按称号等级优先任用；后续由玩家决定。议会制国家的政府首脑由玩家担任，不另设可任命席位。','政体与职务');
 for(const entry of entries){
  const key=entry.id==='finance-minister'?'finance':entry.id.startsWith('office-')?entry.id.slice(7):null;
  if(key&&OFFICE_KEYS107.includes(key)&&office(key)){entry.aliases.push(entry.title,...Object.values(OFFICE_TITLES107).map(row=>row[OFFICE_KEYS107.indexOf(key)]).filter(Boolean));entry.title=office(key);entry.aliases.push(entry.title)}
  if(entry.id==='cabinet')entry.text=entry.text.replace('财政部长',office('finance'));
 }
}
const appointPreviewBeforePersonnel107=appointPreview;
appointPreview=function(key,id){appointPreviewBeforePersonnel107(key,id);$('modal').innerHTML=$('modal').innerHTML.replace('</h2>','</h2>'+honourDescription107(pstate().candidates[id]))};
