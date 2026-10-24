// Generate native GitHub Wiki Markdown from the current in-game reference.
// Usage: node tools/build-wiki.cjs (no external dependencies).
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),out=path.join(root,'wiki-source');
const WIKI='https://github.com/Henryvnnn/nation-state/wiki',GAME='https://Henryvnnn.github.io/nation-state/',REPO='https://github.com/Henryvnnn/nation-state';
let nodes={},ctx={console,setTimeout:()=>{},localStorage:{getItem:()=>null,setItem(){}},document:{getElementById:id=>nodes[id]||(nodes[id]={innerHTML:'',style:{},showModal(){this.open=true},close(){this.open=false},addEventListener(){}})}};
vm.createContext(ctx);
for(const name of ['game','political','governance','revision12','situations','release103','release104','cabinet-tasks','release107','coalition107','interface107','console107','action-points','immersion','constitution','guide'])vm.runInContext(fs.readFileSync(path.join(root,name+'.js'),'utf8'),ctx,{filename:name+'.js'});
vm.runInContext("selectedRegime='presidential';create('wiki-reference');",ctx);
const data=JSON.parse(vm.runInContext('JSON.stringify({entries:guideCatalog104(),regimes:REGIMES,executives:EXECUTIVE_NAMES,regimeDescriptions:REGIME_GUIDE104,axes:AXIS_NAMES,democratic:DEMO_IDEOLOGIES,nonDemocratic:NONDEMO_IDEOLOGIES,socialist:SOCIALIST_IDEOLOGIES,policies:policyMeta})',ctx));
let entries=data.entries.filter(e=>e.id!=='capital-city');
function change(id,text){entries.find(e=>e.id===id).text=text}
change('ap','政治行动点是每季度处理协商、会见、任免、表决、部长提案和局势的行动额度。创建世界时选择固定、随机或伪随机模式，本局中不再切换。季度事件回复、浏览页面和修改内阁任务方向不耗点。未使用点数不结转；刷新、导入存档不会重新掷骰或补满行动点。');
change('research','教育与科研预算为8%时，每季度增加16%科研进度；完成教育现代化后改为24%。每累计100%升一级，保留溢出进度。固定模式每级加1点、总额度最多6点；随机模式每级提高骰子下限1点、最高6—6；伪随机模式每级在预排数值上加1点，可超过6点。科研在新季度发放行动点之前结算。');
change('player','玩家职务由政体决定，统一直接控制重大政策与财政。部分政体另行任命总理或宰相，部分政体由玩家直接组阁。是否有民主选举任期限制，以政体表为准；管理员模式不受失败和回合上限限制。');
change('coalition','民主与象征性民主政体中，只有执政联盟所属人物可任命为阁员。君主立宪制和西敏议会制开局自动结盟至至少50%席位，其他支持组阁的政体开局不自动结盟。其他党团关系达到70后，可会见其总召并消耗1行动点邀请加入。其余非民主政体允许所有派系入阁，不设联合政府邀请选项。');
entries.find(e=>e.id==='spring').aliases=entries.find(e=>e.id==='spring').aliases.filter(a=>!a.endsWith('之春')||a==='之春');
const pages=new Map(),link=(name,label=name)=>`[${label}](${WIKI}/${encodeURIComponent(name)})`;
const searchURL='https://github.com/search?q=repo%3AHenryvnnn%2Fnation-state&type=wikis';
const add=(title,body)=>pages.set(title,`# ${title==='Home'?'国策 Wiki':title}\n\n${body.trim()}\n`);
const intro={
 '核心指标':'支持、稳定和经济指标彼此影响。下面的阈值来自当前游戏规则，不是现实政治或经济判断。数值变化应结合国家档案中的历史图表观察。',
 '创建世界与政体':'创建世界时可以选择政体、经济制度、世界种子、困难模式、行动点模式及管理员模式。开启新历史会替换当前进度，请先导出需要保留的存档。政体图片仅为界面示意，规则以游戏设定为准。',
 '行动点与科研':'政治行动额度由开局模式与科研决定。开局另发一份初始额度；伪随机预排表对应随后第1—48季度。',
 '议事机关与联合政府':'先准备预算或改革，再协商支持，最后提交表决。院内支持率是确定的加权结果，不是通过概率；“议程倾向”“团体关系”“院内支持率”是三个不同概念。',
 '内阁与人事':'先看候选人的党派、能力、忠诚和倾向，再决定任命。部长季度任务与持续提案并行：任务在推进季度时自主执行，提案由玩家投入行动点推进。',
 '内阁任务图鉴':'政府首脑和副职使用综合任务；各部部长通常有自主判断、改善本部门财政和三种职责专属方向。更改方向不耗行动点，实际执行会进入季度报告和任期评估。',
 '部长提案图鉴':'提案未完成时，每季度主管忠诚降低0.5。更换官员保留提案进度，已完成奖励不能重复领取。表内费用为基础费用，实际费用与进度以当前官员和已通过预算计算。',
 '财政与预算':'预算滑块只是在拟定草案。提交并经议事机关通过后才生效；经济效果会逐季传导。专项选项的“支出X% GDP”与每季度公共预算是不同的支出方式。',
 '民意与选举':'当前国家包含七个非首都地区和一个首都地区。全国支持率是地方选票的基准，并不等于全国加权选票；履约、发展、历史政策和人口权重都会改变结果。',
 '司法与政治稳定':'最高司法机关名称随政体变化。提高独立性可能带来更多审查互动；压低独立性则可能引发支持、稳定和持续局势风险。',
 '结构性改革':'查看草案即保留它。提交、通过、执行和完成是不同阶段；窗口刷新不会删除已查看、已提交和正在执行的项目。一次性遗产税当前清偿完成时公债的50%，不再清偿全部公债。',
 '局势与危机':'普通开局抽取一个局势，困难模式抽取两个不同局势。开局池只有大罢工、司法公平、经济危机和政治丑闻；奥运、灾害、叛乱、民主化运动及政府危机在执政中出现。局势持续影响可以相互叠加。',
 '任期评估与统治倾向':'标准时长为48季度，游戏历法每年6季度。民主国家完成两届后结算；非民主国家可在第48季度选择继续，此后每12季度再询问。提前失败也会结算。管理员模式无自动结算与失败结束。',
 '界面教程与存档':'入门教程只讲总体目标，具体概念由各页右上角“本页教程”介绍。两种教程都能按空格进入下一步、Esc退出；不会消耗行动点或改变预算草案。',
};
const explicit={
 country:'创建世界与政体',calendar:'快速入门',overview:'界面教程与存档',advance:'快速入门',ap:'行动点与科研',research:'行动点与科研',pressure:'核心指标',
 budget:'财政与预算','budget-submit':'财政与预算','budget-reset':'财政与预算','reform-window':'结构性改革',reforms:'结构性改革',
 assembly:'议事机关与联合政府',negotiate:'议事机关与联合政府','faction-details':'议事机关与联合政府',meet:'议事机关与联合政府',vote:'议事机关与联合政府',withdraw:'议事机关与联合政府',coalition:'议事机关与联合政府','political-ally':'议事机关与联合政府',
 cabinet:'内阁与人事',appoint:'内阁与人事',replace:'内阁与人事',dismiss:'内阁与人事',programme:'部长提案图鉴','programme-cost':'部长提案图鉴',
 judiciary:'司法与政治稳定',judicial:'司法与政治稳定','judicial-pressure':'司法与政治稳定','court-actions':'司法与政治稳定',
 elections:'民意与选举',situations:'局势与危机',government:'局势与危机',settlement:'任期评估与统治倾向',
 seed:'创建世界与政体',difficulty:'创建世界与政体','economic-model':'创建世界与政体',
};
const category={
 '宪法与司法':'司法与政治稳定',
 '基本概念':'核心指标','经济与财政':'财政与预算','政治机制':'行动点与科研','内阁与科研':'内阁与人事','立法与政治':'议事机关与联合政府','地区与选举':'民意与选举','局势与处置':'局势与危机','局势处置':'局势与危机','历史与评估':'任期评估与统治倾向','统治倾向':'任期评估与统治倾向','政体与职务':'创建世界与政体','人物倾向':'内阁与人事','内阁任务':'内阁任务图鉴','结构性改革':'结构性改革','部长提案':'部长提案图鉴','存档与设置':'界面教程与存档','页面与操作':'界面教程与存档'
};
const location=e=>explicit[e.id]||category[e.category]||'核心指标';
const anchor=e=>'concept-'+e.id.replace(/[^\p{L}\p{N}_-]/gu,'-');
const entryLink=e=>`[${e.title}](${WIKI}/${encodeURIComponent(location(e))}#${encodeURIComponent(anchor(e))})`;
function article(e){let aliases=[...new Set(e.aliases)].filter(a=>a!==e.title);return `<a name="${anchor(e)}"></a>\n\n## ${e.title}\n\n${e.text}\n${aliases.length?'\n**同义词 / 可搜索词：** '+aliases.join('、')+'\n':''}`}
let groups=new Map();for(let e of entries){const name=location(e);if(!groups.has(name))groups.set(name,[]);groups.get(name).push(e)}
let quick=`第一次游玩建议选择普通模式和固定行动点，先熟悉一季的决策顺序。\n\n1. **创建国家。** 选择政体卡片；下方缩略图铺满边框，选中后上方显示完整图片与身份、议事机关、行政机构。\n2. **查看风险。** 在总览检查支持、稳定、就业、债务和局势，先处理近期会造成失败的风险。\n3. **安排人事。** 补齐内阁空缺，查看忠诚、能力、本季任务与未完成提案。\n4. **处理议程。** 拟定预算或改革，查看院内支持率；不足时先协商，再花费行动点表决。\n5. **回应地方。** 留意尚未完成的地方诉求、盟友关系与加权选票预测。\n6. **推进季度。** 结算经济、科研、官员任务及局势，回复至少三件季度事件，再处理选举或任期结算。\n7. **复盘。** 点击指标查看折线图，或进入国家档案观察长期趋势。\n\n| 事项 | 时间或门槛 |\n| --- | --- |\n| 游戏历法 | 每年6季度，每届24季度 |\n| 民主选举 | 第24、48季度；加权得票须超过50% |\n| 民主任期上限 | 默认两届、48季度；修宪可改变 |\n| 非民主继续执政 | 第48季度询问，此后每12季度再询问 |\n| 改革窗口 | 每6季度刷新未查看草案 |\n| 地方诉求 | 每12季度换一轮 |\n| 普通游戏的稳定失败线 | 稳定低于20 |\n\n${link('行动点与科研')} · ${link('局势与危机')} · ${link('常见问题')}`;
for(let [title,list]of groups){let pre=title==='快速入门'?quick:intro[title]||'';add(title,pre+'\n\n'+list.map(article).join('\n'))}
let regimeIntro='\n\n## 十二种政体总览\n\n| 政体 | 玩家 | 议事机关 | 行政机构 | 任命政府首脑 | 民主任期规则 |\n| --- | --- | --- | --- | --- | --- |\n'+data.regimes.map(r=>`| ${r.name} | ${r.player} | ${r.body} | ${data.executives[r.id]} | ${r.head||'玩家直接组阁'} | ${r.democratic?'两届，48季度':'48季度后可选择继续'} |`).join('\n');
regimeIntro+='\n\n### 需要区分的制度规则\n\n- 一党独大制使用**最高人民会议**，由执政党内部派别、民主党派和无党籍团体组成；前三派合计82席。\n- 君主立宪制、西敏议会制开局自动组建至少50%席位的联合政府。联邦委员会制不会自动组建联盟，议案通过门槛为60%。\n- 神权共和制和象征性民主制保留选举，但在本游戏中不属于48季度强制结束的民主统治规则。\n- 神权共和制的宗教与行政权力安排，以及总统制另设总理，均为本游戏的简化设定。\n';
regimeIntro+='\n## 政体图片\n\n'+data.regimes.map(r=>`### ${r.name}\n\n<img src="https://raw.githubusercontent.com/Henryvnnn/nation-state/main/assets/regimes/${r.id}.png" alt="${r.name}示意图片" width="420">\n\n${data.regimeDescriptions[r.id]}\n\n**司法机关：** ${r.court}。\n`).join('\n');
pages.set('创建世界与政体',pages.get('创建世界与政体').replace('\n\n'+article(groups.get('创建世界与政体')[0]),regimeIntro+'\n\n'+article(groups.get('创建世界与政体')[0])));
const actionTable='## 三种模式对照\n\n| 模式 | 初始季度规则 | 科研每升级一次 | 上限 |\n| --- | --- | --- | --- |\n| 固定行动点 | 每季3点 | 季度额度加1 | 6点 |\n| 随机行动点 | 每季从1—6抽取 | 骰子下限加1 | 最终6—6 |\n| 伪随机行动点 | 开局预排48季，1—6各8次并打乱 | 预排值额外加1 | 可以超过6点 |\n\n例如第10季度预排为2点，第9季度已完成第一次科研升级，则第10季度获得3点。所有模式中，浏览、读档与刷新都不会重掷或恢复已花费点数。\n\n';
pages.set('行动点与科研',pages.get('行动点与科研').replace('\n\n<a name=', '\n\n'+actionTable+'<a name='));
const voteExample='## 表决计算示例\n\n全票支持门槛以60为基准。相对现行预算，个税每变化1个百分点使门槛同向变化1；消费税每变化1.5个百分点对应1；企业税每变化2个百分点对应1。公共支出再按各党偏好修正，执政党也适用。\n\n- 折算倾向 = 议程倾向 −（本案全票门槛 − 60）。\n- 党团支持比例 = 将（折算倾向 − 50）÷10限制在0—1范围内。\n- 院内支持率 = 各党席位 × 各党支持比例的总和 ÷ 总席位 ×100%。\n\n例如一个30席党团的折算倾向为55，其支持比例为50%，计入15个支持权重。一般政体总院内支持率达到51%通过，联邦委员会制达到60%通过。低于50的各派系折算倾向还会在议案通过后产生稳定损失。\n\n';
pages.set('议事机关与联合政府',pages.get('议事机关与联合政府').replace('\n\n<a name=', '\n\n'+voteExample+'<a name='));
const ideologyLists='## 评估维度与候选名单\n\n九个维度：'+data.axes.join('、')+'。决策记录占70%，最终政策与指标占30%。最后显示契合度最高的三项，百分比彼此独立，不相加为100%。\n\n**民主政体候选：** '+data.democratic.map(x=>x[0]).join('、')+'。\n\n**非民主政体候选：** '+data.nonDemocratic.map(x=>x[0]).join('、')+'。\n\n**非民主社会主义国家额外候选：** '+data.socialist.map(x=>x[0]).join('、')+'。\n\n';
pages.set('任期评估与统治倾向',pages.get('任期评估与统治倾向').replace('\n\n<a name=', '\n\n'+ideologyLists+'<a name='));
const faq=[
 ['为什么全国支持率70%，加权选票却不足70%？','地区票率还受地方履约、发展和历史政策修正。完全未履约时，基础部分最多乘80%，70%可先降至56%，再计入其他修正。'],
 ['为什么修改预算后没有立即变化？','滑块只是草案，需要提交并通过表决。即使通过，宏观经济也会逐季吸收政策变化；科研和提案折扣按已通过的当前预算计算。'],
 ['院内支持率是不是通过概率？','不是。它是席位加权的确定支持率，达到当前政体门槛就通过。'],
 ['为什么不能任命其他党派的部长？','民主与象征性民主政体限制执政联盟人物入阁。与该党团关系达到70后，通过该党总召邀请组阁；其他非民主政体不设此限制。'],
 ['为什么部长忠诚持续下降？','未完成的部门提案每季度扣0.5忠诚，此外事件和政治互动也会影响忠诚。'],
 ['政府危机为什么没有处置按钮？','必须去议事机关协商，恢复失信盟友关系至严格超过60，或邀请新党派组建至少50%席位的新联盟。期限为三个季度。'],
 ['稳定低于35就一定叛乱吗？','不是。连续两季低于35且至少三个地区尚未完成诉求后，每季有35%触发概率。稳定低于20本身就会结束普通游戏。'],
 ['遗产税是否还能清除所有债务？','不能。当前改革清偿完成时公债的50%。GDP不变时，债务率70%降为35%。'],
 ['奥运失败后能重新申办吗？','不能。接受申办后就消耗整局唯一机会，失败或取消都不恢复；拒绝邀请不消耗机会。'],
 ['提醒收起来后怎样再看？','点击页面右侧的提醒按钮重新展开，也可拖动它上下移动。收起提醒不消除问题，问题解决后相关提醒和红点才消失。'],
 ['在哪里看完整图片？','创建世界时点击政体卡片，上方预览显示完整图片；下方缩略图为了铺满卡片会裁切边缘。'],
 ['随机行动点能通过刷新重掷吗？','不能。本季度结果已经保存，刷新、读档和导入都不重掷。'],
 ['为什么看不到任期评估？','进行中的游戏不显示此入口。请到国家档案看实时历史图表；结束后才出现任期评估。'],
 ['换设备后为什么没有存档？','存档保存在浏览器本地，不随GitHub账号同步。先在原设备导出JSON，再到新设备导入。'],
 ['网页更新了，但我仍看到旧界面怎么办？','先导出存档备份，再使用强制刷新或重新打开游戏链接。浏览器清理站点数据会删除本地存档，不应作为第一步。'],
 ['如何报告问题？',`在${REPO}/issues 提交问题，写明版本1.0.7、浏览器、政体、季度、复现步骤、预期结果与实际结果。可以附截图；如分享存档，请只附需要复现的游戏存档。`],
];
add('常见问题',faq.map(([q,a])=>`## ${q}\n\n${a}`).join('\n\n'));
add('搜索与术语索引',`先展开右侧 **Pages**，在 **Find a page or section** 搜索栏中查找页面标题；查找正文内容时可进入[本仓库 Wiki 全文搜索](${searchURL})，保留查询中的 \`repo:Henryvnnn/nation-state\` 并追加关键词。GitHub索引可能需要时间更新，刚发布的内容也可直接用本页索引，或按 Ctrl+F 搜索同义词。\n\n本索引按主题汇总 ${entries.length} 个概念条目，随机国家名、人名、党名以及普通事件标题不作为独立词条。\n\n`+[...groups].map(([title,list])=>`## ${title}\n\n`+list.map(e=>`- ${entryLink(e)}${e.aliases.filter(a=>a!==e.title).length?'：'+[...new Set(e.aliases.filter(a=>a!==e.title))].join('、'):''}`).join('\n')).join('\n\n'));
add('更新日志',`当前游戏显示版本为 **1.0.7**。下面保留历史版本记录；其中较早的规则、开发版本号和教程形式可能已被后续更新替代，现行玩法请以本 Wiki 对应条目为准。文件名中的107是保留的模块标识，不代表游戏仍显示1.0.7。\n\n---\n\n`+fs.readFileSync(path.join(root,'README.md'),'utf8').replace(/^# .*\n/,''));
const menu=[['开始游戏',['快速入门','创建世界与政体','行动点与科研']],['治理规则',['核心指标','议事机关与联合政府','内阁与人事','内阁任务图鉴','部长提案图鉴','财政与预算','民意与选举','司法与政治稳定','结构性改革','局势与危机','任期评估与统治倾向']],['查询与帮助',['搜索与术语索引','界面教程与存档','常见问题','更新日志']]];
add('Home',`**国策 · 虚构国家政治模拟 / 当前版本 1.0.7**\n\n执掌一个随机生成的虚构国家，在议会协商、内阁人事、财政预算、地区诉求和持续危机之间推进自己的议程。规则中的政体、经济效果与政治倾向都是游戏模型。\n\n**[开始游戏](${GAME}) · ${link('快速入门','第一次游玩')} · ${link('搜索与术语索引','搜索与词条索引')} · [Wiki全文搜索](${searchURL})**\n\n## 如何查找内容\n\n- **找页面：** 点击右侧 **Pages** 展开 **Find a page or section** 搜索栏。\n- **找概念：** 打开${link('搜索与术语索引')}，例如“稳定”“稳定度”“政治稳定”会指向同一条目。\n- **查全文：** 使用上方全文搜索入口，在仓库限定条件后添加关键词；新页面未被索引时，可先用词条索引与 Ctrl+F。\n\n## 从这里开始\n\n| 你想做什么 | 阅读页面 |\n| --- | --- |\n| 了解一季度怎么玩 | ${link('快速入门')} |\n| 比较十二种政体与玩家身份 | ${link('创建世界与政体')} |\n| 看懂固定、随机、伪随机行动点 | ${link('行动点与科研')} |\n| 争取法案支持、维持联合政府 | ${link('议事机关与联合政府')} |\n| 选部长、安排任务、完成提案 | ${link('内阁与人事')}、${link('部长提案图鉴')} |\n| 处理罢工、债务或政府危机 | ${link('局势与危机')} |\n| 理解地区选票与地方诉求 | ${link('民意与选举')} |\n| 查看近期修改和问题处理 | ${link('更新日志')}、${link('常见问题')} |\n\n## 全部内容\n\n`+menu.map(([title,names])=>`### ${title}\n\n`+names.map(n=>'- '+link(n)).join('\n')).join('\n\n')+`\n\n## 最新界面与规则\n\n- 一党独大制使用“最高人民会议”，行政机构使用“政务院”。\n- 政体卡片使用玩家指定图片，缩略图铺满，选中后预览完整图片。\n- 执政提醒可收至右侧并上下拖动，点击重新展开。\n- 入门教程与各页教程均支持空格前进。\n- 当前行动点模式、政府危机和科研规则见对应章节；历史更新记录不代替现行规则。`);
pages.set('_Sidebar',`**国策 Wiki**\n\n展开上方 **Pages** 即可使用搜索栏。\n\n${link('Home','🏠 主页')}\n\n${link('搜索与术语索引','🔎 搜索与术语索引')}\n\n[全文检索](${searchURL})\n\n`+menu.map(([title,names])=>`### ${title}\n\n`+names.map(n=>'- '+link(n)).join('\n')).join('\n\n')+`\n\n---\n\n[开始游戏](${GAME}) · [反馈问题](${REPO}/issues)\n`);
pages.set('_Footer',`${link('Home','返回主页')} · ${link('搜索与术语索引','搜索与索引')} · ${link('更新日志')} · [开始游戏](${GAME}) · [反馈问题](${REPO}/issues)\n\n本 Wiki 对应国策 1.0.7，按当前游戏代码整理。模型用于游玩，不作为现实经济或政治制度的精确描述。\n`);
fs.mkdirSync(out,{recursive:true});for(let [title,body]of pages)fs.writeFileSync(path.join(out,title+'.md'),body);
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({version:'1.0.7',entryCount:entries.length,pages:[...pages].map(([title,content])=>({title,file:title+'.md',characters:content.length}))},null,2)+'\n');
console.log(`Generated ${pages.size} Wiki files with ${entries.length} reference entries.`);
