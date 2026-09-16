// Fixed assistant utterances; routing uses only this call's answers and spoken history.
window.CARE_CONTENT = {
  empathy: '身体已经难受，还得想着后面的治疗，确实很难熬。咱们先不急着想完整个疗程，先看看今天能不能舒服一点。今天吐了几次，还能喝下水吗？',
  nausea: '恶心起来，吃饭喝水都可能受影响，挺折腾人的。您今天大概吐了几次？水还能喝得进去吗？',
  medicine: '用了止吐药，还是难受，那就要把这个情况告诉治疗团队，请他们看看怎么帮您缓解。先别自己加量。眼下最难受的是恶心，还是想到后面的治疗就发愁？',
  symptoms: '吃喝受不受影响，这个得让团队知道。止吐药有没有按这次的医嘱用？用了以后，您自己感觉有没有好一点？',
  waterOkay: '您说还能喝点水，这个情况先记下来。身体的不舒服如果有变化，也要告诉团队。除了这些，心里还有没有放不下的事？',
  burden: '您很在意家人的感受，怕他们跟着受累。可您现在也需要有人照顾，这不等于您做错了什么。是家里有人说了让您难受的话，还是您自己总觉得过意不去？',
  burdenAgain: '总把家人的辛苦放在心上，您自己也会很累。不妨先提一个小请求，比如请他们陪您联系医生。您觉得这样说，能不能轻松一点？',
  fear: '后面的治疗，哪一点让您最没底？是怕身体还会这么难受，还是担心治疗效果？咱们把担心说具体些，再和团队一起想办法。',
  efficacy: '您担心受了这些苦，治疗却没有效果。这个担心可以直接跟医生说，请他结合您的病情解释治疗目标和评估安排。副作用有多难受，不能单凭这一点判断疗效。您之前有机会和医生聊过这个问题吗？',
  stop: '难受到想停下来，这个念头我听到了。先别逼自己硬撑，也别一个人决定后面的治疗。把您受不了的地方说具体些，让团队评估怎么缓解、疗程需不需要调整。最让您想停下来的是哪一点？',
  hope: '后面的路看着长，不用今天一个人把它扛完。先让团队把这次的不舒服处理好，争取在医生支持下完成计划疗程。眼下有没有一件事，是您最希望家人或医生帮您的？',
  alone: '难受的时候身边没人，心里可能更没底。有没有一位您信任的人，现在方便接个电话？不一定要说很多，先让他知道您今天需要有人陪。',
  noSupport: '如果一时找不到合适的人，也可以把这种孤单和担心告诉治疗团队，请他们帮您联系支持。您现在最希望有人听您说的，是什么？',
  gentle: '嗯，您慢慢说。今天是身体上哪里不舒服，还是心里有件事一直压着？',
  listen: '刚才这件事，对您来说最难受的地方是什么？您不用整理好再说，想到哪儿就说到哪儿。',
  stay: '我还在听。您希望我们先把身体的不舒服说清楚，还是先聊聊心里的担心？',
  closing: '那咱们今天先聊到这儿。身体的不舒服记得跟治疗团队说，别憋着。挂断后可以核对这次的记录；哪天还想说说，您可以再打来。',
  closingTogether: '那就先请家人陪您联系医生，把今天难受的情况说清楚。后面的疗程一步一步来，在团队评估和支持下继续走。挂断后看看这次记录，有遗漏的再补充。',
  urgent: '喝不进水、头晕或者尿量变少，都不能光靠忍着。您说的情况需要尽快联系治疗团队；如果持续不能喝水，或有明显头晕、尿少，请及时就医。现在身边有人能陪您联系医生吗？',
  urgentClosing: '现在先请身边的人陪您联系医生，持续喝不进水或明显头晕、尿少时及时就医。后面的治疗等医生评估，眼前先把这次不舒服处理好。挂断后会留一份记录供您核对。',
  urgentAlone: '您现在一个人，就先打给家人或信任的人，请他们来陪您联系医生。如果已经明显头晕、站不稳，别自己外出，请及时呼叫急救。先处理眼前的身体状况。',
  safety: '您说到伤害自己，我现在最关心的是您的安全。请马上联系一位信任的人，让他陪着您，先远离可能伤害自己的物品。如果已经受伤，或担心自己马上会行动，请立即呼叫急救或就近急诊。先别一个人待着。',
  voiceBanner: '陈女士，今天是第六天复查日。方便的时候，接一下今天的随访电话。聊完以后，再看看有哪些资料需要补充。',
  selfBanner: '陈女士，今天记得上传血常规，填一下健康记录。身体难受，或者心里有事想说，也可以点去打电话，跟助手聊聊。'
};
window.CARE_NOTES = {
    empathy:'认可身体不适与治疗压力，了解呕吐及饮水情况。', nausea:'了解恶心呕吐和饮水情况。', medicine:'建议向团队反馈按医嘱用药后仍有不适，不自行加量。', symptoms:'询问既有止吐医嘱执行情况及使用后的感受。', waterOkay:'结合饮水反馈，询问是否有情绪担忧。', burden:'回应怕拖累家人的顾虑，了解家庭沟通情况。', burdenAgain:'建议尝试向家人提出具体的小请求。', fear:'回应后续疗程的担心，了解担忧具体来自哪里。', efficacy:'建议向医生了解治疗目标和评估安排，不以副作用判断疗效。', stop:'回应想中断治疗的原因，建议交由团队评估缓解措施与后续疗程。', hope:'鼓励在医生评估和支持下尽量完成计划疗程，了解具体支持需要。', alone:'了解可以联系的陪伴者。', noSupport:'建议向治疗团队表达支持需要。', gentle:'邀请表达当前身体与情绪困扰。', listen:'进一步了解患者觉得最难受的部分。', stay:'让患者选择继续讨论身体或情绪困扰。', closing:'提醒向治疗团队反馈不适，核对本次交流。', closingTogether:'鼓励家人陪同联系医生，在团队评估支持下继续疗程。', urgent:'提示尽快联系团队；持续不能饮水、明显头晕或尿少时及时就医。', urgentClosing:'优先处理当前不适，再由医生评估后续治疗。', urgentAlone:'建议联系陪伴者，明显头晕站不稳时及时呼叫急救。', safety:'优先确保安全，联系可信任的人陪同，必要时立即急救。'
};
window.chooseCareReply = (text, call) => {
  const used = new Set((call.dialogue || []).filter(t=>t.role==='assistant').map(t=>t.key || Object.keys(window.CARE_CONTENT).find(k=>window.CARE_CONTENT[k]===t.text)));
  const pick = keys => keys.find(k=>!used.has(k));
  const s = text.replace(/\s/g,'');
  const affirmative = s.replace(/(?:没有|并无|不觉得|不再|已经不|不)(?:明显头晕|尿量减少|恶心|呕吐|想吐)/g,'');
  const danger = /(?:想|要|准备|打算).{0,5}(?:自杀|伤害自己|结束生命)|不想活了|已经.{0,4}(?:割腕|服毒)/.test(s) && !/(?:不想|不会|没有|不打算).{0,4}(?:自杀|伤害自己|结束生命)/.test(s);
  const dehydration = /喝不下|喝不进|无法喝水|不能喝水|一喝.{0,3}就?吐|(?:水也|水都).{0,2}吐|尿量.{0,3}(?:少|低)|明显头晕/.test(affirmative);
  const alone = /一个人|没人陪|没有人陪|家人不在|找不到人/.test(s.replace(/(?:不是|并非)一个人/g,''));
  if(danger)return {key:'safety',finished:true,urgent:'安全支持'};
  if(dehydration&&!used.has('urgent'))return {key:'urgent',urgent:'进食饮水需评估'};
  if(call.careKey==='urgent'||(dehydration&&used.has('urgent')))return {key:alone?'urgentAlone':'urgentClosing',finished:true,urgent:'进食饮水需评估'};
  let key;
  if(/不想.{0,3}(?:治|化疗)|想停|停掉|不做.{0,3}化疗/.test(s.replace(/(?:不想|不会|没想|不打算)停(?:药|治疗|化疗)?/g,'')))key=pick(['stop','hope']);
  if(!key&&/拖累|连累|负担|过意不去|怕.{0,3}家人.{0,3}累/.test(s))key=pick(['burden','burdenAgain','hope']);
  if(!key&&alone)key=pick(['alone','noSupport']);
  if(!key&&/没(?:有)?效果|没有用|白受罪|白吃苦|治不好|疗效/.test(s))key=pick(['efficacy','fear']);
  const nausea=/恶心|呕吐|想吐|吐了|一直吐/.test(affirmative);
  const worried=/没(?:有)?希望|看不到希望|熬不|撑不|担心|害怕|怕.{0,5}治疗/.test(s);
  const meds=/(?:止吐药|药).{0,8}(?:吃了|用了|用过|按)|(?:吃|用|服).{0,8}止吐药|按.{0,8}医嘱.{0,8}(?:吃|用)/.test(s);
  if(!key&&nausea&&meds)key=pick(['medicine','symptoms']);
  if(!key&&nausea)key=pick(worried?['empathy','fear','symptoms']:['nausea','symptoms']);
  if(!key&&worried)key=pick(['fear','hope']);
  if(!key&&/还能喝|能喝.{0,4}水|喝.{0,4}水.{0,4}(?:可以|没问题)/.test(s))key=pick(['waterOkay','symptoms']);
  if(!key&&/再见|先挂了|先这样|不聊了|谢谢|愿意|会.{0,8}(?:联系|告诉).{0,4}(?:医生|团队)/.test(s))return {key:/家人|丈夫|爱人|女儿|儿子/.test(s)?'closingTogether':'closing',finished:true};
  if(!key)key=pick(call.i===1?['gentle','listen','stay']:['listen','stay','gentle']);
  return key?{key}:{key:'closing',finished:true};
};
window.CARE_DEMO_ANSWERS = [
  '化疗副作用太大了，一直恶心呕吐，觉得后面还有那么多次，感觉没有希望。',
  '今天吐了两次，还能喝一点水，止吐药按医生说的吃了，但还是觉得恶心。',
  '我担心自己熬不过后面的疗程，也怕一直拖累家人。',
  '是我自己过意不去，总担心他们太累。',
  '愿意，我会请家人陪着，也会把这些情况告诉医生。'
];
