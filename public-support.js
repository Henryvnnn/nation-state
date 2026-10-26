/* Public legitimacy thresholds, applied once per actual quarter. */
function publicSupport107(){return s.publicSupport107}
function initializePublicSupport107(){if(!s.publicSupport107)s.publicSupport107={version:1,penaltyQ:s.q,stabilityPenalty:0,confidencePenalty:0,lastSpringQ:-1}}
const initBeforePublicSupport107=initPolitics;
initPolitics=function(id=selectedRegime){initBeforePublicSupport107(id);initializePublicSupport107()};
function checkPublicSupport107(){
 if(creatingWorld||!s?.political||!s.governance||!s.situations||s.ended)return;
 if(regime().democratic){if(s.approval<=0)setGameEnd107('民意基础崩溃：全国支持率降至 0%，政府失去执政授权。');return}
 if(s.approval<20&&!activeSit('spring')){
  initializePublicSupport107();const state=publicSupport107();if(state.lastSpringQ===s.q)return;
  delete sits().cooldowns.spring;const movement=startSituation('spring');
  if(movement){movement.trigger='low-approval';state.lastSpringQ=s.q;log('全国民主化运动爆发',`全国支持率 ${fmt(s.approval,1)}%，低于20%。${situationTitle(movement)}要求开放政治竞争与保障公民权利。`)}
 }
}
function publicSupportQuarter107(openingApproval=s.approval){
 if(s.ended||creatingWorld)return;initializePublicSupport107();const state=publicSupport107();
 if(state.penaltyQ!==s.q){state.penaltyQ=s.q;state.stabilityPenalty=0;state.confidencePenalty=0}
 const approval=Math.min(openingApproval,s.approval),democratic=regime().democratic;
 const stability=democratic&&approval<20?4:!democratic&&approval<=0?12:0,confidence=democratic&&approval<20?3:0;
 const ds=Math.max(0,stability-state.stabilityPenalty),dc=Math.max(0,confidence-state.confidencePenalty);
 if(ds||dc){mod({stability:-ds,confidence:-dc});state.stabilityPenalty+=ds;state.confidencePenalty+=dc;log('低支持率冲击',`${democratic?'全国支持率低于20%':'全国支持率降至0%'}，本季度额外政治稳定 −${ds}${dc?'、投资者信心 −'+dc:''}。`)}
 checkPublicSupport107();checkPoliticalEnd();
}
const modBeforePublicSupport107=mod;
mod=function(values){modBeforePublicSupport107(values);if(Object.hasOwn(values,'approval'))checkPublicSupport107()};
const endBeforePublicSupport107=checkPoliticalEnd;
checkPoliticalEnd=function(){checkPublicSupport107();if(!s.ended)endBeforePublicSupport107()};
const economyBeforePublicSupport107=economicQuarter;
economicQuarter=function(){const openingApproval=s.approval;economyBeforePublicSupport107();publicSupportQuarter107(openingApproval)};
const maintenanceBeforePublicSupport107=politicalMaintenance;
politicalMaintenance=function(){if(s.ended)return;maintenanceBeforePublicSupport107();publicSupportQuarter107()};
const saveBeforePublicSupport107=save;
save=function(){checkPublicSupport107();if(s.ended&&v3()&&!v3().settlement)beginSettlement(s.ended);saveBeforePublicSupport107()};
const alertsBeforePublicSupport107=activeAlerts107;
activeAlerts107=function(){const alerts=alertsBeforePublicSupport107(),alert=alerts.find(x=>x.id==='approval');if(alert){alert.text+=regime().democratic?' 全国支持率低于20%时每季度额外稳定−4、信心−3；降至0%时结束执政。':' 全国支持率低于20%必定引发民主化运动；降至0%时每季度额外稳定−12。'}return alerts};
const validBeforePublicSupport107=validSave;
validSave=function(v){if(!validBeforePublicSupport107(v))return false;const state=v.publicSupport107;return !state||state.version===1&&Number.isInteger(state.penaltyQ)&&Number.isInteger(state.lastSpringQ)&&[state.stabilityPenalty,state.confidencePenalty].every(n=>Number.isFinite(n)&&n>=0&&n<=100)};
