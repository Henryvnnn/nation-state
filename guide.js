/* Searchable in-game reference and a read-only, DOM-anchored walkthrough. */
const REGIME_GUIDE104={
 constitutional:'你所扮演的是君主立宪制国家。君主为礼仪元首，你作为总理组阁并维持议会信任。',
 presidential:'你所扮演的是总统制民主共和国。总统领导政府、提出预算，与议会协商；本游戏另设总理协调内阁。',
 semi:'你所扮演的是半总统制国家。总统与总理分享行政职责，重大议程仍须获得议会支持。',
 westminster:'你所扮演的是西敏议会制国家。首相直接组阁，对议会负责，失去信任可能提前下台。',
 federal:'你所扮演的是联邦委员会制国家。玩家担任协调总理，重大院内支持率须达到 60%。',
 theorepublic:'按本游戏设定，你所扮演的是神权君主立宪体制的国家。宗教权威与民选机构并立，最高领袖领导国家。',
 symbolic:'你所扮演的是象征性民主制国家。保留选举和议会，行政权集中；民意主要通过政治稳定影响统治。',
 party:'你所扮演的是一党独大制国家。最高人民会议包含执政党内部派系、民主党派和无党籍团体。',
 absolute:'你所扮演的是君主专制国家。君主决定重大国务，枢密院提供政治支持，宰相负责日常治理。',
 aristocratic:'你所扮演的是贵族制国家。执政公爵需协调贵族和地方团体，宰相拥有较强行政权。',
 tyranny:'你所扮演的是僭主制国家。最高执政官依赖精英、地方和安全系统的配合维持统治。',
 theoabsolute:'你所扮演的是神权专制国家。最高教长统治国家，教团组成枢密院，宰相负责行政执行。'
};
function playerGuide104(){let r=regime();if(s.adminMode)return `你担任${r.player}并兼管财政。本存档已启用管理员模式，控制台可修改数据，选举失败与其他结束条件均不会终止本局。`; if(r.id==='theorepublic')return '最高领袖掌握重大国务决策权，没有任期。本游戏将总统和财政部长的职责一并融合于最高领袖，方便玩家游玩；仍须维持政治稳定。';if(r.democratic)return `你担任${r.player}，决定预算、人事与重大政策，并兼管财政。选举决定是否留任，最多执政两届、48 个季度。`;return `你担任${r.player}，决定重大国务并兼管财政，没有民主选举的强制任期限制。低稳定仍会导致统治结束，第 48 季度起可选择结算。`}
function legislativeGroups104(){return regime().id==='party'?'这些是你的立法机关中的政党和你所在政党的派系，也包括无党籍团体。':regime().body==='枢密院'?'这些是枢密院中的派系与政治团体。':'这些是你立法机关中的政党／派系。'}
function guideNormalize104(text){return String(text).normalize('NFKC').replace(/\s+/g,'').replace(/^[、，。！？：；,.!?;:‘’“”\"'（）()【】\[\]]+|[、，。！？：；,.!?;:‘’“”\"'（）()【】\[\]]+$/g,'').toLowerCase()}
function guideCatalog104(){
 let entries=[];function add(id,title,aliases,text,category='基本概念'){entries.push({id,title,aliases:[title,...aliases],text,category})}
 add('country','国家',['你所扮演的国家'],'这是你所扮演的虚构国家。名称只用于区分世界；政体、经济类型、地区状况和你的决策决定实际玩法。');
 add('overview','执政总览',['国家总览','总览'],'查看国家主要指标、当前局势、待决事件与执政压力，是统筹本季工作的入口。','页面与操作');
 add('advance','推进季度',['下一回合','推进回合','回复季度事件','本季已回复事件','待决事件'],'推进一季度会结算经济、官员施政、科研和持续局势，并恢复行动点。每季度至少三件决策事件，回复完成后才进行选举和任期结算。','页面与操作');
 add('calendar','季度',['回合','年份','年','任期','本届已过','距选举 / 评议'],'本游戏每年有 6 季度，每届 24 季度。民主国家在第24、48季度选举，完成两届后结算；其他国家第48季度可继续，此后每12季度再次询问。');
 add('ap','政治行动点',['行动点','可用行动点','可用政治行动点','本季政治行动点','本季度政治行动点','本季政治行动点总数','每季度政治行动点总数','本季度剩余行动点'],`本局采用${ACTION_POINT_MODES[actionMode()]}。${actionModeDescription()}协商、会见、任免、表决、提案推进与局势处置通常各耗1点；季度事件回复、浏览页面和更换任务方向不耗点。未用完的点数不会累积，刷新和读档不会重新投骰。`);
 for(let [mode,label]of Object.entries(ACTION_POINT_MODES))add('ap-'+mode,label,mode==='random'?['掷骰','投骰子','随机行动点模式']:mode==='planned'?['伪随机','预排行动点']:['固定行动点模式'],actionModeDescription(mode)+' 创建世界时选择，本局期间不能切换。开局另有一份初始行动点；预排表对应随后第1—48季度。','政治机制');
 add('approval','公众支持',['支持','支持度','支持率','全国支持率','民意'],'衡量公众对政府的认可，是地区选票的基准。民生、就业、事件选择和履约会影响支持；通胀、失业、失信等会削弱支持。非民主政体中，支持每季额外影响稳定，修正为（支持−55）×0.08。');
 add('stability','政治稳定',['稳定','稳定度','国家稳定'],'反映社会秩序与统治基础，范围0至100。低于20会结束游戏。连续两季度低于35，且至少三个地区尚未完成地方诉求后，每季有35%概率触发叛乱，并非只要低于35就必然出现。事件和局势选项、增加行政安全预算等可提高稳定；削减行政安全预算、危机和撤换部长、总理或宰相等可能降低稳定，撤换后果还受政绩与政体影响。');
 add('growth','实际年化增长',['GDP增长','GDP 增长','增长','增长率','经济增长','年化增长','潜在增长','增长压力','年化增长压力'],'实际经济产出的年化增长速度。教育、基础设施、改革、预算需求和投资信心都会影响增长；利率、外部环境与危机会带来压力。增长压力是持续若干季度的增长修正，不是直接发放现金。','经济与财政');
 add('gdp','GDP',['名义 GDP','名义GDP','国内生产总值','标准货币','十亿元'],'国家经济总量，以十亿元标准货币计。它受实际增长与通胀影响。选项中“支出1% GDP”表示按执行时的GDP一次性增加对应金额债务。','经济与财政');
 add('per-capita','人均名义 GDP',['当前人均名义 GDP','人均GDP'],'国家名义GDP除以人口。用来观察人均经济规模，不能直接等同居民收入或实际购买力。','经济与财政');
 add('inflation','通货膨胀',['通胀','通胀率','通货膨胀率'],'物价上升速度。过高通胀削弱购买力和支持，央行会调整利率回应。通胀达到50%可触发经济危机；结束危机同时要求通胀低于20%、债务/GDP低于60%。','经济与财政');
 add('unemployment','失业率',['失业','就业'],'劳动力中没有工作者的比例。高失业损害支持，达到10%可触发全国大罢工。救济、公共工程、民生改革和更强增长可改善就业；部分私有化或紧缩措施会短期增加失业。','经济与财政');
 add('debt','政府债务',['债务','公债','公共债务','债务/GDP','债务 / GDP','债务率','公共债务历史','债务管理'],'政府尚未偿还的借款。债务/GDP衡量债务相对经济规模；赤字和专项支出增加债务，盈余和偿债措施减少债务。达到100%可触发经济危机；超过190%且信心低于25会结束游戏。','经济与财政');
 add('confidence','投资者信心',['信心','投资信心','债券市场信心'],'市场对国家经济、政策与偿债能力的信任。高信心有利投资和融资；高债务、赤字、政治危机和失信会使其下降。','经济与财政');
 add('rate','政策利率',['利率','央行','中央银行','独立央行','基准利率','央行利率','中央银行政策利率'],'中央银行调节货币环境的基准利率。游戏中的独立央行每季度根据通胀和经济增长自动调整，玩家不能直接设定。加息通常抑制投资需求和通胀，但抬高借贷成本；降息支持经济活动，也可能增加通胀压力。政策利率还影响国债收益率与政府利息支出。','经济与财政');
 add('yield','债券收益率',['国债收益率','借贷成本','融资成本'],'国家融资需要支付的市场利率。政策利率高、投资信心低或债务率过高，会抬高收益率与财政利息负担。','经济与财政');
 add('rating','主权信用评级',['评级','信用评级','AAA','AA','BBB','BB','CCC'],'对政府融资风险的游戏内分档，从AAA到CCC。主要由债务/GDP和投资者信心计算；债务高或信心低会恶化评级。','经济与财政');
 add('budget','财政与预算',['预算','财政','公共财政','预算草案','季度财政与公共预算案'],'调整税率和公共预算。先拟定并提交，再由权力机关表决；通过后替换现行政策。各税收和支出变化会改变不同派系的支持门槛。','页面与操作');
 add('revenue','财政收入',['收入','税收','预计财政收入','税收政策'],'收入按税基折算：个税率×0.48＋企业税率×0.19＋消费税率×0.62＋3%。提高税率可能增加收入，也会提高预算案的支持要求。','经济与财政');
 add('spending','公共支出',['支出','政府支出','公共预算','预算分配','固定行政','固定行政 3%'],'各项公共预算占GDP比例之和，再加固定行政支出3%。这是持续预算；事件或提案中的一次性支出另外增加公债。','经济与财政');
 add('balance','财政余额',['财政收支','财政盈余','盈余','财政赤字','赤字','预计盈余','预计赤字'],'财政余额＝财政收入−公共支出−利息支出。正数为盈余，可偿债；负数为赤字，会增加债务。财政压力还会影响支持、稳定和信心。','经济与财政');
 add('interest','利息支出',['债务利息','利息'],'当前利息支出/GDP＝债务/GDP×债券收益率。借贷成本上升时，即使公共服务预算不变，财政压力也可能加重。','经济与财政');
 add('brake','债务刹车',['财政规则'],'开启后，财政赤字超过3%时每季度削减基础设施和社会保障各0.5个百分点，受最低预算限制。可改善财政纪律和信心，但也会压缩公共服务。','经济与财政');
 add('lag','政策滞后',['经济影响逐季传导','实际执行预算'],'经济模型每季吸收约35%的政策变化，因此增长、就业与通胀不会立即完全响应新预算。科研、提案费用折扣和持续预算承诺按已通过的当前预算计算。','经济与财政');
 for(let [key,m]of Object.entries(policyMeta)){let extra={income:'每提高1个百分点，新预算全票支持门槛＋1，降低时相反。',corporate:'每提高2个百分点，新预算全票支持门槛＋1，降低时相反。',vat:'每提高1.5个百分点，新预算全票支持门槛＋1，降低时相反。',education:'每季度科研进度增加预算数值×2；教育现代化完成后改为×3，还可降低相关提案费用。',health:'公共服务改善有利民意，也可降低相关医疗提案费用。',welfare:'社会民主派尤其重视此项，预算每提高1个百分点，其全票支持门槛降低2。',infrastructure:'提高资本存量，支持长期生产与部分地区诉求，也降低相关建设提案费用。',security:'投入越高，经济模型中的稳定目标越高；削减预算可能逐步损害稳定，也会影响相关提案费用。'}[key];add('policy-'+key,m[0],({income:['个税','所得税'],corporate:['企业税','公司税'],vat:['增值税'],education:['教育科研','教育与科研支出'],health:['卫生预算','医疗预算'],welfare:['福利','福利预算','社会保障支出'],infrastructure:['基建','基建预算','基础设施预算'],security:['行政安全预算','安全预算']})[key],m[3]+extra+' 可调整范围 '+m[1]+'% 至 '+m[2]+'%。','经济与财政')}
 add('capital','基础设施水平',['基础设施等级','基建资本','资本存量'],'反映已有交通、能源和公共设施的积累，与本季基础设施预算不同。持续投资、公共工程和改革可提高它；灾害会破坏设施。','经济与财政');
 add('human','人力资本',['教育资本'],'反映知识、技能与生产能力的积累，影响潜在经济增长。教育投入、教育现代化和相关改革可以提高它；科研等级另外决定政治行动额度。','经济与财政');
 add('research','科研水平',['科研等级','科研','科研进度','下一级进度'],`每季度科研进度增加教育预算数值×2，教育现代化完成后×3。每100%升一级，保留溢出进度；${actionResearchDescription()}升级在当季发放行动点前结算，已经发放的点数不会因浏览、刷新或导入重复增加。`,'内阁与科研');
 add('assembly','权力机关',['议会','立法机关','枢密院','最高人民会议','人民会议'],'审议预算和改革的机关。民主及部分共和政体使用议会，一党独大制使用最高人民会议，专制和贵族政体使用枢密院。可协商党派、会见负责人、提出并表决议案。','页面与操作');
 add('groups','政党与派系',['政党','党派','派系','党团','政治团体','执政党','执政派系','民主党派','无党籍团体','主流派','新锐派','改革派'],'政党和派系代表不同政治力量。席位决定其表决权重，团体关系、成员关系、倾向和政策偏好决定支持。一党独大制中的前三组是执政党内部派系，并非三个竞争执政党。','立法与政治');
 add('seats','席位',['议席','席','议席比例','议事权重','权力构成'],'决定各党或派系在立法机关的表决权重。它与支持比例共同计算总院内支持率；枢密院使用同样机制表示政治配合程度。','立法与政治');
 add('faction-relation','团体关系',['派系关系','党派关系','集团关系'],'政府与一个党派或派系的关系，范围0至100。协商、任命、事件和承诺会影响它。民主与象征性民主政体中，关系达到70后，可向该党总召邀请组建联合政府。','立法与政治');
 add('member-relation','个人关系',['成员关系','关系'],'政府与立法机关具体成员的关系。会见回应可改变它，并通过该派系主要成员的平均关系影响议程倾向。','立法与政治');
 add('agenda','议程倾向',['议席倾向','支持倾向'],'当前政治力量对政府议程的支持程度，由团体关系、成员关系、议案取向和临时承诺共同决定。非玩家派系每季减少2点，玩家派系豁免；成功协商可抵消最多8点累计季度损耗。','立法与政治');
 add('faction-profile','派系路线',['关注重点','预算偏好',...Object.values(FACTION_PROFILES103).map(p=>p.name)],'概括党派的政治偏好和最关注的公共预算。增加其偏好的投入会降低该党全票支持门槛，削减时相反；详细系数可在“查看细则”中展开。人物倾向与所属派系路线关联。','立法与政治');
 add('full-support','全票支持门槛',['预算门槛','支持门槛'],'基准60。相对现行预算，税率变化会提高或降低门槛，公共支出按各派系偏好另行修正，执政党也适用。议程倾向达到该门槛时，该派系全体议席支持。','立法与政治');
 add('effective-agenda','折算倾向',[],'折算倾向＝议程倾向−（本案全票支持门槛−60）。50对应0%支持、51对应10%、60对应100%，中间按比例计算。','立法与政治');
 add('faction-support','党团支持比例',['支持比例','支持席位权重'],'该派系支持议案的议席比例，范围0%至100%。将各派系的支持比例按席位加权，即得到院内支持率。','立法与政治');
 add('pass-rate','院内支持率',['通过率','议案通过率','议会通过率','表决支持率','通过门槛','政府议程支持','当前基础院内支持率','所需院内支持率'],'按各党席位加权的总体支持百分比。一般预算／改革达到51%即通过，联邦委员会制需60%；释宪须严格超过50%；修宪须先取得三分之二院内支持，司法审查达到半数即可。达到相应门槛必定通过。低折算倾向派系另产生通过后的稳定损失，不是一次随机抽签。','立法与政治');
 add('opposition-cost','反对压力',['额外稳定损失','稳定损失'],'各派系折算倾向低于50的每一点，在议案通过后扣除0.1稳定度，多个派系累加。原有通过收益另计；表决失败不额外扣这部分损失。','立法与政治');
 add('negotiate','协商',['派系协商'],'打开该党派或派系的谈判选项，以资源、监督或承诺争取支持。执行选项通常消耗1点行动点；查看窗口不消耗。临时支持有期限，承诺会接受核查。','页面与操作');
 add('faction-details','查看细则',['细则','查看表决计算规则'],'展开或收起门槛、折算倾向、席位权重及公共预算偏好。不消耗行动点，也不改变政策。','页面与操作');
 add('meet','会见 / 回应诉求',['会见','回应诉求','主要成员'],'与议长、秘书长及党团代表等交流。每人每季度一次，执行回应消耗1点行动点；回应影响关系、政策与最终统治倾向。','页面与操作');
 add('bill','政府议程',['议案','法案','待表决','提案表决'],'当前送交权力机关的预算或改革。一次只能审议一项，表决通过后才实施；失败保留提案，可继续协商或撤回。','立法与政治');
 add('vote','提交表决',['投票','表决'],'消耗1点行动点，按当前院内支持率决定议案是否实施。失败会损失支持与稳定；议会制连续三次失败且支持低于45时，可能通过不信任案结束游戏。','页面与操作');
 add('withdraw','撤回',['撤回议案'],'取消当前待决议案，不改变已经实施的政策。之后可重新拟定预算或提出其他改革。','页面与操作');
 add('budget-submit','提交财政方案',['提交预算','拟定预算','送交审议'],'将预算草案送到权力机关，尚未生效。通过表决后才替换现行预算，经济随后逐季响应。','页面与操作');
 add('budget-reset','撤销未提交调整',['撤销调整'],'把尚未提交的预算滑块恢复为现行政策，不改变已经提交的议案或生效政策。','页面与操作');
 add('promise','协商承诺',['承诺','临时支持','已兑现','履约','失信','未兑现承诺','协商承诺追踪'],'有期限的政治约定。按时完成会改善关系与支持；失信产生惩罚并进入竞选与结算记录。临时议程支持是暂时加成，重复同类协商只延长期限。','立法与政治');
 add('coalition','联合政府',['组阁资格','执政联盟','邀请组建联合政府'],'民主国家开局从席位超过25的党派中随机确定玩家党派，可以不是最大党。民主和象征性民主政体中，默认只有玩家所属党派人物可入阁。与其他党团关系达到70后，会见总召并消耗1点行动点即可邀请，该党人物进入候选池。其他非民主政体允许所有派系入阁，不设此选项。','内阁与科研');
 add('cabinet','内阁与人事',['内阁','阁员','内阁席位'],'任命、撤换官员并安排施政任务。官员按能力、倾向和忠诚自主执行，季度报告呈现结果；财政部长由玩家兼任。','页面与操作');
 add('skill','能力',['能力值'],'官员处理任务的水平。能力越高，自主任务成功率与部长提案进度加权通常越高；提案能力系数＝0.75＋能力/200。','内阁与科研');
 add('loyalty','忠诚',['忠诚度'],'官员对政府的合作意愿，影响自主执行效果。部门提案未完成时每季降低0.5；推进提案选项可增加1至3点。某些事件会大幅改变忠诚，事件后低于30的在任官员可能主动辞职。','内阁与科研');
 add('achievements','累计政绩',['政绩','历史政绩'],'官员已取得的施政成果。自主任务和完成提案可增加政绩；罢免政绩较高的官员通常引发更明显的政治后果。','内阁与科研');
 add('tenure','任职',['任职季度'],'当前官员在该职位已任职的季度数，随季度推进增加。重新任命会重新计算其任职时长。','内阁与科研');
 add('traits','政治倾向',['倾向','倾向契合','倾向契合度'],'人物的施政偏好，会影响自主任务、司法独立和提案执行。人物倾向与党派关联；与提案契合时，提案进度另乘1.25，否则乘1。它与议程倾向、结算统治倾向属于不同指标。','内阁与科研');
 add('task','本季任务方向',['任务','任务指令','任务方向'],'为官员指定持续的施政重点，不消耗行动点；左侧席位卡显示当前安排，下次推进季度执行。政府首脑与副职保留综合任务，其他部长各有五种职责相关方向。自主判断按政治倾向选择部门任务；能力、忠诚和执行结果决定实际效果，季度报告会列出。','内阁与科研');
 add('reports','季度施政报告',['季度报告','施政报告'],'记录各官员的自主任务结果及提案完成情况，可用于判断留任或撤换。','内阁与科研');
 add('appoint','任命',['候选人名册','候选人','任命确认'],'在符合组阁资格、尚未任职的人物中选择官员，确认消耗1点行动点。同一人物不能同时占据多个内阁职位；任命政府首脑或司法主管还会影响司法独立。','页面与操作');
 add('replace','重新任命',['重新任命部长','重新任命大臣'],'打开合资格候选人名册，确认前会展示旧任离职后果。部门提案进度与已经完成的成果保留，不会因换人重复发奖。','页面与操作');
 add('dismiss','要求辞职',['辞职','罢免','开除部长','开除大臣','开除总理','开除宰相','撤换官员'],'让现任官员离职，消耗1点行动点。政治后果取决于政绩、职权和政体；总理、尤其宰相离职的冲击更大。职位空缺期间也会持续损失稳定。','页面与操作');
 add('vacancy','职位空缺',['空缺'],'政府首脑空缺每季损失3稳定；其他部门每席每季损失0.25稳定。空缺部门无法推进提案，应从合资格候选人中补任。','内阁与科研');
 add('programme','部长 / 大臣提案',['部长提案','大臣提案','部门提案','提案进度'],'持续的部门项目。每个项目有三个推进选项，花费、基础进度和忠诚收益不同；能力及倾向加权决定实际进度。未完成每季主管忠诚−0.5，完成后停止，换人保留进度与成果。','内阁与科研');
 add('programme-cost','投资如何降低费用',['投资折扣','费用折扣','进度加权','基础进度','累计支出'],'实际费用＝基础费用×（1−投资折扣）；各选项按相关已通过预算计算，折扣上限55%。实际进度＝基础进度×（0.75＋能力/200）×倾向系数，契合为1.25，否则为1。累计支出记录实际支付的标准货币。','内阁与科研');
 add('judiciary','最高司法机关',['最高法院','宪法委员会','联邦最高法院','最高宗教宪法法院','最高人民法院','王国最高审判院','贵族最高裁判庭','国家最高裁判庭','最高教法审判庭'],'国家最高法律审查机构，名称随政体变化。可通过互动、任命和事件影响其独立性；高独立提供制度制衡，也会增加司法审查与互动。','页面与操作');
 add('judicial','司法独立',['司法独立度','独立性','独立性连续高位','司法互动概率'],'范围0至100。低于35每季支持−2、稳定−2，低于20时各−3；降至20可触发司法公平事件。连续高位会提高司法互动频率。保障任期和预算、法治型任命与事件选择可提高独立性，行政干预会降低它。','立法与政治');
 add('judicial-pressure','司法干预',['司法干预历史','行政施压'],'行政机关施压司法的记录。可以短期争取配合，但会降低独立性，增加政治风险，并影响选举争论及统治倾向评估。','立法与政治');
 add('court-actions','司法互动',['与最高司法机关互动'],'与最高司法机关沟通或调整制度保障。各项行动的即时效果在按钮中列明，通常消耗1点行动点。','页面与操作');
 add('elections','民意与选举',['选举','选情','全国选举结果','单轮多数选举','单轮两方多数决'],'全国选票由地区票率按人口权重加总。民主国家得票必须超过50%才能继续执政，选举前最后六季度会增加与历史决策有关的竞选事件。象征性民主等政体的选举主要改变稳定与席位。','页面与操作');
 add('forecast','当前加权选票预测',['预测票率','得票率','地区得票率','当前预测','加权支持','当前选情'],'根据当前支持度、地方履约、历史政策与地区发展估算的票率。地区完全未履约时，基础票率最多乘80%；全国结果按地区人口权重计算。预测不等于已经完成的选举结果。','地区与选举');
 add('capital-region','首都地区',['首都','特别行政区','大市','领地'],'首都是独立计票地区，拥有自己的产业、社会基本盘、发展状况与地方诉求。公共服务、科研和安全相关政策可以改善首都履约；与其他地区按人口权重共同决定全国得票率。名称随政体采用特别行政区、特别市、特区、大市或领地。','地区与选举');
 add('regions','地区',['省','特区','自治区','领','州','自治州','自治领','邦','加盟共和国','共和国（加盟）','特别市'],'国家由七个非首都地区与一个首都地区组成，称谓随政体变化。产业、地理、社会基本盘与发展状况不同，所以相同政策对各地选票的影响也不同。具体随机地名不影响操作方式。','地区与选举');
 add('local-demands','地方诉求',['地方要求','诉求','本届诉求','本轮诉求','地区诉求','地方履约','履约进度','未满足诉求扣减'],'每12季度刷新一轮，并由事件提示。符合产业或民生需要的决策、内阁任务和改革可推进诉求；已完成的要求不会重复索要。持续不履约会损害选票和稳定，灾区暂缓原有诉求惩罚。','地区与选举');
 add('development','发展状况',['发展','当前发展','发展程度'],'地区发展水平及其变化，影响地区对政府的认同和票率。灾害会损害发展，重建与合适政策可以改善。','地区与选举');
 add('population','人口',['人口权重','地区人口','65 岁以上人口','人口结构'],'本版人口与初始年龄结构固定，不模拟人口迁移。人口权重决定各地区在全国选举结果中占多大比例。','地区与选举');
 add('base','社会基本盘',['基本盘','主要产业','产业结构','农业 / 工业 / 服务业','地理','宗教','历史政策修正'],'地区主要居民、产业与生活背景。它们帮助你理解当地需求，政策契合度会通过履约与态度修正影响选票。','地区与选举');
 for(let p of PROFILES)add('sector-'+p.sector,p.name,[],`此类地区主要依靠${p.industry}，社会基本盘为${p.base}。较关注${p.need}；相应政策、改革和内阁任务可以推进地方诉求。`,'地区与选举');
 add('regional-modifiers','地区选票修正',['未满足扣减','超额履约','超额履约加成','政策修正','发展修正','综合地区修正','上次实际得票','当前票率预测'],'地区票率以全国支持率为基准，再按未履约、超额履约、历史政策与发展状况调整。未履约最多扣20%，超额履约最多加8%；上次实际得票是已结束选举的历史结果，当前预测会随治理变化。','地区与选举');
 add('pressure','执政压力',['执政挑战','地方压力','财政压力','基础执政损耗'],'每季基础支持−0.6、稳定−0.2。地方诉求进入第六季度后，未完成诉求会追加压力；债务率超过70%或赤字超过4% GDP也会增加压力。履行诉求、控制赤字与债务可减轻它。','立法与政治');
 add('reforms','结构性改革',['改革','改革草案','提出改革','查看 / 提交法案'],'改变国家长期发展条件。先查看草案并提交议案，表决通过后启动；完成执行期后兑现效果。每六季度轮换未查看草案，已查看、已提交及正在执行的项目保留。','页面与操作');
 add('reform-window','改革窗口',['结构性改革窗口','改革轮换','已保留草案','执行期','执行中'],'每六季度会提示旧窗口关闭并生成新草案。查看草案即保留它，启动后需等待规定季度完成；不会因为窗口刷新而丢失正在执行的项目。','经济与财政');
 add('situations','局势',['国家局势','持续危机','局势档案','结束条件','每季影响'],'跨多个季度持续的国家挑战或大型项目。局势页列出触发背景、结束条件、季度影响、专项成本及处置按钮；结束后会有结果通知与历史记录。','页面与操作');
 add('cooldown','冷却',['冷却季度','冷却时间','限一次'],'行动暂时不能再次使用的期限，通常随季度推进解除。“限一次”指该局势内只能用一次；奥运申办则整局仅一次。大罢工紧急救济无季度冷却，但仍消耗资金和行动点。','局势与处置');
 add('strike','全国大罢工',['大罢工','罢工'],'失业达到10%可出现，开局抽中时失业为15%。每季损害增长与信心，并使支持和稳定各−2；失业降到5%以下结束。可持续满足福利或教育预算承诺，也可使用救济与四季度公共工程。','局势与处置');
 add('justice-situation','司法公平事件',['司法公平','司法抗议','民权运动'],'司法独立降至20可出现，开局抽中时独立性为10。每季支持、稳定各−2，并损害信心与增长；独立性超过40结束。非民主和象征性民主政体还有永久禁止此类抗议的选项，但不消除其他政治风险。','局势与处置');
 add('economy-situation','经济危机',['危机'],'通胀达到50%或债务/GDP达到100%可出现。每季失业+1，支持、稳定各−2，并损害增长与信心。需同时将债务/GDP降到60%以下、通胀降到20%以下才能结束。','局势与处置');
 add('scandal','政治丑闻',['丑闻','调查进度','责任处理','责任认定'],'采购和利益输送等争议形成的持续局势。调查进度达到100%且完成责任处理后结束；未解决时损害支持、稳定、信心及涉事派系的议程倾向。','局势与处置');
 add('olympics','奥运',['奥运会','奥运申办','奥运筹办','奥运筹备','主办奥运','奥运申办邀请','场馆处置'],'本局最多成功申办一次；接受申办即使用机会，取消或失败不退还。第12季度后，在稳定至少60、无叛乱和灾害等条件下可能收到邀请，体育基础越高越容易出现。拒绝不消耗机会。接受成本0.3% GDP，筹备八季度，每季维护0.15% GDP。届时进度完成100%、质量达到40即成功：支持+6、信心+3，未来六季增长压力+0.5；超支超过40时支持收益改为+3，另增2% GDP债务。失败为支持−8、信心−4、稳定−3，超支代价仍在；举办后可处理场馆。','局势与处置');
 add('olympic-quality','奥运质量',['质量','超支','筹备进度'],'筹备进度表示设施和组织的完成度；质量决定能否合格举办；超支是风险指数，不是GDP比例。结算时进度完成100%、质量达到40可成功；超支超过40会追加2% GDP债务并减少支持收益。','局势与处置');
 add('disaster','重大自然灾害',['自然灾害','灾害','洪灾','地震','农业旱灾','沿海风暴','森林大火','山地滑坡','救援','安置','重建','严重度'],'执政期间可能发生，不进入开局局势池。灾害损害生产、设施与地区发展；需将救援、安置、重建全部完成到100%才结束。救援与安置先完成后，最严重的季度损耗停止，仍需重建。','局势与处置');
 add('rebellion','叛乱',['叛乱局势','强度','社会基础','控制力','军队忠诚','谈判','和平协议'],'稳定连续两季低于35、至少三个地区未履约后，每季35%概率出现。结束需强度低于20、社会基础低于30、控制力超过60；若通过谈判结束，还需按时兑现地方和平承诺。控制力低于10或军队忠诚低于20会导致游戏结束。','局势与处置');
 add('spring','民主化运动',['之春',countryStem()+'之春','民主化运动局势','民主转型','改革可信度','激进度','运动规模','统治集团团结','军警忠诚'],'非民主政体在独立性低、支持不足和经济危机等条件下积累民主化压力，执政中可能出现。可通过可信改革、制宪转型或压制处理；压制会保留未解决的压力。转型保留已执政季度、历史与经济进度，并举行竞争性选举。','局势与处置');
 add('qe','量化宽松应急安排',['量化宽松','应急债务回表','债务回表','待回表债务'],'本游戏的特殊危机机制：暂移现有公债5%，同时增加通胀等代价。经济危机结束或任期结算时必须全部计回，因此不等于永久偿债。','局势与处置');
 add('sports','体育基础',['国家体育','体育事业'],'体育设施与组织能力，范围0至10。相关改革和事件可提高它，从而增加尚未使用奥运机会时收到申办邀请的概率。','经济与财政');
 add('culture','文化基础',['国家文化','文化事业'],'公共文化设施与文化事业的积累。文化投入和改革能改善民生与就业，并影响地区需求和历史评估。','经济与财政');
 add('archive','国家档案',['档案','国家基本档案','执政纪事'],'查看科研、行动额度、国家结构、债务历史和执政记录，并导入或导出存档。','页面与操作');
 add('seed','世界种子',['种子'],'用于随机生成世界的输入。同版本、同种子与相同开局设置会生成可复现的世界；升级随机规则后，旧种子生成结果可能不同。','存档与设置');
 add('save','本地自动存档',['存档','自动存档'],'游戏进度保存在当前浏览器的本地存储中。换浏览器、换设备或清除站点数据后不会自动同步，建议用导出存档备份。','存档与设置');
 add('export','导出存档',['导出'],'下载当前进度的JSON文件，可用来备份或在另一设备恢复。','页面与操作');
 add('import','导入存档',['导入'],'选择此前导出的存档文件，验证成功后替换当前进度；旧版存档会按规则迁移。','页面与操作');
 add('new-world','开启新历史',['新世界','重新开始','新世界自定义'],'重新生成国家并替换当前进度，可设置世界种子、政体、经济制度与困难模式。保留旧进度请先导出存档。','页面与操作');
 add('difficulty','困难模式',['普通模式','开局局势'],'普通模式随机一个开局危机，困难模式两个不同危机，危机池为大罢工、司法公平、经济危机和政治丑闻。所有模式额外抽取一个宗教少数派问题或少数民族问题，各50%概率；其余局势在执政期间触发。','存档与设置');
 add('economic-model','经济制度',['经济类型','沿海贸易国','内陆工业国','北境福利国','新兴农业国','非民主社会主义国家'],'经济类型决定初始产业、收入水平与增长潜力。非民主社会主义设定还决定结算时是否开放额外社会主义统治倾向。','经济与财政');
 add('capital-city','首都',[],'国家行政中心的虚构地名。本版不单独模拟首都政策，随机名称本身不会改变经济或政治指标。','基本概念');
 add('settlement','任期评估',['任期结算','结算','查看任期结算','任期评估预览'],'汇总完整历史指标与三种最接近的统治倾向。仅在游戏结束后出现；进行中请在国家档案查看历史图表。民主国家第二届结束后自动结算，其他政体从第48季度起可以选择继续。','页面与操作');
 add('ideology','统治倾向',['契合度','统治倾向评估','治理画像','评估依据'],'根据实际决策（70%）和最终政策与指标（30%）生成治理画像，与各倾向模型比较后列出前三名。契合度是相似度，不要求三项相加等于100%。','历史与评估');
 add('charts','历史折线图',['完整任期指标','折线图','历史图表'],'国家档案实时展示经济、支持、稳定与司法等十二项指标的季度变化。点击指标卡片或图表可打开屏幕中央的大图；任期结束后评估页也保留相同图表。旧版存档未记录的数据保留空缺，不补造历史。','历史与评估');
 add('score','综合治理评分',['综合评分','当前综合评分'],'根据国家经济和政治表现计算的游戏内评分，便于比较执政结果；它与统治倾向契合度分别计算。','历史与评估');
 add('guide','治国指南',['指南','概念搜索','搜索'],'输入游戏里的概念或同义词，查看统一条目的解释。搜索不改变进度、不消耗行动点；不收录普通事件标题和随机人物、政党或国家名字。','页面与操作');
 add('tutorial','入门教程',['教程','开启教程','新手教程','跳过教程'],'左栏的入门教程简要介绍政体称呼、受托机构、任期、执政目标、9维评估、治国指南和本页教程的使用方法。不会自动讲解所有板块；可按空格进入下一步，或用左右方向键浏览，右下角跳过或Esc退出。','页面与操作');
 add('page-tutorial','本页教程',['页面教程','板块教程'],'先在左栏选择需要了解的板块，再点击主窗口右上方“本页教程”。按空格进入下一步。只高亮和讲解当前板块中的概念与功能按钮，不跳转到其他板块，不执行政策或消耗行动点。','页面与操作');
 for(let r of REGIMES)add('regime-'+r.id,r.name,r.id==='presidential'?['总统制','民主共和制']:r.id==='theorepublic'?['神权君主立宪体制']:[],REGIME_GUIDE104[r.id]+' '+r.note,'政体与职务');
 add('player','玩家职务',[],playerGuide104(),'政体与职务');
 for(let [role,text]of Object.entries({最高领袖:'神权共和制中的玩家职务。最高领袖掌握重大国务决策权，没有任期；本游戏将总统和财政部长的职责一并融合于最高领袖，方便玩家游玩。',国家主席:'一党独大制中的玩家职务，决定重大政策与人事，任命总理协调内阁。',最高执政官:'僭主制中的玩家职务，依赖安全系统与政治精英维持统治，任命宰相执行日常行政。',执政公爵:'贵族制中的玩家职务，需要协调枢密院内的贵族与地方利益。',君主:'君主专制中的玩家职务，任命宰相处理日常行政；君主立宪制中君主为礼仪元首，玩家改任总理。',最高教长:'神权专制中的玩家职务，领导宗教与国家事务，任命宰相协调行政。',政府协调总理:'联邦委员会制中的玩家职务，直接安排内阁，重大议案须达到60%院内支持率。',总统:'总统制、半总统制或象征性民主制中的玩家职务，负责重大国务并兼管财政，任命总理协调施政。',首相:'西敏议会制中的玩家职务，直接组建内阁，对议会和选举负责。'}))add('role-'+role,role,[],text,'政体与职务');
 add('premier','总理',['政府首脑'],'在总统制等政体中由玩家任命，协调内阁并自主执行任务；在君主立宪、西敏与联邦委员会制中由玩家直接承担相应政府首脑职责。','政体与职务');
 add('chancellor','宰相',[],'专制和贵族政体中的政府首脑，拥有比普通总理更强的行政裁量。能力、倾向和忠诚决定施政；撤换也可能带来更大稳定冲击。','政体与职务');
 add('finance-minister','财政部长',['财政大臣','玩家兼任'],'由玩家直接操控税收、预算与债务安排，因此不进入普通内阁候选人的任命列表。','政体与职务');
 for(let [key,label,job]of PORTFOLIOS)add('office-'+key,label,[label.replace('部长','大臣').replace('副总理','副首相')],`负责${job}。可以任命、安排任务、推进部门提案或要求辞职；会按照自身能力、忠诚和倾向自主施政。`,'政体与职务');
 for(let [title,text]of [['议长','主持立法机关议事的主要负责人，可会见并回应其诉求。'],['副议长','协助主持议事，可通过会见争取其政治支持。'],['秘书长','负责议事组织与协调，会见可以改善成员关系。'],['副秘书长','协助议事组织与协调，也是可会见的主要成员。'],['主席','在最高人民会议或枢密院中主持议事的主要负责人。'],['副主席','协助最高人民会议或枢密院主席处理议事工作。']])add('member-'+title,title,[],text,'政体与职务');
 add('whip','党团总召',['党团代表','院内代表','党鞭','首席代表'],'每个党派或派系仅一位主要代表。可会见回应诉求；符合组阁条件时，还可通过此人邀请该党加入联合政府。','政体与职务');
 for(let t of TRAITS)add('trait-'+t.name,t.name,[],t.desc,'人物倾向');
 for(let key of LEADERSHIP_TASKS105){let label=TASKS[key];add('task-'+key,label,[],key==='balanced'?'由官员自主判断施政方向。部长按政治倾向选择本部门任务，报告列出实际方向；政府首脑与副职保持综合协调。':`政府首脑与副职的综合任务。优先围绕“${label}”施政，季度报告显示实际结果。`,'内阁任务')}
 for(let task of [DEPARTMENT_ECONOMY105,...Object.values(DEPARTMENT_TASKS105).flat()]){let entry=Object.entries(DEPARTMENT_TASKS105).find(([,tasks])=>tasks.includes(task)),scope=entry?PORTFOLIOS.find(p=>p[0]===entry[0])[1]:'各部部长';add('task-'+task.id,task.name,[],`${scope}的任务方向。${task.text}每季度基准额外效果：${departmentImpact105(task.values)}；按能力和忠诚加权，面板显示当前预估。执行受阻时效果与财政节约降至30%，投入仍全额支出。${task.values.growth?'增长影响持续1季度。':''}实际执行会计入9维任期评估。`,'内阁任务')}
 for(let r of REFORMS)add('reform-'+r.key,r.name,r.key==='inheritance'?['遗产税征收','遗产税']:[],r.text+` 启动成本 ${r.cost}% GDP，执行 ${r.lag} 季度，长期潜在增长修正 ${r.boost} 个百分点；完成效果：${impactText(r.values)}。`,'结构性改革');
 for(let [key,p]of Object.entries(MINISTER_PROGRAMMES103)){add('programme-'+key,p.name,[],`属于${key==='head'?'政府首脑':PORTFOLIOS.find(x=>x[0]===key)[1]}的持续提案。${key==='education'?'完成后科研系数从2永久提高为3。':''}完成效果：${impactText(p.reward)}；未完成期间每季主管忠诚−0.5。`,'部长提案');for(let [i,a]of p.options.entries())add('programme-action-'+key+'-'+i,a[0],[],`“${p.name}”的推进选项：基础支出 ${a[1]}% GDP、基础进度 ${a[2]}、主管忠诚＋${a[3]}。实际费用受相关投资折扣影响，进度受能力与倾向加权；每季每项一次，耗1行动点。`,'部长提案')}
 let seen=new Set(entries.flatMap(e=>e.aliases.map(guideNormalize104)));for(let kind of Object.keys(SIT_NAMES))for(let a of situationActions({kind,progress:100,responsibility:false})){if(seen.has(guideNormalize104(a.label)))continue;add('situation-action-'+kind+'-'+a.key,a.label,[],`${SIT_NAMES[kind]}中的处置措施。${a.detail}执行需1行动点。`,'局势处置');seen.add(guideNormalize104(a.label))}
 add('ban','禁止一切抗议行为',[],'仅非民主与象征性民主政体在司法公平局势中可用。支持−10、稳定−5，永久结束此类司法抗议；独立性并不会因此恢复，其他危机仍可能发生。','局势处置');
 add('suppress','压制调查',[],'非民主政体的政治丑闻处置：司法独立−5、信心−3，暂减民意损耗两季，可能因再次泄露而反弹；冷却三季度。','局势处置');
 add('mandate','紧急行政命令',['议会紧急立法','联邦委员会紧急决定','总统紧急行政令','总统与政府联合行政令','国务院紧急经济决定','王室敕令','枢密院紧急令','最高执政官命令','最高教长谕令','最高领袖紧急令','总统行政令'],'经济危机处置中快速采取政策的程序名称，随政体变化。其具体费用与效果由相应局势选项列明，不表示所有国家都拥有相同的现实法律制度。','局势处置');
 for(let [i,axis]of AXIS_NAMES.entries())add('axis-'+i,axis,[],`统治画像的一个维度，用于概括你在“${axis}”方面的决策与政策偏好。最终与其他八个维度共同决定统治倾向契合度。`,'历史与评估');
 let ideologies=[...DEMO_IDEOLOGIES,...NONDEMO_IDEOLOGIES,...SOCIALIST_IDEOLOGIES];
 for(let [name,vector]of ideologies){if(entries.some(e=>e.title===name))continue;let focus=vector.map((v,i)=>({v,name:AXIS_NAMES[i]})).sort((a,b)=>b.v-a.v).slice(0,3).map(x=>x.name).join('、');add('ideology-'+name,name,[],`一种游戏内的结算统治倾向。该模型较重视${focus}；系统比较你的决策和最终政策画像，计算与它的契合度。是否进入候选列表取决于政体与经济制度。`,'统治倾向')}
 add('political-ally','政治盟友',['盟友','联合政府信任'],'君主立宪制和西敏议会制的新世界自动与最接近的党派结盟，再补充其他党派直到联盟拥有至少50%席位。盟友初始议程倾向为60，团体关系随机60至70，人物可入阁；其他民主与象征性民主开局不自动结盟。盟友关系低于50触发政府危机。','内阁与科研');
 add('government','政府危机',['联合政府危机','政府不信任案'],'任一政治盟友关系低于50时出现，持续期间每季支持率−1、政治稳定−3。必须在三季度内把失信盟友关系恢复到60以上，或按关系达到70的邀请规则争取新党派，组成至少50%席位的新联盟。本局势无独立选项，只能在议事机关协商；另组新联盟会让原盟友所属阁员全部辞职，并逐人承担强制辞职后果。君主立宪与西敏政体逾期直接倒阁；其他支持联合政府的政体逾期解散联盟、盟友阁员离任，不直接结束游戏。','局势与处置');
 add('alerts','执政提醒',['红点','提示','风险提示','提醒'],'问题出现时首次弹出提醒，红点持续到问题解决。点击“知道了”会将提醒收至页面边缘，可点击侧边按钮重新展开，也可上下拖动按钮调整位置。收起提醒不会清除红点；提醒不会加入待决事件，不阻碍季度推进。包括空缺、忠诚低于35、未解决局势、选票或支持低于50%、稳定低于35、失业超过8%、通胀超过45%、债务率超过90%、司法独立低于30，以及下季度将刷新未查看改革草案。','页面与操作');
 add('console','控制台',['管理员模式','管理员模式（不建议）'],'仅在创建新世界时选择管理员模式后开放，按钮位于左侧导航最下方。可直接调整经济、政治、预算、地区、人物、科研与局势数据，生成事件或测试内阁空缺；保留正常模拟，但取消所有失败结局和回合上限。只有开启新历史才能替换本局。此模式与存档一起保存，普通存档不会自动开启。','页面与操作');
 if(typeof constitutionGuideEntries==='function')entries.push(...constitutionGuideEntries());
 return entries;
}
let guideEntries104=[];
function guideMatches104(query,entries=guideCatalog104()){let q=guideNormalize104(query);if(!q)return entries.filter(e=>['stability','ap','pass-rate','programme','research','olympics','coalition','local-demands'].includes(e.id));let exact=entries.filter(e=>e.aliases.some(a=>guideNormalize104(a)===q));return exact.length?exact:entries.filter(e=>e.aliases.some(a=>guideNormalize104(a).includes(q)))}
function guideArticle104(entry){return `<article class="guide-entry"><span class="tag">${esc(entry.category)}</span><h3>${esc(entry.title)}</h3><p>${esc(entry.text)}</p>${entry.aliases.length>1?`<small>同义词：${entry.aliases.slice(1).map(esc).join('、')}</small>`:''}</article>`}
showHelp=function(){guideEntries104=guideCatalog104();modal(`<div class="guide-header"><div><span class="tag">国策 · 概念搜索</span><h2>治国指南</h2></div><button class="guide-close" aria-label="关闭治国指南" onclick="$('modal').close()">关闭</button></div><label for="guide-query">输入你想了解的游戏概念</label><input id="guide-query" class="guide-query" type="search" placeholder="例如：稳定、院内支持率、奥运、教育现代化" autocomplete="off" oninput="searchGuide104(this.value)"><p class="guide-hint">支持同义词。收录机制、政体、职务、改革、提案与局势；不收录普通事件和随机人名、地名、党名。</p><div class="guide-chips">${['稳定','院内支持率','行动点','奥运','联合政府'].map(x=>`<button onclick="$('guide-query').value='${x}';searchGuide104('${x}')">${x}</button>`).join('')}</div><div id="guide-results" aria-live="polite"></div>`);searchGuide104('');setTimeout(()=>$('guide-query')?.focus?.(),0)};
function searchGuide104(query){let matches=guideMatches104(query,guideEntries104.length?guideEntries104:guideCatalog104());$('guide-results').innerHTML=matches.length?`<p class="guide-result-count">${query?'找到 '+matches.length+' 个条目':'常用概念'}</p>`+matches.map(guideArticle104).join(''):'<p class="guide-empty">该概念不存在于此游戏，请检查输入是否正确</p>'}

const TUTORIAL_HOST105={
 constitutional:['总理大人','枢密院'],presidential:['总统大人','总统行政办公室'],semi:['总统大人','总统府秘书处'],westminster:['首相大人','枢密院'],federal:['总理大人','联邦委员会秘书处'],theorepublic:['最高领袖','最高领袖办公室'],symbolic:['总统大人','总统行政办公室'],party:['主席同志','中央办公厅'],absolute:['陛下','枢密院'],aristocratic:['公爵阁下','枢密院'],tyranny:['最高执政官阁下','执政官办公厅'],theoabsolute:['最高教长','教廷国务秘书处']
};
function tutorialWelcome105(){let [address,host]=TUTORIAL_HOST105[regime().id];return `欢迎您，${address}。受${host}委托，我将为您介绍本游戏的基本游玩方式。`}
// Every tour target is an existing UI element. Missing optional controls are skipped.
let tutorial104=null;
function tutorialSteps104(scope='intro',page=tab){let steps=[],add=(page,id,selector,text,title)=>steps.push({page,id,selector,text,title});
 const nav=(page,id,text)=>add(page,id,`#nav button[onclick="changeTab('${page}')"]`,text);
 const target=(page,id,selector,text,title)=>add(page,id,selector,text,title);
 add('overview','welcome','[data-guide="country"]',tutorialWelcome105,'欢迎执政');
 add('overview','tour-roadmap','#tutorial-start','这段入门介绍只说明执政目标与教程的使用方法。各板块的具体规则可随时通过“本页教程”查看；按空格进入下一步，右下角可跳过。','开始之前');
 add('overview','tour-duration','#date',()=>s.adminMode?'本存档已启用管理员模式，季度没有上限，所有失败与结算均不会终止本局；开启新历史才会替换此存档。':regime().democratic?`本游戏的标准总回合数为48个季度（回合），即两届任期，共8年；当前宪法规定：${typeof constitutionalTermText==='function'?constitutionalTermText():'两届，共48季度'}。`:'本游戏的标准总回合数为48个季度（回合）。由于政体特殊，您可以在之后的事件中手动延长总回合数。','任期与回合');
 add('overview','tour-mission','[data-guide="country"]','在此期间，您需要在维持统治的前提下，推进自己的理想议程。支持、稳定、财政与制度选择都会影响您的执政道路。','您的目标');
 add('overview','tour-assessment',`#nav button[onclick="changeTab('archive')"]`,'您的议程与治理结果将在游戏结束后汇成一份9维任期评估报告，分析统治倾向。任期进行中可在国家档案查看指标走势。','留下怎样的任期');
 nav('overview','overview','这里是执政总览，先从国家身份与核心指标开始。');
 target('overview','country','[data-guide="country"]','这是你所扮演的国家。随机国名用于区分世界，玩法由政体和国家状况决定。');
 target('overview','regime','[data-guide="regime"]',()=>REGIME_GUIDE104[regime().id]);target('overview','player','[data-guide="player"]',playerGuide104);
 target('overview','calendar','#date','本游戏每年6季度，每届24季度。这里显示当前日期。');
 target('overview','alerts','#advance','页面中的红点表示仍需处理的问题。首次出现会显示提醒，点击“知道了”会收起至侧边，点击侧边按钮可重新展开，并可上下拖动按钮。提醒本身不会阻止推进季度；问题解除后红点消失。');
 target('overview','advance','#advance','推进季度会结算经济与施政，并恢复行动点。出现待决事件时，按钮会先带你回复事件。');
 target('overview','ap','.political-banner .action-count',actionTutorialText);
 for(let id of ['approval','stability','judicial','growth','unemployment','inflation','debt','rating','gdp','population','balance'])target('overview',id,`[data-guide="${id}"]`);
 nav('assembly','assembly',()=>`这是${regime().body}，用于争取支持并通过预算和改革。`);
 target('assembly','ap','.political-banner .action-count',actionTutorialText);
 target('assembly','groups','.seat-strip',legislativeGroups104);
 for(let id of ['seats','faction-relation','agenda','faction-profile','faction-support','negotiate','faction-details','full-support','effective-agenda'])target('assembly',id,`[data-guide="${id}"]`);
 target('assembly','pass-rate','[data-guide="pass-rate"]',()=>`这是院内支持率，按席位加权。${pstate().bill?.mode==='amend'?'修宪案必须达到三分之二院内支持':pstate().bill?.kind==='constitution'?'释宪案必须严格超过50%':'普通议案达到'+threshold()+'%即可通过'}；先提出预算、改革或宪制议案。`);
 target('assembly','vote','button[onclick="voteBill()"]');target('assembly','withdraw','button[onclick="withdrawBill()"]');
 target('assembly','meet','button[onclick^="meetMember("]','点击这里会见主要成员并回应诉求，每人每季一次。党团总召也负责符合条件时的联合政府邀请。');
 target('assembly','promise','[data-guide="promise"]');
 nav('cabinet','cabinet','这里安排内阁人选、任务方向和持续提案，财政由你本人兼管。');
 target('cabinet','coalition','[data-guide="coalition"]',()=>coalitionRegime()?'目前仅执政党和已加入联合政府的党派可以入阁。其他党团关系达到70后，可邀请其总召组建联合政府。':'本政体允许所有派系的人物进入内阁，不设联合政府邀请。');
 if(regime().head)target('cabinet',regime().head==='宰相'?'chancellor':'premier','.office[onclick*="head"]');
 for(let [key]of PORTFOLIOS)target('cabinet','office-'+key,`.office[onclick*="${key}"]`);
 for(let id of ['skill','loyalty','achievements','tenure','traits'])target('cabinet',id,`[data-guide="${id}"]`);
 target('cabinet','task','#task','此处安排本季任务方向，不耗行动点；官员会结合自身倾向决定执行方法，并提交季度报告。');
 target('cabinet','dismiss','button[onclick^="dismissPreview("]');target('cabinet','replace','button[onclick^="replacementDialog("]');
 target('cabinet','programme','.minister-programme h3','这是主管官员的持续提案。通过下方措施推进进度；未完成每季忠诚−0.5，完成后停止。');
 target('cabinet','programme-cost','.minister-programme summary','展开后可查看投资如何降低各项措施的费用；进度还会受到能力和倾向契合度加权。');
 target('cabinet','appoint','button[onclick^="appointPreview("]');target('cabinet','reports','[data-guide="reports"]');
 nav('judiciary','judiciary','这里与最高司法机关互动，观察司法独立和行政干预的影响。');
 target('judiciary','judicial','.political-banner .action-count');target('judiciary','judicial-pressure','[data-guide="judicial-pressure"]');target('judiciary','court-actions','.choices','此区域提供司法互动。具体代价和收益会写在各按钮里，可按国家状况选择。');
 target('judiciary','judges','#constitutional-court');target('judiciary','constitutional-docket','#constitutional-docket');target('judiciary','judge-interaction','button[onclick^="meetJudge("]');
 nav('politics','elections','这里查看全国民意、地方诉求、选举预测与历次结果。');
 target('politics','approval','[data-guide="approval"]');
 target('politics','forecast','[data-guide="forecast"]');target('politics','capital-region','.region-grid article:last-child .tag');target('politics','regions','.region-grid article .tag','各地区有不同产业和社会基础，名称中的省、州、领等称谓随政体变化。');
 for(let id of ['population','base','development','local-demands'])target('politics',id,`[data-guide="${id}"]`);
 nav('budget','budget','这里拟定税收与公共预算。调整滑块只是草案，表决通过后才实施。');
 for(let key of Object.keys(policyMeta))target('budget','policy-'+key,`label[for="p-${key}"]`);
 for(let id of ['revenue','spending','interest','balance'])target('budget',id,`[data-guide="${id}"]`);
 target('budget','budget-submit','button[onclick="proposeBudget()"],button[onclick="applyPolicy()"]');target('budget','budget-reset','button[onclick*="draft={"]');target('budget','brake','button[onclick*="s.brake="]');
 nav('reforms','reforms','这里选择长期改革。每六季度换一批未查看草案；已查看和执行中的项目保留。');
 target('reforms','reform-window','button[onclick^="reformDetail("]','点击可以查看并保留草案，再决定是否提交。启动后要等待执行期，完成才兑现效果。');
 nav('situations','situations','局势会跨季度持续。先看结束条件与每季损耗，再决定如何分配行动点和资金。');
 for(let kind of sits().active.map(x=>x.kind)){let id=({justice:'justice-situation',economy:'economy-situation'})[kind]||kind;target('situations',id,`[data-situation-kind="${kind}"] h2`)}
 target('situations','cooldown','.situation-grid .choices','这里的处置会消耗行动点，部分有冷却或限次要求。按钮会直接列出费用、效果和限制。');
 target('archive','constitution','#constitution-articles');
 nav('archive','archive','国家档案保存科研、国家结构与执政记录，也提供存档备份。');
 target('archive','research','.research-card h2',()=>`教育投入每季推进科研，每100%升一级。本局采用${ACTION_POINT_MODES[actionMode()]}，${actionResearchDescription()}教育现代化会加快积累。`);
 for(let id of ['gdp','per-capita','capital','human','seed','economic-model'])target('archive',id,`[data-guide="${id}"]`);
 target('archive','export','button[onclick="exportSave()"]');target('archive','import','button[onclick*="import\').click"]');
 if(s.ended){nav('settlement','settlement','游戏结束后，这里显示最终执政评估。');
 target('settlement','ideology','.ideology-cards .card','三张卡片展示最接近的统治倾向和契合度，依据实际决策与最终政策，不是随机抽取。');target('settlement','charts','.charts-grid article h3','这些图表记录整个任期的变化，点击可查看大图。');}target('archive','charts','.charts-grid article h3','这些图表与季度记录同步更新。点击图表标题或指标卡片，可以打开居中的大图。');
 if(s.adminMode){nav('console','console','控制台允许直接编辑存档数据和触发局势，用于测试；本存档不会因失败条件或回合数而结束。');target('console','console-field','#console-field','选择要调整的国家、预算、人物、派系、地区、科研或局势参数。','选择参数');target('console','console-value','#console-value','输入目标值或增减幅度，再用下方按钮应用。修改立即保存；已有行动点投骰结果不会因修改科研而重投，新科研等级从下次发放起生效。','输入数值');target('console','console-actions','.console-buttons','设为此值会替换当前数值；增加或减少以当前数值为起点。','应用调整');target('console','console-situation','#console-situation','选择要测试的局势，再使用触发或结束按钮。','局势测试')}
 target('overview','new-world','button[onclick="newDialog()"]','这会重新生成世界并替换当前进度。希望保留这一局时，请先导出存档。');
 target('overview','guide','#guide-open','若对游戏概念不清楚，可查看“治国指南”的详细介绍。输入“稳定”“稳定度”或“政治稳定”，都会找到同一条目；也可搜索改革、职务和局势。','教程完成');
 const introIds=['welcome','tour-roadmap','tour-duration','tour-mission','tour-assessment'];
 if(scope==='intro')return [...steps.filter(step=>introIds.includes(step.id)),{page:'overview',id:'guide',selector:'#guide-open',text:'治国指南是概念搜索器。输入“稳定”“稳定度”或“政治稳定”可找到同一条解释；不清楚游戏概念时，可在这里查看详细介绍。',title:'随时查阅规则'},{page:'overview',id:'page-tutorial',selector:'#page-tutorial',text:'先点击左栏需要了解的板块，再点击右上方“本页教程”，只学习该页的概念和功能。例如进入“民意与选举”后开启，就不会讲解议会。本段介绍结束后会返回您原来的页面。',title:'按需学习各板块'}];
 return [...steps.filter(step=>step.page===page&&!introIds.includes(step.id)&&step.id!=='guide'),{page,id:'guide',selector:'#guide-open',text:'本页教程到此结束。若仍有不清楚的概念，可在“治国指南”中搜索详细解释。',title:'本页教程完成'}];
}
function decorateGuide104(){if(!document.querySelectorAll)return;
 let concepts=[['approval',/^(公众支持|全国支持率)$/],['stability',/^(政治稳定|国家稳定)$/],['judicial',/^司法独立$/],['growth',/^(实际年化增长|GDP 增长)$/],['unemployment',/^失业率$/],['inflation',/^(通胀|通货膨胀)$/],['debt',/^债务\s*\/\s*GDP$/],['faction-relation',/^团体关系/],['skill',/^能力\s*\d/],['loyalty',/^忠诚\s*\d/],['achievements',/^累计政绩/],['tenure',/^任职\s*\d/],['reports',/^季度施政报告$/],['promise',/^协商承诺追踪$/],['coalition',/^组阁资格$/],['judicial-pressure',/^司法干预历史$/],['forecast',/^(当前加权选票预测|预测票率)$/],['population',/^(人口|人口权重|地区人口)/],['base',/^(地理|主要产业|产业|宗教|社会基本盘|基本盘)/],['development',/^(发展|当前发展)/],['local-demands',/^(本轮诉求|地方诉求|地区诉求|诉求|本轮地方诉求|本届诉求)/],['revenue',/^预计财政收入$/],['spending',/^公共支出/],['interest',/^利息支出/],['balance',/^预计(盈余|赤字)$/],['per-capita',/^当前人均名义 GDP$/],['seed',/^世界种子$/],['economic-model',/^经济类型$/]];
 for(let el of document.querySelectorAll('#content .metric-label,#content .row>span,#content .mini-stats span,#content h3,#content b')){let text=el.textContent.trim();let match=concepts.find(([id,re])=>re.test(text));if(match&&!el.dataset.guide)el.dataset.guide=match[0]}
 let debtLabel=document.querySelector('[data-guide="debt"]');if(debtLabel){let sub=debtLabel.closest('.card')?.querySelector('.sub');if(sub)sub.dataset.guide='rating'}
 let stats=document.querySelector('#content .mini-stats');if(stats){let desc=stats.previousElementSibling;if(desc)desc.dataset.guide='traits'}
 if(tab==='situations')document.querySelectorAll('.situation-grid>article').forEach((el,i)=>{if(sits().active[i])el.dataset.situationKind=sits().active[i].kind});
}
const renderBeforeGuide104=render;render=function(){renderBeforeGuide104();decorateGuide104()};
function tourFind104(selector){try{return document.querySelector(selector)}catch{return null}}
function tourBlock104(event){if(!tutorial104)return;if(event.target.closest?.('#tutorial-controls,#tutorial-skip'))return;event.preventDefault();event.stopImmediatePropagation()}
function tourKey104(event){if(!tutorial104)return;if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();stopTutorial()}else if(event.code==='Space'||event.key===' '||event.key==='Spacebar'){event.preventDefault();event.stopImmediatePropagation();if(!event.repeat)tutorialMove(1)}else if(event.key==='ArrowRight'){event.preventDefault();event.stopImmediatePropagation();tutorialMove(1)}else if(event.key==='ArrowLeft'){event.preventDefault();tutorialMove(-1)}else if(event.key==='Tab'){let nodes=[...document.querySelectorAll('#tutorial-controls button:not(:disabled),#tutorial-skip')],i=nodes.indexOf(document.activeElement);event.preventDefault();nodes[(i+(event.shiftKey?-1:1)+nodes.length)%nodes.length]?.focus()}}
function startPageTutorial(){startTutorial('page')}
function startTutorial(scope='intro'){
 if(tutorial104)return;
 let dialog=$('modal');tutorial104={index:0,scope,steps:tutorialSteps104(scope,tab),initialTab:tab,initialSlot:cabinetSlot,scrollX:window.scrollX,scrollY:window.scrollY,asideScroll:document.querySelector('aside')?.scrollTop||0,dialogOpen:dialog.open,dialogHTML:dialog.innerHTML,focus:document.activeElement,opened:[]};if(dialog.open)dialog.close();
 let layer=document.createElement('div');layer.id='tutorial-layer';layer.innerHTML='<div class="tutorial-shade" id="tour-top"></div><div class="tutorial-shade" id="tour-left"></div><div class="tutorial-shade" id="tour-right"></div><div class="tutorial-shade" id="tour-bottom"></div><div id="tutorial-focus" aria-hidden="true"></div><section id="tutorial-controls" role="dialog" aria-modal="true" aria-label="新手教程"></section><button id="tutorial-skip" onclick="stopTutorial()">跳过教程</button>';document.body.appendChild(layer);document.body.classList.add('tutorial-active');
 document.addEventListener('click',tourBlock104,true);document.addEventListener('change',tourBlock104,true);document.addEventListener('keydown',tourKey104,true);window.addEventListener('resize',positionTutorial104);window.addEventListener('scroll',positionTutorial104,true);showTutorialStep104(1);
}
function tutorialMove(direction){if(!tutorial104)return;if(tutorial104.index+direction>=tutorial104.steps.length){stopTutorial();return}if(tutorial104.index+direction<0)return;tutorial104.index+=direction;showTutorialStep104(direction)}
function showTutorialStep104(direction=1){
 let t=tutorial104;if(!t)return;t.opened.forEach(el=>el.open=false);t.opened=[];
 for(let tries=0;tries<t.steps.length;tries++){
  let step=t.steps[t.index];if(!step){stopTutorial();return}if(tab!==step.page){tab=step.page;render()}
  let el=tourFind104(step.selector);if(el){let details=el.closest('details');if(details&&!details.open&&el.tagName!=='SUMMARY'){details.open=true;t.opened.push(details)}
   if(el.getClientRects().length){t.target=el;let entry=guideCatalog104().find(e=>e.id===step.id),brief=entry?.text.match(/[^。！？]+[。！？]?/g)?.slice(0,2).join(''),body=typeof step.text==='function'?step.text():step.text||brief||'查看此处的信息，了解国家当前状态。';
    $('tutorial-controls').innerHTML=`<span class="tour-count">${t.scope==='page'?'本页教程':'入门教程'} · ${t.index+1} / ${t.steps.length} · 可随时跳过</span><h2 id="tour-title">${esc(step.title||entry?.title||(step.id==='regime'?'国家政体':'玩家职务'))}</h2><p>${esc(body)}</p><div class="tour-buttons"><button onclick="tutorialMove(-1)" ${t.index===0?'disabled':''}>上一步</button><button class="primary" onclick="tutorialMove(1)">${t.index===t.steps.length-1?'空格完成教程':'空格进入下一步'}</button></div>`;
    el.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});positionTutorial104();$('tutorial-controls').querySelector('.primary').focus({preventScroll:true});return;
   }
  }
  t.index+=direction;
 }
 stopTutorial();
}
function positionTutorial104(){let t=tutorial104;if(!t?.target)return;let r=t.target.getBoundingClientRect(),w=window.innerWidth,h=window.innerHeight,pad=6,x=Math.max(0,r.left-pad),y=Math.max(0,r.top-pad),right=Math.min(w,r.right+pad),bottom=Math.min(h,r.bottom+pad);
 function box(id,left,top,width,height){Object.assign($(id).style,{left:left+'px',top:top+'px',width:Math.max(0,width)+'px',height:Math.max(0,height)+'px'})}
 box('tour-top',0,0,w,y);box('tour-left',0,y,x,bottom-y);box('tour-right',right,y,w-right,bottom-y);box('tour-bottom',0,bottom,w,h-bottom);box('tutorial-focus',x,y,right-x,bottom-y);
 let panel=$('tutorial-controls'),pw=Math.min(360,w-24);panel.style.width=pw+'px';let ph=panel.offsetHeight;let left=right+16,top=Math.max(12,Math.min(y,h-ph-70));if(left+pw>w-12){left=Math.max(12,Math.min(x,w-pw-12));top=bottom+16;if(top+ph>h-70)top=Math.max(12,y-ph-16)}
 Object.assign(panel.style,{left:left+'px',top:top+'px'});
}
function stopTutorial(){let t=tutorial104;if(!t)return;tutorial104=null;t.opened.forEach(el=>el.open=false);$('tutorial-layer')?.remove();document.body.classList.remove('tutorial-active');document.removeEventListener('click',tourBlock104,true);document.removeEventListener('change',tourBlock104,true);document.removeEventListener('keydown',tourKey104,true);window.removeEventListener('resize',positionTutorial104);window.removeEventListener('scroll',positionTutorial104,true);tab=t.initialTab;cabinetSlot=t.initialSlot;render();window.scrollTo(t.scrollX,t.scrollY);let aside=document.querySelector('aside');if(aside)aside.scrollTop=t.asideScroll;if(t.dialogOpen)modal(t.dialogHTML);t.focus?.focus?.({preventScroll:true})}

bootGame();
