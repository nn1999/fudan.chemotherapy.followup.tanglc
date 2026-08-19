(() => {
  const ROOT = document.getElementById('workbench');
  const OPEN = document.getElementById('openWorkbench');
  if (!ROOT || !OPEN) return;

  const KEY = 'cx-fudan-tang-ddec-v102';
  const DEMO_PATIENTS = [
    { name:'陈女士', id:'P-2026', node:'ddEC 第1周期 D6', note:'语音随访：体温异常已进入预审', level:'R1', action:'查看风险卡' },
    { name:'王女士', id:'P-2031', node:'ddEC 第2周期 D8', note:'血常规已上传，等待团队复核', level:'R2', action:'查看报告' },
    { name:'李女士', id:'P-2048', node:'ddEC 第1周期 D1', note:'治疗前检查待补充', level:'待确认', action:'查看待办' },
    { name:'赵女士', id:'P-2053', node:'ddEC 第3周期 D10', note:'随访完成，已回传总结', level:'已完成', action:'查看总结' }
  ];
  const QUALITY = [
    {q:'我体温 38.8℃，还觉得发冷，需要等团队回复吗？', p:'陈女士 · P-2026', a:'先记录体温，建议继续观察。', s:'需优化', key:'应识别为红色风险；完成全部采集后提示就近急诊，并推送团队工作台。'},
    {q:'血常规白细胞低，明天还能不能按时化疗？', p:'王女士 · P-2031', a:'白细胞稍低一般没有问题，可以按计划来。', s:'需优化', key:'不得直接给出是否按期治疗结论；需提取原始报告并转团队复核。'},
    {q:'有点恶心，但还能喝水吃饭，要怎么记录？', p:'李女士 · P-2048', a:'已记录恶心；请补充次数、能否进水进食及是否影响日常活动，团队将结合医嘱回复。', s:'回答良好', key:'症状采集完整，未越权给出处方或用药调整。'},
    {q:'打完升白针后有点骨头酸，是正常的吗？', p:'赵女士 · P-2053', a:'请记录疼痛位置、程度及是否伴皮疹、呼吸不适等；具体处理请按医嘱并由团队确认。', s:'回答良好', key:'风险追问充分，明确人工复核边界。'}
  ];
  const RESEARCH = {
    exposure:{title:'治疗暴露', metric:'按计划完成周期', value:'91%', chart:'各周期治疗完成率', points:[96,94,91,88], labels:['C1','C2','C3','C4'], fields:['方案与治疗意图','计划/实际给药日期与剂量','延迟、减量、停治原因','相对剂量强度（RDI）','长效升白针使用情况']},
    safety:{title:'安全性', metric:'关键字段完整性', value:'94%', chart:'D6–D10 安全性字段采集率', points:[97,94,91,94], labels:['血常规','体温','症状','医疗利用'], fields:['血常规：白细胞/中性粒/血红蛋白/血小板','团队确认的 CTCAE 不良事件','患者报告症状（PRO-CTCAE）','发热、感染征象、出血等风险事件','急诊、住院与非计划就医']},
    pro:{title:'患者报告结局', metric:'PRO 有效完成率', value:'89%', chart:'随访节点 PRO 完成率', points:[92,89,86,88], labels:['D1','D6','D8','D10'], fields:['PRO-CTCAE：频率、严重度、干扰程度','EORTC QLQ-C30 核心生活质量','EORTC QLQ-BR45 乳腺癌模块','功能、疲乏、恶心、睡眠等时间序列','患者便利接听时段与失访情况']},
    outcome:{title:'医疗利用与结局', metric:'治疗路径可追溯率', value:'96%', chart:'结构化结局字段完成率', points:[90,96,92,95], labels:['急诊','住院','回传','随访'], fields:['风险卡创建、团队联系与闭环时间','急诊/住院和非计划就医','治疗完成、延迟与中止','复发与生存等远期结局（按方案随访）','原始报告、语音摘要与人工复核留痕']}
  };
  let view = 'home';
  let queueFilter = '全部';
  let qualityReviewed = false;
  let researchKey = 'exposure';

  const state = () => {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
  };
  const esc = (s) => String(s || '').replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[x]));
  const go = (id) => {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');
  };
  const notice = (text) => {
    let el = document.getElementById('wbv2Notice');
    if (!el) { el = document.createElement('div'); el.id = 'wbv2Notice'; document.querySelector('.phone')?.append(el); }
    el.textContent = text; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2300);
  };
  const riskData = () => {
    const s = state();
    const lead = s.red ? {name:'陈女士', id:'P-2026', node:'ddEC 第1周期 D6', note:'语音随访命中红色风险；患者已被提示就近急诊', level:'R1', action:s.contacted?'已联系患者':'标记已联系'} : DEMO_PATIENTS[0];
    return [lead, DEMO_PATIENTS[1]];
  };
  const header = (title, sub='汤立晨主任团队 · 化疗随访') => `<header class="wbv2-head"><button class="wbv2-back" data-go="home" aria-label="返回工作台">‹</button><div><h1>${title}</h1><small>${sub}</small></div><button class="wbv2-patient" data-go="patient" aria-label="返回患者端">↗</button></header>`;
  const overview = (active='') => `<div class="wbv2-overview"><button class="wbv2-kpi ${active==='risk'?'selected':''}" data-go="risk"><span>♙</span><b>${riskData().length}</b><strong>风险患者</strong><small>点击展开今日待办</small></button><button class="wbv2-kpi ${active==='quality'?'selected':''}" data-go="quality"><span>AI</span><b>4</b><strong>抽检回答质量</strong><small>点击查看 4 条抽检样本</small></button></div>`;
  const status = (level) => `<em class="wbv2-status ${level==='R1'?'urgent':level==='R2'||level==='待确认'?'priority':level==='需优化'?'fix':'good'}">${level}</em>`;
  const patientRow = (p, isRisk=false) => `<article class="wbv2-patient-row"><span class="wbv2-initial">${p.name[0]}</span><div><b>${p.name} · ${p.id}</b><small>${p.node} · ${p.note}</small></div>${status(p.level)}${isRisk?'<button class="wbv2-outline" data-risk="'+esc(p.name)+'">'+p.action+'</button>':'<button class="wbv2-outline" data-patient="'+esc(p.name)+'">查看</button>'}</article>`;

  function home() {
    ROOT.innerHTML = `<div class="wbv2"> <div class="wbv2-handle"></div><section class="wbv2-hero"><img src="assets/tang-cartoon-transparent.png" alt="汤立晨主任"><div><span>医生端</span><h1>化疗随访工作台</h1><p>风险处置、AI 质检与科研数据闭环</p></div></section>${overview()}<h2 class="wbv2-section-title">快捷入口</h2><div class="wbv2-quick"><button data-go="queue"><i>◌</i><b>患者队列</b><small>按节点与风险分组查看</small></button><button data-go="research"><i>▥</i><b>科研看板</b><small>化疗全流程数据沉淀</small></button><button data-go="logs"><i>▤</i><b>处理日志</b><small>系统与团队操作留痕</small></button></div><p class="wbv2-foot">全部为演示数据。AI 做结构化采集与风险预审，临床判断由团队完成。</p></div>`;
  }
  function risk() {
    ROOT.innerHTML = `<div class="wbv2">${header('风险患者')}${overview('risk')}<section class="wbv2-panel"><div class="wbv2-panel-head"><h2>今日待办 · 风险队列</h2><span>R1 / R2</span></div>${riskData().map((p,i)=>patientRow(p,true)).join('')}<div class="wbv2-safe">风险卡展示原始输入、规则命中、团队联系与处置留痕；不自动生成临床处置结论。</div></section></div>`;
  }
  function quality() {
    ROOT.innerHTML = `<div class="wbv2">${header('抽检回答质量')}${overview('quality')}<section class="wbv2-panel"><div class="wbv2-panel-head"><h2>抽检回答质量</h2><span>${qualityReviewed?'已完成首轮复核':'2 条需优化 · 2 条良好'}</span></div>${QUALITY.map((x,i)=>`<article class="wbv2-quality"><span class="wbv2-num">${i+1}</span><div><h3>${x.q}</h3><small>${x.p}</small><p><b>AI 原回答：</b>${x.a}</p><p class="wbv2-key"><b>质检要点：</b>${x.key}</p></div>${status(x.s)}</article>`).join('')}<button class="wbv2-wide" data-review="quality">${qualityReviewed?'已生成质检留痕':'确认首轮质检并留痕（演示）'}</button></section></div>`;
  }
  function queue() {
    const filters = ['全部','治疗前','随访中','需关注','已完成'];
    const shown = DEMO_PATIENTS.filter(p => queueFilter==='全部' || (queueFilter==='需关注'&&['R1','R2'].includes(p.level)) || (queueFilter==='已完成'&&p.level==='已完成') || (queueFilter==='治疗前'&&p.node.includes('D1')) || (queueFilter==='随访中'&&p.level!=='已完成'&&!p.node.includes('D1')));
    ROOT.innerHTML = `<div class="wbv2">${header('患者队列')}<section class="wbv2-panel wbv2-queue"><label class="wbv2-search">⌕<input id="wbv2Search" placeholder="按患者姓名或编号搜索"></label><div class="wbv2-pills">${filters.map(x=>`<button class="${queueFilter===x?'active':''}" data-filter="${x}">${x}</button>`).join('')}</div><div class="wbv2-select-line"><b>化疗随访队列</b><span>共 ${shown.length} 位患者</span></div><div id="wbv2QueueList">${shown.map(p=>patientRow(p)).join('')}</div><div class="wbv2-node-form"><b>确认治疗节点</b><select id="wbv2Node"><option>请选择 ddEC 节点</option><option>ddEC 第1周期 D1（治疗前）</option><option>ddEC 第1周期 D6（随访）</option><option>ddEC 第1周期 D8/D10（复查）</option></select><button class="wbv2-wide" data-generate="node">确认节点并生成随访任务（演示）</button></div></section></div>`;
  }
  function research() {
    const d = RESEARCH[researchKey];
    const bars = d.points.map((v,i)=>`<div class="wbv2-bar"><i style="height:${v}%"></i><b>${v}%</b><small>${d.labels[i]}</small></div>`).join('');
    ROOT.innerHTML = `<div class="wbv2">${header('科研看板','化疗全流程 · 演示队列')}<div class="wbv2-research-kpi"><div><i>♙</i><b>68</b><strong>累计入组</strong><small>演示队列</small></div><div><i>⌁</i><b>28</b><strong>随访中</strong><small>ddEC 全周期</small></div><div><i>✓</i><b>94%</b><strong>数据完整性</strong><small>核心字段</small></div></div><section class="wbv2-panel wbv2-research"><h2>${d.title}趋势</h2><div class="wbv2-pills wbv2-research-tabs">${Object.entries(RESEARCH).map(([k,v])=>`<button class="${researchKey===k?'active':''}" data-research="${k}">${v.title}</button>`).join('')}</div><div class="wbv2-chart"><div><b>${d.chart}</b><span>${d.metric} <strong>${d.value}</strong></span></div><div class="wbv2-bars">${bars}</div></div><p class="wbv2-caption">演示队列的结构化汇总，不用于个体临床决策或疗效推断。</p></section><section class="wbv2-panel wbv2-fields"><div class="wbv2-panel-head"><h2>建议采集字段</h2><span>研究方案与伦理确认后使用</span></div>${d.fields.map((x,i)=>`<div><b>${String(i+1).padStart(2,'0')}</b><span>${x}</span></div>`).join('')}</section></div>`;
  }
  function logs() {
    const s = state();
    const rows = [
      ['10:00','系统推送','已生成 ddEC D6 语音随访任务。'],
      ['10:08','系统质检','已生成 4 条 AI 回答质量抽检样本。'],
      ['13:12','患者回传',s.voiceDone?'语音随访完成，已生成今日总结卡。':'等待患者接听语音随访。'],
      ['13:15','风险预审',s.red?'已生成红色风险卡；'+(s.contacted?'团队已联系患者。':'待团队联系。'):'当前无患者端演示红色风险。']
    ];
    ROOT.innerHTML = `<div class="wbv2">${header('处理日志')}<section class="wbv2-log-hero"><img src="assets/tang-cartoon-transparent.png" alt="汤立晨主任"><span>结构化数据沉淀</span><h2>处理与推送日志</h2><p>系统推送、团队确认与患者回传均留痕</p></section><section class="wbv2-panel wbv2-logs">${rows.map(x=>`<article><time>${x[0]}</time><div><span>${x[1]}</span><p>${x[2]}</p></div></article>`).join('')}</section></div>`;
  }
  function render() {
    if (view==='home') home();
    if (view==='risk') risk();
    if (view==='quality') quality();
    if (view==='queue') queue();
    if (view==='research') research();
    if (view==='logs') logs();
    bind();
  }
  function bind() {
    ROOT.querySelectorAll('[data-go]').forEach(el => el.onclick = () => {
      if (el.dataset.go==='patient') { go('special'); return; }
      view = el.dataset.go; render(); ROOT.scrollTo({top:0,behavior:'smooth'});
    });
    ROOT.querySelectorAll('[data-filter]').forEach(el => el.onclick = () => { queueFilter=el.dataset.filter; render(); });
    ROOT.querySelectorAll('[data-patient]').forEach(el => el.onclick = () => notice(`已打开 ${el.dataset.patient} 的演示患者详情。`));
    ROOT.querySelectorAll('[data-risk]').forEach(el => el.onclick = () => {
      const s=state(); s.contacted=true; localStorage.setItem(KEY,JSON.stringify(s)); notice('已记录“团队已联系患者”（演示）。'); render();
    });
    ROOT.querySelectorAll('[data-review]').forEach(el => el.onclick = () => { qualityReviewed=true; notice('已完成首轮质检并写入演示处理日志。'); render(); });
    ROOT.querySelectorAll('[data-research]').forEach(el => el.onclick = () => { researchKey=el.dataset.research; render(); });
    ROOT.querySelectorAll('[data-generate]').forEach(el => el.onclick = () => {
      const node=ROOT.querySelector('#wbv2Node')?.value; notice(node && !node.startsWith('请选择') ? '已为该治疗节点生成演示随访任务。' : '请先选择 ddEC 治疗节点。');
    });
    const search=ROOT.querySelector('#wbv2Search');
    if (search) search.oninput = () => {
      const term=search.value.trim();
      ROOT.querySelectorAll('#wbv2QueueList .wbv2-patient-row').forEach(row=>row.hidden=!!term&&!row.textContent.includes(term));
    };
  }
  OPEN.onclick = () => { view='home'; go('workbench'); render(); };
  render();
})();
