/* Action point modes. Stored rolls and plans survive reloads and imports. */
const ACTION_POINT_MODES={fixed:'固定行动点',random:'随机行动点',planned:'伪随机行动点'};
let pendingActionMode='fixed';
function actionMode(){return s?.actionPoints?.mode||'fixed'}
function actionResearchLevel(){return Math.max(0,Math.floor(rules103()?.research.level||0))}
function actionModeDescription(mode=actionMode()){
 return mode==='random'?'每季投骰获得1—6点。科研每升一级，骰子下限提高1，依次为2—6、3—6，直至固定6点。':mode==='planned'?'开局预排未来48季的1—6点，每个点数各8次并打乱顺序。每级科研另加1点，可超过6点；超过48季后按同一规则续排。':'每季固定3点。科研每升一级增加1点，最多6点。';
}
function actionResearchDescription(){return actionMode()==='random'?'每升一级提高骰子下限1点，最高提高至6。':actionMode()==='planned'?'每升一级，预排点数额外加1；总点数可以超过6。':'每升一级增加1点季度额度，最多6点。'}
function actionResearchStatus(){let level=actionResearchLevel();return actionMode()==='random'?`骰子范围 ${Math.min(6,1+level)}—6。`:actionMode()==='planned'?`预排点数额外加 ${level}。`:`每季度政治行动点总数 ${3+Math.min(3,level)}。`}
function actionPlan(block){
 // Separate seeded stream: unrelated events and policy choices cannot alter a plan.
 let seed=hash(s.seed+'|action-plan|'+block)>>>0;
 function next(){seed=(seed+0x6D2B79F5)>>>0;let t=seed;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296}
 let plan=Array.from({length:48},(_,i)=>i%6+1);
 for(let i=47;i>0;i--){let j=Math.floor(next()*(i+1));[plan[i],plan[j]]=[plan[j],plan[i]]}return plan;
}
function initializeActionPoints(){
 if(s.actionPoints)return;
 let mode=creatingWorld&&Object.hasOwn(ACTION_POINT_MODES,pendingActionMode)?pendingActionMode:'fixed';
 s.actionPoints={version:1,mode,plans:mode==='planned'?{'0':actionPlan(0)}:{},rolls:{}};
 if(creatingWorld)pstate().ap=grantActionPoints();
 // Existing saves keep both their remaining points and their existing research.
 else s.actionPoints.rolls[s.q]={base:3,level:actionResearchLevel(),total:3+Math.min(3,actionResearchLevel())};
}
const initBeforeActionPoints=initPolitics;
initPolitics=function(id=selectedRegime){initBeforeActionPoints(id);initializeActionPoints()};
function grantActionPoints(){
 let a=s.actionPoints;if(!a)return 3+Math.min(3,actionResearchLevel());
 if(a.rolls[s.q])return a.rolls[s.q].total;
 let level=actionResearchLevel(),base,total;
 if(a.mode==='random'){let low=Math.min(6,1+level);base=low+Math.floor(rand()*(7-low));total=base}
 else if(a.mode==='planned'){
  // Quarter zero is the opening allocation; plan[0] belongs to quarter one.
  if(s.q===0)base=1+(hash(s.seed+'|opening-action-points')>>>0)%6;
  else{let block=Math.floor((s.q-1)/48);if(!a.plans[block])a.plans[block]=actionPlan(block);base=a.plans[block][(s.q-1)%48]}
  total=base+level;
 }else{base=3;total=3+Math.min(3,level)}
 a.rolls[s.q]={base,level,total};
 if(s.q>0&&a.mode!=='fixed')log('季度行动点',`${ACTION_POINT_MODES[a.mode]}：本季获得 ${total} 点。${a.mode==='planned'?`预排 ${base} ＋ 科研 ${level}。`:`本次骰子范围 ${Math.min(6,1+level)}—6。`}未使用点数不结转。`);
 return total;
}
politicalCapacity=function(){let a=s?.actionPoints;return !a||a.mode==='fixed'?3+Math.min(3,actionResearchLevel()):a.rolls[s.q]?.total||0};
function actionPointsSummary(){let a=s.actionPoints,roll=a?.rolls[s.q];return `${ACTION_POINT_MODES[actionMode()]} · 本季获得 ${politicalCapacity()} 点${actionMode()==='planned'&&roll?`（预排 ${roll.base} ＋ 科研 ${roll.level}）`:actionMode()==='random'&&roll?`（骰子 ${Math.min(6,1+roll.level)}—6）`:''}`}
function actionTutorialText(){return `这是本季剩余政治行动点。本局采用${ACTION_POINT_MODES[actionMode()]}：${actionModeDescription()}当前本季额度 ${politicalCapacity()} 点；协商、人事、表决和局势处置消耗它，未用完不结转。`}
const newDialogBeforeActionPoints=newDialog;
newDialog=function(){newDialogBeforeActionPoints();$('modal').innerHTML=$('modal').innerHTML.replace('<label for="seed">',`<fieldset class="action-mode-options"><legend>政治行动点模式</legend>${Object.entries(ACTION_POINT_MODES).map(([value,label])=>`<label class="action-mode-option"><input type="radio" name="action-mode" value="${value}" ${value==='fixed'?'checked':''}><span><b>${label}</b><small>${actionModeDescription(value)}</small></span></label>`).join('')}<p class="note">每季额度只发放一次；刷新或读档不会重投。科研在新季度结算时生效，模式创建后固定。</p></fieldset><label for="seed">`).replace("pendingAdmin107=$('admin-mode').checked;","pendingActionMode=document.querySelector('input[name=action-mode]:checked').value;pendingAdmin107=$('admin-mode').checked;")};
const validBeforeActionPoints=validSave;
validSave=function(v){
 if(!validBeforeActionPoints(v))return false;let a=v.actionPoints;if(a===undefined)return true;
 if(!a||a.version!==1||!Object.hasOwn(ACTION_POINT_MODES,a.mode)||!a.plans||typeof a.plans!=='object'||Array.isArray(a.plans)||!a.rolls||typeof a.rolls!=='object'||Array.isArray(a.rolls))return false;
 for(let [key,plan]of Object.entries(a.plans))if(!/^\d+$/.test(key)||!Array.isArray(plan)||plan.length!==48||plan.some(n=>!Number.isInteger(n)||n<1||n>6)||[1,2,3,4,5,6].some(n=>plan.filter(x=>x===n).length!==8))return false;
 if(a.mode==='planned'&&!a.plans[0])return false;
 for(let [q,r]of Object.entries(a.rolls)){
  if(!/^\d+$/.test(q)||!r||!Number.isInteger(r.base)||r.base<1||r.base>6||!Number.isInteger(r.level)||r.level<0||!Number.isInteger(r.total))return false;
  if(a.mode==='fixed'&&(r.base!==3||r.total!==3+Math.min(3,r.level)))return false;
  if(a.mode==='random'&&(r.base<Math.min(6,1+r.level)||r.total!==r.base))return false;
  if(a.mode==='planned'&&r.total!==r.base+r.level)return false;
 }
 return true;
};
