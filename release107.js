/* 1.0.6 — diverse regions, a capital district, party identity and seat diagrams. */
function playerFactionId107(p=pstate()){return Number.isInteger(p?.playerFaction)?p.playerFaction:0}
function shuffled107(values){let a=[...values];for(let i=a.length-1;i>0;i--){let j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function initializeDemocraticParty107(){
 let p=pstate();if(!creatingWorld||!regime().democratic)return;
 let allocation=shuffled107(pick([[38,29,16,10,7],[34,28,26,7,5],[43,27,15,9,6],[31,30,25,8,6]]));
 p.factions.forEach((f,i)=>f.seats=allocation[i]);
 p.playerFaction=pick(p.factions.filter(f=>f.seats>25)).id;
 p.factions.forEach(f=>f.relation=f.id===p.playerFaction?67:50);
 p.rulingParty=p.factions[p.playerFaction].name;
}
function distributeElectionSeats107(governmentSeats){
 let p=pstate(),own=playerFactionId107(),opposition=p.factions.filter(f=>f.id!==own),rest=100-governmentSeats;
 p.factions[own].seats=governmentSeats;
 opposition.forEach((f,i)=>f.seats=Math.floor(rest*[.35,.27,.23,.15][i]));
 opposition.at(-1).seats+=100-p.factions.reduce((sum,f)=>sum+f.seats,0);
}
const PLACE_START107=['阿','艾','伊','奥','乌','欧','埃','贝','博','布','达','德','多','杜','恩','法','菲','弗','格','戈','哈','赫','霍','卡','科','克','库','莱','雷','里','鲁','罗','梅','米','穆','纳','尼','诺','佩','普','萨','塞','瑟','索','塔','特','托','瓦','维','沃','耶','泽'];
const PLACE_MIDDLE107=['巴','柏','达','丹','德','迪','多','芬','加','格','吉','卡','科','拉','兰','雷','里','林','罗','伦','曼','蒙','纳','宁','诺','帕','普','萨','森','塔','提','托','瓦','文','维','泽','兹'];
const PLACE_END107=['尼亚','利亚','诺尔','维克','斯克','西亚','利恩','里安','兰德','里亚','维尔','里斯','托夫','纳尔','尼克','洛斯','维亚','泽恩','塔尔','米尔'];
const PLACE_NATURE107=[...'澄霁岚苍沅汀榆槐桦枫榕荻蒲蓉芦芷砾岑雁鹿鹭桐栎枳榛棠槿栖远望晴暮晨锦碧翠丹赤玄霜雪玉琥珀珊瑚金石杉柳竹莲荷桂柚梅萍蓬荆棕榄'];
const PLACE_LAND107={industry:['川','峡','汀','河','岭','原'],agriculture:['原','谷','川','野','泽','田'],technology:['原','城','汀','丘','泉'],trade:['港','湾','浦','洲','滨'],welfare:['城','谷','泉','丘','阳'],green:['林','岭','湖','溪','峰'],security:['关','岭','原','隘','河'],capital:['京','城','都','阳','陵']};
function randomPlace107(used,sector){
 for(let attempts=0;attempts<200;attempts++){
  let name;if(rand()<.58){let first=pick(PLACE_START107),middle=pick(PLACE_MIDDLE107.filter(x=>x!==first));name=first+middle+pick(PLACE_END107)}else name=pick(PLACE_NATURE107)+pick(PLACE_LAND107[sector]||PLACE_LAND107.welfare);
  if(rand()<.12)name='新'+name;
  if(!used.has(name)){used.add(name);return name}
 }
 for(let a of PLACE_START107)for(let b of PLACE_MIDDLE107)for(let c of PLACE_END107){let name=a+b+c;if(!used.has(name)){used.add(name);return name}}
 throw Error('地名生成空间已用尽');
}
function regionSuffix107(index){
 let id=regime().id;
 if(index===2)return pick(['特别市','特区']);
 if(index===3)return pick(['特区','特别市']);
 if(id==='federal')return index===0?'邦':index===1?'加盟共和国':index===5?'自治州':index===6?'领':'州';
 if(['absolute','aristocratic','tyranny','theoabsolute','constitutional','westminster'].includes(id))return index===0&&['aristocratic','constitutional','westminster'].includes(id)?'邦':index===5?'自治领':'领';
 return index===5?'自治区':pick(['省','州']);
}
function capitalSuffix107(){let options={constitutional:['大市','特别市'],westminster:['大市','特别市'],federal:['特别行政区','特区'],presidential:['特别行政区','特别市','特区'],semi:['特别市','特别行政区'],party:['特别市','特区'],symbolic:['特别行政区','特别市'],theorepublic:['特别行政区','特别市'],absolute:['领地','大市'],aristocratic:['领地','大市'],tyranny:['特区','领地'],theoabsolute:['领地','特区']};return pick(options[regime().id])}
function makeRegion107(id,weight,used){let profile=PROFILES[id],stem=randomPlace107(used,profile.sector),capital=id===7;return {id,stem,name:stem+(capital?capitalSuffix107():regionSuffix107(id)),isCapital:capital,sector:profile.sector,weight,population:s.pop*weight/100,development:38+Math.floor(rand()*30),attitude:0,termProgress:0,totalProgress:0,lastResult:null}}
function initializeRegions107(){let used=new Set(),weights=[18,16,14,12,10,10,8,12];v3().regions=weights.map((weight,id)=>makeRegion107(id,weight,used));s.capital=v3().regions[7].name}
function regionMatchesTags107(region,tags){return tags.includes(region.sector)||region.isCapital&&tags.some(tag=>['welfare','technology','security'].includes(tag))}
function allocateUnits107(weights,total){let sum=weights.reduce((a,b)=>a+b,0);if(!sum)return weights.map(()=>0);let exact=weights.map(w=>w/sum*total),out=exact.map(Math.floor),remaining=total-out.reduce((a,b)=>a+b,0),order=exact.map((v,i)=>({i,part:v-out[i]})).sort((a,b)=>b.part-a.part||a.i-b.i);for(let i=0;i<remaining;i++)out[order[i].i]++;return out}
function renameRegionReferences107(mapping){let names=Object.keys(mapping).sort((a,b)=>b.length-a.length);if(!names.length)return;let re=new RegExp(names.map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');function visit(obj){for(let key of Object.keys(obj)){if(typeof obj[key]==='string')obj[key]=obj[key].replace(re,x=>mapping[x]);else if(obj[key]&&typeof obj[key]==='object')visit(obj[key])}}for(let value of [s.logs,pstate().reports,pstate().current,pstate().queue,pstate().promises,v3().elections,v3().localHistory,v3().decisions,sits().notices].filter(Boolean))visit(value)}
function migrate107(){
 if(s.release107)return;
 if(!creatingWorld)try{localStorage.setItem(KEY+'-pre-107',JSON.stringify(s))}catch(_){}
 let p=pstate(),g=v3();p.playerFaction=playerFactionId107();ensureCandidates103();
 if(!Object.prototype.hasOwnProperty.call(p.cabinet,'labour')){let c=p.candidates.find(c=>cabinetEligible(c)&&!Object.values(p.cabinet).some(item=>item?.candidate===c.id));p.cabinet.labour=c?{candidate:c.id,task:'balanced'}:null}
 if(!rules103().proposals.labour)rules103().proposals.labour={progress:0,completed:false,spent:0,actions:[]};
 if(g.regions.length===7){
  let used=new Set(),mapping={},baseline=key=>g.regions.reduce((sum,z)=>sum+(z[key]||0)*z.weight/100,0),inherited=Object.fromEntries(['termProgress','demandProgress','totalProgress','development','attitude'].map(key=>[key,baseline(key)])),weights=allocateUnits107(g.regions.map(z=>z.weight),88);
  g.regions.forEach((z,i)=>{let previous=z.name;z.stem=randomPlace107(used,z.sector);z.name=z.stem+regionSuffix107(i);z.isCapital=false;z.weight=weights[i];z.population=s.pop*z.weight/100;mapping[previous]=z.name});
  let capital=makeRegion107(7,12,used);Object.assign(capital,inherited);capital.demandVariant=Math.floor(rand()*3);g.regions.push(capital);s.capital=capital.name;
  // Nine principal members cover all eight regions; move one duplicate regional assignment.
  let member=p.members.find(m=>p.members.filter(n=>n.regionId===m.regionId).length>1);if(member)member.regionId=7;
  p.members.forEach(m=>m.region=g.regions[m.regionId].name);renameRegionReferences107(mapping);
 }
 if(p.bill?.kind==='reform'&&REFORMS[p.bill.id]?.key==='inheritance')p.bill.description=(p.bill.description||REFORMS[p.bill.id].text).replace(/一次性清偿全部公债|全部公债清偿/g,'清偿完成时 50% 的公债');
 s.release107={version:1};log('1.0.6 更新','首都纳入地区选情，劳动部长加入内阁；遗产税改为清偿完成时一半公债。旧有党籍、人物属性与已完成成果保留。');
}
const initBefore107=initPolitics;initPolitics=function(id=selectedRegime){initBefore107(id);migrate107()};
function chamberSeatData107(){
 let factions=pstate().factions,total=Math.round(factions.reduce((sum,f)=>sum+f.seats,0)),counts=allocateUnits107(factions.map(f=>f.seats),Math.min(500,total));
 let seats=factions.flatMap((f,i)=>Array.from({length:counts[i]},()=>({faction:f.id,color:COLORS[f.id]})));
 let benches=regime().id==='westminster'||regime().body==='枢密院';
 if(benches){let government=coalitionRegime()?rules103().coalition:[playerFactionId107()],sides=[seats.filter(s=>government.includes(s.faction)),seats.filter(s=>!government.includes(s.faction))],rows=Math.max(...sides.map(a=>Math.ceil(a.length/6)),8);return {layout:'benches',width:300,height:rows*14+24,seats:sides.flatMap((side,bank)=>side.map((seat,i)=>({...seat,x:(bank?188:28)+(i%6)*14,y:18+Math.floor(i/6)*14,r:4.8})))}}
 let rows=Math.max(3,Math.ceil(Math.sqrt(seats.length)/2.5)),radii=Array.from({length:rows},(_,i)=>64+i*24),outer=radii.at(-1),center=outer+16,points=[];
 allocateUnits107(radii,seats.length).forEach((count,row)=>{for(let i=0;i<count;i++){let angle=Math.PI-(i+.5)/count*Math.PI;points.push({angle,row,x:center+radii[row]*Math.cos(angle),y:center-radii[row]*Math.sin(angle),r:Math.min(5.2,Math.PI*radii[row]/count*.38)})}});
 points.sort((a,b)=>b.angle-a.angle||a.row-b.row);return {layout:'semicircle',width:center*2,height:center+14,seats:points.map((point,i)=>({...point,...seats[i]}))};
}
function chamberSeats107(){let diagram=chamberSeatData107();return `<div class="seat-strip seat-chamber" data-layout="${diagram.layout}"><svg viewBox="0 0 ${diagram.width} ${diagram.height}" role="img" aria-label="${regime().body}彩色座席分布图">${diagram.seats.map(seat=>`<circle data-faction="${seat.faction}" cx="${seat.x.toFixed(2)}" cy="${seat.y.toFixed(2)}" r="${seat.r}" fill="${seat.color}"/>`).join('')}</svg></div>`}
function openGuideConcept107(query){showHelp();$('guide-query').value=query;searchGuide104(query)}
const validBefore107=validSave;validSave=function(v){if(!validBefore107(v))return false;if(!v.release107)return true;let p=v.political,g=v.governance;if(!p||!g||!Array.isArray(g.regions))return false;return v.release107.version===1&&Number.isInteger(p.playerFaction)&&!!p.factions[p.playerFaction]&&g.regions.length===8&&g.regions.filter(z=>z.isCapital).length===1&&g.regions[7].isCapital&&g.regions[7].sector==='capital'&&Math.abs(g.regions.reduce((sum,z)=>sum+z.weight,0)-100)<1e-7&&new Set(g.regions.map(z=>z.name)).size===8&&p.members.every(m=>!!g.regions[m.regionId])&&Object.prototype.hasOwnProperty.call(p.cabinet,'labour')};
