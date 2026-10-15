/* Progressive learning enhancements. All activities run locally, without external services. */
const LEARN = JSON.parse($('#learningData').textContent);
const PRACTICE = JSON.parse($('#assessmentData').textContent).map(q => ({...q, module: D.find(m => m.id === q.moduleId)}));
const LEVELS = ['Fundamentos', 'Conexões', 'Aprofundamento'];
const MICRO_STAGES = [
  ['Explorar', 'microIntro'], ['Aprender', 'microDeep'], ['Visualizar', 'microVisual'],
  ['Comparar', 'microCompare'], ['Recuperar', 'microRecall'], ['Revisar', 'microSummary']
];
let microStep = 0, guidedLesson = null, guidedIndex = 0, guidedBatch = [], guidedAnswered = false;
let sessionRecords = {}, dueOnly = false;
const originalRenderHome = renderHome, originalRenderLesson = renderLesson;
const originalStartQuiz = startQuiz, originalValid = valid;

function normalizeLearningState() {
  for (const key of ['reviews', 'recalls', 'practice', 'levels', 'lessonSteps']) {
    if (!S[key] || typeof S[key] !== 'object' || Array.isArray(S[key])) S[key] = {};
  }
  if (!Array.isArray(S.errorLog)) S.errorLog = [];
  if (!S.preferences || typeof S.preferences !== 'object') S.preferences = {};
}
normalizeLearningState();
// Old exports remain valid; new fields have explicit structural checks before restoration.
valid = function(s) {
  if (!originalValid(s)) return false;
  const dict = x => x && typeof x === 'object' && !Array.isArray(x);
  if (s.reviews && (!dict(s.reviews) || !Object.values(s.reviews).every(r => dict(r) && Number.isFinite(r.due) && r.due >= 0 && Number.isInteger(r.interval) && r.interval >= 1 && r.interval <= 30))) return false;
  if (s.recalls && (!dict(s.recalls) || !Object.values(s.recalls).every(r => dict(r) && typeof r.text === 'string' && r.text.length <= 20000))) return false;
  if (s.practice && (!dict(s.practice) || !Object.values(s.practice).every(r => dict(r) && typeof r.ok === 'boolean' && ['choice','short'].includes(r.type) && Number.isFinite(r.at)))) return false;
  if (s.levels && (!dict(s.levels) || !Object.values(s.levels).every(x => Number.isInteger(x) && x >= 1 && x <= 3))) return false;
  if (s.lessonSteps && (!dict(s.lessonSteps) || !Object.values(s.lessonSteps).every(x => Number.isInteger(x) && x >= 0 && x < MICRO_STAGES.length))) return false;
  if (s.errorLog && (!Array.isArray(s.errorLog) || !s.errorLog.every(x => dict(x) && typeof x.id === 'string' && typeof x.lessonId === 'string' && typeof x.moduleId === 'string' && typeof x.concept === 'string' && Number.isFinite(x.at)))) return false;
  return !s.preferences || (dict(s.preferences) && (s.preferences.focus === undefined || typeof s.preferences.focus === 'boolean'));
};
if (!valid(S)) {
  // Preserve the valid original fields if optional learning data was malformed.
  S = {done:S.done, notes:S.notes, answers:S.answers, last:S.last};
  normalizeLearningState();
}

function applyFocus() {
  normalizeLearningState();
  const on = S.preferences.focus === true;
  document.body.classList.toggle('focus-mode', on);
  $('#focusToggle').setAttribute('aria-pressed', String(on));
  $('#focusToggle').textContent = on ? 'Foco ativado' : 'Modo foco';
}
$('#focusToggle').onclick = () => {
  S.preferences.focus = !S.preferences.focus;
  persist(); applyFocus();
};
function formatReviewDate(ts) {
  return new Intl.DateTimeFormat('pt-BR', {timeZone: 'America/Sao_Paulo', day:'2-digit', month:'short', year:'numeric'}).format(new Date(ts));
}
function dueLessons() {
  return allLessons.filter(l => S.reviews[l.id] && S.reviews[l.id].due <= Date.now());
}
function setReview(id, days) {
  S.reviews[id] = {due: Date.now() + days * 86400000, interval: days, last: Date.now()};
  persist();
}
function reviewDescription(id) {
  const r = S.reviews[id];
  return r ? `Próxima revisão sugerida: ${formatReviewDate(r.due)} · intervalo de ${r.interval} dia${r.interval > 1 ? 's' : ''}.` : 'Ao concluir a leitura, sugerimos uma revisão no dia seguinte. Você poderá ajustar o intervalo nos cartões.';
}

renderHome = function() {
  normalizeLearningState(); originalRenderHome(); applyFocus();
  const choice = Object.values(S.practice).filter(p => p.type === 'choice');
  const classic = Object.values(S.answers);
  const all = [...choice, ...classic];
  $('#scoreCount').textContent = all.length ? Math.round(all.filter(x=>x.ok).length/all.length*100)+'%' : '—';
  $('#scoreCount').nextElementSibling.textContent = 'Últimas respostas objetivas · não mede domínio';
  $$('#modules .module').forEach((card,i)=> {
    card.querySelector('.small').textContent = `${D[i].lessons.length} microlições · ${D[i].lessons.length*3} desafios guiados`;
  });
  const due = dueLessons(), reviews = Object.entries(S.reviews).filter(([id]) => allLessons.some(l=>l.id===id)).sort((a,b)=>a[1].due-b[1].due);
  const unresolved = [...new Map(S.errorLog.filter(e=>!S.practice[e.id]?.ok).map(e=>[e.id,e])).values()].slice(-5).reverse();
  const objective = Object.values(S.practice).filter(x=>x.type==='choice').length;
  const open = Object.values(S.practice).filter(x=>x.type==='short').length;
  $('#learningDashboard').innerHTML = `
    <div class="sectionhead"><div><span class="eyebrow">Seu fio de aprendizagem</span><h2>O que merece outro olhar?</h2></div><span class="pill">${due.length} revisão${due.length===1?'':'ões'} para hoje</span></div>
    <p class="small">Aulas concluídas indicam percurso. Acertos, explicações e aplicação são evidências diferentes; nenhum indicador isolado comprova domínio.</p>
    <div class="learning-counts"><span><b>${objective}</b> questões objetivas respondidas</span><span><b>${open}</b> explicações conferidas por você</span><span><b>${unresolved.length}</b> dificuldades recentes em aberto</span></div>
    <div class="dashboard-columns"><div><h3>Revisão distribuída</h3><p class="small">Intervalos de 1, 3 ou 7 dias são sugestões ajustáveis, não garantias de aprendizagem.</p>
    ${reviews.length?reviews.slice(0,4).map(([id,r])=>{const l=allLessons.find(l=>l.id===id);return `<button class="review-item" data-review-lesson="${id}"><span>${esc(l.title)}</span><small>${r.due<=Date.now()?'Revisão disponível hoje':formatReviewDate(r.due)}</small></button>`}).join(''):'<p>Conclua uma microlição para criar sua primeira sugestão de revisão.</p>'}
    <button class="btn" id="homeDueCards">Recuperar ideias nos cartões →</button></div>
    <div><h3>Meu caderno de dificuldades</h3>
    ${unresolved.length?unresolved.map(e=>`<button class="review-item" data-error-lesson="${esc(e.lessonId)}"><span>${esc(e.concept)}</span><small>${esc(D.find(m=>m.id===e.moduleId)?.title||'Retomar conceito')} · rever aula</small></button>`).join(''):'<p>As confusões identificadas nas atividades guiadas aparecerão aqui. Ao refazer uma atividade com sucesso, ela sai das pendências.</p>'}
    </div></div>
    ${S.errorLog.length?`<details class="error-history"><summary>Histórico de tentativas e retomadas</summary>${S.errorLog.slice(-10).reverse().map(e=>`<button class="review-item" data-error-lesson="${esc(e.lessonId)}"><span>${esc(e.concept)}</span><small>${formatReviewDate(e.at)} · ${S.practice[e.id]?.ok?(S.practice[e.id].type==='short'?'Critérios conferidos por você':'Refazimento com acerto registrado'):'Ponto para retomar'}</small></button>`).join('')}</details>`:''}`;
  $$('[data-review-lesson], [data-error-lesson]').forEach(b=>b.onclick=()=>{
    const id=b.dataset.reviewLesson||b.dataset.errorLesson, l=allLessons.find(x=>x.id===id);
    if(l)openLesson(l.module.id,l.module.lessons.findIndex(x=>x.id===l.id));
  });
  $('#homeDueCards').onclick=()=>{dueOnly=true;cardModule='all';$('#cardFilter').value='all';cardIndex=0;route('cards');};
};

function setMicroStep(index, moveFocus = false) {
  microStep = Math.max(0,Math.min(index, MICRO_STAGES.length-1));
  const l=activeModule.lessons[activeLesson];
  S.lessonSteps[l.id]=microStep; persist();
  MICRO_STAGES.forEach(([name,id],i)=> {
    $('#'+id).hidden = i !== microStep;
    const b=$(`[data-micro="${i}"]`);
    b.classList.toggle('selected',i===microStep);
    b.setAttribute('aria-selected',String(i===microStep));
    b.tabIndex=i===microStep?0:-1;
  });
  $('#microProgress').textContent=`Etapa ${microStep+1} de ${MICRO_STAGES.length} · ${MICRO_STAGES[microStep][0]}`;
  $('#microPrev').disabled=microStep===0;
  $('#microNext').textContent=microStep===5?'Praticar os três desafios →':`Próximo: ${MICRO_STAGES[microStep+1][0]} →`;
  if(moveFocus){const stage=$('#'+MICRO_STAGES[microStep][1]);stage.tabIndex=-1;stage.focus({preventScroll:true});stage.scrollIntoView({block:'start',behavior:'instant'});}
}
renderLesson = function() {
  normalizeLearningState(); originalRenderLesson();
  const m=activeModule,l=m.lessons[activeLesson],e=LEARN.lessons[l.id],em=LEARN.modules[m.id];
  $('#centralQuestion').textContent=e.question;
  $('#priorKnowledge').textContent=e.prior;
  $('#simpleIdea').textContent=e.simple;
  $('#prerequisites').innerHTML=em.prerequisites.map(s=>`<li>${esc(s)}</li>`).join('');
  $('#lessonAnalogy').textContent=e.analogy;
  $('#analogyLimit').textContent=e.analogyLimit;
  $('#lessonCounterexample').textContent=e.counterexample;
  $('#recallQuestion').textContent=e.recall;
  $('#recallAnswer').value=S.recalls[l.id]?.text||'';
  $('#recallFeedback').innerHTML='';
  $('#essentialIdeas').innerHTML=e.essentials.slice(0,5).map(x=>`<li>${esc(x)}</li>`).join('');
  $('#nextConnection').textContent=e.nextConnection;
  $('#conceptThread').innerHTML=[['O fio anterior',e.prior],['Conceito de agora',l.title],['Próxima conexão',e.nextConnection]].map(([t,s])=>`<div><span class="badge">${t}</span><p>${esc(s)}</p></div>`).join('<span class="thread-arrow" aria-hidden="true">→</span>');
  $('#misconceptionList').innerHTML=em.misconceptions.map((c,i)=>`<details class="misconception"><summary>${i+1}. Equívoco: ${esc(c.wrong)}</summary><p><b>Por que parece fazer sentido?</b> ${esc(c.whyPlausible)}</p><p><b>Ajuste a ideia:</b> ${esc(c.correct)}</p><p><b>Na prática:</b> ${esc(c.recognize)}</p></details>`).join('');
  $('#microSteps').innerHTML=MICRO_STAGES.map(([name,id],i)=>`<button class="micro-tab" id="micro-tab-${i}" role="tab" data-micro="${i}" aria-controls="${id}">${i+1}. ${name}</button>`).join('');
  $$('[data-micro]').forEach(b=>{
    b.onclick=()=>setMicroStep(+b.dataset.micro);
    b.onkeydown=ev=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(ev.key)){ev.preventDefault();const n=ev.key==='Home'?0:ev.key==='End'?5:(+b.dataset.micro+(ev.key==='ArrowRight'?1:5))%6;setMicroStep(n);$(`[data-micro="${n}"]`).focus();}};
  });
  MICRO_STAGES.forEach(([name,id],i)=>$('#'+id).setAttribute('aria-labelledby','micro-tab-'+i));
  $('#lessonReviewPlan').innerHTML=`<h3>Reencontre esta ideia depois</h3><p>${esc(reviewDescription(l.id))}</p><button class="btn" id="reviewTomorrow">Sugerir revisão amanhã</button><p class="small">Você decide o ritmo. É uma sugestão de prática distribuída, sem alertas ou cobranças.</p>`;
  $('#reviewTomorrow').onclick=()=>{setReview(l.id,1);renderLesson();setMicroStep(5);toast('Revisão sugerida para '+formatReviewDate(S.reviews[l.id].due)+'.');};
  $('#complete').onclick=()=>{
    if(!S.done.includes(l.id))S.done.push(l.id);
    if(!S.reviews[l.id])setReview(l.id,1);
    persist();$('#complete').textContent='✓ Aula concluída';
    $('#lessonReviewPlan p').textContent=reviewDescription(l.id);
    toast('Percurso registrado. Tente recuperar e aplicar a ideia para conferir sua compreensão.');
  };
  $('#practiceLesson').onclick=()=>launchGuided(m.id,l.id);
  $('#practiceModule').onclick=()=>launchGuided(m.id,l.id);
  $('#recallForm').onsubmit=ev=>{
    ev.preventDefault();const text=$('#recallAnswer').value.trim();if(text.length<12)return;
    S.recalls[l.id]={text,at:Date.now()};persist();
    $('#recallFeedback').className='feedback';
    $('#recallFeedback').innerHTML=`<strong>Compare seu raciocínio, não apenas as palavras.</strong><p>${esc(e.recallModel)}</p><p class="small">Conferência guiada: verifique se explicou a relação e apontou um dado do exemplo. Sua resposta não recebeu uma nota automática.</p><label class="checkbox"><input id="recallSelfCheck" type="checkbox" ${S.recalls[l.id].reviewed?'checked':''}> Eu identifiquei o que preciso manter ou ajustar na minha explicação.</label>`;
    $('#recallSelfCheck').onchange=ev=>{S.recalls[l.id].reviewed=ev.target.checked;persist();};
  };
  setMicroStep(Number.isInteger(S.lessonSteps[l.id])?S.lessonSteps[l.id]:0);
};
$('#microPrev').onclick=()=>setMicroStep(microStep-1,true);
$('#microNext').onclick=()=>microStep<5?setMicroStep(microStep+1,true):launchGuided(activeModule.id,activeModule.lessons[activeLesson].id);
$('#nextLesson').onclick=()=>activeLesson<activeModule.lessons.length-1?openLesson(activeModule.id,activeLesson+1):launchGuided(activeModule.id,activeModule.lessons[activeLesson].id);

function availableCardLessons() {
  return allLessons.filter(l=>(cardModule==='all'||l.module.id===cardModule)&&(!dueOnly||S.reviews[l.id]?.due<=Date.now()));
}
renderCards = function() {
  normalizeLearningState();
  const due=dueLessons();
  $('#dueCards').classList.toggle('selected',dueOnly);
  $('#dueCards').setAttribute('aria-pressed',String(dueOnly));
  $('#dueCards').textContent=dueOnly?'Mostrar todos os cartões':'Somente revisões agendadas';
  $('#reviewDueCount').textContent=due.length?`${due.length} ideia${due.length===1?'':'s'} com revisão disponível hoje`:'Nenhuma revisão vencida. Você pode praticar qualquer ideia.';
  const list=availableCardLessons();
  $('#cardRecallTools').innerHTML='';
  if(!list.length){
    $('#cardCounter').textContent='Nenhum cartão neste filtro';$('#cardTopic').textContent='Seu ritmo de revisão';$('#cardProgress').style.width='0%';
    $('#flash').innerHTML='<small>SEM REVISÕES PARA HOJE NESTE FILTRO</small><span>Volte a todos os cartões ou escolha outro módulo.</span>';
    $('#flash').onclick=null;$('#flash').disabled=true;$('#prevCard').disabled=true;$('#nextCard').disabled=true;$('#studyCard').hidden=true;$('#cardSource').innerHTML='';return;
  }
  $('#flash').disabled=false;$('#prevCard').disabled=false;$('#nextCard').disabled=false;$('#studyCard').hidden=false;
  cardIndex=((cardIndex%list.length)+list.length)%list.length;
  const l=list[cardIndex],e=LEARN.lessons[l.id];cardFront=true;
  $('#cardTopic').textContent=l.module.title;
  $('#cardCounter').textContent=`Cartão ${cardIndex+1} de ${list.length}`;
  $('#cardProgress').style.width=(cardIndex+1)/list.length*100+'%';
  const draw=()=>{
    $('#flash').classList.toggle('flipped',!cardFront);
    $('#flash').innerHTML=`<small>${cardFront?'RECUPERE SEM CONSULTAR · CLIQUE PARA CONFERIR':'COMPARE COM O RACIOCÍNIO · CLIQUE PARA VOLTAR'}</small><span>${esc(cardFront?e.recall:e.recallModel)}</span>`;
    $('#flash').setAttribute('aria-label',(cardFront?'Pergunta: '+e.recall+'. Revelar explicação.':'Explicação: '+e.recallModel+'. Voltar à pergunta.'));
    $('#cardRecallTools').innerHTML=cardFront?'<p class="small">Explique em voz alta ou por escrito antes de virar. Reconhecer a resposta é diferente de conseguir produzi-la.</p>':`<div class="review-rating"><span class="small">Como foi recuperar a ideia? Sua avaliação ajusta apenas a próxima sugestão.</span><div class="row"><button class="btn" data-interval="1">Quero retomar · 1 dia</button><button class="btn" data-interval="3">Expliquei com ajuda · 3 dias</button><button class="btn" data-interval="7">Expliquei sem consulta · 7 dias</button></div><p class="small">${esc(reviewDescription(l.id))}</p></div>`;
    $$('[data-interval]').forEach(b=>b.onclick=()=>{setReview(l.id,+b.dataset.interval);toast('Revisão sugerida para '+formatReviewDate(S.reviews[l.id].due)+'.');if(!dueOnly)cardIndex++;renderCards();});
  };
  draw();$('#flash').onclick=()=>{cardFront=!cardFront;draw();};
  $('#prevCard').onclick=()=>{cardIndex=(cardIndex-1+list.length)%list.length;renderCards();};
  $('#nextCard').onclick=()=>{cardIndex=(cardIndex+1)%list.length;renderCards();};
  $('#studyCard').onclick=()=>openLesson(l.module.id,l.module.lessons.findIndex(x=>x.id===l.id));
  $('#cardSource').innerHTML=sourceLink(l.module,l.pages);bindSources();
};
$('#dueCards').onclick=()=>{dueOnly=!dueOnly;cardIndex=0;renderCards();};

function isGuided() {return $('#practiceMode').value==='guided';}
function selectedLessons() {
  return allLessons.filter(l=>(quizModule==='all'||l.module.id===quizModule)&&(!$('#onlyMistakes').checked||PRACTICE.some(q=>q.lessonId===l.id&&S.practice[q.id]?.ok===false)));
}
function recommendedLesson() {
  const list=selectedLessons();if(!list.length)return null;
  if(guidedLesson&&list.some(l=>l.id===guidedLesson))return guidedLesson;
  const due=list.find(l=>S.reviews[l.id]?.due<=Date.now());if(due)return due.id;
  const weak=list.find(l=>PRACTICE.some(q=>q.lessonId===l.id&&S.practice[q.id]?.ok===false));if(weak)return weak.id;
  return list.find(l=>PRACTICE.some(q=>q.lessonId===l.id&&!S.practice[q.id]))?.id||list[0].id;
}
function renderPracticeOptions() {
  $('#practiceOptions').hidden=!isGuided();if(!isGuided()){ $('#practiceOptions').innerHTML='';return; }
  const lessons=selectedLessons();
  $('#practiceOptions').innerHTML=`<label for="practiceLessonFilter">Um bloco de três atividades por vez</label><select id="practiceLessonFilter">${lessons.map(l=>`<option value="${l.id}">${esc(l.module.title)} · ${esc(l.title)}</option>`).join('')}</select><div class="practice-legend"><span class="pill">1 · Fundamentos</span><span class="pill">2 · Conexões</span><span class="pill">3 · Aprofundamento</span></div>`;
  $('#practiceLessonFilter').value=guidedLesson||'';
  $('#practiceLessonFilter').onchange=e=>{guidedLesson=e.target.value;guidedIndex=0;sessionRecords={};buildGuidedBatch();renderGuided();};
}
function buildGuidedBatch() {
  guidedBatch=PRACTICE.filter(q=>q.lessonId===guidedLesson).sort((a,b)=>a.level-b.level);
}
startQuiz = function(reset) {
  normalizeLearningState();
  if(!isGuided()){renderPracticeOptions();return originalStartQuiz(reset);}
  guidedLesson=recommendedLesson();
  if(reset){guidedIndex=0;sessionRecords={};}
  buildGuidedBatch();renderPracticeOptions();
  if(!guidedBatch.length){$('#quizCounter').textContent='Nenhum bloco neste filtro';$('#quizArea').innerHTML='<div class="empty"><h3>Nenhuma dificuldade registrada neste filtro.</h3><p>Desative “Revisar erros” ou escolha outro módulo para começar um bloco de três atividades.</p></div>';return;}
  if(guidedIndex>=guidedBatch.length)guidedIndex=0;
  renderGuided();
};
launchQuiz = function(id) {launchGuided(id,null);};
function launchGuided(moduleId,lessonId) {
  quizModule=moduleId;$('#quizFilter').value=moduleId;$('#onlyMistakes').checked=false;
  $('#practiceMode').value='guided';guidedLesson=lessonId;guidedIndex=0;sessionRecords={};route('quiz');
}
$('#practiceMode').onchange=()=>{guidedIndex=0;quizIndex=0;sessionRecords={};startQuiz(true);};
$('#quizFilter').onchange=e=>{quizModule=e.target.value;guidedLesson=null;guidedIndex=0;quizIndex=0;sessionRecords={};startQuiz(true);};
$('#onlyMistakes').onchange=()=>{guidedLesson=null;guidedIndex=0;quizIndex=0;sessionRecords={};startQuiz(true);};

function recordPractice(q,ok,extra={}) {
  S.practice[q.id]={ok,type:q.type,at:Date.now(),...extra};
  sessionRecords[q.id]={ok,type:q.type};
  const previous=S.levels[q.lessonId]||1;
  S.levels[q.lessonId]=ok?Math.max(previous,Math.min(3,q.level+1)):Math.min(previous,q.level);
  if(!ok){
    S.errorLog.push({id:q.id,lessonId:q.lessonId,moduleId:q.moduleId,concept:q.misconception,at:Date.now()});
    S.errorLog=S.errorLog.slice(-250);setReview(q.lessonId,1);
  }
  persist();
}
function interpretationCoach(q) {
  return `<details class="interpretation-coach"><summary>Como interpretar este enunciado?</summary><ol><li>Releia o comando: você deve <b>${q.type==='short'?'explicar a relação, e não apenas nomeá-la':'escolher a alternativa que responde à pergunta'}</b>.</li><li>Separe o que acontece antes, o que a pessoa faz e os efeitos descritos, quando esses dados forem relevantes.</li><li>Localize palavras como “pode”, “sempre”, “necessariamente” e “por si só”: elas mudam a força de uma afirmação.</li><li>Antes de escolher, formule sua hipótese e confira se ela depende dos dados do enunciado.</li></ol><p class="small">As pistas específicas e a resolução ficam disponíveis depois da sua tentativa.</p></details>`;
}
function reasoningHTML(q) {
  return `<details open class="reasoning"><summary>O caminho do raciocínio</summary><ol>${q.reasoning.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><strong>Pistas relevantes do enunciado</strong><ul>${q.clues.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>`;
}
function remediationHTML(q) {
  const e=LEARN.lessons[q.lessonId];
  return `<div class="remediation"><span class="badge">Outro jeito de olhar</span><p>${esc(e.analogy)}</p><p class="small">Limite da analogia: ${esc(e.analogyLimit)}</p><p><b>Compare:</b> ${esc(e.counterexample)}</p><button class="source-link" id="returnToConcept">Reabrir a microlição ↗</button></div>`;
}
function followUpHTML(q) {
  return `<form id="followUpForm" class="followup"><label for="followUpAnswer">Uma nova pergunta para conferir a diferença</label><p>${esc(q.followUp.prompt)}</p><textarea id="followUpAnswer" required minlength="12" maxlength="20000" placeholder="Responda antes de abrir o comentário…"></textarea><button class="btn" type="submit">Conferir minha nova explicação</button></form><div id="followUpFeedback" aria-live="polite"></div>`;
}
function bindRemediation(q) {
  if($('#returnToConcept'))$('#returnToConcept').onclick=()=>{const m=q.module;openLesson(m.id,m.lessons.findIndex(l=>l.id===q.lessonId));setMicroStep(2);};
  if($('#followUpForm'))$('#followUpForm').onsubmit=ev=>{ev.preventDefault();if($('#followUpAnswer').value.trim().length<12)return;$('#followUpFeedback').className='feedback';$('#followUpFeedback').innerHTML=`<strong>Compare a relação que você explicou:</strong><p>${esc(q.followUp.answer)}</p><p class="small">Esta conferência não altera automaticamente o registro da atividade original. Refaça o bloco depois para verificar se a distinção ficou mais clara.</p><label class="checkbox"><input type="checkbox" id="followUpReady">Comparei as explicações e consigo descrever a distinção antes de continuar.</label>`;
    $('#followUpReady').onchange=e=>{
      $('#guidedContinue').disabled=!e.target.checked;
      $('#guidedContinue').textContent=e.target.checked?'Continuar após minha conferência →':'Confira a distinção antes de continuar';
      if(e.target.checked){S.levels[q.lessonId]=Math.max(S.levels[q.lessonId]||1,Math.min(3,q.level+1));persist();}
    };};
}
function focusPracticeHeading() {
  const h=$('#quizArea h2');
  if(h){h.tabIndex=-1;h.focus({preventScroll:true});}
}
function renderGuided() {
  const q=guidedBatch[guidedIndex];if(!q)return;
  guidedAnswered=false;
  const recommendation=S.levels[q.lessonId]||1;
  $('#quizCounter').textContent=`Desafio ${guidedIndex+1} de 3 · nível ${q.level}`;
  $('#quizArea').innerHTML=`<div class="row spread"><span class="badge">${esc(q.module.title)}</span><span class="pill">${LEVELS[q.level-1]}</span></div>
    <p class="small">Sugestão atual para esta aula: ${LEVELS[recommendation-1]}. Ela se ajusta por respostas objetivas e por sua conferência guiada; não é uma medida de domínio.</p>
    <h2 class="question">${esc(q.prompt)}</h2>${interpretationCoach(q)}
    ${q.type==='choice'?`<div class="choices">${q.options.map((o,i)=>`<button class="option" data-guided-choice="${i}"><span class="letter">${'ABC'[i]}</span>${esc(o)}</button>`).join('')}</div>`:
    `<form id="shortAnswerForm"><label for="shortAnswer">Seu raciocínio em poucas frases</label><textarea id="shortAnswer" required minlength="12" maxlength="20000" placeholder="Explique o mecanismo, cite uma pista e mostre por que a alternativa próxima seria diferente."></textarea><p class="small">Você escreverá primeiro; depois poderá comparar com critérios explícitos. A avaliação desta resposta será guiada, sem nota semântica automática.</p><button class="btn primary" type="submit">Conferir com critérios</button></form>`}
    <div id="guidedFeedback" aria-live="polite"></div><div id="guidedSource"></div><button class="btn primary" id="guidedContinue" hidden>Continuar →</button>`;
  if(q.type==='choice')$$('[data-guided-choice]').forEach(b=>b.onclick=()=>submitGuidedChoice(q,+b.dataset.guidedChoice));
  else $('#shortAnswerForm').onsubmit=ev=>{ev.preventDefault();submitShort(q);};
  focusPracticeHeading();
  $('#guidedContinue').onclick=()=>{
    if(guidedIndex===guidedBatch.length-1)renderGuidedSummary();
    else {
      const next=guidedBatch[guidedIndex+1];
      if(next.level>(S.levels[q.lessonId]||1)){
        toast('Retome a distinção e faça sua conferência antes de aumentar o nível.');
        return;
      }
      guidedIndex++;renderGuided();$('#quizArea').scrollIntoView({block:'start',behavior:'instant'});
    }
  };
}
function showGuidedSource(q) {$('#guidedSource').innerHTML=sourceLink(q.module,q.pages);bindSources();}
function submitGuidedChoice(q,choice) {
  if(guidedAnswered)return;guidedAnswered=true;const ok=choice===q.answer;
  recordPractice(q,ok,{choice});
  $$('[data-guided-choice]').forEach(b=>{b.disabled=true;b.classList.toggle('correct',+b.dataset.guidedChoice===q.answer);b.classList.toggle('incorrect',!ok&&+b.dataset.guidedChoice===choice);});
  $('#guidedFeedback').className='feedback '+(ok?'good':'bad');
  $('#guidedFeedback').innerHTML=`<strong>${ok?'Você distinguiu a relação neste exemplo.':'Esta distinção merece outro olhar.'}</strong><p>${esc(q.rationales[choice])}</p>${reasoningHTML(q)}<details><summary>Por que cada alternativa está certa ou errada?</summary>${q.options.map((o,i)=>`<p><b>${'ABC'[i]} · ${esc(o)}</b><br>${esc(q.rationales[i])}</p>`).join('')}</details>${ok?'':remediationHTML(q)+followUpHTML(q)}`;
  showGuidedSource(q);$('#guidedContinue').hidden=false;$('#guidedContinue').disabled=!ok;
  $('#guidedContinue').textContent=ok?(guidedIndex===2?'Concluir este bloco →':'Próximo desafio →'):'Responda à nova pergunta antes de continuar';
  bindRemediation(q);
}
function submitShort(q) {
  if(guidedAnswered)return;const text=$('#shortAnswer').value.trim();if(text.length<12)return;guidedAnswered=true;
  $('#shortAnswer').readOnly=true;$('#shortAnswerForm button').disabled=true;
  $('#guidedFeedback').className='feedback';
  $('#guidedFeedback').innerHTML=`<strong>Agora examine o que sua explicação conseguiu mostrar.</strong><p class="small">Os critérios abaixo são para você conferir a própria resposta. Marcar uma caixa informa sua avaliação; o aplicativo não inferiu o sentido do texto.</p><fieldset class="rubric"><legend>Minha resposta…</legend>${q.rubric.map((r,i)=>`<label class="checkbox"><input type="checkbox" data-rubric="${i}">${esc(r)}</label>`).join('')}</fieldset><details><summary>Ver uma resposta comentada para comparação</summary><p>${esc(q.modelAnswer)}</p>${reasoningHTML(q)}</details><button class="btn primary" id="recordSelfCheck">Registrar minha conferência</button><div id="shortSelfResult" aria-live="polite"></div>`;
  showGuidedSource(q);
  $('#recordSelfCheck').onclick=()=>{
    const checks=$$('[data-rubric]').map(b=>b.checked),complete=checks.every(Boolean);
    recordPractice(q,complete,{text,checks,assessedBy:'self'});
    $('#recordSelfCheck').disabled=true;$$('[data-rubric]').forEach(x=>x.disabled=true);
    $('#shortSelfResult').innerHTML=`<p><b>${complete?'Você informou que sua resposta contempla os três critérios.':'Você identificou pontos que ainda pode desenvolver.'}</b></p><p>Critérios que você marcou: ${checks.filter(Boolean).length}/${checks.length}. Sua explicação foi preservada para exportação.</p><p>${esc(q.modelAnswer)}</p>${reasoningHTML(q)}${complete?'':remediationHTML(q)+followUpHTML(q)}`;
    $('#guidedContinue').hidden=false;$('#guidedContinue').disabled=!complete;
    $('#guidedContinue').textContent=complete?'Próximo desafio →':'Responda à nova pergunta para prosseguir';bindRemediation(q);
  };
}
function renderGuidedSummary() {
  const l=allLessons.find(x=>x.id===guidedLesson),e=LEARN.lessons[guidedLesson];
  const objective=guidedBatch.filter(q=>q.type==='choice'&&sessionRecords[q.id]),correct=objective.filter(q=>sessionRecords[q.id].ok);
  const short=guidedBatch.find(q=>q.type==='short');
  $('#quizArea').innerHTML=`<span class="eyebrow">Um bloco concluído · três formas de pensar</span><h2>Que relação ficou mais clara?</h2><p>${correct.length}/${objective.length} respostas objetivas corretas nesta tentativa. ${sessionRecords[short.id]?.ok?'Na resposta aberta, você marcou todos os critérios.':'Na resposta aberta, você identificou pontos para retomar.'} Esses indicadores não equivalem a comprovação de domínio.</p><div class="concept-thread"><div><span class="badge">Conceito</span><p>${esc(l.title)}</p></div><span class="thread-arrow">→</span><div><span class="badge">Aplicação</span><p>${esc(l.takeaway)}</p></div></div><h3>Até cinco ideias para reconstruir sem consulta</h3><ul class="essentials">${e.essentials.slice(0,5).map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p class="small">Você pode esconder a síntese e tentar explicar cada ponto antes de conferi-lo.</p><div class="row"><button class="btn" id="summaryRecall">Esconder / mostrar síntese</button><button class="btn" id="reviewBlockTomorrow">Revisar amanhã</button><button class="btn primary" id="nextGuidedBlock">Intercalar com outro tema →</button><button class="btn" id="retryGuidedBlock">Refazer este bloco</button></div><p id="summaryReview" class="small">${esc(reviewDescription(l.id))}</p>`;
  focusPracticeHeading();
  if(!S.reviews[l.id])setReview(l.id,1);
  $('#summaryReview').textContent=reviewDescription(l.id);
  $('#summaryRecall').onclick=()=>{$('#quizArea .essentials').hidden=!$('#quizArea .essentials').hidden;};
  $('#reviewBlockTomorrow').onclick=()=>{setReview(l.id,1);$('#summaryReview').textContent=reviewDescription(l.id);};
  $('#retryGuidedBlock').onclick=()=>{guidedIndex=0;sessionRecords={};renderGuided();};
  $('#nextGuidedBlock').onclick=()=>{
    // Interleaving happens between coherent blocks, without shuffling the three prerequisite levels.
    const others=allLessons.filter(x=>x.module.id!==l.module.id);
    const next=others.find(x=>S.reviews[x.id]?.due<=Date.now())||others.find(x=>PRACTICE.some(q=>q.lessonId===x.id&&!S.practice[q.id]))||others[0];
    quizModule='all';$('#quizFilter').value='all';$('#onlyMistakes').checked=false;guidedLesson=next.id;guidedIndex=0;sessionRecords={};startQuiz(true);
  };
}

// Add a discreet version note and keep the original navigation and offline export intact.
$('#home .hero-mini').textContent='37 microlições · passos curtos · no seu ritmo';
$('#home .bottom-note p').textContent='Explore, compare, explique e aplique. As atividades distinguem o material original de exemplos didáticos e apontam as páginas de referência.';
$('#notes').maxLength=20000;$('#recallAnswer').maxLength=20000;
applyFocus(); route('home');
