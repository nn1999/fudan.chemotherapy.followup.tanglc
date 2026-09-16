/* Local, conservative demo extraction. Only explicit current statements become answers. */
(() => {
  const OPTIONS = {
    oralGI: ['没有明显不适，能正常进食饮水','有恶心、口腔疼或腹泻，但还能进食饮水','频繁呕吐或几乎不能进食饮水'],
    safety: ['没有尿频尿急尿痛、憋气或异常出血','有一项轻微不适','有憋气、喘不上气、黑便或明显出血'],
    daily: ['和平时差不多','比平时乏力，但能照顾自己','明显乏力或头晕，日常活动受影响']
  };
  function extract(text) {
    const result = {}, evidence = {};
    // Historical, hypothetical and uncertain clauses are intentionally left for the patient.
    const clauses = String(text).replace(/\s+/g,'').split(/[，,。；;！!？?\n]/).filter(s => s && !/(昨天|前天|上周|以前|之前|如果|假如|万一|会不会|是否|不知道|不确定|可能|好像)/.test(s));
    const t = clauses.join('，');
    const put = (key,value) => { result[key] = value; evidence[key] = t; };
    const cn = s => {const digits='零一二三四五六七八九';return s.replace(/[零一二三四五六七八九两十]+/g,n=>{if(n.includes('十')){const [a,b]=n.split('十');return String((a?digits.indexOf(a):1)*10+(b?digits.indexOf(b):0))}return [...n].map(c=>c==='两'?2:digits.indexOf(c)).join('')}).replace(/点/g,'.')};
    const temps = [...cn(t).replace(/([34]\d)度([0-9])(?=$|，)/g,'$1.$2度').matchAll(/(?:最高(?:体温)?|体温|量到|量了|测到|测了)(?:是|为|有|到)?(3\d(?:\.\d)?|4[0-2](?:\.\d)?)(?:℃|度|摄氏度)?/g)].map(m=>m[1]);
    if (new Set(temps).size === 1) put('temperature',temps[0]);
    // Negation scope covers enumerations, but ends at a contrast or a new assertion.
    const symptom='(?:恶心|频繁呕吐|呕吐|腹泻|口腔疼|嘴疼|口腔溃疡|尿频|尿急|尿痛|异常出血|明显出血|出血|黑便|大便发黑|打寒战|寒战|明显发冷|发冷|意识不清|意识异常|意识模糊|憋气|喘不上气|明显乏力|乏力|头晕)';
    const negativePattern=new RegExp('(?:并没有|没有|并无|没|无|不再|不)(?:明显|出现|感觉)?'+symptom+'(?:(?:和|或|及|、|也)?'+symptom+')*','g');
    const negativeSpans=clauses.flatMap(c=>c.match(negativePattern)||[]);
    const positive = clauses.map(c=>c.replace(negativePattern,'')).join('，');
    const has = re => re.test(positive);
    const neg = re => negativeSpans.some(c=>re.test(c));
    if(has(/寒战|明显发冷|意识不清|意识模糊|憋气|喘不上气/)) put('redflag','有');
    else if(neg(/寒战|发冷/)&&neg(/意识不清|意识异常|意识模糊/)&&neg(/憋气|喘不上气/)) put('redflag','没有');
    const canEat=/(能正常|正常|还能|可以|能够)(?:进食饮水|吃饭喝水|吃喝|进食|吃饭|喝水)|吃喝(?:都)?正常/.test(t);
    const mild=has(/恶心|想吐|口腔疼|嘴疼|口腔溃疡|腹泻|拉肚子|呕吐/);
    if(has(/频繁呕吐|一直吐|吐个不停|喝不进水|喝不下水|喝水也吐|不能进食|无法进食|吃不下也喝不下|几乎不能(?:吃喝|进食饮水)/)) put('oralGI',OPTIONS.oralGI[2]);
    else if(mild&&canEat) put('oralGI',OPTIONS.oralGI[1]);
    else if(!mild&&canEat&&(/没有(?:明显)?不适/.test(t)||(neg(/恶心/)&&neg(/口腔疼|嘴疼|口腔溃疡/)&&neg(/腹泻|拉肚子/)))) put('oralGI',OPTIONS.oralGI[0]);
    if(has(/憋气|喘不上气|黑便|大便发黑|明显出血|大量出血/)) put('safety',OPTIONS.safety[2]);
    else if(has(/轻微(?:尿频|尿急|尿痛|出血)|有点(?:尿频|尿急|尿痛)/)) put('safety',OPTIONS.safety[1]);
    else if(neg(/尿频/)&&neg(/尿急/)&&neg(/尿痛/)&&neg(/憋气|喘不上气/)&&neg(/出血/)) put('safety',OPTIONS.safety[0]);
    if(has(/(?:明显乏力|头晕|浑身没力)/)&&/(日常活动受影响|不能自理|起不了床|没法照顾自己)/.test(t)) put('daily',OPTIONS.daily[2]);
    else if(has(/乏力|累|没力/)&&/(能照顾自己|能自理|不影响(?:日常)?活动)/.test(t)) put('daily',OPTIONS.daily[1]);
    else if(/(?:体力|日常活动|精神)(?:都)?(?:和平时差不多|正常|和往常一样)/.test(t)) put('daily',OPTIONS.daily[0]);
    const blood = clauses.filter(c=>/血常规|报告/.test(c));
    const noUpload = blood.some(c=>/没(?:有)?(?:上传|传)|未上传|还没传|稍后(?:再)?上传|还未/.test(c));
    const uploaded = blood.some(c=>!/(没|未|稍后)/.test(c)&&/(已经|已|刚刚|刚|传好了|上传了)/.test(c));
    if(noUpload!==uploaded) put('bloodUploaded',uploaded?'on':'later');
    return {values:result,evidence};
  }
  window.SelfReportInput = {extract,OPTIONS};
})();
