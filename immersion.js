/* Regime-specific presentation, illustrated world setup and a movable reminder dock. */
const EXECUTIVE_NAMES={constitutional:'内阁府',presidential:'总统行政办公室',semi:'总统府',westminster:'首相府',federal:'联邦委员会',theorepublic:'最高领袖办公室',symbolic:'总统府',party:'政务院',absolute:'御前政务院',aristocratic:'公爵政务厅',tyranny:'执政官署',theoabsolute:'教廷国务署'};
function executiveName(){return EXECUTIVE_NAMES[regime().id]||'政府'}
function governmentBriefings(limit=4){return governingChronicle().slice(0,limit)}

const REGIME_ART={
 constitutional:{motto:'王冠之下，议会执政',focus:'议会信任 · 自动联合政府',alt:'君主立宪制示意图片'},
 presidential:{motto:'行政授权，立法制衡',focus:'总统决策 · 任命总理',alt:'民主共和制·总统制示意图片'},
 semi:{motto:'总统与总理，共掌行政',focus:'双首长协调 · 议会支持',alt:'半总统制示意图片'},
 westminster:{motto:'在辩论与信任中执政',focus:'首相组阁 · 自动联合政府',alt:'西敏议会制示意图片'},
 federal:{motto:'让不同地区找到共识',focus:'集体治理 · 更高共识门槛',alt:'联邦委员会制示意图片'},
 theorepublic:{motto:'选举与宗教权威并立',focus:'最高领袖 · 民选议会',alt:'神权共和制示意图片'},
 symbolic:{motto:'选举之形，集中的权力',focus:'集中行政 · 稳定维系统治',alt:'象征性民主制示意图片'},
 party:{motto:'在组织与路线间凝聚支持',focus:'党内派别 · 会议协商',alt:'一党独大制示意图片'},
 absolute:{motto:'王令从御前议事厅发出',focus:'君主裁决 · 宰相施政',alt:'君主专制示意图片'},
 aristocratic:{motto:'家族之间，权力需要平衡',focus:'贵族协商 · 家族利益',alt:'贵族制示意图片'},
 tyranny:{motto:'秩序系于忠诚与威望',focus:'个人权威 · 安全系统',alt:'僭主制示意图片'},
 theoabsolute:{motto:'教法与政令来自同一权威',focus:'宗教等级 · 宰相行政',alt:'神权专制示意图片'}
};
function regimeImage(id){return `assets/regimes/${id}.png?v=${id==='party'?'1.0.7-partyart2':'1.0.7-r1'}`}
function regimePreview(id){
 let r=REGIMES.find(r=>r.id===id);if(!r)return '<div class="regime-random-art" aria-hidden="true">✦</div><div><span class="tag">尚未揭晓的历史</span><h3>让世界决定你的起点</h3><p>从十二种政体中抽取一个。国家名称、社会条件与政治人物随后生成。</p><small>选择下方卡片，可预览各制度的执政身份与主要挑战。</small></div>';
 let art=REGIME_ART[id];return `<img src="${regimeImage(id)}" alt="${art.alt}" width="600" height="400"><div><span class="tag">${art.motto}</span><h3>${r.name}</h3><p>${r.note}</p><div class="regime-preview-facts"><span>你的身份：<b>${r.player}</b></span><span>议事机关：<b>${r.body}</b></span><span>行政机构：<b>${EXECUTIVE_NAMES[id]}</b></span></div></div>`;
}
function regimePicker(){return `<fieldset class="regime-picker"><legend>选择政治体制</legend><input type="hidden" id="regime" value="random"><div class="regime-preview" id="regime-preview" aria-live="polite">${regimePreview('random')}</div><div class="regime-grid"><button type="button" class="regime-choice regime-random" data-regime="random" aria-pressed="true" onclick="selectRegimeCard('random')"><span aria-hidden="true">✦</span><span><b>随机政体</b><small>让历史为你选择一种制度</small></span><i class="regime-selected" aria-hidden="true">✓</i></button>${REGIMES.map(r=>`<button type="button" class="regime-choice" data-regime="${r.id}" aria-pressed="false" onclick="selectRegimeCard('${r.id}')"><img src="${regimeImage(r.id)}" alt="" loading="lazy" width="180" height="120"><span class="regime-choice-copy"><b>${r.name}</b><small>${r.player}</small><em>${REGIME_ART[r.id].focus}</em></span><i class="regime-selected" aria-hidden="true">✓</i></button>`).join('')}</div><p class="note">图片用于标识政体；具体规则以本游戏说明为准。</p></fieldset>`}
function selectRegimeCard(id){if(id!=='random'&&!REGIMES.some(r=>r.id===id))return;$('regime').value=id;document.querySelectorAll('[data-regime]').forEach(node=>node.setAttribute('aria-pressed',String(node.dataset.regime===id)));$('regime-preview').innerHTML=regimePreview(id)}
const newDialogBeforeImmersion=newDialog;
newDialog=function(){newDialogBeforeImmersion();$('modal').innerHTML=$('modal').innerHTML.replace(/<label for="regime">政治体制<\/label><select id="regime">[\s\S]*?<\/select>/,regimePicker())};

// Collapsing a reminder is a UI preference; it does not acknowledge away a live risk.
refreshAlerts107=function(){
 let f=features107();if(!f)return;let alerts=activeAlerts107(),previous=f.activeAlerts||[],ids=alerts.map(a=>a.id);
 let information=f.notices.filter(n=>!n.id.startsWith('alert:'));
 f.notices=[...information,...alerts.map(a=>({id:'alert:'+a.id,title:a.title,text:a.text,tab:a.tabs[0]}))];
 if(alerts.some(a=>!previous.includes(a.id)))f.noticeCollapsed=false;
 f.activeAlerts=ids;
};
const addNoticeBeforeDock=addNotice107;
addNotice107=function(id,title,text,tab='overview'){let f=features107(),fresh=f&&!f.notices.some(n=>n.id===id);addNoticeBeforeDock(id,title,text,tab);if(fresh)f.noticeCollapsed=false};
dismissNotices107=function(){let f=features107();if(!f)return;f.noticeCollapsed=true;save();renderNotices107()};
function openNotices(){let f=features107();if(!f)return;f.noticeCollapsed=false;save();renderNotices107()}
let noticeDockPosition=.72,noticeDrag=null,noticeSuppressClick=false;
try{let stored=Number(localStorage.getItem(KEY+'-notice-dock-y'));if(localStorage.getItem(KEY+'-notice-dock-y')!==null&&Number.isFinite(stored))noticeDockPosition=clamp(stored,0,1)}catch(_){}
function persistNoticeDock(){try{localStorage.setItem(KEY+'-notice-dock-y',String(noticeDockPosition))}catch(_){}}
function positionNoticeDock(){
 if(typeof window==='undefined')return;let dock=$('alert-dock'),panel=$('alert-notice');if(!dock||dock.hidden)return;
 let height=dock.offsetHeight||76,available=Math.max(0,window.innerHeight-height-24),top=12+available*noticeDockPosition;dock.style.top=top+'px';
 if(!panel.hidden){let panelHeight=panel.offsetHeight||260;panel.style.top=clamp(top+height/2-panelHeight/2,12,Math.max(12,window.innerHeight-panelHeight-12))+'px';panel.style.bottom='auto'}
}
function noticeDockPointerDown(event){if(event.button!==undefined&&event.button!==0)return;let dock=$('alert-dock');noticeSuppressClick=false;noticeDrag={id:event.pointerId,y:event.clientY,top:dock.getBoundingClientRect().top,moved:false};dock.setPointerCapture?.(event.pointerId)}
function noticeDockPointerMove(event){if(!noticeDrag||event.pointerId!==noticeDrag.id)return;let distance=event.clientY-noticeDrag.y;if(Math.abs(distance)>4)noticeDrag.moved=true;if(!noticeDrag.moved)return;let height=$('alert-dock').offsetHeight||76,available=Math.max(1,window.innerHeight-height-24);noticeDockPosition=clamp((noticeDrag.top+distance-12)/available,0,1);positionNoticeDock();event.preventDefault()}
function noticeDockPointerUp(event){if(!noticeDrag||event.pointerId!==noticeDrag.id)return;let tap=event.pointerType==='touch'&&!noticeDrag.moved&&event.type!=='pointercancel';noticeSuppressClick=noticeDrag.moved;noticeDrag=null;persistNoticeDock();if(tap){features107()?.noticeCollapsed?openNotices():dismissNotices107();noticeSuppressClick=true}}
function noticeDockClick(event){if(noticeSuppressClick&&event?.detail!==0){noticeSuppressClick=false;return}noticeSuppressClick=false;features107()?.noticeCollapsed?openNotices():dismissNotices107()}
function noticeDockKey(event){if(event.key!=='ArrowUp'&&event.key!=='ArrowDown')return;event.preventDefault();noticeDockPosition=clamp(noticeDockPosition+(event.key==='ArrowUp'?-.05:.05),0,1);persistNoticeDock();positionNoticeDock()}
renderNotices107=function(){
 let node=$('alert-notice'),dock=$('alert-dock'),f=features107(),notices=f?.notices||[],unavailable=!notices.length||!!s.ended;
 dock.hidden=unavailable;node.hidden=unavailable||f.noticeCollapsed===true;
 if(unavailable){node.innerHTML='';return}
 dock.innerHTML=`<span class="notice-grip" aria-hidden="true">⠿</span><span>${f.noticeCollapsed?'提醒':'收起'}</span><b>${notices.length}</b>`;
 dock.setAttribute?.('aria-expanded',String(!node.hidden));dock.setAttribute?.('aria-label',`执政提醒，${notices.length}条，点击${node.hidden?'展开':'收起'}；拖动或使用上下方向键调整位置`);
 if(!node.hidden)node.innerHTML=`<div class="notice-header"><b>执政提醒 · ${notices.length}</b><button onclick="dismissNotices107()" aria-label="收起执政提醒">知道了</button></div><div class="notice-list">${notices.map(n=>`<article><b>${esc(n.title)}</b><p>${esc(n.text)}</p><button onclick="changeTab('${n.tab}')">前往处理 →</button>${!n.id.startsWith('alert:')?`<button class="quiet" onclick="removeInformationNotice('${n.id}')">移除此通知</button>`:''}</article>`).join('')}</div><small>知道了会收至侧边，可随时展开；侧边按钮支持上下拖动。提醒不阻碍推进季度。</small>`;
 positionNoticeDock();
};
function removeInformationNotice(id){if(id.startsWith('alert:'))return;features107().notices=features107().notices.filter(n=>n.id!==id);save();renderNotices107()}
if(typeof window!=='undefined'&&window.addEventListener){window.addEventListener('resize',positionNoticeDock);window.addEventListener('orientationchange',positionNoticeDock)}
const validBeforeImmersion=validSave;
validSave=function(v){return validBeforeImmersion(v)&&(v.features107?.noticeCollapsed===undefined||typeof v.features107.noticeCollapsed==='boolean')};
