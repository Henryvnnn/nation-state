/* Seeded local political bases. Generated once, after the player's faction is known. */
const REGIONAL_AFFINITIES107={
 conservative:[-4,8,-8,4,0,6,12,2],
 market:[2,-6,8,13,-5,-8,0,6],
 social:[12,0,9,-8,7,-10,-12,8],
 local:[-5,12,-6,0,2,10,5,-2],
 green:[-10,3,11,-6,5,13,-12,6],
 law:[3,-5,10,6,4,-8,-10,12],
 state:[13,6,5,-6,1,-9,11,3],
 reform:[4,-5,13,7,2,-8,-10,10],
 religious:[-12,9,-10,-6,4,8,13,0]
};
function rulingRegionalProfile107(){
 const faction=pstate().factions[playerFactionId107()],profile=factionProfile(faction);
 return {faction,profile,key:Object.keys(FACTION_PROFILES103).find(k=>FACTION_PROFILES103[k]===profile)||'conservative'};
}
function generateRegionalStart107(){
 const {faction,profile,key}=rulingRegionalProfile107();let rng=hash(s.seed+'|regional-start107|'+regime().id+'|'+faction.id+'|'+key);
 const random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296};
 const floor=21+random()*4,ceiling=51+random()*4;
 const raw=v3().regions.map(z=>({id:z.id,affinity:REGIONAL_AFFINITIES107[key][z.id],jitter:(random()-.5)*8,development:(z.development-50)*.06}));
 const scores=raw.map(x=>x.affinity+x.jitter+x.development),low=Math.min(...scores),high=Math.max(...scores);
 return {version:1,applied:true,faction:faction.id,factionName:faction.name,profile:key,profileName:profile.name,rows:raw.map((x,i)=>{
  const support=Math.round((floor+(scores[i]-low)/Math.max(.001,high-low)*(ceiling-floor))*10)/10;
  const original=regionalEstimate(v3().regions[i]).share;
  return {...x,support,offset:support-original};
 })};
}
function initializeRegionalStart107(){
 if(s.regionalStart107)return;
 // Existing worlds, including quarter-zero saves, retain their current political geography.
 s.regionalStart107=creatingWorld?generateRegionalStart107():{version:1,applied:false};
}
const initBeforeRegionalStart107=initPolitics;
initPolitics=function(){initBeforeRegionalStart107();initializeRegionalStart107()};
function regionalOrigin107(z){return s.regionalStart107?.applied?s.regionalStart107.rows[z.id]:null}
function regionalOriginOffset107(z){return regionalOrigin107(z)?.offset||0}
function regionalOriginDetails107(z){
 const origin=regionalOrigin107(z),state=s.regionalStart107;if(!origin)return '';
 const strength=origin.affinity>=6?'较强认同':origin.affinity<=-6?'较弱认同':'存在争取空间';
 return `<details class="regional-origin-details" data-guide="regional-start"><summary>查看地方政治基础</summary><p>开局执政力量：${esc(state.factionName)} · ${esc(state.profileName)}。</p><p>${esc(PROFILES[z.id].base)}；${esc(PROFILES[z.id].religion)}。该地区对开局执政路线${strength==='存在争取空间'?'存在争取空间':'有'+strength}，地方差异也会影响起点。</p><div class="row"><span>开局地区支持</span><b>${fmt(origin.support,1)}%</b></div><div class="row"><span>开局民意修正</span><b>${origin.offset>0?'+':''}${fmt(origin.offset,1)} 个百分点</b></div><p>此后随全国民意、地方履约、政策、发展及季度衰退变化，可通过治理继续争取支持。开局基础随本局保留，政党更替不重新抽取。</p></details>`;
}
const validBeforeRegionalStart107=validSave;
validSave=function(v){
 if(!validBeforeRegionalStart107(v))return false;const x=v.regionalStart107;if(!x)return true;
 if(x.version!==1||typeof x.applied!=='boolean')return false;if(!x.applied)return true;
 if(!Number.isInteger(x.faction)||!v.political.factions[x.faction]||typeof x.factionName!=='string'||typeof x.profileName!=='string'||!REGIONAL_AFFINITIES107[x.profile]||!Array.isArray(x.rows)||x.rows.length!==v.governance.regions.length)return false;
 return x.rows.every((r,i)=>r.id===i&&[r.support,r.offset,r.affinity,r.jitter,r.development].every(Number.isFinite)&&r.support>=21&&r.support<=55&&Math.abs(r.offset)<=99&&Math.abs(r.affinity)<=20&&Math.abs(r.jitter)<=4&&Math.abs(r.development)<=3);
};
